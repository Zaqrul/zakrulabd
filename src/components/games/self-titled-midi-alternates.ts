/* Two battles for Self-Titled, each laid out after the form of one of the owner's MIDI files. Every note is written
   new (self-titled-midi-phrases.ts and the bars below); the references gave the form, chords, grooves and band only.
   - Banner of Embers: a SaGa-style battle in B minor, the hook on trumpet and brass over the strings and a slap bass.
   - Choir of Shadows: a dark organ-and-piano battle in E minor, with a 7/8 bridge. */
import type { BarPerformance, Song } from "./space2-music";
import {
  RS_INTRO, RS_HOOK, RS_ANSWERS, RS_BASS, RS_STRINGS, RS_INNER,
  SEY_CASCADE, SEY_CHORALE, SEY_PULSE, SEY_MINOR_THIRD, SEY_CHROMATIC, SEY_BASS,
} from "./self-titled-midi-phrases.ts";

export type MidiAlternateTrack = "self:battle3" | "self:battle4";
type Bar = Song["bars"][number];
type Band = Omit<NonNullable<Song["sections"]>[number], "from">;
const REST = ". . . . . . . . . . . . . . . .";
const ROCK = "kh . h k sh . h . kh . h k sh . h o";
const DRIVE = "kh h h . sh h kh h kh . h kh sh h h o";
const HALF = "kh . h . . . h . sh . h . k . h o";
const TOMS = "k . . t . . t . k . . t . t t .";
const MOTOR = "kh . h . kh . h . ksh . h . kh . h o";
const SEVEN = "kh . h k sh . h kh . h sh . t t";
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const octave = (line: string, amount: number) => line.replace(/([A-G]#?)(\d)/g, (_, n: string, o: string) => `${n}${Number(o) + amount}`);
const riffOn = (root: number, figure: readonly (number | null)[]) => figure.map((offset) => {
  if (offset === null) return ".";
  const pitch = root + offset;
  return `${NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`;
}).join(" ");
const pushBass = (root: number) => riffOn(root, [0, null, 12, 0, null, 7, 0, null, 0, null, 10, 12, null, 7, 10, null]);
const pedal = (root: number) => riffOn(root, [0, null, 7, null, 0, null, 10, null, 0, null, 7, null, 12, null, 7, null]);

function score() {
  const bars: Bar[] = [], performance: BarPerformance[] = [], sections: NonNullable<Song["sections"]> = [];
  const crashes: number[] = [];
  function add(lines: readonly string[], chords: readonly string[], band: Band, options: {
    counter?: readonly string[]; bass?: readonly string[]; riff?: string;
    kit?: string; gate?: number; accent?: number; fill?: boolean;
  } = {}) {
    sections.push({ from: bars.length, ...band });
    if (band.drums !== "none") crashes.push(bars.length);
    lines.forEach((line, i) => {
      const count = line.split(" ").length;
      const kit = (options.kit ?? ROCK).split(" ");
      if (options.fill !== false && i === lines.length - 1) kit.splice(count - 4, 4, "s", "s", "t", "st");
      bars.push([line, chords[i % chords.length], options.riff ?? (count === 14 ? "seven14" : "drive16"), options.counter?.[i % options.counter.length] ?? (count === 14 ? REST.split(" ").slice(0, 14).join(" ") : REST)]);
      performance.push({
        ...(options.bass ? { bass: options.bass[i % options.bass.length] } : {}),
        kit: kit.join(" "), gate: options.gate ?? 0.9,
        leadAccents: Array.from({ length: count }, (_, step) => (options.accent ?? 0.88) * (step % 4 === 0 ? 1 : step % 2 === 0 ? 0.94 : 0.84)),
        drumAccents: Array.from({ length: count }, (_, step) => step % 4 === 0 ? 0.9 : step % 2 === 0 ? 0.7 : 0.48),
      });
    });
  }
  return { bars, performance, sections, crashes, add };
}

/* Banner of Embers: the hook on trumpet and brass, the strings answering in its rests; the second subject on the
   violin; a break of hits, a guitar solo, a quiet interlude on the bells, and the hook again with the band built up. */
const steel = score();
steel.add([...RS_INTRO,
  "B4 - - - - - - - A4 - F#4 - D4 - F#4 -",
  "A#4 - - - C#5 - - - F#5 - - - . . F#4 A#4",
], ["Bm", "F#7", "Bm", "F#7"], { lead: "strings", layer: undefined, pad: undefined, counter: undefined, drums: "toms" }, {
  bass: ["B2 - - - - - - - A2 - - - - - - -", "G2 - - - - - - - F#2 - - - - - - -", pushBass(47), pedal(42)], kit: TOMS,
});
const RS_CHORDS = ["Bm", "Bm", "Bm", "Bm", "Gmaj7", "A", "Bm", "Bm", "Bm", "Bm", "Bm", "Bm", "Gmaj7", "A", "Bm", "F#7"];
steel.add(RS_HOOK, RS_CHORDS, { lead: "square", layer: "lead", pad: "strings", counter: "piano", drums: "battle", bassVoice: "picked" }, {
  counter: RS_ANSWERS, bass: RS_BASS, kit: DRIVE,
});
const STRING_CHORDS = ["G", "G", "Am7", "D", "G", "G", "A", "B7", "E", "F#7", "G", "Bm"];
steel.add(RS_STRINGS, STRING_CHORDS, { lead: "violin", layer: "strings", pad: "organ", counter: "piano", drums: "soft", bassVoice: "synth" }, {
  counter: RS_INNER, riff: "hold16", kit: HALF, gate: 0.98, accent: 0.82,
});
steel.add([
  "F#5 - . . . . E5 - D5 - . . . . . .",
  "B4 - . . D5 - . . F#5 - . . . . . .",
  "B4 . . B4 . . D5 . F#5 . . E5 . . D5 .",
  "C#5 - - - A#4 - - - F#4 . A#4 C#5 E5 F#5 A#5 C#6",
], ["Bm", "G", "Em", "F#7"], { lead: "brass", layer: "square", pad: undefined, counter: undefined, drums: "toms", bassVoice: "picked" }, {
  bass: [pushBass(47), pushBass(43), pushBass(40), pushBass(42)], kit: TOMS,
});
steel.add([
  "F#5 E5 D5 C#5 D5 - F#5 - B5 A5 F#5 E5 D5 - C#5 -",
  "B4 D5 F#5 A5 B5 A5 G5 F#5 E5 F#5 D5 E5 C#5 - A4 -",
  "B4 - D5 E5 F#5 G5 F#5 D5 E5 - G5 - F#5 E5 D5 B4",
  "C#5 E5 A5 G5 F#5 E5 D5 C#5 B4 C#5 D5 E5 F#5 - E5 -",
  "F#5 - - D5 C#5 D5 E5 F#5 B5 - A5 F#5 E5 D5 C#5 B4",
  "G5 F#5 E5 D5 E5 G5 B5 A5 G5 - F#5 E5 D5 - B4 -",
  "E5 F#5 G5 A5 B5 A5 G5 F#5 E5 D5 C#5 B4 A4 - G4 -",
  "A#4 C#5 E5 F#5 A#5 G5 F#5 E5 C#5 - A#4 - F#4 - . .",
], ["Bm", "D", "G", "A", "Bm", "G", "Em", "F#7"], { lead: "superSquare", layer: "chip", pad: undefined, counter: "organ", drums: "battle", bassVoice: "picked" }, {
  bass: [pushBass(47), pushBass(38), pushBass(43), pushBass(45), pushBass(47), pushBass(43), pushBass(40), pushBass(42)], kit: DRIVE,
});
steel.add([
  "F#5 - - - - - E5 - D5 - - - C#5 - - -",
  "E5 - - - - - D5 - C#5 - - - A4 - - -",
  "B4 - - - - - D5 - F#5 - - - E5 - D5 -",
  "C#5 - - - - - - - . . . . A4 - B4 -",
  "D5 - - - F#5 - - - A5 - - - G5 - F#5 -",
  "E5 - - - - - F#5 - G5 - - - B5 - A5 -",
  "G5 - - - F#5 - E5 - D5 - - - C#5 - B4 -",
  "A#4 - - - - - - - C#5 - - - . . . .",
], ["Dmaj7", "A", "Bm", "F#m", "Gmaj7", "Em7", "G", "F#7"], { lead: "bell", layer: "strings", pad: "strings", counter: "piano", drums: "none", bassVoice: "picked" }, {
  counter: ["A3 - - - - - - - F#4 - - - - - - -", "E4 - - - - - - - C#4 - - - - - - -"], riff: "hold16", gate: 0.98, accent: 0.72,
});
steel.add(RS_HOOK.map((line, i) => i >= 8 ? octave(line, 1) : line), RS_CHORDS, { lead: "square", layer: "brass", pad: "strings", counter: "piano", drums: "battle", bassVoice: "picked" }, {
  counter: RS_ANSWERS, bass: RS_BASS, kit: ROCK, accent: 0.94,
});
steel.add(RS_STRINGS, STRING_CHORDS, { lead: "trumpet", layer: "strings", pad: "organ", counter: "piano", drums: "battle", bassVoice: "picked" }, {
  counter: RS_INNER, kit: DRIVE, gate: 0.96,
});
steel.add([
  "F#5 - - - - - E5 - D5 - - - B4 - - -",
  "D5 - - - F#5 - - - E5 - - - D5 - - -",
  "G5 - - - F#5 - E5 - C#5 - - - A#4 - - -",
  "F#5 - - - - - - - E5 D5 C#5 B4 A#4 - . .",
], ["Bm", "G", "F#7", "F#7"], { lead: "square", layer: "brass", pad: "strings", counter: undefined, drums: "battle", bassVoice: "picked" }, { kit: ROCK });

const BANNER_OF_EMBERS: Song = {
  bpm: 166, lead: "square", counterLevel: 0.045, bassVoice: "picked", drums: "battle", riff: "drive16", intro: 4,
  bars: steel.bars, performance: steel.performance, sections: steel.sections, crashes: steel.crashes, riser: [50, 51],
};

/* Choir of Shadows: the piano's ostinato alone, an organ chorale over it, repeated notes on the organ, the G minor
   answer on the brass, a lament for the piano, a 7/8 bridge, and the themes again higher. */
const glass = score();
glass.add([...SEY_CASCADE, ...SEY_CASCADE], ["Em", "Em"], { lead: "piano", layer: undefined, pad: undefined, counter: undefined, drums: "none" }, {
  riff: "rest16", gate: 0.82, accent: 0.72,
});
glass.add(SEY_CHORALE, ["Em7", "D", "Gmaj7", "Cmaj7", "Am7", "Bm7", "Cmaj7", "Cmaj7"], { lead: "organ", layer: undefined, pad: "strings", counter: "piano", drums: "none", bassVoice: "picked" }, {
  counter: SEY_CASCADE.map((line) => octave(line, -1)), riff: "hold16", gate: 1, accent: 0.8,
});
glass.add([
  "E4 - - - . . . . B4 - - - A4 - - -",
  "G4 - - - . . B4 - D5 - - - B4 - - -",
  "E5 - - - D5 - B4 - A4 - - - G4 - - -",
  "F#4 - - - D#4 - - - B3 - - - . . . .",
], ["Em", "Em7", "C", "B7"], { lead: "organ", layer: undefined, pad: undefined, counter: undefined, drums: "toms", bassVoice: "synth" }, {
  bass: [pedal(40), pedal(40), pedal(36), pedal(35)], kit: TOMS,
});
glass.add(SEY_PULSE, ["Em7"], { lead: "square", layer: "organ", pad: "strings", counter: undefined, drums: "battle", bassVoice: "picked" }, {
  bass: SEY_BASS.slice(0, 8), kit: MOTOR, gate: 0.83,
});
glass.add(SEY_MINOR_THIRD, ["Gm7"], { lead: "brass", layer: "square", pad: "strings", counter: undefined, drums: "battle", bassVoice: "picked" }, {
  bass: SEY_BASS.slice(8), kit: ROCK, gate: 0.88,
});
glass.add([...SEY_CASCADE, ...SEY_CHROMATIC, ...SEY_CASCADE, ...SEY_CHROMATIC], ["Em", "Em", "F7", "F7"], {
  lead: "piano", layer: undefined, pad: undefined, counter: "organ", drums: "battle", bassVoice: "synth",
}, {
  counter: ["B3 - - - - - - - D4 - - - - - - -", "E4 - - - - - - - G4 - - - - - - -", "A3 - - - - - - - Eb4 - - - - - - -", "C4 - - - - - - - Eb4 - - - - - - -"],
  bass: [pedal(40), pedal(40), pedal(41), pedal(41)], kit: HALF, gate: 0.8,
});
glass.add([
  "B4 - - - - - - - A4 - - - G4 - - -",
  "F#4 - - - - - - - E4 - - - D4 - - -",
  "E4 - - - G4 - - - B4 - - - A4 - - -",
  "G4 - - - - - - - F#4 - - - E4 - - -",
  "C5 - - - - - B4 - A4 - - - G4 - - -",
  "F#4 - - - A4 - - - D5 - - - C5 - B4 -",
  "A4 - - - G4 - F#4 - E4 - - - D#4 - - -",
  "F#4 - - - - - - - B4 - - - . . . .",
], ["Cmaj7", "D", "Em", "Bm", "Am7", "D", "B7", "B7"], { lead: "piano", layer: undefined, pad: "strings", counter: "bell", drums: "none", bassVoice: "picked" }, {
  counter: [". . . . . . . . E5 - - - - - - -", ". . . . . . . . D5 - - - - - - -"], riff: "hold16", gate: 1, accent: 0.72,
});
glass.add([
  "E5 . B4 E5 . G5 . F#5 - E5 - B4 - .",
  "E5 . B4 E5 . A5 . G5 - F#5 - D5 - .",
  "F5 . C5 F5 . A5 . G5 - F5 - C5 - .",
  "F#5 . D#5 F#5 . A5 . B5 - A5 - F#5 - .",
  "G5 . E5 G5 . B5 . A5 - G5 - E5 - .",
  "G5 . D5 G5 . Bb5 . A5 - G5 - D5 - .",
  "A5 - G5 F#5 - E5 D#5 - C5 B4 - A4 G4 .",
  "F#4 - - D#4 - - B3 - - . B4 C5 D5 D#5",
], ["Em", "Em7", "F", "B7", "Em", "Gm", "B7", "B7"], { lead: "organ", layer: undefined, pad: undefined, counter: undefined, drums: "battle", bassVoice: "synth" }, {
  kit: SEVEN, riff: "seven14", gate: 0.78,
});
glass.add(SEY_PULSE.map((line) => octave(line, 1)), ["Em7"], { lead: "superSquare", layer: "brass", pad: "strings", counter: undefined, drums: "battle", bassVoice: "picked" }, {
  bass: SEY_BASS.slice(0, 8), kit: MOTOR, gate: 0.88, accent: 0.9,
});
glass.add(SEY_MINOR_THIRD.map((line) => octave(line, 1)), ["Gm7"], { lead: "violin", layer: "brass", pad: "organ", counter: undefined, drums: "battle", bassVoice: "picked" }, {
  bass: SEY_BASS.slice(8), kit: DRIVE, gate: 0.93, accent: 0.9,
});
glass.add([...SEY_CASCADE,
  "E5 - - - D5 - - - B4 - - - A4 - G4 -",
  "F#4 - - - D#4 - - - B3 - - - . . . .",
], ["Em", "Cmaj7", "Am7", "B7"], { lead: "piano", layer: undefined, pad: "organ", counter: undefined, drums: "none", bassVoice: "picked" }, {
  riff: "hold16", gate: 0.85, accent: 0.78,
});

const CHOIR_OF_SHADOWS: Song = {
  bpm: 144, lead: "piano", counterLevel: 0.042, bassVoice: "synth", drums: "battle", riff: "toll16", intro: 12,
  bars: glass.bars, performance: glass.performance, sections: glass.sections, crashes: glass.crashes, riser: [54, 55],
};

export const MIDI_ALTERNATES: Record<MidiAlternateTrack, Song> = {
  "self:battle3": BANNER_OF_EMBERS,
  "self:battle4": CHOIR_OF_SHADOWS,
};
