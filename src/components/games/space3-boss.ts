/* Ghost Corvet, Space 3's first boss: a cloaked scout that copies what it sees. What it does is not scripted here.
   Its attacks are drawn one at a time by the director (space3-director.ts), which never plays the same fight twice
   and aims at the ship's habits. This file holds the boss's own numbers and how its state reads for the drawing.

   Phases are cut at two thirds and one third of its health, and each unlocks more kinds of attack:
     0 lance, sweep, pinch      1 adds ring and echo (the ship's own shots fired back)      2 adds lattice

   It cloaks for the last part of every five seconds; the art dims it then. Nothing here is final art or tuning. */
import { VERBS, type Verb } from "./space3-director.ts";
import { BARRIER } from "./space3-resonance.ts";

export const CORVET = { w: 98, h: 48, hp: 400, score: 7000, cuts: [0.66, 0.33], par: 60, cloakEvery: 300, cloakFor: 100 };

/* Excavator-X, the second boss: a mining rig turned gun platform. Slow and big; its attacks lean on the drill and on rock blasted out of the rig. */
export const EXCAVATOR = { w: 126, h: 72, hp: 700, score: 9000, cuts: [0.66, 0.33], par: 70 };

/* What a Space 3 boss draws from: where its phases cut, which attacks each phase may use, how fast it drifts. */
/* Abyssal Wyrm, the third boss: a modular machine kilometres long, coiling out of the ice. Long and quick. */
export const WYRM = { w: 156, h: 64, hp: 900, score: 11000, cuts: [0.66, 0.33], par: 80 };

/* Applied at the Space 3 boss spawn points, including replay and charge fragments.
   Painters consume the same radius; earlier campaigns and regular foes keep theirs. */
export const BOSS_SHOT_SCALE = 1.15;

/* Keep small rounds reflectable: size must not silently change their class. */
export function bossShotRadius(radius: number): number {
  const scaled = radius * BOSS_SHOT_SCALE;
  return radius <= BARRIER.maxShot ? Math.min(BARRIER.maxShot, scaled) : scaled;
}

/* `signature` is the unique attack each phase opens with; `ultimate` is forced when its health first falls to each share of `ultimateAt`. */
/* Armada Reclaimer, the fourth boss: a fortress of Kroll's wrecked fleet that gathers old ordnance and fires it again. */
export const RECLAIMER = { w: 84, h: 60, hp: 1000, score: 13000, cuts: [0.66, 0.33], par: 90 };

export type BossKit = { cuts: number[]; unlocked: Verb[][]; speed: number; signature: Verb[]; ultimate: Verb; ultimateAt: number[] };
export type ThirdBoss = "boss17" | "boss18" | "boss19" | "boss20";
export const THIRD_BOSSES: Record<ThirdBoss, BossKit> = {
  boss17: {
    cuts: CORVET.cuts,
    unlocked: [
      ["lance", "sweep", "pinch", "scan", "plasma3"],
      ["lance", "sweep", "pinch", "scan", "ring", "echo", "playback", "plasma3", "blast", "blades"],
      ["lance", "sweep", "pinch", "scan", "ring", "echo", "playback", "lattice", "pincer", "plasma3", "blast", "blades", "flame", "dash"],
    ],
    speed: 1.2, signature: ["scan", "playback", "pincer"], ultimate: "recall", ultimateAt: [0.25, 0.1],
  },
  boss18: {
    cuts: EXCAVATOR.cuts,
    unlocked: [
      ["drill", "debris", "sweep", "train", "blast"],
      ["drill", "debris", "sweep", "train", "lance", "pinch", "charge", "blast", "plasma3", "dash"],
      ["drill", "debris", "sweep", "train", "lance", "pinch", "charge", "lattice", "ring", "quake", "blast", "plasma3", "dash", "flame", "blades"],
    ],
    speed: 0.8, signature: ["train", "charge", "quake"], ultimate: "breach", ultimateAt: [0.25, 0.1],
  },
  boss19: {
    cuts: WYRM.cuts,
    unlocked: [
      ["shards", "sweep", "lance", "fang", "flame"],
      ["shards", "sweep", "lance", "fang", "chain", "pinch", "snap", "flame", "blades", "plasma3"],
      ["shards", "sweep", "lance", "fang", "chain", "pinch", "snap", "ring", "lattice", "echo", "coil", "flame", "blades", "plasma3", "dash", "blast"],
    ],
    speed: 1.7, signature: ["fang", "snap", "coil"], ultimate: "surge", ultimateAt: [0.25, 0.1],
  },
  boss20: {
    cuts: RECLAIMER.cuts,
    unlocked: [
      ["lance", "sweep", "pinch", "salvo", "plasma3", "blades"],
      ["lance", "sweep", "pinch", "salvo", "debris", "minefield", "plasma3", "blades", "blast", "dash"],
      ["lance", "sweep", "pinch", "salvo", "debris", "minefield", "lattice", "ring", "broadside", "plasma3", "blades", "blast", "dash", "flame"],
    ],
    speed: 0.9, signature: ["salvo", "minefield", "broadside"], ultimate: "armada", ultimateAt: [0.25, 0.1],
  },
};

export type CorvetShot = { x: number; y: number; vx: number; vy: number; r: number; kind: "pulse" | "orb" | "needle" | "scrap" | "ice" | "fire" | "crescent" | "frost";
  /* Frames a shot lasts (the flamethrower's fire is short), and the height at which a blade turns round and comes back. */
  life?: number; back?: number;
  /* A shot that bursts into a ring after `fuse` frames (the Excavator's heavy charges). */
  hold?: number; hvx?: number; hvy?: number;
  fuse?: number; split?: number; splitKind?: "scrap" | "ice" | "needle" | "orb" | "pulse"; splitAngle?: number;
};

export const corvetCloaked = (t: number) => t % CORVET.cloakEvery >= CORVET.cloakEvery - CORVET.cloakFor;

/* What the boss is winding up, read from the fields the engine keeps on it (`c` the kind, `d` the wind-up as a
   percentage, `n` the height it is aimed at; `c` is 0 between attacks), so the art can show a tell that
   matches the attack that is really coming. */
export function corvetTell(e: { c: number; d: number; n: number }): { verb: Verb | null; charge: number; lane: number; aimed: boolean; ring: boolean } {
  const verb = e.c > 0 ? VERBS[e.c - 1] ?? null : null;
  return {
    verb,
    charge: verb ? Math.max(0, Math.min(1, e.d / 100)) : 0,
    lane: e.n,
    aimed: verb === "lance" || verb === "pinch" || verb === "fang" || verb === "snap" || verb === "charge" || verb === "salvo" || verb === "plasma3" || verb === "blast" || verb === "blades" || verb === "flame" || verb === "dash",
    ring: verb === "minefield" || verb === "broadside" || verb === "armada" || verb === "ring" || verb === "lattice" || verb === "sweep" || verb === "scan" || verb === "quake" || verb === "breach" || verb === "recall" || verb === "surge" || verb === "coil",
  };
}

/* Every Space 3 boss also carries the heavy weapons (space3-havoc.ts): in its second phase it blinks, bombs and throws rock, and in its
   third it also rams three times, drags the ship in and calls down a storm. */
for (const kit of Object.values(THIRD_BOSSES)) {
  kit.unlocked[1].push("blink", "bombs", "terrain");
  kit.unlocked[2].push("blink", "bombs", "terrain", "dash3", "gravity", "disaster");
}
