/* Every achievement in zakrulOS, in both languages. Each game has the same dozen to start with
   (how often it was opened, how long it was played, six score tiers) and then its own, earned by
   what happens inside it. The player has their own, earned across all of them. Names and
   descriptions use {game} for the game's name, filled in where they are shown. */

export type Pair = [en: string, ms: string];
export type Ach = {
  id: string;
  /* A game's id, or "player" for the ones earned across games. */
  game: string;
  /* The stat that is watched, and the value it has to reach. */
  stat: string;
  min: number;
  name: Pair;
  desc: Pair;
  /* Shown as ??? until earned. */
  secret?: boolean;
  tier?: number;
};

import { SPACE2_ACHIEVEMENTS } from "../components/games/space2-copy.ts";

export const GAME_IDS = ["space", "space2"] as const;

/* The six score tiers of each game: the best score that earns Rookie, Regular, Skilled, Expert,
   Master and Legend. */
export const TIERS: Record<string, number[]> = {
  space: [2000, 8000, 20000, 40000, 80000, 150000],
  space2: [3000, 12000, 30000, 60000, 110000, 200000],
};
const TIER_NAMES: Pair[] = [["Rookie", "Baru"], ["Regular", "Biasa"], ["Skilled", "Mahir"], ["Expert", "Pakar"], ["Master", "Guru"], ["Legend", "Lagenda"]];

const list: Ach[] = [];
const add = (game: string, stat: string, min: number, en: [string, string], ms: [string, string], extra: Partial<Ach> = {}) => {
  list.push({ id: `${game}.${stat}.${min}`, game, stat, min, name: [en[0], ms[0]], desc: [en[1], ms[1]], ...extra });
};

/* The dozen every game has. */
for (const game of GAME_IDS) {
  TIERS[game].forEach((min, i) => {
    list.push({
      id: `${game}.score.t${i + 1}`,
      game,
      stat: "score",
      min,
      tier: i + 1,
      name: [`{game}: ${TIER_NAMES[i][0]}`, `{game}: ${TIER_NAMES[i][1]}`],
      desc: [`Score ${min.toLocaleString("en")} in {game}.`, `Dapatkan skor ${min.toLocaleString("en")} dalam {game}.`],
    });
  });
  add(game, "opens", 1, ["{game}: First Play", "{game}: Main Pertama"], ["Open {game} for the first time.", "Buka {game} buat kali pertama."]);
  add(game, "opens", 10, ["{game}: Regular", "{game}: Pelanggan"], ["Open {game} ten times.", "Buka {game} sepuluh kali."]);
  add(game, "opens", 50, ["{game}: Devoted", "{game}: Setia"], ["Open {game} fifty times.", "Buka {game} lima puluh kali."]);
  add(game, "seconds", 600, ["{game}: Ten Minutes", "{game}: Sepuluh Minit"], ["Spend ten minutes in {game}.", "Habiskan sepuluh minit dalam {game}."]);
  add(game, "seconds", 3600, ["{game}: An Hour", "{game}: Sejam"], ["Spend an hour in {game}.", "Habiskan sejam dalam {game}."]);
  add(game, "seconds", 18000, ["{game}: Five Hours", "{game}: Lima Jam"], ["Spend five hours in {game}.", "Habiskan lima jam dalam {game}."]);
}

/* Space */
for (let n = 1; n <= 8; n++) add("space", "chapter", n, [`Chapter ${n} Cleared`, `Bab ${n} Selesai`], [`Clear chapter ${n}.`, `Selesaikan bab ${n}.`]);

/* The player's own. These watch what both campaigns add up to. */
const p = (stat: string, min: number, en: [string, string], ms: [string, string], extra: Partial<Ach> = {}) => add("player", stat, min, en, ms, extra);
p("member", 1, ["Player One", "Pemain Satu"], ["Make an account and sign in.", "Cipta akaun dan log masuk."]);
p("gamesPlayed", 1, ["Insert Coin", "Masukkan Syiling"], ["Play your first game.", "Main game pertama anda."]);
p("gamesPlayed", 2, ["Full Library", "Perpustakaan Penuh"], ["Play both Space and Space 2.", "Main Space dan Space 2."]);
p("opens", 25, ["Warm Seat", "Tempat Duduk Hangat"], ["Open games 25 times.", "Buka game 25 kali."]);
p("opens", 100, ["Always Back", "Sentiasa Kembali"], ["Open games 100 times.", "Buka game 100 kali."]);
p("opens", 500, ["Resident", "Penghuni"], ["Open games 500 times.", "Buka game 500 kali."]);
p("seconds", 3600, ["One Hour In", "Sejam Masuk"], ["Play for an hour in total.", "Main selama sejam secara keseluruhan."]);
p("seconds", 18000, ["Five Hours In", "Lima Jam Masuk"], ["Play for five hours in total.", "Main selama lima jam secara keseluruhan."]);
p("seconds", 72000, ["Twenty Hours In", "Dua Puluh Jam Masuk"], ["Play for twenty hours in total.", "Main selama dua puluh jam secara keseluruhan."]);
p("unlocked", 10, ["Collector", "Pengumpul"], ["Earn 10 achievements.", "Peroleh 10 pencapaian."]);
p("unlocked", 25, ["Showcase", "Pameran"], ["Earn 25 achievements.", "Peroleh 25 pencapaian."]);
p("unlocked", 50, ["Trophy Shelf", "Rak Trofi"], ["Earn 50 achievements.", "Peroleh 50 pencapaian."]);
p("tier1", 2, ["Dabbler", "Pencuba"], ["Earn the Rookie score in both campaigns.", "Peroleh skor Baru dalam kedua-dua kempen."]);
p("tier3", 2, ["Well Rounded", "Serba Boleh"], ["Earn the Skilled score in both campaigns.", "Peroleh skor Mahir dalam kedua-dua kempen."]);
p("tier5", 1, ["Master of One", "Guru Satu"], ["Earn the Master score in a campaign.", "Peroleh skor Guru dalam satu kempen."]);
p("tier5", 2, ["Master of Both", "Guru Kedua-duanya"], ["Earn the Master score in both campaigns.", "Peroleh skor Guru dalam kedua-dua kempen."]);
p("tier6", 1, ["Legend", "Lagenda"], ["Earn the Legend score in a campaign.", "Peroleh skor Lagenda dalam satu kempen."]);
p("tier6", 2, ["Double Legend", "Lagenda Berganda"], ["Earn the Legend score in both campaigns.", "Peroleh skor Lagenda dalam kedua-dua kempen."]);
p("streak", 3, ["Three Days Running", "Tiga Hari Berturut"], ["Play on 3 days in a row.", "Main 3 hari berturut-turut."]);
p("streak", 7, ["A Week of Play", "Seminggu Bermain"], ["Play on 7 days in a row.", "Main 7 hari berturut-turut."]);
p("night", 1, ["Night Owl", "Burung Hantu"], ["Play between midnight and 4 am.", "Main antara tengah malam dan 4 pagi."], { secret: true });
p("early", 1, ["Early Bird", "Burung Awal"], ["Play between 5 and 7 am.", "Main antara 5 dan 7 pagi."], { secret: true });
p("session", 1800, ["Marathon", "Maraton"], ["Play one game for 30 minutes without stopping.", "Main satu game selama 30 minit tanpa henti."]);
p("completed", 1, ["Completionist", "Penyempurna"], ["Earn every achievement of one campaign.", "Peroleh setiap pencapaian satu kempen."]);
p("completed", 2, ["Completionist II", "Penyempurna II"], ["Earn every achievement of both campaigns.", "Peroleh setiap pencapaian kedua-dua kempen."]);

/* Space 2's own: its chapters, its new weapons, Halo's cover and a clean chapter. */
list.push(...SPACE2_ACHIEVEMENTS);

export const ACHIEVEMENTS: Ach[] = list;
export const BY_GAME: Record<string, Ach[]> = {};
for (const a of list) (BY_GAME[a.game] ??= []).push(a);
