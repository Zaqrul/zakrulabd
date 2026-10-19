/* Space 3's music, rewritten in the manner of the Space 2 expansion (space2-ascension.ts): each tune is a few original four-bar
   themes (an A, a B that answers it, a C that breaks away, sometimes a D), each bar with its own chord, put in an order, with the
   key lifting on the return, and the band changing with the part (organ and strings, brass and trumpet, a violin answer, a guitar
   break). The counter-line under each bar is written the way the expansion writes its own, from the bar's chord (answerLine).
   The tunes are in different keys, tempos and meters (4/4, 7/8 and 6/8), and no two share a theme.

     Gate in the Dark     F# minor 92     organ and strings, a chant that opens into A major
     Hangar: Before the Gate  E major 84 in 6/8, harp and bells
     Battle: Phobos Run   A minor 168     trumpet over organ, a guitar break, the key lifting a tone
     Battle: Ceres Foundry  C minor 128 in 6/8, brass hammering, then F minor
     Battle: Cryo-Crags   B minor 140 in 7/8, guitar over strings, bells like cracking ice
     Battle: Kharn Wreckage  G# minor 72  a slow dirge on organ, strings and violin
     Warning: Ghost Signal  Bb minor 100 in 7/8, strings and bell
     Ghost Corvet         E minor 160     organ and bell, a chromatic answer and a run
     Excavator-X          F minor 120 in 6/8, a brass stomp and a drill
     Abyssal Wyrm         G minor 152 in 7/8, a violin coiling by half steps
     Armada Reclaimer     C minor 176     trumpet march, ending a step higher in D minor
     Sortie Complete      G major 112     a brass fanfare that hands on to the hangar

   Notation is Space 2's (space2-music.ts). Every tune is written for this game. Nothing here copies a note from another tune. */
import type { Song } from "./space2-music";
import { answerLine, riffFor, type Profile } from "./space2-ascension.ts";
import { MELODY } from "./space3-melodies.ts";

export type BaseSpace3Track = "s3title" | "s3hangar" | "s3stage1" | "s3stage2" | "s3stage3" | "s3stage4" | "s3alert" | "s3boss1" | "s3boss2" | "s3boss3" | "s3boss4" | "s3victory";

type Bar = Song["bars"][number];
type Part = [lead: string, chord: string][];
type Section = Omit<NonNullable<Song["sections"]>[number], "from">;

const PC: Record<string, number> = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const noteName = (m: number) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
const NOTE = /^([A-G][#b]?)(\d)$/;

/* A line or a chord moved by `n` semitones: the way a part returns in a new key. */
const shiftLine = (line: string, n: number) => line.trim().split(/\s+/).map((c) => {
  const m = NOTE.exec(c);
  return m ? noteName(PC[m[1]] + (Number(m[2]) + 1) * 12 + n) : c;
}).join(" ");
const shiftChord = (chord: string, n: number) => {
  const m = /^([A-G][#b]?)(.*)$/.exec(chord)!;
  return `${NAMES[(((PC[m[1]] + n) % 12) + 12) % 12]}${m[2]}`;
};

type Spec = {
  profile: Profile;
  parts: Record<string, Part>;
  /* Parts in order; "A+2" is part A a whole tone higher. */
  form: string[];
  /* The bass riff of each part (by name), otherwise the mood's own. */
  riffs?: Record<string, string>;
  /* Band changes at the start of a form entry (index into `form`). */
  sections?: [at: number, change: Section][];
  layer?: Song["layer"];
  stabs?: boolean;
  drums: Song["drums"];
  bassVoice?: Song["bassVoice"];
  once?: boolean;
  then?: Song["then"];
  /* Rearranged after Kenji Ito all the way through: the opening theme too runs on his bass and the strings' arpeggios. */
  ito?: boolean;
};

/* Space 3's DNA. Every tune opens on the Outer Gate motif in its own key (the root, its fifth, the octave held, then the flat seventh
   falling back through the fifth and fourth), and every tune that loops ends its round on the cadence Kenji Ito's SaGa scores turn on:
   the flat sixth, the flat seventh, and home in the major. In the battles the bass runs his syncopated octaves and the strings run
   sixteenth-note arpeggios through the answering parts. */
const DNA_RHYTHM: Record<number, string> = { 16: "X . X . X - - - X - X - X - X -", 14: "X . X . X - - X - X - X - -", 12: "X . X . X - - X . X - -" };
const DNA_NOTES = [0, 7, 12, 10, 7, 5, 7];
const TAG_RHYTHM: Record<number, [string, string]> = {
  16: ["X - - - - - - - X - - - X - - -", "X - - - - - X - - - - - - - . ."],
  14: ["X - - - - X - - - X - - - -", "X - - - - - X - - - - - . ."],
  12: ["X - - - X - - - X - - -", "X - - - - - X - - - . ."],
};
const fill = (rhythm: string, notes: number[], base: number) => { let i = 0; return rhythm.split(" ").map((c) => (c === "X" ? noteName(base + notes[i++]) : c)).join(" "); };
const ITO_RIFF: Record<number, string> = { 16: "ito16", 14: "ito14", 12: "ito12" };

function dna(firstChord: string, meter: number) {
  const m = /^([A-G][#b]?)/.exec(firstChord)!, pc = PC[m[1]];
  let base = 60 + pc;
  if (base < 64) base += 12;
  const tonic = NAMES[pc];
  const intro: [string, string] = [fill(DNA_RHYTHM[meter], DNA_NOTES, base), firstChord];
  const [hold, end] = TAG_RHYTHM[meter];
  const tag: [string, string][] = [
    [fill(hold, [12, 15, 20], base - 12), NAMES[(pc + 8) % 12]],
    [fill(hold, [14, 17, 22], base - 12), NAMES[(pc + 10) % 12]],
    [fill(end, [19, 24], base - 12), tonic],
  ];
  return { intro, tag };
}

/* Every Space 3 tune is arranged after Kenji Ito's Romancing SaGa scores and Space 2's bonus tracks (Final Extremity and the rest):
     - a riser into the motif, the Outer Gate motif to open, the SaGa cadence (flat six, flat seven, home in the major) to close;
     - in the battles his syncopated octave bass under every part, a written counter under the opening theme and sixteenth-note string
       arpeggios under the answering parts, brass stabbing on the 3+3+2 accents;
     - in the quiet tunes the harp or strings arpeggiate in eighths under the answering parts;
     - and, like the bonus tracks, every battle runs long: after the written form comes a development, a breakdown on organ and slap bass
       with the drums down, then the themes again a minor third higher with the band changed, and the opener once more at the top. */
export function compose(spec: Spec): Song {
  const { profile: p } = spec;
  const fierce = p.mood === "battle" || p.mood === "anger";
  const driving = fierce || p.mood === "heroic";
  const starts: number[] = [];
  const source: { bar: Bar; part: string }[] = [];
  const firstKey = /^([A-Z])/.exec(spec.form[0])![1];
  const firstPart = spec.parts[firstKey];
  const meter = firstPart[0][0].trim().split(/\s+/).length;
  const motif = dna(firstPart[0][1], meter);
  source.push({ bar: motif.intro, part: "dna" });
  /* The development a battle gets after its written form (none for a jingle or a tune that plays once). */
  const keys = [...new Set(spec.form.map((e) => /^([A-Z])/.exec(e)![1]))];
  const development = driving && !spec.once && spec.form.length >= 4 ? [firstKey, `${keys[1] ?? firstKey}+3`, `${keys[2] ?? keys[1] ?? firstKey}+3`, `${firstKey}+3`] : [];
  const form = [...spec.form, ...development];
  for (const entry of form) {
    const m = /^([A-Z])([+-]\d+)?$/.exec(entry)!;
    const shift = Number(m[2] ?? 0), part = spec.parts[m[1]];
    if (!part) throw new Error(`space3-orchestra: no part ${m[1]}`);
    starts.push(source.length);
    for (const [lead, chord] of part) source.push({ bar: [shift ? shiftLine(lead, shift) : lead, shift ? shiftChord(chord, shift) : chord], part: m[1] });
  }
  if (!spec.once) for (const bar of motif.tag) source.push({ bar, part: "tag" });
  const breakdownFrom = development.length ? starts[spec.form.length] : -1, breakdownTo = development.length ? starts[spec.form.length + 1] : -1;
  const bars: Bar[] = source.map(({ bar, part }, i) => {
    const n = bar[0].trim().split(/\s+/).length;
    const chord = p.mood === "quiet" && /^[A-G][#b]?$/.test(bar[1]) ? `${bar[1]}maj7` : bar[1];
    const framing = part === "dna" || part === "tag";
    const breakdown = i >= breakdownFrom && i < breakdownTo;
    const riff = part === "dna" ? (n === 16 ? "hits16" : n === 14 ? "throb14" : "hold12")
      : part === "tag" ? (n === 16 ? "pulse16" : n === 14 ? "throb14" : "hold12")
      : breakdown ? (n === 16 ? "slap16" : n === 14 ? "seven14" : "six12")
      : driving && !spec.riffs?.[part]?.startsWith("hold") ? ITO_RIFF[n]
      : spec.riffs?.[part] ?? riffFor(n, p.mood, i >= source.length / 2);
    /* The opening theme keeps a written counter; the answering parts leave it to the arpeggios. */
    const arpeggio = !framing && part !== firstKey && !spec.once;
    return arpeggio ? [bar[0], chord, riff] : [bar[0], chord, riff, answerLine(bar, p, i)];
  });
  const base = form.length - development.length;
  const devSections: [number, Section][] = development.length ? [
    [base, { lead: "organ", layer: undefined, pad: "strings", counter: "organChord", drums: "soft", bassVoice: "slap", stabs: false }],
    [base + 1, { lead: p.lead === "brass" ? "trumpet" : "brass", layer: "violin", pad: "organ", counter: p.counter, drums: spec.drums, bassVoice: "picked", stabs: true }],
    [base + 2, { lead: "guitar", layer: p.lead === "brass" ? "trumpet" : "brass", stabs: true }],
    [base + 3, { lead: p.lead, layer: "strings", pad: p.pad, stabs: true }],
  ] : [];
  const allSections = [...(spec.sections ?? []), ...devSections];
  const sections = allSections.length ? [{ from: 0 } as NonNullable<Song["sections"]>[number], ...allSections.map(([at, change]) => ({ from: starts[at], ...change }))] : undefined;
  const crashes = starts.slice(1);
  return {
    bpm: p.bpm, lead: p.lead, pad: p.pad, counter: p.counter, layer: spec.layer, bassVoice: spec.bassVoice,
    arps: !spec.once, arpStep: driving ? 1 : 2,
    stabs: spec.stabs ?? driving, drums: spec.drums, riff: "pulse16", bars, sections,
    crashes: driving ? crashes : undefined,
    fills: driving ? crashes.map((x) => x - 1) : undefined,
    riser: spec.once ? undefined : [0, 0],
    once: spec.once, then: spec.then,
  };
}

/* ---------- Gate in the Dark: F# minor, an organ chant on a march, opening into A major ----------
   Arranged like the Space 2 expansion's title: the march kit under the whole of it, a fill at the end of every four-bar phrase and a
   crash opening the next, a hit-bar intro, the brass stabbing on the accents, a driving organ figure between the chant and its answer,
   and one quiet break with the drums down before the last climb. */
const TITLE_SONG = compose({
  profile: { bpm: 100, lead: "organ", pad: "strings", counter: "violin", mood: "dark", answer: "0 - - - - - 1 - 0 - - - 4 - . ." },
  parts: MELODY.TITLE,
  form: ["I", "A", "E", "B", "A", "C", "D", "E", "B", "A"],
  riffs: { I: "hits16", A: "march16", E: "pump16", B: "march16", C: "hold16", D: "slap16" },
  sections: [
    [1, { lead: "organ", pad: "strings", counter: "violin" }],
    [2, { lead: "organ", layer: "brass", stabs: true, bassVoice: "picked" }],
    [3, { lead: "brass", layer: "violin", stabs: true }],
    [4, { lead: "organ", layer: "strings", stabs: false }],
    [5, { lead: "violin", layer: undefined, pad: "harp", counter: "piano", drums: "soft", stabs: false }],
    [6, { lead: "strings", pad: "organ", counter: "violin", drums: "march" }],
    [7, { lead: "organ", layer: "brass", stabs: true, bassVoice: "picked" }],
    [8, { lead: "brass", layer: "violin", pad: "strings", stabs: true }],
    [9, { lead: "organ", layer: "brass", stabs: false }],
  ],
  drums: "march", stabs: true, bassVoice: "synth",
});
/* A fill closes every four-bar phrase and a crash opens the next, except around the quiet break. */
const TITLE: Song = {
  ...TITLE_SONG,
  fills: Array.from({ length: Math.floor(TITLE_SONG.bars.length / 4) }, (_, i) => 4 + i * 4).filter((bar) => bar < TITLE_SONG.bars.length && (bar < 18 || bar > 22)),
  crashes: Array.from({ length: Math.floor(TITLE_SONG.bars.length / 4) }, (_, i) => 1 + i * 4).filter((bar) => bar < TITLE_SONG.bars.length && (bar < 18 || bar > 22)),
};

/* ---------- Hangar: Before the Gate: E major in six, harp and bells ---------- */
const HANGAR = compose({
  profile: { bpm: 84, lead: "harp", pad: "strings", counter: "bell", mood: "quiet", answer: "4 - - - 2 - - - 0 - - - 1 - . ." },
  parts: MELODY.HANGAR,
  form: ["A","B","C","D","A","B"],
  riffs: { A: "waltz12", B: "hold12", C: "waltz12", D: "hold12" },
  sections: [[1, { lead: "violin", pad: "harp", counter: "bell" }], [2, { lead: "piano", pad: "strings", counter: "harp" }], [3, { lead: "bell", pad: "harp", counter: "violin" }], [4, { lead: "harp", pad: "strings", counter: "bell" }], [5, { lead: "strings", pad: "harp" }]],
  drums: "soft",
});

/* ---------- Battle: Phobos Run: A minor, trumpet over organ, the key lifting a tone ---------- */
const PHOBOS = compose({
  profile: { bpm: 153, lead: "trumpet", pad: "organ", counter: "guitar", mood: "anger", answer: "0 - . 0 - . 1 - 4 - - 3 - 2 - ." },
  parts: MELODY.PHOBOS,
  form: ["A","B","A","C","D","B","A+2","B+2"],
  riffs: { A: "slap16", B: "gallop16", C: "hits16", D: "drive16" },
  sections: [[1, { layer: "organ" }], [3, { lead: "guitar", pad: undefined, layer: undefined, counter: "piano", stabs: false }], [4, { lead: "guitar", layer: "organ", pad: "organ", counter: "piano", stabs: false }], [5, { lead: "trumpet", layer: "violin", pad: "strings", counter: "guitar", stabs: true }], [6, { lead: "violin", layer: "trumpet", pad: "organ" }], [7, { lead: "trumpet", layer: "violin", pad: "strings" }]],
  ito: true,
  drums: "battle", bassVoice: "picked",
});

/* ---------- Battle: Ceres Foundry: C minor in six, brass hammering, then F minor ---------- */
const FOUNDRY = compose({
  profile: { bpm: 128, lead: "brass", pad: "organ", counter: "lead", mood: "anger", answer: "0 - - 0 - - 2 - 1 - - 4 - . . ." },
  parts: MELODY.FOUNDRY,
  form: ["A","B","A","C","D","B","A+2","B+2"],
  riffs: { A: "six12", B: "six12", C: "hold12", D: "six12" },
  sections: [[1, { layer: "organ" }], [3, { lead: "organ", pad: "strings", layer: undefined, stabs: false, counter: "bell" }], [4, { lead: "guitar", pad: "organ", layer: "brass", stabs: true, counter: "lead" }], [5, { lead: "brass", layer: "lead", pad: "organ", counter: "lead" }], [6, { lead: "guitar", layer: "brass" }], [7, { lead: "brass", layer: "organ" }]],
  ito: true,
  drums: "battle", bassVoice: "slap",
});

/* ---------- Battle: Cryo-Crags: B minor in seven, guitar over strings, bells like cracking ice ---------- */
const CRYO = compose({
  profile: { bpm: 140, lead: "guitar", pad: "strings", counter: "bell", mood: "battle", answer: "4 - . 2 - . 0 - 1 - 2 - 4 - ." },
  parts: MELODY.CRYO,
  form: ["A","B","A","C","D","B","A+5","B+5"],
  riffs: { A: "seven14", B: "seven14", C: "throb14", D: "seven14" },
  sections: [[1, { layer: "violin" }], [3, { lead: "bell", pad: "strings", layer: undefined, counter: "piano", stabs: false }], [4, { lead: "guitar", pad: "organ", layer: "strings", counter: "bell", stabs: true }], [5, { lead: "guitar", layer: "violin", counter: "bell" }], [6, { lead: "violin", layer: "guitar", pad: "organ" }], [7, { lead: "guitar", layer: "violin", pad: "strings" }]],
  ito: true,
  drums: "battle", bassVoice: "picked",
});

/* ---------- Battle: Kharn Wreckage: G# minor, a slow dirge ---------- */
const KHARN = compose({
  profile: { bpm: 72, lead: "organ", pad: "strings", counter: "violin", mood: "ruin", answer: "0 - - - - - 2 - 1 - - - 0 - . ." },
  parts: MELODY.KHARN,
  form: ["A","B","A","C","D","B","C","A"],
  riffs: { A: "ostinato16", B: "pulse16", C: "hold16", D: "pedal16" },
  sections: [[1, { lead: "strings", pad: "organ", counter: "violin" }], [3, { lead: "violin", pad: "strings", counter: "piano" }], [4, { lead: "bell", pad: "strings", counter: "organ" }], [5, { lead: "organ", layer: "violin", pad: "strings" }], [6, { lead: "strings", layer: "organ", counter: "bell" }], [7, { lead: "organ", layer: "strings", pad: "strings" }]],
  drums: "toms",
});

/* ---------- Warning: Ghost Signal: B-flat minor in seven, strings and bell ---------- */
const ALERT = compose({
  profile: { bpm: 100, lead: "strings", pad: "organ", counter: "bell", mood: "dread", answer: ". . . . 4 - - - - - . . 2 - . ." },
  parts: MELODY.ALERT,
  form: ["A","B","C","A"],
  riffs: { A: "throb14", B: "seven14", C: "throb14", D: "throb14" },
  sections: [[1, { lead: "violin", pad: "strings", counter: "bell" }], [2, { lead: "bell", pad: "organ", counter: "violin" }], [3, { lead: "strings", pad: "organ" }]],
  drums: "toms",
});

/* ---------- Ghost Corvet: E minor, organ and bell, a chromatic answer and a run ---------- */
const echoed = (line: string, by: number) => {
  const cells = line.trim().split(/\s+/);
  return [...Array<string>(by).fill("."), ...cells.slice(0, cells.length - by)].map((c, i, all) => (c === "-" && (i === 0 || all[i - 1] === ".") ? "." : c)).join(" ");
};
const CORVET_PARTS = MELODY.GHOST;
const GHOST = (() => {
  const song = compose({
    profile: { bpm: 145, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 - . 0 - . 1 - 4 - - 3 - 2 - ." },
    ito: true,
    parts: CORVET_PARTS,
    form: ["A", "B", "C", "D", "A", "B", "C+2"],
    riffs: { A: "slap16", B: "chrom16", C: "gallop16", D: "hold16" },
    sections: [[1, { layer: "bell" }], [2, { lead: "guitar", layer: "organ", counter: "bell" }], [3, { lead: "violin", layer: undefined, pad: "strings", counter: "organ" }], [4, { lead: "organ", layer: "violin" }], [5, { lead: "organ", layer: "bell", counter: "violin" }], [6, { lead: "guitar", layer: "organ", pad: "organ" }]],
    drums: "battle", bassVoice: "picked",
  });
  /* The copy: in the A and B parts the counter is the lead itself, a beat late. */
  return { ...song, bars: song.bars.map((b, i): Bar => ((i >= 1 && i < 9) || (i >= 17 && i < 25) ? [b[0], b[1], b[2], echoed(b[0], 4)] : b)) } as Song;
})();

/* ---------- Excavator-X: F minor in six, a brass stomp and a drill ---------- */
const EXCAVATOR = compose({
  profile: { bpm: 120, lead: "brass", pad: "organ", counter: "organ", mood: "battle", answer: "0 - - 0 - - 4 - 2 - - 0 - . . ." },
  parts: MELODY.EXCAVATOR,
  form: ["A", "B", "A", "C", "D", "B", "C+5", "A+5"],
  riffs: { A: "six12", B: "six12", C: "hold12", D: "six12" },
  sections: [[1, { layer: "organ" }], [3, { lead: "trumpet", pad: "organ", layer: "brass", stabs: false, counter: "bell" }], [4, { lead: "organ", layer: "brass", pad: "strings", stabs: true }], [5, { lead: "brass", layer: "organ", stabs: true }], [6, { lead: "organ", layer: "brass", pad: "strings" }], [7, { lead: "brass", layer: "trumpet", pad: "organ" }]],
  ito: true,
  drums: "battle", bassVoice: "slap",
});

/* ---------- Abyssal Wyrm: G minor in seven, a violin coiling by half steps ---------- */
const WYRM = compose({
  profile: { bpm: 152, lead: "violin", pad: "organ", counter: "lead", mood: "battle", answer: "2 - 1 - 0 - . . 4 - 3 - 2 - ." },
  parts: MELODY.WYRM,
  form: ["A","B","A","C","D","B","A+2","C+2"],
  riffs: { A: "seven14", B: "throb14", C: "seven14", D: "throb14" },
  sections: [[1, { layer: "organ" }], [3, { lead: "guitar", pad: "strings", layer: undefined, stabs: false }], [4, { lead: "violin", layer: "bell", pad: "organ", counter: "violin", stabs: false }], [5, { lead: "violin", layer: "guitar", pad: "organ", stabs: true }], [6, { lead: "trumpet", layer: "violin" }], [7, { lead: "guitar", layer: "violin", pad: "strings" }]],
  ito: true,
  drums: "battle", bassVoice: "picked",
});

/* ---------- Armada Reclaimer: C minor, a trumpet march that ends a step higher ---------- */
const RECLAIMER = compose({
  profile: { bpm: 161, lead: "trumpet", pad: "organ", counter: "guitar", mood: "battle", answer: "4 - . 3 - 2 - . 0 - 1 - 2 - . ." },
  parts: MELODY.RECLAIMER,
  form: ["A","B","A","B","D","C","A+2","C"],
  riffs: { A: "march16", B: "pump16", C: "gallop16", D: "hold16" },
  sections: [[1, { layer: "organ" }], [2, { lead: "guitar", layer: "trumpet", pad: "strings", stabs: false }], [3, { lead: "trumpet", layer: "violin", pad: "organ", stabs: true }], [4, { lead: "strings", layer: "trumpet", pad: "organ", counter: "bell", stabs: false }], [5, { lead: "trumpet", layer: "brass", pad: "organ", counter: "bell", stabs: true }], [6, { lead: "organ", layer: "trumpet", pad: "strings" }], [7, { lead: "trumpet", layer: "brass", pad: "organ" }]],
  ito: true,
  drums: "battle", bassVoice: "picked",
});

/* ---------- Sortie Complete: G major, a brass fanfare that hands on to the hangar ---------- */
const VICTORY = compose({
  profile: { bpm: 112, lead: "brass", pad: "organ", counter: "strings", mood: "heroic", answer: "0 - - - 2 - - - 4 - - - 2 - . ." },
  parts: MELODY.VICTORY,
  form: ["A"],
  riffs: { A: "march16" },
  drums: "march", stabs: true, once: true, then: "s3hangar",
});

export const SPACE3_BASE_SONGS: Record<BaseSpace3Track, Song> = {
  s3title: TITLE, s3hangar: HANGAR, s3stage1: PHOBOS, s3stage2: FOUNDRY, s3stage3: CRYO, s3stage4: KHARN, s3alert: ALERT,
  s3boss1: GHOST, s3boss2: EXCAVATOR, s3boss3: WYRM, s3boss4: RECLAIMER, s3victory: VICTORY,
};
