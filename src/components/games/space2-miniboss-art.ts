/* Space 2's mini bosses, in the same flat language as its bosses: dark rim, bevelled plates, Earth
   Force steel blue and olive with the amber mark. Each is drawn at its own size from its top left
   corner, with a short health bar over it, and the marks of its attack while it winds up. */
import { isMini, type Enemy } from "./space-logic";
import { MACHINE, machineKit } from "./space2-machine-art";
import { drawPatternCue } from "./space2-pattern-cues";

type Ctx = CanvasRenderingContext2D;

const AMBER = "#f59e0b";
const CORAL = "#fb7185";
const CREAM = "#fff1c9";

/* Each mini boss borrows the dense, practical machinery language of classic
   military arcade bosses: cast housings, bolted skirts and exposed weapon bays. */
function draw(ctx: Ctx, e: Enemy, reduceMotion: boolean) {
  const m = machineKit(ctx, e.x, e.y);
  const { poly, box, disc, rod, plate, bolts, vents, piston, gun, hatch } = m;
  const c = MACHINE;
  const t = reduceMotion ? 0 : e.t;
  const a = e.attack;
  const warning = !!a && a.t < a.warn;
  const firing = !!a && a.t >= a.warn && a.t < a.warn + a.live;
  const shotFrame = a ? a.t - a.warn : -1;
  const shot = firing && !!a && (
    a.kind === "sweepgun" ? shotFrame < 72 && shotFrame % 24 < 9 && shotFrame % 3 < 2 :
    ["netgun", "mortar", "shielddrones"].includes(a.kind) ? shotFrame < 56 && shotFrame % 28 < 2 :
    ["chaff", "lattice"].includes(a.kind) ? shotFrame < 60 && shotFrame % 30 < 2 :
    a.kind === "torpfan" ? shotFrame < 66 && shotFrame % 22 < 2 :
    a.kind === "featherfan" ? shotFrame < 54 && shotFrame % 18 < 2 :
    a.kind === "ladder" ? shotFrame < 72 && shotFrame % 24 < 2 : false);
  const hot = warning ? "#ffb665" : firing ? CREAM : CORAL;
  const hurt = 1 - e.hp / e.maxHp;
  const mark = (x: number, y: number) => { box(x, y, 5.5, 1, AMBER); box(x, y + 2, 3.5, 0.8, AMBER); };
  const hub = (x: number, y: number, r: number) => { disc(x, y, r, c.dark); disc(x, y, r * 0.65, c.face); disc(x, y, r * 0.22, c.cream); };
  const port = (x: number, y: number, r = 1.5) => { disc(x, y, r + 0.7, c.metal); disc(x, y, r, warning ? hot : c.ink); };
  switch (e.type) {
    case "mini9": {
      // Skyhook: twin-engine assault transport, broad belly and armoured cockpit.
      for (const rx of [15, 43]) {
        plate(rx - 6, 4, 12, 9, c.hull);
        vents(rx - 3, 7, 3, 3, 2.5);
        piston(rx, 5, rx, 1, 0.8);
        const span = reduceMotion ? 9 : 3 + Math.abs(Math.cos(t / 2)) * 8;
        rod(rx - span, 1, rx + span, 1, 0.9, c.metal);
        hub(rx, 1, 1.3);
      }
      poly([[1, 15], [6, 9], [19, 7], [45, 9], [54, 15], [51, 23], [38, 28], [12, 27], [3, 22]], c.hull);
      poly([[2, 14], [8, 9], [19, 8], [23, 13], [15, 17], [4, 18]], c.metal);
      box(6, 12, 5, 2.4, c.dark); box(13, 11, 5, 2.4, c.dark);
      plate(23, 12, 19, 10, c.face); vents(26, 15, 5, 3, 2.4);
      hatch(43, 13, 8, 8, a?.kind === "rotorwash" && (firing || warning && a.t >= a.warn - 24)); bolts(13, 24, 7, 4);
      piston(16, 23, 11, 28, 1); rod(7, 28, 26, 28, 1.3, c.dark);
      disc(12, 18, 4, c.hull); gun(2, 15, 10, 2.7, hot, shot);
      mark(31, 10); m.damage(32, 20, hurt, t);
      break;
    }
    case "mini10": {
      // Mudskipper: inflated assault skirt, twin caged fans and a heavy net launcher.
      poly([[2, 17], [8, 14], [45, 14], [51, 18], [49, 24], [43, 26], [7, 26], [1, 23]], c.dark);
      for (let i = 0; i < 10; i++) box(5 + i * 4.3, 21, 2.7, 3, i % 2 ? c.hull : c.steel);
      plate(5, 10, 38, 10, c.hull, 3); plate(12, 5, 20, 9, c.face, 2);
      box(15, 7, 5, 2, c.dark); box(22, 7, 5, 2, c.dark);
      for (const fx of [38, 46]) {
        disc(fx, 7, 5, c.hull); disc(fx, 7, 3.8, c.dark);
        const ang = t / 4;
        for (let i = 0; i < 3; i++) rod(fx, 7, fx + Math.cos(ang + i * 2.094) * 3, 7 + Math.sin(ang + i * 2.094) * 3, 0.7, c.metal);
        hub(fx, 7, 1.1);
      }
      vents(26, 15, 4, 3); gun(2, 13, 10, 4, hot, shot);
      mark(13, 16); m.damage(29, 12, hurt, t);
      break;
    }
    case "mini11": {
      // Cable Fort: a suspended armoured gun carriage with pulley bogies and a bomb hatch.
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(600, 18); ctx.stroke();
      plate(8, -1, 24, 5, c.dark, 1);
      for (const xx of [11, 29]) { hub(xx, 0, 2.4); piston(xx, 2, xx, 7, 0.8); }
      plate(1, 6, 38, 20, c.hull, 3);
      poly([[3, 8], [37, 8], [35, 11], [5, 12]], c.bevel);
      for (const xx of [13, 22, 31]) { plate(xx - 3, 13, 6, 6, c.face, 1); box(xx - 2, 14, 4, 2, c.dark); }
      gun(2, 15, 10, 3.4, hot, shot);
      hatch(14, 22, 12, 7, firing && a?.kind === "cableslide" && shotFrame % 32 > 16 && shotFrame < 96);
      vents(28, 21, 3, 3, 2.4); bolts(5, 23, 3, 3);
      mark(22, 9); m.damage(27, 18, hurt, t);
      break;
    }
    case "mini12": {
      // Sand Skimmer: a sail-assisted land battleship, not a bare cart.
      plate(2, 21, 54, 9, c.dark, 3);
      for (let i = 0; i < 8; i++) { hub(7 + i * 6.2, 26, 2.2); box(5 + i * 6.2, 29, 4, 0.8, c.metal); }
      poly([[3, 20], [10, 12], [47, 11], [56, 21], [50, 24], [7, 24]], "#85704b");
      poly([[4, 19], [10, 12], [47, 12], [50, 15], [12, 16]], "#c2b082");
      plate(8, 9, 18, 10, c.hull); disc(17, 13, 3, c.dark); gun(2, 15, 14, 3.2, hot, shot);
      piston(30, 17, 35, 1, 1.1);
      poly([[35, 1], [49, 12], [34, 14]], c.cream);
      rod(35, 1, 40, 13, 0.6, c.rust); rod(35, 1, 48, 12, 0.6, c.rust);
      plate(35, 15, 14, 7, c.hull); vents(38, 17, 3, 3);
      bolts(12, 21, 7, 5); mark(38, 13); m.damage(31, 18, hurt, t);
      break;
    }
    case "mini13": {
      // Tunnel Sentry: a fortified pillbox with recoil collars and a ribbed blast door.
      poly([[8, 0], [43, 0], [44, 52], [7, 52], [1, 40], [3, 12]], c.dark);
      plate(6, 2, 36, 48, c.hull, 4);
      plate(21, 10, 17, 33, c.face, 2);
      for (let i = 0; i < 7; i++) box(24, 14 + i * 3.5, 11, 1.2, c.dark);
      for (const gy of [12, 39]) {
        hub(13, gy, 6.3); piston(13, gy + 6, 21, gy + 7, 1.2);
        plate(5, gy - 4, 15, 8, c.steel, 2); gun(1, gy, 10, 2.6, hot, shot && (a?.kind === "lattice" || a?.kind === "ladder" && Math.floor(shotFrame / 24) === (gy === 12 ? 0 : 2)));
      }
      // Central aperture agrees with updateMini's projectile origin.
      gun(2, 26, 12, 3, hot, shot && a?.kind === "ladder" && Math.floor(shotFrame / 24) === 1);
      box(26, 7, 7, 1.4, hot); bolts(38, 8, 1); bolts(38, 45, 1);
      mark(27, 45); m.damage(27, 25, hurt, t);
      break;
    }
    case "mini14": {
      // Ice Hunter: a riveted submarine with torpedo doors and an armoured conning tower.
      poly([[0, 14], [8, 8], [60, 8], [69, 14], [66, 19], [58, 22], [9, 22], [2, 19]], c.dark);
      poly([[1, 13], [9, 8], [60, 8], [65, 11], [12, 13]], c.face);
      box(14, 17, 44, 2, c.hull); bolts(14, 14, 10, 4.5);
      plate(31, -1, 17, 11, c.hull, 2);
      poly([[33, -1], [45, -1], [46, 1], [32, 2]], c.cream);
      box(34, 3, 11, 1.3, hot);
      rod(40, 0, 40, -8, 1.2, c.metal); plate(37, -10, 7, 3, c.hull, 0.7);
      for (const yy of [12, 16]) { port(4, yy, 1.4); box(7, yy - 1, 5, 2, c.hull); }
      gun(2, 11, 8, 2.6, hot, shot); vents(51, 10, 4, 3);
      mark(53, 16); m.damage(43, 12, hurt, t);
      break;
    }
    case "mini15": {
      // Storm Petrel: folded attack wings, twin turbines and a pronounced cannon nose.
      for (const side of [-1, 1]) {
        poly([[14, 12], [26, 12 + side * 4], [47, 12 + side * 11], [42, 12 + side * 2], [29, 12]], c.hull);
        poly([[23, 12 + side * 4], [45, 12 + side * 10], [39, 12 + side * 5]], c.bevel);
        plate(28, 12 + side * 7 - 2, 13, 4, c.dark, 1);
        vents(31, 12 + side * 7 - 1, 3, 2, 2.5);
        if (!reduceMotion) poly([[41, 12 + side * 7 - 1], [46 + t % 2, 12 + side * 7], [41, 12 + side * 7 + 1]], "#dca65d");
      }
      poly([[1, 12], [12, 6], [29, 8], [34, 12], [29, 16], [12, 18]], c.face);
      disc(12, 12, 4.5, c.dark); disc(12, 12, 2.7, hot);
      gun(2, 12, 8, 2.5, hot, shot); bolts(19, 14, 3, 3);
      mark(23, 8); m.damage(26, 10, hurt, t);
      break;
    }
    case "mini16": {
      // Gatekeeper: industrial siege walker foreshadowing Atlas's reactor and shutters.
      for (const lx of [13, 35]) {
        piston(lx, 36, lx - 1, 52, 2);
        plate(lx - 4, 41, 10, 11, c.hull); hub(lx, 49, 3);
        plate(lx - 7, 54, 16, 6, c.dark, 1.5);
      }
      poly([[5, 13], [17, 8], [40, 9], [49, 22], [45, 38], [31, 44], [10, 40], [2, 28]], c.hull);
      poly([[6, 14], [18, 9], [40, 10], [43, 14], [18, 16]], c.bevel);
      plate(14, 3, 24, 12, c.face, 3);
      box(18, 7, 15, 3, c.dark); box(20, 8, 11, 1, hot);
      plate(16, 20, 19, 18, c.dark, 3);
      if (a?.kind === "shielddrones" && shotFrame >= 56 && firing) {
        disc(25.5, 29, 5.4, c.rust); disc(25.5, 29, 3.6, CORAL); disc(25.5, 29, 1.4, CREAM);
      } else for (let i = 0; i < 4; i++) box(18, 23 + i * 3.2, 15, 1.8, hurt > 0.65 ? hot : c.metal);
      piston(11, 19, 10, 30, 1.8); hub(10, 30, 4.3); gun(2, 30, 10, 3.5, hot, shot);
      plate(38, 17, 9, 13, c.steel); vents(40, 20, 2, 6);
      mark(35, 33); m.damage(34, 31, hurt, t);
      if (a?.kind === "shielddrones" && a.t >= a.warn && a.t < a.warn + 56) {
        for (let i = 0; i < 2; i++) {
          const ang = t / 10 + i * Math.PI;
          const xx = 25 + Math.cos(ang) * 29, yy = 28 + Math.sin(ang) * 29;
          disc(xx, yy, 3.2, c.dark); disc(xx - 0.7, yy, 1.3, CORAL);
        }
        ctx.strokeStyle = "rgb(251 113 133 / 0.45)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(e.x + 25, e.y + 28, 29, 31, 0, 0, Math.PI * 2); ctx.stroke();
      }
      break;
    }
  }
}

/* The marks of a mini boss's attack while it winds up: lanes, columns and spots, coral, cream once
   locked. */
/* Draws a mini boss, its health bar and its marks; returns false for anything else. */
export function drawMini(ctx: Ctx, e: Enemy, reduceMotion = false): boolean {
  if (!isMini(e.type)) return false;
  ctx.save();
  draw(ctx, e, reduceMotion);
  ctx.restore();
  const w = Math.max(30, e.w);
  ctx.fillStyle = "rgb(7 12 28 / 0.75)";
  ctx.fillRect(e.x + e.w / 2 - w / 2, e.y - 7, w, 3);
  ctx.fillStyle = CORAL;
  ctx.fillRect(e.x + e.w / 2 - w / 2, e.y - 7, (w * Math.max(0, e.hp)) / e.maxHp, 3);
  drawPatternCue(ctx, e, reduceMotion);
  return true;
}
