/* Europa's armoured leviathan: a heavy skull, scissor fangs and a reactor spine.
   Every solid plate, tooth and moving rib fits the real collision rectangle. */
import type { Enemy, State } from "./space-logic";
import { corvetTell } from "./space3-boss";
import { drawIndustrialCue } from "./space3-industrial-cues";

type Ctx = CanvasRenderingContext2D;

export function drawWyrm(ctx: Ctx, e: Enemy, reduceMotion = false): boolean {
  if (e.type !== "boss19") return false;
  const phase = Math.min(2, Math.max(0, e.a)), tell = corvetTell(e), hit = e.flash > 0;
  const seam = ["#72d5df", "#fbcf33", "#ff694f"][phase];
  const time = reduceMotion ? 0 : e.t / 26;
  const attack = ["lance", "chain", "fang", "snap", "surge"].includes(tell.verb ?? "");
  const charge = attack ? tell.charge : 0;
  const ultimate = tell.verb === "surge" ? tell.charge : 0;
  const ink = "#111722", steel = hit ? "#ffffff" : "#526779";
  ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.w / 156, e.h / 64); ctx.lineJoin = "round";
  const poly = (points: number[][], colour: string, rim = ink, width = 0.85) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath(); ctx.fillStyle = hit ? "#ffffff" : colour; ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = width; ctx.stroke();
  };
  const line = (points: number[][], colour: string, width = 0.8) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = hit ? "#fff1cc" : colour; ctx.lineWidth = width; ctx.stroke();
  };
  // Armoured cable and tail lance anchor the long silhouette behind the skull.
  poly([[43, 27], [139, 27], [154, 32], [139, 37], [43, 37]], "#263545");
  poly([[134, 28], [149, 26], [154, 32], [149, 38], [134, 36]], steel);
  line([[140, 32], [152, 32]], seam, 1.1);

  for (let i = 6; i >= 0; i--) {
    const x = 53 + i * 13.1;
    const y = 32 + Math.sin(time + i * 0.66) * (2 + phase * 0.35);
    const radius = 22 - i * 1.75;
    const lit = tell.verb === "shards" && tell.charge > 0 && i / 7 < tell.charge;
    const exposed = phase === 2 && i % 2 === 0;
    poly([[x - 10, y - 5], [x + 8, y - 5], [x + 11, y], [x + 8, y + 5], [x - 10, y + 5]], "#1e2837");
    // An open reactor vertebra, rather than a row of identical little crystals.
    ctx.beginPath(); ctx.ellipse(x, y, 4, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = ink; ctx.fill(); ctx.strokeStyle = steel; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, 2, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = hit || lit || ultimate > 0.7 ? "#fff1cc" : seam; ctx.fill();
    for (const side of [-1, 1]) {
      const yy = (d: number) => y + side * d;
      // Swept-back rib blades and heavy dorsal spikes make a predatory outline.
      poly([[x - 7, yy(5)], [x - 5, yy(radius - 5)], [x + 3, yy(radius + 3)], [x + 8, yy(radius - 1)], [x + 5, yy(7)]], steel);
      line([[x - 4, yy(7)], [x - 2, yy(radius - 5)], [x + 3, yy(radius - 1)]], seam, 1);
      if (!exposed) {
        poly([[x - 12, yy(7)], [x - 9, yy(radius - 2)], [x - 1, yy(radius + 1)], [x + 7, yy(radius - 5)], [x + 3, yy(5)]], i % 2 ? "#8fa9b2" : "#b0c6cc");
        poly([[x - 9, yy(radius - 2)], [x - 1, yy(radius + 1)], [x + 3, yy(radius - 4)], [x - 5, yy(radius - 6)]], "#d5e3df");
        line([[x - 9, yy(9)], [x - 4, yy(12)], [x - 7, yy(radius - 3)]], phase > 0 ? seam : "#597583", phase > 0 ? 1 : 0.6);
      } else {
        // Remaining broken stumps expose the rib bank; mass survives armour loss.
        poly([[x - 10, yy(6)], [x - 9, yy(13)], [x - 4, yy(10)], [x + 1, yy(13)], [x + 4, yy(5)]], "#6c7e89");
      }
      if (lit || ultimate > 0) line([[x - 6, yy(radius - 3)], [x, yy(radius - 1)]], "#ff876d", 1 + ultimate);
    }
  }

  // Broad armoured skull, deep black throat and a brow angled into the player.
  poly([[8, 32], [13, 15], [28, 5], [43, 12], [53, 24], [54, 41], [40, 53], [23, 56], [12, 46]], "#354b5b");
  poly([[10, 32], [18, 20], [34, 19], [44, 26], [44, 39], [31, 45], [18, 43]], ink);
  const gap = 5 + charge * 5 + phase * 0.7;
  for (const side of [-1, 1]) {
    const yy = (d: number) => 32 + side * d;
    poly([[25, yy(25)], [38, yy(31)], [35, yy(19)]], "#b9cdd2");
    poly([[2, yy(gap + 3)], [9, yy(20)], [25, yy(29)], [41, yy(23)], [49, yy(12)], [35, yy(9)], [21, yy(gap + 3)], [9, yy(gap)]], "#9cb5bf");
    poly([[9, yy(20)], [25, yy(29)], [41, yy(23)], [30, yy(20)], [19, yy(19)]], "#dae7e3");
    // Long fangs descend towards the hollow maw, their tips stay inside x >= 1.
    poly([[4, yy(gap + 10)], [15, yy(gap + 8)], [9, yy(3)], [1, yy(0.8)]], "#e7ede4", ink, 0.7);
    poly([[15, yy(gap + 4)], [22, yy(gap + 4)], [16, yy(2)]], "#c8d9d8", ink, 0.6);
    poly([[27, yy(gap + 4)], [32, yy(gap + 5)], [28, yy(4)]], steel, ink, 0.6);
    line([[25, yy(26)], [29, yy(21)], [26, yy(18)], [34, yy(13)]], phase > 0 ? seam : "#5b7382", phase > 0 ? 1.2 : 0.7);
    if (phase === 2) poly([[35, yy(12)], [41, yy(19)], [46, yy(12)], [43, yy(7)]], "#253544");
  }
  // Recessed blast furnace aligns with the simulation's left-centre muzzle.
  ctx.beginPath(); ctx.ellipse(29, 32, 5, 9 + charge * 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#172332"; ctx.fill(); ctx.strokeStyle = seam; ctx.lineWidth = 1.4 + charge; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(28, 32, 2.2 + charge, 5 + charge * 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = charge > 0.65 || hit ? "#fff1cc" : seam; ctx.fill();
  line([[1, 32], [19, 32], [25, 32]], seam, 0.7 + charge * 1.5);
  // Slit eyes under overhanging brows: coral hostility even in the cold phase.
  for (const side of [-1, 1]) {
    const y = 32 + side * 15;
    poly([[16, y], [29, y - side * 3], [36, y], [24, y + side * 2]], ink);
    line([[19, y], [29, y - side * 1.4]], phase === 2 ? "#fff1cc" : "#ff694f", 1.5);
    line([[14, y - side * 3], [28, y - side * 6], [38, y - side * 2]], "#d6e2df", 1.5);
  }
  ctx.restore(); return true;
}

export function drawWyrmCue(ctx: Ctx, e: Enemy, s: State) {
  if (e.type === "boss19") drawIndustrialCue(ctx, e, s);
}
