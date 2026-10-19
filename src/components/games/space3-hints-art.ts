/* The first flight teaches itself: three lines of instruction on the first chapter's first fifteen seconds. Most players do not know
   that flying close to enemy fire fills the meter that powers everything else, so the first line says exactly that. English only.
   Drawn over the field like the engine's own callouts; reads state and writes nothing. */
import type { State } from "./space-logic";

const W = 384;

type Ctx = CanvasRenderingContext2D;

/* The line for a frame of the chapter, or null when the lessons are over. Frames count from when the ship starts to fly; the chapter
   card holds the first 150, so the lessons begin just after it. */
export const HINTS = [
  { from: 170, to: 520, text: "THE KINETIC CELL CHARGES BY ITSELF AND FROM EVERY KILL" },
  { from: 540, to: 890, text: "B: KINETIC PUSH (COSTS 40%). SHOVES ENEMIES AND SHOTS AWAY" },
  { from: 910, to: 1260, text: "YOUR PLASMA TORPEDO LAUNCHES BY ITSELF AND EXPLODES ON IMPACT" },
];
export const hintFor = (t: number) => HINTS.find((h) => t >= h.from && t < h.to)?.text ?? null;

export function drawHints(ctx: Ctx, s: State, font: string) {
  if (s.chapter !== 17 || s.phase !== "play") return;
  const hint = HINTS.find((h) => s.t >= h.from && s.t < h.to);
  if (!hint) return;
  const a = Math.max(0, Math.min(1, (s.t - hint.from) / 20, (hint.to - s.t) / 20));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `800 7px ${font}`;
  ctx.textAlign = "center";
  const w = ctx.measureText(hint.text).width + 18;
  ctx.fillStyle = "rgb(7 12 28 / 0.8)";
  ctx.fillRect(W / 2 - w / 2, 44, w, 14);
  ctx.fillStyle = "#fbcf33";
  ctx.fillRect(W / 2 - w / 2, 44, 2, 14);
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(hint.text, W / 2 + 1, 53.4);
  ctx.restore();
}
