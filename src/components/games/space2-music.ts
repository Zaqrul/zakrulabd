/* Space 2's music, a world away from Space 1's chiptune: a 16-bit console orchestra of brass,
   strings, synth lead, organ and bells over a plucked synth bass and a full drum kit, through a
   hall reverb and a console-style echo. The battles take after the prog-rock RPG battle music of
   the 16-bit era: moving bass riffs, bars of 7/8 and 6/8 traded with 4/4, Neapolitan and
   dominant colour, brass stabs and drum fills. Every tune here is written for this game; it
   copies none.

   The notes are written like a tracker, one string per bar: a note name starts a note, "-" holds
   the one before and "." is a rest, one 16th per cell. A bar's length is its meter: 16 cells is
   4/4, 14 is 7/8 and 12 is 6/8. Each bar also names its chord, which the pads, stabs and bass
   follow, and optionally a bass riff: semitones above the chord's root, in the same cells. */

import { CROSSING, LANTERN, LAST_LIGHT, RIVAL, WANDERER } from "./space-bonus-music.ts";
import type { Song as ChipSong } from "./space-music";
import { CODEX_SPACE_2 } from "./space-codex-music.ts";
import { FINAL_EXTREMITY_II } from "./space-final-extremity-ii.ts";
import { SECOND_BATTLES, type SecondBattle } from "./space2-battles-more.ts";
import { ASHEN_CROWN_II } from "./space2-ashen-crown-ii.ts";
import { ASHEN_CROWN_III } from "./space2-ashen-crown-iii.ts";
import { arrangeAscension } from "./space2-ascension.ts";
import { ASCENSION_BONUS } from "./space2-ascension-bonus.ts";
import { SPACE3_SONGS, type Space3Track } from "./space3-music.ts";

export type BaseSagaTrack =
  | "s2title" | "s2hangar" | "s2hangar2" | "s2hangar3" | "s2stage" | "s2stage2" | SecondBattle | "s2alert" | "s2alert2" | "s2alert3" | "s2pause" | "s2victory" | "s2gameover" | "s2ending" | "s2fanfare"
  | "s2boss1" | "s2boss2" | "s2boss3" | "s2boss4" | "s2boss5" | "s2boss6" | "s2boss7" | "s2boss8"
  /* Atlas's music follows its phases: Judgement from the fourth, the last stand in the sixth. */
  | "s2boss8b" | "s2boss8c"
  /* A bonus tune for the soundtrack player in zakrulOS only; the game never plays it. */
  | "s2bonus1" | "s2bonus2" | "s2bonus3" | "s2bonus4" | "s2bonus5" | "s2bonus6" | "s2bonus7" | "s2bonus8" | "s2bonus9" | "s2bonus10" | "s2bonus11" | "s2bonus12" | "s2bonus13" | "s2bonus14" | "s2bonus15" | "s2bonus16" | "s2bonus17";
/* The Ascension album re-composes the tunes the game began with; the battle tunes and Ashen Crown II and III, added later, have no Ascension version. */
export type LaterTrack = SecondBattle | "s2bonus16" | "s2bonus17";
/* The Ascension album's own bonus tracks, written for it and arranged from nothing in the game. */
export type AscensionBonus = "alt:asc1" | "alt:asc2" | "alt:asc3" | "alt:asc4";
export type AlternateSagaTrack = `alt:${Exclude<BaseSagaTrack, LaterTrack>}` | AscensionBonus;
export type SagaTrack = BaseSagaTrack | AlternateSagaTrack | Space3Track;

/* "square" is a second synth lead: a lean square wave that glides from one note into the next (portamento), spread a
   little; "superSquare" is the same with seven voices in unison and an octave below, spread wide. */
type Voice = "brass" | "strings" | "lead" | "square" | "superSquare" | "organ" | "organChord" | "bell" | "harp" | "chip" | "trumpet" | "violin" | "guitar" | "piano";
/* What a studio track can play: a voice of the band, a bass, or the kit. */
export const STUDIO_VOICES = [
  "piano", "brass", "trumpet", "strings", "violin", "lead", "square", "superSquare", "organ", "organChord", "bell", "harp", "chip", "guitar",
  "synthBass", "pickedBass", "slapBass", "drums",
] as const;
export type StudioVoice = (typeof STUDIO_VOICES)[number];
/* General MIDI drum notes to the kit: kicks, snares, closed and open hats, toms, crashes and rides (and the rim for the rest). */
const GM_KIT: Record<number, string> = {
  35: "k", 36: "k", 37: "r", 38: "s", 39: "s", 40: "s", 41: "t", 42: "h", 43: "t", 44: "h", 45: "t", 46: "o", 47: "t", 48: "t",
  49: "c", 50: "t", 51: "r", 52: "c", 53: "r", 55: "c", 57: "c", 59: "r",
};
/* A bar may carry a counter-line too, played by the song's `counter` voice. */
type Bar = [lead: string, chord: string, riff?: string, counter?: string];
export type BarPerformance = {
  /* Absolute tracker notes for a written bass line, replacing the root-relative riff. */
  bass?: string;
  /* One cell per 16th; "kh" layers kick and hat. An explicit kit also owns its fills. */
  kit?: string;
  leadAccents?: number[];
  drumAccents?: number[];
  gate?: number;
};
export type Song = {
  bpm: number;
  lead: Voice;
  /* Held under the bar, or for "harp" plucked up and down its chord in eighths. */
  pad?: "strings" | "organ" | "harp";
  counter?: Voice;
  /* How loud the counter voice plays, 0.035 unless a tune brings its counter-melody forward. */
  counterLevel?: number;
  /* A second voice that doubles the lead, quieter, so the two blend into one. */
  layer?: Voice;
  bassVoice?: "synth" | "picked" | "slap";
  /* The counter voice runs the bar's chord in eighths wherever a bar writes no counter-line of its
     own, always under the lead. */
  arps?: boolean;
  /* Steps between the notes of those arpeggios: 2 for eighths (the default), 1 for 16ths. */
  arpStep?: 1 | 2;
  /* Semitones every note of the song is moved by, so one tune can return in another key. */
  transpose?: number;
  /* Brass hits the bar's chord on its accents. */
  stabs?: boolean;
  drums: "battle" | "march" | "soft" | "toms" | "waltz" | "none";
  /* The bass riff for bars that name none. */
  riff: string;
  bars: Bar[];
  performance?: BarPerformance[];
  intro?: number;
  once?: boolean;
  then?: SagaTrack;
  /* Bars (counting from 0) that end in a drum fill, and bars that open with a crash: the lead-in to a fast part. */
  fills?: number[];
  crashes?: number[];
  /* A riser across these bars, first and last (counting from 0): a sweep of noise that opens up and swells, with a
     saw rising two octaves under it, ending just before the next downbeat. */
  riser?: [from: number, to: number];
  /* Instrument changes at section boundaries; omitted properties inherit the song's band.
     Explicit undefined silences an optional voice. Each section starts from the base band. */
  sections?: ({ from: number } & Partial<Pick<Song, "lead" | "layer" | "pad" | "counter" | "stabs" | "drums" | "bassVoice">>)[];
};

const RIFFS: Record<string, string> = {
  drive16: "0 . 0 12 . 0 10 . 0 . 0 12 7 . 10 12",
  /* Eighths that never stop, root and octave: the engine of a handheld RPG's last battle. */
  pump16: "0 . 0 . 12 . 0 . 0 . 0 . 12 . 0 .",
  gallop16: "0 0 12 0 0 12 0 0 10 10 12 10 7 7 5 7",
  chrom16: "0 . 12 . 0 11 12 . 0 . 12 . 7 6 5 3",
  pedal16: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0",
  hits16: "0 . . 0 . . 0 . . . 0 . 0 . 0 .",
  /* Short, hard bass punctuations that fall between the kick and the snare, with the octave popped. */
  slap16: "0 . . 12 . 0 . . 0 . 12 . . 0 7 .",
  march16: "0 . . 0 0 . 7 . 0 . . 0 0 . 10 .",
  hold16: "0 - - - - - - - 7 - - - - - - -",
  pulse16: "0 . . . . . . . 0 . . 0 . . . .",
  seven14: "0 . 12 0 . 12 0 . 10 12 7 . 5 7",
  six12: "0 . 12 7 . 12 0 . 12 10 7 5",
  /* The quiet ones: a waltz's oom-pah-pah, long notes, a root throbbing against its flat second
     and tritone, and a 7/8 heartbeat. */
  waltz12: "0 . . . 7 . . . 12 . . .",
  hold12: "0 - - - - - 7 - - - - -",
  ostinato16: "0 . 12 . 1 . 12 . 0 . 12 . 6 . 12 .",
  throb14: "0 . . 0 . . 0 . . . 0 . 0 .",
  /* Space 3: a battle bass after Kenji Ito's, root and octave pushed off the beat, a seventh and a fifth to turn round. */
  ito16: "0 . 12 0 . 12 0 . 0 . 12 0 . 10 12 .",
  itoRun16: "0 0 12 0 0 12 0 12 0 0 12 0 10 0 7 0",
  ito14: "0 . 12 0 . 12 0 . 10 . 12 0 7 .",
  ito12: "0 . 12 0 . 12 0 . 12 10 . 7",
  /* Throne of Ascension, Extended: a dark pedal turning in eighths on the root, its fifth and its flat seventh;
     the root pushed off the beat, up to the octave and down by the seventh and fifth; and silence, for a piano alone. */
  toll16: "0 . 7 . 10 . 7 . 0 . 0 7 . 10 7 .",
  push16: "0 . 12 . 0 10 . 0 . 12 0 . 7 . 10 .",
  rest16: ". . . . . . . . . . . . . . . .",
};

/* k kick, s snare, h hat, t tom; "." nothing. A crash marks the start of a song and of each change
   of meter by itself. The fill takes the last bar of a looping song. */
const KITS: Record<string, string> = {
  battle16: "k h h k s h k h h k h h s h k s",
  march16: "k h s h k h s h k h s h k s s s",
  soft16: "k . . . h . . . k . k . h . . .",
  toms16: "t . . . . . . . t . . t . . . .",
  toms14: "t . . . . . . t . . t . . .",
  soft12: "k . . . . . h . . . . .",
  soft14: "k . . . . . h . . k . . h .",
  waltz12: "k . . . h . . . h . . .",
  battle14: "k h h s h h k h k h s h s s",
  battle12: "k h h s h h k h k s h h",
  fill16: "k s s s k s t t k t t t s s s s",
  fill14: "k s s s k t t k t t s s s s",
  fill12: "k s s k t t k t t s s s",
};
const STAB_AT: Record<number, number[]> = { 16: [0, 6, 10], 14: [0, 6, 10], 12: [0, 6] };

const TITLE: Song = {
  bpm: 132, lead: "brass", pad: "strings", drums: "march", riff: "march16",
  bars: [
    ["D4 - - - A4 - - - D5 - - - C5 - A4 -", "Dm"],
    ["G4 - - - - - - - E4 - - - G4 - C5 -", "C"],
    ["D5 - - - F5 - - - E5 - D5 - C5 - Bb4 -", "Bb"],
    ["A4 - - - - - - - . . . . E4 - A4 -", "A"],
    ["D5 - - - E5 - F5 - G5 - - - A5 - - -", "Dm"],
    ["B5 - - - A5 - - - G5 - - - F5 - E5 -", "G"],
    ["F5 - - - D5 - - - Bb4 - - - C5 - D5 -", "Bb"],
    ["C#5 - - - - - - - A4 - - - E5 - - -", "A7"],
  ],
};

const HANGAR: Song = {
  bpm: 96, lead: "bell", pad: "strings", drums: "soft", riff: "hold16",
  bars: [
    ["G5 - - - Bb5 - - - D6 - - - Bb5 - - -", "Eb"],
    ["A5 - - - - - - - G5 - - - F5 - - -", "F"],
    ["G5 - - - Eb5 - - - C5 - - - Eb5 - G5 -", "Cm"],
    ["F5 - - - - - - - D5 - - - . . . .", "Bb"],
    ["Bb5 - - - G5 - Bb5 - D6 - - - F6 - - -", "Eb"],
    ["C6 - - - A5 - - - F5 - - - A5 - C6 -", "F"],
    ["Eb6 - - - C6 - - - G5 - - - Ab5 - - -", "Abmaj7"],
    ["D6 - - - - - - - . . . . . . . .", "Bb"],
  ],
};

const STAGE: Song = {
  bpm: 144, lead: "lead", pad: "organ", stabs: true, drums: "battle", riff: "drive16",
  bars: [
    ["A4 - . A4 C5 - D5 - E5 - . G5 - E5 D5 -", "Am"],
    ["D5 - - - B4 - G4 - A4 - B4 - D5 - - -", "G"],
    ["C5 - . C5 A4 - C5 - F5 - . E5 - C5 A4 -", "F"],
    ["G#4 - - - B4 - - - D5 - - - E5 - - -", "E7"],
    ["A5 - - E5 - - A5 - G5 - E5 - D5 -", "Am", "seven14"],
    ["F#5 - - D5 - - F#5 - A5 - G5 - F#5 -", "D", "seven14"],
    ["E5 - - C5 - - E5 - A5 - B5 - C6 -", "Am", "seven14"],
    ["B5 - - G#5 - - E5 - - - . . . .", "E", "seven14"],
    ["F5 - - - A5 - C6 - B5 - A5 - G5 - F5 -", "F", "gallop16"],
    ["G5 - - - B5 - D6 - C6 - B5 - A5 - G5 -", "G", "gallop16"],
    ["A5 - - - E6 - - - D6 - C6 - B5 - A5 -", "Am", "gallop16"],
    ["G#5 - - - - - - - E5 - - - . . . .", "E7", "chrom16"],
  ],
};

/* The last three chapters' battle: E minor shadowed by its Phrygian F, brass over strings, six
   bars of 6/8 and then a 4/4 gallop that turns round on B7. */
const STAGE2: Song = {
  bpm: 152, lead: "brass", pad: "strings", stabs: true, drums: "battle", riff: "six12",
  bars: [
    ["E5 - - B4 - - E5 - - G5 - F#5", "Em"],
    ["E5 - - C5 - - G5 - - E5 - D5", "C"],
    ["F#5 - - D5 - - A5 - - F#5 - E5", "D"],
    ["D#5 - - - - - B4 - - - . .", "B7"],
    ["G5 - - B5 - - E6 - - D6 - B5", "Em"],
    ["A5 - - C6 - - F6 - - E6 - C6", "F"],
    ["B5 - - - G5 - E5 - G5 - B5 - E6 - - -", "Em", "gallop16"],
    ["C6 - - - A5 - E5 - A5 - C6 - E6 - - -", "Am", "gallop16"],
    ["D6 - - - A5 - F#5 - A5 - D6 - F#6 - - -", "D", "gallop16"],
    ["G6 - - - D6 - B5 - D6 - - - . . . .", "G", "gallop16"],
    ["E6 - - - C6 - G5 - C6 - E6 - G6 - - -", "C", "gallop16"],
    ["F#6 - - - D#6 - - - B5 - - - A5 - - -", "B7", "chrom16"],
  ],
};

/* Two more hangars, taking turns with the first by chapter. A bittersweet E minor waltz in 3/4,
   strings over a plucked harp, in the manner of a handheld RPG's town; and a D Mixolydian sea
   song in 6/8, organ over strings, for the open water between battles. */
const HANGAR2: Song = {
  bpm: 108, lead: "strings", pad: "harp", drums: "waltz", riff: "waltz12",
  bars: [
    ["B4 - - - E5 - - - G5 - - -", "Em"],
    ["G5 - - - F#5 - - - E5 - - -", "C"],
    ["C5 - - - E5 - - - A5 - - -", "Am"],
    ["A5 - - - G5 - - - F#5 - - -", "B7"],
    ["G5 - - - B5 - - - E6 - - -", "Em"],
    ["D6 - - - C6 - - - B5 - A5 -", "D"],
    ["G5 - - - E5 - - - C6 - - -", "C"],
    ["B5 - - - - - - - . . . .", "B7"],
    ["D6 - - - B5 - - - G5 - - -", "G"],
    ["A5 - - - F#5 - - - D5 - - -", "D"],
    ["E5 - - - G5 - - - C6 - B5 -", "C"],
    ["D#6 - - - B5 - - - F#5 - - -", "B"],
  ],
};

const HANGAR3: Song = {
  bpm: 90, lead: "organ", pad: "strings", drums: "soft", riff: "hold12",
  bars: [
    ["A4 - - D5 - - F#5 - - E5 - D5", "D"],
    ["E5 - - - - - C5 - - D5 - E5", "C"],
    ["D5 - - B4 - - G4 - - A4 - B4", "G"],
    ["A4 - - - - - - - - . . .", "D"],
    ["F#5 - - A5 - - D6 - - C6 - A5", "D"],
    ["G5 - - - - - E5 - - G5 - C6", "C"],
    ["B5 - - A5 - - F#5 - - D5 - E5", "Bm"],
    ["E5 - - - - - - - - . . .", "A"],
  ],
};

/* Two more warnings before a boss, taking turns with the first by chapter. A dungeon organ over a
   root that throbs against its flat second and its tritone; and strings climbing a semitone at a
   time over a 7/8 heartbeat of toms. */
const ALERT2: Song = {
  bpm: 112, lead: "organ", pad: "strings", drums: "toms", riff: "ostinato16",
  bars: [
    ["D5 - - - - - - - F5 - - - E5 - - -", "Dm"],
    ["D5 - - - - - - - A4 - - - . . . .", "Dm"],
    ["G5 - - - - - - - F5 - - - Eb5 - - -", "Eb"],
    ["C#5 - - - - - - - E5 - - - . . . .", "A7"],
    ["F5 - - - - - - - A5 - - - G#5 - - -", "Dm"],
    ["F5 - - - - - - - D5 - - - . . . .", "Bb"],
    ["Bb4 - - - - - - - D5 - - - C#5 - - -", "Gm"],
    ["E5 - - - - - - - . . . . . . . .", "A7"],
  ],
};

const ALERT3: Song = {
  bpm: 96, lead: "strings", pad: "organ", drums: "toms", riff: "throb14",
  bars: [
    ["E5 - - - - - - B4 - - - - - -", "Em"],
    ["F5 - - - - - - C5 - - - - - -", "F"],
    ["F#5 - - - - - - C#5 - - - - - -", "F#m"],
    ["G5 - - - - - - D5 - - - - - -", "G"],
    ["Ab5 - - - - - - Eb5 - - - - - -", "Ab"],
    ["A5 - - - G5 - - F#5 - - - D#5 - -", "B7"],
  ],
};

/* The pause: a music box in F, bells over a plucked harp, quiet and slow. */
const PAUSE: Song = {
  bpm: 76, lead: "bell", pad: "harp", drums: "none", riff: "hold16",
  bars: [
    ["C6 - - - A5 - - - F5 - - - A5 - - -", "F"],
    ["G5 - - - - - - - E5 - - - G5 - - -", "C"],
    ["F5 - - - A5 - - - D6 - - - C6 - - -", "Dm"],
    ["Bb5 - - - - - - - A5 - - - G5 - - -", "Bb"],
    ["A5 - - - C6 - - - F6 - - - E6 - - -", "F"],
    ["D6 - - - - - - - Bb5 - - - G5 - - -", "Gm"],
    ["E5 - - - G5 - - - Bb5 - - - G5 - - -", "C7"],
    ["F5 - - - - - - - . . . . . . . .", "F"],
  ],
};

const ALERT: Song = {
  bpm: 84, lead: "strings", pad: "strings", drums: "toms", riff: "pulse16",
  bars: [
    ["Bb4 - - - - - - - - - - - - - - -", "Bbm"],
    ["Db5 - - - - - - - C5 - - - - - - -", "Gb"],
    ["Bb4 - - - - - - - A4 - - - - - - -", "Bbm"],
    ["A4 - - - - - - - Bb4 - - - - - - -", "Adim"],
  ],
};

const VICTORY: Song = {
  bpm: 140, lead: "brass", pad: "strings", drums: "march", riff: "hold16", once: true, then: "s2hangar",
  bars: [
    ["F4 Bb4 D5 F5 - - Eb5 - D5 - Eb5 - F5 - - -", "Bb"],
    ["Bb5 - - - - - - - - - - - . . . .", "Bb"],
  ],
};

const GAMEOVER: Song = {
  bpm: 72, lead: "strings", pad: "strings", drums: "none", riff: "hold16", once: true,
  bars: [
    ["A4 - - - G4 - - - F4 - - - E4 - - -", "Dm"],
    ["D4 - - - - - - - - - - - . . . .", "Dm"],
  ],
};

const ENDING: Song = {
  bpm: 104, lead: "brass", pad: "strings", drums: "march", riff: "march16",
  bars: [
    ["A4 - - - C5 - - - F5 - - - - - E5 -", "F"],
    ["E5 - - - G5 - - - C5 - - - - - - -", "C"],
    ["D5 - - - F5 - - - A5 - - - G5 - F5 -", "Dm"],
    ["F5 - - - - - - - D5 - - - - - - -", "Bb"],
    ["C5 - - - F5 - - - A5 - - - C6 - - -", "F"],
    ["G5 - - - E5 - - - C5 - D5 - E5 - - -", "C"],
    ["D5 - - - F5 - - - Bb5 - - - A5 - G5 -", "Bb"],
    ["F5 - - - - - - - - - - - . . . .", "F"],
  ],
};

/* The take-off: a rising brass call in fourths, once, over before the stage tune starts. */
const FANFARE: Song = {
  bpm: 176, lead: "brass", pad: "strings", drums: "none", riff: "hold16", once: true,
  bars: [["C5 F5 Bb5 Eb6 - - - - D6 - - - - - - -", "Bb"]],
};

/* The eight battles. Each opens on a bar of hits that plays once, then an A section and a B
   section in another meter, and a turnaround on the dominant. */
const BOSSES: Song[] = [
  /* 1. Tidebreaker: G minor, brass over strings, a 7/8 middle. */
  {
    bpm: 168, lead: "brass", pad: "strings", stabs: true, drums: "battle", riff: "drive16", intro: 1,
    bars: [
      ["G4 . . G4 . . G4 . . . Bb4 . C5 . D5 .", "Gm", "hits16"],
      ["G5 - - - - - D5 - G5 - Bb5 - A5 - G5 -", "Gm"],
      ["G5 - - - F5 - - - Eb5 - - - D5 - C5 -", "Eb"],
      ["D5 - - - - - C5 - D5 - F5 - A5 - - -", "F"],
      ["F#5 - - - - - - - D5 - - - . . . .", "D7"],
      ["G5 - Bb5 - D6 - - - C6 - Bb5 - A5 - G5 -", "Gm"],
      ["Eb6 - - - D6 - C6 - Bb5 - - - A5 - - -", "Cm"],
      ["Ab5 - - Eb5 - - Ab5 - C6 - Bb5 - Ab5 -", "Ab", "seven14"],
      ["Bb5 - - F5 - - Bb5 - D6 - C6 - Bb5 -", "Bb", "seven14"],
      ["C6 - - G5 - - C6 - Eb6 - D6 - C6 -", "Cm", "seven14"],
      ["D6 - - A5 - - F#5 - - - . . . .", "D", "seven14"],
      ["D5 - - - F#5 - - - A5 - - - C6 - - -", "D7", "chrom16"],
    ],
  },
  /* 2. Mangrove Hydra: E minor, organ, a 6/8 opening and an F (Neapolitan) at the top. */
  {
    bpm: 176, lead: "organ", pad: "strings", drums: "battle", riff: "six12", intro: 1,
    bars: [
      ["E4 . . E4 . . E4 . G4 . A4 .", "Em"],
      ["E5 - - G5 - - B5 - - A5 - G5", "Em"],
      ["E5 - - C5 - - G5 - - E5 - C5", "C"],
      ["F#5 - - A5 - - D6 - - C6 - A5", "D"],
      ["D#5 - - F#5 - - B5 - - - . .", "B7"],
      ["G5 - - B5 - - E6 - - D6 - B5", "Em"],
      ["C6 - - B5 - - A5 - - G5 - E5", "Am"],
      ["E5 - G5 - C6 - - - B5 - A5 - G5 - E5 -", "C", "gallop16"],
      ["F#5 - A5 - D6 - - - C6 - B5 - A5 - F#5 -", "D", "gallop16"],
      ["G5 - B5 - E6 - - - D6 - B5 - G5 - B5 -", "Em", "gallop16"],
      ["A5 - C6 - F6 - - - E6 - - - . . . .", "F", "gallop16"],
      ["D#6 - - - B5 - - - F#5 - - - D#5 - - -", "B7", "chrom16"],
    ],
  },
  /* 3. Ice Wyvern: C sharp minor, synth lead, a 7/8 opening, D (Neapolitan) before the turn. */
  {
    bpm: 160, lead: "lead", pad: "strings", drums: "battle", riff: "seven14", intro: 1,
    bars: [
      ["C#4 . . C#4 . . C#4 . E4 . F#4 . G#4 .", "C#m"],
      ["C#5 - - E5 - - G#5 - F#5 - E5 - D#5 -", "C#m"],
      ["C#5 - - A4 - - E5 - D#5 - C#5 - B4 -", "A"],
      ["D#5 - - F#5 - - B5 - A5 - G#5 - F#5 -", "B"],
      ["G#5 - - - - - C6 - D#6 - - - . .", "G#7"],
      ["E5 - - G#5 - - C#6 - B5 - G#5 - E5 -", "C#m"],
      ["F#5 - - A5 - - C#6 - B5 - A5 - G#5 -", "F#m"],
      ["A5 - - - C#6 - E6 - - - D#6 - C#6 - B5 -", "A", "drive16"],
      ["B5 - - - D#6 - F#6 - - - E6 - D#6 - C#6 -", "B", "drive16"],
      ["C#6 - - - G#5 - - - E5 - F#5 - G#5 - - -", "C#m", "drive16"],
      ["D6 - - - A5 - - - F#5 - - - . . . .", "D", "drive16"],
      ["C6 - - - G#5 - - - D#5 - - - C5 - - -", "G#7", "chrom16"],
    ],
  },
  /* 4. Dune Maw: D Phrygian dominant, brass and organ over a pedal bass. */
  {
    bpm: 172, lead: "brass", pad: "organ", stabs: true, drums: "battle", riff: "pedal16", intro: 1,
    bars: [
      ["D4 . . D4 . . Eb4 . . . D4 . F#4 . G4 .", "D", "hits16"],
      ["A5 - - - Bb5 - A5 - G5 - F#5 - Eb5 - D5 -", "D"],
      ["G5 - - - F#5 - G5 - Bb5 - - - A5 - G5 -", "Eb"],
      ["F#5 - - - A5 - - - D6 - C6 - Bb5 - A5 -", "D"],
      ["G5 - - - Eb5 - - - C5 - D5 - Eb5 - - -", "Cm"],
      ["A5 - - - D6 - - - Eb6 - D6 - C6 - Bb5 -", "D"],
      ["Bb5 - - - G5 - - - D5 - - - . . . .", "Gm"],
      ["D6 - - Bb5 - - F5 - Bb5 - C6 - D6 -", "Bb", "seven14"],
      ["Eb6 - - C6 - - G5 - C6 - D6 - Eb6 -", "Cm", "seven14"],
      ["G6 - - Eb6 - - Bb5 - Eb6 - F6 - G6 -", "Eb", "seven14"],
      ["F#6 - - D6 - - A5 - - - . . . .", "D", "seven14"],
      ["G5 - - - Eb5 - - - Bb4 - - - A4 - - -", "Eb", "chrom16"],
    ],
  },
  /* 5. Iron Meridian: F minor, synth lead, 7/8 almost throughout, like wheels on a track. */
  {
    bpm: 184, lead: "lead", pad: "organ", drums: "battle", riff: "seven14", intro: 1,
    bars: [
      ["F4 . . F4 . . F4 . Ab4 . Bb4 . C5 .", "Fm"],
      ["F5 - - Ab5 - - C6 - Bb5 - Ab5 - G5 -", "Fm"],
      ["F5 - - Db5 - - Ab5 - G5 - F5 - Eb5 -", "Db"],
      ["G5 - - Bb5 - - Eb6 - Db6 - C6 - Bb5 -", "Eb"],
      ["E5 - - G5 - - Bb5 - - - . . . .", "C7"],
      ["Ab5 - - C6 - - F6 - Eb6 - C6 - Ab5 -", "Fm"],
      ["Db6 - - Bb5 - - F5 - Ab5 - Bb5 - C6 -", "Bbm"],
      ["Bb5 - - - - - Db6 - - - Gb6 - - -", "Gb"],
      ["C6 - - - - - Eb6 - - - Ab6 - - -", "Ab"],
      ["Db6 - - - Bb5 - - F5 - - - . . .", "Bbm"],
      ["E6 - - - C6 - - G5 - - - . . .", "C"],
      ["G5 - - - Bb5 - - - C6 - - - E6 - - -", "C7", "chrom16"],
    ],
  },
  /* 6. Permafrost: B minor, organ over strings, a 6/8 opening and a C (Neapolitan). */
  {
    bpm: 164, lead: "organ", pad: "strings", drums: "battle", riff: "six12", intro: 1,
    bars: [
      ["B3 . . B3 . . B3 . D4 . E4 .", "Bm"],
      ["B5 - - F#5 - - D5 - - F#5 - B5", "Bm"],
      ["B5 - - G5 - - D5 - - G5 - B5", "G"],
      ["C#6 - - A5 - - E5 - - A5 - C#6", "A"],
      ["A#5 - - - - - F#5 - - - . .", "F#7"],
      ["G5 - - B5 - - E6 - - D6 - B5", "Em"],
      ["A#5 - - C#6 - - E6 - - - . .", "F#7"],
      ["D6 - - - B5 - - - G5 - A5 - B5 - D6 -", "G", "gallop16"],
      ["E6 - - - C#6 - - - A5 - B5 - C#6 - E6 -", "A", "gallop16"],
      ["F#6 - - - D6 - - - B5 - C#6 - D6 - - -", "Bm", "gallop16"],
      ["E6 - - - - - - - G6 - - - . . . .", "C", "gallop16"],
      ["F#6 - - - C#6 - - - A#5 - - - F#5 - - -", "F#7", "chrom16"],
    ],
  },
  /* 7. Cyclone: A minor at full speed, brass and strings over a chromatic bass. */
  {
    bpm: 188, lead: "brass", pad: "strings", stabs: true, drums: "battle", riff: "chrom16", intro: 1,
    bars: [
      ["A4 . A4 . A4 . C5 . A4 . D5 . A4 . E5 .", "Am", "hits16"],
      ["A5 - - - E5 - A5 - C6 - - - B5 - A5 -", "Am"],
      ["A5 - - - F5 - A5 - C6 - - - Bb5 - A5 -", "F"],
      ["F5 - - - D5 - F5 - A5 - - - G5 - F5 -", "Dm"],
      ["G#5 - - - E5 - G#5 - B5 - - - . . . .", "E"],
      ["C6 - B5 - A5 - G#5 - A5 - B5 - C6 - D6 -", "Am"],
      ["D6 - - - - - C6 - Bb5 - - - A5 - - -", "Bb"],
      ["C6 - - A5 - - F5 - A5 - C6 - F6 -", "F", "seven14"],
      ["D6 - - B5 - - G5 - B5 - D6 - G6 -", "G", "seven14"],
      ["E6 - - C6 - - A5 - C6 - E6 - A6 -", "Am", "seven14"],
      ["F6 - - D6 - - Bb5 - - - . . . .", "Bb", "seven14"],
      ["B5 - - - G#5 - - - E5 - - - D5 - - -", "E7", "chrom16"],
    ],
  },
  /* 8. Atlas, the last battle, in the manner of a handheld RPG's final battle theme: fast, the
     bass pumping eighths without a break, the chord running in eighths on a square wave under it, and
     over them a heroic lead of long held notes. The first eight bars state the theme; the next
     eight climb it a step at a time to a peak, then run down to the dominant and home. All 4/4,
     D minor, the lead between C5 and F6 and the arpeggio always below it. The bar of hits plays
     once. Every note is written for this game. */
  {
    bpm: 184, lead: "lead", pad: "strings", counter: "chip", arps: true, drums: "battle", riff: "pump16", intro: 1,
    bars: [
      ["D5 . . D5 . . D5 . . . F5 . E5 . D5 .", "Dm", "hits16"],
      ["D5 - - - - - - - A5 - - - - - - -", "Dm"],
      ["F5 - - - - - - - D5 - - - F5 - G5 -", "Bb"],
      ["E5 - - - - - - - G5 - - - - - - -", "C"],
      ["A5 - - - - - - - - - - - G5 - F5 -", "Dm"],
      ["D6 - - - - - - - C6 - - - A5 - - -", "Dm"],
      ["Bb5 - - - - - - - A5 - - - F5 - - -", "Bb"],
      ["G5 - - - Bb5 - - - D6 - - - C6 - Bb5 -", "Gm"],
      ["A5 - - - - - - - - - - - . . . .", "A7"],
      ["G5 - - - A5 - Bb5 - D6 - - - - - - -", "Gm"],
      ["C6 - - - - - - - A5 - - - F5 - - -", "F"],
      ["A5 - - - B5 - C6 - E6 - - - - - - -", "Am"],
      ["D6 - - - - - - - B5 - - - G5 - - -", "G"],
      ["Bb5 - - - C6 - D6 - F6 - - - - - - -", "Bb"],
      ["E6 - - - - - - - C6 - - - G5 - - -", "C"],
      ["D6 - - - C6 - Bb5 - A5 - G5 - F5 - E5 -", "Gm"],
      ["C#6 - - - - - - - E5 - - - A5 - - -", "A7", "chrom16"],
    ],
  },
];

/* Atlas's phase shifts. Each new tune opens on a bar that plays once, a chromatic run up into a
   hit, so the change of phase is heard as it is seen.

   Judgement, for the fourth and fifth phases: darker and heavier, brass over organ and a bass
   ostinato that throbs against its flat second and its tritone, then a gallop. D minor. */
const JUDGEMENT: Song = {
  bpm: 176, lead: "brass", pad: "organ", stabs: true, drums: "battle", riff: "ostinato16", intro: 1,
  bars: [
    ["A4 Bb4 B4 C5 C#5 D5 Eb5 E5 F5 - - - . . . .", "A7", "hits16"],
    ["D5 - - - - - - - - - - - C#5 - D5 -", "Dm"],
    ["Eb5 - - - - - - - D5 - - - Bb4 - - -", "Eb"],
    ["F5 - - - E5 - - - D5 - - - A4 - - -", "Dm"],
    ["C#5 - - - - - - - E5 - - - G5 - - -", "A7"],
    ["A5 - - - - - - - G5 - F5 - E5 - D5 -", "Dm"],
    ["F5 - - - - - - - D5 - - - Bb4 - - -", "Bb"],
    ["G5 - - - Bb5 - - - Eb6 - - - D6 - - -", "Eb"],
    ["C#6 - - - - - - - A5 - - - . . . .", "A7"],
    ["G5 - Bb5 - D6 - - - C6 - Bb5 - A5 - G5 -", "Gm", "gallop16"],
    ["Eb6 - - - D6 - - - C6 - Bb5 - G5 - - -", "Eb", "gallop16"],
    ["F5 - A5 - D6 - - - C#6 - D6 - E6 - - -", "Dm", "gallop16"],
    ["E6 - - - C#6 - - - A5 - - - E5 - - -", "A7", "chrom16"],
  ],
};

/* The last stand, for the sixth phase: the first theme again, a whole step higher and a little
   faster, opened by a run up a whole octave. */
const LAST_STAND: Song = {
  ...BOSSES[7], bpm: 188, transpose: 2, intro: 1,
  bars: [["D5 Eb5 E5 F5 F#5 G5 G#5 A5 Bb5 B5 C6 C#6 D6 - - -", "A7", "hits16"], ...BOSSES[7].bars.slice(1)],
};

const NOTE: Record<string, number> = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const midiOf = (name: string) => {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return (Number(m[2]) + 1) * 12 + NOTE[m[1]];
};
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const QUALITY: Record<string, number[]> = { "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], sus: [0, 5, 7], dim: [0, 3, 6], maj7: [0, 4, 7, 11] };
function chordOf(name: string) {
  const m = /^([A-G][#b]?)(.*)$/.exec(name);
  if (!m || !QUALITY[m[2]]) throw new Error(`bad chord ${name}`);
  const root = midiOf(`${m[1]}2`);
  return { root, tones: QUALITY[m[2]].map((i) => root + 12 + i) };
}

/* A line of cells becomes its notes: where each starts in the bar, its value and its length. */
type Cell = { at: number; value: number; len: number };
function cells(line: string, value: (c: string) => number): Cell[] {
  const out: Cell[] = [];
  line.trim().split(/\s+/).forEach((c, i) => {
    if (c === "-") { const last = out[out.length - 1]; if (last && last.at + last.len === i) last.len += 1; }
    else if (c !== ".") out.push({ at: i, value: value(c), len: 1 });
  });
  return out;
}


/* The bonus tunes for the orchestra. The first five are the chiptune's own notes and chords
   (space-bonus-music.ts) with a different band under each: the tune, a bass and the chords held, with no second
   line and no arpeggio. The last three are written for the orchestra in the pattern of Space 2's own battle
   themes. The method is in docs/composition-method.md. */
function orchestrate(tune: ChipSong, band: Omit<Song, "bars">, riff: (bar: number) => string): Song {
  return { ...band, bars: tune.bars.map(([lead, chord], i): Bar => [lead, chord, riff(i)]) };
}

/* Wanderer's Battle: brass over an organ, stabs on the accents, the slapped bass and then pumping eighths. */
const BONUS: Song = orchestrate(WANDERER, { bpm: 152, lead: "brass", pad: "organ", stabs: true, drums: "battle", riff: "slap16" },
  (i) => (i === 0 ? "hold16" : i <= 8 ? "slap16" : i <= 16 ? "pump16" : i <= 22 ? "slap16" : "gallop16"));
/* Lantern Town: a bell for the tune over strings. */
const LANTERN_BAND: Song = orchestrate(LANTERN, { bpm: 100, lead: "bell", pad: "strings", drums: "soft", riff: "pulse16" }, () => "pulse16");
/* Rival's Challenge: brass over strings, stabs, a pumping bass that gallops in the second half. */
const RIVAL_BAND: Song = orchestrate(RIVAL, { bpm: 168, lead: "brass", pad: "strings", stabs: true, drums: "battle", riff: "pump16" }, (i) => (i < 8 ? "pump16" : i < 15 ? "gallop16" : "chrom16"));
/* Starlit Crossing: brass and strings in a march. */
const CROSSING_BAND: Song = orchestrate(CROSSING, { bpm: 128, lead: "brass", pad: "strings", stabs: true, drums: "march", riff: "march16" }, (i) => (i < 8 || i >= 12 ? "march16" : "pump16"));
/* Last Light: strings singing the tune over an organ, with no drums. */
const LAST_LIGHT_BAND: Song = orchestrate(LAST_LIGHT, { bpm: 80, lead: "strings", pad: "organ", drums: "none", riff: "hold16" }, () => "hold16");

/* Iron Vanguard: E minor, the front line, in the pattern of Space 2's stage theme: four bars over the
   drive (a wave-and-lift hook, answered, repeated, and a half cadence), four in 7/8, a gallop of scale runs, and
   the chromatic bass for the last bar. */
const IRON_VANGUARD: Song = {
  bpm: 148, lead: "lead", pad: "organ", stabs: true, drums: "battle", riff: "drive16",
  bars: [
    ["G5 - F#5 - E5 - F#5 - G5 - - - B5 - - -", "Em"],
    ["G5 - - - G5 - E5 - E5 - - - C5 - - -", "C"],
    ["F#5 - E5 - D5 - E5 - F#5 - - - A5 - - -", "D"],
    ["F#5 - - - D#5 - D#5 - F#5 - - - - - . .", "B7"],
    ["E5 - - F#5 - - G5 - B5 - A5 - G5 -", "Em", "seven14"],
    ["A4 - - B4 - - C5 - E5 - D5 - C5 -", "Am", "seven14"],
    ["E5 - - F#5 - - G5 - B5 - A5 - G5 -", "Em", "seven14"],
    ["F#5 - - E5 - - D#5 - D#5 - C5 - B4 -", "B", "seven14"],
    ["C5 - D5 - E5 - F#5 - G5 - F#5 - E5 - D5 -", "C", "gallop16"],
    ["D5 - E5 - F#5 - G5 - A5 - G5 - F#5 - E5 -", "D", "gallop16"],
    ["B5 - A5 - G5 - F#5 - E5 - F#5 - G5 - A5 -", "Em", "gallop16"],
    ["F#5 - - - - - - - D#5 - - - B4 - - -", "B7", "chrom16"],
  ],
};

/* Ashen Crown, extended: C minor, a boss that does not hurry. The first version (the 6/8 figures, then the
   gallop) joined to a second that flows: 6 bars of 6/8 that sing the original figures, 6 bars of 6/8 in one
   line, an octave lower and slower, from the dark end of the range, a two-bar lead-in (a slow line that climbs and
   falls onto the leading tone, the bass building, a riser under it and a drum fill at the end), 5 bars of the gallop, 5 bars of 4/4 that
   climb by step to E flat and settle, and the chromatic close. Each part ends within a fifth of where the
   next begins, and the calm parts take the calm bass (the waltz, the pump) between the busy ones. A short rest
   closes each phrase and each part, so the line breathes before the next one starts. */
const ASHEN_CROWN: Song = {
  bpm: 152, lead: "brass", pad: "strings", stabs: true, drums: "battle", riff: "six12", fills: [13], crashes: [14], riser: [12, 13],
  bars: [
    /* The first version's 6/8 figures. */
    ["C5 - - D5 - - Eb5 - - D5 - -", "Cm"],
    ["G5 - - F5 - - Eb5 - - C5 - -", "Cm"],
    ["F5 - - G5 - - Ab5 - - G5 - -", "Fm"],
    ["D5 - - C5 - - B4 - - . . .", "G7"],
    ["Eb5 - - F5 - - G5 - - G5 - -", "Cm"],
    ["Eb5 - - D5 - - C5 - - Ab4 - .", "Ab"],
    /* The flowing line, an octave lower: it starts a semitone from where the figures ended. */
    ["G4 - - - - - Ab4 - - G4 - -", "Cm", "waltz12"],
    ["F4 - - Eb4 - - D4 - - . . .", "Cm", "waltz12"],
    ["F4 - - - - - G4 - - Ab4 - -", "Fm", "waltz12"],
    ["G4 - - - - - F4 - - D4 - .", "G7", "waltz12"],
    ["Eb4 - - - - - D4 - - C4 - -", "Cm", "waltz12"],
    ["Eb4 - - F4 - - G4 - - Ab4 - .", "Ab", "waltz12"],
    /* The lead-in: a slow line that climbs and falls onto the leading tone, over a bass that builds, ending in a drum fill. */
    ["Ab4 - - - Bb4 - - - C5 - - - D5 - - -", "Fm", "pump16"],
    ["G5 - - - F5 - - - D5 - - - B4 - - -", "G7", "gallop16"],
    /* The first version's gallop. */
    ["C5 - D5 - Eb5 - F5 - G5 - F5 - Eb5 - D5 -", "Cm", "gallop16"],
    ["F5 - G5 - Ab5 - Bb5 - C6 - Bb5 - Ab5 - G5 -", "Fm", "gallop16"],
    ["D6 - C6 - B5 - Ab5 - G5 - Ab5 - B5 - C6 -", "G7", "gallop16"],
    ["C5 - D5 - Eb5 - F5 - G5 - F5 - Eb5 - D5 -", "Cm", "gallop16"],
    ["Eb5 - D5 - C5 - Bb4 - Ab4 - Bb4 - C5 - D5 .", "Ab", "gallop16"],
    /* The second version's arcs: a climb to E flat across the bars. */
    ["G5 - - - Ab5 - Bb5 - C6 - - - Bb5 - Ab5 -", "Cm", "pump16"],
    ["F5 - - - G5 - Ab5 - Bb5 - - - C6 - - -", "Fm", "pump16"],
    ["D6 - - - C6 - B5 - C6 - - - D6 - - .", "G7", "pump16"],
    ["Eb6 - - - - - D6 - C6 - - - Bb5 - . .", "Cm", "pump16"],
    ["Ab5 - - - G5 - - - Ab5 - - - Bb5 - . .", "Ab", "pump16"],
    ["D6 - - - - - - - B5 - - - G5 - - .", "G7", "chrom16"],
  ],
};

/* Crimson Overdrive: F sharp minor, the last battle: four bars over the drive, four in 6/8 through B
   minor and D, a gallop and the chromatic close. */
const CRIMSON_OVERDRIVE: Song = {
  bpm: 160, lead: "lead", pad: "organ", stabs: true, drums: "battle", riff: "drive16",
  bars: [
    ["A5 - - G#5 F#5 - - - G#5 - A5 - C#6 - - -", "F#m"],
    ["A5 - - G#5 F#5 - - - E5 - D5 - A4 - - -", "D"],
    ["G#5 - - F#5 E5 - - - F#5 - G#5 - B5 - - -", "E"],
    ["G#5 - - F#5 F5 - - - G#5 - - - - - . .", "C#7"],
    ["F#5 - - G#5 - - A5 - - G#5 - -", "F#m", "six12"],
    ["B4 - - C#5 - - D5 - - C#5 - -", "Bm", "six12"],
    ["F#5 - - G#5 - - A5 - - A5 - -", "D", "six12"],
    ["G#5 - - F#5 - - F5 - - - - -", "C#7", "six12"],
    ["D5 - E5 - F#5 - G#5 - A5 - G#5 - F#5 - E5 -", "D", "gallop16"],
    ["E5 - F#5 - G#5 - A5 - B5 - A5 - G#5 - F#5 -", "E", "gallop16"],
    ["C#6 - B5 - A5 - G#5 - F#5 - G#5 - A5 - B5 -", "F#m", "gallop16"],
    ["G#5 - - - - - - - F5 - - - C#5 - - -", "C#7", "chrom16"],
  ],
};

/* Space 2's first battle theme, extended (the game keeps the short one). Its own bars, untouched, are the
   drive and the 7/8 at the start and the gallop and the chromatic close at the end; between them go a flowing line
   over a calm bass, a two-bar lead-in (a slow line that falls from A to E, the bass building, a riser under it, a drum fill at the end),
   and after the gallop three bars that climb by step to G. Each part ends within a fifth of where the next begins. */
const STAGE_EXTENDED: Song = {
  ...STAGE,
  fills: [13],
  crashes: [14],
  riser: [12, 13],
  bars: [
    ...STAGE.bars.slice(0, 8),
    ["E5 - - - - - - - D5 - - - C5 - - -", "Am", "pulse16"],
    ["D5 - - - - - - - E5 - - - F5 - - .", "Dm", "pulse16"],
    ["G#5 - - - - - - - A5 - - - B5 - - -", "E", "pulse16"],
    ["C6 - - - - - - - B5 - - - A5 - - .", "Am", "pulse16"],
    ["A5 - - - G5 - - - F5 - - - E5 - - -", "Dm", "pump16"],
    ["D5 - - - C5 - - - B4 - - - E5 - - -", "E7", "gallop16"],
    ...STAGE.bars.slice(8, 11),
    ["C6 - - - D6 - E6 - F6 - - - E6 - D6 -", "F", "pump16"],
    ["D6 - - - E6 - F6 - G6 - - - F6 - E6 -", "G", "pump16"],
    ["E6 - - - D6 - C6 - B5 - - - C6 - D6 .", "Am", "pump16"],
    STAGE.bars[11],
  ],
};

/* Final Extremity, in four phases (the fourth, Eternity, is below), like a last boss that changes form. One score, written in D minor, moved up a
   tone for each phase (D, E and F sharp minor) and played faster each time (164, 172, 180 bpm), so the three share
   every part, motif and change of band; what is each phase's own is the voice that opens it (strings, organ,
   piano) and its solo. Parts, 48 bars: a drumless intro of long notes over a piano ostinato (bars 1-4); orchestral
   hits under a riser (5-6); the drive (7-14), a long sad line over a four-on-the-floor kit, a synth bass in
   sixteenths that pops the octave and a synth arpeggio in sixteenths; a break in 7/8 on the organ (15-18); half
   time on the guitar (19-22); the phase's own solo (23-38), sixteen bars over an eight-bar vamp played twice, the
   second time higher and busier: a violin that sings and breaks into runs, a guitar in groups of four, sweeps and
   pedal tones, a synth in odd groupings and chromatic climbs; the climb a minor third higher (39-46), where the
   synth turns round the root, a touch of a late-90s RPG villain's theme; and the fall back to the top (47-48). The
   half time and the solo are played up front, over the bass and drums alone. It is written in the manner of a
   prog-rock and techno RPG finale; no note is taken from any existing work. */
const EXTREMITY_FILLS = [5, 13, 17, 21, 29, 37, 45];
const EXTREMITY_CRASHES = [6, 14, 18, 22, 30, 38, 46];
const EXTREMITY_FRONT = Array(16).fill(1.4);
const extremitySections = (intro: Voice, introLayer: Voice, solo: Voice, soloLayer?: Voice): Song["sections"] => [
  { from: 0, lead: intro, layer: introLayer, pad: "organ", counter: "piano", drums: "none", stabs: false },
  { from: 4, lead: "brass", layer: undefined },
  { from: 6 },
  { from: 14, lead: "organ", layer: "lead", counter: "bell" },
  { from: 18, lead: "guitar", layer: undefined, counter: undefined, stabs: false },
  { from: 22, lead: solo, layer: soloLayer, counter: undefined, pad: undefined, stabs: false },
  { from: 38, lead: "brass", layer: "lead" },
  { from: 46, lead: intro, layer: introLayer, stabs: false },
];

const FINAL_EXTREMITY: Song = {
  bpm: 164, lead: "lead", layer: "strings", pad: "strings", counter: "chip", arps: true, arpStep: 1, bassVoice: "synth",
  stabs: true, drums: "battle", riff: "pump16", performance: [
    { bass: "D2 - - - - - - - - - - - - - - -" },
    { bass: "Bb1 - - - - - - - - - - - - - - -" },
    { bass: "G2 - - - - - - - - - - - - - - -" },
    { bass: "A1 - - - - - - - - - - - - - - -" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "G2 . . G2 . . G2 . G3 . . . G3 . G2 G3" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "A1 . . A1 . . A1 . A2 . . . A2 . A1 A2" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { kit: "kh h h h ks h h h kh . s s t t s s", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { kit: "kc . h ks h . kh h . ks h . ks h", bass: "D2 . D3 D2 . D3 D2 . C3 . A2 . D3 ." },
    { kit: "kh . h ks h . kh h . ks h . ks h", bass: "Bb1 . Bb2 Bb1 . Bb2 Bb1 . Ab2 . F2 . Bb2 ." },
    { kit: "kh . h ks h . kh h . ks h . ks h", bass: "G2 . G3 G2 . G3 G2 . F3 . D3 . G3 ." },
    { kit: "kh . h ks h . kh t . s t s s s", bass: "A1 . A2 A1 . A2 A1 . G2 . E2 . A2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . h . h . h . ks . h . h . h .", bass: "D2 . . . D3 . . . D2 . . . C3 . A2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . h . h . h .", bass: "Bb1 . . . Bb2 . . . Bb1 . . . Ab2 . F2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . h . h . h .", bass: "G2 . . . G3 . . . G2 . . . F3 . D3 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . s s t t s s", bass: "A1 . . . A2 . . . A1 . . . G2 . E2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh . s s t t s s", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh . s s t t s s", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "F2 F2 F3 F2 . F2 F3 F2 Eb3 F2 F3 F2 C3 . Eb3 F3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 Ab2 . B2 C#3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "F2 F2 F3 F2 . F2 F3 F2 Eb3 F2 F3 F2 C3 . Eb3 F3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 Ab2 . B2 C#3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { kit: "kh h h h ks h h h kh . s s t t s s", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "Bb1 Bb1 Bb2 Bb1 . Bb1 Bb2 Bb1 Ab2 Bb1 Bb2 Bb1 F2 . Ab2 Bb2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
  ],
  fills: EXTREMITY_FILLS, crashes: EXTREMITY_CRASHES, riser: [4, 5],
  sections: extremitySections("strings", "organ", "violin", undefined),
  bars: [
    ["D5 - - - - - - - E5 - - - F5 - - -", "Dm", "pump16", "D4 . A4 . F4 . A4 . D4 . A4 . F4 . A4 ."],
    ["F5 - - - - - - - E5 - - - D5 - - -", "Bb", "pump16", "Bb3 . F4 . D4 . F4 . Bb3 . F4 . D4 . F4 ."],
    ["Bb4 - - - - - - - C5 - - - D5 - - -", "Gm", "pump16", "G3 . D4 . Bb3 . D4 . G3 . D4 . Bb3 . D4 ."],
    ["C#5 - - - - - - - E5 - - - . . . .", "A7", "pump16", "A3 . E4 . C#4 . E4 . A3 . E4 . C#4 . E4 ."],
    ["G4 . . G4 . . G4 . A4 - - - D5 - - -", "Gm", "pump16"],
    ["A4 . . A4 . . A4 . C#5 - - - A5 - - -", "A7", "pump16"],
    ["A5 - - - - - - - G5 - - - F5 - - -", "Dm", "pump16"],
    ["F5 - - - - - - - E5 - - - D5 - E5 -", "Bb", "pump16"],
    ["D5 - - - - - - - Bb4 - - - C5 - D5 -", "Gm", "pump16"],
    ["E5 - - - - - - - - - - - . . A4 -", "A", "pump16"],
    ["D5 - - - E5 - F5 - A5 - - - - - - -", "Dm", "pump16"],
    ["G5 - - - - - - - F5 - - - E5 - - -", "C", "pump16"],
    ["F5 - - - - - - - E5 - - - D5 - - -", "Bb", "pump16"],
    ["C#5 - - - - - - - E5 - - - D5 - - -", "A7", "pump16"],
    ["D5 - - F5 - - E5 - D5 - - A4 - -", "Dm", "seven14"],
    ["D5 - - F5 - - E5 - D5 - - Bb4 - -", "Bb", "seven14"],
    ["D5 - - G5 - - F5 - D5 - - C5 - -", "Gm", "seven14"],
    ["C#5 - - D5 - - E5 - G5 - - E5 - -", "A7", "seven14"],
    ["D5 - - - - - F5 - E5 - - - D5 - C5 -", "Dm", "pump16"],
    ["Bb4 - - - - - D5 - C5 - - - Bb4 - A4 -", "Bb", "pump16"],
    ["G4 - - - - - Bb4 - A4 - - - G4 - F4 -", "Gm", "pump16"],
    ["E4 - - - G4 - - - A4 - - - C#5 - E5 -", "A7", "pump16"],
    ["A5 - - - G5 F5 E5 F5 D5 - - - E5 F5 G5 A5", "Dm", "pump16"],
    ["Bb5 A5 Bb5 C6 D6 - C6 Bb5 A5 G5 F5 G5 A5 - F5 D5", "Bb", "pump16"],
    ["E5 F5 G5 F5 E5 D5 E5 C5 G4 A4 B4 C5 D5 E5 F5 G5", "C", "pump16"],
    ["A5 - G5 - F5 - E5 - C#5 D5 E5 G5 A5 - - -", "A7", "pump16"],
    ["Bb5 A5 G5 A5 Bb5 C6 D6 C6 Bb5 A5 G5 F5 E5 F5 G5 A5", "Gm", "pump16"],
    ["D6 - - C#6 D6 E6 F6 E6 D6 C#6 D6 A5 F5 - E5 -", "Dm", "pump16"],
    ["D5 F5 Bb5 A5 G5 F5 D5 F5 Bb5 C6 D6 C6 Bb5 A5 G5 F5", "Bb", "pump16"],
    ["E5 - - - G5 - - - A5 - - - C#6 - - -", "A7", "pump16"],
    ["D6 C#6 D6 E6 F6 E6 D6 C6 A5 Bb5 C6 D6 E6 F6 E6 D6", "Dm", "pump16"],
    ["D6 - F6 - D6 C6 Bb5 C6 D6 F6 D6 C6 Bb5 A5 G5 F5", "Bb", "pump16"],
    ["E6 D6 C6 D6 E6 F6 G6 F6 E6 C6 G5 C6 E6 D6 C6 B5", "C", "pump16"],
    ["C#6 D6 E6 G6 - - F6 E6 D6 - C#6 - A5 - - -", "A7", "pump16"],
    ["Bb5 C6 D6 Bb5 A5 G5 A5 G5 D5 G5 A5 Bb5 C6 D6 F6 D6", "Gm", "pump16"],
    ["A5 - D6 - F6 - G6 - A6 G6 F6 E6 D6 C#6 D6 F6", "Dm", "pump16"],
    ["F6 E6 D6 C6 Bb5 C6 D6 E6 F6 G6 F6 E6 D6 C6 Bb5 A5", "Bb", "pump16"],
    ["G5 - - - A5 - - - C#6 - - - D6 - - -", "A7", "pump16"],
    ["C6 - - - - - - - Bb5 - - - Ab5 - - -", "Fm", "pump16", "F4 G4 Ab4 G4 F4 E4 F4 G4 Ab4 Bb4 Ab4 G4 F4 E4 F4 C4"],
    ["Ab5 - - - - - - - F5 - - - - - Eb5 -", "C#", "pump16", "Ab4 F#4 F4 F#4 Ab4 A4 Ab4 F#4 F4 Eb4 F4 F#4 Ab4 F#4 F4 Eb4"],
    ["F5 - - - - - - - C#6 - - - C6 - Bb5 -", "Bbm", "pump16", "Bb3 C4 C#4 C4 Bb3 A3 Bb3 C4 C#4 Eb4 C#4 C4 Bb3 A3 Bb3 F3"],
    ["Bb5 - - - - - - - C6 - - - E6 - - -", "C7", "pump16", "G4 F4 E4 F4 G4 Ab4 G4 F4 E4 D4 E4 F4 G4 F4 E4 D4"],
    ["F6 - - - - - - - Eb6 - - - C6 - - -", "Fm", "pump16", "F4 G4 Ab4 G4 F4 E4 F4 G4 Ab4 Bb4 Ab4 G4 F4 E4 F4 C4"],
    ["C#6 - - - - - - - Eb6 - - - F6 - - -", "C#", "pump16", "Ab4 F#4 F4 F#4 Ab4 A4 Ab4 F#4 F4 Eb4 F4 F#4 Ab4 F#4 F4 Eb4"],
    ["Bb5 - - - - - - - C6 - - - C#6 - - -", "Bbm", "pump16", "Bb3 C4 C#4 C4 Bb3 A3 Bb3 C4 C#4 Eb4 C#4 C4 Bb3 A3 Bb3 F3"],
    ["E6 - - - - - - - F6 - - - G6 - - -", "C7", "pump16", "G4 F4 E4 F4 G4 Ab4 G4 F4 E4 D4 E4 F4 G4 F4 E4 D4"],
    ["F6 - - - - - - - E6 - - - D6 - - -", "Bb", "pump16"],
    ["C#6 - - - - - - - A5 - - - E5 - - -", "A7", "pump16"],
  ],
};

const FINAL_EXTREMITY_2: Song = {
  bpm: 172, lead: "lead", layer: "organ", pad: "strings", counter: "chip", arps: true, arpStep: 1, bassVoice: "synth",
  stabs: true, drums: "battle", riff: "pump16", performance: [
    { bass: "E2 - - - - - - - - - - - - - - -" },
    { bass: "C2 - - - - - - - - - - - - - - -" },
    { bass: "A1 - - - - - - - - - - - - - - -" },
    { bass: "B1 - - - - - - - - - - - - - - -" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "A1 . . A1 . . A1 . A2 . . . A2 . A1 A2" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "B1 . . B1 . . B1 . B2 . . . B2 . B1 B2" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { kit: "kh h h h ks h h h kh . s s t t s s", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { kit: "kc . h ks h . kh h . ks h . ks h", bass: "E2 . E3 E2 . E3 E2 . D3 . B2 . E3 ." },
    { kit: "kh . h ks h . kh h . ks h . ks h", bass: "C2 . C3 C2 . C3 C2 . A#2 . G2 . C3 ." },
    { kit: "kh . h ks h . kh h . ks h . ks h", bass: "A1 . A2 A1 . A2 A1 . G2 . E2 . A2 ." },
    { kit: "kh . h ks h . kh t . s t s s s", bass: "B1 . B2 B1 . B2 B1 . A2 . F#2 . B2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . h . h . h . ks . h . h . h .", bass: "E2 . . . E3 . . . E2 . . . D3 . B2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . h . h . h .", bass: "C2 . . . C3 . . . C2 . . . A#2 . G2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . h . h . h .", bass: "A1 . . . A2 . . . A1 . . . G2 . E2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . s s t t s s", bass: "B1 . . . B2 . . . B1 . . . A2 . F#2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh . s s t t s s", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh . s s t t s s", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Eb2 Eb2 Eb3 Eb2 . Eb2 Eb3 Eb2 C#3 Eb2 Eb3 Eb2 Bb2 . C#3 Eb3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "Eb2 Eb2 Eb3 Eb2 . Eb2 Eb3 Eb2 C#3 Eb2 Eb3 Eb2 Bb2 . C#3 Eb3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 Bb2 C2 C3 C2 G2 . Bb2 C3" },
    { kit: "kh h h h ks h h h kh . s s t t s s", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "C2 C2 C3 C2 . C2 C3 C2 A#2 C2 C3 C2 G2 . A#2 C3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
  ],
  fills: EXTREMITY_FILLS, crashes: EXTREMITY_CRASHES, riser: [4, 5],
  sections: extremitySections("organ", "strings", "guitar", undefined),
  bars: [
    ["E5 - - - - - - - F#5 - - - G5 - - -", "Em", "pump16", "E3 . B3 . G3 . B3 . E3 . B3 . G3 . B3 ."],
    ["G5 - - - - - - - F#5 - - - E5 - - -", "C", "pump16", "C4 . G4 . E4 . G4 . C4 . G4 . E4 . G4 ."],
    ["C5 - - - - - - - D5 - - - E5 - - -", "Am", "pump16", "A3 . E4 . C4 . E4 . A3 . E4 . C4 . E4 ."],
    ["D#5 - - - - - - - F#5 - - - . . . .", "B7", "pump16", "B3 . F#4 . D#4 . F#4 . B3 . F#4 . D#4 . F#4 ."],
    ["A4 . . A4 . . A4 . B4 - - - E5 - - -", "Am", "pump16"],
    ["B4 . . B4 . . B4 . D#5 - - - B5 - - -", "B7", "pump16"],
    ["B5 - - - - - - - A5 - - - G5 - - -", "Em", "pump16"],
    ["G5 - - - - - - - F#5 - - - E5 - F#5 -", "C", "pump16"],
    ["E5 - - - - - - - C5 - - - D5 - E5 -", "Am", "pump16"],
    ["F#5 - - - - - - - - - - - . . B4 -", "B", "pump16"],
    ["E5 - - - F#5 - G5 - B5 - - - - - - -", "Em", "pump16"],
    ["A5 - - - - - - - G5 - - - F#5 - - -", "D", "pump16"],
    ["G5 - - - - - - - F#5 - - - E5 - - -", "C", "pump16"],
    ["D#5 - - - - - - - F#5 - - - E5 - - -", "B7", "pump16"],
    ["E5 - - G5 - - F#5 - E5 - - B4 - -", "Em", "seven14"],
    ["E5 - - G5 - - F#5 - E5 - - C5 - -", "C", "seven14"],
    ["E5 - - A5 - - G5 - E5 - - D5 - -", "Am", "seven14"],
    ["D#5 - - E5 - - F#5 - A5 - - F#5 - -", "B7", "seven14"],
    ["E5 - - - - - G5 - F#5 - - - E5 - D5 -", "Em", "pump16"],
    ["C5 - - - - - E5 - D5 - - - C5 - B4 -", "C", "pump16"],
    ["A4 - - - - - C5 - B4 - - - A4 - G4 -", "Am", "pump16"],
    ["F#4 - - - A4 - - - B4 - - - D#5 - F#5 -", "B7", "pump16"],
    ["E5 F#5 G5 E5 F#5 G5 A5 F#5 G5 A5 B5 G5 A5 B5 C6 A5", "Em", "pump16"],
    ["C6 B5 A5 B5 C6 D6 E6 C6 G5 E5 G5 C6 G5 E5 G5 C6", "C", "pump16"],
    ["D6 A5 F#5 A5 D6 A5 F#5 A5 E6 A5 F#5 A5 F#6 A5 F#5 A5", "D", "pump16"],
    ["D#6 E6 F#6 E6 D#6 C6 B5 A5 G5 F#5 E5 D#5 E5 F#5 A5 B5", "B7", "pump16"],
    ["C6 B5 A5 B5 C6 D6 E6 D6 C6 B5 A5 G5 A5 B5 C6 E6", "Am", "pump16"],
    ["G6 E6 F#6 E6 D6 E6 B5 E6 C6 E6 A5 E6 B5 E6 G5 B5", "Em", "pump16"],
    ["E6 D6 C6 B5 C6 D6 E6 G6 F#6 E6 D6 C6 B5 C6 D6 E6", "C", "pump16"],
    ["D#6 - - - F#6 - - - B5 - - - A5 - F#5 -", "B7", "pump16"],
    ["B5 A5 G5 A5 B5 C6 D6 E6 D6 C6 B5 A5 G5 F#5 E5 F#5", "Em", "pump16"],
    ["G5 E5 G5 C6 E6 D6 C6 G5 E5 G5 C6 E6 D6 C6 B5 C6", "C", "pump16"],
    ["A5 B5 A5 G5 F#5 E5 D5 E5 F#5 A5 D6 E6 F#6 E6 D6 A5", "D", "pump16"],
    ["D#6 C6 B5 A5 F#5 A5 B5 C6 D#6 E6 F#6 E6 D#6 C6 B5 A5", "B7", "pump16"],
    ["A5 E5 A5 C6 B5 A5 E6 A5 C6 A5 E6 A5 D6 A5 C6 B5", "Am", "pump16"],
    ["G5 B5 E6 G6 F#6 E6 D6 C6 B5 C6 E6 F#6 G6 A6 B6 G6", "Em", "pump16"],
    ["E6 G6 E6 D6 C6 D6 E6 C6 G5 E5 G5 C6 E6 D6 C6 B5", "C", "pump16"],
    ["A5 - - - B5 - - - D#6 - - - E6 - - -", "B7", "pump16"],
    ["D6 - - - - - - - C6 - - - Bb5 - - -", "Gm", "pump16", "G3 A3 Bb3 A3 G3 F#3 G3 A3 Bb3 C4 Bb3 A3 G3 F#3 G3 D3"],
    ["Bb5 - - - - - - - G5 - - - - - F5 -", "Eb", "pump16", "Bb4 Ab4 G4 Ab4 Bb4 B4 Bb4 Ab4 G4 F4 G4 Ab4 Bb4 Ab4 G4 F4"],
    ["G5 - - - - - - - Eb6 - - - D6 - C6 -", "Cm", "pump16", "C4 D4 Eb4 D4 C4 B3 C4 D4 Eb4 F4 Eb4 D4 C4 B3 C4 G3"],
    ["C6 - - - - - - - D6 - - - F#6 - - -", "D7", "pump16", "A4 G4 F#4 G4 A4 Bb4 A4 G4 F#4 E4 F#4 G4 A4 G4 F#4 E4"],
    ["G6 - - - - - - - F6 - - - D6 - - -", "Gm", "pump16", "G3 A3 Bb3 A3 G3 F#3 G3 A3 Bb3 C4 Bb3 A3 G3 F#3 G3 D3"],
    ["Eb6 - - - - - - - F6 - - - G6 - - -", "Eb", "pump16", "Bb4 Ab4 G4 Ab4 Bb4 B4 Bb4 Ab4 G4 F4 G4 Ab4 Bb4 Ab4 G4 F4"],
    ["C6 - - - - - - - D6 - - - Eb6 - - -", "Cm", "pump16", "C4 D4 Eb4 D4 C4 B3 C4 D4 Eb4 F4 Eb4 D4 C4 B3 C4 G3"],
    ["F#6 - - - - - - - G6 - - - A6 - - -", "D7", "pump16", "A4 G4 F#4 G4 A4 Bb4 A4 G4 F#4 E4 F#4 G4 A4 G4 F#4 E4"],
    ["G6 - - - - - - - F#6 - - - E6 - - -", "C", "pump16"],
    ["D#6 - - - - - - - B5 - - - F#5 - - -", "B7", "pump16"],
  ],
};

const FINAL_EXTREMITY_3: Song = {
  bpm: 180, lead: "lead", layer: "brass", pad: "strings", counter: "chip", arps: true, arpStep: 1, bassVoice: "synth",
  stabs: true, drums: "battle", riff: "pump16", performance: [
    { bass: "F#2 - - - - - - - - - - - - - - -" },
    { bass: "D2 - - - - - - - - - - - - - - -" },
    { bass: "B1 - - - - - - - - - - - - - - -" },
    { bass: "C#2 - - - - - - - - - - - - - - -" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "B1 . . B1 . . B1 . B2 . . . B2 . B1 B2" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "C#2 . . C#2 . . C#2 . C#3 . . . C#3 . C#2 C#3" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh . s s t t s s", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { kit: "kc . h ks h . kh h . ks h . ks h", bass: "F#2 . F#3 F#2 . F#3 F#2 . E3 . C#3 . F#3 ." },
    { kit: "kh . h ks h . kh h . ks h . ks h", bass: "D2 . D3 D2 . D3 D2 . C3 . A2 . D3 ." },
    { kit: "kh . h ks h . kh h . ks h . ks h", bass: "B1 . B2 B1 . B2 B1 . A2 . F#2 . B2 ." },
    { kit: "kh . h ks h . kh t . s t s s s", bass: "C#2 . C#3 C#2 . C#3 C#2 . B2 . G#2 . C#3 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . h . h . h . ks . h . h . h .", bass: "F#2 . . . F#3 . . . F#2 . . . E3 . C#3 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . h . h . h .", bass: "D2 . . . D3 . . . D2 . . . C3 . A2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . h . h . h .", bass: "B1 . . . B2 . . . B1 . . . A2 . F#2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . h . h . h . ks . s s t t s s", bass: "C#2 . . . C#3 . . . C#2 . . . B2 . G#2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh . s s t t s s", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh h h h ks h h h kh . s s t t s s", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "F2 F2 F3 F2 . F2 F3 F2 D#3 F2 F3 F2 C3 . D#3 F3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "A1 A1 A2 A1 . A1 A2 A1 G2 A1 A2 A1 E2 . G2 A2" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "F2 F2 F3 F2 . F2 F3 F2 D#3 F2 F3 F2 C3 . D#3 F3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh . s s t t s s", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kc h h h ks h h h kh h h h ks h kh h", bass: "D2 D2 D3 D2 . D2 D3 D2 C3 D2 D3 D2 A2 . C3 D3" },
    { kit: "kh h h h ks h h h kh h h h ks h kh h", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
  ],
  fills: EXTREMITY_FILLS, crashes: EXTREMITY_CRASHES, riser: [4, 5],
  sections: extremitySections("piano", "strings", "lead", "organ"),
  bars: [
    ["F#5 - - - - - - - G#5 - - - A5 - - -", "F#m", "pump16", "F#3 . C#4 . A3 . C#4 . F#3 . C#4 . A3 . C#4 ."],
    ["A5 - - - - - - - G#5 - - - F#5 - - -", "D", "pump16", "D4 . A4 . F#4 . A4 . D4 . A4 . F#4 . A4 ."],
    ["D5 - - - - - - - E5 - - - F#5 - - -", "Bm", "pump16", "B3 . F#4 . D4 . F#4 . B3 . F#4 . D4 . F#4 ."],
    ["F5 - - - - - - - G#5 - - - . . . .", "C#7", "pump16", "C#4 . G#4 . F4 . G#4 . C#4 . G#4 . F4 . G#4 ."],
    ["B4 . . B4 . . B4 . C#5 - - - F#5 - - -", "Bm", "pump16"],
    ["C#5 . . C#5 . . C#5 . F5 - - - C#6 - - -", "C#7", "pump16"],
    ["C#6 - - - - - - - B5 - - - A5 - - -", "F#m", "pump16"],
    ["A5 - - - - - - - G#5 - - - F#5 - G#5 -", "D", "pump16"],
    ["F#5 - - - - - - - D5 - - - E5 - F#5 -", "Bm", "pump16"],
    ["G#5 - - - - - - - - - - - . . C#5 -", "C#", "pump16"],
    ["F#5 - - - G#5 - A5 - C#6 - - - - - - -", "F#m", "pump16"],
    ["B5 - - - - - - - A5 - - - G#5 - - -", "E", "pump16"],
    ["A5 - - - - - - - G#5 - - - F#5 - - -", "D", "pump16"],
    ["F5 - - - - - - - G#5 - - - F#5 - - -", "C#7", "pump16"],
    ["F#5 - - A5 - - G#5 - F#5 - - C#5 - -", "F#m", "seven14"],
    ["F#5 - - A5 - - G#5 - F#5 - - D5 - -", "D", "seven14"],
    ["F#5 - - B5 - - A5 - F#5 - - E5 - -", "Bm", "seven14"],
    ["F5 - - F#5 - - G#5 - B5 - - G#5 - -", "C#7", "seven14"],
    ["F#5 - - - - - A5 - G#5 - - - F#5 - E5 -", "F#m", "pump16"],
    ["D5 - - - - - F#5 - E5 - - - D5 - C#5 -", "D", "pump16"],
    ["B4 - - - - - D5 - C#5 - - - B4 - A4 -", "Bm", "pump16"],
    ["G#4 - - - B4 - - - C#5 - - - F5 - G#5 -", "C#7", "pump16"],
    ["F#5 G#5 A5 F#5 G#5 A5 B5 G#5 A5 B5 C#6 A5 B5 C#6 D6 E6", "F#m", "pump16"],
    ["F#6 E6 D6 F#6 E6 D6 C#6 E6 D6 C#6 B5 D6 C#6 B5 A5 F#5", "D", "pump16"],
    ["G#5 A5 B5 C6 C#6 D6 D#6 E6 D#6 E6 B5 G#5 B5 E6 B5 G#5", "E", "pump16"],
    ["F5 F#5 G#5 B5 C#6 B5 G#5 F#5 F5 G#5 C#6 D6 C#6 B5 A5 G#5", "C#7", "pump16"],
    ["B5 C#6 D6 E6 F#6 E6 D6 C#6 B5 C#6 D6 F#6 E6 D6 C#6 B5", "Bm", "pump16"],
    ["A5 G#5 F#5 E5 F#5 G#5 A5 B5 C#6 E6 D6 C#6 F#6 E6 D6 C#6", "F#m", "pump16"],
    ["D6 E6 F#6 E6 D6 E6 F#6 G#6 A6 G#6 F#6 E6 F#6 A6 B6 A6", "D", "pump16"],
    ["G#6 - - - - - - - F6 - - - G#6 - - -", "C#7", "pump16"],
    ["C#6 B5 C#6 A5 B5 C#6 F#5 G#5 A5 C#6 D6 E6 F#6 E6 D6 C#6", "F#m", "pump16"],
    ["D6 C#6 D6 F#6 E6 F#6 A6 G#6 A6 F#6 E6 D6 A5 D6 E6 F#6", "D", "pump16"],
    ["G#6 F#6 E6 D#6 E6 F#6 G#6 B6 A6 G#6 F#6 E6 D#6 E6 F#6 G#6", "E", "pump16"],
    ["F6 E6 D6 C#6 B5 C#6 D6 E6 F6 G#6 F6 E6 D6 C#6 B5 G#5", "C#7", "pump16"],
    ["B5 C#6 D6 F#6 E6 D6 C#6 D6 E6 F#6 G6 F#6 E6 D6 C#6 D6", "Bm", "pump16"],
    ["C#6 D6 E6 F#6 G#6 A6 B6 A6 G#6 F#6 E6 D6 C#6 B5 A5 G#5", "F#m", "pump16"],
    ["A5 D6 E6 F#6 A6 B6 A6 F#6 E6 D6 E6 F#6 A6 B6 A6 F#6", "D", "pump16"],
    ["G#6 - - - F6 - - - G#6 - - - B6 - - -", "C#7", "pump16"],
    ["E6 - - - - - - - D6 - - - C6 - - -", "Am", "pump16", "A3 B3 C4 B3 A3 G#3 A3 B3 C4 D4 C4 B3 A3 G#3 A3 E3"],
    ["C6 - - - - - - - A5 - - - - - G5 -", "F", "pump16", "C5 A#4 A4 A#4 C5 C#5 C5 A#4 A4 G4 A4 A#4 C5 A#4 A4 G4"],
    ["A5 - - - - - - - F6 - - - E6 - D6 -", "Dm", "pump16", "D4 E4 F4 E4 D4 C#4 D4 E4 F4 G4 F4 E4 D4 C#4 D4 A3"],
    ["D6 - - - - - - - E6 - - - G#6 - - -", "E7", "pump16", "B4 A4 G#4 A4 B4 C5 B4 A4 G#4 F#4 G#4 A4 B4 A4 G#4 F#4"],
    ["A6 - - - - - - - G6 - - - E6 - - -", "Am", "pump16", "A3 B3 C4 B3 A3 G#3 A3 B3 C4 D4 C4 B3 A3 G#3 A3 E3"],
    ["F6 - - - - - - - G6 - - - A6 - - -", "F", "pump16", "C5 A#4 A4 A#4 C5 C#5 C5 A#4 A4 G4 A4 A#4 C5 A#4 A4 G4"],
    ["D6 - - - - - - - E6 - - - F6 - - -", "Dm", "pump16", "D4 E4 F4 E4 D4 C#4 D4 E4 F4 G4 F4 E4 D4 C#4 D4 A3"],
    ["G#6 - - - - - - - A6 - - - B6 - - -", "E7", "pump16", "B4 A4 G#4 A4 B4 C5 B4 A4 G#4 F#4 G#4 A4 B4 A4 G#4 F#4"],
    ["A6 - - - - - - - G#6 - - - F#6 - - -", "D", "pump16"],
    ["F6 - - - - - - - C#6 - - - G#5 - - -", "C#7", "pump16"],
  ],
};

/* Phase 4, Eternity: the last form. G sharp minor, 188 bpm, the same score as the other phases
   with a solo of its own, driven by a picked bass, an organ playing root-fifth-octave power chords,
   and a heavy but less crowded eighth-note kick pulse under the main riffs, as a rock orchestra
   plays a last battle. The solo, twenty-four bars over the vamp played three times and written new for it: four
   bars of violin, four of guitar over a pedal, four of synth in chromatic climbs, a bar each in turn, and eight
   bars of all of them together, synth and violin as one with the guitar a third below, over strings and brass.
   The climb after it reaches C sharp 7, the top of the whole suite. */
const soloBand = (lead: Voice, layer?: Voice) => ({ lead, layer, counter: "organChord" as const, pad: undefined, stabs: false });
const FINAL_EXTREMITY_4: Song = {
  bpm: 188, lead: "lead", layer: "brass", pad: "strings", counter: "organChord", bassVoice: "picked",
  stabs: true, drums: "battle", riff: "pump16", performance: [
    { bass: "G#2 - - - - - - - - - - - - - - -" },
    { bass: "E2 - - - - - - - - - - - - - - -" },
    { bass: "C#2 - - - - - - - - - - - - - - -" },
    { bass: "D#2 - - - - - - - - - - - - - - -" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "C#2 . . C#2 . . C#2 . C#3 . . . C#3 . C#2 C#3" },
    { kit: "kc . . k . . k . s . s . s s s s", bass: "D#2 . . D#2 . . D#2 . D#3 . . . D#3 . D#2 D#3" },
    { kit: "kc . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh . k . ks . k . ks . s s t t s s", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { kit: "kc . k ks . . kh . k . ks . . ks", bass: "G#2 . G#3 G#2 . G#3 G#2 . F#3 . D#3 . G#3 ." },
    { kit: "kh . k ks . . kh . k . ks . . ks", bass: "E2 . E3 E2 . E3 E2 . D3 . B2 . E3 ." },
    { kit: "kh . k ks . . kh . k . ks . . ks", bass: "C#2 . C#3 C#2 . C#3 C#2 . B2 . G#2 . C#3 ." },
    { kit: "kh k k ks k k kh t . s t s s s", bass: "D#2 . D#3 D#2 . D#3 D#2 . C#3 . A#2 . D#3 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc k . k h . k . ks . h k k . h .", bass: "G#2 . . . G#3 . . . G#2 . . . F#3 . D#3 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh k . k h . k . ks . h k k . h .", bass: "E2 . . . E3 . . . E2 . . . D3 . B2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh k . k h . k . ks . h k k . h .", bass: "C#2 . . . C#3 . . . C#2 . . . B2 . G#2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kh k . k h . k . ks . s s t t s s", bass: "D#2 . . . D#3 . . . D#2 . . . C#3 . A#2 ." },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . ks . s s t t s s", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . k . ks . k . kh . k . ks . k .", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . ks . s s t t s s", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . ks . s s t t s s", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . k . ks . k . kh . k . ks . k .", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . ks . s s t t s s", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kc . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "C#2 C#2 C#3 C#2 . C#2 C#3 C#2 B2 C#2 C#3 C#2 G#2 . B2 C#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "G#2 G#2 G#3 G#2 . G#2 G#3 G#2 F#3 G#2 G#3 G#2 D#3 . F#3 G#3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { leadAccents: EXTREMITY_FRONT, kit: "kh . k . ks . k . ks . s s t t s s", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
    { kit: "kc . k . ks . k . kh . k . ks . k .", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "B1 B1 B2 B1 . B1 B2 B1 A2 B1 B2 B1 F#2 . A2 B2" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "G2 G2 G3 G2 . G2 G3 G2 F3 G2 G3 G2 D3 . F3 G3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh . k . ks . k . ks . s s t t s s", bass: "F#2 F#2 F#3 F#2 . F#2 F#3 F#2 E3 F#2 F#3 F#2 C#3 . E3 F#3" },
    { kit: "kc . k . ks . k . kh . k . ks . k .", bass: "E2 E2 E3 E2 . E2 E3 E2 D3 E2 E3 E2 B2 . D3 E3" },
    { kit: "kh . k . ks . k . kh . k . ks . k .", bass: "D#2 D#2 D#3 D#2 . D#2 D#3 D#2 C#3 D#2 D#3 D#2 A#2 . C#3 D#3" },
  ],
  fills: [5, 13, 17, 21, 25, 29, 33, 37, 45, 53], crashes: [6, 14, 18, 22, 26, 30, 34, 38, 46, 54], riser: [4, 5],
  sections: [
    { from: 0, lead: "strings", layer: "organ", pad: "organ", counter: "piano", drums: "none", stabs: false },
    { from: 4, lead: "brass", layer: undefined },
    { from: 6 },
    { from: 14, lead: "organ", layer: "lead" },
    { from: 18, ...soloBand("guitar") },
    { from: 22, ...soloBand("violin") },
    { from: 26, ...soloBand("guitar") },
    { from: 30, ...soloBand("lead", "organ") },
    { from: 34, ...soloBand("violin") },
    { from: 35, ...soloBand("guitar") },
    { from: 36, ...soloBand("lead", "organ") },
    { from: 37, ...soloBand("lead", "violin") },
    { from: 38, lead: "lead", layer: "violin", counter: "guitar", pad: "strings", stabs: true },
    { from: 46, lead: "brass", layer: "lead" },
    { from: 54, lead: "strings", layer: "organ", stabs: false },
  ],
  bars: [
    ["G#5 - - - - - - - A#5 - - - B5 - - -", "G#m", "pump16", "G#3 . D#4 . B3 . D#4 . G#3 . D#4 . B3 . D#4 ."],
    ["B5 - - - - - - - A#5 - - - G#5 - - -", "E", "pump16", "E3 . B3 . G#3 . B3 . E3 . B3 . G#3 . B3 ."],
    ["E5 - - - - - - - F#5 - - - G#5 - - -", "C#m", "pump16", "C#4 . G#4 . E4 . G#4 . C#4 . G#4 . E4 . G#4 ."],
    ["G5 - - - - - - - A#5 - - - . . . .", "D#7", "pump16", "D#3 . A#3 . G3 . A#3 . D#3 . A#3 . G3 . A#3 ."],
    ["C#5 . . C#5 . . C#5 . D#5 - - - G#5 - - -", "C#m", "pump16", "C#3 . . C#3 . . C#3 . C#4 . . . C#4 . C#3 C#4"],
    ["D#5 . . D#5 . . D#5 . G5 - - - D#6 - - -", "D#7", "pump16", "D#3 . . D#3 . . D#3 . D#4 . . . D#4 . D#3 D#4"],
    ["D#6 - - - - - - - C#6 - - - B5 - - -", "G#m", "pump16", "G#2 G#2 . G#2 G#2 . G#2 G#2 D#3 . G#2 G#2 G#3 . G#2 G#2"],
    ["B5 - - - - - - - A#5 - - - G#5 - A#5 -", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["G#5 - - - - - - - E5 - - - F#5 - G#5 -", "C#m", "pump16", "C#3 C#3 . C#3 C#3 . C#3 C#3 G#3 . C#3 C#3 C#4 . C#3 C#3"],
    ["A#5 - - - - - - - - - - - . . D#5 -", "D#", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
    ["G#5 - - - A#5 - B5 - D#6 - - - - - - -", "G#m", "pump16", "G#2 G#2 . G#2 G#2 . G#2 G#2 D#3 . G#2 G#2 G#3 . G#2 G#2"],
    ["C#6 - - - - - - - B5 - - - A#5 - - -", "F#", "pump16", "F#3 F#3 . F#3 F#3 . F#3 F#3 C#4 . F#3 F#3 F#4 . F#3 F#3"],
    ["B5 - - - - - - - A#5 - - - G#5 - - -", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["G5 - - - - - - - A#5 - - - G#5 - - -", "D#7", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
    ["G#5 - - B5 - - A#5 - G#5 - - D#5 - -", "G#m", "seven14", "G#2 G#2 . G#2 G#2 . G#2 G#2 . D#3 . G#2 G#2 G#3"],
    ["G#5 - - B5 - - A#5 - G#5 - - E5 - -", "E", "seven14", "E3 E3 . E3 E3 . E3 E3 . B3 . E3 E3 E4"],
    ["G#5 - - C#6 - - B5 - G#5 - - F#5 - -", "C#m", "seven14", "C#3 C#3 . C#3 C#3 . C#3 C#3 . G#3 . C#3 C#3 C#4"],
    ["G5 - - G#5 - - A#5 - C#6 - - A#5 - -", "D#7", "seven14", "D#3 D#3 . D#3 D#3 . D#3 D#3 . A#3 . D#3 D#3 D#4"],
    ["G#5 - - - - - B5 - A#5 - - - G#5 - F#5 -", "G#m", "pump16", "G#2 - - - . . G#2 G#2 . . D#3 - . . G#2 G#2"],
    ["E5 - - - - - G#5 - F#5 - - - E5 - D#5 -", "E", "pump16", "E3 - - - . . E3 E3 . . B3 - . . E3 E3"],
    ["C#5 - - - - - E5 - D#5 - - - C#5 - B4 -", "C#m", "pump16", "C#3 - - - . . C#3 C#3 . . G#3 - . . C#3 C#3"],
    ["A#4 - - - C#5 - - - D#5 - - - G5 - A#5 -", "D#7", "pump16", "D#3 - - - . . D#3 D#3 . . A#3 - . . D#3 D#3"],
    ["D#6 - - - - - C#6 D#6 B5 - - - A#5 B5 C#6 D#6", "G#m", "pump16", "G#2 G#2 . G#2 G#2 . G#2 G#2 D#3 . G#2 G#2 G#3 . G#2 G#2"],
    ["E6 - D#6 E6 G#6 - F#6 E6 D#6 E6 F#6 G#6 B6 - - -", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["A#6 G#6 F#6 G#6 A#6 - B6 - A#6 G#6 F#6 E6 D#6 E6 F#6 C#6", "F#", "pump16", "F#3 F#3 . F#3 F#3 . F#3 F#3 C#4 . F#3 F#3 F#4 . F#3 F#3"],
    ["G6 - - - F#6 - E6 - D#6 - C#6 - A#5 - - -", "D#7", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
    ["C#6 G#5 C#6 E6 D#6 G#5 D#6 F#6 E6 G#5 E6 G#6 F#6 E6 D#6 C#6", "C#m", "pump16", "C#3 C#3 . C#3 C#3 . C#3 C#3 G#3 . C#3 C#3 C#4 . C#3 C#3"],
    ["G#6 F#6 D#6 F#6 D#6 C#6 D#6 C#6 B5 C#6 B5 A#5 B5 C#6 D#6 G#6", "G#m", "pump16", "G#2 G#2 . G#2 G#2 . G#2 G#2 D#3 . G#2 G#2 G#3 . G#2 G#2"],
    ["E6 B5 E6 G#6 F#6 B5 F#6 E6 D#6 B5 D#6 E6 F#6 G#6 B6 G#6", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["A#6 - G6 - F#6 - D#6 - C#6 - D#6 - A#5 - - -", "D#7", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
    ["G#5 A#5 B5 C#6 D#6 C#6 B5 A#5 B5 C#6 D#6 E6 F#6 E6 D#6 C#6", "G#m", "pump16", "G#2 G#2 . G#2 G#2 . G#2 G#2 D#3 . G#2 G#2 G#3 . G#2 G#2"],
    ["B5 C6 C#6 D6 D#6 E6 F6 F#6 G6 G#6 F#6 E6 D#6 E6 F#6 G#6", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["A#6 G#6 F#6 E6 F#6 G#6 A#6 B6 A#6 G#6 F#6 E6 D#6 C#6 D#6 F#6", "F#", "pump16", "F#3 F#3 . F#3 F#3 . F#3 F#3 C#4 . F#3 F#3 F#4 . F#3 F#3"],
    ["G6 F#6 D#6 C#6 A#5 C#6 D#6 F#6 G6 F#6 D#6 C#6 D#6 F#6 G6 A#6", "D#7", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
    ["E6 D#6 C#6 B5 C#6 - E6 - F#6 - G#6 - F#6 E6 D#6 E6", "C#m", "pump16", "C#3 C#3 . C#3 C#3 . C#3 C#3 G#3 . C#3 C#3 C#4 . C#3 C#3"],
    ["D#6 B5 D#6 E6 F#6 B5 F#6 G#6 A#6 B5 A#6 B6 A#6 G#6 F#6 D#6", "G#m", "pump16", "G#2 G#2 . G#2 G#2 . G#2 G#2 D#3 . G#2 G#2 G#3 . G#2 G#2"],
    ["E6 F#6 G#6 A6 B6 A6 G#6 F#6 E6 F#6 G#6 B6 A6 G#6 F#6 E6", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["D#6 - - - F#6 - - - G6 - - - A#6 - - -", "D#7", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
    ["B6 - - - - - A#6 G#6 D#6 - - - G#6 - B6 -", "G#m", "pump16", "G#6 - - - - - G6 E6 B5 - - - E6 - G#6 -"],
    ["B6 - - - A6 - G#6 - F#6 G#6 A6 G#6 F#6 E6 D#6 E6", "E", "pump16", "G#6 - - - F#6 - E6 - D#6 E6 F#6 E6 D#6 C#6 B5 C#6"],
    ["F#6 - - - G#6 - A#6 - B6 - A#6 - G#6 - F#6 -", "F#", "pump16", "D#6 - - - E6 - G6 - G#6 - G6 - E6 - D#6 -"],
    ["G6 - - - - - - - F#6 - D#6 - A#5 - - -", "D#7", "pump16", "D#6 - - - - - - - D#6 - B5 - G5 - - -"],
    ["C#6 D#6 E6 F#6 G#6 - - - F#6 - E6 - D#6 - E6 -", "C#m", "pump16", "A#5 B5 C#6 D#6 E6 - - - D#6 - C#6 - B5 - C#6 -"],
    ["D#6 - - - G#6 - - - B6 - - - A#6 - G#6 -", "G#m", "pump16", "B5 - - - E6 - - - G#6 - - - G6 - E6 -"],
    ["B6 - - - - - - - A6 - - - G#6 - - -", "E", "pump16", "G#6 - - - - - - - F#6 - - - E6 - - -"],
    ["G6 - - - - - - - A#6 - - - - - - -", "D#7", "pump16", "D#6 - - - - - - - G6 - - - - - - -"],
    ["F#6 - - - - - - - E6 - - - D6 - - -", "Bm", "pump16", "B2 B2 . B2 B2 . B2 B2 F#3 . B2 B2 B3 . B2 B2"],
    ["D6 - - - - - - - B5 - - - - - A5 -", "G", "pump16", "G3 G3 . G3 G3 . G3 G3 D4 . G3 G3 G4 . G3 G3"],
    ["B5 - - - - - - - G6 - - - F#6 - E6 -", "Em", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["E6 - - - - - - - F#6 - - - A#6 - - -", "F#7", "pump16", "F#3 F#3 . F#3 F#3 . F#3 F#3 C#4 . F#3 F#3 F#4 . F#3 F#3"],
    ["B6 - - - - - - - A6 - - - F#6 - - -", "Bm", "pump16", "B2 B2 . B2 B2 . B2 B2 F#3 . B2 B2 B3 . B2 B2"],
    ["G6 - - - - - - - A6 - - - B6 - - -", "G", "pump16", "G3 G3 . G3 G3 . G3 G3 D4 . G3 G3 G4 . G3 G3"],
    ["E6 - - - - - - - F#6 - - - G6 - - -", "Em", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["A#6 - - - - - - - B6 - - - C#7 - - -", "F#7", "pump16", "F#3 F#3 . F#3 F#3 . F#3 F#3 C#4 . F#3 F#3 F#4 . F#3 F#3"],
    ["B6 - - - - - - - A#6 - - - G#6 - - -", "E", "pump16", "E3 E3 . E3 E3 . E3 E3 B3 . E3 E3 E4 . E3 E3"],
    ["G6 - - - - - - - D#6 - - - A#5 - - -", "D#7", "pump16", "D#3 D#3 . D#3 D#3 . D#3 D#3 A#3 . D#3 D#3 D#4 . D#3 D#3"],
  ],
};

export const SONGS: Record<BaseSagaTrack, Song> = {
  ...SECOND_BATTLES,
  s2title: TITLE, s2hangar: HANGAR, s2hangar2: HANGAR2, s2hangar3: HANGAR3, s2stage: STAGE, s2stage2: STAGE2,
  s2alert2: ALERT2, s2alert3: ALERT3, s2pause: PAUSE, s2alert: ALERT, s2victory: VICTORY, s2gameover: GAMEOVER, s2ending: ENDING, s2fanfare: FANFARE,
  s2boss1: BOSSES[0], s2boss2: BOSSES[1], s2boss3: BOSSES[2], s2boss4: BOSSES[3],
  s2boss5: BOSSES[4], s2boss6: BOSSES[5], s2boss7: BOSSES[6], s2boss8: BOSSES[7], s2boss8b: JUDGEMENT, s2boss8c: LAST_STAND,
  s2bonus1: BONUS, s2bonus2: LANTERN_BAND, s2bonus3: RIVAL_BAND, s2bonus4: CROSSING_BAND, s2bonus5: LAST_LIGHT_BAND,
  s2bonus6: IRON_VANGUARD, s2bonus7: ASHEN_CROWN, s2bonus8: CRIMSON_OVERDRIVE, s2bonus9: STAGE_EXTENDED, s2bonus10: FINAL_EXTREMITY, s2bonus13: FINAL_EXTREMITY_2, s2bonus14: FINAL_EXTREMITY_3, s2bonus15: FINAL_EXTREMITY_4, s2bonus16: ASHEN_CROWN_II, s2bonus17: ASHEN_CROWN_III,
  s2bonus11: CODEX_SPACE_2,
  s2bonus12: FINAL_EXTREMITY_II,
};

export const ALTERNATE_SONGS = arrangeAscension(SONGS);
const PLAYBACK_SONGS: Record<SagaTrack, Song> = { ...SONGS, ...ALTERNATE_SONGS, ...ASCENSION_BONUS, ...SPACE3_SONGS };

/* Each song laid out step by step, checked once as the module loads. */
type Plan = { steps: number; bar: number[]; pos: number[]; len: number[]; start: number[]; bands: Song[]; kits: (string[] | undefined)[]; lead: Map<number, Cell>; counter: Map<number, Cell>; bass: Map<number, Cell>[]; chords: ReturnType<typeof chordOf>[] };
const PLANS = {} as Record<SagaTrack, Plan>;
for (const [track, song] of Object.entries(PLAYBACK_SONGS) as [SagaTrack, Song][]) {
  const plan: Plan = { steps: 0, bar: [], pos: [], len: [], start: [], bands: [], kits: [], lead: new Map(), counter: new Map(), bass: [], chords: [] };
  if (song.performance && song.performance.length !== song.bars.length) throw new Error(`${track}: performance must match the score's bars`);
  song.sections?.forEach((section, i) => {
    if (!Number.isInteger(section.from) || section.from < 0 || section.from >= song.bars.length || (i > 0 && section.from <= song.sections![i - 1].from)) {
      throw new Error(`${track}: section boundaries must be ordered, unique bar indices`);
    }
  });
  song.bars.forEach(([lead, chord, riff = song.riff, counter], b) => {
    const section = song.sections?.findLast((s) => s.from <= b);
    plan.bands.push(section ? { ...song, ...section } : song);
    const n = lead.trim().split(/\s+/).length;
    if (![12, 14, 16].includes(n)) throw new Error(`${track} bar ${b + 1}: ${n} cells`);
    if (!RIFFS[riff] || RIFFS[riff].split(/\s+/).length !== n) throw new Error(`${track} bar ${b + 1}: riff ${riff} does not fit ${n} cells`);
    const performance = song.performance?.[b];
    const kit = performance?.kit?.trim().split(/\s+/);
    if (kit && (kit.length !== n || kit.some((hit) => !/^(\.|[khstcor]+)$/.test(hit)))) throw new Error(`${track} bar ${b + 1}: invalid written drum pattern`);
    plan.kits.push(kit);
    for (const accents of [performance?.leadAccents, performance?.drumAccents]) {
      if (accents && (accents.length !== n || accents.some((v) => !Number.isFinite(v) || v < 0 || v > 1.5))) throw new Error(`${track} bar ${b + 1}: invalid accent map`);
    }
    if (performance?.gate !== undefined && (!Number.isFinite(performance.gate) || performance.gate <= 0 || performance.gate > 1)) throw new Error(`${track} bar ${b + 1}: invalid note gate`);
    plan.start.push(plan.steps);
    const shift = song.transpose ?? 0, chordInKey = chordOf(chord);
    plan.chords.push({ root: chordInKey.root + shift, tones: chordInKey.tones.map((m) => m + shift) });
    for (const c of cells(lead, midiOf)) plan.lead.set(plan.steps + c.at, { ...c, value: c.value + shift });
    if (counter) {
      if (counter.trim().split(/\s+/).length !== n) throw new Error(`${track} bar ${b + 1}: the counter-line does not fit ${n} cells`);
      for (const c of cells(counter, midiOf)) plan.counter.set(plan.steps + c.at, { ...c, value: c.value + (song.transpose ?? 0) });
    } else if (song.arps) {
      /* Up the chord and back in eighths, an octave down if it would reach the lead's register. */
      const t = plan.chords[b].tones, up = [t[0], t[1], t[2], t[0] + 12].map((m) => m + 12);
      const shift = Math.max(...up) > 72 ? -12 : 0, order = [0, 1, 2, 3, 2, 1];
      const every = song.arpStep ?? 2;
      for (let i = 0; i < n; i += every) plan.counter.set(plan.steps + i, { at: i, value: up[order[(i / every) % order.length]] + shift, len: every });
    }
    if (performance?.bass && performance.bass.trim().split(/\s+/).length !== n) throw new Error(`${track} bar ${b + 1}: written bass does not fit the bar`);
    const bassCells = performance?.bass ? cells(performance.bass, (note) => midiOf(note) - chordInKey.root) : cells(RIFFS[riff], Number);
    plan.bass.push(new Map(bassCells.map((c) => [c.at, c])));
    for (let i = 0; i < n; i++) { plan.bar.push(b); plan.pos.push(i); plan.len.push(n); }
    plan.steps += n;
  });
  PLANS[track] = plan;
}

/* Notes are queued this far ahead, so a slow game frame (a burst of particles, a garbage collection) never leaves the music late. */
const LOOKAHEAD = 0.3;
/* A tune that is replaced fades out over this many seconds, not a hard cut. */
const FADE_OUT = 0.25;
const TICK_MS = 25;
/* The guitar amp's distortion curve, worked out once instead of for every note. */
const GUITAR_CURVE = Float32Array.from({ length: 1024 }, (_, i) => Math.tanh(3.5 * (2 * i / 1023 - 1)));
/* A tune is played note by note the first time it is asked for, and recorded at the same time on an offline context, a couple of
   seconds of score at a time. From its next loop on it plays from the recording: one buffer instead of hundreds of synth voices a
   second, so the busiest score plays as smoothly as the quietest. Mono at 32 kHz, the last few kept. */
const RENDER = { rate: 32000, chunk: 2, keep: 6, tail: 2.5 };
const RENDERED = new Map<SagaTrack, AudioBuffer>();
const RENDERING = new Set<SagaTrack>();

export class SagaMusic {
  private ctx: AudioContext | null = null;
  private dest: AudioNode | null = null;
  private bus: GainNode | null = null;
  private requested: SagaTrack | null = null;
  private track: SagaTrack = "s2stage";
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;
  private noise: AudioBuffer | null = null;
  private organ: PeriodicWave | null = null;
  /* The recording being played, when the tune is playing from one. */
  private source: AudioBufferSourceNode | null = null;
  /* A mixer of its own for each tune: when the tune changes, the old one fades out through its fader while the
     new one starts on a fresh mixer, so one tune never cuts the other off or starts faded. */
  private fader: GainNode | null = null;
  /* The square lead's last note, which the next one glides from. */
  private lastSquare: { f: number; at: number; until: number } | null = null;
  private impulse: AudioBuffer | null = null;

  /* What belongs to the audio context (noise, the reverb's impulse, the organ's wave), made once, and then a
     mixer for the tune about to play. */
  private prepare(ctx: AudioContext, out: AudioNode) {
    if (this.ctx === ctx && this.dest === out && this.bus) return;
    if (this.ctx !== ctx || this.dest !== out || !this.impulse) {
      this.ctx = ctx;
      this.dest = out;
      const len = Math.floor(ctx.sampleRate * 1.8);
      this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.2), ctx.sampleRate);
      const nd = this.noise.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = impulse.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
      }
      this.impulse = impulse;
      const harmonics = [0, 1, 0.8, 0.5, 0.45, 0, 0.3, 0, 0.2];
      this.organ = ctx.createPeriodicWave(new Float32Array(harmonics.length), Float32Array.from(harmonics));
    }
    this.mixer(ctx, this.dest!);
  }

  /* The mixer: everything goes through one bus, straight out and into a hall reverb and an echo, and out
     through a fader that lets the tune be faded away. */
  private mixer(ctx: AudioContext, dest: AudioNode) {
    const out = (this.fader = ctx.createGain());
    out.connect(dest);
    this.bus = ctx.createGain();
    this.bus.connect(out);
    const hall = ctx.createConvolver();
    hall.buffer = this.impulse;
    const hallWet = ctx.createGain();
    hallWet.gain.value = 0.22;
    this.bus.connect(hall).connect(hallWet).connect(out);
    const echo = ctx.createDelay(1);
    echo.delayTime.value = 0.27;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    const echoWet = ctx.createGain();
    echoWet.gain.value = 0.12;
    this.bus.connect(echo).connect(tone).connect(feedback).connect(echo);
    tone.connect(echoWet).connect(out);
  }

  get playing(): SagaTrack | null {
    return this.timer || this.source ? this.track : null;
  }

  /* The studio (studio.tsx) plays one note at a time, each track on a mixer of its own: any voice of the band, one of
     the three basses, or a drum of the kit picked by its General MIDI number. */
  attach(ctx: AudioContext, out: AudioNode) {
    this.prepare(ctx, out);
  }

  note(voice: StudioVoice, midi: number, at: number, dur: number, velocity = 1) {
    if (voice === "drums") this.drum(GM_KIT[midi] ?? "r", at, velocity);
    else if (voice === "synthBass" || voice === "pickedBass" || voice === "slapBass") this.bass(midi, at, dur, voice === "synthBass" ? "synth" : voice === "pickedBass" ? "picked" : "slap");
    else this.voice(voice, midi, at, dur, (voice === "bell" ? 0.13 : voice === "organ" ? 0.09 : 0.11) * velocity);
  }

  /* Records a tune on an offline context, scheduling a chunk of the score at a time so no one moment builds thousands of nodes. */
  private record(track: SagaTrack) {
    if (typeof OfflineAudioContext === "undefined" || RENDERED.has(track) || RENDERING.has(track)) return;
    const song = PLAYBACK_SONGS[track], plan = PLANS[track], stepSec = 60 / song.bpm / 4;
    const length = plan.steps * stepSec + (song.once ? RENDER.tail : 0.05);
    let off: OfflineAudioContext;
    try { off = new OfflineAudioContext(1, Math.ceil(length * RENDER.rate), RENDER.rate); } catch { return; }
    RENDERING.add(track);
    const writer = new SagaMusic();
    writer.prepare(off as unknown as AudioContext, off.destination);
    let step = 0, t = 0;
    const until = (end: number) => {
      while (step < plan.steps && t < end) { writer.playStep(song, plan, step, t, stepSec); step += 1; t += stepSec; }
    };
    until(RENDER.chunk + 0.5);
    for (let at = RENDER.chunk; at < length; at += RENDER.chunk) {
      const mark = at;
      off.suspend(mark).then(() => { until(mark + RENDER.chunk + 0.5); return off.resume(); }).catch(() => {});
    }
    off.startRendering().then((buffer) => {
      RENDERED.set(track, buffer);
      while (RENDERED.size > RENDER.keep) RENDERED.delete(RENDERED.keys().next().value as SagaTrack);
    }).catch(() => {}).finally(() => RENDERING.delete(track));
  }

  /* Plays a tune from its recording: looping from where its loop starts, or once, handing on to what follows. */
  private playRecording(track: SagaTrack, buffer: AudioBuffer, at: number, offset: number) {
    const ctx = this.ctx!, song = PLAYBACK_SONGS[track], plan = PLANS[track], stepSec = 60 / song.bpm / 4;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    if (!song.once) {
      src.loop = true;
      src.loopStart = plan.start[song.intro ?? 0] * stepSec;
      src.loopEnd = plan.steps * stepSec;
    }
    src.connect(this.fader ?? this.dest!);
    src.start(at, offset);
    this.track = track;
    this.source = src;
    if (song.once && song.then) {
      const next = song.then;
      src.onended = () => {
        if (this.source !== src) return;
        this.source = null;
        this.requested = next;
        const recorded = RENDERED.get(next);
        if (recorded) this.playRecording(next, recorded, ctx.currentTime + 0.02, 0);
        else { this.play(next, ctx.currentTime + 0.02); this.record(next); }
      };
    }
  }

  /* Asking again for what was last asked for, or for what is already playing, changes nothing. `from` is where in a
     looping tune to begin, in seconds (a tune picked up again after a pause). */
  start(ctx: AudioContext, out: AudioNode, track: SagaTrack, from = 0) {
    if (this.ctx === ctx && (this.requested === track || (this.timer && this.track === track))) {
      this.requested = track;
      return;
    }
    this.stop(this.timer || this.source ? FADE_OUT : 0);
    this.prepare(ctx, out);
    this.requested = track;
    const song = PLAYBACK_SONGS[track], plan = PLANS[track], stepSec = 60 / song.bpm / 4;
    const loopLength = plan.steps * stepSec;
    const begin = !song.once && from > 0 ? from % loopLength : 0;
    const recorded = RENDERED.get(track);
    if (recorded) { this.playRecording(track, recorded, ctx.currentTime + 0.05, begin); return; }
    this.play(track, ctx.currentTime + 0.05, Math.floor(begin / stepSec));
    this.record(track);
  }

  private play(track: SagaTrack, at: number, step = 0) {
    this.track = track;
    this.step = step;
    this.nextTime = at;
    if (!this.timer) this.timer = setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  /* Stops the tune: at once, or, with `fade` seconds, by fading its mixer away while whatever plays next
     starts on a mixer of its own. */
  stop(fade = 0) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.requested = null;
    const src = this.source, fader = this.fader;
    this.source = null;
    if (fade > 0 && fader && this.ctx) {
      const now = this.ctx.currentTime;
      fader.gain.cancelScheduledValues(now);
      fader.gain.setValueAtTime(fader.gain.value, now);
      fader.gain.linearRampToValueAtTime(0, now + fade);
      this.bus = null;
      this.fader = null;
      setTimeout(() => {
        try { src?.stop(); } catch { /* already stopped */ }
        src?.disconnect();
        fader.disconnect();
      }, (fade + 0.5) * 1000);
      return;
    }
    if (src) {
      try { src.stop(); } catch { /* already stopped */ }
      src.disconnect();
    }
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.bus || !this.timer) return;
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.02;
    while (this.timer && this.nextTime < ctx.currentTime + LOOKAHEAD) {
      const song = PLAYBACK_SONGS[this.track], plan = PLANS[this.track];
      if (this.step >= plan.steps) {
        /* At the loop, a tune whose recording is ready carries on from it, seamlessly. */
        const recorded = !song.once && RENDERED.get(this.track);
        if (recorded) {
          clearInterval(this.timer);
          this.timer = null;
          this.playRecording(this.track, recorded, this.nextTime, plan.start[song.intro ?? 0] * (60 / song.bpm / 4));
          return;
        }
        if (song.once) {
          if (song.then) { this.play(song.then, this.nextTime); this.record(song.then); continue; }
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        this.step = plan.start[song.intro ?? 0];
      }
      const stepSec = 60 / song.bpm / 4;
      this.playStep(song, plan, this.step, this.nextTime, stepSec);
      this.step += 1;
      this.nextTime += stepSec;
    }
  }

  /* ---------- the instruments ---------- */

  private env(at: number, attack: number, level: number, hold: number, release: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + attack);
    g.gain.setValueAtTime(level, at + Math.max(attack, hold));
    g.gain.linearRampToValueAtTime(0, at + Math.max(attack, hold) + release);
    g.connect(this.bus!);
    return g;
  }

  private osc(type: OscillatorType | PeriodicWave, f: number, detune: number, at: number, end: number, to: AudioNode) {
    const o = this.ctx!.createOscillator();
    if (typeof type === "string") o.type = type as OscillatorType;
    else o.setPeriodicWave(type);
    o.frequency.setValueAtTime(f, at);
    o.detune.setValueAtTime(detune, at);
    o.connect(to);
    o.start(at);
    o.stop(end);
    return o;
  }

  /* A gentle vibrato that sets in after `delay`. */
  private vibrato(at: number, end: number, delay: number, cents: number, targets: OscillatorNode[]) {
    if (end - at <= delay) return;
    const ctx = this.ctx!, lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = 5.6;
    depth.gain.setValueAtTime(0, at);
    depth.gain.linearRampToValueAtTime(cents, at + delay + 0.1);
    lfo.connect(depth);
    for (const t of targets) depth.connect(t.detune);
    lfo.start(at);
    lfo.stop(end);
  }

  private voice(kind: Voice, midi: number, at: number, dur: number, level: number) {
    const ctx = this.ctx!, f = freq(midi), end = at + dur + 0.4;
    switch (kind) {
      case "trumpet": {
        // A focused solo horn: fast tongue, bright attack, narrow sustained core.
        const g = this.env(at, 0.008, level * 0.72, dur, 0.055);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass"; filter.Q.value = 0.75;
        filter.frequency.setValueAtTime(900, at);
        filter.frequency.linearRampToValueAtTime(4400, at + 0.018);
        filter.frequency.exponentialRampToValueAtTime(1900, at + Math.min(0.2, dur));
        filter.connect(g);
        const a = this.osc("sawtooth", f, 0, at, end, filter);
        const harmonic = ctx.createGain(); harmonic.gain.value = 0.22; harmonic.connect(filter);
        this.osc("square", f, -2, at, end, harmonic);
        this.vibrato(at, end, 0.24, 9, [a]);
        break;
      }
      case "violin": {
        // Solo bow, distinct from the slow three-oscillator string ensemble.
        const g = this.env(at, Math.min(0.035, dur * 0.25), level * 0.7, dur, 0.12);
        const body = ctx.createBiquadFilter(); body.type = "bandpass";
        body.frequency.value = 1900; body.Q.value = 0.48; body.connect(g);
        const a = this.osc("sawtooth", f, -2, at, end, body);
        const b = this.osc("sawtooth", f, 2, at, end, body);
        this.vibrato(at, end, 0.12, 16, [a, b]);
        break;
      }
      case "guitar": {
        // Pick transient into a nonlinear amp; no sample or reference audio.
        const g = this.env(at, 0.003, level * 0.44, dur * 0.85, 0.07);
        const amp = ctx.createWaveShaper();
        amp.curve = GUITAR_CURVE; amp.oversample = "2x";
        const cab = ctx.createBiquadFilter(); cab.type = "lowpass"; cab.frequency.value = 3300; cab.Q.value = 0.6;
        amp.connect(cab).connect(g);
        const a = this.osc("sawtooth", f, 0, at, end, amp);
        this.vibrato(at, end, 0.22, 11, [a]);
        break;
      }
      case "organChord": {
        // Keep the root-fifth-octave power-chord shape, voiced by the game's organ instead of distorted guitar.
        const g = this.env(at, 0.008, level * 0.72, dur * 0.95, 0.075);
        for (const [ratio, detune] of [[1, -2], [1, 2], [1.5, 0], [2, 1]]) {
          this.osc(this.organ!, f * ratio, detune, at, end, g);
        }
        break;
      }
      case "piano": {
        // Decaying partials rather than the harp's fixed one-second envelope.
        for (const [multiple, weight, decay] of [[1, 0.85, 1.25], [2, 0.32, 0.5], [3.01, 0.12, 0.22]]) {
          const g = ctx.createGain(); g.gain.setValueAtTime(level * weight, at);
          g.gain.exponentialRampToValueAtTime(0.0001, at + Math.min(decay, dur + 0.18)); g.connect(this.bus!);
          this.osc("sine", f * multiple, 0, at, at + Math.min(decay, dur + 0.18) + 0.02, g);
        }
        break;
      }
      case "brass": {
        const g = this.env(at, 0.02, level, dur, 0.08);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.value = 2;
        filter.frequency.setValueAtTime(400, at);
        filter.frequency.linearRampToValueAtTime(2800, at + 0.04);
        filter.frequency.exponentialRampToValueAtTime(1400, at + 0.3);
        filter.connect(g);
        const a = this.osc("sawtooth", f, -6, at, end, filter), b = this.osc("sawtooth", f, 6, at, end, filter);
        this.vibrato(at, end, 0.25, 7, [a, b]);
        break;
      }
      case "strings": {
        const g = this.env(at, Math.min(0.14, dur * 0.4), level, dur, 0.3);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2400;
        filter.connect(g);
        const os = [-10, 0, 10].map((d) => this.osc("sawtooth", f, d, at, end, filter));
        this.vibrato(at, end, 0.2, 6, os);
        break;
      }
      case "lead": {
        const g = this.env(at, 0.01, level, dur, 0.06);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 3600;
        filter.connect(g);
        const a = this.osc("sawtooth", f, 0, at, end, filter), b = this.osc("square", f, 4, at, end, filter);
        this.vibrato(at, end, 0.15, 12, [a, b]);
        break;
      }
      case "square":
      case "superSquare": {
        /* A square lead in the manner of an 80s synth. The square is a lean one: a pulse in the middle and two quiet
           voices a few cents sharp and flat, panned a little left and right. The super square is wide: doubled an octave
           down, with six voices panned out to the edges, the outer ones furthest out. A soft filter, a delayed vibrato,
           and a quick glide from the last note when this one follows it closely and lies within an octave. */
        const wide = kind === "superSquare";
        const g = this.env(at, 0.006, level * 0.8, dur, 0.05);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass"; filter.Q.value = 1.2;
        filter.frequency.value = 3000;
        filter.connect(g);
        const centre = ctx.createGain(); centre.gain.value = wide ? 0.35 : 0.85; centre.connect(filter);
        const oscs: [OscillatorNode, number][] = [[this.osc("square", f, 0, at, end, centre), 1]];
        if (wide) {
          const sub = ctx.createGain(); sub.gain.value = 0.3; sub.connect(filter);
          oscs.push([this.osc("square", f / 2, 6, at, end, sub), 0.5]);
        }
        const spread = wide ? [[-7, -0.35], [7, 0.35], [-15, -0.7], [15, 0.7], [-24, -1], [24, 1]] : [[-4, -0.4], [4, 0.4]];
        for (const [cents, pan] of spread) {
          const side = ctx.createGain(); side.gain.value = wide ? 0.22 : 0.2;
          if (ctx.createStereoPanner) {
            const panner = ctx.createStereoPanner(); panner.pan.value = pan;
            side.connect(panner).connect(filter);
          } else side.connect(filter);
          oscs.push([this.osc("square", f, cents, at, end, side), 1]);
        }
        const last = this.lastSquare;
        if (last && last.at < at && at - last.until < 0.08 && last.f !== f && Math.abs(Math.log2(last.f / f)) <= 1) {
          for (const [o, ratio] of oscs) {
            o.frequency.setValueAtTime(last.f * ratio, at);
            o.frequency.exponentialRampToValueAtTime(f * ratio, at + 0.035);
          }
        }
        this.lastSquare = { f, at, until: at + dur };
        this.vibrato(at, end, 0.2, 14, oscs.map(([o]) => o));
        break;
      }
      case "organ": {
        const g = this.env(at, 0.006, level, dur, 0.05);
        this.osc(this.organ!, f, 0, at, end, g);
        this.osc(this.organ!, f, 8, at, end, g);
        break;
      }
      case "chip": {
        /* A square wave with no vibrato, quick on and off, like a handheld console's. */
        const g = this.env(at, 0.003, level, dur, 0.02);
        this.osc("square", f, 0, at, end, g);
        break;
      }
      case "harp": {
        /* A plucked string: a bright start that dies away. */
        const g = ctx.createGain();
        g.gain.setValueAtTime(level, at);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.9);
        g.connect(this.bus!);
        this.osc("triangle", f, 0, at, at + 1, g);
        this.osc("sine", f * 2, 0, at, at + 1, g);
        break;
      }
      case "bell": {
        const g = ctx.createGain();
        g.gain.setValueAtTime(level, at);
        g.gain.exponentialRampToValueAtTime(0.001, at + 1.4);
        g.connect(this.bus!);
        const shimmer = ctx.createGain();
        shimmer.gain.value = 0.35;
        shimmer.connect(g);
        this.osc("sine", f, 0, at, at + 1.5, g);
        this.osc("sine", f * 2.76, 0, at, at + 1.5, shimmer);
        break;
      }
    }
  }

  private bass(midi: number, at: number, dur: number, kind: Song["bassVoice"] = "synth") {
    if (kind !== "synth") {
      const ctx = this.ctx!, end = at + dur + 0.08;
      const g = this.env(at, 0.002, kind === "slap" ? 0.2 : 0.17, dur * 0.72, 0.045);
      const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.Q.value = 0.65;
      tone.frequency.setValueAtTime(kind === "slap" ? 3800 : 2200, at);
      tone.frequency.exponentialRampToValueAtTime(kind === "slap" ? 480 : 280, at + 0.11); tone.connect(g);
      this.osc("triangle", freq(midi), 0, at, end, tone);
      const edge = ctx.createGain(); edge.gain.value = kind === "slap" ? 0.3 : 0.13; edge.connect(tone);
      this.osc("sawtooth", freq(midi), 0, at, end, edge);
      if (kind === "slap") this.noiseHit(at, 0.018, 0.025, "bandpass", 2500);
      return;
    }
    const ctx = this.ctx!, end = at + dur + 0.05;
    const g = this.env(at, 0.004, 0.2, dur * 0.9, 0.04);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(1500, at);
    filter.frequency.exponentialRampToValueAtTime(320, at + 0.12);
    filter.connect(g);
    this.osc("sawtooth", freq(midi), 0, at, end, filter);
    const sub = ctx.createGain();
    sub.gain.value = 0.6;
    sub.connect(g);
    this.osc("sine", freq(midi - 12), 0, at, end, sub);
  }

  /* A riser from `at` for `dur` seconds: noise through a band that sweeps from 300 Hz to 9 kHz and swells, and a saw that
     climbs two octaves from `midi` through a filter that opens. It stops a moment before the end so what follows lands in
     silence. */
  private riser(at: number, dur: number, midi: number) {
    const ctx = this.ctx!, end = at + dur - 0.03;
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), swell = ctx.createGain();
    src.buffer = this.noise;
    src.loop = true;
    band.type = "bandpass";
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(300, at);
    band.frequency.exponentialRampToValueAtTime(9000, end);
    swell.gain.setValueAtTime(0.0001, at);
    swell.gain.exponentialRampToValueAtTime(0.16, end - 0.02);
    swell.gain.linearRampToValueAtTime(0, end);
    src.connect(band).connect(swell).connect(this.bus!);
    src.start(at);
    src.stop(end + 0.02);
    const tone = ctx.createGain(), open = ctx.createBiquadFilter(), saw = ctx.createOscillator();
    saw.type = "sawtooth";
    saw.frequency.setValueAtTime(freq(midi), at);
    saw.frequency.exponentialRampToValueAtTime(freq(midi) * 4, end);
    open.type = "lowpass";
    open.frequency.setValueAtTime(500, at);
    open.frequency.exponentialRampToValueAtTime(7000, end);
    tone.gain.setValueAtTime(0.0001, at);
    tone.gain.exponentialRampToValueAtTime(0.05, end - 0.02);
    tone.gain.linearRampToValueAtTime(0, end);
    saw.connect(open).connect(tone).connect(this.bus!);
    saw.start(at);
    saw.stop(end + 0.02);
  }

  private noiseHit(at: number, len: number, level: number, type: BiquadFilterType, f: number) {
    const ctx = this.ctx!, src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise;
    filter.type = type;
    filter.frequency.value = f;
    g.gain.setValueAtTime(level, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    src.connect(filter).connect(g).connect(this.bus!);
    src.start(at);
    src.stop(at + len);
  }

  private drum(kind: string, at: number, velocity = 1) {
    const ctx = this.ctx!;
    const thump = (from: number, to: number, len: number, level: number, type: OscillatorType) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(from, at);
      o.frequency.exponentialRampToValueAtTime(to, at + len * 0.6);
      g.gain.setValueAtTime(level * velocity, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + len);
      o.connect(g).connect(this.bus!);
      o.start(at);
      o.stop(at + len);
    };
    if (kind === "k") { thump(150, 45, 0.25, 0.55, "sine"); this.noiseHit(at, 0.01, 0.15 * velocity, "highpass", 3000); }
    else if (kind === "s") { this.noiseHit(at, 0.18, 0.28 * velocity, "bandpass", 1800); thump(200, 160, 0.09, 0.2, "triangle"); }
    else if (kind === "h") this.noiseHit(at, 0.04, 0.06 * velocity, "highpass", 7500);
    else if (kind === "o") this.noiseHit(at, 0.17, 0.055 * velocity, "highpass", 6500);
    else if (kind === "r") { this.noiseHit(at, 0.025, 0.09 * velocity, "bandpass", 2600); thump(1100, 850, 0.035, 0.08, "triangle"); }
    else if (kind === "t") thump(150, 70, 0.3, 0.38, "sine");
    else if (kind === "c") this.noiseHit(at, 1.1, 0.12 * velocity, "highpass", 5000);
  }

  private playStep(song: Song, plan: Plan, step: number, at: number, stepSec: number) {
    const b = plan.bar[step], pos = plan.pos[step], n = plan.len[step], chord = plan.chords[b];
    song = plan.bands[b];
    const performance = song.performance?.[b];

    const counter = plan.counter.get(step);
    /* A song with no counter voice plays its arpeggios on the chip; a section that sets the counter to undefined silences it. */
    const counterVoice = "counter" in song ? song.counter : "chip";
    if (counter && counterVoice) this.voice(counterVoice, counter.value, at, counter.len * stepSec * 0.8, song.counterLevel ?? 0.035);

    if (song.riser && pos === 0 && b === song.riser[0]) {
      let steps = 0;
      for (let k = song.riser[0]; k <= song.riser[1]; k++) steps += plan.len[plan.start[k]];
      this.riser(at, steps * stepSec, chord.root + 24);
    }

    const lead = plan.lead.get(step);
    if (lead) {
      const accent = performance?.leadAccents?.[pos] ?? 1, gate = performance?.gate ?? 0.95;
      this.voice(song.lead, lead.value, at, lead.len * stepSec * gate, (song.lead === "bell" ? 0.13 : song.lead === "organ" ? 0.09 : 0.11) * accent);
      if (song.layer) this.voice(song.layer, lead.value, at, lead.len * stepSec * gate, 0.05 * accent);
    }

    /* The pad holds the bar's chord from its first step to its last. */
    if (song.pad === "harp") {
      /* Up two octaves of the chord and back, an eighth at a time. */
      if (pos % 2 === 0) {
        const span = chord.tones.length * 2, i = (pos / 2) % (span * 2), k = i < span ? i : span * 2 - 1 - i;
        this.voice("harp", chord.tones[k % chord.tones.length] + 12 * (1 + Math.floor(k / chord.tones.length)), at, stepSec * 2, 0.05);
      }
    } else if (pos === 0 && song.pad) for (const tone of chord.tones) this.voice(song.pad, tone + 12, at, n * stepSec, song.pad === "organ" ? 0.025 : 0.035);
    if (song.stabs && STAB_AT[n].includes(pos)) for (const tone of chord.tones) this.voice("brass", tone + 12, at, stepSec * 1.5, 0.035);

    const bass = plan.bass[b].get(pos);
    if (bass) this.bass(chord.root + bass.value, at, bass.len * stepSec, song.bassVoice);

    if (song.drums === "none") return;
    const loud = song.drums === "battle" || song.drums === "march";
    const last = !song.once && b === song.bars.length - 1 && loud;
    /* A bar the song names in `fills` ends in a drum fill, and one named in `crashes` opens with a crash: the lead-in to a fast part. */
    const fill = last || (!!song.fills?.includes(b) && loud);
    const kit = plan.kits[b] ?? KITS[fill ? `fill${n}` : `${song.drums}${n}`]?.split(/\s+/);
    if (!kit) return;
    const hit = kit[pos];
    if (hit !== ".") for (const kind of hit) this.drum(kind, at, performance?.drumAccents?.[pos] ?? 1);
    const changed = b === 0 || b === (song.intro ?? 0) || plan.len[plan.start[b] - 1] !== n;
    if (pos === 0 && (changed || !!song.crashes?.includes(b)) && loud) this.drum("c", at);
  }
}
