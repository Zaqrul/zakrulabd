/* Terrain painters. Every opaque face and its detail stay inside the land box. */
import { type State } from "./space-logic.ts";

type Ctx = CanvasRenderingContext2D;
const INK = "#171717";

function outline(ctx: Ctx, x: number, y: number, w: number, h: number, points: number[][], fill: string) {
  ctx.save(); ctx.beginPath();
  points.forEach(([px, py], i) => i ? ctx.lineTo(x + px * w, y + py * h) : ctx.moveTo(x + px * w, y + py * h));
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
}

export function drawLands(ctx: Ctx, s: State) {
  for (const land of s.lands) {
    const { x, y, w, h, kind, id } = land;
    if (w <= 0 || h <= 0) continue;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 0.4, y + 0.4, Math.max(0, w - 0.8), Math.max(0, h - 0.8)); ctx.clip();
    if (kind === "ice" && s.chapter === 22) {
      outline(ctx, x, y, w, h, [[0.01,0.25],[0.1,0.16],[0.22,0.2],[0.3,0.03],[0.44,0.15],[0.55,0.07],[0.7,0.17],[0.84,0.02],[0.99,0.2],[1,0.96],[0,0.98]], "#758ca5");
      ctx.fillStyle = "rgb(218 245 255 / 0.86)"; ctx.fillRect(x + 2, y + 1, Math.max(0, w - 4), Math.min(1.5, h * 0.12));
      ctx.strokeStyle = "#bfe9f5"; ctx.lineWidth = 0.65;
      for (let i = 0; i < 3; i++) { const px = x + w * (0.18 + i * 0.26); ctx.beginPath(); ctx.moveTo(px, y + h * 0.23); ctx.lineTo(px - 2 - ((id + i) % 4), y + h * (0.6 + (i % 2) * 0.1)); ctx.lineTo(px + 3, y + h * 0.82); ctx.stroke(); }
    } else if (kind === "ice") {
      outline(ctx, x, y, w, h, [[0.02,0.3],[0.15,0.12],[0.28,0.2],[0.42,0.02],[0.57,0.16],[0.73,0.08],[0.98,0.24],[0.9,0.61],[0.74,0.54],[0.6,0.94],[0.45,0.62],[0.28,0.98],[0.16,0.6],[0.05,0.8]], "#758ca5");
      ctx.fillStyle = "rgb(218 245 255 / 0.78)"; ctx.fillRect(x + 2, y + 1, Math.max(0, w - 4), Math.min(1.4, h * 0.12));
      ctx.strokeStyle = "#c5f0fb"; ctx.lineWidth = 0.65;
      for (let i = 0; i < 3; i++) { const px = x + w * (0.2 + i * 0.24); ctx.beginPath(); ctx.moveTo(px, y + h * 0.22); ctx.lineTo(px - 2, y + h * 0.45); ctx.lineTo(px + 2, y + h * 0.72); ctx.stroke(); }
    } else if (kind === "rock") {
      outline(ctx, x, y, w, h, [[0.05,0.34],[0.2,0.12],[0.36,0.2],[0.52,0.03],[0.72,0.18],[0.94,0.12],[0.99,0.62],[0.78,0.96],[0.5,0.88],[0.3,1],[0.08,0.76]], "#272a31");
      ctx.strokeStyle = "rgb(193 207 224 / 0.48)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(x + 2, y + h * 0.3); ctx.lineTo(x + w * 0.22, y + h * 0.12); ctx.lineTo(x + w * 0.36, y + h * 0.2); ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = "#15171b"; ctx.beginPath(); ctx.arc(x + w * (0.25 + i * 0.23), y + h * (0.5 + ((id + i) % 2) * 0.2), Math.max(0.7, Math.min(2, w * 0.04)), 0, Math.PI * 2); ctx.fill(); }
    } else if (kind === "hull" && s.chapter === 26) {
      outline(ctx, x, y, w, h, [[0.02,0.03],[0.97,0.01],[0.99,0.96],[0.04,0.99]], "#3e434a");
      ctx.strokeStyle = "#737980"; ctx.lineWidth = 0.6;
      for (let px = 0.14; px < 0.94; px += 0.2) { ctx.beginPath(); ctx.moveTo(x+w*px,y+1); ctx.lineTo(x+w*px,y+h-1); ctx.stroke(); }
      for (let py = 0.22; py < 0.88; py += 0.34) { ctx.strokeStyle="#22252a";ctx.beginPath();ctx.moveTo(x+2,y+h*py);ctx.lineTo(x+w-2,y+h*py);ctx.stroke(); }
      ctx.strokeStyle="#b39b45";ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+w*.08,y+h*.14);ctx.lineTo(x+w*.9,y+h*.14);ctx.stroke();
      ctx.strokeStyle="#1d2328";ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(x+w*.24,y+h*.5);ctx.lineTo(x+w*.43,y+h*.68);ctx.lineTo(x+w*.35,y+h*.84);ctx.stroke();
    } else if (kind === "hull") {
      outline(ctx, x, y, w, h, [[0.02,0.04],[0.97,0.02],[0.99,0.96],[0.04,0.99]], "#3e434a");
      ctx.strokeStyle = "#737980"; ctx.lineWidth = 0.6;
      for (let px = 0.18; px < 0.95; px += 0.25) { ctx.beginPath(); ctx.moveTo(x + w * px, y + 1); ctx.lineTo(x + w * px, y + h - 1); ctx.stroke(); }
      ctx.strokeStyle = "#22252a"; ctx.beginPath(); ctx.moveTo(x + 2, y + h * 0.5); ctx.lineTo(x + w - 2, y + h * 0.5); ctx.stroke();
      for (let px = 0.1; px < 0.92; px += 0.24) for (const py of [0.18,0.82]) { ctx.fillStyle = "#9ca3aa"; ctx.fillRect(x + w * px, y + h * py, 0.9, 0.9); }
      if (h > 9 && w > 26) {
        const stripes = Math.min(5, Math.floor(w / 12));
        ctx.save(); ctx.beginPath(); ctx.rect(x + w * 0.55, y + h * 0.62, w * 0.37, h * 0.2); ctx.clip();
        ctx.fillStyle = "#b58936"; ctx.fillRect(x + w * 0.55, y + h * 0.62, w * 0.37, h * 0.2);
        ctx.strokeStyle = "#262521"; ctx.lineWidth = 2;
        for (let i = 0; i < stripes; i++) { ctx.beginPath(); ctx.moveTo(x + w * 0.55 + i * 8, y + h * 0.84); ctx.lineTo(x + w * 0.55 + i * 8 + 8, y + h * 0.6); ctx.stroke(); }
        ctx.restore();
      }
      ctx.strokeStyle = "#1d2328"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x + w * 0.08, y + h * 0.3); ctx.lineTo(x + w * 0.3, y + h * 0.52); ctx.lineTo(x + w * 0.22, y + h * 0.74); ctx.stroke();
    } else {
      outline(ctx, x, y, w, h, [[0.5,0.02],[0.92,0.36],[0.74,0.98],[0.22,0.86],[0.04,0.34]], "rgb(82 181 220 / 0.38)");
      ctx.fillStyle = "rgb(208 248 255 / 0.45)"; ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + 1); ctx.lineTo(x + w * 0.5, y + h * 0.82); ctx.lineTo(x + w * 0.23, y + h * 0.84); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#a9eaff"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + 2); ctx.lineTo(x + w * 0.52, y + h - 2); ctx.stroke();
      ctx.strokeStyle = "rgb(219 247 255 / 0.56)"; ctx.beginPath(); ctx.moveTo(x + w * 0.12, y + h * 0.34); ctx.lineTo(x + w * 0.88, y + h * 0.38); ctx.stroke();
    }
    ctx.restore();
  }
}
