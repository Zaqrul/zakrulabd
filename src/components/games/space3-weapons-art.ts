/* Space 3's own shots and its Echo Wing, drawn with plain shapes until the designer replaces them. The Seed Bolt is a
   short gold-white needle, the Echo Wing's bolt the same in cyan, the Lance a wide white-hot bar with a violet edge. */
import { H, type Bullet, type State } from "./space-logic";
import { MODE, PUSH, echoPose } from "./space3-arsenal";
import { CHAIN, chainMultiplier } from "./space3-resonance";
import { drawThirdEcho } from "./space3-echo-art";

type Ctx = CanvasRenderingContext2D;

/* Wreckage: an irregular grey-violet plate that tumbles as it flies, its edge picked out so it reads as hostile.
   The shape comes from the plate's size and heading, and the tumble from where it is, so it needs no state. */
function drawScrap(ctx: Ctx, b: Bullet, reduceMotion: boolean): boolean {
  const spin = reduceMotion ? 0 : (b.x + b.y) * 0.09;
  const seed = Math.round(b.r * 10 + Math.abs(b.vy) * 7);
  const points = 6;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(spin + seed);
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2, jitter = 0.65 + ((Math.sin(seed * (i + 1.7)) + 1) / 2) * 0.55;
    const x = Math.cos(a) * b.r * 1.5 * jitter, y = Math.sin(a) * b.r * 1.5 * jitter;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#6b6785";
  ctx.fill();
  ctx.strokeStyle = "#fb7185";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
  return true;
}

export function drawSeedBullet(ctx: Ctx, b: Bullet, reduceMotion = false): boolean {
  if (b.kind === "scrap") return drawScrap(ctx, b, reduceMotion);
  if (b.kind !== "seed" && b.kind !== "echo" && b.kind !== "lance") return false;
  ctx.save();
  if (b.kind === "lance") {
    const length = 34;
    ctx.fillStyle = "rgb(167 139 250 / 0.55)";
    ctx.fillRect(b.x - length, b.y - b.r - 1.5, length, b.r * 2 + 3);
    ctx.fillStyle = "#fff1cc";
    ctx.fillRect(b.x - length, b.y - b.r * 0.55, length, b.r * 1.1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(b.x - 4, b.y - b.r * 0.8, 5, b.r * 1.6);
  } else {
    const echo = b.kind === "echo";
    ctx.fillStyle = echo ? "rgb(103 232 249 / 0.45)" : "rgb(251 207 51 / 0.45)";
    ctx.fillRect(b.x - 9, b.y - 1.1, 9, 2.2);
    ctx.fillStyle = echo ? "#cffafe" : "#fff1cc";
    ctx.fillRect(b.x - 5, b.y - 0.8, 6, 1.6);
    if (!reduceMotion) {
      ctx.fillStyle = echo ? "#67e8f9" : "#fbcf33";
      ctx.fillRect(b.x, b.y - 1, 1.6, 2);
    }
  }
  ctx.restore();
  return true;
}

/* The Echo Wing is the ship's own past, so it is the ship's own shape, a translucent cyan copy of it that fires where the
   ship fired. It is not Kite: Kite is a different ship (space3-kite-art.ts). */
export function drawEchoWing(ctx: Ctx, s: State, reduceMotion = false) {
  if (!s.res || s.phase !== "play") return;
  const pose = echoPose(s.res.trail);
  if (!pose) return;
  ctx.save();
  ctx.globalAlpha *= 0.48;
  drawThirdEcho(ctx, s, pose.x, pose.y, reduceMotion);
  if (pose.fire) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(pose.x + 6, pose.y - 0.8, 3, 1.6);
  }
  ctx.restore();
}

const MODE_LABEL = { wide: "WIDE", pierce: "PIERCE", rapid: "RAPID" } as const;
const MODE_COLOR = { wide: "#a3e635", pierce: "#22d3ee", rapid: "#fbbf24" } as const;

/* Above the meter: the Seed Bolt's mode and how long it has to run, and the graze chain while it lasts. */
export function drawModeTag(ctx: Ctx, s: State, font: string) {
  if (s.phase !== "play") return;
  ctx.save();
  ctx.font = `800 6px ${font}`;
  if (s.mode) {
    const share = Math.max(0, s.mode.t / MODE.frames);
    ctx.fillStyle = "rgb(7 12 28 / 0.75)";
    ctx.fillRect(6, H - 36, 44, 9);
    ctx.fillStyle = MODE_COLOR[s.mode.kind];
    ctx.fillRect(7, H - 28, 42 * share, 1.4);
    ctx.fillText(MODE_LABEL[s.mode.kind], 9, H - 30);
  }
  const r = s.res;
  if (r && r.chain >= 2) {
    const m = chainMultiplier(r), fade = Math.max(0.35, 1 - r.chainT / CHAIN.window);
    ctx.globalAlpha = fade;
    ctx.fillStyle = m >= CHAIN.max ? "#fbcf33" : "#e5e7eb";
    ctx.fillText(`CHAIN x${m.toFixed(2).replace(/0$/, "")}`, 56, H - 30);
  }
  ctx.restore();
}

/* The Kinetic Push: a repulsion shockwave that expands outwards from the ship,
   distorting space with a bright cyan/gold front, radiating energy ripples,
   and particle arcs that dissipate at the boundary. */
export function drawKineticWave(ctx: Ctx, s: State, reduceMotion = false) {
  const k = s.kinetic;
  if (!k) return;
  const share = k.t / PUSH.frames;
  const fade = Math.max(0, 1 - share);
  const radius = 10 + share * (PUSH.radius - 10);

  ctx.save();
  // Soft radial pulse glow expanding from the ship
  if (!reduceMotion && fade > 0.1) {
    const glow = ctx.createRadialGradient(k.x, k.y, Math.max(0, radius - 24), k.x, k.y, radius);
    glow.addColorStop(0, "rgba(103, 232, 249, 0)");
    glow.addColorStop(0.7, `rgba(103, 232, 249, ${0.12 * fade})`);
    glow.addColorStop(1, `rgba(251, 207, 51, ${0.22 * fade})`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(k.x, k.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main primary repulsion wave (electric cyan)
  ctx.globalAlpha = fade * 0.95;
  ctx.strokeStyle = "#67e8f9";
  ctx.lineWidth = 3.5 * fade + 0.8;
  ctx.beginPath();
  ctx.arc(k.x, k.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Sharp inner crest
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.2 * fade + 0.5;
  ctx.beginPath();
  ctx.arc(k.x, k.y, radius * 0.94, 0, Math.PI * 2);
  ctx.stroke();

  // Secondary trailing ripple & particle bursts
  if (!reduceMotion && radius > 20) {
    ctx.strokeStyle = "rgba(251, 207, 51, 0.75)";
    ctx.lineWidth = 1 * fade;
    ctx.beginPath();
    ctx.arc(k.x, k.y, radius * 0.82, 0, Math.PI * 2);
    ctx.stroke();

    // 8 radial energy spark arcs around the rim
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (k.t * 0.08);
      const r1 = radius * 0.92;
      const r2 = radius * 1.05;
      ctx.strokeStyle = i % 2 === 0 ? "#ccfbf1" : "#fef08a";
      ctx.beginPath();
      ctx.moveTo(k.x + Math.cos(a) * r1, k.y + Math.sin(a) * r1);
      ctx.lineTo(k.x + Math.cos(a) * r2, k.y + Math.sin(a) * r2);
      ctx.stroke();
    }
  }

  ctx.restore();
}
