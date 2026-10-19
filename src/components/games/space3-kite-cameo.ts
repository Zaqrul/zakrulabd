/* Halo's ORB rescue escort, scenery only. No wingman or collision state. */
export function drawKiteCameo(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, reduceMotion = false) {
  ctx.save(); ctx.translate(x, y); ctx.lineJoin = "round";
  ctx.strokeStyle = "#171717"; ctx.lineWidth = 0.8;
  for (const side of [-1, 1]) {
    const length = reduceMotion ? 1.5 : 1.5 + Math.sin(t / 18 + side) * 0.3;
    ctx.fillStyle = "#0f766e"; ctx.fillRect(-8, side * 3 - 1.2, 5, 2.4);
    ctx.fillStyle = "#5eead4"; ctx.fillRect(-8 - length, side * 3 - 0.35, length, 0.7);
  }
  ctx.beginPath(); ctx.ellipse(-2.8, 0, 4.7, 4.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#f3f6f1"; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#0f766e"; ctx.fillRect(-5.5, -2, 4, 1.6);
  ctx.fillStyle = "#5eead4"; ctx.fillRect(-4.9, -1.8, 2.3, 0.6);
  ctx.fillStyle = "#fb923c"; ctx.fillRect(-3.2, 0.8, 1.1, 2.6); ctx.fillRect(-4, 1.5, 2.7, 1.1);
  ctx.beginPath(); ctx.arc(0, 0, 8, -1.16, 1.16);
  ctx.lineTo(Math.cos(1.16) * 4.9, Math.sin(1.16) * 4.9);
  ctx.arc(0, 0, 4.9, 1.16, -1.16, true); ctx.closePath();
  ctx.fillStyle = "#f3f6f1"; ctx.fill(); ctx.stroke();
  for (const [radius, colour, width] of [[6.5, "#0f766e", 1.2], [7.35, "#5eead4", 0.8]] as const) {
    ctx.beginPath(); ctx.arc(0, 0, radius, -1.08, 1.08); ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke();
  }
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.arc(0, 0, 6.6, side * 0.77 - 0.1, side * 0.77 + 0.1);
    ctx.strokeStyle = "#fb923c"; ctx.lineWidth = 2.1; ctx.stroke();
  }
  ctx.fillStyle = "#fbcf33"; ctx.fillRect(0.2, -0.55, 1.1, 1.1);
  ctx.restore();
}
