/* The skies and grounds of Space 2: eight places on Earth, each with its own weather. Like Space 1's
   Earth chapters these are drawn behind everything, so rain, snow, sand and fog never cross a
   bullet or an obstacle, and a hostile shot keeps its dark rim and pale centre against all of them.
   Ground units stand on GROUND_Y and ships float with their keel at WATER_Y, so the nearest layer
   slides past at the speed they do. Each place is built in layers, far to near: sky, a far
   skyline, a middle layer with its own landmarks, then the ground or the swell in front. */
import { GROUND_Y, H, W, WATER_Y, launchPose, type State } from "./space-logic";

type Ctx = CanvasRenderingContext2D;

const noise = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const wrap = (v: number, size: number) => ((v % size) + size) % size;
/* The near layer slides with the ground units. */
const NEAR = 1.1;

function poly(ctx: Ctx, pts: number[][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function fillPoly(ctx: Ctx, pts: number[][], fill: string) {
  poly(ctx, pts);
  ctx.fillStyle = fill;
  ctx.fill();
}

function sky(ctx: Ctx, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function disc(ctx: Ctx, x: number, y: number, r: number, inner: string, outer: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.4);
  g.addColorStop(0, outer);
  g.addColorStop(1, "rgb(255 255 255 / 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* A soft band of haze across the picture, to push what is behind it further away. */
function haze(ctx: Ctx, y: number, height: number, colour: string) {
  const g = ctx.createLinearGradient(0, y - height, 0, y + height);
  g.addColorStop(0, colour.replace("A", "0"));
  g.addColorStop(0.5, colour.replace("A", "1"));
  g.addColorStop(1, colour.replace("A", "0"));
  ctx.fillStyle = g;
  ctx.fillRect(0, y - height, W, height * 2);
}

/* A rolling ridge line that slides at its own speed. */
function ridge(ctx: Ctx, base: number, scroll: number, rise: number, period: number, amp: number, fill: string, sharp = 0.4) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W + 6; x += 6) {
    const u = x + scroll;
    ctx.lineTo(x, base - (rise + Math.sin(u / period) * amp + Math.sin(u / (period * 0.4)) * amp * sharp + Math.abs(Math.sin(u / (period * 2.3))) * amp * 0.6));
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
}

/* Mountains with a lit face and a shaded face, a snow cap if asked, and the shaded colour filling
   the ground under them. */
function peaks(ctx: Ctx, base: number, scroll: number, spacing: number, h0: number, h1: number, lit: string, shade: string, snow = "", seed = 0) {
  const n = Math.ceil(W / spacing) + 6;
  const span = n * spacing;
  ctx.fillStyle = shade;
  ctx.fillRect(0, base - 0.5, W, H - base + 0.5);
  for (let i = 0; i < n; i++) {
    const r = noise(i * 13 + seed);
    const wd = spacing * (1.5 + r * 0.9);
    const x = wrap(i * spacing - scroll, span) - spacing * 3;
    if (x > W || x + wd < 0) continue;
    const h = h0 + (h1 - h0) * noise(i * 7 + seed + 1);
    const ax = x + wd * (0.38 + r * 0.22);
    const ay = base - h;
    const foot = ax + (x + wd - ax) * 0.3;
    fillPoly(ctx, [[x, base], [ax, ay], [foot, base]], lit);
    fillPoly(ctx, [[ax, ay], [x + wd, base], [foot, base]], shade);
    if (snow) {
      const k = 0.34;
      const lx = ax - (ax - x) * k;
      const rx = ax + (x + wd - ax) * k * 0.85;
      const cut = ax + (foot - ax) * k * 0.9;
      fillPoly(ctx, [[ax, ay], [lx, ay + h * k], [lx + (ax - lx) * 0.45, ay + h * k * 0.72], [ax - 1, ay + h * k * 0.95], [cut, ay + h * k * 0.8], [rx, ay + h * k * 0.85]], snow);
      ctx.globalAlpha = 0.3;
      fillPoly(ctx, [[ax, ay], [cut, ay + h * k * 0.8], [rx, ay + h * k * 0.85]], shade);
      ctx.globalAlpha = 1;
    }
  }
}

/* A line of land whose rising slopes take the light and whose falling slopes are in shade:
   dunes, hills, swells of snow. */
function faceted(ctx: Ctx, base: number, scroll: number, shape: (u: number) => number, lit: string, shade: string, step = 6) {
  let y0 = base - shape(scroll);
  for (let x = 0; x <= W; x += step) {
    const y1 = base - shape(x + step + scroll);
    ctx.fillStyle = y1 > y0 ? shade : lit;
    ctx.beginPath();
    ctx.moveTo(x - 0.4, y0);
    ctx.lineTo(x + step + 0.4, y1);
    ctx.lineTo(x + step + 0.4, H);
    ctx.lineTo(x - 0.4, H);
    ctx.closePath();
    ctx.fill();
    y0 = y1;
  }
}

function clouds(ctx: Ctx, scroll: number, count: number, y0: number, spread: number, colour: string, speed = 0.2, under = "") {
  for (let i = 0; i < count; i++) {
    const x = wrap(noise(i * 7) * (W + 160) - scroll * (speed + noise(i * 3) * 0.2), W + 160) - 80;
    const y = y0 + noise(i * 11) * spread;
    const size = 16 + noise(i * 5) * 22;
    /* A darker belly under each cloud gives it some body. */
    if (under) {
      ctx.fillStyle = under;
      ctx.beginPath();
      ctx.ellipse(x + size * 0.75, y + size * 0.26, size * 1.25, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = colour;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(x + k * size * 0.5, y + (k % 2) * 3, size * 0.7, size * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* Streaks that fall or fly, drawn behind the play: rain, snow and sand. */
function streaks(ctx: Ctx, f: number, count: number, dx: number, dy: number, len: number, colour: string, width = 0.7, seed = 0) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const x = wrap(noise(i * 5 + seed) * (W + 60) + f * dx, W + 60) - 30;
    const y = wrap(noise(i * 9 + 2 + seed) * (H + 40) + f * dy, H + 40) - 20;
    ctx.moveTo(x, y);
    ctx.lineTo(x - dx * len, y - dy * len);
  }
  ctx.stroke();
}

function sea(ctx: Ctx, horizon: number, sc: number, deep: string, near: string, foam: string, chop = 1) {
  const water = ctx.createLinearGradient(0, horizon, 0, H);
  water.addColorStop(0, deep);
  water.addColorStop(1, near);
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, W, H - horizon);
  /* A bright line where the sea meets the sky. */
  ctx.fillStyle = foam.replace("A", "0.35");
  ctx.fillRect(0, horizon, W, 1);
  for (let r = 0; r < 9; r++) {
    const y0 = horizon + 6 + r * r * 0.95 + r * 3;
    const amp = (1 + r * 0.35) * chop;
    const speed = 0.5 + r * 0.35;
    ctx.strokeStyle = foam.replace("A", String(0.06 + r * 0.02));
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = y0 + Math.sin((x + sc * speed) / (14 + r * 3.5)) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/* The sun or moon's road across the water: short bright dashes that shimmer and widen toward us. */
function glitter(ctx: Ctx, x: number, top: number, f: number, colour: string) {
  ctx.fillStyle = colour;
  for (let i = 0; i < 16; i++) {
    const y = top + 2 + i * i * 0.3 + i * 1.8;
    if (y > H) break;
    const w = 3 + i * 1.5 + Math.sin(f / 9 + i * 1.7) * 2;
    ctx.fillRect(x - w / 2 + Math.sin(f / 13 + i * 2.3) * (1 + i * 0.35), y, w, 1);
  }
}

/* The swell in front, at the ships' waterline: a moving body of water with a lit edge and foam on the
   crests, sliding with the ships. */
function swell(ctx: Ctx, sc: number, body: string, edge: string, foam: string, amp = 2) {
  const at = (x: number) => WATER_Y + 4 + Math.sin((x + sc * NEAR) / 19) * amp + Math.sin((x + sc * NEAR) / 7.5) * amp * 0.3;
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) ctx.lineTo(x, at(x));
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    if (x) ctx.lineTo(x, at(x));
    else ctx.moveTo(x, at(x));
  }
  ctx.stroke();
  ctx.fillStyle = foam;
  for (let x = 0; x <= W; x += 3) {
    if (Math.sin((x + sc * NEAR) / 19) < -0.82) ctx.fillRect(x, at(x) - 0.6, 3, 1.6);
  }
  /* Streaks of foam lying on the swell. */
  for (let i = 0; i < 14; i++) {
    const x = wrap(noise(i * 17) * (W + 40) - sc * NEAR, W + 40) - 20;
    ctx.fillRect(x, WATER_Y + 10 + noise(i * 5) * (H - WATER_Y - 12), 4 + noise(i * 3) * 8, 1);
  }
}

/* The ground the units stand on: a lit lip, a body that darkens with depth, layers in the soil and
   grit, all sliding with the units. The top stays flat at GROUND_Y. */
function ground(ctx: Ctx, sc: number, lip: string, body: string, deep: string, line: string, speck: string, seed = 0) {
  const g = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  g.addColorStop(0, body);
  g.addColorStop(1, deep);
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = lip;
  ctx.fillRect(0, GROUND_Y, W, 2);
  ctx.fillStyle = line;
  ctx.fillRect(0, GROUND_Y + 2, W, 1);
  const u = sc * NEAR;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (const [y, p] of [[GROUND_Y + 10, 31], [GROUND_Y + 19, 23]]) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const yy = y + Math.sin((x + u) / p + seed) * 1.6;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = speck;
  for (let i = 0; i < 46; i++) {
    const x = wrap(noise(i * 7 + seed) * (W + 20) - u, W + 20) - 10;
    const y = GROUND_Y + 4 + noise(i * 13 + seed) * (H - GROUND_Y - 5);
    ctx.fillRect(x, y, 1 + noise(i * 3) * 2, 1);
  }
}

/* A small stone sitting on a line, lit from the upper left. */
function rock(ctx: Ctx, x: number, base: number, size: number, lit: string, shade: string) {
  fillPoly(ctx, [[x, base], [x + size * 0.2, base - size * 0.7], [x + size * 0.55, base - size], [x + size, base - size * 0.45], [x + size * 1.15, base]], shade);
  fillPoly(ctx, [[x, base], [x + size * 0.2, base - size * 0.7], [x + size * 0.55, base - size], [x + size * 0.55, base]], lit);
}

/* A pine of three tiers, with snow on each tier if asked. */
function pine(ctx: Ctx, x: number, base: number, h: number, fill: string, snow = "") {
  ctx.fillStyle = fill;
  ctx.fillRect(x - 0.7, base - h * 0.18, 1.4, h * 0.18);
  for (let t = 0; t < 3; t++) {
    const yb = base - h * 0.14 - t * h * 0.26;
    const yt = yb - h * 0.44;
    const hw = h * (0.3 - t * 0.07);
    fillPoly(ctx, [[x - hw, yb], [x, yt], [x + hw, yb]], fill);
    if (snow) fillPoly(ctx, [[x - hw * 0.45, yt + h * 0.2], [x, yt], [x + hw * 0.45, yt + h * 0.2], [x, yt + h * 0.14]], snow);
  }
}

/* A palm: a curved trunk and a crown of drooping fronds that sway in the wind. */
function palm(ctx: Ctx, x: number, base: number, h: number, lean: number, sway: number, fill: string) {
  const tx = x + lean;
  const ty = base - h;
  ctx.strokeStyle = fill;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.quadraticCurveTo(x + lean * 0.2, base - h * 0.6, tx, ty);
  ctx.stroke();
  ctx.lineWidth = 1.3;
  for (let k = 0; k < 6; k++) {
    const a = -Math.PI + (k / 5) * Math.PI + sway;
    const len = h * 0.42;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.6 - 3, tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.3 + 4);
    ctx.stroke();
  }
}

/* A warship's silhouette on the horizon. */
function hull(ctx: Ctx, x: number, y: number, size: number, fill: string, carrier: boolean) {
  fillPoly(ctx, [[x, y - size * 0.3], [x + size * 4, y - size * 0.3], [x + size * 3.7, y], [x + size * 0.3, y]], fill);
  ctx.fillStyle = fill;
  if (carrier) ctx.fillRect(x + size * 2.6, y - size * 1.1, size * 0.5, size * 0.8);
  else {
    ctx.fillRect(x + size * 1.4, y - size * 0.9, size * 0.9, size * 0.6);
    ctx.fillRect(x + size * 1.8, y - size * 1.5, size * 0.15, size * 0.6);
  }
}

/* Smoke rising from a fire, leaning with the wind. */
function smoke(ctx: Ctx, x: number, y: number, f: number, colour: string, size = 1) {
  for (let i = 0; i < 9; i++) {
    const t = (f * 0.4 + i * 9) % 81;
    const k = t / 81;
    ctx.fillStyle = colour.replace("A", String(0.4 * (1 - k)));
    ctx.beginPath();
    ctx.arc(x + k * 26 * size, y - k * 44 * size, (2 + k * 9) * size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* One of Space 2's eight places, by the engine's chapter number (9 to 16). */
export function drawSecondEarth(ctx: Ctx, s: State, reduceMotion = false) {
  const place = s.chapter - 8;
  const f = reduceMotion ? 0 : s.frame;
  const sc = s.scroll;
  const vel = s.phase === "launch" ? launchPose(s.launchT).speed : 1;

  switch (place) {
    case 1: {
      /* Re-entry over the Pacific: the heat of the fall still glows at the left, the burning wreckage
         of the fight above falls through a sunset, and Earth Force's fleet sits on the horizon. */
      sky(ctx, [[0, "#1e1b4b"], [0.45, "#9d3b4a"], [0.7, "#f59e5b"], [1, "#fde2b0"]]);
      ctx.fillStyle = "rgb(255 240 220 / 0.6)";
      for (let i = 0; i < 24; i++) ctx.fillRect(noise(i * 7) * W, noise(i * 3) * 50, 1, 1);
      disc(ctx, W * 0.66, 138, 20, "#fff3c4", "rgb(255 190 120 / 0.55)");
      clouds(ctx, sc, 7, 14, 70, "rgb(45 30 70 / 0.7)", 0.14, "rgb(255 150 100 / 0.18)");
      /* Wreckage falling, each piece with a glowing head and a long tail. */
      for (let i = 0; i < 4; i++) {
        const t = wrap(f * 0.9 + i * 70, 280);
        const x = noise(i * 9) * W * 0.8 + t * 0.55;
        const y = -20 + t * 0.55;
        if (y > 138) continue;
        const g = ctx.createLinearGradient(x - 26, y - 26, x, y);
        g.addColorStop(0, "rgb(255 160 80 / 0)");
        g.addColorStop(1, "rgb(255 210 150 / 0.75)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x - 26, y - 26);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#fff4d6";
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
      const heat = ctx.createRadialGradient(-10, H / 2, 6, -10, H / 2, 130 + Math.sin(f / 9) * 4);
      heat.addColorStop(0, "rgb(255 140 60 / 0.42)");
      heat.addColorStop(1, "rgb(255 90 30 / 0)");
      ctx.fillStyle = heat;
      ctx.fillRect(0, 0, W, H);
      /* The fleet on the horizon, one ship burning. */
      for (let i = 0; i < 4; i++) {
        const x = wrap(i * 130 + 40 - sc * 0.08, 520) - 60;
        hull(ctx, x, 142, 4 + (i % 2), "#3b1d2e", i % 2 === 0);
        if (i === 1) smoke(ctx, x + 10, 136, f, "rgb(40 24 36 / A)");
      }
      sea(ctx, 142, sc, "#7c2d12", "#082f49", "rgb(255 220 190 / A)", 1.3);
      glitter(ctx, W * 0.66, 143, f, "rgb(255 236 190 / 0.75)");
      ctx.fillStyle = "rgb(255 255 255 / 0.5)";
      for (let i = 0; i < 26; i++) {
        const x = wrap(noise(i * 7) * (W + 80) - sc * (0.7 + noise(i) * 0.9), W + 80) - 40;
        ctx.fillRect(x, 150 + noise(i * 3) * 30, 5 + noise(i * 11) * 6, 1.2);
      }
      swell(ctx, sc, "#0a2c45", "rgb(255 190 140 / 0.55)", "rgb(255 240 225 / 0.7)", 2.2);
      return;
    }
    case 2: {
      /* The archipelago in the monsoon: a grey-green sky, far islands in the haze, jungle islands
         with palms and a stilt village, and rain from the left that rings the water. */
      sky(ctx, [[0, "#1f3a3d"], [0.5, "#4d6b66"], [1, "#9db3a8"]]);
      clouds(ctx, sc, 8, 6, 60, "rgb(30 50 52 / 0.7)", 0.16, "rgb(15 30 32 / 0.35)");
      /* Lightning only lights the clouds from behind. */
      if (!reduceMotion && noise(Math.floor(f / 120) * 5) > 0.6 && f % 120 < 6) {
        ctx.fillStyle = "rgb(220 240 240 / 0.14)";
        ctx.fillRect(0, 0, W, 120);
      }
      for (let i = 0; i < 5; i++) {
        const x = wrap(noise(i * 4 + 2) * (W + 240) - sc * 0.06, W + 240) - 120;
        fillPoly(ctx, [[x, 146], [x + 20, 136], [x + 44, 130 - (i % 3) * 3], [x + 74, 138], [x + 100, 146]], "#6f8c84");
      }
      haze(ctx, 142, 10, "rgb(157 179 168 / A)");
      for (let i = 0; i < 4; i++) {
        const x = wrap(noise(i * 9) * (W + 200) - sc * (0.14 + i * 0.04), W + 200) - 100;
        const top = 116 - i * 4;
        fillPoly(ctx, [[x, 146], [x + 14, 128 - i * 3], [x + 38, top], [x + 70, 130], [x + 96, 146]], "#1a3a2f");
        fillPoly(ctx, [[x, 146], [x + 14, 128 - i * 3], [x + 38, top], [x + 46, 146]], "#2b5240");
        /* A lit strip of beach at the waterline. */
        ctx.fillStyle = "#b9b48d";
        ctx.fillRect(x + 4, 144, 88, 2);
        for (let k = 0; k < 5; k++) palm(ctx, x + 14 + k * 15, 132 - i * 3 - (k === 2 ? 10 : (k % 2) * 5), 13 + (k % 2) * 3, 3, Math.sin(f / 30 + k) * 0.12, k % 2 ? "#163225" : "#22402f");
        if (i % 2 === 0) {
          /* A stilt hut at the water's edge. */
          const hx = x + 78;
          ctx.fillStyle = "#3a2c1f";
          for (let p = 0; p < 3; p++) ctx.fillRect(hx + p * 5, 141, 1, 7);
          ctx.fillRect(hx - 2, 139, 15, 2);
          fillPoly(ctx, [[hx - 3, 139], [hx + 5.5, 132], [hx + 14, 139]], "#7a6240");
          ctx.fillStyle = "#fcd34d";
          ctx.fillRect(hx + 4, 136, 2, 2);
        }
      }
      sea(ctx, 146, sc, "#3e5c58", "#0f2a2e", "rgb(214 232 226 / A)", 1.1);
      ctx.strokeStyle = "rgb(214 232 226 / 0.3)";
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 16; i++) {
        const k = wrap(f + i * 13, 40) / 40;
        const x = wrap(noise(i * 11) * (W + 30) - sc * 0.8, W + 30) - 15;
        const y = 152 + noise(i * 7) * 24;
        ctx.globalAlpha = 1 - k;
        ctx.beginPath();
        ctx.ellipse(x, y, 1 + k * 6, 0.4 + k * 1.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      swell(ctx, sc, "#123033", "rgb(190 220 210 / 0.45)", "rgb(230 245 240 / 0.6)", 1.8);
      streaks(ctx, f, 70, 1.6, 4.2, 3.2, "rgb(205 225 230 / 0.35)", 0.7);
      streaks(ctx, f * 1.4, 40, 2.2, 5.6, 3.6, "rgb(230 240 245 / 0.28)", 0.8, 500);
      return;
    }
    case 3: {
      /* The Himalayas in a blizzard: high peaks with snow caps and shaded faces, a ridge of pines,
         prayer flags on the pass, and the wind taking the snow sideways. */
      sky(ctx, [[0, "#6b87a8"], [0.55, "#bcd0e2"], [1, "#eef4fa"]]);
      peaks(ctx, 150, sc * 0.06, 70, 60, 96, "#b7c9dc", "#8299b4", "#f4f8fc", 3);
      haze(ctx, 140, 18, "rgb(214 226 239 / A)");
      peaks(ctx, 166, sc * 0.18, 46, 30, 54, "#dbe6f1", "#9fb3ca", "#ffffff", 11);
      /* Spindrift blown off the high tops. */
      streaks(ctx, f, 30, 3.4, 0.3, 4, "rgb(255 255 255 / 0.35)", 1.2, 90);
      clouds(ctx, sc, 5, 24, 60, "rgb(240 246 252 / 0.5)", 0.28);
      faceted(ctx, 180, sc * 0.45, (u) => 6 + Math.sin(u / 40) * 5 + Math.abs(Math.sin(u / 17)) * 3, "#e9f0f7", "#b8c9db");
      for (let i = 0; i < 14; i++) {
        const x = wrap(noise(i * 7 + 4) * (W + 120) - sc * 0.45, W + 120) - 60;
        pine(ctx, x, 180 - noise(i * 3) * 4, 12 + noise(i * 5) * 8, "#4b5f78", "#f4f8fc");
      }
      ground(ctx, sc, "#ffffff", "#e3ebf4", "#8fa4bd", "rgb(143 164 189 / 0.6)", "rgb(120 140 165 / 0.5)", 3);
      /* Prayer flags strung between poles along the pass. */
      for (let i = 0; i < 3; i++) {
        const x = wrap(i * 150 - sc * NEAR, 450) - 60;
        ctx.fillStyle = "#475569";
        ctx.fillRect(x, GROUND_Y - 26, 1.2, 26);
        ctx.fillRect(x + 60, GROUND_Y - 20, 1.2, 20);
        const colours = ["#3b82f6", "#f8fafc", "#ef4444", "#22c55e", "#facc15"];
        for (let k = 0; k < 10; k++) {
          const t = (k + 0.5) / 10;
          const fx = x + t * 60;
          const fy = GROUND_Y - 26 + t * 6 + Math.sin(t * Math.PI) * 6;
          ctx.fillStyle = colours[k % 5];
          ctx.fillRect(fx, fy + Math.sin(f / 6 + k) * 0.6, 4, 4);
        }
      }
      for (let i = 0; i < 8; i++) rock(ctx, wrap(noise(i * 7 + 9) * (W + 60) - sc * NEAR, W + 60) - 30, GROUND_Y + 1, 5 + noise(i) * 5, "#7a8ea8", "#55677f");
      streaks(ctx, f, 90, 5.2, 1.4, 2.6, "rgb(255 255 255 / 0.55)", 0.9);
      break;
    }
    case 4: {
      /* The Sahara in a sandstorm: the sun a dim coin behind the haze, mesas far off, dunes with a lit
         face and a lee face, a half-buried ruin, and sand on the wind. */
      sky(ctx, [[0, "#7a4a1f"], [0.5, "#c88a3f"], [1, "#efc77d"]]);
      disc(ctx, 84, 62, 15, "#fde9b0", "rgb(255 220 150 / 0.4)");
      for (let i = 0; i < 4; i++) {
        const x = wrap(i * 140 + 30 - sc * 0.05, 560) - 80;
        const w = 50 + (i % 2) * 30;
        const h = 22 + (i % 3) * 8;
        fillPoly(ctx, [[x, 152], [x + 8, 152 - h], [x + w - 8, 152 - h], [x + w, 152]], "#a8713a");
        fillPoly(ctx, [[x + w * 0.6, 152 - h], [x + w - 8, 152 - h], [x + w, 152], [x + w * 0.6, 152]], "#8d5c2c");
        ctx.fillStyle = "#c58a4d";
        ctx.fillRect(x + 8, 152 - h, w - 16, 1.5);
      }
      haze(ctx, 150, 14, "rgb(230 180 110 / A)");
      faceted(ctx, 162, sc * 0.14, (u) => 10 + Math.sin(u / 70) * 6 + Math.sin(u / 26 + Math.sin(u / 26) * 0.9) * 5, "#d89a52", "#a8692d", 3);
      /* A ruin half in the sand: broken columns and a lintel. */
      const rx = wrap(260 - sc * 0.3, W + 200) - 100;
      for (let k = 0; k < 4; k++) {
        const h = [26, 18, 30, 10][k];
        ctx.fillStyle = "#c9a06a";
        ctx.fillRect(rx + k * 14, 172 - h, 7, h);
        ctx.fillStyle = "#9b7444";
        ctx.fillRect(rx + k * 14 + 5, 172 - h, 2, h);
      }
      ctx.fillStyle = "#c9a06a";
      ctx.fillRect(rx + 26, 140, 26, 4);
      faceted(ctx, 176, sc * 0.32, (u) => 6 + Math.sin(u / 50) * 4 + Math.sin(u / 19 + Math.sin(u / 19) * 0.9) * 3.5, "#e2ad66", "#b57735", 3);
      ground(ctx, sc, "#f1c47e", "#cf9450", "#8a5a26", "rgb(138 90 38 / 0.5)", "rgb(110 70 30 / 0.45)", 7);
      ctx.strokeStyle = "rgb(120 74 30 / 0.5)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const x = wrap(i * 52 - sc * NEAR, W + 52) - 26;
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y + 6);
        ctx.quadraticCurveTo(x + 14, GROUND_Y + 3, x + 30, GROUND_Y + 7);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const x = wrap(noise(i * 9 + 1) * (W + 60) - sc * NEAR, W + 60) - 30;
        if (i % 2) rock(ctx, x, GROUND_Y + 1, 5 + noise(i) * 4, "#b98a52", "#8a5f31");
        else {
          /* A dry shrub. */
          ctx.strokeStyle = "#6b4a24";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          for (let k = -2; k <= 2; k++) {
            ctx.moveTo(x, GROUND_Y);
            ctx.lineTo(x + k * 2.4, GROUND_Y - 5 + Math.abs(k));
          }
          ctx.stroke();
        }
      }
      streaks(ctx, f, 110, 6.4, 0.8, 3.4, "rgb(240 210 150 / 0.45)", 0.9);
      ctx.fillStyle = "rgb(215 165 95 / 0.2)";
      ctx.fillRect(0, 0, W, H);
      break;
    }
    case 5: {
      /* The alpine corridor at dusk: dark peaks with the last light on their snow, a village with lit
         windows, layered pines, pylons with their wires, fog in bands, and the railway on the floor. */
      sky(ctx, [[0, "#2b1d4a"], [0.5, "#8a4a6b"], [0.8, "#f08a5d"], [1, "#fbc387"]]);
      ctx.fillStyle = "rgb(255 240 230 / 0.7)";
      for (let i = 0; i < 20; i++) ctx.fillRect(noise(i * 5) * W, noise(i * 9) * 40, 1, 1);
      peaks(ctx, 150, sc * 0.06, 64, 56, 90, "#5a4570", "#33284a", "#f6c3b0", 5);
      haze(ctx, 146, 12, "rgb(240 138 93 / A)");
      peaks(ctx, 164, sc * 0.16, 44, 26, 46, "#3a2d52", "#251d38", "#d9a7b5", 21);
      /* The village on the slope: roofs and lit windows. */
      for (let i = 0; i < 6; i++) {
        const x = wrap(i * 46 + noise(i) * 20 - sc * 0.3, 46 * 9) - 40;
        const y = 166 - (i % 3) * 3;
        ctx.fillStyle = "#2a2140";
        ctx.fillRect(x, y - 7, 11, 7);
        fillPoly(ctx, [[x - 1.5, y - 7], [x + 5.5, y - 12], [x + 12.5, y - 7]], "#40305c");
        ctx.fillStyle = noise(i * 3 + Math.floor(f / 200)) > 0.2 ? "#fcd27a" : "#5b4a3a";
        ctx.fillRect(x + 2, y - 5, 2, 2);
        ctx.fillRect(x + 7, y - 5, 2, 2);
      }
      for (let i = 0; i < 16; i++) {
        const x = wrap(noise(i * 7 + 1) * (W + 120) - sc * 0.45, W + 120) - 60;
        pine(ctx, x, 174, 14 + (i % 3) * 4, "#1f1833");
      }
      for (let i = 0; i < 12; i++) {
        const x = wrap(noise(i * 5 + 8) * (W + 120) - sc * 0.75, W + 120) - 60;
        pine(ctx, x, 186, 18 + (i % 3) * 5, "#140f24");
      }
      /* Pylons and the sagging wires between them. */
      const span = 120;
      ctx.strokeStyle = "rgb(20 15 36 / 0.85)";
      ctx.lineWidth = 0.7;
      for (let i = 0; i < 5; i++) {
        const x = wrap(i * span - sc * 0.85, span * 5) - span;
        fillPoly(ctx, [[x - 4, 186], [x - 0.6, 142], [x + 0.6, 142], [x + 4, 186]], "#140f24");
        ctx.fillStyle = "#140f24";
        ctx.fillRect(x - 6, 146, 12, 1.2);
        ctx.beginPath();
        for (const dx of [-5, 5]) {
          ctx.moveTo(x + dx, 147);
          ctx.quadraticCurveTo(x + span / 2 + dx, 160, x + span + dx, 147);
        }
        ctx.stroke();
      }
      ground(ctx, sc, "#5f7a4c", "#2e3a2c", "#141a13", "rgb(20 26 19 / 0.7)", "rgb(90 110 80 / 0.4)", 5);
      /* The railway: sleepers and two shining rails. */
      ctx.fillStyle = "#4a3523";
      for (let i = 0; i < 26; i++) ctx.fillRect(wrap(i * 16 - sc * NEAR, W + 16) - 8, GROUND_Y + 12, 4, 7);
      ctx.fillStyle = "#9aa3b2";
      ctx.fillRect(0, GROUND_Y + 13, W, 1.2);
      ctx.fillRect(0, GROUND_Y + 17, W, 1.2);
      ctx.fillStyle = "rgb(255 190 140 / 0.5)";
      ctx.fillRect(0, GROUND_Y + 13, W, 0.5);
      for (let b = 0; b < 3; b++) {
        const y = 120 + b * 22;
        const g = ctx.createLinearGradient(0, y - 8, 0, y + 8);
        g.addColorStop(0, "rgb(230 210 235 / 0)");
        g.addColorStop(0.5, "rgb(230 210 235 / 0.2)");
        g.addColorStop(1, "rgb(230 210 235 / 0)");
        ctx.fillStyle = g;
        ctx.fillRect(wrap(-sc * (0.2 + b * 0.1), 120) - 120, y - 8, W + 120, 16);
      }
      break;
    }
    case 6: {
      /* The Arctic shelf under the aurora: curtains of green light with rays, icebergs in the
         distance, an ice cliff with blue cracks, floes on dark water. */
      sky(ctx, [[0, "#04122a"], [0.6, "#0d3b52"], [1, "#165a73"]]);
      ctx.fillStyle = "rgb(255 255 255 / 0.7)";
      for (let i = 0; i < 50; i++) ctx.fillRect(noise(i * 7) * W, noise(i * 3) * 120, 1, 1);
      for (let b = 0; b < 3; b++) {
        const top = (x: number) => 22 + b * 16 + Math.sin((x + sc * 0.2) / 55 + b * 1.7 + f / 90) * 13;
        ctx.beginPath();
        ctx.moveTo(0, top(0));
        for (let x = 0; x <= W; x += 12) ctx.lineTo(x, top(x));
        for (let x = W; x >= 0; x -= 12) ctx.lineTo(x, top(x) + 24);
        ctx.closePath();
        ctx.fillStyle = b === 1 ? "rgb(120 255 190 / 0.14)" : "rgb(110 200 255 / 0.1)";
        ctx.fill();
        /* Rays hanging down from the curtain. */
        for (let x = 0; x <= W; x += 5) {
          const k = 0.5 + 0.5 * Math.sin(x / 9 + f / 25 + b * 2);
          ctx.fillStyle = b === 1 ? `rgb(140 255 200 / ${0.12 * k})` : `rgb(130 210 255 / ${0.09 * k})`;
          ctx.fillRect(x, top(x), 1.5, 30 + k * 14);
        }
      }
      peaks(ctx, 150, sc * 0.05, 90, 10, 26, "#e6f3fa", "#9cc3d8", "", 31);
      ridge(ctx, 150, sc * 0.1, 18, 80, 6, "#cfe5ef", 0.2);
      /* The cliff face, with cracks of deep blue. */
      ctx.strokeStyle = "rgb(60 130 180 / 0.6)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const x = wrap(i * 37 - sc * 0.1, W + 37) - 18;
        ctx.beginPath();
        ctx.moveTo(x, 138 + (i % 3) * 2);
        ctx.lineTo(x + 2, 144);
        ctx.lineTo(x - 1, 150);
        ctx.stroke();
      }
      sea(ctx, 150, sc, "#0b3a52", "#041a2a", "rgb(190 235 255 / A)", 0.8);
      glitter(ctx, W * 0.3, 151, f, "rgb(150 255 210 / 0.35)");
      for (let i = 0; i < 6; i++) {
        const x = wrap(noise(i * 11) * (W + 160) - sc * NEAR, W + 160) - 80;
        const w = 30 + noise(i * 3) * 18;
        fillPoly(ctx, [[x, WATER_Y + 7], [x + w * 0.1, WATER_Y + 12], [x + w * 0.9, WATER_Y + 12], [x + w, WATER_Y + 7]], "rgb(120 190 220 / 0.25)");
        fillPoly(ctx, [[x, WATER_Y + 2], [x + 8, WATER_Y - 4], [x + w - 10, WATER_Y - 5], [x + w, WATER_Y + 3], [x + w * 0.6, WATER_Y + 7], [x + 6, WATER_Y + 6]], "#b9dbe9");
        fillPoly(ctx, [[x, WATER_Y + 2], [x + 8, WATER_Y - 4], [x + w - 10, WATER_Y - 5], [x + w, WATER_Y + 3], [x + w * 0.6, WATER_Y + 1], [x + 6, WATER_Y + 1]], "#f1f9fc");
      }
      swell(ctx, sc, "#06263a", "rgb(160 220 245 / 0.4)", "rgb(220 245 255 / 0.55)", 1.4);
      streaks(ctx, f, 40, 0.8, 1.6, 1.8, "rgb(230 245 255 / 0.4)", 0.7);
      break;
    }
    case 7: {
      /* The hurricane's eye: a ring of cloud wall round a calm centre, curtains of rain moving across
         the distance, a heavy sea, and lightning that is only ever the backdrop (a real strike is a
         marked column). */
      sky(ctx, [[0, "#1c2b2e"], [0.5, "#3c5a58"], [1, "#6f908a"]]);
      const cx = W * 0.62;
      const cy = 96;
      for (let r = 0; r < 6; r++) {
        ctx.strokeStyle = `rgb(${190 - r * 14} ${215 - r * 12} ${210 - r * 10} / ${0.16 + r * 0.03})`;
        ctx.lineWidth = 9 + r * 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 36 + r * 34, 22 + r * 20, 0, f / 300 + r, f / 300 + r + Math.PI * 1.3);
        ctx.stroke();
      }
      disc(ctx, cx, cy, 10, "#d8ecff", "rgb(180 220 255 / 0.35)");
      clouds(ctx, sc, 8, 4, 60, "rgb(30 44 46 / 0.65)", 0.4, "rgb(10 20 22 / 0.3)");
      const k = Math.floor(f / 90);
      const flash = noise(k * 3 + 1) > 0.55 && f % 90 < 5;
      if (flash) {
        ctx.fillStyle = "rgb(220 240 255 / 0.12)";
        ctx.fillRect(0, 0, W, 150);
      }
      for (let i = 0; i < 4; i++) {
        const x = wrap(i * 120 - sc * 0.2 - f * 0.15, W + 120) - 60;
        const g = ctx.createLinearGradient(x, 0, x + 50, 0);
        g.addColorStop(0, "rgb(40 60 62 / 0)");
        g.addColorStop(0.5, "rgb(40 60 62 / 0.35)");
        g.addColorStop(1, "rgb(40 60 62 / 0)");
        ctx.fillStyle = g;
        poly(ctx, [[x + 10, 40], [x + 46, 40], [x + 56, 150], [x, 150]]);
        ctx.fill();
      }
      /* A lighthouse on a rock far off, its beam turning. */
      const lx = wrap(320 - sc * 0.1, W + 160) - 60;
      fillPoly(ctx, [[lx - 14, 150], [lx - 6, 143], [lx + 8, 142], [lx + 16, 150]], "#1a2a2c");
      fillPoly(ctx, [[lx - 2.5, 143], [lx - 1.5, 126], [lx + 1.5, 126], [lx + 2.5, 143]], "#d8d2c4");
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(lx - 2, 133, 4, 3);
      ctx.fillStyle = "#fff4c2";
      ctx.fillRect(lx - 1.5, 123, 3, 3);
      const beam = Math.sin(f / 40);
      const bg = ctx.createLinearGradient(lx, 124, lx + beam * 90, 124);
      bg.addColorStop(0, "rgb(255 244 194 / 0.4)");
      bg.addColorStop(1, "rgb(255 244 194 / 0)");
      ctx.fillStyle = bg;
      poly(ctx, [[lx, 124], [lx + beam * 90, 116], [lx + beam * 90, 132]]);
      ctx.fill();
      sea(ctx, 150, sc, "#2c4a4a", "#0a1d22", "rgb(215 235 232 / A)", 1.9);
      if (flash) {
        ctx.strokeStyle = "rgb(235 245 255 / 0.8)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        let x = noise(k) * W;
        ctx.moveTo(x, 0);
        for (let y = 12; y < 150; y += 15) {
          x += (noise(k * 13 + y) - 0.5) * 20;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      swell(ctx, sc, "#0c2226", "rgb(200 225 222 / 0.5)", "rgb(235 245 242 / 0.75)", 3.4);
      streaks(ctx, f, 60, 2.4, 4.8, 3, "rgb(210 230 232 / 0.3)", 0.7);
      break;
    }
    default: {
      /* Meridian Citadel at dawn: the first clear sky of the war. Far towers in the haze, the near
         towers lit on one side, trees along the walls, banners in the wind, a tiled plaza, and far
         off the orbital lance standing in its gantry. */
      sky(ctx, [[0, "#3f6fb5"], [0.5, "#f6c98c"], [1, "#fff1c9"]]);
      disc(ctx, 96, 120, 22, "#fff7d1", "rgb(255 220 150 / 0.55)");
      clouds(ctx, sc, 6, 18, 60, "rgb(255 250 235 / 0.6)", 0.18, "rgb(240 170 120 / 0.25)");
      ridge(ctx, 158, sc * 0.1, 16, 90, 7, "#a9b8d1", 0.2);
      for (let i = 0; i < 9; i++) {
        const x = wrap(i * 52 + 20 - sc * 0.15, 52 * 9) - 52;
        const h = 30 + (i % 4) * 9;
        ctx.fillStyle = "#b9c4d8";
        ctx.fillRect(x, 160 - h, 16, h);
        fillPoly(ctx, [[x - 1, 160 - h], [x + 8, 160 - h - 9], [x + 17, 160 - h]], "#a5b2ca");
      }
      haze(ctx, 156, 10, "rgb(255 236 205 / A)");
      const lanceX = wrap(300 - sc * 0.2, W + 120) - 40;
      ctx.strokeStyle = "#7a879c";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let y = 100; y < 168; y += 8) {
        ctx.moveTo(lanceX - 6, y);
        ctx.lineTo(lanceX - 2, y + 8);
        ctx.moveTo(lanceX - 2, y);
        ctx.lineTo(lanceX - 6, y + 8);
      }
      ctx.moveTo(lanceX - 6, 100);
      ctx.lineTo(lanceX - 6, 168);
      ctx.moveTo(lanceX - 2, 100);
      ctx.lineTo(lanceX - 2, 168);
      ctx.stroke();
      ctx.fillStyle = "#8a97ad";
      ctx.fillRect(lanceX, 96, 6, 72);
      ctx.fillStyle = "#6b7890";
      ctx.fillRect(lanceX + 4, 96, 2, 72);
      ctx.fillStyle = "#5eead4";
      ctx.fillRect(lanceX + 1.4, 90, 3.2, 10);
      disc(ctx, lanceX + 3, 92, 1.5, "#ccfbf1", `rgb(94 234 212 / ${0.25 + Math.sin(f / 15) * 0.1})`);
      for (let i = 0; i < 7; i++) {
        const x = wrap(i * 74 - sc * 0.3, 74 * 7) - 74;
        const h = 40 + (i % 3) * 18;
        const top = 168 - h;
        ctx.fillStyle = "#eef1f6";
        ctx.fillRect(x, top, 26, h);
        ctx.fillStyle = "#c9d1de";
        ctx.fillRect(x + 18, top, 8, h);
        fillPoly(ctx, [[x - 2, top], [x + 13, top - 14], [x + 28, top]], "#3f5f99");
        fillPoly(ctx, [[x + 13, top - 14], [x + 28, top], [x + 13, top]], "#2e4877");
        ctx.fillStyle = "rgb(90 110 150 / 0.6)";
        for (let row = 0; row < Math.floor(h / 16); row++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 5 + c * 7, top + 8 + row * 16, 3, 7);
        ctx.fillStyle = "rgb(255 220 150 / 0.75)";
        ctx.fillRect(x + 5, top + 8, 3, 7);
        const wave = Math.sin(f / 8 + i) * 1.5;
        ctx.fillStyle = "#64748b";
        ctx.fillRect(x + 12.4, top - 26, 1, 12);
        fillPoly(ctx, [[x + 13.4, top - 26], [x + 22, top - 23 + wave], [x + 13.4, top - 20]], i % 2 ? "#3b82f6" : "#fbcf33");
      }
      /* The wall and its trees, nearer. */
      ctx.fillStyle = "#d8cfb8";
      ctx.fillRect(0, 176, W, 12);
      ctx.fillStyle = "#b9ae94";
      for (let i = 0; i < 20; i++) ctx.fillRect(wrap(i * 22 - sc * 0.7, W + 22) - 11, 173, 12, 3);
      ctx.fillRect(0, 176, W, 1);
      for (let i = 0; i < 9; i++) {
        const x = wrap(noise(i * 5) * (W + 80) - sc * 0.7, W + 80) - 40;
        ctx.fillStyle = "#6b4f33";
        ctx.fillRect(x - 0.7, 170, 1.4, 8);
        ctx.fillStyle = "#3f7a45";
        ctx.beginPath();
        ctx.arc(x, 166, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5c9c5a";
        ctx.beginPath();
        ctx.arc(x - 1.6, 164.4, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ground(ctx, sc, "#f3ecd8", "#cfc6b0", "#8f866f", "rgb(120 110 90 / 0.55)", "rgb(120 110 90 / 0.35)", 9);
      ctx.strokeStyle = "rgb(120 110 90 / 0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const x = wrap(i * 26 - sc * NEAR, W + 26) - 13;
        ctx.moveTo(x, GROUND_Y + 3);
        ctx.lineTo(x - 4, GROUND_Y + 11);
        ctx.moveTo(x + 13, GROUND_Y + 11);
        ctx.lineTo(x + 8, H);
      }
      ctx.moveTo(0, GROUND_Y + 11);
      ctx.lineTo(W, GROUND_Y + 11);
      ctx.stroke();
      break;
    }
  }
  /* A little more atmosphere when the speed is high: dust and supersonic wind streaks. */
  if (vel > 3 && !reduceMotion) {
    ctx.fillStyle = "rgb(255 255 255 / 0.3)";
    for (let i = 0; i < 12; i++) ctx.fillRect(wrap(noise(i * 7) * W - sc * 2, W), noise(i * 3) * H, vel * 5, 1);
  }
  if (vel > 2.2 && !reduceMotion) {
    ctx.fillStyle = "rgb(224 242 254 / 0.16)";
    for (let i = 0; i < 6; i++) {
      const wx = wrap(noise(i * 13 + 31) * W - sc * 2.8, W);
      const wy = noise(i * 19 + 7) * (H - 35);
      ctx.fillRect(wx, wy, Math.min(50, vel * 12), 0.65);
    }
  }
}
