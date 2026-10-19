/* Space 3's melodies, written after Kenji Ito's Romancing SaGa scores and the Space 2 bonus tracks: runs of sixteenths into long notes,
   heroic leaps of a fifth and an octave, phrases sequenced a step at a time, anticipations off the beat, octave-jumping riffs, and the
   flat-six, flat-seven cadence home. Every melody is new; each tune keeps its key, meters and form (space3-orchestra.ts and
   space3-orchestra-outer.ts arrange them). */
import { b } from "./space3-score.ts";

type Part = [lead: string, chord: string][];

export const MELODY: Record<string, Record<string, Part>> = {
  TITLE: {
    I: [b("hits", "F#4 F#4 C#5 C#5 F#5 F#5", "F#m")],
    A: [b("anthem", "F#5 E5 F#5 A5", "F#m"), b("anthem", "E5 D5 E5 F#5", "D"), b("sigh", "C#5 B4 C#5 E5", "E"), b("rise", "C#5 D5 E5 F#5 G#5 F#5 E5", "C#7")],
    E: [b("riff", "F#5 F#5 A5 F#5 C#6 F#5 B5 A5 F#5 E5", "F#m"), b("riff", "D5 D5 F#5 D5 A5 D5 G#5 F#5 E5 D5", "D"), b("riff", "E5 E5 G#5 E5 B5 E5 A5 G#5 F#5 E5", "E"), b("turn", "C#5 D5 E5 F#5 G#5 A5 B5 C#6 F#5", "C#7")],
    B: [b("rise", "E5 F#5 G#5 A5 C#6 B5 A5", "D"), b("anthem", "B5 C#6 B5 E5", "E"), b("climb", "C#6 B5 A5 G#5 E5", "C#m"), b("sigh", "F#5 E5 F#5 A5", "F#m")],
    C: [b("hold", "C#5", "F#m"), b("two", "D5 F#5", "D"), b("two", "E5 G#5", "E"), b("sigh", "C#5 B4 A4 G#4", "C#7")],
    D: [b("anthem", "A5 B5 C#6 E6", "D"), b("anthem", "B5 C#6 D6 E6", "E"), b("rise", "C#6 D6 E6 F#6 A6 G#6 F#6", "F#"), b("hold", "F#6", "F#")],
  },
  HANGAR: {
    A: [b("sixLilt", "B4 E5 G#5 B5", "E"), b("sixLilt", "A4 C#5 E5 A5", "A"), b("sixLilt", "G#4 B4 E5 G#5", "C#m"), b("sixLong", "F#5 E5 D#5", "B7")],
    B: [b("rise12", "E5 F#5 G#5 A5 B5", "E"), b("sixLong", "C#6 B5 A5", "A"), b("rise12", "D#5 E5 F#5 G#5 A5", "B"), b("sixLong", "G#5 F#5 E5", "E")],
    C: [b("sixLilt", "C#5 E5 G#5 E5", "C#m"), b("sixLilt", "A4 C#5 F#5 C#5", "F#m"), b("sixLilt", "B4 D#5 F#5 A5", "B7"), b("anthem12", "G#5 E5", "E")],
    D: [b("sixLong", "E6 D#6 B5", "E"), b("sixLong", "C#6 B5 A5", "A"), b("sixLong", "B5 A5 F#5", "B7"), b("anthem12", "E5 B4", "E")],
  },
  PHOBOS: {
    A: [b("rise", "A4 B4 C5 D5 E5 C5 E5", "Am"), b("gallop", "G5 E5 G5 A5 G5 E5 D5 C5 D5", "G"), b("rise", "F4 G4 A4 B4 C5 A4 C5", "F"), b("climb", "E5 D5 C5 B4 G#4", "E7")],
    B: [b("anthem", "E5 A5 C6 B5", "Am"), b("anthem", "D5 G5 B5 A5", "G"), b("anthem", "C5 F5 A5 G5", "F"), b("rise", "G#4 B4 D5 E5 G#5 F5 E5", "E7")],
    C: [b("sync", "D5 F5 A5 G5 F5", "Dm"), b("sync", "C5 E5 G5 F5 E5", "C"), b("sync", "Bb4 D5 F5 E5 D5", "Bb"), b("turn", "A4 C#5 E5 A5 G5 F5 E5 D5 C#5", "A7")],
    D: [b("anthem", "C6 B5 A5 F5", "F"), b("anthem", "D6 C6 B5 G5", "G"), b("riff", "A5 A5 C6 A5 E6 A5 D6 C6 B5 A5", "Am"), b("climb", "G#5 B5 D6 E6 B5", "E7")],
  },
  FOUNDRY: {
    A: [b("riff12", "C5 C5 Eb5 C5 G5 C5 F5 Eb5", "Cm"), b("riff12", "Ab4 Ab4 C5 Ab4 Eb5 Ab4 D5 C5", "Ab"), b("riff12", "Bb4 Bb4 D5 Bb4 F5 Bb4 Eb5 D5", "Bb"), b("rise12", "G4 B4 D5 F5 G5", "G7")],
    B: [b("sixLong", "G5 Ab5 G5", "Cm"), b("sixLong", "F5 G5 Ab5", "Fm"), b("sixLong", "Eb5 F5 G5", "Eb"), b("rise12", "D5 Eb5 F5 G5 B5", "G7")],
    C: [b("sixLilt", "Eb5 G5 Bb5 G5", "Eb"), b("sixLilt", "D5 F5 Bb5 F5", "Bb"), b("sixLilt", "C5 Eb5 Ab5 Eb5", "Ab"), b("sixLong", "Bb4 D5 F5", "Bb")],
    D: [b("anthem12", "Ab5 G5", "Ab"), b("anthem12", "Bb5 Ab5", "Bb"), b("rise12", "C6 D6 Eb6 F6 G6", "Cm"), b("sixLong", "F6 D6 B5", "G7")],
  },
  CRYO: {
    A: [b("rise14", "B4 C#5 D5 E5 F#5 D5", "Bm"), b("seven", "A5 F#5 A5 B5 A5 F#5", "A"), b("rise14", "G4 A4 B4 C#5 D5 B4", "G"), b("sevenCall", "F#5 E5 C#5 A#4", "F#7")],
    B: [b("anthem14", "F#5 B5 D6", "Bm"), b("anthem14", "E5 A5 C#6", "A"), b("anthem14", "D5 G5 B5", "G"), b("rise14", "A#4 C#5 E5 F#5 A#5 C#6", "F#7")],
    C: [b("riff14", "B4 B4 D5 B4 F#5 B4 E5 D5 C#5", "Bm"), b("riff14", "G4 G4 B4 G4 D5 G4 C#5 B4 A4", "G"), b("riff14", "A4 A4 C#5 A4 E5 A4 D5 C#5 B4", "A"), b("sevenRun", "F#4 G4 A4 A#4 C#5 E5 F#5 E5 C#5 A#4", "F#7")],
    D: [b("anthem14", "D6 C#6 B5", "G"), b("anthem14", "E6 D6 C#6", "A"), b("rise14", "F#5 G5 A5 B5 D6 F#6", "Bm"), b("sevenCall", "E6 C#6 A#5 F#5", "F#7")],
  },
  KHARN: {
    A: [b("two", "G#4 D#5", "G#m"), b("sigh", "E5 D#5 C#5 B4", "E"), b("two", "C#5 F#5", "C#m"), b("sigh", "D#5 C#5 B4 A#4", "D#7")],
    B: [b("anthem", "B4 D#5 F#5 B5", "B"), b("anthem", "A#5 G#5 F#5 D#5", "D#m"), b("anthem", "E5 G#5 B5 E6", "E"), b("hold", "D#6", "D#7")],
    C: [b("sigh", "G#5 F#5 E5 D#5", "G#m"), b("sigh", "E5 D#5 C#5 B4", "E"), b("sigh", "F#5 E5 D#5 C#5", "F#"), b("two", "D#5 G#4", "D#7")],
    D: [b("anthem", "B5 G#5 D#5 E5", "G#m"), b("anthem", "C#6 A5 E5 F#5", "A"), b("anthem", "B5 G#5 E5 D#5", "E"), b("climb", "F#5 E5 D#5 C#5 A#4", "D#7")],
  },
  ALERT: {
    A: [b("anthem14", "Bb4 B4 Bb4", "Bbm"), b("anthem14", "Bb4 C5 Db5", "Bbm"), b("anthem14", "F5 Gb5 F5", "Gb"), b("sevenCall", "E5 F5 Db5 C5", "F7")],
    B: [b("rise14", "Bb4 C5 Db5 Eb5 F5 Db5", "Bbm"), b("rise14", "Db5 Eb5 F5 Gb5 Ab5 F5", "Db"), b("rise14", "Gb5 Ab5 Bb5 B5 Db6 Bb5", "Gb"), b("sevenCall", "A5 F5 Eb5 C5", "F7")],
    C: [b("riff14", "Bb4 Bb4 Db5 Bb4 F5 Bb4 E5 Db5 C5", "Bbm"), b("riff14", "Bb4 Bb4 Db5 Bb4 Gb5 Bb4 F5 Db5 C5", "Gb"), b("riff14", "Bb4 Bb4 E5 Bb4 G5 Bb4 Gb5 E5 Db5", "Edim"), b("anthem14", "F5 E5 F5", "F7")],
  },
  GHOST: {
    A: [b("sync", "E5 G5 B5 A5 G5", "Em"), b("sync", "C5 E5 G5 F#5 E5", "C"), b("sync", "D5 F#5 A5 G5 F#5", "D"), b("turn", "B4 C5 D#5 F#5 A5 G5 F#5 E5 D#5", "B7")],
    B: [b("rise", "B4 C5 D5 E5 G5 F#5 E5", "Em"), b("rise", "A4 B4 C5 D5 E5 D5 C5", "Am"), b("rise", "D5 E5 F#5 G5 B5 A5 G5", "G"), b("anthem", "F#5 D#5 B4 A4", "B7")],
    C: [b("riff", "E5 E5 G5 E5 B5 E5 A5 G5 F#5 E5", "Em"), b("riff", "C5 C5 E5 C5 G5 C5 F#5 E5 D5 C5", "C"), b("riff", "D5 D5 F#5 D5 A5 D5 G5 F#5 E5 D5", "D"), b("flurry", "B4 C5 D#5 E5 F#5 G5 A5 B5 A5 G5 F#5 E5 D#5 C5 B4", "B7")],
    D: [b("anthem", "G5 B5 E6 D6", "C"), b("anthem", "A5 C6 F#6 E6", "D"), b("climb", "B5 C6 D6 E6 G6", "Em"), b("two", "F#6 D#6", "B7")],
  },
  EXCAVATOR: {
    A: [b("riff12", "F4 F4 Ab4 F4 C5 F4 Bb4 Ab4", "Fm"), b("riff12", "Db4 Db4 F4 Db4 Ab4 Db4 G4 F4", "Db"), b("riff12", "Eb4 Eb4 G4 Eb4 Bb4 Eb4 Ab4 G4", "Eb"), b("rise12", "C4 E4 G4 Bb4 C5", "C7")],
    B: [b("sixLong", "C5 Db5 C5", "Fm"), b("sixLong", "Bb4 C5 Db5", "Bbm"), b("sixLong", "Ab4 Bb4 C5", "Ab"), b("rise12", "G4 Ab4 Bb4 C5 E5", "C7")],
    C: [b("sixLilt", "F5 Ab5 C6 Ab5", "Fm"), b("sixLilt", "Eb5 G5 Bb5 G5", "Eb"), b("sixLilt", "Db5 F5 Ab5 F5", "Db"), b("sixLong", "C5 E5 G5", "C7")],
    D: [b("anthem12", "Db6 C6", "Db"), b("anthem12", "Eb6 Db6", "Eb"), b("rise12", "F5 G5 Ab5 Bb5 C6", "Fm"), b("sixLong", "Bb5 G5 E5", "C7")],
  },
  WYRM: {
    A: [b("rise14", "G4 A4 Bb4 C5 D5 Bb4", "Gm"), b("seven", "F5 D5 F5 G5 F5 D5", "F"), b("rise14", "Eb4 F4 G4 A4 Bb4 G4", "Eb"), b("sevenCall", "D5 C5 A4 F#4", "D7")],
    B: [b("anthem14", "D5 G5 Bb5", "Gm"), b("anthem14", "C5 F5 A5", "F"), b("anthem14", "Bb4 Eb5 G5", "Eb"), b("rise14", "F#4 A4 C5 D5 F#5 A5", "D7")],
    C: [b("riff14", "G4 G4 Bb4 G4 D5 G4 C5 Bb4 A4", "Gm"), b("riff14", "Eb4 Eb4 G4 Eb4 Bb4 Eb4 A4 G4 F4", "Eb"), b("riff14", "F4 F4 A4 F4 C5 F4 Bb4 A4 G4", "F"), b("sevenRun", "D4 E4 F#4 G4 A4 C5 D5 C5 A4 F#4", "D7")],
    D: [b("anthem14", "Bb5 A5 G5", "Eb"), b("anthem14", "C6 Bb5 A5", "F"), b("rise14", "D5 Eb5 F5 G5 Bb5 D6", "Gm"), b("sevenCall", "C6 A5 F#5 D5", "D7")],
  },
  RECLAIMER: {
    A: [b("gallop", "C5 Eb5 G5 C6 G5 Eb5 G5 Ab5 G5", "Cm"), b("gallop", "Bb4 D5 F5 Bb5 F5 D5 F5 G5 F5", "Bb"), b("gallop", "Ab4 C5 Eb5 Ab5 Eb5 C5 Eb5 F5 Eb5", "Ab"), b("climb", "G5 F5 D5 B4 G4", "G7")],
    B: [b("rise", "G4 Ab4 Bb4 C5 Eb5 D5 C5", "Cm"), b("rise", "F4 G4 Ab4 Bb4 D5 C5 Bb4", "Bb"), b("rise", "Eb4 F4 G4 Ab4 C5 Bb4 Ab4", "Ab"), b("anthem", "B4 D5 F5 G5", "G7")],
    C: [b("anthem", "D6 C6 A5 F5", "Dm"), b("anthem", "Bb5 A5 F5 D5", "Bb"), b("anthem", "C6 Bb5 G5 E5", "C"), b("rise", "A5 Bb5 C#6 D6 E6 C#6 A5", "A7")],
    D: [b("sync", "Ab5 G5 Eb5 C5 Eb5", "Ab"), b("sync", "Bb5 Ab5 F5 D5 F5", "Bb"), b("riff", "C6 C6 Eb6 C6 G6 C6 F6 Eb6 D6 C6", "Cm"), b("climb", "B5 D6 F6 G6 D6", "G7")],
  },
  VICTORY: {
    A: [b("rise", "D5 E5 F#5 G5 B5 A5 G5", "G"), b("rise", "E5 F#5 G5 A5 C6 B5 A5", "C"), b("anthem", "F5 G5 A5 C6", "F"), b("anthem", "D6 E6 F#6 A6", "D"), b("hold", "G6", "G")],
  },
  HANGAR2: {
    A: [b("sixLilt", "E5 A5 C#6 A5", "A"), b("sixLilt", "D5 F#5 B5 F#5", "Bm"), b("sixLilt", "C#5 E5 A5 E5", "A"), b("sixLong", "B4 E5 G#5", "E")],
    B: [b("rise12", "C#5 D5 E5 F#5 A5", "F#m"), b("sixLong", "B5 A5 F#5", "D"), b("rise12", "G#4 A4 B4 C#5 E5", "E"), b("anthem12", "A5 E5", "A")],
  },
  HANGAR3: {
    A: [b("sixLong", "A4 D5 F5", "Dm"), b("sixLong", "Bb4 D5 G5", "Gm"), b("sixLong", "A4 C#5 E5", "A7"), b("sixLong", "F5 E5 D5", "Dm")],
    B: [b("rise12", "D5 E5 F5 G5 A5", "Dm"), b("sixLong", "Bb5 A5 G5", "Bb"), b("rise12", "C#5 D5 E5 F5 G5", "A7"), b("anthem12", "F5 D5", "Dm")],
  },
  FANFARE: {
    A: [b("rise", "C5 D5 E5 F5 G5 E5 G5", "C"), b("anthem", "A5 B5 D6 G6", "G")],
  },
  ALERT2: {
    A: [b("sigh", "C5 B4 C5 Db5", "Cm"), b("sigh", "Eb5 D5 Eb5 F5", "Cm"), b("sigh", "Ab5 G5 Ab5 Bb5", "Fm"), b("two", "B4 G4", "G7")],
    B: [b("rise", "C5 D5 Eb5 F5 G5 Ab5 G5", "Cm"), b("rise", "Db5 Eb5 F5 G5 Ab5 Bb5 Ab5", "Db"), b("rise", "B4 C5 D5 F5 G5 Ab5 G5", "G7"), b("hold", "G5", "G7")],
  },
  ALERT3: {
    A: [b("anthem14", "F#4 G4 F#4", "F#m"), b("anthem14", "F#4 A4 B4", "Bm"), b("anthem14", "G4 B4 D5", "G"), b("sevenCall", "C#5 F5 G#5 B4", "C#7")],
    B: [b("rise14", "F#5 G#5 A5 B5 C#6 A5", "F#m"), b("rise14", "D5 E5 F#5 G5 A5 F#5", "Bm"), b("rise14", "G5 A5 B5 C6 D6 B5", "G"), b("sevenCall", "C#6 G#5 F5 C#5", "C#7")],
  },
  PAUSE: {
    A: [b("two", "B4 E5", "Em"), b("two", "C5 G5", "C"), b("two", "A4 D5", "D"), b("hold", "B4", "Em")],
    B: [b("sigh", "G5 F#5 G5 B5", "G"), b("sigh", "A5 G5 A5 C6", "Am"), b("sigh", "F#5 E5 F#5 A5", "D"), b("hold", "E5", "Em")],
  },
  GAMEOVER: {
    A: [b("sigh", "A4 G4 F4 E4", "Am"), b("two", "F4 E4", "E7")],
  },
  ENDING: {
    A: [b("rise", "A4 B4 C#5 D5 F#5 E5 D5", "D"), b("anthem", "B4 D5 G5 F#5", "G"), b("rise", "F#4 G4 A4 B4 D5 C#5 B4", "Bm"), b("anthem", "A4 C#5 E5 A5", "A")],
    B: [b("anthem", "F#5 A5 D6 C#6", "D"), b("anthem", "G5 B5 E6 D6", "Em"), b("anthem", "A5 C#6 F#6 E6", "F#m"), b("climb", "G5 A5 B5 C#6 E6", "A7")],
    C: [b("two", "D6 F6", "Bb"), b("two", "E6 G6", "C"), b("two", "F#6 A6", "D"), b("hold", "D6", "D")],
  },
  STAGE5: {
    A: [b("rise14", "E5 F#5 G5 A5 B5 G5", "Em"), b("riff14", "C5 C5 E5 C5 G5 C5 F#5 E5 D5", "C"), b("rise14", "D5 E5 F#5 G5 A5 F#5", "D"), b("sevenRun", "B4 C5 D#5 E5 F#5 A5 B5 A5 F#5 D#5", "B7")],
    B: [b("anthem14", "B5 E6 D6", "Em"), b("anthem14", "A5 D6 C6", "Am"), b("anthem14", "G5 C6 B5", "C"), b("sevenCall", "A5 F#5 D#5 B4", "B7")],
    C: [b("riff14", "E5 E5 G5 E5 B5 E5 A5 G5 F#5", "Em"), b("riff14", "F5 F5 A5 F5 C6 F5 B5 A5 G5", "F"), b("riff14", "G5 G5 B5 G5 D6 G5 C6 B5 A5", "G"), b("rise14", "D#5 F#5 A5 B5 D#6 F#6", "B7")],
  },
  STAGE6: {
    A: [b("riff12", "D5 D5 F5 D5 A5 D5 G5 F5", "Dm"), b("riff12", "Bb4 Bb4 D5 Bb4 F5 Bb4 E5 D5", "Bb"), b("riff12", "C5 C5 E5 C5 G5 C5 F5 E5", "C"), b("rise12", "A4 C#5 E5 G5 A5", "A7")],
    B: [b("sixLong", "F5 G5 A5", "Dm"), b("sixLong", "G5 A5 Bb5", "Gm"), b("sixLong", "A5 Bb5 C#6", "A7"), b("anthem12", "D6 A5", "Dm")],
    C: [b("rise12", "D5 E5 F5 G5 A5", "Dm"), b("rise12", "C5 D5 E5 F5 G5", "C"), b("rise12", "Bb4 C5 D5 E5 F5", "Bb"), b("sixLong", "E5 C#5 A4", "A7")],
  },
  STAGE7: {
    A: [b("two", "B4 F#5", "Bm"), b("two", "G4 D5", "G"), b("two", "A4 E5", "A"), b("sigh", "F#5 E5 C#5 A#4", "F#7")],
    B: [b("anthem", "D5 C#5 B4 F#5", "Bm"), b("anthem", "E5 D5 B4 G5", "Em"), b("anthem", "F#5 E5 D5 A5", "D"), b("two", "A#5 F#5", "F#7")],
    C: [b("sigh", "B5 A5 F#5 D5", "Bm"), b("sigh", "G5 F#5 D5 B4", "G"), b("sigh", "E5 D5 B4 G4", "Em"), b("climb", "C#5 E5 F#5 A#5 C#6", "F#7")],
  },
  STAGE8: {
    A: [b("rise", "E5 F#5 G#5 A5 C#6 B5 A5", "A"), b("rise", "C#5 D5 E5 F#5 A5 G#5 F#5", "F#m"), b("rise", "A4 B4 C#5 D5 F#5 E5 D5", "D"), b("anthem", "E5 G#5 B5 D6", "E7")],
    B: [b("anthem", "C#6 E6 A6 G#6", "A"), b("anthem", "D6 F#6 B6 A6", "Bm"), b("climb", "E6 D6 C#6 B5 A5", "A"), b("hold", "B5", "E7")],
    C: [b("gallop", "F#5 A5 C#6 F#6 C#6 A5 C#6 D6 C#6", "F#m"), b("gallop", "D5 F#5 A5 D6 A5 F#5 A5 B5 A5", "D"), b("gallop", "B4 D5 F#5 B5 F#5 D5 F#5 G#5 F#5", "Bm"), b("climb", "E5 G#5 B5 D6 E6", "E7")],
  },
  STAGE9: {
    A: [b("anthem14", "C#5 G#5 E5", "C#m"), b("anthem14", "F#5 C#6 A5", "F#m"), b("anthem14", "D#5 B5 F#5", "B"), b("sevenCall", "G#5 C5 D#5 F#5", "G#7")],
    B: [b("sync14", "E5 D#5 C#5 G#4", "C#m"), b("sync14", "F#5 E5 C#5 A4", "A"), b("sync14", "G#5 F#5 D#5 B4", "B"), b("anthem14", "C5 D#5 G#5", "G#7")],
    C: [b("riff14", "C#5 C#5 E5 C#5 G#5 C#5 F#5 E5 D#5", "C#m"), b("riff14", "A4 A4 C#5 A4 E5 A4 D5 C#5 B4", "A"), b("riff14", "B4 B4 D#5 B4 F#5 B4 E5 D#5 C#5", "B"), b("rise14", "G#4 C5 D#5 F#5 G#5 C6", "G#7")],
  },
  STAGE10: {
    A: [b("riff", "F5 F5 Ab5 F5 C6 F5 Bb5 Ab5 G5 F5", "Fm"), b("riff", "Db5 Db5 F5 Db5 Ab5 Db5 G5 F5 Eb5 Db5", "Db"), b("riff", "Eb5 Eb5 G5 Eb5 Bb5 Eb5 Ab5 G5 F5 Eb5", "Eb"), b("turn", "C5 Db5 E5 G5 Bb5 C6 Bb5 G5 E5", "C7")],
    B: [b("anthem", "C6 F6 Eb6 C6", "Fm"), b("anthem", "Bb5 Eb6 Db6 Bb5", "Bbm"), b("anthem", "Ab5 Db6 C6 Ab5", "Db"), b("rise", "G5 Ab5 Bb5 C6 E6 Db6 C6", "C7")],
    C: [b("sync", "Ab5 G5 F5 C5 F5", "Fm"), b("sync", "Bb5 Ab5 F5 Db5 F5", "Bbm"), b("sync", "C6 Bb5 G5 E5 G5", "C7"), b("two", "F5 C6", "Fm")],
  },
  STAGE11: {
    A: [b("riff12", "G4 G4 Bb4 G4 D5 G4 C5 Bb4", "Gm"), b("riff12", "Eb4 Eb4 G4 Eb4 Bb4 Eb4 A4 G4", "Eb"), b("riff12", "F4 F4 A4 F4 C5 F4 Bb4 A4", "F"), b("rise12", "D4 F#4 A4 C5 D5", "D7")],
    B: [b("sixLong", "D5 Eb5 D5", "Gm"), b("sixLong", "C5 D5 Eb5", "Cm"), b("sixLong", "Bb4 C5 D5", "Bb"), b("rise12", "A4 Bb4 C5 D5 F#5", "D7")],
    C: [b("rise12", "G5 A5 Bb5 C6 D6", "Gm"), b("rise12", "F5 G5 A5 Bb5 C6", "F"), b("rise12", "Eb5 F5 G5 A5 Bb5", "Eb"), b("sixLong", "A5 F#5 D5", "D7")],
  },
  STAGE12: {
    A: [b("gallop", "D5 F5 A5 D6 A5 F5 A5 Bb5 A5", "Dm"), b("gallop", "Bb4 D5 F5 Bb5 F5 D5 F5 G5 F5", "Bb"), b("gallop", "C5 E5 G5 C6 G5 E5 G5 A5 G5", "C"), b("flurry", "A4 C#5 E5 G5 A5 C#6 E6 G6 E6 C#6 A5 G5 E5 C#5 A4", "A7")],
    B: [b("rise", "A4 Bb4 C5 D5 F5 E5 D5", "Dm"), b("rise", "Bb4 C5 D5 E5 G5 F5 E5", "Gm"), b("rise", "C#5 D5 E5 F5 A5 G5 F5", "A7"), b("anthem", "D5 F5 A5 D6", "Dm")],
    C: [b("anthem", "F6 E6 D6 A5", "Bb"), b("anthem", "G6 F6 E6 C6", "C"), b("riff", "D6 D6 F6 D6 A6 D6 G6 F6 E6 D6", "Dm"), b("climb", "C#6 E6 G6 A6 E6", "A7")],
  },
  BOSS5: {
    A: [b("riff", "F#5 F#5 A5 F#5 C#6 F#5 B5 A5 G#5 F#5", "F#m"), b("riff", "D5 D5 F#5 D5 A5 D5 G#5 F#5 E5 D5", "D"), b("riff", "E5 E5 G#5 E5 B5 E5 A5 G#5 F#5 E5", "E"), b("turn", "C#5 D5 F5 G#5 B5 C#6 B5 G#5 F5", "C#7")],
    B: [b("anthem14", "C#6 F#6 E6", "F#m"), b("anthem14", "B5 E6 D6", "Bm"), b("anthem14", "A5 D6 C#6", "D"), b("rise14", "F5 G#5 B5 C#6 F6 G#6", "C#7")],
    C: [b("flurry", "F#5 G#5 A5 B5 C#6 D6 E6 F#6 E6 D6 C#6 B5 A5 G#5 F#5", "F#m"), b("flurry", "D5 E5 F#5 G#5 A5 B5 C#6 D6 C#6 B5 A5 G#5 F#5 E5 D5", "D"), b("flurry", "E5 F#5 G#5 A5 B5 C#6 D6 E6 D6 C#6 B5 A5 G#5 F#5 E5", "E"), b("anthem", "F5 G#5 C#6 F6", "C#7")],
  },
  BOSS6: {
    A: [b("riff12", "C4 C4 Eb4 C4 G4 C4 F4 Eb4", "Cm"), b("riff12", "Ab3 Ab3 C4 Ab3 Eb4 Ab3 D4 C4", "Ab"), b("riff12", "Bb3 Bb3 D4 Bb3 F4 Bb3 Eb4 D4", "Bb"), b("rise12", "G3 B3 D4 F4 G4", "G7")],
    B: [b("anthem14", "G5 C6 Eb6", "Cm"), b("anthem14", "F5 Ab5 C6", "Fm"), b("anthem14", "G5 Bb5 D6", "Gm"), b("sevenCall", "F5 D5 B4 G4", "G7")],
    C: [b("rise12", "C5 D5 Eb5 F5 G5", "Cm"), b("rise12", "Ab4 Bb4 C5 D5 Eb5", "Ab"), b("rise12", "F4 G4 Ab4 Bb4 C5", "Fm"), b("sixLong", "D5 B4 G4", "G7")],
  },
  BOSS7: {
    A: [b("sync", "Eb5 Gb5 Bb5 Ab5 Gb5", "Ebm"), b("sync", "B4 Eb5 Gb5 F5 Eb5", "B"), b("sync", "Db5 F5 Ab5 Gb5 F5", "Db"), b("turn", "Bb4 C5 D5 F5 Ab5 Bb5 Ab5 F5 D5", "Bb7")],
    B: [b("rise14", "Eb5 F5 Gb5 Ab5 Bb5 Gb5", "Ebm"), b("rise14", "Db5 Eb5 F5 Gb5 Ab5 F5", "Db"), b("rise14", "Gb5 Ab5 Bb5 B5 Db6 Bb5", "Ebm"), b("sevenCall", "F5 D5 Bb4 Ab4", "Bb7")],
    C: [b("anthem", "Bb5 Eb6 Db6 Bb5", "Ebm"), b("anthem", "Ab5 Db6 B5 Ab5", "Abm"), b("anthem", "Gb5 B5 Bb5 Gb5", "B"), b("climb", "F5 Ab5 Bb5 D6 F6", "Bb7")],
  },
  BOSS8: {
    A: [b("riff14", "A4 A4 C5 A4 E5 A4 D5 C5 B4", "Am"), b("riff14", "F4 F4 A4 F4 C5 F4 B4 A4 G4", "F"), b("riff14", "G4 G4 B4 G4 D5 G4 C5 B4 A4", "G"), b("rise14", "E4 G#4 B4 D5 E5 G#5", "E7")],
    B: [b("anthem", "E5 A5 C6 B5", "Am"), b("anthem", "D5 F5 A5 G5", "Dm"), b("anthem", "C5 E5 G5 F5", "C"), b("rise", "B4 C5 D5 E5 G#5 F5 E5", "E7")],
    C: [b("anthem14", "C6 B5 A5", "F"), b("anthem14", "D6 C6 B5", "G"), b("rise14", "A5 B5 C6 D6 E6 A6", "Am"), b("sevenCall", "G#6 E6 B5 G#5", "E7")],
  },
  BOSS9: {
    A: [b("rise", "B4 C#5 D5 E5 F#5 D5 F#5", "Bm"), b("rise", "G4 A4 B4 C#5 D5 B4 D5", "G"), b("rise", "E4 F#4 G4 A4 B4 G4 B4", "Em"), b("anthem", "F#4 A#4 C#5 F#5", "F#7")],
    B: [b("riff14", "B4 B4 D5 B4 F#5 B4 E5 D5 C#5", "Bm"), b("riff14", "E5 E5 G5 E5 B5 E5 A5 G5 F#5", "Em"), b("riff14", "D5 D5 F#5 D5 A5 D5 G5 F#5 E5", "D"), b("anthem14", "A#4 C#5 F#5", "F#7")],
    C: [b("anthem", "D6 C#6 B5 F#5", "G"), b("anthem", "E6 D6 C#6 A5", "A"), b("flurry", "B5 C#6 D6 E6 F#6 E6 D6 C#6 B5 A#5 B5 C#6 D6 C#6 B5", "Bm"), b("two", "A#5 F#5", "F#7")],
  },
  BOSS10: {
    A: [b("riff12", "E5 E5 G5 E5 B5 E5 A5 G5", "Em"), b("riff12", "C5 C5 E5 C5 G5 C5 F#5 E5", "C"), b("riff12", "D5 D5 F#5 D5 A5 D5 G5 F#5", "D"), b("rise12", "B4 D#5 F#5 A5 B5", "B7")],
    B: [b("anthem14", "B5 E6 G6", "Em"), b("anthem14", "A5 D6 F#6", "D"), b("anthem14", "G5 C6 E6", "C"), b("sevenCall", "F#6 D#6 B5 F#5", "B7")],
    C: [b("sixLong", "G5 F#5 E5", "Em"), b("sixLong", "A5 G5 E5", "Am"), b("sixLong", "B5 A5 F#5", "Bm"), b("rise12", "D#5 F#5 A5 B5 D#6", "B7")],
  },
  BOSS11: {
    A: [b("gallop", "C5 Eb5 G5 C6 G5 Eb5 G5 Ab5 G5", "Cm"), b("gallop", "Ab4 C5 Eb5 Ab5 Eb5 C5 Eb5 F5 Eb5", "Ab"), b("gallop", "Bb4 D5 F5 Bb5 F5 D5 F5 G5 F5", "Bb"), b("flurry", "G4 B4 D5 F5 G5 B5 D6 F6 D6 B5 G5 F5 D5 B4 G4", "G7")],
    B: [b("rise14", "C5 D5 Eb5 F5 G5 Eb5", "Cm"), b("rise14", "F5 G5 Ab5 Bb5 C6 Ab5", "Fm"), b("rise14", "Eb5 F5 G5 Ab5 Bb5 G5", "Eb"), b("sevenCall", "B5 G5 F5 D5", "G7")],
    C: [b("anthem", "Eb6 G6 C6 Bb5", "Cm"), b("anthem", "C6 Eb6 Ab5 G5", "Ab"), b("anthem", "Ab5 C6 F5 Eb5", "Fm"), b("climb", "D5 F5 G5 B5 D6", "G7")],
  },
  HERALD: {
    A: [b("rise", "D5 E5 F5 G5 A5 F5 A5", "Dm"), b("anthem", "Bb5 A5 G5 F5", "Bb"), b("rise", "C5 D5 E5 F5 G5 E5 G5", "C"), b("anthem", "A5 G5 E5 C#5", "A7")],
    B: [b("anthem", "D6 F6 A6 G6", "Dm"), b("anthem", "Bb5 D6 G6 F6", "Gm"), b("anthem", "C6 F6 A6 G6", "F"), b("climb", "E6 C#6 A5 G5 E5", "A7")],
    C: [b("flurry", "D6 E6 F6 G6 A6 G6 F6 E6 D6 C#6 D6 E6 F6 E6 D6", "Dm"), b("flurry", "Bb5 C6 D6 E6 F6 E6 D6 C6 Bb5 A5 Bb5 C6 D6 C6 Bb5", "Bb"), b("flurry", "C6 D6 E6 F6 G6 F6 E6 D6 C6 B5 C6 D6 E6 D6 C6", "C"), b("climb", "C#6 E6 G6 A6 C#7", "A7")],
    D: [b("riff14", "D5 D5 F5 D5 A5 D5 G5 F5 E5", "Dm"), b("riff14", "G4 G4 Bb4 G4 D5 G4 C5 Bb4 A4", "Gm"), b("riff14", "A4 A4 C#5 A4 E5 A4 D5 C#5 B4", "A7"), b("anthem14", "D5 A5 D6", "Dm")],
    E: [b("two", "F5 A5", "Dm"), b("two", "G5 Bb5", "Gm"), b("two", "E5 G5", "A7"), b("hold", "D5", "Dm")],
  },
  BONUS1: {
    A: [b("riff", "E5 E5 G5 E5 B5 E5 A5 G5 F#5 E5", "Em"), b("riff", "C5 C5 E5 C5 G5 C5 F#5 E5 D5 C5", "C"), b("riff", "A4 A4 C5 A4 E5 A4 D5 C5 B4 A4", "Am"), b("turn", "B4 C5 D#5 F#5 A5 B5 A5 F#5 D#5", "B7")],
    B: [b("flurry", "E5 F#5 G5 A5 B5 C6 D6 E6 D6 C6 B5 A5 G5 F#5 E5", "Em"), b("flurry", "G5 A5 B5 C6 D6 E6 F#6 G6 F#6 E6 D6 C6 B5 A5 G5", "G"), b("flurry", "A5 B5 C6 D6 E6 F#6 G6 A6 G6 F#6 E6 D6 C6 B5 A5", "Am"), b("anthem", "B5 D#6 F#6 B6", "B7")],
    C: [b("anthem14", "G5 E6 D6", "C"), b("anthem14", "A5 F#6 E6", "D"), b("rise14", "B5 C6 D6 E6 G6 B6", "Em"), b("sevenCall", "A6 F#6 D#6 B5", "B7")],
    D: [b("two", "B5 G5", "Em"), b("two", "C6 A5", "Am"), b("two", "D6 B5", "Bm"), b("two", "D#6 F#5", "B7")],
  },
  BONUS2: {
    A: [b("two", "A4 E5", "Am"), b("two", "F4 C5", "F"), b("two", "G4 D5", "G"), b("sigh", "E5 D5 B4 G#4", "E7")],
    B: [b("anthem", "E5 D5 C5 A4", "Am"), b("anthem", "F5 E5 D5 A4", "Dm"), b("anthem", "G5 F5 E5 B4", "G"), b("two", "G#5 E5", "E7")],
    C: [b("rise", "A4 B4 C5 D5 E5 C5 E5", "Am"), b("rise", "D5 E5 F5 G5 A5 F5 A5", "Dm"), b("rise", "G4 A4 B4 C5 D5 B4 D5", "G"), b("anthem", "E5 G#5 B5 E6", "E7")],
  },
};
