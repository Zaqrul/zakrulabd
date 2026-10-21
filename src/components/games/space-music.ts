/* Space 1's music: original tracks on the four voices of the NES, two pulse waves, a triangle and
   noise, used the way that console's composers used them. Pulse 1 carries the lead in a duty of
   the song's choosing, with a software vibrato on long notes. Pulse 2 changes its job bar by bar:
   a twin lead a chord tone under the melody, an echo of it three steps late, arpeggios of the
   chord, or stabs. The triangle plays a moving bass riff, and the noise a kit with open hats,
   crashes at each new section and a fill into the loop. Every note is written for this game; it
   copies no existing tune. The writing mixes two RPG traditions of that era: the console fantasy
   epic's broken-chord bass, harp-like sweeps and battle intros that run up a harmonic minor
   scale, and the handheld battle's pumping eighths, chip arpeggios and long heroic notes. The
   boss tracks live in space-boss-music.ts.

   The notes are written like a tracker, one string of sixteen 16th cells per bar: a note name
   starts a note, "-" holds the one before and "." is a rest. Each bar names its chord, and may
   name a bass riff (semitones above the chord's root, in the same cells) and pulse 2's job. The
   scheduler books each step on the audio clock a little ahead, so the tempo holds steady even
   when the page is busy. */
import { BOSS_SONGS, DREADNOUGHT_LAST, DREADNOUGHT_RUSH } from "./space-boss-music.ts";
import { BATTLE_BB, BATTLE_D, BATTLE_G, CROSSING, LANTERN, LAST_LIGHT, RIVAL, WANDERER } from "./space-bonus-music.ts";
import { CODEX_SPACE_1 } from "./space-codex-music.ts";
import { MORE_BATTLES, type MoreBattle } from "./space-battles-more.ts";
import type { Score, ScorePart } from "./space2-music.ts";

export type NesTrack =
  | "stage" | "stage2" | "stage3" | MoreBattle | "hangar" | "hangar2" | "hangar3" | "title" | "alert" | "alert2" | "alert3"
  | "victory" | "gameover" | "ending" | "pause" | "fanfare"
  | "boss1" | "boss2" | "boss3" | "boss4" | "boss5" | "boss6" | "boss7" | "boss8"
  /* Dreadnought's music follows its phases: the fast section from the fourth, the climax in the sixth. */
  | "boss8b" | "boss8c"
  /* A bonus tune for the soundtrack player in zakrulOS only; the game never plays it. */
  | "bonus1" | "bonus2" | "bonus3" | "bonus4" | "bonus5"
  /* Three more variations of the field battle tune, also for the soundtrack player only. */
  | "bonus6" | "bonus7" | "bonus8" | "bonus9";

/* Pulse 2's job in a bar: a twin lead, an echo, arpeggios in 16ths or eighths, a harp-like sweep up
   two octaves of the chord and back, stabs, or nothing. */
export type Role = "harm" | "echo" | "arp" | "arp8" | "sweep" | "stab" | "none";
export type Bar = [lead: string, chord: string, riff?: string, role?: Role];
export type Song = {
  bpm: number;
  /* Pulse 1's duty: 0.125 thin, 0.25 bright, 0.5 full. */
  duty?: 0.125 | 0.25 | 0.5;
  drums: "drive" | "rush" | "march" | "soft" | "heart" | "toll" | "none";
  riff: string;
  role: Role;
  bars: Bar[];
  intro?: number;
  once?: boolean;
  then?: NesTrack;
};

export const RIFFS: Record<string, string> = {
  /* The fantasy epic's battle bass, the chord broken in eighths or in 16ths. */
  broken: "0 . 7 . 12 . 7 . 0 . 7 . 12 . 7 .",
  arpbass: "0 7 12 7 0 7 12 7 0 7 12 7 0 7 12 7",
  /* The handheld battle's pumping eighths. */
  pump: "0 . 0 . 12 . 0 . 0 . 0 . 12 . 0 .",
  octave: "0 . 12 . 0 . 12 . 0 . 12 . 0 . 12 .",
  walk: "0 . . . 7 . . . 12 . . . 7 . . .",
  drive: "0 . 0 12 . 0 10 . 0 . 0 12 7 . 10 12",
  gallop: "0 0 12 0 0 12 0 0 10 10 12 10 7 7 5 7",
  march: "0 . . 0 0 . 7 . 0 . . 0 0 . 10 .",
  chrom: "0 . 12 . 0 11 12 . 0 . 12 . 7 6 5 3",
  hits: "0 . . 0 . . 0 . . . 0 . 0 . 0 .",
  /* A bass that bounces between the root and its octave, with the fifth and fourth to walk back on. */
  bounce: "0 . 12 . 0 . 7 . 0 . 12 . 0 7 5 7",
  /* A root that throbs against its flat second and its tritone, for a dungeon's dread. */
  throb: "0 . 12 . 1 . 12 . 0 . 12 . 6 . 12 .",
  hold: "0 - - - - - - - 7 - - - - - - -",
  sparse: "0 - - - - - - - - - - - - - - -",
};

/* k kick (the triangle's thump), s snare, h hat, o open hat; "." nothing. */
const KITS: Record<string, string> = {
  drive: "k h k h s h k h k h k h s h k o",
  rush: "k h k h s h k k k h k h s h k s",
  march: "k h s h k h s h k h s s k s s s",
  soft: "k . . . h . . . k . . . h . . .",
  heart: "k . . k . . . . . . . . . . . .",
  toll: "k . . . . . . . k . . k . . . .",
  fill: "k h s h k s s s s s s s s s s s",
};
const STAB_AT = [0, 3, 6, 10];

const STAGE: Song = {
  bpm: 150, duty: 0.25, drums: "drive", riff: "arpbass", role: "echo",
  bars: [
    ["B4 - E5 - G5 - - - F#5 - E5 - D5 - E5 -", "Em"],
    ["G5 - - - - - E5 - C5 - - - E5 - G5 -", "C"],
    ["A5 - - - F#5 - D5 - - - E5 - F#5 - A5 -", "D"],
    ["B5 - - - - - - - A5 - F#5 - D#5 - - -", "B7"],
    ["E5 - G5 - B5 - - - A5 - G5 - F#5 - G5 -", "Em"],
    ["E5 - - - G5 - C6 - - - B5 - A5 - G5 -", "C"],
    ["A5 - - - C6 - E6 - - - D6 - C6 - B5 -", "Am"],
    ["B5 - - - - - - - . . . . F#5 - B5 -", "B7"],
    ["C6 - - - - - G5 - E5 - G5 - C6 - - -", "C", "gallop", "arp"],
    ["D6 - - - - - A5 - F#5 - A5 - D6 - - -", "D", "gallop", "arp"],
    ["B5 - - - - - F#5 - D5 - F#5 - B5 - - -", "Bm", "gallop", "arp"],
    ["E6 - - - D6 - B5 - G5 - - - . . . .", "Em", "gallop", "arp"],
    ["A5 - - - B5 - C6 - E6 - - - D6 - C6 -", "Am", "drive", "harm"],
    ["B5 - - - A5 - F#5 - D#5 - - - F#5 - - -", "B7", "drive", "harm"],
    ["G5 - - - F#5 - E5 - B4 - - - E5 - G5 -", "Em", "drive", "harm"],
    ["F#5 - - - - - - - D#5 - - - B4 - - -", "B7", "chrom", "harm"],
  ],
};

/* The middle chapters' battle (3 to 5): A minor, the fantasy epic's broken-chord bass under a full
   twin lead, then the handheld battle's pumping eighths under racing arpeggios. */
const STAGE3: Song = {
  bpm: 156, duty: 0.5, drums: "drive", riff: "arpbass", role: "harm",
  bars: [
    ["E5 - - - A5 - - - C6 - - - B5 - A5 -", "Am"],
    ["A5 - - - - - - - F5 - - - C5 - - -", "F"],
    ["D5 - - - G5 - - - B5 - - - A5 - G5 -", "G"],
    ["G#5 - - - - - - - E5 - - - B4 - - -", "E"],
    ["C5 - - - E5 - A5 - - - G5 - E5 - C5 -", "Am"],
    ["D5 - - - F5 - A5 - - - G5 - F5 - D5 -", "Dm"],
    ["C5 - - - F5 - A5 - C6 - - - B5 - A5 -", "F"],
    ["G#5 - - - - - - - . . . . E5 - G#5 -", "E7"],
    ["A5 - - - - - C6 - E6 - - - D6 - C6 -", "Am", "pump", "arp"],
    ["B5 - - - - - G5 - D5 - - - G5 - B5 -", "G", "pump", "arp"],
    ["C6 - - - - - A5 - F5 - - - A5 - C6 -", "F", "pump", "arp"],
    ["B5 - - - - - - - G#5 - - - E5 - - -", "E", "pump", "arp"],
    ["F5 - - - A5 - - - D6 - - - C6 - A5 -", "Dm", "drive", "echo"],
    ["G#5 - - - B5 - - - E6 - - - D6 - B5 -", "E", "drive", "echo"],
    ["C6 - - - A5 - - - E5 - - - A5 - C6 -", "Am", "drive", "echo"],
    ["B5 - - - - - - - G#5 - - - E5 - - -", "E7", "chrom", "echo"],
  ],
};

/* The last three chapters' battle: B minor, harder, the bass pumping. */
const STAGE2: Song = {
  bpm: 160, duty: 0.25, drums: "rush", riff: "pump", role: "arp8",
  bars: [
    ["F#5 - - - B5 - - - A5 - F#5 - D5 - E5 -", "Bm"],
    ["D5 - - - B4 - - - D5 - G5 - B5 - - -", "G"],
    ["C#6 - - - A5 - - - E5 - A5 - C#6 - - -", "A"],
    ["A#5 - - - - - - - F#5 - - - E5 - C#5 -", "F#7"],
    ["D5 - F#5 - B5 - D6 - - - C#6 - B5 - A5 -", "Bm"],
    ["B5 - - - G5 - - - D5 - - - G5 - A5 -", "G"],
    ["B5 - - - G5 - E5 - G5 - B5 - E6 - - -", "Em"],
    ["C#6 - - - - - - - A#5 - - - . . . .", "F#7"],
    ["B5 - - - D6 - - - G5 - - - B5 - - -", "G", "pump", "harm"],
    ["C#6 - - - E6 - - - A5 - - - C#6 - - -", "A", "pump", "harm"],
    ["D6 - - - - - A5 - F#5 - A5 - D6 - - -", "D", "pump", "harm"],
    ["D6 - - - - - - - B5 - - - F#5 - - -", "Bm", "pump", "harm"],
    ["G5 - - - B5 - E6 - - - D6 - B5 - G5 -", "Em", "gallop", "arp"],
    ["A#5 - - - C#6 - E6 - - - C#6 - A#5 - F#5 -", "F#7", "gallop", "arp"],
    ["B5 - - - F#5 - D5 - B4 - D5 - F#5 - - -", "Bm", "drive", "echo"],
    ["E5 - - - - - - - C#5 - - - A#4 - - -", "F#7", "chrom", "echo"],
  ],
};

/* The title: C major, a heroic twin lead that turns to arpeggios for the climb. */
const TITLE: Song = {
  bpm: 150, duty: 0.25, drums: "drive", riff: "broken", role: "harm",
  bars: [
    ["E5 - - - G5 - C6 - - - B5 - C6 - D6 -", "C"],
    ["B5 - - - G5 - - - D5 - - - G5 - - -", "G"],
    ["C6 - - - A5 - E5 - - - A5 - B5 - C6 -", "Am"],
    ["A5 - - - - - - - F5 - G5 - A5 - - -", "F"],
    ["G5 - - - E5 - G5 - C6 - - - E6 - - -", "C"],
    ["D6 - - - B5 - G5 - - - A5 - B5 - - -", "G"],
    ["A5 - - - C6 - - - F5 - - - A5 - - -", "F"],
    ["G5 - - - - - - - . . . . D5 - G5 -", "G"],
    ["A5 - - - - - E5 - A5 - B5 - C6 - - -", "Am", "drive"],
    ["C6 - - - - - A5 - F5 - G5 - A5 - - -", "F", "drive"],
    ["G5 - - - - - E5 - C5 - D5 - E5 - - -", "C", "drive"],
    ["D5 - - - - - - - G5 - - - B5 - - -", "G", "drive"],
    ["C6 - - - A5 - C6 - F6 - - - E6 - D6 -", "F", "drive", "arp"],
    ["D6 - - - B5 - G5 - B5 - - - D6 - - -", "G", "drive", "arp"],
    ["E6 - - - C6 - G5 - E5 - G5 - C6 - - -", "C", "drive", "arp"],
    ["B5 - - - - - - - D5 - F5 - G5 - - -", "G7", "chrom", "harm"],
  ],
};

/* The hangar: F major and unhurried, a thin lead over harp-like sweeps and a walking bass. */
const HANGAR: Song = {
  bpm: 104, duty: 0.125, drums: "soft", riff: "walk", role: "sweep",
  bars: [
    ["A5 - - - - - C6 - - - A5 - G5 - F5 -", "F"],
    ["G5 - - - - - - - E5 - - - C5 - - -", "C"],
    ["F5 - - - - - A5 - D6 - - - C6 - - -", "Dm"],
    ["Bb5 - - - - - - - A5 - - - G5 - - -", "Bb"],
    ["A5 - - - C6 - - - F6 - - - E6 - - -", "F"],
    ["E6 - - - D6 - - - C6 - - - G5 - - -", "C"],
    ["F5 - - - G5 - - - Bb5 - - - A5 - G5 -", "Bb"],
    ["G5 - - - - - - - . . . . . . . .", "C"],
    ["E5 - - - - - A5 - C6 - - - B5 - A5 -", "Am"],
    ["A5 - - - - - F5 - D5 - - - F5 - A5 -", "Dm"],
    ["Bb5 - - - - - G5 - D5 - - - G5 - Bb5 -", "Gm"],
    ["C6 - - - Bb5 - - - G5 - - - E5 - - -", "C7"],
  ],
};

/* Two more hangars, taking turns with the first by chapter: a G major town tune over the broken
   chord and eighth-note arpeggios, and a G minor resting song over harp sweeps. */
const HANGAR2: Song = {
  bpm: 112, duty: 0.25, drums: "soft", riff: "broken", role: "arp8",
  bars: [
    ["D5 - - - G5 - - - B5 - - - A5 - G5 -", "G"],
    ["E5 - - - - - - - B4 - - - E5 - - -", "Em"],
    ["C5 - - - E5 - - - G5 - - - F#5 - E5 -", "C"],
    ["D5 - - - - - - - A4 - - - D5 - - -", "D"],
    ["B5 - - - D6 - - - G5 - - - B5 - - -", "G"],
    ["A5 - - - F#5 - - - D5 - - - F#5 - - -", "Bm"],
    ["E5 - - - G5 - - - C6 - - - B5 - A5 -", "C"],
    ["A5 - - - - - - - . . . . D5 - - -", "D"],
    ["G5 - - - - - B5 - E5 - - - G5 - - -", "Em", "broken", "harm"],
    ["E5 - - - - - G5 - C5 - - - E5 - - -", "C", "broken", "harm"],
    ["C6 - - - B5 - - - A5 - - - E5 - - -", "Am", "broken", "harm"],
    ["F#5 - - - - - - - A5 - - - C6 - - -", "D7", "broken", "harm"],
  ],
};

const HANGAR3: Song = {
  bpm: 96, duty: 0.125, drums: "soft", riff: "hold", role: "sweep",
  bars: [
    ["D5 - - - - - G5 - Bb5 - - - A5 - - -", "Gm"],
    ["G5 - - - - - - - Eb5 - - - - - - -", "Eb"],
    ["F5 - - - - - Bb5 - D6 - - - C6 - - -", "Bb"],
    ["C6 - - - - - - - A5 - - - F5 - - -", "F"],
    ["G5 - - - Bb5 - - - D6 - - - C6 - Bb5 -", "Gm"],
    ["C6 - - - - - - - G5 - - - Eb5 - - -", "Cm"],
    ["G5 - - - F5 - - - Eb5 - - - D5 - - -", "Eb"],
    ["F#5 - - - - - - - A5 - - - C6 - - -", "D7"],
  ],
};

/* Before a boss: A minor, slow, a heartbeat kick, the lead sinking a half step at a time and its
   echo trailing behind. */
const ALERT: Song = {
  bpm: 96, duty: 0.125, drums: "heart", riff: "sparse", role: "echo",
  bars: [
    ["A4 - - - - - - - - - - - - - - -", "Am"],
    ["Bb4 - - - - - - - A4 - - - - - - -", "Bb"],
    ["C5 - - - - - - - B4 - - - Bb4 - - -", "Am"],
    ["A4 - - - - - - - G#4 - - - - - - -", "E"],
    ["E5 - - - - - - - - - - - - - - -", "Am"],
    ["F5 - - - - - - - E5 - - - - - - -", "F"],
    ["D5 - - - - - - - F5 - - - E5 - - -", "Dm"],
    ["D5 - - - - - - - G#4 - - - - - - -", "E"],
  ],
};

/* Two more warnings, taking turns with the first by chapter: a D minor dungeon over a throbbing
   root, and chords climbing a semitone at a time in E minor over a tolling kick. */
const ALERT2: Song = {
  bpm: 104, duty: 0.25, drums: "heart", riff: "throb", role: "echo",
  bars: [
    ["A4 - - - - - - - D5 - - - - - - -", "Dm"],
    ["D5 - - - - - - - F5 - - - - - - -", "Bb"],
    ["G5 - - - - - - - F5 - - - D5 - - -", "Gm"],
    ["E5 - - - - - - - C#5 - - - - - - -", "A"],
    ["F5 - - - - - - - E5 - - - D5 - - -", "Dm"],
    ["Eb5 - - - - - - - G5 - - - - - - -", "Eb"],
    ["E5 - - - - - - - G5 - - - Bb5 - - -", "C#dim"],
    ["A5 - - - - - - - C#5 - - - E5 - - -", "A7"],
  ],
};

const ALERT3: Song = {
  bpm: 88, duty: 0.125, drums: "toll", riff: "sparse", role: "harm",
  bars: [
    ["E5 - - - - - - - B4 - - - - - - -", "Em"],
    ["F5 - - - - - - - C5 - - - - - - -", "F"],
    ["F#5 - - - - - - - C#5 - - - - - - -", "F#m"],
    ["G5 - - - - - - - D5 - - - - - - -", "G"],
    ["Ab5 - - - - - - - Eb5 - - - - - - -", "Ab"],
    ["A5 - - - - - - - E5 - - - - - - -", "A"],
    ["B5 - - - A5 - - - F#5 - - - D#5 - - -", "B7"],
    ["F#5 - - - - - - - B4 - - - - - - -", "B7"],
  ],
};

/* The boss falls: a C major fanfare, then the hangar for the debrief. */
const VICTORY: Song = {
  bpm: 160, duty: 0.5, drums: "march", riff: "hold", role: "harm", once: true, then: "hangar",
  bars: [
    ["C5 E5 G5 C6 - - G5 - C6 - D6 - E6 - - -", "C"],
    ["C6 - - - - - - - - - - - . . . .", "C"],
  ],
};

/* The ship is lost: a line falling to A, once, then quiet. */
const GAMEOVER: Song = {
  bpm: 84, duty: 0.125, drums: "none", riff: "sparse", role: "none", once: true,
  bars: [
    ["F5 - - - E5 - - - D5 - - - C5 - - -", "Dm"],
    ["A4 - - - - - - - - - - - . . . .", "Am"],
  ],
};

/* The end of the game: a G major anthem, the twin lead giving way to harp sweeps in the middle. */
const ENDING: Song = {
  bpm: 112, duty: 0.25, drums: "march", riff: "walk", role: "harm",
  bars: [
    ["B4 - - - D5 - - - G5 - - - - - F#5 -", "G"],
    ["F#5 - - - A5 - - - D5 - - - - - - -", "D"],
    ["E5 - - - G5 - - - B5 - - - A5 - G5 -", "Em"],
    ["G5 - - - - - - - E5 - - - - - - -", "C"],
    ["D5 - - - G5 - - - B5 - - - D6 - - -", "G"],
    ["C6 - - - A5 - - - F#5 - G5 - A5 - - -", "D"],
    ["G5 - - - E5 - - - C6 - - - B5 - A5 -", "C"],
    ["A5 - - - - - - - . . . . D5 - - -", "D"],
    ["G5 - - - - - B5 - E6 - - - D6 - - -", "Em", "broken", "sweep"],
    ["C6 - - - - - G5 - E5 - - - G5 - - -", "C", "broken", "sweep"],
    ["B5 - - - - - G5 - D5 - - - G5 - - -", "G", "broken", "sweep"],
    ["A5 - - - - - F#5 - D5 - - - A5 - - -", "D", "broken", "sweep"],
    ["G5 - - - E5 - G5 - C6 - - - E6 - - -", "C"],
    ["D6 - - - C6 - - - A5 - - - F#5 - - -", "D"],
    ["G5 - - - B5 - - - D6 - - - B5 - - -", "G"],
    ["G5 - - - - - - - - - - - . . . .", "G"],
  ],
};

/* The pause: a music box in F, long notes over eighth-note arpeggios, no drums. */
const PAUSE: Song = {
  bpm: 88, duty: 0.125, drums: "none", riff: "sparse", role: "arp8",
  bars: [
    ["C6 - - - - - - - A5 - - - - - - -", "F"],
    ["C6 - - - - - - - E5 - - - - - - -", "Am"],
    ["D6 - - - - - - - F5 - - - - - - -", "Bb"],
    ["E5 - - - - - - - G5 - - - - - - -", "C"],
    ["A5 - - - - - - - C6 - - - - - - -", "F"],
    ["F5 - - - - - - - A5 - - - - - - -", "Dm"],
    ["D5 - - - - - - - G5 - - - - - - -", "Bb"],
    ["E5 - - - - - - - . . . . . . . .", "C7"],
  ],
};

/* The fanfare as the ship leaves the rail: a D major call, once, over before the stage tune. */
const FANFARE: Song = {
  bpm: 180, duty: 0.5, drums: "none", riff: "hold", role: "harm", once: true,
  bars: [["A4 D5 F#5 A5 D6 - - - C#6 - D6 - - - - -", "D"]],
};

export const SONGS: Record<NesTrack, Song> = {
  ...MORE_BATTLES,
  stage: STAGE, stage2: STAGE2, stage3: STAGE3, title: TITLE, hangar: HANGAR, hangar2: HANGAR2, hangar3: HANGAR3,
  alert: ALERT, alert2: ALERT2, alert3: ALERT3, victory: VICTORY, gameover: GAMEOVER,
  ending: ENDING, pause: PAUSE, fanfare: FANFARE,
  boss1: BOSS_SONGS[0], boss2: BOSS_SONGS[1], boss3: BOSS_SONGS[2], boss4: BOSS_SONGS[3],
  boss5: BOSS_SONGS[4], boss6: BOSS_SONGS[5], boss7: BOSS_SONGS[6], boss8: BOSS_SONGS[7],
  boss8b: DREADNOUGHT_RUSH, boss8c: DREADNOUGHT_LAST,
  bonus1: WANDERER, bonus2: LANTERN, bonus3: RIVAL, bonus4: CROSSING, bonus5: LAST_LIGHT,
  bonus6: BATTLE_D, bonus7: BATTLE_G, bonus8: BATTLE_BB,
  bonus9: CODEX_SPACE_1,
};

const NOTE: Record<string, number> = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
export function midiOf(name: string) {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return (Number(m[2]) + 1) * 12 + NOTE[m[1]];
}
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const QUALITY: Record<string, number[]> = { "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], sus: [0, 5, 7], dim: [0, 3, 6] };
/* A chord name, with its root in octave 2 unless it ends "/3" (or another octave), so a bass line
   can step down across C. */
function chordOf(name: string) {
  const m = /^([A-G][#b]?)([^/]*)(?:\/(\d))?$/.exec(name);
  if (!m || !QUALITY[m[2]]) throw new Error(`bad chord ${name}`);
  const root = midiOf(`${m[1]}${m[3] ?? 2}`);
  return { root, classes: QUALITY[m[2]].map((i) => (root + i) % 12), tones: QUALITY[m[2]].map((i) => root + 12 + i) };
}

export type Cell = { at: number; value: number; len: number };
export function cells(line: string, value: (c: string) => number): Cell[] {
  const out: Cell[] = [];
  line.trim().split(/\s+/).forEach((c, i) => {
    if (c === "-") { const last = out[out.length - 1]; if (last && last.at + last.len === i) last.len += 1; }
    else if (c !== ".") out.push({ at: i, value: value(c), len: 1 });
  });
  return out;
}

/* Each song laid out step by step, checked as the module loads. */
type Plan = { steps: number; lead: Map<number, Cell>; bass: Map<number, Cell>[]; chords: ReturnType<typeof chordOf>[]; low: number[] };
const PLANS = {} as Record<NesTrack, Plan>;
for (const [track, song] of Object.entries(SONGS) as [NesTrack, Song][]) {
  const plan: Plan = { steps: song.bars.length * 16, lead: new Map(), bass: [], chords: [], low: [] };
  song.bars.forEach(([lead, chord, riff = song.riff], b) => {
    if (lead.trim().split(/\s+/).length !== 16) throw new Error(`${track} bar ${b + 1}: a bar needs 16 cells`);
    if (!RIFFS[riff]) throw new Error(`${track} bar ${b + 1}: no riff ${riff}`);
    plan.chords.push(chordOf(chord));
    const notes = cells(lead, midiOf);
    for (const c of notes) plan.lead.set(b * 16 + c.at, c);
    plan.low.push(notes.length ? Math.min(...notes.map((c) => c.value)) : 72);
    plan.bass.push(new Map(cells(RIFFS[riff], Number).map((c) => [c.at, c])));
  });
  PLANS[track] = plan;
}

/* A pulse wave of the given duty, built from its harmonics. */
function pulseWave(ctx: AudioContext, duty: number) {
  const n = 32, real = new Float32Array(n), imag = new Float32Array(n);
  for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
  return ctx.createPeriodicWave(real, imag);
}

/* How far ahead the notes are queued. Raised from 0.12 s: a frame that took longer than that (some did, in the
   busiest chapters) left a gap in the music. */
const LOOKAHEAD = 0.3;
/* A tune that is replaced fades out over this many seconds, not a hard cut. */
const FADE_OUT = 0.25;
const TICK_MS = 25;

/* The noise kit as General MIDI drum notes, for the studio. */
const NOISE_GM: Record<string, number> = { k: 36, s: 38, h: 42, o: 46, c: 49 };

export class NesMusic {
  private ctx: AudioContext | null = null;
  private out: AudioNode | null = null;
  private requested: NesTrack | null = null;
  private track: NesTrack = "stage";
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;
  private waves: Record<number, PeriodicWave> = {};
  private noise: AudioBuffer | null = null;
  /* Each tune plays through a fader of its own, so it can fade out while the next begins. */
  private fader: GainNode | null = null;

  get playing(): NesTrack | null {
    return this.timer ? this.track : null;
  }

  private prepare(ctx: AudioContext, out: AudioNode) {
    if (this.ctx !== ctx) {
      this.waves = { 0.125: pulseWave(ctx, 0.125), 0.25: pulseWave(ctx, 0.25), 0.5: pulseWave(ctx, 0.5) };
      const len = Math.floor(ctx.sampleRate * 0.7);
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    this.ctx = ctx;
    this.fader = ctx.createGain();
    this.fader.connect(out);
    this.out = this.fader;
  }

  /* Asking again for what was last asked for, or for what is already playing, changes nothing, so
     a jingle is not restarted every frame, and one that has finished stays finished. */
  start(ctx: AudioContext, out: AudioNode, track: NesTrack, from = 0) {
    if (this.ctx === ctx && (this.requested === track || (this.timer && this.track === track))) {
      this.requested = track;
      return;
    }
    this.stop(this.timer ? FADE_OUT : 0);
    this.prepare(ctx, out);
    this.requested = track;
    /* `from` is where in a looping tune to begin, in seconds (a tune picked up again after a pause). */
    const song = SONGS[track], plan = PLANS[track], stepSec = 60 / song.bpm / 4;
    this.play(track, ctx.currentTime + 0.05, !song.once && from > 0 ? Math.floor(from / stepSec) % plan.steps : 0);
  }

  private play(track: NesTrack, at: number, step = 0) {
    this.track = track;
    this.step = step;
    this.nextTime = at;
    if (!this.timer) this.timer = setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  /* Stops the tune: at once, or, with `fade` seconds, by fading it away (the next tune has a fader of its own). */
  stop(fade = 0) {
    if (this.timer) clearInterval(this.timer);
    const fader = this.fader;
    if (fade > 0 && this.timer && fader && this.ctx) {
      const now = this.ctx.currentTime;
      fader.gain.cancelScheduledValues(now);
      fader.gain.setValueAtTime(fader.gain.value, now);
      fader.gain.linearRampToValueAtTime(0, now + fade);
      setTimeout(() => fader.disconnect(), (fade + 0.5) * 1000);
    }
    this.timer = null;
    this.requested = null;
  }

  /* The take-off fanfare: played once over whatever was playing. */
  fanfare(ctx: AudioContext, out: AudioNode) {
    this.start(ctx, out, "fanfare");
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.out || !this.timer) return;
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.02;
    while (this.timer && this.nextTime < ctx.currentTime + LOOKAHEAD) {
      const song = SONGS[this.track], plan = PLANS[this.track];
      if (this.step >= plan.steps) {
        if (song.once) {
          if (song.then) { this.play(song.then, this.nextTime); continue; }
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        this.step = (song.intro ?? 0) * 16;
      }
      const stepSec = 60 / song.bpm / 4;
      this.playStep(song, plan, this.step, this.nextTime, stepSec);
      this.step += 1;
      this.nextTime += stepSec;
    }
  }

  private pulse(duty: number, midi: number, at: number, dur: number, level: number, vibrato = false) {
    const ctx = this.ctx!, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.setPeriodicWave(this.waves[duty]);
    osc.frequency.setValueAtTime(freq(midi), at);
    /* The NES envelope: a hard start, a quick fall to a held level, and a clean stop. */
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(level * 0.6, at + Math.min(0.08, dur * 0.5));
    gain.gain.setValueAtTime(level * 0.6, at + dur * 0.92);
    gain.gain.linearRampToValueAtTime(0, at + dur);
    /* A software vibrato on a long note, setting in after it has sounded a moment. */
    if (vibrato && dur > 0.3) {
      const lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = 6;
      depth.gain.setValueAtTime(0, at);
      depth.gain.linearRampToValueAtTime(14, at + 0.25);
      lfo.connect(depth).connect(osc.detune);
      lfo.start(at);
      lfo.stop(at + dur + 0.01);
    }
    osc.connect(gain).connect(this.out!);
    osc.start(at);
    osc.stop(at + dur + 0.01);
  }

  private triangle(midi: number, at: number, dur: number, level: number) {
    const ctx = this.ctx!, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq(midi), at);
    gain.gain.setValueAtTime(level, at);
    gain.gain.setValueAtTime(level, at + dur * 0.9);
    gain.gain.linearRampToValueAtTime(0, at + dur);
    osc.connect(gain).connect(this.out!);
    osc.start(at);
    osc.stop(at + dur + 0.01);
  }

  private hit(at: number, len: number, level: number, filter: BiquadFilterType, f: number) {
    const ctx = this.ctx!, src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), gain = ctx.createGain();
    src.buffer = this.noise;
    flt.type = filter;
    flt.frequency.setValueAtTime(f, at);
    gain.gain.setValueAtTime(level, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + len);
    src.connect(flt).connect(gain).connect(this.out!);
    src.start(at);
    src.stop(at + len);
  }

  private drum(kind: string, at: number) {
    if (kind === "k") {
      const ctx = this.ctx!, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, at);
      osc.frequency.exponentialRampToValueAtTime(45, at + 0.09);
      gain.gain.setValueAtTime(0.32, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.1);
      osc.connect(gain).connect(this.out!);
      osc.start(at);
      osc.stop(at + 0.11);
    } else if (kind === "s") this.hit(at, 0.11, 0.16, "bandpass", 1800);
    else if (kind === "h") this.hit(at, 0.025, 0.035, "highpass", 8000);
    else if (kind === "o") this.hit(at, 0.12, 0.05, "highpass", 7000);
    else if (kind === "c") this.hit(at, 0.6, 0.1, "highpass", 5000);
  }

  /* The chord's tones for an arpeggio, in the highest octave that stays under the bar's lead. */
  private arpTones(plan: Plan, b: number) {
    const t = plan.chords[b].tones, up = [t[0], t[1], t[2], t[0] + 12];
    let shift = 24;
    while (shift > -12 && Math.max(...up) + shift >= plan.low[b]) shift -= 12;
    return up.map((m) => m + shift);
  }

  /* A tune as the notes it plays, for the studio to open (space2-music.ts has the same for Space 2): the score run
     through playStep once with the sound replaced by a list. Pulse 1 (the lead) and pulse 2 play on the band's chip,
     the triangle bass on the picked bass, and the noise kit on the drums. */
  static score(track: NesTrack): Score {
    const song = SONGS[track], plan = PLANS[track], stepSec = 60 / song.bpm / 4;
    const parts = new Map<string, ScorePart>();
    const add = (name: string, voice: ScorePart["voice"], pitch: number, at: number, dur: number, vel: number) => {
      if (!parts.has(name)) parts.set(name, { name, voice, notes: [] });
      parts.get(name)!.notes.push({ pitch, step: at / stepSec, steps: Math.max(0.25, dur / stepSec), vel });
    };
    const m = new NesMusic();
    m.pulse = (_duty, midi, at, dur, level) => add(level === 0.075 ? "Pulse 1 (lead)" : "Pulse 2", "chip", midi, at, dur, level / 0.11);
    m.triangle = (midi, at, dur) => add("Triangle (bass)", "pickedBass", midi, at, dur, 1);
    m.drum = (kind, at) => add("Noise (drums)", "drums", NOISE_GM[kind] ?? 37, at, stepSec, 1);
    for (let step = 0; step < song.bars.length * 16; step++) m.playStep(song, plan, step, step * stepSec, stepSec);
    return { bpm: song.bpm, parts: [...parts.values()] };
  }

  private playStep(song: Song, plan: Plan, step: number, at: number, stepSec: number) {
    const b = Math.floor(step / 16), pos = step % 16, bar = song.bars[b], chord = plan.chords[b];
    const role = bar[3] ?? song.role, duty = song.duty ?? 0.25;

    const lead = plan.lead.get(step);
    if (lead) this.pulse(duty, lead.value, at, lead.len * stepSec * 0.95, 0.075, lead.len >= 4);

    /* Pulse 2. */
    if (role === "harm" && lead) {
      /* The nearest chord tone at least a minor third under the lead. */
      let h = lead.value - 3;
      while (!chord.classes.includes(((h % 12) + 12) % 12)) h -= 1;
      this.pulse(0.125, h, at, lead.len * stepSec * 0.95, 0.045);
    } else if (role === "echo") {
      const back = plan.lead.get(step - 3);
      if (back && step - 3 >= b * 16) this.pulse(0.125, back.value, at, back.len * stepSec * 0.9, 0.03);
    } else if (role === "sweep") {
      /* Up two octaves of the chord and back down, in 16ths, under the lead. */
      const t = this.arpTones(plan, b).slice(0, 3), span = [...t, ...t.map((m) => m + 12)].filter((m) => m < plan.low[b]);
      const ladder = span.length ? span : t, k = pos % (ladder.length * 2 - 2 || 1);
      this.pulse(0.125, ladder[k < ladder.length ? k : ladder.length * 2 - 2 - k], at, stepSec * 0.9, 0.028);
    } else if (role === "arp" || (role === "arp8" && pos % 2 === 0)) {
      const tones = this.arpTones(plan, b), order = [0, 1, 2, 3, 2, 1], i = role === "arp" ? pos : pos / 2;
      this.pulse(0.125, tones[order[i % order.length]], at, stepSec * (role === "arp" ? 0.8 : 1.6), 0.03);
    } else if (role === "stab" && STAB_AT.includes(pos)) {
      for (const tone of this.arpTones(plan, b).slice(0, 3)) this.pulse(0.125, tone, at, stepSec * 1.4, 0.022);
    }

    const bass = plan.bass[b].get(pos);
    if (bass) this.triangle(chord.root + bass.value, at, bass.len * stepSec * 0.9, 0.2);

    if (song.drums === "none") return;
    const quiet = song.drums === "soft" || song.drums === "heart" || song.drums === "toll";
    const last = !song.once && b === song.bars.length - 1 && !quiet;
    const kit = KITS[last ? "fill" : song.drums].split(/\s+/);
    if (kit[pos] !== ".") this.drum(kit[pos], at);
    /* A crash marks the start of the song, of the loop, and of each section where pulse 2 changes job. */
    const prevRole = b > 0 ? song.bars[b - 1][3] ?? song.role : null;
    if (pos === 0 && !quiet && (b === 0 || b === (song.intro ?? 0) || prevRole !== role)) this.drum("c", at);
  }
}
