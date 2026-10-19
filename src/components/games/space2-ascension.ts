/* Space 2: Ascension. Original replacement melodies with track-specific
   orchestration, and one bar of each original's melody quoted inside it (its DNA, see quoteOriginal).
   Counter motifs use scale degrees relative
   to each bar's chord, fitted to its meter. No random pitches or audio assets.
   The originals are never mutated; the alternative is a separate player album. */
import type { AlternateSagaTrack, BaseSagaTrack, Song } from "./space2-music";
import { BATTLE_BARS, BATTLE_MARKS, BATTLE_PERFORMANCE } from "./space2-ascension-battle.ts";
import { BOSS_SUITES, SUITE_MARKS } from "./space2-ascension-bosses.ts";

type Bar = Song["bars"][number];
type Profile = {
  bpm: number; lead: Song["lead"]; pad: Song["pad"]; counter: Song["counter"];
  mood: "heroic" | "battle" | "quiet" | "dread" | "ceremony" | "ruin" | "anger" | "dark" | "sad" | "evil";
  answer: string;
};

// Each answer has its own phrasing. 0 is the chord root, 2 its third, 4 its fifth.
// Holds and rests use the same notation as the score; odd meters compress time.
export const ASCENSION_PROFILES: Record<BaseSagaTrack, Profile> = {
  s2title: { bpm: 112, lead: "organ", pad: "strings", counter: "violin", mood: "dark", answer: "0 - - - - - - - 1 - - - 0 - - -" },
  s2hangar: { bpm: 80, lead: "violin", pad: "organ", counter: "strings", mood: "ruin", answer: "0 - - - - - . . 1 - 0 - - - . ." },
  s2hangar2: { bpm: 92, lead: "organ", pad: "strings", counter: "violin", mood: "ruin", answer: "4 - - - - - - - 3 - - - - - . ." },
  s2hangar3: { bpm: 84, lead: "strings", pad: "organ", counter: "piano", mood: "ruin", answer: "0 - - - - - - - 1 - - - 0 - - -" },
  s2stage: { bpm: 150, lead: "trumpet", pad: "organ", counter: "guitar", mood: "anger", answer: "0 - . 0 - . 1 - 0 - - - 4 - 2 -" },
  s2stage2: { bpm: 158, lead: "brass", pad: "organ", counter: "guitar", mood: "anger", answer: "0 - . 0 - . 1 - 0 - . 0 - . 4 -" },
  s2alert: { bpm: 82, lead: "strings", pad: "organ", counter: "bell", mood: "dread", answer: ". . . . 4 - - - - - . . 2 - - -" },
  s2alert2: { bpm: 114, lead: "organ", pad: "strings", counter: "bell", mood: "dread", answer: "0 - - - - - . . 1 - 0 - - - . ." },
  s2alert3: { bpm: 100, lead: "strings", pad: "organ", counter: "bell", mood: "dread", answer: "4 - - - . . 3 - 2 - - - . . 1 -" },
  s2pause: { bpm: 66, lead: "piano", pad: "strings", counter: "violin", mood: "sad", answer: "2 - - - - - - - 1 - - - - - - -" },
  s2victory: { bpm: 120, lead: "brass", pad: "organ", counter: "strings", mood: "evil", answer: "0 - - - - - - - 1 - - - - - - -" },
  s2gameover: { bpm: 60, lead: "strings", pad: "organ", counter: "piano", mood: "evil", answer: "4 - - - - - - - 3 - - - - - - -" },
  s2ending: { bpm: 92, lead: "strings", pad: "organ", counter: "piano", mood: "sad", answer: "2 - - - - - 1 - 0 - - - - - - -" },
  s2fanfare: { bpm: 170, lead: "brass", pad: "organ", counter: "strings", mood: "anger", answer: "0 . 0 . 0 . 1 . 0 - - - . . . ." },
  s2boss1: { bpm: 158, lead: "brass", pad: "organ", counter: "strings", mood: "battle", answer: "4 - . 3 - 2 - . 0 - 1 - 2 - . ." },
  s2boss2: { bpm: 162, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 . 2 - 1 - 0 - 4 . 3 - 2 - . ." },
  s2boss3: { bpm: 150, lead: "lead", pad: "strings", counter: "bell", mood: "battle", answer: "2 - 3 - 4 - . . 3 - 2 - 1 - 0 -" },
  s2boss4: { bpm: 160, lead: "brass", pad: "organ", counter: "lead", mood: "battle", answer: "0 - . 2 - . 4 - 3 - 2 - . . 1 -" },
  s2boss5: { bpm: 166, lead: "organ", pad: "strings", counter: "lead", mood: "battle", answer: "4 - 3 - 2 - . . 1 - 0 - 1 - 2 -" },
  s2boss6: { bpm: 154, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "2 - - 1 - 0 - . 4 - - 3 - 2 - ." },
  s2boss7: { bpm: 170, lead: "lead", pad: "organ", counter: "brass", mood: "battle", answer: "0 . 0 - 2 . 2 - 4 - 3 - 2 - . ." },
  s2boss8: { bpm: 162, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "2 - 1 - 0 - . . 4 - 3 - 2 - 1 -" },
  s2boss8b: { bpm: 168, lead: "brass", pad: "organ", counter: "strings", mood: "battle", answer: "4 - - - 2 - 1 - 0 - - 1 2 - . ." },
  s2boss8c: { bpm: 174, lead: "lead", pad: "organ", counter: "bell", mood: "battle", answer: "0 1 2 - 4 - 3 - 2 - 1 - 0 - . ." },
  s2bonus1: { bpm: 156, lead: "brass", pad: "strings", counter: "organ", mood: "battle", answer: "2 - . 1 - . 0 - 4 - . 3 - . 2 -" },
  s2bonus2: { bpm: 96, lead: "harp", pad: "strings", counter: "bell", mood: "quiet", answer: "4 - - - - - 3 - 2 - - - 1 - 0 -" },
  s2bonus3: { bpm: 172, lead: "lead", pad: "organ", counter: "brass", mood: "battle", answer: "0 . 2 - 0 . 3 - 4 - - - 2 - . ." },
  s2bonus4: { bpm: 132, lead: "brass", pad: "harp", counter: "strings", mood: "heroic", answer: "2 - - 3 4 - - 3 2 - - - 0 - - -" },
  s2bonus5: { bpm: 78, lead: "strings", pad: "harp", counter: "bell", mood: "quiet", answer: "2 - - - - - 3 - 4 - - - 2 - - -" },
  s2bonus6: { bpm: 154, lead: "organ", pad: "strings", counter: "lead", mood: "battle", answer: "0 - . 1 2 - . 3 4 - 3 - 2 - . ." },
  s2bonus7: { bpm: 154, lead: "brass", pad: "strings", counter: "bell", mood: "battle", answer: "2 - - - 1 - 0 - 2 - 3 - 4 - . ." },
  s2bonus8: { bpm: 166, lead: "lead", pad: "organ", counter: "brass", mood: "battle", answer: "4 . 3 - 2 . 1 - 0 - 1 - 2 - . ." },
  s2bonus9: { bpm: 150, lead: "brass", pad: "organ", counter: "lead", mood: "battle", answer: "2 - . 2 1 - 0 - 4 - . 4 3 - 2 -" },
  s2bonus10: { bpm: 174, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 - 2 - 1 - 0 - 4 - 3 - 2 - . ." },
  s2bonus11: { bpm: 152, lead: "lead", pad: "strings", counter: "brass", mood: "battle", answer: "2 - 2 3 - - 4 - 3 - 2 - 0 - . ." },
  s2bonus12: { bpm: 178, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "2 - 1 - 0 - . 1 2 - 3 - 4 - . ." },
  s2bonus13: { bpm: 172, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 - 2 - 1 - 0 - 4 - 3 - 2 - . ." },
  s2bonus14: { bpm: 180, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "2 - 1 - 0 - . 1 2 - 3 - 4 - . ." },
  s2bonus15: { bpm: 188, lead: "organ", pad: "strings", counter: "bell", mood: "battle", answer: "0 - 2 - 1 - 0 - 4 - 3 - 2 - . ." },
};

// Original four-bar A themes. The separate B themes below answer each A;
// these replace the old lead scores rather than being appended to them.
const EPISODES: Partial<Record<BaseSagaTrack, [string, string][]>> = {
  s2title: [
    // Dark: D harmonic minor, a chant on the organ that leans on its semitones.
    ["D5 - - - - - E5 F5 - - - - E5 - D5 -", "Dm"],
    ["D5 - - - - - E5 F5 - - - - G5 - A5 -", "Bb"],
    ["Bb5 - - - A5 - - - G5 - - - F5 - E5 -", "Gm"],
    ["C#5 - - - - - - - E5 - - - . . . .", "A7"],
  ],
  s2hangar: [
    // The hangar burns. C minor: a sigh that falls back a semitone, a cry a fourth higher, the line breaking off.
    ["G5 - - - - - Ab5 G5 - - - - Eb5 - - -", "Cm"],
    ["C6 - - - - - Db6 C6 - - - - Ab5 - - -", "Ab"],
    ["Ab5 - - - G5 - F5 - Eb5 - - - D5 - . .", "Fm"],
    ["B4 - - - D5 - F5 - Ab5 - - - G5 - - -", "G7"],
  ],
  s2hangar2: [
    // The waltz in ashes: E Phrygian, each phrase turning round its flat second.
    ["B4 - - C5 - - B4 - - - - -", "Em"],
    ["E5 - - F5 - - E5 - - C5 - -", "C"],
    ["A4 - - B4 - - C5 - - E5 - -", "Am"],
    ["D#5 - - E5 - - F#5 - - - . .", "B7"],
  ],
  s2hangar3: [
    // The sea song gone dark: D minor, long held notes, the leading tone left hanging.
    ["A4 - - - - - D5 - - C#5 - -", "Dm"],
    ["D5 - - - - - F5 - - E5 - -", "Bb"],
    ["Bb4 - - A4 - - G4 - - D5 - -", "Gm"],
    ["C#5 - - - - - E5 - - . . .", "A7"],
  ],
  s2stage: [
    ["C5 - E5 E5 - D5 C5 - A4 - B4 - C5 - E5 -", "Am"],
    ["D5 - E5 - F5 - G5 - A5 - G5 - F5 - E5 -", "Dm7"],
    ["F5 - G5 - A5 - C6 - B5 - A5 - G5 - F5 -", "Fmaj7"],
    ["E5 - D5 - C5 - B4 - G#4 - B4 - E5 - - -", "E7"],
  ],
  s2stage2: [
    // Anger: E minor hammered on one note, then up a semitone to F.
    ["E5 . E5 . G5 - E5 . F5 - E5 - B4 - - -", "Em"],
    ["F5 . F5 . A5 - F5 . G5 - F5 - C5 - - -", "F"],
    ["A5 . A5 . C6 - A5 . B5 - A5 - E5 - - -", "Am"],
    ["D#5 - - - F#5 - - - A5 - - - B5 - - -", "B7"],
  ],
  s2ending: [
    // Sad: D minor, falling by step, with D major only in the last bar.
    ["A5 - - - - - G5 - F5 - - - E5 - D5 -", "Dm"],
    ["F5 - - - - - E5 - D5 - - - C5 - Bb4 -", "Bb"],
    ["Bb4 - - - C5 - D5 - G5 - - - F5 - E5 -", "Gm"],
    ["E5 - - - - - C#5 - A4 - - - - - . .", "A7"],
  ],
  s2boss1: [
    ["G5 - Bb5 A5 G5 - F5 - D5 - F5 - G5 - A5 -", "Gm"],
    ["Bb5 - A5 - G5 - F5 - Eb5 - F5 - G5 - Bb5 -", "Ebmaj7"],
    ["C6 - Bb5 - A5 - G5 - F5 - G5 - A5 - C6 -", "Cm7"],
    ["A5 - G5 - F#5 - Eb5 - D5 - F#5 - A5 - - -", "D7"],
  ],
  s2boss2: [
    ["G5 . B5 C6 B5 - A5 - G5 - F#5 - E5 - F#5 -", "Em"],
    ["G5 - A5 - B5 - C6 - D6 - C6 - B5 - A5 -", "Cmaj7"],
    ["C6 - B5 - A5 - G5 - F5 - E5 - D5 - C5 -", "Fmaj7"],
    ["D#5 - E5 - F#5 - A5 - F#5 - E5 - D#5 - - -", "B7"],
  ],
  s2boss3: [
    ["E5 - G#5 A5 G#5 - F#5 - E5 - D#5 - C#5 - D#5 -", "C#m"],
    ["E5 - F#5 - G#5 - A5 - B5 - A5 - G#5 - F#5 -", "Amaj7"],
    ["A5 - G#5 - F#5 - E5 - D#5 - E5 - F#5 - A5 -", "F#m7"],
    ["G#5 - F#5 - F5 - D#5 - C#5 - D#5 - F5 - G#5 -", "G#7"],
  ],
  s2boss4: [
    ["F#5 - A5 Bb5 A5 - G5 - F#5 - E5 - D5 - E5 -", "D"],
    ["G5 - F#5 - E5 - D5 - C5 - D5 - E5 - G5 -", "C"],
    ["G5 - A5 - B5 - C6 - D6 - C6 - B5 - A5 -", "G"],
    ["A5 - G5 - E5 - C#5 - E5 - G5 - A5 - - -", "A7"],
  ],
  s2boss5: [
    ["Ab5 . C6 Db6 C6 - Bb5 - Ab5 - G5 - F5 - G5 -", "Fm"],
    ["Ab5 - Bb5 - C6 - Db6 - Eb6 - Db6 - C6 - Bb5 -", "Dbmaj7"],
    ["Db6 - C6 - Bb5 - Ab5 - G5 - Ab5 - Bb5 - Db6 -", "Bbm7"],
    ["C6 - Bb5 - G5 - E5 - G5 - Bb5 - C6 - - -", "C7"],
  ],
  s2boss6: [
    ["D5 - F#5 G5 F#5 - E5 - D5 - C#5 - B4 - C#5 -", "Bm"],
    ["D5 - E5 - F#5 - G5 - A5 - G5 - F#5 - E5 -", "Gmaj7"],
    ["G5 - F#5 - E5 - D5 - C#5 - D5 - E5 - G5 -", "Em7"],
    ["F#5 - E5 - C#5 - A#4 - C#5 - E5 - F#5 - - -", "F#7"],
  ],
  s2boss7: [
    ["A5 A5 C6 - B5 - A5 - G5 - E5 - G5 - A5 -", "Am"],
    ["F5 - G5 - A5 - B5 - C6 - B5 - A5 - G5 -", "Fmaj7"],
    ["A5 - G5 - F5 - E5 - D5 - E5 - F5 - A5 -", "Dm7"],
    ["G#5 - B5 - D6 - C6 - B5 - A5 - G#5 - - -", "E7"],
  ],
  s2boss8: [
    ["F5 - A5 Bb5 A5 - G5 - F5 - E5 - D5 - F5 -", "Dm"],
    ["Bb5 - A5 - G5 - F5 - E5 - F5 - G5 - Bb5 -", "Bbmaj7"],
    ["G5 - A5 - Bb5 - C6 - D6 - C6 - Bb5 - A5 -", "Gm7"],
    ["G5 - E5 - C#5 - E5 - G5 - A5 - Bb5 - A5 -", "A7"],
  ],
  s2boss8b: [
    ["A5 - - Bb5 A5 - G5 - E5 - D5 - C#5 - E5 -", "A7"],
    ["F5 - G5 - A5 - Bb5 - C6 - Bb5 - A5 - G5 -", "Dm"],
    ["Eb5 - F5 - G5 - Bb5 - A5 - G5 - F5 - Eb5 -", "Ebmaj7"],
    ["E5 - G5 - A5 - Bb5 - A5 - G5 - E5 - C#5 -", "A7"],
  ],
  s2boss8c: [
    ["A5 . D6 Eb6 D6 - C6 - A5 - G5 - F5 - E5 -", "Dm"],
    ["F5 - G5 - A5 - Bb5 - C6 - D6 - E6 - F6 -", "Bbmaj7"],
    ["G6 - F6 - E6 - D6 - C6 - Bb5 - A5 - G5 -", "Gm7"],
    ["E5 - G5 - A5 - Bb5 - A5 - G5 - E5 - C#5 -", "A7"],
  ],
  s2bonus1: [
    ["F5 - A5 - G5 - F5 - E5 - D5 - E5 - F5 -", "Dm7"],
    ["G5 - A5 - Bb5 - C6 - D6 - C6 - Bb5 - A5 -", "Gm7"],
    ["Bb5 - A5 - G5 - F5 - E5 - F5 - G5 - Bb5 -", "Bbmaj7"],
    ["A5 - G5 - E5 - D5 - C#5 - E5 - G5 - A5 -", "A7"],
  ],
  s2bonus2: [
    ["B4 - - - C5 - D5 - E5 - - - D5 - B4 -", "Em7"],
    ["C5 - - - E5 - G5 - A5 - - - G5 - E5 -", "Cmaj7"],
    ["E5 - - - F#5 - G5 - A5 - - - G5 - F#5 -", "Am7"],
    ["A5 - - - G5 - E5 - F#5 - - - D5 - - -", "D7"],
  ],
  s2bonus3: [
    ["A5 A5 C6 - B5 - A5 - E5 - F5 - G5 - A5 -", "Am"],
    ["F5 - A5 - C6 - B5 - A5 - G5 - F5 - E5 -", "Fmaj7"],
    ["D5 - E5 - F5 - G5 - A5 - B5 - C6 - D6 -", "Dm7"],
    ["B5 - A5 - G#5 - F5 - E5 - G#5 - B5 - - -", "E7"],
  ],
  s2bonus4: [
    ["F#5 - - G5 A5 - - G5 F#5 - E5 - D5 - - -", "D"],
    ["G5 - - A5 B5 - - A5 G5 - F#5 - E5 - - -", "Gmaj7"],
    ["B5 - A5 - G5 - F#5 - E5 - F#5 - G5 - B5 -", "Em7"],
    ["A5 - G5 - E5 - C#5 - E5 - G5 - A5 - - -", "A7"],
  ],
  s2bonus5: [
    ["F5 - - - - - G5 - A5 - - - G5 - F5 -", "Dm7"],
    ["D5 - - - - - E5 - F5 - - - G5 - A5 -", "Bbmaj7"],
    ["Bb5 - - - A5 - G5 - F5 - - - E5 - D5 -", "Gm7"],
    ["G5 - - - F5 - E5 - C5 - - - - - - -", "C7"],
  ],
  s2bonus6: [
    ["G5 - B5 C6 B5 - A5 - G5 - F#5 - E5 - F#5 -", "Em"],
    ["G5 - A5 - B5 - C6 - D6 - C6 - B5 - A5 -", "Cmaj7"],
    ["A5 - G5 - F#5 - E5 - D5 - E5 - F#5 - A5 -", "Am7"],
    ["F#5 - E5 - D#5 - B4 - D#5 - F#5 - A5 - - -", "B7"],
  ],
  s2bonus7: [
    ["Eb5 - G5 Ab5 G5 - F5 - Eb5 - D5 - C5 - D5 -", "Cm"],
    ["Eb5 - F5 - G5 - Ab5 - Bb5 - Ab5 - G5 - F5 -", "Abmaj7"],
    ["Ab5 - G5 - F5 - Eb5 - D5 - Eb5 - F5 - Ab5 -", "Fm7"],
    ["G5 - F5 - D5 - B4 - D5 - F5 - G5 - - -", "G7"],
  ],
  s2bonus8: [
    ["A5 . C#6 D6 C#6 - B5 - A5 - G#5 - F#5 - G#5 -", "F#m"],
    ["A5 - B5 - C#6 - D6 - E6 - D6 - C#6 - B5 -", "Dmaj7"],
    ["D6 - C#6 - B5 - A5 - G#5 - A5 - B5 - D6 -", "Bm7"],
    ["C#6 - B5 - G#5 - F5 - G#5 - B5 - C#6 - - -", "C#7"],
  ],
  s2bonus9: [
    ["C5 - E5 - A5 - G5 - E5 - D5 - C5 - E5 -", "Am"],
    ["F5 - G5 - A5 - C6 - B5 - A5 - G5 - F5 -", "Fmaj7"],
    ["A5 - G5 - F5 - E5 - D5 - E5 - F5 - A5 -", "Dm7"],
    ["G#5 - F5 - E5 - D5 - B4 - D5 - E5 - G#5 -", "E7"],
  ],
  s2bonus10: [
    ["F5 - A5 Bb5 A5 - G5 - F5 - E5 - D5 - F5 -", "Dm"],
    ["G5 - A5 - Bb5 - C6 - D6 - C6 - Bb5 - A5 -", "Gm7"],
    ["Ab5 - G5 - F5 - Eb5 - F5 - G5 - Ab5 - C6 -", "Fm"],
    ["E6 - D6 - C#6 - A5 - G5 - E5 - C#5 - E5 -", "A7"],
  ],
  s2bonus11: [
    ["F5 - A5 A5 - G5 F5 - E5 - D5 - E5 - F5 -", "Dm"],
    ["Bb5 - A5 - G5 - F5 - D5 - E5 - F5 - G5 -", "Bbmaj7"],
    ["G5 - A5 - Bb5 - A5 - G5 - F5 - E5 - D5 -", "Gm7"],
    ["E5 - G5 - A5 - Bb5 - A5 - G5 - E5 - C#5 -", "A7"],
  ],
};

// Contrasting B themes: independently written pitches and phrasing, with
// shortened meters in the battle pieces and longer breaths in the towns.
const CONTRASTS: Partial<Record<BaseSagaTrack, [string, string][]>> = {
  s2title: [
    ["A5 - - - - - Bb5 A5 - - - - F5 - - -", "Dm"],
    ["G5 - - - Bb5 - - - D6 - - - C#6 - - -", "Gm"],
    ["Bb5 - - - G5 - - - E5 - - - G5 - - -", "Edim"],
    ["A5 - - - G5 - - - F5 - - - E5 - C#5 -", "A7"],
  ],
  s2hangar: [
    ["Eb5 - - - - - D5 Eb5 - - - - C5 - - -", "Ab"],
    ["F5 - - - Ab5 - - - C6 - - - B5 - . .", "Fm"],
    ["D5 - - - F5 - - - Ab5 - - - G5 - F5 -", "Ddim"],
    ["Eb5 - - - D5 - - - B4 - - - - - . .", "G7"],
  ],
  s2hangar2: [
    ["A5 - - G5 - - F5 - - C5 - -", "F"],
    ["B4 - - - - - E5 - - G5 - -", "Em"],
    ["C6 - - B5 - - A5 - - E5 - -", "Am"],
    ["D#5 - - - - - B4 - - - . .", "B7"],
  ],
  s2hangar3: [
    ["F5 - - E5 - - D5 - - Bb4 - -", "Bb"],
    ["D5 - - - - - G5 - - Bb5 - -", "Gm"],
    ["Bb5 - - A5 - - G5 - - E5 - -", "Edim"],
    ["C#5 - - - - - A4 - - - . .", "A7"],
  ],
  s2stage: [
    ["A5 - G5 E5 - D5 C5 - B4 - C5 - D5 -", "Am",],
    ["F5 - E5 D5 - C5 A4 - C5 - D5 - E5 -", "Dm7"],
    ["E5 - F5 - G5 - A5 - C6 - B5 - A5 - G5 -", "Fmaj7"],
    ["G#5 - A5 - B5 - D6 - C6 - B5 - G#5 - - -", "E7"],
  ],
  s2stage2: [
    ["B5 - - A5 - - G5 - - E5 - -", "Em"],
    ["C6 - - B5 - - A5 - - F5 - -", "F"],
    ["D5 - - F5 - - Ab5 - - B5 - -", "Ddim"],
    ["A5 - - G5 - - F#5 - - D#5 - -", "B7"],
  ],
  s2ending: [
    ["D5 - - - E5 - F5 - A5 - - - G5 - F5 -", "Dm"],
    ["G5 - - - - - Bb5 - A5 - - - G5 - F5 -", "Gm"],
    ["E5 - - - G5 - - - C#6 - - - A5 - - -", "A7"],
    ["F#5 - - - - - - - D5 - - - - - . .", "D"],
  ],
  s2boss1: [
    ["D6 - C6 - Bb5 - A5 - G5 - . . F5 - G5 -", "Gm"],
    ["G5 - A5 Bb5 - A5 G5 - F5 - Eb5 - D5 -", "Ebmaj7"],
    ["Eb5 - G5 A5 - Bb5 C6 - Bb5 - A5 - G5 -", "Cm7"],
    ["A5 - Bb5 - A5 - G5 - F#5 - Eb5 - D5 - - -", "D7"],
  ],
  s2boss2: [
    ["E5 - - G5 - A5 B5 - - A5 - G5", "Em"],
    ["C6 - - B5 - A5 G5 - - E5 - F#5", "Cmaj7"],
    ["A5 - - G5 - F5 E5 - - D5 - C5", "Fmaj7"],
    ["D#5 - E5 F#5 - G5 A5 - G5 - F#5 - D#5 -", "B7"],
  ],
  s2boss3: [
    ["G#5 - F#5 E5 - D#5 C#5 - E5 - F#5 - G#5 -", "C#m"],
    ["A5 - B5 C#6 - B5 A5 - G#5 - F#5 - E5 -", "Amaj7"],
    ["F#5 - G#5 A5 - B5 C#6 - D#6 - C#6 - A5 -", "F#m7"],
    ["G#5 - A5 - G#5 - F#5 - F5 - D#5 - C#5 - F5 -", "G#7"],
  ],
  s2boss4: [
    ["D5 D5 . A5 - G5 F#5 - E5 - F#5 - A5 - - -", "D"],
    ["C6 - B5 A5 - G5 E5 - G5 - A5 - B5 -", "C"],
    ["B5 - A5 G5 - F#5 E5 - F#5 - G5 - A5 -", "G"],
    ["C#6 - B5 - A5 - G5 - E5 - C#5 - E5 - - -", "A7"],
  ],
  s2boss5: [
    ["F5 - G5 Ab5 - G5 F5 - Eb5 - C5 - Eb5 -", "Fm"],
    ["F5 - Ab5 Bb5 - C6 Db6 - C6 - Bb5 - Ab5 -", "Dbmaj7"],
    ["Bb5 - C6 Db6 - Eb6 F6 - Eb6 - Db6 - C6 -", "Bbm7"],
    ["E6 - Db6 - C6 - Bb5 - G5 - E5 - C5 - E5 -", "C7"],
  ],
  s2boss6: [
    ["B4 - - D5 - E5 F#5 - - G5 - F#5", "Bm"],
    ["G5 - - A5 - B5 D6 - - C#6 - B5", "Gmaj7"],
    ["B5 - - A5 - G5 E5 - - F#5 - G5", "Em7"],
    ["A#5 - B5 C#6 - B5 A#5 - G5 - F#5 - E5 -", "F#7"],
  ],
  s2boss7: [
    ["E5 E5 A5 - G5 - E5 - C5 - D5 - E5 - G5 -", "Am"],
    ["A5 - G5 F5 - E5 C5 - D5 - E5 - F5 -", "Fmaj7"],
    ["F5 - A5 C6 - B5 A5 - G5 - F5 - E5 -", "Dm7"],
    ["G#5 A5 B5 - D6 C6 B5 - A5 G#5 F5 - E5 - - -", "E7"],
  ],
  s2boss8: [
    ["A5 - Bb5 A5 - G5 F5 - E5 - D5 - F5 - A5 -", "Dm"],
    ["Bb5 - - A5 G5 - F5 - D5 - E5 - F5 - G5 -", "Bbmaj7"],
    ["G5 - Bb5 - D6 - C6 - Bb5 - A5 - G5 - F5 -", "Gm7"],
    ["E5 F5 G5 - A5 Bb5 A5 - G5 E5 D5 - C#5 - - -", "A7"],
  ],
  s2boss8b: [
    ["C#6 - - - A5 - Bb5 - A5 - G5 - E5 - D5 -", "A7"],
    ["F5 - A5 - D6 - C6 - A5 - G5 - F5 - E5 -", "Dm"],
    ["G5 - Bb5 C6 - Bb5 G5 - F5 - Eb5 - D5 -", "Ebmaj7"],
    ["C#5 - E5 G5 - A5 Bb5 - A5 - G5 - E5 -", "A7"],
  ],
  s2boss8c: [
    ["F5 A5 D6 - C6 A5 G5 - F5 G5 A5 - D6 - - -", "Dm"],
    ["D6 - E6 - F6 - E6 - D6 - C6 - Bb5 - A5 -", "Bbmaj7"],
    ["G5 Bb5 D6 - C6 Bb5 A5 - G5 A5 Bb5 - D6 - - -", "Gm7"],
    ["C#6 - Bb5 A5 - G5 E5 - D5 - E5 - G5 -", "A7"],
  ],
  s2bonus1: [
    ["A5 - - G5 - F5 D5 - - E5 - F5", "Dm7"],
    ["G5 - - A5 - Bb5 D6 - - C6 - Bb5", "Gm7"],
    ["A5 - G5 F5 - E5 D5 - F5 - G5 - A5 -", "Bbmaj7"],
    ["E5 - G5 - A5 - Bb5 - A5 - G5 - E5 - C#5 -", "A7"],
  ],
  s2bonus2: [
    ["G5 - - - - - F#5 - E5 - - - D5 - B4 -", "Gmaj7"],
    ["C5 - - - D5 - E5 - G5 - - - F#5 - E5 -", "Cmaj7"],
    ["E5 - - - C5 - D5 - E5 - - - F#5 - G5 -", "Am7"],
    ["F#5 - E5 - D5 - - - G5 - - - - - . .", "G"],
  ],
  s2bonus3: [
    ["E6 - D6 - C6 - B5 - A5 - G5 - E5 - A5 -", "Am"],
    ["C6 - B5 A5 - G5 F5 - E5 - F5 - G5 -", "Fmaj7"],
    ["A5 - G5 F5 - E5 D5 - F5 - A5 - C6 -", "Dm7"],
    ["B5 C6 B5 - A5 G#5 F5 - E5 F5 G#5 - B5 - - -", "E7"],
  ],
  s2bonus4: [
    ["A5 - - G5 F#5 - E5 - D5 - - - E5 - F#5 -", "Dmaj7"],
    ["G5 - - F#5 E5 - D5 - B4 - - - D5 - E5 -", "Gmaj7"],
    ["E5 - F#5 - G5 - A5 - B5 - A5 - G5 - F#5 -", "Em7"],
    ["E5 - - - C#5 - - - D5 - - - - - . .", "D"],
  ],
  s2bonus5: [
    ["A5 - - - - - G5 - F5 - - - E5 - D5 -", "Fmaj7"],
    ["F5 - - - G5 - A5 - Bb5 - - - A5 - G5 -", "Bbmaj7"],
    ["D5 - - - - - F5 - G5 - - - A5 - Bb5 -", "Gm7"],
    ["G5 - - - E5 - - - F5 - - - - - - -", "F"],
  ],
  s2bonus6: [
    ["E5 - E5 G5 - A5 B5 - A5 - G5 - F#5 -", "Em"],
    ["E5 - G5 A5 - B5 C6 - B5 - A5 - G5 -", "Cmaj7"],
    ["A5 - C6 - B5 - A5 - G5 - F#5 - E5 - D5 -", "Am7"],
    ["D#5 - F#5 - A5 - G5 - F#5 - E5 - D#5 - - -", "B7"],
  ],
  s2bonus7: [
    ["G5 - - F5 - Eb5 C5 - - D5 - Eb5", "Cm"],
    ["Ab5 - - G5 - F5 Eb5 - - D5 - C5", "Abmaj7"],
    ["F5 - - G5 - Ab5 C6 - - Bb5 - Ab5", "Fm7"],
    ["G5 - Ab5 - G5 - F5 - D5 - C5 - B4 - D5 -", "G7"],
  ],
  s2bonus8: [
    ["C#6 C#6 F#6 - E6 - C#6 - A5 - B5 - C#6 - E6 -", "F#m"],
    ["F#5 - A5 B5 - C#6 D6 - C#6 - B5 - A5 -", "Dmaj7"],
    ["D6 - C#6 B5 - A5 F#5 - G#5 - A5 - B5 -", "Bm7"],
    ["G#5 A5 G#5 - F#5 F5 D5 - C#5 D5 F5 - G#5 - - -", "C#7"],
  ],
  s2bonus9: [
    ["E5 - A5 - C6 - B5 - A5 - G5 - E5 - D5 -", "Am"],
    ["C5 - F5 A5 - G5 F5 - E5 - D5 - C5 -", "Fmaj7"],
    ["D5 - F5 A5 - B5 C6 - B5 - A5 - G5 -", "Dm7"],
    ["G#5 - A5 - B5 - D6 - B5 - G#5 - E5 - - -", "E7"],
  ],
  s2bonus10: [
    ["A5 . D6 Eb6 D6 - C6 - A5 - G5 - F5 - E5 -", "Dm"],
    ["G5 - A5 Bb5 - C6 D6 - C6 - Bb5 - A5 -", "Gm7"],
    ["Ab5 - C6 Db6 - C6 Ab5 - G5 - F5 - Eb5 -", "Fm"],
    ["C#5 E5 G5 - A5 Bb5 A5 - G5 E5 D5 - C#5 - - -", "A7"],
  ],
  s2bonus11: [
    ["A5 - - G5 - F5 E5 - - D5 - F5", "Dm"],
    ["Bb5 - - A5 - G5 F5 - - D5 - E5", "Bbmaj7"],
    ["G5 - A5 Bb5 - A5 G5 - F5 - E5 - D5 -", "Gm7"],
    ["E5 - F5 - G5 - A5 - Bb5 - A5 - G5 - C#5 -", "A7"],
  ],
};

// Cues that need their own compact forms rather than a battle A/B structure.
const CUES: Partial<Record<BaseSagaTrack, [string, string][]>> = {
  s2alert: [
    ["F4 - - - - - Gb4 - F4 - - - E4 - - -", "Bbm"],
    ["Db5 - - - - - C5 - Bb4 - - - A4 - - -", "Gb"],
    ["Bb4 - - - E5 - - - F5 - E5 - Db5 - C5 -", "Bbdim"],
    ["A4 - - - - - Bb4 - A4 - - - . . . .", "F7"],
  ],
  s2alert2: [
    ["A4 - - D5 - - Eb5 - D5 - A4 - F4 - - -", "Dm"],
    ["Bb4 - - A4 - - G4 - F4 - E4 - D4 - - -", "Bb"],
    ["G4 - - Bb4 - - C5 - Db5 - C5 - Bb4 - G4 -", "Eb"],
    ["A4 - - Bb4 - - A4 - G4 - E4 - C#4 - E4 -", "A7"],
  ],
  s2alert3: [
    ["B4 - - C5 - - B4 - F#4 - - G4 - -", "Em"],
    ["C5 - - Db5 - - C5 - G4 - - Ab4 - -", "Fm"],
    ["C#5 - - D5 - - C#5 - G#4 - - A4 - -", "F#m"],
    ["D5 - - Eb5 - - D5 - A4 - - Bb4 - -", "Gm"],
    ["Eb5 - - E5 - - Eb5 - Bb4 - - B4 - -", "Abm"],
    ["F#5 - - E5 - - D#5 - B4 - - . . .", "B7"],
  ],
  s2pause: [
    // Sad: F minor on the piano, each phrase sinking.
    ["C5 - - - - - Ab4 - Bb4 - C5 - - - - -", "Fm"],
    ["Db5 - - - - - C5 - Bb4 - Ab4 - - - - -", "Db"],
    ["F4 - - - - - Ab4 - Bb4 - Db5 - - - - -", "Bbm"],
    ["C5 - - - - - Bb4 - G4 - - - - - . .", "C7"],
    ["Ab4 - - - - - G4 - F4 - Ab4 - C5 - - -", "Fm"],
    ["Db5 - - - - - C5 - Bb4 - - - F5 - - -", "Bbm"],
    ["Db5 - - - Bb4 - - - G4 - - - E4 - - -", "Gdim"],
    ["G4 - - - - - - - E4 - - - - - - -", "C7"],
  ],
  s2victory: [
    // Sad yet evil: a hollow win, Bb sinking to Gb and stopping on a tritone.
    ["Bb4 - D5 F5 - - Bb5 - - - A5 - F5 - - -", "Bb"],
    ["Gb5 - - - F5 - Db5 - - - Bb4 - Db5 - - -", "Gb"],
    ["E5 - - - - - - - Bb4 - - - - - . .", "Edim"],
  ],
  s2gameover: [
    // Sad yet evil: D minor falling, ending on the tritone above D.
    ["F5 - - - E5 - - - D5 - - - C#5 - - -", "Dm"],
    ["Bb4 - - - A4 - - - G4 - - - E4 - - -", "Gm"],
    ["G#4 - - - - - - - D4 - - - - - . .", "G#dim"],
  ],
  s2fanfare: [
    // Anger: B flat minor, struck again and again.
    ["Bb4 . Bb4 . Db5 . Bb4 . F5 - - - E5 - - -", "Bbm"],
    ["F5 . F5 . Gb5 - F5 - Bb5 - - - - - . .", "Bbm"],
  ],
};

const PC: Record<string, number> = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const pitchName = (m: number) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
const meter = (b: Bar) => b[0].trim().split(/\s+/).length;
const degreeScale = (quality: string) => quality === "dim" ? [0, 2, 3, 5, 6, 8, 9] : quality.startsWith("m") && !quality.startsWith("maj") ? [0, 2, 3, 5, 7, 8, 10] : quality === "7" ? [0, 2, 4, 5, 7, 9, 10] : [0, 2, 4, 5, 7, 9, 11];

function answerLine(bar: Bar, profile: Profile, index: number): string {
  const [, root, quality] = /^([A-G][#b]?)(.*)$/.exec(bar[1])!;
  const scale = degreeScale(quality), n = meter(bar), source = profile.answer.split(" ");
  const lead = bar[0].split(/\s+/).filter((c) => c !== "." && c !== "-");
  const mean = lead.reduce((sum, c) => { const m = /^([A-G][#b]?)(\d)$/.exec(c)!; return sum + PC[m[1]] + (Number(m[2]) + 1) * 12; }, 0) / lead.length;
  // Keep the counter below the melody, with alternating held and answering phrases.
  let base = 60 + PC[root];
  while (base + 7 > mean - 3) base -= 12;
  base = Math.max(48, base);
  const out = Array<string>(n).fill("-");
  for (let step = 0; step < n; step++) {
    const cell = source[Math.floor(step * 16 / n)];
    if (cell === "." || cell === "-") out[step] = cell;
    else {
      const degree = Number(cell);
      // An answering bar reverses the contour, anchored on the chord's fifth.
      const d = index % 2 ? 4 - degree : degree;
      out[step] = pitchName(base + scale[d]);
    }
  }
  // A hold after a rest stays silent; the engine's parser deliberately supports it.
  return out.join(" ");
}

const midiOf = (c: string) => { const m = /^([A-G][#b]?)(\d)$/.exec(c)!; return PC[m[1]] + (Number(m[2]) + 1) * 12; };
const notesOf = (lead: string) => lead.trim().split(/\s+/).filter((c) => /^[A-G]/.test(c)).map(midiOf);

/* A small piece of the original's DNA: one bar of its own melody, with its chord, takes the place of one bar
   of the new score, where a section begins (the second A of a long form, the B of a short one, the middle of
   a cue). It is the first bar of the original's theme that has no leap over an octave in it and, as it is or
   moved by an octave, joins the bars either side within an octave. A cue of three bars or fewer is left alone. */
function quoteOriginal(source: Bar[], original: Song, at: number) {
  if (source.length < 4 || at <= 0 || at >= source.length) return;
  const before = notesOf(source[at - 1][0]).at(-1)!, after = notesOf(source[(at + 1) % source.length][0])[0];
  for (const bar of original.bars.slice(original.intro ?? 0)) {
    const notes = notesOf(bar[0]);
    if (notes.length < 2 || notes.some((v, i) => i && Math.abs(v - notes[i - 1]) > 12)) continue;
    for (const shift of [0, -12, 12]) {
      if (Math.abs(notes[0] + shift - before) > 12 || Math.abs(after - (notes[notes.length - 1] + shift)) > 12) continue;
      source[at] = [bar[0].trim().split(/\s+/).map((c) => (/^[A-G]/.test(c) ? pitchName(midiOf(c) + shift) : c)).join(" "), bar[1]];
      return;
    }
  }
}

function riffFor(n: number, mood: Profile["mood"], late: boolean) {
  if (n === 14) return ["dread", "ruin", "dark", "evil"].includes(mood) ? "throb14" : "seven14";
  if (n === 12) return ["quiet", "ruin", "dark", "sad", "evil"].includes(mood) ? "hold12" : "six12";
  // A burnt hangar: a heartbeat on the root, then the root throbbing against its flat second and tritone.
  if (mood === "ruin") return late ? "ostinato16" : "pulse16";
  if (mood === "quiet") return late ? "hold16" : "pulse16";
  // Dark and evil throb on the root and its flat second; sorrow holds; anger pumps eighths.
  if (mood === "dark" || mood === "evil") return late ? "ostinato16" : "pulse16";
  if (mood === "sad") return "hold16";
  if (mood === "anger") return "pump16";
  if (mood === "dread") return "ostinato16";
  if (mood === "ceremony" || mood === "heroic") return "march16";
  return late ? "gallop16" : "slap16";
}

function arrange(id: BaseSagaTrack, original: Song): Song {
  const p = ASCENSION_PROFILES[id];
  if (id === "s2stage") return arrangeBattle(original, p);
  if (BOSS_SUITES[id]) return arrangeBoss(id, original, p);
  // Final Extremity II is the new 60-bar Codex composition commissioned with
  // this album. All other tracks use the replacement A/B themes or cue scores.
  const a = EPISODES[id], b = CONTRASTS[id], cue = CUES[id];
  // Final Extremity II and the later phases of Final Extremity keep their own scores here.
  const isFinale = ["s2bonus12", "s2bonus13", "s2bonus14", "s2bonus15"].includes(id);
  if (!isFinale && !cue && (!a || !b)) throw new Error(`Ascension: missing composition for ${id}`);
  const fierce = p.mood === "battle" || p.mood === "anger";
  const longForm = fierce || p.mood === "heroic" || p.mood === "dark";
  const written = cue ?? (a && b ? (longForm ? [...a, ...b, ...a, ...b] : [...a, ...b]) : []);
  const source: Bar[] = isFinale ? original.bars.map((bar) => [...bar]) : written.map(([lead, chord]) => [lead, chord]);
  if (!isFinale) quoteOriginal(source, original, longForm && !cue ? a!.length + b!.length : cue ? Math.floor(source.length / 2) : a!.length);
  if (original.intro && !isFinale) {
    const [, root] = /^([A-G][#b]?)/.exec(source[0][1])!;
    const root4 = 60 + PC[root], fifth4 = root4 + 7, root5 = root4 + 12;
    source.unshift([`${pitchName(root4)} - ${pitchName(fifth4)} - ${pitchName(root5)} - - - ${pitchName(fifth4)} - ${pitchName(root5)} - . . . .`, source[0][1], "hits16"]);
  }
  const bars: Bar[] = source.map((bar, i) => {
    const n = meter(bar);
    // Keep the finale's authored counterpoint; write a track-specific answer
    // for every other bar instead of using the previous album's second voice.
    const counter = bar[3] ?? answerLine(bar, p, i);
    const chord = p.mood === "quiet" && /^[A-G][#b]?$/.test(bar[1]) ? `${bar[1]}maj7` : bar[1];
    const riff = bar[2] ?? riffFor(n, p.mood, i >= source.length / 2);
    return [bar[0], chord, riff, counter];
  });
  let sections: Song["sections"];
  if (isFinale && original.sections) {
    sections = original.sections.map((s) => ({ ...s, pad: s.pad === "harp" ? "harp" : p.pad }));
  } else if (!original.once && ["battle", "anger", "heroic", "quiet", "ceremony"].includes(p.mood)) {
    const opening = original.intro ?? 0, middle = Math.max(opening + 1, Math.floor(bars.length / 2));
    const returnAt = Math.min(bars.length - 1, middle + Math.max(2, Math.floor(bars.length / 4)));
    sections = [
      { from: 0, layer: undefined, stabs: false },
      ...(opening ? [{ from: opening }] : []),
      { from: middle, lead: fierce ? "strings" as const : p.lead, layer: undefined, pad: "harp", stabs: false, drums: fierce ? "soft" : original.drums },
      { from: returnAt },
    ];
  }
  const fills = new Set(isFinale ? original.fills : undefined);
  const crashes = new Set(isFinale ? original.crashes : undefined);
  if (!isFinale && !cue && fierce) {
    const opening = original.intro ?? 0;
    fills.add(opening + 7); crashes.add(opening + 8);
  }
  const then = original.then ? `alt:${original.then}` as AlternateSagaTrack : undefined;
  // The title keeps the original Space 2 title's march kit, its own drums, with the engine's fill at the end of
  // every four-bar phrase and a crash opening the next.
  const titleDrums = id === "s2title";
  return {
    ...original, bpm: p.bpm, lead: p.lead, pad: p.pad, counter: p.counter,
    layer: fierce ? (p.lead === "organ" ? "lead" : "organ") : undefined,
    arps: false, stabs: fierce || p.mood === "ceremony",
    drums: titleDrums ? original.drums : p.mood === "ruin" || p.mood === "dark" || p.mood === "evil" ? "toms" : p.mood === "anger" ? "battle" : p.mood === "sad" ? "soft" : original.drums,
    // The original's written drums and bass belong to its own bars, not to these.
    bars, sections, then, performance: undefined,
    fills: titleDrums ? [3, 7, 11] : fills.size ? [...fills].sort((a, b) => a - b) : undefined,
    crashes: titleDrums ? [4, 8, 12] : crashes.size ? [...crashes].sort((a, b) => a - b) : undefined,
    riser: isFinale ? original.riser : undefined,
  };
}

/* Battle Theme (Variation 1), written whole (space2-ascension-battle.ts): the original's quote opens the violin's
   7/8, keeping that section's bass; the band changes with each part, as the written drum patterns do. */
function arrangeBattle(original: Song, p: Profile): Song {
  const source: Bar[] = BATTLE_BARS.map((bar) => [...bar] as Bar);
  const riff = source[BATTLE_MARKS.quote][2];
  quoteOriginal(source, original, BATTLE_MARKS.quote);
  const quoted = meter(source[BATTLE_MARKS.quote]);
  source[BATTLE_MARKS.quote][2] = quoted === 14 ? riff : quoted === 12 ? "hold12" : "pulse16";
  const performance = BATTLE_PERFORMANCE.map((bar, i) => (meter(source[i]) === meter(BATTLE_BARS[i]) ? bar : { gate: bar.gate }));
  const bars: Bar[] = source.map((bar, i) => [bar[0], bar[1], bar[2], answerLine(bar, p, i)]);
  const { theme, violin, guitar, climax, turn } = BATTLE_MARKS.sections;
  return {
    ...original, bpm: p.bpm, lead: p.lead, pad: p.pad, counter: p.counter, bassVoice: "picked",
    layer: undefined, arps: false, stabs: false, drums: "battle", bars, performance,
    sections: [
      { from: 0, lead: "guitar", pad: undefined, counter: "piano" },
      { from: theme, layer: "organ" },
      { from: violin, lead: "violin", pad: "strings", counter: "piano", bassVoice: "slap" },
      { from: guitar, lead: "guitar", pad: undefined, counter: "organ" },
      { from: climax, layer: "organ", stabs: true },
      { from: turn, lead: "guitar", counter: "piano" },
    ],
    crashes: [theme, guitar, climax], fills: undefined, riser: undefined,
  };
}

/* A boss's own score (space2-ascension-bosses.ts): the original's quote goes in at the start of the break,
   keeping the break's bass; each section changes the band, the gallop on guitar over the boss's own lead. */
function arrangeBoss(id: BaseSagaTrack, original: Song, p: Profile): Song {
  const source: Bar[] = BOSS_SUITES[id].map((bar) => [...bar] as Bar);
  const quoteRiff = source[SUITE_MARKS.quote][2];
  quoteOriginal(source, original, SUITE_MARKS.quote);
  // The quote keeps its own meter, so the quiet bass of the break is fitted to it.
  const quoted = meter(source[SUITE_MARKS.quote]);
  source[SUITE_MARKS.quote][2] = quoted === 16 ? quoteRiff : quoted === 12 ? "hold12" : "throb14";
  const bars: Bar[] = source.map((bar, i) => [bar[0], bar[1], bar[2], answerLine(bar, p, i)]);
  const layer = p.lead === "organ" ? "lead" : "organ";
  const { b, rest, gallop } = SUITE_MARKS.sections;
  return {
    ...original, bpm: p.bpm, lead: p.lead, pad: p.pad, counter: p.counter, layer,
    arps: false, stabs: true, drums: "battle", bars, performance: undefined,
    sections: [
      { from: 0, layer: undefined, stabs: false },
      { from: 1 },
      { from: b, lead: "violin", pad: "strings", layer: undefined },
      { from: rest, lead: p.lead === "organ" ? "brass" : "organ", layer: undefined, stabs: false },
      { from: gallop, lead: "guitar", layer: p.lead },
    ],
    fills: [SUITE_MARKS.fill], crashes: [SUITE_MARKS.crash], riser: SUITE_MARKS.riser,
  };
}

export function arrangeAscension(originals: Record<BaseSagaTrack, Song>): Record<AlternateSagaTrack, Song> {
  return Object.fromEntries((Object.entries(originals) as [BaseSagaTrack, Song][])
    .map(([id, song]) => [`alt:${id}`, arrange(id, song)])) as Record<AlternateSagaTrack, Song>;
}
