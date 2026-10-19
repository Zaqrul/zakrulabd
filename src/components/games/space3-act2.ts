/* Space 3, chapters 5 to 12 (engine chapters 21 to 28): the outer system and the gate (docs/space3-story-notes.md, Acts 2 and 3).
   Everything a chapter is made of, as data: its name, its boss and mini boss and how they fight, the bosses built of several bodies
   that must be broken one by one before the true form, the floating land that drifts through the field, the field's own weather,
   and the disasters that fall on the ship. The engine (space-logic.ts) plays it; the art is in space3-act2-art.ts until the designer
   replaces it (docs/space3-codex-prompt-act2-act3.md). No engine imports here, only types. */
import type { BossKit } from "./space3-boss";
import type { Verb } from "./space3-director";

export type Act2Chapter = 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28;
export const ACT2_CHAPTERS: Act2Chapter[] = [21, 22, 23, 24, 25, 26, 27, 28];
export const isAct2 = (chapter: number): chapter is Act2Chapter => chapter >= 21 && chapter <= 28;

/* The weather of each field. magnetic: homing fire spins loose; frost: the cold near the ground slows the ship; drift: ice floats
   through; wind: the solar wind pushes the ship back; dark: only what is lit can be seen; trench: walls above and below; hull: the
   flagship's own plating; gravity: the gate bends every shot toward the middle. */
export type FieldKind = "magnetic" | "frost" | "drift" | "wind" | "dark" | "trench" | "hull" | "gravity";
/* What falls on the ship: lightning, geysers out of the ground, comets, a solar flare sweeping across, a mine burst, a laser grid,
   and a gravity surge that drags the ship. */
export type EventKind = "lightning" | "geyser" | "comets" | "flare" | "mines" | "lasergrid" | "surge";
export type LandKind = "rock" | "ice" | "hull" | "crystal";

export type ChapterInfo = {
  name: string; boss: string; mini: string; field: FieldKind; events: EventKind[];
  /* The lands the field throws in (null: none). */
  lands: "floor" | "islands" | "walls" | "plates" | "shards" | "chunks" | null;
};

export const ACT2: Record<Act2Chapter, ChapterInfo> = {
  21: { name: "Uranian Magnetic Shear", boss: "Tempest Raider", mini: "Static Warden", field: "magnetic", events: ["lightning", "lightning", "surge"], lands: null },
  22: { name: "Triton Geysers", boss: "Cryo-Colossus", mini: "Vent Crawler", field: "frost", events: ["geyser", "geyser", "comets"], lands: "floor" },
  23: { name: "The Kuiper Graveyard", boss: "Iron Goliath", mini: "Ore Hauler", field: "drift", events: ["comets", "comets", "mines"], lands: "islands" },
  24: { name: "The Heliopause Threshold", boss: "Aegis-Null", mini: "Picket Sentinel", field: "wind", events: ["flare", "flare", "lightning"], lands: "shards" },
  25: { name: "The Oort Cloud Abyss", boss: "Void Stalker", mini: "Lantern Layer", field: "dark", events: ["mines", "comets", "mines"], lands: "chunks" },
  26: { name: "Derelict Megastructure", boss: "Ring Keeper", mini: "Trench Gate", field: "trench", events: ["lasergrid", "lasergrid", "flare"], lands: "walls" },
  27: { name: "Flagship Breach: The Aethelgard", boss: "The Warmaster", mini: "Deck Marshal", field: "hull", events: ["lightning", "lasergrid", "flare"], lands: "plates" },
  28: { name: "The Hypergate Horizon", boss: "The Herald", mini: "Gate Warden", field: "gravity", events: ["surge", "lightning", "comets", "surge"], lands: "shards" },
};

/* ---------- the bosses ---------- */

/* Size, health of the core, score, seconds a good run takes. */
export const ACT2_BOSS: Record<`boss${Act2Chapter}`, { w: number; h: number; hp: number; score: number; par: number }> = {
  boss21: { w: 90, h: 40, hp: 1100, score: 15000, par: 100 },
  boss22: { w: 120, h: 80, hp: 1000, score: 17000, par: 120 },
  boss23: { w: 150, h: 70, hp: 1100, score: 20000, par: 140 },
  boss24: { w: 72, h: 72, hp: 1200, score: 22000, par: 130 },
  boss25: { w: 80, h: 34, hp: 1700, score: 24000, par: 130 },
  boss26: { w: 108, h: 108, hp: 1500, score: 26000, par: 150 },
  boss27: { w: 160, h: 118, hp: 1800, score: 30000, par: 180 },
  boss28: { w: 100, h: 100, hp: 2600, score: 50000, par: 240 },
};
export const ACT2_MINI: Record<`mini${Act2Chapter}`, { w: number; h: number; hp: number; score: number }> = {
  mini21: { w: 52, h: 30, hp: 260, score: 1800 },
  mini22: { w: 60, h: 36, hp: 300, score: 1900 },
  mini23: { w: 70, h: 36, hp: 330, score: 2000 },
  mini24: { w: 48, h: 48, hp: 340, score: 2100 },
  mini25: { w: 52, h: 28, hp: 360, score: 2200 },
  mini26: { w: 56, h: 56, hp: 380, score: 2300 },
  mini27: { w: 72, h: 40, hp: 420, score: 2500 },
  mini28: { w: 60, h: 60, hp: 460, score: 2800 },
};

const CUTS = [0.66, 0.33];
const kit = (unlocked: Verb[][], speed: number, signature: Verb[], ultimate: Verb): BossKit => ({ cuts: CUTS, unlocked, speed, signature, ultimate, ultimateAt: [0.25, 0.1] });

/* How each boss fights. Every one has its own signature for each phase and its own ultimate, and leans on the heavy weapons. */
export const ACT2_KITS: Record<string, BossKit> = {
  /* Tempest Raider: a supersonic interceptor. Ion fans, rams and beams. */
  boss21: kit([
    ["ionfan", "lance", "plasma3", "dash", "sweep"],
    ["ionfan", "lance", "plasma3", "dash", "dash3", "ring", "hyper", "blink", "blades"],
    ["ionfan", "plasma3", "dash3", "hyper", "blink", "blades", "bombs", "ring", "gravity", "flame"],
  ], 1.9, ["ionfan", "dash3", "hyper"], "disaster"),
  /* Cryo-Colossus: a walking frost bomber. Shells that freeze, rock torn from Triton, and a pull. */
  boss22: kit([
    ["frostshell", "shards", "debris", "chain", "terrain"],
    ["frostshell", "shards", "terrain", "flame", "chain", "bombs", "quake"],
    ["frostshell", "terrain", "gravity", "bombs", "flame", "snap", "dash", "disaster"],
  ], 0.8, ["frostshell", "terrain", "gravity"], "bombs"),
  /* Iron Goliath: a carrier. Its hangars launch drones until they are broken; then the salvoes. */
  boss23: kit([
    ["launch", "lance", "pinch", "debris"],
    ["launch", "salvo", "broadside", "pinch", "blast", "minefield", "terrain"],
    ["salvo", "broadside", "minefield", "bombs", "charge", "dash3", "terrain", "hyper"],
  ], 0.7, ["launch", "broadside", "salvo"], "disaster"),
  /* Aegis-Null: a sentinel behind mirrors. Rings, lattices, beams, a pull. */
  boss24: kit([
    ["ring", "lattice", "scan", "lance"],
    ["ring", "lattice", "scan", "hyper", "pincer", "blink", "bombs"],
    ["ring", "lattice", "hyper", "coil", "blink", "bombs", "gravity", "plasma3"],
  ], 1.1, ["ring", "lattice", "hyper"], "gravity"),
  /* Void Stalker: a hunter in the dark. It strikes from behind and blinks round the ship. */
  boss25: kit([
    ["ambush", "fang", "plasma3", "blink"],
    ["ambush", "fang", "blink", "blades", "dash", "shards"],
    ["ambush", "blink", "dash3", "fang", "blades", "bombs", "flame", "disaster"],
  ], 2.0, ["ambush", "blink", "fang"], "dash3"),
  /* Ring Keeper: the megastructure's guardian. Laser nodes, grids, coils. */
  boss26: kit([
    ["hyper", "lance", "sweep", "chain", "drill"],
    ["hyper", "lattice", "coil", "drill", "scan", "blink", "bombs"],
    ["hyper", "coil", "scan", "lattice", "gravity", "dash3", "bombs", "terrain"],
  ], 1.0, ["hyper", "coil", "scan"], "disaster"),
  /* The Warmaster: the flagship's war engine. Every gun it has. */
  boss27: kit([
    ["hyper", "salvo", "blast", "plasma3", "broadside"],
    ["hyper", "salvo", "broadside", "bombs", "charge", "flame", "launch", "terrain"],
    ["hyper", "bombs", "broadside", "minefield", "flame", "dash3", "gravity", "launch", "disaster"],
  ], 0.6, ["hyper", "bombs", "broadside"], "disaster"),
  /* The Herald: the gate's guardian. Blades and slanting beams, then the singularity, then everything. */
  boss28: kit([
    ["blades", "plasma3", "lance", "blink", "hyper", "dash"],
    ["blades", "gravity", "ring", "snap", "hyper", "blink", "bombs", "dash3"],
    ["blades", "blink", "gravity", "dash3", "bombs", "hyper", "disaster", "terrain", "ionfan", "ambush"],
  ], 1.6, ["blades", "gravity", "blink"], "disaster"),
};

/* The mini bosses: two phases, a signature that opens the fight, no ultimate. */
const miniKit = (a: Verb[], b: Verb[], speed: number): BossKit => ({ cuts: [0.5], unlocked: [a, b], speed, signature: [a[0], b[0]], ultimate: b[0], ultimateAt: [] });
export const ACT2_MINI_KITS: Record<string, BossKit> = {
  mini21: miniKit(["ionfan", "lance", "dash"], ["hyper", "ionfan", "dash", "ring"], 1.4),
  mini22: miniKit(["frostshell", "debris", "shards"], ["terrain", "frostshell", "flame"], 0.9),
  mini23: miniKit(["launch", "pinch", "debris"], ["bombs", "launch", "salvo"], 0.8),
  mini24: miniKit(["ring", "scan", "lance"], ["hyper", "ring", "lattice"], 1.1),
  mini25: miniKit(["ambush", "fang", "minefield"], ["blink", "ambush", "blades"], 1.8),
  mini26: miniKit(["hyper", "drill", "chain"], ["lattice", "hyper", "coil"], 1.0),
  mini27: miniKit(["salvo", "broadside", "plasma3"], ["bombs", "hyper", "flame"], 0.8),
  mini28: miniKit(["blades", "plasma3", "blink"], ["gravity", "blades", "dash3"], 1.4),
};

/* ---------- bosses of several bodies ---------- */

/* A part of a boss that must be broken first: where it sits on the boss (from its top left), its size and health, and the attack
   it adds to the boss's while it stands. While any part of the current stage stands, the core cannot be hurt. When a stage falls the
   next one comes out; when the last falls, the true form fights. */
export type ModKind = "leg" | "tank" | "pod" | "mirror" | "node" | "shield" | "battery" | "engine" | "blade" | "ring";
export type ModSpec = { kind: ModKind; ox: number; oy: number; w: number; h: number; hp: number; verb?: Verb };
export type Stage = { mods: ModSpec[] };
export type Mod = ModSpec & { id: number; maxHp: number; flash: number };

export const ACT2_STAGES: Partial<Record<string, Stage[]>> = {
  boss22: [{ mods: [
    { kind: "leg", ox: 8, oy: 66, w: 26, h: 24, hp: 200 }, { kind: "leg", ox: 86, oy: 66, w: 26, h: 24, hp: 200 },
    { kind: "tank", ox: 40, oy: -12, w: 40, h: 16, hp: 220, verb: "frostshell" },
  ] }],
  boss23: [{ mods: [
    { kind: "pod", ox: 0, oy: -10, w: 28, h: 18, hp: 160, verb: "launch" }, { kind: "pod", ox: 0, oy: 62, w: 28, h: 18, hp: 160, verb: "launch" },
    { kind: "pod", ox: 46, oy: -12, w: 28, h: 18, hp: 160, verb: "launch" }, { kind: "pod", ox: 46, oy: 64, w: 28, h: 18, hp: 160, verb: "launch" },
  ] }],
  boss24: [{ mods: [
    { kind: "mirror", ox: -18, oy: -6, w: 14, h: 24, hp: 220, verb: "ring" }, { kind: "mirror", ox: -22, oy: 24, w: 14, h: 24, hp: 220, verb: "ring" },
    { kind: "mirror", ox: -18, oy: 54, w: 14, h: 24, hp: 220, verb: "ring" },
  ] }],
  boss26: [{ mods: [
    { kind: "node", ox: -10, oy: -10, w: 24, h: 24, hp: 230, verb: "hyper" }, { kind: "node", ox: 94, oy: -10, w: 24, h: 24, hp: 230, verb: "hyper" },
    { kind: "node", ox: -10, oy: 94, w: 24, h: 24, hp: 230, verb: "hyper" }, { kind: "node", ox: 94, oy: 94, w: 24, h: 24, hp: 230, verb: "hyper" },
  ] }],
  boss27: [{ mods: [
    { kind: "shield", ox: 58, oy: -14, w: 44, h: 16, hp: 320, verb: "ring" },
    { kind: "battery", ox: -10, oy: 16, w: 30, h: 26, hp: 280, verb: "hyper" }, { kind: "battery", ox: -10, oy: 76, w: 30, h: 26, hp: 280, verb: "hyper" },
    { kind: "engine", ox: 150, oy: 44, w: 24, h: 30, hp: 340, verb: "bombs" },
  ] }],
  boss28: [
    { mods: [{ kind: "blade", ox: -24, oy: 4, w: 18, h: 44, hp: 360, verb: "blades" }, { kind: "blade", ox: -24, oy: 52, w: 18, h: 44, hp: 360, verb: "blades" }] },
    { mods: [{ kind: "ring", ox: -18, oy: 8, w: 16, h: 84, hp: 700, verb: "gravity" }] },
  ],
};

/* ---------- lands and disasters ---------- */

export type LandSpec = { t: number; kind: LandKind; y: number; w: number; h: number; vx: number };
export type EventSpec = { t: number; kind: EventKind };

type Rng = () => number;
const rng = (seed: number): Rng => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const span = (r: Rng, lo: number, hi: number) => lo + r() * (hi - lo);

/* The floating land of a chapter, in the order it comes in. */
export function landPlan(seed: number, chapter: number, length = 3600): LandSpec[] {
  if (!isAct2(chapter)) return [];
  const style = ACT2[chapter].lands, r = rng(seed ^ 0x2c1b3c6d), out: LandSpec[] = [];
  if (!style) return out;
  for (let t = 200; t < length;) {
    switch (style) {
      case "floor": {
        const h = span(r, 14, 40), w = span(r, 60, 120);
        out.push({ t, kind: "ice", y: 216 - h, w, h, vx: -0.9 });
        t += Math.round(w / 0.9) - 6;
        break;
      }
      case "islands":
        out.push({ t, kind: "ice", y: span(r, 30, 170), w: span(r, 36, 90), h: span(r, 16, 34), vx: -span(r, 0.5, 0.9) });
        t += Math.round(span(r, 90, 170));
        break;
      case "walls": {
        const gap = span(r, 70, 110), mid = span(r, 70, 146), w = span(r, 60, 90);
        out.push({ t, kind: "hull", y: 0, w, h: Math.max(10, mid - gap / 2), vx: -1 });
        out.push({ t, kind: "hull", y: mid + gap / 2, w, h: Math.max(10, 216 - (mid + gap / 2)), vx: -1 });
        t += Math.round(w) + Math.round(span(r, 30, 120));
        break;
      }
      case "plates":
        out.push({ t, kind: "hull", y: span(r, 24, 180), w: span(r, 50, 96), h: span(r, 12, 22), vx: -span(r, 0.6, 1.1) });
        t += Math.round(span(r, 80, 150));
        break;
      case "shards":
        out.push({ t, kind: "crystal", y: span(r, 24, 176), w: span(r, 18, 34), h: span(r, 28, 50), vx: -span(r, 0.8, 1.3) });
        t += Math.round(span(r, 120, 220));
        break;
      case "chunks":
        out.push({ t, kind: "rock", y: span(r, 24, 180), w: span(r, 24, 50), h: span(r, 20, 40), vx: -span(r, 0.4, 0.8) });
        t += Math.round(span(r, 140, 240));
        break;
    }
  }
  return out;
}

/* The disasters of a chapter: one every seven to eleven seconds, from the chapter's own list, and the boss calls its own. */
export function eventPlan(seed: number, chapter: number, length = 3000): EventSpec[] {
  if (!isAct2(chapter)) return [];
  const list = ACT2[chapter].events, r = rng(seed ^ 0x7f4a7c15), out: EventSpec[] = [];
  for (let t = Math.round(span(r, 420, 600)); t < length; t += Math.round(span(r, 420, 660))) out.push({ t, kind: list[Math.floor(r() * list.length)] });
  return out;
}

/* ---------- the new enemies ---------- */

/* lancer: stops, glows and fires a hyper beam down its lane. magnet: drags the ship toward it. frigate: frost shells that burst into
   ice. hangar: launches drones. shade: a hunter that is hard to see, weaving and firing. */
export const ACT2_ENEMIES = { lancer: [24, 14, 7], magnet: [18, 18, 6], frigate: [42, 22, 16], hangar: [38, 26, 18], shade: [14, 10, 4] } as const;
export const ACT2_ENEMY_SCORE = { lancer: 70, magnet: 50, frigate: 110, hangar: 120, shade: 40 } as const;
export type Act2Enemy = keyof typeof ACT2_ENEMIES;
