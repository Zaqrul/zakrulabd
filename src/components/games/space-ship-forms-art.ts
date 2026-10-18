/* What the ship shows as it is upgraded, drawn over the Endymion hull in the hull's own
   coordinates (about 21 wide and 10 tall, nose to the right), and the flashes and the
   HQ that go with them. The ship's own shape is kept quiet on purpose: a launcher pod
   under the hull and a second on top from level 4, one cyan marker for the hypersonic
   drive and one armour plate with a breathing rim for the mechanical shield. Nothing
   else is bolted on as it levels up; the later power is in what it does (self-repair,
   shown only while it mends) and in the HQ, a carrier's hangar at the left edge of the
   screen. Flat shapes with a dark rim, like the rest of the ship. */
import { H, HQ, HQ_LAUNCHERS, MORPH, NUKE, TWIN_AT, W, hasUpgrade, isRepairing, isSecond, shipSize, type State } from "./space-logic";

type Ctx = CanvasRenderingContext2D;
type P = State["p"];

const INK = "#171717";
const CYAN = "#22d3ee";

function panel(ctx: Ctx, pts: number[][], fill: string, rim = INK, width = 0.5) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = width;
  ctx.stroke();
}

/* A launcher pod: a pylon to the hull, a body, a nose that lights when it is ready. */
function launcher(ctx: Ctx, y: number, ready: boolean) {
  const under = y > 5;
  panel(ctx, under ? [[8, 8.6], [10.6, 8.6], [10.6, y + 0.4], [8, y + 0.4]] : [[8, y + 2.8], [10.6, y + 2.8], [10.6, 0.6], [8, 0.6]], "#475569");
  panel(ctx, [[2.5, y], [16.2, y], [16.2, y + 3.2], [2.5, y + 3.2]], "#94a3b8");
  panel(ctx, [[16.2, y], [20.4, y + 1.6], [16.2, y + 3.2]], ready ? "#ef4444" : "#b91c1c");
  ctx.fillStyle = "#facc15";
  ctx.fillRect(10, y, 1.4, 3.2);
}

/* Drawn before the hull, so the hull overlaps what is behind it. */
export function drawFormsBack(ctx: Ctx, p: P) {
  /* A launcher under the hull from the start, another on top from level 4. */
  const ready = p.launchCd < 8;
  launcher(ctx, 10.2, ready);
  if (p.level >= TWIN_AT) launcher(ctx, -4.6, ready);
}

/* Drawn over the hull. */
export function drawFormsFront(ctx: Ctx, p: P, frame: number, reduceMotion: boolean) {
  if (hasUpgrade(p, "hypersonic")) panel(ctx, [[11, 3.3], [16.8, 2.4], [16.8, 4.3]], CYAN, INK, 0.4);
  if (hasUpgrade(p, "armor")) {
    const pulse = reduceMotion ? 0.8 : 0.55 + 0.35 * Math.sin(frame / 14);
    panel(ctx, [[2.2, 3.1], [8.6, 0.9], [17.2, 3.0], [16.6, 4.3], [3, 4.5]], "#9ca3af");
    ctx.strokeStyle = `rgb(56 189 248 / ${pulse})`;
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(19.9, 2.5);
    ctx.lineTo(24.1, 3.9);
    ctx.lineTo(24.5, 7.9);
    ctx.lineTo(20.9, 9.2);
    ctx.stroke();
  }
}

/* The ship changing shape: a white flash over it and a ring that spreads. */
export function drawMorph(ctx: Ctx, s: State, reduceMotion: boolean) {
  const p = s.p;
  if (p.morph <= 0 || s.phase === "launch") return;
  const u = 1 - p.morph / MORPH;
  const size = shipSize(p.level);
  const cx = p.x + size.w / 2;
  const cy = p.y + size.h / 2;
  ctx.save();
  if (!reduceMotion && u < 0.35) {
    ctx.globalAlpha = (1 - u / 0.35) * 0.55;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size.w * 0.9, size.h * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1 - u;
  ctx.strokeStyle = "#fde047";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, 8 + u * 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  for (let k = 0; k < 8; k++) {
    const ang = (k * Math.PI) / 4 + u * 1.4;
    const r = 6 + u * 30;
    ctx.fillRect(cx + Math.cos(ang) * r - 0.9, cy + Math.sin(ang) * r - 0.9, 1.8, 1.8);
  }
  ctx.restore();
}

/* Heavy Thermonuclear Annihilation Wave: multi-wave blast rings, incendiary fallout sparks, and blinding flash. */
export function drawNuke(ctx: Ctx, s: State, reduceMotion: boolean) {
  const n = s.nuke;
  if (!n) return;
  const u = n.t / NUKE.frames;
  const reach = Math.hypot(W, H);
  const r = 12 + (reach * Math.min(1, n.t / 42));
  const a = Math.max(0, 1 - u);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Atmospheric Annihilation Wash
  ctx.fillStyle = `rgb(255 180 120 / ${0.35 * a})`;
  ctx.fillRect(0, 0, W, H);

  // Expanding Superheated Fireball
  const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
  g.addColorStop(0, `rgb(255 255 255 / ${0.9 * a})`);
  g.addColorStop(0.35, `rgb(254 240 138 / ${0.75 * a})`);
  g.addColorStop(0.65, `rgb(249 115 22 / ${0.5 * a})`);
  g.addColorStop(1, "rgb(239 68 68 / 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
  ctx.fill();

  // Multi-tier Supersonic Shockwave Blast Rings
  for (const [k, colour, width] of [
    [1, "255 255 255", 6],
    [0.85, "254 240 138", 4],
    [0.68, "239 68 68", 3],
    [0.45, "251 146 60", 2],
  ] as const) {
    ctx.strokeStyle = `rgb(${colour} / ${Math.max(0, 1 - u * 1.1)})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Incendiary Fallout Sparks & Plasma Debris Rain
  if (!reduceMotion && n.t > 4) {
    for (let i = 0; i < 18; i++) {
      const seed = (i * 29 + n.t * 7) % 100;
      const ang = (i / 18) * Math.PI * 2 + (seed / 100);
      const dist = (r * 0.4) + (seed / 100) * (r * 0.6);
      const sparkLen = 4 + (seed % 6);
      ctx.strokeStyle = seed % 2 === 0 ? `rgb(254 240 138 / ${0.8 * a})` : `rgb(255 255 255 / ${a})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(n.x + Math.cos(ang) * dist, n.y + Math.sin(ang) * dist);
      ctx.lineTo(n.x + Math.cos(ang) * (dist + sparkLen), n.y + Math.sin(ang) * (dist + sparkLen));
      ctx.stroke();
    }
  }

  // Initial Relativistic Blinding White Flash
  if (n.t < 12) {
    ctx.fillStyle = `rgb(255 255 255 / ${(reduceMotion ? 0.4 : 0.98) * (1 - n.t / 12)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* Heavy Sci-Fi Energy Shield Matrix: Hexagonal honeycomb barrier, electric deflection lightning, and neon cyan plasma bloom. */
export function drawShieldFlash(ctx: Ctx, s: State, reduceMotion: boolean) {
  const p = s.p;
  if (p.shieldFlash <= 0 || s.phase === "launch") return;
  const size = shipSize(p.level);
  const a = Math.min(1, (p.shieldFlash / 24) * 1.5);
  const cx = p.x + size.w / 2;
  const cy = p.y + size.h / 2;
  const rx = size.w * (0.95 + (reduceMotion ? 0 : (1 - a) * 0.35));
  const ry = size.h * 1.55;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Outer Shield Glow Aura
  const g = ctx.createRadialGradient(cx, cy, rx * 0.4, cx, cy, rx * 1.25);
  g.addColorStop(0, `rgb(56 189 248 / ${0.12 * a})`);
  g.addColorStop(0.7, `rgb(14 165 233 / ${0.28 * a})`);
  g.addColorStop(1, "rgb(2 132 199 / 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 1.2, ry * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Primary Shield Dome
  ctx.fillStyle = `rgb(56 189 248 / ${0.25 * a})`;
  ctx.strokeStyle = `rgb(186 230 253 / ${0.95 * a})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hexagonal Honeycomb Matrix Grid Lattice
  if (!reduceMotion) {
    ctx.strokeStyle = `rgb(125 211 252 / ${0.5 * a})`;
    ctx.lineWidth = 0.8;
    const hexSize = 5;
    for (let hx = cx - rx + 4; hx < cx + rx; hx += hexSize * 1.6) {
      for (let hy = cy - ry + 4; hy < cy + ry; hy += hexSize * 1.8) {
        const dx = (hx - cx) / rx;
        const dy = (hy - cy) / ry;
        if (dx * dx + dy * dy < 0.85) {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const ang = (k * Math.PI) / 3;
            const px = hx + Math.cos(ang) * (hexSize * 0.5);
            const py = hy + Math.sin(ang) * (hexSize * 0.5);
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    // Electric Deflection Lightning Arcs across shield surface
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const startAng = (i * 2 + (p.shieldFlash * 0.3)) % (Math.PI * 2);
      ctx.beginPath();
      let arcX = cx + Math.cos(startAng) * rx;
      let arcY = cy + Math.sin(startAng) * ry;
      ctx.moveTo(arcX, arcY);
      for (let step = 0; step < 4; step++) {
        const nextAng = startAng + (step + 1) * 0.25;
        arcX = cx + Math.cos(nextAng) * (rx + (Math.sin(step * 3.5 + s.frame) * 3));
        arcY = cy + Math.sin(nextAng) * (ry + (Math.cos(step * 3.5 + s.frame) * 3));
        ctx.lineTo(arcX, arcY);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

/* Self-repair at work: a few small green crosses rise off the ship while it mends. */
export function drawRepair(ctx: Ctx, s: State, reduceMotion: boolean) {
  const p = s.p;
  if (s.phase !== "play" || !isRepairing(p, isSecond(s.chapter))) return;
  const size = shipSize(p.level);
  ctx.save();
  ctx.fillStyle = "#4ade80";
  for (let k = 0; k < 3; k++) {
    const phase = reduceMotion ? 0.35 : (s.frame / 46 + k / 3) % 1;
    const x = p.x + size.w * (0.22 + k * 0.28);
    const y = p.y - 1 - phase * 11;
    ctx.globalAlpha = reduceMotion ? 0.8 : 1 - phase;
    ctx.fillRect(x - 0.6, y - 2, 1.2, 4);
    ctx.fillRect(x - 2, y - 0.6, 4, 1.2);
  }
  ctx.restore();
}

/* The HQ: only the hangar end of a huge carrier, filling the left edge of the screen. A
   big bay in the middle with two fighters parked in it, a launcher block at the top corner
   and one at the bottom, two barrels in each. It slides in when the ship reaches the level
   and goes back out if the level is lost; a barrel flashes as it fires. */
export function drawHQ(ctx: Ctx, s: State, reduceMotion: boolean) {
  const hq = s.hq;
  if (hq.slide <= 0 || s.phase === "launch") return;
  const top = 24;
  const mid = (top + H) / 2;
  ctx.save();
  ctx.translate(-(1 - hq.slide) * (HQ.width + 10), 0);
  /* The hull, with a lighter deck plate along its top and bottom edges. */
  panel(ctx, [[-8, top], [21, top], [25, top + 6], [25, H - 6], [21, H], [-8, H]], "#27303d", INK, 0.9);
  panel(ctx, [[-8, top], [21, top], [23, top + 3], [-8, top + 3]], "#4b586c", INK, 0.5);
  panel(ctx, [[-8, H - 3], [23, H - 3], [21, H], [-8, H]], "#4b586c", INK, 0.5);
  ctx.strokeStyle = "rgb(0 0 0 / 0.35)";
  ctx.lineWidth = 0.6;
  for (const x of [5, 13]) {
    ctx.beginPath();
    ctx.moveTo(x, top + 4);
    ctx.lineTo(x, H - 4);
    ctx.stroke();
  }

  /* The hangar bay, with hazard stripes on its frame. */
  const bayTop = mid - 46;
  const bayH = 92;
  panel(ctx, [[-8, bayTop - 5], [23, bayTop - 5], [23, bayTop + bayH + 5], [-8, bayTop + bayH + 5]], "#394456", INK, 0.7);
  panel(ctx, [[-8, bayTop], [21, bayTop], [21, bayTop + bayH], [-8, bayTop + bayH]], "#0a0f1a", INK, 0.7);
  for (let i = 0; i < 6; i++) {
    const x = -8 + i * 5.5;
    panel(ctx, [[x, bayTop - 5], [x + 2.8, bayTop - 5], [x + 4.8, bayTop - 1.5], [x + 2, bayTop - 1.5]], i % 2 ? INK : "#facc15", "rgb(0 0 0 / 0)", 0);
    panel(ctx, [[x, bayTop + bayH + 1.5], [x + 2.8, bayTop + bayH + 1.5], [x + 4.8, bayTop + bayH + 5], [x + 2, bayTop + bayH + 5]], i % 2 ? INK : "#facc15", "rgb(0 0 0 / 0)", 0);
  }
  ctx.fillStyle = "#16233a";
  ctx.fillRect(-8, bayTop + 2, 29, bayH - 4);
  /* Two fighters parked in the bay, and the lights along its floor. */
  for (const fy of [mid - 22, mid + 20]) {
    panel(ctx, [[2, fy], [9, fy - 3], [19, fy - 1.2], [24, fy], [19, fy + 1.2], [9, fy + 3]], "#94a3b8", INK, 0.5);
    panel(ctx, [[8, fy - 1], [12, fy - 6], [14, fy - 6], [13, fy - 1]], "#64748b", INK, 0.4);
    panel(ctx, [[8, fy + 1], [12, fy + 6], [14, fy + 6], [13, fy + 1]], "#64748b", INK, 0.4);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(18, fy - 0.6, 2.4, 1.2);
  }
  ctx.fillStyle = "#fbbf24";
  for (let i = 0; i < 7; i++) ctx.fillRect(-5 + i * 4, bayTop + bayH - 3, 1.6, 1.2);

  /* The letters, in blocks: H and Q on the hull under the bay. */
  const ly = bayTop + bayH + 7;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(1, ly, 2, 9);
  ctx.fillRect(7, ly, 2, 9);
  ctx.fillRect(1, ly + 3.5, 8, 2);
  ctx.fillRect(12, ly, 8, 2);
  ctx.fillRect(12, ly + 7, 8, 2);
  ctx.fillRect(12, ly, 2, 9);
  ctx.fillRect(18, ly, 2, 9);
  ctx.fillRect(17, ly + 6.5, 3.4, 2.2);

  /* The launcher blocks, top corner and bottom corner, two barrels each. */
  for (const [by0, by1] of [[top + 3, HQ_LAUNCHERS[1].y + 10], [HQ_LAUNCHERS[2].y - 10, H - 3]] as const) {
    panel(ctx, [[-8, by0], [22, by0], [26, by0 + 3], [26, by1 - 3], [22, by1], [-8, by1]], "#3a4658", INK, 0.8);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(-8, by0 + 1.5, 24, 1);
    ctx.fillRect(-8, by1 - 2.5, 24, 1);
  }
  for (let i = 0; i < HQ_LAUNCHERS.length; i++) {
    const l = HQ_LAUNCHERS[i];
    const ready = hq.cd[i] <= 0;
    panel(ctx, [[12, l.y - 2.6], [l.x, l.y - 2.6], [l.x, l.y + 2.6], [12, l.y + 2.6]], "#64748b", INK, 0.6);
    panel(ctx, [[l.x - 3, l.y - 3.4], [l.x - 0.5, l.y - 3.4], [l.x - 0.5, l.y + 3.4], [l.x - 3, l.y + 3.4]], "#334155", INK, 0.5);
    ctx.fillStyle = ready ? "#4ade80" : "#b91c1c";
    ctx.fillRect(14, l.y - 0.6, 2.2, 1.2);
    if (hq.kick[i] > 0 && !reduceMotion) {
      const k = hq.kick[i] / 8;
      ctx.fillStyle = `rgb(253 230 138 / ${0.5 + 0.5 * k})`;
      ctx.beginPath();
      ctx.arc(l.x + 1, l.y, 2 + 3.5 * k, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
