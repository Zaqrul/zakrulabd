/* Space 1's boss music: one track for each chapter's boss, on the NES voices (see space-music.ts
   for the notation and what pulse 2's jobs are). They take turns between the two traditions the
   music mixes: the fantasy epic's battle (a run up the harmonic minor to open, the chord broken in
   the bass, harp sweeps) and the handheld battle (pumping eighths, chip arpeggios, a twin lead).
   Each opens on that run, a bar that plays once, then
   sixteen bars: an A section of eight and a B section of eight, pulse 2 changing its job between
   them, and a turnaround on the dominant into the loop. Each has its own key, tempo, lead duty and
   bass. Every note is written for this game; it copies no existing tune. */
import type { Bar, Song } from "./space-music";

/* 1. Siege Tank, Iron Plains: C minor, a march that breaks into a drive, a full square lead. */
const SIEGE: Song = {
  bpm: 168, duty: 0.5, drums: "drive", riff: "broken", role: "harm", intro: 1,
  bars: [
    ["C4 D4 Eb4 F4 G4 Ab4 B4 C5 D5 Eb5 F5 G5 - - - -", "Cm", "hits", "stab"],
    ["C5 - - - - - G5 - Eb5 - - - D5 - C5 -", "Cm"],
    ["G5 - - - - - - - F5 - Eb5 - D5 - - -", "Cm"],
    ["Eb5 - - - C5 - - - Ab4 - - - C5 - Eb5 -", "Ab"],
    ["D5 - - - - - - - B4 - - - D5 - - -", "G"],
    ["G5 - - - Eb5 - G5 - C6 - - - Bb5 - G5 -", "Cm"],
    ["Ab5 - - - - - F5 - C5 - - - F5 - Ab5 -", "Fm"],
    ["G5 - - - B5 - - - D6 - - - B5 - G5 -", "G"],
    ["F5 - - - - - - - D5 - - - B4 - - -", "G7"],
    ["Eb5 - - - - - Ab5 - C6 - - - Ab5 - Eb5 -", "Ab", "arpbass", "sweep"],
    ["F5 - - - - - Bb5 - D6 - - - Bb5 - F5 -", "Bb", "arpbass", "sweep"],
    ["G5 - - - C6 - Eb6 - D6 - - - C6 - - -", "Cm", "arpbass", "sweep"],
    ["C6 - - - - - - - . . . . G5 - - -", "Cm", "arpbass", "sweep"],
    ["Ab5 - - - G5 - F5 - C5 - F5 - Ab5 - - -", "Fm", "gallop", "stab"],
    ["B5 - - - A5 - G5 - D5 - G5 - B5 - - -", "G", "gallop", "stab"],
    ["C6 - - - G5 - Eb5 - C5 - Eb5 - G5 - - -", "Cm", "gallop", "stab"],
    ["F5 - - - D5 - - - B4 - - - D5 - - -", "G7", "chrom", "stab"],
  ],
};

/* 2. Iron Flagship, Crimson Bay: D minor, a rolling sea-chase, its lead echoed across the water. */
const FLAGSHIP: Song = {
  bpm: 172, duty: 0.25, drums: "drive", riff: "pump", role: "echo", intro: 1,
  bars: [
    ["D4 E4 F4 G4 A4 Bb4 C#5 D5 E5 F5 G5 A5 - - - -", "Dm", "hits", "stab"],
    ["A5 - - - - - F5 - D5 - - - F5 - A5 -", "Dm"],
    ["Bb5 - - - - - - - F5 - - - D5 - - -", "Bb"],
    ["E5 - - - G5 - - - C6 - - - Bb5 - G5 -", "C"],
    ["A5 - - - - - - - C#5 - - - E5 - - -", "A"],
    ["F5 - - - A5 - D6 - - - C6 - A5 - F5 -", "Dm"],
    ["D5 - - - F5 - Bb5 - - - A5 - G5 - F5 -", "Bb"],
    ["G5 - - - Bb5 - - - D6 - - - C6 - Bb5 -", "Gm"],
    ["A5 - - - - - - - . . . . C#5 - E5 -", "A7"],
    ["F5 - - - A5 - C6 - - - A5 - F5 - - -", "F", "octave", "harm"],
    ["E5 - - - G5 - C6 - - - G5 - E5 - - -", "C", "octave", "harm"],
    ["D5 - - - F5 - A5 - D6 - - - C6 - A5 -", "Dm", "octave", "harm"],
    ["A5 - - - - - - - . . . . A5 - Bb5 -", "Dm", "octave", "harm"],
    ["D6 - - - - - Bb5 - F5 - - - Bb5 - D6 -", "Bb", "drive", "arp"],
    ["E6 - - - - - C6 - G5 - - - C6 - E6 -", "C", "drive", "arp"],
    ["E6 - - - C#6 - A5 - E5 - A5 - C#6 - - -", "A", "drive", "arp"],
    ["C#6 - - - - - - - A5 - - - E5 - G5 -", "A7", "chrom", "arp"],
  ],
};

/* 3. Artillery Hermit, Asteroid Belt: E minor, a lead in a steady 3+3+2 with the stabs and the bass
   locked to it, then a gallop. */
const HERMIT: Song = {
  bpm: 160, duty: 0.5, drums: "drive", riff: "drive", role: "stab", intro: 1,
  bars: [
    ["E4 F#4 G4 A4 B4 C5 D#5 E5 F#5 G5 A5 B5 - - - -", "Em", "hits"],
    /* The A section moves in a steady 3+3+2, notes on steps 0, 3, 6, 8, 10 and 13, so the
       stabs (0, 3, 6, 10) and the syncopated bass land with the lead. */
    ["E5 - - G5 - - B5 - A5 - G5 - - F#5 - -", "Em"],
    ["E5 - - B4 - - E5 - G5 - F#5 - - E5 - -", "Em"],
    ["G5 - - E5 - - G5 - C6 - B5 - - G5 - -", "C"],
    ["A5 - - F#5 - - A5 - D6 - C6 - - A5 - -", "D"],
    ["B5 - - G5 - - B5 - E6 - D6 - - B5 - -", "Em"],
    ["G5 - - E5 - - G5 - B5 - A5 - - G5 - -", "Em"],
    ["C6 - - A5 - - C6 - E6 - D6 - - C6 - -", "Am"],
    ["B5 - - F#5 - - D#5 - F#5 - - - - - - -", "B7"],
    ["G5 - - - - - E5 - C5 - - - E5 - G5 -", "C", "gallop", "arp"],
    ["A5 - - - - - F#5 - D5 - - - F#5 - A5 -", "D", "gallop", "arp"],
    ["B5 - - - - - G5 - E5 - - - G5 - B5 -", "Em", "gallop", "arp"],
    ["E6 - - - - - - - B5 - - - G5 - - -", "Em", "gallop", "arp"],
    ["A5 - - - C6 - - - E6 - - - C6 - A5 -", "Am", "drive", "harm"],
    ["B5 - - - A5 - - - F#5 - - - D#5 - - -", "B7", "drive", "harm"],
    ["E5 - - - G5 - - - B5 - - - E6 - - -", "Em", "drive", "harm"],
    ["D#6 - - - B5 - - - F#5 - - - D#5 - - -", "B7", "chrom", "harm"],
  ],
};

/* 4. Hive Carrier, Violet Nebula: F sharp minor, eerie, a thin lead over racing arpeggios. */
const HIVE: Song = {
  bpm: 152, duty: 0.125, drums: "drive", riff: "hold", role: "sweep", intro: 1,
  bars: [
    ["F#4 G#4 A4 B4 C#5 D5 F5 F#5 G#5 A5 B5 C#6 - - - -", "F#m", "hits"],
    ["C#5 - - - - - F#5 - A5 - - - G#5 - F#5 -", "F#m"],
    ["F#5 - - - - - - - D5 - - - A4 - - -", "D"],
    ["B4 - - - E5 - - - G#5 - - - F#5 - E5 -", "E"],
    ["E5 - - - - - - - C#5 - - - . . . .", "C#m"],
    ["A5 - - - - - C#6 - - - B5 - A5 - G#5 -", "F#m", "pump"],
    ["F#5 - - - A5 - - - D6 - - - C#6 - A5 -", "D", "pump"],
    ["B5 - - - - - F#5 - D5 - - - F#5 - B5 -", "Bm", "pump"],
    ["G#5 - - - - - - - F5 - - - . . . .", "C#7", "pump"],
    ["A5 - - - D6 - - - C#6 - - - A5 - - -", "D", "drive", "echo"],
    ["B5 - - - E6 - - - D6 - - - B5 - - -", "E", "drive", "echo"],
    ["C#6 - - - - - A5 - F#5 - - - A5 - C#6 -", "F#m", "drive", "echo"],
    ["C#6 - - - - - - - . . . . A5 - - -", "F#m", "drive", "echo"],
    ["B5 - - - - - F#5 - D5 - F#5 - B5 - - -", "Bm", "drive", "harm"],
    ["C#6 - - - - - G#5 - F5 - G#5 - C#6 - - -", "C#7", "drive", "harm"],
    ["A5 - - - - - F#5 - C#5 - F#5 - A5 - - -", "F#m", "drive", "harm"],
    ["G#5 - - - - - - - F5 - - - C#5 - - -", "C#7", "chrom", "harm"],
  ],
};

/* 5. Iron Leviathan, Frozen Rings: A minor and relentless, a galloping bass and a rushing kit. */
const LEVIATHAN: Song = {
  bpm: 176, duty: 0.25, drums: "rush", riff: "gallop", role: "echo", intro: 1,
  bars: [
    ["A4 B4 C5 D5 E5 F5 G#5 A5 B5 C6 D6 E6 - - - -", "Am", "hits", "stab"],
    ["A5 - - - E5 - - - A5 - B5 - C6 - B5 -", "Am"],
    ["A5 - - - - - - - E5 - D5 - C5 - B4 -", "Am"],
    ["C5 - - - F5 - - - A5 - - - G5 - F5 -", "F"],
    ["G5 - - - - - - - D5 - - - B4 - - -", "G"],
    ["C5 - - - E5 - A5 - - - C6 - - - E6 -", "Am", "gallop", "harm"],
    ["E6 - - - D6 - C6 - B5 - A5 - - - - -", "Am", "gallop", "harm"],
    ["F5 - - - A5 - C6 - - - A5 - F5 - - -", "F", "gallop", "harm"],
    ["G#5 - - - - - - - E5 - - - B4 - - -", "E", "gallop", "harm"],
    ["D5 - F5 - A5 - D6 - - - A5 - F5 - D5 -", "Dm", "octave", "arp"],
    ["E5 - G#5 - B5 - E6 - - - B5 - G#5 - E5 -", "E", "octave", "arp"],
    ["A5 - - - C6 - - - E6 - - - C6 - - -", "Am", "octave", "arp"],
    ["A5 - - - - - - - . . . . E5 - - -", "Am", "octave", "arp"],
    ["F5 - - - A5 - - - D6 - - - C6 - A5 -", "Dm", "drive", "stab"],
    ["G#5 - - - B5 - - - E6 - - - D6 - B5 -", "E", "drive", "stab"],
    ["A5 - - - C6 - - - F6 - - - E6 - C6 -", "F", "drive", "stab"],
    ["B5 - - - G#5 - - - E5 - - - D5 - - -", "E7", "chrom", "stab"],
  ],
};

/* 6. Solar Bomber, Solar Corona: B minor, a full lead and a twin under it, then a burning climb. */
const BOMBER: Song = {
  bpm: 164, duty: 0.5, drums: "drive", riff: "broken", role: "harm", intro: 1,
  bars: [
    ["B4 C#5 D5 E5 F#5 G5 A#5 B5 - - - - F#5 - - -", "Bm", "hits", "stab"],
    ["B5 - - - F#5 - - - D5 - - - F#5 - B5 -", "Bm"],
    ["B5 - - - - - G5 - D5 - - - G5 - - -", "G"],
    ["A5 - - - E5 - - - C#5 - - - E5 - A5 -", "A"],
    ["A#5 - - - - - - - F#5 - - - E5 - - -", "F#7"],
    ["D5 - - - F#5 - B5 - D6 - - - C#6 - B5 -", "Bm"],
    ["B5 - - - G5 - D5 - G5 - - - B5 - - -", "G"],
    ["E5 - - - G5 - B5 - E6 - - - D6 - B5 -", "Em"],
    ["C#6 - - - - - - - A#5 - - - . . . .", "F#7"],
    ["B5 - - - - - D6 - - - B5 - G5 - - -", "G", "pump", "arp8"],
    ["C#6 - - - - - E6 - - - C#6 - A5 - - -", "A", "pump", "arp8"],
    ["D6 - - - - - B5 - F#5 - - - B5 - D6 -", "Bm", "pump", "arp8"],
    ["D6 - - - - - - - . . . . B5 - - -", "Bm", "pump", "arp8"],
    ["B5 - - - G5 - - - D5 - - - G5 - B5 -", "G", "gallop", "arp"],
    ["C#6 - - - A5 - - - E5 - - - A5 - C#6 -", "A", "gallop", "arp"],
    ["A#5 - - - F#5 - - - C#5 - - - F#5 - A#5 -", "F#7", "gallop", "arp"],
    ["C#6 - - - - - - - A#5 - - - F#5 - - -", "F#7", "chrom", "arp"],
  ],
};

/* 7. Crimson Fang, Derelict Station: F minor, fast and chromatic, a duel. */
const FANG: Song = {
  bpm: 180, duty: 0.25, drums: "rush", riff: "arpbass", role: "arp", intro: 1,
  bars: [
    ["F4 G4 Ab4 Bb4 C5 Db5 E5 F5 G5 Ab5 Bb5 C6 - - - -", "Fm", "hits", "stab"],
    ["F5 - - - C6 - - - Ab5 - - - G5 - F5 -", "Fm"],
    ["E5 - F5 - - - - - C5 - - - F5 - Ab5 -", "Fm"],
    ["Ab5 - - - F5 - - - Db5 - - - F5 - Ab5 -", "Db"],
    ["G5 - - - - - - - E5 - - - C5 - - -", "C"],
    ["C5 - F5 - Ab5 - C6 - - - Bb5 - Ab5 - G5 -", "Fm", "drive", "echo"],
    ["Ab5 - - - G5 - F5 - E5 - F5 - G5 - Ab5 -", "Fm", "drive", "echo"],
    ["Bb5 - - - - - Gb5 - Db5 - - - Gb5 - Bb5 -", "Gb", "drive", "echo"],
    ["C6 - - - - - - - . . . . G5 - - -", "C", "drive", "echo"],
    ["Bb5 - - - Db6 - - - F6 - - - Db6 - Bb5 -", "Bbm", "gallop", "harm"],
    ["C6 - - - E6 - - - G5 - - - E5 - C5 -", "C", "gallop", "harm"],
    ["F5 - Ab5 - C6 - F6 - - - Eb6 - Db6 - C6 -", "Fm", "gallop", "harm"],
    ["C6 - - - - - - - . . . . Ab5 - - -", "Fm", "gallop", "harm"],
    ["Ab5 - - - Db6 - - - F6 - - - Db6 - - -", "Db", "octave", "stab"],
    ["G5 - - - Bb5 - - - Eb6 - - - Bb5 - - -", "Eb", "octave", "stab"],
    ["C6 - - - G5 - - - E5 - - - G5 - C6 -", "C", "octave", "stab"],
    ["Bb5 - - - G5 - - - E5 - - - C5 - - -", "C7", "chrom", "stab"],
  ],
};

/* 8. Dreadnought, the Fortress: in the manner of a console fantasy epic's organ-rock final battle.
   C minor, the full square lead doubled a third below so it sounds like an organ. A lament bass
   falls a semitone at a time (C, B, B flat, A, A flat, G) under pumping rock eighths; then a fast
   section of running arpeggios and echoes with a Neapolitan D flat; then a climax of long notes
   over a gallop and stabs, and a falling run home. The opening chords play once. */
const OPENING: Bar = ["C5 - - - Eb5 - - - G5 - - - C6 - - -", "Cm", "hits", "harm"];
const LAMENT: Bar[] = [
  ["G5 - - - - - - - Eb5 - - - G5 - C6 -", "Cm/3"],
  ["D6 - - - - - - - B5 - - - F5 - - -", "Bdim"],
  ["Bb5 - - - - - - - F5 - - - D5 - - -", "Bb"],
  ["C6 - - - - - - - A5 - - - Eb5 - - -", "Adim"],
  ["C6 - - - Eb6 - - - C6 - - - Ab5 - - -", "Ab"],
  ["B5 - - - - - - - D6 - - - G5 - - -", "G"],
  ["Ab5 - - - G5 - F5 - C5 - F5 - Ab5 - - -", "Fm"],
  ["B5 - - - - - - - F5 - - - D5 - - -", "G7"],
];
const RUSH: Bar[] = [
  ["C5 Eb5 G5 C6 - - Bb5 - G5 - Eb5 - G5 - Bb5 -", "Cm", "drive", "arp"],
  ["C6 - - - Ab5 - Eb5 - C5 - Eb5 - Ab5 - C6 -", "Ab", "drive", "arp"],
  ["C6 - - - Ab5 - F5 - C5 - F5 - Ab5 - C6 -", "Fm", "drive", "arp"],
  ["B5 - - - G5 - D5 - B4 - D5 - G5 - B5 -", "G", "drive", "arp"],
  ["Eb6 - D6 - C6 - G5 - Eb5 - G5 - C6 - D6 -", "Cm", "drive", "echo"],
  ["Db6 - - - Ab5 - F5 - Db5 - F5 - Ab5 - Db6 -", "Db", "drive", "echo"],
  ["C6 - - - G5 - - - Eb5 - - - C5 - - -", "Cm", "drive", "echo"],
  ["D5 - F5 - G5 - B5 - D6 - F6 - - - - -", "G7", "chrom", "echo"],
];
const CHOIR: Bar[] = [
  ["Eb6 - - - - - - - C6 - - - Ab5 - - -", "Ab", "gallop", "stab"],
  ["D6 - - - - - - - Bb5 - - - F5 - - -", "Bb", "gallop", "stab"],
  ["G5 - - - Bb5 - - - Eb6 - - - D6 - - -", "Eb", "gallop", "stab"],
  ["C6 - - - - - - - G5 - - - Eb5 - - -", "Cm", "gallop", "stab"],
  ["Ab5 - - - C6 - - - Eb6 - - - C6 - - -", "Ab", "gallop", "harm"],
  ["B5 - A5 - Ab5 - G5 - F5 - Eb5 - D5 - B4 -", "G7", "chrom", "echo"],
];
const DREADNOUGHT: Song = {
  bpm: 176, duty: 0.5, drums: "drive", riff: "pump", role: "harm", intro: 1,
  bars: [OPENING, ...LAMENT, ...RUSH, ...CHOIR],
};

/* Dreadnought's music follows its phases, as Atlas's does. From the fourth: a chromatic run up into
   the fast section, then the lament driven harder (its bars take this tune's riff and arpeggios).
   In the sixth: a run up a whole octave into the climax, then the fast section, faster still. */
export const DREADNOUGHT_RUSH: Song = {
  bpm: 184, duty: 0.5, drums: "rush", riff: "drive", role: "arp", intro: 1,
  bars: [["G4 Ab4 A4 Bb4 B4 C5 Db5 D5 Eb5 E5 F5 G5 - - - -", "G7", "hits", "stab"], ...RUSH, ...LAMENT],
};
export const DREADNOUGHT_LAST: Song = {
  bpm: 192, duty: 0.5, drums: "rush", riff: "gallop", role: "stab", intro: 1,
  bars: [["C5 D5 Eb5 F5 G5 Ab5 B5 C6 D6 Eb6 F6 - - - - -", "G7", "hits", "stab"], ...CHOIR, ...RUSH],
};

/* Index 0 is chapter 1's boss. */
export const BOSS_SONGS: Song[] = [SIEGE, FLAGSHIP, HERMIT, HIVE, LEVIATHAN, BOMBER, FANG, DREADNOUGHT];
