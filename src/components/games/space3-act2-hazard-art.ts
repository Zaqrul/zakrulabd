/* Act 2 disasters and hyper-beams. Charge lives at its emitter; it never draws a field-wide warning line. */
import { H, W, type Beam, type Hazard, type State } from "./space-logic.ts";

type Ctx = CanvasRenderingContext2D;
const INK = "#171717";

function emitter(ctx: Ctx, x: number, y: number, charge: number, frame: number, reduceMotion: boolean) {
  const r = 2 + charge * 3;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "#343b49"; ctx.fillRect(-5, -3, 10, 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(-5, -3, 10, 6);
  ctx.fillStyle = "#fb7185"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = "#fff1c9"; ctx.beginPath(); ctx.arc(0, 0, Math.max(0.7, r * 0.35), 0, Math.PI * 2); ctx.fill();
  if (!reduceMotion && frame % 4 < 2) {
    ctx.strokeStyle = "rgb(255 241 201 / 0.78)"; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(-6, -3); ctx.moveTo(7, 4); ctx.lineTo(9, 6); ctx.stroke();
  }
  ctx.restore();
}

function drawGeyser(ctx: Ctx, h: Hazard, reduceMotion: boolean) {
  const x = h.x + h.w / 2, start = h.g[0] ?? 0, liveEnd = start + (h.g[1] ?? 0);
  if (h.t < start) {
    const charge = 1 - h.t / Math.max(1, start);
    ctx.fillStyle = "rgb(191 228 246 / 0.12)"; ctx.beginPath(); ctx.ellipse(x, H - 2, 4 + charge * 5, 1.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgb(224 246 255 / 0.56)"; ctx.lineWidth = 0.7; ctx.beginPath();
    ctx.arc(x, H - 2, 3 + charge * 4, Math.PI, Math.PI * 2); ctx.stroke();
    if (!reduceMotion) for (let i = 0; i < 3; i++) { ctx.fillStyle = "#d7eff8"; ctx.fillRect(x - 3 + i * 3, H - 6 - ((h.t + i * 3) % 8), 1, 1); }
    return;
  }
  if (h.t >= liveEnd) return;
  const top = Math.max(0, h.base), bottom = Math.min(H, h.base + h.half);
  const grad = ctx.createLinearGradient(x - h.w / 2, 0, x + h.w / 2, 0);
  grad.addColorStop(0, "rgb(8 14 25 / 0.1)"); grad.addColorStop(0.25, "#111a27"); grad.addColorStop(0.5, "#35475a"); grad.addColorStop(0.75, "#111a27"); grad.addColorStop(1, "rgb(8 14 25 / 0.1)");
  ctx.fillStyle = grad; ctx.fillRect(x - h.w / 2, top, h.w, bottom - top);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(x - h.w / 2 + 0.4, top, h.w - 0.8, bottom - top);
  ctx.strokeStyle = "rgb(214 238 249 / 0.78)"; ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    const xx = x - 4 + i * 2.5;
    ctx.beginPath(); ctx.moveTo(xx, bottom); ctx.lineTo(xx + (i % 2 ? 1 : -1), top + 6); ctx.stroke();
  }
}

function drawLightning(ctx: Ctx, h: Hazard, reduceMotion: boolean) {
  const start = h.g[0] ?? 0, liveEnd = start + (h.g[1] ?? 0), x = h.x + h.w / 2;
  if (h.t < start) {
    /* Charge crackles between distant clouds, not across the player's field. */
    ctx.fillStyle = "rgb(255 241 201 / 0.16)"; ctx.beginPath(); ctx.ellipse(x, 12, 8 + h.w / 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff1c9"; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(x - 3, 10); ctx.lineTo(x, 13); ctx.lineTo(x - 2, 16); ctx.lineTo(x + 3, 13); ctx.stroke();
    return;
  }
  if (h.t >= liveEnd) return;
  const top = Math.max(0, h.base), bottom = Math.min(H, h.base + h.half);
  ctx.save(); ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgb(251 113 133 / 0.45)"; ctx.lineWidth = Math.max(3, h.w * 0.55);
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - h.w * 0.22, top + (bottom - top) * 0.24); ctx.lineTo(x + h.w * 0.2, top + (bottom - top) * 0.48); ctx.lineTo(x - h.w * 0.16, top + (bottom - top) * 0.72); ctx.lineTo(x, bottom); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - h.w * 0.22, top + (bottom - top) * 0.24); ctx.lineTo(x + h.w * 0.2, top + (bottom - top) * 0.48); ctx.lineTo(x - h.w * 0.16, top + (bottom - top) * 0.72); ctx.lineTo(x, bottom); ctx.stroke();
  ctx.strokeStyle = "#fff1c9"; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(x, top + 1); ctx.lineTo(x - h.w * 0.22, top + (bottom - top) * 0.24); ctx.lineTo(x + h.w * 0.2, top + (bottom - top) * 0.48); ctx.lineTo(x - h.w * 0.16, top + (bottom - top) * 0.72); ctx.lineTo(x, bottom - 1); ctx.stroke();
  if (!reduceMotion) {
    ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x - h.w * 0.1, top + 22); ctx.lineTo(x - h.w * 0.7, top + 28); ctx.lineTo(x - h.w * 0.4, top + 38); ctx.stroke();
  }
}

function drawSolarColumn(ctx: Ctx, h: Hazard, reduceMotion: boolean) {
  const start = h.g[0] ?? 0, liveEnd = start + (h.g[1] ?? 0), x = h.x + h.w / 2;
  if (h.t < start) {
    emitter(ctx, W - 1, Math.min(H - 8, Math.max(8, h.base + h.half / 2)), 0.45, h.t, reduceMotion);
    return;
  }
  if (h.t >= liveEnd) return;
  const g = ctx.createLinearGradient(x - h.w, 0, x + h.w, 0);
  g.addColorStop(0, "rgb(251 113 133 / 0)"); g.addColorStop(0.28, "rgb(251 113 133 / 0.68)"); g.addColorStop(0.5, "#fff1c9"); g.addColorStop(0.72, "rgb(251 113 133 / 0.68)"); g.addColorStop(1, "rgb(251 113 133 / 0)");
  ctx.fillStyle = g; ctx.fillRect(x - h.w, 0, h.w * 2, H);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(x - h.w / 2, 0, h.w, H);
  if (!reduceMotion) {
    ctx.strokeStyle = "rgb(255 241 201 / 0.7)"; ctx.lineWidth = 0.7;
    for (let y = 0; y < H; y += 14) { ctx.beginPath(); ctx.moveTo(x - h.w / 3, y); ctx.lineTo(x + Math.sin(y / 9 + h.t) * h.w / 3, y + 7); ctx.stroke(); }
  }
}

export function drawOuterHazard(ctx: Ctx, h: Hazard, s: State, reduceMotion = false): boolean {
  if (s.chapter < 21 || s.chapter > 28 || h.kind !== "strike") return false;
  const style = h.g[2] ?? 0;
  if (s.chapter === 22 && style === 1) drawGeyser(ctx, h, reduceMotion);
  else if (s.chapter !== 21 && s.chapter !== 28 && h.w >= 18) drawSolarColumn(ctx, h, reduceMotion);
  else drawLightning(ctx, h, reduceMotion);
  return true;
}

export function drawOuterBeam(ctx: Ctx, bm: Beam, s: State, reduceMotion = false): boolean {
  if (s.chapter < 21 || s.chapter > 28) return false;
  if (bm.t < bm.warn) {
    const charge = Math.max(0, Math.min(1, bm.t / Math.max(1, bm.warn)));
    const x = bm.ownerId === undefined ? W - 2 : Math.max(4, bm.x0 - 1);
    emitter(ctx, x, bm.y, charge, s.frame, reduceMotion);
    return true;
  }
  const top = bm.y - bm.h / 2, bottom = bm.y + bm.h / 2;
  ctx.save(); ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgb(251 113 133 / 0.42)"; ctx.fillRect(0, top - 2, bm.x0, bm.h + 4);
  ctx.restore();
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, "#7f1d36"); g.addColorStop(0.22, "#fb7185"); g.addColorStop(0.5, "#fff1c9"); g.addColorStop(0.78, "#fb7185"); g.addColorStop(1, "#7f1d36");
  ctx.fillStyle = g; ctx.fillRect(0, top, bm.x0, bm.h);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(0.4, top + 0.4, Math.max(0, bm.x0 - 0.8), Math.max(0, bm.h - 0.8));
  ctx.fillStyle = "#fff1c9"; ctx.fillRect(0, bm.y - bm.h * 0.16, bm.x0, bm.h * 0.32);
  return true;
}
