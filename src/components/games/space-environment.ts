import { H, W, launchPose, type State } from "./space-logic";

type Ctx = CanvasRenderingContext2D;
type ScenePainter = (ctx: Ctx, state: State) => void;
type Layers = { sky: HTMLCanvasElement; middle: HTMLCanvasElement; near: HTMLCanvasElement };

// Two recently visited chapters are enough, including when retrying a chapter.
// The layers use game resolution rather than allocating full device-size textures.
const cache = new Map<number, Layers>();
const TILE = W * 2;
const noise = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const wrap = (n: number, span: number) => ((n % span) + span) % span;

function layer(width: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = H;
  return canvas;
}

function polygon(ctx: Ctx, points: number[][]) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    if (i === 0) ctx.moveTo(points[i][0], points[i][1]);
    else ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
}

function glow(ctx: Ctx, x: number, y: number, radius: number, color: string) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgb(${color} / 0.2)`);
  gradient.addColorStop(1, `rgb(${color} / 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function rocks(ctx: Ctx, chapter: number, close: boolean) {
  const icy = chapter === 3;
  const volcanic = chapter === 4;
  const count = close ? 11 : 26;
  for (let i = 0; i < count; i++) {
    const seed = i * 17 + chapter * 71;
    const x = noise(seed) * TILE;
    const r = close ? 10 + noise(seed + 1) * 22 : 2 + noise(seed + 1) * 10;
    const y = close ? (i % 2 ? H + r * 0.35 : -r * 0.35) : noise(seed + 2) * H;
    const points = Array.from({ length: 7 }, (_, k) => {
      const angle = (k / 7) * Math.PI * 2;
      const size = r * (0.65 + noise(seed + k + 3) * 0.35);
      return [x + Math.cos(angle) * size, y + Math.sin(angle) * size];
    });
    const fill = icy ? "#385a72" : volcanic ? "#4d2829" : chapter === 2 ? "#35304f" : "#28344e";
    ctx.fillStyle = fill;
    ctx.strokeStyle = icy ? "#76a2b2" : volcanic ? "#a95535" : "#52617b";
    ctx.lineWidth = close ? 0.8 : 0.4;
    polygon(ctx, points);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = icy ? "rgb(186 230 253 / 0.22)" : "rgb(148 163 184 / 0.12)";
    polygon(ctx, [points[0], points[1], points[2], [x, y]]);
    ctx.fill();
    if (icy) {
      ctx.strokeStyle = "rgb(165 243 252 / 0.3)";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.3, y - r * 0.5);
      ctx.lineTo(x + r * 0.1, y);
      ctx.lineTo(x - r * 0.2, y + r * 0.6);
      ctx.stroke();
    }
  }
}

function structure(ctx: Ctx, chapter: number, close: boolean) {
  const fortress = chapter === 6;
  const spacing = close ? 128 : 80;
  const base = fortress ? "#251b25" : "#182c3c";
  const trim = fortress ? "#634043" : "#3b5264";
  const light = fortress ? "248 113 113" : "103 232 249";
  for (let i = -1; i <= Math.ceil(TILE / spacing); i++) {
    const x = i * spacing;
    const height = 15 + noise(i + chapter * 19) * (close ? 23 : 40);
    ctx.fillStyle = base;
    polygon(ctx, [[x, H], [x + 4, H - height], [x + spacing - 20, H - height], [x + spacing, H]]);
    ctx.fill();
    polygon(ctx, [[x, 0], [x + spacing - 8, 0], [x + spacing - 20, height * 0.6], [x + 8, height * 0.6]]);
    ctx.fill();
    ctx.strokeStyle = trim;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = trim;
    ctx.fillRect(x + 14, H - height + 3, spacing - 42, 2);
    for (let k = 0; k < 4; k++) {
      const vx = x + 19 + k * 13;
      ctx.fillStyle = `rgb(${light} / ${close ? 0.65 : 0.3})`;
      ctx.fillRect(vx, H - height + 7, 5, 10 + noise(i * 3 + k) * 9);
      ctx.fillStyle = "rgb(0 0 0 / 0.35)";
      ctx.fillRect(vx - 1, H - height + 12, 7, 1);
    }
    ctx.fillStyle = "#b68e3e";
    for (let k = 0; k < 4; k++) {
      polygon(ctx, [[x + k * 7, H - 5], [x + k * 7 + 3, H - 5], [x + k * 7 + 8, H], [x + k * 7 + 5, H]]);
      ctx.fill();
    }
    if (!close) {
      // Recessed supports are deliberately dimmer than collidable gates.
      ctx.fillStyle = fortress ? "rgb(65 35 43 / 0.28)" : "rgb(51 78 95 / 0.25)";
      ctx.fillRect(x + spacing - 14, 0, 5, H);
      ctx.strokeStyle = "rgb(148 163 184 / 0.09)";
      ctx.beginPath();
      ctx.moveTo(x + 4, 0);
      ctx.lineTo(x + spacing - 10, H);
      ctx.stroke();
    } else {
      glow(ctx, x + 38, H - 14, 28, light);
      ctx.fillStyle = `rgb(${light} / 0.7)`;
      ctx.fillRect(x + 16, height * 0.6 - 2, 28, 1);
    }
  }
}

function build(state: State, paintScene: ScenePainter): Layers {
  const sky = layer(W);
  const ctx = sky.getContext("2d")!;
  paintScene(ctx, { ...state, phase: "play", frame: 0, scroll: 0 });
  const color = ["96 165 250", "192 132 252", "103 232 249", "251 146 60", "56 189 248", "248 113 113"][state.chapter - 1] ?? "96 165 250";
  glow(ctx, W * 0.75, H * 0.42, 110, color);

  // Wisps and atmospheric perspective stay behind ships, shots and obstacles.
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) {
    const y = 24 + i * 23;
    ctx.strokeStyle = `rgb(${color} / ${state.chapter === 2 ? 0.11 : 0.035})`;
    ctx.beginPath();
    ctx.moveTo(-20, y + 16);
    ctx.bezierCurveTo(90, y - 50, 220, y + 55, W + 20, y - 28);
    ctx.stroke();
  }

  const middle = layer(TILE);
  const near = layer(TILE);
  if (state.chapter >= 5) {
    structure(middle.getContext("2d")!, state.chapter, false);
    structure(near.getContext("2d")!, state.chapter, true);
  } else {
    rocks(middle.getContext("2d")!, state.chapter, false);
    rocks(near.getContext("2d")!, state.chapter, true);
  }
  return { sky, middle, near };
}

function scrollLayer(ctx: Ctx, image: HTMLCanvasElement, offset: number, alpha: number) {
  const x = -wrap(offset, image.width);
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, 0);
  ctx.drawImage(image, x + image.width, 0);
}

export function drawEnvironment(ctx: Ctx, state: State, paintScene: ScenePainter, reduceMotion: boolean) {
  let layers = cache.get(state.chapter);
  if (!layers) {
    layers = build(state, paintScene);
    cache.set(state.chapter, layers);
    if (cache.size > 2) cache.delete(cache.keys().next().value!);
  } else {
    cache.delete(state.chapter);
    cache.set(state.chapter, layers);
  }
  ctx.save();
  ctx.drawImage(layers.sky, 0, 0);
  const distance = reduceMotion ? state.scroll * 0.45 : state.scroll;
  scrollLayer(ctx, layers.middle, distance * 0.18, state.chapter >= 5 ? 0.7 : 0.38);
  scrollLayer(ctx, layers.near, distance * 0.62, 0.48);
  ctx.globalAlpha = 1;

  const launchSpeed = state.phase === "launch" ? launchPose(state.launchT).speed : 1;
  const color = state.chapter === 4 ? "253 186 116" : state.chapter === 3 ? "207 250 254" : "226 232 240";
  // Sparse moving highlights read as dust/ice/embers; live projectiles remain brighter.
  for (let depth = 0; depth < 3; depth++) {
    ctx.fillStyle = `rgb(${color} / ${0.18 + depth * 0.12})`;
    for (let i = 0; i < 20; i++) {
      const speed = 0.25 + depth * 0.5;
      const x = wrap(noise(i * 7 + depth * 101) * W - distance * speed, W);
      const y = noise(i * 11 + depth * 19) * H;
      const length = reduceMotion ? 1 : Math.max(1, Math.min(20, launchSpeed * speed * 1.6));
      ctx.fillRect(x, y, length, depth === 2 ? 1.2 : 0.7);
    }
  }
  if (state.chapter === 2 && !reduceMotion && state.frame % 220 < 5) {
    // One brief distant arc, without the old full-screen flash.
    ctx.strokeStyle = "rgb(216 180 254 / 0.3)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(310, 0);
    ctx.lineTo(300, 16);
    ctx.lineTo(315, 24);
    ctx.lineTo(306, 45);
    ctx.stroke();
  }
  // Luminous cosmic meteor streak in space chapters
  if (!reduceMotion && state.chapter >= 2) {
    const meteorCycle = (state.frame + 45) % 260;
    if (meteorCycle < 36) {
      const p = meteorCycle / 36;
      const sx = W + 40 - p * (W * 0.85);
      const sy = 12 + p * 55;
      const tailLen = 42;
      const tailX = sx + tailLen;
      const tailY = sy - tailLen * 0.28;
      const col = state.chapter === 4 ? "254 215 170" : state.chapter === 3 ? "165 243 252" : "224 242 254";
      const mGrad = ctx.createLinearGradient(sx, sy, tailX, tailY);
      mGrad.addColorStop(0, `rgb(${col} / ${0.85 * (1 - p * 0.4)})`);
      mGrad.addColorStop(0.35, `rgb(${col} / 0.35)`);
      mGrad.addColorStop(1, `rgb(${col} / 0)`);
      ctx.strokeStyle = mGrad;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      // Glowing core speck
      ctx.fillStyle = `rgb(255 255 255 / ${0.95 * (1 - p * 0.4)})`;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
  }
  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, "rgb(2 6 23 / 0.35)");
  edge.addColorStop(0.18, "rgb(2 6 23 / 0)");
  edge.addColorStop(0.82, "rgb(2 6 23 / 0)");
  edge.addColorStop(1, "rgb(2 6 23 / 0.35)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function clearEnvironmentCache() {
  cache.clear();
}
