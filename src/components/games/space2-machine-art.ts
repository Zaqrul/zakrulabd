/* Flat, ink-rimmed machinery for Space 2's heavy units. Deliberately modelled
   plates, cast housings, bolts and cylinders, rather than bitmap textures. */
import { tone } from "./space-material";

export const MACHINE = {
  ink: "#171717", hull: "#4d5b3a", face: "#718064", bevel: "#b6bea0",
  steel: "#64748b", metal: "#aab4b5", dark: "#27312e", cream: "#dfd4af",
  rust: "#8f654a", hostile: "#fb7185",
} as const;

export function machineKit(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const c = MACHINE;
  const poly = (pts: number[][], fill: string) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py));
    ctx.closePath(); ctx.fillStyle = tone(fill); ctx.fill();
    ctx.strokeStyle = c.ink; ctx.lineWidth = 0.8; ctx.lineJoin = "round"; ctx.stroke();
  };
  const box = (px: number, py: number, w: number, h: number, fill: string) => poly([[px, py], [px + w, py], [px + w, py + h], [px, py + h]], fill);
  const disc = (px: number, py: number, rx: number, fill: string, ry = rx) => {
    ctx.beginPath(); ctx.ellipse(x + px, y + py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = tone(fill); ctx.fill(); ctx.strokeStyle = c.ink; ctx.lineWidth = 0.8; ctx.stroke();
  };
  const rod = (px: number, py: number, qx: number, qy: number, w: number, fill: string) => {
    ctx.beginPath(); ctx.moveTo(x + px, y + py); ctx.lineTo(x + qx, y + qy);
    ctx.strokeStyle = c.ink; ctx.lineWidth = w + 1.3; ctx.stroke();
    ctx.strokeStyle = tone(fill); ctx.lineWidth = w; ctx.stroke();
  };
  const bolts = (px: number, py: number, count: number, gap = 4) => {
    for (let i = 0; i < count; i++) {
      disc(px + i * gap, py, 0.65, c.dark);
      ctx.fillStyle = tone(c.cream); ctx.fillRect(x + px + i * gap - 0.35, y + py - 0.5, 0.55, 0.45);
    }
  };
  const vents = (px: number, py: number, count: number, height = 4, gap = 2.7) => {
    for (let i = 0; i < count; i++) {
      box(px + i * gap, py, 1.1, height, c.ink);
      ctx.fillStyle = tone(c.bevel); ctx.fillRect(x + px + i * gap + 1.2, y + py, 0.45, height - 0.5);
    }
  };
  const plate = (px: number, py: number, w: number, h: number, fill: string = c.hull, cut = 2) => {
    const b = Math.min(cut, w / 4, h / 4);
    poly([[px + b, py], [px + w - b, py], [px + w, py + b], [px + w, py + h - b], [px + w - b, py + h], [px + b, py + h], [px, py + h - b], [px, py + b]], fill);
    poly([[px + b, py + 0.6], [px + w - b, py + 0.6], [px + w - b - 1, py + 2], [px + b, py + 2.4]], c.bevel);
    if (w >= 12 && h >= 7) bolts(px + 3, py + h - 2, Math.max(2, Math.floor((w - 4) / 6)), 6);
  };
  const piston = (px: number, py: number, qx: number, qy: number, width = 2) => {
    rod(px, py, qx, qy, width + 1, c.dark);
    rod(px + (qx - px) * 0.45, py + (qy - py) * 0.45, qx, qy, width, c.metal);
    disc(px, py, width, c.hull); disc(qx, qy, width * 0.7, c.cream);
  };
  const gun = (tipX: number, tipY: number, length: number, width: number, hot: string, firing = false) => {
    rod(tipX + length, tipY, tipX, tipY, width, c.metal);
    plate(tipX + length * 0.35, tipY - width * 0.75, length * 0.65, width * 1.5, c.hull, 0.7);
    box(tipX - 0.3, tipY - width * 0.55, 1.5, width * 1.1, c.ink);
    if (firing) poly([[tipX, tipY - 1.5], [tipX - 5, tipY], [tipX, tipY + 1.5]], hot);
    else disc(tipX + 0.4, tipY, 0.65, hot);
  };
  const hatch = (px: number, py: number, w: number, h: number, open: boolean) => {
    plate(px, py, w, h, c.dark, 1);
    if (!open) { box(px + 1, py + 1, w - 2, h - 2, c.face); rod(px + w * 0.35, py + h / 2, px + w * 0.65, py + h / 2, 0.6, c.metal); }
    else { box(px, py - 1.5, w, 1.5, c.face); vents(px + 2, py + 2, Math.max(2, Math.floor((w - 3) / 3)), h - 4, 3); }
  };
  const damage = (px: number, py: number, amount: number, time: number) => {
    if (amount < 0.35) return;
    poly([[px, py], [px + 5, py + 1], [px + 3, py + 4], [px + 7, py + 6], [px + 1, py + 5]], c.ink);
    if (amount > 0.65) {
      poly([[px + 2, py + 3], [px + 3, py - 3 - time % 3], [px + 5, py + 1], [px + 7, py - 1], [px + 7, py + 5]], "#dca65d");
      ctx.globalAlpha = 0.3; disc(px + 4, py - 4 - time % 12, 2, "#808377"); ctx.globalAlpha = 1;
    }
  };
  return { poly, box, disc, rod, bolts, vents, plate, piston, gun, hatch, damage };
}
