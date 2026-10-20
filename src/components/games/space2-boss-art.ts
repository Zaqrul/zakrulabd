/* The eight bosses of Space 2, drawn in the same flat Canvas language as Space 1's: dark outline,
   bevelled plates, inset panels, hydraulic joints, a visible weapon opening for every attack and
   damage that shows by phase. Earth Force's machines are steel blue and olive, with an amber
   marking. Each is drawn in its own units (the size in SIZE) with its top left corner at (e.x, e.y);
   drawChapterBoss handles the scaling, as for Space 1's, and the barrels sit on the muzzles in
   BOSS_MUZZLE so the shots leave from what is drawn. */
import { HYDRA, beamMuzzle, enemyMuzzle, missileMuzzle, type Enemy, type State } from "./space-logic";
import { tone } from "./space-material";
import { machineKit, MACHINE } from "./space2-machine-art";
import { paintAtlasFortress } from "./space2-atlas-art";

type Ctx = CanvasRenderingContext2D;

const INK = "#1f262b";
const STEEL = "#8b97a3";
const CREAM = "#e5d8ad";
const AMBER = "#f59e0b";
const BLUE_FACE = "#64748b";

function kit(ctx: Ctx, e: Enemy, s: State, reduceMotion: boolean) {
  const { x, y } = e;
  const t = reduceMotion ? 0 : e.t;
  const a = e.attack;
  const warning = !!a && a.t < a.warn;
  const firing = !!a && a.t >= a.warn && a.t < a.warn + a.live;
  const hot = warning ? "#ffb665" : firing ? "#fff0c4" : "#d96948";
  const poly = (pts: number[][], colour: string, line = INK) => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py)));
    ctx.closePath();
    ctx.fillStyle = tone(colour);
    ctx.fill();
    ctx.strokeStyle = line;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };
  const box = (px: number, py: number, w: number, h: number, c: string) => poly([[px, py], [px + w, py], [px + w, py + h], [px, py + h]], c);
  const disc = (px: number, py: number, r: number, c: string, ry = r) => {
    ctx.beginPath();
    ctx.ellipse(x + px, y + py, r, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = tone(c);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };
  const rod = (px: number, py: number, qx: number, qy: number, width: number, c: string) => {
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + px, y + py);
    ctx.lineTo(x + qx, y + qy);
    ctx.strokeStyle = INK;
    ctx.lineWidth = width + 1.4;
    ctx.stroke();
    ctx.strokeStyle = tone(c);
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.lineCap = "butt";
  };
  const rivets = (px: number, py: number, n: number, gap = 6) => {
    for (let i = 0; i < n; i++) disc(px + i * gap, py, 0.7, CREAM);
  };
  /* A barrel on the muzzle for `slot`, aimed where the game will fire, with a flash while it fires. */
  const gun = (slot = 0, length = 14, width = 3, body = STEEL) => {
    const m = enemyMuzzle(e, s, slot);
    const mx = m.x - x;
    const my = m.y - y;
    const bx = mx - Math.cos(m.angle) * length;
    const by = my - Math.sin(m.angle) * length;
    rod(bx, by, mx, my, width, body);
    disc(bx, by, width + 1, BLUE_FACE);
    disc(mx, my, width * 0.55, warning ? hot : INK);
    const elapsed = a ? a.t - a.warn : -1;
    const pulse = a?.kind === "railshot" ? elapsed % 24 < 6 && elapsed % 3 < 2 : a?.kind === "broadside" ? elapsed % 32 < 3 : a?.kind === "lances" ? elapsed % 44 < 3 : a?.kind === "searchlight" ? elapsed % 26 < 3 : a?.kind === "cluster" ? elapsed < 66 && elapsed % 22 < 3 : a?.kind === "harpoon" ? elapsed < 3 || elapsed >= 28 && elapsed < 44 && elapsed % 4 < 2 : a && ["burst", "fan", "curtain"].includes(a.kind) && elapsed % 10 < 3;
    if (firing && pulse) {
      poly([[mx - Math.sin(m.angle) * 2, my + Math.cos(m.angle) * 2], [mx + Math.cos(m.angle) * 6, my + Math.sin(m.angle) * 6], [mx + Math.sin(m.angle) * 2, my - Math.cos(m.angle) * 2]], CREAM);
    }
  };
  const beam = (slot = 0) => {
    const m = beamMuzzle(e, slot);
    const mx = m.x - x;
    const my = m.y - y;
    box(mx, my - 3.5, 9, 7, "#5b6b78");
    box(mx - 1, my - 2.5, 3, 5, INK);
    const livePort = a?.kind === "beam" || e.type === "boss16" && a?.kind === "scissor";
    disc(mx, my, 1.5, livePort && (warning || firing) ? hot : "#e68d56");
  };
  const rack = (slot = 0) => {
    const m = missileMuzzle(e, slot);
    const mx = m.x - x;
    const my = m.y - y;
    const open = a?.kind === "missiles" && (warning || firing);
    const metal = machineKit(ctx, x, y);
    metal.plate(mx - 5, my - 4, 13, 8, MACHINE.dark, 1);
    for (let i = 0; i < 3; i++) disc(mx - 3 + i * 4, my, 1.3, open ? hot : INK);
    if (open) metal.plate(mx - 5, my - 8, 13, 2, MACHINE.face, 0.5);
    else {
      for (let i = 0; i < 3; i++) {
        metal.plate(mx - 4 + i * 4, my - 3, 3.4, 6, MACHINE.face, 0.4);
        box(mx - 3.1 + i * 4, my - 0.5, 1.4, 0.7, MACHINE.ink);
      }
    }
  };
  /* Scorches, then fire and smoke, as the phases go. */
  const damage = (px: number, py: number) => {
    if (e.a < 1) return;
    poly([[px, py], [px + 4, py + 2], [px + 2, py + 6], [px + 6, py + 9]], INK);
    if (e.a >= 2) {
      box(px + 8, py + 4, 8, 7, INK);
      const rise = t % 18;
      ctx.globalAlpha = 0.35;
      disc(px + 11, py - rise, 2 + rise / 7, "#79766b");
      ctx.globalAlpha = 1;
      poly([[px + 8, py + 7], [px + 10, py + 1 - (t % 3)], [px + 12, py + 5], [px + 14, py + 2], [px + 14, py + 7]], "#eda65a");
    }
  };
  /* The amber Earth Force mark. */
  const mark = (px: number, py: number) => {
    box(px, py, 7, 2.2, AMBER);
    box(px, py + 3.4, 7, 1.2, AMBER);
  };
  return { ctx, s, x, y, t, a, a0: e.a, reduceMotion, warning, firing, hot, poly, box, disc, rod, rivets, gun, beam, rack, damage, mark };
}

type Kit = ReturnType<typeof kit>;

/* Shared construction, not shared silhouettes: all heavy machines use the same
   cast armour, recessed hardware and hostile sensor colour as Atlas. */
function chapterMachine(k: Kit) {
  const m = machineKit(k.ctx, k.x, k.y);
  const c = MACHINE;
  const sensor = k.warning || k.firing ? k.hot : c.hostile;
  const bearing = (x: number, y: number, r: number) => {
    m.disc(x, y, r, c.ink); m.disc(x, y, r - 1, c.metal);
    m.disc(x, y, Math.max(0.6, r - 2), c.dark);
  };
  const scar = (x: number, y: number) => m.damage(x, y, k.a0 === 0 ? 0 : k.a0 === 1 ? 0.5 : 0.85, k.t);
  return { ...m, c, sensor, bearing, scar };
}

/* 1. Tidebreaker: low armoured destroyer, a huge rail cradle and a stacked bridge. */
function tidebreaker(k: Kit) {
  const m = chapterMachine(k), { c } = m;
  for (let i = 0; i < 5; i++) k.box(-6 - i * 4 + k.t % 4, 43 + i % 2, 6, 1, '#dbeafe');
  m.poly([[1, 32], [16, 28], [90, 28], [99, 35], [93, 46], [12, 47]], c.hull);
  m.poly([[2, 33], [16, 29], [90, 29], [94, 32], [19, 35]], c.bevel);
  m.poly([[12, 40], [95, 38], [92, 46], [14, 46]], c.dark);
  for (const x of [20, 42, 64, 84]) {
    m.plate(x, 35, 14, 8, c.steel, 1); m.bolts(x + 2, 39, 3, 4);
  }
  // Three parallel recoil cylinders support the primary railgun's pivot.
  for (const y of [19, 25, 30]) m.piston(17, y, 42, y + 1, 1.3);
  m.plate(18, 13, 29, 20, c.face, 4);
  m.plate(24, 16, 21, 12, c.hull, 2); m.vents(30, 19, 4, 5, 3);
  m.bearing(20, 23, 5.5);
  m.poly([[48, 30], [51, 12], [63, 7], [83, 8], [88, 30]], c.hull);
  m.plate(53, 10, 29, 11, c.face, 2);
  for (const x of [56, 63, 70]) { m.box(x, 14, 5, 3, c.ink); m.box(x + 1, 14.5, 3, 1, m.sensor); }
  m.plate(60, 2, 17, 7, c.hull, 2); m.vents(63, 4, 4, 2, 3);
  m.rod(74, 2, 74, 0, 1, c.metal);
  m.plate(54, 22, 24, 9, c.steel, 1); m.vents(58, 24, 6, 4, 2.5);
  m.hatch(84, 20, 12, 9, k.a0 >= 1);
  k.rack();
  m.plate(12, 2, 15, 12, c.hull, 2); m.plate(12, 32, 15, 10, c.hull, 2);
  k.gun(-1, 10, 2.2, c.metal); k.gun(1, 10, 2.2, c.metal); k.gun(0, 20, 4.2, c.metal);
  k.mark(59, 34);
  if (k.a0 >= 1) m.poly([[83, 10], [80, 15], [85, 19], [81, 25], [89, 28]], c.ink);
  if (k.a0 >= 2) { m.hatch(38, 33, 17, 10, true); m.piston(42, 34, 50, 29, 1); }
  m.scar(67, 24); m.scar(24, 36);
}

/* 2. Mangrove Hydra: a low river arsenal ship. Its three 'heads' are now
   below-deck magazines: deep bomb wells and vertical rocket cells, with split
   armoured covers. Every launch starts at the canonical HYDRA.bays opening. */
function hydra(k: Kit, e: Enemy) {
  const m = chapterMachine(k), { c } = m;
  const a = k.a;
  const active = a && ["deckbomb", "silorocket", "arsenalsalvo"].includes(a.kind);
  const elapsed = a ? a.t - a.warn : -1;
  const open = !active ? 0 : k.warning ? Math.min(1, a.t / 24) : k.firing ? 1 : Math.max(0, 1 - (elapsed - a.live) / 18);
  const rocket = a?.kind === "silorocket" || a?.kind === "arsenalsalvo";
  // Broad buoyant hull and an icebreaker-like ram bow, never exposed snake necks.
  m.poly([[0, 40], [14, 33], [104, 33], [115, 42], [104, 60], [17, 61], [7, 55]], c.hull);
  m.poly([[1, 40], [15, 34], [103, 34], [111, 39], [20, 43]], c.bevel);
  m.poly([[8, 47], [108, 44], [102, 59], [18, 59]], c.dark);
  m.poly([[2, 41], [16, 43], [23, 58], [15, 57]], c.steel);
  m.plate(25, 46, 58, 11, c.face, 2); m.bolts(29, 54, 10, 5);
  m.plate(86, 44, 20, 10, c.hull, 2); m.vents(90, 47, 5, 4, 2.6);
  // A compact rear island leaves the entire foredeck for the magazines.
  m.poly([[83, 35], [87, 10], [96, 5], [108, 9], [113, 35]], c.hull);
  m.plate(89, 11, 20, 11, c.face, 2);
  for (const x of [92, 99]) { m.box(x, 15, 5, 3, c.ink); m.box(x + 0.8, 15.5, 3.4, 1, m.sensor); }
  m.plate(88, 25, 22, 10, c.steel, 2); m.vents(92, 28, 5, 4, 2.8);
  m.plate(96, 2, 9, 5, c.hull, 1); m.rod(100, 2, 100, 0.5, 0.8, c.metal);
  // Feed trunks below the hatch are exposed progressively as the armour breaks.
  HYDRA.bays.forEach((bay, i) => {
    const x = bay.x, y = bay.y;
    m.plate(x - 9, 39, 18, 14, c.hull, 2);
    if (e.a > i) {
      m.box(x - 6, 42, 12, 9, c.ink);
      m.piston(x - 5, 43, x + 5, 49, 0.9);
      for (const yy of [44, 48]) { m.disc(x - 2, yy, 1.5, c.rust); m.box(x - 1, yy - 0.9, 5, 1.8, c.metal); }
    } else { m.bolts(x - 5, 49, 3, 5); m.box(x - 3, 43, 6, 1.2, c.steel); }
    // The opening is a dark well, not a turret mounted on top of the deck.
    m.plate(x - 9, y - 4, 18, 10, c.steel, 1.2);
    m.box(x - 6, y - 2, 12, 5, c.ink);
    m.disc(x, y, 4.6, c.dark, 2.5); m.disc(x, y, 2.5, c.ink, 1.4);
    if (open < 0.95) {
      const shift = open * 7;
      m.plate(x - 8 - shift, y - 3 - open * 5, 8, 7, c.face, 1);
      m.plate(x + shift, y - 3 - open * 5, 8, 7, c.face, 1);
    } else {
      m.poly([[x - 8, y + 2], [x - 14, y - 9], [x - 10, y - 13], [x - 5, y - 1]], c.hull);
      m.poly([[x + 8, y + 2], [x + 13, y - 9], [x + 10, y - 13], [x + 5, y - 1]], c.face);
      m.piston(x - 8, y + 3, x - 11, y - 7, 0.8); m.piston(x + 8, y + 3, x + 11, y - 7, 0.8);
      m.disc(x, y, 3, rocket ? c.rust : c.metal, 1.7);
      m.disc(x, y, 1.4, m.sensor, 0.8);
    }
    // An individual launch puff uses exactly the attack's launch schedule.
    const bombShot = a?.kind === "deckbomb" && elapsed >= 0 && elapsed % 24 < 3 && Math.floor(elapsed / 24) === i && i < (e.a === 0 ? 2 : 3);
    const rocketShot = a?.kind === "silorocket" && elapsed >= 0 && elapsed % 14 < 3 && 2 - Math.floor(elapsed / 14) % 3 === i && elapsed < (e.a >= 2 ? 5 : e.a >= 1 ? 4 : 3) * 14;
    const ultimateShot = a?.kind === "arsenalsalvo" && elapsed >= 0 && (elapsed < 96 && elapsed % 32 < 3 && Math.floor(elapsed / 32) === i || elapsed >= 9 && elapsed < 108 && (elapsed - 9) % 18 < 3 && 2 - Math.floor((elapsed - 9) / 18) % 3 === i);
    if (k.firing && (bombShot || rocketShot || ultimateShot)) {
      m.poly([[x - 3, y - 1], [x - 2, y - 7], [x, y - 4], [x + 2, y - 8], [x + 3, y - 1]], c.cream);
    }
    m.box(x - 4, 55, 8, 1, i === 2 ? c.hostile : c.rust);
  });
  k.mark(85, 38);
  m.scar(31, 45); if (e.a >= 2) m.damage(74, 42, 0.85, k.t);
  for (let i = 0; i < 4; i++) m.box(108 + i * 3 + k.t % 3, 60 + i % 2, 4, 0.7, c.metal);
}

/* 3. Wyvern: plated climbing chassis, articulated talons and turbine wing spars. */
function wyvern(k: Kit) {
  const m = chapterMachine(k), { c } = m;
  const lift = Math.sin(k.t / 14) * 2;
  m.poly([[28, 22], [42, 4 + lift], [60, 1 + lift], [67, 10], [49, 25]], c.hull);
  m.plate(42, 5 + lift, 19, 9, c.steel, 2); m.vents(46, 8 + lift, 4, 3, 3);
  m.piston(30, 25, 54, 9 + lift, 1.5);
  m.poly([[19, 24], [31, 18], [52, 20], [63, 31], [56, 41], [30, 41], [18, 34]], c.dark);
  m.plate(26, 22, 31, 16, c.face, 4); m.bolts(30, 26, 5, 5);
  if (k.a0 < 2) { m.plate(35, 28, 18, 11, c.hull, 2); m.vents(39, 31, 4, 4, 3); }
  else { m.box(35, 29, 18, 9, c.ink); m.piston(36, 32, 50, 34, 1.3); m.disc(45, 33, 2.2, m.sensor); }
  m.piston(29, 29, 12, 24, 2);
  m.plate(3, 17, 22, 15, c.steel, 3);
  m.plate(8, 17, 15, 6, c.face, 1); m.box(10, 20, 9, 1.7, m.sensor);
  k.gun(0, 12, 3.2, c.metal);
  for (const x of [31, 49]) {
    m.bearing(x, 38, 3.5); m.piston(x, 38, x - 3, 47, 1.4);
    m.rod(x - 3, 47, x - 8, 53, 2.5, c.metal);
    m.poly([[x - 9, 51], [x - 11, 55], [x - 4, 54], [x - 3, 50]], c.bevel);
  }
  m.piston(56, 35, 64, 46, 1.4); m.poly([[62, 43], [69, 49], [68, 54], [64, 49]], c.hull);
  // The near wing sheds its outer plate at the first phase change.
  m.piston(34, 30, 58, 46 - lift, 2);
  if (k.a0 === 0) {
    m.poly([[33, 28], [48, 32], [66, 43 - lift], [60, 51 - lift], [48, 46]], c.hull);
    m.plate(48, 38 - lift, 14, 9, c.face, 2); m.vents(52, 40 - lift, 3, 4, 2.5);
  } else { m.rod(38, 31, 62, 47 - lift, 2.5, c.metal); m.bearing(58, 44 - lift, 3); }
  k.mark(30, 24); m.scar(48, 27);
}

/* 4. Dune Maw: compact mining leviathan with serrated cutter and molting segments. */
function maw(k: Kit) {
  const m = chapterMachine(k), { c } = m;
  // Segment centres remain inside the 44-unit body, including their rear rims.
  for (let i = 3; i >= 0; i--) {
    const x = 22 + i * 5, radius = 10 - i * 1.4;
    m.disc(x, 19, radius, c.dark, 12 - i * 1.5);
    if (k.a0 < 2 || i % 2 === 0) {
      m.plate(x - 4, 9 + i, 8, 20 - i * 2, i % 2 ? c.hull : c.face, 2);
      m.bolts(x - 2, 13 + i, 2, 4);
    } else { m.piston(x - 4, 15, x + 4, 23, 1); }
  }
  m.disc(19, 19, 13, c.rust, 16); m.disc(19, 19, 10, c.ink, 13);
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5 + k.t / 22;
    const x = 19 + Math.cos(a) * 8, y = 19 + Math.sin(a) * 12;
    m.poly([[x - 2, y - 2], [x + 3, y], [x, y + 2.8]], c.metal);
  }
  m.poly([[0, 19], [13, 7], [23, 12], [23, 26], [13, 31]], c.steel);
  m.poly([[0, 19], [13, 7], [17, 10], [7, 20]], c.bevel);
  for (let i = 0; i < 3; i++) m.rod(7 + i * 4, 14 - i, 10 + i * 4, 26 - i, 1.2, c.dark);
  m.bearing(18, 19, 5); m.disc(18, 19, 2.5, m.sensor);
  k.gun(0, 9, 2.8, c.metal);
  if (k.a0 >= 1) { m.box(29, 15, 7, 9, c.ink); m.piston(30, 16, 35, 22, 1); }
  m.plate(24, 29, 13, 5, c.hull, 1); k.mark(27, 30); m.scar(27, 9);
}

/* 5. Iron Meridian: wedge locomotive and visibly coupled, individually armed cars. */
function meridian(k: Kit) {
  const m = chapterMachine(k), { c } = m;
  m.box(0, 54, 110, 1, c.metal);
  for (const x of [11, 24, 46, 59, 82, 98]) {
    m.bearing(x, 50, 4); m.disc(x, 50, 1.3, c.rust);
    m.rod(x, 50, x + Math.cos(k.t / 6) * 2.5, 50 + Math.sin(k.t / 6) * 2.5, 0.8, c.cream);
  }
  m.rod(6, 50, 29, 50, 1, c.metal);
  m.poly([[1, 44], [8, 23], [27, 16], [34, 27], [34, 46], [7, 47]], c.hull);
  m.poly([[2, 43], [9, 24], [25, 18], [24, 24], [10, 33]], c.bevel);
  m.plate(12, 25, 20, 20, c.face, 3); m.vents(17, 29, 4, 7, 3);
  m.plate(18, 14, 15, 10, c.hull, 2); m.box(21, 18, 8, 2, m.sensor);
  k.gun(0, 18, 4.2, c.metal); k.mark(16, 38);
  for (const [i, x] of [38, 74].entries()) {
    m.rod(x - 5, 43, x, 43, 3, c.metal);
    m.plate(x, 30, 32, 17, c.hull, 2);
    // Decoupling reveals structural frames instead of erasing the collision body.
    if (k.a0 >= i + 1) {
      m.box(x + 3, 34, 26, 9, c.ink); m.piston(x + 4, 35, x + 27, 42, 1.4);
      m.hatch(x + 19, 23, 10, 7, true);
    } else {
      m.plate(x + 3, 33, 26, 11, c.face, 2); m.vents(x + 7, 36, 5, 5, 3);
      m.bearing(x + 14, 28, 6);
      m.plate(x + 4, 18, 24, 12, c.steel, 3);
      m.gun(x - 1, 23, 15, 2.7, m.sensor);
    }
  }
  m.piston(82, 29, 82, 13, 1.6);
  k.rack(); m.scar(47, 34); m.scar(85, 32);
}

/* 6. Permafrost: an icebreaker hull under a recessed hangar and an armoured island. */
function permafrost(k: Kit) {
  const m = chapterMachine(k), { c } = m;
  for (let i = 0; i < 5; i++) k.box(-4 - i * 4 + k.t % 4, 48 + i % 2, 6, 1, '#e0f2fe');
  m.poly([[0, 40], [14, 29], [94, 29], [103, 39], [97, 53], [16, 55]], c.dark);
  m.poly([[1, 40], [14, 29], [35, 29], [24, 53], [16, 54]], c.metal);
  m.poly([[2, 40], [15, 31], [23, 31], [14, 44]], c.cream);
  m.plate(30, 31, 69, 10, c.steel, 2); m.bolts(34, 34, 10, 6);
  m.plate(30, 42, 65, 9, c.hull, 2); m.vents(68, 44, 7, 4, 3);
  // Drone launch door retracts as the carrier's hull is breached.
  m.hatch(33, 31, 25, 13, k.a0 >= 1);
  if (k.a0 >= 1) { m.box(37, 34, 17, 6, c.ink); m.box(39, 36, 13, 1, m.sensor); }
  m.poly([[58, 30], [61, 10], [76, 5], [94, 9], [98, 30]], c.hull);
  m.plate(64, 10, 28, 11, c.face, 2);
  for (const x of [67, 74, 81]) { m.box(x, 14, 5, 3, c.ink); m.box(x + 1, 14.5, 3, 1, m.sensor); }
  m.plate(66, 23, 27, 9, c.steel, 1); m.vents(70, 25, 6, 4, 3);
  m.rod(81, 7, 81, 1, 1.3, c.metal); m.plate(72, 0, 18, 4, c.hull, 1);
  m.plate(10, 18, 22, 15, c.face, 3); m.bearing(19, 26, 4.5);
  m.piston(22, 28, 31, 32, 1.2); k.gun(0, 18, 4, c.metal);
  m.plate(12, 34, 15, 10, c.hull, 2); k.gun(1, 12, 2.4, c.metal);
  m.hatch(36, 22, 16, 7, false); k.mark(66, 43);
  if (k.a0 >= 2) {
    m.poly([[55, 42], [60, 38], [65, 43], [62, 49], [65, 54], [54, 54]], c.ink);
    m.piston(56, 45, 62, 48, 1);
  }
  m.scar(83, 22); m.scar(39, 43);
}

/* 7. Cyclone: a flying turbine fortress; split shutters expose the storm generator. */
function cyclone(k: Kit) {
  const m = chapterMachine(k), { c } = m;
  // Large ducted fans have actual armoured rims and visible radial blades.
  for (const [x, y] of [[37, 9], [59, 40]]) {
    m.disc(x, y, 17, c.hull, 8); m.disc(x, y, 14, c.ink, 5.5);
    for (let i = 0; i < 8; i++) {
      const a = k.t / 12 + i * Math.PI / 4;
      m.rod(x, y, x + Math.cos(a) * 12, y + Math.sin(a) * 4.4, 1.4, c.metal);
    }
    m.disc(x, y, 3.2, c.rust, 2.3);
  }
  m.poly([[0, 26], [13, 15], [57, 14], [75, 21], [79, 31], [64, 39], [17, 39]], c.hull);
  m.poly([[2, 26], [14, 16], [56, 15], [69, 19], [29, 22]], c.bevel);
  m.plate(12, 23, 61, 12, c.steel, 3); m.bolts(19, 33, 9, 5.8);
  m.plate(59, 19, 16, 14, c.face, 2); m.vents(63, 22, 3, 7, 3);
  m.piston(27, 31, 36, 40, 1.3); m.piston(63, 32, 68, 39, 1.3);
  m.bearing(40, 25, 11); m.disc(40, 25, 8.5, c.ink);
  if (k.a0 === 0) {
    for (let i = 0; i < 4; i++) { m.plate(33, 17 + i * 4, 14, 3.8, c.face, 0.6); m.box(37, 18 + i * 4, 6, 0.8, c.hostile); }
  } else {
    m.disc(40, 25, 6.5, '#9b3540'); m.disc(40, 25, 4.4, m.sensor);
    m.plate(25, 16, 6, 17, c.hull, 1); m.plate(49, 16, 6, 17, c.hull, 1);
    const reach = k.a0 >= 2 ? 10 : 7;
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      m.rod(40 + Math.cos(a) * reach, 25 + Math.sin(a) * reach, 40 + Math.cos(a) * 4, 25 + Math.sin(a) * 4, 0.8, '#f6d88d');
    }
  }
  m.plate(6, 22, 17, 12, c.hull, 2); m.bearing(14, 26, 3.5);
  k.gun(0, 13, 3.5, c.metal); k.mark(56, 26); m.scar(61, 19);
  if (k.a0 >= 2) m.damage(23, 31, 0.85, k.t);
}

/* 8. Atlas: a walking execution fortress. Its head and chest split into the
   Judgement orbital-lance frame at phase three; the second silhouette replaces
   the mech instead of adding a small mast. All geometry stays in the 92×90 model
   so the enlarged simulation body, weapons and visible edges share one scale. */
function atlas(k: Kit, e: Enemy) {
  paintAtlasFortress(k.ctx,e,k.s,k.reduceMotion);
}

const DRAW: Record<number, (k: Kit, e: Enemy) => void> = { 9: tidebreaker, 10: hydra, 11: wyvern, 12: maw, 13: meridian, 14: permafrost, 15: cyclone, 16: atlas };

/* Draws one of Space 2's bosses at its own size; returns false for any other. */
export function drawSecondBoss(ctx: Ctx, e: Enemy, s: State, reduceMotion: boolean): boolean {
  const n = Number(e.type.slice(4));
  const paint = DRAW[n];
  if (!paint) return false;
  ctx.save();
  paint(kit(ctx, e, s, reduceMotion), e);
  ctx.restore();
  return true;
}
