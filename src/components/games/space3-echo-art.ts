/* The Echo is Nova's own silhouette, not Halo's escort. Reuse the player
   painter only here, tint its alpha mask cyan, and keep a bounded pose cache. */
import { drawPlayer } from "./space-art";
import { shipSize, type State } from "./space-logic";

const WIDTH = 96, HEIGHT = 80, SCALE = 3;
const silhouettes = new Map<string, HTMLCanvasElement>();

export function drawThirdEcho(ctx: CanvasRenderingContext2D, s: State, x: number, y: number, reduceMotion = false) {
  const frame = reduceMotion ? 0 : Math.floor(s.frame / 8) % 16 * 8;
  const key = `${s.p.level}:${s.p.gun}:${frame}:${reduceMotion}`;
  let image = silhouettes.get(key);
  if (!image) {
    image = document.createElement("canvas"); image.width = WIDTH * SCALE; image.height = HEIGHT * SCALE;
    const paint = image.getContext("2d")!; paint.scale(SCALE, SCALE);
    const size = shipSize(s.p.level);
    const visual: State = { ...s, phase: "play", frame, p: { ...s.p, x: WIDTH / 2 - size.w / 2, y: HEIGHT / 2 - size.h / 2, inv: 0, tilt: 0, swap: 0, cd: 0, ammo: 100 } };
    drawPlayer(paint, visual, reduceMotion);
    paint.globalCompositeOperation = "source-in";
    paint.fillStyle = "#67e8f9"; paint.fillRect(0, 0, WIDTH, HEIGHT);
    if (silhouettes.size >= 32) silhouettes.delete(silhouettes.keys().next().value!);
    silhouettes.set(key, image);
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(reduceMotion ? 0 : s.p.tilt * 0.35);
  ctx.drawImage(image, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT); ctx.restore();
}
