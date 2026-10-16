/* What the chapter bosses' own moves and weapons look like: the warnings that show
   where each will land, the pincer arms, shockwaves, spires, clouds and fire, the
   frostbite on the ship, and the shots that are not plain torpedoes. Flat shapes
   with a dark rim, like the rest of the game; the numbers all come from the rules. */
import {
  BLINK,
  CRESCENT,
  EMBER,
  FLAK,
  GROUND_Y,
  H,
  PINCER,
  SPIRE,
  SPORE,
  TORPEDO,
  WAVE,
  enemyMuzzle,
  hazardBoxes,
  shipSize,
  spireHeight,
  torpedoSpeed,
  type Charge,
  type Enemy,
  type Hazard,
  type State,
} from "./space-logic";
import { drawCharge, drawMotor } from "./space-fx-art";

type Ctx = CanvasRenderingContext2D;
type Bullet = State["bullets"][number];

const INK = "#171717";
const CORAL = "#fb7185";
const CREAM = "#fff1cc";

/* A line with a dark one under it, so it shows against sky, grass and water alike. */
function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, colour: string, width = 1, dash: number[] = []) {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.lineCap = "butt";
  for (const [c, w] of [["rgb(23 23 23 / 0.55)", width + 1.6], [colour, width]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

function poly(ctx: Ctx, pts: number[][], fill: string, rim?: string, rimWidth = 1) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (rim) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = rimWidth;
    ctx.stroke();
  }
}

/* A ring with ticks, the same lock mark the guns use, for a spot something will land on. */
function mark(ctx: Ctx, x: number, y: number, r: number, colour: string, faint = false) {
  ctx.save();
  if (faint) ctx.globalAlpha = 0.55;
  for (const [c, w] of [["rgb(23 23 23 / 0.7)", 2.6], [colour, 1.2]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.beginPath();
      ctx.moveTo(x + dx * (r - 2), y + dy * (r - 2));
      ctx.lineTo(x + dx * (r + 3), y + dy * (r + 3));
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* A hazard's edge, drawn dashed in two colours so it reads on any background. */
function ring(ctx: Ctx, x: number, y: number, r: number, colour: string, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.setLineDash([4, 3]);
  for (const [c, w] of [["rgb(23 23 23 / 0.55)", 2.4], [colour, 1]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

const heading = (b: Bullet) => (b.ux !== undefined && b.uy !== undefined ? Math.atan2(b.uy, b.ux) : Math.atan2(b.vy, b.vx));

/* ---- shots ---- */

/* The flagship's lane shell: a big torpedo with gold bands and a hot warhead. */
function drawShell(ctx: Ctx, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(heading(b));
  poly(ctx, [[-11.5, -4.6], [5, -4.6], [12.5, 0], [5, 4.6], [-11.5, 4.6]], "rgb(23 23 23 / 0.85)");
  for (const side of [-1, 1]) poly(ctx, [[-6, side * 3.3], [-12, side * 7], [-8.5, side * 3.3]], "#6b7482");
  ctx.fillStyle = "#4b5563";
  ctx.fillRect(-10, -3.3, 15, 6.6);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(-5, -3.3, 1.8, 6.6);
  ctx.fillRect(-0.5, -3.3, 1.8, 6.6);
  poly(ctx, [[5, -3.3], [11, 0], [5, 3.3]], "#ef4444");
  ctx.fillStyle = CREAM;
  ctx.fillRect(9, -0.5, 1.6, 1);
  drawMotor(ctx, b, -10, 3.3);
  ctx.restore();
}

/* The bomber's wisp: a ball of plasma with a tail that grows as it speeds up. */
function drawWisp(ctx: Ctx, b: Bullet) {
  const age = b.age ?? 99;
  const len = 4 + (torpedoSpeed(age) / TORPEDO.top) * 13;
  const live = (b.track ?? 0) > 0;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(heading(b));
  poly(ctx, [[-len, 0], [-2, -3.6], [-2, 3.6]], "rgb(196 181 253 / 0.55)");
  poly(ctx, [[-len * 0.6, 0], [-2, -2.2], [-2, 2.2]], "rgb(244 240 255 / 0.8)");
  ctx.fillStyle = "rgb(23 23 23 / 0.8)";
  ctx.beginPath();
  ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = live ? "#c4b5fd" : "#a78bfa";
  ctx.beginPath();
  ctx.arc(0, 0, 3.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0.6, -0.4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  /* While it is still steering, a pink ring blinks round it. */
  if (live && Math.floor(age / 4) % 2 === 0) {
    ctx.strokeStyle = "rgb(244 114 182 / 0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 6.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* The Crimson Fang's blade: a crescent, convex edge forward, with two fainter ones behind
   it. It is drawn to the size of what hurts (the shot's radius). */
function crescentPath(ctx: Ctx) {
  ctx.beginPath();
  ctx.arc(0, 0, 10, -2.28, 2.28, false);
  ctx.arc(-4, 0, 8, 1.89, -1.89, true);
  ctx.closePath();
}
function drawCrescent(ctx: Ctx, b: Bullet) {
  const k = b.r / 9;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(heading(b));
  ctx.scale(k, k);
  for (const [back, alpha] of [[16, 0.16], [9, 0.3]] as const) {
    ctx.save();
    ctx.translate(-back, 0);
    ctx.globalAlpha = alpha;
    crescentPath(ctx);
    ctx.fillStyle = "#fb7185";
    ctx.fill();
    ctx.restore();
  }
  crescentPath(ctx);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.fillStyle = "#e11d48";
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#fecdd3";
  ctx.fillRect(5, -12, 6, 24);
  ctx.restore();
  ctx.restore();
}

/* A shard of ice from the iron worm's breath. */
function drawFrost(ctx: Ctx, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(heading(b));
  poly(ctx, [[-8, 0], [0, -4.2], [9, 0], [0, 4.2]], "rgb(23 23 23 / 0.85)");
  poly(ctx, [[-7, 0], [0, -3], [8, 0], [0, 3]], "#bae6fd");
  poly(ctx, [[-3, 0], [1, -1.6], [6, 0], [1, 1.6]], "#fff");
  poly(ctx, [[-2, -2.6], [-5, -5.4], [-0.5, -3.2]], "#7dd3fc");
  poly(ctx, [[-2, 2.6], [-5, 5.4], [-0.5, 3.2]], "#7dd3fc");
  drawMotor(ctx, b, -7, 2);
  ctx.restore();
}

/* Draws the shots only the chapter bosses fire; returns false for any other. */
export function drawBossBullet(ctx: Ctx, b: Bullet): boolean {
  if (b.own !== "e") return false;
  switch (b.kind) {
    case "shell": drawShell(ctx, b); return true;
    case "wisp": drawWisp(ctx, b); return true;
    case "crescent": drawCrescent(ctx, b); return true;
    case "frost": drawFrost(ctx, b); return true;
    default: return false;
  }
}

/* ---- things thrown or dropped: flak, spores, embers (and the last boss's C4) ---- */

function drawFlak(ctx: Ctx, c: Charge, reduceMotion: boolean) {
  const landed = c.t >= FLAK.flight;
  const left = FLAK.burst - c.t;
  if (c.t < FLAK.burst) {
    const closing = 1 - c.t / FLAK.burst;
    ctx.fillStyle = `rgb(251 113 133 / ${0.05 + (1 - closing) * 0.14})`;
    ctx.beginPath();
    ctx.arc(c.tx, c.ty, 7 + closing * 10, 0, Math.PI * 2);
    ctx.fill();
    mark(ctx, c.tx, c.ty, 7 + closing * 10, left < 16 ? CREAM : CORAL);
    /* The shell: a short dark body with a fuse, tumbling on the way up. */
    ctx.save();
    ctx.translate(c.x, c.y);
    if (!landed && !reduceMotion) ctx.rotate(c.t * 0.3);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.fillRect(-3.2, -0.7, 6.4, 1.4);
    if (reduceMotion || Math.floor(c.t / Math.max(2, Math.round(left / 8))) % 2 === 0) {
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(-1, -6.2, 2, 2.4);
    }
    ctx.restore();
    return;
  }
  /* The burst: a flash that grows and fades. */
  const u = (c.t - FLAK.burst) / 8;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 0.85 - u);
  ctx.fillStyle = u < 0.3 ? CREAM : "#fb923c";
  ctx.beginPath();
  ctx.arc(c.tx, c.ty, 5 + u * 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpore(ctx: Ctx, c: Charge, reduceMotion: boolean) {
  const landed = c.t - SPORE.flight;
  if (landed <= 0) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a3e635";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ecfccb";
    ctx.fillRect(c.x - 0.7, c.y - 1.8, 1.4, 1.4);
    return;
  }
  const a = Math.min(1, landed / 14, (SPORE.life - landed) / 40);
  if (a <= 0) return;
  const spin = reduceMotion ? 0 : c.t * 0.03;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgb(132 204 22 / 0.3)";
  ctx.beginPath();
  ctx.arc(c.x, c.y, SPORE.radius, 0, Math.PI * 2);
  ctx.fill();
  for (let k = 0; k < 4; k++) {
    const ang = spin + (k * Math.PI) / 2;
    ctx.fillStyle = k % 2 ? "rgb(192 132 252 / 0.3)" : "rgb(190 242 100 / 0.38)";
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(ang) * SPORE.radius * 0.45, c.y + Math.sin(ang) * SPORE.radius * 0.45, SPORE.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#f7fee7";
  for (let k = 0; k < 6; k++) {
    const ang = -spin * 1.6 + (k * Math.PI) / 3;
    const r = SPORE.radius * (0.35 + 0.4 * ((k * 0.37) % 1));
    ctx.fillRect(c.x + Math.cos(ang) * r - 0.7, c.y + Math.sin(ang) * r - 0.7, 1.4, 1.4);
  }
  ring(ctx, c.x, c.y, SPORE.radius, "#bef264");
  ctx.restore();
}

function drawEmber(ctx: Ctx, c: Charge, reduceMotion: boolean) {
  const a = Math.min(1, (EMBER.life - c.t) / 30);
  if (a <= 0) return;
  const flick = reduceMotion ? 0 : Math.sin(c.t / 2.5 + c.tx) * 2;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgb(251 146 60 / 0.35)";
  ctx.beginPath();
  ctx.arc(c.x, c.y, EMBER.radius, 0, Math.PI * 2);
  ctx.fill();
  poly(ctx, [[c.x - 6, c.y + 5], [c.x - 1, c.y - 8 - flick], [c.x + 1.5, c.y - 2], [c.x + 4, c.y - 6 + flick], [c.x + 6, c.y + 5]], "#f97316", INK, 0.8);
  poly(ctx, [[c.x - 3, c.y + 5], [c.x, c.y - 3 - flick * 0.5], [c.x + 3, c.y + 5]], "#fde047");
  ring(ctx, c.x, c.y, EMBER.radius, "#fdba74", 0.8);
  ctx.restore();
}

export function drawZone(ctx: Ctx, c: Charge, reduceMotion: boolean) {
  const kind = c.kind ?? "c4";
  if (kind === "c4") {
    drawCharge(ctx, c, reduceMotion);
    return;
  }
  if (c.t < 0) return;
  if (kind === "flak") drawFlak(ctx, c, reduceMotion);
  else if (kind === "spore") drawSpore(ctx, c, reduceMotion);
  else drawEmber(ctx, c, reduceMotion);
}

/* ---- obstacles: the shockwave and the spire ---- */

function drawWave(ctx: Ctx, h: Hazard, reduceMotion: boolean) {
  const [box] = hazardBoxes(h);
  if (!box) return;
  const { x, y, w } = box;
  const bottom = GROUND_Y + 2;
  const crest: number[][] = [];
  for (let i = 0; i <= 5; i++) {
    const wobble = reduceMotion ? 0 : Math.sin((h.t + i * 4) / 3) * 1.6;
    crest.push([x + w * (1 - i / 5), y + (i % 2 ? 5 : 0) + wobble]);
  }
  poly(ctx, [[x + w, bottom], [x + w, y + 8], ...crest, [x, bottom]], "#f97316", INK, 1.2);
  poly(ctx, [[x + 2, bottom - 1], [x + 2, y + 5], [x + 7, y + 2], [x + 10, bottom - 1]], "#fde047");
  ctx.fillStyle = "rgb(168 162 158 / 0.5)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + w + 6 + i * 7, GROUND_Y - 2 - i * 2.4, 2.6 + i * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpire(ctx: Ctx, h: Hazard, reduceMotion: boolean) {
  const cx = h.x + h.w / 2;
  if (h.t < SPIRE.warn) {
    /* Marked first: where the floor will break, and how high the ice will reach. */
    const pulse = reduceMotion ? 0.6 : 0.5 + 0.4 * Math.sin(h.t / 3);
    ctx.fillStyle = `rgb(251 113 133 / ${0.1 + pulse * 0.1})`;
    ctx.fillRect(h.x, H - SPIRE.height, h.w, SPIRE.height);
    line(ctx, h.x, H - SPIRE.height, h.x, H, CORAL, 1, [5, 4]);
    line(ctx, h.x + h.w, H - SPIRE.height, h.x + h.w, H, CORAL, 1, [5, 4]);
    line(ctx, h.x, H - SPIRE.height, h.x + h.w, H - SPIRE.height, CORAL, 1, [3, 3]);
    poly(ctx, [[cx - 4, H - SPIRE.height - 6], [cx, H - SPIRE.height - 11], [cx + 4, H - SPIRE.height - 6]], CORAL);
    ctx.strokeStyle = CORAL;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, H - 4, h.w * 0.95, 3.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  const tall = spireHeight(h.t);
  if (tall <= 0) return;
  const top = H - tall;
  const w = h.w;
  poly(ctx, [[h.x - 3, H], [h.x + w * 0.1, H - tall * 0.55], [h.x + w * 0.3, H - tall * 0.62], [cx, top], [h.x + w * 0.72, H - tall * 0.7], [h.x + w * 0.92, H - tall * 0.5], [h.x + w + 3, H]], "#bae6fd", INK, 1.2);
  poly(ctx, [[cx, top], [h.x + w * 0.72, H - tall * 0.7], [h.x + w * 0.92, H - tall * 0.5], [h.x + w + 3, H], [cx + 1, H]], "#7dd3fc");
  ctx.fillStyle = "#f0f9ff";
  ctx.fillRect(h.x + w * 0.22, H - tall * 0.5, 2, tall * 0.45);
  ctx.fillStyle = "rgb(240 249 255 / 0.7)";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(h.x - 2 + i * (w / 2 + 2), H - 3 - (i % 2) * 3, 2.4 - i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* Draws the obstacles only the chapter bosses make; returns false for any other. */
export function drawBossHazard(ctx: Ctx, h: Hazard, reduceMotion: boolean): boolean {
  if (h.kind === "wave") {
    drawWave(ctx, h, reduceMotion);
    return true;
  }
  if (h.kind === "spire") {
    drawSpire(ctx, h, reduceMotion);
    return true;
  }
  return false;
}

/* ---- the boulder, and frostbite on the ship ---- */

export function drawBoulder(ctx: Ctx, e: Enemy, reduceMotion: boolean) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const r = e.w / 2;
  const spin = reduceMotion ? 0 : e.rot;
  const edge: number[][] = [];
  for (let i = 0; i < 9; i++) {
    const ang = spin + (i / 9) * Math.PI * 2;
    const k = 0.82 + 0.2 * Math.abs(Math.sin(i * 2.3 + 0.6));
    edge.push([cx + Math.cos(ang) * r * k, cy + Math.sin(ang) * r * k]);
  }
  poly(ctx, edge, "#8a7e72", INK, 1.2);
  poly(ctx, edge.slice(0, 5).concat([[cx, cy]]), "#6f655b");
  ctx.strokeStyle = "#fb923c";
  ctx.lineWidth = 1.2;
  for (const [a, b] of [[0.3, 1.9], [2.7, 4.1], [4.6, 5.6]]) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(spin + a) * r * 0.2, cy + Math.sin(spin + a) * r * 0.2);
    ctx.lineTo(cx + Math.cos(spin + b) * r * 0.62, cy + Math.sin(spin + b) * r * 0.62);
    ctx.stroke();
  }
  ctx.fillStyle = "#a8a29e";
  ctx.fillRect(cx - r * 0.45, cy - r * 0.45, 3, 2);
}

/* Frostbite: a pale shell of ice round the ship while it is slowed. */
export function drawChill(ctx: Ctx, s: State, reduceMotion: boolean) {
  if (s.p.chill <= 0 || s.phase === "launch") return;
  const size = shipSize(s.p.level);
  const cx = s.p.x + size.w / 2;
  const cy = s.p.y + size.h / 2;
  const a = Math.min(1, s.p.chill / 30);
  const spin = reduceMotion ? 0 : s.frame * 0.04;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgb(186 230 253 / 0.22)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, size.w * 0.85, size.h * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = "rgb(125 211 252 / 0.95)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
  for (let k = 0; k < 4; k++) {
    const ang = spin + (k * Math.PI) / 2 + 0.4;
    const x = cx + Math.cos(ang) * size.w * 0.9;
    const y = cy + Math.sin(ang) * size.h * 1.2;
    poly(ctx, [[x - 2.6, y], [x, y - 3.2], [x + 2.6, y], [x, y + 3.2]], "#e0f2fe", INK, 0.7);
  }
  ctx.restore();
}

/* ---- warnings ---- */

/* How a signature attack warns, and what it looks like while it runs: where it will
   land, the arms of the pincer, the blade of the blink. Drawn over the boss. */
export function drawSignatureCue(ctx: Ctx, e: Enemy, s: State, reduceMotion = false) {
  const a = e.attack;
  if (!a) return;
  const warning = a.t < a.warn;
  const firing = a.t >= a.warn && a.t < a.warn + a.live;
  const t2 = a.t - a.warn;
  const locked = a.t >= a.warn - 18;
  const col = locked ? CREAM : CORAL;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(a.t / 4);
  const lane = (x1: number, y1: number, x2: number, y2: number, fillH?: number) => {
    if (fillH) {
      ctx.fillStyle = `rgb(251 113 133 / ${0.08 + pulse * 0.06})`;
      ctx.fillRect(x1, y1 - fillH / 2, x2 - x1, fillH);
    }
    line(ctx, x1, y1, x2, y2, col, locked ? 1.4 : 1, [6, 5]);
  };
  const chevrons = (y: number, x0: number, x1: number) => {
    const shift = reduceMotion ? 0 : (a.t * 2) % 36;
    ctx.fillStyle = CORAL;
    for (let x = x1 - shift; x > x0 + 14; x -= 36) poly(ctx, [[x + 5, y - 3], [x, y], [x + 5, y + 3]], CORAL);
  };

  switch (a.kind) {
    case "stomp":
      if (!warning) break;
      {
        const tall = WAVE.heights[e.a >= 2 ? 2 : 1];
        ctx.fillStyle = `rgb(251 113 133 / ${0.08 + pulse * 0.06})`;
        ctx.fillRect(0, GROUND_Y - tall, e.x, H - (GROUND_Y - tall));
        line(ctx, 0, GROUND_Y - tall, e.x, GROUND_Y - tall, col, locked ? 1.4 : 1, [6, 5]);
        line(ctx, 0, GROUND_Y - WAVE.heights[0], e.x, GROUND_Y - WAVE.heights[0], CORAL, 1, [3, 5]);
        chevrons(GROUND_Y - 8, 0, e.x);
      }
      break;
    case "surge":
      if (!warning) break;
      lane(0, e.y, e.x, e.y);
      lane(0, e.y + e.h, e.x, e.y + e.h);
      ctx.fillStyle = `rgb(251 113 133 / ${0.08 + pulse * 0.06})`;
      ctx.fillRect(0, e.y, e.x, e.h);
      chevrons(cy, 0, e.x);
      break;
    case "salvo": {
      const lanes = a.lanes ?? [];
      if (warning) for (const y of lanes) lane(0, y, e.x - 4, y, 10);
      else if (firing && e.a >= 2 && t2 < 40) for (const y of lanes) lane(0, y + 20, e.x - 4, y + 20, 10);
      break;
    }
    case "pincer": {
      const gy = a.gapY ?? H / 2;
      const half = PINCER.gap / 2;
      if (warning || (firing && t2 < 4)) {
        ctx.fillStyle = `rgb(251 113 133 / ${0.1 + pulse * 0.06})`;
        ctx.fillRect(0, 26, e.x - 8, gy - half - 26);
        ctx.fillRect(0, gy + half, e.x - 8, H - 12 - (gy + half));
        line(ctx, 0, gy - half, e.x - 8, gy - half, CREAM, 1.4);
        line(ctx, 0, gy + half, e.x - 8, gy + half, CREAM, 1.4);
        const shift = reduceMotion ? 0 : (a.t * 2) % 40;
        for (let x = e.x - 30 - shift; x > 20; x -= 40) poly(ctx, [[x, gy - 3], [x + 6, gy], [x, gy + 3]], CREAM);
      }
      if (firing && e.parts.length >= 2) {
        e.parts.slice(0, 2).forEach((p, i) => {
          if (p.w < 2 || p.h < 2) return;
          ctx.fillStyle = INK;
          ctx.fillRect(p.x - 1, p.y - 1, p.w + 2, p.h + 2);
          ctx.fillStyle = "#5b6472";
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = "#7b8494";
          ctx.fillRect(p.x, i === 0 ? p.y : p.y + p.h - 3, p.w, 3);
          ctx.fillStyle = "#3f4752";
          for (let x = p.x + p.w - 26; x > p.x + 4; x -= 28) ctx.fillRect(x, p.y, 1.4, p.h);
          const edge = i === 0 ? p.y + p.h : p.y;
          const dir = i === 0 ? -1 : 1;
          for (let x = p.x + 3; x < p.x + p.w - 3 && x < p.x + 40; x += 10) poly(ctx, [[x, edge], [x + 5, edge + dir * 6], [x + 10, edge]], "#cbd5e1", INK, 0.8);
        });
      }
      break;
    }
    case "boulders":
      if (warning && locked) {
        line(ctx, e.x - 12, cy, a.targetX, a.targetY, col, 1, [4, 5]);
        mark(ctx, a.targetX, a.targetY, 9, col);
      }
      break;
    case "undertow": {
      const bx = e.x + e.w * 0.25;
      const by = cy;
      const shift = reduceMotion ? 0 : a.t;
      if (warning || firing) {
        ctx.save();
        for (let i = 0; i < 3; i++) {
          const r = 120 - ((shift * 2 + i * 40) % 120);
          ctx.globalAlpha = Math.min(1, r / 60) * 0.7;
          ring(ctx, bx, by, Math.max(8, r), "#c4b5fd");
        }
        ctx.restore();
      }
      if (firing) {
        const size = shipSize(s.p.level);
        const sx = s.p.x + size.w / 2;
        const sy = s.p.y + size.h / 2;
        const ang = Math.atan2(by - sy, bx - sx);
        for (let k = -1; k <= 1; k++) {
          const px = sx + Math.cos(ang) * (14 + k * 8 + ((shift * 1.4) % 10)) - Math.sin(ang) * k * 5;
          const py = sy + Math.sin(ang) * (14 + k * 8 + ((shift * 1.4) % 10)) + Math.cos(ang) * k * 5;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ang);
          poly(ctx, [[-2, -3], [3, 0], [-2, 3]], "#c4b5fd", INK, 0.7);
          ctx.restore();
        }
      }
      break;
    }
    case "spores":
      if (!warning) break;
      for (const sp of a.spots ?? []) {
        ring(ctx, sp.x, sp.y, SPORE.radius, col, 0.9);
        ctx.fillStyle = `rgb(190 242 100 / ${0.08 + pulse * 0.1})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, SPORE.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "breach":
      if (!warning) break;
      for (const sp of a.spots ?? []) {
        const x = sp.x - SPIRE.w / 2;
        ctx.fillStyle = `rgb(251 113 133 / ${0.08 + pulse * 0.06})`;
        ctx.fillRect(x, H - SPIRE.height, SPIRE.w, SPIRE.height);
        line(ctx, x, H - SPIRE.height, x, H, col, 1, [5, 4]);
        line(ctx, x + SPIRE.w, H - SPIRE.height, x + SPIRE.w, H, col, 1, [5, 4]);
      }
      break;
    case "frost": {
      if (!warning) break;
      const m = enemyMuzzle(e, s);
      for (const d of [-0.65, 0.65]) line(ctx, m.x, m.y, m.x + Math.cos(a.angle + d) * 110, m.y + Math.sin(a.angle + d) * 110, col, 1, [4, 5]);
      break;
    }
    case "dive": {
      if (!warning) break;
      const ang = Math.atan2(a.targetY - cy, a.targetX - cx);
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      const half = e.h * 0.45;
      const far = 520;
      poly(ctx, [[cx + nx * half, cy + ny * half], [cx + Math.cos(ang) * far + nx * half, cy + Math.sin(ang) * far + ny * half], [cx + Math.cos(ang) * far - nx * half, cy + Math.sin(ang) * far - ny * half], [cx - nx * half, cy - ny * half]], `rgb(251 113 133 / ${0.07 + pulse * 0.05})`);
      for (const side of [-1, 1]) line(ctx, cx + nx * half * side, cy + ny * half * side, cx + Math.cos(ang) * far + nx * half * side, cy + Math.sin(ang) * far + ny * half * side, col, 1, [6, 5]);
      line(ctx, cx, cy, cx + Math.cos(ang) * far, cy + Math.sin(ang) * far, CORAL, 1, [2, 6]);
      break;
    }
    case "blink": {
      const spot = a.spots?.[0];
      if (!spot) break;
      if (warning || (firing && t2 < BLINK.gone + BLINK.blade)) {
        ctx.save();
        ctx.globalAlpha = 0.5 + pulse * 0.3;
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(spot.x, spot.y, e.w, e.h);
        ctx.restore();
        ctx.fillStyle = `rgb(251 113 133 / ${0.08 + pulse * 0.08})`;
        ctx.fillRect(spot.x - BLINK.reach, spot.y + e.h / 2 - BLINK.bladeH / 2, BLINK.reach, BLINK.bladeH);
        line(ctx, spot.x - BLINK.reach, spot.y + e.h / 2 - BLINK.bladeH / 2, spot.x, spot.y + e.h / 2 - BLINK.bladeH / 2, col, 1, [5, 4]);
        line(ctx, spot.x - BLINK.reach, spot.y + e.h / 2 + BLINK.bladeH / 2, spot.x, spot.y + e.h / 2 + BLINK.bladeH / 2, col, 1, [5, 4]);
      }
      if (firing && e.parts.length) {
        const p = e.parts[0];
        poly(ctx, [[p.x + p.w, p.y], [p.x + 8, p.y + p.h * 0.28], [p.x, p.y + p.h / 2], [p.x + 8, p.y + p.h * 0.72], [p.x + p.w, p.y + p.h]], CREAM, INK, 1);
        poly(ctx, [[p.x + p.w, p.y + p.h * 0.3], [p.x + 22, p.y + p.h / 2], [p.x + p.w, p.y + p.h * 0.7]], "#fb7185");
      }
      break;
    }
    case "crescent": {
      if (!warning) break;
      const m = enemyMuzzle(e, s);
      for (const d of e.a >= 2 ? [-0.62, -0.31, 0, 0.31, 0.62] : [-0.42, 0, 0.42]) line(ctx, m.x, m.y, m.x + Math.cos(a.angle + d) * 72, m.y + Math.sin(a.angle + d) * 72, col, 1, [4, 5]);
      line(ctx, CRESCENT.turnX, 30, CRESCENT.turnX, H - 12, CORAL, 1, [2, 5]);
      break;
    }
    default:
      break;
  }
}
