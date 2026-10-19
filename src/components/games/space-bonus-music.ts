/* Bonus tunes for the soundtrack player in zakrulOS; the games never play them. Each was written from a
   motif, not bar by bar: a one-bar hook written relative to the chord root (so its strong beats fall on
   chord tones whatever the chord), an answer that falls back, and the development the composition
   teaching material describes: sequence, fragmentation, inversion, a contrasting singing line and a
   half cadence before a full one. The method, the sources it comes from and why the first bonus tunes
   failed are in docs/composition-method.md. Every note is written for this game; none is taken from an
   existing work. */
import type { Song } from "./space-music";

/* Wanderer's Battle: a run up D harmonic minor, then three eight-bar sections. A is D dorian: a hemiola
   hook (3+3+2) that moves by step, answered, repeated, then fragmented up a third over faster chords. B is
   F major: a singing scale line that climbs a chord at a time, then A7 and A as a hinge. C is E dorian, a
   whole step up, with the hook turned upside down; A7 and a fall onto the leading tone bring the loop home. */
export const WANDERER: Song = {
  bpm: 152, duty: 0.25, drums: "drive", riff: "bounce", role: "echo", intro: 1,
  bars: [
    ["D5 E5 F5 G5 A5 Bb5 C#6 D6 - - - - - A5 D6 -", "Dm", "hold", "none"],
    ["F5 - - E5 - - D5 - D5 - - E5 - - F5 -", "Dm"],
    ["G5 - F5 - E5 - - - E5 - D5 - C5 - - -", "C"],
    ["F5 - - E5 - - D5 - D5 - - E5 - - F5 -", "Dm"],
    ["E5 - - D5 - - C#5 - E5 - - - - - - -", "A7"],
    ["F5 - - E5 - - D5 - D5 - - E5 - - F5 -", "Dm"],
    ["D6 - C6 - B5 - - - B5 - A5 - G5 - - -", "G"],
    ["E5 - - D5 - - C5 - G5 - - F5 - - E5 -", "C"],
    ["A4 - B4 - C#5 - D5 - E5 - - - - - - -", "A7"],
    ["A5 - - - Bb5 - C6 - C6 - - - D6 - C6 -", "F", "pump", "harm"],
    ["E5 - - - F5 - G5 - G5 - - - A5 - G5 -", "C", "pump", "harm"],
    ["F5 - - - G5 - A5 - A5 - - - Bb5 - A5 -", "Dm", "pump", "harm"],
    ["D5 - - - E5 - F5 - F5 - - - G5 - F5 -", "Bb", "pump", "harm"],
    ["A5 - - - Bb5 - C6 - C6 - - - D6 - C6 -", "F", "pump", "harm"],
    ["Bb5 - - - C6 - D6 - D6 - - - E6 - D6 -", "Gm", "pump", "harm"],
    ["C#6 - - B5 - - A5 - E6 - - D6 - - C#6 -", "A7", "pump", "harm"],
    ["E6 - - D6 - - C#6 - E6 - - - - - - -", "A", "pump", "harm"],
    ["G5 - - A5 - - B5 - B5 - - A5 - - G5 -", "Em", "drive", "harm"],
    ["A5 - G5 - F#5 - - - F#5 - E5 - D5 - - -", "D", "drive", "harm"],
    ["G5 - - A5 - - B5 - B5 - - A5 - - G5 -", "Em", "drive", "harm"],
    ["E5 - - D5 - - C#5 - E5 - - - - - - -", "A", "drive", "harm"],
    ["B5 - - A5 - - G5 - D6 - - C#6 - - B5 -", "G", "drive", "harm"],
    ["F#5 - - E5 - - D5 - A5 - - G5 - - F#5 -", "D", "drive", "harm"],
    ["G5 - - A5 - - B5 - B5 - - A5 - - G5 -", "Em7", "drive", "harm"],
    ["E5 - D5 - C#5 - - - - - - - . . . .", "A7", "chrom", "harm"],
  ],
};

/* Lantern Town: G major, unhurried. A is a period: a hook that rises by step and settles, repeated on
   the next chord, answered, and the question left on the dominant. B contrasts with a scale line that climbs
   through vi, IV, I and V, then comes home. */
export const LANTERN: Song = {
  bpm: 100, duty: 0.125, drums: "soft", riff: "walk", role: "echo",
  bars: [
    ["G4 - - - B4 - A4 - D5 - - - B4 - A4 -", "G"],
    ["E5 - - - G5 - F#5 - B5 - - - G5 - F#5 -", "Em"],
    ["G5 - F#5 - E5 - - - D5 - - - C5 - - -", "C"],
    ["A5 - - - F#5 - G5 - A5 - - - - - - -", "D"],
    ["G5 - - - B5 - A5 - D6 - - - B5 - A5 -", "G"],
    ["B4 - - - D5 - C5 - F#5 - - - D5 - C5 -", "Bm"],
    ["G5 - F#5 - E5 - - - D5 - - - C5 - - -", "C"],
    ["A5 - - - F#5 - G5 - A5 - - - - - - -", "D7"],
    ["G5 - - - - - A5 - B5 - - - C6 - - -", "Em", "hold", "harm"],
    ["E5 - - - - - F#5 - G5 - - - A5 - - -", "C", "hold", "harm"],
    ["B5 - - - - - C6 - D6 - - - E6 - - -", "G", "hold", "harm"],
    ["F#5 - - - - - G5 - A5 - - - B5 - - -", "D", "hold", "harm"],
    ["E5 - - - G5 - F#5 - G5 - - - A5 - G5 -", "Em", "hold", "harm"],
    ["A4 - - - C5 - B4 - C5 - - - D5 - C5 -", "Am", "hold", "harm"],
    ["A5 - G5 - F#5 - - - E5 - - - D5 - - -", "D7"],
    ["D5 - - - B4 - - - G4 - - - - - - -", "G"],
  ],
};

/* Rival's Challenge: A minor, the duel. The hook is da-da-DAA, da-da-DAA and a long note, with breath
   between; the answer falls to a held note. B is a long singing line over the climbing bass, rising to its top. */
export const RIVAL: Song = {
  bpm: 168, duty: 0.25, drums: "rush", riff: "pump", role: "echo",
  bars: [
    ["A5 A5 C6 - A5 A5 D6 - E6 - - - C6 - - -", "Am"],
    ["C6 - B5 - A5 - G5 - F5 - - - - - - -", "F"],
    ["G5 G5 B5 - G5 G5 C6 - D6 - - - B5 - - -", "G"],
    ["B5 - A5 - G#5 - B5 - B5 - - - - - . .", "E7"],
    ["A5 A5 C6 - A5 A5 D6 - E6 - - - C6 - - -", "Am"],
    ["C6 - B5 - A5 - G5 - F5 - - - - - - -", "F"],
    ["D5 D5 F5 - . . . . F5 F5 A5 - . . . .", "Dm"],
    ["E5 - F5 - G#5 - A5 - B5 - - - - - - -", "E7"],
    ["A5 - - - - - C6 - C6 - - - A5 - - -", "F", "octave", "harm"],
    ["B5 - - - - - D6 - D6 - - - B5 - - -", "G", "octave", "harm"],
    ["C6 - - - - - E6 - E6 - - - C6 - - -", "C", "octave", "harm"],
    ["A5 - B5 - C6 - D6 - E6 - - - - - - -", "Am", "octave", "harm"],
    ["D6 D6 F6 - . . . . D6 D6 F6 - . . . .", "Dm", "drive", "echo"],
    ["B5 - A5 - G#5 - F5 - E5 - - - - - - -", "E7", "drive", "echo"],
    ["A4 A4 C5 - A4 A4 D5 - E5 - - - C5 - - -", "Am", "drive", "echo"],
    ["B5 - A5 - G#5 - B5 - B5 - - - - - . .", "E7", "chrom", "harm"],
  ],
};

/* Starlit Crossing: D mixolydian, a march. A dotted hook (3+1) answered and closed twice; B a climbing
   scale line over the pumping bass; the last section fragments the hook and ends on the tonic. */
export const CROSSING: Song = {
  bpm: 128, duty: 0.5, drums: "march", riff: "march", role: "harm",
  bars: [
    ["D5 - - E5 F#5 - - E5 D5 - - - A4 - - -", "D"],
    ["C5 - - D5 E5 - - D5 C5 - - - G4 - - -", "C"],
    ["D5 - - C5 B4 - - C5 D5 - - - B4 - - -", "G"],
    ["A5 - - G5 F#5 - - A5 A5 - - - - - - -", "D"],
    ["D5 - - E5 F#5 - - E5 D5 - - - A4 - - -", "D"],
    ["C5 - - D5 E5 - - D5 C5 - - - G4 - - -", "C"],
    ["D5 - - C5 B4 - - C5 D5 - - - B4 - - -", "G"],
    ["E5 - - D5 C#5 - - E5 E5 - - - - - - -", "A"],
    ["D5 - - - E5 - F#5 - F#5 - - - G5 - F#5 -", "Bm", "pump", "echo"],
    ["B5 - - - C6 - D6 - D6 - - - E6 - D6 -", "G", "pump", "echo"],
    ["F#5 - - - G5 - A5 - A5 - - - B5 - A5 -", "D", "pump", "echo"],
    ["C#5 - - - D5 - E5 - E5 - - - F#5 - E5 -", "A", "pump", "echo"],
    ["B4 - - C5 D5 - - . D5 - - E5 F#5 - - .", "Bm", "octave", "harm"],
    ["G5 - - A5 B5 - - . B5 - - C6 D6 - - .", "G", "octave", "harm"],
    ["E5 - - D5 C#5 - - D5 E5 - - - C#5 - - -", "A7", "octave", "harm"],
    ["F#5 - - - F#5 - - - D5 - - - - - - -", "D"],
  ],
};

/* Last Light: F major, slow, for an ending. Long notes that rise and fall like a breath. A states the
   tune and answers it twice; B climbs by step to the top on F, and the last bar settles on the tonic. */
export const LAST_LIGHT: Song = {
  bpm: 80, duty: 0.125, drums: "soft", riff: "hold", role: "echo",
  bars: [
    ["A4 - - - - - Bb4 - C5 - - - A4 - - -", "F"],
    ["E5 - - - - - F5 - G5 - - - E5 - - -", "C"],
    ["A5 - - - G5 - F5 - E5 - - - D5 - - -", "Dm"],
    ["F5 - - - E5 - D5 - F5 - - - - - - -", "Bb"],
    ["A4 - - - - - Bb4 - C5 - - - A4 - - -", "F"],
    ["Bb4 - - - - - C5 - D5 - - - Bb4 - - -", "Gm"],
    ["G5 - - - F5 - E5 - D5 - - - C5 - - -", "C"],
    ["G5 - - - F5 - E5 - G5 - - - - - - -", "C"],
    ["D5 - - - E5 - F5 - G5 - - - A5 - - -", "Dm", "walk", "harm"],
    ["C5 - - - D5 - E5 - F5 - - - A5 - - -", "Am", "walk", "harm"],
    ["D5 - - - E5 - F5 - G5 - - - Bb5 - - -", "Bb", "walk", "harm"],
    ["A5 - - - Bb5 - C6 - D6 - - - F6 - - -", "F", "walk", "harm"],
    ["Bb5 - - - - - C6 - D6 - - - Bb5 - - -", "Gm", "walk", "harm"],
    ["A5 - - - G5 - F5 - E5 - - - D5 - - -", "Dm", "walk", "harm"],
    ["G5 - - - F5 - E5 - G5 - - - - - - -", "C7", "walk", "harm"],
    ["C6 - - - A5 - - - F5 - - - - - - -", "F"],
  ],
};

/* Three variations of the field battle tune, kept to the pattern of the three Space already has: sixteen
   bars, no intro; i bVI bVII V7, i bVI iv V7, then bVI bVII bIII i and iv V7 i V7; the bass changing at bar nine
   and the second pulse with it; the chromatic riff last. Each has its own hook.

   Variation 4: D minor. The hook goes up a step, a third and back (D E F | A G F); the answer falls by step
   and the half cadence holds on the dominant. Bars 9 to 11 contrast with a singing line of long notes. */
export const BATTLE_D: Song = {
  bpm: 154, duty: 0.25, drums: "drive", riff: "pump", role: "echo",
  bars: [
    ["D5 - - E5 F5 - - - A5 - G5 - F5 - - -", "Dm"],
    ["F5 - E5 - D5 - - - D5 - C5 - Bb4 - - -", "Bb"],
    ["C5 - - D5 E5 - - - G5 - F5 - E5 - - -", "C"],
    ["E5 - D5 - Db5 - E5 - E5 - - - - - . .", "A7"],
    ["D5 - - E5 F5 - - - A5 - G5 - F5 - - -", "Dm"],
    ["F5 - E5 - D5 - - - D5 - C5 - Bb4 - - -", "Bb"],
    ["G4 - - A4 Bb4 - - - Bb4 - - C5 D5 - - -", "Gm"],
    ["A4 - Bb4 - Db5 - D5 - E5 - - - - - - -", "A7"],
    ["D5 - - - F5 - - - F5 - G5 - F5 - - -", "Bb", "gallop", "harm"],
    ["E5 - - - G5 - - - G5 - A5 - G5 - - -", "C", "gallop", "harm"],
    ["A5 - - - C6 - - - C6 - D6 - C6 - - -", "F", "gallop", "harm"],
    ["D5 - E5 - F5 - G5 - A5 - - - - - - -", "Dm", "gallop", "harm"],
    ["G5 - - A5 Bb5 - - - Bb5 - - C6 D6 - - -", "Gm", "drive", "echo"],
    ["E5 - D5 - Db5 - Bb4 - A4 - - - - - - -", "A7", "drive", "echo"],
    ["D5 - - E5 F5 - - - A5 - G5 - F5 - - -", "Dm", "drive", "echo"],
    ["E5 - D5 - Db5 - E5 - E5 - - - - - . .", "A7", "chrom", "harm"],
  ],
};

/* Variation 5: G minor, the same hook turned upside down (D C Bb | G A Bb), so it falls first and rises
   after, and the answer rises where the first one fell. */
export const BATTLE_G: Song = {
  bpm: 158, duty: 0.5, drums: "drive", riff: "drive", role: "harm",
  bars: [
    ["D6 - - C6 Bb5 - - - G5 - A5 - Bb5 - - -", "Gm"],
    ["Eb5 - F5 - G5 - - - G5 - A5 - Bb5 - - -", "Eb"],
    ["C6 - - Bb5 A5 - - - F5 - G5 - A5 - - -", "F"],
    ["D5 - Eb5 - Gb5 - D5 - D5 - - - - - . .", "D7"],
    ["D6 - - C6 Bb5 - - - G5 - A5 - Bb5 - - -", "Gm"],
    ["Eb5 - F5 - G5 - - - G5 - A5 - Bb5 - - -", "Eb"],
    ["G5 - - F5 Eb5 - - - Eb5 - - D5 C5 - - -", "Cm"],
    ["A5 - G5 - Gb5 - Eb5 - D5 - - - - - - -", "D7"],
    ["G5 - - - Eb5 - - - Eb5 - D5 - Eb5 - - -", "Eb", "pump", "echo"],
    ["A5 - - - F5 - - - F5 - Eb5 - F5 - - -", "F", "pump", "echo"],
    ["D6 - - - Bb5 - - - Bb5 - A5 - Bb5 - - -", "Bb", "pump", "echo"],
    ["D6 - C6 - Bb5 - A5 - G5 - - - - - - -", "Gm", "pump", "echo"],
    ["G5 - - F5 Eb5 - - - Eb5 - - D5 C5 - - -", "Cm"],
    ["A5 - - G5 Gb5 - - - Gb5 - - Eb5 D5 - - -", "D7"],
    ["D6 - - C6 Bb5 - - - G5 - A5 - Bb5 - - -", "Gm"],
    ["D5 - Eb5 - Gb5 - D5 - D5 - - - - - . .", "D7", "chrom", "echo"],
  ],
};

/* Variation 6: B flat minor, the rush kit. The hook is a chant: one pitch four times, then a leap and a
   held note. */
export const BATTLE_BB: Song = {
  bpm: 162, duty: 0.25, drums: "rush", riff: "pump", role: "echo",
  bars: [
    ["Db5 - Db5 - Db5 - Db5 - F5 - - - Db5 - - -", "Bbm"],
    ["Bb5 - Ab5 - Gb5 - - - Gb5 - F5 - Db5 - - -", "Gb"],
    ["C5 - C5 - C5 - C5 - Eb5 - - - C5 - - -", "Ab"],
    ["A5 - Gb5 - F5 - C5 - C5 - - - - - . .", "F7"],
    ["Db5 - Db5 - Db5 - Db5 - F5 - - - Db5 - - -", "Bbm"],
    ["Bb5 - Ab5 - Gb5 - - - Gb5 - F5 - Db5 - - -", "Gb"],
    ["Gb5 - Gb5 - Bb5 - - - Bb5 - Bb5 - Eb6 - - -", "Ebm"],
    ["F5 - Gb5 - A5 - Bb5 - C6 - - - - - - -", "F7"],
    ["Bb5 - - - Db6 - - - Db6 - Eb6 - Db6 - - -", "Gb", "octave", "harm"],
    ["C6 - - - Eb6 - - - Eb6 - F6 - Eb6 - - -", "Ab", "octave", "harm"],
    ["F5 - - - Ab5 - - - Ab5 - Bb5 - Ab5 - - -", "Db", "octave", "harm"],
    ["Bb4 - C5 - Db5 - Eb5 - F5 - - - - - - -", "Bbm", "octave", "harm"],
    ["Gb5 - Gb5 - Bb5 - - - Bb5 - Bb5 - Eb6 - - -", "Ebm", "drive", "echo"],
    ["C6 - Bb5 - A5 - Gb5 - F5 - - - - - - -", "F7", "drive", "echo"],
    ["Db5 - Db5 - Db5 - Db5 - F5 - - - Db5 - - -", "Bbm", "drive", "echo"],
    ["A5 - Gb5 - F5 - C5 - C5 - - - - - . .", "F7", "chrom", "echo"],
  ],
};
