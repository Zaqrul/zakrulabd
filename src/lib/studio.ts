/* The studio's song, laid out as FL Studio lays one out: channels (each an instrument routed to a mixer insert),
   patterns (each holding notes for any of the channels), and a playlist of pattern clips on lanes; a mixer of inserts,
   each with a chain of effects, into the master. What goes in and out: Standard MIDI Files (read and written), and the
   engine's tracker lines (space2-music.ts), one string per bar, so a part written here can become a tune in a game.
   Time is counted in ticks of PPQ to the quarter note; a sixteenth is PPQ / 4. */

/* What a channel can play: a voice of the Space 2 band, a bass, or the kit (space2-music.ts plays them). */
export const STUDIO_VOICES = [
  "piano", "brass", "trumpet", "strings", "violin", "lead", "square", "superSquare", "organ", "organChord", "bell", "harp", "chip", "guitar",
  "synthBass", "pickedBass", "slapBass", "drums",
] as const;
export type StudioVoice = (typeof STUDIO_VOICES)[number];

export const PPQ = 96;
export const SIXTEENTH = PPQ / 4;
/* A bar of 4/4; a song's own bar follows its time signature (barTicks). */
export const BAR = PPQ * 4;

export type StudioNote = { pitch: number; start: number; len: number; vel: number };
export type Channel = { id: string; name: string; voice: StudioVoice; volume: number; pan: number; mute: boolean; solo: boolean; insert: number; stepPitch: number };
export type Pattern = { id: string; name: string; notes: Record<string, StudioNote[]> };
export type Clip = { id: string; pattern: string; lane: number; start: number };
export const EFFECTS = ["eq", "filter", "comp", "dist", "delay", "reverb"] as const;
export type EffectKind = (typeof EFFECTS)[number];
export type Effect = { id: string; kind: EffectKind; on: boolean; params: Record<string, number> };
export type Insert = { id: string; name: string; volume: number; pan: number; mute: boolean; effects: Effect[] };
export type StudioSong = {
  version: 2;
  bpm: number;
  /* The time signature: beats to the bar, and the note that gets the beat (4 or 8). */
  beats: number;
  unit: 4 | 8;
  channels: Channel[];
  patterns: Pattern[];
  playlist: Clip[];
  /* Insert 0 is the master. */
  mixer: Insert[];
};

/* Each effect's settings, with their ranges, for the mixer to draw and the engine to build. */
export const EFFECT_PARAMS: Record<EffectKind, { key: string; label: string; min: number; max: number; step: number; value: number }[]> = {
  eq: [
    { key: "low", label: "Low", min: -15, max: 15, step: 0.5, value: 0 },
    { key: "mid", label: "Mid", min: -15, max: 15, step: 0.5, value: 0 },
    { key: "freq", label: "Mid Hz", min: 200, max: 5000, step: 10, value: 1000 },
    { key: "high", label: "High", min: -15, max: 15, step: 0.5, value: 0 },
  ],
  filter: [
    { key: "type", label: "LP/HP", min: 0, max: 1, step: 1, value: 0 },
    { key: "cutoff", label: "Cutoff", min: 40, max: 18000, step: 10, value: 6000 },
    { key: "q", label: "Res", min: 0.1, max: 18, step: 0.1, value: 0.7 },
  ],
  comp: [
    { key: "threshold", label: "Thresh", min: -60, max: 0, step: 1, value: -18 },
    { key: "ratio", label: "Ratio", min: 1, max: 20, step: 0.5, value: 4 },
    { key: "attack", label: "Attack", min: 0.001, max: 0.3, step: 0.001, value: 0.01 },
    { key: "release", label: "Release", min: 0.02, max: 1, step: 0.01, value: 0.2 },
    { key: "makeup", label: "Gain dB", min: 0, max: 24, step: 0.5, value: 3 },
  ],
  dist: [
    { key: "drive", label: "Drive", min: 0, max: 1, step: 0.01, value: 0.4 },
    { key: "mix", label: "Mix", min: 0, max: 1, step: 0.01, value: 1 },
  ],
  delay: [
    { key: "beats", label: "Beats", min: 0.125, max: 2, step: 0.125, value: 0.75 },
    { key: "feedback", label: "Feedback", min: 0, max: 0.9, step: 0.01, value: 0.35 },
    { key: "mix", label: "Mix", min: 0, max: 1, step: 0.01, value: 0.25 },
  ],
  reverb: [
    { key: "decay", label: "Decay s", min: 0.3, max: 6, step: 0.1, value: 2 },
    { key: "mix", label: "Mix", min: 0, max: 1, step: 0.01, value: 0.25 },
  ],
};

let nextId = 0;
export const uid = (prefix = "x") => `${prefix}${Date.now().toString(36)}${(nextId++).toString(36)}`;

export const barTicks = (song: Pick<StudioSong, "beats" | "unit">) => (song.beats * PPQ * 4) / song.unit;
export const beatTicks = (song: Pick<StudioSong, "unit">) => (PPQ * 4) / song.unit;

export function newChannel(name: string, voice: StudioVoice, insert: number, stepPitch = voice === "drums" ? 36 : 60): Channel {
  return { id: uid("c"), name, voice, volume: 0.8, pan: 0, mute: false, solo: false, insert, stepPitch };
}
export function newInsert(name: string): Insert {
  return { id: uid("i"), name, volume: 0.8, pan: 0, mute: false, effects: [] };
}
export function newEffect(kind: EffectKind): Effect {
  return { id: uid("f"), kind, on: true, params: Object.fromEntries(EFFECT_PARAMS[kind].map((p) => [p.key, p.value])) };
}
export function newPattern(name: string): Pattern {
  return { id: uid("p"), name, notes: {} };
}

/* A new song: a kick, snare and hat on the step sequencer, a bass and a lead, one pattern on the playlist. */
export function emptySong(): StudioSong {
  const names: [string, StudioVoice, number][] = [["Kick", "drums", 36], ["Snare", "drums", 38], ["Hat", "drums", 42], ["Bass", "pickedBass", 40], ["Lead", "square", 72]];
  const channels = names.map(([name, voice, pitch], i) => newChannel(name, voice, i + 1, pitch));
  const pattern = newPattern("Pattern 1");
  return {
    version: 2, bpm: 140, beats: 4, unit: 4, channels, patterns: [pattern],
    playlist: [{ id: uid("k"), pattern: pattern.id, lane: 0, start: 0 }],
    mixer: [newInsert("Master"), ...channels.map((c) => newInsert(c.name))],
  };
}

/* A song made of parts, each a channel on its own insert, all in one pattern placed once: what a MIDI file or a game
   tune opens as. */
export function songFromParts(bpm: number, parts: { name: string; voice: StudioVoice; notes: StudioNote[] }[]): StudioSong {
  const channels = parts.map((p, i) => newChannel(p.name, p.voice, i + 1, p.notes[0]?.pitch ?? 60));
  const pattern = newPattern("Song");
  channels.forEach((c, i) => { pattern.notes[c.id] = sortNotes(parts[i].notes); });
  return {
    version: 2, bpm, beats: 4, unit: 4, channels, patterns: [pattern],
    playlist: [{ id: uid("k"), pattern: pattern.id, lane: 0, start: 0 }],
    mixer: [newInsert("Master"), ...channels.map((c) => newInsert(c.name))],
  };
}

type V1Song = { bpm: number; tracks: { name: string; voice: StudioVoice; volume: number; mute: boolean; solo: boolean; notes: StudioNote[] }[] };
/* A song as saved: this version, or the first studio's tracks, which become channels in one pattern. */
export function migrate(raw: unknown): StudioSong | null {
  const s = raw as Partial<StudioSong> & Partial<V1Song>;
  if (s?.version === 2 && Array.isArray(s.channels) && Array.isArray(s.patterns) && Array.isArray(s.mixer)) return s as StudioSong;
  if (Array.isArray(s?.tracks) && s.bpm) {
    const song = songFromParts(s.bpm, s.tracks.map((t) => ({ name: t.name, voice: t.voice, notes: t.notes })));
    song.channels.forEach((c, i) => { c.volume = s.tracks![i].volume; c.mute = s.tracks![i].mute; c.solo = s.tracks![i].solo; });
    return song;
  }
  return null;
}

export const sortNotes = (notes: StudioNote[]) => notes.slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);

/* A pattern lasts to the end of its last note, in whole bars (at least one). */
export function patternLength(song: StudioSong, pattern: Pattern | undefined) {
  const bar = barTicks(song);
  if (!pattern) return bar;
  let end = 0;
  for (const notes of Object.values(pattern.notes)) for (const n of notes) end = Math.max(end, n.start + n.len);
  return Math.max(bar, Math.ceil(end / bar) * bar);
}

/* The playlist ends with its last clip, in whole bars (at least one). */
export function songLength(song: StudioSong) {
  const bar = barTicks(song);
  let end = 0;
  for (const clip of song.playlist) end = Math.max(end, clip.start + patternLength(song, song.patterns.find((p) => p.id === clip.pattern)));
  return Math.max(bar, Math.ceil(end / bar) * bar);
}

/* Every channel's notes as the playlist plays them, each clip's pattern placed at the clip, sorted. With `pattern`,
   that pattern alone from the start (the pattern mode of FL's transport). */
export function flatten(song: StudioSong, pattern?: string): Map<string, StudioNote[]> {
  const out = new Map<string, StudioNote[]>(song.channels.map((c) => [c.id, []]));
  const place = (p: Pattern, at: number) => {
    const length = patternLength(song, p);
    for (const [channel, notes] of Object.entries(p.notes)) {
      const list = out.get(channel);
      if (!list) continue;
      for (const n of notes) if (n.start < length) list.push({ ...n, start: n.start + at });
    }
  };
  if (pattern) { const p = song.patterns.find((x) => x.id === pattern); if (p) place(p, 0); }
  else for (const clip of song.playlist) { const p = song.patterns.find((x) => x.id === clip.pattern); if (p) place(p, clip.start); }
  for (const [id, notes] of out) out.set(id, sortNotes(notes));
  return out;
}

/* ---- Standard MIDI Files ---- */

class Reader {
  i = 0;
  private d: Uint8Array;
  constructor(d: Uint8Array) { this.d = d; }
  u8() { return this.d[this.i++]; }
  u16() { return (this.u8() << 8) | this.u8(); }
  u32() { return ((this.u8() << 24) >>> 0) + (this.u8() << 16) + (this.u8() << 8) + this.u8(); }
  vlq() { let v = 0, b; do { b = this.u8(); v = (v << 7) | (b & 0x7f); } while (b & 0x80); return v; }
  text(n: number) { let s = ""; for (let k = 0; k < n; k++) s += String.fromCharCode(this.u8()); return s; }
  get more() { return this.i < this.d.length; }
}

export type ParsedMidi = { bpm: number; beats: number; unit: 4 | 8; tracks: { name: string; channel: number; program: number; notes: StudioNote[] }[] };

/* Reads format 0 and 1 files: each track and channel with notes becomes a part, its ticks rescaled to PPQ. The first
   tempo and time signature set the song's; later changes are not followed. */
export function parseMidi(data: Uint8Array): ParsedMidi {
  const r = new Reader(data);
  if (r.text(4) !== "MThd") throw new Error("Not a MIDI file");
  const headerLen = r.u32();
  r.u16();
  const count = r.u16(), division = r.u16();
  r.i = 8 + headerLen;
  if (division & 0x8000) throw new Error("SMPTE time is not supported");
  const scale = PPQ / division;
  let bpm = 120, tempoSet = false, beats = 4, unit: 4 | 8 = 4, meterSet = false;
  const parts: ParsedMidi["tracks"] = [];
  for (let t = 0; t < count && r.more; t++) {
    if (r.text(4) !== "MTrk") throw new Error("Bad track chunk");
    const end = r.u32() + r.i;
    let tick = 0, status = 0, name = "";
    const programs = new Array(16).fill(0);
    const open = new Map<number, { start: number; vel: number }[]>();
    const byChannel = new Map<number, StudioNote[]>();
    while (r.i < end) {
      tick += r.vlq();
      let b = r.u8();
      if (b === 0xff) {
        const type = r.u8(), len = r.vlq(), at = r.i;
        if (type === 0x03 && !name) name = r.text(len).trim();
        if (type === 0x51 && !tempoSet) { bpm = Math.round(60_000_000 / ((data[at] << 16) | (data[at + 1] << 8) | data[at + 2])); tempoSet = true; }
        if (type === 0x58 && !meterSet) { beats = Math.max(1, Math.min(16, data[at])); unit = 2 ** data[at + 1] === 8 ? 8 : 4; meterSet = true; }
        r.i = at + len;
        continue;
      }
      if (b === 0xf0 || b === 0xf7) { r.i += r.vlq(); continue; }
      if (b & 0x80) status = b; else { r.i--; b = status; }
      const kind = status & 0xf0, ch = status & 0x0f;
      if (kind === 0xc0) { programs[ch] = r.u8(); continue; }
      if (kind === 0xd0) { r.u8(); continue; }
      const a1 = r.u8(), a2 = r.u8();
      const key = ch * 128 + a1, at = Math.round(tick * scale);
      if (kind === 0x90 && a2 > 0) {
        if (!open.has(key)) open.set(key, []);
        open.get(key)!.push({ start: at, vel: a2 / 127 });
      } else if (kind === 0x80 || (kind === 0x90 && a2 === 0)) {
        const on = open.get(key)?.shift();
        if (!on) continue;
        if (!byChannel.has(ch)) byChannel.set(ch, []);
        byChannel.get(ch)!.push({ pitch: a1, start: on.start, len: Math.max(1, at - on.start), vel: on.vel });
      }
    }
    r.i = end;
    for (const [ch, notes] of byChannel) {
      const label = name || `Track ${t + 1}`;
      parts.push({ name: byChannel.size > 1 ? `${label} (ch ${ch + 1})` : label, channel: ch, program: programs[ch], notes: sortNotes(notes) });
    }
  }
  return { bpm: Math.min(300, Math.max(30, bpm)), beats, unit, tracks: parts };
}

/* A General MIDI program to the nearest voice; channel 10 is the kit, and a low part is a bass whatever its program. */
export function voiceFor(program: number, channel: number, notes: StudioNote[]): StudioVoice {
  if (channel === 9) return "drums";
  const avg = notes.reduce((s, n) => s + n.pitch, 0) / Math.max(1, notes.length);
  if ((program >= 32 && program <= 39) || avg < 45) return "pickedBass";
  if (program <= 7) return "piano";
  if (program <= 15) return "bell";
  if (program <= 23) return "organ";
  if (program <= 31) return "guitar";
  if (program === 40 || program === 41) return "violin";
  if (program <= 55) return "strings";
  if (program === 56 || program === 59) return "trumpet";
  if (program <= 63) return "brass";
  if (program <= 79) return "lead";
  if (program <= 87) return "square";
  if (program <= 95) return "strings";
  return "piano";
}

export function fromMidi(parsed: ParsedMidi): StudioSong {
  const song = songFromParts(parsed.bpm, parsed.tracks.map((p) => ({ name: p.name, voice: voiceFor(p.program, p.channel, p.notes), notes: p.notes })));
  return { ...song, beats: parsed.beats, unit: parsed.unit };
}

const PROGRAM: Partial<Record<StudioVoice, number>> = {
  piano: 0, bell: 9, harp: 46, organ: 19, organChord: 16, guitar: 30, synthBass: 38, pickedBass: 34, slapBass: 36, violin: 40,
  strings: 48, trumpet: 56, brass: 61, lead: 81, square: 80, superSquare: 80, chip: 80,
};

/* Writes a format 1 file of the playlist as it plays: a tempo track, then one track per channel, each on its own
   channel (the kit on 10). */
export function toMidi(song: StudioSong): Uint8Array {
  const out: number[] = [];
  const push = (...b: number[]) => { for (const x of b) out.push(x); };
  const u32 = (v: number) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  const vlq = (v: number) => { const b = [v & 0x7f]; while ((v >>= 7)) b.unshift((v & 0x7f) | 0x80); return b; };
  const chunk = (body: number[]) => { push(0x4d, 0x54, 0x72, 0x6b, ...u32(body.length)); for (const x of body) out.push(x); };
  const text = (s: string) => Array.from(s.slice(0, 60)).map((c) => c.charCodeAt(0) & 0x7f);
  const notes = flatten(song);
  push(0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 1, (song.channels.length + 1) >> 8, (song.channels.length + 1) & 255, PPQ >> 8, PPQ & 255);
  const us = Math.round(60_000_000 / song.bpm);
  chunk([0, 0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255, 0, 0xff, 0x58, 4, song.beats, song.unit === 8 ? 3 : 2, 24, 8, 0, 0xff, 0x2f, 0]);
  const melodic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
  let k = 0;
  for (const channel of song.channels) {
    const ch = channel.voice === "drums" ? 9 : melodic[k++ % melodic.length];
    const events: [tick: number, bytes: number[]][] = [];
    for (const n of notes.get(channel.id) ?? []) {
      const vel = Math.max(1, Math.min(127, Math.round(n.vel * 127)));
      events.push([n.start, [0x90 | ch, n.pitch, vel]], [n.start + n.len, [0x80 | ch, n.pitch, 0]]);
    }
    events.sort((a, b) => a[0] - b[0] || (a[1][0] & 0xf0) - (b[1][0] & 0xf0));
    const name = text(channel.name);
    const body = [0, 0xff, 0x03, name.length, ...name, 0, 0xc0 | ch, PROGRAM[channel.voice] ?? 0];
    let last = 0;
    for (const [tick, bytes] of events) { body.push(...vlq(tick - last), ...bytes); last = tick; }
    body.push(0, 0xff, 0x2f, 0);
    chunk(body);
  }
  return Uint8Array.from(out);
}

/* ---- The engine's tracker lines ---- */

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const noteName = (pitch: number) => `${NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`;

/* One line per bar of sixteenths, as space2-music.ts writes a tune: a note name starts a note, "-" holds it and "."
   rests. The engine plays one note at a time, so where notes overlap the highest that starts on a sixteenth wins and
   a note is cut where the next one starts. `bar` is the bar's length in ticks (16 cells in 4/4, 14 in 7/8). */
export function trackerLines(notes: StudioNote[], length: number, bar = BAR): string[] {
  const cells = Math.ceil(length / SIXTEENTH), perBar = Math.round(bar / SIXTEENTH);
  const line: string[] = new Array(cells).fill(".");
  const starts = new Map<number, StudioNote>();
  for (const n of notes) {
    const at = Math.round(n.start / SIXTEENTH);
    if (at >= cells) continue;
    const there = starts.get(at);
    if (!there || n.pitch > there.pitch) starts.set(at, n);
  }
  const order = [...starts.keys()].sort((a, b) => a - b);
  order.forEach((at, k) => {
    const n = starts.get(at)!, until = Math.min(order[k + 1] ?? cells, at + Math.max(1, Math.round(n.len / SIXTEENTH)), cells);
    line[at] = noteName(n.pitch);
    for (let c = at + 1; c < until; c++) line[c] = "-";
  });
  const bars: string[] = [];
  for (let b = 0; b < cells; b += perBar) bars.push(line.slice(b, b + perBar).join(" "));
  return bars;
}

/* ---- WAV ---- */

/* A rendered song as a 16-bit PCM WAV file. */
export function encodeWav(channels: Float32Array[], rate: number): Uint8Array {
  const frames = channels[0].length, count = channels.length, bytes = frames * count * 2;
  const buf = new ArrayBuffer(44 + bytes), v = new DataView(buf);
  const str = (at: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + bytes, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, count, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * count * 2, true); v.setUint16(32, count * 2, true); v.setUint16(34, 16, true);
  str(36, "data"); v.setUint32(40, bytes, true);
  let at = 44;
  for (let i = 0; i < frames; i++) for (let c = 0; c < count; c++) { const x = Math.max(-1, Math.min(1, channels[c][i])); v.setInt16(at, x < 0 ? x * 0x8000 : x * 0x7fff, true); at += 2; }
  return new Uint8Array(buf);
}
