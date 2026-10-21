"use client";

/* The studio in zakrulOS, a working tool for writing the games' music, laid out as FL Studio is: patterns written in
   the channel rack's step sequencer or the piano roll, arranged as clips on the playlist, and mixed on inserts with
   effects. The transport plays one pattern on a loop (PAT) or the whole playlist (SONG). Every channel plays a voice
   of the Space 2 band through the same mastering as the soundtrack player. MIDI files and the games' own tunes come
   in; MIDI files, WAV files and the engine's tracker lines go out. A MIDI keyboard or the computer's keys play the
   selected channel, and record into the pattern while it plays. The song is kept in this browser between visits.
   F5 playlist, F6 channel rack, F7 piano roll, F9 mixer; Space plays and stops; ctrl+Z and ctrl+Y undo and redo. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TbArrowBackUp, TbArrowForwardUp, TbCopy, TbDownload, TbFileMusic, TbFilePlus, TbKeyboard, TbMagnet, TbMusic, TbPlayerPlayFilled,
  TbPlayerRecordFilled, TbPlayerStopFilled, TbPlug, TbPlus, TbTrash, TbUpload, TbZoomIn, TbZoomOut,
} from "react-icons/tb";
import { master } from "@/components/soundtrack";
import { ALBUMS, trackTitle, type Album, type Track } from "@/lib/soundtrack";
import {
  BAR, PPQ, SIXTEENTH, barTicks, beatTicks, emptySong, encodeWav, fromMidi, migrate, newChannel, newInsert, newPattern, parseMidi,
  patternLength, quantizeNotes, songFromParts, songLength, sortNotes, toMidi, trackerLines, type Channel, type Clip, type Insert, type StudioNote,
  type StudioSong,
} from "@/lib/studio";
import type { StudioEngine } from "@/components/studio/engine";
import { ChannelRack } from "@/components/studio/channel-rack";
import { Mixer } from "@/components/studio/mixer";
import { COLORS, PianoRoll } from "@/components/studio/piano-roll";
import { Playlist } from "@/components/studio/playlist";
import { Projects } from "@/components/studio/projects";

const STORE = "zakrul-studio-song";
const ALBUM_LABEL: Record<Album, string> = { space: "Space", space2: "Space 2", space2alt: "Space 2: Ascension", space3: "Space 3", selftitled: "Self-Titled" };
/* A tune's parts open in the order a score reads: the tune, its doubling and second line, the harmony, the bass, the kit. */
const PART_ORDER = ["Lead", "Pulse 1", "Layer", "Counter", "Pulse 2", "Pad", "Stabs", "Bass", "Triangle", "Drums", "Noise"];
const SNAPS = [{ label: "1/32", ticks: SIXTEENTH / 2 }, { label: "1/16", ticks: SIXTEENTH }, { label: "1/8", ticks: SIXTEENTH * 2 }, { label: "Beat", ticks: PPQ }, { label: "Bar", ticks: BAR }];
/* The computer's keys as a piano, as FL Studio maps them: the bottom row from Z is C4 up, the top row from Q an
   octave higher. */
const TYPING: Record<string, number> = {
  z: 60, s: 61, x: 62, d: 63, c: 64, v: 65, g: 66, b: 67, h: 68, n: 69, j: 70, m: 71, ",": 72,
  q: 72, "2": 73, w: 74, "3": 75, e: 76, r: 77, "5": 78, t: 79, "6": 80, y: 81, "7": 82, u: 83, i: 84,
};
type View = "playlist" | "rack" | "piano" | "mixer";

function loadSong(): StudioSong {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      let song: StudioSong | null = null;
      try { song = migrate(JSON.parse(raw)); } catch { /* preserve the original below */ }
      if (song) return song;
      localStorage.setItem(`${STORE}-recovery`, raw);
    }
  } catch {}
  return emptySong();
}
const download = (data: Uint8Array, name: string, type: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([data as BlobPart], { type }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
};

export function StudioView() {
  const [song, setSongState] = useState<StudioSong>(() => (typeof window === "undefined" ? emptySong() : loadSong()));
  const [view, setView] = useState<View>("rack");
  const [mode, setMode] = useState<"pattern" | "song">("pattern");
  const [patternId, setPatternId] = useState(() => song.patterns[0]?.id ?? "");
  const [channelId, setChannelId] = useState(() => song.channels[0]?.id ?? "");
  const [insertIndex, setInsertIndex] = useState(1);
  const [snapChoice, setSnapChoice] = useState("1/16");
  const snap = snapChoice === "Beat" ? beatTicks(song) : snapChoice === "Bar" ? barTicks(song) : SNAPS.find((s) => s.label === snapChoice)!.ticks;
  const [zoom, setZoom] = useState(1);
  const [listZoom, setListZoom] = useState(1);
  const [loop, setLoop] = useState<[number, number] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [countingIn, setCountingIn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [countIn, setCountIn] = useState(true);
  const [strength, setStrength] = useState(100);
  const [saved, setSaved] = useState("Autosaved locally");
  const [rendering, setRendering] = useState(false);
  const [typing, setTyping] = useState(false);
  const [midiIn, setMidiIn] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState("");
  const [picker, setPicker] = useState(false);
  const [pickAlbum, setPickAlbum] = useState<Album>("space2alt");
  const songRef = useRef(song);
  const seek = useRef(0);
  const past = useRef<StudioSong[]>([]);
  const future = useRef<StudioSong[]>([]);
  const gesture = useRef<{ recorded: boolean } | null>(null);

  /* Every edit goes through here; `record` keeps the song before it for undo. */
  const setSong = useCallback((next: StudioSong | ((s: StudioSong) => StudioSong), record = true) => {
    const prev = songRef.current, value = typeof next === "function" ? next(prev) : next;
    if (value === prev) return;
    if (record || (gesture.current && !gesture.current.recorded)) {
      past.current.push(prev); if (past.current.length > 150) past.current.shift();
      if (gesture.current) gesture.current.recorded = true;
    }
    future.current = [];
    songRef.current = value;
    setSongState(value);
    setSaved("Saving…");
  }, []);
  const undo = useCallback(() => { const prev = past.current.pop(); if (!prev) return; future.current.push(songRef.current); songRef.current = prev; setSongState(prev); }, []);
  const redo = useCallback(() => { const next = future.current.pop(); if (!next) return; past.current.push(songRef.current); songRef.current = next; setSongState(next); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORE, JSON.stringify(song)); setSaved("Autosaved locally"); }
      catch { setSaved("Autosave failed — download a backup"); }
    }, 700);
    return () => clearTimeout(timer);
  }, [song]);
  useEffect(() => {
    const flush = () => { try { localStorage.setItem(STORE, JSON.stringify(songRef.current)); } catch { /* status shown by autosave */ } };
    window.addEventListener("pagehide", flush);
    return () => { flush(); window.removeEventListener("pagehide", flush); };
  }, []);

  /* The selection always points at something that exists. */
  const pattern = song.patterns.find((p) => p.id === patternId) ?? song.patterns[0];
  const channel = song.channels.find((c) => c.id === channelId) ?? song.channels[0];
  const channelIndex = Math.max(0, song.channels.findIndex((c) => c.id === channel?.id));

  /* ---- Sound ---- */
  const engine = useRef<StudioEngine | null>(null);
  const loading = useRef<Promise<StudioEngine> | null>(null);
  const engineVersion = useRef(0);
  const transportRequest = useRef(0);
  const finishKeys = useRef<() => void>(() => {});
  const ensure = useCallback(async () => {
    const version = engineVersion.current;
    if (!engine.current) {
      loading.current ??= import("@/components/studio/engine").then(({ StudioEngine: Engine }) => Engine.create(songRef.current, master)).catch((err) => { loading.current = null; throw err; });
      const ready = await loading.current;
      if (version !== engineVersion.current) { ready.close(); throw new Error("Studio was closed."); }
      engine.current = ready;
    }
    await engine.current.resume();
    return engine.current;
  }, []);
  const target = mode === "pattern" ? pattern?.id : undefined;
  useEffect(() => { if (engine.current) engine.current.metronome = metronome; }, [metronome]);
  useEffect(() => { engine.current?.update(song, target, loop); }, [song, target, loop]);
  useEffect(() => () => { engineVersion.current++; engine.current?.close(); engine.current = null; loading.current = null; }, []);

  const audition = useCallback(async (id: string, pitch: number) => {
    try {
      const e = await ensure();
      if (!e.playing) e.update(songRef.current, target, loop);
      e.audition(id, pitch);
    } catch (err) { setStatus(`Could not start audio: ${(err as Error).message}`); }
  }, [ensure, target, loop]);

  const stop = useCallback(() => { transportRequest.current++; finishKeys.current(); engine.current?.stop(); setPlaying(false); setCountingIn(false); setPosition(seek.current); }, []);
  const play = useCallback(async () => {
    const request = ++transportRequest.current;
    try {
      const e = await ensure();
      if (request !== transportRequest.current) return;
      finishKeys.current();
      e.update(songRef.current, target, loop);
      e.metronome = metronome;
      e.play(mode === "pattern" ? 0 : seek.current, () => { finishKeys.current(); setPlaying(false); setCountingIn(false); seek.current = 0; setPosition(0); }, recording && countIn ? songRef.current.beats : 0);
      setCountingIn(recording && countIn);
      setPlaying(true);
    } catch (err) { setStatus(`Could not start audio: ${(err as Error).message}`); }
  }, [ensure, target, loop, mode, metronome, recording, countIn]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => { setPosition(engine.current?.position() ?? 0); setCountingIn(engine.current?.countingIn ?? false); }, 120);
    return () => clearInterval(timer);
  }, [playing]);

  /* Where the music is: on the playlist, and inside the open pattern. */
  const playlistHead = useCallback(() => (mode !== "song" ? null : engine.current?.playing ? engine.current.position() : seek.current), [mode]);
  const patternHead = useCallback(() => {
    const e = engine.current;
    if (!e?.playing || e.countingIn || !pattern) return null;
    const at = e.position();
    if (mode === "pattern") return at;
    const s = songRef.current, clip = s.playlist.find((c) => c.pattern === pattern.id && at >= c.start && at < c.start + patternLength(s, pattern));
    return clip ? at - clip.start : null;
  }, [mode, pattern]);

  /* ---- Edits ---- */
  const setNotes = useCallback((id: string, notes: StudioNote[], record: boolean) => {
    if (!pattern) return;
    setSong((s) => ({ ...s, patterns: s.patterns.map((p) => (p.id === pattern.id ? { ...p, notes: { ...p.notes, [id]: notes } } : p)) }), record);
  }, [pattern, setSong]);
  /* A step of the step sequencer on or off, worked out from the song as it is now, so quick clicks all count. */
  const toggleStep = useCallback((id: string, step: number) => {
    if (!pattern) return;
    setSong((s) => ({
      ...s,
      patterns: s.patterns.map((p) => {
        if (p.id !== pattern.id) return p;
        const c = s.channels.find((x) => x.id === id), notes = p.notes[id] ?? [];
        if (!c) return p;
        const hit = (n: StudioNote) => n.pitch === c.stepPitch && Math.round(n.start / SIXTEENTH) === step;
        const next = notes.some(hit) ? notes.filter((n) => !hit(n)) : sortNotes([...notes, { pitch: c.stepPitch, start: step * SIXTEENTH, len: SIXTEENTH, vel: 0.85 }]);
        return { ...p, notes: { ...p.notes, [id]: next } };
      }),
    }));
  }, [pattern, setSong]);
  const setChannel = useCallback((id: string, change: Partial<Channel>, record = true) => setSong((s) => ({ ...s, channels: s.channels.map((c) => (c.id === id ? { ...c, ...change } : c)) }), record), [setSong]);
  const setInsert = useCallback((index: number, change: Partial<Insert>, record = true) => setSong((s) => ({ ...s, mixer: s.mixer.map((m, i) => (i === index ? { ...m, ...change } : m)) }), record), [setSong]);
  const setClips = useCallback((playlist: Clip[], record: boolean) => setSong((s) => ({ ...s, playlist }), record), [setSong]);
  const addChannel = () => {
    const insert = newInsert(`Channel ${song.channels.length + 1}`);
    const c = newChannel(insert.name, "piano", song.mixer.length);
    setSong((s) => ({ ...s, channels: [...s.channels, c], mixer: [...s.mixer, insert] }));
    setChannelId(c.id);
  };
  const deleteChannel = (id: string) => setSong((s) => ({
    ...s,
    channels: s.channels.filter((c) => c.id !== id),
    patterns: s.patterns.map((p) => { const notes = { ...p.notes }; delete notes[id]; return { ...p, notes }; }),
  }));
  const addPattern = (copy: boolean) => {
    const p = copy && pattern ? { ...newPattern(`${pattern.name} copy`), bars: pattern.bars, notes: structuredClone(pattern.notes) } : newPattern(`Pattern ${song.patterns.length + 1}`);
    setSong((s) => ({ ...s, patterns: [...s.patterns, p] }));
    setPatternId(p.id);
    setMode("pattern");
  };
  const deletePattern = () => {
    if (!pattern || song.patterns.length < 2) return;
    setSong((s) => ({ ...s, patterns: s.patterns.filter((p) => p.id !== pattern.id), playlist: s.playlist.filter((c) => c.pattern !== pattern.id) }));
  };

  /* ---- Playing in: a MIDI keyboard or the computer's keys play the selected channel, and while recording and
     playing, what is held is written into the open pattern at the play position. ---- */
  const held = useRef(new Map<number, { channel: string; pattern: string; start: number | null; time: number; vel: number }>());
  const noteOn = useCallback((pitch: number, vel = 0.85) => {
    if (!channel || !pattern || held.current.has(pitch)) return;
    const at = recording ? patternHead() : null;
    const entry = { channel: channel.id, pattern: pattern.id, start: at, time: engine.current?.ctx.currentTime ?? 0, vel };
    held.current.set(pitch, entry);
    void ensure().then((e) => {
      if (held.current.get(pitch) !== entry) return;
      e.update(songRef.current, target, loop);
      e.noteOn(entry.channel, pitch, vel);
    }).catch((err) => { held.current.delete(pitch); setStatus(`Could not play key: ${(err as Error).message}`); });
  }, [channel, pattern, recording, patternHead, ensure, target, loop]);
  const noteOff = useCallback((pitch: number) => {
    const on = held.current.get(pitch);
    held.current.delete(pitch);
    if (!on) return;
    engine.current?.noteOff(on.channel, pitch);
    if (on.start === null) return;
    const grid = snap / 2, start = Math.round(on.start / grid) * grid;
    const len = Math.max(SIXTEENTH / 2, ((engine.current?.ctx.currentTime ?? on.time) - on.time) * songRef.current.bpm * PPQ / 60);
    setSong((s) => {
      if (!s.channels.some((c) => c.id === on.channel) || !s.patterns.some((p) => p.id === on.pattern)) return s;
      return { ...s, patterns: s.patterns.map((p) => p.id === on.pattern ? { ...p, notes: { ...p.notes, [on.channel]: sortNotes([...(p.notes[on.channel] ?? []), { pitch, start, len: Math.round(len), vel: on.vel }]) } } : p) };
    });
  }, [setSong, snap]);
  useEffect(() => {
    const release = () => { for (const pitch of [...held.current.keys()]) noteOff(pitch); engine.current?.releaseKeys(); };
    finishKeys.current = release;
    const hidden = () => { if (document.hidden) release(); };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", hidden);
    return () => { window.removeEventListener("blur", release); document.removeEventListener("visibilitychange", hidden); };
  }, [noteOff]);

  const midiMessage = useRef<(data: Uint8Array | null) => void>(() => {});
  const midiAccess = useRef<MIDIAccess | null>(null);
  useEffect(() => () => {
    transportRequest.current++;
    held.current.clear();
    if (midiAccess.current) {
      midiAccess.current.onstatechange = null;
      for (const input of midiAccess.current.inputs.values()) input.onmidimessage = null;
    }
  }, []);
  useEffect(() => {
    midiMessage.current = (data) => {
      if (!data || data.length < 3) return;
      const kind = data[0] & 0xf0;
      if (kind === 0x90 && data[2] > 0) noteOn(data[1], data[2] / 127);
      else if (kind === 0x80 || (kind === 0x90 && data[2] === 0)) noteOff(data[1]);
    };
  }, [noteOn, noteOff]);
  const connectMidi = async () => {
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<MIDIAccess> };
    if (!nav.requestMIDIAccess) { setStatus("This browser has no Web MIDI (try Chrome or Edge)."); return; }
    try {
      const access = await nav.requestMIDIAccess();
      midiAccess.current = access;
      const sync = () => {
        finishKeys.current();
        const inputs = [...access.inputs.values()].filter((input) => input.state === "connected");
        for (const input of inputs) input.onmidimessage = (msg) => midiMessage.current(msg.data);
        const names = inputs.map((i) => i.name ?? "MIDI").join(", ");
        setMidiIn(names || null);
        setStatus(names ? `MIDI in: ${names}` : "No MIDI keyboard found. Plug one in to connect.");
      };
      access.onstatechange = sync;
      sync();
    } catch { setStatus("MIDI access was refused."); }
  };

  /* ---- Keys: the views, the transport, undo, and the computer's keys as a piano. ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, select, textarea")) return;
      const views: Record<string, View> = { F5: "playlist", F6: "rack", F7: "piano", F9: "mixer" };
      if (views[e.key]) { e.preventDefault(); setView(views[e.key]); return; }
      if (e.code === "Space") { e.preventDefault(); if (engine.current?.playing) stop(); else void play(); return; }
      const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (mod && k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (mod && k === "y") { e.preventDefault(); redo(); return; }
      if (typing && !mod && !e.repeat && TYPING[k] !== undefined) { e.preventDefault(); noteOn(TYPING[k]); }
    };
    const up = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (typing && TYPING[k] !== undefined) noteOff(TYPING[k]); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [play, stop, undo, redo, typing, noteOn, noteOff]);

  /* ---- Files and the soundtrack ---- */
  const fileInput = useRef<HTMLInputElement>(null);
  const open = (next: StudioSong, message: string) => {
    stop();
    setSong(next);
    setPatternId(next.patterns[0]?.id ?? "");
    setChannelId(next.channels[0]?.id ?? "");
    seek.current = 0;
    setPosition(0);
    setLoop(null);
    setMode("song");
    setView("playlist");
    setStatus(`${message} Ctrl+Z brings the last song back.`);
  };
  const importMidi = async (file: File) => {
    try {
      const next = fromMidi(parseMidi(new Uint8Array(await file.arrayBuffer())));
      if (!next.channels.length) { setStatus("That file has no notes."); return; }
      open(next, `Imported ${file.name}: ${next.channels.length} channels, ${next.bpm} bpm, ${next.beats}/${next.unit}, ${songLength(next) / barTicks(next)} bars.`);
    } catch (err) { setStatus(`Could not read ${file.name}: ${(err as Error).message}`); }
  };
  const openTune = async (tune: Track) => {
    const title = trackTitle(tune, "en");
    setPicker(false);
    setStatus(`Opening ${title}…`);
    try {
      const score = tune.album === "space"
        ? (await import("@/components/games/space-music")).NesMusic.score(tune.engine)
        : (await import("@/components/games/space2-music")).SagaMusic.score(tune.engine);
      const rank = (name: string) => { const k = PART_ORDER.findIndex((part) => name.startsWith(part)); return k < 0 ? PART_ORDER.length : k; };
      const parts = score.parts.slice().sort((a, b) => rank(a.name) - rank(b.name)).map((part) => ({
        name: part.name,
        voice: part.voice,
        notes: part.notes.map((n) => ({ pitch: n.pitch, start: Math.round(n.step * SIXTEENTH), len: Math.max(1, Math.round(n.steps * SIXTEENTH)), vel: Math.min(1.5, n.vel) })),
      }));
      const next = songFromParts(score.bpm, parts);
      next.patterns[0].name = title;
      open(next, `Opened ${title} (${ALBUM_LABEL[tune.album]}): ${next.channels.length} channels, ${next.bpm} bpm.`);
    } catch (err) { setStatus(`Could not open ${title}: ${(err as Error).message}`); }
  };
  const exportWav = async () => {
    if (rendering) return;
    setRendering(true);
    setStatus("Rendering…");
    try {
      const e = await ensure();
      if (e.playing) stop();
      e.update(songRef.current, undefined, null);
      const channels = await e.render((share) => setStatus(`Rendering… ${Math.round(share * 100)}%`));
      download(encodeWav(channels, 44100), "studio.wav", "audio/wav");
      setStatus(`Rendered ${Math.round(channels[0].length / 44100)} s to studio.wav.`);
    } catch (err) { setStatus(`Could not render: ${(err as Error).message}`); }
    engine.current?.update(songRef.current, target, loop);
    setRendering(false);
  };
  const copyTracker = async () => {
    if (!channel || !pattern) return;
    const lines = trackerLines(pattern.notes[channel.id] ?? [], patternLength(song, pattern), barTicks(song)).map((b, i) => `["${b}", "?"], // ${i + 1}`);
    try { await navigator.clipboard.writeText(lines.join("\n")); setStatus(`Copied ${lines.length} bars of ${channel.name} in ${pattern.name} as tracker lines (fill in each bar's chord).`); }
    catch { setStatus("The clipboard is not available here."); }
  };

  const bar = barTicks(song), beat = beatTicks(song);
  const where = `${Math.floor(position / bar) + 1}.${Math.floor((position % bar) / beat) + 1}.${Math.floor((position % beat) / SIXTEENTH) + 1}`;
  const levels = useMemo(() => () => engine.current?.graph.levels() ?? null, []);
  const button = "flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-[12px] font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40";
  const iconButton = "flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40";
  const field = "h-8 rounded-lg bg-white/10 px-2 text-[12px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";
  const on = "bg-amber-400 text-navy hover:bg-amber-300";
  const tabs: { id: View; label: string; key: string }[] = [{ id: "playlist", label: "Playlist", key: "F5" }, { id: "rack", label: "Channel rack", key: "F6" }, { id: "piano", label: "Piano roll", key: "F7" }, { id: "mixer", label: "Mixer", key: "F9" }];
  const hint = {
    playlist: "Click to place the selected pattern, drag to move, right-click to remove, double-click to open. Click the ruler to set the position; shift-drag it to loop.",
    rack: "Click a step to toggle it. The green light mutes, S solos. The piano button opens the channel in the piano roll.",
    piano: "Click to add, drag to move, drag the edge to lengthen, right-click to delete. Shift-click or ctrl-drag to select; ctrl+C, V, B, the arrows. Drag in the lane below to set velocity.",
    mixer: "Each channel goes to its insert, each insert to the master. Pick an insert to edit its effects.",
  };

  return (
    <section aria-label="Studio" className="rise-in flex min-h-[560px] w-full flex-col gap-2 md:h-[calc(100dvh-10rem)]"
      onFocusCapture={(e) => { if (e.target instanceof HTMLInputElement) gesture.current = { recorded: false }; }}
      onPointerDownCapture={(e) => { if (e.target instanceof HTMLInputElement) gesture.current = { recorded: false }; }}
      onBlurCapture={() => { gesture.current = null; }}>
      <Projects song={song} onOpen={open} onName={(name) => setSong((s) => ({ ...s, name }), false)} onStatus={setStatus} download={download} saved={saved} />
      {/* The transport, the song's settings, the pattern, and files. */}
      <div className="relative flex flex-wrap items-center gap-1.5">
        <div className="flex overflow-hidden rounded-lg ring-1 ring-white/15" role="group" aria-label="Play mode">
          {(["pattern", "song"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => { stop(); setMode(m); }} className={`h-8 px-2.5 text-[11.5px] font-extrabold ${mode === m ? "bg-amber-400 text-navy" : "bg-white/5 text-slate-300 hover:bg-white/15"}`}>{m === "pattern" ? "PAT" : "SONG"}</button>
          ))}
        </div>
        <button type="button" aria-label={playing ? "Stop" : "Play"} title="Play / stop (Space)" onClick={() => (playing ? stop() : void play())} className={`${iconButton} ${playing ? on : ""}`}>
          {playing ? <TbPlayerStopFilled className="h-4 w-4" /> : <TbPlayerPlayFilled className="h-4 w-4" />}
        </button>
        <button type="button" aria-label="Record" aria-pressed={recording} title="Record what you play into the open pattern while it plays" onClick={() => { finishKeys.current(); setRecording((r) => !r); }} className={`${iconButton} ${recording ? "bg-rose-500 text-white hover:bg-rose-400" : ""}`}>
          <TbPlayerRecordFilled className="h-4 w-4" />
        </button>
        <button type="button" aria-pressed={metronome} onClick={() => setMetronome((v) => !v)} className={`${button} ${metronome ? on : ""}`}>Metronome</button>
        <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={countIn} onChange={(e) => setCountIn(e.target.checked)} />Count-in</label>
        <span className="min-w-18 rounded-lg bg-black/40 px-2.5 py-1.5 text-center font-mono text-[12.5px] tabular-nums text-amber-400" aria-label="Position">{countingIn ? "Count-in" : where}</span>
        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-300">BPM
          <input type="number" min={30} max={300} value={song.bpm} onChange={(e) => { const v = Number(e.target.value); if (v >= 30 && v <= 300) setSong((s) => ({ ...s, bpm: v }), false); }} className={`${field} w-16`} />
        </label>
        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-300" title="Time signature">
          <input type="number" min={1} max={16} value={song.beats} onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 16) setSong((s) => ({ ...s, beats: v })); }} className={`${field} w-12`} aria-label="Beats to the bar" />/
          <select value={song.unit} onChange={(e) => setSong((s) => ({ ...s, unit: Number(e.target.value) as 4 | 8 }))} className={field} aria-label="Beat unit">
            <option value={4} className="bg-navy">4</option>
            <option value={8} className="bg-navy">8</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-300" title="Snap">
          <TbMagnet className="h-4 w-4" />
          <select aria-label="Snap grid" value={snapChoice} onChange={(e) => setSnapChoice(e.target.value)} className={field}>{SNAPS.map((s) => <option key={s.label} value={s.label} className="bg-navy">{s.label}</option>)}</select>
        </label>
        <span className="mx-1 h-6 w-px bg-white/15" />
        <span className="h-3 w-3 rounded-sm" style={{ background: COLORS[Math.max(0, song.patterns.findIndex((p) => p.id === pattern?.id)) % COLORS.length] }} />
        <select value={pattern?.id} onChange={(e) => setPatternId(e.target.value)} className={`${field} max-w-36`} aria-label="Pattern">
          {song.patterns.map((p) => <option key={p.id} value={p.id} className="bg-navy">{p.name}</option>)}
        </select>
        <input aria-label="Pattern name" value={pattern?.name ?? ""} onChange={(e) => pattern && setSong((s) => ({ ...s, patterns: s.patterns.map((p) => (p.id === pattern.id ? { ...p, name: e.target.value } : p)) }), false)} className={`${field} w-28`} />
        <select aria-label="Pattern length" value={pattern?.bars ?? 0} onChange={(e) => pattern && setSong((s) => ({ ...s, patterns: s.patterns.map((p) => p.id === pattern.id ? { ...p, bars: Number(e.target.value) || undefined } : p) }))} className={field}>
          <option value={0} className="bg-navy">Auto length</option>
          {[...new Set([1, 2, 4, 8, 16, ...(pattern?.bars ? [pattern.bars] : [])])].sort((a, b) => a - b).map((bars) => <option key={bars} value={bars} className="bg-navy">{bars} {bars === 1 ? "bar" : "bars"} minimum</option>)}
        </select>
        <button type="button" title="New pattern" aria-label="New pattern" onClick={() => addPattern(false)} className={iconButton}><TbPlus className="h-4 w-4" /></button>
        <button type="button" title="Clone pattern" aria-label="Clone pattern" onClick={() => addPattern(true)} className={iconButton}><TbCopy className="h-4 w-4" /></button>
        <button type="button" title="Delete pattern and its clips" aria-label="Delete pattern" disabled={song.patterns.length < 2} onClick={deletePattern} className={iconButton}><TbTrash className="h-4 w-4" /></button>
        <span className="mx-1 h-6 w-px bg-white/15" />
        <button type="button" aria-label="Zoom out" onClick={() => (view === "playlist" ? setListZoom((z) => Math.max(0.25, z / 1.25)) : setZoom((z) => Math.max(0.25, z / 1.25)))} className={iconButton}><TbZoomOut className="h-4 w-4" /></button>
        <button type="button" aria-label="Zoom in" onClick={() => (view === "playlist" ? setListZoom((z) => Math.min(6, z * 1.25)) : setZoom((z) => Math.min(4, z * 1.25)))} className={iconButton}><TbZoomIn className="h-4 w-4" /></button>
        <button type="button" aria-label="Undo" title="Undo (ctrl+Z)" onClick={undo} className={iconButton}><TbArrowBackUp className="h-4 w-4" /></button>
        <button type="button" aria-label="Redo" title="Redo (ctrl+Y)" onClick={redo} className={iconButton}><TbArrowForwardUp className="h-4 w-4" /></button>
        <button type="button" aria-label="Typing keyboard" aria-pressed={typing} title="Play the selected channel on the computer's keys (Z and Q rows)" onClick={() => { finishKeys.current(); setTyping((t) => !t); }} className={`${iconButton} ${typing ? on : ""}`}><TbKeyboard className="h-4 w-4" /></button>
        <button type="button" aria-pressed={!!midiIn} title={midiIn ? `MIDI in: ${midiIn}` : "Connect a MIDI keyboard"} onClick={() => void connectMidi()} className={`${iconButton} ${midiIn ? on : ""}`}><TbPlug className="h-4 w-4" /></button>
        <span className="flex-1" />
        <button type="button" onClick={() => open(emptySong(), "New song.")} className={button}><TbFilePlus className="h-4 w-4" /> New</button>
        <button type="button" aria-expanded={picker} onClick={() => setPicker((v) => !v)} className={`${button} ${picker ? on : ""}`}><TbMusic className="h-4 w-4" /> Soundtrack</button>
        <button type="button" onClick={() => fileInput.current?.click()} className={button}><TbUpload className="h-4 w-4" /> MIDI</button>
        <input ref={fileInput} type="file" accept=".mid,.midi,audio/midi" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importMidi(f); e.target.value = ""; }} />
        <button type="button" onClick={() => download(toMidi(songRef.current), "studio.mid", "audio/midi")} className={button}><TbDownload className="h-4 w-4" /> .mid</button>
        <button type="button" disabled={rendering} onClick={() => void exportWav()} className={button}><TbFileMusic className="h-4 w-4" /> {rendering ? "Rendering…" : ".wav"}</button>
        <button type="button" onClick={() => void copyTracker()} className={button} title="Copy the selected channel in the open pattern as the engine's tracker lines"><TbCopy className="h-4 w-4" /> Tracker</button>

        {picker && (
          <div role="dialog" aria-label="Open a tune from the soundtrack" className="absolute right-0 top-10 z-20 flex w-[min(26rem,100%)] flex-col gap-2 rounded-xl bg-navy p-3 shadow-2xl ring-1 ring-white/15">
            <div role="tablist" className="flex flex-wrap gap-1">
              {(Object.keys(ALBUMS) as Album[]).map((album) => (
                <button key={album} type="button" role="tab" aria-selected={pickAlbum === album} onClick={() => setPickAlbum(album)} className={`rounded-lg px-2.5 py-1.5 text-[12px] font-bold ${pickAlbum === album ? "bg-amber-400 text-navy" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}>{ALBUM_LABEL[album]}</button>
              ))}
            </div>
            <ol className="flex max-h-80 flex-col overflow-y-auto overscroll-contain">
              {ALBUMS[pickAlbum].map((tune, i) => (
                <li key={tune.engine}>
                  <button type="button" onClick={() => void openTune(tune)} className="flex w-full items-baseline gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-white hover:bg-white/10">
                    <span className="w-6 shrink-0 text-right font-mono text-[11px] text-slate-500">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{trackTitle(tune, "en")}</span>
                    {tune.bonus && <span className="text-[10.5px] font-bold uppercase text-amber-400">Bonus</span>}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {(view === "piano" || view === "rack") && channel && pattern && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <span>Quantize {channel.name}</span>
        <select aria-label="Quantize strength" value={strength} onChange={(e) => setStrength(Number(e.target.value))} className={field}>
          {[25, 50, 75, 100].map((n) => <option key={n} value={n} className="bg-navy">{n}% strength</option>)}
        </select>
        <button type="button" disabled={!pattern.notes[channel.id]?.length} className={button} onClick={() => {
          setNotes(channel.id, quantizeNotes(pattern.notes[channel.id] ?? [], snap, strength / 100), true);
          setStatus(`Quantized ${channel.name} to the selected snap at ${strength}% strength. Ctrl+Z to undo.`);
        }}>Apply to channel</button>
        <span className="text-slate-500">Uses snap grid · keeps note lengths and velocity</span>
      </div>}

      {/* The windows. */}
      <div role="tablist" aria-label="Studio views" className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={view === t.id} onClick={() => setView(t.id)} className={`flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-[12px] font-bold ${view === t.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
            {t.label}<span className="font-mono text-[10px] text-slate-500">{t.key}</span>
          </button>
        ))}
        {view === "piano" && channel && pattern && <span className="ml-2 self-center text-[11.5px] text-slate-400">{channel.name} in {pattern.name}</span>}
      </div>

      <div className="min-h-64 flex-1 md:min-h-0">
        {view === "playlist" && pattern && (
          <Playlist
            song={song}
            selectedPattern={pattern.id}
            onClips={setClips}
            onSelectPattern={setPatternId}
            onOpenPattern={(id) => { setPatternId(id); setView("rack"); }}
            loop={loop}
            onLoop={setLoop}
            onSeek={(tick) => { seek.current = tick; setPosition(tick); if (mode !== "song") setMode("song"); if (engine.current?.playing) void play(); }}
            playhead={playlistHead}
            zoom={listZoom}
          />
        )}
        {view === "rack" && pattern && channel && (
          <ChannelRack
            song={song}
            pattern={pattern}
            selected={channel.id}
            onSelect={setChannelId}
            onChannel={setChannel}
            onToggle={toggleStep}
            onAdd={addChannel}
            onDelete={deleteChannel}
            onOpenPiano={(id) => { setChannelId(id); setView("piano"); }}
            audition={(id, pitch) => void audition(id, pitch)}
          />
        )}
        {view === "piano" && pattern && channel && (
          <PianoRoll
            song={song}
            pattern={pattern}
            channel={channel}
            color={COLORS[channelIndex % COLORS.length]}
            snap={snap}
            zoom={zoom}
            onNotes={(notes, record) => setNotes(channel.id, notes, record)}
            audition={(pitch) => void audition(channel.id, pitch)}
            playhead={patternHead}
            onZoom={(f) => setZoom((z) => Math.min(4, Math.max(0.25, z * f)))}
          />
        )}
        {view === "mixer" && (
          <Mixer
            song={song}
            selected={Math.min(insertIndex, song.mixer.length - 1)}
            onSelect={setInsertIndex}
            onInsert={setInsert}
            onAddInsert={() => setSong((s) => ({ ...s, mixer: [...s.mixer, newInsert(`Insert ${s.mixer.length}`)] }))}
            levels={levels}
          />
        )}
        {!channel && (view === "rack" || view === "piano") && (
          <button type="button" onClick={addChannel} className={button}><TbPlus className="h-4 w-4" /> Add a channel</button>
        )}
      </div>

      <p className="min-h-4 text-[11.5px] text-slate-400" aria-live="polite">{status || hint[view]}</p>
    </section>
  );
}
