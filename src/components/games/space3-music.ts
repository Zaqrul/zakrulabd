/* Space 3's music: the first twelve tunes in the manner of the Space 2 expansion (space3-orchestra.ts), and the rest of the soundtrack
   written against Space 2's and the Ascension album's, bonus tracks included (space3-orchestra-outer.ts).
   (The first set, a run-and-gun and JRPG fusion, is kept as text in docs/design/retired-space3-music/.) */
import type { Song } from "./space2-music";
import { SPACE3_BASE_SONGS } from "./space3-orchestra.ts";
import { SPACE3_OUTER_SONGS } from "./space3-orchestra-outer.ts";

export const SPACE3_SONGS = { ...SPACE3_BASE_SONGS, ...SPACE3_OUTER_SONGS } satisfies Record<string, Song>;
export type Space3Track = keyof typeof SPACE3_SONGS;
