/* Space 2's field machines share the bosses' cast armour and hostile optics.
   Silhouettes identify roles at gameplay size; hardware detail belongs to the
   larger units. Physics, targeting and projectile origins remain authoritative. */
import { enemyMuzzle, missileMuzzle, MISSILE_RUN, type Enemy, type State } from "./space-logic";
import { tone } from "./space-material";
import { machineKit, MACHINE } from "./space2-machine-art";

type Ctx = CanvasRenderingContext2D;
export const SECOND_ENEMY_TYPES = [
  "scout", "wave", "diver", "gunner", "mine", "drone", "turret", "zigzag", "armor", "seeker",
  "swarm", "bomber", "sniper", "orbiter", "splitter", "cruiser", "fighter", "funnel",
  "tank", "aagun", "bunker", "samsite", "jet", "gunship", "airbomber", "gunboat", "destroyer",
] as const;
const supported = new Set<string>(SECOND_ENEMY_TYPES);

export function drawSecondEnemy(ctx: Ctx, e: Enemy, s: State, reduceMotion = false): boolean {
  if (s.chapter < 9 || !supported.has(e.type)) return false;
  const { x, y, w, h } = e, c = MACHINE;
  const t = reduceMotion ? 0 : e.t;
  // This is a readiness lamp, not an invented muzzle flash before a shot.
  const hot = e.lock || e.type === "sniper" && e.d > 0 ? "#fff1cc" : c.hostile;
  const m = machineKit(ctx, x, y);
  const poly = (points: number[][], fill: string) => m.poly(points.map(([px, py]) => [px * w, py * h]), fill);
  const box = (px: number, py: number, pw: number, ph: number, fill: string) => m.box(px * w, py * h, pw * w, ph * h, fill);
  const plate = (px: number, py: number, pw: number, ph: number, fill: string = c.hull) => m.plate(px * w, py * h, pw * w, ph * h, fill, 1);
  const disc = (px: number, py: number, r: number, fill: string, ry = r) => m.disc(px * w, py * h, r, fill, ry);
  const rod = (ax: number, ay: number, bx: number, by: number, width: number, fill: string) => m.rod(ax * w, ay * h, bx * w, by * h, width, fill);
  const eye = (px: number, py: number, pw = 0.2) => {
    box(px, py, pw, 0.12, c.ink);
    // A subpixel outlined rectangle loses its red fill at native game size.
    ctx.fillStyle = tone(hot);
    ctx.fillRect(x + (px + 0.025) * w, y + (py + 0.03) * h, Math.max(0.8, (pw - 0.05) * w), Math.max(0.65, h * 0.045));
  };
  const vents = (px: number, py: number, count = 3, height = h * 0.17) => m.vents(px * w, py * h, count, height, 2.2);
  const bolts = (px: number, py: number, count = 3) => m.bolts(px * w, py * h, count, Math.min(5, w * 0.13));
  const badge = (px: number, py: number) => { box(px, py, 0.12, 0.055, "#f59e0b"); };
  const exhaust = (px: number, py: number, size = 3) => {
    const xx = px * w, yy = py * h;
    m.poly([[xx, yy - 0.8], [xx + size + t % 3, yy], [xx, yy + 0.8]], c.cream);
  };
  const bearing = (px: number, py: number, r: number) => {
    disc(px, py, r, c.ink); disc(px, py, r - 0.7, c.metal); disc(px, py, Math.max(0.4, r - 1.6), c.dark);
  };
  const fan = (px: number, py: number, r: number) => {
    disc(px, py, r, c.hull); disc(px, py, r - 1, c.ink);
    for (let i = 0; i < 4; i++) {
      const a = t / 12 + i * Math.PI / 2;
      m.rod(px * w, py * h, px * w + Math.cos(a) * (r - 1.2), py * h + Math.sin(a) * (r - 1.2), 0.65, c.metal);
    }
    disc(px, py, 0.8, c.rust);
  };
  const gun = (slot = 0, length = 8, width = 1.5) => {
    const tip = enemyMuzzle(e, s, slot);
    const tx = tip.x - x, ty = tip.y - y;
    const bx = tx - Math.cos(tip.angle) * length, by = ty - Math.sin(tip.angle) * length;
    m.rod(bx, by, tx, ty, width, c.metal);
    m.rod(bx, by, tx - Math.cos(tip.angle) * length * 0.55, ty - Math.sin(tip.angle) * length * 0.55, width + 1, c.hull);
    m.disc(bx, by, width + 0.7, c.steel);
    m.rod(tx, ty, tx - Math.cos(tip.angle) * 1.2, ty - Math.sin(tip.angle) * 1.2, width + 0.5, c.ink);
  };
  const tracks = () => {
    plate(0.02, 0.65, 0.96, 0.32, c.dark);
    const count = w > 22 ? 5 : 4;
    for (let i = 0; i < count; i++) {
      const px = 0.12 + i * 0.76 / (count - 1);
      bearing(px, 0.81, 1.6);
    }
    box(0.12, 0.95, 0.76, 0.035, c.metal);
  };
  const damage = (px: number, py: number) => {
    const lost = 1 - Math.max(0, e.hp) / Math.max(1, e.maxHp);
    if (lost >= 0.35) {
      // Broken plate edges expose hardware before the smoke/fire threshold.
      m.poly([[px * w, py * h], [px * w + 4, py * h + 1], [px * w + 2, py * h + 4], [px * w + 5, py * h + 5], [px * w, py * h + 5]], c.ink);
      m.rod(px * w + 1, py * h + 2, px * w + 4, py * h + 4, 0.6, c.metal);
    }
    m.damage(px * w, py * h, lost, t);
  };

  ctx.save();
  switch (e.type) {
    case "scout":
      // Needle scout: one engine and narrow cropped stabilisers, no gun.
      poly([[0.18, 0.4], [0.58, 0.04], [0.9, 0.1], [0.7, 0.42], [0.97, 0.5], [0.7, 0.58], [0.9, 0.9], [0.58, 0.96], [0.18, 0.6]], c.steel);
      poly([[0, 0.5], [0.34, 0.31], [0.84, 0.4], [0.84, 0.6], [0.34, 0.69]], c.face);
      eye(0.26, 0.43); exhaust(0.86, 0.5); break;
    case "wave":
      // Crescent interceptor with a recessed fixed nose weapon.
      poly([[0.05, 0.15], [0.47, 0.06], [0.96, 0.18], [0.73, 0.38], [0.64, 0.5], [0.73, 0.62], [0.96, 0.82], [0.47, 0.94], [0.05, 0.85], [0.24, 0.5]], c.hull);
      plate(0.09, 0.31, 0.58, 0.38, c.steel); eye(0.21, 0.42, 0.23);
      box(0, 0.46, 0.18, 0.08, c.ink); exhaust(0.83, 0.2); exhaust(0.83, 0.8); break;
    case "diver":
      // Armoured ram nose, forked tail: reads as a collision attacker.
      poly([[0, 0.5], [0.23, 0.18], [0.5, 0.07], [0.44, 0.35], [0.98, 0.13], [0.8, 0.48], [0.98, 0.87], [0.44, 0.65], [0.5, 0.93], [0.23, 0.82]], c.steel);
      poly([[0, 0.5], [0.27, 0.28], [0.68, 0.41], [0.68, 0.59], [0.27, 0.72]], c.hull);
      poly([[0, 0.5], [0.2, 0.33], [0.2, 0.67]], c.metal); eye(0.29, 0.43); exhaust(0.7, 0.5); break;
    case "zigzag":
      // Tall knife fins and a short central fuselage.
      poly([[0.18, 0.47], [0.3, 0.02], [0.68, 0.08], [0.53, 0.43], [0.96, 0.34], [0.74, 0.54], [0.96, 0.91], [0.57, 0.98], [0.32, 0.61]], c.hull);
      plate(0.05, 0.34, 0.67, 0.33, c.steel); eye(0.18, 0.42); exhaust(0.75, 0.5); break;
    case "jet":
      // Long swept delta, a single bright intake and a slim engine pod.
      poly([[0, 0.5], [0.73, 0.02], [0.94, 0.07], [0.69, 0.4], [1, 0.5], [0.69, 0.6], [0.94, 0.93], [0.73, 0.98]], c.steel);
      poly([[0, 0.5], [0.39, 0.31], [0.89, 0.4], [0.89, 0.6], [0.39, 0.69]], c.hull);
      eye(0.31, 0.42, 0.18); exhaust(0.91, 0.5, 5); break;
    case "fighter":
      // Forward swept wings and two separate engine nacelles, central burst gun.
      for (const py of [0.04, 0.73]) {
        poly([[0.18, py + 0.08], [0.47, py], [0.8, py + 0.08], [0.97, py + 0.22], [0.53, py + 0.23]], c.hull);
        plate(0.69, py + 0.05, 0.26, 0.18, c.steel); exhaust(0.97, py + 0.14);
      }
      poly([[0, 0.5], [0.26, 0.28], [0.76, 0.34], [0.9, 0.5], [0.76, 0.66], [0.26, 0.72]], c.face);
      eye(0.24, 0.43); box(0, 0.47, 0.15, 0.06, c.ink); badge(0.56, 0.52); break;
    case "seeker": {
      // The missile points along its simulated heading, including its tracking stage.
      ctx.translate(x + w / 2, y + h / 2); ctx.rotate((e.rot ?? Math.PI) - Math.PI); ctx.translate(-x - w / 2, -y - h / 2);
      poly([[0, 0.5], [0.24, 0.19], [0.8, 0.22], [0.97, 0.03], [0.9, 0.5], [0.97, 0.97], [0.8, 0.78], [0.24, 0.81]], c.metal);
      plate(0.28, 0.24, 0.47, 0.52, c.hull); box(0.18, 0.35, 0.09, 0.3, hot);
      if (e.t >= MISSILE_RUN) exhaust(0.91, 0.5, 5); break;
    }
    case "gunship":
      // Two ducted lift fans, low cockpit and chin cannon.
      rod(0.55, 0.18, 0.55, 0.82, 2, c.metal);
      fan(0.64, 0.23, h * 0.23); fan(0.64, 0.77, h * 0.23);
      poly([[0.02, 0.5], [0.2, 0.24], [0.5, 0.27], [0.89, 0.4], [0.96, 0.66], [0.31, 0.78]], c.hull);
      plate(0.22, 0.31, 0.28, 0.34, c.face); eye(0.12, 0.4, 0.22);
      vents(0.6, 0.43, 3); gun(0, 8, 1.5); badge(0.46, 0.64); break;
    case "bomber":
      // Box-wing light bomber with a central belly door at the bomb origin.
      plate(0.32, 0.04, 0.53, 0.92, c.steel);
      poly([[0, 0.46], [0.21, 0.24], [0.83, 0.31], [0.97, 0.65], [0.68, 0.77], [0.18, 0.73]], c.hull);
      eye(0.14, 0.41, 0.18); vents(0.54, 0.34, 3);
      m.hatch(w * 0.35, h * 0.72, w * 0.3, h * 0.27, e.cd < 18 && s.p.y > y + h / 2);
      exhaust(0.88, 0.17); exhaust(0.88, 0.83); break;
    case "airbomber":
      // Broad flying wing, four engine intakes and a deep underslung bomb bay.
      poly([[0.02, 0.47], [0.29, 0.31], [0.5, 0.02], [0.94, 0.04], [0.8, 0.34], [1, 0.48], [0.8, 0.95], [0.46, 0.98], [0.28, 0.69]], c.steel);
      plate(0.13, 0.3, 0.65, 0.46, c.hull); eye(0.16, 0.41, 0.18);
      for (const py of [0.12, 0.7]) { plate(0.72, py, 0.22, 0.2, c.face); vents(0.76, py + 0.04, 2, 1.5); exhaust(0.96, py + 0.1, 4); }
      m.hatch(w * 0.36, h * 0.73, w * 0.29, h * 0.25, e.cd < 18 && s.p.y > y + h / 2);
      bolts(0.36, 0.57, 3); damage(0.53, 0.35); break;
    case "tank":
      tracks(); poly([[0.03, 0.65], [0.24, 0.32], [0.75, 0.32], [0.98, 0.67], [0.84, 0.78], [0.13, 0.78]], c.hull);
      plate(0.25, 0.07, 0.49, 0.35, c.face); eye(0.36, 0.2, 0.17);
      bolts(0.36, 0.59); vents(0.69, 0.46, 2, 2); gun(0, 14, 2);
      badge(0.37, 0.48); damage(0.63, 0.42); break;
    case "samsite": {
      // Low tracked launcher and the real fifteen-unit inclined launch tube.
      tracks(); plate(0.16, 0.46, 0.75, 0.31, c.hull);
      m.piston(w * 0.68, h * 0.63, 8, h - 7, 1);
      const tip = missileMuzzle(e), tx = tip.x - x, ty = tip.y - y;
      m.rod(8, h - 7, tx, ty, 5, c.steel);
      m.rod(8, h - 7, 8 + (tx - 8) * 0.6, h - 7 + (ty - h + 7) * 0.6, 6, c.hull);
      m.disc(tx, ty, 2.5, c.ink); m.disc(tx, ty, 1.2, hot);
      bearing(0.4, 0.62, 2); badge(0.69, 0.57); damage(0.64, 0.44); break;
    }
    case "bunker":
      // Low concrete footing and a thick sloped pillbox, not a mobile tank body.
      plate(0, 0.77, 1, 0.22, c.steel);
      poly([[0.06, 0.78], [0.2, 0.18], [0.72, 0.08], [0.96, 0.51], [0.92, 0.83]], c.hull);
      plate(0.27, 0.29, 0.53, 0.43, c.face); eye(0.31, 0.36, 0.35);
      bolts(0.31, 0.69, 4); vents(0.68, 0.55, 2, 2.4); gun(0, 8, 2.4);
      badge(0.49, 0.59); damage(0.69, 0.31); break;
    case "aagun":
      // Open pedestal and splayed outriggers leave a clearly visible air defence gun.
      poly([[0.03, 0.98], [0.19, 0.68], [0.35, 0.66], [0.28, 0.98]], c.steel);
      poly([[0.7, 0.98], [0.62, 0.66], [0.81, 0.66], [0.97, 0.98]], c.steel);
      plate(0.26, 0.56, 0.5, 0.28, c.hull); rod(0.5, 0.65, 0.5, 0.23, 3, c.metal);
      plate(0.27, 0.13, 0.45, 0.37, c.face); eye(0.45, 0.25, 0.14);
      gun(0, 14, 1.6); break;
    case "turret": {
      const ceiling = e.a === 0;
      // Mount plate is on the correct wall; its barrel keeps the simulation's angle.
      plate(0.05, ceiling ? 0.02 : 0.77, 0.9, 0.21, c.steel);
      plate(0.24, 0.24, 0.52, 0.51, c.hull);
      bearing(0.5, ceiling ? 0.7 : 0.3, 3);
      eye(0.35, 0.43, 0.3); gun(0, 12, 1.8); break;
    }
    case "gunboat":
      // Low fast patrol boat with exposed deck gun and a small aft wheelhouse.
      poly([[0, 0.47], [0.83, 0.44], [1, 0.69], [0.78, 0.97], [0.16, 0.97]], c.hull);
      poly([[0, 0.47], [0.83, 0.44], [0.74, 0.6], [0.18, 0.65]], c.bevel);
      plate(0.53, 0.15, 0.29, 0.38, c.steel); eye(0.56, 0.25, 0.2);
      rod(0.21, 0.23, 0.21, 0.53, 1.8, c.metal);
      bearing(0.21, 0.27, 2); gun(0, 12, 1.6); badge(0.5, 0.73); break;
    case "destroyer":
      // Multiple armour belts, layered bridge and a separate armoured bow turret.
      poly([[0, 0.5], [0.12, 0.35], [0.91, 0.39], [1, 0.65], [0.86, 0.98], [0.18, 0.98]], c.hull);
      poly([[0, 0.5], [0.12, 0.35], [0.91, 0.39], [0.83, 0.55], [0.2, 0.59]], c.bevel);
      plate(0.19, 0.63, 0.65, 0.24, c.steel); bolts(0.25, 0.78, 6);
      plate(0.47, 0.15, 0.34, 0.41, c.face); plate(0.57, 0.03, 0.2, 0.16, c.hull);
      eye(0.52, 0.23, 0.23); vents(0.53, 0.41, 5, 2.5);
      plate(0.2, 0.13, 0.22, 0.27, c.hull); gun(0, 12, 2.1);
      m.hatch(w * 0.44, 0, w * 0.12, h * 0.2, e.b % 190 > 80 && e.b % 190 < 110);
      badge(0.53, 0.67); damage(0.68, 0.5); damage(0.28, 0.63); break;
    case "gunner":
      // Floating gun carriage: square ammunition pack, small lift pods and one gun.
      for (const py of [0.13, 0.79]) { plate(0.47, py, 0.48, 0.13, c.steel); exhaust(0.96, py + 0.06); }
      plate(0.22, 0.14, 0.52, 0.72, c.hull); plate(0.57, 0.3, 0.33, 0.4, c.face);
      eye(0.25, 0.32, 0.22); vents(0.64, 0.42, 2); gun(0, 9, 1.8); break;
    case "armor":
      // Deep hexagonal shield cheeks around an inset gun, with side thrusters.
      for (const py of [0.09, 0.75]) { plate(0.57, py, 0.38, 0.16, c.steel); exhaust(0.97, py + 0.08); }
      poly([[0.02, 0.3], [0.28, 0.03], [0.71, 0.07], [0.89, 0.28], [0.89, 0.75], [0.71, 0.93], [0.28, 0.97], [0.02, 0.7]], c.hull);
      plate(0.09, 0.22, 0.31, 0.56, c.face); plate(0.48, 0.2, 0.3, 0.59, c.steel);
      eye(0.2, 0.33, 0.19); vents(0.55, 0.4, 3); bolts(0.27, 0.79, 3);
      gun(0, 9, 2.3); badge(0.49, 0.67); damage(0.61, 0.22); break;
    case "sniper":
      // Railgun is most of the profile; two separated recoil rails frame its lens.
      poly([[0.2, 0.42], [0.63, 0.04], [0.94, 0.13], [0.82, 0.4], [0.97, 0.5], [0.82, 0.6], [0.94, 0.87], [0.63, 0.96], [0.2, 0.58]], c.hull);
      plate(0.19, 0.28, 0.59, 0.44, c.steel); eye(0.43, 0.31, 0.18);
      gun(0, 16, 1.4); rod(0.15, 0.29, 0.68, 0.29, 0.8, c.metal); rod(0.15, 0.71, 0.68, 0.71, 0.8, c.metal);
      exhaust(0.86, 0.5); break;
    case "cruiser":
      // Heavy airborne battery: paired engines, two independent canonical turrets.
      for (const py of [0.05, 0.77]) {
        plate(0.3, py, 0.67, 0.18, c.steel); vents(0.68, py + 0.05, 5, 2);
        exhaust(0.98, py + 0.09, 5);
      }
      poly([[0, 0.44], [0.2, 0.19], [0.76, 0.2], [0.94, 0.36], [0.94, 0.64], [0.76, 0.8], [0.2, 0.81], [0, 0.56]], c.hull);
      plate(0.21, 0.28, 0.57, 0.44, c.face); eye(0.15, 0.39, 0.22);
      m.hatch(w * 0.03, h * 0.45, w * 0.17, h * 0.15, e.b % 210 > 80 && e.b % 210 < 110);
      plate(0.42, 0.05, 0.2, 0.21, c.hull); plate(0.42, 0.74, 0.2, 0.21, c.hull);
      gun(0, 12, 2.3); gun(1, 12, 2.3);
      vents(0.62, 0.4, 5, 4); bolts(0.32, 0.67, 6); badge(0.39, 0.55);
      damage(0.68, 0.3); damage(0.38, 0.65); break;
    case "mine":
      // Naval contact mine: six short horns around a welded spherical casing.
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        rod(0.5 + Math.cos(a) * 0.24, 0.5 + Math.sin(a) * 0.24, 0.5 + Math.cos(a) * 0.46, 0.5 + Math.sin(a) * 0.46, 1.6, c.metal);
      }
      disc(0.5, 0.5, Math.min(w, h) * 0.3, c.hull); disc(0.5, 0.5, 2.7, c.ink); disc(0.5, 0.5, 1.5, hot); break;
    case "drone":
      // Tiny pursuit drone: two short fan guards and a single hostile optic.
      poly([[0, 0.22], [0.42, 0.12], [0.77, 0.25], [1, 0.5], [0.77, 0.75], [0.42, 0.88], [0, 0.78], [0.19, 0.5]], c.steel);
      plate(0.17, 0.27, 0.55, 0.46, c.hull); disc(0.36, 0.5, 1.6, hot); exhaust(0.85, 0.5, 2); break;
    case "swarm":
      // Small arrowhead with two ram prongs; no gun housing or imitation lens cluster.
      poly([[0, 0.13], [0.41, 0.31], [0.97, 0.06], [0.74, 0.5], [0.97, 0.94], [0.41, 0.69], [0, 0.87], [0.15, 0.5]], c.hull);
      box(0.29, 0.4, 0.25, 0.2, hot); exhaust(0.75, 0.5, 2); break;
    case "funnel":
      // A satellite gun with an upright shield and one visible tracking barrel.
      poly([[0.43, 0], [0.91, 0.12], [0.78, 0.5], [0.91, 0.88], [0.43, 1], [0.21, 0.73], [0.21, 0.27]], c.steel);
      plate(0.25, 0.27, 0.49, 0.46, c.hull); eye(0.31, 0.32, 0.2); gun(0, 4, 1); break;
    case "orbiter":
      // Four hinged vanes around a radial gun hub, unlike the mine's contact horns.
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + t / 40, dx = Math.cos(a), dy = Math.sin(a);
        poly([[0.5 + dx * 0.16, 0.5 + dy * 0.16], [0.5 + dx * 0.46 - dy * 0.12, 0.5 + dy * 0.46 + dx * 0.12], [0.5 + dx * 0.46 + dy * 0.12, 0.5 + dy * 0.46 - dx * 0.12]], c.steel);
      }
      bearing(0.5, 0.5, 4.5); disc(0.5, 0.5, 2.2, hot);
      for (const [px, py] of [[0.24, 0.5], [0.76, 0.5], [0.5, 0.24], [0.5, 0.76]]) disc(px, py, 0.7, c.ink); break;
    case "splitter":
      // Two independently armoured halves and a bright fracture seam.
      poly([[0.05, 0.42], [0.24, 0.05], [0.75, 0.02], [0.96, 0.3], [0.74, 0.46], [0.3, 0.46]], c.hull);
      poly([[0.05, 0.58], [0.24, 0.95], [0.75, 0.98], [0.96, 0.7], [0.74, 0.54], [0.3, 0.54]], c.hull);
      plate(0.27, 0.1, 0.43, 0.26, c.steel); plate(0.27, 0.64, 0.43, 0.26, c.steel);
      box(0.29, 0.46, 0.46, 0.08, hot); gun(0, 6, 1.6); break;
  }
  if (e.type === "gunboat" || e.type === "destroyer") {
    ctx.strokeStyle = tone(c.metal); ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(x + w, y + h); ctx.lineTo(x + w + 5 + t % 3, y + h); ctx.stroke();
  }
  if (e.type === "cruiser" || e.type === "destroyer") {
    ctx.fillStyle = c.ink; ctx.fillRect(x + 3, y - 8, w - 6, 2);
    ctx.fillStyle = c.hostile; ctx.fillRect(x + 3, y - 8, (w - 6) * Math.max(0, Math.min(1, e.hp / Math.max(1, e.maxHp))), 2);
  }
  ctx.restore();
  return true;
}
