/* Space 2: Ascension's Battle Theme (Variation 1), written whole for the alternate album. A minor, the key of
   the original, and in the album's angry mood: a two-bar riff, then an eight-bar trumpet sentence (a hook that
   leaps a fourth and falls back, answered, then sequenced up to a half cadence on E7); a lyrical violin
   section in 7/8 over a slap bass, which opens with one bar of the original (see quoteOriginal); a half-time
   guitar break of eighth-note runs; the trumpet hook again an octave higher, climbing to F6; and a chromatic
   turnaround to the riff. The bass moves in eighths at most. Every note is written for this game. */
import type { BarPerformance } from "./space2-music";

type Bar = [lead: string, chord: string, riff: string];

const RIFF = "k . h k s . k h . k h . s . t t";
const ROCK = "kh . h . s h kh . kh . h k s h o .";
const HALF = "kh . h . h . kh . s . h . kh . o .";
const FILL = "kh . h k s . h . kh . h . s t t s";
const SEVEN = "kh . h s h . kh h . s h . s h";
const LEAD16 = [1, .82, .86, 1.05, .9, .82, .95, .8, 1.05, .8, .88, .8, .98, .8, .86, .78];
const DRUM16 = [1, .6, .66, .85, 1, .58, .88, .56, .92, .56, .84, .74, 1, .64, .8, .72];
const LEAD14 = [1, .82, .86, 1.05, .82, .86, 1, .82, .9, 1.05, .82, .86, 1, .8];
const DRUM14 = [1, .6, .66, .9, .66, .6, 1, .66, .6, .9, .66, .6, .95, .7];

/* The bar the original's quote goes in, and where each part begins. */
export const BATTLE_MARKS = { quote: 10, sections: { theme: 2, violin: 10, guitar: 14, climax: 18, turn: 22 } };

export const BATTLE_BARS: Bar[] = [
  // The riff: bass and drums under a stabbing line.
  ["A4 . A4 . C5 . A4 . E5 - D5 - C5 - B4 -", "Am", "hits16"],
  ["G#4 . G#4 . B4 . G#4 . E5 - D5 - B4 - G#4 -", "E7", "hits16"],
  // The trumpet's sentence.
  ["E5 - - A5 - - G5 - E5 - - - C5 - D5 -", "Am", "pump16"],
  ["F5 - - - E5 - C5 - A4 - - - C5 - F5 -", "F", "pump16"],
  ["D5 - - F5 - - E5 - D5 - - - A4 - C5 -", "Dm", "pump16"],
  ["B4 - - - G#4 - B4 - E5 - - - - - . .", "E7", "pump16"],
  ["E5 - - A5 - - G5 - E5 - - - A5 - B5 -", "Am", "pump16"],
  ["C6 - - - A5 - F5 - A5 - - - C6 - D6 -", "F", "pump16"],
  ["D6 - - B5 - - G5 - B5 - D6 - E6 - D6 -", "G", "pump16"],
  ["B5 - - - G#5 - - - E5 - - - . . . .", "E7", "pump16"],
  // The violin in 7/8.
  ["C6 - - B5 - - A5 - E5 - - A5 - -", "Am", "throb14"],
  ["F5 - - E5 - - D5 - A4 - - D5 - -", "Dm", "throb14"],
  ["D5 - - C5 - - Bb4 - F5 - - D5 - -", "Bb", "throb14"],
  ["E5 - - - - - G#5 - B5 - - G#5 - -", "E7", "throb14"],
  // The guitar, half time.
  ["A5 - C6 - B5 - A5 - G5 - A5 - - - E5 -", "Am", "pulse16"],
  ["G5 - B5 - A5 - G5 - F#5 - G5 - - - D5 -", "G", "pulse16"],
  ["F5 - A5 - G5 - F5 - E5 - F5 - - - C5 -", "F", "pulse16"],
  ["E5 - G#5 - B5 - D6 - - - B5 - G#5 - - -", "E7", "pulse16"],
  // The hook an octave higher, to the top.
  ["E5 - - A5 - - C6 - B5 - - - A5 - B5 -", "Am", "pump16"],
  ["C6 - - - D6 - E6 - F6 - - - E6 - D6 -", "F", "pump16"],
  ["D6 - - - C6 - A5 - F5 - - - A5 - D6 -", "Dm", "pump16"],
  ["B5 - - - - - - - G#5 - - - E5 - - -", "E7", "pump16"],
  // The turnaround.
  ["F5 - E5 - D5 - C5 - B4 - C5 - D5 - E5 -", "F", "chrom16"],
  ["G#4 - - - B4 - - - E5 - - - . . . .", "E7", "hits16"],
];

const kitAt = (i: number) => (i < 2 ? RIFF : i >= 10 && i < 14 ? SEVEN : [9, 17, 21, 23].includes(i) ? FILL : i >= 14 && i < 18 ? HALF : ROCK);

export const BATTLE_PERFORMANCE: BarPerformance[] = BATTLE_BARS.map((_, i) => {
  const seven = i >= 10 && i < 14;
  return {
    kit: kitAt(i),
    leadAccents: seven ? LEAD14 : LEAD16,
    drumAccents: seven ? DRUM14 : DRUM16,
    gate: i >= 14 && i < 18 ? 0.8 : seven ? 0.98 : 0.9,
  };
});
