/* Five weapons the chapter bosses carry on top of their signatures and ultimates, all of them also in the hands of some ordinary enemies:

     dash     the boss winds back, then rams down the lane the ship was in, a bow wave of shots ahead of its hull, and returns
     plasma3  three hyper ballistic plasma bolts side by side, long and thin and fast, in two or three volleys at where the ship is
     blast    two volleys of three explosive shells, each shell bursting into a ring a moment after it leaves
     flame    a flamethrower: a cone of short-lived fire, aimed at the lane the ship was in when it began
     blades   spinning blades thrown in a fan; each flies out, turns, and comes back like a boomerang

   Nothing falls: every shot starts at the boss and travels flat or on a slant across the screen. The engine moves the boss for a dash
   (space-logic.ts, dashBoss); this file only draws the numbers and the shots. Pure functions, no link to the engine. */
import type { Attack, Verb } from "./space3-director";
import type { CorvetShot } from "./space3-boss";

const H = 216;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const ARMS_VERBS: Verb[] = ["dash", "plasma3", "blast", "flame", "blades"];
type Pose = { x: number; y: number };
type Rnd = { between(lo: number, hi: number): number; whole(lo: number, hi: number): number };

/* The dash: frames to reach the ship's side, to hold there, and in all (the attack's `live`). The engine reads these too. */
export const DASH = { out: 14, hold: 20, live: 48, stand: 28, wind: 8 };

/* The numbers an arms attack draws. */
export function drawArms(verb: Verb, r: Rnd, ship: Pose): Partial<Attack> {
  switch (verb) {
    case "dash":
      return { lane: clamp(ship.y, 30, H - 30), speed: r.between(2.2, 3.0), warn: r.whole(40, 54), live: DASH.live };
    case "plasma3":
      return { count: r.whole(2, 3), gap: r.between(0.05, 0.1), speed: r.between(5.0, 6.0), warn: r.whole(30, 42), live: 60 };
    case "blast":
      return { count: 2, gap: r.between(0.28, 0.4), speed: r.between(2.0, 2.6), extra: r.whole(34, 46), spin: r.between(0, 100), warn: r.whole(34, 46), live: 50 };
    case "flame":
      return { lane: clamp(ship.y, 24, H - 24), gap: r.between(0.2, 0.3), speed: r.between(3.0, 3.8), warn: r.whole(36, 50), live: r.whole(60, 84) };
    case "blades":
      return { count: r.whole(3, 5), gap: r.between(0.16, 0.24), speed: r.between(3.2, 4.0), extra: r.whole(48, 90), warn: r.whole(34, 46), live: 30 };
    default:
      return {};
  }
}

/* The shots an arms attack fires `local` frames after it began (the warning counts). */
export function armsShots(a: Attack, local: number, boss: Pose, ship: Pose): CorvetShot[] {
  const out: CorvetShot[] = [];
  const at = local - a.warn;
  if (at < 0) return out;
  /* Aimed at the ship, but never more than about 55 degrees off straight along the screen: nothing is thrown up or down. */
  const lean = Math.atan2(ship.y - boss.y, ship.x - boss.x) - Math.PI, aim = Math.PI + clamp(Math.atan2(Math.sin(lean), Math.cos(lean)), -0.95, 0.95);
  switch (a.verb) {
    case "dash":
      /* The bow wave: three shots from the front of the hull every few frames while it rams. */
      if (at >= 2 && at < DASH.hold && at % 4 === 2) {
        for (const d of [-0.22, 0, 0.22]) out.push({ x: boss.x - 4, y: boss.y, vx: -Math.cos(d) * a.speed, vy: Math.sin(d) * a.speed, r: 2.6, kind: "pulse" });
      }
      break;
    case "plasma3":
      if (at % 18 === 0 && at / 18 < a.count) {
        for (const d of [-a.gap, 0, a.gap]) out.push({ x: boss.x, y: boss.y, vx: Math.cos(aim + d) * a.speed, vy: Math.sin(aim + d) * a.speed, r: 1.6, kind: "needle" });
      }
      break;
    case "blast":
      if (at % 26 === 0 && at / 26 < a.count) {
        for (const d of [-a.gap, 0, a.gap]) {
          out.push({
            x: boss.x, y: boss.y, vx: Math.cos(aim + d) * a.speed, vy: Math.sin(aim + d) * a.speed, r: 4.2, kind: "scrap",
            fuse: a.extra, split: 8, splitKind: "pulse", splitAngle: a.spin + d * 10,
          });
        }
      }
      break;
    case "flame":
      /* Two jets of three every other frame, in a cone about the lane marked when the attack began. */
      if (at % 2 === 0 && at < a.live) {
        const centre = Math.atan2(a.lane - boss.y, Math.max(20, ship.x) - boss.x);
        for (let i = -1; i <= 1; i++) {
          const ang = centre + i * a.gap + (((at / 2 + i) % 3) - 1) * 0.04;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 2.8, kind: "fire", life: 34 });
        }
      }
      break;
    case "blades":
      if (at === 0) {
        for (let i = 0; i < a.count; i++) {
          const ang = Math.PI + clamp(aim - Math.PI, -0.3, 0.3) + (i - (a.count - 1) / 2) * a.gap;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 7, kind: "crescent", back: a.extra });
        }
      }
      break;
    default:
      break;
  }
  return out;
}
