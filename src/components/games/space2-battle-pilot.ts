/* Scarlet Resolve: Ascension battle pilot 2.
   Original D-minor melody, 154 BPM. New solo trumpet, violin, electric guitar,
   piano and picked/slap bass synthesis. Riff -> lyrical horn -> fusion violin
   -> half-time guitar solo -> developed horn reprise -> turnaround.
   This score is authored independently of the reference MIDI note data. */
import type { BarPerformance, Song } from "./space2-music";

const REST = ". . . . . . . . . . . . . . . .";
const RIFF = "kt . h t . . kt . t . h . st . t t";
const ROCK = "kh . h k sh . kh . h . kh . sh . o .";
const DRIVE = "kh . kh . sh . kh . kh . h k sh . oh .";
const FUSION = "kh . h . rh . k h . h kh . rh . oh .";
const HALF = "kh . h . h . k . sh . h . kh . o .";
const FILL = "kh . h k sh . h . kh . h . s t t s";
const BREAK = "kh . . . . . h . sh . . . t t s s";
const bass = [
  "D2 D2 . A2 D3 - . . C3 - A2 - F2 - E2 -",
  "E2 . E2 G2 Bb2 - A2 - G2 E2 C#2 - E2 - A2 -",
  "D2 - D3 - A2 - C3 - D3 - A2 - F2 - A2 -",
  "Bb1 - Bb2 - F2 - A2 - Bb2 - F2 - D2 - F2 -",
  "C2 - G2 - C3 - B2 - A2 - G2 - E2 - G2 -",
  "A1 - A2 - E2 - G2 - A2 - G2 - E2 - C#2 -",
  "D2 - A2 D3 - C3 A2 - D3 - A2 - F2 - A2 -",
  "Bb1 - F2 Bb2 - A2 F2 - Bb2 - A2 - G2 - F2 -",
  "G1 - D2 G2 - A2 Bb2 - D3 - C3 - Bb2 - G2 -",
  "A1 - E2 - A2 - G2 - E2 - C#2 - . . C2 C#2",
  "F2 . C3 - . F3 . C3 F2 - . A2 C3 - E3 -",
  "C2 . G2 - . C3 . G2 E2 - . G2 A2 - B2 -",
  "D2 . A2 - . D3 . A2 F2 - . E2 D2 - C2 -",
  "A1 . E2 - . A2 . E2 C3 - . B2 A2 - G2 -",
  "Bb1 . F2 - . Bb2 . F2 D3 - . C3 Bb2 - A2 -",
  "G1 . D2 - . G2 . D2 B2 - . A2 G2 - F2 -",
  "E2 - G2 - Bb2 - A2 - G2 - F2 - E2 - C#2 -",
  "A1 - E2 - A2 - - - G2 - E2 - . . C2 C#2",
  "D2 - - - A2 - C3 - D3 - - - A2 - F2 -",
  "C2 - - - G2 - B2 - C3 - - - G2 - E2 -",
  "Bb1 - - - F2 - A2 - Bb2 - - - F2 - D2 -",
  "A1 - - - E2 - G2 - A2 - G2 - E2 - C#2 -",
  "D2 - A2 D3 - C3 A2 - D3 - A2 - F2 - A2 -",
  "Bb1 - F2 Bb2 - A2 F2 - Bb2 - A2 - G2 - F2 -",
  "C2 - G2 C3 - B2 G2 - C3 - G2 - E2 - G2 -",
  "A1 - E2 A2 - G2 E2 - A2 - G2 - E2 - C#2 -",
  "G1 - D2 G2 - A2 Bb2 - D3 - C3 - Bb2 - A2 -",
  "C2 - G2 C3 - D3 E3 - G3 - E3 - D3 - C3 -",
  "D2 - A2 D3 - C3 A2 - F2 - E2 - D2 - G#1 -",
  "A1 - E2 - A2 - G2 - E2 - C#2 - . . E2 -",
  "D2 - - - A2 - F2 - D2 - - - . . . .",
  "A1 - E2 - G2 - E2 - C#2 - B1 - A1 - C2 C#2",
];
const performance: BarPerformance[] = bass.map((line, i) => ({
  bass: line,
  kit: i < 2 ? (i === 1 ? FILL : RIFF) : [5, 9, 17, 21, 25, 29].includes(i) ? FILL : i >= 30 ? BREAK : i >= 18 && i < 22 ? HALF : i >= 10 && i < 18 ? FUSION : i >= 22 ? DRIVE : ROCK,
  gate: i >= 10 && i < 18 ? 0.98 : i >= 18 && i < 22 ? 0.74 : 0.9,
  leadAccents: [1, .86, .82, 1.08, .95, .85, .9, .82, 1.05, .8, .88, .8, .98, .8, .85, .78],
  drumAccents: [1, .6, .64, .85, 1, .55, .88, .56, .92, .55, .83, .75, 1, .65, .78, .72],
}));

export const BATTLE_PILOT: Song = {
  bpm: 154, lead: "trumpet", pad: "organ", counter: "guitar", bassVoice: "picked",
  drums: "battle", riff: "pump16", stabs: false, performance,
  crashes: [0, 2, 18, 22, 26],
  sections: [
    { from: 0, lead: "guitar", pad: undefined, counter: "piano" },
    { from: 2 },
    { from: 10, lead: "violin", pad: "strings", counter: "piano", bassVoice: "slap" },
    { from: 18, lead: "guitar", pad: undefined, counter: "organ" },
    { from: 22, counter: "violin", pad: "strings" },
    { from: 26, counter: "guitar", pad: "organ" },
    { from: 30, lead: "violin", counter: "piano", pad: "strings" },
  ],
  bars: [
    ["D4 D4 . A4 D5 - . . C5 - A4 - F4 - E4 -", "Dm", "pump16", REST],
    ["E4 . E4 G4 Bb4 - A4 - G4 E4 C#4 - E4 - A4 -", "A7", "pump16", REST],
    // Horn A: a recognisable rising pickup and a long destination, then an answer.
    ["A4 D5 E5 F5 - E5 D5 - A5 - - - G5 - F5 -", "Dm", "pump16", REST],
    ["D5 - - - F5 - G5 - A5 - G5 - F5 - E5 -", "Bb", "pump16", ". . . . . . . . F4 - - - D4 - F4 -"],
    ["E5 - - G5 - F5 E5 - D5 - - - C5 - . .", "C", "pump16", ". . . . . . . . . . . . . . G4 -"],
    ["C#5 - D5 - E5 - - - - - - - . . A4 -", "A7", "pump16", ". . . . . . . . A3 - E4 - G4 - E4 -"],
    ["A4 D5 E5 F5 - G5 A5 - D6 - - - C6 - A5 -", "Dm", "pump16", REST],
    ["Bb5 - A5 - G5 - F5 - D5 - - - F5 - G5 -", "Bb", "pump16", REST],
    ["Bb5 - - A5 G5 - F5 - D5 - F5 - G5 - A5 -", "Gm", "pump16", REST],
    ["G5 - E5 - C#5 - E5 - A4 - - - . . . .", "A7", "pump16", ". . . . . . . . . . . . E4 - G4 -"],
    // Fusion B: solo violin sings across a syncopated slap-bass/rim groove.
    ["A4 - - - - - C5 - F5 - - - E5 - D5 -", "Fmaj7", "pump16", "C4 - - - . . A3 - . . . . G3 - A3 -"],
    ["E5 - - - G5 - A5 - G5 - - - E5 - C5 -", "C", "pump16", "E4 - - - . . G3 - . . . . C4 - - -"],
    ["F5 - - - - - E5 - D5 - - - C5 - D5 -", "Dm", "pump16", "A3 - - - . . F3 - . . . . E3 - F3 -"],
    ["E5 - - - C5 - D5 - E5 - - - . . . .", "Am7", "pump16", "G3 - - - . . C4 - . . . . B3 - C4 -"],
    ["F5 - - - G5 - A5 - Bb5 - - - A5 - F5 -", "Bb", "pump16", REST],
    ["G5 - - - A5 - B5 - D6 - - - C6 - B5 -", "G7", "pump16", "B3 - - - . . D4 - . . . . F4 - D4 -"],
    ["Bb5 - A5 - G5 - F5 - E5 - G5 - Bb5 - A5 -", "Edim", "pump16", REST],
    ["G5 - - - E5 - - - C#5 - - - . . . .", "A7", "pump16", ". . . . . . . . A3 - E4 - G4 - A4 -"],
    // Guitar C: short solo, half-time drums; the bass leaves room for the runs.
    ["D5 F5 A5 G5 F5 E5 D5 C5 D5 - F5 - A5 - C6 -", "Dm", "pump16", "F4 - - - . . . . A4 - - - . . . ."],
    ["G5 E5 D5 C5 D5 E5 G5 A5 G5 - E5 - D5 - C5 -", "C", "pump16", "E4 - - - . . . . G4 - - - . . . ."],
    ["D5 F5 Bb5 A5 G5 F5 E5 D5 F5 - G5 - A5 - Bb5 -", "Bb", "pump16", "D4 - - - . . . . F4 - - - . . . ."],
    ["A5 G5 E5 D5 C#5 D5 E5 G5 A5 - - - . . . .", "A7", "pump16", ". . . . . . . . . . . . E4 - G4 -"],
    // Horn A': new destinations and violin answers; one F6 summit.
    ["A4 D5 E5 F5 - E5 D5 - A5 - - - C6 - D6 -", "Dm", "pump16", REST],
    ["D6 - C6 - Bb5 - A5 - F5 - G5 - A5 - C6 -", "Bb", "pump16", "F4 - - - A4 - - - Bb4 - - - A4 - F4 -"],
    ["E5 - - G5 - A5 G5 - E5 - D5 - C5 - E5 -", "C", "pump16", REST],
    ["G5 - - E5 - D5 C#5 - E5 - - - . . A5 -", "A7", "pump16", ". . . . . . . . . . . . G4 - E4 -"],
    ["Bb5 - - A5 G5 - A5 - D6 - E6 - F6 - E6 -", "Gm7", "pump16", "D4 - - - F4 - - - G4 - - - A4 - Bb4 -"],
    ["E6 - D6 - C6 - G5 - A5 - G5 - E5 - D5 -", "C", "pump16", REST],
    ["F5 - - A5 - G5 F5 - E5 - D5 - A4 - D5 -", "Dm", "pump16", REST],
    ["C#5 - D5 - E5 - G5 - A5 - - - . . . .", "A7", "pump16", ". . . . . . . . . . . . E4 - G4 -"],
    ["F5 - E5 - D5 - A4 - D5 - - - . . . .", "Dm", "pump16", "F3 - - - A3 - - - D4 - - - . . . ."],
    ["E5 - D5 - C#5 - B4 - A4 - - - . . . .", "A7", "pump16", "G3 - - - E3 - - - C#4 - - - . . . ."],
  ],
};
