/* Space 2's cover: the wall a ground unit hides behind and the barrier a ship sits behind, one look
   for each place. Flat shapes with a dark rim, lit from the upper left; cracks open as it is shot,
   and it flashes white when hit, so it reads as something to break. */
import type { Hazard } from "./space-logic";

type Ctx = CanvasRenderingContext2D;

const INK = "#1f262b";

function poly(ctx: Ctx, pts: number[][], fill: string, rim = INK, width = 0.7) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = width;
  ctx.stroke();
}

/* Blocks laid in courses: stone, sandstone, snow bricks. */
function blocks(ctx: Ctx, x: number, y: number, w: number, h: number, lit: string, shade: string, joint: string) {
  poly(ctx, [[x, y + h], [x, y + 2], [x + 2, y], [x + w - 2, y], [x + w, y + 2], [x + w, y + h]], lit);
  ctx.fillStyle = shade;
  ctx.fillRect(x + w - 3, y + 1, 2.4, h - 1);
  ctx.strokeStyle = joint;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  for (let r = 0, yy = y + 5; yy < y + h - 1; r++, yy += 5) {
    ctx.moveTo(x + 0.5, yy);
    ctx.lineTo(x + w - 0.5, yy);
    const off = r % 2 ? w * 0.5 : w * 0.25;
    ctx.moveTo(x + off, yy);
    ctx.lineTo(x + off, yy + 5);
  }
  ctx.stroke();
}

/* Sandbags piled up, each a rounded lump. */
function sandbags(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const rows = Math.max(2, Math.round(h / 5));
  for (let r = 0; r < rows; r++) {
    const yy = y + h - (r + 1) * (h / rows);
    const n = r % 2 ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const bw = w / n;
      const bx = x + k * bw;
      ctx.fillStyle = r % 2 ? "#8c7a52" : "#9c8a5e";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(bx + bw / 2, yy + h / rows / 2, bw / 2, h / rows / 2 + 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgb(255 245 210 / 0.35)";
      ctx.fillRect(bx + 1.5, yy + 1, bw * 0.4, 0.8);
    }
  }
}

/* A floating barrier on the waterline. */
function sea(ctx: Ctx, h: Hazard, place: number, t: number) {
  const { x, w, base } = h;
  const water = base + h.half - 5;
  const bob = Math.sin(t / 20 + h.id) * 0.6;
  const top = base + bob;
  if (place === 1) {
    /* A wreck: a broken hull standing up out of the sea, still smoking. */
    poly(ctx, [[x, water + 2], [x + 2, top + 6], [x + w * 0.45, top], [x + w * 0.6, top + 5], [x + w, top + 3], [x + w, water + 2]], "#4b5563");
    poly(ctx, [[x + w * 0.62, top + 5], [x + w, top + 3], [x + w, water + 2], [x + w * 0.62, water + 2]], "#374151");
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x + 1, water - 3, w - 1, 2);
    ctx.fillStyle = INK;
    for (let i = 0; i < 3; i++) ctx.fillRect(x + 3 + i * 4, top + 9, 1.6, 1.6);
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.5 + i * 12) % 36) / 36;
      ctx.fillStyle = `rgb(60 50 50 / ${0.45 * (1 - k)})`;
      ctx.beginPath();
      ctx.arc(x + w * 0.45 + k * 8, top - k * 18, 1.5 + k * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (place === 6) {
    /* A block of sea ice, lit on top, deep blue in its cracks. */
    poly(ctx, [[x, water + 3], [x + 1, top + 3], [x + w * 0.35, top], [x + w, top + 2], [x + w, water + 3]], "#e0f2fe", "#3b6b8a");
    poly(ctx, [[x + w * 0.6, top + 1.2], [x + w, top + 2], [x + w, water + 3], [x + w * 0.6, water + 3]], "#a5d4ec", "#3b6b8a");
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x + 4, top + 4);
    ctx.lineTo(x + 6, top + 10);
    ctx.lineTo(x + 4, top + 15);
    ctx.stroke();
  } else {
    /* Rocks, or a concrete breakwater in the storm. */
    const storm = place === 7;
    const lit = storm ? "#9ca3af" : "#57534e";
    const shade = storm ? "#6b7280" : "#3f3b37";
    poly(ctx, [[x - 1, water + 3], [x + 1, top + 4], [x + w * 0.4, top], [x + w * 0.75, top + 3], [x + w + 1, top + 8], [x + w + 1, water + 3]], lit);
    poly(ctx, [[x + w * 0.55, top + 1.5], [x + w * 0.75, top + 3], [x + w + 1, top + 8], [x + w + 1, water + 3], [x + w * 0.55, water + 3]], shade);
    if (storm) {
      ctx.fillStyle = "#facc15";
      for (let i = 0; i < 2; i++) ctx.fillRect(x + 2 + i * 7, top + 7, 4, 1.4);
    } else {
      ctx.fillStyle = "#3f6b45";
      ctx.fillRect(x + 1, water - 2, w, 1.5);
    }
  }
  /* The waterline foam around it. */
  ctx.fillStyle = "rgb(240 250 255 / 0.75)";
  ctx.fillRect(x - 3, water + 1 + Math.sin(t / 9) * 0.5, w + 6, 1.4);
}

function land(ctx: Ctx, h: Hazard, place: number) {
  const { x, w, base } = h;
  const tall = h.half;
  if (place === 3) {
    /* A wall of packed snow over rock. */
    blocks(ctx, x, base + 2, w, tall - 2, "#f1f5f9", "#c7d4e2", "rgb(100 120 145 / 0.5)");
    poly(ctx, [[x - 1, base + 3], [x + 2, base], [x + w - 2, base - 0.5], [x + w + 1, base + 3]], "#ffffff", "#94a3b8");
  } else if (place === 4) {
    /* A broken sandstone wall from the ruin. */
    blocks(ctx, x, base + 3, w, tall - 3, "#d9b07a", "#a97c46", "rgb(110 75 40 / 0.55)");
    poly(ctx, [[x, base + 3], [x + w * 0.3, base], [x + w * 0.55, base + 2], [x + w, base + 1], [x + w, base + 4], [x, base + 4]], "#d9b07a");
  } else if (place === 8) {
    /* A barricade of dressed stone with a gold band. */
    blocks(ctx, x, base, w, tall, "#e7e2d4", "#b8b09a", "rgb(120 110 90 / 0.55)");
    ctx.fillStyle = "#fbcf33";
    ctx.fillRect(x + 0.5, base + 2, w - 1, 1.2);
  } else {
    /* Sandbags with a log across the top. */
    sandbags(ctx, x, base + 3, w, tall - 3);
    poly(ctx, [[x - 2, base + 1], [x + w + 2, base + 1], [x + w + 2, base + 4], [x - 2, base + 4]], "#6b4a2a");
    ctx.fillStyle = "#8a6a44";
    ctx.beginPath();
    ctx.arc(x + w + 2, base + 2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* Cracks that open as it loses strength. */
function cracks(ctx: Ctx, h: Hazard) {
  const lost = 1 - h.g[0] / h.g[1];
  if (lost < 0.25) return;
  ctx.strokeStyle = "rgb(20 20 24 / 0.75)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  const n = lost < 0.6 ? 1 : 2;
  for (let i = 0; i < n; i++) {
    const cx = h.x + h.w * (0.3 + i * 0.4);
    ctx.moveTo(cx, h.base + 2);
    ctx.lineTo(cx + 2, h.base + h.half * 0.35);
    ctx.lineTo(cx - 1.5, h.base + h.half * 0.6);
    ctx.lineTo(cx + 1, h.base + h.half * 0.85);
  }
  ctx.stroke();
}

/* Colours of the high ground in each place: lit face, shaded face, the top, and the top's edge. */
const GROUND: Record<number, [string, string, string, string]> = {
  1: ["#6b5a52", "#4a3d38", "#3f6b45", "#5f8f5a"],
  2: ["#5d5a4e", "#403e35", "#2b5240", "#3f7356"],
  3: ["#8296ad", "#5c6f87", "#f4f8fc", "#ffffff"],
  4: ["#c0874a", "#93602f", "#e2b36a", "#f1c47e"],
  5: ["#4a4560", "#2f2b42", "#3d5236", "#5a7a4a"],
  6: ["#9ec3d8", "#6f9bb5", "#eef7fb", "#ffffff"],
  7: ["#5f6b6a", "#3f4a49", "#4b6250", "#6a8a6c"],
  8: ["#b9ae94", "#8f866f", "#7aa36b", "#98c083"],
};

/* High ground: a hill or crag on land, an island or a bare rock at sea. Its rock face is lit on
   the left and in shade on the right, with ledges, and the top carries the place's ground. */
function drawPerch(ctx: Ctx, h: Hazard, t: number) {
  const place = (h.g[3] ?? 9) - 8;
  const [lit, shade, top, edge] = GROUND[place] ?? GROUND[1];
  const { x, w, base } = h;
  const bottom = base + h.half;
  const rock = h.g[2] === 2;
  const seed = h.id * 7.31;
  const j = (k: number) => Math.sin(seed + k * 2.7) * 2;
  /* The face: a little wider at the foot, the crown uneven for a bare rock. */
  const crown = rock
    ? [[x + w * 0.12, base + 6 + j(1)], [x + w * 0.3, base + j(2)], [x + w * 0.55, base + 3 + j(3)], [x + w * 0.78, base + 1 + j(4)], [x + w * 0.92, base + 8 + j(5)]]
    : [[x + 2, base + 1], [x + w - 2, base + 1]];
  const outline = [[x - 3, bottom], [x + 1, base + 6], ...crown, [x + w - 1, base + 5], [x + w + 3, bottom]];
  poly(ctx, outline, lit);
  /* The shaded right side. */
  ctx.save();
  ctx.beginPath();
  outline.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = shade;
  ctx.fillRect(x + w * 0.58, base - 4, w * 0.5, h.half + 8);
  /* Ledges and cracks across the face. */
  ctx.strokeStyle = "rgb(20 24 28 / 0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const y = base + 8 + k * (h.half / 4.5);
    ctx.moveTo(x + 2 + ((k * 7) % 9), y);
    ctx.lineTo(x + w * (0.45 + (k % 2) * 0.2), y + 2);
  }
  ctx.moveTo(x + w * 0.3, base + 6);
  ctx.lineTo(x + w * 0.34, base + h.half * 0.5);
  ctx.stroke();
  ctx.restore();
  if (!rock) {
    /* The top: the place's ground, a lit lip, a tuft or two. */
    poly(ctx, [[x - 1, base + 4], [x + 1, base - 0.5], [x + w - 1, base - 0.5], [x + w + 1, base + 4], [x + w * 0.7, base + 6], [x + w * 0.35, base + 5]], top);
    ctx.fillStyle = edge;
    ctx.fillRect(x + 1, base - 0.5, w - 2, 1.2);
    if (place === 1 || place === 2 || place === 7) {
      /* A palm on the island. */
      const px = x + w - 5;
      ctx.strokeStyle = "#3a2c1f";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, base);
      ctx.quadraticCurveTo(px + 1, base - 7, px + 3, base - 12);
      ctx.stroke();
      ctx.strokeStyle = "#2f6b3f";
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI + (k / 4) * Math.PI + Math.sin(t / 30) * 0.1;
        ctx.beginPath();
        ctx.moveTo(px + 3, base - 12);
        ctx.quadraticCurveTo(px + 3 + Math.cos(a) * 4, base - 14 + Math.sin(a) * 3, px + 3 + Math.cos(a) * 7, base - 10 + Math.sin(a) * 2);
        ctx.stroke();
      }
    }
  } else if (place === 6) {
    /* Snow caps a rock in the Arctic. */
    poly(ctx, crown.map(([px, py]) => [px, py - 0.5]).concat([[x + w * 0.85, base + 9], [x + w * 0.15, base + 9]]), "#f1f9fc", "#6f9bb5");
  } else {
    /* Gulls' white streaks on a sea rock. */
    ctx.fillStyle = "rgb(255 255 255 / 0.45)";
    ctx.fillRect(x + w * 0.35, base + 6, 1, 6);
    ctx.fillRect(x + w * 0.62, base + 8, 1, 5);
  }
  if (h.g[2] !== 0) {
    /* Surf where it meets the sea. */
    ctx.fillStyle = "rgb(240 250 255 / 0.8)";
    const surf = bottom - 6 + Math.sin(t / 10 + h.id) * 0.6;
    ctx.fillRect(x - 6, surf, w + 12, 1.5);
    ctx.fillStyle = "rgb(240 250 255 / 0.45)";
    ctx.fillRect(x - 10 + Math.sin(t / 14) * 2, surf + 2.5, w + 20, 1);
  }
}

/* Draws a piece of Space 2 cover or high ground; returns false for any other hazard. */
export function drawCover(ctx: Ctx, h: Hazard, reduceMotion = false): boolean {
  if (h.kind === "perch") {
    drawPerch(ctx, h, reduceMotion ? 0 : h.t);
    return true;
  }
  if (h.kind !== "cover") return false;
  const place = (h.g[6] ?? 9) - 8;
  const t = reduceMotion ? 0 : h.t;
  if (h.g[4] === 1) sea(ctx, h, place, t);
  else land(ctx, h, place);
  cracks(ctx, h);
  if (h.g[5] > 0) {
    ctx.fillStyle = "rgb(255 255 255 / 0.55)";
    ctx.fillRect(h.x, h.base, h.w, h.half - (h.g[4] === 1 ? 4 : 0));
  }
  return true;
}
