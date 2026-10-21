"use client";

/* The studio in zakrulOS, a working tool for writing the games' music, in the manner of FL Studio: a channel rack of
   tracks (each with a voice of the Space 2 band, a volume, mute and solo), a piano roll for the selected track with
   the others shown faintly behind it, and a transport. MIDI files come in and go out, and a track can be copied as the
   engine's tracker lines (space2-music.ts) to become a tune in a game. Every track plays through a mixer of its own on
   the same synthesisers and mastering as the soundtrack player. The song is kept in this browser between visits. */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  TbArrowBackUp, TbArrowForwardUp, TbCopy, TbDownload, TbFilePlus, TbMagnet, TbPlayerPlayFilled, TbPlayerSkipBackFilled,
  TbPlayerStopFilled, TbPlus, TbRepeat, TbTrash, TbUpload, TbWand, TbZoomIn, TbZoomOut,
} from "react-icons/tb";
import { master } from "@/components/soundtrack";
import { STUDIO_VOICES, type SagaMusic, type StudioVoice } from "@/components/games/space2-music";
import {
  BAR, PPQ, SIXTEENTH, emptySong, fromMidi, newTrack, noteName, parseMidi, songLength, toMidi, trackerLines,
  type StudioNote, type StudioSong, type StudioTrack,
} from "@/lib/studio";

const STORE = "zakrul-studio-song";
const COLORS = ["#fbcf33", "#5ec8f2", "#f2766b", "#8de07f", "#c792ea", "#ffa94d", "#4fd1c5", "#f78fb3"];
const VOICE_LABEL: Record<StudioVoice, string> = {
  piano: "Piano", brass: "Brass", trumpet: "Trumpet", strings: "Strings", violin: "Violin", lead: "Saw lead", square: "Square",
  superSquare: "Super square", organ: "Organ", organChord: "Organ chord", bell: "Bell", harp: "Harp", chip: "Chip", guitar: "Guitar",
  synthBass: "Synth bass", pickedBass: "Picked bass", slapBass: "Slap bass", drums: "Drum kit",
};
const DRUM_NAMES: Record<number, string> = {
  35: "Kick 2", 36: "Kick", 37: "Rim", 38: "Snare", 39: "Clap", 40: "Snare 2", 41: "Tom low", 42: "Hat", 43: "Tom low 2", 44: "Hat pedal",
  45: "Tom mid", 46: "Hat open", 47: "Tom mid 2", 48: "Tom high", 49: "Crash", 50: "Tom high 2", 51: "Ride", 52: "China", 53: "Ride bell",
  55: "Splash", 57: "Crash 2", 59: "Ride 2",
};
const SNAPS = [{ label: "1/32", ticks: SIXTEENTH / 2 }, { label: "1/16", ticks: SIXTEENTH }, { label: "1/8", ticks: SIXTEENTH * 2 }, { label: "1/4", ticks: PPQ }, { label: "Bar", ticks: BAR }];

/* The piano roll's geometry: the keyboard on the left, the ruler on top, a row per semitone. */
const KEYS_W = 64;
const RULER_H = 24;
const ROW_H = 12;
const BLACK = new Set([1, 3, 6, 8, 10]);

function loadSong(): StudioSong {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const song = JSON.parse(raw) as StudioSong;
      if (Array.isArray(song.tracks) && song.bpm) return song;
    }
  } catch {}
  return emptySong();
}

const sortNotes = (notes: StudioNote[]) => notes.slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);
/* The first note starting at or after `tick`. */
function firstFrom(notes: StudioNote[], tick: number) {
  let lo = 0, hi = notes.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (notes[mid].start < tick) lo = mid + 1; else hi = mid; }
  return lo;
}
const audible = (song: StudioSong, t: StudioTrack) => !t.mute && (!song.tracks.some((x) => x.solo) || t.solo);
/* Where a play position in "virtual" ticks falls in the song: inside a loop it wraps back to the loop's start. */
const wrapTick = (v: number, l: [number, number] | null) => (l && v >= l[0] ? l[0] + ((v - l[0]) % (l[1] - l[0])) : v);

type Drag =
  | { kind: "move"; index: number; dTick: number; dPitch: number; origin: StudioNote }
  | { kind: "resize"; index: number }
  | { kind: "loop"; from: number }
  | { kind: "pan"; x: number; y: number; scrollX: number; scrollY: number };

export function StudioView() {
  const [song, setSongState] = useState<StudioSong>(() => (typeof window === "undefined" ? emptySong() : loadSong()));
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [snap, setSnap] = useState(SIXTEENTH);
  const [zoom, setZoom] = useState(1);
  const [loop, setLoop] = useState<[number, number] | null>(null);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState("");
  const songRef = useRef(song);
  const loopRef = useRef(loop);
  const past = useRef<StudioSong[]>([]);
  const future = useRef<StudioSong[]>([]);

  /* Every edit goes through here; `record` keeps the song before it for undo. */
  const setSong = useCallback((next: StudioSong | ((s: StudioSong) => StudioSong), record = true) => {
    setSongState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (record && value !== prev) { past.current.push(prev); if (past.current.length > 100) past.current.shift(); future.current = []; }
      songRef.current = value;
      return value;
    });
  }, []);
  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(songRef.current);
    songRef.current = prev;
    setSongState(prev);
  }, []);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(songRef.current);
    songRef.current = next;
    setSongState(next);
  }, []);
  useEffect(() => { loopRef.current = loop; }, [loop]);

  /* Kept in this browser, a moment after the last change. */
  useEffect(() => {
    const timer = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(song)); } catch {} }, 600);
    return () => clearTimeout(timer);
  }, [song]);

  const track = song.tracks[Math.min(selected, song.tracks.length - 1)] as StudioTrack | undefined;
  const updateTrack = (id: string, change: Partial<StudioTrack>, record = true) =>
    setSong((s) => ({ ...s, tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...change } : t)) }), record);

  /* ---- Sound ---- */
  const audio = useRef<{ ctx: AudioContext; input: AudioNode; Engine: typeof SagaMusic } | null>(null);
  const channels = useRef(new Map<string, { gain: GainNode; synth: SagaMusic }>());

  const ensureAudio = useCallback(async () => {
    if (!audio.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const out = ctx.createGain();
      out.gain.value = 0.6;
      out.connect(ctx.destination);
      const { SagaMusic: Engine } = await import("@/components/games/space2-music");
      audio.current = { ctx, input: master(ctx, out), Engine };
    }
    if (audio.current.ctx.state === "suspended") await audio.current.ctx.resume();
    return audio.current;
  }, []);

  const channel = useCallback((t: StudioTrack) => {
    const a = audio.current!;
    let ch = channels.current.get(t.id);
    if (!ch) {
      const gain = a.ctx.createGain();
      gain.connect(a.input);
      const synth = new a.Engine();
      synth.attach(a.ctx, gain);
      ch = { gain, synth };
      channels.current.set(t.id, ch);
    }
    ch.gain.gain.value = audible(songRef.current, t) ? t.volume : 0;
    return ch;
  }, []);

  /* Mixer changes apply at once, also while playing. */
  useEffect(() => {
    if (!audio.current) return;
    for (const t of song.tracks) { const ch = channels.current.get(t.id); if (ch) ch.gain.gain.value = audible(song, t) ? t.volume : 0; }
  }, [song]);

  const audition = useCallback(async (t: StudioTrack, pitch: number) => {
    const a = await ensureAudio();
    channel(t).synth.note(t.voice, pitch, a.ctx.currentTime + 0.01, 0.3, 0.9);
  }, [ensureAudio, channel]);

  /* ---- Transport: notes are queued a little ahead on the audio clock. The play position runs on in "virtual" ticks;
     inside a loop they wrap back to its start. ---- */
  const run = useRef<{ timer: ReturnType<typeof setInterval>; t0: number; from: number; cursor: number; spt: number; end: number } | null>(null);
  const playhead = useRef(0);

  const stop = useCallback((rewind = false) => {
    if (run.current) {
      clearInterval(run.current.timer);
      run.current = null;
      const a = audio.current;
      for (const ch of channels.current.values()) {
        if (a) { ch.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.02); setTimeout(() => ch.gain.disconnect(), 300); }
      }
      channels.current.clear();
    }
    if (rewind) playhead.current = loopRef.current?.[0] ?? 0;
    setPosition(playhead.current);
    setPlaying(false);
  }, []);

  const play = useCallback(async (from = playhead.current) => {
    const a = await ensureAudio();
    if (run.current) stop();
    const s = songRef.current, l = loopRef.current;
    let start = from;
    if (l && (start < l[0] || start >= l[1])) start = l[0];
    const spt = 60 / s.bpm / PPQ;
    const state = { timer: 0 as unknown as ReturnType<typeof setInterval>, t0: a.ctx.currentTime + 0.06, from: start, cursor: start, spt, end: songLength(s) };
    const tick = () => {
      const cur = songRef.current, lp = loopRef.current;
      const target = state.from + (a.ctx.currentTime + 0.15 - state.t0) / state.spt;
      let v = state.cursor;
      while (v < target) {
        const r = wrapTick(v, lp);
        const segEnd = lp && v >= lp[0] ? lp[1] : state.end;
        const span = Math.min(target - v, segEnd - r);
        if (span <= 0) break;
        for (const t of cur.tracks) {
          const ch = channel(t);
          for (let i = firstFrom(t.notes, r); i < t.notes.length && t.notes[i].start < r + span; i++) {
            const n = t.notes[i];
            ch.synth.note(t.voice, n.pitch, state.t0 + (v + (n.start - r) - state.from) * state.spt, n.len * state.spt, n.vel);
          }
        }
        v += span;
      }
      state.cursor = v;
      if (!lp && state.from + (a.ctx.currentTime - state.t0) / state.spt >= state.end + PPQ) { playhead.current = 0; stop(); }
    };
    tick();
    state.timer = setInterval(tick, 25);
    run.current = state;
    setPlaying(true);
  }, [ensureAudio, channel, stop]);

  /* A change of tempo while playing carries on from where the music is. */
  useEffect(() => {
    if (run.current && Math.abs(run.current.spt - 60 / song.bpm / PPQ) > 1e-9) void play(playhead.current);
  }, [song.bpm, play]);
  useEffect(() => () => { stop(); audio.current?.ctx.close().catch(() => {}); }, [stop]);

  /* ---- Piano roll ---- */
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const view = useRef({ scrollX: 0, scrollY: (127 - 84) * ROW_H, width: 800, height: 400 });
  const drag = useRef<Drag | null>(null);
  const hover = useRef<number | null>(null);
  const lastLen = useRef(SIXTEENTH * 2);
  const cell = 18 * zoom;
  const pxPerTick = cell / SIXTEENTH;

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const { width: W, height: H, scrollX, scrollY } = view.current;
    const dpr = window.devicePixelRatio || 1;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = songRef.current, t = s.tracks[Math.min(selected, s.tracks.length - 1)];
    const drums = t?.voice === "drums";
    const x = (tick: number) => KEYS_W + (tick - scrollX) * pxPerTick;
    const y = (pitch: number) => RULER_H + (127 - pitch) * ROW_H - scrollY;
    g.fillStyle = "#161b26"; g.fillRect(0, 0, W, H);
    // Rows, the black keys' darker.
    const top = Math.min(127, 127 - Math.floor(scrollY / ROW_H)), bottom = Math.max(0, 127 - Math.ceil((scrollY + H) / ROW_H));
    for (let p = top; p >= bottom; p--) {
      g.fillStyle = drums ? (DRUM_NAMES[p] ? "#1f2633" : "#181d28") : BLACK.has(p % 12) ? "#191e2a" : "#1f2633";
      g.fillRect(KEYS_W, y(p), W, ROW_H);
      if (p % 12 === 0 && !drums) { g.fillStyle = "#2b3446"; g.fillRect(KEYS_W, y(p) + ROW_H - 1, W, 1); }
    }
    // Grid: sixteenths, beats and bars.
    const from = Math.floor(scrollX / SIXTEENTH) * SIXTEENTH, to = scrollX + (W - KEYS_W) / pxPerTick;
    for (let tk = from; tk <= to; tk += SIXTEENTH) {
      const bar = tk % BAR === 0, beat = tk % PPQ === 0;
      if (!bar && !beat && cell < 8) continue;
      g.fillStyle = bar ? "#46536b" : beat ? "#2f3a4f" : "#232b3b";
      g.fillRect(Math.round(x(tk)), RULER_H, 1, H);
    }
    // The loop, and the other tracks' notes, faint.
    const l = loopRef.current;
    if (l) { g.fillStyle = "rgba(251,207,51,0.06)"; g.fillRect(x(l[0]), RULER_H, (l[1] - l[0]) * pxPerTick, H); }
    s.tracks.forEach((other, k) => {
      if (!t || other.id === t.id) return;
      g.fillStyle = COLORS[k % COLORS.length] + "30";
      for (let i = firstFrom(other.notes, scrollX - BAR * 8); i < other.notes.length && other.notes[i].start < to; i++) {
        const n = other.notes[i];
        g.fillRect(x(n.start), y(n.pitch) + 2, Math.max(2, n.len * pxPerTick), ROW_H - 4);
      }
    });
    // The selected track's notes.
    if (t) {
      const color = COLORS[Math.min(selected, s.tracks.length - 1) % COLORS.length];
      for (let i = firstFrom(t.notes, scrollX - BAR * 8); i < t.notes.length && t.notes[i].start < to; i++) {
        const n = t.notes[i], nx = x(n.start), ny = y(n.pitch), nw = Math.max(3, n.len * pxPerTick - 1);
        if (ny < RULER_H - ROW_H || ny > H) continue;
        g.globalAlpha = 0.55 + 0.45 * n.vel;
        g.fillStyle = color; g.fillRect(nx, ny + 1, nw, ROW_H - 2);
        g.globalAlpha = 1;
        g.fillStyle = hover.current === i ? "#ffffff" : "rgba(0,0,0,0.45)";
        g.fillRect(nx + nw - 3, ny + 1, 3, ROW_H - 2);
        if (nw > 30 && ROW_H >= 12) { g.fillStyle = "#171717"; g.font = "9px ui-monospace, monospace"; g.fillText(drums ? "" : noteName(n.pitch), nx + 3, ny + ROW_H - 3); }
      }
    }
    // The ruler.
    g.fillStyle = "#0f131b"; g.fillRect(0, 0, W, RULER_H);
    if (l) { g.fillStyle = "rgba(251,207,51,0.5)"; g.fillRect(x(l[0]), 0, (l[1] - l[0]) * pxPerTick, 5); }
    g.font = "11px ui-monospace, monospace";
    for (let tk = Math.floor(scrollX / BAR) * BAR; tk <= to; tk += BAR) {
      g.fillStyle = "#46536b"; g.fillRect(x(tk), 8, 1, RULER_H - 8);
      g.fillStyle = "#cbd5e1"; g.fillText(String(tk / BAR + 1), x(tk) + 4, RULER_H - 7);
    }
    // The keyboard.
    for (let p = top; p >= bottom; p--) {
      const ky = y(p);
      if (ky + ROW_H < RULER_H) continue;
      const black = BLACK.has(p % 12) && !drums;
      g.fillStyle = black ? "#2a2f3a" : "#e8ecf2";
      g.fillRect(0, ky, KEYS_W - 2, ROW_H - 1);
      const label = drums ? DRUM_NAMES[p] : p % 12 === 0 ? noteName(p) : "";
      if (label) { g.fillStyle = drums ? "#171717" : "#475569"; g.font = "9px ui-monospace, monospace"; g.fillText(label, 4, ky + ROW_H - 3); }
    }
    g.fillStyle = "#0f131b"; g.fillRect(0, 0, KEYS_W, RULER_H);
    // The play position.
    const px = x(playhead.current);
    if (px >= KEYS_W) { g.fillStyle = "#fbcf33"; g.fillRect(px, 0, 2, H); }
  }, [selected, pxPerTick, cell]);

  useEffect(() => { draw(); }, [draw, song, loop, position]);

  /* While playing, the position follows the audio clock, and the view scrolls with it. */
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const follow = () => {
      const r = run.current, a = audio.current;
      if (r && a) {
        playhead.current = wrapTick(r.from + Math.max(0, a.ctx.currentTime - r.t0) / r.spt, loopRef.current);
        const visible = (view.current.width - KEYS_W) / pxPerTick;
        if (playhead.current > view.current.scrollX + visible * 0.92 || playhead.current < view.current.scrollX) view.current.scrollX = Math.max(0, playhead.current - visible * 0.1);
        draw();
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    const label = setInterval(() => setPosition(playhead.current), 200);
    return () => { cancelAnimationFrame(frame); clearInterval(label); };
  }, [playing, draw, pxPerTick]);

  /* The canvas fills its box, sharp on any screen. */
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

  /* Show the selected track's notes when it changes. */
  useEffect(() => {
    const t = songRef.current.tracks[selected];
    if (!t?.notes.length) return;
    const avg = t.notes.reduce((s, n) => s + n.pitch, 0) / t.notes.length;
    view.current.scrollY = Math.max(0, (127 - avg) * ROW_H - view.current.height / 2);
    draw();
  }, [selected, draw]);

  const at = (e: { clientX: number; clientY: number }) => {
    const rect = canvas.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    return { px, py, tick: view.current.scrollX + (px - KEYS_W) / pxPerTick, pitch: 127 - Math.floor((py - RULER_H + view.current.scrollY) / ROW_H) };
  };
  const snapDown = (tick: number) => Math.max(0, Math.floor(tick / snap) * snap);
  const hit = (t: StudioTrack, tick: number, pitch: number) => {
    for (let i = t.notes.length - 1; i >= 0; i--) { const n = t.notes[i]; if (n.pitch === pitch && tick >= n.start && tick < n.start + n.len) return i; }
    return -1;
  };
  const setNotes = (notes: StudioNote[], record: boolean) => track && updateTrack(track.id, { notes }, record);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!track) return;
    const { px, py, tick, pitch } = at(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1 || (e.button === 0 && e.altKey && e.shiftKey)) {
      drag.current = { kind: "pan", x: e.clientX, y: e.clientY, scrollX: view.current.scrollX, scrollY: view.current.scrollY };
      return;
    }
    if (py < RULER_H) {
      const t = snapDown(tick);
      if (e.button === 2) { setLoop(null); return; }
      if (e.shiftKey) { drag.current = { kind: "loop", from: t }; setLoop([t, t + snap]); return; }
      playhead.current = t;
      setPosition(t);
      if (run.current) void play(t);
      draw();
      return;
    }
    if (px < KEYS_W) { void audition(track, pitch); return; }
    const i = hit(track, tick, pitch);
    if (e.button === 2 || (e.button === 0 && e.altKey)) {
      if (i >= 0) setNotes(track.notes.filter((_, k) => k !== i), true);
      return;
    }
    if (i >= 0) {
      const n = track.notes[i];
      past.current.push(songRef.current);
      future.current = [];
      if ((n.start + n.len - tick) * pxPerTick < 6) drag.current = { kind: "resize", index: i };
      else drag.current = { kind: "move", index: i, dTick: tick - n.start, dPitch: 0, origin: n };
      lastLen.current = n.len;
      void audition(track, n.pitch);
      return;
    }
    const note: StudioNote = { pitch, start: snapDown(tick), len: track.voice === "drums" ? SIXTEENTH : lastLen.current, vel: 0.8 };
    const notes = sortNotes([...track.notes, note]);
    setNotes(notes, true);
    drag.current = { kind: "resize", index: notes.indexOf(note) };
    void audition(track, pitch);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!track) return;
    const { tick, pitch } = at(e);
    const d = drag.current;
    if (!d) {
      const i = hit(track, tick, pitch);
      if (i !== hover.current) { hover.current = i >= 0 ? i : null; draw(); }
      return;
    }
    if (d.kind === "pan") {
      view.current.scrollX = Math.max(0, d.scrollX - (e.clientX - d.x) / pxPerTick);
      view.current.scrollY = Math.min(128 * ROW_H, Math.max(0, d.scrollY - (e.clientY - d.y)));
      draw();
    } else if (d.kind === "loop") {
      const t = Math.max(d.from + snap, Math.ceil(tick / snap) * snap);
      setLoop([d.from, t]);
    } else if (d.kind === "resize") {
      const n = track.notes[d.index];
      if (!n) return;
      const len = Math.max(snap, Math.ceil((tick - n.start) / snap) * snap);
      if (len !== n.len) { lastLen.current = len; setNotes(track.notes.map((m, k) => (k === d.index ? { ...m, len } : m)), false); }
    } else {
      const n = track.notes[d.index];
      if (!n) return;
      const start = snapDown(tick - d.dTick), p = Math.max(0, Math.min(127, pitch));
      if (start !== n.start || p !== n.pitch) {
        if (p !== n.pitch) void audition(track, p);
        setNotes(track.notes.map((m, k) => (k === d.index ? { ...m, start, pitch: p } : m)), false);
      }
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && (d.kind === "move" || d.kind === "resize") && track) setNotes(sortNotes(songRef.current.tracks.find((t) => t.id === track.id)!.notes), false);
  };

  /* The wheel scrolls up and down, with shift across, and with ctrl zooms. */
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) { setZoom((z) => Math.min(4, Math.max(0.25, z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)))); return; }
      const dx = e.shiftKey ? e.deltaY : e.deltaX, dy = e.shiftKey ? 0 : e.deltaY;
      view.current.scrollX = Math.max(0, view.current.scrollX + dx / pxPerTick);
      view.current.scrollY = Math.min(128 * ROW_H - view.current.height / 2, Math.max(0, view.current.scrollY + dy));
      draw();
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  }, [draw, pxPerTick]);

  /* Space plays and stops, ctrl+Z undoes, ctrl+Y or ctrl+shift+Z redoes; not while typing in a field. */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, select, textarea")) return;
      if (e.code === "Space") { e.preventDefault(); if (run.current) stop(); else void play(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [play, stop, undo, redo]);

  /* ---- Files ---- */
  const fileInput = useRef<HTMLInputElement>(null);
  const importMidi = async (file: File) => {
    try {
      const next = fromMidi(parseMidi(new Uint8Array(await file.arrayBuffer())));
      if (!next.tracks.length) { setStatus("That file has no notes."); return; }
      stop(true);
      setSong(next);
      setSelected(0);
      playhead.current = 0;
      setLoop(null);
      setStatus(`Imported ${file.name}: ${next.tracks.length} tracks, ${next.bpm} bpm, ${songLength(next) / BAR} bars.`);
    } catch (err) {
      setStatus(`Could not read ${file.name}: ${(err as Error).message}`);
    }
  };
  const exportMidi = () => {
    const blob = new Blob([toMidi(songRef.current) as BlobPart], { type: "audio/midi" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "studio.mid";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const copyTracker = async () => {
    if (!track) return;
    const lines = trackerLines(track, songLength(songRef.current)).map((bar, i) => `["${bar}", "?"], // ${i + 1}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setStatus(`Copied ${lines.length} bars of ${track.name} as tracker lines (fill in each bar's chord).`);
    } catch {
      setStatus("The clipboard is not available here.");
    }
  };
  const quantize = () => track && setNotes(sortNotes(track.notes.map((n) => ({ ...n, start: Math.round(n.start / snap) * snap, len: Math.max(snap, Math.round(n.len / snap) * snap) }))), true);

  const anySolo = song.tracks.some((t) => t.solo);
  const button =
    "flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-[12.5px] font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40";
  const iconButton = "flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40";
  const field = "h-9 rounded-lg bg-white/10 px-2 text-[12.5px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";
  const bar = Math.floor(position / BAR) + 1, beat = Math.floor((position % BAR) / PPQ) + 1, sixteenth = Math.floor((position % PPQ) / SIXTEENTH) + 1;

  return (
    <section aria-label="Studio" className="rise-in flex h-[calc(100dvh-10rem)] min-h-[520px] w-full flex-col gap-3">
      {/* Transport and files. */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label={playing ? "Stop" : "Play"} title="Play / stop (Space)" onClick={() => (playing ? stop() : void play())} className={`${iconButton} ${playing ? "bg-amber-400 text-navy hover:bg-amber-300" : ""}`}>
          {playing ? <TbPlayerStopFilled className="h-4.5 w-4.5" /> : <TbPlayerPlayFilled className="h-4.5 w-4.5" />}
        </button>
        <button type="button" aria-label="Back to start" title="Back to start" onClick={() => { const was = !!run.current; stop(true); if (was) void play(); draw(); }} className={iconButton}>
          <TbPlayerSkipBackFilled className="h-4 w-4" />
        </button>
        <span className="min-w-20 rounded-lg bg-black/40 px-3 py-2 text-center font-mono text-[13px] tabular-nums text-amber-400" aria-label="Position">
          {bar}.{beat}.{sixteenth}
        </span>
        <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-300">
          BPM
          <input type="number" min={30} max={300} value={song.bpm} onChange={(e) => { const v = Number(e.target.value); if (v >= 30 && v <= 300) setSong((s) => ({ ...s, bpm: v })); }} className={`${field} w-18`} />
        </label>
        <button type="button" title="Loop: shift-drag on the ruler to set it, right-click the ruler to clear it" onClick={() => setLoop((l) => (l ? null : [Math.floor(playhead.current / BAR) * BAR, Math.floor(playhead.current / BAR) * BAR + BAR * 4]))} className={`${button} ${loop ? "bg-amber-400 text-navy hover:bg-amber-300" : ""}`}>
          <TbRepeat className="h-4 w-4" /> Loop{loop ? ` ${loop[0] / BAR + 1}–${loop[1] / BAR + 1}` : ""}
        </button>
        <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-300" title="Snap">
          <TbMagnet className="h-4 w-4" />
          <select value={snap} onChange={(e) => setSnap(Number(e.target.value))} className={field}>
            {SNAPS.map((s) => <option key={s.label} value={s.ticks} className="bg-navy">{s.label}</option>)}
          </select>
        </label>
        <button type="button" aria-label="Zoom out" title="Zoom out (ctrl + wheel)" onClick={() => setZoom((z) => Math.max(0.25, z / 1.25))} className={iconButton}><TbZoomOut className="h-4 w-4" /></button>
        <button type="button" aria-label="Zoom in" title="Zoom in (ctrl + wheel)" onClick={() => setZoom((z) => Math.min(4, z * 1.25))} className={iconButton}><TbZoomIn className="h-4 w-4" /></button>
        <button type="button" aria-label="Undo" title="Undo (ctrl+Z)" onClick={undo} className={iconButton}><TbArrowBackUp className="h-4 w-4" /></button>
        <button type="button" aria-label="Redo" title="Redo (ctrl+Y)" onClick={redo} className={iconButton}><TbArrowForwardUp className="h-4 w-4" /></button>
        <span className="flex-1" />
        <button type="button" onClick={() => { stop(true); setSong(emptySong()); setSelected(0); setLoop(null); setStatus("New song. Ctrl+Z brings the last one back."); }} className={button}><TbFilePlus className="h-4 w-4" /> New</button>
        <button type="button" onClick={() => fileInput.current?.click()} className={button}><TbUpload className="h-4 w-4" /> Import .mid</button>
        <input ref={fileInput} type="file" accept=".mid,.midi,audio/midi" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importMidi(f); e.target.value = ""; }} />
        <button type="button" onClick={exportMidi} className={button}><TbDownload className="h-4 w-4" /> Export .mid</button>
        <button type="button" onClick={copyTracker} disabled={!track} className={button} title="Copy the selected track as the engine's tracker lines"><TbCopy className="h-4 w-4" /> Tracker</button>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        {/* The channel rack. */}
        <div className="flex w-64 shrink-0 flex-col gap-1.5 overflow-y-auto rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
          {song.tracks.map((t, i) => {
            const active = i === selected, on = audible(song, t);
            return (
              <div key={t.id} onClick={() => setSelected(i)} className={`flex flex-col gap-1.5 rounded-lg p-2 ring-1 transition-colors ${active ? "bg-white/10 ring-amber-400" : "ring-white/5 hover:bg-white/5"} ${on ? "" : "opacity-50"}`}>
                <div className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <input aria-label="Track name" value={t.name} onChange={(e) => updateTrack(t.id, { name: e.target.value }, false)} className="min-w-0 flex-1 rounded bg-transparent px-1 text-[13px] font-bold text-white focus-visible:bg-white/10 focus-visible:outline-none" />
                  <button type="button" aria-pressed={t.mute} title="Mute" onClick={(e) => { e.stopPropagation(); updateTrack(t.id, { mute: !t.mute }); }} className={`h-6 w-6 rounded text-[11px] font-extrabold ${t.mute ? "bg-rose-500 text-white" : "bg-white/10 text-slate-300"}`}>M</button>
                  <button type="button" aria-pressed={t.solo} title="Solo" onClick={(e) => { e.stopPropagation(); updateTrack(t.id, { solo: !t.solo }); }} className={`h-6 w-6 rounded text-[11px] font-extrabold ${t.solo ? "bg-amber-400 text-navy" : anySolo ? "bg-white/5 text-slate-500" : "bg-white/10 text-slate-300"}`}>S</button>
                  <button type="button" aria-label={`Delete ${t.name}`} title="Delete track" onClick={(e) => { e.stopPropagation(); setSong((s) => ({ ...s, tracks: s.tracks.filter((x) => x.id !== t.id) })); setSelected((k) => Math.max(0, Math.min(k, song.tracks.length - 2))); }} className="h-6 w-6 rounded bg-white/10 text-slate-300 hover:bg-rose-500 hover:text-white">
                    <TbTrash className="mx-auto h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <select aria-label="Instrument" value={t.voice} onClick={(e) => e.stopPropagation()} onChange={(e) => updateTrack(t.id, { voice: e.target.value as StudioVoice })} className="h-7 min-w-0 flex-1 rounded bg-black/30 px-1 text-[12px] font-semibold text-white">
                    {STUDIO_VOICES.map((v) => <option key={v} value={v} className="bg-navy">{VOICE_LABEL[v]}</option>)}
                  </select>
                  <input aria-label="Volume" type="range" min={0} max={1} step={0.01} value={t.volume} onClick={(e) => e.stopPropagation()} onChange={(e) => updateTrack(t.id, { volume: Number(e.target.value) }, false)} className="w-20 accent-amber-400" />
                </div>
                <p className="font-mono text-[10.5px] text-slate-400">{t.notes.length} notes</p>
              </div>
            );
          })}
          <button type="button" onClick={() => { setSong((s) => ({ ...s, tracks: [...s.tracks, newTrack(`Track ${s.tracks.length + 1}`, "piano")] })); setSelected(song.tracks.length); }} className={`${button} justify-center`}>
            <TbPlus className="h-4 w-4" /> Add track
          </button>
          <button type="button" onClick={quantize} disabled={!track} className={`${button} justify-center`} title="Snap the selected track's notes to the grid">
            <TbWand className="h-4 w-4" /> Quantize
          </button>
        </div>

        {/* The piano roll. */}
        <div ref={wrap} className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl ring-1 ring-white/10">
          <canvas
            ref={canvas}
            aria-label="Piano roll"
            className="block cursor-crosshair touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={() => { if (!drag.current && hover.current !== null) { hover.current = null; draw(); } }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>

      <p className="min-h-4 text-[11.5px] text-slate-400" aria-live="polite">
        {status || "Click to add a note, drag to move, drag its edge to lengthen, right-click to delete. Click the ruler to set the position, shift-drag it to loop. Middle-drag to scroll."}
      </p>
    </section>
  );
}
