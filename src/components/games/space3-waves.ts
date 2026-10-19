/* Space 3's waves are written fresh for every flight. Space 1 and 2 give each chapter a fixed script, so a player who
   knows it can fly it from memory. Here a chapter is assembled from a small library of formations, drawn by a
   seeded generator, so two flights of the same chapter meet the same kinds of enemy in a different order, at
   different heights and spacing. Rules: a formation never comes twice running or twice within the last three;
   the pace quickens and the heavier formations only appear later; a supply pod turns up now and then.
   Same seed, same chapter: tests and bug reports can replay one flight. */
import { Script, type Plan } from "./space2-plans.ts";

type Rng = () => number;

export function rngFrom(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const span = (r: Rng, lo: number, hi: number) => lo + r() * (hi - lo);
const pick = (r: Rng, lo: number, hi: number) => Math.floor(span(r, lo, hi + 1));

/* The field only limits a formation to some engine chapters (17 is the first of Space 3). */
type Formation = { id: string; from: number; only?: number[]; place: (c: Script, t: number, r: Rng) => void };

/* `from` is the earliest frame the formation may appear. */
const FORMATIONS: Formation[] = [
  { id: "scoutVee", from: 0, place: (c, t, r) => c.vee(t, "scout", span(r, 50, 160), pick(r, 3, 5), pick(r, 14, 22)) },
  { id: "droneLine", from: 0, place: (c, t, r) => c.line(t, "drone", span(r, 30, 170), pick(r, 4, 7), pick(r, 14, 24), span(r, -14, 14)) },
  { id: "seekerPair", from: 0, place: (c, t, r) => { c.add(t, "seeker", span(r, 30, 80)); c.add(t + pick(r, 20, 50), "seeker", span(r, 130, 180)); } },
  { id: "diverTrio", from: 150, place: (c, t, r) => c.line(t, "diver", span(r, 30, 90), 3, pick(r, 24, 36), span(r, 24, 44)) },
  { id: "orbiter", from: 300, place: (c, t, r) => c.add(t, "orbiter", span(r, 50, 160)) },
  { id: "gunnerPair", from: 200, place: (c, t, r) => { c.add(t, "gunner", span(r, 40, 90)); c.add(t + pick(r, 30, 80), "gunner", span(r, 120, 170)); } },
  { id: "sniperCross", from: 600, place: (c, t, r) => { c.add(t, "sniper", span(r, 30, 70)); c.add(t + pick(r, 0, 30), "sniper", span(r, 140, 180)); } },
  { id: "swarm", from: 400, place: (c, t, r) => c.swarm(t, span(r, 40, 170), pick(r, 6, 9)) },
  { id: "cometRain", from: 500, place: (c, t, r) => { for (let i = 0; i < pick(r, 3, 5); i++) c.add(t + i * pick(r, 18, 40), "comet", span(r, 25, 190)); } },
  { id: "mineColumn", from: 700, place: (c, t, r) => c.line(t, "mine", span(r, 40, 90), 3, pick(r, 18, 30), span(r, 30, 50)) },
  { id: "fighterVee", from: 1500, place: (c, t, r) => c.vee(t, "fighter", span(r, 70, 140), 3, pick(r, 16, 24)) },
  { id: "armorEscort", from: 1700, place: (c, t, r) => { const y = span(r, 70, 140); c.add(t, "armor", y); c.add(t + 40, "scout", y - 30); c.add(t + 40, "scout", y + 30); } },
  /* The belts: rock, bombers and shards. */
  { id: "rockField", from: 0, only: [18], place: (c, t, r) => { for (let i = 0; i < pick(r, 5, 8); i++) c.add(t + i * pick(r, 16, 34), i % 3 === 0 ? "rock" : "smallrock", span(r, 25, 190)); } },
  { id: "bomberRun", from: 150, only: [18], place: (c, t, r) => c.line(t, "bomber", span(r, 40, 90), pick(r, 2, 3), pick(r, 50, 90), span(r, 30, 60)) },
  { id: "shardStorm", from: 300, only: [18], place: (c, t, r) => { for (let i = 0; i < pick(r, 5, 9); i++) c.add(t + i * pick(r, 10, 20), "shard", span(r, 25, 190), i % 2); } },
  { id: "splitterPair", from: 500, only: [18], place: (c, t, r) => { c.add(t, "splitter", span(r, 40, 90)); c.add(t + pick(r, 40, 90), "splitter", span(r, 120, 170)); } },
  /* Europa: ice, cryo mines and snipers on the ridges. */
  { id: "iceDrift", from: 0, only: [19], place: (c, t, r) => { for (let i = 0; i < pick(r, 4, 7); i++) c.add(t + i * pick(r, 12, 26), "comet", span(r, 25, 190)); } },
  { id: "cryoMines", from: 150, only: [19], place: (c, t, r) => c.line(t, "mine", span(r, 40, 120), pick(r, 3, 5), pick(r, 16, 26), span(r, -20, 40)) },
  { id: "ridgeSnipers", from: 400, only: [19], place: (c, t, r) => { c.add(t, "sniper", span(r, 25, 60)); c.add(t + pick(r, 20, 60), "sniper", span(r, 100, 120)); c.add(t + pick(r, 60, 100), "sniper", span(r, 160, 190)); } },
  { id: "wyrmSpawn", from: 600, only: [19], place: (c, t, r) => c.line(t, "drone", span(r, 30, 160), pick(r, 6, 9), pick(r, 8, 14), span(r, -8, 8)) },
  /* The Kharn wreck field: hulks, mines and the Vanguard's recovery drones. */
  { id: "wreckRun", from: 0, only: [20], place: (c, t, r) => { for (let i = 0; i < pick(r, 6, 9); i++) c.add(t + i * pick(r, 14, 28), i % 4 === 0 ? "rock" : "smallrock", span(r, 25, 190)); } },
  { id: "minePatch", from: 150, only: [20], place: (c, t, r) => { for (let i = 0; i < pick(r, 4, 7); i++) c.add(t + pick(r, 0, 60), "mine", span(r, 25, 190)); } },
  { id: "recoveryDrones", from: 300, only: [20], place: (c, t, r) => { c.line(t, "drone", span(r, 30, 160), pick(r, 5, 8), pick(r, 10, 16), span(r, -10, 10)); c.add(t + 30, "seeker", span(r, 40, 180)); } },
  { id: "krollFighters", from: 800, only: [20], place: (c, t, r) => c.vee(t, "fighter", span(r, 70, 140), 3, pick(r, 16, 24)) },
  /* Uranus: magnets that drag the ship, lancers with hyper beams, ion fighters. */
  { id: "magnetField", from: 0, only: [21, 28], place: (c, t, r) => { for (let i = 0; i < pick(r, 2, 4); i++) c.add(t + i * pick(r, 30, 60), "magnet", span(r, 30, 180)); c.vee(t + 40, "scout", span(r, 60, 150), 3, 18); } },
  { id: "lancerPair", from: 150, only: [21, 24, 26, 27, 28], place: (c, t, r) => { c.add(t, "lancer", span(r, 30, 90)); c.add(t + pick(r, 30, 70), "lancer", span(r, 120, 186)); } },
  { id: "ionFighters", from: 300, only: [21, 24], place: (c, t, r) => c.vee(t, "fighter", span(r, 60, 150), pick(r, 3, 5), pick(r, 14, 22)) },
  /* Triton: frost frigates over the crater floor, drones in the geysers' lee. */
  { id: "frigateEscort", from: 0, only: [22, 23, 27, 28], place: (c, t, r) => { const y = span(r, 50, 150); c.add(t, "frigate", y); c.line(t + 30, "drone", y - 30, 4, 12, 20); } },
  { id: "ventDrones", from: 150, only: [22], place: (c, t, r) => c.line(t, "drone", span(r, 30, 120), pick(r, 6, 9), pick(r, 8, 14), span(r, -6, 12)) },
  /* Kuiper: carriers that launch drones, ice rock, snipers on the floes. */
  { id: "hangarDeck", from: 200, only: [23, 27, 28], place: (c, t, r) => { c.add(t, "hangar", span(r, 50, 160)); c.add(t + 60, "seeker", span(r, 30, 180)); } },
  { id: "iceRocks", from: 0, only: [23], place: (c, t, r) => { for (let i = 0; i < pick(r, 4, 7); i++) c.add(t + i * pick(r, 14, 30), i % 3 ? "smallrock" : "rock", span(r, 25, 190)); } },
  /* Heliopause: lancer walls in the solar wind. */
  { id: "lancerWall", from: 400, only: [24, 26], place: (c, t, r) => { for (let i = 0; i < 3; i++) c.add(t + i * pick(r, 20, 40), "lancer", 40 + i * 60 + span(r, -10, 10)); } },
  /* Oort: shades hunting in the dark, mines between the comets. */
  { id: "shadePack", from: 0, only: [25, 28], place: (c, t, r) => { for (let i = 0; i < pick(r, 4, 6); i++) c.add(t + i * pick(r, 14, 26), "shade", span(r, 30, 180)); } },
  { id: "darkMines", from: 150, only: [25], place: (c, t, r) => { for (let i = 0; i < pick(r, 4, 7); i++) c.add(t + pick(r, 0, 70), "mine", span(r, 25, 190)); } },
  /* The megastructure and the flagship: everything they have. */
  { id: "trenchDrones", from: 0, only: [26, 27], place: (c, t, r) => c.line(t, "drone", span(r, 50, 160), pick(r, 6, 9), pick(r, 10, 14), span(r, -4, 4)) },
  { id: "deckGuns", from: 300, only: [27, 28], place: (c, t, r) => { const y = span(r, 70, 140); c.add(t, "armor", y); c.add(t + 30, "lancer", y - 50); c.add(t + 30, "lancer", y + 50); } },
  { id: "cruiser", from: 2300, place: (c, t, r) => c.add(t, "cruiser", span(r, 80, 140)) },
];

/* Frames of script a chapter has before its boss. */
export const WAVE_LENGTH = 3000;

export type Wave = { plan: Plan[]; order: string[] };

export function generateWaves(seed: number, options: { chapter?: number; length?: number } = {}): Wave {
  const { chapter = 17, length = WAVE_LENGTH } = options;
  const r = rngFrom(seed ^ 0x5bd1e995);
  const c = new Script();
  const order: string[] = [];
  let t = 120;
  while (t < length) {
    const open = FORMATIONS.filter((f) => f.from <= t && (!f.only || f.only.includes(chapter)) && !order.slice(-3).includes(f.id));
    const f = open[Math.floor(r() * open.length)];
    f.place(c, t, r);
    order.push(f.id);
    if (r() < 0.2) c.add(t + pick(r, 80, 160), "pod", span(r, 60, 160));
    /* Quicker as the chapter goes on, never on a beat. */
    const pace = 1 - (t / length) * 0.4;
    t += Math.round(span(r, 150, 300) * pace);
  }
  /* Chapters 5 to 12 put a mini boss across the way a little past halfway. */
  if (chapter >= 21 && chapter <= 28) c.add(Math.round(length * 0.55), `mini${chapter}` as Parameters<Script["add"]>[1], 90);
  return { plan: c.done(), order };
}
