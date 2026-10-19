/* Lumen's ship and her plasma beam, drawn until the designer replaces them. Her ship is the same ship as Nova's: the
   player's own painter, recoloured to her livery (hot pink and white in place of the player's blue), with a plasma
   emitter on the nose. The beam is a long magenta glow around a white core; she smokes when she overheats. */
import { drawPlayer } from "./space-art";
import { shipScale, shipSize, type State } from "./space-logic";
import { LUMEN } from "./space3-recruit";

const SCALE = 3, WIDTH = 96, HEIGHT = 80;
const cache = new Map<string, HTMLCanvasElement>();

/* The player's ship, painted alone on a small canvas and recoloured: every blue pixel becomes pink, so the hull, plates
   and pod keep their shading and only the livery changes. */
function ship(s: State, reduceMotion: boolean) {
  const frame = reduceMotion ? 0 : Math.floor(s.frame / 8) % 16 * 8;
  const key = `${s.p.level}:${frame}`;
  let image = cache.get(key);
  if (image) return image;
  image = document.createElement("canvas");
  image.width = WIDTH * SCALE;
  image.height = HEIGHT * SCALE;
  const paint = image.getContext("2d")!;
  paint.scale(SCALE, SCALE);
  const size = shipSize(s.p.level);
  const visual: State = { ...s, phase: "play", frame, p: { ...s.p, x: WIDTH / 2 - size.w / 2, y: HEIGHT / 2 - size.h / 2, inv: 0, tilt: 0, swap: 0, cd: 0, ammo: 100, gun: "blaster" } };
  drawPlayer(paint, visual, reduceMotion);
  const pixels = paint.getImageData(0, 0, image.width, image.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
    if (pixels.data[i + 3] > 0 && b > 130 && b > r * 1.45 && b > g * 1.2) {
      pixels.data[i] = Math.min(255, Math.round(150 + b * 0.42));
      pixels.data[i + 1] = Math.round(40 + g * 0.35);
      pixels.data[i + 2] = Math.round(120 + r * 0.3);
    }
  }
  paint.putImageData(pixels, 0, 0);
  // A plasma emitter on the nose.
  paint.save();
  paint.translate(WIDTH / 2, HEIGHT / 2);
  paint.scale(shipScale(s.p.level), shipScale(s.p.level));
  paint.fillStyle = "#fdf2f8";
  paint.fillRect(10, -0.8, 5, 1.6);
  paint.fillStyle = "#f472b6";
  paint.fillRect(14, -1.2, 2, 2.4);
  paint.restore();
  if (cache.size >= 32) cache.delete(cache.keys().next().value!);
  cache.set(key, image);
  return image;
}

export function drawLumenWing(ctx: CanvasRenderingContext2D, s: State, reduceMotion = false) {
  const l = s.lumen;
  if (!l || s.phase !== "play") return;
  const x0 = l.x + LUMEN.muzzle, x1 = x0 + LUMEN.reach;
  ctx.save();
  if (l.firing) {
    const wobble = reduceMotion ? 0 : Math.sin(s.frame * 0.9) * 0.5;
    ctx.fillStyle = "rgb(244 114 182 / 0.22)";
    ctx.fillRect(x0, l.y - 4.5 - wobble, LUMEN.reach, 9 + wobble * 2);
    ctx.fillStyle = "rgb(244 114 182 / 0.75)";
    ctx.fillRect(x0, l.y - 2, LUMEN.reach, 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x0, l.y - 0.7, LUMEN.reach, 1.4);
    ctx.fillStyle = "#fdf2f8";
    ctx.beginPath();
    ctx.arc(x1, l.y, 2 + wobble, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.translate(l.x, l.y);
  ctx.rotate(reduceMotion ? 0 : s.p.tilt * 0.35);
  ctx.globalAlpha = l.hot > 0 ? 0.8 : 1;
  ctx.drawImage(ship(s, reduceMotion), -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
  ctx.restore();
  // Heat: a thin bar under her ship that goes from pink to white-hot, and smoke while she is overheated.
  const share = Math.min(1, l.heat / LUMEN.max);
  ctx.save();
  ctx.fillStyle = "rgb(7 12 28 / 0.7)";
  ctx.fillRect(l.x - 9, l.y + 10, 18, 2.4);
  ctx.fillStyle = l.hot > 0 ? "#fb7185" : share > 0.8 ? "#fff1cc" : "#f472b6";
  ctx.fillRect(l.x - 9, l.y + 10, 18 * share, 2.4);
  if (l.hot > 0 && !reduceMotion) {
    ctx.fillStyle = "rgb(148 163 184 / 0.5)";
    for (let i = 0; i < 3; i++) ctx.fillRect(l.x - 6 + i * 5 + Math.sin(s.frame / 5 + i) * 1.5, l.y - 8 - ((s.frame + i * 7) % 12), 2, 2);
  }
  ctx.restore();
}
