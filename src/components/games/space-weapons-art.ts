/* The new weapons and what they do: the ice bomb, the flame, the katana's swing and
   wave, and the ice over a frozen enemy. Flat
   shapes with a dark rim, like the rest of the game. */
import { BLOOM, BOMBS, FLAME, H, HYPER, KATANA, W, domeCenter, podMuzzle, type Enemy, type State } from "./space-logic";

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

/* Mini rockets: short, fat, lime-tipped, with a thin trail of smoke behind. */
function drawRocket(ctx: Ctx, b: Bullet, reduceMotion: boolean) {
  const a = Math.atan2(b.vy, b.vx);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(a);
  for (let i = 1; i <= 3; i++) {
    ctx.fillStyle = `rgb(203 213 225 / ${0.42 - i * 0.1})`;
    ctx.beginPath();
    ctx.arc(-4 - i * 3.2, reduceMotion ? 0 : Math.sin(i + b.x * 0.2) * 0.5, 2.1 - i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  poly(ctx, [[-3.6, -1.9], [2.4, -1.9], [4.6, 0], [2.4, 1.9], [-3.6, 1.9]], "#94a3b8", INK, 0.6);
  poly(ctx, [[2.4, -1.9], [4.6, 0], [2.4, 1.9]], "#a3e635", INK, 0.5);
  poly(ctx, [[-3.6, -1.9], [-5.2, -3.2], [-2.6, -1.9]], "#64748b", INK, 0.4);
  poly(ctx, [[-3.6, 1.9], [-5.2, 3.2], [-2.6, 1.9]], "#64748b", INK, 0.4);
  ctx.fillStyle = "#fde047";
  ctx.fillRect(-5.2, -0.5, 1.6, 1);
  ctx.restore();
}

/* A petal shed by Bloom: a small teardrop in the umbrella's colours. */
function drawPetal(ctx: Ctx, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  poly(ctx, [[-3.4, 0], [-0.6, -2.2], [3.4, 0], [-0.6, 2.2]], "#99f6e4", INK, 0.5);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-1, -0.4, 2.2, 0.8);
  ctx.restore();
}

/* Draws the player's shots that are not the old ones; returns false for any other. */
export function drawWeaponBullet(ctx: Ctx, b: Bullet, reduceMotion = false): boolean {
  if (b.own !== "p") return false;
  switch (b.kind) {
    case "icebomb": drawIceBomb(ctx, b, reduceMotion); return true;
    case "flame": drawFlame(ctx, b, reduceMotion); return true;
    case "slash": drawSlashWave(ctx, b); return true;
    case "minirocket": drawRocket(ctx, b, reduceMotion); return true;
    case "petal": drawPetal(ctx, b); return true;
    default: return false;
  }
}


/* Bloom: when it opens, five petals swing out in a half-dome ahead of the nose, ink-rimmed with a
   teal edge, a bright seam where they meet. It shrinks to nothing as it closes. */
export function drawBloom(ctx: Ctx, s: State, reduceMotion = false) {
  const p = s.p;
  if (p.dome <= 0.02 || s.phase === "launch") return;
  const c = domeCenter(p);
  const r = BLOOM.radius * p.dome;
  const sway = reduceMotion ? 0 : Math.sin(s.frame / 5) * 0.04;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.globalAlpha = 0.35 + p.dome * 0.6;
  for (let i = 0; i < 5; i++) {
    const a0 = -Math.PI / 2 + (i * Math.PI) / 5 + sway;
    const a1 = a0 + Math.PI / 5 - 0.03;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? "rgb(94 234 212 / 0.22)" : "rgb(153 246 228 / 0.3)";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.strokeStyle = "#5eead4";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.restore();
}

/* The hyperbeam. While it charges a thin guide line runs ahead and a ring closes on the nose; then
   the beam is white-hot in the middle with a coral edge and a cyan fringe. */
export function drawHyper(ctx: Ctx, s: State, reduceMotion = false) {
  const h = s.hyper;
  if (!h) return;
  if (h.live === 0) {
    const u = Math.min(1, h.t / HYPER.charge);
    ctx.save();
    ctx.globalAlpha = 0.25 + u * 0.55;
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 1 + u;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(h.x, h.y);
    ctx.lineTo(W, h.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(h.x + 3, h.y, 9 - u * 5, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgb(255 255 255 / ${0.4 + u * 0.5})`;
    ctx.beginPath();
    ctx.arc(h.x + 3, h.y, 1.5 + u * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const fade = Math.min(1, h.live / 6);
  const flick = reduceMotion ? 0 : (s.frame % 2) * 1.2;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.globalCompositeOperation = "lighter";

  // Heavy Outer Plasma Bloom
  const bgGrad = ctx.createLinearGradient(0, h.y - HYPER.h - 8, 0, h.y + HYPER.h + 8);
  bgGrad.addColorStop(0, "rgb(14 165 233 / 0)");
  bgGrad.addColorStop(0.3, "rgb(244 63 94 / 0.45)");
  bgGrad.addColorStop(0.5, "rgb(103 232 249 / 0.9)");
  bgGrad.addColorStop(0.7, "rgb(244 63 94 / 0.45)");
  bgGrad.addColorStop(1, "rgb(14 165 233 / 0)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(h.x, h.y - HYPER.h - 6 - flick, W - h.x, HYPER.h * 2 + 12 + flick * 2);

  // Core Plasma Shaft
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(h.x, h.y - HYPER.h * 0.45, W - h.x, HYPER.h * 0.9);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(h.x, h.y - HYPER.h * 0.22, W - h.x, HYPER.h * 0.44);

  // High-Voltage Lightning Filament Coils wrapping the hyperbeam
  if (!reduceMotion) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = h.x; x < W; x += 16) {
      const cy = h.y + Math.sin(x * 0.15 + s.frame * 0.8) * (HYPER.h * 0.65);
      if (x === h.x) ctx.moveTo(x, cy);
      else ctx.lineTo(x, cy);
    }
    ctx.stroke();

    // Muzzle Lens Flare Cross
    const flareR = 26;
    ctx.fillStyle = "rgb(255 255 255 / 0.95)";
    ctx.beginPath();
    ctx.moveTo(h.x - flareR, h.y);
    ctx.lineTo(h.x + 4, h.y - 3);
    ctx.lineTo(h.x + flareR, h.y);
    ctx.lineTo(h.x + 4, h.y + 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(h.x + 4, h.y - flareR * 0.7);
    ctx.lineTo(h.x + 7, h.y);
    ctx.lineTo(h.x + 4, h.y + flareR * 0.7);
    ctx.lineTo(h.x + 1, h.y);
    ctx.fill();

    // Plasma Spray Particles
    ctx.fillStyle = "#e0f2fe";
    for (let i = 0; i < 5; i++) {
      const spSeed = (s.frame * 19 + i * 41) % 100;
      const px = h.x + (spSeed / 100) * (W - h.x);
      const py = h.y + ((spSeed * 13) % 20 - 10) * 0.8;
      ctx.fillRect(px, py, 1.5, 1.5);
    }
  }

  ctx.restore();
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

/* Heavy Katana Slash VFX: Brilliant crescent energy blade wave, cutting spark spray, and blazing wake. */
export function drawSlash(ctx: Ctx, s: State, reduceMotion = false) {
  const p = s.p;
  if (p.slashT <= 0 || s.phase === "launch") return;
  const u = 1 - p.slashT / 10;
  const m = podMuzzle(p);
  const a0 = -1.05 + u * 2.1;
  ctx.save();
  ctx.translate(m.x - 4, m.y);
  ctx.lineCap = "round";

  // Heavy Crescent Energy Arc Blade
  if (!reduceMotion) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const [from, alpha, width, col] of [
      [a0 - 0.85, 0.22, 9, "#38bdf8"],
      [a0 - 0.55, 0.45, 6, "#818cf8"],
      [a0 - 0.25, 0.85, 3.5, "#ffffff"],
    ] as const) {
      ctx.strokeStyle = col;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(0, 0, KATANA.reach * 0.85, from, a0);
      ctx.stroke();
    }

    // Cutting Blade Sparks
    ctx.fillStyle = "#fde047";
    for (let i = 0; i < 4; i++) {
      const spAng = a0 - i * 0.15;
      const spR = KATANA.reach * (0.7 + (i % 3) * 0.1);
      ctx.fillRect(Math.cos(spAng) * spR, Math.sin(spAng) * spR, 1.5, 1.5);
    }
    ctx.restore();
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

/* The stars streaking past: luminous relativistic hyperdrive lines along the flight,
   stretching into light corridors as warp reaches peak power. */
export function drawWarp(ctx: Ctx, s: State, power: number, reduceMotion = false) {
  if (power <= 0.02) return;
  const lanes = reduceMotion ? 12 : 42;
  ctx.save();
  ctx.lineCap = "round";

  // Optical warp acceleration corridor when speed is intense
  if (power > 0.75 && !reduceMotion) {
    const warpBloom = ctx.createLinearGradient(0, 0, W, 0);
    warpBloom.addColorStop(0, "rgb(14 165 233 / 0)");
    warpBloom.addColorStop(0.65, `rgb(56 189 248 / ${(power - 0.75) * 0.35})`);
    warpBloom.addColorStop(1, `rgb(255 255 255 / ${(power - 0.75) * 0.45})`);
    ctx.fillStyle = warpBloom;
    ctx.fillRect(0, H / 2 - 25, W, 50);
  }

  for (let i = 0; i < lanes; i++) {
    const seed = (i * 97 + 31) % 211;
    const y = 6 + ((seed * 13) % 168);
    const speed = 6 + (seed % 7) * 2.2;
    const x = W - (((s.frame * speed * (0.6 + power * 1.6) + seed * 23) % (W + 180)) - 80);
    const len = (16 + (seed % 6) * 12) * (power * (1 + power * 1.8));

    const color = i % 4 === 0 ? "56 189 248" : i % 4 === 1 ? "251 191 36" : i % 4 === 2 ? "224 242 254" : "255 255 255";
    ctx.strokeStyle = `rgb(${color} / ${0.2 + 0.65 * power})`;
    ctx.lineWidth = 0.7 + (seed % 3) * 0.45;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();

    // White-hot leading star head during high warp
    if (power > 0.5 && !reduceMotion && i % 2 === 0) {
      ctx.fillStyle = `rgb(255 255 255 / ${0.3 + 0.7 * power})`;
      ctx.fillRect(x - 1, y - 0.65, 2.2, 1.3);
    }
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

/* Kite, ORB's wingman: a small teal craft with a white canopy, flying a little behind and above
   the ship. Its gun kicks back when it fires, and its engine burns brighter as it catches up. */
export function drawKite(ctx: Ctx, s: State, reduceMotion = false) {
  const k = s.kite;
  if (!k || s.phase === "launch") return;
  const flick = reduceMotion ? 0 : (s.frame % 4) * 0.4;
  ctx.save();
  ctx.translate(k.x, k.y);
  poly(ctx, [[-4, 2], [-8 - flick, 0], [-8 - flick * 1.4, 4], [-4, 3.5]], "#fde68a");
  poly(ctx, [[-4, 0], [6, -1], [12, 2.5], [6, 5], [-4, 5]], "#14b8a6", INK, 0.8);
  poly(ctx, [[-4, 0], [6, -1], [9, 1], [-2, 1.8]], "#5eead4");
  poly(ctx, [[2, -3.5], [6, -1], [0, -0.5]], "#0f766e", INK, 0.6);
  poly(ctx, [[2, 8], [6, 5], [0, 5]], "#0f766e", INK, 0.6);
  poly(ctx, [[3, 0.6], [7, 0.4], [8, 2.2], [4, 2.2]], "#f1f5f9", INK, 0.5);
  const kick = k.kick > 0 ? 1 : 0;
  ctx.fillStyle = INK;
  ctx.fillRect(9 - kick, 3, 4, 1);
  if (k.kick > 2) poly(ctx, [[13, 2.4], [16, 3.5], [13, 4.6]], "#fff7c2");
  /* Its Bloom: a teal ring under it that fills as it recharges, bright when ready. */
  const ready = s.coverCd === 0 && s.coverT === 0;
  ctx.strokeStyle = ready ? "#5eead4" : "rgb(94 234 212 / 0.35)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(3, 9, 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (ready ? 1 : 1 - s.coverCd / 420));
  ctx.stroke();
  ctx.restore();
}
