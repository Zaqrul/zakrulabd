/* The rest of Space 3's soundtrack, written against Space 2's and the Ascension album's (space2-music.ts, space2-ascension.ts), bonus
   tracks included: the cues Space 2 has that Space 3 lacked (two more hangars, the take-off, two more warnings, the pause, the game over,
   the ending), a battle and a boss for each of chapters 5 to 12 with the bosses switching meter like Space 2's (4/4 into 7/8 and back),
   the Herald's three phases like Atlas's, and two long bonus pieces in the manner of Final Extremity. Every melody is new.

   Bars are written as a rhythm and the notes to put in it (`b`), so a bar always has the right number of cells. Notation as in
   space2-music.ts. */
import type { Song } from "./space2-music";
import { compose } from "./space3-orchestra.ts";
import { MELODY } from "./space3-melodies.ts";

/* ---------- the cues ---------- */

/* Hangar: Night Watch. A waltz on the harp, A major, the ship being fuelled. */
const HANGAR2 = compose({
  profile: { bpm: 104, lead: "harp", pad: "strings", counter: "bell", mood: "quiet", answer: "4 - - 2 - - 0 - - 1 - - 2 - . ." },
  parts: MELODY.HANGAR2,
  form: ["A", "B", "A", "B"],
  riffs: { A: "waltz12", B: "hold12" },
  sections: [[1, { lead: "violin", pad: "harp" }], [2, { lead: "piano", pad: "strings" }], [3, { lead: "harp", pad: "strings", counter: "violin" }]],
  drums: "waltz",
});

/* Hangar: Before the Long Dark. An organ nocturne in D minor, in six. */
const HANGAR3 = compose({
  profile: { bpm: 88, lead: "organ", pad: "strings", counter: "piano", mood: "ruin", answer: "0 - - - - - 2 - - 1 - - - - . ." },
  parts: MELODY.HANGAR3,
  form: ["A", "B", "A", "B"],
  riffs: { A: "hold12", B: "hold12" },
  sections: [[1, { lead: "strings", pad: "organ" }], [2, { lead: "organ", pad: "strings", counter: "violin" }]],
  drums: "soft",
});

/* Take-off: the catapult fires. Two bars of brass, once. */
const FANFARE = compose({
  profile: { bpm: 176, lead: "brass", pad: "strings", counter: "trumpet", mood: "heroic", answer: "0 . 0 . 0 . 1 . 0 - - - . . . ." },
  parts: MELODY.FANFARE,
  form: ["A"],
  riffs: { A: "hits16" },
  drums: "none", stabs: true, once: true,
});

/* Warning: Deep Signal. Organ over toms, C minor. */
const ALERT2 = compose({
  profile: { bpm: 116, lead: "organ", pad: "strings", counter: "bell", mood: "dread", answer: "0 - - - - - . . 1 - 0 - - - . ." },
  parts: MELODY.ALERT2,
  form: ["A", "B", "A"],
  riffs: { A: "ostinato16", B: "pulse16" },
  sections: [[1, { lead: "strings", pad: "organ" }], [2, { lead: "organ", pad: "strings" }]],
  drums: "toms",
});

/* Warning: Event Horizon. Strings in seven, F# minor. */
const ALERT3 = compose({
  profile: { bpm: 92, lead: "strings", pad: "organ", counter: "bell", mood: "dread", answer: "4 - - - . . 3 - 2 - - - . . 1 -" },
  parts: MELODY.ALERT3,
  form: ["A", "B", "A"],
  riffs: { A: "throb14", B: "seven14" },
  sections: [[1, { lead: "violin", pad: "strings" }], [2, { lead: "strings", pad: "organ" }]],
  drums: "toms",
});

/* Pause: Drifting. Bell over harp. */
const PAUSE = compose({
  profile: { bpm: 72, lead: "bell", pad: "harp", counter: "strings", mood: "quiet", answer: "2 - - - - - - - 1 - - - - - - -" },
  parts: MELODY.PAUSE,
  form: ["A", "B"],
  riffs: { A: "hold16", B: "hold16" },
  drums: "none",
});

/* Game over: Signal Lost Beyond the Sun. Two bars, once. */
const GAMEOVER = compose({
  profile: { bpm: 66, lead: "strings", pad: "organ", counter: "piano", mood: "sad", answer: "4 - - - - - - - 3 - - - - - - -" },
  parts: MELODY.GAMEOVER,
  form: ["A"],
  riffs: { A: "hold16" },
  drums: "none", once: true,
});

/* Ending: Through the Gate. Brass over strings, the gate open behind it. */
const ENDING = compose({
  profile: { bpm: 100, lead: "brass", pad: "strings", counter: "violin", mood: "heroic", answer: "0 - - - 2 - - - 4 - - - 2 - . ." },
  parts: MELODY.ENDING,
  form: ["A", "B", "C", "A", "B+2"],
  riffs: { A: "march16", B: "march16", C: "hold16" },
  sections: [[1, { layer: "trumpet" }], [2, { lead: "strings", pad: "harp", layer: undefined }], [3, { lead: "brass", pad: "strings" }], [4, { lead: "trumpet", layer: "brass" }]],
  drums: "march",
});

/* ---------- chapters 5 to 12: battles ---------- */

const STAGE5 = compose({ /* Uranian Shear: E minor in seven, a synth lead over strings, bells in the storm. */
  profile: { bpm: 150, lead: "lead", pad: "strings", counter: "bell", mood: "battle", answer: "4 - . 2 - . 0 - 1 - 2 - 4 - . ." },
  parts: MELODY.STAGE5,
  form: ["A", "B", "A", "C", "B", "A+5", "B+5"],
  riffs: { A: "seven14", B: "throb14", C: "seven14" },
  sections: [[1, { layer: "violin" }], [3, { lead: "guitar", layer: undefined, counter: "piano", stabs: false }], [4, { lead: "lead", layer: "violin", stabs: true }], [5, { lead: "violin", layer: "lead" }], [6, { lead: "lead", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

const STAGE6 = compose({ /* Triton Geysers: D minor in six, brass over organ. */
  profile: { bpm: 134, lead: "brass", pad: "organ", counter: "guitar", mood: "anger", answer: "0 - - 0 - - 2 - 1 - - 4 - . . ." },
  parts: MELODY.STAGE6,
  form: ["A", "B", "A", "C", "B", "A+2", "B+2"],
  riffs: { A: "six12", B: "six12", C: "hold12" },
  sections: [[1, { layer: "organ" }], [3, { lead: "organ", layer: undefined, pad: "strings", stabs: false }], [4, { lead: "brass", layer: "trumpet", stabs: true }], [5, { lead: "guitar", layer: "brass" }], [6, { lead: "brass", layer: "organ" }]],
  drums: "battle", bassVoice: "slap",
});

const STAGE7 = compose({ /* The Kuiper Graveyard: B minor, a slow march through the wrecks on strings. */
  profile: { bpm: 96, lead: "strings", pad: "organ", counter: "violin", mood: "ruin", answer: "0 - - - - - 2 - 1 - - - 0 - . ." },
  parts: MELODY.STAGE7,
  form: ["A", "B", "A", "C", "B", "C", "A"],
  riffs: { A: "ostinato16", B: "pulse16", C: "hold16" },
  sections: [[1, { lead: "violin", pad: "strings" }], [3, { lead: "organ", pad: "strings", counter: "bell" }], [4, { lead: "strings", layer: "violin" }], [5, { lead: "violin", layer: "organ" }], [6, { lead: "strings", layer: undefined }]],
  drums: "toms",
});

const STAGE8 = compose({ /* The Heliopause Threshold: A major, a trumpet charge into the solar wind. */
  profile: { bpm: 145, lead: "trumpet", pad: "organ", counter: "strings", mood: "heroic", answer: "2 - - 3 4 - - 3 2 - - - 0 - - -" },
  parts: MELODY.STAGE8,
  form: ["A", "B", "A", "C", "B", "A+2", "B+2"],
  riffs: { A: "march16", B: "pump16", C: "gallop16" },
  sections: [[1, { layer: "brass" }], [3, { lead: "guitar", layer: undefined, stabs: false }], [4, { lead: "trumpet", layer: "violin", stabs: true }], [5, { lead: "brass", layer: "trumpet" }], [6, { lead: "trumpet", layer: "violin" }]],
  drums: "march", stabs: true,
});

const STAGE9 = compose({ /* The Oort Cloud Abyss: C# minor in seven, a bell in the dark over organ. */
  profile: { bpm: 108, lead: "bell", pad: "organ", counter: "strings", mood: "dread", answer: ". . . . 4 - - - - - . . 2 - . ." },
  parts: MELODY.STAGE9,
  form: ["A", "B", "A", "C", "B", "A"],
  riffs: { A: "throb14", B: "seven14", C: "throb14" },
  sections: [[1, { lead: "strings", pad: "organ" }], [3, { lead: "organ", pad: "strings", counter: "bell" }], [4, { lead: "bell", layer: "strings" }], [5, { lead: "strings", layer: "bell" }]],
  drums: "toms",
});

const STAGE10 = compose({ /* Derelict Megastructure: F minor, organ and guitar down the trench. */
  profile: { bpm: 157, lead: "organ", pad: "strings", counter: "guitar", mood: "battle", answer: "0 - 2 - 1 - 0 - 4 - 3 - 2 - . ." },
  parts: MELODY.STAGE10,
  form: ["A", "B", "A", "C", "B", "A+2", "B+2"],
  riffs: { A: "gallop16", B: "drive16", C: "hits16" },
  sections: [[1, { layer: "lead" }], [3, { lead: "guitar", layer: undefined, stabs: false }], [4, { lead: "organ", layer: "guitar", stabs: true }], [5, { lead: "violin", layer: "organ" }], [6, { lead: "organ", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

const STAGE11 = compose({ /* Flagship Breach: G minor in six, a brass march along the hull. */
  profile: { bpm: 146, lead: "brass", pad: "organ", counter: "lead", mood: "anger", answer: "0 - - 0 - - 4 - 2 - - 0 - . . ." },
  parts: MELODY.STAGE11,
  form: ["A", "B", "A", "C", "B", "A+3", "B+3"],
  riffs: { A: "six12", B: "six12", C: "hold12" },
  sections: [[1, { layer: "organ" }], [3, { lead: "trumpet", layer: "brass", stabs: false }], [4, { lead: "brass", layer: "lead", stabs: true }], [5, { lead: "organ", layer: "brass" }], [6, { lead: "brass", layer: "trumpet" }]],
  drums: "battle", bassVoice: "slap",
});

const STAGE12 = compose({ /* The Hypergate Horizon: D minor, the last run, trumpet and violin at full tilt. */
  profile: { bpm: 169, lead: "trumpet", pad: "organ", counter: "guitar", mood: "anger", answer: "0 - . 0 - . 1 - 4 - - 3 - 2 - ." },
  parts: MELODY.STAGE12,
  form: ["A", "B", "A", "C", "B", "A+2", "C+2"],
  riffs: { A: "pump16", B: "gallop16", C: "drive16" },
  sections: [[1, { layer: "violin" }], [3, { lead: "guitar", layer: "trumpet", stabs: false }], [4, { lead: "trumpet", layer: "violin", stabs: true }], [5, { lead: "violin", layer: "trumpet" }], [6, { lead: "trumpet", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

/* ---------- chapters 5 to 12: bosses (4/4 into 7/8 and back, like Space 2's) ---------- */

const BOSS5 = compose({ /* Tempest Raider: F# minor, a guitar at full speed. */
  profile: { bpm: 163, lead: "guitar", pad: "organ", counter: "bell", mood: "battle", answer: "4 - . 3 - 2 - . 0 - 1 - 2 - . ." },
  parts: MELODY.BOSS5,
  form: ["A", "B", "A", "C", "B", "A+2", "C+2"],
  riffs: { A: "gallop16", B: "seven14", C: "drive16" },
  sections: [[1, { lead: "violin", layer: "guitar" }], [2, { lead: "guitar", layer: "organ" }], [3, { lead: "organ", layer: "guitar" }], [4, { lead: "violin", layer: undefined }], [5, { lead: "guitar", layer: "brass" }], [6, { lead: "guitar", layer: "violin" }]],
  drums: "battle", bassVoice: "picked",
});

const BOSS6 = compose({ /* Cryo-Colossus: C minor in six, a brass stomp, then seven. */
  profile: { bpm: 116, lead: "brass", pad: "organ", counter: "organ", mood: "battle", answer: "0 - - 0 - - 4 - 2 - - 0 - . . ." },
  parts: MELODY.BOSS6,
  form: ["A", "B", "A", "C", "B", "C+3", "A+3"],
  riffs: { A: "six12", B: "throb14", C: "hold12" },
  sections: [[1, { layer: "organ" }], [3, { lead: "trumpet", layer: "brass", stabs: false }], [4, { lead: "organ", layer: "brass", stabs: true }], [5, { lead: "brass", layer: "organ" }], [6, { lead: "brass", layer: "trumpet" }]],
  drums: "battle", bassVoice: "slap",
});

const BOSS7 = compose({ /* Iron Goliath: E-flat minor, organ over the hangar decks. */
  profile: { bpm: 138, lead: "organ", pad: "strings", counter: "brass", mood: "battle", answer: "0 - . 2 - . 4 - 3 - 2 - . . 1 -" },
  parts: MELODY.BOSS7,
  form: ["A", "B", "A", "C", "B", "A+2", "B+2"],
  riffs: { A: "slap16", B: "seven14", C: "gallop16" },
  sections: [[1, { layer: "brass" }], [3, { lead: "guitar", layer: "organ", stabs: false }], [4, { lead: "organ", layer: "violin", stabs: true }], [5, { lead: "brass", layer: "organ" }], [6, { lead: "organ", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

const BOSS8 = compose({ /* Aegis-Null: A minor in seven, a violin behind mirrors. */
  profile: { bpm: 156, lead: "violin", pad: "organ", counter: "lead", mood: "battle", answer: "2 - 1 - 0 - . . 4 - 3 - 2 - . ." },
  parts: MELODY.BOSS8,
  form: ["A", "B", "A", "C", "B", "A+5", "C+5"],
  riffs: { A: "seven14", B: "pump16", C: "throb14" },
  sections: [[1, { layer: "organ" }], [3, { lead: "guitar", layer: undefined, stabs: false }], [4, { lead: "violin", layer: "guitar", stabs: true }], [5, { lead: "trumpet", layer: "violin" }], [6, { lead: "violin", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

const BOSS9 = compose({ /* Void Stalker: B minor, a synth hunting in the dark. */
  profile: { bpm: 149, lead: "lead", pad: "organ", counter: "violin", mood: "battle", answer: "4 - 3 - 2 - . . 1 - 0 - 1 - 2 -" },
  parts: MELODY.BOSS9,
  form: ["A", "B", "A", "C", "B", "A+3", "C+3"],
  riffs: { A: "chrom16", B: "seven14", C: "gallop16" },
  sections: [[1, { layer: "violin" }], [3, { lead: "guitar", layer: "lead", stabs: false }], [4, { lead: "lead", layer: "violin", stabs: true }], [5, { lead: "organ", layer: "lead" }], [6, { lead: "lead", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

const BOSS10 = compose({ /* Ring Keeper: E minor in six, organ in the ring's machinery, then seven. */
  profile: { bpm: 142, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 . 2 - 1 - 0 - 4 . 3 - 2 - . ." },
  parts: MELODY.BOSS10,
  form: ["A", "B", "A", "C", "B", "A+2", "C+2"],
  riffs: { A: "six12", B: "throb14", C: "six12" },
  sections: [[1, { layer: "bell" }], [3, { lead: "violin", layer: undefined, stabs: false }], [4, { lead: "organ", layer: "violin", stabs: true }], [5, { lead: "brass", layer: "organ" }], [6, { lead: "organ", layer: "brass" }]],
  drums: "battle", bassVoice: "picked",
});

const BOSS11 = compose({ /* The Warmaster: C minor, every brass gun the flagship has. */
  profile: { bpm: 155, lead: "brass", pad: "organ", counter: "guitar", mood: "battle", answer: "0 . 0 - 2 . 2 - 4 - 3 - 2 - . ." },
  parts: MELODY.BOSS11,
  form: ["A", "B", "A", "C", "B", "A+2", "C+2"],
  riffs: { A: "pump16", B: "seven14", C: "gallop16" },
  sections: [[1, { layer: "trumpet" }], [3, { lead: "guitar", layer: "brass", stabs: false }], [4, { lead: "brass", layer: "violin", stabs: true }], [5, { lead: "organ", layer: "brass" }], [6, { lead: "brass", layer: "trumpet" }]],
  drums: "battle", bassVoice: "picked",
});

/* The Herald, in three: its blades, its singularity, its true form (like Atlas's three tracks). */
const HERALD_PARTS = MELODY.HERALD;
const BOSS12 = compose({
  profile: { bpm: 161, lead: "trumpet", pad: "organ", counter: "guitar", mood: "battle", answer: "2 - 1 - 0 - . . 4 - 3 - 2 - 1 -" },
  parts: HERALD_PARTS,
  form: ["A", "B", "D", "A", "C", "B+2"],
  riffs: { A: "gallop16", B: "pump16", C: "drive16", D: "seven14", E: "hold16" },
  sections: [[1, { layer: "violin" }], [2, { lead: "violin", layer: "trumpet" }], [3, { lead: "trumpet", layer: "brass" }], [4, { lead: "guitar", layer: "trumpet" }], [5, { lead: "trumpet", layer: "violin" }]],
  drums: "battle", bassVoice: "picked",
});
const BOSS12B = compose({
  profile: { bpm: 169, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 - 2 - 1 - 0 - 4 - 3 - 2 - . ." },
  parts: HERALD_PARTS,
  form: ["E", "D", "C", "D+3", "B", "C+3"],
  riffs: { A: "gallop16", B: "pump16", C: "drive16", D: "throb14", E: "hold16" },
  sections: [[1, { lead: "violin", layer: "organ" }], [2, { lead: "organ", layer: "lead" }], [3, { lead: "violin", layer: "organ" }], [4, { lead: "organ", layer: "brass" }], [5, { lead: "lead", layer: "organ" }]],
  drums: "battle", bassVoice: "slap",
});
const BOSS12C = compose({
  profile: { bpm: 181, lead: "lead", pad: "organ", counter: "brass", mood: "anger", answer: "0 1 2 - 4 - 3 - 2 - 1 - 0 - . ." },
  parts: HERALD_PARTS,
  form: ["C", "A+2", "C+2", "B+4", "D+2", "C+5"],
  riffs: { A: "pump16", B: "gallop16", C: "drive16", D: "seven14", E: "hold16" },
  sections: [[1, { lead: "trumpet", layer: "lead" }], [2, { lead: "lead", layer: "brass" }], [3, { lead: "violin", layer: "trumpet" }], [4, { lead: "guitar", layer: "lead" }], [5, { lead: "lead", layer: "trumpet" }]],
  drums: "battle", bassVoice: "picked",
});

/* ---------- bonus tracks, in the manner of Final Extremity ---------- */

/* Outer Extremity: forty-odd bars, every part of the Herald's and Tempest's themes driven through new keys. */
const BONUS1 = compose({
  profile: { bpm: 167, lead: "lead", pad: "strings", counter: "bell", mood: "battle", answer: "0 - 2 - 1 - 0 - 4 - 3 - 2 - . ." },
  parts: MELODY.BONUS1,
  form: ["A", "B", "C", "A", "D", "B+2", "C+2", "A+3", "B+5", "C+5", "A+5"],
  riffs: { A: "gallop16", B: "drive16", C: "seven14", D: "hold16" },
  sections: [[1, { layer: "brass" }], [2, { lead: "violin", layer: "lead" }], [3, { lead: "guitar", layer: "lead" }], [4, { lead: "strings", layer: undefined, pad: "harp", stabs: false }], [5, { lead: "lead", layer: "brass", pad: "strings", stabs: true }], [7, { lead: "trumpet", layer: "violin" }], [8, { lead: "organ", layer: "lead" }], [10, { lead: "lead", layer: "trumpet" }]],
  drums: "battle", bassVoice: "picked",
});

/* Hypergate Requiem: a slow, wide piece for after the ending, strings and brass. */
const BONUS2 = compose({
  profile: { bpm: 84, lead: "strings", pad: "organ", counter: "violin", mood: "sad", answer: "2 - - - - - 1 - 0 - - - - - - -" },
  parts: MELODY.BONUS2,
  form: ["A", "B", "C", "B", "A+3", "C+3"],
  riffs: { A: "hold16", B: "pulse16", C: "hold16" },
  sections: [[1, { lead: "violin", pad: "strings" }], [2, { lead: "brass", pad: "strings", counter: "strings" }], [3, { lead: "strings", pad: "harp" }], [4, { lead: "violin", pad: "organ" }], [5, { lead: "brass", layer: "strings" }]],
  drums: "soft",
});

export const SPACE3_OUTER_SONGS = {
  s3hangar2: HANGAR2, s3hangar3: HANGAR3, s3fanfare: FANFARE, s3alert2: ALERT2, s3alert3: ALERT3, s3pause: PAUSE, s3gameover: GAMEOVER, s3ending: ENDING,
  s3stage5: STAGE5, s3stage6: STAGE6, s3stage7: STAGE7, s3stage8: STAGE8, s3stage9: STAGE9, s3stage10: STAGE10, s3stage11: STAGE11, s3stage12: STAGE12,
  s3boss5: BOSS5, s3boss6: BOSS6, s3boss7: BOSS7, s3boss8: BOSS8, s3boss9: BOSS9, s3boss10: BOSS10, s3boss11: BOSS11, s3boss12: BOSS12, s3boss12b: BOSS12B, s3boss12c: BOSS12C,
  s3bonus1: BONUS1, s3bonus2: BONUS2,
} satisfies Record<string, Song>;
