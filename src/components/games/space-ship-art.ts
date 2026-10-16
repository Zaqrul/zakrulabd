/* Flat Canvas shapes, at the same detail level as the other game actors.
   Each dorsal spine has three hinged plates; nothing is baked into a sprite. */
type Ctx = CanvasRenderingContext2D;
const INK = "#171717";
const BLUE = "#3b82f6";
const YELLOW = "#fbcf33";

function panel(ctx: Ctx, points: number[][], fill: string) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.55;
  ctx.stroke();
}

function joint(ctx: Ctx, x: number, y: number, r = 0.65) {
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function spine(ctx: Ctx, x: number, y: number, frame: number, tilt: number, phase: number, far: boolean) {
  ctx.save();
  ctx.translate(x, y);
  if (far) ctx.scale(0.74, 0.82);
  // Child plates inherit the parent hinge, with a small delayed follow-through.
  for (let segment = 0; segment < 3; segment++) {
    ctx.rotate(Math.sin(frame / 34 - segment * 0.8 + phase) * 0.028 - tilt * 0.05);
    panel(ctx, [[-3, 1], [3, 1], [1, -3.3], [-5, -3.3]], far ? "#2563eb" : BLUE);
    if (segment === 2) {
      ctx.fillStyle = YELLOW;
      ctx.fillRect(-4.6, -3.2, 5.2, 0.9);
    }
    joint(ctx, 0, 0.5);
    ctx.translate(-1.8, -2.8);
  }
  ctx.restore();
}

export function drawEndymionHull(ctx: Ctx, frame = 0, tilt = 0) {
  ctx.save();
  ctx.lineJoin = "round";
  spine(ctx, 16, 2, frame, tilt, 1.8, true);

  // A simple engine collar, body and two colours instead of metal shading.
  ctx.save();
  ctx.translate(1, 5);
  ctx.rotate(Math.sin(frame / 40) * 0.012);
  panel(ctx, [[-6, -2], [0, -2], [0, 2], [-6, 2]], "#64748b");
  ctx.fillStyle = INK;
  ctx.fillRect(-4.5, -2, 0.6, 4);
  ctx.fillRect(-2.5, -2, 0.6, 4);
  ctx.restore();
  panel(ctx, [[0, 3], [8, 0], [19, 3], [21, 7], [5, 9], [0, 7]], BLUE);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(0.5, 3.5, 2, 4);
  spine(ctx, 8.5, 2, frame, tilt, 0, false);

  // The near wing and head turn on their own pivots.
  ctx.save();
  ctx.translate(8, 6);
  ctx.rotate(Math.sin(frame / 38 + 1) * 0.025 - tilt * 0.06);
  panel(ctx, [[-5, -1], [-8, 4], [7, -1]], BLUE);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(-5.5, 1.5, 5, 0.8);
  ctx.restore();

  ctx.save();
  ctx.translate(18, 5);
  ctx.rotate(Math.sin(frame / 44 + 0.5) * 0.018 - tilt * 0.04);
  panel(ctx, [[-2, -2], [3, -2], [8, 2], [7, 4], [0, 3], [-2, 1]], "#e5e7eb");
  panel(ctx, [[2, -0.5], [5, 0.5], [5, 2], [2, 1.5]], "#4ade80");
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(2, -2, 1.5, 0.8);
  ctx.fillStyle = INK;
  ctx.fillRect(5, 3, 3.5, 0.65);
  ctx.restore();
  joint(ctx, 13.6, 9.6, 1);
  ctx.restore();
}
