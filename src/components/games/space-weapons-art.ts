/* The new weapons and what they do: the ice bomb, the flame, the katana's swing and
   wave, and the ice over a frozen enemy. Flat
   shapes with a dark rim, like the rest of the game. */
import { BOMBS, FLAME, KATANA, W, podMuzzle, type Enemy, type State } from "./space-logic";

type Ctx = CanvasRenderingContext2D;
type Bullet = State["bullets"][number];

const INK = "#171717";

function poly(ctx: Ctx, pts: number[][], fill: string, rim?: string, width = 0.8) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (rim) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function drawIceBomb(ctx: Ctx, b: Bullet, reduceMotion: boolean) {
  const spin = reduceMotion ? 0 : (b.life ?? 0) * 0.18;
  /* A trail of frost behind it. */
  for (let i = 1; i <= 3; i++) {
    ctx.fillStyle = `rgb(186 230 253 / ${0.4 - i * 0.1})`;
    ctx.beginPath();
    ctx.arc(b.x - i * 4.5, b.y + Math.sin(spin + i) * 0.9, 3.2 - i * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(spin);
  for (let k = 0; k < 6; k++) {
    ctx.rotate(Math.PI / 3);
    poly(ctx, [[3.4, -1.1], [7, 0], [3.4, 1.1]], "#e0f2fe", INK, 0.5);
  }
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, 0, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7dd3fc";
  ctx.beginPath();
  ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0f9ff";
  ctx.beginPath();
  ctx.arc(-1, -1.1, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* A lick of fire: a teardrop along its flight that shrinks and darkens as it dies. */
function drawFlame(ctx: Ctx, b: Bullet, reduceMotion: boolean) {
  const u = Math.max(0, Math.min(1, (b.life ?? 0) / FLAME.life));
  const flick = reduceMotion ? 0 : Math.sin((b.x + b.y) * 0.9) * 0.8;
  const r = 1.6 + (1 - u) * 3.4;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  ctx.globalAlpha = 0.45 + u * 0.55;
  poly(ctx, [[-r * 2.2, 0], [-r * 0.5, -r * 1.1 + flick], [r * 0.9, 0], [-r * 0.5, r * 1.1 - flick]], u > 0.45 ? "#fb923c" : "#dc2626");
  poly(ctx, [[-r * 1.2, 0], [-r * 0.2, -r * 0.55], [r * 0.5, 0], [-r * 0.2, r * 0.55]], u > 0.6 ? "#fde047" : "#fdba74");
  ctx.restore();
}

/* The wave the katana throws: a thin bright arc, convex edge forward. */
function drawSlashWave(ctx: Ctx, b: Bullet) {
  const u = Math.max(0, Math.min(1, (b.life ?? 0) / 22));
  ctx.save();
  ctx.globalAlpha = 0.35 + u * 0.65;
  for (const [back, width, colour] of [[3, 5.5, "rgb(23 23 23 / 0.6)"], [0, 3.4, "#e2e8f0"], [0, 1.4, "#ffffff"]] as const) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(b.x - 11 - back, b.y, 14, -0.95, 0.95);
    ctx.stroke();
  }
  ctx.restore();
}

/* Draws the player's shots that are not the old ones; returns false for any other. */
export function drawWeaponBullet(ctx: Ctx, b: Bullet, reduceMotion = false): boolean {
  if (b.own !== "p") return false;
  switch (b.kind) {
    case "icebomb": drawIceBomb(ctx, b, reduceMotion); return true;
    case "flame": drawFlame(ctx, b, reduceMotion); return true;
    case "slash": drawSlashWave(ctx, b); return true;
    default: return false;
  }
}

/* The ice over an enemy that is frozen: a pale shell, crystals on top, and a flicker
   as it begins to thaw. */
export function drawFrozen(ctx: Ctx, e: Enemy, reduceMotion = false) {
  if (e.freeze === undefined || e.freeze <= 0) return;
  const thaw = e.freeze < 24 && !reduceMotion && Math.floor(e.freeze / 3) % 2 === 0;
  ctx.save();
  ctx.globalAlpha = thaw ? 0.45 : Math.min(0.9, e.freeze / 14);
  ctx.fillStyle = "rgb(186 230 253 / 0.5)";
  ctx.strokeStyle = "rgb(125 211 252)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(e.x - 1.5, e.y - 1.5, e.w + 3, e.h + 3, 3);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const x = e.x + e.w * (0.2 + i * 0.3);
    poly(ctx, [[x - 2, e.y - 1], [x, e.y - 5 - (i % 2) * 2], [x + 2, e.y - 1]], "#e0f2fe", INK, 0.5);
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(e.x + e.w * 0.25, e.y + e.h * 0.25, 2.6, 1);
  ctx.fillRect(e.x + e.w * 0.6, e.y + e.h * 0.6, 1, 2.4);
  ctx.restore();
}

/* The katana's swing: a blade of light sweeping down through the reach in front of the
   ship, with the slash left behind it. */
export function drawSlash(ctx: Ctx, s: State, reduceMotion = false) {
  const p = s.p;
  if (p.slashT <= 0 || s.phase === "launch") return;
  const u = 1 - p.slashT / 10;
  const m = podMuzzle(p);
  const a0 = -1.05 + u * 2.1;
  ctx.save();
  ctx.translate(m.x - 4, m.y);
  ctx.lineCap = "round";
  if (!reduceMotion) {
    for (const [from, alpha, width] of [[a0 - 0.7, 0.25, 5], [a0 - 0.35, 0.45, 4]] as const) {
      ctx.strokeStyle = `rgb(226 232 240 / ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(0, 0, KATANA.reach * 0.8, from, a0);
      ctx.stroke();
    }
  }
  ctx.rotate(a0);
  ctx.strokeStyle = "rgb(23 23 23 / 0.7)";
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(KATANA.reach, 0);
  ctx.stroke();
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(KATANA.reach, 0);
  ctx.stroke();
  ctx.strokeStyle = "#fbcf33";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(6.5, 0);
  ctx.stroke();
  ctx.restore();
}

/* The ten timed bombs: round, dark, with a fuse that burns down over three seconds and a
   lamp that blinks faster and faster until each goes off. */
export function drawTimedBombs(ctx: Ctx, s: State, reduceMotion = false) {
  for (const b of s.timedBombs) {
    const left = 1 - b.t / BOMBS.fuse;
    const rate = 14 - left * 10;
    const lit = reduceMotion ? left < 0.35 : Math.floor(b.t / Math.max(2, rate)) % 2 === 0;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = "rgb(0 0 0 / 0.25)";
    ctx.beginPath();
    ctx.ellipse(0.8, 1.8, 4.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.fillRect(-1.8, -2.6, 1.8, 1);
    /* The fuse and its spark, shorter as the time runs out. */
    ctx.strokeStyle = "#a16207";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(1.2, -3.2);
    ctx.lineTo(2.6 + left * 1.4, -5.2 - left * 1.2);
    ctx.stroke();
    if (lit) {
      ctx.fillStyle = "#fbcf33";
      ctx.beginPath();
      ctx.arc(2.6 + left * 1.4, -5.2 - left * 1.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    /* The last half second: a ring marking how far it will reach. */
    if (b.t > BOMBS.fuse - 30) {
      ctx.strokeStyle = `rgb(251 207 51 / ${0.14 + 0.14 * (Math.floor(b.t / 6) % 2)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, BOMBS.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* A nuclear warhead on its way: a long white missile with a red band, hazard stripes and
   a long hot tail, turned toward where it is going. */
export function drawWarheads(ctx: Ctx, s: State, reduceMotion = false) {
  for (const w of s.warheads) {
    const ang = Math.atan2(w.vy, w.vx);
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.rotate(ang);
    const flick = reduceMotion ? 0.5 : (w.t % 4) / 4;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgb(${i < 2 ? "251 207 51" : "249 115 22"} / ${0.5 - i * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(-9 - i * 5, 0, 5 - i * 0.7 + flick, 2.2 - i * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    poly(ctx, [[-7, -3.6], [-11, -6.4], [-5, -3.6]], "#b91c1c", INK, 0.7);
    poly(ctx, [[-7, 3.6], [-11, 6.4], [-5, 3.6]], "#b91c1c", INK, 0.7);
    ctx.fillStyle = "#f1f5f9";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(5, -3);
    ctx.quadraticCurveTo(11, -2.6, 13, 0);
    ctx.quadraticCurveTo(11, 2.6, 5, 3);
    ctx.lineTo(-8, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(-1, -3, 3.2, 6);
    ctx.fillStyle = "#fbcf33";
    ctx.fillRect(-5.6, -3, 1.4, 6);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(7, 0, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fbcf33";
    ctx.fillRect(6.4, -0.5, 1.2, 1);
    ctx.restore();
  }
}

/* The stars streaking past: thin bright lines along the flight, longer the harder the
   warp. Several fixed lanes, each running at its own speed, so it reads as speed and not
   as noise. */
export function drawWarp(ctx: Ctx, s: State, power: number, reduceMotion = false) {
  if (power <= 0.02) return;
  const lanes = reduceMotion ? 10 : 26;
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < lanes; i++) {
    const seed = (i * 97 + 31) % 211;
    const y = 6 + ((seed * 13) % 168);
    const speed = 5 + (seed % 7) * 1.6;
    const x = W - (((s.frame * speed * (0.6 + power * 1.4) + seed * 23) % (W + 120)) - 60);
    const len = (14 + (seed % 5) * 7) * power;
    ctx.strokeStyle = `rgb(${i % 3 === 0 ? "251 207 51" : "226 232 240"} / ${0.15 + 0.4 * power})`;
    ctx.lineWidth = 0.6 + (seed % 3) * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

/* The last boss's shield: a pale bubble around it that flashes where it is hit and
   thins as it wears down. */
export function drawBossShield(ctx: Ctx, e: Enemy, reduceMotion = false) {
  if (e.shield === undefined || e.maxShield === undefined || e.shield <= 0) return;
  const share = e.shield / e.maxShield;
  const hit = e.shieldHit !== undefined && e.shieldHit > 0 ? e.shieldHit / 8 : 0;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const rx = e.w / 2 + 12;
  const ry = e.h / 2 + 12;
  ctx.save();
  ctx.fillStyle = `rgb(125 211 252 / ${0.06 + share * 0.07 + hit * 0.22})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgb(186 230 253 / ${0.35 + share * 0.3 + hit * 0.3})`;
  ctx.lineWidth = 1 + hit * 1.4;
  /* A low shield breaks up into arcs. */
  if (share < 0.35 && !reduceMotion) ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
