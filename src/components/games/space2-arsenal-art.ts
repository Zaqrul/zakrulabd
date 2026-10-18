/* Chapter 2's ordnance: ballistic bombs and one-turn, vertically launched rockets.
   Shared geometry makes the warning, the hatch and the projectile agree. */
import { HYDRA, hydraMuzzle, type Charge, type Enemy, type State } from "./space-logic";
import { machineKit, MACHINE } from "./space2-machine-art";

type Ctx = CanvasRenderingContext2D;
const c = MACHINE;

function target(ctx: Ctx, x: number, y: number, rocket: boolean, locked: boolean) {
  ctx.save(); ctx.strokeStyle = locked ? c.cream : c.hostile; ctx.lineWidth = 1;
  ctx.beginPath();
  if (rocket) { ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y); ctx.closePath(); }
  else ctx.arc(x, y, HYDRA.radius, 0, Math.PI * 2);
  ctx.stroke();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const r = rocket ? 9 : HYDRA.radius;
    ctx.beginPath(); ctx.moveTo(x + dx * (r - 2), y + dy * (r - 2)); ctx.lineTo(x + dx * (r + 3), y + dy * (r + 3)); ctx.stroke();
  }
  ctx.restore();
}

export function drawArsenalCue(ctx: Ctx, e: Enemy, reduceMotion: boolean): boolean {
  const a = e.attack;
  if (!a || !["deckbomb", "silorocket", "arsenalsalvo"].includes(a.kind)) return false;
  ctx.save();
  const warning = a.t < a.warn, locked = a.t >= a.warn - 18;
  if (a.kind === "arsenalsalvo" && a.gapY !== undefined) {
    ctx.strokeStyle = c.cream; ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    for (const y of [a.gapY - HYDRA.safeHalf, a.gapY + HYDRA.safeHalf]) {
      ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(190, y); ctx.stroke();
    }
    ctx.setLineDash([]);
    // The corridor has a shape cue, not just a different colour.
    for (const x of [18, 178]) {
      ctx.beginPath(); ctx.moveTo(x - 3, a.gapY - 3); ctx.lineTo(x, a.gapY); ctx.lineTo(x - 3, a.gapY + 3); ctx.stroke();
    }
  }
  if (warning) (a.spots ?? []).forEach((p, i) => {
    const rocket = a.kind === "silorocket";
    target(ctx, p.x, p.y, rocket, locked);
    const port = hydraMuzzle(e, rocket ? 2 - i : i);
    ctx.strokeStyle = locked ? c.cream : c.hostile; ctx.lineWidth = 0.7;
    ctx.setLineDash(reduceMotion ? [2, 5] : [3, 5]);
    ctx.beginPath(); ctx.moveTo(port.x, port.y);
    if (rocket) {
      const top = port.y - HYDRA.climb * HYDRA.launchSpeed;
      ctx.lineTo(port.x, top); ctx.lineTo(p.x, p.y);
    } else {
      for (let k = 1; k <= 20; k++) {
        const u = k / 20;
        ctx.lineTo(port.x + (p.x - port.x) * u, port.y + (p.y - port.y) * u - 4 * HYDRA.arc * u * (1 - u));
      }
    }
    ctx.stroke(); ctx.setLineDash([]);
  });
  ctx.restore(); return true;
}

export function drawDeckBomb(ctx: Ctx, charge: Charge, reduceMotion: boolean) {
  if (charge.t < 0) return;
  const active = charge.t >= HYDRA.fuse;
  target(ctx, charge.tx, charge.ty, false, charge.t >= HYDRA.flight);
  const m = machineKit(ctx, charge.x, charge.y);
  if (!active) {
    // A heavy round bomb has no rocket exhaust and remains recognisable in flight.
    m.disc(0, 0, 4.2, c.ink); m.disc(0, 0, 3.3, c.hull);
    m.box(-2.5, -0.7, 5, 1.4, c.cream); m.box(-0.8, -5, 1.6, 2, c.hostile);
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgb(251 146 60 / 0.3)"; ctx.strokeStyle = c.cream; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(charge.tx, charge.ty, HYDRA.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  const spin = reduceMotion ? 0 : (charge.t - HYDRA.fuse) * 0.04;
  const blast = machineKit(ctx, charge.tx, charge.ty);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7 + spin;
    blast.rod(Math.cos(a) * 4, Math.sin(a) * 4, Math.cos(a) * 12, Math.sin(a) * 12, 2, "#e9ad62");
  }
  blast.disc(0, 0, 6, c.cream); ctx.restore();
}

export function drawDeckRocket(ctx: Ctx, b: State["bullets"][number]) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
  const m = machineKit(ctx, 0, 0);
  // Ejected vertically; the ignition colour is distinct from the bomb's fuse.
  if ((b.retarget ?? 0) > HYDRA.climb - 6) m.disc(-6, 0, 1.4, c.metal);
  else m.poly([[-5, -1.1], [-10, 0], [-5, 1.1]], c.cream);
  m.poly([[-5, -1.6], [3, -1.6], [6, 0], [3, 1.6], [-5, 1.6]], c.steel);
  m.poly([[3, -1.6], [6, 0], [3, 1.6]], c.hostile);
  m.box(-1, -1.6, 1.3, 3.2, c.cream);
  m.poly([[-4, -1.5], [-6, -3.2], [-1.5, -1.5]], c.metal);
  m.poly([[-4, 1.5], [-6, 3.2], [-1.5, 1.5]], c.metal);
  ctx.restore();
}
