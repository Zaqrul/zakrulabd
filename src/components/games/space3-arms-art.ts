/* Wind-up marks for the five added boss weapons. Read only the director's
   current attack; these cues never predict hidden aim or use a visual clock. */
import type { Enemy, State } from "./space-logic";
import { corvetTell } from "./space3-boss";

const CORAL = "#fb7185";

export function drawArmsCue(ctx: CanvasRenderingContext2D, e: Enemy, s: State) {
  if (s.chapter < 17 || !e.type.startsWith("boss")) return;
  const tell = corvetTell(e), verb = tell.verb, charge = tell.charge;
  if (charge <= 0 || (verb !== "dash" && verb !== "flame" && verb !== "blades")) return;

  const cy = e.y + e.h / 2, lane = tell.lane;
  ctx.save();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = `rgb(251 113 133 / ${0.38 + charge * 0.42})`;
  ctx.fillStyle = `rgb(251 113 133 / ${0.08 + charge * 0.12})`;

  if (verb === "dash") {
    /* Show only the committed lane and approach direction; the boss body
       movement remains the simulation's source of truth. */
    ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(5, lane); ctx.lineTo(e.x - 3, lane); ctx.stroke();
    ctx.setLineDash([]);
    const x = Math.max(8, e.x - 8 - charge * 16);
    ctx.beginPath(); ctx.moveTo(x + 5, lane - 4); ctx.lineTo(x, lane); ctx.lineTo(x + 5, lane + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(e.x - 4, lane - 7); ctx.lineTo(e.x + 2, lane - 7); ctx.lineTo(e.x + 2, lane + 7); ctx.lineTo(e.x - 4, lane + 7); ctx.stroke();
  } else if (verb === "flame") {
    /* A restrained cone points along the locked lane. Its edges open with the
       charge so the player can read the attack without masking the scene. */
    const spread = 5 + charge * 13;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(e.x + 2, cy); ctx.lineTo(7, lane - spread); ctx.lineTo(7, lane + spread); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(e.x + 2, cy); ctx.lineTo(7, lane); ctx.stroke();
    ctx.beginPath(); ctx.arc(e.x + 2, cy, 2 + charge * 2, 0, Math.PI * 2); ctx.stroke();
  } else {
    /* Glowing launch ports and a short fan show where the returning blades
       leave the hull; the exact count and flight paths stay unmarked. */
    for (const side of [-1, 1]) {
      const y = cy + side * e.h * 0.24;
      ctx.beginPath(); ctx.arc(e.x - 3, y, 2 + charge * 1.5, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(e.x - 5, y); ctx.lineTo(Math.max(8, e.x - 28), lane + side * (4 + charge * 5)); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = charge > 0.8 ? "#fff1cc" : CORAL;
  }
  ctx.restore();
}
