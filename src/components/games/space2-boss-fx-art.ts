/* The warnings and the effects of Space 2's own boss attacks. Every attack marks where it will land
   while it winds up, in the hostile coral Space 1 uses, with a cream line once it has locked: lanes
   across the screen, columns, spots, the gap to fly through. Then the strikes themselves, the
   lunging heads and limbs, the searchlight, the twister and the gust. Flat shapes, a dark rim. */
import { GUST, H, W, isFinal, isSecondBoss, type Enemy, type Hazard, type State } from "./space-logic";

import { drawArsenalCue } from "./space2-arsenal-art";
import { drawPatternCue } from "./space2-pattern-cues";
import { drawCover } from "./space2-cover-art";

type Ctx = CanvasRenderingContext2D;

const INK = "#1f262b";
const CORAL = "#fb7185";

function band(ctx: Ctx, x: number, y: number, w: number, h: number, pulse: number) {
  ctx.fillStyle = `rgb(251 113 133 / ${0.08 + pulse * 0.07})`;
  ctx.fillRect(x, y, w, h);
}

function dashed(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, colour: string, width = 1, dash: number[] = [6, 5]) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function poly(ctx: Ctx, pts: number[][], fill: string, rim = INK) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/* Marks for a Space 2 boss's attack while it winds up, and the parts of it that lunge while it fires. */
export function drawSecondCue(ctx: Ctx, e: Enemy, s: State, reduceMotion = false) {
  if (!isSecondBoss(e.type) || !e.attack) return;
  if (drawArsenalCue(ctx, e, reduceMotion)) return;
  /* The last boss shows only what is really happening, never where it will land (see hidesTells). */
  if (!isFinal(e.type)) drawPatternCue(ctx, e, reduceMotion);
  const a = e.attack;
  const firing = a.t >= a.warn && a.t < a.warn + a.live;
  ctx.save();
  /* Whatever is lunging out of the boss: necks and heads, a runaway car, a fist on its cable. */
  if (firing) {
    for (const part of e.parts) {
      const midY = part.y + part.h / 2;
      if (a.kind === "ram") {
        poly(ctx, [[part.x, part.y + 4], [part.x + 4, part.y], [part.x + part.w, part.y], [part.x + part.w, part.y + part.h - 4], [part.x, part.y + part.h - 4]], "#64748b");
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(part.x + 6, part.y + 6, 12, 2);
        for (const dx of [6, part.w - 6]) {
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.arc(part.x + dx, part.y + part.h - 3, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (a.kind === "rocketfist") {
        dashed(ctx, part.x + part.w / 2, midY, a.origin?.x ?? e.x + 6, a.origin?.y ?? midY, "#94a3b8", 1.6, [3, 2]);
        poly(ctx, [[part.x, part.y + 3], [part.x + 6, part.y], [part.x + part.w, part.y + 2], [part.x + part.w, part.y + part.h - 2], [part.x + 6, part.y + part.h], [part.x, part.y + part.h - 3]], "#64748b");
        ctx.fillStyle = reduceMotion ? "#fde68a" : s.frame % 4 < 2 ? "#fde68a" : "#f59e0b";
        ctx.fillRect(part.x + part.w, midY - 2, 5, 4);
      }
    }
  }
  ctx.restore();
}

/* A column strike: marked first (a faint band with a dashed edge), then live. Sea spray is white and
   blue, sand ochre, light white-hot with a cyan rim, ice pale blue. A twister is a grey funnel. */
export function drawSecondHazard(ctx: Ctx, h: Hazard, reduceMotion = false): boolean {
  if (drawCover(ctx, h, reduceMotion)) return true;
  if (h.kind === "strike") {
    const [warn, live, style] = h.g;
    const pulse = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(h.t / 3);
    if (h.t < warn) {
      band(ctx, h.x, h.base, h.w, h.half, pulse);
      dashed(ctx, h.x, h.base, h.x, h.base + h.half, CORAL, 1);
      dashed(ctx, h.x + h.w, h.base, h.x + h.w, h.base + h.half, CORAL, 1);
      return true;
    }
    const u = Math.min(1, (warn + live - h.t) / 6);
    const [edge, core] = style === 0 ? ["#7dd3fc", "#f0f9ff"] : style === 1 ? ["#b4752f", "#f5d9a0"] : style === 3 ? ["#93c5fd", "#e0f2fe"] : ["#67e8f9", "#ffffff"];
    ctx.save();
    ctx.globalAlpha = u;
    ctx.fillStyle = edge;
    ctx.fillRect(h.x, h.base, h.w, h.half);
    ctx.fillStyle = core;
    ctx.fillRect(h.x + h.w * 0.25, h.base, h.w * 0.5, h.half);
    if (style !== 2) {
      for (let i = 0; i < 5; i++) {
        const y = h.base + ((h.t * 3 + i * 23) % Math.max(1, h.half));
        ctx.fillStyle = "rgb(255 255 255 / 0.6)";
        ctx.fillRect(h.x + 2 + (i % 2) * (h.w - 6), y, 3, 3);
      }
    }
    ctx.restore();
    return true;
  }
  if (h.kind === "twister") {
    const warn = h.g[0];
    if (h.t < warn) {
      band(ctx, h.x, h.base, h.w, h.half, 0.5);
      dashed(ctx, h.x + h.w / 2, h.base, h.x + h.w / 2, h.base + h.half, CORAL, 1);
      return true;
    }
    ctx.save();
    const spin = reduceMotion ? 0 : h.t / 4;
    for (let i = 0; i < 9; i++) {
      const y = h.base + (i / 8) * h.half;
      const wide = 4 + (i / 8) * (h.w - 4);
      const sway = Math.sin(spin + i * 0.7) * 3;
      ctx.fillStyle = i % 2 ? "rgb(120 140 145 / 0.85)" : "rgb(170 190 195 / 0.85)";
      ctx.beginPath();
      ctx.ellipse(h.x + h.w / 2 + sway, h.base + h.half - (y - h.base), wide / 2 + 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }
  return false;
}

/* A gust: arrows down the screen's edge while it is marked, the way it will push; then streaks. */
export function drawGust(ctx: Ctx, s: State, reduceMotion = false) {
  const g = s.gust;
  if (!g) return;
  const up = g.dy < 0;
  ctx.save();
  if (g.t < GUST.warn) {
    const pulse = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(g.t / 3);
    ctx.globalAlpha = pulse;
    for (const x of [8, W - 18]) {
      for (let k = 0; k < 3; k++) {
        const y = H / 2 + (up ? -1 : 1) * (k * 14 - 14);
        poly(ctx, up ? [[x, y + 4], [x + 5, y - 4], [x + 10, y + 4]] : [[x, y - 4], [x + 5, y + 4], [x + 10, y - 4]], CORAL, CORAL);
      }
    }
  } else {
    ctx.strokeStyle = "rgb(230 240 245 / 0.45)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 22; i++) {
      const x = (i * 37 + s.frame * 2) % W;
      const y = (i * 53 + (up ? -1 : 1) * s.frame * 4) % H;
      ctx.beginPath();
      ctx.moveTo(x, (y + H) % H);
      ctx.lineTo(x + 2, ((y + H) % H) + (up ? -10 : 10));
      ctx.stroke();
    }
  }
  ctx.restore();
}
