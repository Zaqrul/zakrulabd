/* The Self-Titled album: tunes written for the soundtrack player alone, each in the manner of a reference the owner
   chose, its notes all new (docs/composition-method.md). They play on Space 2's band (space2-music.ts).
   - Wandering Blade, a battle in the manner of a 16-bit SaGa battle theme: C sharp minor at 160 bpm. Two trumpets'
     worth of brass holding long notes over strings that never stop running in sixteenths and a slapped bass driving
     eighths; a hook that holds the third and turns down to a pickup in threes; a half-time section where the strings
     sing; hits in threes against the bar climbing by minor thirds (E, G, B flat) to the dominant; unison runs over
     the toms; a break on the toms alone; then solos for the guitar and the violin, a quiet interlude on the bells in
     E major, and the whole tune again with the band built up.
   - Sanctum of Thorns, a battle in the manner of a dark organ-and-piano boss theme: A minor at 140 bpm. A piano
     ostinato of falling cells alone, then over chords; an organ theme that leans through D sharp to E; a melody of
     repeated notes over a pedal; the theme a minor third up in C minor, and arpeggios; the ostinato traded with
     chromatic runs; held brass over octaves pulsing; the key climbing a semitone at a time; held chords without
     drums; a push of hits in B minor; G sharp minor; the theme again and the ostinato to close. */
import type { BarPerformance, Song } from "./space2-music";

export type SelfTitledTrack = "self:battle1" | "self:battle2";

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

/* ---- Sanctum of Thorns ---- */

/* The piano's ostinato for each chord: cells of four falling a third and stepping up, cascading down two octaves. */
const CASCADE: Record<string, string> = {
  Am: "E6 C6 A5 B5 C6 A5 F5 G#5 A5 F5 D5 E5 F5 D5 B4 C5",
  F: "F6 C6 A5 Bb5 C6 A5 F5 G5 A5 F5 C5 D5 F5 C5 A4 Bb4",
  Dm: "F6 D6 A5 B5 D6 A5 F5 G#5 A5 F5 D5 E5 F5 D5 A4 B4",
  E: "E6 B5 G#5 A5 B5 G#5 E5 F5 G#5 E5 B4 C5 D5 B4 G#4 A4",
  Bb: "F6 D6 Bb5 C6 D6 Bb5 F5 G5 Bb5 F5 D5 E5 F5 D5 Bb4 C5",
};
/* The ostinato an octave down, under a tune. */
const low = (line: string) => line.replace(/(\d)/g, (d) => String(Number(d) - 1));
const cascade = (chord: string, riff = "hold16", counter?: string): Bar => (counter ? [CASCADE[chord], chord, riff, counter] : [CASCADE[chord], chord, riff]);
const RIDE = ". . . . . . . . . . . . . . . .";
const themed = (lead: string, chord: string, riff = "toll16"): Bar => [lead, chord, riff, low(CASCADE[chord === "E7" ? "E" : chord] ?? CASCADE.Am)];

/* The ostinato alone, then with the left hand. */
const S_INTRO: Bar[] = [
  [CASCADE.Am, "Am", "rest16", RIDE], [CASCADE.Am, "Am", "rest16", RIDE], [CASCADE.Am, "Am", "rest16", RIDE], [CASCADE.Am, "Am", "rest16", RIDE],
  cascade("Am", "hold16", "A2 - - - E3 - - - A3 - - - E3 - - -"),
  cascade("Am", "hold16", "A2 - - - E3 - - - C4 - - - E3 - - -"),
  cascade("F", "hold16", "F2 - - - C3 - - - A3 - - - C3 - - -"),
  cascade("F", "hold16", "F2 - - - C3 - - - F3 - - - C3 - - -"),
  cascade("Dm", "hold16", "D3 - - - A3 - - - F3 - - - A3 - - -"),
  cascade("Dm", "hold16", "D3 - - - A3 - - - D4 - - - A3 - - -"),
  cascade("E", "hold16", "E3 - - - B3 - - - G#3 - - - B3 - - -"),
  ["E5 F5 E5 D#5 E5 F5 G5 G#5 A5 A#5 B5 C6 B5 - - -", "E", "hits16", "E3 - - - - - - - G#3 - - - B3 - - -"],
];
/* The organ's theme, leaning through D sharp to E, then climbing an octave. */
const S_THEME: Bar[] = [
  themed("A4 - - - - - B4 - C5 - - - D#5 - E5 -", "Am"),
  themed("F5 - - - E5 - - - D#5 - - - E5 - - -", "Am"),
  themed("A5 - - - G5 - F5 - E5 - - - F5 - A5 -", "F", "pump16"),
  themed("G#5 - - - - - - - B5 - - - . . . .", "E", "pump16"),
  themed("A5 - - - - - B5 - C6 - - - D#6 - E6 -", "Am"),
  themed("F6 - - - E6 - - - D#6 - - - C6 - - -", "Am"),
  themed("D6 - - - C6 - A5 - F5 - - - A5 - D6 -", "Dm"),
  themed("B5 - - - G#5 - - - E5 - - - D5 - B4 -", "E", "pump16"),
];
/* Repeated notes over the pedal, each pulling on its upper neighbour, then a cascade down the scale. */
const S_PEDAL: Bar[] = [
  ["C5 . C5 . C5 - B4 C5 . . E5 . D5 . C5 .", "Am", "toll16"],
  ["C5 . C5 . C5 - B4 C5 . . G5 . F5 . E5 .", "Am7", "toll16"],
  ["E5 . E5 . E5 - D#5 E5 . . A5 . G5 . F5 .", "Am", "toll16"],
  ["E5 . E5 . E5 - D#5 E5 . . C6 . B5 . A5 .", "Am7", "toll16"],
  ["A5 G5 F5 E5 F5 E5 D5 C5 D5 C5 B4 A4 B4 C5 D5 E5", "F", "pump16"],
  ["G#5 - - - B5 - - - E6 - - - D6 - B5 -", "E", "pump16"],
  ["C6 . C6 . C6 - B5 C6 . . E6 . D6 . C6 .", "Am", "toll16"],
  ["B5 - - - G#5 - - - E5 - - - D5 - - -", "E7", "pump16"],
];
/* The theme a minor third up, in C minor, then arpeggios up and down the chords. */
const S_MINOR3: Bar[] = [
  ["C5 - - - - - D5 - Eb5 - - - F#5 - G5 -", "Cm", "toll16"],
  ["Ab5 - - - G5 - - - F#5 - - - G5 - - -", "Cm", "toll16"],
  ["C6 - - - Bb5 - Ab5 - G5 - - - Ab5 - C6 -", "Ab", "pump16"],
  ["B5 - - - - - - - D6 - - - . . . .", "G", "pump16"],
  ["C5 Eb5 G5 C6 Eb6 C6 G5 Eb5 C5 Eb5 G5 C6 D6 C6 B5 G5", "Cm", "pump16"],
  ["Ab4 C5 Eb5 Ab5 C6 Ab5 Eb5 C5 Ab4 C5 Eb5 Ab5 Bb5 Ab5 G5 Eb5", "Ab", "pump16"],
  ["F4 Ab4 C5 F5 Ab5 F5 C5 Ab4 F4 Ab4 C5 F5 G5 F5 Eb5 C5", "Fm", "pump16"],
  ["G4 B4 D5 G5 B5 D6 F6 D6 B5 G5 F5 D5 B4 G4 F4 D4", "G7", "chrom16"],
];
/* The ostinato traded with chromatic runs, the second time over the flat second. */
const S_TRADE: Bar[] = [
  cascade("Am", "toll16", "A3 - - - - - - - E4 - - - - - - -"),
  cascade("F", "pump16", "F3 - - - - - - - C4 - - - - - - -"),
  ["E4 F4 F#4 G4 G#4 A4 A#4 B4 C5 - - - . . . .", "E7", "hits16", "G#3 - - - - - - - B3 - - - . . . ."],
  cascade("Am", "toll16", "C4 - - - - - - - E4 - - - - - - -"),
  cascade("Bb", "pump16", "Bb3 - - - - - - - D4 - - - - - - -"),
  ["E5 F5 F#5 G5 G#5 A5 A#5 B5 C6 - - - . . . .", "E7", "hits16", "B3 - - - - - - - D4 - - - . . . ."],
];
/* Held brass over octaves pulsing on the root. */
const pulse = (r: string, hi: string) => `${r} . ${hi} . . ${r} ${hi} . ${r} . ${hi} . . ${r} ${hi} .`;
const S_PULSE: Bar[] = [
  ["A5 - - - - - - - E5 - - - - - - -", "Am", "pump16", pulse("A3", "A4")],
  ["C6 - - - - - - - B5 - - - A5 - G#5 -", "Am", "pump16", pulse("A3", "A4")],
  ["A5 - - - - - - - C6 - - - - - - -", "F", "pump16", pulse("F3", "F4")],
  ["F6 - - - - - - - E6 - - - D6 - C6 -", "F", "pump16", pulse("F3", "F4")],
  ["D6 - - - - - - - A5 - - - - - - -", "Dm", "pump16", pulse("D3", "D4")],
  ["F6 - - - - - - - E6 - - - D6 - E6 -", "Dm", "pump16", pulse("D3", "D4")],
  ["E6 - - - - - - - G#5 - - - B5 - - -", "E", "pump16", pulse("E3", "E4")],
  ["D6 - - - - - - - B5 - - - G#5 - - -", "E7", "pump16", pulse("E3", "E4")],
];
/* The key climbing a semitone every second bar, each minor key and its flat sixth, on a swaying figure. */
const sway = (fifth: string, third: string, octave: string, seventh: string) => `${fifth} - . ${third} - . ${fifth} - ${octave} - . ${seventh} - . ${fifth} -`;
const S_CHAIN: Bar[] = [
  [sway("F5", "Db5", "Bb5", "Ab5"), "Bbm", "toll16"],
  [sway("Gb5", "Db5", "Bb5", "Ab5"), "Gb", "pump16"],
  [sway("F#5", "D5", "B5", "A5"), "Bm", "toll16"],
  [sway("G5", "D5", "B5", "A5"), "G", "pump16"],
  [sway("G5", "Eb5", "C6", "Bb5"), "Cm", "toll16"],
  [sway("Ab5", "Eb5", "C6", "Bb5"), "Ab", "pump16"],
  [sway("G#5", "E5", "C#6", "B5"), "C#m", "toll16"],
  [sway("A5", "E5", "C#6", "B5"), "A", "pump16"],
  [sway("A5", "F5", "D6", "C6"), "Dm", "toll16"],
  [sway("Bb5", "F5", "D6", "C6"), "Bb", "pump16"],
  [sway("Bb5", "Gb5", "Eb6", "Db6"), "Ebm", "toll16"],
  [sway("B5", "F#5", "D#6", "C#6"), "B", "pump16"],
];
/* Held chords without drums, E flat minor against B. */
const S_HELD: Bar[] = [
  ["Bb5 - - - - - - - - - - - - - - -", "Ebm", "hold16", "Gb4 - - - - - - - Eb4 - - - - - - -"],
  ["B5 - - - - - - - - - - - F#5 - - -", "B", "hold16", "D#4 - - - - - - - B3 - - - - - - -"],
  ["Gb5 - - - - - - - - - - - Bb5 - - -", "Ebm", "hold16", "Eb4 - - - - - - - Gb4 - - - - - - -"],
  ["D#6 - - - - - - - - - - - B5 - - -", "B", "hold16", "F#4 - - - - - - - D#4 - - - - - - -"],
  ["G#5 - - - - - - - - - - - B5 - - -", "E", "hold16", "E4 - - - - - - - G#4 - - - - - - -"],
  ["F#5 - - - - - - - - - - - D#5 - - -", "B", "hold16", "B3 - - - - - - - D#4 - - - - - - -"],
  ["D5 - - - - - - - - - - - G5 - - -", "G", "hold16", "B3 - - - - - - - D4 - - - - - - -"],
  ["A#5 - - - - - - - C#6 - - - . . . .", "F#7", "hold16", "E4 - - - - - - - F#4 - - - . . . ."],
];
/* The push: the whole band on one rhythm in B minor, 3+2+3+2+2+... (hits on 0, 3, 5, 8, 10, 12). */
const PUSH_KIT = "k . . ks . k . . ks . k . ks . h h";
const push = (lead: string, chord: string, bass: string, kit = PUSH_KIT): [Bar, BarPerformance] => [[lead, chord, "pump16", RIDE], { kit, bass, gate: 0.5 }];
const S_PUSH: [Bar, BarPerformance][] = [
  push("D6 . . D6 . C#6 . . D6 . F#6 . D6 . . .", "Bm", "B2 . . B2 . A2 . . B2 . D3 . B2 . . ."),
  push("D6 . . D6 . E6 . . F#6 . E6 . D6 . . .", "Bm", "B2 . . B2 . A2 . . B2 . D3 . B2 . . ."),
  push("B5 . . B5 . D6 . . G6 . F#6 . D6 . . .", "G", "G2 . . G2 . F#2 . . G2 . B2 . G2 . . ."),
  push("C#6 . . C#6 . E6 . . A6 . G6 . E6 . . .", "A", "A2 . . A2 . G2 . . A2 . C#3 . A2 . . ."),
  push("F#6 . . F#6 . E6 . . D6 . C#6 . B5 . . .", "Bm", "B2 . . B2 . A2 . . B2 . D3 . B2 . . ."),
  push("D6 . . D6 . C#6 . . B5 . A5 . F#5 . . .", "Bm", "B2 . . B2 . A2 . . B2 . D3 . B2 . . ."),
  push("G5 . . G5 . B5 . . E6 . D6 . B5 . . .", "Em", "E2 . . E2 . D2 . . E2 . G2 . E2 . . ."),
  push("A#5 . . A#5 . C#6 . . E6 . . . F#6 - - -", "F#7", "F#2 . . F#2 . E2 . . F#2 . . . F#2 - - -", "k . . ks . k . . s s s s s s s s"),
];
/* Down a minor third, to G sharp minor, and D sharp 7 to turn back to the dominant of A minor. */
const S_GSHARP: Bar[] = [
  ["D#6 - - - - - E6 D#6 C#6 - B5 - G#5 - - -", "G#m", "toll16"],
  ["B5 - - - - - C#6 B5 G#5 - E5 - G#5 - B5 -", "E", "pump16"],
  ["D#6 - - - F#6 - - - G#6 - - - F#6 - D#6 -", "G#m", "toll16"],
  ["C#6 - - - A#5 - - - G5 - - - D#5 - - -", "D#7", "chrom16"],
];
/* The ostinato to close, down to the run that leads back to the theme. */
const S_CODA: Bar[] = [
  cascade("Am", "toll16", "A3 - - - - - - - E4 - - - - - - -"),
  cascade("F", "pump16", "A3 - - - - - - - C4 - - - - - - -"),
  cascade("Dm", "toll16", "A3 - - - - - - - D4 - - - - - - -"),
  cascade("Bb", "pump16", "Bb3 - - - - - - - D4 - - - - - - -"),
  cascade("Am", "toll16", "C4 - - - - - - - E4 - - - - - - -"),
  ["E5 F5 E5 D#5 E5 F5 G5 G#5 A5 A#5 B5 C6 B5 - - -", "E7", "hits16", "G#3 - - - - - - - B3 - - - D4 - - -"],
];

const S_PARTS: [Bar, BarPerformance?][] = [
  ...S_INTRO.map((b): [Bar] => [b]), ...S_THEME.map((b): [Bar] => [b]), ...S_PEDAL.map((b): [Bar] => [b]), ...S_MINOR3.map((b): [Bar] => [b]),
  ...S_TRADE.map((b): [Bar] => [b]), ...S_PULSE.map((b): [Bar] => [b]), ...S_CHAIN.map((b): [Bar] => [b]), ...S_HELD.map((b): [Bar] => [b]),
  ...S_PUSH, ...S_GSHARP.map((b): [Bar] => [b]), ...S_THEME.map((b): [Bar] => [b]), ...S_CODA.map((b): [Bar] => [b]),
];
const ST = { theme: 12, pedal: 20, minor3: 28, trade: 36, pulse: 42, chain: 50, held: 62, push: 70, gsharp: 78, theme2: 82, coda: 90 };

const SANCTUM_OF_THORNS: Song = {
  bpm: 140, lead: "organ", layer: "strings", pad: "strings", counter: "piano", drums: "battle", riff: "toll16", intro: ST.theme,
  fills: [ST.theme - 1, ST.pedal - 1, ST.minor3 - 1, ST.trade - 1, ST.pulse - 1, ST.chain - 1, ST.gsharp - 1, ST.theme2 - 1, ST.coda - 1, S_PARTS.length - 1],
  crashes: [ST.theme, ST.pedal, ST.minor3, ST.trade, ST.pulse, ST.chain, ST.push, ST.gsharp, ST.theme2, ST.coda],
  riser: [ST.held + 6, ST.held + 7],
  sections: [
    { from: 0, lead: "piano", layer: undefined, pad: undefined, counter: "piano", drums: "none", stabs: false },
    { from: 4, lead: "piano", layer: undefined, pad: "organ", counter: "piano", drums: "none", stabs: false },
    { from: ST.theme, lead: "organ", layer: "strings", pad: "strings", counter: "piano" },
    { from: ST.pedal, lead: "piano", layer: "organ", pad: "strings", counter: undefined, drums: "march" },
    { from: ST.minor3, lead: "brass", layer: "organ", pad: "strings", stabs: true },
    { from: ST.minor3 + 4, lead: "piano", layer: "organ", pad: "strings", stabs: false },
    { from: ST.trade, lead: "piano", layer: "organ", pad: "organ", counter: "brass", stabs: true },
    { from: ST.pulse, lead: "brass", layer: "strings", pad: undefined, counter: "piano", stabs: false },
    { from: ST.chain, lead: "organ", layer: "piano", pad: "strings", counter: undefined, stabs: false },
    { from: ST.held, lead: "bell", layer: "strings", pad: "organ", counter: "strings", drums: "none", stabs: false },
    { from: ST.push, lead: "brass", layer: "organ", pad: undefined, counter: undefined, stabs: true, bassVoice: "picked" },
    { from: ST.gsharp, lead: "strings", layer: "violin", pad: "organ", stabs: false },
    { from: ST.theme2, lead: "organ", layer: "brass", pad: "strings", counter: "piano", stabs: true },
    { from: ST.coda, lead: "piano", layer: "organ", pad: "organ", counter: "brass", stabs: false },
  ],
  bars: S_PARTS.map(([bar]) => bar),
  performance: S_PARTS.map(([, perf]) => perf ?? {}),
};

export const SELF_TITLED: Record<SelfTitledTrack, Song> = {
  "self:battle1": WANDERING_BLADE,
  "self:battle2": SANCTUM_OF_THORNS,
};
