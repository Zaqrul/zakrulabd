"use client";

/* The playlist: pattern clips on lanes, as FL Studio lays out a song. Click an empty place to put the selected
   pattern there, drag a clip to move it, right-click to take it away, double-click to open its pattern. Click the
   ruler to set the play position; shift-drag it to set a loop, right-click it to clear the loop. */
import { useCallback, useEffect, useRef } from "react";
import { barTicks, patternLength, uid, type Clip, type StudioSong } from "@/lib/studio";
import { COLORS } from "./piano-roll";

const NAME_W = 92;
const RULER_H = 22;
const LANE_H = 44;
const LANES = 16;

type Drag = { kind: "move"; id: string; dTick: number; dLane: number } | { kind: "loop"; from: number } | { kind: "pan"; x: number; scrollX: number };

export function Playlist({
  song, selectedPattern, onClips, onSelectPattern, onOpenPattern, loop, onLoop, onSeek, playhead, zoom,
}: {
  song: StudioSong;
  selectedPattern: string;
  onClips: (clips: Clip[], record: boolean) => void;
  onSelectPattern: (id: string) => void;
  onOpenPattern: (id: string) => void;
  loop: [number, number] | null;
  onLoop: (loop: [number, number] | null) => void;
  onSeek: (tick: number) => void;
  playhead: () => number | null;
  zoom: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const view = useRef({ scrollX: 0, scrollY: 0, width: 800, height: 400 });
  const drag = useRef<Drag | null>(null);
  const bar = barTicks(song);
  const pxPerTick = (36 * zoom) / bar;
  const colorOf = (patternId: string) => COLORS[Math.max(0, song.patterns.findIndex((p) => p.id === patternId)) % COLORS.length];

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const { width: W, height: H, scrollX, scrollY } = view.current;
    const dpr = window.devicePixelRatio || 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const x = (tick: number) => NAME_W + (tick - scrollX) * pxPerTick;
    const y = (lane: number) => RULER_H + lane * LANE_H - scrollY;
    g.fillStyle = "#161b26";
    g.fillRect(0, 0, W, H);
    for (let lane = 0; lane < LANES; lane++) {
      g.fillStyle = lane % 2 ? "#1b2130" : "#1f2633";
      g.fillRect(NAME_W, y(lane), W, LANE_H);
    }
    const to = scrollX + (W - NAME_W) / pxPerTick;
    for (let tk = Math.floor(scrollX / bar) * bar; tk <= to; tk += bar) {
      const four = (tk / bar) % 4 === 0;
      g.fillStyle = four ? "#46536b" : "#2b3446";
      g.fillRect(Math.round(x(tk)), RULER_H, 1, H);
    }
    if (loop) { g.fillStyle = "rgba(251,207,51,0.06)"; g.fillRect(x(loop[0]), RULER_H, (loop[1] - loop[0]) * pxPerTick, H); }
    // The clips, each with a sketch of its pattern's notes.
    for (const clip of song.playlist) {
      const p = song.patterns.find((q) => q.id === clip.pattern);
      if (!p) continue;
      const len = patternLength(song, p), cx = x(clip.start), cy = y(clip.lane), cw = Math.max(6, len * pxPerTick - 1);
      if (cx > W || cx + cw < NAME_W || cy > H || cy + LANE_H < RULER_H) continue;
      const color = colorOf(p.id);
      g.fillStyle = `${color}40`;
      g.fillRect(cx, cy + 2, cw, LANE_H - 4);
      g.fillStyle = color;
      g.fillRect(cx, cy + 2, cw, 13);
      g.fillStyle = "#171717";
      g.font = "bold 10px ui-sans-serif, system-ui";
      g.fillText(p.name, cx + 4, cy + 12, Math.max(0, cw - 8));
      const all = Object.values(p.notes).flat();
      if (all.length) {
        let lo = 127, hi = 0;
        for (const n of all) { lo = Math.min(lo, n.pitch); hi = Math.max(hi, n.pitch); }
        const span = Math.max(1, hi - lo), areaY = cy + 17, areaH = LANE_H - 22;
        g.fillStyle = color;
        for (const n of all) {
          if (n.start >= len) continue;
          g.fillRect(cx + n.start * pxPerTick, areaY + areaH - ((n.pitch - lo) / span) * areaH - 1, Math.max(1, n.len * pxPerTick), 1.5);
        }
      }
      if (p.id === selectedPattern) { g.strokeStyle = "#ffffff"; g.lineWidth = 1; g.strokeRect(cx + 0.5, cy + 2.5, cw - 1, LANE_H - 5); }
    }
    // The lane names, and the ruler.
    for (let lane = 0; lane < LANES; lane++) {
      g.fillStyle = "#0f131b"; g.fillRect(0, y(lane), NAME_W - 2, LANE_H - 1);
      g.fillStyle = "#94a3b8"; g.font = "11px ui-sans-serif, system-ui"; g.fillText(`Track ${lane + 1}`, 8, y(lane) + LANE_H / 2 + 4);
    }
    g.fillStyle = "#0f131b";
    g.fillRect(0, 0, W, RULER_H);
    if (loop) { g.fillStyle = "rgba(251,207,51,0.55)"; g.fillRect(x(loop[0]), 0, (loop[1] - loop[0]) * pxPerTick, 5); }
    g.font = "11px ui-monospace, monospace";
    for (let tk = Math.floor(scrollX / bar) * bar; tk <= to; tk += bar) {
      g.fillStyle = "#46536b"; g.fillRect(x(tk), 8, 1, RULER_H - 8);
      g.fillStyle = "#cbd5e1"; g.fillText(String(tk / bar + 1), x(tk) + 3, RULER_H - 7);
    }
    g.fillStyle = "#0f131b";
    g.fillRect(0, 0, NAME_W, RULER_H);
    const at = playhead();
    if (at !== null && x(at) >= NAME_W) { g.fillStyle = "#fbcf33"; g.fillRect(x(at), 0, 2, H); }
  }, [song, selectedPattern, loop, pxPerTick, bar, playhead]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    let frame = 0;
    const loopDraw = () => { if (playhead() !== null) draw(); frame = requestAnimationFrame(loopDraw); };
    frame = requestAnimationFrame(loopDraw);
    return () => cancelAnimationFrame(frame);
  }, [draw, playhead]);
  useEffect(() => {
    const box = wrap.current, c = canvas.current;
    if (!box || !c) return;
    const fit = () => {
      const { width, height } = box.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      view.current.width = width; view.current.height = height;
      c.width = Math.round(width * dpr); c.height = Math.round(height * dpr);
      c.style.width = `${width}px`; c.style.height = `${height}px`;
      draw();
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    fit();
    return () => observer.disconnect();
  }, [draw]);

  const at = (e: { clientX: number; clientY: number }) => {
    const rect = canvas.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    return { px, py, tick: view.current.scrollX + (px - NAME_W) / pxPerTick, lane: Math.floor((py - RULER_H + view.current.scrollY) / LANE_H) };
  };
  const snapBar = (tick: number) => Math.max(0, Math.floor(tick / bar) * bar);
  const hit = (tick: number, lane: number) => {
    for (let i = song.playlist.length - 1; i >= 0; i--) {
      const c = song.playlist[i], p = song.patterns.find((q) => q.id === c.pattern);
      if (c.lane === lane && tick >= c.start && tick < c.start + patternLength(song, p)) return c;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { px, py, tick, lane } = at(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1) { drag.current = { kind: "pan", x: e.clientX, scrollX: view.current.scrollX }; return; }
    if (py < RULER_H) {
      if (e.button === 2) { onLoop(null); return; }
      if (e.shiftKey) { const from = snapBar(tick); drag.current = { kind: "loop", from }; onLoop([from, from + bar]); return; }
      onSeek(snapBar(tick));
      return;
    }
    if (px < NAME_W || lane < 0 || lane >= LANES) return;
    const clip = hit(tick, lane);
    if (e.button === 2) { if (clip) onClips(song.playlist.filter((c) => c.id !== clip.id), true); return; }
    if (clip) {
      if (e.detail >= 2) { onOpenPattern(clip.pattern); return; }
      onSelectPattern(clip.pattern);
      onClips(song.playlist, true);
      drag.current = { kind: "move", id: clip.id, dTick: tick - clip.start, dLane: 0 };
      return;
    }
    const placed: Clip = { id: uid("k"), pattern: selectedPattern, lane, start: snapBar(tick) };
    onClips([...song.playlist, placed], true);
    drag.current = { kind: "move", id: placed.id, dTick: tick - placed.start, dLane: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    const { tick, lane } = at(e);
    if (d.kind === "pan") { view.current.scrollX = Math.max(0, d.scrollX - (e.clientX - d.x) / pxPerTick); draw(); }
    else if (d.kind === "loop") onLoop([d.from, Math.max(d.from + bar, Math.ceil(tick / bar) * bar)]);
    else {
      const start = snapBar(tick - d.dTick + bar / 2), l = Math.max(0, Math.min(LANES - 1, lane));
      const clip = song.playlist.find((c) => c.id === d.id);
      if (clip && (clip.start !== start || clip.lane !== l)) onClips(song.playlist.map((c) => (c.id === d.id ? { ...c, start, lane: l } : c)), false);
    }
  };

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const dx = e.shiftKey ? e.deltaY : e.deltaX, dy = e.shiftKey ? 0 : e.deltaY;
      view.current.scrollX = Math.max(0, view.current.scrollX + dx / pxPerTick);
      view.current.scrollY = Math.max(0, Math.min(LANES * LANE_H - (view.current.height - RULER_H), view.current.scrollY + dy));
      draw();
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  }, [draw, pxPerTick]);

  return (
    <div ref={wrap} className="relative h-full min-h-0 w-full overflow-hidden rounded-xl ring-1 ring-white/10">
      <canvas
        ref={canvas}
        aria-label="Playlist"
        className="block cursor-crosshair touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
