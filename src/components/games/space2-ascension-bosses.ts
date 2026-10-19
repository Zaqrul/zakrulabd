/* Space 2: Ascension's boss music, written whole for the alternate album. Every chapter's boss has its
   own 17-bar score in the shape of Ashen Crown (the bonus track from the original album), with the habits of
   the last battles of the first six Final Fantasy games: an opening bar played once, then an ostinato bass
   under a hook and its answer (A); a lyrical line in another meter (B); a break of long notes over the bass
   and drums, which opens with one bar of the original boss theme (R, see quoteOriginal), a riser under its
   last two bars and a drum fill into a crash; a gallop of scale runs that climbs to the top note (C), and a
   chromatic close back to A. The bass moves in eighths at most (it ran in sixteenths at first, too busy at
   these tempos): root and octave under A and the gallop, a waltz or a 7/8 heartbeat under B. Each boss keeps the key of its original theme. Every note is written for this
   game; none is taken from an existing work. Atlas's later phases play Atlas's score, faster and, in the
   last stand, a tone higher (the original's own transposition). */

type Bar = [lead: string, chord: string, riff: string];

/* The bar the original's quote goes in, and the bars of the riser, fill and crash. */
export const SUITE_MARKS = { quote: 9, riser: [11, 12] as [number, number], fill: 12, crash: 13, sections: { b: 5, rest: 9, gallop: 13 } };


/* Tidebreaker, G minor. */
const BOSS1: Bar[] = [
  ["G4 . G4 . Bb4 . G4 . C5 . G4 . D5 - - -", "Gm", "hits16"],
  ["G5 - - D5 - - G5 - A5 - Bb5 - A5 - G5 -", "Gm", "pump16"],
  ["F5 - - C5 - - F5 - G5 - A5 - G5 - F5 -", "F", "pump16"],
  ["Eb5 - - Bb4 - - Eb5 - F5 - G5 - A5 - Bb5 -", "Eb", "pump16"],
  ["A5 - - - - - F#5 - G5 - A5 - D5 - - -", "D7", "pump16"],
  ["Eb5 - - D5 - - C5 - - G5 - -", "Cm", "waltz12"],
  ["Bb5 - - A5 - - G5 - - D5 - -", "Gm", "waltz12"],
  ["C6 - - Bb5 - - Ab5 - - Eb5 - -", "Ab", "waltz12"],
  ["F#5 - - G5 - - A5 - - - - -", "D7", "waltz12"],
  ["G5 - - - - - - - - - - - D5 - - -", "Gm", "pulse16"],
  ["Eb5 - - - - - - - D5 - - - C5 - - -", "Eb", "pulse16"],
  ["C5 - - - D5 - - - Eb5 - - - F5 - - -", "Cm", "pulse16"],
  ["F#5 - - - - - - - A5 - - - . . . .", "D7", "pump16"],
  ["G5 - A5 - Bb5 - C6 - D6 - C6 - Bb5 - A5 -", "Gm", "pump16"],
  ["Bb5 - C6 - D6 - Eb6 - F6 - Eb6 - D6 - C6 -", "Eb", "pump16"],
  ["Eb6 - D6 - C6 - Bb5 - A5 - Bb5 - C6 - D6 -", "Cm", "pump16"],
  ["D6 - - - - - - - C6 - - - A5 - - -", "D7", "chrom16"],
];

/* Mangrove Hydra, E minor. */
const BOSS2: Bar[] = [
  ["E4 - - - F4 - - - E4 - - - D#4 - B4 -", "Em", "hold16"],
  ["B4 - E5 - - - F5 E5 - - D#5 - E5 - G5 -", "Em", "ostinato16"],
  ["C5 - E5 - - - F5 E5 - - D5 - C5 - G4 -", "C", "ostinato16"],
  ["A4 - C5 - - - D5 C5 - - B4 - A4 - E5 -", "Am", "ostinato16"],
  ["D#5 - - - - - F#5 - A5 - - - B5 - - -", "B7", "ostinato16"],
  ["G5 - - F#5 - - E5 - - B4 - -", "Em", "waltz12"],
  ["C5 - - B4 - - A4 - - E5 - -", "Am", "waltz12"],
  ["G5 - - F#5 - - E5 - - C5 - -", "C", "waltz12"],
  ["D#5 - - E5 - - F#5 - - - - -", "B7", "waltz12"],
  ["E5 - - - - - - - B4 - - - - - - -", "Em", "pulse16"],
  ["C5 - - - - - - - B4 - - - A4 - - -", "C", "pulse16"],
  ["A4 - - - B4 - - - C5 - - - D5 - - -", "Am", "pulse16"],
  ["D#5 - - - - - - - F#5 - - - . . . .", "B7", "pump16"],
  ["E5 - F#5 - G5 - A5 - B5 - A5 - G5 - F#5 -", "Em", "pump16"],
  ["G5 - A5 - B5 - C6 - D6 - C6 - B5 - A5 -", "C", "pump16"],
  ["C6 - B5 - A5 - G5 - F#5 - G5 - A5 - B5 -", "Am", "pump16"],
  ["B5 - - - - - - - A5 - - - F#5 - - -", "B7", "chrom16"],
];

/* Ice Wyvern, C sharp minor. */
const BOSS3: Bar[] = [
  ["C#4 . C#4 . C#4 . E4 . F#4 . G#4 - B4 - C#5 -", "C#m", "hits16"],
  ["G#5 - - - E5 - F#5 G#5 - - C#5 - - - B4 -", "C#m", "ostinato16"],
  ["A5 - - - E5 - F#5 A5 - - C#5 - - - B4 -", "A", "ostinato16"],
  ["F#5 - - - C#5 - D#5 F#5 - - A5 - - - G#5 -", "F#m", "ostinato16"],
  ["G#5 - - - - - B5 - D#6 - - - C6 - - -", "G#7", "ostinato16"],
  ["E5 - - D#5 - - C#5 - G#4 - - C#5 - -", "C#m", "throb14"],
  ["E5 - - F#5 - - G#5 - A5 - - E5 - -", "A", "throb14"],
  ["A5 - - G#5 - - F#5 - C#5 - - F#5 - -", "F#m", "throb14"],
  ["G#5 - - - - - F#5 - D#5 - - C5 - -", "G#7", "throb14"],
  ["C#5 - - - - - - - G#4 - - - - - - -", "C#m", "pulse16"],
  ["A4 - - - - - - - G#4 - - - F#4 - - -", "A", "pulse16"],
  ["F#4 - - - G#4 - - - A4 - - - B4 - - -", "F#m", "pulse16"],
  ["C5 - - - - - - - D#5 - - - . . . .", "G#7", "pump16"],
  ["C#5 - D#5 - E5 - F#5 - G#5 - A5 - G#5 - F#5 -", "C#m", "pump16"],
  ["E5 - F#5 - G#5 - A5 - B5 - C#6 - B5 - A5 -", "A", "pump16"],
  ["A5 - B5 - C#6 - D#6 - E6 - D#6 - C#6 - B5 -", "F#m", "pump16"],
  ["C6 - - - - - - - G#5 - - - D#5 - - -", "G#7", "chrom16"],
];

/* Dune Maw, D. */
const BOSS4: Bar[] = [
  ["D4 - A4 - D5 - - - C5 - A4 - D5 - - -", "D", "hits16"],
  ["F#5 - - E5 D5 - A4 - D5 - E5 - F#5 - A5 -", "D", "pump16"],
  ["G5 - - F5 E5 - C5 - E5 - F5 - G5 - - -", "C", "pump16"],
  ["F5 - - D5 Bb4 - D5 - F5 - G5 - A5 - Bb5 -", "Bb", "pump16"],
  ["A5 - - - - - G5 - E5 - - - C#5 - - -", "A7", "pump16"],
  ["D5 - - E5 - - F5 - - A5 - -", "Dm", "waltz12"],
  ["Bb5 - - A5 - - F5 - - D5 - -", "Bb", "waltz12"],
  ["D5 - - E5 - - F5 - - G5 - -", "Gm", "waltz12"],
  ["A5 - - - - - G5 - - E5 - -", "A7", "waltz12"],
  ["D5 - - - - - - - A4 - - - - - - -", "D", "pulse16"],
  ["C5 - - - - - - - E5 - - - G5 - - -", "C", "pulse16"],
  ["F5 - - - - - - - D5 - - - Bb4 - - -", "Bb", "pulse16"],
  ["C#5 - - - - - - - E5 - - - . . . .", "A7", "pump16"],
  ["D5 - E5 - F#5 - G5 - A5 - B5 - A5 - G5 -", "D", "pump16"],
  ["E5 - F5 - G5 - A5 - C6 - B5 - A5 - G5 -", "C", "pump16"],
  ["F5 - G5 - A5 - Bb5 - D6 - C6 - Bb5 - A5 -", "Bb", "pump16"],
  ["A5 - - - - - - - G5 - - - E5 - - -", "A7", "chrom16"],
];

/* Iron Meridian, F minor. */
const BOSS5: Bar[] = [
  ["F4 - C5 - F5 - - - Eb5 - C5 - Ab4 - G4 -", "Fm", "hits16"],
  ["C5 - - Ab4 - - F4 - G4 - - Ab4 - -", "Fm", "throb14"],
  ["Db5 - - Ab4 - - F4 - Ab4 - - Bb4 - -", "Db", "throb14"],
  ["Bb4 - - Db5 - - F5 - Eb5 - - Db5 - -", "Bbm", "throb14"],
  ["E5 - - F5 - - G5 - Bb5 - - G5 - -", "C7", "throb14"],
  ["Ab5 - - G5 - - F5 - - C5 - -", "Fm", "waltz12"],
  ["F5 - - Eb5 - - Db5 - - Ab4 - -", "Db", "waltz12"],
  ["Bb4 - - C5 - - Db5 - - F5 - -", "Bbm", "waltz12"],
  ["E5 - - - - - G5 - - C5 - -", "C7", "waltz12"],
  ["F5 - - - - - - - C5 - - - - - - -", "Fm", "pulse16"],
  ["Db5 - - - - - - - C5 - - - Bb4 - - -", "Db", "pulse16"],
  ["Bb4 - - - C5 - - - Db5 - - - Eb5 - - -", "Bbm", "pulse16"],
  ["E5 - - - - - - - G5 - - - . . . .", "C7", "pump16"],
  ["F5 - G5 - Ab5 - Bb5 - C6 - Bb5 - Ab5 - G5 -", "Fm", "pump16"],
  ["Ab5 - Bb5 - C6 - Db6 - Eb6 - Db6 - C6 - Bb5 -", "Db", "pump16"],
  ["Db6 - C6 - Bb5 - Ab5 - G5 - Ab5 - Bb5 - C6 -", "Bbm", "pump16"],
  ["C6 - - - - - - - Bb5 - - - G5 - - -", "C7", "chrom16"],
];

/* Permafrost, B minor. */
const BOSS6: Bar[] = [
  ["B4 - - - - - - - A#4 - - - B4 - - -", "Bm", "hold16"],
  ["F#5 - - D5 - - B4 - - C#5 - -", "Bm", "waltz12"],
  ["D5 - - B4 - - G4 - - A4 - -", "G", "waltz12"],
  ["E5 - - G5 - - B5 - - A5 - -", "Em", "waltz12"],
  ["A#5 - - - - - C#6 - - A#5 - -", "F#7", "waltz12"],
  ["B5 - - - - - A5 - F#5 - - - D5 - - -", "Bm", "pulse16"],
  ["D5 - - - - - E5 - G5 - - - B5 - - -", "G", "pulse16"],
  ["B5 - - - - - G5 - E5 - - - G5 - - -", "Em", "pulse16"],
  ["F#5 - - - - - E5 - C#5 - - - A#4 - - -", "F#7", "pulse16"],
  ["B4 - - - - - - - F#4 - - - - - - -", "Bm", "pulse16"],
  ["G4 - - - - - - - B4 - - - D5 - - -", "G", "pulse16"],
  ["E5 - - - - - - - F#5 - - - G5 - - -", "Em", "pulse16"],
  ["A#5 - - - - - - - C#6 - - - . . . .", "F#7", "pump16"],
  ["B5 - C#6 - D6 - E6 - F#6 - E6 - D6 - C#6 -", "Bm", "pump16"],
  ["B5 - A5 - G5 - F#5 - E5 - F#5 - G5 - A5 -", "G", "pump16"],
  ["G5 - A5 - B5 - C6 - D6 - C6 - B5 - A5 -", "Em", "pump16"],
  ["A#5 - - - - - - - F#5 - - - C#5 - - -", "F#7", "chrom16"],
];

/* Cyclone, A minor. */
const BOSS7: Bar[] = [
  ["A4 - - - Eb5 - - - A5 - - - - - E5 -", "Am", "hits16"],
  ["E5 - - A5 - - G5 - E5 - D5 - C5 - D5 -", "Am", "pump16"],
  ["F5 - - C6 - - B5 - A5 - G5 - F5 - G5 -", "F", "pump16"],
  ["D5 - - A5 - - G5 - F5 - E5 - D5 - E5 -", "Dm", "pump16"],
  ["G#5 - - - - - B5 - D6 - - - B5 - - -", "E7", "pump16"],
  ["C6 - - B5 - - A5 - E5 - - A5 - -", "Am", "throb14"],
  ["A5 - - G5 - - F5 - C5 - - F5 - -", "F", "throb14"],
  ["F5 - - E5 - - D5 - A4 - - D5 - -", "Dm", "throb14"],
  ["E5 - - - - - G#5 - B5 - - G#5 - -", "E7", "throb14"],
  ["A5 - - - - - - - E5 - - - - - - -", "Am", "pulse16"],
  ["F5 - - - - - - - E5 - - - D5 - - -", "F", "pulse16"],
  ["D5 - - - E5 - - - F5 - - - A5 - - -", "Dm", "pulse16"],
  ["G#5 - - - - - - - B5 - - - . . . .", "E7", "pump16"],
  ["A5 - B5 - C6 - D6 - E6 - D6 - C6 - B5 -", "Am", "pump16"],
  ["C6 - D6 - E6 - F6 - G6 - F6 - E6 - D6 -", "F", "pump16"],
  ["F6 - E6 - D6 - C6 - A5 - B5 - C6 - D6 -", "Dm", "pump16"],
  ["E6 - - - - - - - D6 - - - B5 - - -", "E7", "chrom16"],
];

/* Atlas, D minor. */
const BOSS8: Bar[] = [
  ["D4 - - - - - - - C#4 - - - D4 - A4 -", "Dm", "hold16"],
  ["D5 - - F5 - - A5 - G5 - F5 - E5 - D5 -", "Dm", "pump16"],
  ["D5 - - F5 - - Bb5 - A5 - G5 - F5 - D5 -", "Bb", "pump16"],
  ["Bb4 - - D5 - - G5 - F5 - E5 - D5 - Bb4 -", "Gm", "pump16"],
  ["C#5 - - E5 - - A5 - - - G5 - E5 - - -", "A7", "pump16"],
  ["F5 - - E5 - - D5 - - A4 - -", "Dm", "waltz12"],
  ["Bb4 - - C5 - - D5 - - G5 - -", "Gm", "waltz12"],
  ["F5 - - E5 - - D5 - - Bb4 - -", "Bb", "waltz12"],
  ["C#5 - - - - - E5 - - A5 - -", "A7", "waltz12"],
  ["A5 - - - - - - - F5 - - - - - - -", "Dm", "pulse16"],
  ["F5 - - - - - - - D5 - - - C5 - Bb4 -", "Bb", "pulse16"],
  ["Bb4 - - - C5 - - - D5 - - - E5 - - -", "Gm", "pulse16"],
  ["E5 - - - - - - - A5 - - - . . . .", "A7", "pump16"],
  ["D6 - C6 - A5 - F5 - A5 - C6 - D6 - E6 -", "Dm", "pump16"],
  ["F6 - E6 - D6 - Bb5 - D6 - E6 - F6 - G6 -", "Bb", "pump16"],
  ["G6 - F6 - E6 - D6 - C6 - Bb5 - A5 - G5 -", "Gm", "pump16"],
  ["A5 - - - - - - - G5 - - - E5 - - -", "A7", "chrom16"],
];

export const BOSS_SUITES: Record<string, Bar[]> = {
  s2boss1: BOSS1, s2boss2: BOSS2, s2boss3: BOSS3, s2boss4: BOSS4, s2boss5: BOSS5, s2boss6: BOSS6, s2boss7: BOSS7, s2boss8: BOSS8,
  s2boss8b: BOSS8, s2boss8c: BOSS8,
};
