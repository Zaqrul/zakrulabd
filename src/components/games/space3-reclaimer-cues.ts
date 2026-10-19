/* Reclaimed ordnance has a long, deliberate wind-up. Mark origins and threat
   classes, never the director's hidden mine positions or clear broadside row. */
import { H, W, shipSize, type Enemy, type State } from "./space-logic";
import { corvetTell } from "./space3-boss";
import { drawIndustrialCue } from "./space3-industrial-cues";

export function drawReclaimerCue(ctx: CanvasRenderingContext2D, e: Enemy, s: State) {
  if (e.type !== "boss20") return;
  drawIndustrialCue(ctx, e, s);
  const tell = corvetTell(e), q = tell.charge;
  if (!tell.verb || q <= 0) return;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  ctx.save(); ctx.lineWidth = 0.65;
  ctx.strokeStyle = `rgb(251 113 133 / ${0.35 + q * 0.4})`;
  const salvo = () => {
    for (let i = 0; i < 6; i++) {
      const y = e.y + e.h * (i + 0.5) / 6;
      ctx.strokeStyle = i < q * 6 ? "#fff1cc" : "rgb(251 113 133 / 0.35)";
      ctx.beginPath(); ctx.moveTo(e.x - 6, y - 1); ctx.lineTo(e.x - 3, y); ctx.lineTo(e.x - 6, y + 1); ctx.stroke();
    }
  };
  const broadside = () => {
    ctx.strokeStyle = `rgb(251 113 133 / ${0.35 + q * 0.4})`;
    for (let row = 0; row < 6; row++) {
      const y = 24 + row * 34;
      ctx.beginPath(); ctx.moveTo(e.x - 10, y); ctx.lineTo(e.x - 6, y); ctx.stroke();
    }
  };
  if (tell.verb === "salvo") {
    salvo();
    const size = shipSize(s.p.level);
    ctx.strokeStyle = "rgb(251 113 133 / 0.65)"; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(e.x, cy); ctx.lineTo(s.p.x + size.w / 2, s.p.y + size.h / 2); ctx.stroke();
  } else if (tell.verb === "minefield") {
    ctx.setLineDash([1, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, 10 + q * 80, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, cy); ctx.lineTo(W / 2, cy); ctx.stroke();
  } else if (tell.verb === "broadside") {
    broadside();
  } else if (tell.verb === "armada") {
    const vignette = ctx.createRadialGradient(W / 2, H / 2, H / 3, W / 2, H / 2, W / 2);
    vignette.addColorStop(0, "rgb(251 113 133 / 0)");
    vignette.addColorStop(1, `rgb(251 113 133 / ${q * 0.12})`);
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.arc(cx, cy, Math.hypot(e.w, e.h) / 2 + 6 + q * 14, 0, Math.PI * 2); ctx.stroke();
    salvo(); broadside();
  }
  ctx.restore();
}
