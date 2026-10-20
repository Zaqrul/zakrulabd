/* Distinct, slow-moving vistas for Space 3's outer-system chapters. */
import { H, W, type State } from "./space-logic.ts";
import { drawVoidBackdrop } from "./space3-void-art.ts";

type Ctx = CanvasRenderingContext2D;
const wrap = (n: number, span: number) => ((n % span) + span) % span;
const hash = (n: number) => { const v = Math.sin(n * 91.7 + 12.3) * 43758.5453; return v - Math.floor(v); };

function stars(ctx: Ctx, scroll: number, maxY = H) {
  for (let i = 0; i < 68; i++) {
    const depth = 1 + (i % 4) * 0.65;
    const x = wrap(hash(i + 2) * W - scroll * 0.018 * depth, W);
    const y = hash(i + 97) * maxY;
    ctx.fillStyle = i % 7 === 0 ? "rgb(228 243 255 / 0.56)" : "rgb(178 202 222 / 0.24)";
    ctx.fillRect(x, y, i % 7 === 0 ? 1 : 0.65, 0.7);
  }
}

function cloudBands(ctx: Ctx, color: string, offset: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (let i = 0; i < 7; i++) {
    const y = 20 + i * 29 + Math.sin(i * 1.8 + offset) * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(82, y - 12, 146, y + 10, 226, y - 1);
    ctx.bezierCurveTo(292, y - 8, 332, y + 5, W, y - 7);
    ctx.strokeStyle = color;
    ctx.lineWidth = 7 + (i % 3) * 3;
    ctx.stroke();
  }
  ctx.restore();
}

function aurora(ctx: Ctx, frame: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const y = 30 + i * 34 + Math.sin(x / 51 + frame / 90 + i * 1.2) * (8 + i);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = ["rgb(94 234 212 / 0.22)", "rgb(163 230 53 / 0.15)", "rgb(125 211 252 / 0.2)"][i % 3];
    ctx.lineWidth = i % 2 ? 5 : 2.4;
    ctx.stroke();
  }
  ctx.restore();
}

function station(ctx: Ctx, x: number, y: number, scale: number, dead = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = dead ? "#171b22" : "#202a33";
  ctx.fillRect(-16, -3, 32, 6);
  ctx.fillRect(-5, -9, 10, 18);
  ctx.fillStyle = "#10151b"; ctx.fillRect(-26, -5, 8, 10); ctx.fillRect(18, -5, 8, 10);
  ctx.strokeStyle = "#71808a"; ctx.lineWidth = 0.7;
  ctx.strokeRect(-16.5, -3.5, 33, 7); ctx.strokeRect(-5.5, -9.5, 11, 19);
  ctx.beginPath(); ctx.moveTo(-25, 0); ctx.lineTo(-17, 0); ctx.moveTo(17, 0); ctx.lineTo(25, 0); ctx.stroke();
  ctx.fillStyle = dead ? "#30404a" : "#8bd9e4"; ctx.fillRect(-2, -1, 4, 2);
  ctx.restore();
}

function drawUranus(ctx: Ctx, frame: number, scroll: number) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#071c21"); g.addColorStop(0.48, "#155453"); g.addColorStop(1, "#0a2431");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  stars(ctx, scroll);
  ctx.save(); ctx.globalAlpha = 0.48;
  ctx.beginPath(); ctx.ellipse(302, 127, 131, 99, -0.17, 0, Math.PI * 2); ctx.fillStyle = "#3aa9a0"; ctx.fill();
  ctx.strokeStyle = "rgb(200 255 235 / 0.22)"; ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.ellipse(302, 127 + i * 5, 126 - i * 2, 92 - i, -0.17, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  ctx.restore();
  cloudBands(ctx, "#77d5bf", frame / 100, 0.22);
  ctx.save(); ctx.translate(-scroll * 0.04, 0); ctx.rotate(-0.13);
  ctx.strokeStyle = "rgb(199 239 228 / 0.25)"; ctx.lineWidth = 1;
  for (const y of [174, 179, 185]) { ctx.beginPath(); ctx.ellipse(185, y, 245, 34, 0, Math.PI, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  aurora(ctx, frame);
  /* Remote sheet lightning stays behind actors and never marks a player lane. */
  for (let i = 0; i < 3; i++) {
    const x = 63 + i * 127 + (frame ? Math.sin(frame / 80 + i) * 5 : 0);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 4, 19); ctx.lineTo(x + 3, 27); ctx.lineTo(x - 8, 43);
    ctx.strokeStyle = "rgb(194 255 240 / 0.55)"; ctx.lineWidth = 0.8; ctx.stroke();
  }
}

function drawTriton(ctx: Ctx, frame: number) {
  ctx.fillStyle = "#050a16"; ctx.fillRect(0, 0, W, H);
  stars(ctx, 0, H - 20);
  const planet = ctx.createRadialGradient(294, 80, 10, 294, 80, 151);
  planet.addColorStop(0, "#5f9ed4"); planet.addColorStop(0.5, "#244f93"); planet.addColorStop(1, "rgb(12 20 48 / 0)");
  ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(294, 80, 151, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(294, 80, 145, 0, Math.PI * 2); ctx.clip();
  cloudBands(ctx, "#85bcea", frame / 130, 0.2); ctx.restore();
  for (let i = 0; i < 5; i++) {
    const x = 36 + i * 82;
    ctx.fillStyle = "rgb(108 170 220 / 0.12)";
    ctx.beginPath(); ctx.moveTo(x - 20, H - 24); ctx.quadraticCurveTo(x, H - 80 - (i % 2) * 16, x + 19, H - 24); ctx.fill();
    ctx.strokeStyle = "rgb(157 214 246 / 0.38)"; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(x, H - 25); ctx.lineTo(x - 3, H - 52); ctx.lineTo(x + 4, H - 71); ctx.stroke();
  }
  ctx.fillStyle = "#11151d"; ctx.fillRect(0, H - 18, W, 18);
  ctx.fillStyle = "#293644"; ctx.fillRect(0, H - 20, W, 2);
  for (let x = 5; x < W; x += 26) {
    ctx.fillStyle = "#303b48"; ctx.fillRect(x, H - 22 - ((x / 26) % 3), 18, 3);
    ctx.strokeStyle = "#657b91"; ctx.lineWidth = 0.55; ctx.beginPath(); ctx.moveTo(x + 3, H - 18); ctx.lineTo(x + 9, H - 21); ctx.stroke();
  }
}

function drawKuiper(ctx: Ctx, scroll: number) {
  ctx.fillStyle = "#03050a"; ctx.fillRect(0, 0, W, H);
  stars(ctx, scroll);
  const glow = ctx.createRadialGradient(252, 106, 4, 252, 106, 188);
  glow.addColorStop(0, "rgb(87 112 139 / 0.14)"); glow.addColorStop(1, "rgb(3 5 10 / 0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 13; i++) {
    const x = wrap(hash(i + 22) * W - scroll * (0.012 + (i % 4) * 0.009), W);
    const y = hash(i + 82) * H, r = 2 + hash(i + 46) * 7;
    ctx.fillStyle = i % 3 === 0 ? "#303a45" : "#171e28";
    ctx.beginPath(); ctx.moveTo(x-r, y); ctx.lineTo(x-r*0.3, y-r*0.7); ctx.lineTo(x+r, y-r*0.25); ctx.lineTo(x+r*0.55, y+r*0.65); ctx.lineTo(x-r*0.7, y+r*0.8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgb(172 203 225 / 0.24)"; ctx.lineWidth = 0.55; ctx.stroke();
  }
  station(ctx, wrap(325 - scroll * 0.04, W + 60) - 25, 55, 0.75, true);
  station(ctx, wrap(92 - scroll * 0.025, W + 50) - 18, 164, 0.48, true);
}

function drawHeliopause(ctx: Ctx, frame: number, scroll: number) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#080712"); g.addColorStop(0.5, "#211239"); g.addColorStop(1, "#110a20");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  stars(ctx, scroll);
  const nebula = ctx.createRadialGradient(304, 76, 6, 304, 76, 174);
  nebula.addColorStop(0, "rgb(190 107 217 / 0.34)"); nebula.addColorStop(0.45, "rgb(92 56 149 / 0.22)"); nebula.addColorStop(1, "rgb(8 7 18 / 0)");
  ctx.fillStyle = nebula; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.14;
  for (let i = 0; i < 22; i++) {
    const x = wrap(W - ((frame * 2 + i * 57) % (W + 80)), W + 80);
    const y = (i * 39) % H;
    ctx.fillStyle = i % 3 === 0 ? "#fff1c9" : "#c4b5fd";
    ctx.fillRect(x, y, 10 + (i % 4) * 5, 0.7);
  }
  ctx.restore();
  ctx.save(); ctx.translate(-scroll * 0.03, 0);
  ctx.strokeStyle = "rgb(193 152 255 / 0.2)"; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(160, 110, 190 + i*8, 28 + i*5, -0.1, -0.1, Math.PI + 0.1); ctx.stroke(); }
  ctx.restore();
}

function drawOort(ctx: Ctx, frame: number, scroll: number, reduceMotion: boolean) {
  drawVoidBackdrop(ctx,frame,scroll,reduceMotion);
}

function drawMegastructure(ctx: Ctx, scroll: number) {
  ctx.fillStyle = "#070807"; ctx.fillRect(0, 0, W, H);
  stars(ctx, scroll);
  const wall = ctx.createLinearGradient(0, 0, W, 0); wall.addColorStop(0, "#171810"); wall.addColorStop(0.45, "#27271d"); wall.addColorStop(1, "#090a09");
  ctx.fillStyle = wall;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W,0); ctx.lineTo(W,44); ctx.quadraticCurveTo(182,68,0,51); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(W,H); ctx.lineTo(W,174); ctx.quadraticCurveTo(180,151,0,168); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#5e5940"; ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const x = wrap(i * 45 - scroll * 0.12, W + 45);
    ctx.beginPath(); ctx.moveTo(x, 4); ctx.quadraticCurveTo(x - 24, 24, x - 37, 49); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, H - 4); ctx.quadraticCurveTo(x - 24, H - 24, x - 37, 168); ctx.stroke();
  }
  ctx.strokeStyle = "rgb(251 207 51 / 0.3)"; ctx.lineWidth = 2;
  for (const y of [42, 174]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = "#12140e"; ctx.fillRect(0, 75, W, 3); ctx.fillRect(0, 139, W, 3);
}

function drawAethelgard(ctx: Ctx, scroll: number) {
  ctx.fillStyle = "#100807"; ctx.fillRect(0, 0, W, H);
  stars(ctx, scroll);
  const xoff = wrap(-scroll * 0.11, 154) - 154;
  ctx.fillStyle = "#251713";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 40); ctx.lineTo(0, 67); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, 172); ctx.lineTo(0, 145); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#654133"; ctx.lineWidth = 0.8;
  for (let i = 0; i < 6; i++) {
    const x = xoff + i * 154;
    ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x + 24, 40); ctx.lineTo(x + 82, 47); ctx.lineTo(x + 94, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, H - 2); ctx.lineTo(x + 24, 172); ctx.lineTo(x + 82, 165); ctx.lineTo(x + 94, H - 8); ctx.stroke();
    ctx.fillStyle = "#33221b"; ctx.fillRect(x + 32, 25, 14, 14); ctx.fillRect(x + 32, 177, 14, 14);
    ctx.fillStyle = "#15151a"; ctx.fillRect(x + 61, 45, 20, 9); ctx.fillRect(x + 61, 162, 20, 9);
    ctx.strokeStyle = "rgb(251 113 133 / 0.35)"; ctx.beginPath(); ctx.ellipse(x + 71, 50, 18, 8, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = "rgb(251 113 133 / 0.12)"; ctx.fillRect(0, 62, W, 2); ctx.fillRect(0, 152, W, 2);
}

function drawHypergate(ctx: Ctx, frame: number, reduceMotion: boolean, stable: boolean) {
  ctx.fillStyle = "#020613"; ctx.fillRect(0, 0, W, H);
  stars(ctx, 0);
  const x = 314, y = 108;
  const halo = ctx.createRadialGradient(x, y, 22, x, y, 154);
  halo.addColorStop(0, "rgb(72 134 255 / 0.24)"); halo.addColorStop(0.55, "rgb(29 88 190 / 0.17)"); halo.addColorStop(1, "rgb(0 0 0 / 0)");
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(x, y); ctx.scale(0.7, 1.16);
  ctx.strokeStyle = "rgb(135 214 255 / 0.38)"; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 0, 78, 84, 0, -1.1, 1.1); ctx.stroke();
  ctx.strokeStyle = "#a8e8ff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 74, 80, 0, -1.05, 1.05); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#010206"; ctx.beginPath(); ctx.ellipse(327, 108, 28, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "rgb(206 246 255 / 0.52)"; ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const y0 = 23 + i * 27;
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.bezierCurveTo(118, y0 - 20, 217, 109 + (y0 - 108) * 0.18, 304, 108 + (y0 - 108) * 0.6); ctx.stroke();
  }
  ctx.restore();
  /* Fleet silhouettes beyond the gate establish what lies past the horizon. */
  ctx.save(); ctx.globalAlpha = stable ? 0.72 : 0.45;
  for (let i = 0; i < 5; i++) {
    const fy = 68 + i * 17;
    ctx.fillStyle = "#bdeeff"; ctx.beginPath(); ctx.moveTo(335, fy); ctx.lineTo(354, fy - 2); ctx.lineTo(365, fy); ctx.lineTo(354, fy + 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  const pulse = stable || reduceMotion ? 0.14 : 0.12 + Math.sin(frame / 48) * 0.025;
  ctx.fillStyle = `rgb(125 211 252 / ${pulse})`; ctx.fillRect(0, 0, W, H);
}

export function drawOuterBackdrop(ctx: Ctx, s: State, reduceMotion = false) {
  const ch = s.chapter;
  if (ch < 21 || ch > 28) return;
  const frame = reduceMotion ? 0 : s.frame;
  const scroll = reduceMotion ? 0 : s.scroll;
  ctx.save();
  if (ch === 21) drawUranus(ctx, frame, scroll);
  else if (ch === 22) drawTriton(ctx, frame);
  else if (ch === 23) drawKuiper(ctx, scroll);
  else if (ch === 24) drawHeliopause(ctx, frame, scroll);
  else if (ch === 25) drawOort(ctx, frame, scroll, reduceMotion);
  else if (ch === 26) drawMegastructure(ctx, scroll);
  else if (ch === 27) drawAethelgard(ctx, scroll);
  else drawHypergate(ctx, frame, reduceMotion, s.phase === "won");
  ctx.restore();
}
