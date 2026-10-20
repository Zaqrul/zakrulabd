/* Ashen Crown II: a darker sequel to the bonus tune Ashen Crown, for the soundtrack player only. Still C minor and
   still Ashen Crown's shapes (the 6/8 figure, the lament, the lead-in, the gallop, the arcs), but every major second
   of the figure is bent down to the Phrygian D flat, the band is brass over a church organ, and a violin counter-melody
   is written into every bar, played twice as loud as the series' usual counter-line. It answers in the lead's
   rests, moves against it (up when the lead falls, down when it climbs), sings a descant over the lament as a
   chromatic fall from C to G, and takes the runs while the lead holds. Opens with a tolling bell over toms. Its last part is after Judgement, Atlas's
   fourth and fifth phases: the chromatic run up into a hit, brass over organ and the throbbing ostinato bass, the climb
   to the flat second and the gallop. */
import type { Song } from "./space2-music";

export const ASHEN_CROWN_II: Song = {
  bpm: 156, lead: "brass", layer: "organ", pad: "organ", counter: "violin", counterLevel: 0.07,
  stabs: true, drums: "battle", riff: "six12",
  fills: [3, 11, 17, 25, 33], crashes: [4, 18, 26, 34], riser: [16, 17],
  sections: [
    { from: 0, lead: "organ", layer: undefined, counter: "bell", drums: "toms", stabs: false },
    { from: 4 },
    { from: 12, lead: "strings", layer: undefined, drums: "soft", stabs: false },
    { from: 16 },
    { from: 26, lead: "brass", layer: undefined },
    { from: 34, lead: "brass", layer: "lead" },
  ],
  bars: [
    // 1–4: the tolling. The figure in slow motion, low on the organ, a bell on the fifth, then Judgement's
    // chromatic run up into a hit, the violin running down against it.
    ["C4 - - - - - - - - Db4 - -", "Cm", "hold12", "G5 - - - - - G5 - - - - -"],
    ["Db4 - - - - - F4 - - Ab4 - -", "Db", "hold12", "Ab5 - - - - - Ab5 - - - - -"],
    ["C4 - - - - - Ab3 - - C4 - -", "Fm", "hold12", "F5 - - - - - F5 - - - - -"],
    ["G4 Ab4 A4 Bb4 B4 C5 Db5 D5 Eb5 - - - . . . .", "G7", "hits16", "G5 F#5 F5 E5 Eb5 D5 Db5 C5 B4 - - - . . . ."],
    // 5–12: the figure, its second bent to D flat. The violin moves against it and answers in its rests.
    ["C5 - - Db5 - - Eb5 - - Db5 - -", "Cm", "six12", "G4 - - F4 - - Eb4 - - F4 - -"],
    ["G5 - - F5 - - Eb5 - - C5 - -", "Cm", "six12", "C4 - - D4 - - Eb4 - - G4 - -"],
    ["F5 - - G5 - - Ab5 - - G5 - -", "Fm", "six12", "C5 - - Bb4 - - Ab4 - - Bb4 - -"],
    ["D5 - - C5 - - B4 - - . . .", "G7", "six12", "F4 - - G4 - - Ab4 - - B4 C5 D5"],
    ["Eb5 - - F5 - - G5 - - Ab5 - -", "Cm", "six12", "C5 - - Bb4 - - G4 - - F4 - -"],
    ["Ab5 - - G5 - - F5 - - Db5 - .", "Db", "six12", "F4 - - Ab4 - - Db5 - - F5 - ."],
    ["Eb5 - - Db5 - - C5 - - Ab4 - -", "Ab", "six12", "C4 - - Eb4 - - Ab4 - - C5 - -"],
    ["B4 - - - - - D5 - - F5 - .", "G7", "six12", "D4 - - F4 - - Ab4 - - G4 - -"],
    // 13–16: the lament. Strings low; the violin's descant falls by semitones from C to G above it.
    ["Eb4 - - - - - D4 - - C4 - -", "Cm", "waltz12", "C6 - - - - - B5 - - - - -"],
    ["C4 - - - - - Eb4 - - F4 - -", "F7", "waltz12", "Bb5 - - - - - A5 - - - - -"],
    ["Ab4 - - - - - G4 - - F4 - -", "Fm", "waltz12", "Ab5 - - - - - G5 - - - - -"],
    ["D4 - - - - - B3 - - . . .", "G7", "waltz12", "F5 - - - - - D5 - - B4 - -"],
    // 17–18: the lead-in. Lead and violin pull apart, then cross back towards each other; riser and fill.
    ["Ab4 - - - Bb4 - - - C5 - - - Db5 - - -", "Fm", "pump16", "F4 - - - Eb4 - - - Db4 - - - C4 - - -"],
    ["G5 - - - F5 - - - D5 - - - B4 - - -", "G7", "gallop16", "B3 - - - D4 - - - F4 - - - Ab4 - - -"],
    // 19–26: the gallop, darkened. The violin runs where the lead holds or rests.
    ["C5 - Db5 - Eb5 - F5 - G5 - F5 - Eb5 - Db5 -", "Cm", "gallop16", "G4 - - - F4 - - - Eb4 - - - G4 - - -"],
    ["F5 - G5 - Ab5 - Bb5 - C6 - Bb5 - Ab5 - G5 -", "Fm", "gallop16", "C5 - - - Bb4 - - - Ab4 - - - C5 - - -"],
    ["Db6 - C6 - Bb5 - Ab5 - F5 - Ab5 - C6 - Db6 -", "Db", "gallop16", "F4 - - - Ab4 - - - Db5 - - - Ab4 - - -"],
    ["D6 - C6 - B5 - Ab5 - G5 - - - . . . .", "G7", "gallop16", "B4 - - - D5 - - - F5 - - - G5 F5 D5 B4"],
    ["C5 - Db5 - Eb5 - F5 - G5 - F5 - Eb5 - Db5 -", "Cm", "gallop16", "G4 - - - - - - - Ab4 - - - G4 - F4 -"],
    ["Eb5 - Db5 - C5 - Bb4 - Ab4 - Bb4 - C5 - D5 .", "Ab", "gallop16", "C4 - - - Eb4 - - - Ab4 - - - F4 - - -"],
    ["F5 - Ab5 - C6 - Ab5 - F5 - Ab5 - C6 - Eb6 -", "Fm", "gallop16", "Ab4 - - - G4 - - - F4 - - - Eb4 - - -"],
    ["D6 - - - B5 - - - G5 - - - F5 - - -", "G7", "gallop16", "G4 Ab4 G4 F4 D4 F4 G4 Ab4 B4 C5 D5 F5 G5 - - -"],
    // 27–34: Judgement, from Atlas's fourth phase, in C minor: the brass holds over a bass that throbs against
    // its flat second and tritone. The root and its lower neighbour, the fall from D flat, and the climb to D flat
    // on top. The violin falls chromatically against it and runs in the lead's rests.
    ["C5 - - - - - - - - - - - B4 - C5 -", "Cm", "ostinato16", "Eb6 - - - D6 - - - Db6 - - - C6 - - -"],
    ["Db5 - - - - - - - C5 - - - Ab4 - - -", "Db", "ostinato16", "Ab5 - - - - - - - F5 - - - Db5 - F5 -"],
    ["Eb5 - - - D5 - - - C5 - - - G4 - - -", "Cm", "ostinato16", "G5 - - - Ab5 - - - G5 - - - Eb5 - - -"],
    ["B4 - - - - - - - D5 - - - F5 - - -", "G7", "ostinato16", "D6 - - - - - - - B5 - - - Ab5 G5 F5 D5"],
    ["G5 - - - - - - - F5 - Eb5 - D5 - C5 -", "Cm", "ostinato16", "Eb6 - - - - - - - D6 - C6 - B5 - C6 -"],
    ["Eb5 - - - - - - - C5 - - - Ab4 - - -", "Ab", "ostinato16", "C6 - - - - - - - Eb5 - - - F5 - - -"],
    ["F5 - - - Ab5 - - - Db6 - - - C6 - - -", "Db", "ostinato16", "Db5 - - - C5 - - - Ab4 - - - G4 - - -"],
    ["B5 - - - - - - - G5 - - - . . . .", "G7", "ostinato16", "D5 - - - F5 - - - Ab5 G5 F5 D5 B4 - - -"],
    // 35–38: Judgement's gallop, a tone lower, into the chromatic close.
    ["F5 - Ab5 - C6 - - - Bb5 - Ab5 - G5 - F5 -", "Fm", "gallop16", "C5 - - - - - - - Db5 - - - C5 - - -"],
    ["Db6 - - - C6 - - - Bb5 - Ab5 - F5 - - -", "Db", "gallop16", "F5 - - - - - - - Db5 - - - Ab4 - Bb4 -"],
    ["Eb5 - G5 - C6 - - - B5 - C6 - D6 - - -", "Cm", "gallop16", "G4 - - - - - - - Ab4 - - - G4 - F4 -"],
    ["D6 - - - B5 - - - G5 - - - D5 - - -", "G7", "chrom16", "F5 - - - E5 - Eb5 - D5 - - - B4 - - ."],
  ],
};
