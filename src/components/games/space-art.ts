/* Canvas environments, hangar, ship and obstacles. Enemy actors live in
   space-actor-art.ts and share weapon geometry with the simulation. */
import { NAVY } from "./shared";
import { drawEndymionHull } from "./space-ship-art";
import { drawFormsBack, drawFormsFront } from "./space-ship-forms-art";
import { glow, lamp, rivets, seam, slab } from "./space-material";
import { drawEnvironment } from "./space-environment";
import {
  FLARE_WARN,
  GROUND_Y,
  LAUNCH_RAIL_Y,
  GUNPOD,
  H,
  CLEAR,
  LAUNCH_GO,
  PLAYER_H,
  PLAYER_W,
  W,
  hasUpgrade,
  hazardBoxes,
  launchPose,
  shipScale,
  type Hazard,
  type State,
} from "./space-logic";

type Ctx = CanvasRenderingContext2D;

export const rng = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const unit = (v: number) => Math.min(1, Math.max(0, v));
const wrap = (v: number, size: number) => ((v % size) + size) % size;

function poly(ctx: Ctx, pts: number[][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

/* The first two chapters are set on Earth, by day over land and at dusk over the
   sea, so the sky is a sky: clouds drifting, a sun, and below it ground or water
   sliding past at the speed the ground units and ships keep. */
function drawEarth(ctx: Ctx, s: State, reduceMotion = false) {
  const sea = s.chapter === 2;
  const sc = s.scroll;
  const f = reduceMotion ? 0 : s.frame;
  const vel = s.phase === "launch" ? launchPose(s.launchT).speed : 1;

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  if (sea) {
    sky.addColorStop(0, "#172554");
    sky.addColorStop(0.4, "#9a3412");
    sky.addColorStop(0.68, "#fb923c");
    sky.addColorStop(1, "#fed7aa");
  } else {
    sky.addColorStop(0, "#1d4ed8");
    sky.addColorStop(0.55, "#7dd3fc");
    sky.addColorStop(1, "#fde8b0");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const sx = sea ? W * 0.68 : 74;
  const sy = sea ? 140 : 56;
  const sr = sea ? 30 : 17;
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 3.6);
  glow.addColorStop(0, sea ? "rgb(255 220 150 / 0.7)" : "rgb(255 255 220 / 0.65)");
  glow.addColorStop(1, "rgb(255 220 150 / 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = sea ? "#fff3c4" : "#fffbe0";
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 7; i++) {
    const x = wrap(rng(i * 7) * (W + 140) - sc * (0.16 + rng(i * 3) * 0.22), W + 140) - 70;
    const y = 8 + rng(i * 11) * (sea ? 70 : 80);
    const size = 14 + rng(i * 5) * 18;
    ctx.fillStyle = sea ? "rgb(254 215 170 / 0.55)" : "rgb(255 255 255 / 0.85)";
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(x + k * size * 0.5, y + (k % 2) * 3, size * 0.7, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (vel > 3 && !reduceMotion) {
      ctx.fillStyle = "rgb(255 255 255 / 0.45)";
      ctx.fillRect(x + size * 2.2, y, vel * 5, 1.5);
    }
  }

  if (!sea) {
    /* Far mountains, nearer hills, then the ground: a strip of grass over dirt,
       with a road along it, and trees, ruins and burning wrecks going by. */
    const ridge = (base: number, off: number, a: number, b: number, c: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 6; x += 6) ctx.lineTo(x, base - (a + Math.sin((x + off) / b) * c + Math.sin((x + off) / (b * 0.4)) * (c * 0.4)));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    };
    ridge(152, sc * 0.12, 24, 41, 12, "#7b97b8");
    ridge(170, sc * 0.3, 11, 29, 8, "#5f8f55");

    ctx.fillStyle = "#556b2f";
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = "#8aa33f";
    ctx.fillRect(0, GROUND_Y, W, 3);
    ctx.fillStyle = "#3a4a22";
    ctx.fillRect(0, GROUND_Y + 11, W, H - GROUND_Y - 11);
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(0, GROUND_Y + 13, W, 7);
    ctx.fillStyle = "#e5e7eb";
    for (let i = 0; i < 12; i++) ctx.fillRect(wrap(i * 40 - sc * 1.1, W + 40) - 20, GROUND_Y + 16, 16, 1.5);

    for (let i = 0; i < 16; i++) {
      const x = wrap(rng(i * 7 + 2) * (W + 240) - sc * 1.1, W + 240) - 120;
      const kind = Math.floor(rng(i * 13) * 4);
      if (kind === 0) {
        ctx.fillStyle = "#5b3b1b";
        ctx.fillRect(x, GROUND_Y - 10, 2.4, 10);
        ctx.fillStyle = "#2f6b2f";
        ctx.beginPath();
        ctx.arc(x + 1.2, GROUND_Y - 13, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgb(255 255 255 / 0.12)";
        ctx.beginPath();
        ctx.arc(x - 1, GROUND_Y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 1) {
        ctx.fillStyle = "#8b8478";
        poly(ctx, [[x, GROUND_Y], [x, GROUND_Y - 17], [x + 4, GROUND_Y - 14], [x + 7, GROUND_Y - 18], [x + 12, GROUND_Y - 12], [x + 15, GROUND_Y - 14], [x + 15, GROUND_Y]]);
        ctx.fill();
        ctx.fillStyle = "#3f3a33";
        ctx.fillRect(x + 3, GROUND_Y - 11, 3, 4);
        ctx.fillRect(x + 9, GROUND_Y - 9, 3, 4);
      } else if (kind === 2) {
        /* A wreck, burning, with smoke climbing off it. */
        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(x, GROUND_Y - 5, 13, 5);
        ctx.fillStyle = f % 6 < 3 ? "#fb923c" : "#fde047";
        poly(ctx, [[x + 3, GROUND_Y - 5], [x + 6, GROUND_Y - 11 - (f % 3)], [x + 9, GROUND_Y - 5]]);
        ctx.fill();
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = `rgb(55 55 60 / ${0.38 - k * 0.05})`;
          ctx.beginPath();
          ctx.arc(x + 6 + Math.sin(f / 22 + k) * 3 + k * 1.6, GROUND_Y - 12 - k * 9, 3.6 + k * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "rgb(0 0 0 / 0.28)";
        ctx.beginPath();
        ctx.ellipse(x + 8, GROUND_Y + 3, 12, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6b5b3a";
        for (let k = 0; k < 4; k++) ctx.fillRect(x + k * 6, GROUND_Y - 5, 1.6, 5);
        ctx.fillRect(x, GROUND_Y - 4, 19, 1);
      }
    }
    return;
  }

  /* The sea: islands at the horizon, water darkening toward the viewer, rows of
     waves moving faster the nearer they are, and the sun laid across them. */
  const HORIZON = 142;
  ctx.fillStyle = "#4a2a1c";
  for (let i = 0; i < 3; i++) {
    const x = wrap(rng(i * 9) * (W + 160) - sc * 0.1, W + 160) - 80;
    poly(ctx, [[x, HORIZON], [x + 12, HORIZON - 10 - i * 3], [x + 26, HORIZON - 16 - i * 4], [x + 44, HORIZON - 8], [x + 60, HORIZON]]);
    ctx.fill();
  }
  const water = ctx.createLinearGradient(0, HORIZON, 0, H);
  water.addColorStop(0, "#9a3412");
  water.addColorStop(0.22, "#1e5b83");
  water.addColorStop(1, "#082f49");
  ctx.fillStyle = water;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  for (let y = HORIZON + 2; y < H; y += 3) {
    const k = y - HORIZON;
    const w = 4 + k * 0.5;
    ctx.fillStyle = `rgb(255 216 160 / ${Math.max(0, 0.55 - k / 190)})`;
    ctx.fillRect(sx + Math.sin(y / 7 + f / 12) * (2 + k * 0.08) - w / 2, y, w, 1.6);
  }
  for (let r = 0; r < 9; r++) {
    const y0 = HORIZON + 6 + r * r * 0.95 + r * 3;
    const amp = 1 + r * 0.35;
    const speed = 0.5 + r * 0.35;
    ctx.strokeStyle = `rgb(255 255 255 / ${0.05 + r * 0.018})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = y0 + Math.sin((x + sc * speed) / (14 + r * 3.5)) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const haze = ctx.createLinearGradient(0, HORIZON - 6, 0, HORIZON + 14);
  haze.addColorStop(0, "rgb(254 215 170 / 0)");
  haze.addColorStop(0.5, "rgb(254 215 170 / 0.4)");
  haze.addColorStop(1, "rgb(254 215 170 / 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, HORIZON - 6, W, 20);
}

/* The sky behind everything, a different one for each chapter. */

const SKY: Record<number, [string, string]> = {
  1: ["#0b1330", "#1f2f66"],
  2: ["#170a2b", "#4a1d6b"],
  3: ["#031826", "#0f5470"],
  4: ["#1c0602", "#8a3208"],
  5: ["#080d17", "#1f2c42"],
  6: ["#170808", "#451616"],
};

export function drawBackdrop(ctx: Ctx, s: State, reduceMotion = false) {
  if (s.chapter <= 2) {
    drawEarth(ctx, s, reduceMotion);
    return;
  }
  /* The layered environments number the six space chapters from one, and
     chapters three to eight are those six. */
  drawEnvironment(ctx, { ...s, chapter: s.chapter - 2 }, drawBackdropScene, reduceMotion);
}

function drawBackdropScene(ctx: Ctx, s: State) {
  const ch = s.chapter;
  const f = s.frame;
  const sc = s.scroll;
  const [top, bottom] = SKY[ch] ?? SKY[1];
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, top);
  bg.addColorStop(1, bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (ch === 1) {
    /* A ringed planet low in the distance, and far rocks drifting by. */
    const g = ctx.createRadialGradient(290, 150, 6, 300, 160, 62);
    g.addColorStop(0, "#5f7fd6");
    g.addColorStop(1, "#16224a");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(300, 160, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgb(190 205 255 / 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(300, 160, 88, 16, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgb(120 130 170 / 0.3)";
    for (let i = 0; i < 9; i++) {
      const x = wrap(rng(i * 5) * (W + 60) - sc * 0.22, W + 60) - 30;
      ctx.beginPath();
      ctx.arc(x, rng(i * 11 + 3) * H, 2 + rng(i * 3) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ch === 2) {
    for (let i = 0; i < 5; i++) {
      const cx = wrap(60 + i * 95 - sc * 0.14, W + 180) - 90;
      const cy = 40 + ((i * 53) % 130);
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 74);
      g.addColorStop(0, "rgb(190 100 255 / 0.24)");
      g.addColorStop(1, "rgb(190 100 255 / 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    /* Lightning in the cloud, now and then. */
    const k = Math.floor(f / 80);
    if (rng(k * 3 + 7) > 0.5 && f % 80 < 8) {
      ctx.strokeStyle = "rgb(230 200 255 / 0.85)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let x = rng(k) * W;
      ctx.moveTo(x, 0);
      for (let y = 12; y < H; y += 16) {
        x += (rng(k * 13 + y) - 0.5) * 22;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgb(200 150 255 / 0.1)";
      ctx.fillRect(0, 0, W, H);
    }
  } else if (ch === 3) {
    /* Aurora bands over a field of ice. */
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      ctx.moveTo(0, 20 + b * 16);
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, 22 + b * 16 + Math.sin((x + sc * 0.2) / 55 + b * 1.7) * 13);
      for (let x = W; x >= 0; x -= 12) ctx.lineTo(x, 44 + b * 16 + Math.sin((x + sc * 0.2) / 55 + b * 1.7) * 13);
      ctx.closePath();
      ctx.fillStyle = b === 1 ? "rgb(120 255 220 / 0.11)" : "rgb(90 200 255 / 0.09)";
      ctx.fill();
    }
    /* The rings: a slanting band of ice that slides past. */
    for (let i = 0; i < 46; i++) {
      const sp = 0.5 + rng(i * 9) * 0.7;
      const x = wrap(rng(i * 7 + 1) * (W + 40) - sc * sp, W + 40) - 20;
      const y = H * 0.78 - (x / W) * H * 0.42 + (rng(i * 13) - 0.5) * 34;
      ctx.fillStyle = `rgb(210 240 255 / ${0.25 + rng(i * 17) * 0.4})`;
      ctx.fillRect(x, y, 1.5 + rng(i * 3) * 3.5, 1 + rng(i * 5) * 2);
    }
    const mist = ctx.createLinearGradient(0, H - 50, 0, H);
    mist.addColorStop(0, "rgb(190 235 255 / 0)");
    mist.addColorStop(1, "rgb(190 235 255 / 0.18)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, H - 50, W, 50);
  } else if (ch === 4) {
    /* A sun filling the right edge, with arcs of fire rising from it. */
    const r = 128 + Math.sin(f / 22) * 4;
    const g = ctx.createRadialGradient(W + 6, H / 2 + 8, 10, W + 6, H / 2 + 8, r);
    g.addColorStop(0, "#fffbe0");
    g.addColorStop(0.28, "#ffd24d");
    g.addColorStop(0.6, "rgb(255 120 30 / 0.7)");
    g.addColorStop(1, "rgb(255 80 20 / 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgb(255 170 60 / 0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = f / 140 + i * 1.6;
      ctx.beginPath();
      ctx.arc(W + 6, H / 2 + 8, 100 + (i % 2) * 22, Math.PI * 0.6 + Math.sin(a) * 0.3, Math.PI * 0.95 + Math.sin(a) * 0.3);
      ctx.stroke();
    }
    ctx.fillStyle = "rgb(255 190 90 / 0.8)";
    for (let i = 0; i < 34; i++) {
      const x = wrap(rng(i * 5) * W - sc * (0.7 + rng(i) * 0.6), W);
      const y = wrap(rng(i * 9 + 2) * H - f * (0.25 + rng(i * 3) * 0.5), H);
      ctx.fillRect(x, y, 1.4, 1.4);
    }
  } else if (ch === 5) {
    /* A dead station: far girders and dark windows, a few still lit, and
       beacons that blink on their own time. */
    ctx.strokeStyle = "rgb(120 140 170 / 0.22)";
    ctx.lineWidth = 2;
    for (let i = -1; i < 7; i++) {
      const x = wrap(i * 70 - sc * 0.3, 70 * 7) - 70;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, 20 + (i & 1) * 60);
      ctx.lineTo(x + 70, 80 + (i & 1) * 60);
      ctx.stroke();
    }
    for (let i = 0; i < 40; i++) {
      const x = wrap(rng(i * 5) * W * 1.3 - sc * 0.45, W * 1.3) - 20;
      const y = 22 + rng(i * 7 + 3) * (H - 44);
      const lit = rng(i * 11) > 0.72 && (f / 40 + i) % 5 > 0.6;
      ctx.fillStyle = lit ? "rgb(255 210 120 / 0.7)" : "rgb(90 110 140 / 0.22)";
      ctx.fillRect(x, y, 6, 3);
    }
    for (let i = 0; i < 5; i++) {
      const x = wrap(rng(i * 13) * W * 1.2 - sc * 0.5, W * 1.2) - 10;
      ctx.fillStyle = (f + i * 17) % 60 < 8 ? "#ff4d4d" : "rgb(120 40 40 / 0.5)";
      ctx.fillRect(x, 30 + rng(i * 3) * 150, 2, 2);
    }
  } else {
    /* The fortress: a red grid, and towers with cannons on them. */
    ctx.strokeStyle = "rgb(255 90 70 / 0.08)";
    ctx.lineWidth = 1;
    const off = (sc * 1.2) % 24;
    for (let x = -off; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 12; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.fillStyle = "rgb(20 4 4 / 0.55)";
    for (let i = 0; i < 6; i++) {
      const x = wrap(i * 96 - sc * 0.4, 96 * 6) - 96;
      poly(ctx, [[x, H], [x + 14, H - 38 - (i % 3) * 14], [x + 56, H - 38 - (i % 3) * 14], [x + 70, H]]);
      ctx.fill();
      ctx.fillRect(x + 28, H - 54 - (i % 3) * 14, 5, 16);
      poly(ctx, [[x + 20, 0], [x + 34, 24 + (i % 2) * 10], [x + 70, 24 + (i % 2) * 10], [x + 84, 0]]);
      ctx.fill();
    }
    const glow = ctx.createRadialGradient(W - 40, H / 2, 10, W - 40, H / 2, 150);
    glow.addColorStop(0, "rgb(255 60 40 / 0.2)");
    glow.addColorStop(1, "rgb(255 60 40 / 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

}

/* The hangar. */

const RAIL_Y = LAUNCH_RAIL_Y;

export type LaunchLabels = { engine: string; ready: string; go: string };

/* The room behind the ship: ceiling, floor with the catapult rail, pillars and
   the open end. It slides away to the left once the ship is thrown. */
export function drawHangar(ctx: Ctx, s: State) {
  const pose=launchPose(s.launchT);
  if(pose.off>W+340)return;
  ctx.save();ctx.translate(-pose.off,0);
  ctx.fillStyle="#142033";ctx.fillRect(-30,0,344,H);
  // Recessed bays stay quieter than the ship and the moving gantry.
  for(let x=-25;x<310;x+=56){
    ctx.fillStyle="#1d2c42";ctx.fillRect(x,32,46,124);
    ctx.fillStyle="#101a2b";ctx.fillRect(x+3,39,40,105);
    ctx.strokeStyle="#2d4059";ctx.lineWidth=0.7;ctx.strokeRect(x+3,39,40,105);
    ctx.fillStyle="#3b5068";ctx.fillRect(x+7,45,13,2);
    ctx.fillStyle="#263950";ctx.fillRect(x+7,50,25,1);
  }
  ctx.fillStyle="#0b1424";poly(ctx,[[-30,0],[332,0],[312,29],[-30,29]]);ctx.fill();
  for(let x=-10;x<305;x+=48){ctx.fillStyle="#93c5d0";ctx.fillRect(x,24,28,2);ctx.fillStyle="#263950";ctx.fillRect(x-3,28,34,3);}
  // Triangular braces make depth with solid colours, without metal gradients.
  for(const x of [15,130,245]){
    ctx.fillStyle="#31445e";poly(ctx,[[x,29],[x+9,29],[x+9,RAIL_Y],[x,RAIL_Y]]);ctx.fill();
    ctx.fillStyle="#24364f";poly(ctx,[[x+9,29],[x+29,29],[x+9,54]]);ctx.fill();
    ctx.fillStyle=pose.count>0?"#fb7185":"#43516a";ctx.fillRect(x+2,35,5,3);
  }
  ctx.fillStyle="#101a2b";poly(ctx,[[-30,RAIL_Y],[312,RAIL_Y],[338,H],[-30,H]]);ctx.fill();
  ctx.fillStyle="#526780";ctx.fillRect(-30,RAIL_Y,344,3);
  ctx.fillStyle="#263950";ctx.fillRect(-30,RAIL_Y+5,350,2);
  for(let x=-30;x<312;x+=16){ctx.fillStyle="#fbcf33";poly(ctx,[[x,RAIL_Y+12],[x+7,RAIL_Y+12],[x+3,RAIL_Y+18],[x-4,RAIL_Y+18]]);ctx.fill();}
  const lit=Math.floor(unit((s.launchT-30)/110)*14);
  for(let i=0;i<14;i++){ctx.fillStyle=i<lit?"#86efac":"#334155";ctx.fillRect(7+i*21,RAIL_Y-3,4,1.5);}
  // The exit shutter opens completely before countdown begins.
  const doorOpen=easeHangar(unit((s.launchT-18)/66));
  ctx.fillStyle="#526780";ctx.fillRect(307,19,9,RAIL_Y-14);
  ctx.fillStyle="#24364f";ctx.fillRect(316,17,7,RAIL_Y-9);
  const doorHeight=(RAIL_Y-27)*(1-doorOpen);
  if(doorHeight>0){ctx.fillStyle="#3a4c64";ctx.fillRect(317,27,35,doorHeight);for(let y=30;y<27+doorHeight;y+=8){ctx.fillStyle="#22324a";ctx.fillRect(317,y,35,1);}ctx.fillStyle="#fbcf33";ctx.fillRect(317,25+doorHeight,35,2);}
  ctx.fillStyle=doorOpen>=1?"#86efac":"#fb7185";ctx.fillRect(308,20,7,3);
  // A ground crew console and equipment locker make the scale legible.
  ctx.fillStyle="#2c4059";ctx.fillRect(193,RAIL_Y-22,16,20);ctx.fillStyle="#93c5d0";ctx.fillRect(195,RAIL_Y-19,12,5);
  ctx.fillStyle="#64748b";ctx.fillRect(195,RAIL_Y-11,3,2);ctx.fillRect(200,RAIL_Y-11,3,2);
  ctx.fillStyle="#31445e";ctx.fillRect(269,RAIL_Y-28,20,26);ctx.strokeStyle="#526780";ctx.lineWidth=0.7;ctx.strokeRect(272,RAIL_Y-25,14,20);
  ctx.restore();
}
function easeHangar(t:number){return t*t*(3-2*t);}

export function drawLaunchOverlay(ctx:Ctx,s:State,labels:LaunchLabels,reduceMotion=false){
  const pose=launchPose(s.launchT),k=1+0.2*(s.p.level-1);
  const release=pose.gantry;
  ctx.save();
  if(release<1){
    // Supports attach behind the gunpod and retract below the catapult rail.
    const foot=RAIL_Y+release*10;
    for(const dx of [3,9]){
      ctx.strokeStyle="#a7b6ca";ctx.lineWidth=1.6;
      ctx.beginPath();ctx.moveTo(s.p.x+dx*k,s.p.y+8*k);ctx.lineTo(s.p.x+dx*k,foot);ctx.stroke();
    }
    ctx.fillStyle="#64748b";ctx.fillRect(s.p.x-1,foot-1,16*k,3);
    for(const [dx,side]of [[1,-1],[14,1]]){
      const anchor=s.p.x+dx*k,elbowX=anchor+side*release*22,elbowY=65-release*22,endY=s.p.y+1-(s.p.y-42)*release;
      ctx.strokeStyle="#0b1424";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(anchor,30);ctx.lineTo(elbowX,elbowY);ctx.lineTo(elbowX,endY);ctx.stroke();
      ctx.strokeStyle="#a7b6ca";ctx.lineWidth=1.8;ctx.stroke();
      ctx.fillStyle="#fbcf33";ctx.fillRect(elbowX-2,endY-1,4,2);
    }
  }
  ctx.textAlign="left";ctx.font="bold 8px ui-monospace, monospace";ctx.fillStyle="#cbd5e1";
  if(pose.off<40){const text=s.launchT>=LAUNCH_GO?labels.go:s.launchT>=84?labels.ready:s.launchT>=18?labels.engine:"";if(text)ctx.fillText(text,10,17);}
  if(pose.count!==0){
    ctx.textAlign="center";ctx.font=pose.count>0?"bold 28px sans-serif":"bold 20px sans-serif";
    ctx.fillStyle="#fbcf33";ctx.fillText(pose.count>0?String(pose.count):labels.go,W/2,65);
  }
  if(pose.flash>0&&!reduceMotion){ctx.fillStyle=`rgb(255 241 204 / ${pose.flash*0.22})`;ctx.fillRect(0,0,W,H);}
  if(pose.speed>3&&!reduceMotion){
    ctx.strokeStyle="rgb(226 232 240 / 0.25)";ctx.lineWidth=0.7;
    for(let i=0;i<8;i++){const y=rng(i*5+Math.floor(s.frame/3))*H,x=rng(i*9+s.frame)*W;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+pose.speed*2,y);ctx.stroke();}
  }
  ctx.restore();
}

/* Smoke: soft puffs that thin toward their edges, warm while they are new. */
export function drawSmoke(ctx: Ctx, s: State) {
  for (const k of s.smoke) {
    const u = k.t / k.life;
    const a = (1 - u) * (k.tone === 1 ? 0.5 : 0.36) * Math.min(1, k.t / 4);
    if (a <= 0.01) continue;
    const core = k.tone === 1 && u < 0.3 ? "255 214 168" : u < 0.5 ? "232 236 243" : "168 176 191";
    const g = ctx.createRadialGradient(k.x - k.r * 0.25, k.y - k.r * 0.25, 0, k.x, k.y, k.r);
    g.addColorStop(0, `rgb(${core} / ${a})`);
    g.addColorStop(1, `rgb(${core} / 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(k.x - k.r, k.y - k.r, k.r * 2, k.r * 2);
  }
}

/* The selected Endymion Mk III hull, with its blue/yellow fins, pale beak and
   green sensors, and under its nose a mechanical arm that holds a gunpod. The pod
   is the weapon: its shape changes with the gun it holds, it kicks back when it
   fires, and it is swapped for a new one when a crate is taken. The ship tips
   with each move, and its flames run with the throttle. */
const POD_CD: Record<string, number> = { blaster: 12, machine: 4, spread: 19, laser: 3, torpedo: 32, icebomb: 38, flame: 4, katana: 22 };

function drawPod(ctx: Ctx, s: State, k: number, reduceMotion: boolean) {
  const p = s.p;
  const f = s.frame;
  const since = Math.max(0, (POD_CD[p.gun] ?? 12) - p.cd);
  const recoil = p.cd > 0 && since < 4 ? 0.8 * (1 - since / 4) : 0;
  const slide = p.swap > 0 ? -(p.swap / 16) * 6 : 0;
  const bob = reduceMotion ? 0 : Math.sin(f / 26) * 0.07;
  const elbowX = 12.2 + (reduceMotion ? 0 : Math.sin(f / 36) * 0.18) - p.tilt * 0.3;
  const elbowY = 13 + (reduceMotion ? 0 : Math.sin(f / 32 + 0.6) * 0.22);
  const x = GUNPOD.x + slide - recoil;
  const y = GUNPOD.y + bob;
  const bodyFill: Record<string, string> = { blaster: "#506178", machine: "#45566e", spread: "#4f5b48", laser: "#28475c", torpedo: "#5b4547", icebomb: "#3d5a6c", flame: "#6b3b2e", katana: "#4a4f5c" };

  /* The arm: a shoulder under the hull, an upper arm, a joint, and the claw. */
  ctx.strokeStyle = "#0b1326";
  ctx.lineWidth = 2.3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(13.6, 9.6);
  ctx.lineTo(elbowX, elbowY);
  ctx.lineTo(x + 1.5, y + GUNPOD.h / 2);
  ctx.stroke();
  ctx.strokeStyle = "#a8b9ce";
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(13.6, 9.6);
  ctx.lineTo(elbowX, elbowY);
  ctx.stroke();

  /* The pod. */
  ctx.lineWidth = 0.8 / k + 0.25;
  ctx.strokeStyle = NAVY;
  ctx.fillStyle = p.swap > 8 ? "#ffffff" : (bodyFill[p.gun] ?? "#4b5563");
  ctx.beginPath();
  ctx.roundRect(x, y, GUNPOD.w, GUNPOD.h, 0.8);
  ctx.fill();
  ctx.stroke();
  const lowAmmo = p.gun !== "blaster" && p.ammo < 14 && f % 12 < 6;
  ctx.fillStyle = lowAmmo ? "#ef4444" : "#fbbf24";
  ctx.fillRect(x + 6.8, y + 2, 0.9, 0.7);

  const mx = x + GUNPOD.w;
  const my = y + GUNPOD.h / 2;
  switch (p.gun) {
    case "machine":
      /* A cluster of barrels, the Vulcan. */
      ctx.fillStyle = "#fdba74";
      for (const d of [-0.9, 0, 0.9]) ctx.fillRect(mx, my + d - 0.3, 3, 0.6);
      break;
    case "spread":
      /* A flared muzzle that throws a fan. */
      ctx.fillStyle = "#bef264";
      poly(ctx, [[mx, my - 0.8], [mx + 2.6, my - 2], [mx + 2.6, my + 2], [mx, my + 0.8]]);
      ctx.fill();
      ctx.stroke();
      break;
    case "laser":
      /* A long lens that glows. */
      ctx.fillStyle = "#0e7490";
      ctx.fillRect(mx, my - 0.7, 3.6, 1.4);
      ctx.fillStyle = `rgb(103 232 249 / ${0.55 + 0.3 * Math.sin(f / 4)})`;
      ctx.fillRect(mx + 0.4, my - 0.35, 3.2, 0.7);
      break;
    case "torpedo":
      /* One tube, with the warhead nose showing in the mouth. */
      ctx.fillStyle = "#475569";
      ctx.fillRect(mx - 0.4, my - 1.2, 2.4, 2.4);
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.ellipse(mx + 1.6, my, 1.6, 1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(mx + 0.4, my - 0.9, 0.7, 1.8);
      break;
    case "icebomb":
      /* A short tube with a cap of frost. */
      ctx.fillStyle = "#475569";
      ctx.fillRect(mx - 0.4, my - 1.1, 2, 2.2);
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(mx + 1.8, my, 1.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "flame":
      /* A wide nozzle with a pilot flame. */
      ctx.fillStyle = "#7c2d12";
      poly(ctx, [[mx, my - 0.7], [mx + 2.2, my - 1.6], [mx + 2.2, my + 1.6], [mx, my + 0.7]]);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = f % 6 < 3 ? "#fde047" : "#fb923c";
      ctx.fillRect(mx + 2.2, my - 0.4, 0.9, 0.8);
      break;
    case "katana":
      /* The blade slides out of the pod, a gold guard at its root. */
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(mx + 0.4, my - 0.35, 4.6, 0.7);
      ctx.fillStyle = "#fbcf33";
      ctx.fillRect(mx, my - 1, 0.7, 2);
      break;
    default:
      ctx.fillStyle = "#d1d5db";
      ctx.fillRect(mx, my - 0.45, 2.4, 0.9);
      break;
  }
  if (recoil > 0.6) {
    ctx.fillStyle = "#fff7c2";
    poly(ctx, [[mx + 2.4, my - 1.5], [mx + 5.2, my], [mx + 2.4, my + 1.5]]);
    ctx.fill();
  }
}

export function drawPlayer(ctx: Ctx, s: State, reduceMotion = false) {
  const p = s.p;
  if (s.phase === "dead") return;
  if (s.phase !== "launch" && p.inv > 0 && s.frame % 6 < 3) return;
  const k = shipScale(p.level);
  const throttle = s.phase === "launch" ? launchPose(s.launchT).throttle : 0.8 + Math.min(0.2, Math.abs(p.tilt));
  const f = s.frame;
  ctx.save();
  ctx.translate(p.x + (PLAYER_W * k) / 2, p.y + (PLAYER_H * k) / 2);
  ctx.rotate(s.phase === "launch" ? 0 : p.tilt * 0.35);
  ctx.scale(k, k);
  ctx.translate(-PLAYER_W / 2, -PLAYER_H / 2);

  /* What the upgrades add behind the hull: the launcher pods. */
  drawFormsBack(ctx, p);

  /* Blue-violet exhaust stays animated independently of the hull. */
  /* Flying away at the end of a chapter the engines open up: the flame grows as the ship picks up speed. */
  const leaving = s.phase === "clear" && s.clearFor >= CLEAR.go ? Math.min(1, (s.clearFor - CLEAR.go) / 30) : 0;
  const len = (3 + throttle * 6) * (s.phase === "launch" && s.launchT >= LAUNCH_GO ? 1.9 : 1) * (1 + leaving * 1.6) * (hasUpgrade(p, "hypersonic") ? 1.45 : 1);
  for (const fy of throttle > 0 ? [3.8, 5.4] : []) {
    ctx.fillStyle = "rgb(139 92 246 / 0.25)";
    poly(ctx, [[-2.5, fy - 1.9], [-len * 1.5 - 2.5, fy], [-2.5, fy + 1.9]]);
    ctx.fill();
    ctx.fillStyle = "#a78bfa";
    poly(ctx, [[-2.5, fy - 0.9], [-len - 2.5, fy], [-2.5, fy + 0.9]]);
    ctx.fill();
    ctx.fillStyle = "#e0f2fe";
    poly(ctx, [[-2.5, fy - 0.4], [-len * 0.6 - 2.5, fy], [-2.5, fy + 0.4]]);
    ctx.fill();
  }

  drawEndymionHull(ctx, reduceMotion ? 0 : f, p.tilt);
  drawPod(ctx, s, k, reduceMotion);
  /* And over it: the nose spike, the armour plates and the shield plate. */
  drawFormsFront(ctx, p, reduceMotion ? 0 : f, reduceMotion);
  ctx.restore();
}

/* Things in the way. */

export function drawHazard(ctx: Ctx, h: Hazard, s: State, reduceMotion = false) {
  const ch = s.chapter - 2;
  if (h.kind === "flare") {
    const col = ch === 2 ? "200 130 255" : "255 140 40";
    if (h.t < FLARE_WARN) {
      /* Marked first: two dashed edges and a pulse. */
      const a = reduceMotion ? 0.35 : 0.3 + 0.1 * Math.sin(h.t / 8);
      ctx.fillStyle = `rgb(${col} / ${a * 0.4})`;
      ctx.fillRect(h.x, 0, h.w, H);
      ctx.strokeStyle = `rgb(${col} / 0.9)`;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 4]);
      for (const x of [h.x, h.x + h.w]) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      return;
    }
    /* Burning: a column of plasma, white at its heart, with licks of fire up it. */
    const cx = h.x + h.w / 2;
    const g = ctx.createLinearGradient(h.x, 0, h.x + h.w, 0);
    g.addColorStop(0, `rgb(${col} / 0)`);
    g.addColorStop(0.2, `rgb(${col} / 0.9)`);
    g.addColorStop(0.5, "rgb(255 250 225 / 1)");
    g.addColorStop(0.8, `rgb(${col} / 0.9)`);
    g.addColorStop(1, `rgb(${col} / 0)`);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(h.x - 5, 0, h.w + 10, H);
    ctx.restore();
    ctx.fillStyle = "#fff1cc";
    ctx.fillRect(h.x + h.w * 0.34, 0, h.w * 0.32, H);
    if (!reduceMotion) {
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgb(255 255 255 / ${0.35 - i * 0.05})`;
        ctx.beginPath();
        for (let y = 0; y <= H; y += 8) {
          const x = cx + Math.sin(y / 9 + h.t / 3 + i * 1.7) * h.w * 0.32;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    glow(ctx, cx, 4, h.w * 1.4, "#ffb066", 0.5);
    glow(ctx, cx, H - 4, h.w * 1.4, "#ffb066", 0.5);
    return;
  }
  const boxes = hazardBoxes(h);
  for (const b of boxes) {
    if (h.kind === "gate") {
      /* A laser: a white core in a coloured fringe, with the glow laid over it. */
      const c = ch === 6 ? "255 70 70" : "90 220 255";
      const g = ctx.createLinearGradient(b.x - 3, 0, b.x + b.w + 3, 0);
      g.addColorStop(0, `rgb(${c} / 0)`);
      g.addColorStop(0.25, `rgb(${c} / 0.9)`);
      g.addColorStop(0.5, "rgb(255 255 255 / 1)");
      g.addColorStop(0.75, `rgb(${c} / 0.9)`);
      g.addColorStop(1, `rgb(${c} / 0)`);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = g;
      ctx.fillRect(b.x - 3, b.y, b.w + 6, b.h);
      ctx.restore();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(b.x + b.w * 0.36, b.y, b.w * 0.28, b.h);
      /* Emitter housings on the ends that face the gap. */
      const housing = (y: number) => {
        slab(ctx, b.x - 4.5, y, b.w + 9, 5, 1.2, "#566173", { light: 0.4 });
        lamp(ctx, b.x + b.w / 2, y + 2.5, 1.3, ch === 6 ? "#ff5a4d" : "#7dd3fc", true);
      };
      if (b.y > 0) housing(b.y - 1);
      if (b.y + b.h < H) housing(b.y + b.h - 4);
      continue;
    }
    /* A wall: ice in the third chapter, steel after that. */
    const ice = ch === 3;
    slab(ctx, b.x, b.y, b.w, b.h, 0.8, ice ? "#9fd6ea" : "#4a5668", { light: ice ? 0.45 : 0.28, dark: 0.42, sheen: ice ? 0.3 : 0.12 });
    if (ice) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(b.x, b.y, b.w, b.h);
      ctx.clip();
      ctx.fillStyle = "rgb(255 255 255 / 0.35)";
      for (let y = b.y - 10; y < b.y + b.h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(b.x, y);
        ctx.lineTo(b.x + b.w, y + 9);
        ctx.lineTo(b.x + b.w, y + 13);
        ctx.lineTo(b.x, y + 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else {
      for (let y = b.y + 22; y < b.y + b.h - 3; y += 26) seam(ctx, [[b.x, y], [b.x + b.w, y]], 0.5, 0.5);
      rivets(ctx, b.x + b.w - 3.2, b.y + 8, Math.max(0, Math.floor((b.h - 12) / 14)), 0, 14);
      rivets(ctx, b.x + 3.2, b.y + 8, Math.max(0, Math.floor((b.h - 12) / 14)), 0, 14);
    }
    /* Hazard stripes where the edge borders a gap. */
    const stripe = (y: number) => {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(b.x - 1, y, b.w + 2, 4);
      ctx.fillStyle = "#171717";
      for (let x = b.x - 1; x < b.x + b.w; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x + 2.4, y);
        ctx.lineTo(x + 4.4, y);
        ctx.lineTo(x + 2, y + 4);
        ctx.closePath();
        ctx.fill();
      }
    };
    if (b.y > 0) stripe(b.y);
    if (b.y + b.h < H) stripe(b.y + b.h - 4);
  }
}
