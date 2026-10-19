/* Writing Space 3's bars: a rhythm and the notes to put in it, so a bar always has the right number of cells (space2-music.ts
   notation: X a note, "-" holds it, "." rests; 16 cells are 4/4, 14 are 7/8, 12 are 6/8). The rhythms are the phrasing of Kenji Ito's
   Romancing SaGa melodies: a run of sixteenths up into a long note, anticipations off the beat, a held anthem line, a riff that
   jumps the octave, a gallop, a turn. */

export const RHYTHM = {
  /* 4/4 */
  rise: "X X X X X - - - - - - - X - X -",
  sync: "X - - X - - X - - - X - X - - -",
  anthem: "X - - - - - X - X - - - X - - -",
  climb: "X - X - X - X - X - - - - - - -",
  sigh: "X - - - - - - - X - X - X - . .",
  riff: "X . X X . X X . X . X X . X X .",
  gallop: "X - X X - X X - X - X X - X - -",
  turn: "X X X - X X X - X - X - X - - -",
  hits: "X . . X . . X . . . X . X . X .",
  hold: "X - - - - - - - - - - - - - . .",
  two: "X - - - - - - - X - - - - - - -",
  flurry: "X X X X X X X X X X X X X X X -",
  /* 7/8 */
  rise14: "X X X X - - - - - X - X - -",
  sync14: "X - - X - - X - - - X - - -",
  anthem14: "X - - - - - X - - X - - - -",
  riff14: "X . X X . X X . X . X X . X",
  seven: "X . X . X - X . X - X - . .",
  sevenRun: "X X X X X X X - X - X - X -",
  sevenCall: "X - - - X - - X - - X - - -",
  /* 6/8 */
  rise12: "X X X X - - - - X - - -",
  anthem12: "X - - - - - X - - - - -",
  riff12: "X . X X . X X . X X . X",
  sixLilt: "X - - X - - X - - X - -",
  sixLong: "X - - - - - X - - X - -",
} as const;
export type Rhythm = keyof typeof RHYTHM;

export function b(rhythm: Rhythm, notes: string, chord: string): [string, string] {
  const cells = RHYTHM[rhythm].split(" "), ns = notes.trim().split(/\s+/);
  const need = cells.filter((c) => c === "X").length;
  if (ns.length !== need) throw new Error(`space3-score: ${rhythm} wants ${need} notes, got ${ns.length}: ${notes}`);
  let i = 0;
  return [cells.map((c) => (c === "X" ? ns[i++] : c)).join(" "), chord];
}
