/* The studio's song, and what goes in and out of it: Standard MIDI Files (read and written), and the engine's
   tracker lines (space2-music.ts), one string per bar, so a part written here can become a tune in a game. Time is
   counted in ticks of PPQ to the quarter note; a sixteenth is PPQ / 4. */
/* What a studio track can play: a voice of the Space 2 band, a bass, or the kit (space2-music.ts plays them). */
export const STUDIO_VOICES = [
  "piano", "brass", "trumpet", "strings", "violin", "lead", "square", "superSquare", "organ", "organChord", "bell", "harp", "chip", "guitar",
  "synthBass", "pickedBass", "slapBass", "drums",
] as const;
export type StudioVoice = (typeof STUDIO_VOICES)[number];

export const PPQ = 96;
export const SIXTEENTH = PPQ / 4;
export const BAR = PPQ * 4;

export type StudioNote = { pitch: number; start: number; len: number; vel: number };
export type StudioTrack = { id: string; name: string; voice: StudioVoice; volume: number; mute: boolean; solo: boolean; notes: StudioNote[] };
export type StudioSong = { bpm: number; tracks: StudioTrack[] };

let nextId = 0;
export const trackId = () => `t${Date.now().toString(36)}${(nextId++).toString(36)}`;

export function emptySong(): StudioSong {
  return { bpm: 140, tracks: [newTrack("Lead", "square"), newTrack("Bass", "pickedBass"), newTrack("Drums", "drums")] };
}

export function newTrack(name: string, voice: StudioVoice): StudioTrack {
  return { id: trackId(), name, voice, volume: 0.8, mute: false, solo: false, notes: [] };
}

/* The end of the last note, rounded up to a whole bar (at least one). */
export function songLength(song: StudioSong) {
  const end = Math.max(0, ...song.tracks.flatMap((t) => t.notes.map((n) => n.start + n.len)));
  return Math.max(BAR, Math.ceil(end / BAR) * BAR);
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

export type ParsedMidi = { bpm: number; tracks: { name: string; channel: number; program: number; notes: StudioNote[] }[] };

/* Reads format 0 and 1 files: each track and channel with notes becomes a part, its ticks rescaled to PPQ. The first
   tempo sets the song's; later tempo changes are not followed. */
export function parseMidi(data: Uint8Array): ParsedMidi {
  const r = new Reader(data);
  if (r.text(4) !== "MThd") throw new Error("Not a MIDI file");
  const headerLen = r.u32();
  r.u16();
  const count = r.u16(), division = r.u16();
  r.i = 8 + headerLen;
  if (division & 0x8000) throw new Error("SMPTE time is not supported");
  const scale = PPQ / division;
  let bpm = 120, tempoSet = false;
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
      notes.sort((x, y) => x.start - y.start || x.pitch - y.pitch);
      const label = name || `Track ${t + 1}`;
      parts.push({ name: byChannel.size > 1 ? `${label} (ch ${ch + 1})` : label, channel: ch, program: programs[ch], notes });
    }
  }
  return { bpm: Math.min(300, Math.max(30, bpm)), tracks: parts };
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
  return {
    bpm: parsed.bpm,
    tracks: parsed.tracks.map((p) => ({ ...newTrack(p.name, voiceFor(p.program, p.channel, p.notes)), notes: p.notes })),
  };
}

const PROGRAM: Partial<Record<StudioVoice, number>> = {
  piano: 0, bell: 9, harp: 46, organ: 19, organChord: 16, guitar: 30, synthBass: 38, pickedBass: 34, slapBass: 36, violin: 40,
  strings: 48, trumpet: 56, brass: 61, lead: 81, square: 80, superSquare: 80, chip: 80,
};

/* Writes a format 1 file: a tempo track, then one track per studio track, each on its own channel (the kit on 10). */
export function toMidi(song: StudioSong): Uint8Array {
  const out: number[] = [];
  const push = (...b: number[]) => out.push(...b);
  const u32 = (v: number) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  const vlq = (v: number) => { const b = [v & 0x7f]; while ((v >>= 7)) b.unshift((v & 0x7f) | 0x80); return b; };
  const chunk = (body: number[]) => push(0x4d, 0x54, 0x72, 0x6b, ...u32(body.length), ...body);
  const text = (s: string) => Array.from(s.slice(0, 60)).map((c) => c.charCodeAt(0) & 0x7f);
  push(0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 1, (song.tracks.length + 1) >> 8, (song.tracks.length + 1) & 255, PPQ >> 8, PPQ & 255);
  const us = Math.round(60_000_000 / song.bpm);
  chunk([0, 0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255, 0, 0xff, 0x2f, 0]);
  const melodic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
  let k = 0;
  for (const track of song.tracks) {
    const ch = track.voice === "drums" ? 9 : melodic[k++ % melodic.length];
    const events: [tick: number, bytes: number[]][] = [];
    for (const n of track.notes) {
      const vel = Math.max(1, Math.min(127, Math.round(n.vel * 127)));
      events.push([n.start, [0x90 | ch, n.pitch, vel]], [n.start + n.len, [0x80 | ch, n.pitch, 0]]);
    }
    events.sort((a, b) => a[0] - b[0] || (a[1][0] & 0xf0) - (b[1][0] & 0xf0));
    const name = text(track.name);
    const body = [0, 0xff, 0x03, name.length, ...name, 0, 0xc0 | ch, PROGRAM[track.voice] ?? 0];
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
   a note is cut where the next one starts. */
export function trackerLines(track: StudioTrack, length: number): string[] {
  const cells = Math.ceil(length / SIXTEENTH);
  const line: string[] = new Array(cells).fill(".");
  const starts = new Map<number, StudioNote>();
  for (const n of track.notes) {
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
  for (let b = 0; b < cells; b += 16) bars.push(line.slice(b, b + 16).join(" "));
  return bars;
}
