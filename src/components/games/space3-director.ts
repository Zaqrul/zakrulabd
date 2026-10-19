/* Space 3's attack director: a boss that never plays the same fight twice. Where Space 1 and 2 give a boss a
   list of attacks it works through in order, a director draws each next attack from a few kinds, with numbers
   drawn fresh every time, and it watches the ship while it does. Three rules hold:

     - the same kind never comes twice running, and a kind used lately is less likely;
     - the numbers (where, how many, how fast, how wide) are redrawn until the whole attack is one that has
       not been seen in the last eight;
     - it learns where the ship likes to stay. A lance aims at that lane, and a wall leaves its gap far from it,
       so a player who hides in one place is hunted and one who keeps moving is not.

   Pure functions with no link to the engine: space-logic holds one Director per boss and fires what
   `attackShots` returns. Nothing here is final tuning. */
import type { CorvetShot } from "./space3-boss";
import { drawSignature, signatureShots, type SigContext } from "./space3-signature.ts";
import { armsShots, drawArms } from "./space3-arms.ts";
import { drawHavoc, havocShots } from "./space3-havoc.ts";

const W = 384, H = 216;

/* There is no up or down in space, so nothing here falls: every shot flies in from the boss or in from the right.
   "pinch" is wreckage hurled from the two flanks of the hull, converging on the ship; "sweep" is a field of wreck
   drifting in with a gap in it; "drill" and "debris" are the mine's, a fast thick stream down the lane the ship lives
   in and a blast of rock thrown out of the rig. */
/* "shards" and "chain" are the Wyrm's: ice thrown from several points along a long body, and two streams that cross. */
/* Each boss also has a signature attack for every phase and an ultimate (space3-signature.ts); those are the last twelve. */
export type Verb =
  | "lance" | "sweep" | "ring" | "pinch" | "lattice" | "echo" | "drill" | "debris" | "shards" | "chain"
  | "scan" | "playback" | "pincer" | "recall" | "train" | "charge" | "quake" | "breach" | "fang" | "snap" | "coil" | "surge"
  | "salvo" | "minefield" | "broadside" | "armada"
  | "dash" | "plasma3" | "blast" | "flame" | "blades"
  | "dash3" | "bombs" | "blink" | "gravity" | "terrain" | "disaster"
  | "ionfan" | "frostshell" | "ambush" | "hyper" | "launch";
export const VERBS: Verb[] = [
  "lance", "sweep", "ring", "pinch", "lattice", "echo", "drill", "debris", "shards", "chain",
  "scan", "playback", "pincer", "recall", "train", "charge", "quake", "breach", "fang", "snap", "coil", "surge",
  "salvo", "minefield", "broadside", "armada",
  "dash", "plasma3", "blast", "flame", "blades",
  "dash3", "bombs", "blink", "gravity", "terrain", "disaster",
  "ionfan", "frostshell", "ambush", "hyper", "launch",
];

/* Which kinds a boss may use in each phase; each boss has its own table (this is Ghost Corvet's). */
export const UNLOCKED: Verb[][] = [
  ["lance", "sweep", "pinch"],
  ["lance", "sweep", "pinch", "ring", "echo"],
  ["lance", "sweep", "pinch", "ring", "echo", "lattice"],
];

export type Attack = {
  verb: Verb;
  sig: string;
  /* Frames of warning before the first shot, and frames the attack stays active after it. */
  warn: number;
  live: number;
  /* A height: the lance's target, the centre of a wall's gap, the lattice's first safe row. */
  lane: number;
  count: number;
  speed: number;
  spin: number;
  gap: number;
  extra: number;
  /* The ship's recent path (oldest first) for the attacks that play it back, and the way it was moving for the one that leads it. */
  path?: { x: number; y: number }[];
  lead?: { vx: number; vy: number };
};

export type Director = { seed: number; recent: string[]; kinds: Verb[]; heat: number[]; last: Verb | null; made: number };

export const HEAT = { buckets: 9, decay: 0.996 };
const REMEMBER = 8;

export function createDirector(seed: number): Director {
  return { seed: seed >>> 0, recent: [], kinds: [], heat: new Array(HEAT.buckets).fill(0), last: null, made: 0 };
}

/* The generator, advanced in place so a director is one value that can be copied or logged. */
function random(d: Director) {
  d.seed = (d.seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(d.seed ^ (d.seed >>> 15), 1 | d.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const between = (d: Director, lo: number, hi: number) => lo + random(d) * (hi - lo);
const whole = (d: Director, lo: number, hi: number) => Math.floor(between(d, lo, hi + 1));

const bucket = (y: number) => Math.max(0, Math.min(HEAT.buckets - 1, Math.floor((y / H) * HEAT.buckets)));
const centre = (b: number) => ((b + 0.5) / HEAT.buckets) * H;

/* Once a frame: where the ship is. Old habits fade. */
export function observe(d: Director, shipY: number) {
  for (let i = 0; i < d.heat.length; i++) d.heat[i] *= HEAT.decay;
  d.heat[bucket(shipY)] += 1;
}

/* The height the ship has spent most time at, and how much of its time that is (0 to 1). */
export function habit(d: Director) {
  const total = d.heat.reduce((a, b) => a + b, 0);
  if (total < 30) return { lane: H / 2, share: 0 };
  let best = 0;
  d.heat.forEach((h, i) => { if (h > d.heat[best]) best = i; });
  return { lane: centre(best), share: d.heat[best] / total };
}

/* The heights the ship has used least, coolest first. */
function coolest(d: Director, n: number) {
  return d.heat.map((h, i) => ({ h, i })).sort((a, b) => a.h - b.h).slice(0, n).map((o) => centre(o.i));
}

const q = (v: number, step: number) => Math.round(v / step);

function draw(d: Director, verb: Verb, ship: { x?: number; y: number }, ctx: SigContext = {}): Attack {
  const { lane: hot } = habit(d);
  const a: Attack = { verb, sig: "", warn: 36, live: 1, lane: H / 2, count: 1, speed: 2, spin: 0, gap: 0, extra: 0 };
  switch (verb) {
    case "lance":
      /* The lane it has learned, with a little give so it is never exact. */
      a.lane = Math.max(20, Math.min(H - 20, hot + between(d, -14, 14)));
      a.count = whole(d, 5, 9);
      a.speed = between(d, 2.4, 3.4);
      a.warn = whole(d, 34, 52);
      a.live = a.count * 5;
      break;
    case "sweep": {
      const options = coolest(d, 3);
      a.gap = between(d, 14, 20);
      /* Far enough from the edges that the gap is a gap and not a corner. */
      a.lane = Math.max(a.gap / 2 + 18, Math.min(H - a.gap / 2 - 18, options[whole(d, 0, options.length - 1)]));
      a.speed = between(d, 1.4, 2.2);
      a.warn = whole(d, 30, 44);
      break;
    }
    case "ring":
      a.count = whole(d, 8, 16);
      a.speed = between(d, 1.0, 1.8);
      a.spin = between(d, 0, Math.PI * 2);
      a.extra = whole(d, 1, 2);
      a.warn = whole(d, 26, 38);
      a.live = a.extra === 2 ? 40 : 1;
      break;
    case "pinch":
      a.count = whole(d, 3, 5);
      a.gap = between(d, 0.06, 0.18);
      a.speed = between(d, 1.6, 2.4);
      a.warn = whole(d, 30, 40);
      a.lane = ship.y;
      break;
    case "lattice":
      a.count = whole(d, 3, 5);
      a.speed = between(d, 1.1, 1.6);
      a.extra = whole(d, 1, 8);
      a.warn = whole(d, 40, 54);
      break;
    case "drill":
      a.lane = Math.max(24, Math.min(H - 24, hot + between(d, -12, 12)));
      a.count = whole(d, 10, 16);
      a.speed = between(d, 3.0, 4.0);
      a.warn = whole(d, 40, 56);
      a.live = a.count * 3;
      break;
    case "debris":
      a.count = whole(d, 8, 14);
      a.speed = between(d, 1.6, 2.6);
      a.spin = between(d, 0, 100);
      a.warn = whole(d, 26, 36);
      a.live = 70;
      break;
    case "shards":
      a.count = whole(d, 6, 10);
      a.speed = between(d, 2.2, 3.2);
      a.gap = between(d, 0.04, 0.12);
      a.spin = between(d, 0, 100);
      a.warn = whole(d, 28, 40);
      a.live = a.count * 4;
      break;
    case "chain":
      a.count = whole(d, 10, 16);
      a.speed = between(d, 2.0, 2.8);
      a.warn = whole(d, 30, 42);
      a.live = a.count * 3;
      break;
    case "scan": case "playback": case "pincer": case "recall": case "train": case "charge":
    case "quake": case "breach": case "fang": case "snap": case "coil": case "surge":
    case "salvo": case "minefield": case "broadside": case "armada":
      Object.assign(a, drawSignature(verb, { between: (lo, hi) => between(d, lo, hi), whole: (lo, hi) => whole(d, lo, hi) }, { x: ship.x ?? 60, y: ship.y }, ctx, hot));
      break;
    case "dash3": case "bombs": case "blink": case "gravity": case "terrain": case "disaster":
    case "ionfan": case "frostshell": case "ambush": case "hyper": case "launch":
      Object.assign(a, drawHavoc(verb, { between: (lo, hi) => between(d, lo, hi), whole: (lo, hi) => whole(d, lo, hi) }, { x: ship.x ?? 60, y: ship.y }));
      break;
    case "dash": case "plasma3": case "blast": case "flame": case "blades":
      Object.assign(a, drawArms(verb, { between: (lo, hi) => between(d, lo, hi), whole: (lo, hi) => whole(d, lo, hi) }, { x: ship.x ?? 60, y: ship.y }));
      break;
    case "echo":
      /* No shot of its own: the ghost fires back the ship's own shots for this long. */
      a.live = whole(d, 90, 150);
      a.warn = whole(d, 24, 36);
      break;
  }
  a.sig = [verb, q(a.lane, 18), a.count, q(a.speed, 0.25), q(a.gap, 0.05 * (verb === "pinch" ? 1 : 8)), q(a.spin, 0.8), a.extra, q(a.warn, 6), q(a.live, 20), a.path ? a.path.length : 0].join(":");
  return a;
}

/* The next attack: a kind the phase allows that is not the last one, favouring the ones used least lately,
   with its numbers redrawn until the whole is new. */
/* What the engine can ask of the next attack: a kind that must be used (a phase's signature, an ultimate), kinds to favour,
   and what is known of the ship's path and motion. */
export type NextOptions = { force?: Verb; prefer?: Verb[]; ctx?: SigContext };

export function nextAttack(d: Director, phase: number, ship: { x?: number; y: number }, unlocked: Verb[][] = UNLOCKED, opts: NextOptions = {}): Attack {
  const allowed = unlocked[Math.max(0, Math.min(unlocked.length - 1, phase))].filter((v) => v !== d.last);
  const { share } = habit(d);
  const weight = (v: Verb) => {
    let w = 1;
    const recently = d.kinds.slice(-3).filter((k) => k === v).length;
    w *= 0.4 ** recently;
    /* A ship that sits still in one lane is hunted. */
    if (v === "lance" && share > 0.4) w *= 2.2;
    if (v === "sweep" && share < 0.3) w *= 1.3;
    /* A boss leans on its own signatures. */
    if (opts.prefer?.includes(v)) w *= 3;
    return w;
  };
  let verb = opts.force ?? allowed[allowed.length - 1];
  if (!opts.force) {
    const total = allowed.reduce((sum, v) => sum + weight(v), 0);
    let roll = random(d) * total;
    for (const v of allowed) {
      roll -= weight(v);
      if (roll <= 0) { verb = v; break; }
    }
  }
  let attack = draw(d, verb, ship, opts.ctx);
  for (let tries = 0; tries < 8 && d.recent.includes(attack.sig); tries++) attack = draw(d, verb, ship, opts.ctx);
  d.recent.push(attack.sig);
  if (d.recent.length > REMEMBER) d.recent.shift();
  d.kinds.push(verb);
  if (d.kinds.length > 12) d.kinds.shift();
  d.last = verb;
  d.made += 1;
  return attack;
}

/* Frames of quiet before the next attack. Never the same beat. */
export function restFrames(d: Director) {
  return whole(d, 6, 24);
}

type Body = { x: number; y: number };

/* The shots an attack fires at `local` frames after it began (the warning counts). The boss's muzzle is `boss`;
   `ship` is the ship's centre now. */
export function attackShots(a: Attack, local: number, boss: Body, ship: Body): CorvetShot[] {
  const out: CorvetShot[] = [];
  const at = local - a.warn;
  if (at < 0) return out;
  switch (a.verb) {
    case "lance":
      if (at % 5 === 0 && at / 5 < a.count) {
        const dir = Math.atan2(a.lane - boss.y, Math.max(20, ship.x) - boss.x);
        out.push({ x: boss.x, y: boss.y, vx: Math.cos(dir) * a.speed, vy: Math.sin(dir) * a.speed, r: 2.4, kind: "pulse" });
      }
      break;
    case "sweep":
      if (at === 0) {
        for (let y = 14; y <= H - 14; y += 12) {
          if (Math.abs(y - a.lane) < a.gap / 2) continue;
          out.push({ x: W + 4, y, vx: -a.speed, vy: 0, r: 3, kind: "scrap" });
        }
      }
      break;
    case "ring":
      for (let r = 0; r < a.extra; r++) {
        if (at !== r * 40) continue;
        for (let i = 0; i < a.count; i++) {
          const ang = a.spin * (r ? -1 : 1) + (i / a.count) * Math.PI * 2;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 2.6, kind: "orb" });
        }
      }
      break;
    case "pinch":
      if (at === 0) {
        /* Plates torn off the upper and lower flanks of the hull, flung at the ship, tumbling. */
        for (const from of [{ x: boss.x + 6, y: boss.y - 16 }, { x: boss.x + 6, y: boss.y + 16 }]) {
          const aim = Math.atan2(ship.y - from.y, ship.x - from.x);
          for (let i = 0; i < a.count; i++) {
            const d = (i - (a.count - 1) / 2) * a.gap;
            out.push({ x: from.x, y: from.y, vx: Math.cos(aim + d) * a.speed, vy: Math.sin(aim + d) * a.speed, r: 3.2, kind: "scrap" });
          }
        }
      }
      break;
    case "lattice":
      if (at === 0) {
        const rows = 10, top = 20, step = (H - 40) / (rows - 1);
        let safe = Math.min(rows - 2, a.extra);
        for (let c = 0; c < a.count; c++) {
          for (let r = 0; r < rows; r++) {
            if (r === safe) continue;
            out.push({ x: W + 4 + c * 20, y: top + r * step, vx: -a.speed, vy: 0, r: 2.4, kind: "orb" });
          }
          /* The way through wanders one row up or down per column. */
          safe = Math.max(0, Math.min(rows - 2, safe + (c % 2 === 0 ? 1 : -1) * (1 + (a.extra % 2))));
        }
      }
      break;
    case "drill":
      /* Three rows abreast down the lane, one rank of shots every third frame. */
      if (at % 3 === 0 && at / 3 < a.count) {
        for (const dy of [-7, 0, 7]) out.push({ x: boss.x, y: boss.y + dy, vx: -a.speed, vy: (a.lane - boss.y) / Math.max(40, boss.x - Math.max(20, ship.x)) * a.speed, r: 2.6, kind: "pulse" });
      }
      break;
    case "debris":
      /* Rock blasted out of the rig toward the ship's side, in a spray: how wide, how fast and how big each chunk is
         comes from the attack's own numbers, so one attack is always the same and two never are. */
      if (at % 3 === 0 && at / 3 < a.count) {
        const k = at / 3, hash = (m: number) => Math.abs(Math.sin(k * m + a.spin * 78.233) * 43758.5453) % 1;
        const angle = Math.PI + (hash(12.9898) - 0.5) * 1.5, speed = a.speed * (0.7 + hash(39.346) * 0.6);
        out.push({ x: boss.x, y: boss.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 3 + hash(4.1414) * 1.5, kind: "scrap" });
      }
      break;
    case "shards":
      /* Ice thrown from points along the length of the body, one after another, each aimed a little off the ship. */
      if (at % 4 === 0 && at / 4 < a.count) {
        const k = at / 4, hash = Math.abs(Math.sin(k * 12.9898 + a.spin * 78.233) * 43758.5453) % 1;
        const from = { x: boss.x + k * 11, y: boss.y + (k % 2 ? 9 : -9) };
        const aim = Math.atan2(ship.y - from.y, ship.x - from.x) + (hash - 0.5) * 2 * a.gap * 4;
        out.push({ x: from.x, y: from.y, vx: Math.cos(aim) * a.speed, vy: Math.sin(aim) * a.speed, r: 2.2, kind: "ice" });
      }
      break;
    case "chain":
      /* Two streams leave the body on opposite sides and cross as they go. */
      if (at % 3 === 0 && at / 3 < a.count) {
        const side = (at / 3) % 2 ? -1 : 1;
        out.push({ x: boss.x, y: boss.y + side * 14, vx: -a.speed, vy: -side * a.speed * 0.25, r: 2.4, kind: "ice" });
      }
      break;
    case "echo":
      break;
    case "dash": case "plasma3": case "blast": case "flame": case "blades":
      return armsShots(a, local, boss, ship);
    case "dash3": case "bombs": case "blink": case "gravity": case "terrain": case "disaster":
    case "ionfan": case "frostshell": case "ambush": case "hyper": case "launch":
      return havocShots(a, local, boss, ship);
    default:
      return signatureShots(a, local, boss, ship);
  }
  return out;
}

/* How far an attack has wound up, 0 to 1, for the telegraph; it is 0 once it fires. */
export function charge(a: Attack, local: number) {
  return local >= a.warn ? 0 : Math.max(0, Math.min(1, local / a.warn));
}

export const finished = (a: Attack, local: number) => local >= a.warn + a.live;
