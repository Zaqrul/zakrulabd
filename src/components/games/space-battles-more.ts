/* Space's added field battles, one for each chapter that had to share a tune: Chapters 2, 4, 5, 7 and 8. They keep the
   series' sound (the chip's three voices, 150 to 160 bpm, sixteen bars in the same shape: an eight bar tune, four bars of
   arpeggio over a galloping or pumping bass, four bars of twin lead and a turnaround on the dominant) and add to it: the
   tunes already there are untouched. Composed from the other battle tunes' own rhythms and chords;
   edit by hand freely. */
import type { Song } from "./space-music.ts";

export type MoreBattle = "stage4" | "stage5" | "stage6" | "stage7" | "stage8";

export const MORE_BATTLES: Record<MoreBattle, Song> = {
  /* Chapter 2, Crimson Bay: D minor, the full pulse over the broken-chord bass. */
  stage4: {
    bpm: 152, duty: 0.5, drums: "drive", riff: "arpbass", role: "echo",
    bars: [
      ["A5 - - - - - F5 - D6 - - - F5 - G5 -", "Dm"],
      ["E5 - - - - - A5 - C6 - - - E6 - C6 -", "C"],
      ["F5 - - - - - G5 - A#5 - - - D6 - F6 -", "A#"],
      ["C#6 - - - - - - - . . . . A5 - E6 -", "A7"],
      ["A5 - - - - - C6 - F6 - - - F5 - A5 -", "Dm"],
      ["D6 - - - - - F5 - A#5 - - - G5 - D6 -", "Gm"],
      ["C6 - - - - - A#5 - C6 - - - G5 - E5 -", "C"],
      ["C#5 - - - - - - - E5 - - - A5 - - -", "A7"],
      ["C6 - - - A5 - - - C6 - - - A5 - - -", "F", "gallop", "arp"],
      ["C6 - - - G5 - - - C6 - - - G5 - - -", "C", "gallop", "arp"],
      ["F5 - - - D6 - - - F5 - - - D6 - - -", "A#", "gallop", "arp"],
      ["C#6 - - - E6 - - - A5 - - - G5 - - -", "A7", "gallop", "arp"],
      ["F5 - - - A#5 - - - F5 - A#5 - D6 - - -", "A#", "drive", "harm"],
      ["E6 - - - G5 - - - E6 - C#6 - G5 - - -", "A7", "drive", "harm"],
      ["F5 - - - A5 - - - F5 - A5 - F5 - - -", "Dm", "drive", "harm"],
      ["C#6 - - - - - - - . . . . A5 - E6 -", "A7", "chrom", "harm"],
    ],
  },
  /* Chapter 4, Violet Nebula: G minor, bright pulse, pumping eighths and racing arpeggios. */
  stage5: {
    bpm: 154, duty: 0.25, drums: "rush", riff: "pump", role: "arp8",
    bars: [
      ["G5 - - - - - F5 - G5 - - - A#5 - G5 -", "Gm"],
      ["F5 - - - - - D#5 - F5 - - - A5 - F5 -", "F"],
      ["D#5 - - - - - G5 - D#6 - - - G5 - D#6 -", "D#"],
      ["A5 - - - - - - - F#5 - - - D6 - - -", "D7"],
      ["A#5 - - - - - G5 - A#5 - - - G5 - A#5 -", "Gm"],
      ["D6 - - - - - A#5 - D6 - - - A#5 - C6 -", "A#"],
      ["G5 - - - D#6 - C6 - D#6 - - - C6 - F5 -", "Cm"],
      ["F#5 - - - - - - - . . . . D6 - A5 -", "D7"],
      ["A#5 - - - - - - - G5 - - - D#6 - - -", "D#", "gallop", "arp"],
      ["F6 - - - - - - - C6 - - - A5 - - -", "F", "gallop", "arp"],
      ["D6 - - - - - - - A#5 - - - G5 - - -", "Gm", "gallop", "arp"],
      ["F#5 - - - - - - - D6 - - - C6 - - -", "D7", "gallop", "arp"],
      ["A#5 - D#6 - A#5 - - - G5 - D#6 - A#5 - D#6 -", "D#", "drive", "harm"],
      ["A5 - F#5 - C6 - - - A5 - F#5 - A5 - F#5 -", "D7", "drive", "harm"],
      ["A#5 - D6 - A#5 - - - G5 - D6 - A#5 - D6 -", "Gm", "drive", "harm"],
      ["F#5 - - - - - - - . . . . D6 - A5 -", "D7", "chrom", "harm"],
    ],
  },
  /* Chapter 5, Frozen Rings: F# minor, a twin lead over the broken-chord bass. */
  stage6: {
    bpm: 158, duty: 0.5, drums: "drive", riff: "arpbass", role: "harm",
    bars: [
      ["F#5 - - - A5 - F#5 - A5 - - - F#5 - A5 -", "F#m"],
      ["C#6 - - - E6 - B5 - A5 - - - C#6 - B5 -", "A"],
      ["E6 - - - G#5 - F#5 - E5 - - - G#5 - F#5 -", "E"],
      ["F5 - - - G#5 - - - C#6 - - - B5 - - -", "C#7"],
      ["A5 - - - F#5 - A5 - F#5 - - - A5 - F#5 -", "F#m"],
      ["D6 - - - A5 - F#5 - D6 - - - A5 - F#5 -", "D"],
      ["D6 - - - - - E6 - D6 - - - F#5 - G#5 -", "Bm"],
      ["F6 - - - - - - - . . . . C#6 - G#5 -", "C#7"],
      ["E6 - - - C#6 - - - E6 - - - C#6 - - -", "A", "pump", "arp"],
      ["E6 - - - B5 - - - E6 - - - B5 - - -", "E", "pump", "arp"],
      ["A5 - - - F#5 - - - A5 - - - F#5 - - -", "D", "pump", "arp"],
      ["F5 - - - G#5 - - - C#6 - - - B5 - - -", "C#7", "pump", "arp"],
      ["F#5 - D5 - B5 - - - D6 - A5 - B5 - A5 -", "Bm", "drive", "echo"],
      ["B5 - G#5 - E6 - - - B5 - C#6 - B5 - C#6 -", "E", "drive", "echo"],
      ["A5 - F#5 - C#5 - - - A4 - C#5 - A4 - C#5 -", "F#m", "drive", "echo"],
      ["F5 - - - - - - - . . . . C#6 - G#5 -", "C#7", "chrom", "echo"],
    ],
  },
  /* Chapter 7, Derelict Station: C minor, a bouncing bass and an echoing lead. */
  stage7: {
    bpm: 156, duty: 0.25, drums: "rush", riff: "bounce", role: "echo",
    bars: [
      ["C5 - - - D#5 - C5 - - - F5 - G5 - D#5 -", "Cm"],
      ["G#5 - - - C6 - G#5 - - - D#6 - C6 - F5 -", "G#"],
      ["A#5 - - - D6 - A#5 - - - D6 - F5 - G5 -", "A#"],
      ["B5 - - - D6 - - - G5 - - - F5 - - -", "G7"],
      ["D#5 - - - C5 - D#5 - - - G5 - D#5 - A#5 -", "Cm"],
      ["G#5 - - - D#6 - C6 - - - D#6 - C6 - G#5 -", "G#"],
      ["F5 - A#5 - F5 - - - G#5 - A#5 - G#5 - A#5 -", "Fm"],
      ["D6 - - - - - - - B5 - - - G5 - - -", "G7"],
      ["C6 - - - - - A#5 - G#5 - F5 - G#5 - - -", "Fm", "gallop", "arp"],
      ["A#5 - - - - - G5 - F5 - D6 - F5 - - -", "A#", "gallop", "arp"],
      ["A#5 - - - - - G5 - A#5 - F5 - G5 - - -", "D#", "gallop", "arp"],
      ["B5 - - - - - - - G5 - - - F5 - - -", "G7", "gallop", "arp"],
      ["C6 - - - F5 - G#5 - - - F5 - G#5 - F5 -", "Fm", "drive", "harm"],
      ["D6 - - - F5 - G5 - - - F5 - G5 - F5 -", "G7", "drive", "harm"],
      ["D#5 - - - G5 - C6 - - - A#5 - G5 - A#5 -", "Cm", "drive", "harm"],
      ["B4 - - - - - - - . . . . G4 - D5 -", "G7", "chrom", "harm"],
    ],
  },
  /* Chapter 8, The Fortress: C# minor, the hardest of the field tunes, pumping eighths. */
  stage8: {
    bpm: 160, duty: 0.25, drums: "rush", riff: "pump", role: "harm",
    bars: [
      ["C#5 - - - E5 - - - G#5 - F#5 - G#5 - - -", "C#m"],
      ["B5 - - - D#6 - - - F#5 - D#6 - F#5 - - -", "B"],
      ["A5 - - - C#6 - - - E6 - C#6 - E6 - - -", "A"],
      ["D#6 - - - - - - - C6 - - - G#5 - - -", "G#7"],
      ["E5 - - - C#5 - - - G#5 - E5 - G#5 - - -", "C#m"],
      ["A5 - - - F#5 - - - C#6 - A5 - C#6 - - -", "F#m"],
      ["F#5 - - - B5 - - - D#6 - - - B5 - C#6 -", "B"],
      ["C6 - - - D#6 - - - G#5 - - - F#5 - - -", "G#7"],
      ["E5 - - - - - C#5 - E5 - C#5 - A5 - - -", "A", "gallop", "arp8"],
      ["B5 - - - - - G#5 - F#5 - G#5 - D#6 - - -", "B", "gallop", "arp8"],
      ["G#5 - - - - - F#5 - E5 - F#5 - C#6 - - -", "C#m", "gallop", "arp8"],
      ["C6 - - - - - - - G#5 - - - F#5 - - -", "G#7", "gallop", "arp8"],
      ["E5 - - - A5 - - - C#6 - A5 - C#6 - - -", "A", "drive", "echo"],
      ["D#6 - - - F#5 - - - G#5 - D#6 - F#5 - - -", "G#7", "drive", "echo"],
      ["E5 - - - G#5 - - - E5 - G#5 - E5 - - -", "C#m", "drive", "echo"],
      ["C5 - - - - - - - . . . . G#4 - D#5 -", "G#7", "chrom", "echo"],
    ],
  },
};
