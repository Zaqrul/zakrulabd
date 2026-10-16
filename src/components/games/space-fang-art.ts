/* Chapter 7's boss: Vex's own fighter, the Crimson Fang. Not a machine on legs like the
   others but a sleek ace's ship: two blade wings that sweep forward round the nose like
   jaws, a canopy with the pilot in it, and a chin cannon that follows the ship. Flat native
   Canvas geometry in the model's own space (60 by 38, nose to the left); the weapon mounts
   are the ones the simulation uses. */
import { enemyMuzzle, type Enemy, type State } from "./space-logic";
import { tone } from "./space-material";

type Ctx = CanvasRenderingContext2D;

const INK = "#1b1320";
const RED = "#c8233f", RED_LIGHT = "#ee4a62", RED_DARK = "#7d1530", WING = "#a61c38";
const STEEL = "#4a5266", STEEL_DARK = "#2c3140";
const BONE = "#ece6dc", AMBER = "#fbcf33", ROSE = "#fb7185", GLASS = "#2a4a63";

export function drawCrimsonFang(ctx: Ctx, e: Enemy, s: State, reduceMotion: boolean) {
  const { x, y } = e;
  const cy = e.h / 2;
  const t = reduceMotion ? 0 : e.t;
  const a = e.attack;
  const warning = !!a && a.t < a.warn;
  const firing = !!a && a.t >= a.warn && a.t < a.warn + a.live;
  const hot = warning ? "#ffb665" : firing ? "#fff0c4" : "#6b3b52";
  /* Blades light up for the crescents, the engines open up for the charge. */
  const bladeLit = a?.kind === "crescent" && (warning || firing);
  const burning = a?.kind === "charge" && (warning || firing);

  const poly = (pts: number[][], colour: string, rim = INK, width = 0.8) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py)));
    ctx.closePath();
    ctx.fillStyle = tone(colour);
    ctx.fill();
    ctx.strokeStyle = rim;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  const box = (px: number, py: number, w: number, h: number, colour: string) =>
    poly([[px, py], [px + w, py], [px + w, py + h], [px, py + h]], colour);
  const disc = (px: number, py: number, r: number, colour: string, ry = r) => {
    ctx.beginPath();
    ctx.ellipse(x + px, y + py, r, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = tone(colour);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };

  ctx.save();

  /* Exhaust: two flames out of the engine pods. */
  const flick = reduceMotion ? 0 : Math.sin(t * 0.9) * 1.4;
  const len = (9 + flick) * (burning ? 1.9 : 1);
  for (const fy of [cy - 7, cy + 7]) {
    ctx.fillStyle = "rgb(251 113 133 / 0.35)";
    ctx.beginPath();
    ctx.moveTo(x + 59, y + fy - 3);
    ctx.lineTo(x + 59 + len * 1.3, y + fy);
    ctx.lineTo(x + 59, y + fy + 3);
    ctx.fill();
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(x + 59, y + fy - 2);
    ctx.lineTo(x + 59 + len, y + fy);
    ctx.lineTo(x + 59, y + fy + 2);
    ctx.fill();
    ctx.fillStyle = "#fff1cc";
    ctx.beginPath();
    ctx.moveTo(x + 59, y + fy - 0.9);
    ctx.lineTo(x + 59 + len * 0.55, y + fy);
    ctx.lineTo(x + 59, y + fy + 0.9);
    ctx.fill();
  }

  /* Tail fins and the two engine pods. */
  poly([[44, cy - 7], [57, cy - 19], [60, cy - 17], [53, cy - 6]], RED_DARK);
  poly([[44, cy + 7], [57, cy + 19], [60, cy + 17], [53, cy + 6]], RED_DARK);
  for (const side of [-1, 1]) {
    const py = cy + side * 7;
    box(44, py - 3.2, 16, 6.4, STEEL_DARK);
    box(46, py - 2.2, 10, 1.1, STEEL);
    disc(59.5, py, 3, burning ? "#ffb665" : STEEL, 3.2);
  }

  /* The blade wings, behind the hull: mandibles that wrap forward round the nose. */
  for (const side of [-1, 1]) {
    const wy = (d: number) => y + cy + side * d;
    ctx.beginPath();
    ctx.moveTo(x + 48, wy(8));
    ctx.bezierCurveTo(x + 36, wy(22), x + 8, wy(22), x - 10, wy(13));
    ctx.bezierCurveTo(x + 6, wy(16.5), x + 24, wy(14), x + 34, wy(9.5));
    ctx.closePath();
    ctx.fillStyle = tone(WING);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.9;
    ctx.stroke();
    /* A darker panel and the lit edge on the outside. */
    ctx.beginPath();
    ctx.moveTo(x + 44, wy(9.5));
    ctx.bezierCurveTo(x + 34, wy(18.5), x + 14, wy(18.5), x + 4, wy(14.5));
    ctx.bezierCurveTo(x + 16, wy(15.5), x + 30, wy(13), x + 38, wy(10.5));
    ctx.closePath();
    ctx.fillStyle = tone(RED_DARK);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 48, wy(8));
    ctx.bezierCurveTo(x + 36, wy(22), x + 8, wy(22), x - 10, wy(13));
    ctx.strokeStyle = bladeLit ? (firing ? "#fff0c4" : "#ffd0d8") : ROSE;
    ctx.lineWidth = bladeLit ? 1.8 : 1;
    ctx.stroke();
    for (const [lx, ld] of [[30, 16.4], [18, 18.4]] as const) disc(lx, cy + side * ld, 0.9, bladeLit ? "#fff0c4" : AMBER);
  }

  /* The hull: a long dagger with a flat back and a dark belly. */
  poly([[-2, cy], [8, cy - 4], [22, cy - 6.5], [42, cy - 8], [58, cy - 6], [61, cy - 3], [61, cy + 3], [58, cy + 6], [42, cy + 8], [22, cy + 6.5], [8, cy + 4]], RED);
  poly([[8, cy - 4], [22, cy - 6.5], [42, cy - 8], [44, cy - 5], [22, cy - 3.5], [10, cy - 1.5]], RED_LIGHT);
  poly([[8, cy + 4], [22, cy + 6.5], [42, cy + 8], [58, cy + 6], [56, cy + 3], [40, cy + 4.5], [22, cy + 3.5], [10, cy + 1.5]], RED_DARK);
  box(26, cy - 0.7, 20, 1.4, STEEL_DARK);
  for (let i = 0; i < 4; i++) box(28 + i * 5, cy - 0.5, 2.4, 1, AMBER);
  /* The ace's chevrons, and the fangs under the nose. */
  poly([[12, cy - 3.6], [15.5, cy - 4.2], [19, cy], [15.5, cy + 4.2], [12, cy + 3.6], [15, cy]], BONE, INK, 0.5);
  poly([[1.5, cy + 1.4], [5.5, cy + 1.1], [3.8, cy + 5.4]], BONE, INK, 0.5);
  poly([[6.5, cy + 2.6], [10.5, cy + 2.4], [8.6, cy + 6.4]], BONE, INK, 0.5);

  /* The canopy, with Vex in it. */
  poly([[19, cy - 3.8], [24, cy - 9.2], [33, cy - 10.2], [41, cy - 6], [41, cy - 3.8]], GLASS);
  poly([[22, cy - 4.6], [25, cy - 8], [29, cy - 8.6], [27, cy - 4.6]], "#5b86a3", "rgb(0 0 0 / 0)");
  disc(32, cy - 6.4, 3.3, BONE);
  box(29.8, cy - 7.4, 5.2, 2.2, warning ? "#ffb665" : AMBER);
  rodAntenna(ctx, x + 35.5, y + cy - 9.8, x + 41, y + cy - 15);

  /* The chin cannon follows the ship, and the nose lights up before it fires. */
  const m = enemyMuzzle(e, s, 0);
  const mx = m.x - x;
  const my = m.y - y;
  const bx = mx - Math.cos(m.angle) * 13;
  const by = my - Math.sin(m.angle) * 13;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + bx, y + by);
  ctx.lineTo(x + mx, y + my);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.2;
  ctx.stroke();
  ctx.strokeStyle = tone(STEEL);
  ctx.lineWidth = 2.8;
  ctx.stroke();
  ctx.lineCap = "butt";
  disc(bx, by, 3.4, STEEL_DARK);
  disc(mx, my, 1.7, hot);
  if (firing && a && ["burst", "fan", "curtain"].includes(a.kind) && (a.t - a.warn) % 10 < 3) {
    poly([[mx - Math.sin(m.angle) * 2.2, my + Math.cos(m.angle) * 2.2], [mx + Math.cos(m.angle) * 7, my + Math.sin(m.angle) * 7], [mx + Math.sin(m.angle) * 2.2, my - Math.cos(m.angle) * 2.2]], "#fde9b0");
  }

  /* Damage: cracks from the second phase, a burning vent from the third. */
  if (e.a >= 1) {
    poly([[24, cy - 6.5], [28, cy - 4.5], [26, cy - 1.5], [30, cy + 1]], INK, INK, 0.6);
  }
  if (e.a >= 2) {
    box(36, cy - 2, 7, 4, INK);
    const rise = t % 18;
    ctx.globalAlpha = 0.35;
    disc(39.5, cy - 4 - rise, 2 + rise / 7, "#7a6f7a");
    ctx.globalAlpha = 1;
    poly([[37, cy - 2], [39, cy - 7 - (t % 3)], [41, cy - 3], [43, cy - 6], [43, cy - 2]], "#eda65a", INK, 0.4);
  }

  /* Recovering behind a barrier of its own: it takes little damage meanwhile. */
  if (e.guard > 0) {
    ctx.beginPath();
    ctx.ellipse(x + 8, y + cy, 27, 31, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(125 211 252 / 0.16)";
    ctx.fill();
    ctx.strokeStyle = "rgb(186 230 253 / 0.9)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* The charge: a lance of light out of the nose, the size of the strip that hurts. */
  if (a?.kind === "charge" && firing && e.c === 2) {
    poly([[-48, cy], [-40, cy - 4.5], [0, cy - 4.5], [0, cy + 4.5], [-40, cy + 4.5]], "#ffe2e8", INK, 0.9);
    poly([[-46, cy], [-38, cy - 1.8], [0, cy - 1.8], [0, cy + 1.8], [-38, cy + 1.8]], "#fb7185", "rgb(0 0 0 / 0)");
  }

  ctx.restore();
}

function rodAntenna(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = AMBER;
  ctx.beginPath();
  ctx.arc(x1, y1, 0.9, 0, Math.PI * 2);
  ctx.fill();
}
