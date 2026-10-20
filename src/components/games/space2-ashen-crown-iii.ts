/* Ashen Crown III: a new tune in the manner of the two Ashen Crowns and Vanguard Run, for the soundtrack player only,
   and the most desperate of them. Every melody is fresh. C minor at 168 bpm over a bass that never rests.
   - The hook: a struck-twice tonic, a sigh down from the third and a cry up to the flat sixth, sung a step higher on each
     chord so that it climbs, then breaks on the augmented second of the harmonic minor (B against A flat).
   - A 7/8 break over a bass falling by semitones from C to G (Cm, B dim, B flat 7, A dim, A flat, G7), the lead
     climbing against it to A flat 6 and a diminished arpeggio.
   - 6/8 brass in hemiola, twos against the bass's threes, rocking between C minor and its Phrygian D flat.
   - A chromatic lead-in that climbs from C6 to E flat 6 and plunges two octaves.
   - The hook again a whole tone higher in D minor, the climax, its diminished bar climbing to A6.
   - A collapse down a semitone onto A flat, held brass over Judgement's throbbing ostinato, and a fall back to the hook.
   Two bars of hits open it once; it loops from the hook. No counter-melody, but the band changes with every part:
   synth lead and trumpet over piano arpeggios, violin and brass over a harp, brass and organ with bells, guitar and
   strings over the chip, guitar and synth lead over organ chords and a synth bass, and brass and trumpet over a violin. */
import type { Song } from "./space2-music";

export const ASHEN_CROWN_III: Song = {
  bpm: 168, lead: "lead", layer: "trumpet", pad: "strings", counter: "piano", arps: true, arpStep: 1, bassVoice: "picked",
  stabs: true, drums: "battle", riff: "gallop16", intro: 2,
  fills: [1, 9, 15, 21, 23, 31], crashes: [2, 10, 16, 24, 32], riser: [22, 23],
  sections: [
    /* The hits: organ with a bell on top, no arpeggio. */
    { from: 0, lead: "organ", layer: "bell", pad: "organ", counter: undefined },
    /* The hook: synth lead doubled by trumpet, piano arpeggios in 16ths, strings held. */
    { from: 2 },
    /* The 7/8 fall: violin doubled by brass, a harp running the chords, the organ underneath. */
    { from: 10, lead: "violin", layer: "brass", pad: "organ", counter: "harp" },
    /* The 6/8 hemiola: brass and organ, bells ringing the chords. */
    { from: 16, lead: "brass", layer: "organ", counter: "bell" },
    /* The lead-in: guitar doubled by strings, the chip arpeggios. */
    { from: 22, lead: "guitar", layer: "strings", counter: "chip" },
    /* The climax: the guitar takes the hook, doubled by the synth lead, over organ chords and the synth bass. */
    { from: 24, lead: "guitar", layer: "lead", counter: "organChord", bassVoice: "synth" },
    /* The collapse: brass and trumpet over the organ, the violin running the chords. */
    { from: 32, lead: "brass", layer: "trumpet", pad: "organ", counter: "violin" },
  ],
  bars: [
    // 1–2, once: hits on C leaning on D flat, then a diminished run up into the hook.
    ["C5 . . C5 . . Db5 . C5 . . C5 . Db5 . C5", "Cm", "hits16"],
    ["B4 . . D5 . . F5 . Ab5 . . B5 . D6 C6 B5", "G7", "hits16"],
    // 3–10: the hook, climbing a step on each chord, breaking on the augmented second; said twice.
    ["C5 C5 . Eb5 - - D5 C5 - . G5 - Ab5 - G5 -", "Cm", "gallop16"],
    ["Eb5 Eb5 . Ab5 - - G5 F5 - . C6 - Db6 - C6 -", "Ab", "gallop16"],
    ["F5 F5 . Ab5 - - G5 F5 - . C6 - Db6 - Eb6 -", "Fm", "gallop16"],
    ["F6 - - - Eb6 - D6 - B5 - - - Ab5 - G5 -", "G7", "gallop16"],
    ["C5 C5 . Eb5 - - D5 C5 - . G5 - Ab5 - G5 -", "Cm", "gallop16"],
    ["Eb5 Eb5 . Ab5 - - G5 F5 - . C6 - Db6 - C6 -", "Ab", "gallop16"],
    ["F5 F5 . Ab5 - - G5 F5 - . D6 - Eb6 - F6 -", "Bdim", "gallop16"],
    ["G6 - - - F6 - Eb6 - D6 - B5 - Ab5 - B5 -", "G7", "gallop16"],
    // 11–16: 7/8 over the bass falling by semitones, the lead climbing against it.
    ["G5 - - C6 - - Eb6 - D6 - C6 - G5 -", "Cm", "ito14"],
    ["Ab5 - - D6 - - F6 - Eb6 - D6 - Ab5 -", "Bdim", "ito14"],
    ["Ab5 - - D6 - - F6 - Ab6 - G6 - F6 -", "Bb7", "ito14"],
    ["Eb6 - - C6 - - A5 - C6 - Eb6 - Gb6 -", "Adim", "ito14"],
    ["F6 - - Eb6 - - C6 - Ab5 - C6 - Eb6 -", "Ab", "ito14"],
    ["D6 - - B5 - - Ab5 - - - G5 F5 Eb5 D5", "G7", "ito14"],
    // 17–22: brass in 6/8, twos against the bass's threes, rocking on D flat.
    ["C6 - B5 - C6 - G5 - Ab5 - G5 -", "Cm", "six12"],
    ["Db6 - C6 - Db6 - Ab5 - F5 - Ab5 -", "Db", "six12"],
    ["Eb6 - D6 - Eb6 - G5 - Ab5 - B5 -", "Cm", "six12"],
    ["F6 - Eb6 - Db6 - C6 - Db6 - F6 -", "Db", "six12"],
    ["Ab6 - - G6 - - F6 - - Eb6 - -", "Ab", "six12"],
    ["D6 - - B5 - - Ab5 - - G5 - .", "G7", "six12"],
    // 23–24: the lead-in, a chromatic climb and a plunge of two octaves, over a riser.
    ["C6 - - - Db6 - - - D6 - - - Eb6 - - -", "Fm", "pump16"],
    ["F6 - - - - - - - B5 Ab5 G5 F5 D5 B4 G4 -", "G7", "itoRun16"],
    // 25–32: the climax, the hook a whole tone higher in D minor.
    ["D5 D5 . F5 - - E5 D5 - . A5 - Bb5 - A5 -", "Dm", "itoRun16"],
    ["F5 F5 . Bb5 - - A5 G5 - . D6 - Eb6 - D6 -", "Bb", "itoRun16"],
    ["G5 G5 . Bb5 - - A5 G5 - . D6 - Eb6 - F6 -", "Gm", "itoRun16"],
    ["G6 - - - F6 - E6 - C#6 - - - Bb5 - A5 -", "A7", "itoRun16"],
    ["D5 D5 . F5 - - E5 D5 - . A5 - Bb5 - A5 -", "Dm", "itoRun16"],
    ["F5 F5 . Bb5 - - A5 G5 - . D6 - Eb6 - D6 -", "Bb", "itoRun16"],
    ["G5 G5 . Bb5 - - A5 G5 - . E6 - F6 - G6 -", "C#dim", "itoRun16"],
    ["A6 - - - G6 - F6 - E6 - C#6 - Bb5 - C#6 -", "A7", "itoRun16"],
    // 33–36: the collapse onto A flat, held brass over the ostinato, and the fall back into the hook.
    ["C6 - - - - - - - - - - - B5 - C6 -", "Ab", "ostinato16"],
    ["Db6 - - - - - - - C6 - - - Ab5 - - -", "Db", "ostinato16"],
    ["D6 - - - - - - - F6 - - - Ab6 - - -", "Bdim", "ostinato16"],
    ["G6 - - - F6 - - - D6 - B5 - Ab5 G5 F5 D5", "G7", "chrom16"],
  ],
};
