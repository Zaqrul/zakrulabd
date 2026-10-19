/* The heavy weapons of Space 3's bosses, made to leave the ship nowhere to rest:

     dash3     three rams in a row, each one down the lane the ship is in at that moment, straight through it
     bombs     two volleys of three heavy bombs; each bursts into a full ring of shrapnel, every direction at once
     blink     the boss vanishes and comes out behind the ship (or over or under it), rings it with fire, and goes home
     gravity   the boss drags the ship toward itself while arms of fire wheel out of it
     terrain   the boss tears off rock and hurls it at the ship; the rocks bounce off the edges and break into more when shot
     disaster  the boss calls down a storm: debris from every edge of the screen at once, and lightning around the ship

   The engine moves the boss (dash3, blink), drags the ship (gravity), throws the rocks (terrain) and calls the lightning (disaster);
   this file draws the numbers and the shots. Pure functions, no link to the engine. */
import type { Attack, Verb } from "./space3-director";
import type { CorvetShot } from "./space3-boss";

const W = 384, H = 216, TAU = Math.PI * 2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hash = (k: number, m: number, spin: number) => Math.abs(Math.sin(k * m + spin * 78.233) * 43758.5453) % 1;

export const HAVOC_VERBS: Verb[] = ["dash3", "bombs", "blink", "gravity", "terrain", "disaster", "ionfan", "frostshell", "ambush", "hyper", "launch"];
/* The outer system's own (space3-act2.ts):
     ionfan      a wide fan of ion needles at the ship, three times
     frostshell  frost shells that burst into ice and slow whatever they hit
     ambush      fire from behind, on every lane, and out of the rear corners at the ship
     hyper       a hyper beam from each gun the boss has (the engine fires the beams; the boss steers them onto the ship while they charge)
     launch      the boss launches drones from its hangars (the engine makes them) */
type Pose = { x: number; y: number };
type Rnd = { between(lo: number, hi: number): number; whole(lo: number, hi: number): number };

/* The triple dash: frames each ram takes to go out, to hold, and to come back; three of them make the attack. */
export const DASH3 = { out: 9, hold: 5, back: 14, rams: 3, through: 14 };
export const dash3Cycle = DASH3.out + DASH3.hold + DASH3.back;
/* The blink: frames it stays out, where it lands from the ship. */
export const BLINK3 = { live: 56, behind: 74, over: 52 };
/* The pull: pixels a frame at most, and the share of the distance taken each frame. */
export const GRAVITY = { pull: 1.35, share: 0.014 };

export function drawHavoc(verb: Verb, r: Rnd, ship: Pose): Partial<Attack> {
  switch (verb) {
    case "dash3":
      return { lane: clamp(ship.y, 26, H - 26), speed: r.between(2.6, 3.2), warn: r.whole(34, 44), live: dash3Cycle * DASH3.rams };
    case "bombs":
      return { count: 2, gap: r.between(0.3, 0.42), speed: r.between(2.2, 2.8), extra: r.whole(30, 40), spin: r.between(0, 100), warn: r.whole(30, 40), live: 64 };
    case "blink":
      return { count: r.whole(24, 32), speed: r.between(1.8, 2.4), spin: r.between(0, TAU), warn: r.whole(30, 40), live: BLINK3.live };
    case "gravity":
      return { count: r.whole(4, 6), speed: r.between(1.6, 2.1), spin: r.between(0, TAU), gap: r.between(0.05, 0.08) * (r.between(0, 1) < 0.5 ? -1 : 1), warn: r.whole(34, 44), live: r.whole(110, 140) };
    case "terrain":
      return { count: r.whole(3, 5), speed: r.between(2.4, 3.2), spin: r.between(0, 100), warn: r.whole(30, 40), live: 20 };
    case "ionfan":
      return { count: r.whole(6, 8), gap: r.between(0.5, 0.7), speed: r.between(3.2, 3.9), warn: r.whole(28, 38), live: 34 };
    case "frostshell":
      return { count: r.whole(3, 5), gap: r.between(0.2, 0.3), speed: r.between(1.6, 2.1), extra: r.whole(40, 55), spin: r.between(0, 100), warn: r.whole(30, 40), live: 40 };
    case "ambush":
      return { count: 2, speed: r.between(3.0, 3.6), warn: r.whole(30, 40), live: 60 };
    case "hyper":
      return { count: r.whole(1, 3), warn: r.whole(48, 60), live: r.whole(30, 40) };
    case "launch":
      return { count: r.whole(2, 4), warn: r.whole(30, 40), live: 20 };
    case "disaster":
      return { count: r.whole(20, 28), speed: r.between(2.4, 3.2), spin: r.between(0, 100), warn: r.whole(50, 64), live: r.whole(100, 130) };
    default:
      return {};
  }
}

export function havocShots(a: Attack, local: number, boss: Pose, ship: Pose): CorvetShot[] {
  const out: CorvetShot[] = [];
  const at = local - a.warn;
  if (at < 0) return out;
  const aim = Math.atan2(ship.y - boss.y, ship.x - boss.x);
  switch (a.verb) {
    case "dash3": {
      /* A bow wave ahead of the hull on every ram. */
      const c = at % dash3Cycle;
      if (c < DASH3.out + DASH3.hold && c % 3 === 0) for (const d of [-0.5, -0.25, 0, 0.25, 0.5]) out.push({ x: boss.x - 4, y: boss.y, vx: -Math.cos(d) * a.speed, vy: Math.sin(d) * a.speed, r: 2.6, kind: "pulse" });
      break;
    }
    case "bombs":
      if (at % 30 === 0 && at / 30 < a.count) {
        for (const d of [-a.gap, 0, a.gap]) {
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(aim + d) * a.speed, vy: Math.sin(aim + d) * a.speed, r: 5, kind: "scrap", fuse: a.extra, split: 16, splitKind: "scrap", splitAngle: a.spin + d * 7 + at });
        }
      }
      break;
    case "blink":
      /* From wherever it came out: a full ring, a fast aimed spread, and a second ring turned half a step. */
      if (at === 6 || at === 34) {
        for (let i = 0; i < a.count; i++) {
          const ang = a.spin + (i / a.count) * TAU + (at === 34 ? Math.PI / a.count : 0);
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 2.4, kind: "needle" });
        }
      }
      if (at === 20) for (const d of [-0.16, -0.08, 0, 0.08, 0.16]) out.push({ x: boss.x, y: boss.y, vx: Math.cos(aim + d) * 4.6, vy: Math.sin(aim + d) * 4.6, r: 1.8, kind: "needle" });
      break;
    case "gravity":
      if (at % 3 === 0 && at < a.live) {
        for (let k = 0; k < a.count; k++) {
          const ang = a.spin + at * a.gap + (k * TAU) / a.count;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 2.4, kind: "orb" });
        }
      }
      break;
    case "ionfan":
      if (at % 14 === 0 && at / 14 < 3) {
        for (let i = 0; i < a.count; i++) {
          const ang = aim + (i - (a.count - 1) / 2) * (a.gap / (a.count - 1)) * 2;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 1.8, kind: "needle" });
        }
      }
      break;
    case "frostshell":
      if (at === 0) {
        for (let i = 0; i < a.count; i++) {
          const ang = aim + (i - (a.count - 1) / 2) * a.gap;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 4, kind: "frost", fuse: a.extra + i * 4, split: 10, splitKind: "ice", splitAngle: i });
        }
      }
      break;
    case "ambush":
      if (at % 30 === 0 && at / 30 < a.count) {
        for (let y = 26; y <= H - 16; y += 29) out.push({ x: -6, y, vx: a.speed, vy: 0, r: 2.8, kind: "pulse" });
        for (const cy of [8, H - 8]) {
          const lean = Math.atan2(ship.y - cy, ship.x + 6);
          out.push({ x: -6, y: cy, vx: Math.cos(lean) * a.speed, vy: Math.sin(lean) * a.speed, r: 2.8, kind: "needle" });
        }
      }
      break;
    case "disaster":
      /* Debris from every edge in turn, all of it thrown at the ship. */
      if (at % 4 === 0 && at < a.live) {
        const k = at / 4, side = k % 4, u = hash(k, 12.9898, a.spin);
        const from = side === 0 ? { x: W + 4, y: 14 + u * (H - 28) } : side === 1 ? { x: -4, y: 14 + u * (H - 28) } : side === 2 ? { x: 20 + u * (W - 40), y: 6 } : { x: 20 + u * (W - 40), y: H - 6 };
        const lean = Math.atan2(ship.y + (hash(k, 39.3, a.spin) - 0.5) * 40 - from.y, ship.x + (hash(k, 4.14, a.spin) - 0.5) * 40 - from.x);
        out.push({ x: from.x, y: from.y, vx: Math.cos(lean) * a.speed, vy: Math.sin(lean) * a.speed, r: 3 + hash(k, 7.7, a.spin) * 1.6, kind: "scrap" });
      }
      break;
    default:
      break;
  }
  return out;
}
