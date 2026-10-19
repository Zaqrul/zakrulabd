/* A fortress welded from Kroll's fleet: mismatched armour, missile magazines,
   an open cannon deck and salvaged bridge. Solid parts fit the 84x60 body. */
import type { Enemy } from "./space-logic";
import { corvetTell } from "./space3-boss";

type Ctx = CanvasRenderingContext2D;

export function drawReclaimer(ctx: Ctx, e: Enemy, reduceMotion = false): boolean {
  if (e.type !== "boss20") return false;
  const phase = Math.min(2, Math.max(0, e.a)), tell = corvetTell(e), hit = e.flash > 0;
  const ink = "#171717", steel = "#aaa69e", seam = ["#fbcf33", "#fb923c", "#fb7185"][phase];
  const salvo = tell.verb === "salvo" || tell.verb === "armada" ? tell.charge : 0;
  const deck = tell.verb === "broadside" || tell.verb === "armada" ? tell.charge : 0;
  ctx.save(); ctx.translate(e.x, e.y); ctx.scale(e.w / 84, e.h / 60); ctx.lineJoin = "round";
  const poly = (points: number[][], fill: string, width = 0.8) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = hit ? "#ffffff" : fill; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = width; ctx.stroke();
  };
  const line = (points: number[][], colour: string, width = 0.7) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = hit ? "#fff1cc" : colour; ctx.lineWidth = width; ctx.stroke();
  };
  const box = (x: number, y: number, w: number, h: number, colour: string) =>
    poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], colour, 0.6);
  // Blunt carrier hull and snapped prow. No plate projects beyond the hitbox.
  poly([[3, 29], [10, 10], [28, 5], [65, 7], [81, 16], [82, 46], [65, 55], [19, 57], [8, 47]], "#38363e");
  poly([[1, 30], [9, 21], [15, 24], [11, 30], [15, 39], [8, 38]], "#81513c");
  poly([[17, 8], [28, 3], [62, 4], [69, 11], [62, 17], [18, 18]], "#706962");
  box(31, 2, 25, 7, "#4c4645");
  box(34, 4, 14, 2, "#171f2c"); line([[35, 4.7], [46, 4.7]], "#fbcf33", 0.9);
  box(57, 6, 7, 3, "#b91c1c");
  // Internal trusses and hot conduits are already present behind removable slabs.
  for (const side of [-1, 1]) {
    const y = 30 + side * 18;
    for (let i = 0; i < 5; i++) {
      const x = 16 + i * 11;
      line([[x, y - 3], [x + 6, y + 3], [x + 10, y - 3]], "#777a7d", 1.1);
    }
    line([[13, y], [28, y + side * 2], [38, y], [67, y]], seam, 1.1);
  }
  const plates = [
    [[10, 14], [28, 9], [36, 16], [30, 24], [12, 24]],
    [[40, 11], [66, 12], [76, 18], [69, 25], [42, 24]],
    [[47, 37], [72, 35], [77, 44], [65, 51], [47, 48]],
    [[11, 38], [30, 36], [40, 43], [35, 52], [19, 53]],
  ];
  for (let i = 0; i < plates.length; i++) {
    const torn = phase >= 1 && (i === 0 || i === 2) || phase === 2 && i === 3;
    if (!torn) {
      poly(plates[i], i % 2 ? "#77716a" : "#8a593f");
      const [x, y] = plates[i][0]; line([[x + 2, y + 1], [x + 13, y + 1]], steel);
    } else {
      const [x, y] = plates[i][0];
      poly([[x, y], [x + 5, y - 1], [x + 3, y + 4], [x + 8, y + 6], [x + 1, y + 7]], "#69666a");
      line([[x + 6, y + 4], [x + 12, y + 7], [x + 9, y + 10]], seam, 1.1);
    }
  }
  // Two racks become four. Their five cold missile noses light in charge order.
  const racks = phase === 0 ? [18, 44] : [13, 22, 39, 48];
  for (const y of racks) {
    box(20, y - 2.8, 49, 5.6, "#272831");
    line([[21, y - 2.3], [67, y - 2.3]], "#a29b8f", 0.7);
    for (let i = 0; i < 5; i++) {
      const x = 24 + i * 8.5, lit = salvo > i / 5;
      box(x, y - 1, 5, 2, lit ? "#fff1cc" : "#a8a29e");
      line([[x, y - 1], [x, y + 1]], lit ? "#fb7185" : "#5d5150", 0.8);
    }
  }
  // Cannon gallery crosses the entire hull. Empty space and bolts sell scale.
  poly([[5, 27], [72, 26], [79, 30], [72, 34], [5, 33]], "#22232b");
  for (let i = 0; i < 6; i++) {
    const x = 12 + i * 10;
    box(x, 28, 6, 4, "#4e5058");
    line([[x, 29], [x + 4, 29]], deck > 0 ? "#fb7185" : "#a39f99", 1);
  }
  line([[2, 30], [12, 30]], deck > 0 ? "#fff1cc" : seam, 1.2);
  // External ladder and rivet rows belong to the hull, not a screen overlay.
  for (const x of [74, 78]) line([[x, 16], [x, 43]], steel, 0.65);
  for (let y = 18; y <= 42; y += 4) line([[74, y], [78, y]], "#777f86", 0.7);
  for (let i = 0; i < 10; i++) {
    const x = 19 + i * 5;
    ctx.fillStyle = hit ? "#ffffff" : steel; ctx.fillRect(x, 7.8, 0.8, 0.8); ctx.fillRect(x, 54, 0.8, 0.8);
  }
  box(27, 50, 10, 2, "#b91c1c"); box(30, 48, 2, 5, "#b91c1c");
  for (const x of [15, 43, 68]) {
    ctx.fillStyle = "#fbcf33"; ctx.fillRect(x, 55, 1.3, 0.8);
  }
  if (phase === 2) {
    const glow = reduceMotion ? 0.8 : 0.7 + Math.sin(e.t / 13) * 0.15;
    ctx.save(); ctx.globalAlpha *= glow;
    line([[41, 7], [44, 12], [40, 16]], seam, 1.3);
    line([[47, 52], [51, 48], [49, 44]], seam, 1.3); ctx.restore();
  }
  if (tell.verb === "minefield" && tell.charge > 0) {
    ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(42, 30, 19 + (1 - tell.charge) * 8, 0, Math.PI * 2 * tell.charge); ctx.stroke();
  }
  ctx.restore(); return true;
}
