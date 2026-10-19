/* Two independent battle compositions for the soundtrack's bonus shelf.
   Score analysis and phrase maps: docs/codex-battle-themes.md. */
import type { Song as ChipSong } from "./space-music";
import type { Song as OrchestraSong } from "./space2-music";

/* E minor, 24 bars. The hook anticipates beat two, then leaves space for
   pulse 2's echo. A quieter C-major middle opens into a higher reprise.
   B7's D# resolves up a semitone to the opening E when the track loops. */
export const CODEX_SPACE_1: ChipSong = {
  bpm: 156, duty: 0.25, drums: "drive", riff: "pump", role: "echo",
  bars: [
    // A: a two-bar question, sequence, then an altered answer.
    ["E5 - . G5 - - F#5 - E5 - B4 - D5 - E5 -", "Em"],
    ["G5 - - - E5 - D5 - C5 - - - . . B4 -", "C"],
    ["D5 - . F#5 - - E5 - D5 - A4 - C5 - D5 -", "D"],
    ["F#5 - - - E5 - D#5 - F#5 - - - . . . .", "B7"],
    ["E5 - . G5 - - A5 - B5 - A5 - G5 - F#5 -", "Em"],
    ["E5 - - - D5 - E5 - G5 - - - E5 - D5 -", "C"],
    ["C5 - B4 - A4 - - - C5 - D5 - E5 - F#5 -", "Am"],
    ["F#5 - E5 - D#5 - - - - - - - . . . .", "B7"],
    // B: longer breaths; a falling answer instead of a transposed hook.
    ["E5 - - - - - G5 - G5 - A5 - G5 - E5 -", "C", "walk", "harm"],
    ["D5 - - - - - F#5 - A5 - - - G5 - F#5 -", "D", "walk", "harm"],
    ["G5 - - - E5 - D5 - C5 - - - D5 - E5 -", "C", "walk", "harm"],
    ["B4 - - - - - - - D5 - E5 - F#5 - G5 -", "Em", "walk", "harm"],
    ["A5 - - - G5 - F#5 - E5 - - - C5 - D5 -", "Am", "bounce", "echo"],
    ["G5 - F#5 - E5 - D5 - E5 - - - G5 - A5 -", "Em", "bounce", "echo"],
    ["F#5 - . A5 - - G5 - F#5 - E5 - D#5 - E5 -", "B7", "bounce", "echo"],
    ["F#5 - - - - - - - . . D#5 - E5 - F#5 -", "B7", "hits", "none"],
    // A': expanded register, one E6 summit, then a compact turnaround.
    ["G5 - . B5 - - A5 - G5 - F#5 - E5 - F#5 -", "Em", "drive", "harm"],
    ["G5 - A5 - B5 - C6 - E6 - - - D6 - C6 -", "C", "drive", "harm"],
    ["A5 - . F#5 - - G5 - A5 - G5 - F#5 - E5 -", "D", "drive", "harm"],
    ["F#5 - - - D#5 - E5 - F#5 - - - . . . .", "B7", "drive", "harm"],
    ["E5 - . G5 - - F#5 - G5 - A5 - B5 - G5 -", "Em", "gallop", "echo"],
    ["A5 - G5 - E5 - - - C5 - D5 - E5 - F#5 -", "Am", "gallop", "echo"],
    ["G5 - F#5 - E5 - - - B4 - - - E5 - F#5 -", "Em", "drive", "harm"],
    ["F#5 - E5 - D#5 - B4 - D#5 - - - . . . .", "B7", "chrom", "none"],
  ],
};

/* D minor, 28 bars, independent of the chiptune melody. The hook's
   repeated A and falling F-E-D make a call; the bridge stretches that
   falling shape into 6/8. Written strings answer the brass in the gaps.
   A single F6 peak crowns the reprise; a four-bar tag returns to D5. */
export const CODEX_SPACE_2: OrchestraSong = {
  bpm: 148, lead: "brass", pad: "organ", counter: "strings",
  drums: "battle", riff: "slap16", fills: [15], crashes: [16],
  bars: [
    // A, 4/4: repeated-note call and a falling answer.
    ["D5 - A5 A5 - - G5 - F5 - E5 - D5 - . .", "Dm", "slap16", ". . . . . . . . . . . . F4 - G4 -"],
    ["D5 - - - F5 - E5 - D5 - C5 - Bb4 - - -", "Bb"],
    ["C5 - G5 G5 - - F5 - E5 - D5 - C5 - . .", "C", "slap16", ". . . . . . . . . . . . E4 - F4 -"],
    ["C#5 - D5 - E5 - - - - - - - . . . .", "A7", "pump16"],
    ["F5 - A5 A5 - - Bb5 - A5 - G5 - F5 - E5 -", "Dm"],
    ["F5 - - - E5 - D5 - C5 - D5 - F5 - - -", "Bb"],
    ["G5 - F5 - E5 - D5 - Bb4 - C5 - D5 - E5 -", "Gm", "pump16"],
    ["E5 - - - C#5 - D5 - E5 - - - . . . .", "A7", "hits16", ". . . . . . . . A4 - G4 - E4 - - -"],
    // B, 6/8: lyrical relative-major colour and contrary-motion strings.
    ["F5 - - G5 - A5 C6 - - Bb5 - A5", "F", "hold12", "A4 - - G4 - F4 E4 - - F4 - G4"],
    ["G5 - - A5 - G5 E5 - - D5 - C5", "C", "hold12", "E4 - - F4 - G4 G4 - - A4 - G4"],
    ["D5 - - E5 - F5 A5 - - G5 - F5", "Dm", "six12"],
    ["F5 - - G5 - F5 D5 - - C5 - Bb4", "Bb", "six12"],
    ["D5 - - E5 - F5 G5 - - A5 - Bb5", "Gm", "six12"],
    ["A5 - - G5 - F5 E5 - - D5 - C5", "F", "six12"],
    // Two shortened 7/8 bars tighten the return.
    ["Bb4 - - C5 - D5 - E5 - - F5 - G5 -", "Gm", "seven14"],
    ["A5 - - G5 - F5 - E5 - - C#5 - - -", "A7", "seven14"],
    // A': the call returns higher; the melody earns its one F6 peak.
    ["F5 - A5 A5 - - G5 - F5 - E5 - D5 - E5 -", "Dm", "gallop16"],
    ["F5 - - - A5 - Bb5 - D6 - - - C6 - Bb5 -", "Bb", "gallop16"],
    ["G5 - C6 C6 - - Bb5 - G5 - A5 - Bb5 - G5 -", "C", "gallop16"],
    ["A5 - - - G5 - F5 - E5 - - - C#5 - E5 -", "A7", "gallop16"],
    ["F5 - A5 A5 - - C6 - D6 - E6 - F6 - E6 -", "Dm", "gallop16"],
    ["D6 - C6 - Bb5 - - - A5 - G5 - F5 - E5 -", "Bb", "gallop16"],
    ["D5 - F5 F5 - - G5 - Bb5 - A5 - G5 - F5 -", "Gm", "drive16"],
    ["E5 - D5 - C#5 - - - E5 - - - . . . .", "A7", "hits16", ". . . . . . . . A4 - G4 - E4 - - -"],
    // Tag: fragment the call, resolve, leave a breath before looping.
    ["D5 - A5 A5 - - . . F5 - E5 - D5 - . .", "Dm", "slap16"],
    ["G5 - F5 - E5 - D5 - Bb4 - - - D5 - E5 -", "Gm", "pump16"],
    ["E5 - - - G5 - F5 - E5 - D5 - C#5 - - -", "A7", "chrom16"],
    ["D5 - - - - - - - . . . . . . . .", "Dm", "hold16", "F4 - - - E4 - - - D4 - - - . . . ."],
  ],
};
