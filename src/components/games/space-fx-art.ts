/* Projectiles, pick-ups, beams and explosions. Light-emitting things are drawn
   additively so they glow against whatever is behind them; enemy shots keep a
   thin dark rim so they stay readable on the bright sky of the land and sea
   chapters, since a shot that cannot be seen cannot be dodged. */
import { BURST_LIFE, C4, TORPEDO, torpedoSpeed, torpedoStage, type Charge, type PickupKind, type State } from "./space-logic";
import { SHADED_ART, glow, metal, path, slab } from "./space-material";

type Ctx = CanvasRenderingContext2D;
type Bullet = State["bullets"][number];

/* The motor at a torpedo's tail, drawn the same for the ship's and the enemy's,
   in the torpedo's own frame (nose toward +x, tail at `tx`): cold while it slides
   out of the tube, a sputtering flame and a puff while it lights, then a full
   flame that grows with its speed. */
export function drawMotor(ctx: Ctx, b: Bullet, tx: number, h: number) {
  const age = b.age ?? TORPEDO.eject + TORPEDO.ignite + 99;
  const stage = torpedoStage(age);
  if (stage === "eject") {
    ctx.fillStyle = "#3f4652";
    ctx.beginPath();
    ctx.arc(tx, 0, h * 0.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (stage === "ignite") {
    const lit = age - TORPEDO.eject;
    if (lit <= 4) {
      ctx.fillStyle = `rgb(226 232 240 / ${0.7 - lit * 0.12})`;
      ctx.beginPath();
      ctx.arc(tx - 1.5, 0, 1.6 + lit * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    if (age % 3 !== 0) flame(ctx, tx, h * 0.75, 2.2 + (age % 2) * 1.4);
    return;
  }
  flame(ctx, tx, h, 3 + (torpedoSpeed(age) / TORPEDO.top) * 7 + (age % 2) * 0.8);
}

function flame(ctx: Ctx, tx: number, h: number, len: number) {
  path(ctx, [[tx, -h], [tx - len, 0], [tx, h]]);
  ctx.fillStyle = "#fb923c";
  ctx.fill();
  path(ctx, [[tx, -h * 0.5], [tx - len * 0.55, 0], [tx, h * 0.5]]);
  ctx.fillStyle = "#fff1cc";
  ctx.fill();
}

const ORB_COLOR: Record<string, string> = { orb: "#fb7185", spiral: "#e879f9", ice: "#7dd3fc", fire: "#fb923c" };

function drawFlatBullet(ctx: Ctx, b: Bullet) {
  if (b.own === "p") {
    if (b.kind === "mg") {
      ctx.fillStyle = "#fb923c"; ctx.fillRect(b.x - 4, b.y - 0.8, 8, 1.6);
      ctx.fillStyle = "#fff1cc"; ctx.fillRect(b.x, b.y - 0.6, 3, 1.2); return;
    }
    if (b.kind === "laser") {
      ctx.fillStyle = "rgb(34 211 238 / 0.3)"; ctx.fillRect(b.x - 26, b.y - 2.4, 30, 4.8);
      ctx.fillStyle = "#67e8f9"; ctx.fillRect(b.x - 24, b.y - 1.2, 28, 2.4);
      ctx.fillStyle = "#fff1cc"; ctx.fillRect(b.x - 22, b.y - 0.5, 26, 1); return;
    }
    if (b.kind === "torpedo") {
      ctx.save(); ctx.translate(b.x, b.y);
      if (torpedoStage(b.age ?? 99) === "burn") {
        ctx.fillStyle = "#cfe8ff";
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-19 - i * 3.4, Math.sin(((b.life ?? 0) / 3) + i) * 1, 1 - i * 0.2, 0, Math.PI * 2); ctx.fill(); }
      }
      drawMotor(ctx, b, -9, 1.8);
      path(ctx, [[-8, -1.7], [-11, -4], [-6, -1.7]]); ctx.fillStyle = "#64748b"; ctx.fill();
      path(ctx, [[-8, 1.7], [-11, 4], [-6, 1.7]]); ctx.fillStyle = "#64748b"; ctx.fill();
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(-9, -1.8, 13, 3.6);
      ctx.fillStyle = "#facc15"; ctx.fillRect(-3, -1.8, 1.4, 3.6);
      path(ctx, [[4, -1.8], [8, 0], [4, 1.8]]); ctx.fillStyle = "#ef4444"; ctx.fill(); ctx.restore(); return;
    }
    if (b.kind === "spread") {
      ctx.beginPath(); ctx.arc(b.x, b.y, 2.4, 0, Math.PI * 2); ctx.fillStyle = "#a3e635"; ctx.fill();
      ctx.fillStyle = "#ecfccb"; ctx.fillRect(b.x - 0.6, b.y - 0.6, 1.2, 1.2); return;
    }
    ctx.fillStyle = "#fbcf33"; ctx.fillRect(b.x - 4, b.y - 1.5, 8, 3);
    ctx.fillStyle = "#fff1cc"; ctx.fillRect(b.x - 1, b.y - 0.5, 5, 1); return;
  }
}

const TORPEDO_COLOR: Record<string, string> = { ...ORB_COLOR, needle: "#fbbf24" };

/* Every enemy shot is a torpedo, pointing the way it travels: a steel body, fins at
   the tail, a warhead and band in the colour that tells the kinds apart, and the
   same motor as the ship's torpedo (drawMotor). The dark rim around it keeps it
   readable against any sky. Bigger shots are bigger torpedoes, and the marked
   shot of a sniper is a long thin one. */
function drawEnemyTorpedo(ctx: Ctx, b: Bullet) {
  const c = TORPEDO_COLOR[b.kind] ?? TORPEDO_COLOR.orb;
  const needle = b.kind === "needle";
  const len = needle ? 15 : 8 + b.r * 2.2;
  const hb = needle ? 1.15 : 1.1 + b.r * 0.38;
  const tail = -len * 0.55;
  const shoulder = len * 0.18;
  const nose = len * 0.48;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  path(ctx, [[tail - 1.2, -hb - 1.1], [shoulder + 0.6, -hb - 1.1], [nose + 1.2, 0], [shoulder + 0.6, hb + 1.1], [tail - 1.2, hb + 1.1]]);
  ctx.fillStyle = "rgb(23 23 23 / 0.8)";
  ctx.fill();
  for (const side of [-1, 1]) {
    path(ctx, [[tail + len * 0.16, side * hb], [tail - 0.6, side * (hb + 2.2)], [tail + len * 0.02, side * hb]]);
    ctx.fillStyle = "#6b7482";
    ctx.fill();
  }
  if (SHADED_ART) slab(ctx, tail, -hb, shoulder - tail, hb * 2, hb, "#6b7482", { sheen: 0.3 });
  else {
    ctx.fillStyle = "#6b7482";
    ctx.fillRect(tail, -hb, shoulder - tail, hb * 2);
  }
  ctx.fillStyle = c;
  ctx.fillRect(tail + (shoulder - tail) * 0.35, -hb, (shoulder - tail) * 0.22, hb * 2);
  path(ctx, [[shoulder, -hb], [nose, 0], [shoulder, hb]]);
  ctx.fillStyle = c;
  ctx.fill();
  drawMotor(ctx, b, tail, hb);
  ctx.restore();
}

export function drawBullet(ctx: Ctx, b: Bullet) {
  if (b.own === "e") { drawEnemyTorpedo(ctx, b); return; }
  if (!SHADED_ART) { drawFlatBullet(ctx, b); return; }
  if (b.own === "p") {
    switch (b.kind) {
      case "mg": {
        glow(ctx, b.x, b.y, 4, "#fb923c", 0.16);
        const g = ctx.createLinearGradient(b.x - 5, 0, b.x + 3, 0);
        g.addColorStop(0, "rgb(251 146 60 / 0)");
        g.addColorStop(0.6, "#fb923c");
        g.addColorStop(1, "#fff1cc");
        ctx.fillStyle = g;
        ctx.fillRect(b.x - 5, b.y - 0.8, 8, 1.6);
        return;
      }
      case "spread": {
        glow(ctx, b.x, b.y, 5, "#a3e635", 0.18);
        const g = ctx.createRadialGradient(b.x - 0.6, b.y - 0.6, 0.2, b.x, b.y, 2.7);
        g.addColorStop(0, "#f7fee7");
        g.addColorStop(0.5, "#a3e635");
        g.addColorStop(1, "#4d7c0f");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      case "laser": {
        const g = ctx.createLinearGradient(0, b.y - 3, 0, b.y + 3);
        g.addColorStop(0, "rgb(34 211 238 / 0)");
        g.addColorStop(0.35, "rgb(103 232 249 / 0.5)");
        g.addColorStop(0.5, "#ffffff");
        g.addColorStop(0.65, "rgb(103 232 249 / 0.5)");
        g.addColorStop(1, "rgb(34 211 238 / 0)");
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.fillRect(b.x - 27, b.y - 3, 31, 6);
        ctx.restore();
        ctx.fillStyle = "rgb(224 251 255 / 0.85)";
        ctx.fillRect(b.x - 23, b.y - 0.4, 27, 0.8);
        glow(ctx, b.x + 2, b.y, 5, "#22d3ee", 0.14);
        return;
      }
      case "torpedo": {
        /* A torpedo: a slim steel body, a red warhead, fins at the tail and its
           motor (drawMotor). It only ever runs straight. */
        ctx.save();
        ctx.translate(b.x, b.y);
        if (torpedoStage(b.age ?? 99) === "burn") {
          ctx.fillStyle = "rgb(207 232 255 / 0.55)";
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(-19 - i * 3.2, Math.sin((b.life ?? 0) / 3 + i) * 1.1, 1.1 - i * 0.18, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        drawMotor(ctx, b, -9, 1.8);
        metal(ctx, [[-8, -1.7], [-11, -4], [-6, -1.7]], "#566173", { sheen: 0 });
        metal(ctx, [[-8, 1.7], [-11, 4], [-6, 1.7]], "#566173", { sheen: 0 });
        slab(ctx, -9, -1.8, 14, 3.6, 1.8, "#8b96a6", { sheen: 0.3 });
        ctx.fillStyle = "#facc15";
        ctx.fillRect(-3, -1.8, 1.4, 3.6);
        metal(ctx, [[4, -1.8], [8, 0], [4, 1.8]], "#c2413a", { sheen: 0.1 });
        ctx.restore();
        return;
      }
      default: {
        /* The blaster: a short bolt of plasma with a white-hot heart. */
        glow(ctx, b.x, b.y, 5, "#fbbf24", 0.16);
        const g = ctx.createLinearGradient(b.x - 5, 0, b.x + 4, 0);
        g.addColorStop(0, "rgb(251 191 36 / 0)");
        g.addColorStop(0.45, "#fbbf24");
        g.addColorStop(1, "#fff8c9");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(b.x - 5, b.y - 1.4, 10, 2.8, 1.4);
        ctx.fill();
        ctx.fillStyle = "rgb(255 248 201 / 0.8)";
        ctx.fillRect(b.x - 1, b.y - 0.4, 4, 0.8);
        return;
      }
    }
  }
}

/* A C4 charge: a block of putty with a detonator, tumbling as it flies. Once it
   sits, its blast is marked by a dashed ring that fills as the fuse runs down,
   and its lamp blinks faster and faster. Then a flash the size of the blast, and
   a ring that fades. */
/* `hideZone` leaves out the marked blast ring, for the last boss's fight (see hidesTells). */
export function drawCharge(ctx: Ctx, c: Charge, reduceMotion: boolean, hideZone = false) {
  if (c.t < 0) return;
  const boom = c.t - C4.fuse;
  ctx.save();
  if (boom >= 0) {
    const u = boom / C4.blast;
    if (boom < 4) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = boom < 2 ? "#fff1cc" : "#fb923c";
      ctx.beginPath();
      ctx.arc(c.x, c.y, C4.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = Math.max(0, 1 - u);
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, C4.radius * (1 + u * 0.35), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const landed = c.t >= C4.flight;
  const left = C4.fuse - c.t;
  if (landed && !hideZone) {
    const k = 1 - left / (C4.fuse - C4.flight);
    ctx.fillStyle = `rgb(251 113 133 / ${0.07 + k * 0.17})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, C4.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgb(23 23 23 / 0.55)";
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(c.x, c.y, C4.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(c.x, c.y, C4.radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k);
    ctx.stroke();
  }
  ctx.translate(c.x, c.y);
  if (!landed && !reduceMotion) ctx.rotate(c.t * 0.35);
  ctx.fillStyle = "#c9b27c";
  ctx.fillRect(-4.5, -3, 9, 6);
  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-4.5, -3, 9, 6);
  ctx.fillStyle = "#374151";
  ctx.fillRect(-1.6, -3, 3.2, 6);
  const period = landed ? Math.max(3, Math.round(left / 7)) : 10;
  if (reduceMotion || Math.floor(c.t / period) % 2 === 0) {
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(-1, -1, 2, 2);
  }
  ctx.restore();
}

const PICKUP_COLOR: Record<PickupKind, string> = {
  H: "#4ade80", B: "#60a5fa", M: "#fb923c", S: "#a3e635", L: "#22d3ee", R: "#f87171", I: "#7dd3fc", F: "#f97316", K: "#e2e8f0", E: "#fbbf24",
  N: "#84cc16", Y: "#fb7185", U: "#5eead4", D: "#38bdf8",
};

/* A supply crate: a steel case with a coloured lens that carries the symbol. */
export function drawPickup(ctx: Ctx, x: number, y: number, kind: PickupKind, t: number) {
  const by = y + Math.sin(t / 12) * 1.2;
  const col = PICKUP_COLOR[kind];
  ctx.save();
  ctx.translate(x, by);
  glow(ctx, 0, 0, 17, col, 0.4 + Math.sin(t / 10) * 0.08);
  slab(ctx, -7.6, -7.6, 15.2, 15.2, 2.8, "#566071", { light: 0.35 });
  slab(ctx, -5.8, -5.8, 11.6, 11.6, 1.8, col, { light: 0.45, dark: 0.35, sheen: 0.28 });
  ctx.fillStyle = "rgb(255 255 255 / 0.45)";
  ctx.beginPath();
  ctx.ellipse(-2.2, -3.4, 2.8, 1.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgb(203 213 225 / 0.7)";
  for (const [rx, ry] of [[-6.6, -6.6], [6.6, -6.6], [-6.6, 6.6], [6.6, 6.6]]) {
    ctx.beginPath();
    ctx.arc(rx, ry, 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  const ink = "#10151f";
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.3;
  const stroke = (pts: number[][]) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.stroke();
  };
  switch (kind) {
    case "H":
    case "E":
      ctx.beginPath();
      ctx.moveTo(0, 4.4);
      ctx.bezierCurveTo(-8, -1, -3, -7, 0, -3);
      ctx.bezierCurveTo(3, -7, 8, -1, 0, 4.4);
      ctx.fill();
      if (kind === "E") {
        ctx.strokeStyle = "#fff1cc";
        ctx.lineWidth = 1.1;
        stroke([[-2, -0.5], [2, -0.5]]);
        stroke([[0, -2.5], [0, 1.5]]);
      }
      break;
    case "D":
      ctx.beginPath();
      ctx.moveTo(0, -4.8);
      ctx.lineTo(4.2, -3);
      ctx.quadraticCurveTo(4.2, 2.6, 0, 4.8);
      ctx.quadraticCurveTo(-4.2, 2.6, -4.2, -3);
      ctx.closePath();
      ctx.fill();
      break;
    case "B":
      ctx.beginPath();
      ctx.arc(-0.5, 1, 3.4, 0, Math.PI * 2);
      ctx.fill();
      stroke([[0, -2], [1, -4], [3, -4]]);
      ctx.fillRect(3.5, -5, 1.5, 1.5);
      break;
    case "M":
      for (const py of [-3, 0, 3]) ctx.fillRect(-4, py - 0.7, 8, 1.4);
      break;
    case "S":
      for (const py of [-4, 0, 4]) stroke([[-4, 0], [3, py]]);
      break;
    case "L":
      stroke([[-5, 0], [5, 0]]);
      ctx.strokeRect(-2.5, -3, 5, 6);
      break;
    case "R":
      ctx.beginPath();
      ctx.roundRect(-5, -1.8, 9.5, 3.6, 1.8);
      ctx.fill();
      stroke([[-5, -1.8], [-7.2, -4.2]]);
      stroke([[-5, 1.8], [-7.2, 4.2]]);
      break;
    case "I":
      /* A snowflake. */
      stroke([[-4.4, 0], [4.4, 0]]);
      stroke([[-2.2, -3.8], [2.2, 3.8]]);
      stroke([[-2.2, 3.8], [2.2, -3.8]]);
      break;
    case "F":
      /* A flame. */
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.bezierCurveTo(4, -1.5, 4.6, 2, 0, 4.6);
      ctx.bezierCurveTo(-4.6, 2, -2.6, -1, -1, -2);
      ctx.bezierCurveTo(-1.2, -3, -0.4, -4, 0, -5);
      ctx.fill();
      break;
    case "K":
      /* A blade on a slant, with its guard. */
      stroke([[-4.6, 4.6], [3.8, -3.8]]);
      stroke([[-3.4, 0.4], [-0.4, 3.4]]);
      break;
    case "N":
      /* Three little rockets side by side. */
      for (const py of [-3.2, 0, 3.2]) {
        ctx.beginPath();
        ctx.roundRect(-4.6, py - 0.9, 7, 1.8, 0.9);
        ctx.fill();
        stroke([[2.4, py - 1], [4.4, py], [2.4, py + 1]]);
      }
      break;
    case "Y":
      /* One long beam with a bright core. */
      ctx.fillRect(-5.4, -1.1, 10.8, 2.2);
      stroke([[-5.4, -3.6], [-5.4, 3.6]]);
      stroke([[5.4, -3.6], [5.4, 3.6]]);
      break;
    case "U":
      /* An umbrella: the canopy and its handle. */
      ctx.beginPath();
      ctx.arc(0, 0.6, 5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      stroke([[0, 0.6], [0, 4.6], [1.8, 5]]);
      break;
  }
  ctx.restore();
}

/* A beam is marked first (a dashed line and a faint lane), then fires as a
   column of white-hot energy with heavy lightning coils and impact flare. */
export function drawBeam(ctx: Ctx, bm: State["beams"][number], f: number, reduceMotion = false) {
  if (bm.t < bm.warn) {
    ctx.fillStyle = "rgb(251 113 133 / 0.12)";
    ctx.fillRect(0, bm.y - Math.max(2, bm.h / 2), bm.x0, Math.max(4, bm.h));
    ctx.strokeStyle = reduceMotion || f % 16 < 8 ? "#fb7185" : "#fda4af";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(0, bm.y);
    ctx.lineTo(bm.x0, bm.y);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }
  const top = bm.y - bm.h / 2;
  if (!SHADED_ART) {
    ctx.fillStyle = "#fb7185"; ctx.fillRect(0, top, bm.x0, bm.h);
    ctx.fillStyle = "#fff1cc"; ctx.fillRect(0, bm.y - bm.h * 0.22, bm.x0, bm.h * 0.44);
    return;
  }
  const pulse = reduceMotion ? 1 : 0.9 + 0.1 * Math.sin(f * 1.7);
  const g = ctx.createLinearGradient(0, top - 6, 0, top + bm.h + 6);
  g.addColorStop(0, "rgb(251 113 133 / 0)");
  g.addColorStop(0.2, `rgb(251 113 133 / ${0.75 * pulse})`);
  g.addColorStop(0.5, "rgb(255 241 204 / 1)");
  g.addColorStop(0.8, `rgb(251 113 133 / ${0.75 * pulse})`);
  g.addColorStop(1, "rgb(251 113 133 / 0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(0, top - 6, bm.x0, bm.h + 12);

  // Heavy electric lightning coils crawling along the beam shaft
  if (!reduceMotion) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x < bm.x0; x += 14) {
      const coilOffset = Math.sin(x * 0.12 + f * 0.8) * (bm.h * 0.6);
      if (x === 0) ctx.moveTo(x, bm.y + coilOffset);
      else ctx.lineTo(x, bm.y + coilOffset);
    }
    ctx.stroke();

    // Beam impact spark splash
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 4; i++) {
      const spAng = ((f * 17 + i * 43) % 100) / 100 * Math.PI - Math.PI / 2;
      const spDist = 4 + (i * 3.5);
      ctx.fillRect(bm.x0 + Math.cos(spAng) * spDist, bm.y + Math.sin(spAng) * spDist, 1.2, 1.2);
    }
  }

  ctx.restore();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, bm.y - bm.h * 0.16, bm.x0, bm.h * 0.32);
  glow(ctx, bm.x0, bm.y, bm.h * 1.8, "#fda4af", 0.7);
}

/* Heavy Explosion VFX: Multi-layered blooming fireball, lens flares, dual supersonic shockwaves, and kinetic spark shrapnel. */
export function drawBursts(ctx: Ctx, bursts: State["bursts"]) {
  for (const b of bursts) {
    const t = Math.min(1, b.t / BURST_LIFE);
    if (t >= 1) continue;
    const isBig = b.big;
    const radius = 3 + t * (isBig ? 28 : 14);
    const a = 1 - t;

    if (!SHADED_ART) {
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = t < 0.3 ? "#fff1cc" : "#fb923c"; ctx.lineWidth = 1.6 * a + 0.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, radius, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 6; i++) { const angle = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(b.x + Math.cos(angle) * radius * 0.6, b.y + Math.sin(angle) * radius * 0.6); ctx.lineTo(b.x + Math.cos(angle) * (radius + 4), b.y + Math.sin(angle) * (radius + 4)); ctx.stroke(); }
      ctx.restore(); continue;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // 1. Initial High-Intensity Optical Lens Flare Cross (at early ignition)
    if (t < 0.32) {
      const flareAlpha = (1 - t / 0.32) * 0.95;
      const flareSize = (isBig ? 32 : 16) * (1 - t * 0.6);
      ctx.fillStyle = `rgb(255 255 255 / ${flareAlpha})`;
      // Horizontal flare beam
      ctx.beginPath();
      ctx.moveTo(b.x - flareSize, b.y);
      ctx.lineTo(b.x, b.y - 1.2);
      ctx.lineTo(b.x + flareSize, b.y);
      ctx.lineTo(b.x, b.y + 1.2);
      ctx.fill();
      // Vertical flare beam
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - flareSize * 0.6);
      ctx.lineTo(b.x + 1.2, b.y);
      ctx.lineTo(b.x, b.y + flareSize * 0.6);
      ctx.lineTo(b.x - 1.2, b.y);
      ctx.fill();
    }

    // 2. High-Luminance Plasma Core
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius * 1.4);
    g.addColorStop(0, `rgb(255 255 255 / ${a})`);
    g.addColorStop(0.25, `rgb(254 240 138 / ${a * 0.95})`);
    g.addColorStop(0.55, `rgb(249 115 22 / ${a * 0.8})`);
    g.addColorStop(0.85, `rgb(220 38 38 / ${a * 0.45})`);
    g.addColorStop(1, "rgb(153 27 27 / 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Supersonic Primary Shockwave Blast Ring
    if (t < 0.75) {
      const shockAlpha = (1 - t / 0.75) * 0.85;
      const shockR = radius * 1.45;
      ctx.strokeStyle = `rgb(254 215 170 / ${shockAlpha})`;
      ctx.lineWidth = Math.max(0.8, (1 - t) * 2.6);
      ctx.beginPath();
      ctx.arc(b.x, b.y, shockR, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary energetic ring for big detonations
      if (isBig) {
        ctx.strokeStyle = `rgb(248 113 113 / ${shockAlpha * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, shockR * 0.78, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 4. Kinetic Shrapnel Debris Sparks with Motion Blurs
    const sparkCount = isBig ? 12 : 7;
    for (let i = 0; i < sparkCount; i++) {
      const seed = (i * 37 + (b.x + b.y) * 11) % 100;
      const ang = (i / sparkCount) * Math.PI * 2 + (seed / 100) * 0.5;
      const speedMult = 0.8 + (seed % 5) * 0.25;
      const rInner = radius * (0.4 + t * 0.8 * speedMult);
      const rOuter = rInner + (3 + t * 9) * (isBig ? 1.6 : 1);
      const sparkAlpha = Math.max(0, a * (0.6 + (seed % 4) * 0.1));

      ctx.strokeStyle = seed % 2 === 0 ? `rgb(255 255 255 / ${sparkAlpha})` : `rgb(251 191 36 / ${sparkAlpha})`;
      ctx.lineWidth = seed % 3 === 0 ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(b.x + Math.cos(ang) * rInner, b.y + Math.sin(ang) * rInner);
      ctx.lineTo(b.x + Math.cos(ang) * rOuter, b.y + Math.sin(ang) * rOuter);
      ctx.stroke();
    }

    ctx.restore();
  }
}

