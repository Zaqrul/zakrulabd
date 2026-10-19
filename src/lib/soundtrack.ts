/* The tracks in zakrulOS's soundtrack player: every tune of Space (the chiptune) and Space 2 (the
   16-bit orchestra), each with a title in both languages. Only the game's own tunes are here, then the bonus
   tracks, which the games never play, at the end of the album. Only the original Space 2 album lists bonus
   tracks: Ashen Crown, the extended Battle Theme and the four phases of Final Extremity. Space and Ascension (which arranges
   every Space 2 tune) list the games' own tunes only; the other bonus tunes stay in the engines, unlisted. */
import type { NesTrack } from "@/components/games/space-music";
import type { AlternateSagaTrack, BaseSagaTrack } from "@/components/games/space2-music";
import type { Space3Track } from "@/components/games/space3-music";

export type Album = "space" | "space2" | "space2alt" | "space3";
type Name = readonly [en: string, ms: string];

export type Track =
  | { album: "space"; engine: NesTrack; title: Name; variation?: number; boss?: Name; bonus?: true }
  | { album: "space2"; engine: BaseSagaTrack; title: Name; variation?: number; boss?: Name; bonus?: true }
  | { album: "space2alt"; engine: AlternateSagaTrack; title: Name; variation?: number; boss?: Name; bonus?: true }
  | { album: "space3"; engine: Space3Track; title: Name; variation?: number; boss?: Name; bonus?: true };

const BOSSES_1: Name[] = [
  ["Siege Tank", "Kereta Kebal Pengepungan"], ["Iron Flagship", "Kapal Perang Besi"], ["Artillery Hermit", "Ketam Artileri"], ["Hive Carrier", "Kapal Induk Sarang"],
  ["Iron Leviathan", "Leviatan Besi"], ["Solar Bomber", "Pengebom Suria"], ["Crimson Fang", "Taring Merah"], ["Dreadnought", "Dreadnought"],
];
const BOSSES_2: Name[] = ["Tidebreaker", "Mangrove Hydra", "Ice Wyvern", "Dune Maw", "Iron Meridian", "Permafrost", "Cyclone", "Atlas"].map((n): Name => [n, n]);

/* Every tune has a name of its own. A tune with versions keeps the place it plays in the game (Hangar, Battle,
   Warning) and adds what sets the version apart; a boss's showdown is named after the boss, and the last
   boss's phases after what happens in them. */
const S = (en: string, ms: string): Name => [en, ms];
const WANDERER = S("Wanderer's Battle", "Pertempuran Pengembara");
const LANTERN = S("Lantern Town", "Pekan Tanglung");
const RIVAL = S("Rival's Challenge", "Cabaran Saingan");
const CROSSING = S("Starlit Crossing", "Pelayaran Bertabur Bintang");
const LAST_LIGHT = S("Last Light", "Cahaya Terakhir");
const CODEX = S("Codex Gambit", "Gambit Codex");
const SHOWDOWN = S("Showdown", "Pertarungan");

/* Space: the order is the order a flight goes in. The battle tunes are in the order of the chapters they
   play in (1 and 2, 3 to 5, 6 to 8), which is the order of the game, not of the code. */
const SPACE_ALL: Track[] = [
  { album: "space", engine: "title", title: S("Starfall Overture", "Overtur Bintang Jatuh") },
  { album: "space", engine: "hangar", title: S("Hangar: Engines Warm", "Hangar: Enjin Dipanaskan") },
  { album: "space", engine: "hangar2", title: S("Hangar: Night Shift", "Hangar: Syif Malam") },
  { album: "space", engine: "hangar3", title: S("Hangar: Before the Storm", "Hangar: Sebelum Ribut") },
  { album: "space", engine: "fanfare", title: S("Ignition Fanfare", "Fanfara Pencucuhan") },
  { album: "space", engine: "stage", title: S("Battle: First Sortie", "Pertempuran: Serangan Pertama") },
  { album: "space", engine: "stage3", title: S("Battle: Iron Sky", "Pertempuran: Langit Besi") },
  { album: "space", engine: "stage2", title: S("Battle: Red Horizon", "Pertempuran: Ufuk Merah") },
  { album: "space", engine: "alert", title: S("Warning: Contact", "Amaran: Kontak") },
  { album: "space", engine: "alert2", title: S("Warning: Shadow Inbound", "Amaran: Bayang Menghampiri") },
  { album: "space", engine: "alert3", title: S("Warning: Final Approach", "Amaran: Hampiran Terakhir") },
  ...BOSSES_1.slice(0, 7).map((boss, i): Track => ({ album: "space", engine: `boss${i + 1}` as NesTrack, title: SHOWDOWN, boss })),
  { album: "space", engine: "boss8", title: SHOWDOWN, boss: BOSSES_1[7] },
  { album: "space", engine: "boss8b", title: SHOWDOWN, boss: S("Dreadnought Unbound", "Dreadnought Terlepas") },
  { album: "space", engine: "boss8c", title: SHOWDOWN, boss: S("Dreadnought's Last Stand", "Benteng Terakhir Dreadnought") },
  { album: "space", engine: "victory", title: S("Victory Roll", "Guling Kemenangan") },
  { album: "space", engine: "pause", title: S("Holding Pattern", "Pusingan Menunggu") },
  { album: "space", engine: "gameover", title: S("Signal Lost", "Isyarat Hilang") },
  { album: "space", engine: "ending", title: S("Home Among the Stars", "Pulang di Antara Bintang") },
  { album: "space", engine: "bonus1", title: WANDERER, bonus: true },
  { album: "space", engine: "bonus2", title: LANTERN, bonus: true },
  { album: "space", engine: "bonus3", title: RIVAL, bonus: true },
  { album: "space", engine: "bonus4", title: CROSSING, bonus: true },
  { album: "space", engine: "bonus5", title: LAST_LIGHT, bonus: true },
  { album: "space", engine: "bonus6", title: S("Battle: Ember Run", "Pertempuran: Larian Bara"), bonus: true },
  { album: "space", engine: "bonus7", title: S("Battle: Cobalt Front", "Pertempuran: Barisan Kobalt"), bonus: true },
  { album: "space", engine: "bonus8", title: S("Battle: Black Tide", "Pertempuran: Air Pasang Hitam"), bonus: true },
  { album: "space", engine: "bonus9", title: CODEX, bonus: true },
];

/* Space 2: the battle tune changes once, for the last three chapters. */
const SPACE2_ALL: Track[] = [
  { album: "space2", engine: "s2title", title: S("Orbit Overture", "Overtur Orbit") },
  { album: "space2", engine: "s2hangar", title: S("Hangar: Lights On", "Hangar: Lampu Menyala") },
  { album: "space2", engine: "s2hangar2", title: S("Hangar: Quiet Waltz", "Hangar: Waltz Sunyi") },
  { album: "space2", engine: "s2hangar3", title: S("Hangar: Open Water", "Hangar: Laut Terbuka") },
  { album: "space2", engine: "s2fanfare", title: S("Launch Sequence", "Jujukan Pelancaran") },
  { album: "space2", engine: "s2stage", title: S("Battle: Vanguard Run", "Pertempuran: Larian Barisan Hadapan") },
  { album: "space2", engine: "s2stage2", title: S("Battle: Shadow Front", "Pertempuran: Barisan Bayang") },
  { album: "space2", engine: "s2alert", title: S("Warning: Low Hum", "Amaran: Dengung Rendah") },
  { album: "space2", engine: "s2alert2", title: S("Warning: Deep Organ", "Amaran: Organ Dalam") },
  { album: "space2", engine: "s2alert3", title: S("Warning: Rising Tide", "Amaran: Air Pasang") },
  ...BOSSES_2.slice(0, 7).map((boss, i): Track => ({ album: "space2", engine: `s2boss${i + 1}` as BaseSagaTrack, title: SHOWDOWN, boss })),
  { album: "space2", engine: "s2boss8", title: SHOWDOWN, boss: BOSSES_2[7] },
  { album: "space2", engine: "s2boss8b", title: SHOWDOWN, boss: S("Atlas, Judgement", "Atlas, Penghakiman") },
  { album: "space2", engine: "s2boss8c", title: SHOWDOWN, boss: S("Atlas, Last Stand", "Atlas, Benteng Terakhir") },
  { album: "space2", engine: "s2victory", title: S("Clear Skies", "Langit Cerah") },
  { album: "space2", engine: "s2pause", title: S("Drift", "Hanyut") },
  { album: "space2", engine: "s2gameover", title: S("Fallen Star", "Bintang Gugur") },
  { album: "space2", engine: "s2ending", title: S("Beyond the Orbit", "Melepasi Orbit") },
  { album: "space2", engine: "s2bonus1", title: WANDERER, bonus: true },
  { album: "space2", engine: "s2bonus2", title: LANTERN, bonus: true },
  { album: "space2", engine: "s2bonus3", title: RIVAL, bonus: true },
  { album: "space2", engine: "s2bonus4", title: CROSSING, bonus: true },
  { album: "space2", engine: "s2bonus5", title: LAST_LIGHT, bonus: true },
  { album: "space2", engine: "s2bonus6", title: S("Iron Vanguard", "Barisan Besi"), bonus: true },
  { album: "space2", engine: "s2bonus7", title: S("Ashen Crown", "Mahkota Abu"), bonus: true },
  { album: "space2", engine: "s2bonus8", title: S("Crimson Overdrive", "Overdrive Merah"), bonus: true },
  { album: "space2", engine: "s2bonus9", title: S("Battle: Vanguard Run, Extended", "Pertempuran: Larian Barisan Hadapan, Lanjutan"), bonus: true },
  { album: "space2", engine: "s2bonus10", title: S("Final Extremity: Phase 1", "Kemuncak Terakhir: Fasa 1"), bonus: true },
  { album: "space2", engine: "s2bonus13", title: S("Final Extremity: Phase 2", "Kemuncak Terakhir: Fasa 2"), bonus: true },
  { album: "space2", engine: "s2bonus14", title: S("Final Extremity: Phase 3", "Kemuncak Terakhir: Fasa 3"), bonus: true },
  { album: "space2", engine: "s2bonus15", title: S("Final Extremity: Phase 4, Eternity", "Kemuncak Terakhir: Fasa 4, Keabadian"), bonus: true },
  { album: "space2", engine: "s2bonus11", title: CODEX, bonus: true },
  { album: "space2", engine: "s2bonus12", title: S("Final Extremity II", "Final Extremity II"), bonus: true },
];

const ORIGINAL_BONUS: BaseSagaTrack[] = ["s2bonus7", "s2bonus9", "s2bonus10", "s2bonus13", "s2bonus14", "s2bonus15"];
export const SPACE2_TRACKS: Track[] = SPACE2_ALL.filter((track) => !track.bonus || ORIGINAL_BONUS.includes(track.engine as BaseSagaTrack));

export const SPACE_TRACKS: Track[] = SPACE_ALL.filter((track) => !track.bonus);

export const SPACE2_ALTERNATE_TRACKS: Track[] = SPACE2_ALL.filter((track) => !track.bonus).map((track) => ({
  ...track, album: "space2alt", engine: `alt:${track.engine}` as AlternateSagaTrack,
}));

/* Space 3: run-and-gun fusion with an orchestral-rock heart. So far the tunes for chapter 1. */
export const SPACE3_TRACKS: Track[] = [
  { album: "space3", engine: "s3title", title: S("Gate in the Dark", "Gate in the Dark") },
  { album: "space3", engine: "s3hangar", title: S("Hangar: Before the Gate", "Hangar: Before the Gate") },
  { album: "space3", engine: "s3hangar2", title: S("Hangar: Night Watch", "Hangar: Night Watch") },
  { album: "space3", engine: "s3hangar3", title: S("Hangar: Before the Long Dark", "Hangar: Before the Long Dark") },
  { album: "space3", engine: "s3fanfare", title: S("Take-off", "Take-off") },
  { album: "space3", engine: "s3stage1", title: S("Battle: Phobos Run", "Battle: Phobos Run") },
  { album: "space3", engine: "s3stage2", title: S("Battle: Ceres Foundry", "Battle: Ceres Foundry") },
  { album: "space3", engine: "s3stage3", title: S("Battle: Cryo-Crags", "Battle: Cryo-Crags") },
  { album: "space3", engine: "s3stage4", title: S("Battle: Kharn Wreckage", "Battle: Kharn Wreckage") },
  { album: "space3", engine: "s3stage5", title: S("Battle: Uranian Shear", "Battle: Uranian Shear") },
  { album: "space3", engine: "s3stage6", title: S("Battle: Triton Geysers", "Battle: Triton Geysers") },
  { album: "space3", engine: "s3stage7", title: S("Battle: Kuiper Graveyard", "Battle: Kuiper Graveyard") },
  { album: "space3", engine: "s3stage8", title: S("Battle: Heliopause", "Battle: Heliopause") },
  { album: "space3", engine: "s3stage9", title: S("Battle: Oort Abyss", "Battle: Oort Abyss") },
  { album: "space3", engine: "s3stage10", title: S("Battle: The Megastructure", "Battle: The Megastructure") },
  { album: "space3", engine: "s3stage11", title: S("Battle: Flagship Breach", "Battle: Flagship Breach") },
  { album: "space3", engine: "s3stage12", title: S("Battle: Hypergate Horizon", "Battle: Hypergate Horizon") },
  { album: "space3", engine: "s3alert", title: S("Warning: Ghost Signal", "Warning: Ghost Signal") },
  { album: "space3", engine: "s3alert2", title: S("Warning: Deep Signal", "Warning: Deep Signal") },
  { album: "space3", engine: "s3alert3", title: S("Warning: Event Horizon", "Warning: Event Horizon") },
  { album: "space3", engine: "s3boss1", title: S("Showdown", "Showdown"), boss: S("Ghost Corvet", "Ghost Corvet") },
  { album: "space3", engine: "s3boss2", title: S("Showdown", "Showdown"), boss: S("Excavator-X", "Excavator-X") },
  { album: "space3", engine: "s3boss3", title: S("Showdown", "Showdown"), boss: S("Abyssal Wyrm", "Abyssal Wyrm") },
  { album: "space3", engine: "s3boss4", title: S("Showdown", "Showdown"), boss: S("Armada Reclaimer", "Armada Reclaimer") },
  { album: "space3", engine: "s3boss5", title: S("Showdown", "Showdown"), boss: S("Tempest Raider", "Tempest Raider") },
  { album: "space3", engine: "s3boss6", title: S("Showdown", "Showdown"), boss: S("Cryo-Colossus", "Cryo-Colossus") },
  { album: "space3", engine: "s3boss7", title: S("Showdown", "Showdown"), boss: S("Iron Goliath", "Iron Goliath") },
  { album: "space3", engine: "s3boss8", title: S("Showdown", "Showdown"), boss: S("Aegis-Null", "Aegis-Null") },
  { album: "space3", engine: "s3boss9", title: S("Showdown", "Showdown"), boss: S("Void Stalker", "Void Stalker") },
  { album: "space3", engine: "s3boss10", title: S("Showdown", "Showdown"), boss: S("Ring Keeper", "Ring Keeper") },
  { album: "space3", engine: "s3boss11", title: S("Showdown", "Showdown"), boss: S("The Warmaster", "The Warmaster") },
  { album: "space3", engine: "s3boss12", title: S("Showdown", "Showdown"), boss: S("The Herald", "The Herald") },
  { album: "space3", engine: "s3boss12b", title: S("Showdown", "Showdown"), boss: S("The Herald, Singularity", "The Herald, Singularity") },
  { album: "space3", engine: "s3boss12c", title: S("Showdown", "Showdown"), boss: S("The Herald, True Form", "The Herald, True Form") },
  { album: "space3", engine: "s3victory", title: S("Sortie Complete", "Sortie Complete") },
  { album: "space3", engine: "s3pause", title: S("Drifting", "Drifting") },
  { album: "space3", engine: "s3gameover", title: S("Signal Lost Beyond the Sun", "Signal Lost Beyond the Sun") },
  { album: "space3", engine: "s3ending", title: S("Through the Gate", "Through the Gate") },
  { album: "space3", engine: "s3bonus1", title: S("Outer Extremity", "Outer Extremity"), bonus: true },
  { album: "space3", engine: "s3bonus2", title: S("Hypergate Requiem", "Hypergate Requiem"), bonus: true },
];

export const ALBUMS: Record<Album, Track[]> = { space: SPACE_TRACKS, space2: SPACE2_TRACKS, space2alt: SPACE2_ALTERNATE_TRACKS, space3: SPACE3_TRACKS };

/* "Showdown: Siege Tank"; a track may still carry a variation number, shown after its title. */
export function trackTitle(track: Track, lang: "en" | "ms") {
  const i = lang === "ms" ? 1 : 0;
  const base = track.boss ? `${track.title[i]}: ${track.boss[i]}` : track.title[i];
  return track.variation ? `${base} (${lang === "ms" ? "Variasi" : "Variation"} ${track.variation})` : base;
}
