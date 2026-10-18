/* Space 2's own enemy pieces: the submarine under the water, the stinger that Earth Force fires in
   place of a torpedo, and the long sea missile that climbs out of the water and bursts on its own.
   Flat shapes, a dark rim; a hostile missile keeps a pale body and a red nose on any sky. */
import { WATER_Y, type Enemy, type State } from "./space-logic";

import { drawDeckRocket } from "./space2-arsenal-art";
import { machineKit, MACHINE } from "./space2-machine-art";

type Ctx = CanvasRenderingContext2D;
type Bullet = State["bullets"][number];

const INK = "#1f262b";

function poly(ctx: Ctx, pts: number[][], fill: string, rim = INK, width = 0.7) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = width;
  ctx.stroke();
}

/* A submarine: its hull a dark shape seen through the water, the sail and periscope above the
   surface with a little wake, and the hatch that glows as a missile leaves. */
export function drawSub(ctx: Ctx, e: Enemy, reduceMotion = false): boolean {
  if (e.type !== "sub") return false;
  const { x, y, w, h } = e;
  const t = reduceMotion ? 0 : e.t;
  ctx.save();
  /* Under the surface: drawn faint, as if through the water. */
  ctx.globalAlpha = 0.55;
  poly(ctx, [[x, y + h * 0.55], [x + 6, y + 2], [x + w - 4, y + 2], [x + w, y + h * 0.5], [x + w - 6, y + h], [x + 6, y + h]], "#1e293b", "#0b1220");
  ctx.globalAlpha = 1;
  /* The sail breaks the surface. */
  poly(ctx, [[x + w * 0.5, WATER_Y + 1], [x + w * 0.54, y - 7], [x + w * 0.74, y - 7], [x + w * 0.78, WATER_Y + 1]], "#475569");
  poly(ctx, [[x + w * 0.54, y - 7], [x + w * 0.74, y - 7], [x + w * 0.72, y - 5], [x + w * 0.56, y - 5]], "#94a3b8");
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(x + w * 0.58, y - 3.5, 4, 1.2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.66, y - 7);
  ctx.lineTo(x + w * 0.66, y - 13);
  ctx.lineTo(x + w * 0.62, y - 13);
  ctx.stroke();
  /* The hatch, lit while a missile leaves it. */
  ctx.fillStyle = e.n > 0 ? (e.n % 4 < 2 ? "#fff1c9" : "#fb923c") : "#334155";
  ctx.fillRect(x + w * 0.6 - 2, WATER_Y - 1, 5, 2);
  /* The wake. */
  ctx.fillStyle = "rgb(255 255 255 / 0.55)";
  for (let i = 0; i < 4; i++) ctx.fillRect(x + w * 0.8 + i * 5 + (t % 5), WATER_Y + (i % 2), 4, 1);
  ctx.restore();
  return true;
}

/* A stinger: slim, pale, a red nose, small fins, and a short white trail. */
function drawStinger(ctx: Ctx, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  for (let i = 1; i <= 3; i++) {
    ctx.fillStyle = `rgb(241 245 249 / ${0.45 - i * 0.12})`;
    ctx.beginPath();
    ctx.arc(-4 - i * 2.6, 0, 1.6 - i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  poly(ctx, [[-4, -1.2], [2.6, -1.2], [5, 0], [2.6, 1.2], [-4, 1.2]], "#e2e8f0");
  poly(ctx, [[2.6, -1.2], [5, 0], [2.6, 1.2]], "#ef4444", INK, 0.5);
  poly(ctx, [[-4, -1.2], [-5.6, -2.6], [-3, -1.2]], "#94a3b8", INK, 0.4);
  poly(ctx, [[-4, 1.2], [-5.6, 2.6], [-3, 1.2]], "#94a3b8", INK, 0.4);
  ctx.restore();
}

/* A sea missile: long, with a steel body, a red band near its nose, fins, and a flame; it blinks
   faster as it is about to burst. */
function drawSeaMissile(ctx: Ctx, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  const blink = (b.fuse ?? 99) < 24 && (b.fuse ?? 0) % 6 < 3;
  for (let i = 1; i <= 4; i++) {
    ctx.fillStyle = `rgb(203 213 225 / ${0.5 - i * 0.1})`;
    ctx.beginPath();
    ctx.arc(-9 - i * 3.2, 0, 2.4 - i * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  poly(ctx, [[-8, -1.8], [-9.5, 0], [-8, 1.8]], "#fde68a", "#f59e0b", 0.5);
  poly(ctx, [[-8, -1.8], [5, -1.8], [9, 0], [5, 1.8], [-8, 1.8]], "#64748b");
  poly(ctx, [[5, -1.8], [9, 0], [5, 1.8]], blink ? "#fff1c9" : "#ef4444", INK, 0.5);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(1.6, -1.8, 1.4, 3.6);
  poly(ctx, [[-8, -1.8], [-10, -4], [-5.5, -1.8]], "#475569", INK, 0.4);
  poly(ctx, [[-8, 1.8], [-10, 4], [-5.5, 1.8]], "#475569", INK, 0.4);
  ctx.restore();
}

/* The ship's own stinger: Space 1's blue and gold, a gold nose and a cyan trail. */
function drawOwnStinger(ctx: Ctx, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  for (let i = 1; i <= 4; i++) {
    ctx.fillStyle = `rgb(103 232 249 / ${0.5 - i * 0.11})`;
    ctx.beginPath();
    ctx.arc(-4.5 - i * 2.8, 0, 1.8 - i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  poly(ctx, [[-4.5, -1.4], [3, -1.4], [6, 0], [3, 1.4], [-4.5, 1.4]], "#3b82f6");
  poly(ctx, [[3, -1.4], [6, 0], [3, 1.4]], "#fbcf33", INK, 0.5);
  poly(ctx, [[-4.5, -1.4], [-6.4, -3], [-3.2, -1.4]], "#e2e8f0", INK, 0.4);
  poly(ctx, [[-4.5, 1.4], [-6.4, 3], [-3.2, 1.4]], "#e2e8f0", INK, 0.4);
  ctx.restore();
}

/* Draws Space 2's missiles, the enemy's and the ship's stingers; returns false for any other shot. */
export function drawSecondBullet(ctx: Ctx, b: Bullet): boolean {
  if (b.own === "p" && b.kind === "stinger") {
    drawOwnStinger(ctx, b);
    return true;
  }
  if (b.own !== "e") return false;
  if (b.patternOwner !== undefined && ["orb", "spiral", "needle", "ice"].includes(b.kind)) {
    const c = MACHINE;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
    const m = machineKit(ctx, 0, 0);
    if (b.kind === "needle") {
      m.poly([[-5, -1.1], [2, -1.1], [5, 0], [2, 1.1], [-5, 1.1]], c.hostile);
      m.box(-2, -0.5, 4, 1, c.cream);
    } else if (b.kind === "ice") {
      m.disc(0, 0, b.r, "#7dd3fc");
      m.poly([[-b.r, 0], [0, -b.r], [b.r, 0], [0, b.r]], "#dbeafe");
    } else {
      m.disc(0, 0, b.r, b.kind === "spiral" ? "#d98adf" : c.hostile);
      if (b.kind === "spiral") m.poly([[-b.r + 0.5, 0], [0, -b.r + 0.5], [b.r - 0.5, 0], [0, b.r - 0.5]], c.cream);
      else m.disc(-0.5, -0.6, Math.max(0.7, b.r * 0.33), c.cream);
    }
    ctx.restore(); return true;
  }
  if (b.kind === "deckrocket") drawDeckRocket(ctx, b);
  else if (b.kind === "stinger") drawStinger(ctx, b);
  else if (b.kind === "seamissile") drawSeaMissile(ctx, b);
  else return false;
  return true;
}
