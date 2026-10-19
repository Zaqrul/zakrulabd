/* Space 3's Resonance: one meter that the Seed Core's signal fills, and that the Vanguard copies. It
   replaces the scatter of power sources of Space 2 (XP, Bloom energy, the Hyper charge, the Cover
   cooldown) with a single thing the player earns by flying close to danger. Pure logic, in frames at
   60 a second, with no drawing and no link to the engine's State yet: the engine calls these with the
   ship's centre and the enemy shots, and reads the answers back. The design is in docs/space3-design.md. */
import type { Bullet } from "./space-logic";

export const RESONANCE = {
  max: 100,
  /* The ship's real hurt circle is far smaller than its sprite; a shot that passes within `band` of it grazes. */
  hit: 3,
  band: 8,
  graze: 6,
  /* A shot that goes through the ship while it phases is worth more than a plain graze. */
  phaseGraze: 15,
  /* A hit takes this share of what the meter holds. */
  hitLoss: 0.2,
  /* After `idle` frames with nothing gained the meter leaks `leak` a frame, so it has to be earned again. */
  idle: 360,
  leak: 0.03,
};

/* Phase Shift: a dash of `distance` pixels in the direction the ship is being flown (straight ahead if it is still), with 12 frames of
   invulnerability, then a wait before the next. Every enemy shot the dash passes through pays the phase-graze sum. */
export const PHASE = { frames: 12, cooldown: 40 };
export const DASH = { distance: 40, band: 10 };

/* Grazes in a chain: each graze within `window` frames of the last raises what the next one is worth by `step`, up to `max` times.
   A hit ends the chain. */
export const CHAIN = { window: 150, step: 0.25, max: 3 };

/* A Resonance cell, left by a big enemy. */
export const CELL = { gain: 25 };

/* The Kinetic Barrier swallows small enemy shots for 1.5 s and sends them back. */
export const BARRIER = { frames: 90, cooldown: 480, radius: 26, maxShot: 3, gain: 4 };

/* Destroying an enemy feeds the meter too: a little for a small one, up to `max` for a big one, so a ship that only shoots still earns
   something, and a ship that grazes and shoots earns plenty. */
export const KILL_GAIN = { base: 2, per: 40, max: 10 };
export const killGain = (score: number) => Math.min(KILL_GAIN.max, KILL_GAIN.base + score / KILL_GAIN.per);

/* Overdrive: a full meter burns down over 5 s while the ship hits harder. */
export const OVERDRIVE = { frames: 300, scale: 1.5 };

/* The Vanguard records the ship's path and replays it `delay` frames late as a ghost. */
export const GHOST = { delay: 180, shot: { speed: 2.6, r: 2, dmg: 8 } };

type Pose = { x: number; y: number; fire: boolean };
type Circle = Pick<Bullet, "x" | "y" | "r" | "own">;
type Shot = Pick<Bullet, "x" | "y" | "vx" | "vy" | "r" | "own" | "dmg">;

export type Resonance = {
  meter: number;
  idle: number;
  phase: number;
  phaseCd: number;
  barrier: number;
  barrierCd: number;
  overdrive: number;
  /* The graze chain: grazes so far, and frames since the last. */
  chain: number;
  chainT: number;
  /* Where the last dash began and frames since, for the afterimage. */
  dashFrom: { x: number; y: number } | null;
  dashT: number;
  /* Shots that have already paid out, so one shot grazes once. */
  paid: WeakSet<object>;
  trail: Pose[];
};

export function createResonance(): Resonance {
  return { meter: 0, idle: 0, phase: 0, phaseCd: 0, barrier: 0, barrierCd: 0, overdrive: 0, chain: 0, chainT: 0, dashFrom: null, dashT: 0, paid: new WeakSet(), trail: [] };
}

export function gain(r: Resonance, amount: number) {
  if (amount <= 0 || r.overdrive > 0) return;
  r.meter = Math.min(RESONANCE.max, r.meter + amount);
  r.idle = 0;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

export const chainMultiplier = (r: Resonance) => Math.min(CHAIN.max, 1 + CHAIN.step * r.chain);

/* A graze pays its sum times the chain, and lengthens the chain. */
function award(r: Resonance, base: number) {
  gain(r, base * chainMultiplier(r));
  r.chain += 1;
  r.chainT = 0;
}

function segmentDistance(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const abx = b.x - a.x, aby = b.y - a.y, len2 = abx * abx + aby * aby;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2));
  return Math.hypot(p.x - (a.x + abx * t), p.y - (a.y + aby * t));
}

/* The unit direction of a dash: where the ship is being flown, or straight ahead if it is not being flown. */
export function dashDirection(mx: number, my: number) {
  const m = Math.hypot(mx, my);
  return m < 0.01 ? { x: 1, y: 0 } : { x: mx / m, y: my / m };
}

/* Enemy shots the ship passed through, or close to, on a dash from `from` to `to`: each pays the phase-graze sum once. */
export function dashGraze(r: Resonance, from: { x: number; y: number }, to: { x: number; y: number }, shots: readonly Circle[]) {
  let n = 0;
  for (const s of shots) {
    if (s.own !== "e" || r.paid.has(s)) continue;
    if (segmentDistance(s, from, to) < RESONANCE.hit + s.r + DASH.band) {
      r.paid.add(s);
      award(r, RESONANCE.phaseGraze);
      n++;
    }
  }
  return n;
}

/* Enemy shots passing close to the ship without touching it. While the ship phases a shot that is inside
   the hurt circle pays the larger sum. Each shot pays once. Returns how many paid. */
export function grazeShots(r: Resonance, ship: { x: number; y: number }, shots: readonly Circle[]) {
  let paid = 0;
  for (const s of shots) {
    if (s.own !== "e" || r.paid.has(s)) continue;
    const d = dist(ship, s), core = RESONANCE.hit + s.r;
    if (d < core) {
      if (phased(r)) { r.paid.add(s); award(r, RESONANCE.phaseGraze); paid++; }
    } else if (d < core + RESONANCE.band) {
      r.paid.add(s); award(r, RESONANCE.graze); paid++;
    }
  }
  return paid;
}

export function phaseShift(r: Resonance) {
  if (r.phase > 0 || r.phaseCd > 0) return false;
  r.phase = PHASE.frames;
  r.phaseCd = PHASE.cooldown + PHASE.frames;
  return true;
}
export const phased = (r: Resonance) => r.phase > 0;

export function raiseBarrier(r: Resonance) {
  if (r.barrier > 0 || r.barrierCd > 0) return false;
  r.barrier = BARRIER.frames;
  r.barrierCd = BARRIER.cooldown + BARRIER.frames;
  return true;
}

/* Small enemy shots inside the barrier turn round and become the ship's. Returns how many. */
export function reflectShots(r: Resonance, ship: { x: number; y: number }, shots: Shot[]) {
  if (r.barrier <= 0) return 0;
  let n = 0;
  for (const s of shots) {
    if (s.own !== "e" || s.r > BARRIER.maxShot || dist(ship, s) > BARRIER.radius) continue;
    s.own = "p";
    s.vx = -s.vx;
    s.vy = -s.vy;
    gain(r, BARRIER.gain);
    n++;
  }
  return n;
}

/* A full meter starts Overdrive; nothing else does. */
export function startOverdrive(r: Resonance) {
  if (r.overdrive > 0 || r.meter < RESONANCE.max) return false;
  r.overdrive = OVERDRIVE.frames;
  return true;
}

/* Wingman sync and Hyper spend from the same meter. Not while Overdrive burns it. */
export function spend(r: Resonance, cost: number) {
  if (r.overdrive > 0 || r.meter < cost) return false;
  r.meter -= cost;
  return true;
}

/* A hit costs a share of the meter, never the whole of it. Phasing makes the ship untouchable. */
export function hurt(r: Resonance) {
  if (phased(r)) return false;
  r.chain = 0;
  if (r.overdrive <= 0) r.meter *= 1 - RESONANCE.hitLoss;
  return true;
}

export const damageScale = (r: Resonance) => (r.overdrive > 0 ? OVERDRIVE.scale : 1);

/* One frame: timers run down, an idle meter leaks, Overdrive burns the meter to nothing, and the ship's pose is recorded for the ghost. */
export function tickResonance(r: Resonance, ship: Pose) {
  if (r.phase > 0) r.phase--;
  if (r.phaseCd > 0) r.phaseCd--;
  if (r.barrier > 0) r.barrier--;
  if (r.barrierCd > 0) r.barrierCd--;
  if (r.chain > 0 && ++r.chainT > CHAIN.window) r.chain = 0;
  if (r.dashT > 0) r.dashT--;
  if (r.overdrive > 0) {
    r.overdrive--;
    r.meter = RESONANCE.max * (r.overdrive / OVERDRIVE.frames);
  } else if (++r.idle > RESONANCE.idle) {
    r.meter = Math.max(0, r.meter - RESONANCE.leak);
  }
  r.trail.push({ x: ship.x, y: ship.y, fire: ship.fire });
  if (r.trail.length > GHOST.delay + 1) r.trail.shift();
}

/* Where the ship was `GHOST.delay` frames ago: the ghost's place now. Null until the trail is long enough. */
export function ghostPose(r: Resonance): Pose | null {
  return r.trail.length > GHOST.delay ? r.trail[0] : null;
}

/* When the ship fired at that moment the ghost fires back: a shot leaving its place, heading left. */
export function ghostShot(r: Resonance): Shot | null {
  const g = ghostPose(r);
  if (!g?.fire) return null;
  return { x: g.x, y: g.y, vx: -GHOST.shot.speed, vy: 0, r: GHOST.shot.r, own: "e", dmg: GHOST.shot.dmg };
}
