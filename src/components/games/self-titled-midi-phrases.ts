/* The phrases the two Self-Titled arrangements are built from (self-titled-midi-alternates.ts). The owner's MIDI files
   gave their form, chords and grooves only; every note here is written new (docs/composition-method.md), over the same
   chords the arrangements play, one bar of sixteenths per line.
   - RS_*: a SaGa-style battle in B minor. A hook that holds the fifth and falls by step to the root, answered by the
     strings in its rests; a pushed slap bass; a second subject that sings over G, Am7, D and climbs through B7, E and
     F sharp 7.
   - SEY_*: a dark organ-and-piano battle in E minor. A piano ostinato whose falling line is answered note by note by
     an E pedal; a chorale of held notes; repeated notes leaning on the second and leaping to the fifth; a G minor answer
     in arpeggios; chromatic falls over F7; a bass that climbs the minor third and fourth on E and on G. */

export const RS_INTRO: readonly string[] = [
  "F#4 B4 D5 B4 F#5 D5 B5 F#5 D6 B5 F#5 D5 B4 D5 F#5 A5",
  "A#4 C#5 E5 C#5 F#5 E5 A#5 F#5 C#6 A#5 F#5 E5 C#5 E5 F#5 A#5",
];

export const RS_HOOK: readonly string[] = [
  "F#5 - - - - - - - E5 - D5 - C#5 - D5 -",
  "B4 - - - - - - - . . F#4 - B4 - D5 -",
  "E5 - - - D5 - - - C#5 - - - D5 - E5 -",
  "F#5 - - - - - - - - - - - . . . .",
  "G5 - - - - - - - F#5 - E5 - D5 - B4 -",
  "C#5 - - - - - - - E5 - - - A5 - G5 -",
  "F#5 - - - - - - - D5 - - - B4 - C#5 -",
  "D5 - - - - - - - . . . . . . . .",
  "F#5 - - - - - - - E5 - D5 - C#5 - D5 -",
  "B5 - - - - - - - A5 - F#5 - D5 - F#5 -",
  "E5 - - - F#5 - - - G5 - - - F#5 - E5 -",
  "D5 - - - - - - - . . . . F#5 - A5 -",
  "B5 - - - - - - - A5 - G5 - F#5 - D5 -",
  "E5 - - - - - - - C#5 - E5 - A5 - C#6 -",
  "B5 - - - - - - - F#5 - - - D5 - - -",
  "C#5 - - - - - - - E5 - - - A#4 - - -",
];

/* The strings answer in the hook's rests. */
export const RS_ANSWERS: readonly string[] = [
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . D4 E4 F#4 A4",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . B3 D4 F#4 B4 A4 F#4 D4 C#4",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . D4 F#4 A4 D5 C#5 A4 . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . . . . .",
  ". . . . . . . . . . . . C#4 E4 F#4 A#4",
];

/* The slap bass, pushed off the beat and popped to the octave, turning into each next chord. */
const BM_A = "B2 . B3 . F#2 . A2 B2 . D3 . B2 A2 . F#2 A2";
const BM_B = "B2 . D3 . F#3 . E3 D3 . B2 . A2 F#2 . E2 F#2";
export const RS_BASS: readonly string[] = [
  BM_A, BM_B, BM_A, BM_B,
  "G2 . G2 G3 . G2 F#2 . G2 . G3 G2 . D3 F#2 G#2",
  "A2 . A2 A3 . A2 G2 . A2 . A3 A2 . E2 G2 A#2",
  BM_A, "B2 - - - D3 . B3 . A2 . F#2 . A2 . B2 .",
  BM_A, BM_B, BM_A, BM_B,
  "G2 . G2 G3 . G2 F#2 . G2 . G3 G2 . D3 F#2 G#2",
  "A2 . A2 A3 . A2 G2 . A2 . A3 A2 . E2 G2 A#2",
  BM_A, "F#2 . F#2 F#3 . F#2 E2 . F#2 . F#3 F#2 . C#3 E3 A#2",
];

/* The second subject, singing over G, Am7 and D, then climbing through B7, E and F sharp 7. */
export const RS_STRINGS: readonly string[] = [
  "D5 - - - - - B4 - D5 - - - G5 - - -",
  "F#5 - - - E5 - - - D5 - - - B4 - - -",
  "C5 - - - - - A4 - C5 - - - E5 - G5 -",
  "F#5 - - - - - - - E5 - D5 - A4 - - -",
  "B4 - - - D5 - - - G5 - - - F#5 - G5 -",
  "A5 - - - - - G5 - F#5 - - - D5 - - -",
  "E5 - - - C#5 - - - A4 - - - C#5 - E5 -",
  "D#5 - - - - - - - F#5 - A5 - F#5 - D#5 -",
  "G#5 - - - - - E5 - B4 - - - E5 - G#5 -",
  "A#5 - - - - - F#5 - C#5 - - - F#5 - A#5 -",
  "B5 - - - - - - - A5 - G5 - F#5 - E5 -",
  "D5 - - - - - - - . . . . . . . .",
];

export const RS_INNER: readonly string[] = [
  "B3 - - - - - - - D4 - - - - - - -",
  "D4 - - - - - - - B3 - - - - - - -",
  "E4 - - - - - - - C4 - - - - - - -",
  "A3 - - - - - - - F#3 - - - - - - -",
  "D4 - - - - - - - B3 - - - - - - -",
  "E4 - - - - - - - D4 - - - - - - -",
  "C#4 - - - - - - - E4 - - - - - - -",
  "A3 - - - - - - - D#4 - - - - - - -",
  "B3 - - - - - - - G#3 - - - - - - -",
  "C#4 - - - - - - - E4 - - - - - - -",
  "D4 - - - - - - - B3 - - - - - - -",
  ". . . . F#3 - - - B3 - - - D4 - - -",
];

/* The piano's ostinato: a line falling from B to F sharp, each note answered by an E pedal. */
export const SEY_CASCADE: readonly string[] = [
  "B5 E5 C6 E5 A5 E5 B5 E5 G5 E5 A5 E5 F#5 E5 G5 E5",
  "B5 E5 C6 E5 A5 E5 G5 E5 F#5 E5 G5 E5 D#5 E5 F#5 E5",
];

export const SEY_CHORALE: readonly string[] = [
  "E5 - - - - - - - - - - - D5 - - -",
  "F#5 - - - - - - - - - - - A5 - - -",
  "B5 - - - - - - - - - - - D5 - - -",
  "E5 - - - - - - - - - - - G5 - - -",
  "C5 - - - - - - - - - - - E5 - - -",
  "D5 - - - - - - - F#5 - - - - - - -",
  "G5 - - - - - - - - - - - E5 - - -",
  "B4 - - - - - - - - - - - - - - -",
];

/* Repeated notes leaning on the second above and leaping to the fifth, over the E pedal. */
export const SEY_PULSE: readonly string[] = [
  "E5 . E5 G5 . E5 . F#5 E5 . E5 G5 . E5 B5 -",
  "E5 . E5 G5 . E5 . F#5 E5 . E5 A5 . G5 F#5 -",
  "E5 . E5 G5 . E5 . F#5 E5 . E5 B5 . A5 G5 -",
  "G5 F#5 E5 D5 E5 D5 B4 A4 B4 A4 G4 F#4 G4 A4 B4 D5",
  "E5 . E5 A5 . E5 . G5 E5 . E5 A5 . E5 B5 -",
  "E5 . E5 A5 . E5 . G5 E5 . E5 A5 . B5 A5 -",
  "E5 . E5 B5 . E5 . A5 E5 . E5 B5 . A5 G5 -",
  "B4 C5 D5 E5 F#5 G5 A5 B5 C6 B5 A5 G5 F#5 E5 D#5 E5",
];

/* The answer in G minor, climbing the chord and falling back. */
export const SEY_MINOR_THIRD: readonly string[] = [
  "G4 - - A#4 - - D5 - F5 - - D5 - - C5 -",
  "A#4 - - - A4 - - - G4 - - - F4 - G4 -",
  "D5 - - F5 - - G5 - A#5 - - G5 - - F5 -",
  "D5 - - - - - - - C5 - A#4 - A4 - - -",
  "G5 - - F5 - - D5 - A#4 - - D5 - - F5 -",
  "G5 - - - A#5 - - - A5 - G5 - F5 - D5 -",
  "D#5 - - - - - D5 - C5 - - - A#4 - - -",
  "A4 - - - - - - - D5 - - - . . . .",
];

/* Chromatic falls over F7. */
export const SEY_CHROMATIC: readonly string[] = [
  "D#5 D5 C#5 C5 . . A4 . D#5 D5 C#5 C5 . . F5 .",
  "F5 E5 D#5 D5 . . C5 . F5 E5 D#5 D5 . . A5 .",
];

/* The pedal bass: the root pushed off the beat, up to its seventh and fifth, on E and then on G. */
const E_PEDAL = "E2 . E3 . G2 . A2 E2 . G2 . E3 . F#2 G2 A2";
const G_PEDAL = "G2 . G3 . A#2 . C3 G2 . A#2 . G3 . A2 A#2 C3";
export const SEY_BASS: readonly string[] = [
  E_PEDAL, E_PEDAL, E_PEDAL, "E2 . E3 . G2 . A2 E2 . G2 . A2 . G2 A2 B2",
  E_PEDAL, E_PEDAL, E_PEDAL, "E2 . E3 . G2 . A2 E2 . G2 . A2 . F#2 F2 F#2",
  G_PEDAL, G_PEDAL, G_PEDAL, "G2 . G3 . A#2 . C3 G2 . A#2 . C3 . A#2 C3 D3",
  G_PEDAL, G_PEDAL, G_PEDAL, "G2 . G3 . A#2 . C3 G2 . A#2 . C3 . A2 A#2 B2",
];
