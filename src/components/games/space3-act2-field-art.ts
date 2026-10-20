/* Atmospheric field layers, painted after the actors and behind live shots. */
import { H, W, type State } from "./space-logic.ts";
import { ACT2, isAct2 } from "./space3-act2.ts";
import { drawOuterBossLights } from "./space3-act2-boss-art.ts";
import { drawVoidShade } from "./space3-void-art.ts";

type Ctx = CanvasRenderingContext2D;
const wrap = (n: number, span: number) => ((n % span) + span) % span;

export function drawOuterField(ctx: Ctx, s: State, reduceMotion = false) {
  if (!isAct2(s.chapter)) return;
  const f = reduceMotion ? 0 : s.frame;
  const field = ACT2[s.chapter].field;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  if (field === "magnetic") {
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 12) {
        const y = 24 + i * 36 + Math.sin(x / 48 + f / 92 + i * 1.3) * (6 + i);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ["rgb(94 234 212 / 0.2)", "rgb(163 230 53 / 0.13)", "rgb(125 211 252 / 0.17)"][i % 3];
      ctx.lineWidth = i % 2 ? 4 : 1.5; ctx.stroke();
    }
  } else if (field === "frost") {
    const fog = ctx.createLinearGradient(0, H - 55, 0, H);
    fog.addColorStop(0, "rgb(156 213 246 / 0)"); fog.addColorStop(1, "rgb(156 213 246 / 0.22)");
    ctx.fillStyle = fog; ctx.fillRect(0, H - 55, W, 55);
    for (let i = 0; i < 18; i++) {
      const x = wrap(i * 29 + f * (i % 2 ? 0.16 : -0.1), W);
      const y = H - 7 - ((i * 7) % 35);
      ctx.fillStyle = "rgb(211 242 255 / 0.35)"; ctx.fillRect(x, y, 4 + (i % 3), 0.6);
    }
    if (s.p.y > H - 76) {
      ctx.strokeStyle = "rgb(195 238 255 / 0.44)"; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(s.p.x + 3, s.p.y + 5); ctx.lineTo(s.p.x + 1, s.p.y + 9); ctx.lineTo(s.p.x + 4, s.p.y + 12);
      ctx.moveTo(s.p.x + 21, s.p.y + 8); ctx.lineTo(s.p.x + 24, s.p.y + 12); ctx.stroke();
    }
  } else if (field === "drift") {
    for (let i = 0; i < 42; i++) {
      const speed = 0.12 + (i % 5) * 0.07;
      const x = wrap(i * 47 - f * speed, W), y = (i * 53.7) % H;
      ctx.fillStyle = i % 6 === 0 ? "rgb(209 230 246 / 0.46)" : "rgb(153 183 207 / 0.2)";
      ctx.fillRect(x, y, i % 6 === 0 ? 1.5 : 0.7, i % 6 === 0 ? 1.2 : 0.6);
    }
  } else if (field === "wind") {
    ctx.strokeStyle = "rgb(230 205 255 / 0.21)"; ctx.lineWidth = 0.65;
    for (let i = 0; i < 26; i++) {
      const x = wrap(W - ((f * (1.2 + (i % 3) * 0.7) + i * 51) % (W + 36)), W + 36);
      const y = (i * 41) % H;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12 - (i % 5) * 3, y + ((i % 3) - 1) * 0.6); ctx.stroke();
    }
  } else if (field === "dark") {
    drawVoidShade(ctx,s);
    ctx.globalCompositeOperation = "source-over";
    drawOuterBossLights(ctx, s, reduceMotion);
  } else if (field === "trench") {
    const shine = ctx.createLinearGradient(0, 0, 0, H);
    shine.addColorStop(0, "rgb(202 172 110 / 0.19)"); shine.addColorStop(0.32, "rgb(202 172 110 / 0)");
    shine.addColorStop(0.68, "rgb(202 172 110 / 0)"); shine.addColorStop(1, "rgb(202 172 110 / 0.2)");
    ctx.fillStyle = shine; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) {
      const x = wrap(i * 19 - f * (0.12 + (i % 4) * 0.04), W);
      const fromTop = i % 2 === 0, y = fromTop ? (i * 11) % 36 : H - 1 - (i * 13) % 36;
      ctx.fillStyle = "rgb(210 194 151 / 0.32)"; ctx.fillRect(x, y, 0.7, fromTop ? 3 + i % 5 : 2 + i % 6);
    }
  } else if (field === "hull") {
    ctx.save(); ctx.globalAlpha = 0.14;
    for (let i = 0; i < 14; i++) {
      const x = wrap(i * 37 - f * 0.35, W), y = 36 + (i * 31) % 144;
      ctx.strokeStyle = i % 2 ? "#fb7185" : "#fbcf33"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26, y + 1); ctx.lineTo(x - 43, y - 1); ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 10; i++) {
      const x = wrap(i * 43 - f * 0.7, W), y = i % 2 ? 50 + i * 11 : H - 50 - i * 8;
      ctx.fillStyle = "rgb(255 186 107 / 0.7)"; ctx.fillRect(x, y, 1, 1);
    }
  } else {
    const gx = W * 0.82, gy = H / 2;
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 7; i++) {
      const r = 22 + i * 18 + (reduceMotion ? 0 : f % 32);
      ctx.beginPath(); ctx.ellipse(gx, gy, r * 0.72, r, -0.05, 0, Math.PI * 2);
      ctx.strokeStyle = `rgb(86 176 255 / ${0.16 - i * 0.014})`; ctx.lineWidth = i === 0 ? 1.8 : 0.65; ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    if (s.pull) {
      ctx.save(); ctx.translate(s.pull.x, s.pull.y); ctx.scale(0.72, 1);
      ctx.strokeStyle = "rgb(218 245 255 / 0.62)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(0, 0, 18 + (reduceMotion ? 0 : s.pull.t % 18), 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgb(74 163 255 / 0.36)"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}
