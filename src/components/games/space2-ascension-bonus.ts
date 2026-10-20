/* Three bonus tracks for the Ascension album, written in its manner after a pass over all of its scores: a written
   counter-line in every bar that answers in the lead's rests or holds while the lead runs, the lead changing hands by
   section (in Space 2's own band: synth lead, brass, strings, organ and bells), and the album's forms. Each is built on a
   hook of its own, said twice, sequenced, and brought back in a new key. The game never plays them.
   - Crosswind Assault, a field battle in B minor. Hits in threes against the four-beat bar (3+3+3+3+2+2); a hook that
     leaps a sixth and tumbles back by step; a 7/8 break through the Neapolitan C major; a guitar answer that climbs by
     arpeggio; the hook a tone up in C sharp minor; and a chromatic slip down (G sharp 7, G, F sharp 7) home.
   - Colossus of the Spire, a boss in F minor. A hook that leans on the flat second (C, D flat, C) and falls to the
     tonic; a 6/8 turn to D flat major, lyrical, on the violin; a 7/8 push of tritones (F to B) through the Neapolitan
     G flat; held brass climbing over a diminished chord; and the hook a tone up in G minor on the guitar.
   - Throne of Ascension, a final boss in E minor. A held opening against the Phrygian F and a chromatic run; a hook that
     leaps a fifth, leans on the minor sixth (C) and climbs back; a lament over a falling bass (Em, D, C, B7); a 7/8
     break; heroic held notes over arpeggios; a guitar solo built on one turn (E, D sharp, E, B); and the hook a tone up
     in F sharp minor, turning on the Neapolitan G before it falls back to E minor. */
import type { AscensionBonus, Song } from "./space2-music";

const CROSSWIND_ASSAULT: Song = {
  bpm: 156, lead: "lead", pad: "organ", counter: "strings", drums: "battle", stabs: true, riff: "pump16", intro: 2,
  fills: [9, 13, 17, 21], crashes: [2, 10, 14, 18],
  /* Space 2's band, as in Vanguard Run and Shadow Front: synth lead over organ, brass, strings and bells. */
  sections: [
    { from: 0, lead: "brass", stabs: false },
    { from: 2 },
    { from: 10, lead: "brass", pad: "strings", counter: "organ" },
    { from: 14, lead: "lead", counter: "bell" },
    { from: 18, lead: "brass", layer: "lead", pad: "strings" },
    { from: 22, lead: "lead" },
  ],
  bars: [
    // The hits, once: threes against the bar.
    ["B4 . . B4 . . D5 . . F#5 . . B5 . A5 .", "Bm", "hits16", "B3 - - - - - - - F#3 - - - B3 - - -"],
    ["A#4 . . A#4 . . C#5 . . E5 . . F#5 E5 C#5 A#4", "F#7", "hits16", "C#4 - - - - - - - F#3 - - - A#3 - - -"],
    // The hook: a leap of a sixth and a tumble back, said on four chords, then again rising a third.
    ["D5 - . D5 - . B5 - - A5 G5 F#5 - E5 F#5 -", "Bm", "pump16", "F#4 - - - D4 - - - . . B3 C#4 D4 - - -"],
    ["D5 - . D5 - . G5 - - B5 A5 G5 - F#5 G5 -", "G", "pump16", "B3 - - - D4 - - - . . G4 F#4 E4 - - -"],
    ["E5 - . E5 - . G5 - B5 - E6 - D6 C#6 B5 -", "Em", "pump16", "G4 - - - E4 - - - . . B3 C#4 D4 - E4 -"],
    ["C#6 - - A#5 - - F#5 - - E5 - - C#5 D5 E5 F#5", "F#7", "pump16", "A#3 - - - C#4 - - - E4 - - - . . . ."],
    ["D5 - . D5 - . B5 - - A5 G5 F#5 - E5 F#5 -", "Bm", "pump16", "B4 - - - A4 - - - . . F#4 G4 A4 - - -"],
    ["F#5 - . F#5 - . D6 - - C#6 B5 A5 - G5 A5 -", "D", "pump16", "D5 - - - A4 - - - . . F#4 E4 D4 - - -"],
    ["G6 - - F#6 E6 - D6 - B5 - - G5 - A5 B5 -", "Em", "pump16", "E4 - - - G4 - - - B4 - - - . . . ."],
    ["A#5 - - C#6 - - E6 - - - - - . F#6 E6 C#6", "F#7", "pump16", "C#4 - - - - - F#4 - - - E4 - D4 C#4 B3 A#3"],
    // The 7/8 break, through the Neapolitan C major.
    ["B5 - - A#5 - - B5 - D6 - - F#6 - -", "Bm", "throb14", "D4 - - - - - F#4 - - - B3 - - -"],
    ["C6 - - B5 - - C6 - E6 - - G6 - -", "C", "throb14", "E4 - - - - - G4 - - - C4 - - -"],
    ["F#6 - - E6 - - D6 - B5 - - D6 - -", "Bm", "throb14", "D4 - - - - - B3 - - - F#4 - - -"],
    ["C#6 - - - - - A#5 - F#5 G5 A5 A#5 C#6 E6", "F#7", "throb14", "A#3 - - - - - C#4 - - - . . . ."],
    // The guitar's answer, climbing by arpeggio.
    ["B5 - - D6 - - G6 - F#6 - D6 - B5 - D6 -", "G", "pulse16", "G4 - - - - - - - D4 - - - - - - -"],
    ["C#6 - - E6 - - A6 - G6 - E6 - C#6 - E6 -", "A", "pulse16", "A4 - - - - - - - E4 - - - - - - -"],
    ["A5 - - C#6 - - F#6 - E6 - C#6 - A5 - G5 -", "F#m", "pulse16", "F#4 - - - - - - - C#4 - - - - - - -"],
    ["A#5 - - - C#6 - E6 - F#6 - - - - - . .", "F#7", "pulse16", "C#4 - - - - - - - . . A#3 B3 C#4 D4 E4 -"],
    // The hook a tone up, in C sharp minor, on the trumpet.
    ["E5 - . E5 - . C#6 - - B5 A5 G#5 - F#5 G#5 -", "C#m", "pump16", "G#4 - - - E4 - - - . . C#4 D#4 E4 - - -"],
    ["E5 - . E5 - . A5 - - C#6 B5 A5 - G#5 A5 -", "A", "pump16", "C#4 - - - E4 - - - . . A4 G#4 F#4 - - -"],
    ["F#5 - . F#5 - . A5 - C#6 - F#6 - E6 D#6 C#6 -", "F#m", "pump16", "A4 - - - F#4 - - - . . C#4 D#4 E4 - F#4 -"],
    ["D#6 - - C6 - - G#5 - - F#5 - - D#5 F#5 G#5 C6", "G#7", "pump16", "G#3 - - - C4 - - - D#4 - - - F#4 - - -"],
    // The slip down a semitone at a time, home to B minor.
    ["B5 - A5 - G5 - F#5 - E5 - D5 - E5 - F#5 -", "G", "chrom16", "G3 - - - B3 - - - D4 - - - . . . ."],
    ["A#4 . . A#4 . . C#5 . . E5 . . F#5 . . .", "F#7", "hits16", "C#4 - - - - - - - F#3 - - - - - - -"],
  ],
};

const COLOSSUS_OF_THE_SPIRE: Song = {
  bpm: 164, lead: "brass", pad: "strings", counter: "organ", drums: "battle", stabs: true, riff: "pump16", intro: 1,
  fills: [4, 8, 12, 16], crashes: [1, 5, 9, 13, 17],
  /* Space 2's boss band: brass over strings, the organ and bells answering, the synth lead for the climax. */
  sections: [
    { from: 0, stabs: false },
    { from: 1 },
    { from: 5, lead: "strings", pad: "organ", counter: "bell" },
    { from: 9, lead: "organ", counter: "brass" },
    { from: 13, lead: "brass", layer: "strings", stabs: false },
    { from: 17, lead: "lead", layer: "brass" },
  ],
  bars: [
    // The hits, once, against the tritone.
    ["F4 . F4 . Gb4 . F4 . . . C5 . B4 . C5 .", "Fm", "hits16", "F3 - - - - - - - C3 - - - - - - -"],
    // The hook: C leaning on D flat and falling to the tonic, said twice, then a climb to G flat.
    ["C6 - . C6 Db6 - C6 - Ab5 - . F5 - G5 Ab5 -", "Fm", "pump16", "F4 - - - Ab4 - - - . . C5 Bb4 Ab4 - - -"],
    ["Db6 - . Db6 Eb6 - Db6 - Bb5 - . F5 - Ab5 Bb5 -", "Db", "pump16", "Db4 - - - F4 - - - . . Ab4 Gb4 F4 - - -"],
    ["Bb5 - Db6 - F6 - - Gb6 F6 - Db6 - Bb5 - Ab5 -", "Bbm", "pump16", "Bb3 - - - Db4 - - - F4 - - - Gb4 - - -"],
    ["G5 - - Bb5 - - Db6 - - - C6 - B5 C6 Db6 E6", "C7", "pump16", "E4 - - - G4 - - - Bb4 - - - . . . ."],
    // A turn to D flat major in 6/8, lyrical, on the violin.
    ["F5 - - Ab5 - - Db6 - - C6 - Bb5", "Db", "waltz12", "Db4 - - - - - Ab3 - - - - -"],
    ["C6 - - - - - Eb6 - - Db6 - C6", "Ab", "waltz12", "C4 - - - - - Eb4 - - - - -"],
    ["Db6 - - Bb5 - - F5 - - Gb5 - F5", "Bbm", "waltz12", "Bb3 - - - - - F4 - - - - -"],
    ["E5 - - G5 - - Bb5 - - Db6 - -", "C7", "waltz12", "C4 - - - - - E4 - - G4 - -"],
    // The 7/8 push of tritones, through the Neapolitan G flat.
    ["F5 - - B5 - - C6 - Ab5 - - F5 - -", "Fm", "throb14", "Ab4 - - - - - F4 - - - C4 - - -"],
    ["Gb5 - - C6 - - Db6 - Bb5 - - Gb5 - -", "Gb", "throb14", "Bb4 - - - - - Gb4 - - - Db4 - - -"],
    ["Ab5 - - D6 - - F6 - Eb6 - - C6 - -", "Fm", "throb14", "C5 - - - - - Ab4 - - - F4 - - -"],
    ["Bb5 - - E6 - - G6 - - - Db6 C6 Bb5 G5", "C7", "throb14", "E4 - - - - - G4 - - - . . . ."],
    // Held brass climbing over arpeggios, through a diminished chord.
    ["C6 - - - - - - - Db6 - - - C6 - - -", "Fm", "pulse16", "F4 - Ab4 - C5 - Ab4 - F4 - Ab4 - C5 - Ab4 -"],
    ["Ab5 - - - - - - - Bb5 - - - Ab5 - F5 -", "Db", "pulse16", "F4 - Ab4 - Db5 - Ab4 - F4 - Ab4 - Db5 - Ab4 -"],
    ["F5 - - - - - - - Ab5 - - - B5 - - -", "Bdim", "pulse16", "D4 - F4 - Ab4 - F4 - D4 - F4 - Ab4 - B4 -"],
    ["C6 - - - Bb5 - - - Db6 - - - E6 - - -", "C7", "pulse16", "E4 - G4 - Bb4 - G4 - . . . . C5 Bb4 G4 E4"],
    // The hook a tone up, in G minor, on the guitar, and C7 to turn home.
    ["D6 - . D6 Eb6 - D6 - Bb5 - . G5 - A5 Bb5 -", "Gm", "pump16", "G4 - - - Bb4 - - - . . D5 C5 Bb4 - - -"],
    ["Eb6 - . Eb6 F6 - Eb6 - C6 - . G5 - Bb5 C6 -", "Eb", "pump16", "Eb4 - - - G4 - - - . . Bb4 Ab4 G4 - - -"],
    ["C6 - Eb6 - G6 - - Ab6 G6 - Eb6 - C6 - Bb5 -", "Cm", "pump16", "C4 - - - Eb4 - - - G4 - - - Ab4 - - -"],
    ["C6 - - - Bb5 - - - G5 - - - E5 F5 G5 Bb5", "C7", "chrom16", "E4 - - - G4 - - - Bb4 - - - C5 - - -"],
  ],
};

const THRONE_OF_ASCENSION: Song = {
  bpm: 176, lead: "square", layer: "lead", pad: "strings", counter: "bell", drums: "battle", stabs: true, riff: "pump16", intro: 2,
  fills: [1, 9, 13, 17, 21, 25, 30], crashes: [2, 10, 14, 18, 22, 26], riser: [24, 25],
  /* Atlas's band with the square lead doubled three ways: by the sawtooth synth lead in the hook and the climax, by
     the organ in the heroic held notes, and by the chip in the solo; strings, bells, brass and organ around it. */
  sections: [
    { from: 0, lead: "organ", layer: undefined, drums: "toms", stabs: false },
    { from: 2 },
    { from: 10, lead: "strings", layer: undefined, pad: "organ" },
    { from: 14, lead: "brass", layer: undefined, pad: "organ", counter: "strings" },
    { from: 18, lead: "square", layer: "organ", stabs: false },
    { from: 22, lead: "square", layer: "chip", counter: "organ" },
    { from: 26 },
  ],
  bars: [
    // The opening, once: the tonic held against its Phrygian F, then a chromatic run up into the hook.
    ["E4 - - - - - - - F4 - - - E4 - - -", "Em", "hold16", "B3 - - - - - - - C4 - - - B3 - - -"],
    ["B4 C5 C#5 D5 D#5 E5 F5 F#5 G5 - - - . . . .", "B7", "hits16", "D#4 - - - - - - - F#4 - - - . . . ."],
    // The hook: a leap of a fifth, a lean on the minor sixth, a climb back; then on the Phrygian F and a diminished chord.
    ["E5 - - B5 - - C6 - B5 - . G5 A5 B5 - -", "Em", "pump16", "G4 - - - - - - - E4 - - - D#4 - E4 -"],
    ["C6 - - G5 - - A5 - E5 - . C5 D5 E5 - -", "C", "pump16", "E4 - - - - - - - C4 - - - B3 - C4 -"],
    ["A5 - - E6 - - F6 - E6 - . C6 D6 E6 - -", "Am", "pump16", "C5 - - - - - - - A4 - - - G#4 - A4 -"],
    ["D#6 - - F#6 - - A6 - G6 - F#6 - E6 - D#6 -", "B7", "pump16", "B4 - - - - - - - F#4 - - - A4 G4 F#4 D#4"],
    ["E5 - - B5 - - C6 - B5 - . G5 A5 B5 - -", "Em", "pump16", "G4 - - - - - - - E4 - - - D#4 - E4 -"],
    ["F5 - - C6 - - D6 - C6 - . A5 G5 F5 - -", "F", "pump16", "A4 - - - - - - - F4 - - - E4 - F4 -"],
    ["F#5 - - D#6 - - E6 - D#6 - . C6 B5 A5 - -", "D#dim", "pump16", "A4 - - - - - - - F#4 - - - D#4 - F#4 -"],
    ["B5 - - - D#6 - - - F#6 - - - A6 - G6 F#6", "B7", "pump16", "D#4 - - - F#4 - - - B4 - - - . . . ."],
    // The lament over a falling bass.
    ["B5 - - - - - A5 - G5 F#5 - G5", "Em", "waltz12", "E4 - - G4 - - B4 - - G4 - -"],
    ["A5 - - - - - G5 - F#5 E5 - F#5", "D", "waltz12", "D4 - - F#4 - - A4 - - F#4 - -"],
    ["G5 - - - - - F#5 - E5 D5 - E5", "C", "waltz12", "C4 - - E4 - - G4 - - E4 - -"],
    ["F#5 - - - - - D#5 - - B4 - -", "B7", "waltz12", "B3 - - D#4 - - F#4 - - A4 - -"],
    // The 7/8 break, the tonic against the Phrygian F.
    ["E6 - - B5 - - F6 - E6 - - B5 - -", "Em", "throb14", "G4 - - - - - B4 - - - E4 - - -"],
    ["F6 - - C6 - - A5 - C6 - - F6 - -", "F", "throb14", "A4 - - - - - C5 - - - F4 - - -"],
    ["G6 - - D6 - - B5 - D6 - - G6 - -", "G", "throb14", "B4 - - - - - D5 - - - G4 - - -"],
    ["A6 - - F#6 - - D#6 - - - B5 A5 G5 F#5", "B7", "throb14", "D#4 - - - - - F#4 - - - . . . ."],
    // Heroic held notes over arpeggios.
    ["G5 - - - - - - - C6 - - - E6 - D6 -", "C", "pulse16", "C4 - E4 - G4 - E4 - C4 - E4 - G4 - E4 -"],
    ["F#5 - - - - - - - A5 - - - D6 - C6 -", "D", "pulse16", "D4 - F#4 - A4 - F#4 - D4 - F#4 - A4 - F#4 -"],
    ["B5 - - - - - - - D6 - - - G6 - F#6 -", "G", "pulse16", "G4 - B4 - D5 - B4 - G4 - B4 - D5 - B4 -"],
    ["F#6 - - - - - - - D#6 - - - . . . .", "B7", "pulse16", "D#4 - F#4 - A4 - F#4 - . . B3 C#4 D#4 E4 F#4 -"],
    // The guitar solo, built on one turn.
    ["E6 D#6 E6 B5 C6 B5 G5 B5 E6 D#6 E6 F#6 G6 F#6 E6 D#6", "Em", "gallop16", "E4 - - - - - - - B3 - - - - - - -"],
    ["E6 D6 E6 C6 G5 C6 E6 G6 F6 E6 D6 C6 B5 C6 D6 E6", "C", "gallop16", "C4 - - - - - - - G3 - - - - - - -"],
    ["C6 B5 C6 A5 E5 A5 C6 E6 D6 C6 B5 A5 G#5 A5 B5 C6", "Am", "gallop16", "A3 - - - - - - - E4 - - - - - - -"],
    ["D#6 E6 F#6 G6 A6 G6 F#6 E6 D#6 - B5 - F#5 - - -", "B7", "gallop16", "B3 - - - - - - - F#4 - - - D#4 - - -"],
    // The hook a tone up, in F sharp minor, turning on the Neapolitan G and falling back to E minor.
    ["F#5 - - C#6 - - D6 - C#6 - . A5 B5 C#6 - -", "F#m", "pump16", "A4 - - - - - - - F#4 - - - F4 - F#4 -"],
    ["D6 - - A5 - - B5 - F#5 - . D5 E5 F#5 - -", "D", "pump16", "F#4 - - - - - - - D4 - - - C#4 - D4 -"],
    ["B5 - - F#6 - - G6 - F#6 - . D6 E6 F#6 - -", "Bm", "pump16", "D5 - - - - - - - B4 - - - A#4 - B4 -"],
    ["F6 - - G#6 - - B6 - A6 - G#6 - F#6 - F6 -", "C#7", "pump16", "C#5 - - - - - - - G#4 - - - B4 A4 G#4 F4"],
    ["G5 - - D6 - - E6 - D6 - . B5 A5 G5 - -", "G", "pump16", "B4 - - - - - - - G4 - - - F#4 - G4 -"],
    ["F#6 - - D#6 - - B5 - - - A5 G5 F#5 - D#5 -", "B7", "chrom16", "D#4 - - - F#4 - - - A4 - - - B4 - - -"],
  ],
};

export const ASCENSION_BONUS: Record<AscensionBonus, Song> = {
  "alt:asc1": CROSSWIND_ASSAULT,
  "alt:asc2": COLOSSUS_OF_THE_SPIRE,
  "alt:asc3": THRONE_OF_ASCENSION,
};
