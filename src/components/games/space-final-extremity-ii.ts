/* An original sequel to the site's Final Extremity, not a transcription.
   Sixty bars: invocation, engine, duel, lament, ascent, reprise, fracture, return.
   The A-Bb-A neighbour figure and F-E-D answer survive the changes of meter/key.
   Explicit counter-lines alternate delayed answers, contrary motion and pedals.
   Arrangement map and score analysis: docs/final-extremity-ii.md. */
import type { Song } from "./space2-music";

export const FINAL_EXTREMITY_II: Song = {
  bpm: 176, lead: "organ", layer: "lead", pad: "strings", counter: "bell",
  drums: "battle", stabs: true, riff: "drive16",
  fills: [3, 15, 23, 35, 47, 55], crashes: [4, 16, 36, 48, 56], riser: [34, 35],
  sections: [
    { from: 0, lead: "organ", layer: undefined, counter: "bell", drums: "toms", stabs: false },
    { from: 4 },
    { from: 16, lead: "lead", layer: undefined, counter: "organ", stabs: false },
    { from: 24, lead: "strings", layer: undefined, pad: "harp", counter: "bell", drums: "soft", stabs: false },
    { from: 32, lead: "organ", layer: undefined, counter: "strings", stabs: false },
    { from: 36 },
    { from: 48, lead: "lead", layer: "organ", counter: "bell" },
    { from: 56, lead: "organ", layer: undefined, counter: "strings", stabs: false },
  ],
  bars: [
    // 1–4: invocation, the neighbour figure in slow motion.
    ["D4 - - - - - - - A4 - - - Bb4 - A4 -", "Dm", "hold16", ". . . . F5 - - - E5 - - - D5 - - -"],
    ["Bb4 - - - - - A4 - F4 - - - E4 - D4 -", "Bb", "hold16", "D5 - - - F5 - - - E5 - - - D5 - - -"],
    ["Eb4 - - - G4 - - - Bb4 - A4 - G4 - F4 -", "Eb", "pulse16"],
    ["E4 - - - A4 - Bb4 - A4 - G4 - E4 - C#5 -", "A7", "pump16"],
    // 5–12: engine. Semitone turn, displaced accents, answered rather than copied.
    ["D5 . A5 Bb5 A5 - F5 - E5 F5 E5 - D5 - . .", "Dm", "drive16", "F4 - - - E4 - - - D4 - - - . . A4 -"],
    ["F5 - E5 - D5 - C5 - Bb4 - - - D5 - E5 -", "Bb", "drive16", "D4 - F4 - G4 - A4 - Bb4 - - - A4 - G4 -"],
    ["G5 . D6 Eb6 D6 - Bb5 - A5 Bb5 A5 - G5 - . .", "Gm", "drive16"],
    ["E5 - F5 - E5 - D5 - C#5 - - - E5 - G5 -", "A7", "chrom16"],
    ["F5 . A5 Bb5 A5 - G5 - F5 G5 F5 - E5 - D5 -", "Dm", "gallop16"],
    ["G5 - A5 - Bb5 - A5 - G5 - F5 - E5 - D5 -", "Gm", "gallop16"],
    ["Eb5 - F5 - G5 - Bb5 - A5 - G5 - F5 - Eb5 -", "Eb", "gallop16"],
    ["E5 - - - C#5 - D5 - E5 - - - . . . .", "A7", "hits16", "A4 - G4 - E4 - - - . . C#5 - D5 - E5 -"],
    // 13–16: 7/8 squeezes the hook; the answer enters before the bar turns.
    ["D5 . A5 Bb5 A5 - F5 - E5 F5 E5 - D5 -", "Dm", "seven14", "F4 - - E4 - - D4 - - A4 - - G4 -"],
    ["D5 - F5 - G5 - A5 - Bb5 - A5 - G5 -", "Bb", "seven14"],
    ["G5 . D6 Eb6 D6 - Bb5 - A5 Bb5 A5 - G5 -", "Gm", "seven14"],
    ["E5 - G5 - F5 - E5 - C#5 - - - . .", "A7", "seven14"],
    // 17–24: duel. Lead and organ trade fragments on different attacks.
    ["D5 - . . F5 - E5 - D5 - . . A4 - C5 -", "Dm", "slap16", ". . A4 Bb4 A4 - . . F4 - E4 - D4 - . ."],
    ["D5 - F5 - E5 - D5 - C5 - - - . .", "Bb", "seven14", "Bb4 - - . . D5 - C5 - Bb4 - A4 - G4"],
    ["C5 - . . E5 - D5 - C5 - . . G4 - A4 -", "C", "slap16", ". . G4 Ab4 G4 - . . E4 - D4 - C4 - . ."],
    ["C#5 - E5 - D5 - C#5 - B4 - A4 - - -", "A7", "seven14"],
    ["F5 - E5 - D5 - . . A5 - G5 - F5 - . .", "Dm", "slap16", ". . . . A4 Bb4 A4 - . . F4 - E4 - D4 -"],
    ["G5 - F5 - E5 - D5 - C5 - Bb4 - - -", "Gm", "seven14"],
    ["G5 - F5 - Eb5 - D5 - Eb5 - F5 - G5 - Bb5 -", "Eb", "pump16"],
    ["A5 - G5 - E5 - D5 - C#5 - - - . .", "A7", "seven14"],
    // 25–32: 6/8 lament in the relative major; the hook becomes a sigh.
    ["A5 - - Bb5 - A5 F5 - - E5 - D5", "F", "hold12", "C5 - - D5 - E5 F5 - - G5 - A5"],
    ["D5 - - E5 - F5 G5 - - F5 - D5", "Bb", "hold12", "Bb4 - - A4 - G4 F4 - - G4 - Bb4"],
    ["G5 - - A5 - G5 E5 - - D5 - C5", "C", "hold12"],
    ["F5 - - E5 - D5 E5 - - F5 - A5", "Dm", "hold12"],
    ["Bb5 - - A5 - G5 F5 - - E5 - D5", "Gm", "six12"],
    ["G5 - - F5 - Eb5 D5 - - Eb5 - F5", "Eb", "six12"],
    ["E5 - - F5 - E5 C#5 - - D5 - E5", "A7", "six12"],
    ["F5 - - E5 - D5 A4 - - - - -", "Dm", "hold12", "D5 - - E5 - F5 G5 - - F5 - E5"],
    // 33–36: rebuild from four notes to a stream, with a two-bar riser.
    ["Bb4 - - - C5 - - - D5 - - - F5 - - -", "Bb", "pulse16"],
    ["G5 - - - A5 - - - Bb5 - - - A5 - - -", "Gm", "pump16"],
    ["G5 - A5 - Bb5 - A5 - G5 - F5 - E5 - D5 -", "Eb", "pump16"],
    ["C#5 D5 E5 F5 E5 D5 C#5 B4 A4 B4 C#5 D5 E5 F5 G5 A5", "A7", "gallop16"],
    // 37–44: reprise. Original hook now has a climbing bell answer.
    ["D5 . A5 Bb5 A5 - F5 - E5 F5 E5 - D5 - F5 -", "Dm", "gallop16", "F4 - G4 - A4 - Bb4 - C5 - D5 - E5 - F5 -"],
    ["Bb5 - A5 - G5 - F5 - D5 - E5 - F5 - G5 -", "Bb", "gallop16"],
    ["G5 . D6 Eb6 D6 - Bb5 - A5 Bb5 A5 - G5 - A5 -", "Gm", "gallop16", "Bb4 - A4 - G4 - F4 - Eb4 - F4 - G4 - A4 -"],
    ["A5 - - - G5 - F5 - E5 - F5 - G5 - E5 -", "A7", "gallop16"],
    ["A5 . D6 Eb6 D6 - C6 - A5 Bb5 A5 - G5 - F5 -", "Dm", "drive16"],
    ["Bb5 - C6 - D6 - C6 - Bb5 - A5 - G5 - F5 -", "Bb", "drive16"],
    ["G5 - A5 - Bb5 - C6 - D6 - Eb6 - D6 - C6 -", "Gm", "gallop16"],
    ["C#6 - - - A5 - G5 - E5 - - - . . . .", "A7", "hits16", "E5 - F5 - G5 - A5 - Bb5 - A5 - G5 - E5 -"],
    // 45–48: dominant chain turns towards F# minor, rather than the first song's F minor.
    ["G5 - F#5 - E5 - D5 - B4 - C#5 - D5 - E5 -", "Em", "drive16"],
    ["F#5 - G#5 - A5 - B5 - C#6 - B5 - A5 - G#5 -", "A", "gallop16"],
    ["F#5 - A5 - B5 - C#6 - D6 - C#6 - B5 - A5 -", "Bm", "gallop16"],
    ["G#5 - A5 - B5 - A5 - G#5 - F#5 - F5 - G#5 -", "C#7", "chrom16"],
    // 49–56: fracture. 6/8 and 7/8 interrupt the elevated hook before 4/4 opens fully.
    ["F#5 . C#6 D6 C#6 - A5 - G#5 A5 G#5 -", "F#m", "six12", "A4 - - B4 - C#5 D5 - - C#5 - B4"],
    ["D6 - C#6 - B5 - A5 - F#5 - G#5 - A5 -", "D", "seven14"],
    ["B5 . F#6 G6 F#6 - D6 - C#6 D6 C#6 -", "Bm", "six12"],
    ["C#6 - B5 - A5 - G#5 - F5 - G#5 - B5 -", "C#7", "seven14"],
    ["A5 . C#6 D6 C#6 - B5 - A5 B5 A5 - G#5 - F#5 -", "F#m", "gallop16", "F#5 - E5 - D5 - C#5 - B4 - C#5 - D5 - E5 -"],
    ["F#5 - G#5 - A5 - B5 - C#6 - D6 - E6 - F#6 -", "D", "gallop16"],
    ["G6 - - F#6 - E6 - D6 C#6 - B5 - A5 - G#5 -", "Bm", "gallop16", "B4 - C#5 - D5 - E5 - F#5 - G5 - F#5 - E5 -"],
    ["F5 - G#5 - A5 - C#6 - B5 - G#5 - A5 - F5 -", "C#7", "chrom16"],
    // 57–60: collapse by semitone to D minor, then recall the invocation.
    ["F5 - A5 Bb5 A5 - G5 - F5 - E5 - D5 - E5 -", "Dm", "drive16"],
    ["F5 - Eb5 - D5 - C5 - Bb4 - C5 - D5 - F5 -", "Eb", "drive16"],
    ["E5 - F5 - E5 - D5 - C#5 - B4 - A4 - G4 -", "A7", "chrom16"],
    ["F4 - - - E4 - - - D4 - - - . . . .", "Dm", "hold16", "A4 - - - G4 - - - F4 - E4 - D4 - . ."],
  ],
};
