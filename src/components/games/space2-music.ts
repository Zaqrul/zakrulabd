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

export type SagaTrack =
  | "s2title" | "s2hangar" | "s2hangar2" | "s2hangar3" | "s2stage" | "s2stage2" | "s2alert" | "s2alert2" | "s2alert3" | "s2pause" | "s2victory" | "s2gameover" | "s2ending" | "s2fanfare"
  | "s2boss1" | "s2boss2" | "s2boss3" | "s2boss4" | "s2boss5" | "s2boss6" | "s2boss7" | "s2boss8"
  /* Atlas's music follows its phases: Judgement from the fourth, the last stand in the sixth. */
  | "s2boss8b" | "s2boss8c";

type Voice = "brass" | "strings" | "lead" | "organ" | "bell" | "harp" | "chip";
/* A bar may carry a counter-line too, played by the song's `counter` voice. */
type Bar = [lead: string, chord: string, riff?: string, counter?: string];
type Song = {
  bpm: number;
  lead: Voice;
  /* Held under the bar, or for "harp" plucked up and down its chord in eighths. */
  pad?: "strings" | "organ" | "harp";
  counter?: Voice;
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
  intro?: number;
  once?: boolean;
  then?: SagaTrack;
};

const RIFFS: Record<string, string> = {
  drive16: "0 . 0 12 . 0 10 . 0 . 0 12 7 . 10 12",
  /* Eighths that never stop, root and octave: the engine of a handheld RPG's last battle. */
  pump16: "0 . 0 . 12 . 0 . 0 . 0 . 12 . 0 .",
  gallop16: "0 0 12 0 0 12 0 0 10 10 12 10 7 7 5 7",
  chrom16: "0 . 12 . 0 11 12 . 0 . 12 . 7 6 5 3",
  pedal16: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0",
  hits16: "0 . . 0 . . 0 . . . 0 . 0 . 0 .",
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

const SONGS: Record<SagaTrack, Song> = {
  s2title: TITLE, s2hangar: HANGAR, s2hangar2: HANGAR2, s2hangar3: HANGAR3, s2stage: STAGE, s2stage2: STAGE2,
  s2alert2: ALERT2, s2alert3: ALERT3, s2pause: PAUSE, s2alert: ALERT, s2victory: VICTORY, s2gameover: GAMEOVER, s2ending: ENDING, s2fanfare: FANFARE,
  s2boss1: BOSSES[0], s2boss2: BOSSES[1], s2boss3: BOSSES[2], s2boss4: BOSSES[3],
  s2boss5: BOSSES[4], s2boss6: BOSSES[5], s2boss7: BOSSES[6], s2boss8: BOSSES[7], s2boss8b: JUDGEMENT, s2boss8c: LAST_STAND,
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

/* Each song laid out step by step, checked once as the module loads. */
type Plan = { steps: number; bar: number[]; pos: number[]; len: number[]; start: number[]; lead: Map<number, Cell>; counter: Map<number, Cell>; bass: Map<number, Cell>[]; chords: ReturnType<typeof chordOf>[] };
const PLANS = {} as Record<SagaTrack, Plan>;
for (const [track, song] of Object.entries(SONGS) as [SagaTrack, Song][]) {
  const plan: Plan = { steps: 0, bar: [], pos: [], len: [], start: [], lead: new Map(), counter: new Map(), bass: [], chords: [] };
  song.bars.forEach(([lead, chord, riff = song.riff, counter], b) => {
    const n = lead.trim().split(/\s+/).length;
    if (![12, 14, 16].includes(n)) throw new Error(`${track} bar ${b + 1}: ${n} cells`);
    if (!RIFFS[riff] || RIFFS[riff].split(/\s+/).length !== n) throw new Error(`${track} bar ${b + 1}: riff ${riff} does not fit ${n} cells`);
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
    plan.bass.push(new Map(cells(RIFFS[riff], Number).map((c) => [c.at, c])));
    for (let i = 0; i < n; i++) { plan.bar.push(b); plan.pos.push(i); plan.len.push(n); }
    plan.steps += n;
  });
  PLANS[track] = plan;
}

const LOOKAHEAD = 0.12;
const TICK_MS = 25;

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

  /* The mixer: everything goes through one bus, straight out and into a hall reverb and an echo. */
  private prepare(ctx: AudioContext, out: AudioNode) {
    if (this.ctx === ctx && this.dest === out) return;
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
    const harmonics = [0, 1, 0.8, 0.5, 0.45, 0, 0.3, 0, 0.2];
    this.organ = ctx.createPeriodicWave(new Float32Array(harmonics.length), Float32Array.from(harmonics));

    this.bus = ctx.createGain();
    this.bus.connect(out);
    const hall = ctx.createConvolver();
    hall.buffer = impulse;
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
    return this.timer ? this.track : null;
  }

  /* Asking again for what was last asked for, or for what is already playing, changes nothing. */
  start(ctx: AudioContext, out: AudioNode, track: SagaTrack) {
    if (this.ctx === ctx && (this.requested === track || (this.timer && this.track === track))) {
      this.requested = track;
      return;
    }
    this.stop();
    this.prepare(ctx, out);
    this.requested = track;
    this.play(track, ctx.currentTime + 0.05);
  }

  private play(track: SagaTrack, at: number) {
    this.track = track;
    this.step = 0;
    this.nextTime = at;
    if (!this.timer) this.timer = setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.requested = null;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || !this.bus || !this.timer) return;
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

  private bass(midi: number, at: number, dur: number) {
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

  private drum(kind: string, at: number) {
    const ctx = this.ctx!;
    const thump = (from: number, to: number, len: number, level: number, type: OscillatorType) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(from, at);
      o.frequency.exponentialRampToValueAtTime(to, at + len * 0.6);
      g.gain.setValueAtTime(level, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + len);
      o.connect(g).connect(this.bus!);
      o.start(at);
      o.stop(at + len);
    };
    if (kind === "k") { thump(150, 45, 0.25, 0.55, "sine"); this.noiseHit(at, 0.01, 0.15, "highpass", 3000); }
    else if (kind === "s") { this.noiseHit(at, 0.18, 0.28, "bandpass", 1800); thump(200, 160, 0.09, 0.2, "triangle"); }
    else if (kind === "h") this.noiseHit(at, 0.04, 0.06, "highpass", 7500);
    else if (kind === "t") thump(150, 70, 0.3, 0.38, "sine");
    else if (kind === "c") this.noiseHit(at, 1.1, 0.12, "highpass", 5000);
  }

  private playStep(song: Song, plan: Plan, step: number, at: number, stepSec: number) {
    const b = plan.bar[step], pos = plan.pos[step], n = plan.len[step], chord = plan.chords[b];

    const counter = plan.counter.get(step);
    if (counter) this.voice(song.counter ?? "chip", counter.value, at, counter.len * stepSec * 0.8, 0.035);

    const lead = plan.lead.get(step);
    if (lead) this.voice(song.lead, lead.value, at, lead.len * stepSec * 0.95, song.lead === "bell" ? 0.13 : song.lead === "organ" ? 0.09 : 0.11);

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
    if (bass) this.bass(chord.root + bass.value, at, bass.len * stepSec);

    if (song.drums === "none") return;
    const last = !song.once && b === song.bars.length - 1 && (song.drums === "battle" || song.drums === "march");
    const kit = KITS[last ? `fill${n}` : `${song.drums}${n}`];
    if (!kit) return;
    const hit = kit.split(/\s+/)[pos];
    if (hit !== ".") this.drum(hit, at);
    const changed = b === 0 || b === (song.intro ?? 0) || plan.len[plan.start[b] - 1] !== n;
    if (pos === 0 && changed && (song.drums === "battle" || song.drums === "march")) this.drum("c", at);
  }
}
