/* How things are shaded in the Space series. Every surface is lit from the top
   left: a lighter top, a darker underside, a thin dark edge instead of a heavy
   outline, and a sheen along the upper face, so a ship reads as metal, a lens as
   glass and a bomb as a ball. Glows are additive, and a hit turns the whole actor
   toward white while keeping its shading. */
type Ctx = CanvasRenderingContext2D;
type RGB = [number, number, number];

// Keep the user's simple Canvas treatment by default. The optional material
// pass remains available without changing actor geometry or attack logic.
export const SHADED_ART: boolean = false;

let hit = false;
/* An actor that has just been hit is drawn washed toward white. */
export function setHit(on: boolean) {
  hit = on;
}

const parsed = new Map<string, RGB>();
function parse(c: string): RGB {
  const known = parsed.get(c);
  if (known) return known;
  let v: RGB;
  if (c.startsWith("rgb")) {
    const n = c.match(/[\d.]+/g)!.map(Number);
    v = [n[0], n[1], n[2]];
  } else {
    let h = c.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  if (parsed.size < 600) parsed.set(c, v);
  return v;
}

export function mix(a: string, b: string, t: number) {
  const x = parse(a);
  const y = parse(b);
  return `rgb(${Math.round(x[0] + (y[0] - x[0]) * t)} ${Math.round(x[1] + (y[1] - x[1]) * t)} ${Math.round(x[2] + (y[2] - x[2]) * t)})`;
}

export const rgba = (c: string, a: number) => {
  const v = parse(c);
  return `rgb(${v[0]} ${v[1]} ${v[2]} / ${a})`;
};

/* The colour a surface is drawn in right now. */
const tone = (c: string) => (hit ? mix(c, "#ffffff", 0.5) : c);

export function path(ctx: Ctx, pts: number[][]) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
    else ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
}

function bounds(pts: number[][]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

type MetalOptions = { light?: number; dark?: number; edge?: string; sheen?: number; lw?: number };

/* Fills the current path as brushed metal: lit from above, shaded below, with a
   soft band of light along the top and a thin dark edge. */
function material(ctx: Ctx, box: number[], base: string, o: MetalOptions) {
  if (!SHADED_ART) {
    ctx.fillStyle = tone(base); ctx.fill();
    ctx.strokeStyle = o.edge ?? "#171717"; ctx.lineWidth = 0.8; ctx.stroke();
    return;
  }
  const [x0, y0, x1, y1] = box;
  const b = tone(base);
  const g = ctx.createLinearGradient(0, y0, 0, Math.max(y1, y0 + 0.01));
  g.addColorStop(0, mix(b, "#ffffff", o.light ?? 0.3));
  g.addColorStop(0.42, b);
  g.addColorStop(1, mix(b, "#000000", o.dark ?? 0.38));
  ctx.fillStyle = g;
  ctx.fill();
  const sheen = o.sheen ?? 0.16;
  if (sheen > 0) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = `rgb(255 255 255 / ${hit ? 0.1 : sheen})`;
    ctx.fillRect(x0 - 1, y0, x1 - x0 + 2, Math.max(0.6, (y1 - y0) * 0.2));
    ctx.restore();
  }
  ctx.strokeStyle = o.edge ?? mix(b, "#000000", 0.62);
  ctx.lineWidth = o.lw ?? 0.5;
  ctx.lineJoin = "round";
  ctx.stroke();
}

export function metal(ctx: Ctx, pts: number[][], base: string, o: MetalOptions = {}) {
  path(ctx, pts);
  material(ctx, bounds(pts), base, o);
}

export function slab(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, base: string, o: MetalOptions = {}) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  material(ctx, [x, y, x + w, y + h], base, o);
}

/* A ball: a highlight up and to the left, darkening away from it. */
export function sphere(ctx: Ctx, x: number, y: number, r: number, base: string, o: { edge?: string } = {}) {
  if (!SHADED_ART) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = tone(base); ctx.fill(); ctx.strokeStyle = o.edge ?? "#171717"; ctx.lineWidth = 0.8; ctx.stroke();
    return;
  }
  const b = tone(base);
  const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.4, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, mix(b, "#ffffff", 0.62));
  g.addColorStop(0.45, b);
  g.addColorStop(1, mix(b, "#000000", 0.5));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = o.edge ?? mix(b, "#000000", 0.62);
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/* A canopy, lens or window: dark glass with a bright streak across it. */
export function glass(ctx: Ctx, pts: number[][], tint = "#7dd3e8") {
  path(ctx, pts);
  if (!SHADED_ART) { ctx.fillStyle = tone(tint); ctx.fill(); ctx.strokeStyle = "#171717"; ctx.lineWidth = 0.8; ctx.stroke(); return; }
  const [x0, y0, x1, y1] = bounds(pts);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, tone(mix(tint, "#ffffff", 0.35)));
  g.addColorStop(0.5, tone(mix(tint, "#0b1a2a", 0.45)));
  g.addColorStop(1, tone(mix(tint, "#06101c", 0.75)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgb(8 14 24 / 0.8)";
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "rgb(255 255 255 / 0.4)";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + (x1 - x0) * 0.55, y0);
  ctx.lineTo(x0 + (x1 - x0) * 0.25, y1);
  ctx.lineTo(x0, y1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* Light spilling out of something hot or lit. Additive, so it brightens what is
   behind it instead of covering it. */
export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, a = 0.6) {
  if (!SHADED_ART) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(0.45, rgba(color, a * 0.35));
  g.addColorStop(1, rgba(color, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/* A small lamp, with its glow when it is on. */
export function lamp(ctx: Ctx, x: number, y: number, r: number, color: string, on = true) {
  if (on) glow(ctx, x, y, r * 4, color, 0.55);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = on ? mix(color, "#ffffff", 0.45) : mix(color, "#000000", 0.6);
  ctx.fill();
}

/* An engine's flame, streaming to the right: a wide orange body around a white
   core, flickering a little with the clock. */
export function flame(ctx: Ctx, x: number, y: number, len: number, w: number, t: number) {
  const L = len * (0.9 + 0.1 * Math.sin(t * 0.9));
  if (!SHADED_ART) {
    path(ctx, [[x, y - w], [x + L, y], [x, y + w]]); ctx.fillStyle = "#fb923c"; ctx.fill();
    path(ctx, [[x, y - w * 0.4], [x + L * 0.65, y], [x, y + w * 0.4]]); ctx.fillStyle = "#fff1cc"; ctx.fill();
    return;
  }
  glow(ctx, x + L * 0.3, y, L * 0.9 + w * 2, "#ff8a3d", 0.35);
  const g = ctx.createLinearGradient(x, y, x + L, y);
  g.addColorStop(0, "rgb(255 250 220 / 0.95)");
  g.addColorStop(0.35, "rgb(255 170 70 / 0.85)");
  g.addColorStop(1, "rgb(255 90 30 / 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - w);
  ctx.quadraticCurveTo(x + L * 0.5, y - w * 0.7, x + L, y);
  ctx.quadraticCurveTo(x + L * 0.5, y + w * 0.7, x, y + w);
  ctx.closePath();
  ctx.fill();
}

/* Rivets or bolts along a line. */
export function rivets(ctx: Ctx, x: number, y: number, n: number, dx: number, dy = 0, color = "#cbd5e1") {
  if (!SHADED_ART) return;
  ctx.fillStyle = hit ? "#ffffff" : rgba(color, 0.6);
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(x + dx * i, y + dy * i, 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* A thin dark panel line. */
export function seam(ctx: Ctx, pts: number[][], a = 0.45, w = 0.4) {
  if (!SHADED_ART) return;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = `rgb(0 0 0 / ${hit ? a * 0.4 : a})`;
  ctx.lineWidth = w;
  ctx.stroke();
}

/* A thin bright line: a lit edge. */
export function lit(ctx: Ctx, pts: number[][], a = 0.35, w = 0.4) {
  if (!SHADED_ART) return;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = `rgb(255 255 255 / ${a})`;
  ctx.lineWidth = w;
  ctx.stroke();
}

/* A cylinder, drawn along a line: a dark body, a lighter middle, a thin highlight. */
export function tube(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, base: string) {
  if (!SHADED_ART) {
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
    ctx.strokeStyle = "#171717"; ctx.lineWidth = w + 1.2; ctx.stroke();
    ctx.strokeStyle = tone(base); ctx.lineWidth = w; ctx.stroke(); return;
  }
  const b = tone(base);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = mix(b, "#000000", 0.55);
  ctx.lineWidth = w + 0.9;
  ctx.stroke();
  ctx.strokeStyle = b;
  ctx.lineWidth = w;
  ctx.stroke();
  ctx.save();
  ctx.translate(-0.2, -0.3);
  ctx.strokeStyle = mix(b, "#ffffff", 0.55);
  ctx.lineWidth = Math.max(0.35, w * 0.28);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
  ctx.lineCap = "butt";
}

/* A soft contact shadow under something that stands on the ground. */
export function shadow(ctx: Ctx, x: number, y: number, rx: number, ry: number, a = 0.35) {
  ctx.fillStyle = `rgb(0 0 0 / ${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* An ellipse filled as metal. */
export function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, base: string, o: MetalOptions = {}) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  material(ctx, [cx - rx, cy - ry, cx + rx, cy + ry], base, o);
}

/* Points along part of an ellipse, for building domes and bells as paths. */
export function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 10) {
  const out: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

export { tone };
