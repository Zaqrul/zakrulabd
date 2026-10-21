/* The Self-Titled album: tunes written for the soundtrack player alone, each in the manner of a reference the owner
   chose, its notes all new (docs/composition-method.md). They play on Space 2's band (space2-music.ts).
   - Wandering Blade, a battle in the manner of a 16-bit SaGa battle theme: C sharp minor at 160 bpm. Two trumpets'
     worth of brass holding long notes over strings that never stop running in sixteenths and a slapped bass driving
     eighths; a hook that holds the third and turns down to a pickup in threes; a half-time section where the strings
     sing; hits in threes against the bar climbing by minor thirds (E, G, B flat) to the dominant; unison runs over
     the toms; a break on the toms alone; then solos for the guitar and the violin, a quiet interlude on the bells in
     E major, and the whole tune again with the band built up. */
import type { BarPerformance, Song } from "./space2-music";

export type SelfTitledTrack = "self:battle1";

/* The strings' running sixteenths for each chord: its third, root, fifth and root, four times over. */
const RUN: Record<string, string> = {
  "C#m": "E4 C#4 G#4 C#4", A: "C#4 A3 E4 A3", B: "D#4 B3 F#4 B3", E: "G#4 E4 B4 E4", "F#m": "A3 F#3 C#4 F#3",
  G7: "D4 B3 F4 B3", "G#7": "C4 G#3 D#4 F#4", "G#m": "B3 G#3 D#4 G#3", G: "B3 G3 D4 G3", Bb: "D4 Bb3 F4 Bb3",
};
const run = (chord: string) => Array(4).fill(RUN[chord]).join(" ");
type Bar = Song["bars"][number];
/* A bar whose counter-line is the strings' run. */
const ran = (lead: string, chord: string, riff = "drive16"): Bar => [lead, chord, riff, run(chord)];

/* The kits written out: hits in threes against the bar, the runs over the toms, the break, and their fills. */
const KIT = {
  hits: "kc . . k . . ks . k . . k . . ks .",
  hitsFill: "k . . k . . ks . s s s s t t t t",
  runs: "k t t t s t t t k t t t s t t t",
  runsFill: "k t t t s t t t s s s s s s s s",
  brk: "t . t . t t . t . . t . t . . .",
  brkFill: "t . t . t t . t s s t t s s s s",
};

const INTRO: Bar[] = [
  [". . . . . . . . . . . . . . . .", "C#m", "pump16", run("C#m")],
  [". . . . . . . . . . . . . . . .", "C#m", "pump16", run("C#m")],
  [". . . . . . . . . . E5 . F#5 . G#5 .", "C#m", "drive16", run("C#m")],
  ["G#4 . . G#4 . . C5 . D#5 . . F#5 . . G#5 .", "G#7", "hits16", run("G#7")],
];

/* The hook: the third held, then down through the scale to a pickup; said over i, bVI, bVII, then i, III, iv and V7. */
const A: Bar[] = [
  ran("E5 - - - - - - - - - D#5 . C#5 - B4 -", "C#m"),
  ran("C#5 - - - - - - - G#4 - B4 - C#5 - E5 -", "C#m"),
  ran("F#5 - - - - - - - E5 - - - C#5 - A4 -", "A"),
  ran("D#5 - - - - - - - F#5 - - - B5 - A5 -", "B"),
  ran("G#5 - - - - - - - - - F#5 . E5 - D#5 -", "C#m"),
  ran("E5 - - - - - - - B4 - - - G#4 - B4 -", "E"),
  ran("C#5 - - - A5 - - - G#5 - F#5 - E5 - F#5 -", "F#m"),
  ran("C5 - - - - - - - D#5 - - - G#5 - - -", "G#7"),
];
/* The hook again, climbing to its top in the fourth bar and falling to a half cadence. */
const A2: Bar[] = [
  ran("E5 - - - - - - - - - D#5 . C#5 - E5 -", "C#m"),
  ran("G#5 - - - - - - - E5 - F#5 - G#5 - B5 -", "C#m"),
  ran("C#6 - - - - - - - B5 - A5 - G#5 - F#5 -", "A"),
  ran("D#6 - - - - - - - C#6 - B5 - A5 - G#5 -", "B"),
  ran("G#5 - - - E5 - - - C#5 - - - E5 - G#5 -", "C#m"),
  ran("B5 - - - G#5 - - - E5 - - - G#5 - B5 -", "E"),
  ran("A5 - - - - - - - G#5 - F#5 - E5 - D#5 -", "F#m"),
  ran("C5 - - - - - - - D#5 - - - . . . .", "G#7"),
];
/* Half time: the strings sing over the brass hitting the chords. */
const B: Bar[] = [
  ["C#5 - - - - - - - - - - - E5 - - -", "A", "pump16", "A4 . . . . . . . C#5 . . . E5 . . ."],
  ["D#5 - - - - - - - F#5 - - - E5 - D#5 -", "B", "pump16", "B4 . . . . . . . D#5 . . . F#5 . . ."],
  ["B4 - - - - - - - - - - - D#5 - - -", "G#m", "pump16", "G#4 . . . . . . . B4 . . . D#5 . . ."],
  ["E5 - - - - - - - G#5 - - - - - - -", "C#m", "pump16", "C#5 . . . . . . . E5 . . . G#4 . . ."],
  ["A5 - - - - - - - G#5 - - - F#5 - - -", "F#m", "pump16", "F#4 . . . . . . . A4 . . . C#5 . . ."],
  ["F#5 - - - - - - - D#5 - - - B4 - - -", "B", "pump16", "B4 . . . . . . . D#5 . . . F#4 . . ."],
  ["G#5 - - - - - - - - - - - B5 - - -", "E", "pump16", "E5 . . . . . . . G#4 . . . B4 . . ."],
  ["C6 - - - - - - - G#5 - - - D#5 - - -", "G#7", "chrom16", "C5 . . . . . . . D#5 . . . F#4 . . ."],
];
/* Hits in threes, climbing by minor thirds to the dominant. */
const C: Bar[] = [
  ["G#5 - . B5 - . E6 - D#6 - . B5 - . G#5 -", "E", "hits16", run("E")],
  ["B5 - . D6 - . G6 - F#6 - . D6 - . B5 -", "G", "hits16", run("G")],
  ["D6 - . F6 - . Bb6 - A6 - . F6 - . D6 -", "Bb", "hits16", run("Bb")],
  ["C6 - . D#6 - . G#6 - - - F#6 - D#6 - C6 -", "G#7", "hits16", run("G#7")],
];
/* Unison runs over the toms. */
const RUNS: Bar[] = [
  ["C#5 D#5 E5 F#5 G#5 F#5 E5 D#5 E5 F#5 G#5 A5 B5 A5 G#5 F#5", "C#m", "gallop16"],
  ["E5 F#5 G#5 A5 B5 A5 G#5 F#5 G#5 A5 B5 C#6 D#6 C#6 B5 A5", "A", "gallop16"],
  ["F#5 G#5 A5 B5 C#6 B5 A5 G#5 A5 B5 C#6 D#6 E6 D#6 C#6 B5", "B", "gallop16"],
  ["C6 C#6 D#6 E6 F#6 E6 D#6 C6 D#6 E6 F#6 G#6 C6 - - -", "G#7", "chrom16"],
];
/* The break: the toms, the bass, and the brass calling the hook's first notes. */
const BREAK: Bar[] = [
  ["C#5 . . . . . . . . . . . . . . .", "C#m", "pulse16"],
  ["E5 . . E5 . . C#5 . . . . . . . . .", "C#m", "drive16"],
  ["G#4 . . G#4 . . B4 . . . . . . . . .", "C#m", "drive16"],
  ["C5 . . D#5 . . G#5 . . . . . . . . .", "G#7", "drive16"],
];
/* The guitar's solo, on the hook's turn (E, D sharp, C sharp, B). */
const GUITAR: Bar[] = [
  ran("E5 D#5 C#5 B4 C#5 E5 G#5 E5 C#6 B5 G#5 E5 F#5 G#5 A5 B5", "C#m", "gallop16"),
  ran("C#6 B5 G#5 E5 G#5 B5 C#6 D#6 E6 D#6 C#6 B5 G#5 F#5 E5 D#5", "C#m", "gallop16"),
  ran("E5 F#5 A5 C#6 E6 C#6 A5 E5 F#5 A5 C#6 E6 F#6 E6 C#6 A5", "A", "gallop16"),
  ran("F#5 A5 B5 D#6 F#6 D#6 B5 A5 B5 D#6 F#6 A6 B6 - A6 F#6", "B", "gallop16"),
  ran("G#6 - E6 - C#6 - G#5 - E6 D#6 C#6 B5 C#6 - G#5 -", "C#m", "gallop16"),
  ran("G#5 B5 E6 G#6 B6 G#6 E6 B5 G#6 F#6 E6 D#6 E6 - B5 -", "E", "gallop16"),
  ran("A5 C#6 F#6 A6 G#6 F#6 E6 C#6 D#6 E6 F#6 G#6 A6 G#6 F#6 E6", "F#m", "gallop16"),
  ran("D#6 C6 G#5 D#5 C5 D#5 G#5 C6 D#6 F#6 G#6 - C6 - - -", "G#7", "chrom16"),
];
/* The violin's solo: long notes breaking into turns. */
const VIOLIN: Bar[] = [
  ran("G#5 - - - - - A5 G#5 F#5 E5 D#5 E5 - - C#5 -", "C#m"),
  ran("E5 - - - - - F#5 E5 D#5 C#5 B4 C#5 - - G#4 -", "C#m"),
  ran("A4 - - C#5 E5 - - A5 - - G#5 - F#5 - E5 -", "A"),
  ran("D#5 - - F#5 B5 - - D#6 - - C#6 - B5 - A5 -", "B"),
  ran("G#5 A5 G#5 F#5 E5 F#5 E5 D#5 C#5 - - - E5 - G#5 -", "C#m"),
  ran("B5 C#6 B5 A5 G#5 A5 G#5 F#5 E5 - - - G#5 - B5 -", "E"),
  ran("C#6 - - B5 A5 - - G#5 F#5 - - E5 D#5 - C#5 -", "F#m"),
  ran("C5 - - - D#5 - - - G#5 - - - C6 - - -", "G#7"),
];
/* A quiet interlude on the bells, in the relative major's key of E. */
const INTERLUDE: Bar[] = [
  ["G#5 - - - - - - - F#5 - - - E5 - - -", "E", "hold16", "B4 - - - - - - - - - - - G#4 - - -"],
  ["D#5 - - - - - - - - - - - F#5 - - -", "B", "hold16", "B4 - - - - - - - - - - - A4 - - -"],
  ["E5 - - - - - - - G#5 - - - C#6 - - -", "C#m", "hold16", "G#4 - - - - - - - - - - - E5 - - -"],
  ["C#6 - - - - - - - B5 - - - A5 - - -", "A", "hold16", "E5 - - - - - - - - - - - C#5 - - -"],
  ["B5 - - - - - - - G#5 - - - E5 - - -", "E", "hold16", "G#4 - - - - - - - - - - - B4 - - -"],
  ["F#5 - - - - - - - D#5 - - - B4 - - -", "B", "hold16", "D#5 - - - - - - - - - - - F#4 - - -"],
  ["C#5 - - - - - - - E5 - - - A5 - - -", "A", "hold16", "A4 - - - - - - - - - - - C#5 - - -"],
  ["G#5 - - - - - - - . . . . . . . .", "G#7", "hold16", "C5 - - - - - - - D#5 - - - F#4 - - -"],
];

const BARS: Bar[] = [...INTRO, ...A, ...A2, ...B, ...C, ...RUNS, ...BREAK, ...GUITAR, ...VIOLIN, ...INTERLUDE, ...A, ...B, ...C, ...RUNS, ...A2];
/* Where each part starts, counting from 0. */
const AT = { a: 4, a2: 12, b: 20, c: 28, runs: 32, brk: 36, guitar: 40, violin: 48, interlude: 56, a3: 64, b2: 72, c2: 80, runs2: 84, a4: 88 };
const KITS: Record<number, string> = {
  [AT.c]: KIT.hits, [AT.c + 1]: KIT.hits, [AT.c + 2]: KIT.hits, [AT.c + 3]: KIT.hitsFill,
  [AT.runs]: KIT.runs, [AT.runs + 1]: KIT.runs, [AT.runs + 2]: KIT.runs, [AT.runs + 3]: KIT.runsFill,
  [AT.brk]: KIT.brk, [AT.brk + 1]: KIT.brk, [AT.brk + 2]: KIT.brk, [AT.brk + 3]: KIT.brkFill,
  [AT.c2]: KIT.hits, [AT.c2 + 1]: KIT.hits, [AT.c2 + 2]: KIT.hits, [AT.c2 + 3]: KIT.hitsFill,
  [AT.runs2]: KIT.runs, [AT.runs2 + 1]: KIT.runs, [AT.runs2 + 2]: KIT.runs, [AT.runs2 + 3]: KIT.runsFill,
};
const HIT_BARS = new Set([AT.c, AT.c + 1, AT.c + 2, AT.c + 3, AT.c2, AT.c2 + 1, AT.c2 + 2, AT.c2 + 3]);

const WANDERING_BLADE: Song = {
  bpm: 160, lead: "trumpet", layer: "brass", pad: "strings", counter: "strings", drums: "battle", bassVoice: "slap", riff: "drive16", intro: 4,
  fills: [3, AT.a2 - 1, AT.b - 1, AT.c - 1, AT.guitar - 1, AT.violin - 1, AT.interlude - 1, AT.a3 - 1, AT.b2 - 1, AT.c2 - 1, BARS.length - 1],
  crashes: [AT.a, AT.a2, AT.b, AT.c, AT.runs, AT.guitar, AT.violin, AT.a3, AT.b2, AT.c2, AT.runs2, AT.a4],
  riser: [AT.interlude + 6, AT.interlude + 7],
  sections: [
    { from: 0, lead: "trumpet", layer: undefined, pad: undefined, drums: "toms", stabs: false },
    { from: AT.a },
    { from: AT.b, lead: "strings", layer: "violin", pad: "organ", counter: "brass", drums: "march" },
    { from: AT.c, lead: "brass", layer: "trumpet", pad: undefined, stabs: true },
    { from: AT.runs, lead: "strings", layer: "guitar", pad: undefined, counter: undefined, stabs: false },
    { from: AT.brk, lead: "brass", layer: undefined, pad: undefined, counter: undefined, drums: "toms", stabs: false },
    { from: AT.guitar, lead: "guitar", layer: undefined, pad: "organ" },
    { from: AT.violin, lead: "violin", layer: undefined, pad: "strings" },
    { from: AT.interlude, lead: "bell", layer: "strings", pad: "harp", counter: "organ", drums: "soft", bassVoice: "picked" },
    { from: AT.a3, lead: "superSquare", layer: "trumpet", stabs: true },
    { from: AT.b2, lead: "brass", layer: "strings", pad: "organ", counter: "violin", drums: "march" },
    { from: AT.c2, lead: "brass", layer: "superSquare", pad: undefined, stabs: true },
    { from: AT.runs2, lead: "strings", layer: "guitar", pad: undefined, counter: undefined, stabs: false },
    { from: AT.a4, lead: "trumpet", layer: "brass", stabs: true },
  ],
  bars: BARS,
  performance: BARS.map((_, i): BarPerformance => (KITS[i] ? { kit: KITS[i], ...(HIT_BARS.has(i) ? { gate: 0.55 } : {}) } : {})),
};

export const SELF_TITLED: Record<SelfTitledTrack, Song> = {
  "self:battle1": WANDERING_BLADE,
};
