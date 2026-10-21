"use client";

/* The piano roll: one channel's notes in one pattern, drawn on a canvas, the pattern's other channels faint behind.
   Click to add a note, drag to move, drag its right edge to lengthen; shift-click adds a note to the selection,
   ctrl-drag selects a box, and everything selected moves and stretches together. Right-click deletes. The keys:
   Delete, ctrl+A, ctrl+C, ctrl+V (at the play position), ctrl+B (duplicate after the selection), the arrows (up and
   down a semitone, with shift an octave; left and right a snap). The lane under the notes sets their velocity. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { SIXTEENTH, barTicks, beatTicks, noteName, patternLength, sortNotes, type Channel, type Pattern, type StudioNote, type StudioSong } from "@/lib/studio";

export const COLORS = ["#fbcf33", "#5ec8f2", "#f2766b", "#8de07f", "#c792ea", "#ffa94d", "#4fd1c5", "#f78fb3"];
export const DRUM_NAMES: Record<number, string> = {
  35: "Kick 2", 36: "Kick", 37: "Rim", 38: "Snare", 39: "Clap", 40: "Snare 2", 41: "Tom low", 42: "Hat", 43: "Tom low 2", 44: "Hat pedal",
  45: "Tom mid", 46: "Hat open", 47: "Tom mid 2", 48: "Tom high", 49: "Crash", 50: "Tom high 2", 51: "Ride", 52: "China", 53: "Ride bell",
  55: "Splash", 57: "Crash 2", 59: "Ride 2",
};
const KEYS_W = 64;
const RULER_H = 22;
const ROW_H = 12;
const LANE_H = 70;
const BLACK = new Set([1, 3, 6, 8, 10]);
let clipboard: StudioNote[] = [];

type Drag =
  | { kind: "move"; base: StudioNote[]; picked: number[]; tick: number; pitch: number; heard: number }
  | { kind: "resize"; base: StudioNote[]; picked: number[]; tick: number }
  | { kind: "box"; from: { tick: number; pitch: number }; to: { tick: number; pitch: number } }
  | { kind: "velocity" }
  | { kind: "pan"; x: number; y: number; scrollX: number; scrollY: number };

export function PianoRoll({
  song, pattern, channel, color, snap, zoom, onNotes, audition, playhead, onZoom,
}: {
  song: StudioSong;
  pattern: Pattern;
  channel: Channel;
  color: string;
  snap: number;
  zoom: number;
  onNotes: (notes: StudioNote[], record: boolean) => void;
  audition: (pitch: number) => void;
  /* Where the music is inside this pattern, or null when it is elsewhere. */
  playhead: () => number | null;
  onZoom: (factor: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const view = useRef({ scrollX: 0, scrollY: (127 - 84) * ROW_H, width: 800, height: 400 });
  const drag = useRef<Drag | null>(null);
  const selected = useRef(new Set<StudioNote>());
  const lastLen = useRef(SIXTEENTH * 2);
  const notesRef = useRef<StudioNote[]>([]);
  const notes = useMemo(() => pattern.notes[channel.id] ?? [], [pattern, channel.id]);
  /* The handlers read the notes as last drawn, so a drag works on what is on the screen. */
  useLayoutEffect(() => { notesRef.current = notes; }, [notes]);
  const pxPerTick = (18 * zoom) / SIXTEENTH;
  const drums = channel.voice === "drums";
  const bar = barTicks(song), beat = beatTicks(song);

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const { width: W, height: H, scrollX, scrollY } = view.current;
    const dpr = window.devicePixelRatio || 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gridH = H - LANE_H;
    const x = (tick: number) => KEYS_W + (tick - scrollX) * pxPerTick;
    const y = (pitch: number) => RULER_H + (127 - pitch) * ROW_H - scrollY;
    const list = notesRef.current, length = patternLength(song, pattern);
    g.fillStyle = "#161b26";
    g.fillRect(0, 0, W, H);
    const top = Math.min(127, 127 - Math.floor(scrollY / ROW_H)), bottom = Math.max(0, 127 - Math.ceil((scrollY + gridH) / ROW_H));
    for (let p = top; p >= bottom; p--) {
      g.fillStyle = drums ? (DRUM_NAMES[p] ? "#1f2633" : "#181d28") : BLACK.has(p % 12) ? "#191e2a" : "#1f2633";
      g.fillRect(KEYS_W, y(p), W, ROW_H);
      if (p % 12 === 0 && !drums) { g.fillStyle = "#2b3446"; g.fillRect(KEYS_W, y(p) + ROW_H - 1, W, 1); }
    }
    const to = scrollX + (W - KEYS_W) / pxPerTick;
    for (let tk = Math.floor(scrollX / SIXTEENTH) * SIXTEENTH; tk <= to; tk += SIXTEENTH) {
      const isBar = tk % bar === 0, isBeat = tk % beat === 0;
      if (!isBar && !isBeat && pxPerTick * SIXTEENTH < 8) continue;
      g.fillStyle = isBar ? "#46536b" : isBeat ? "#2f3a4f" : "#232b3b";
      g.fillRect(Math.round(x(tk)), RULER_H, 1, gridH - RULER_H);
    }
    // Past the pattern's end, darker.
    if (x(length) < W) { g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x(length), RULER_H, W, gridH - RULER_H); }
    // The pattern's other channels, faint.
    song.channels.forEach((other, k) => {
      if (other.id === channel.id) return;
      g.fillStyle = `${COLORS[k % COLORS.length]}30`;
      for (const n of pattern.notes[other.id] ?? []) {
        if (n.start > to || n.start + n.len < scrollX) continue;
        g.fillRect(x(n.start), y(n.pitch) + 2, Math.max(2, n.len * pxPerTick), ROW_H - 4);
      }
    });
    for (const n of list) {
      if (n.start > to || n.start + n.len < scrollX) continue;
      const nx = x(n.start), ny = y(n.pitch), nw = Math.max(3, n.len * pxPerTick - 1);
      if (ny < RULER_H - ROW_H || ny > gridH) continue;
      const sel = selected.current.has(n);
      g.globalAlpha = 0.55 + 0.45 * Math.min(1, n.vel);
      g.fillStyle = sel ? "#ffffff" : color;
      g.fillRect(nx, ny + 1, nw, ROW_H - 2);
      g.globalAlpha = 1;
      g.fillStyle = "rgba(0,0,0,0.45)";
      g.fillRect(nx + nw - 3, ny + 1, 3, ROW_H - 2);
      if (nw > 30 && !drums) { g.fillStyle = "#171717"; g.font = "9px ui-monospace, monospace"; g.fillText(noteName(n.pitch), nx + 3, ny + ROW_H - 3); }
    }
    const d = drag.current;
    if (d?.kind === "box") {
      const x0 = x(Math.min(d.from.tick, d.to.tick)), x1 = x(Math.max(d.from.tick, d.to.tick));
      const y0 = y(Math.max(d.from.pitch, d.to.pitch)), y1 = y(Math.min(d.from.pitch, d.to.pitch)) + ROW_H;
      g.strokeStyle = "#fbcf33"; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, x1 - x0, y1 - y0);
      g.fillStyle = "rgba(251,207,51,0.08)"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // The velocity lane.
    g.fillStyle = "#0f131b";
    g.fillRect(0, gridH, W, LANE_H);
    g.fillStyle = "#2b3446";
    g.fillRect(0, gridH, W, 1);
    for (const n of list) {
      if (n.start > to || n.start + n.len < scrollX) continue;
      const h = (LANE_H - 10) * Math.min(1.5, n.vel) / 1.5;
      g.fillStyle = selected.current.has(n) ? "#ffffff" : color;
      g.fillRect(x(n.start), gridH + LANE_H - 4 - h, 3, h);
      g.fillRect(x(n.start) - 2, gridH + LANE_H - 4 - h, 7, 2);
    }
    g.fillStyle = "#94a3b8";
    g.font = "10px ui-monospace, monospace";
    g.fillText("Velocity", 6, gridH + 14);
    // The ruler.
    g.fillStyle = "#0f131b";
    g.fillRect(0, 0, W, RULER_H);
    g.font = "11px ui-monospace, monospace";
    for (let tk = Math.floor(scrollX / bar) * bar; tk <= to; tk += bar) {
      g.fillStyle = "#46536b"; g.fillRect(x(tk), 8, 1, RULER_H - 8);
      g.fillStyle = "#cbd5e1"; g.fillText(String(tk / bar + 1), x(tk) + 4, RULER_H - 7);
    }
    // The keyboard.
    for (let p = top; p >= bottom; p--) {
      const ky = y(p);
      if (ky + ROW_H < RULER_H) continue;
      const black = BLACK.has(p % 12) && !drums;
      g.fillStyle = black ? "#2a2f3a" : "#e8ecf2";
      g.fillRect(0, ky, KEYS_W - 2, Math.min(ROW_H - 1, gridH - ky));
      const label = drums ? DRUM_NAMES[p] : p % 12 === 0 ? noteName(p) : "";
      if (label && ky + ROW_H <= gridH) { g.fillStyle = drums ? "#171717" : "#475569"; g.font = "9px ui-monospace, monospace"; g.fillText(label, 4, ky + ROW_H - 3); }
    }
    g.fillStyle = "#0f131b";
    g.fillRect(0, 0, KEYS_W, RULER_H);
    const at = playhead();
    if (at !== null && x(at) >= KEYS_W) { g.fillStyle = "#fbcf33"; g.fillRect(x(at), 0, 2, gridH); }
  }, [song, pattern, channel.id, color, drums, pxPerTick, bar, beat, playhead]);

  useEffect(() => { draw(); }, [draw, notes]);

  /* Redrawn every frame, so the play position moves. */
  useEffect(() => {
    let frame = 0;
    const loop = () => { if (playhead() !== null) draw(); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
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

  /* Opening a channel centres its notes. */
  useEffect(() => {
    selected.current.clear();
    const list = pattern.notes[channel.id] ?? [];
    if (list.length) {
      const avg = list.reduce((s, n) => s + n.pitch, 0) / list.length;
      view.current.scrollY = Math.max(0, (127 - avg) * ROW_H - (view.current.height - LANE_H) / 2);
    } else if (channel.voice === "drums") view.current.scrollY = (127 - 50) * ROW_H;
    draw();
  }, [channel.id, channel.voice, pattern.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const at = (e: { clientX: number; clientY: number }) => {
    const rect = canvas.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    return { px, py, tick: view.current.scrollX + (px - KEYS_W) / pxPerTick, pitch: 127 - Math.floor((py - RULER_H + view.current.scrollY) / ROW_H) };
  };
  const snapDown = (tick: number) => Math.max(0, Math.floor(tick / snap) * snap);
  const hit = (tick: number, pitch: number) => {
    const list = notesRef.current;
    for (let i = list.length - 1; i >= 0; i--) { const n = list[i]; if (n.pitch === pitch && tick >= n.start && tick < n.start + n.len) return i; }
    return -1;
  };
  const commit = (next: StudioNote[], record: boolean, keep?: StudioNote[]) => {
    if (keep) selected.current = new Set(keep);
    onNotes(next, record);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { px, py, tick, pitch } = at(e);
    const gridH = view.current.height - LANE_H;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1) { drag.current = { kind: "pan", x: e.clientX, y: e.clientY, scrollX: view.current.scrollX, scrollY: view.current.scrollY }; return; }
    if (py >= gridH) { drag.current = { kind: "velocity" }; setVelocity(px, py); return; }
    if (py < RULER_H) return;
    if (px < KEYS_W) { audition(pitch); return; }
    const list = notesRef.current, i = hit(tick, pitch);
    if (e.button === 2 || (e.button === 0 && e.altKey)) {
      if (i < 0) return;
      const gone = selected.current.has(list[i]) ? selected.current : new Set([list[i]]);
      commit(list.filter((n) => !gone.has(n)), true, []);
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (!e.shiftKey) selected.current.clear();
      drag.current = { kind: "box", from: { tick, pitch }, to: { tick, pitch } };
      draw();
      return;
    }
    if (i >= 0) {
      const n = list[i];
      if (e.shiftKey) { if (selected.current.has(n)) selected.current.delete(n); else selected.current.add(n); draw(); return; }
      if (!selected.current.has(n)) selected.current = new Set([n]);
      const picked = list.map((m, k) => (selected.current.has(m) ? k : -1)).filter((k) => k >= 0);
      lastLen.current = n.len;
      onNotes(list, true);
      drag.current = (n.start + n.len - tick) * pxPerTick < 6 ? { kind: "resize", base: list, picked, tick } : { kind: "move", base: list, picked, tick, pitch, heard: 0 };
      audition(n.pitch);
      draw();
      return;
    }
    const note: StudioNote = { pitch, start: snapDown(tick), len: drums ? SIXTEENTH : lastLen.current, vel: 0.8 };
    const next = sortNotes([...list, note]);
    commit(next, true, [note]);
    drag.current = { kind: "resize", base: next, picked: [next.indexOf(note)], tick: note.start + note.len };
    audition(pitch);
  };

  const setVelocity = (px: number, py: number) => {
    const gridH = view.current.height - LANE_H, tick = view.current.scrollX + (px - KEYS_W) / pxPerTick;
    const vel = Math.max(0.05, Math.min(1.5, ((gridH + LANE_H - 4 - py) / (LANE_H - 10)) * 1.5));
    const list = notesRef.current, near = 4 / pxPerTick;
    let changed = false;
    const next = list.map((n) => {
      if (Math.abs(n.start - tick) > near) return n;
      changed = true;
      return { ...n, vel };
    });
    if (changed) { selected.current = new Set(next.filter((n, k) => selected.current.has(list[k]))); onNotes(next, false); }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) return;
    const { px, py, tick, pitch } = at(e);
    if (d.kind === "pan") {
      view.current.scrollX = Math.max(0, d.scrollX - (e.clientX - d.x) / pxPerTick);
      view.current.scrollY = Math.min(128 * ROW_H, Math.max(0, d.scrollY - (e.clientY - d.y)));
      draw();
    } else if (d.kind === "velocity") {
      setVelocity(px, py);
    } else if (d.kind === "box") {
      d.to = { tick, pitch };
      const t0 = Math.min(d.from.tick, tick), t1 = Math.max(d.from.tick, tick), p0 = Math.min(d.from.pitch, pitch), p1 = Math.max(d.from.pitch, pitch);
      selected.current = new Set(notesRef.current.filter((n) => n.pitch >= p0 && n.pitch <= p1 && n.start < t1 && n.start + n.len > t0));
      draw();
    } else if (d.kind === "move") {
      const dt = Math.round((tick - d.tick) / snap) * snap, dp = pitch - d.pitch;
      const minStart = Math.min(...d.picked.map((k) => d.base[k].start));
      const shift = Math.max(-minStart, dt);
      const moved = new Map<number, StudioNote>();
      for (const k of d.picked) { const n = d.base[k]; moved.set(k, { ...n, start: n.start + shift, pitch: Math.max(0, Math.min(127, n.pitch + dp)) }); }
      const next = d.base.map((n, k) => moved.get(k) ?? n);
      if (dp !== d.heard) { d.heard = dp; audition([...moved.values()][0].pitch); }
      commit(next, false, [...moved.values()]);
    } else if (d.kind === "resize") {
      const dt = Math.round((tick - d.tick) / snap) * snap;
      const changed = new Map<number, StudioNote>();
      for (const k of d.picked) { const n = d.base[k]; changed.set(k, { ...n, len: Math.max(snap, n.len + dt) }); }
      if (d.picked.length === 1) lastLen.current = changed.get(d.picked[0])!.len;
      commit(d.base.map((n, k) => changed.get(k) ?? n), false, [...changed.values()]);
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && (d.kind === "move" || d.kind === "resize")) commit(sortNotes(notesRef.current), false, [...selected.current]);
    draw();
  };

  /* The wheel scrolls up and down, with shift across, and with ctrl zooms. */
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) { onZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); return; }
      const dx = e.shiftKey ? e.deltaY : e.deltaX, dy = e.shiftKey ? 0 : e.deltaY;
      view.current.scrollX = Math.max(0, view.current.scrollX + dx / pxPerTick);
      view.current.scrollY = Math.min(128 * ROW_H - 100, Math.max(0, view.current.scrollY + dy));
      draw();
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  }, [draw, pxPerTick, onZoom]);

  /* The editing keys, while the piano roll is open and nothing else is being typed in. */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, select, textarea")) return;
      const list = notesRef.current, sel = selected.current, mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      const picked = list.filter((n) => sel.has(n));
      if (mod && k === "a") { e.preventDefault(); selected.current = new Set(list); draw(); }
      else if (mod && k === "c" && picked.length) { e.preventDefault(); const start = Math.min(...picked.map((n) => n.start)); clipboard = picked.map((n) => ({ ...n, start: n.start - start })); }
      else if (mod && k === "x" && picked.length) { e.preventDefault(); const start = Math.min(...picked.map((n) => n.start)); clipboard = picked.map((n) => ({ ...n, start: n.start - start })); commit(list.filter((n) => !sel.has(n)), true, []); }
      else if (mod && k === "v" && clipboard.length) {
        e.preventDefault();
        const where = Math.floor((playhead() ?? 0) / snap) * snap, pasted = clipboard.map((n) => ({ ...n, start: n.start + where }));
        commit(sortNotes([...list, ...pasted]), true, pasted);
      } else if (mod && k === "b" && picked.length) {
        e.preventDefault();
        const start = Math.min(...picked.map((n) => n.start)), end = Math.max(...picked.map((n) => n.start + n.len));
        const span = Math.ceil((end - start) / snap) * snap, copies = picked.map((n) => ({ ...n, start: n.start + span }));
        commit(sortNotes([...list, ...copies]), true, copies);
      } else if ((e.key === "Delete" || e.key === "Backspace") && picked.length) {
        e.preventDefault();
        commit(list.filter((n) => !sel.has(n)), true, []);
      } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && picked.length) {
        e.preventDefault();
        const by = (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 12 : 1);
        const moved = new Map(picked.map((n) => [n, { ...n, pitch: Math.max(0, Math.min(127, n.pitch + by)) }]));
        commit(list.map((n) => moved.get(n) ?? n), true, [...moved.values()]);
        audition([...moved.values()][0].pitch);
      } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && picked.length) {
        e.preventDefault();
        const by = (e.key === "ArrowRight" ? 1 : -1) * snap, min = Math.min(...picked.map((n) => n.start));
        if (min + by < 0) return;
        const moved = new Map(picked.map((n) => [n, { ...n, start: n.start + by }]));
        commit(sortNotes(list.map((n) => moved.get(n) ?? n)), true, [...moved.values()]);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [snap, playhead, draw]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={wrap} className="relative h-full min-h-0 w-full overflow-hidden rounded-xl ring-1 ring-white/10">
      <canvas
        ref={canvas}
        aria-label={`Piano roll: ${channel.name}`}
        className="block cursor-crosshair touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

