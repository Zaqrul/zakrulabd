/* Bonus tracks for the Ascension album, written in its manner after a pass over all of its scores: a written
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
     in F sharp minor, turning on the Neapolitan G before it falls back to E minor; and its whole song, extended (below). */
import type { AscensionBonus, BarPerformance, Song } from "./space2-music";

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

/* Throne of Ascension, Extended: the whole song, about three minutes. Every bar of the short version is here, notes
   untouched, in its own order; between them go parts in the manner of a relentless piano battle remix in E minor: sixteenths
   that never stop (a piano arpeggio under every new bar), a bass pushed off the beat, a staccato piano accented in threes
   (3+3+2), bars where the whole band hits one rhythm together, keys climbing by semitone, held chords over the running
   piano, and a push in F sharp minor. Only the manner is taken; every new note is built from this tune's own lean on the
   minor sixth and its turn (E, D sharp, E).
   - The Throne riff: a sixteenth-note pedal on the fifth under a line that leans and turns (E, C, E, F sharp, G, F sharp,
     E, D sharp), over Em, C, Am and B7. It opens the song on the piano alone, answers the hook, comes back in G minor, in
     7/8, in E flat minor and at the close, and runs under the verse's return as a counter-line.
   - A verse in threes against the bar (3+3+2), sung on the synth over the running piano, and a new chorus on the
     trumpet, the song's one turn to the relative major (G, D, Em, C).
   - The hook in G minor, then bars of hits for the whole band, over Em and the Phrygian F, into the chromatic run.
   - The lament and its answer, the riff in 7/8 into the 7/8 break, the heroic notes said twice.
   - The hook's first notes climbing a semitone at a time, the bars trading 4/4 and 7/8.
   - Held chords over the running piano without drums, G sharp minor against F sharp, then a push of hits in F sharp
     minor into the hook there; the riff in E flat minor; the close, the solo and eight more bars of it.
   - A new descant on the violin over the old hook, its notes untouched an octave down; the verse again with the riff
     under it; and the riff to the chromatic run, which leads back to the hook. */
type Bar = Song["bars"][number];
type Part = [Bar] | [Bar, BarPerformance];
const T = THRONE_OF_ASCENSION.bars;
const own = (bar: Bar): [Bar] => [bar];
/* Accents in threes against the bar: 3+3+2, twice, and 3+3+2+3+3 in 7/8. */
const THREES = [1.25, 0.8, 0.85, 1.15, 0.8, 0.85, 1.15, 0.85, 1.25, 0.8, 0.85, 1.15, 0.8, 0.85, 1.15, 0.85];
const THREES_14 = [1.25, 0.8, 0.85, 1.15, 0.8, 0.85, 1.15, 0.85, 1.2, 0.8, 0.85, 1.15, 0.8, 0.85];
const STACCATO: BarPerformance = { gate: 0.6, leadAccents: THREES };

/* Each drum fill is written for where it falls: a roll, toms traded with the snare, hits in threes, sixteenths that
   thicken, a stop (the kit drops out for a beat, then a flam into the downbeat), open hats and toms, and double kicks
   under the snare. The fill's second half swells to its last hit. */
const FILL = {
  roll: "k h h k s h k h k h s s s s s s",
  toms: "k h h k s h k h t t s t t s t t",
  threes: "k h h k s h k h s . . s . . s s",
  build: "k h k h s h k s k s k s s s s s",
  stop: "k h h k s h k . . . . . s s s s",
  open: "k h o h ks h k o t . t . s s t s",
  kicks: "k . k k s . k k s . k k s s s s",
  toms14: "k h h s h h k t t s t t s s",
  threes14: "k h h s h h k s . . s . s s",
  toms12: "k . . s . . t t s t t s",
};
const swell = (n: number) => Array.from({ length: n }, (_, i) => (i < n / 2 ? 1 : 0.75 + (0.6 * (i - n / 2)) / (n / 2)));
const fill = ([bar, perf]: Part, kit: string): Part => [bar, { ...perf, kit, drumAccents: swell(kit.split(" ").length) }];
/* The verse's kit kicks in its threes; the chorus opens its hats. */
const VERSE_KIT = "k h h k s h h k h k h h s h k h";
const CHORUS_KIT = "k h o h s h k k h k o h s h k h";

/* The bass is written for every new part: the root pushed off the beat and popped to the octave, the seventh and fifth
   under it, and at the end of each bar a step or a chromatic approach into the next bar's root. */
const RIFF = {
  Em: "E6 B5 C6 B5 E6 B5 F#6 B5 G6 B5 F#6 B5 E6 B5 D#6 B5",
  C: "E6 B5 C6 B5 E6 B5 G6 B5 A6 B5 G6 B5 F#6 B5 E6 B5",
  Am: "C6 A5 B5 A5 C6 A5 E6 A5 F6 A5 E6 A5 D6 A5 C6 A5",
  B7: "D#6 B5 E6 B5 F#6 B5 A6 B5 G6 B5 F#6 B5 E6 B5 D#6 B5",
};
const RIFF_BASS = {
  Em: "E2 . E3 E2 . B2 D3 . E2 . E3 E2 . G2 A2 B2",
  C: "C3 . C2 C3 . G2 B2 . C3 . C2 C3 . E2 G2 G#2",
  Am: "A2 . A1 A2 . E2 G2 . A2 . A1 A2 . C3 B2 A#2",
  B7: "B1 . B2 B1 . F#2 A2 . B1 . B2 B1 . C#2 D2 D#2",
};
/* The riff an octave down, as a counter-line. */
const under = (line: string) => line.replace(/(\d)/g, (d) => String(Number(d) - 1));
const riff = (last?: string): Part[] =>
  (["Em", "C", "Am", "B7"] as const).map((chord, i) => {
    const part: Part = [[RIFF[chord], chord, "push16"], { ...STACCATO, bass: RIFF_BASS[chord] }];
    return last && i === 3 ? fill(part, last) : part;
  });
const VERSE: [lead: string, chord: keyof typeof RIFF, bass: string][] = [
  ["B5 - - E6 - - D6 - B5 - - G5 - - A5 -", "Em", "E2 - - E3 - - D3 - B2 - - G2 - - A2 B2"],
  ["G5 - - C6 - - B5 - G5 - - E5 - - G5 -", "C", "C3 - - C2 - - G2 - C3 - - E3 - - D3 B2"],
  ["A5 - - C6 - - E6 - - - - D6 - C6 B5 -", "Am", "A2 - - A1 - - E2 - A2 - - C3 - - B2 A#2"],
  ["F#6 - - D#6 - - B5 - - - - - B5 C6 C#6 D6", "B7", "B1 - - B2 - - A2 - F#2 - - D#2 - - C#2 D#2"],
  ["E6 - - G6 - - F#6 - E6 - - B5 - - C6 -", "Em", "E2 - - B2 - - E3 - D3 - - B2 - - G2 B2"],
  ["E6 - - G6 - - A6 - G6 - - E6 - - C6 -", "C", "C3 - - G2 - - C2 - E2 - - G2 - - A2 B2"],
  ["C6 - - E6 - - A6 - G6 - - E6 - - C6 -", "Am", "A2 - - E3 - - A1 - C3 - - E3 - - D3 C#3"],
];
/* The verse, its last bar given, alone over the running piano or with the riff under it. */
const verse = (last: string, withRiff: boolean, fillKit: string): Part[] =>
  [...VERSE, [last, "B7", "B1 - - F#2 - - B2 - A2 - - F#2 - - D#2 F#2"] as (typeof VERSE)[number]].map(([lead, chord, bass], i) => {
    const part: Part = [withRiff ? [lead, chord, "push16", under(RIFF[chord])] : [lead, chord, "push16"], { bass, kit: VERSE_KIT }];
    return i === 7 ? fill(part, fillKit) : part;
  });
/* The whole band on one rhythm: hits on 1, the and of 1, 2's last sixteenth, 2 and a half... (0, 2, 3, 6, 8, 9, 12, 14). */
const HITS = "k . k ks . . ks . k ks . . ks h ks h";
const hits = (lead: string, chord: string, bass: string, kit = HITS): Part => [[lead, chord, "push16", ". . . . . . . . . . . . . . . ."], { kit, bass, gate: 0.5 }];
const bassed = (lead: string, chord: string, riffName: string, bass: string, perf: BarPerformance = {}): Part => [[lead, chord, riffName], { ...perf, bass }];
const sevens: BarPerformance = { gate: 0.6, leadAccents: THREES_14 };
const DESCANT: [descant: string, bass: string][] = [
  ["B6 - - - - - - - G6 - - - A6 - B6 -", "E2 . E3 . B2 . E2 D3 . E2 B2 . E3 . D3 B2"],
  ["C7 - - - - - - - G6 - - - E6 - - -", "C3 . C2 . G2 . C3 B2 . C3 G2 . E2 . G2 G#2"],
  ["A6 - - - - - - - C7 - - - B6 - A6 -", "A2 . A1 . E2 . A2 G2 . A2 E2 . C3 . B2 A#2"],
  ["F#6 - - - - - - - D#6 - - - . . . .", "B1 . B2 . F#2 . B1 A2 . B1 F#2 . D#2 . D2 D#2"],
  ["E6 - - - G6 - - - B6 - - - - - A6 G6", "E2 . E3 . B2 . E2 D3 . E2 B2 . G2 . F#2 E2"],
  ["A6 - - - - - - - G6 - F6 - E6 - F6 -", "F2 . F3 . C3 . F2 E3 . F2 C3 . A2 . F#2 E2"],
  ["F#6 - - - - - - - A6 - - - G6 - F#6 -", "D#2 . D#3 . A2 . D#2 C3 . D#2 A2 . F#2 . A2 A#2"],
  ["D#6 - - - - - - - F#6 - - - B6 - - -", "B1 . B2 . F#2 . B1 A2 . B1 F#2 . D#2 . D2 D#2"],
];

const EXTENDED_PARTS: Part[] = [
  // The riff on the piano alone, then with the bass and a light kit; the short version's opening.
  [[RIFF.Em, "Em", "rest16", ". . . . . . . . . . . . . . . ."], STACCATO],
  [[RIFF.Em, "Em", "rest16", ". . . . . . . . . . . . . . . ."], STACCATO],
  ...riff().map(([bar, perf], i): Part => [bar, { ...perf, kit: i === 3 ? "k . h . k . h . k . s . s s s s" : "k . h . h . h k . . h . h . h ." }]),
  own(T[0]),
  fill(own(T[1]), FILL.build),
  // The hook, then the riff answering it.
  ...T.slice(2, 9).map(own),
  fill(own(T[9]), FILL.toms),
  ...riff(FILL.stop),
  // The verse, in threes against the bar, over the running piano.
  ...verse("D#6 - - - B5 - - - F#5 - - - A5 - F#5 -", false, FILL.threes),
  // The chorus, new: the song's one turn to the relative major, a long note and a fall by step, said twice and opened up.
  bassed("D6 - - - - - E6 - D6 - - - B5 - G5 -", "G", "push16", "G2 . . G3 . G2 . D3 G2 . . G3 . F#3 E3 D3", { kit: CHORUS_KIT }),
  bassed("A5 - - - - - B5 - A5 - F#5 - D5 - - -", "D", "push16", "D2 . . D3 . D2 . A2 D2 . . D3 . A2 B2 D#2", { kit: CHORUS_KIT }),
  bassed("E5 - - G5 - - B5 - E6 - - - D6 - E6 -", "Em", "push16", "E2 . . E3 . E2 . B2 E2 . . E3 . D3 B2 G2", { kit: CHORUS_KIT }),
  bassed("G6 - - - - - - - E6 - - - . . D6 C6", "C", "push16", "C2 . . C3 . C2 . G2 C2 . . C3 . B2 A2 F#2", { kit: CHORUS_KIT }),
  bassed("B5 - - - - - D6 - G6 - - - F#6 - E6 -", "G", "push16", "G2 . . G3 . G2 . D3 G2 . . G3 . F#3 E3 C#3", { kit: CHORUS_KIT }),
  bassed("F#6 - - - - - E6 - D6 - - - A5 - - -", "D", "push16", "D2 . . D3 . D2 . A2 D2 . . D3 . A2 C3 B2", { kit: CHORUS_KIT }),
  bassed("E6 - - - - - D6 - C6 - - - G5 - A5 -", "C", "push16", "C2 . . C3 . C2 . G2 C2 . . C3 . B2 A2 A#2", { kit: CHORUS_KIT }),
  fill(bassed("B5 - - - A5 - - - F#5 - - - . . . .", "B7", "push16", "B1 . . B2 . B1 . F#2 B1 . . B2 . A2 G2 F#2"), FILL.kicks),
  // The hook a minor third up, in G minor, and the riff there.
  [["G5 - - D6 - - Eb6 - D6 - . Bb5 C6 D6 - -", "Gm", "toll16", "Bb4 - - - - - - - G4 - - - F#4 - G4 -"]],
  [["Eb6 - - Bb5 - - C6 - G5 - . Eb5 F5 G5 - -", "Eb", "push16", "G4 - - - - - - - Eb4 - - - D4 - Eb4 -"]],
  [["C6 - - G6 - - Ab6 - G6 - . Eb6 F6 G6 - -", "Cm", "toll16", "Eb5 - - - - - - - C5 - - - B4 - C5 -"]],
  [["F#6 - - A6 - - C7 - Bb6 - A6 - G6 - F#6 -", "D7", "push16", "D5 - - - - - - - A4 - - - C5 Bb4 A4 F#4"]],
  bassed("G5 D5 Eb5 D5 G5 D5 A5 D5 Bb5 D5 A5 D5 G5 D5 F#5 D5", "Gm", "push16", "G2 . G3 G2 . D3 F3 . G2 . G3 G2 . Bb2 C3 D3", STACCATO),
  bassed("G5 D5 Eb5 D5 G5 D5 Bb5 D5 C6 D5 Bb5 D5 A5 D5 G5 D5", "Eb", "push16", "Eb2 . Eb3 Eb2 . Bb2 D3 . Eb2 . Eb3 Eb2 . G2 Bb2 B2", STACCATO),
  bassed("Eb5 C5 D5 C5 Eb5 C5 G5 C5 Ab5 C5 G5 C5 F5 C5 Eb5 C5", "Cm", "push16", "C3 . C2 C3 . G2 Bb2 . C3 . C2 C3 . Eb3 D3 C#3", STACCATO),
  fill(bassed("F#5 D5 G5 D5 A5 D5 C6 D5 Bb5 D5 A5 D5 G5 D5 F#5 D5", "D7", "push16", "D2 . D3 D2 . A2 C3 . D2 . D3 D2 . F#2 E2 D#2", STACCATO), FILL.build),
  // The whole band on one rhythm, over Em and the Phrygian F, into the chromatic run.
  hits("E5 . E5 B5 . . C6 . B5 B5 . . G5 . A5 .", "Em", "E2 . E2 E3 . . E2 . E2 E3 . . E2 . D3 .", "kc . k ks . . ks . k ks . . ks h ks h"),
  hits("E5 . E5 B5 . . C6 . D6 D6 . . E6 . F#6 .", "Em", "E2 . E2 E3 . . E2 . E2 E3 . . E2 . D3 ."),
  hits("F5 . F5 C6 . . D6 . C6 C6 . . A5 . G5 .", "F", "F2 . F2 F3 . . F2 . F2 F3 . . F2 . C3 ."),
  hits("F5 . F5 C6 . . D6 . E6 E6 . . F6 . G6 .", "F", "F2 . F2 F3 . . F2 . F2 F3 . . F2 . F#2 .", "k . k ks . . ks . k ks . . s s s s"),
  own(T[1]),
  // The lament, and its answer over the running piano and a bass walking down from A.
  ...T.slice(10, 14).map(own),
  bassed("E6 - - - - - D6 - C6 B5 - C6", "Am", "waltz12", "A2 - - E2 - - A2 - - G2 F#2 E2"),
  bassed("D6 - - - - - C6 - B5 A5 - B5", "D", "waltz12", "D2 - - A2 - - F#2 - - E2 - D2"),
  bassed("C6 - - - - - B5 - A5 G5 - A5", "C", "waltz12", "C2 - - G2 - - E2 - - D2 - C2"),
  fill(bassed("B5 - - - - - F#5 - - D#5 - -", "B7", "waltz12", "B1 - - F#2 - - D#2 - - F#2 A2 B2"), FILL.toms12),
  // The riff in 7/8, into the 7/8 break; the heroic notes, and again higher over the running piano.
  bassed("E6 B5 C6 B5 E6 B5 F#6 B5 G6 B5 F#6 B5 E6 D#6", "Em", "ito14", "E2 . E3 E2 . B2 D3 . E2 . E3 . D3 B2", sevens),
  bassed("C6 A5 B5 A5 C6 A5 E6 A5 F6 A5 E6 A5 D6 C6", "Am", "ito14", "A2 . A1 A2 . E2 G2 . A2 . C3 . B2 A2", sevens),
  bassed("D6 B5 C6 B5 D6 B5 G6 B5 A6 B5 G6 B5 F#6 E6", "G", "ito14", "G2 . G1 G2 . D2 F#2 . G2 . B2 . A2 A#2", sevens),
  fill(bassed("D#6 B5 E6 B5 F#6 B5 A6 B5 G6 B5 F#6 B5 E6 D#6", "B7", "ito14", "B1 . B2 B1 . F#2 A2 . B1 . D#2 . D2 D#2", sevens), FILL.threes14),
  ...T.slice(14, 17).map(own),
  fill(own(T[17]), FILL.toms14),
  ...T.slice(18, 21).map(own),
  fill(own(T[21]), FILL.roll),
  bassed("E6 - - - - - - - G6 - - - - - E6 -", "C", "pulse16", "C2 - - - E2 - - - G2 - - - A2 - C#3 -"),
  bassed("F#6 - - - - - - - A6 - - - - - F#6 -", "D", "pulse16", "D3 - - - A2 - - - F#2 - - - E2 - D#2 -"),
  bassed("G6 - - - - - - - B6 - - - A6 - G6 -", "Em", "pulse16", "E2 - - - G2 - - - B2 - - - D3 - C3 -"),
  fill(bassed("F#6 - - - - - - - - - - - D#6 - B5 -", "B7", "pulse16", "B1 - - - D#2 - - - F#2 - - - A2 - E2 -"), FILL.open),
  // The hook's first notes climbing a semitone at a time, each key with its flat sixth, trading 4/4 and 7/8.
  bassed("F5 - - C6 - - Db6 - F5 - - C6 - - Db6 -", "Fm", "toll16", "F2 . F3 F2 . C3 Eb3 . F2 . F3 F2 . Ab2 Bb2 C3"),
  bassed("Db6 - - Ab5 - - Bb5 - Db6 - - Ab5 Bb5 C6", "Db", "ito14", "Db2 . Db3 Db2 . Ab2 B2 . Db2 . Ab2 . E2 F2"),
  bassed("F#5 - - C#6 - - D6 - F#5 - - C#6 - - D6 -", "F#m", "toll16", "F#2 . F#3 F#2 . C#3 E3 . F#2 . F#3 F#2 . A2 B2 C#3"),
  bassed("D6 - - A5 - - B5 - D6 - - A5 B5 C#6", "D", "ito14", "D2 . D3 D2 . A2 C3 . D2 . A2 . F2 F#2"),
  bassed("G5 - - D6 - - Eb6 - G5 - - D6 - - Eb6 -", "Gm", "toll16", "G2 . G3 G2 . D3 F3 . G2 . G3 G2 . Bb2 C3 D3"),
  bassed("Eb6 - - Bb5 - - C6 - Eb6 - - Bb5 C6 D6", "Eb", "ito14", "Eb2 . Eb3 Eb2 . Bb2 Db3 . Eb2 . Bb2 . F#2 G2"),
  bassed("G#5 - - D#6 - - E6 - G#5 - - D#6 - - E6 -", "G#m", "toll16", "G#2 . G#3 G#2 . D#3 F#3 . G#2 . G#3 G#2 . B2 C#3 D#3"),
  bassed("E6 - - B5 - - C#6 - E6 - - B5 C#6 D#6", "E", "ito14", "E2 . E3 E2 . B2 D3 . E2 . B2 . F#2 G2"),
  // Held chords over the running piano, without drums, G sharp minor against F sharp.
  [["D#6 - - - - - - - - - - - - - - -", "G#m", "hold16"]],
  [["C#6 - - - - - - - - - - - A#5 - - -", "F#", "hold16"]],
  [["B5 - - - - - - - - - - - D#6 - - -", "G#m", "hold16"]],
  [["C#6 - - - - - - - - - - - F#6 - - -", "F#", "hold16"]],
  [["G#6 - - - - - - - - - - - E6 - - -", "E", "hold16"]],
  [["F#6 - - - - - - - - - - - C#6 - - -", "F#", "hold16"]],
  [["D#6 - - - - - - - - - - - B5 - - -", "B", "hold16"]],
  [["C#6 - - - - - - - G#5 - - - . . . .", "C#7", "hold16"]],
  // The push of hits in F sharp minor, on the toms and then the whole kit, into the hook there.
  hits("C#6 . C#6 C#6 . . B5 . C#6 C#6 . . E6 . C#6 .", "F#m", "F#2 . F#2 F#3 . . F#2 . F#2 F#3 . . E2 . F#2 .", "tc . t t . . ts . t t . . ts . t ."),
  hits("C#6 . C#6 C#6 . . D6 . C#6 C#6 . . A5 . B5 .", "F#m", "F#2 . F#2 F#3 . . F#2 . F#2 F#3 . . E2 . F#2 .", "t . t t . . ts . t t . . ts . ts ."),
  hits("D6 . D6 D6 . . E6 . F#6 F#6 . . E6 . D6 .", "D", "D2 . D2 D3 . . D2 . D2 D3 . . C#3 . D3 .", "kc . k ks . . ks . k ks . . ks h ks h"),
  hits("E6 . E6 E6 . . F#6 . G#6 G#6 . . F#6 . E6 .", "E", "E2 . E2 E3 . . E2 . E2 E3 . . D#3 . E3 ."),
  hits("F#6 . F#6 F#6 . . E6 . D6 D6 . . C#6 . A5 .", "D", "D2 . D2 D3 . . D2 . D2 D3 . . E3 . F#3 ."),
  hits("C#6 . C#6 C#6 . . B5 . G#5 - - - F5 - G#5 -", "C#7", "C#2 . C#2 C#3 . . C#2 . C#2 - - - B2 . G#2 .", "k . k ks . . ks . s s s s s s s s"),
  ...T.slice(26, 29).map(own),
  fill(own(T[29]), FILL.stop),
  // The riff a semitone down, in E flat minor, and a run down D7 to the short version's close.
  bassed("Eb6 Bb5 B5 Bb5 Eb6 Bb5 F6 Bb5 Gb6 Bb5 F6 Bb5 Eb6 Bb5 D6 Bb5", "Ebm", "push16", "Eb2 . Eb3 Eb2 . Bb2 Db3 . Eb2 . Eb3 Eb2 . Gb2 Ab2 Bb2", STACCATO),
  bassed("Eb6 Bb5 B5 Bb5 Eb6 Bb5 Gb6 Bb5 Ab6 Bb5 Gb6 Bb5 F6 Bb5 Eb6 Bb5", "B", "push16", "B1 . B2 B1 . F#2 A2 . B1 . B2 B1 . D#2 F#2 G2", STACCATO),
  bassed("B5 G#5 A#5 G#5 B5 G#5 D#6 G#5 E6 G#5 D#6 G#5 C#6 G#5 B5 G#5", "G#m", "push16", "G#2 . G#3 G#2 . D#3 F#3 . G#2 . G#3 G#2 . B2 C3 C#3", STACCATO),
  fill(bassed("F#6 E6 D6 C6 A5 C6 D6 E6 F#6 E6 D6 C6 B5 A5 G5 F#5", "D7", "push16", "D3 . D2 D3 . A2 C3 . D2 . D3 C3 . A2 G2 F#2"), FILL.toms),
  own(T[30]),
  fill(own(T[31]), FILL.build),
  // The solo, and eight more bars of it on the same turn, the second four through the Phrygian F and D sharp diminished.
  ...T.slice(22, 25).map(own),
  fill(own(T[25]), FILL.threes),
  [["G6 F#6 G6 E6 B5 E6 G6 B6 A6 G6 F#6 E6 D#6 E6 F#6 G6", "Em", "gallop16", "E4 - - - - - - - B3 - - - - - - -"]],
  [["E6 D#6 E6 C6 G5 C6 E6 G6 F#6 E6 D6 C6 B5 C6 D6 E6", "C", "gallop16", "C4 - - - - - - - G3 - - - - - - -"]],
  [["A6 G#6 A6 E6 C6 E6 A6 B6 A6 G6 F6 E6 D6 E6 F6 G6", "Am", "gallop16", "A3 - - - - - - - E4 - - - - - - -"]],
  [["F#6 E6 D#6 E6 F#6 G6 A6 B6 A6 G6 F#6 E6 D#6 - - -", "B7", "gallop16", "B3 - - - - - - - F#4 - - - D#4 - - -"]],
  [["E6 B5 E6 G6 B6 G6 E6 B5 E6 D#6 E6 F#6 G6 A6 B6 -", "Em", "gallop16", "E4 - - - - - - - G4 - - - - - - -"]],
  [["F6 C6 F6 A6 C7 A6 F6 C6 F6 E6 F6 G6 A6 G6 F6 E6", "F", "gallop16", "F4 - - - - - - - A4 - - - - - - -"]],
  [["D#6 F#6 A6 C7 B6 A6 F#6 D#6 C6 B5 A5 F#5 D#5 E5 F#5 G5", "D#dim", "gallop16", "D#4 - - - - - - - F#4 - - - A4 - - -"]],
  fill([["A5 B5 C6 D#6 F#6 A6 B6 - D#6 - B5 - F#5 - - -", "B7", "chrom16", "B3 - - - - - - - D#4 - - - F#4 - - -"]], FILL.kicks),
  // A new descant on the violin over the old hook, its notes an octave down, over a kit in sixteenths and a bass that
  // walks between the hook's chords; the verse with the riff under it, and the riff to the chromatic run.
  ...DESCANT.map(([descant, bass], i): Part => {
    const part: Part = [[descant, T[2 + i][1], T[2 + i][2], under(T[2 + i][0])], { bass, kit: "kh h h h ks h kh h kh h h h ks h kh h" }];
    return i === 7 ? fill(part, FILL.open) : part;
  }),
  ...verse("D#6 - - - F#6 - - - B6 - - - A6 - F#6 -", true, FILL.stop),
  ...riff(),
  fill(own(T[1]), FILL.build),
];

const THRONE_OF_ASCENSION_EXTENDED: Song = {
  ...THRONE_OF_ASCENSION, intro: 8, arps: true, arpStep: 1,
  fills: [7, 15, 19, 27, 35, 43, 56, 60, 64, 68, 72, 98, 102, 104, 108, 116, 124, 132, 137],
  crashes: [8, 16, 20, 28, 36, 40, 57, 61, 65, 73, 95, 99, 105, 109, 117, 125, 133],
  riser: [93, 94],
  sections: [
    { from: 0, lead: "piano", layer: undefined, pad: undefined, counter: "piano", drums: "none", stabs: false },
    { from: 2, lead: "piano", layer: undefined, counter: "piano", drums: "soft", stabs: false },
    { from: 6, lead: "organ", layer: undefined, drums: "toms", stabs: false },
    { from: 8 },
    { from: 16, lead: "piano", layer: "square", pad: "organ", counter: "piano" },
    { from: 20, lead: "superSquare", layer: "strings", pad: "organ", counter: "piano", stabs: false, bassVoice: "picked" },
    { from: 28, lead: "trumpet", layer: "strings", pad: "strings", counter: "piano", bassVoice: "slap" },
    { from: 36, lead: "brass", layer: "lead", counter: "organ" },
    { from: 40, lead: "piano", layer: "square", pad: "organ", counter: "chip" },
    { from: 44, lead: "brass", layer: "square", counter: "piano", bassVoice: "picked" },
    { from: 49, lead: "strings", layer: undefined, pad: "organ" },
    { from: 53, lead: "strings", layer: undefined, pad: "organ", counter: "piano" },
    { from: 57, lead: "piano", layer: "square", pad: "organ", counter: "chip" },
    { from: 61, lead: "brass", layer: undefined, pad: "organ", counter: "strings" },
    { from: 65, lead: "square", layer: "organ", stabs: false },
    { from: 69, lead: "square", layer: "organ", counter: "piano", stabs: false },
    { from: 73, lead: "organ", layer: "square", counter: "piano", stabs: false },
    { from: 81, lead: "bell", layer: "strings", counter: "piano", drums: "none", stabs: false },
    { from: 89, lead: "brass", layer: "square", counter: "piano", bassVoice: "picked" },
    { from: 95 },
    { from: 99, lead: "piano", layer: "square", pad: "organ", counter: "piano" },
    { from: 103 },
    { from: 105, lead: "square", layer: "chip", counter: "organ" },
    { from: 113, lead: "superSquare", layer: "chip", counter: "organ" },
    { from: 117, lead: "violin", layer: "strings", counter: "square" },
    { from: 125, lead: "superSquare", layer: "strings", pad: "organ", counter: "piano", stabs: false, bassVoice: "picked" },
    { from: 133, lead: "piano", layer: "square", pad: "organ", counter: "piano" },
  ],
  bars: EXTENDED_PARTS.map(([bar]) => bar),
  performance: EXTENDED_PARTS.map(([, perf]) => perf ?? {}),
};

export const ASCENSION_BONUS: Record<AscensionBonus, Song> = {
  "alt:asc1": CROSSWIND_ASSAULT,
  "alt:asc2": COLOSSUS_OF_THE_SPIRE,
  "alt:asc3": THRONE_OF_ASCENSION,
  "alt:asc4": THRONE_OF_ASCENSION_EXTENDED,
};
