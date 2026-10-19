/* Enemy silhouettes and articulated weapons. Shared material helpers default
   to the user's flat Canvas style, with optional shading. Weapon mounts and
   attack clocks come from the simulation: barrels fire from their drawn tips. */
import {
  LOCK_FRAMES,
  MISSILE,
  MISSILE_RUN,
  TORPEDO,
  attackSlot,
  c4Muzzle,
  enemyMuzzle,
  fixedAim,
  isBoss,
  hidesAttackPrediction,
  missileMuzzle,
  missileStage,
  shipSize,
  torpedoSpeed,
  type Enemy,
  type State,
} from "./space-logic";
import {
  arcPts,
  ellipse,
  flame,
  glass,
  glow,
  lamp,
  lit,
  metal,
  path,
  rgba,
  rivets,
  seam,
  setHit,
  shadow,
  slab,
  sphere,
  tube,
} from "./space-material";
import { drawChapterBoss } from "./space-chapter-boss-art";
import { drawBoulder, drawSignatureCue } from "./space-boss-fx-art";
import { drawSecondCue } from "./space2-boss-fx-art";
import { drawMini } from "./space2-miniboss-art";
import { drawCorvet, drawCorvetCue } from "./space3-boss-art";
import { drawOuterActor } from "./space3-act2-art";
import { drawVanguard } from "./space3-enemy-art";
import { drawExcavator, drawExcavatorCue } from "./space3-excavator-art";
import { drawWyrm, drawWyrmCue } from "./space3-wyrm-art";
import { drawReclaimer } from "./space3-reclaimer-art";
import { drawReclaimerCue } from "./space3-reclaimer-cues";
import { drawArmsCue } from "./space3-arms-art";
import { drawSub } from "./space2-actor-art";
import { drawSecondEnemy } from "./space2-enemy-art";
import { drawFrozen } from "./space-weapons-art";

type Ctx = CanvasRenderingContext2D;

const CORAL = "#fb7185";
const CREAM = "#fff1cc";
const AMBER = "#fbbf24";
const DEEP = "#2a313d";
const BONE = "#d5dbe4";

/* A barrel, drawn from the mount to the point the rules fire from, with a muzzle
   brake, and a flash while a shot is leaving it. */
function weapon(ctx: Ctx, e: Enemy, s: State, length: number, width = 2, slot = 0, twin = false) {
  const m = enemyMuzzle(e, s, slot);
  const cos = Math.cos(m.angle);
  const sin = Math.sin(m.angle);
  const bx = m.x - cos * length;
  const by = m.y - sin * length;
  for (const o of twin ? [-1.15, 1.15] : [0]) {
    const ox = -sin * o;
    const oy = cos * o;
    tube(ctx, bx + ox, by + oy, m.x + ox, m.y + oy, width, "#707a89");
    tube(ctx, m.x - cos * 1.8 + ox, m.y - sin * 1.8 + oy, m.x + ox, m.y + oy, width + 0.9, "#4a5260");
  }
  if (fixedAim(e, slot) !== null) {
    /* A barrel that does not turn sits in a square bracket, bolted down. */
    slab(ctx, bx - width - 0.5, by - width - 1.2, width * 2 + 3, width * 2 + 2.4, 0.8, "#5d6674");
  } else sphere(ctx, bx, by, width + 1, "#5d6674");
  const a = e.attack;
  const selected = e.type !== "boss2" || slot === (a?.kind === "burst" ? Math.floor((a.t - a.warn) / 10) % 3 : 0);
  if (a && selected && ["fan", "burst"].includes(a.kind) && a.t >= a.warn && a.t < a.warn + a.live && (a.t - a.warn) % 10 < 3) {
    glow(ctx, m.x + cos * 3, m.y + sin * 3, 9, "#ffd9a0", 0.9);
    path(ctx, [[m.x + Math.cos(m.angle - 0.5) * 2, m.y + Math.sin(m.angle - 0.5) * 2], [m.x + cos * 6, m.y + sin * 6], [m.x + Math.cos(m.angle + 0.5) * 2, m.y + Math.sin(m.angle + 0.5) * 2]]);
    ctx.fillStyle = CREAM;
    ctx.fill();
  }
}

/* Tracks with road wheels and the links running over them. */
function tracks(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  slab(ctx, x, y, w, h, h / 2.2, "#2b323d", { light: 0.18 });
  const n = Math.floor(w / 7);
  for (let i = 0; i < n; i++) {
    const wx = x + 4 + i * ((w - 8) / Math.max(1, n - 1));
    sphere(ctx, wx, y + h / 2, h * 0.3, "#6b7482");
    ctx.strokeStyle = "rgb(255 255 255 / 0.5)";
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(wx, y + h / 2);
    ctx.lineTo(wx + Math.cos(t / 8 + i) * h * 0.22, y + h / 2 + Math.sin(t / 8 + i) * h * 0.22);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgb(0 0 0 / 0.5)";
  ctx.lineWidth = 0.45;
  for (let lx = x + 2 + (t % 3); lx < x + w - 2; lx += 3) {
    ctx.beginPath();
    ctx.moveTo(lx, y + 0.5);
    ctx.lineTo(lx, y + 1.6);
    ctx.stroke();
  }
}

/* White water trailing a ship. */
function wake(ctx: Ctx, x: number, y: number, t: number) {
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgb(255 255 255 / ${0.5 - i * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(x + 2 + i * 6 + ((t * 0.3) % 3), y - 0.4 + Math.sin(t / 12 + i) * 0.5, 5 + i * 1.6, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* What an attack looks like before it happens: a ring that closes, an aim line,
   a marked row, a flare's column. It is gameplay, not decoration, so it stays
   bold and does not change with the art around it. */
export function drawAttackCue(ctx: Ctx, e: Enemy, s: State, reduceMotion = false) {
  if (hidesAttackPrediction(e)) return;
  const a = e.attack;
  if (!a || a.t >= a.warn || a.kind === "beam") return;
  const locked = a.t >= a.warn - 18;
  const m = a.kind === "missiles" ? missileMuzzle(e) : a.kind === "c4" ? c4Muzzle(e) : enemyMuzzle(e, s, attackSlot(e));
  const col = locked ? CREAM : CORAL;
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = locked ? 1.2 : 0.8;
  if (a.kind === "charge") {
    /* The lane the whole body will sweep, edge to edge: that is what hurts, so
       that is what is marked. */
    ctx.fillStyle = "rgb(251 113 133 / 0.12)";
    ctx.fillRect(0, e.y, e.x, e.h);
    ctx.strokeStyle = "rgb(251 113 133 / 0.5)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(0, e.y, e.x, e.h);
    ctx.strokeStyle = col;
    ctx.lineWidth = locked ? 1.2 : 0.8;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, e.y + e.h / 2);
    ctx.lineTo(e.x, e.y + e.h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = CORAL;
    for (let x = 30; x < e.x; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x + 5, e.y + e.h / 2 - 3);
      ctx.lineTo(x, e.y + e.h / 2);
      ctx.lineTo(x + 5, e.y + e.h / 2 + 3);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    glow(ctx, m.x, m.y, 12 + (1 - a.t / a.warn) * 6, col, 0.4);
    const r = 6 + (1 - a.t / a.warn) * 5;
    ctx.beginPath();
    ctx.arc(m.x, m.y, r, 0, Math.PI * 2 * (a.t / a.warn));
    ctx.stroke();
    if (e.type === "boss2" && a.kind === "burst") {
      for (const slot of [1, 2]) {
        const port = enemyMuzzle(e, s, slot);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(port.x, port.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (["fan", "burst", "curtain"].includes(a.kind)) {
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x + Math.cos(a.angle) * 28, m.y + Math.sin(a.angle) * 28);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (a.kind === "flare") {
      ctx.beginPath();
      ctx.moveTo(a.targetX, 29);
      ctx.lineTo(a.targetX, 43);
      ctx.stroke();
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.moveTo(a.targetX - 3, 39);
      ctx.lineTo(a.targetX, 44);
      ctx.lineTo(a.targetX + 3, 39);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (locked || reduceMotion) {
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* A lock mark: a red ring with ticks, a dark line under it so it shows on grass
   and sky alike. A faint one has no ticks: something is still lining up. */
function mark(ctx: Ctx, x: number, y: number, r: number, faint = false) {
  ctx.save();
  if (faint) ctx.globalAlpha = 0.5;
  for (const [colour, width] of [["rgb(23 23 23 / 0.7)", 2.6], [CORAL, 1.2]] as const) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    if (faint) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.beginPath();
      ctx.moveTo(x + dx * (r - 2), y + dy * (r - 2));
      ctx.lineTo(x + dx * (r + 3), y + dy * (r + 3));
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* The mark an enemy puts on the spot it has locked: a ring that closes as the shot
   gets near. Where the ship was is where the torpedo goes. A guided missile first
   shows a faint ring that follows the ship while its nose swings round, then the
   red one on the spot it locked, closing until it runs. */
function drawLock(ctx: Ctx, e: Enemy, s: State) {
  if (hidesAttackPrediction(e)) return;
  if (e.type === "seeker") {
    const stage = missileStage(e.t);
    if (stage === "track") {
      const size = shipSize(s.p.level);
      mark(ctx, s.p.x + size.w / 2, s.p.y + size.h / 2, 11, true);
    } else if (e.lock && stage === "lock") mark(ctx, e.lock.x, e.lock.y, 6 + ((MISSILE_RUN - e.t) / MISSILE.lock) * 6);
    else if (e.lock && stage === "run" && e.t < MISSILE_RUN + 30) mark(ctx, e.lock.x, e.lock.y, 6);
    return;
  }
  const k = e.lock;
  if (!k) return;
  if (!(e.n > 0 || (e.cd > 0 && e.cd <= LOCK_FRAMES))) return;
  mark(ctx, k.x, k.y, 6 + (Math.max(0, e.cd) / LOCK_FRAMES) * 6);
}

export function drawSpaceEnemy(ctx: Ctx, e: Enemy, s: State, reduceMotion = false) {
  if (s.chapter < 21) drawLock(ctx, e, s);
  ctx.save();
  setHit(e.flash > 0);
  if (drawOuterActor(ctx, e, s, reduceMotion)) {
    /* Space 3's chapters 5 to 12 (stand-in art, space3-act2-art.ts). */
  } else if (drawCorvet(ctx, e, reduceMotion) || drawExcavator(ctx, e, reduceMotion) || drawWyrm(ctx, e, reduceMotion) || drawReclaimer(ctx, e, reduceMotion)) {
    /* Space 3's bosses draw themselves. */
  } else if (isBoss(e.type)) drawChapterBoss(ctx, e, s, reduceMotion);
  else if (e.type === "boulder") drawBoulder(ctx, e, reduceMotion);
  else if (drawSub(ctx, e, reduceMotion)) {
    /* Space 2's submarine, mostly under the water. */
  } else if (drawMini(ctx, e, reduceMotion)) {
    /* A Space 2 mini boss draws itself, its bar and its marks. */
  }
  else drawRegular(ctx, e, s, reduceMotion);
  setHit(false);
  drawFrozen(ctx, e, reduceMotion);
  /* Act 2 attack warnings are built into the machine art; legacy field overlays
     would reintroduce aim lines, rings, or marked lanes above the playfield. */
  if (s.chapter < 21) {
    drawAttackCue(ctx, e, s, reduceMotion);
    drawSignatureCue(ctx, e, s, reduceMotion);
    drawSecondCue(ctx, e, s, reduceMotion);
    drawCorvetCue(ctx, e, s);
    drawExcavatorCue(ctx, e, s);
    drawWyrmCue(ctx, e, s);
    drawReclaimerCue(ctx, e, s);
    drawArmsCue(ctx, e, s);
  }
  ctx.restore();
}

function drawRegular(ctx: Ctx, e: Enemy, s: State, reduceMotion: boolean) {
  if (drawVanguard(ctx, e, s, reduceMotion)) return;
  if (drawSecondEnemy(ctx, e, s, reduceMotion)) return;
  const { x, y, w, h } = e;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const t = reduceMotion ? 0 : e.t;
  const armed = e.cd > 0 && e.cd < LOCK_FRAMES;
  switch (e.type) {
    case "scout":
      flame(ctx, x + w - 1, cy, 4, 1.2, t);
      metal(ctx, [[x, cy], [x + 5, y + 3], [x + w, y], [x + w - 3, cy], [x + w, y + h], [x + 5, y + h - 3]], "#4c5666");
      metal(ctx, [[x, cy], [x + 6, cy - 1.7], [x + 6, cy + 1.7]], "#c2413a", { sheen: 0.1 });
      glass(ctx, [[x + 6, cy - 1.3], [x + 10, cy - 1], [x + 10, cy + 1], [x + 6, cy + 1.3]], "#f08a80");
      seam(ctx, [[x + 8, y + 2.6], [x + w - 3, cy - 1]]);
      seam(ctx, [[x + 8, y + h - 2.6], [x + w - 3, cy + 1]]);
      break;
    case "diver":
      flame(ctx, x + w - 2, cy, 5, 1.6, t);
      metal(ctx, [[x - 2, cy], [x + 7, y + 3], [x + w - 5, y], [x + w, y + 3], [x + w - 3, cy], [x + w, y + h - 3], [x + w - 5, y + h], [x + 7, y + h - 3]], "#b8662e");
      metal(ctx, [[x - 2, cy], [x + 4, cy - 1.4], [x + 4, cy + 1.4]], "#3c424d", { sheen: 0.1 });
      ctx.fillStyle = rgba(AMBER, 0.85);
      for (const px of [x + 8, x + 11.5]) {
        path(ctx, [[px, y + 3.4], [px + 1.6, y + 3], [px + 0.6, cy - 1.2], [px - 1, cy - 1.2]]);
        ctx.fill();
        path(ctx, [[px, y + h - 3.4], [px + 1.6, y + h - 3], [px + 0.6, cy + 1.2], [px - 1, cy + 1.2]]);
        ctx.fill();
      }
      break;
    case "wave":
      ellipse(ctx, cx, cy + 2.4, w / 2, 4.6, "#5d4d8e");
      ellipse(ctx, cx, cy + 3.4, w / 2 - 2, 2.4, "#3b3166", { sheen: 0 });
      glass(ctx, arcPts(cx, cy + 0.6, 4.6, 4.6, Math.PI, Math.PI * 2, 8), "#a5f3fc");
      for (let i = -2; i <= 2; i++) lamp(ctx, cx + i * 3.4, cy + 4.4, 0.7, i % 2 ? AMBER : "#f472b6", t % 24 < 12 || i % 2 === 0);
      break;
    case "rock":
    case "smallrock": {
      const spin = t / 90;
      const rot = (px: number, py: number) => [cx + px * Math.cos(spin) - py * Math.sin(spin), cy + px * Math.sin(spin) + py * Math.cos(spin)];
      const pts = Array.from({ length: 9 }, (_, i) => {
        const a = (i * Math.PI * 2) / 9;
        const r = (w / 2) * (0.78 + Math.abs(Math.sin(e.id * 7.3 + i * 2.1)) * 0.22);
        return rot(Math.cos(a) * r, Math.sin(a) * r * (h / w));
      });
      metal(ctx, pts, "#80848d", { light: 0.32, dark: 0.55, sheen: 0.08 });
      const craters = w > 15 ? 3 : 1;
      for (let k = 0; k < craters; k++) {
        const p = rot((Math.sin(e.id + k * 4) * w) / 4, (Math.cos(e.id * 2 + k * 3) * h) / 4);
        const r = (w > 15 ? 2.6 : 1.6) - k * 0.4;
        ctx.fillStyle = "rgb(20 22 28 / 0.45)";
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], r, r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgb(255 255 255 / 0.22)";
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, Math.PI * 0.9, Math.PI * 1.9);
        ctx.stroke();
      }
      break;
    }
    case "gunner":
    case "sniper": {
      const sn = e.type === "sniper";
      slab(ctx, x + 3, y + 2, w - 3, h - 4, 2.4, sn ? "#5b4b8f" : "#3d7a78");
      seam(ctx, [[x + 7, y + 4], [x + 7, y + h - 4]]);
      seam(ctx, [[x + w - 8, y + 4], [x + w - 8, y + h - 4]]);
      rivets(ctx, x + 5, y + 4.2, 3, 0, (h - 8.4) / 2);
      weapon(ctx, e, s, sn ? 16 : 9, sn ? 1.5 : 2.3);
      lamp(ctx, x + w - 5, cy, 1.6, sn ? "#c4b5fd" : "#7dd3e8", armed || e.d > 0);
      break;
    }
    case "mine":
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + t / 45;
        tube(ctx, cx + Math.cos(a) * 4.5, cy + Math.sin(a) * 4.5, cx + Math.cos(a) * 8.3, cy + Math.sin(a) * 8.3, 1, "#7b8696");
        lamp(ctx, cx + Math.cos(a) * 8.8, cy + Math.sin(a) * 8.8, 0.7, "#ff5a4d", (t + i * 5) % 30 < 15);
      }
      sphere(ctx, cx, cy, 5.5, "#323a47");
      lamp(ctx, cx, cy, 1.8, "#ff4d4d", t % 30 < 15);
      break;
    case "drone":
      for (const side of [-1, 1]) {
        tube(ctx, cx, cy - 1, cx + side * 6, cy - 4.5, 0.8, "#6b7482");
        ctx.fillStyle = "rgb(225 235 245 / 0.55)";
        ctx.beginPath();
        ctx.ellipse(cx + side * 6, cy - 4.5, 3.2, 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      sphere(ctx, cx, cy, 4, "#36604f");
      lamp(ctx, cx - 1.6, cy, 1.1, "#6ee7b7", true);
      break;
    case "turret": {
      const top = e.a === 0;
      slab(ctx, x - 3, top ? y - 5 : y + h - 3, w + 6, 7, 1.4, "#4b5565");
      rivets(ctx, x - 1.5, top ? y - 2 : y + h, 5, 4.4);
      weapon(ctx, e, s, 12, 2.5);
      break;
    }
    case "zigzag":
      metal(ctx, [[x, cy], [x + 5, y], [x + 9, cy - 1], [x + w, y + 1], [x + w - 3, cy + 2], [x + 9, y + h], [x + 6, cy + 2], [x + 2, y + h - 1]], "#6c922f");
      seam(ctx, [[x + 5, y + 1], [x + 7, cy]]);
      seam(ctx, [[x + 9, cy - 1], [x + 11, cy + 3]]);
      lamp(ctx, x + 3, cy, 0.9, "#ff7a3d", t % 20 < 10);
      break;
    case "armor":
      metal(ctx, [[x, cy], [x + 7, y], [x + w - 5, y + 3], [x + w, cy], [x + w - 5, y + h - 3], [x + 7, y + h]], "#566272");
      for (const side of [-1, 1]) metal(ctx, [[x + 3, cy + side * 2], [cx, cy + side * (h / 2 - 1)], [x + w - 3, cy + side * (h / 2 - 4)], [cx, cy + side * 5]], "#aab4c2");
      seam(ctx, [[x + 7, y + 1], [x + 9, y + h - 1]]);
      rivets(ctx, x + w - 6, y + 6, 3, 0, 5.5);
      lamp(ctx, cx, cy, 3, armed ? CORAL : "#fb923c", true);
      break;
    case "seeker": {
      ctx.translate(cx, cy);
      ctx.rotate(e.rot);
      /* A missile, nose where it is pointing. Its motor idles while it hangs and
         turns, sputters as the lock runs out, and burns long once it runs. */
      const stage = missileStage(e.t);
      const len =
        stage === "run"
          ? 4 + (torpedoSpeed(TORPEDO.eject + TORPEDO.ignite + e.t - MISSILE_RUN) / TORPEDO.top) * 5
          : stage === "lock"
            ? MISSILE_RUN - e.t < 12 && e.t % 3 !== 0 ? 3 : 0
            : stage === "track"
              ? 1.6
              : 0;
      if (len > 0) {
        ctx.save();
        ctx.scale(-1, 1);
        flame(ctx, 8, 0, len, 1.4, t);
        ctx.restore();
      }
      metal(ctx, [[-8, -2.6], [4, -2.6], [4, 2.6], [-8, 2.6]], "#a7b0be");
      metal(ctx, [[4, -2.6], [9, 0], [4, 2.6]], "#c2413a", { sheen: 0.1 });
      metal(ctx, [[-8, -2.6], [-11, -5.2], [-5, -2.6]], "#6b7482", { sheen: 0 });
      metal(ctx, [[-8, 2.6], [-11, 5.2], [-5, 2.6]], "#6b7482", { sheen: 0 });
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-2, -2.6, 1.6, 5.2);
      /* A red lamp blinks while it holds its lock. */
      if (stage === "lock" && Math.floor(e.t / 5) % 2 === 0) {
        ctx.fillStyle = CORAL;
        ctx.fillRect(1, -1.1, 2.2, 2.2);
      }
      break;
    }
    case "pod":
      slab(ctx, x, y + 2, w, h - 2, 2.2, "#3f857d");
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y + 2, w, h - 2, 2.2);
      ctx.clip();
      ctx.fillStyle = "rgb(250 204 21 / 0.9)";
      for (let i = -2; i < 6; i++) {
        path(ctx, [[x + i * 5, y + h], [x + i * 5 + 2.5, y + h], [x + i * 5 + 5.5, y + h - 2.6], [x + i * 5 + 3, y + h - 2.6]]);
        ctx.fill();
      }
      ctx.restore();
      slab(ctx, x + 4, y + 4, w - 8, h - 8, 1, "#102a2c", { sheen: 0 });
      glow(ctx, cx, cy + 0.5, 7, "#5eead4", 0.55);
      lamp(ctx, cx, cy + 0.5, 1.5, "#5eead4", true);
      tube(ctx, cx, y + 2, cx, y - 2.5, 0.7, "#8b95a3");
      lamp(ctx, cx, y - 3.2, 1.1, t % 24 < 12 ? AMBER : "#f97316", true);
      break;
    case "swarm":
      for (const side of [-1, 1]) {
        ctx.fillStyle = "rgb(204 251 241 / 0.7)";
        path(ctx, [[x + 3, cy], [x + 8, cy + side * (4 + Math.sin(t / 4))], [x + 7, cy]]);
        ctx.fill();
      }
      metal(ctx, [[x, cy], [x + w, y + 1], [x + w - 3, cy], [x + w, y + h - 1]], "#2f8f84");
      lamp(ctx, x + 2.5, cy, 0.7, "#fef08a", true);
      break;
    case "bomber":
      flame(ctx, x + w - 1, cy, 4, 1.6, t);
      slab(ctx, x + 2, y + 2, w - 2, h - 4, 3, "#86492a");
      slab(ctx, x + 8, y + h - 5.5, 10, 4.2, 1, "#2b2f38", { sheen: 0 });
      seam(ctx, [[x + 13, y + h - 5.5], [x + 13, y + h - 1.4]]);
      glass(ctx, [[x + 4, cy - 2.4], [x + 9, cy - 3], [x + 9, cy], [x + 4, cy]], "#fcd9a0");
      rivets(ctx, x + 11, y + 3.6, 5, 2.6);
      break;
    case "orbiter":
      for (let i = 0; i < 3; i++) {
        const a = t / 20 + (i * Math.PI * 2) / 3;
        tube(ctx, cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, cx + Math.cos(a) * 10.5, cy + Math.sin(a) * 10.5, 1.5, "#8b95a3");
        lamp(ctx, cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, 0.9, "#7dd3fc", true);
      }
      sphere(ctx, cx, cy, 6, "#27739f");
      lamp(ctx, cx, cy, 2.1, armed ? CORAL : "#bae6fd", true);
      break;
    case "splitter":
      slab(ctx, cx - 2, y + 3, 4, h - 6, 1, "#39414e");
      for (const side of [-1, 1]) {
        sphere(ctx, cx, cy + side * 5, 6, "#c02a73");
        lamp(ctx, cx - 2.2, cy + side * 5, 1.2, "#fde68a", true);
      }
      break;
    case "cruiser":
      flame(ctx, x + w, cy - 9, 7, 2.4, t);
      flame(ctx, x + w, cy + 9, 7, 2.4, t);
      metal(ctx, [[x, cy], [x + 12, y + 2], [x + w - 5, y], [x + w, y + 7], [x + w, y + h - 7], [x + w - 5, y + h], [x + 12, y + h - 2]], "#566173");
      metal(ctx, [[x + 14, y + 6], [x + w - 8, y + 4], [x + w - 8, y + h - 4], [x + 14, y + h - 6]], "#3e4756", { sheen: 0.08 });
      seam(ctx, [[x + 24, y + 3], [x + 24, y + h - 3]]);
      seam(ctx, [[x + 40, y + 2], [x + 40, y + h - 2]]);
      for (const side of [-1, 1]) {
        slab(ctx, x + 18, cy + side * 12 - 4, 23, 8, 2, BONE);
        slab(ctx, x + 7, cy + side * 12 - 1, 15, 2, 0.8, "#3a424e");
        rivets(ctx, x + 21, cy + side * 12 - 2.4, 6, 3, 0);
      }
      weapon(ctx, e, s, 12, 2.4, 0);
      weapon(ctx, e, s, 12, 2.4, 1);
      glass(ctx, [[x + 27, cy - 2], [x + 33, cy - 2.6], [x + 33, cy + 2.6], [x + 27, cy + 2]], "#fcd9a0");
      lamp(ctx, x + 13, cy, 3.6, armed ? CORAL : "#fb923c", true);
      break;
    case "shard":
      glow(ctx, cx, cy, 11, "#67e8f9", 0.35);
      metal(ctx, [[x - 2, cy], [cx, y - 2], [cx, y + h + 2]], "#9be7f2", { edge: "#0e5f73", sheen: 0.3 });
      metal(ctx, [[cx, y - 2], [x + w + 2, cy], [cx, y + h + 2]], "#46b9d2", { edge: "#0e5f73", sheen: 0.05 });
      lit(ctx, [[x, cy], [cx, y]], 0.7, 0.5);
      seam(ctx, [[cx, y - 1], [cx, y + h + 1]], 0.25);
      break;
    case "comet": {
      const g = ctx.createLinearGradient(cx, cy, cx + 40, cy);
      g.addColorStop(0, "rgb(255 160 60 / 0.9)");
      g.addColorStop(0.5, "rgb(255 90 30 / 0.45)");
      g.addColorStop(1, "rgb(255 60 20 / 0)");
      ctx.fillStyle = g;
      path(ctx, [[cx + 1, cy - 4.6], [cx + 40, cy - 0.4], [cx + 40, cy + 0.4], [cx + 3, cy + 4.6]]);
      ctx.fill();
      glow(ctx, cx, cy, 14, "#ff9a3d", 0.6);
      sphere(ctx, cx, cy, 5.2, "#8a4a2a");
      sphere(ctx, cx - 0.8, cy - 0.6, 3.2, "#ffb15c");
      lamp(ctx, cx - 1.4, cy - 1, 1.4, "#fff3c4", true);
      break;
    }
    case "fighter":
      for (const side of [-1, 1]) flame(ctx, x + w - 1, cy + side * 5, 4.5, 1.2, t);
      metal(ctx, [[x, cy], [x + 7, y + 2], [x + w, y - 2], [x + w - 4, cy], [x + w, y + h + 2], [x + 7, y + h - 2]], "#3b4351");
      metal(ctx, [[x + 6, cy], [x + 13, cy - 3], [x + 13, cy + 3]], "#b13a34", { sheen: 0.1 });
      glass(ctx, [[x + 8, cy - 1.2], [x + 12, cy - 1.6], [x + 12, cy + 1.6], [x + 8, cy + 1.2]], "#f4a39a");
      seam(ctx, [[x + 13, y + 1], [x + w - 4, cy - 1]]);
      lamp(ctx, x + w - 4, y + 1, 0.8, "#ff6a5a", t % 24 < 12);
      break;
    case "funnel":
      glow(ctx, cx, cy, 9, "#a78bfa", 0.5);
      metal(ctx, [[x - 2, cy], [cx, y - 2], [x + w, cy], [cx, y + h + 2]], "#6c55bd", { edge: "#2a1f5a" });
      seam(ctx, [[x + 1, cy], [x + w - 1, cy]], 0.4);
      lamp(ctx, x + 1, cy, 1.2, "#e9d5ff", true);
      break;
    case "tank":
      shadow(ctx, cx, y + h + 0.6, w / 2, 1.4);
      tracks(ctx, x, y + h - 7, w, 7, t);
      slab(ctx, x + 3, y + 5, w - 6, h - 11, 2, "#627240");
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 5, w - 6, h - 11, 2);
      ctx.clip();
      ctx.fillStyle = "rgb(40 50 25 / 0.55)";
      path(ctx, [[x + 8, y + 5], [x + 15, y + 5], [x + 12, y + 11], [x + 5, y + 11]]);
      ctx.fill();
      path(ctx, [[x + w - 12, y + 5], [x + w - 5, y + 5], [x + w - 8, y + 11]]);
      ctx.fill();
      ctx.restore();
      slab(ctx, x + 8, y, 12, 8, 2.2, "#586638");
      tube(ctx, x + w - 8, y + 5, x + w - 6, y - 2, 0.5, "#8b95a3");
      weapon(ctx, e, s, 14, 2);
      break;
    case "aagun":
      shadow(ctx, cx, y + h + 0.6, w / 2, 1.2);
      metal(ctx, [[x, y + h], [cx - 4, y + h - 8], [cx + 4, y + h - 8], [x + w, y + h]], "#5b6472");
      slab(ctx, cx - 5.5, y + 3, 11, 5.4, 1.4, "#596838");
      rivets(ctx, cx - 4, y + 5, 4, 2.7);
      weapon(ctx, e, s, 14, 1.4, 0, true);
      break;
    case "bunker":
      shadow(ctx, cx, y + h + 0.6, w / 2, 1.5);
      metal(ctx, [[x, y + h], [x + 4, y + 5], [x + w - 4, y + 2], [x + w, y + h]], "#9aa2ab", { sheen: 0.1 });
      seam(ctx, [[x + 3, y + 12], [x + w - 3, y + 11]], 0.3);
      slab(ctx, x + 6, y + 8, w - 12, 4, 1, "#1a1e26", { sheen: 0 });
      weapon(ctx, e, s, 8, 2.2);
      if (armed) glow(ctx, cx, y + 10, 10, CORAL, 0.6);
      ctx.fillStyle = armed ? CORAL : "#2d3440";
      ctx.fillRect(x + 8, y + 9, w - 16, 1.6);
      for (let i = 0; i < 5; i++) slab(ctx, x - 1 + i * 6.6, y + h - 4, 6.2, 3.6, 1.6, "#b19a6c");
      tube(ctx, x + w - 8, y + 4, x + w - 8, y - 6, 0.6, "#8b95a3");
      lamp(ctx, x + w - 8, y - 6.6, 1.1, t % 30 < 15 ? "#ff5a4d" : "#7a2a24", true);
      break;
    case "samsite":
      shadow(ctx, cx, y + h + 0.6, w / 2 + 1, 1.3);
      slab(ctx, x - 1, y + h - 7, w + 2, 5, 1.6, "#3a4250");
      for (const wx of [x + 3, x + 9, x + w - 3]) sphere(ctx, wx, y + h - 1.6, 2, "#1b1f27");
      slab(ctx, x + w - 8, y + h - 12, 7, 6, 1.2, "#5a6a3c");
      ctx.save();
      ctx.translate(x + 8, y + h - 8);
      ctx.rotate(-2);
      slab(ctx, -3, -4, 16, 8, 1.4, "#566336");
      for (const d of [-2, 2]) {
        slab(ctx, 0, d - 0.9, 12, 1.8, 0.8, "#dfe4ec", { sheen: 0.2 });
        metal(ctx, [[12, d - 0.9], [15, d], [12, d + 0.9]], armed ? "#fde047" : "#c2413a", { sheen: 0 });
      }
      ctx.restore();
      break;
    case "jet":
    case "airbomber": {
      const heavy = e.type === "airbomber";
      shadow(ctx, cx, cy + 12, w / 3, 1, 0.12);
      flame(ctx, x + w - 1, cy, heavy ? 6 : 8, heavy ? 1.6 : 1.4, t);
      metal(ctx, [[x + w - 9, cy - 2.6], [x + w - 3, cy - (heavy ? 12 : 9)], [x + w, cy - (heavy ? 12 : 9)], [x + w - 2.5, cy - 2.6]], "#6f7b8b");
      metal(ctx, [[x + w * 0.4, cy], [x + w * 0.72, cy], [x + w - 2, cy + (heavy ? 10 : 7)], [x + w * 0.55, cy + 6]], "#6d788a");
      metal(ctx, [[x, cy], [x + 9, cy - 2.8], [x + w - 3, cy - 2.8], [x + w, cy - 0.4], [x + w - 4, cy + 2.8], [x + 9, cy + 2.8]], heavy ? "#aab3bf" : "#97a3b2");
      metal(ctx, [[x, cy], [x + 6, cy - 1.8], [x + 6, cy + 1.8]], "#434b58", { sheen: 0.05 });
      glass(ctx, arcPts(x + 11, cy - 2.2, 3.2, 2.4, Math.PI, Math.PI * 2, 6), "#8ad8ee");
      seam(ctx, [[x + 14, cy - 2.6], [x + 14, cy + 2.6]]);
      lamp(ctx, x + w - 12, cy + 0.4, 0.9, "#dc2626", false);
      if (heavy) for (const dx of [14, 24]) {
        slab(ctx, x + dx, cy + 5, 6, 3.4, 1.4, "#454d5a");
        flame(ctx, x + dx + 6, cy + 6.7, 4, 1, t);
      }
      break;
    }
    case "gunship": {
      shadow(ctx, cx, cy + 11, w / 3, 1, 0.1);
      tube(ctx, cx + 5, cy, x + w + 1, cy - 2, 2.4, "#4a5a35");
      metal(ctx, [[x + w - 1, cy - 6], [x + w + 3, cy - 6], [x + w + 1.5, cy + 2], [x + w - 1, cy]], "#566638");
      ellipse(ctx, cx - 3, cy, 11, 6, "#5d6e3d");
      glass(ctx, arcPts(x + 6, cy, 5, 3.4, Math.PI * 0.8, Math.PI * 1.85, 6), "#8ad8ee");
      weapon(ctx, e, s, 9, 1.4);
      ctx.strokeStyle = "#2b3140";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x + 4, cy + 8);
      ctx.lineTo(x + 20, cy + 8);
      ctx.moveTo(x + 8, cy + 5.5);
      ctx.lineTo(x + 8, cy + 8);
      ctx.moveTo(x + 16, cy + 5.5);
      ctx.lineTo(x + 16, cy + 8);
      ctx.stroke();
      slab(ctx, x + 10, cy + 2.6, 7, 2.2, 1, "#3a4250");
      tube(ctx, cx - 3, cy - 5, cx - 3, y - 1.5, 1.1, "#3a4250");
      const rotor = reduceMotion ? 14 : 6 + Math.abs(Math.cos(e.t / 2)) * 11;
      ctx.fillStyle = "rgb(30 41 59 / 0.5)";
      ctx.beginPath();
      ctx.ellipse(cx - 3, y - 1.5, rotor + 1.5, 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgb(210 220 235 / 0.7)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(cx - 3 - rotor, y - 1.5);
      ctx.lineTo(cx - 3 + rotor, y - 1.5);
      ctx.stroke();
      break;
    }
    case "gunboat":
    case "destroyer": {
      const heavy = e.type === "destroyer";
      const wy = y + h;
      wake(ctx, x + w, wy, t);
      metal(ctx, [[x - 4, y + 4], [x + 6, wy], [x + w - 2, wy], [x + w, y + 3]], "#7d8896");
      ctx.fillStyle = "#9b3b36";
      ctx.fillRect(x + 6, wy - 3, w - 9, 2.4);
      seam(ctx, [[x - 1, y + 7], [x + w, y + 6.5]], 0.3);
      slab(ctx, x + w * 0.45, y - (heavy ? 7 : 3), w * 0.32, heavy ? 12 : 8, 1.4, BONE);
      for (let i = 0; i < (heavy ? 5 : 3); i++) {
        ctx.fillStyle = "rgb(125 211 232 / 0.85)";
        ctx.fillRect(x + w * 0.47 + i * 3.4, y - (heavy ? 4 : 1), 2, 1.4);
      }
      if (heavy) {
        slab(ctx, cx + 4, y - 11, 5, 4.5, 1, "#3a424e");
        tube(ctx, cx + 4, y - 8, cx + 4, y - 15, 0.6, "#a3acba");
        const ra = reduceMotion ? 0.5 : e.t * 0.12;
        tube(ctx, cx + 4 - Math.cos(ra) * 4.5, y - 14.5, cx + 4 + Math.cos(ra) * 4.5, y - 14.5, 0.5, "#cbd5e1");
      }
      weapon(ctx, e, s, heavy ? 14 : 12, 1.8);
      break;
    }
  }
  if (["cruiser", "destroyer"].includes(e.type)) {
    ctx.fillStyle = DEEP;
    ctx.fillRect(x + 3, y - 8, w - 6, 2);
    ctx.fillStyle = CORAL;
    ctx.fillRect(x + 3, y - 8, (w - 6) * Math.max(0, e.hp / e.maxHp), 2);
  }
  // A small lit muzzle is a readable wind-up for ordinary gun enemies too.
  if (e.cd > 0 && e.cd < 18 && e.n === 0 && ["gunner", "tank", "turret", "aagun", "armor", "bunker", "destroyer", "gunboat", "gunship", "cruiser", "wave", "jet", "fighter", "splitter", "funnel", "orbiter"].includes(e.type)) {
    const m = enemyMuzzle(e, s);
    lamp(ctx, m.x, m.y, 1.3, CREAM, true);
  }
}
