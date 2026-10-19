/* The signature attacks and ultimates of Space 3's chapter bosses: one unique attack for each phase of each boss, and one
   ultimate. They are not drawn at random like the director's ordinary attacks (space3-director.ts): a phase opens with its
   signature, a boss leans on its signatures afterwards, and the ultimate is forced at 25% and again at 10% of its health,
   with a long warning. The numbers inside each are still drawn fresh every time.

     Ghost Corvet (it copies you)
       scan      P0  three arms of shots wheel out of the hull like a radar sweep
       playback  P1  the height you flew for the last 1.5 seconds comes back as a wall of shots
       pincer    P2  two rows close on your height from the right
       recall    ULT the whole of the last 3 seconds comes back, then a ring
     Excavator-X (it mines)
       train     P0  a freight train of ore, one cart after another down your lane
       charge    P1  heavy charges that burst into rings before they reach you
       quake     P2  rings of rock with a gap that turns from ring to ring
       breach    ULT four rings at four speeds, each gap turned further, and a drill stream
     Abyssal Wyrm (it coils)
       fang      P0  fast shots aimed where you are going, not where you are
       snap      P1  an arc of ice closing on you from the front, with one gap
       coil      P2  a wall of ice with a corridor that snakes through it
       surge     ULT two closing jaws, then a coil
     Armada Reclaimer (it salvages)
       salvo     P0  old missiles gather by the hull, hang, then all go for where you were
       minefield P1  mines scatter across the field and burst into rings
       broadside P2  a line of cannon fire at six heights with one height left clear
       armada    ULT a salvo, a minefield, a broadside and a ring, one after another

   Nothing falls: every shot starts at the boss, at the right edge, or on an arc in front of the ship. Pure functions,
   no link to the engine. Nothing here is final tuning. */
import type { Attack, Verb } from "./space3-director";
import type { CorvetShot } from "./space3-boss";

const W = 384, H = 216;
const TAU = Math.PI * 2;

export const SIGNATURE_VERBS: Verb[] = ["scan", "playback", "pincer", "recall", "train", "charge", "quake", "breach", "fang", "snap", "coil", "surge", "salvo", "minefield", "broadside", "armada"];
export const ULTIMATE_VERBS: Verb[] = ["recall", "breach", "surge", "armada"];

type Pose = { x: number; y: number };
/* What the engine tells the director about the ship: where it has been (oldest first), and how it is moving. */
export type SigContext = { trail?: readonly Pose[]; vel?: { vx: number; vy: number } };
export type Rnd = { between(lo: number, hi: number): number; whole(lo: number, hi: number): number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const angleGap = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

/* The ship's height at every `step`-th frame of its recent past, oldest first, at most `max` of them. */
export function sample(trail: readonly Pose[] | undefined, step: number, max: number, fallback: number): Pose[] {
  const out: Pose[] = [];
  if (trail && trail.length > step) {
    for (let i = trail.length - 1; i >= 0 && out.length < max; i -= step) out.push({ x: trail[i].x, y: trail[i].y });
    return out.reverse();
  }
  return Array.from({ length: Math.min(max, 8) }, () => ({ x: 60, y: fallback }));
}

/* How a signature attack is built: the numbers it draws. `hot` is the lane the ship has used most. */
export function drawSignature(verb: Verb, r: Rnd, ship: Pose, ctx: SigContext, hot: number): Partial<Attack> {
  switch (verb) {
    case "scan":
      return { count: r.whole(18, 26), speed: r.between(1.4, 1.9), spin: r.between(0, TAU), gap: r.between(0.28, 0.42), warn: r.whole(30, 40), live: 52 };
    case "playback": {
      const path = sample(ctx.trail, 6, 15, ship.y);
      return { path, speed: r.between(2.0, 2.6), warn: r.whole(30, 44), live: path.length * 5 };
    }
    case "pincer":
      return { count: r.whole(10, 14), gap: r.between(22, 30), speed: r.between(1.8, 2.4), lane: ship.y, warn: r.whole(30, 44), live: 48 };
    case "recall": {
      const path = sample(ctx.trail, 4, 45, ship.y);
      return { path, speed: r.between(2.4, 3.0), count: r.whole(14, 20), warn: r.whole(100, 120), live: path.length * 3 + 40 };
    }
    case "train":
      return { count: r.whole(6, 8), speed: r.between(1.6, 2.1), lane: clamp(hot, 24, H - 24), warn: r.whole(34, 46), live: 120 };
    case "charge":
      return { count: r.whole(3, 5), speed: r.between(1.4, 1.9), spin: r.between(0, TAU), gap: r.between(0.12, 0.24), warn: r.whole(34, 46), live: 100 };
    case "quake":
      return { count: r.whole(12, 16), extra: 3, speed: r.between(1.3, 1.7), spin: r.between(0, TAU), gap: r.between(0.1, 0.18), warn: r.whole(34, 46), live: 60 };
    case "breach":
      return { count: r.whole(24, 30), extra: 4, speed: r.between(1.1, 1.5), spin: r.between(0, TAU), gap: r.between(0.12, 0.2), lane: clamp(hot, 24, H - 24), warn: r.whole(100, 120), live: 150 };
    case "fang":
      return { count: 3, speed: r.between(3.2, 4.0), lead: ctx.vel ?? { vx: 0, vy: 0 }, warn: r.whole(34, 46), live: 44 };
    case "snap":
      return { count: r.whole(18, 24), speed: r.between(1.0, 1.4), spin: r.between(-0.9, 0.9), gap: r.between(0.1, 0.16), extra: r.between(70, 95), warn: r.whole(36, 48), live: 1 };
    case "coil":
      return { count: r.whole(14, 18), speed: r.between(1.8, 2.2), spin: r.between(0, TAU), lane: H / 2, gap: r.between(34, 62), warn: r.whole(40, 52), live: 110 };
    case "surge":
      return { count: 12, speed: r.between(1.1, 1.4), spin: r.between(-0.6, 0.6), gap: r.between(0.1, 0.16), warn: r.whole(100, 120), live: 190 };
    case "salvo":
      return { count: r.whole(6, 9), speed: r.between(3.0, 3.8), spin: r.between(0, 100), warn: r.whole(30, 42), live: 90 };
    case "minefield":
      return { count: r.whole(5, 7), spin: r.between(0, 100), warn: r.whole(34, 46), live: 110 };
    case "broadside":
      return { count: 6, extra: 6, speed: r.between(2.6, 3.4), warn: r.whole(34, 46), live: 40 };
    case "armada":
      return { count: 9, extra: 6, speed: r.between(3.0, 3.6), spin: r.between(0, 100), gap: r.between(0.1, 0.15), warn: r.whole(110, 130), live: 230 };
    default:
      return {};
  }
}

/* ---- pieces shared by more than one attack ---- */

/* An arc of shots on the front of a point, all closing on it, with one gap. */
function jaws(centre: Pose, radius: number, count: number, speed: number, gapAt: number, gapWidth: number, kind: CorvetShot["kind"]): CorvetShot[] {
  const out: CorvetShot[] = [];
  for (let j = 0; j < count; j++) {
    const theta = -1.1 + 2.2 * (j / Math.max(1, count - 1));
    if (Math.abs(theta - gapAt) < gapWidth / 2) continue;
    const x = centre.x + Math.cos(theta) * radius, y = centre.y + Math.sin(theta) * radius;
    if (y < 6 || y > H - 6 || x > W) continue;
    out.push({ x, y, vx: -Math.cos(theta) * speed, vy: -Math.sin(theta) * speed, r: 2.4, kind });
  }
  return out;
}

/* One column of a wall of ice with a corridor through it. */
function coilColumn(k: number, mid: number, amp: number, phase: number, speed: number): CorvetShot[] {
  const out: CorvetShot[] = [];
  const centre = clamp(mid + Math.sin(k * 0.5 + phase) * amp, 38, H - 38);
  for (let y = 14; y <= H - 14; y += 12) {
    if (Math.abs(y - centre) < 9) continue;
    out.push({ x: W + 4, y, vx: -speed, vy: 0, r: 2.6, kind: "ice" });
  }
  return out;
}

/* A ring of shots from a point with one gap. */
function ring(from: Pose, count: number, speed: number, gapAt: number, gapWidth: number, kind: CorvetShot["kind"], r: number): CorvetShot[] {
  const out: CorvetShot[] = [];
  for (let j = 0; j < count; j++) {
    const ang = (j / count) * TAU;
    if (gapWidth > 0 && angleGap(ang, gapAt) < gapWidth / 2) continue;
    out.push({ x: from.x, y: from.y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r, kind });
  }
  return out;
}

const hash = (k: number, m: number, spin: number) => Math.abs(Math.sin(k * m + spin * 78.233) * 43758.5453) % 1;

/* Old missiles that gather by the hull, hang, then go for where the ship was: shot `i` of `count`. */
function salvoShot(i: number, count: number, speed: number, spin: number, boss: Pose, ship: Pose): CorvetShot {
  const x = boss.x - 8 + hash(i, 12.9898, spin) * 36, y = clamp(boss.y + (i - (count - 1) / 2) * 11, 12, H - 12);
  const aim = Math.atan2(ship.y - y, ship.x - x);
  return { x, y, vx: 0, vy: 0, r: 3.2, kind: "pulse", hold: 40 + (count - i) * 5, hvx: Math.cos(aim) * speed, hvy: Math.sin(aim) * speed };
}

/* A mine that sits still and bursts into a ring, never close to the ship. */
function mine(i: number, spin: number, ship: Pose): CorvetShot {
  const x = 110 + hash(i, 39.346, spin) * 180;
  let y = 30 + hash(i, 4.1414, spin) * 156;
  if (Math.hypot(x - ship.x, y - ship.y) < 50) y = clamp(y + (y > ship.y ? 60 : -60), 12, H - 12);
  return { x, y, vx: 0, vy: 0, r: 4, kind: "scrap", fuse: 60 + Math.round(hash(i, 7.77, spin) * 40) + i * 6, split: 8, splitKind: "scrap", splitAngle: spin + i };
}

/* One column of the broadside: cannon fire at six heights, all but `clear` one. */
function broadsideColumn(boss: Pose, clear: number, speed: number): CorvetShot[] {
  const out: CorvetShot[] = [];
  for (let row = 0; row < 6; row++) if (row !== clear) out.push({ x: boss.x - 6, y: 24 + row * 34, vx: -speed, vy: 0, r: 2.6, kind: "pulse" });
  return out;
}

/* The shots a signature attack fires at `local` frames after it began (the warning counts). */
export function signatureShots(a: Attack, local: number, boss: Pose, ship: Pose): CorvetShot[] {
  const out: CorvetShot[] = [];
  const at = local - a.warn;
  if (at < 0) return out;
  const path = a.path ?? [];
  switch (a.verb) {
    case "scan":
      if (at % 2 === 0 && at / 2 < a.count) {
        const k = at / 2;
        for (let j = 0; j < 3; j++) {
          const ang = a.spin + k * a.gap + (j * TAU) / 3;
          out.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 2.2, kind: "pulse" });
        }
      }
      break;
    case "playback":
      if (at % 5 === 0 && at / 5 < path.length) out.push({ x: W + 4, y: clamp(path[at / 5].y, 10, H - 10), vx: -a.speed, vy: 0, r: 2.4, kind: "needle" });
      break;
    case "pincer":
      if (at % 4 === 0 && at / 4 < a.count) {
        const travel = (W + 4 - 60) / a.speed;
        for (const side of [-1, 1]) {
          const y0 = clamp(a.lane + side * a.gap, 10, H - 10);
          out.push({ x: W + 4, y: y0, vx: -a.speed, vy: (a.lane - y0) / travel, r: 2.4, kind: "pulse" });
        }
      }
      break;
    case "recall":
      if (at % 3 === 0 && at / 3 < path.length) out.push({ x: W + 4, y: clamp(path[at / 3].y, 10, H - 10), vx: -a.speed, vy: 0, r: 2.4, kind: "needle" });
      if (at === path.length * 3 + 10) out.push(...ring(boss, a.count, 1.6, 0, 0, "needle", 2.4));
      break;
    case "train":
      if (at % 14 === 0 && at / 14 < a.count) {
        const k = at / 14;
        out.push({ x: boss.x, y: a.lane, vx: -a.speed, vy: 0, r: 4.2, kind: "scrap" });
        out.push({ x: boss.x, y: clamp(a.lane + (k % 2 ? 16 : -16), 10, H - 10), vx: -a.speed, vy: 0, r: 2.6, kind: "scrap" });
      }
      break;
    case "charge":
      if (at === 0) {
        const base = Math.atan2(ship.y - boss.y, ship.x - boss.x), d = Math.hypot(ship.x - boss.x, ship.y - boss.y);
        for (let i = 0; i < a.count; i++) {
          const ang = base + (i - (a.count - 1) / 2) * a.gap;
          out.push({
            x: boss.x, y: boss.y, vx: Math.cos(ang) * a.speed, vy: Math.sin(ang) * a.speed, r: 5, kind: "scrap",
            fuse: clamp(Math.round((d * 0.6) / a.speed), 30, 90), split: 10, splitKind: "scrap", splitAngle: a.spin + i,
          });
        }
      }
      break;
    case "quake":
      for (let i = 0; i < a.extra; i++) if (at === i * 18) out.push(...ring(boss, a.count, a.speed, a.spin + i * 0.7, a.gap, "scrap", 3));
      break;
    case "breach":
      for (let i = 0; i < a.extra; i++) if (at === i * 22) out.push(...ring(boss, a.count, a.speed + i * 0.35, a.spin + i * 0.8, a.gap, "scrap", 3.4));
      if (at >= 30 && (at - 30) % 3 === 0 && (at - 30) / 3 < 12) {
        const slope = (a.lane - boss.y) / Math.max(60, boss.x - Math.max(20, ship.x));
        out.push({ x: boss.x, y: boss.y, vx: -3.4, vy: slope * 3.4, r: 2.6, kind: "scrap" });
      }
      break;
    case "fang": {
      const lead = a.lead ?? { vx: 0, vy: 0 };
      if (at % 14 === 0 && at / 14 < a.count) {
        const t = Math.hypot(ship.x - boss.x, ship.y - boss.y) / a.speed;
        const aim = Math.atan2(clamp(ship.y + lead.vy * t, 10, H - 10) - boss.y, ship.x + lead.vx * t - boss.x);
        for (const d of [-0.03, 0, 0.03]) out.push({ x: boss.x, y: boss.y, vx: Math.cos(aim + d) * a.speed, vy: Math.sin(aim + d) * a.speed, r: 2.2, kind: "ice" });
      }
      break;
    }
    case "snap":
      if (at === 0) out.push(...jaws(ship, a.extra, a.count, a.speed, a.spin, a.gap, "ice"));
      break;
    case "coil":
      if (at % 6 === 0 && at / 6 < a.count) out.push(...coilColumn(at / 6, a.lane, a.gap, a.spin, a.speed));
      break;
    case "surge":
      if (at === 0) out.push(...jaws(ship, 95, a.count + 2, a.speed, a.spin, a.gap, "ice"));
      if (at === 40) out.push(...jaws(ship, 55, a.count, a.speed + 0.2, -a.spin, a.gap, "ice"));
      if (at >= 70 && (at - 70) % 6 === 0 && (at - 70) / 6 < 12) out.push(...coilColumn((at - 70) / 6, H / 2, 46, a.spin * 3, 2.0));
      break;
    case "salvo":
      if (at % 3 === 0 && at / 3 < a.count) out.push(salvoShot(at / 3, a.count, a.speed, a.spin, boss, ship));
      break;
    case "minefield":
      if (at === 0) for (let i = 0; i < a.count; i++) out.push(mine(i, a.spin, ship));
      break;
    case "broadside":
      if (at % 8 === 0 && at / 8 < 3) out.push(...broadsideColumn(boss, a.extra, a.speed));
      break;
    case "armada":
      if (at % 3 === 0 && at / 3 < a.count) out.push(salvoShot(at / 3, a.count, a.speed, a.spin, boss, ship));
      if (at === 50) for (let i = 0; i < 6; i++) out.push(mine(i, a.spin + 3, ship));
      if (at >= 100 && (at - 100) % 8 === 0 && (at - 100) / 8 < 3) out.push(...broadsideColumn(boss, a.extra, a.speed));
      if (at === 150) { out.push(...ring(boss, 24, 1.8, a.spin, a.gap, "scrap", 3)); out.push(...ring(boss, 24, 2.3, a.spin + Math.PI, a.gap, "scrap", 3)); }
      break;
    default:
      break;
  }
  return out;
}
