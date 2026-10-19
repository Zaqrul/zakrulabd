/* Pattern geometry is part of combat feedback: danger shapes describe actual
   lanes, openings, body sweeps and projectile routes, including reduced motion. */
import { BOSS_MUZZLE, GROUND_Y, H, WATER_Y, bossScale, hidesAttackPrediction, isMini, miniMuzzle, type Enemy } from "./space-logic";
import { PATTERN } from "./space2-attack-patterns";

type Ctx = CanvasRenderingContext2D;
const RED = "#fb7185", CREAM = "#fff1c9";
function outlinedStroke(ctx: Ctx) {
  ctx.save(); ctx.strokeStyle = "#171717"; ctx.lineWidth += 1.2; ctx.stroke(); ctx.restore(); ctx.stroke();
}
function source(e: Enemy, slot = 0) {
  if (isMini(e.type)) return miniMuzzle(e, slot);
  const p = BOSS_MUZZLE[e.type], scale = bossScale(e);
  return { x: e.x + (p?.x ?? 0) * scale, y: e.y + ((p?.y ?? e.h / 2) + slot * (p?.dy ?? 0)) * scale };
}
function arrow(ctx: Ctx, x: number, y: number, angle: number, size = 4) {
  ctx.beginPath(); ctx.moveTo(x + Math.cos(angle - 2.5) * size, y + Math.sin(angle - 2.5) * size);
  ctx.lineTo(x, y); ctx.lineTo(x + Math.cos(angle + 2.5) * size, y + Math.sin(angle + 2.5) * size); outlinedStroke(ctx);
}
export function drawPatternCue(ctx: Ctx, e: Enemy, reduceMotion = false) {
  if (hidesAttackPrediction(e)) return;
  const a = e.attack;
  if (!a || a.t >= a.warn + a.live) return;
  const warning = a.t < a.warn, t2 = Math.max(0, a.t - a.warn);
  const locked = a.t >= a.warn - (a.lockFrames ?? (isMini(e.type) ? PATTERN.miniLock : PATTERN.bossLock));
  const colour = locked ? CREAM : RED, port = source(e);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 24, 384, H - 24); ctx.clip();
  ctx.strokeStyle = colour; ctx.lineWidth = 1; ctx.fillStyle = "rgb(251 113 133 / 0.08)";
  const path = (x1: number, y1: number, x2: number, y2: number, width = 0) => {
    if (width) { ctx.save(); ctx.strokeStyle = "rgb(251 113 133 / 0.09)"; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
    ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); outlinedStroke(ctx); ctx.setLineDash([]);
  };
  const ring = (x: number, y: number, r = 10) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); outlinedStroke(ctx); };
  const corridor = (axis: "x" | "y", at: number, half: number) => {
    ctx.save(); ctx.strokeStyle = CREAM; ctx.setLineDash([2, 5]);
    for (const v of [at - half, at + half]) {
      ctx.beginPath(); if (axis === "x") { ctx.moveTo(v, 28); ctx.lineTo(v, 196); } else { ctx.moveTo(12, v); ctx.lineTo(Math.min(190, e.x - 16), v); } outlinedStroke(ctx);
    }
    ctx.setLineDash([]); arrow(ctx, axis === "x" ? at : 26, axis === "x" ? 38 : at, axis === "x" ? Math.PI / 2 : 0); ctx.restore();
  };
  if (a.gapX !== undefined) corridor("x", a.gapX, a.safeHalf ?? 26);
  if (a.gapY !== undefined && a.kind !== "broadside") corridor("y", a.gapY, a.safeHalf ?? 26);
  if (a.gapAngle !== undefined && !["cluster", "lances", "vortex"].includes(a.kind)) {
    const p = a.kind === "maelstrom" ? { x: e.x + e.w / 2, y: e.y + e.h / 2 } : port;
    const half = a.kind === "chaff" ? 0.4 : a.kind === "maelstrom" ? 0.3 : a.kind === "pinwheel" ? 0.26 : 0.19;
    const reach = Math.min(300, Math.max(70, p.x - 20));
    ctx.save(); ctx.strokeStyle = CREAM;
    for (const angle of [a.gapAngle - half, a.gapAngle + half]) path(p.x, p.y, p.x + Math.cos(angle) * reach, p.y + Math.sin(angle) * reach);
    arrow(ctx, p.x + Math.cos(a.gapAngle) * 65, p.y + Math.sin(a.gapAngle) * 65, a.gapAngle); ctx.restore();
  }
  if (a.kind === "broadside") {
    const wave = warning ? 0 : Math.min(4, Math.floor(t2 / 32));
    const y = Math.max(52, Math.min(166, a.gapY! + Math.sin(wave * 0.7) * 18));
    for (const slot of [-1, 0, 1]) {
      const p = source(e, slot), angle = Math.atan2(y - p.y, 40 - p.x);
      ctx.save(); ctx.strokeStyle = CREAM;
      for (const d of [-0.2, 0.2]) { const a2 = angle + d, dx = 24 - p.x; path(p.x, p.y, 24, p.y + Math.tan(a2) * dx); }
      ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = CREAM; arrow(ctx, 40, y, 0); ctx.restore();
  }
  if (a.kind === "vortex" && a.spots?.[0]) {
    const p = a.spots[0], gap = a.gapAngle ?? -Math.PI / 2;
    if (warning || t2 < 18) {
      ctx.beginPath(); ctx.arc(p.x, p.y, PATTERN.vortexRadius, gap + 0.6, gap + Math.PI * 2 - 0.6); outlinedStroke(ctx);
      ctx.save(); ctx.strokeStyle = CREAM;
      arrow(ctx, p.x + Math.cos(gap) * 60, p.y + Math.sin(gap) * 60, gap, 6); ctx.restore();
    }
  }
  if (!warning) { ctx.restore(); return; }
  switch (a.kind) {
    case "railshot": case "harpoon":
      (a.lanes ?? []).forEach((y, i) => { const p = source(e, a.kind === "harpoon" ? i : 0); path(p.x, p.y, 24, y, a.kind === "railshot" ? 7 : 6); }); break;
    case "ladder":
      (a.lanes ?? []).forEach((y, i) => { path(source(e, i).x, y, 12, y, 6); ring(22 + i * 12, y, 3); }); break;
    case "torpfan":
      for (const y of a.lanes ?? []) path(port.x, port.y, 24, y, 6); break;
    case "sweep": {
      const [from, to] = a.lanes ?? [30, 142]; ctx.fillRect(0, Math.min(from, to) - 8, port.x, Math.abs(to - from) + 16);
      path(port.x - 12, from, port.x - 12, to); arrow(ctx, port.x - 12, to, to > from ? Math.PI / 2 : -Math.PI / 2); break;
    }
    case "scissor":
      for (const [y, end] of [[a.lanes?.[0] ?? 67, 78], [a.lanes?.[1] ?? 151, 138]]) { ctx.fillRect(0, Math.min(y, end) - 6, port.x, Math.abs(y - end) + 12); arrow(ctx, 100, end, end > y ? Math.PI / 2 : -Math.PI / 2); } break;
    case "twister":
      ctx.fillRect(12, a.lanes?.[0] ?? 30, e.x - 20, 98); arrow(ctx, e.x - 40, (a.lanes?.[0] ?? 30) + 48, Math.PI); break;
    case "rotorwash":
      for (const p of a.spots ?? []) path(e.x + 47, e.y + 22, p.x, p.y, 7); break;
    case "cableslide":
      ctx.fillRect(Math.min(...(a.cols ?? [e.x])) - e.w / 2, 20, e.x + e.w - Math.min(...(a.cols ?? [e.x])) + e.w / 2, e.h + 2);
      for (const [i, x] of (a.cols ?? []).entries()) { path(x, 20 + e.h, x, 198, 8); ctx.fillStyle = colour; ctx.font = "bold 7px sans-serif"; ctx.fillText(String(i + 1), x + 4, 64); ctx.fillStyle = "rgb(251 113 133 / 0.08)"; } break;
    case "geysers": case "avalanche": case "sandspout": case "icebreak": case "lightning": case "orbital": case "march": case "periscope": case "gatelaser":
      (a.cols ?? []).forEach((x, i) => {
        const top = a.kind === "icebreak" ? WATER_Y - 104 : a.kind === "sandspout" ? 46 : 28;
        const bottom = ["icebreak", "periscope", "geysers"].includes(a.kind) ? WATER_Y : H - 8;
        path(x, top, x, bottom, a.kind === "lightning" ? 16 : 20);
        ctx.fillStyle = colour; ctx.font = "bold 7px sans-serif"; ctx.fillText(String(i + 1), x + 4, top + 10); ctx.fillStyle = "rgb(251 113 133 / 0.08)";
      }); break;
    case "quake":
      for (const p of a.spots ?? []) { path(p.x, GROUND_Y - 3, p.x, 28, 14); arrow(ctx, p.x, GROUND_Y - 18, -Math.PI / 2); } break;
    case "rocketfist":
      for (const p of a.spots ?? []) { const from = a.origin ?? port; path(from.x, from.y, p.x, p.y, 22); ctx.strokeRect(p.x - 12, p.y - 11, 24, 22); } break;
    case "duneram": case "ram": {
      const height = a.kind === "ram" ? 26 : e.h; ctx.fillRect(12, GROUND_Y - height, e.x + e.w - 12, height);
      for (let x = e.x - 20; x > 16; x -= 34) arrow(ctx, x, GROUND_Y - height / 2, Math.PI); break;
    }
    case "skip": case "divebomb":
      for (const p of a.spots ?? []) {
        const y = a.kind === "skip" ? WATER_Y - e.h / 2 : p.y;
        const from = a.origin ?? { x: e.x, y: e.y };
        path(from.x + e.w / 2, from.y + e.h / 2, p.x, y, e.h + 6);
        ctx.strokeRect(p.x - e.w / 2 - 3, y - e.h / 2 - 3, e.w + 6, e.h + 6);
      } break;
    case "burrow":
      for (const p of a.spots ?? []) { ctx.strokeRect(p.x - e.w / 2 - 4, GROUND_Y - e.h - 36, e.w + 8, e.h + 40); arrow(ctx, p.x, GROUND_Y - e.h - 24, -Math.PI / 2); } break;
    case "lances": case "cluster": case "mortar": case "shatter":
      for (const p of a.spots ?? []) {
        path(port.x, port.y, p.x, p.y, 7); ring(p.x, p.y, 12);
        const gap = a.gapAngle;
        if (gap !== undefined) { ctx.save(); ctx.strokeStyle = CREAM; arrow(ctx, p.x + Math.cos(gap) * 22, p.y + Math.sin(gap) * 22, gap); ctx.restore(); }
        else for (let i = 0; i < 4; i++) { const ang = i * Math.PI / 2; path(p.x + Math.cos(ang) * 14, p.y + Math.sin(ang) * 14, p.x + Math.cos(ang) * 23, p.y + Math.sin(ang) * 23); }
      } break;
    case "sweepgun": case "searchlight": case "shielddrones": case "barrage":
      for (const p of a.spots ?? []) { path(port.x, port.y, p.x, p.y, 7); ring(p.x, p.y, 9); } break;
    case "grid":
      /* Every column and lane that will burn; the open ones are the corridors drawn above. */
      for (const x of a.cols ?? []) path(x, 28, x, 196, 22);
      for (const y of a.lanes ?? []) path(port.x - 8, y, 12, y, 14);
      break;
    case "helix":
      /* The gun the arms wheel out of, with the way they will turn. */
      for (const p of a.spots ?? []) { ring(p.x, p.y, 12); for (const k of [0, 1, 2]) arrow(ctx, p.x + Math.cos(Math.PI + k * 2.1) * 18, p.y + Math.sin(Math.PI + k * 2.1) * 18, Math.PI + k * 2.1 + Math.PI / 2); } break;
    case "rain":
      /* Where each column will fall from. */
      for (const x of a.cols ?? []) { path(x, 26, x, 60); arrow(ctx, x, 60, Math.PI / 2); } break;
    case "lattice":
      for (const slot of [0, 2]) { const p = source(e, slot); path(p.x, p.y, 24, p.y + (slot === 0 ? -1 : 1) * 70, 6); } break;
  }
  // Cosmetic pulse is never required to see the cue.
  if (!reduceMotion) { ctx.globalAlpha = 0.35 + 0.15 * Math.sin(a.t / 6); ring(port.x, port.y, 3); }
  ctx.restore();
}
