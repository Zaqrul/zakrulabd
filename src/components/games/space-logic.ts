/* The rules, enemies and three chapters of the side-scrolling space shooter,
   kept apart from the screen so they can be run by a script. The ship flies in
   from the left and fires on its own; enemies come from the right, each kind
   moving and attacking in its own way, and every chapter ends with a boss built
   differently from the last. Supply pods carry weapons with their own ammunition
   (a machine gun, a spread, a piercing laser and homing rockets); when the ammo
   runs out the ship goes back to its blaster. */
export const W = 384;
export const H = 216;
export const PLAYER_W = 18;
export const PLAYER_H = 10;
export const MAX_HP = 5;
export const CHAPTERS = 3;

/* Extra health collects into levels. A heart picked up while the ship is already
   at full health counts toward the next level, and so does a gold heart, which
   also mends one point. Each level makes the ship bigger, a harder target, with
   one more point of health, and adds a rocket launcher that never runs out. */
export const MAX_LEVEL = 3;
export const LEVEL_AT = [0, 2, 4];
export const maxHpFor = (level: number) => MAX_HP + level - 1;
export const shipSize = (level: number) => ({
  w: PLAYER_W * (1 + 0.2 * (level - 1)),
  h: PLAYER_H * (1 + 0.2 * (level - 1)),
});

export type EType =
  | "scout" | "wave" | "rock" | "smallrock"
  | "diver" | "gunner" | "mine" | "drone"
  | "turret" | "zigzag" | "armor" | "seeker" | "pod"
  | "boss1" | "boss2" | "boss3";

export type Gun = "blaster" | "machine" | "spread" | "laser" | "rocket";

export type Enemy = {
  id: number;
  type: EType;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  t: number;
  cd: number;
  y0: number;
  flash: number;
  /* Frames left in which the boss does nothing, after a layer breaks. */
  stun: number;
  /* Scratch values: a flag, a counter or an angle, depending on the kind. For the
     last boss, `a` is how many layers are gone (0 to 3) and `rot` turns its spiral. */
  a: number;
  b: number;
  rot: number;
};

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  own: "p" | "e";
  dmg: number;
  kind: "pulse" | "orb" | "spiral" | "needle" | "mg" | "spread" | "laser" | "rocket";
  /* The ship's laser goes through what it hits, once each. */
  pierce?: boolean;
  hit?: number[];
  /* Frames before a shot of the ship's gives out. */
  life?: number;
};

export type Beam = { y: number; h: number; x0: number; t: number; warn: number; live: number };
export type PickupKind = "P" | "H" | "B" | "M" | "S" | "L" | "R" | "E";
export type Pickup = { x: number; y: number; kind: PickupKind; t: number };
export type Burst = { x: number; y: number; t: number; big: boolean };

export type Input = { mx: number; my: number; bomb: boolean };

export type Phase = "play" | "clear" | "dead" | "won";

export type Callout = "shield" | "armor" | "overload" | "levelup";

export type State = {
  chapter: number;
  phase: Phase;
  t: number;
  frame: number;
  seed: number;
  nextId: number;
  planIdx: number;
  p: {
    x: number;
    y: number;
    hp: number;
    inv: number;
    /* The blaster's power, 1 to 3; it stays when a special gun is picked up. */
    weapon: number;
    gun: Gun;
    ammo: number;
    bombs: number;
    cd: number;
    bombT: number;
    /* Ship level, extra health gathered so far, and the launchers' wait. */
    level: number;
    extra: number;
    launchCd: number;
  };
  enemies: Enemy[];
  bullets: Bullet[];
  beams: Beam[];
  pickups: Pickup[];
  bursts: Burst[];
  score: number;
  bossId: number;
  clearFor: number;
  banner: number;
  chapterStartScore: number;
  chapterStartWeapon: number;
  chapterStartLevel: number;
  chapterStartExtra: number;
  pickupIdx: number;
  bombFlash: number;
  shake: number;
  callout: { kind: Callout; t: number } | null;
};

type Plan = { t: number; type: EType; y: number; a?: number };

/* When each enemy turns up, in frames at 60 a second. The boss follows once the
   list has run out and the screen is nearly clear. */
function plan(chapter: number): Plan[] {
  const out: Plan[] = [];
  const add = (t: number, type: EType, y: number, a = 0) => out.push({ t, type, y, a });
  if (chapter === 1) {
    for (let k = 0; k < 6; k++) for (let i = 0; i < 3; i++) add(120 + k * 330 + i * 22, "scout", 40 + ((k * 41 + i * 6) % 130));
    for (const t of [650, 1050, 1450, 1850, 2250]) add(t, "wave", 104);
    for (const [t, y] of [[330, 60], [930, 160], [1530, 90], [2130, 150]] as const) add(t, "rock", y);
    for (const [t, y] of [[480, 120], [1500, 70]] as const) add(t, "pod", y);
  } else if (chapter === 2) {
    for (let k = 0; k < 9; k++) add(110 + k * 240, "diver", k % 2 === 0 ? 24 : H - 24);
    for (const [t, y] of [[520, 70], [1120, 150], [1720, 100], [2200, 60]] as const) add(t, "gunner", y);
    for (const [t, y] of [[300, 110], [800, 60], [1300, 160], [1900, 90], [2400, 130]] as const) add(t, "mine", y);
    for (const [t, y] of [[420, 140], [1300, 80], [2100, 120]] as const) add(t, "pod", y);
  } else {
    for (const t of [160, 660, 1160, 1660, 2160]) {
      add(t, "turret", 16, 0);
      add(t + 120, "turret", H - 16, 1);
    }
    for (const t of [320, 920, 1520, 2120]) for (let i = 0; i < 3; i++) add(t + i * 26, "zigzag", 60 + i * 40);
    for (const [t, y] of [[760, 108], [1560, 70], [2260, 140]] as const) add(t, "armor", y);
    for (const t of [1000, 1220, 1960, 2120]) add(t, "seeker", 40 + ((t * 7) % 140));
    for (const [t, y] of [[380, 100], [1250, 150], [2000, 70]] as const) add(t, "pod", y);
  }
  return out.sort((a, b) => a.t - b.t);
}

const PLANS: Plan[][] = [[], plan(1), plan(2), plan(3)];

/* Gold hearts drift in at these moments. Four of the five are needed for the top
   level, and hearts picked up at full health count as well. */
const PICKUP_PLANS: { t: number; y: number }[][] = [
  [],
  [{ t: 1250, y: 100 }],
  [{ t: 900, y: 150 }, { t: 1900, y: 70 }],
  [{ t: 800, y: 110 }, { t: 1800, y: 160 }],
];

const SIZE: Record<EType, [number, number, number]> = {
  /* width, height, hit points: the tougher the ship, the more it takes. */
  scout: [16, 12, 2],
  wave: [20, 14, 3],
  rock: [26, 24, 7],
  smallrock: [13, 12, 2],
  diver: [18, 12, 3],
  gunner: [22, 20, 5],
  mine: [16, 16, 3],
  drone: [10, 10, 2],
  turret: [20, 14, 5],
  zigzag: [16, 12, 3],
  armor: [32, 28, 12],
  seeker: [14, 7, 2],
  pod: [18, 14, 3],
  boss1: [74, 66, 150],
  boss2: [70, 74, 220],
  boss3: [96, 84, 330],
};

/* The last boss's three layers, by hit points left: the energy shield, then the
   armour, then the core, and a last stand when the core is nearly gone. */
export const SHIELD_END = 250;
export const ARMOR_END = 120;
export const OVERLOAD_AT = 40;

const SCORE: Record<EType, number> = {
  scout: 10, wave: 20, rock: 30, smallrock: 5, diver: 20, gunner: 40, mine: 25, drone: 5,
  turret: 40, zigzag: 25, armor: 80, seeker: 15, pod: 20, boss1: 800, boss2: 1500, boss3: 3500,
};

export const isBoss = (t: EType) => t === "boss1" || t === "boss2" || t === "boss3";

/* What each gun does: frames between shots, and how many shots a crate holds. */
export const GUNS: Record<Exclude<Gun, "blaster">, { cooldown: number; ammo: number }> = {
  machine: { cooldown: 4, ammo: 170 },
  spread: { cooldown: 19, ammo: 48 },
  laser: { cooldown: 3, ammo: 150 },
  rocket: { cooldown: 32, ammo: 18 },
};

export function createState(chapter = 1, score = 0, weapon = 1, level = 1, extra = 0): State {
  return {
    chapter,
    phase: "play",
    t: 0,
    frame: 0,
    seed: 1234567 + chapter * 977,
    nextId: 1,
    planIdx: 0,
    p: { x: 36, y: H / 2, hp: maxHpFor(level), inv: 0, weapon, gun: "blaster", ammo: 0, bombs: 2, cd: 0, bombT: 0, level, extra, launchCd: 0 },
    enemies: [],
    bullets: [],
    beams: [],
    pickups: [],
    bursts: [],
    score,
    bossId: 0,
    clearFor: 0,
    banner: 150,
    chapterStartScore: score,
    chapterStartWeapon: weapon,
    chapterStartLevel: level,
    chapterStartExtra: extra,
    pickupIdx: 0,
    bombFlash: 0,
    shake: 0,
    callout: null,
  };
}

/* The same chapter again from its start, after the ship is lost. */
export function retryChapter(s: State) {
  return createState(s.chapter, s.chapterStartScore, s.chapterStartWeapon, s.chapterStartLevel, s.chapterStartExtra);
}

export function nextChapter(s: State) {
  return createState(s.chapter + 1, s.score, s.p.weapon, s.p.level, s.p.extra);
}

/* A small seeded random number generator, so a run of the script is repeatable. */
function rand(s: State) {
  s.seed = (s.seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s.seed ^ (s.seed >>> 15), 1 | s.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Box = { x: number; y: number; w: number; h: number };
const hits = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function spawn(s: State, type: EType, x: number, y: number, a = 0): Enemy {
  const [w, h, hp] = SIZE[type];
  const e: Enemy = {
    id: s.nextId++, type, x, y, w, h, vx: -1.2, vy: 0, hp, maxHp: hp, t: 0,
    cd: 40 + Math.floor(rand(s) * 50), y0: y, flash: 0, stun: 0, a, b: 0, rot: 0,
  };
  switch (type) {
    case "scout": e.vx = -1.8; break;
    case "wave": e.vx = -1.3; break;
    case "rock": e.vx = -0.8; e.vy = (rand(s) - 0.5) * 0.3; break;
    case "smallrock": e.vx = -1.1; break;
    case "diver": e.vx = -2; break;
    case "gunner": e.vx = -1.5; break;
    case "mine": e.vx = -0.7; break;
    case "drone": e.vx = -1; break;
    case "turret": e.vx = -1; break;
    case "zigzag": e.vx = -2.2; e.vy = 1.6; break;
    case "armor": e.vx = -0.6; break;
    case "seeker": e.vx = -1.8; break;
    case "pod": e.vx = -0.9; break;
    case "boss1": case "boss2": case "boss3": e.vx = -1; e.cd = 90; break;
  }
  s.enemies.push(e);
  return e;
}

function shoot(s: State, x: number, y: number, vx: number, vy: number, kind: Bullet["kind"] = "orb", r = 2.6) {
  s.bullets.push({ x, y, vx, vy, r, own: "e", dmg: 1, kind });
}

/* A bullet aimed at where the ship is now. */
function aimed(s: State, e: Enemy, speed: number, spread = 0, kind: Bullet["kind"] = "orb") {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const dx = s.p.x + shipSize(s.p.level).w / 2 - cx;
  const dy = s.p.y + shipSize(s.p.level).h / 2 - cy;
  const base = Math.atan2(dy, dx) + spread;
  shoot(s, cx, cy, Math.cos(base) * speed, Math.sin(base) * speed, kind);
}

function burst(s: State, x: number, y: number, big = false) {
  s.bursts.push({ x, y, t: 0, big });
}

const GUN_CRATES: PickupKind[] = ["M", "S", "L", "R"];

function drop(s: State, e: Enemy) {
  const x = e.x + e.w / 2;
  const y = e.y + e.h / 2;
  if (isBoss(e.type)) {
    s.pickups.push({ x, y, kind: "H", t: 0 });
    return;
  }
  if (e.type === "pod") {
    /* A supply pod always holds a gun. */
    s.pickups.push({ x, y, kind: GUN_CRATES[Math.floor(rand(s) * GUN_CRATES.length)], t: 0 });
    return;
  }
  const r = rand(s);
  if (r < 0.12) s.pickups.push({ x, y, kind: "P", t: 0 });
  else if (r < 0.2) s.pickups.push({ x, y, kind: "H", t: 0 });
  else if (r < 0.25) s.pickups.push({ x, y, kind: "B", t: 0 });
  else if (r < 0.29) s.pickups.push({ x, y, kind: GUN_CRATES[Math.floor(rand(s) * GUN_CRATES.length)], t: 0 });
}

function kill(s: State, e: Enemy) {
  s.score += SCORE[e.type];
  burst(s, e.x + e.w / 2, e.y + e.h / 2, isBoss(e.type) || e.type === "armor" || e.type === "rock");
  if (e.type === "rock") {
    const a = spawn(s, "smallrock", e.x, e.y - 6);
    const b = spawn(s, "smallrock", e.x, e.y + 8);
    a.vy = -0.9;
    b.vy = 0.9;
  }
  if (e.type === "mine") {
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      shoot(s, e.x + e.w / 2, e.y + e.h / 2, Math.cos(ang) * 1.4, Math.sin(ang) * 1.4, "orb", 2.2);
    }
  }
  drop(s, e);
  if (isBoss(e.type)) {
    s.bullets = s.bullets.filter((b) => b.own === "p");
    s.beams = [];
    s.shake = 40;
    for (let i = 0; i < 7; i++) burst(s, e.x + rand(s) * e.w, e.y + rand(s) * e.h, true);
  }
}

/* One more point of extra health; enough of it makes the ship a level bigger. */
function addExtra(s: State) {
  const p = s.p;
  p.extra += 1;
  while (p.level < MAX_LEVEL && p.extra >= LEVEL_AT[p.level]) {
    p.level += 1;
    p.hp = maxHpFor(p.level);
    p.inv = Math.max(p.inv, 60);
    s.shake = 18;
    s.bombFlash = 6;
    setCallout(s, "levelup");
    burst(s, p.x + shipSize(p.level).w / 2, p.y + shipSize(p.level).h / 2, true);
  }
}

function hurtPlayer(s: State) {
  if (s.p.inv > 0 || s.phase !== "play") return;
  s.p.hp -= 1;
  s.p.inv = 100;
  s.p.weapon = Math.max(1, s.p.weapon - 1);
  burst(s, s.p.x + shipSize(s.p.level).w / 2, s.p.y + shipSize(s.p.level).h / 2, false);
  if (s.p.hp <= 0) s.phase = "dead";
}

/* A blast: everything near the point takes damage, the boss included. */
function explode(s: State, x: number, y: number, radius: number, dmg: number, except = 0) {
  burst(s, x, y, true);
  for (const e of s.enemies) {
    if (e.id === except) continue;
    const reach = radius + Math.max(e.w, e.h) / 2;
    if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < reach) {
      e.hp -= dmg;
      e.flash = 4;
    }
  }
}

function updateEnemy(s: State, e: Enemy) {
  e.t += 1;
  if (e.flash > 0) e.flash -= 1;
  const p = s.p;
  const py = p.y + shipSize(s.p.level).h / 2;

  switch (e.type) {
    case "scout":
    case "smallrock":
    case "rock":
    case "pod":
      e.x += e.vx;
      e.y += e.vy;
      if (e.type === "pod") e.y = e.y0 + Math.sin(e.t / 24) * 10;
      break;
    case "wave":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 22) * 34;
      if (--e.cd <= 0 && e.x < W - 20) {
        shoot(s, e.x, e.y + e.h / 2, -2.4, 0);
        e.cd = 100;
      }
      break;
    case "diver":
      e.x += e.vx;
      if (e.a === 0 && e.x < 300) {
        e.a = 1;
        const frames = Math.max(20, (e.x - p.x) / Math.abs(e.vx));
        e.vy = (py - (e.y + e.h / 2)) / frames;
      }
      e.y += e.vy;
      break;
    case "gunner":
      if (e.x > 290 && e.b === 0) e.x += e.vx;
      else {
        e.b = 1;
        e.y = clamp(e.y + Math.cos(e.t / 30) * 0.8, 12, H - 12 - e.h);
        if (--e.cd <= 0) {
          aimed(s, e, 2.1);
          e.cd = 75;
        }
        if (e.t > 640) e.x -= 1.6;
      }
      break;
    case "mine":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 25) * 14;
      break;
    case "drone":
      e.x += e.vx;
      e.y += clamp((py - (e.y + e.h / 2)) * 0.03, -0.7, 0.7);
      break;
    case "turret":
      e.x += e.vx;
      if (--e.cd <= 0 && e.x > 50 && e.x < W - 16) {
        aimed(s, e, 2, 0, "needle");
        e.cd = 100;
      }
      break;
    case "zigzag":
      e.x += e.vx;
      if (e.t % 28 === 0) e.vy = -e.vy;
      e.y = clamp(e.y + e.vy, 12, H - 12 - e.h);
      break;
    case "armor":
      e.x += e.vx;
      if (--e.cd <= 0 && e.x < W - 30) {
        for (const sp of [-0.35, 0, 0.35]) aimed(s, e, 1.9, sp);
        e.cd = 110;
      }
      break;
    case "seeker": {
      /* Steers toward the ship, a little at a time. */
      const cx = e.x + e.w / 2;
      const cy = e.y + e.h / 2;
      const want = Math.atan2(p.y + shipSize(s.p.level).h / 2 - cy, p.x + shipSize(s.p.level).w / 2 - cx);
      let ang = Math.atan2(e.vy, e.vx);
      let d = want - ang;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      ang += clamp(d, -0.045, 0.045);
      e.vx = Math.cos(ang) * 1.8;
      e.vy = Math.sin(ang) * 1.8;
      e.x += e.vx;
      e.y += e.vy;
      /* A missile that has missed for seven seconds just burns out. */
      if (e.t > 420) e.x = -200;
      break;
    }
    case "boss1":
      updateBoss1(s, e);
      break;
    case "boss2":
      updateBoss2(s, e);
      break;
    case "boss3":
      updateBoss3(s, e);
      break;
  }
}

const enterX = (e: Enemy, target: number) => {
  if (e.x > target) {
    e.x += e.vx;
    return false;
  }
  return true;
};

/* Chapter one: a crab. It sweeps up and down, throws a fan of shots, and now and
   then holds its claws out and rakes the screen with a stream. Hurt, it speeds up. */
function updateBoss1(s: State, e: Enemy) {
  if (!enterX(e, W - 90)) return;
  const ratio = e.hp / e.maxHp;
  e.b += 1;
  e.y = H / 2 - e.h / 2 + Math.sin(e.b / (ratio < 0.5 ? 38 : 52)) * (H / 2 - e.h / 2 - 14);
  const cx = e.x;
  const cy = e.y + e.h / 2;
  if (--e.cd <= 0) {
    for (let i = -2; i <= 2; i++) {
      const ang = Math.PI + i * 0.2;
      shoot(s, cx, cy, Math.cos(ang) * 2, Math.sin(ang) * 2);
    }
    e.cd = ratio < 0.5 ? 62 : 92;
  }
  /* The claw stream: a burst of fast shots from the two claw tips. */
  if (e.b % (ratio < 0.5 ? 170 : 240) < 36 && e.b % 6 === 0) {
    const side = Math.floor(e.b / 6) % 2 === 0 ? -1 : 1;
    shoot(s, cx - 4, cy + side * 24, -3.1, 0, "needle", 2.2);
  }
}

/* Chapter two: a jellyfish. Slow, with a spiral of shots wheeling out from its
   body, and drones released from underneath that hunt the ship. */
function updateBoss2(s: State, e: Enemy) {
  if (!enterX(e, W - 86)) return;
  const ratio = e.hp / e.maxHp;
  e.b += 1;
  e.y = H / 2 - e.h / 2 + Math.sin(e.b / 70) * 52;
  const cx = e.x + 8;
  const cy = e.y + e.h / 2;
  const every = ratio < 0.5 ? 5 : 7;
  if (e.b % every === 0) {
    const sway = Math.sin(e.b / 33) * 1.05;
    shoot(s, cx, cy, Math.cos(Math.PI + sway) * 1.7, Math.sin(Math.PI + sway) * 1.7, "spiral", 2.4);
    shoot(s, cx, cy, Math.cos(Math.PI - sway) * 1.7, Math.sin(Math.PI - sway) * 1.7, "spiral", 2.4);
  }
  if (e.b % (ratio < 0.5 ? 230 : 300) === 120) {
    for (const off of [-22, 22]) {
      const d = spawn(s, "drone", e.x, e.y + e.h / 2 + off);
      d.vx = -1.3;
    }
  }
}

function setCallout(s: State, kind: Callout) {
  s.callout = { kind, t: 150 };
}

/* A layer of the last boss breaks: its shots are wiped, it goes quiet for a
   moment, and the next layer starts with a different set of attacks. */
function layerBreak(s: State, e: Enemy, kind: Callout) {
  s.bullets = s.bullets.filter((b) => b.own === "p");
  s.beams = [];
  s.shake = 36;
  s.bombFlash = 8;
  e.stun = 70;
  setCallout(s, kind);
  for (let i = 0; i < 9; i++) burst(s, e.x + rand(s) * e.w, e.y + rand(s) * e.h, true);
}

/* Chapter three: a warship, in four stages by what is left of it.
   One, an energy shield: aimed shots and a beam.
   Two, the armour: spreads, homing missiles and the beam, faster.
   Three, the core: a swaying spiral on top of all that.
   Four, when the core is nearly gone, it overloads: a wheel of shots in six arms,
   three beams marked at once, missiles in pairs, and walls of shots with two
   gaps to fly through. It is meant to be too much; the gaps are always there. */
function updateBoss3(s: State, e: Enemy) {
  if (!enterX(e, W - 104)) return;
  e.b += 1;

  if (e.a === 0 && e.hp <= SHIELD_END) {
    e.a = 1;
    layerBreak(s, e, "shield");
  }
  if (e.a === 1 && e.hp <= ARMOR_END) {
    e.a = 2;
    layerBreak(s, e, "armor");
  }
  if (e.a === 2 && e.hp <= OVERLOAD_AT) {
    e.a = 3;
    layerBreak(s, e, "overload");
    /* Help for the last stand drifts in: two hearts, a bomb and a laser. */
    s.pickups.push(
      { x: W - 20, y: 40, kind: "H", t: 0 },
      { x: W - 20, y: H - 40, kind: "H", t: 0 },
      { x: W - 20, y: H / 2 + 28, kind: "B", t: 0 },
      { x: W - 20, y: H / 2 - 28, kind: "L", t: 0 },
    );
    e.cd = 60;
  }
  if (e.stun > 0) {
    e.stun -= 1;
    return;
  }

  const layer = e.a;
  const speed = layer === 0 ? 80 : layer === 1 ? 62 : layer === 2 ? 52 : 40;
  e.y = H / 2 - e.h / 2 + Math.sin(e.b / speed) * (H / 2 - e.h / 2 - 12);
  const cx = e.x;
  const cy = e.y + e.h / 2;
  const py = clamp(s.p.y + shipSize(s.p.level).h / 2, 16, H - 16);

  if (layer < 3) {
    const beamEvery = layer === 0 ? 280 : layer === 1 ? 330 : 240;
    if (e.b % beamEvery === 60) s.beams.push({ y: py, h: 22, x0: e.x, t: 0, warn: 62, live: 36 });
    if (--e.cd <= 0) {
      if (layer === 0) aimed(s, e, 2.2);
      else for (const sp of [-0.3, 0, 0.3]) aimed(s, e, 2.1, sp);
      e.cd = layer === 0 ? 100 : 85;
    }
    if (layer >= 1 && e.b % 170 === 90) {
      const m = spawn(s, "seeker", e.x, cy);
      m.vx = -1.5;
    }
    if (layer === 2 && e.b % 7 === 0) {
      const ang = Math.PI + Math.sin(e.b / 30) * 1.1;
      shoot(s, cx, cy, Math.cos(ang) * 1.6, Math.sin(ang) * 1.6, "spiral", 2.3);
    }
    return;
  }

  /* The last stand. */
  if (e.b % 6 === 0) {
    e.rot += 0.16;
    for (let k = 0; k < 6; k++) {
      const ang = e.rot + (k * Math.PI) / 3;
      shoot(s, cx, cy, Math.cos(ang) * 1.45, Math.sin(ang) * 1.45, "spiral", 2.2);
    }
  }
  if (e.b % 170 === 40) {
    for (const off of [0, -58, 58]) {
      s.beams.push({ y: clamp(py + off, 16, H - 16), h: 20, x0: e.x, t: 0, warn: 72, live: 34 });
    }
  }
  if (e.b % 120 === 70) {
    for (const off of [-16, 16]) {
      const m = spawn(s, "seeker", e.x, cy + off);
      m.vx = -1.5;
    }
  }
  if (e.b % 210 === 130) {
    const rows = 10;
    const gap = Math.floor(rand(s) * (rows - 2));
    for (let i = 0; i < rows; i++) {
      if (i === gap || i === gap + 1) continue;
      shoot(s, cx, 12 + (i * (H - 24)) / (rows - 1), -1.7, 0, "orb", 2.4);
    }
  }
}

/* Whether there is something in front of the ship for a special gun to hit. Its
   ammunition is limited, so it is only spent when a shot would find a target:
   straight guns need a ship in their line, the spread one a ship inside its fan,
   and the rockets, which turn, anything ahead on the screen. */
function hasTarget(s: State, gun: Exclude<Gun, "blaster">) {
  const p = s.p;
  const fx = p.x + shipSize(s.p.level).w;
  const fy = p.y + shipSize(s.p.level).h / 2;
  for (const e of s.enemies) {
    if (e.hp <= 0 || e.x > W - 4 || e.x + e.w < fx) continue;
    const dx = Math.max(0, e.x - fx);
    const dy = Math.abs(e.y + e.h / 2 - fy);
    switch (gun) {
      case "machine":
        if (dy < e.h / 2 + 14) return true;
        break;
      case "laser":
        if (dy < e.h / 2 + 10) return true;
        break;
      case "spread":
        if (dx < 170 && dy < dx * 0.36 + e.h / 2 + 8) return true;
        break;
      case "rocket":
        if (dy < 90) return true;
        break;
    }
  }
  return false;
}

/* The ship's guns. */
function fire(s: State) {
  const p = s.p;
  const ox = p.x + shipSize(s.p.level).w;
  const oy = p.y + shipSize(s.p.level).h / 2;
  const shot = (vx: number, vy: number, dy: number, over: Partial<Bullet>): Bullet => ({
    x: ox, y: oy + dy, vx, vy, r: 2, own: "p", dmg: 1, kind: "pulse", ...over,
  });

  if (p.gun !== "blaster" && p.ammo <= 0) p.gun = "blaster";
  const special = p.gun !== "blaster" && hasTarget(s, p.gun);

  if (p.gun !== "blaster" && !special) {
    /* A special gun with nothing to aim at holds its fire, and looks again a few
       frames later, so it answers as soon as something comes into line. */
    p.cd = 3;
    return;
  }

  if (p.gun === "blaster") {
    p.cd = 12;
    if (p.weapon === 1) s.bullets.push(shot(6, 0, 0, {}));
    else if (p.weapon === 2) s.bullets.push(shot(6, 0, -3, {}), shot(6, 0, 3, {}));
    else s.bullets.push(shot(6, 0, 0, {}), shot(6, -0.9, -3, {}), shot(6, 0.9, 3, {}));
    return;
  }

  p.cd = GUNS[p.gun].cooldown;
  p.ammo -= 1;
  switch (p.gun) {
    case "machine":
      s.bullets.push(shot(7.6, (rand(s) - 0.5) * 0.5, p.ammo % 2 === 0 ? -2 : 2, { kind: "mg", dmg: 0.85, r: 1.6, life: 70 }));
      break;
    case "spread":
      for (const a of [-0.34, -0.17, 0, 0.17, 0.34]) {
        s.bullets.push(shot(Math.cos(a) * 5.4, Math.sin(a) * 5.4, 0, { kind: "spread", dmg: 1, r: 2.2, life: 60 }));
      }
      break;
    case "laser":
      s.bullets.push(shot(12, 0, 0, { kind: "laser", dmg: 0.75, r: 1.8, pierce: true, hit: [], life: 34 }));
      break;
    case "rocket":
      s.bullets.push(shot(3, 0, 0, { kind: "rocket", dmg: 5, r: 3, life: 140 }));
      break;
  }
  if (p.ammo <= 0) p.gun = "blaster";
}

/* Level two has a launcher under the hull, level three a second one on top. They
   never run out of rockets, and like the special guns they fire only at targets. */
function fireLaunchers(s: State) {
  const p = s.p;
  const size = shipSize(p.level);
  const ox = p.x + size.w * 0.5;
  const rocket = (y: number, vy: number): Bullet => ({
    x: ox, y, vx: 2.6, vy, r: 3, own: "p", dmg: 5, kind: "rocket", life: 150,
  });
  s.bullets.push(rocket(p.y + size.h + 2, 0.9));
  if (p.level >= 3) s.bullets.push(rocket(p.y - 2, -0.9));
  p.launchCd = p.level >= 3 ? 52 : 72;
}

export function step(s: State, input: Input) {
  s.frame += 1;
  const p = s.p;

  if (s.phase === "dead" || s.phase === "won") {
    for (const b of s.bursts) b.t += 1;
    s.bursts = s.bursts.filter((b) => b.t < 40);
    if (s.shake > 0) s.shake -= 1;
    return;
  }

  if (s.banner > 0) s.banner -= 1;
  if (s.bombFlash > 0) s.bombFlash -= 1;
  if (s.shake > 0) s.shake -= 1;
  if (s.callout && --s.callout.t <= 0) s.callout = null;
  if (p.inv > 0) p.inv -= 1;

  /* The ship. */
  p.x = clamp(p.x + input.mx, 6, W * 0.55);
  p.y = clamp(p.y + input.my, 12, H - 12 - shipSize(s.p.level).h);
  if (p.cd > 0) p.cd -= 1;
  if (p.cd <= 0 && s.phase === "play") fire(s);
  if (p.launchCd > 0) p.launchCd -= 1;
  if (p.level >= 2 && p.launchCd <= 0 && s.phase === "play" && hasTarget(s, "rocket")) fireLaunchers(s);
  if (input.bomb && p.bombs > 0 && p.bombT <= 0 && s.phase === "play") {
    p.bombs -= 1;
    p.bombT = 30;
    s.bombFlash = 14;
    s.bullets = s.bullets.filter((b) => b.own === "p");
    s.beams = [];
    for (const e of s.enemies) {
      e.hp -= isBoss(e.type) ? 16 : 6;
      e.flash = 6;
    }
  }
  if (p.bombT > 0) p.bombT -= 1;

  /* Enemies arrive. */
  s.t += 1;
  const hearts = PICKUP_PLANS[s.chapter];
  while (s.pickupIdx < hearts.length && hearts[s.pickupIdx].t <= s.t) {
    s.pickups.push({ x: W + 10, y: hearts[s.pickupIdx].y, kind: "E", t: 0 });
    s.pickupIdx += 1;
  }
  const list = PLANS[s.chapter];
  while (s.planIdx < list.length && list[s.planIdx].t <= s.t) {
    const it = list[s.planIdx++];
    spawn(s, it.type, W + 14, it.y, it.a ?? 0);
  }
  if (s.planIdx >= list.length && s.bossId === 0) {
    const regular = s.enemies.filter((e) => !isBoss(e.type)).length;
    if (regular <= 2 || s.t > list[list.length - 1].t + 900) {
      const type: EType = s.chapter === 1 ? "boss1" : s.chapter === 2 ? "boss2" : "boss3";
      const b = spawn(s, type, W + 20, H / 2 - SIZE[type][1] / 2);
      s.bossId = b.id;
    }
  }

  /* Everything moves. */
  for (const e of [...s.enemies]) updateEnemy(s, e);
  for (const b of s.bullets) {
    if (b.kind === "rocket" && b.own === "p") {
      /* A rocket speeds up and leans toward the nearest thing ahead of it. */
      let target: Enemy | undefined;
      let best = 150;
      for (const e of s.enemies) {
        const d = Math.hypot(e.x + e.w / 2 - b.x, e.y + e.h / 2 - b.y);
        if (e.x + e.w / 2 > b.x && d < best) {
          best = d;
          target = e;
        }
      }
      if (target) b.vy += clamp((target.y + target.h / 2 - b.y) * 0.025, -0.28, 0.28);
      b.vy = clamp(b.vy, -3, 3);
      b.vx = Math.min(b.vx + 0.12, 6.2);
    }
    b.x += b.vx;
    b.y += b.vy;
    if (b.life !== undefined) b.life -= 1;
  }
  s.bullets = s.bullets.filter((b) => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10 && (b.life === undefined || b.life > 0));
  for (const b of s.beams) b.t += 1;
  s.beams = s.beams.filter((b) => b.t < b.warn + b.live);
  for (const k of s.pickups) {
    k.x -= 0.9;
    k.t += 1;
  }
  s.pickups = s.pickups.filter((k) => k.x > -12);
  for (const b of s.bursts) b.t += 1;
  s.bursts = s.bursts.filter((b) => b.t < 24);

  /* The ship's shots against enemies. */
  for (const b of s.bullets) {
    if (b.own !== "p") continue;
    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      if (b.pierce && b.hit?.includes(e.id)) continue;
      const body: Box = { x: e.x + 2, y: e.y + 2, w: e.w - 4, h: e.h - 4 };
      if (!hits({ x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 }, body)) continue;
      e.hp -= b.dmg;
      e.flash = 3;
      if (b.kind === "rocket") {
        explode(s, b.x, b.y, 30, 4, e.id);
        b.x = W + 99;
        break;
      }
      if (b.pierce) b.hit?.push(e.id);
      else {
        b.x = W + 99;
        break;
      }
    }
  }
  const dying = s.enemies.filter((e) => e.hp <= 0);
  for (const e of dying) kill(s, e);
  s.enemies = s.enemies.filter((e) => e.hp > 0 && e.x > -110 && e.x < W + 140);

  /* The ship against enemy fire, enemies and beams. */
  const me: Box = { x: p.x + 3, y: p.y + 2, w: shipSize(s.p.level).w - 6, h: shipSize(s.p.level).h - 4 };
  for (const b of s.bullets) {
    if (b.own !== "e") continue;
    if (hits({ x: b.x - b.r + 0.6, y: b.y - b.r + 0.6, w: b.r * 2 - 1.2, h: b.r * 2 - 1.2 }, me)) {
      b.x = -99;
      hurtPlayer(s);
    }
  }
  for (const e of s.enemies) {
    if (hits(me, { x: e.x + 3, y: e.y + 3, w: e.w - 6, h: e.h - 6 })) {
      if (!isBoss(e.type)) {
        e.hp = 0;
        kill(s, e);
      }
      hurtPlayer(s);
    }
  }
  s.enemies = s.enemies.filter((e) => e.hp > 0);
  for (const bm of s.beams) {
    if (bm.t >= bm.warn && hits(me, { x: 0, y: bm.y - bm.h / 2, w: bm.x0, h: bm.h })) hurtPlayer(s);
  }
  for (const k of s.pickups) {
    if (hits(me, { x: k.x - 6, y: k.y - 6, w: 12, h: 12 })) {
      if (k.kind === "P") p.weapon = Math.min(3, p.weapon + 1);
      else if (k.kind === "H") {
        if (p.hp >= maxHpFor(p.level)) addExtra(s);
        else p.hp += 1;
      } else if (k.kind === "E") {
        p.hp = Math.min(maxHpFor(p.level), p.hp + 1);
        addExtra(s);
      }
      else if (k.kind === "B") p.bombs = Math.min(4, p.bombs + 1);
      else {
        const gun = k.kind === "M" ? "machine" : k.kind === "S" ? "spread" : k.kind === "L" ? "laser" : "rocket";
        /* Picking up the gun already held tops up its ammunition. */
        p.ammo = p.gun === gun ? Math.min(GUNS[gun].ammo * 1.5, p.ammo + GUNS[gun].ammo) : GUNS[gun].ammo;
        p.gun = gun;
        p.cd = 0;
      }
      s.score += 5;
      k.x = -99;
    }
  }

  /* The boss falls: the chapter is over a moment later. */
  if (s.bossId !== 0 && !s.enemies.some((e) => e.id === s.bossId) && s.phase === "play") {
    s.phase = "clear";
    s.clearFor = 0;
  }
  if (s.phase === "clear") {
    s.clearFor += 1;
    if (s.clearFor > 150 && s.chapter >= CHAPTERS) s.phase = "won";
  }
}
