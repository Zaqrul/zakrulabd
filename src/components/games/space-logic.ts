/* The rules, enemies and eight chapters of the side-scrolling space shooter, kept
   apart from the screen so they can be run by a script. Each chapter starts with
   the ship being launched from a hangar, then flies it through its own place:
   enemies come from the right, each kind moving and attacking in its own way,
   obstacles slide past (rocks, laser gates, bulkheads, solar flares), and the
   chapter ends with a boss built differently from the last, in phases. Supply
   pods carry weapons with their own ammunition (a machine gun, a spread, a
   piercing laser and straight-running torpedoes); when the ammo runs out the ship goes back
   to its blaster. */
export const W = 384;
export const H = 216;
export const PLAYER_W = 18;
export const PLAYER_H = 10;
// Shared with the articulated renderer so shots leave the visible gunpod.
export const GUNPOD = { x: 17.2, y: 12.2, w: 8.6, h: 3.4, barrel: 3.4 } as const;
export const MAX_HP = 100;
export const CHAPTERS = 8;

/* Where the land and the sea are on the screen. Ground units stand on GROUND_Y
   and ships float with their keel at WATER_Y, and both slide past at the speed
   the scenery does so they look fixed to it. */
export const GROUND_Y = 188;
export const WATER_Y = 178;
const GROUND_UNITS: string[] = ["tank", "aagun", "bunker", "samsite"];
const SHIPS: string[] = ["gunboat", "destroyer"];
/* Big enough that ramming them is not how they die. */
const HEAVY: string[] = ["cruiser", "destroyer", "bunker"];

/* Gold hearts collect into levels, up to MAX_LEVEL, and slowly: only a gold heart counts
   (a life crate just mends health), the hearts are a matter of luck (see UPGRADE_LUCK), and
   each level asks for one heart more than the level before it, so the ship usually gets
   to level 2 or 3, a lucky run goes further, and the top levels are waiting for more
   chapters.
   Every level is an upgrade that arrives by itself, and the ship's own shape hardly
   changes with them (its power goes into what it does, not into parts bolted on): level 1
   the torpedo launcher, 2 the hypersonic drive, 3 the mechanical shield, 4 a second
   launcher, 5 self-repair, and 9 the HQ's support: a carrier's hangar fills the left edge of
   the screen and its four launchers fire homing torpedoes. The other levels bring more
   health and shield, and a fourth nuclear warhead at the top. The ship grows through its
   first three levels and stays that size after. */
export const MAX_LEVEL = 10;
export const LEVEL_AT = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45];
export const maxHpFor = (level: number) => MAX_HP + LIFE.perLevel * (level - 1);

export type Upgrade = "torpedo" | "hypersonic" | "armor" | "repair" | "hq";
export const UPGRADES: Upgrade[] = ["torpedo", "hypersonic", "armor", "repair", "hq"];
/* The level at which each upgrade arrives, and the one at which the second launcher does. */
export const UPGRADE_AT: Record<Upgrade, number> = { torpedo: 1, hypersonic: 2, armor: 3, repair: 5, hq: 9 };
export const TWIN_AT = 4;

/* Health. The ship has a small shield and, under it, its own health bar of MAX_HP
   points (LIFE.perLevel more for each level). A hit takes LIFE.hit: from the shield first
   and then from the health bar, and from nothing else: a ship that is hit loses health and
   never a level or an upgrade. Nothing mends the ship by itself until it has the
   self-repair upgrade (level 5): then, once CALM frames (six seconds) have passed without a
   hit, the shield and the health mend a little every frame, as in SHIELD and HEAL. Before
   that only a life crate (LIFE.heal), a level gained, a new chapter or a retry puts them
   back. From level 4 the shield is SHIELD.perLevel bigger for each level. */
export const LIFE = { perLevel: 10, hit: 20, heal: 20 };
export const SHIELD = { base: 20, perLevel: 5, regen: 0.15 };
export const CALM = 360;
export const HEAL = { life: 0.06 };

/* The upgrades. Torpedo: a launcher under the hull that never runs out of torpedoes;
   twin: a second one on top, firing faster and harder. Hypersonic: the ship flies faster
   and every gun fires more often. Mechanical shield: the hull is plated, so every hit does
   less, and the health bar and shield are longer. Self-repair: see CALM. HQ: see HQ. */
export const TUBES = { single: { cooldown: 72, damage: 5 }, twin: { cooldown: 52, damage: 7 } };

/* The HQ's support, from level 9. A carrier's hangar fills the left edge of the screen
   (`width` wide, and the ship keeps clear of it). Four launchers, two in the top corner and
   two in the bottom corner, each fire a torpedo every `cooldown` frames, staggered by
   `stagger`, whenever there is an enemy on screen: it leaves the tube angled a little
   (`tilt`) and then steers after the nearest enemy (`turn` radians a frame, for `track`
   frames). */
export const HQ = { width: 28, cooldown: 150, stagger: 38, damage: 6, track: 150, turn: 0.07, tilt: 0.32 };
export const HQ_LAUNCHERS = [{ x: 29, y: 34 }, { x: 29, y: 46 }, { x: 29, y: 194 }, { x: 29, y: 206 }];
/* How far the HQ has slid in (0 to 1), the frames before each launcher fires again, the
   frames left of each one's muzzle flash (for the drawing), and the frames before any of them
   may fire (they take turns, \`stagger\` apart). */
export type Hq = { slide: number; cd: number[]; kick: number[]; gap: number };
export const HYPERSONIC = { speed: 1.3, rate: 0.75, shot: 6 };
/* The ship's own weapons keep this share of the damage they were first given, and the
   blaster's bolt flies at BLASTER.speed, a fifth slower than it did. */
export const POWER = 0.75;
export const BLASTER = { speed: 4.8, cooldown: 12 };
export const ARMOR = { reduction: 0.3, defense: 0.1 };
/* Frames the ship's change of shape lasts, for the drawing. */
export const MORPH = 48;

/* The bombs: one throw is ten of them, fanned out ahead of the ship. Each comes to rest
   and goes off `fuse` frames after it was thrown (three seconds), hurting everything
   within `radius` of it. */
export const BOMBS = { count: 10, fuse: 180, radius: 38, damage: 12, boss: 5 };
export type Bomb = { x: number; y: number; vx: number; vy: number; t: number };

/* The nuclear warheads, the ship's ultimate: three a chapter, each a missile. It runs
   down the boss, or else the nearest enemy, and where it hits it hurts everything within
   `blast` badly (a boss loses `bossShare` of its health), then a blast fills the screen for
   `frames`: every `every` frames it hurts everything in it, a lot for what is small and a
   little for a boss, and wipes the screen of enemy fire. The ship is untouchable while
   it lasts. */
export const NUKE = { count: 3, frames: 72, every: 6, regular: 7, boss: 1.4, blast: 80, direct: 60, bossShare: 0.05, speed: 7 };
export type Warhead = { x: number; y: number; vx: number; vy: number; t: number; target: number; done?: boolean };

/* After take-off in space the stars streak past, fast at first and then settling, for
   `frames`. When a boss falls the ship settles in the middle of the screen (until `go`),
   then lights its engines and flies off, and the story (`talk`) comes after. */
export const WARP = { frames: 170, boost: 5 };
export const CLEAR = { go: 70, talk: 170 };

/* The last boss has a shield of its own that takes damage before its health does, and
   comes back after `wait` frames without a hit, `regen` a frame. */
export const BOSS_SHIELD_AT: Partial<Record<EType, number>> = { boss8: 1500 };
export const BOSS_SHIELD = { wait: 300, regen: 0.6 };

/* Frozen: an enemy that is not a boss barely moves and does not fire for `frames`, and
   takes `shatter` times the damage. `slow` is the share of its speed it keeps. */
export const FREEZE = { frames: 150, shatter: 1.5, slow: 0.25 };

/* The new weapons. The ice bomb flies a short way and bursts in a ball of frost. The
   flamethrower throws short-lived fire that goes through what it touches. The katana
   cuts everything in front of the ship, enemy shots included, and throws a thin wave. */
export const ICEBOMB = { speed: 4.2, life: 55, radius: 42, damage: 3.5 };
export const FLAME = { speed: 4.6, life: 15, damage: 0.5, r: 3.2, spread: 0.2 };
export const KATANA = { reach: 54, half: 30, damage: 6, boss: 3.5, wave: 2.5 };

type Equipped = { level: number };
export const hasUpgrade = (p: { level: number }, u: Upgrade) => p.level >= UPGRADE_AT[u];
export const maxLife = (p: Equipped) => Math.round(maxHpFor(p.level) * (hasUpgrade(p, "armor") ? 1 + ARMOR.defense : 1));
export const maxShield = (p: Equipped) =>
  Math.round((SHIELD.base + SHIELD.perLevel * Math.max(0, p.level - 3)) * (hasUpgrade(p, "armor") ? 1 + ARMOR.defense : 1));
export const shipScale = (level: number) => 0.85 * (1 + 0.2 * (Math.min(level, 3) - 1));
export const shipSize = (level: number) => ({
  w: PLAYER_W * shipScale(level),
  h: PLAYER_H * shipScale(level),
});

export type EType =
  | "scout" | "wave" | "rock" | "smallrock"
  | "diver" | "gunner" | "mine" | "drone"
  | "turret" | "zigzag" | "armor" | "seeker" | "pod"
  | "swarm" | "bomber" | "sniper" | "orbiter" | "splitter" | "cruiser"
  | "shard" | "comet" | "fighter" | "funnel"
  | "tank" | "aagun" | "bunker" | "samsite" | "jet" | "gunship" | "airbomber" | "gunboat" | "destroyer"
  | "boulder"
  | "boss1" | "boss2" | "boss3" | "boss4" | "boss5" | "boss6" | "boss7" | "boss8";

export type Gun = "blaster" | "machine" | "spread" | "laser" | "torpedo" | "icebomb" | "flame" | "katana";

export type Box = { x: number; y: number; w: number; h: number };

/* The first eleven are shared; each chapter boss also has two of its own, a move and
   a weapon, and the last boss has the C4. */
export type AttackKind =
  | "fan" | "burst" | "missiles" | "beam" | "spiral" | "charge" | "curtain" | "flare" | "support" | "nova"
  | "stomp" | "flak" | "surge" | "salvo" | "pincer" | "boulders" | "undertow" | "spores"
  | "breach" | "frost" | "dive" | "wisps" | "blink" | "crescent" | "c4";
export type BossAttack = {
  kind: AttackKind;
  t: number;
  warn: number;
  live: number;
  recover: number;
  angle: number;
  targetY: number;
  targetX: number;
  /* Where a signature attack will land, set when it is chosen or when it locks: the
     lanes of a salvo, the gap of a pincer, the spots of a barrage. Drawn as its warning. */
  lanes?: number[];
  gapY?: number;
  spots?: { x: number; y: number }[];
};

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
  /* Scratch values: a flag, a counter or an angle, depending on the kind. For a
     boss, `a` is its phase (0 and up), `b` its clock, `c` and `d` the state and
     timer of its charge, `n` shots left in a burst, `rot` an angle or timer. */
  a: number;
  b: number;
  c: number;
  d: number;
  n: number;
  rot: number;
  /* While above zero most of the damage it takes is turned away. */
  guard: number;
  /* Parts of the body that hurt on touch and stop the ship's shots, but cannot
     be hurt themselves: the coils of a serpent, a blade swung. Set every frame. */
  parts: Box[];
  /* Renderer-only canonical model: world actors always use their chapter scale. */
  renderScale?: number;
  /* Where a serpent's head has been, newest last. */
  trail?: { x: number; y: number }[];
  /* Where the ship was when this enemy locked on. What it fires goes there, and
     does not follow the ship afterwards. */
  lock?: { x: number; y: number };
  attack?: BossAttack;
  attackIndex?: number;
  /* Frames left frozen (see FREEZE). */
  freeze?: number;
  /* A shield that takes the damage first (see BOSS_SHIELD), the frames before it mends,
     and the frames left of the flash when it is hit, for the drawing. */
  shield?: number;
  maxShield?: number;
  shieldWait?: number;
  shieldHit?: number;
  /* Spawned by the chapter's script (not a missile, a fragment or a boss's escort),
     so it counts toward the share of enemies destroyed. */
  fromPlan?: boolean;
};

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  own: "p" | "e";
  dmg: number;
  kind: "pulse" | "orb" | "spiral" | "needle" | "ice" | "fire" | "mg" | "spread" | "laser" | "torpedo" | "shell" | "wisp" | "crescent" | "frost" | "icebomb" | "flame" | "slash";
  /* The ship's laser goes through what it hits, once each. */
  pierce?: boolean;
  hit?: number[];
  /* Frames before a shot of the ship's gives out. */
  life?: number;
  /* A torpedo's heading and the frames since it left its tube; while it has them
     its speed comes from torpedoSpeed, not from vx and vy. */
  ux?: number;
  uy?: number;
  age?: number;
  /* Frames left in which it steers after the ship, and how far it can turn a frame. */
  track?: number;
  turn?: number;
  /* The x at which it turns round and comes back, once. */
  back?: number;
  /* An ice bomb: what it hits freezes. */
  icy?: boolean;
};

export type Beam = { y: number; h: number; x0: number; t: number; warn: number; live: number; ownerId?: number; slot?: number };
export type PickupKind = "H" | "B" | "M" | "S" | "L" | "R" | "I" | "F" | "K" | "E";
export type Pickup = { x: number; y: number; kind: PickupKind; t: number };
export type Burst = { x: number; y: number; t: number; big: boolean };
export type Smoke = { x: number; y: number; vx: number; vy: number; t: number; life: number; r: number; tone: number };

/* Things that are in the way rather than at war with you. The ship's shots
   cannot destroy them. A flare is a column of fire that is marked first; a gate
   is a pair of laser pylons with a gap that drifts up and down; a wall is a
   bulkhead with two gaps cut in it. */
export type HKind = "flare" | "gate" | "wall" | "wave" | "spire";
export type Hazard = { id: number; kind: HKind; x: number; w: number; g: number[]; half: number; base: number; t: number };

export type Input = { mx: number; my: number; bomb: boolean; nuke?: boolean };

export type Phase = "launch" | "play" | "clear" | "dead" | "won";

export type Callout = "shield" | "armor" | "overload" | "levelup" | "phase" | "warning" | "c4" | "hypersonic" | "mechshield" | "launcher" | "repair" | "hq";

/* A C4 charge the last boss throws in its final phase. t counts from its launch
   (below zero it is still waiting in the bay); it flies from (sx, sy) to (tx, ty),
   sits there, and goes off at C4.fuse. */
export type ZoneKind = "c4" | "flak" | "spore" | "ember";
export type Charge = { x: number; y: number; sx: number; sy: number; tx: number; ty: number; t: number; kind?: ZoneKind };

/* How a chapter went, worked out when its boss falls, and the bonus it earned.
   killRate is null for a run that began at the boss checkpoint. */
export type ChapterResult = {
  kills: number;
  spawned: number;
  killRate: number | null;
  hits: number;
  bossSeconds: number;
  killBonus: number;
  noHitBonus: number;
  speedBonus: number;
  bonus: number;
};

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
    /* Kept for saved progress; the blaster no longer has power levels. */
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
    /* How far the nose is tipped by the last move, for the drawing alone. */
    tilt: number;
    /* Frames left of the gunpod being swapped for a new one, for the drawing. */
    swap: number;
    /* Frames left of frostbite, which slows the ship. */
    chill: number;
    /* Shield points, the frames left before self-repair starts, and the frames left of the
       flash when the shield takes a hit, for the drawing. */
    shield: number;
    calm: number;
    shieldFlash: number;
    /* The frames left of the ship changing shape, the nuclear warheads still to use, and the
       frames left of a katana swing. */
    morph: number;
    nukes: number;
    slashT: number;
  };
  enemies: Enemy[];
  bullets: Bullet[];
  beams: Beam[];
  hazards: Hazard[];
  pickups: Pickup[];
  bursts: Burst[];
  smoke: Smoke[];
  charges: Charge[];
  /* Timed bombs waiting to go off, nuclear warheads in flight, and the frames left of the
     warp after take-off. */
  timedBombs: Bomb[];
  warheads: Warhead[];
  warp: number;
  hq: Hq;
  score: number;
  bossId: number;
  clearFor: number;
  banner: number;
  chapterStartScore: number;
  chapterStartWeapon: number;
  chapterStartLevel: number;
  chapterStartExtra: number;
  /* A nuclear blast under way: its age in frames and where it began. */
  nuke: { t: number; x: number; y: number } | null;
  pickupIdx: number;
  bombFlash: number;
  shake: number;
  callout: { kind: Callout; t: number } | null;
  /* Frames of the launch so far, and how far the background has scrolled. */
  launchT: number;
  scroll: number;
  /* Set when the story needs the game to stop: the boss has just arrived. */
  talk: "boss" | null;
  /* What the chapter has seen so far, for its results. */
  stats: { spawned: number; kills: number; hits: number; bossFrames: number };
  result: ChapterResult | null;
  /* This run began at the boss, after the ship was lost there. */
  checkpoint: boolean;
};

/* The launch. The ship sits in the hangar on its catapult with the engines cold;
   they light, smoke pours out, the gantry arms swing clear, a count runs down,
   and the catapult throws the ship out into space, where it settles into place
   at the left of the screen. Everything here is a function of the frame, so the
   drawing and the rules agree. */
export const LAUNCH_END = 250;
export const LAUNCH_GO = 150;
export const BURST_LIFE = 24;
export const LAUNCH_RAIL_Y = 164;

export function launchShipY(level: number) {
  return Math.min(H / 2 + 26, LAUNCH_RAIL_Y - 4 - 17 * shipScale(level));
}

const ease = (u: number) => u * u * (3 - 2 * u);
const unit = (v: number) => Math.min(1, Math.max(0, v));

export function launchPose(t: number) {
  const kick = unit((t - LAUNCH_GO) / 62);
  const settle = unit((t - 212) / 38);
  const rush = t >= LAUNCH_GO ? 14 * Math.min(1, (t - LAUNCH_GO) / 65) : 0;
  const x = t < LAUNCH_GO ? 52 : t < 212 ? 52 + 118 * kick * kick : 170 + (36 - 170) * ease(settle);
  const y = H / 2 + 26 - 26 * ease(unit((t - LAUNCH_GO) / 60));
  /* How hard the engines are running, with a stutter while they catch. */
  const throttle =
    t < 18 ? 0 : t < 80 ? 0.15 + 0.4 * unit((t - 18) / 62) + (t % 14 < 3 ? -0.08 : 0) : t < LAUNCH_GO ? 0.6 + 0.2 * unit((t - 80) / 70) : 1;
  /* The hangar slides away behind the ship once it is thrown. */
  const u = Math.max(0, t - LAUNCH_GO);
  const off = u < 65 ? 0.5 * (14 / 65) * u * u : 0.5 * 14 * 65 + 14 * (u - 65);
  const speed = t < LAUNCH_GO ? 0 : t < 215 ? rush : 14 - 13 * ease(unit((t - 215) / 35));
  return {
    x,
    y,
    throttle,
    gantry: ease(unit((t - 92) / 40)),
    count: t < 84 ? 0 : t < 104 ? 3 : t < 124 ? 2 : t < 144 ? 1 : t < LAUNCH_GO + 14 ? -1 : 0,
    off,
    speed,
    flash: t >= LAUNCH_GO && t < LAUNCH_GO + 8 ? 1 - (t - LAUNCH_GO) / 8 : 0,
  };
}

type Plan = { t: number; type: EType | HKind; y: number; a?: number; x?: number; g?: number[] };

const isHazardType = (t: string): t is HKind => t === "flare" || t === "gate" || t === "wall";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* When each enemy and obstacle turns up, in frames at 60 a second. The boss
   follows once the list has run out and the screen is nearly clear. */
function plan(chapter: number): Plan[] {
  const out: Plan[] = [];
  const add = (t: number, type: EType, y: number, a = 0) => out.push({ t, type, y: clamp(y, 18, H - 18), a });
  /* A V of ships, the leader first. */
  const vee = (t: number, type: EType, cy: number, n = 3, gap = 16) => {
    const mid = (n - 1) / 2;
    for (let i = 0; i < n; i++) add(t + Math.round(Math.abs(i - mid) * gap), type, cy + (i - mid) * 22);
  };
  const swarm = (t: number, y: number, n = 7) => {
    for (let i = 0; i < n; i++) add(t + i * 9, "swarm", y, i * 0.8);
  };
  const flare = (t: number, x: number) => out.push({ t, type: "flare", y: 0, x });
  const gate = (t: number, y: number) => out.push({ t, type: "gate", y, g: [y] });
  const wall = (t: number, g1: number, g2: number) => out.push({ t, type: "wall", y: 0, g: [g1, g2] });
  const each = (list: number[][], type: EType) => {
    for (const [t, y] of list) add(t, type, y);
  };

  if (chapter === 1) {
    for (let k = 0; k < 8; k++) vee(130 + k * 340, "scout", 40 + ((k * 47) % 130));
    for (const t of [640, 1040, 1440, 1840, 2240, 2640]) {
      add(t, "wave", 104);
      add(t + 70, "wave", 70);
    }
    each([[330, 60], [800, 160], [1300, 90], [1800, 150], [2300, 70], [2750, 140], [1000, 110], [2050, 120]], "rock");
    swarm(480, 60); swarm(1180, 150); swarm(1980, 90); swarm(2580, 120);
    each([[900, 70], [1700, 150], [2400, 100]], "gunner");
    each([[1220, 60], [2120, 160]], "bomber");
    each([[470, 120], [2350, 140]], "pod");
  } else if (chapter === 2) {
    for (let k = 0; k < 11; k++) add(110 + k * 250, "diver", k % 2 === 0 ? 24 : H - 24);
    each([[520, 70], [1120, 150], [1720, 100], [2220, 60], [2700, 130]], "gunner");
    each([[300, 110], [800, 60], [1300, 160], [1900, 90], [2400, 130], [2850, 70]], "mine");
    each([[760, 90], [1560, 150], [2360, 60]], "orbiter");
    each([[560, 50], [1180, 160], [2000, 60], [2650, 150]], "bomber");
    swarm(950, 110); swarm(1750, 70); swarm(2550, 150);
    flare(520, 120); flare(1020, 200); flare(1560, 150); flare(2080, 90); flare(2540, 190); flare(2900, 130);
    each([[430, 140], [2130, 120]], "pod");
  } else if (chapter === 3) {
    for (let k = 0; k < 6; k++) {
      const t = 260 + k * 440;
      for (let i = 0; i < 6; i++) {
        out.push({ t: t + i * 14, type: "shard", y: 6 + ((i * 29) % 70), a: 0 });
        out.push({ t: t + i * 14 + 7, type: "shard", y: H - 6 - ((i * 31) % 70), a: 1 });
      }
    }
    each([[600, 100], [1400, 60], [2200, 150], [2900, 90]], "sniper");
    each([[820, 110], [1700, 70], [2520, 140]], "splitter");
    each([[1100, 100], [2000, 80], [2950, 130]], "armor");
    wall(720, 66, 156); wall(1540, 52, 148); wall(2360, 70, 160); wall(3000, 60, 150);
    for (let k = 0; k < 7; k++) vee(180 + k * 420, "scout", 50 + ((k * 61) % 110), 4);
    swarm(1300, 120); swarm(2100, 80);
    each([[460, 120], [2400, 130]], "pod");
  } else if (chapter === 4) {
    for (let k = 0; k < 11; k++) add(230 + k * 270, "comet", 30 + ((k * 47) % 150), k % 2);
    each([[900, 100], [1700, 60], [2500, 150], [3100, 90]], "fighter");
    each([[600, 70], [1300, 150], [2300, 100]], "orbiter");
    add(1900, "cruiser", 90);
    flare(400, 150); flare(760, 100); flare(1180, 190); flare(1560, 80); flare(2100, 160); flare(2440, 110); flare(2800, 200); flare(3150, 140);
    each([[1000, 120], [2750, 90]], "armor");
    each([[540, 60], [1450, 160], [2650, 70]], "gunner");
    swarm(700, 150); swarm(1500, 90); swarm(2200, 130); swarm(3000, 70);
    each([[500, 130], [2600, 140]], "pod");
  } else if (chapter === 5) {
    gate(480, 110); gate(1250, 80); gate(2050, 140); gate(2850, 100);
    wall(880, 60, 160); wall(1660, 50, 150); wall(2450, 70, 165); wall(3250, 55, 155);
    for (const t of [160, 640, 1120, 1600, 2080, 2560, 3040]) {
      add(t, "turret", 16, 0);
      add(t + 100, "turret", H - 16, 1);
    }
    each([[700, 100], [1500, 60], [2300, 150], [3150, 90]], "sniper");
    each([[1000, 70], [1800, 150], [2600, 100]], "fighter");
    each([[560, 60], [1380, 160], [2200, 70], [2980, 150]], "bomber");
    add(2000, "cruiser", 100);
    for (let k = 0; k < 5; k++) vee(260 + k * 560, "zigzag", 100, 3, 26);
    each([[440, 120], [2400, 140]], "pod");
  } else {
    for (const t of [160, 660, 1160, 1660, 2160, 2660, 3160]) {
      add(t, "turret", 16, 0);
      add(t + 120, "turret", H - 16, 1);
    }
    for (const t of [320, 920, 1520, 2120, 2720]) for (let i = 0; i < 3; i++) add(t + i * 26, "zigzag", 60 + i * 40);
    each([[760, 108], [1560, 70], [2260, 140], [3000, 100]], "armor");
    for (const t of [1000, 1220, 1960, 2120, 2780]) add(t, "seeker", 40 + ((t * 7) % 140));
    gate(560, 90); gate(1340, 130); gate(2140, 80); gate(2960, 120);
    wall(960, 60, 156); wall(1760, 50, 150); wall(2560, 70, 160);
    each([[520, 60], [1800, 150], [2700, 100]], "fighter");
    each([[880, 80], [2000, 150], [3100, 110]], "orbiter");
    add(1100, "cruiser", 70);
    add(2350, "cruiser", 140);
    swarm(1450, 100); swarm(2450, 140);
    each([[380, 100], [2000, 70]], "pod");
  }
  return out.sort((a, b) => a.t - b.t);
}

/* Chapter one, the land: aircraft overhead, and on the ground tanks, guns, missile
   sites and bunkers that slide past with the scenery. */
function landPlan(): Plan[] {
  const out: Plan[] = [];
  const add = (t: number, type: EType, y = 0, a = 0) => out.push({ t, type, y: clamp(y, 18, H - 18), a });
  for (let k = 0; k < 5; k++) {
    const cy = 40 + ((k * 53) % 90);
    for (let i = 0; i < 2; i++) add(200 + k * 560 + i * 22, "jet", cy + (i - 0.5) * 26, i * 0.9);
  }
  for (const [t, n] of [[350, 2], [1250, 2], [2150, 3]]) for (let i = 0; i < n; i++) add(t + i * 70, "tank");
  for (const t of [600, 1400, 2200]) add(t, "aagun");
  for (const t of [900, 2400]) add(t, "samsite");
  for (const t of [800, 2000]) add(t, "bunker");
  for (const [t, y] of [[1000, 60], [2000, 80]]) add(t, "gunship", y);
  add(1550, "airbomber", 50);
  for (const [t, y] of [[420, 100], [2200, 120]]) add(t, "pod", y);
  return out.sort((a, b) => a.t - b.t);
}

/* Chapter two, the sea: gunboats and destroyers on the water, aircraft above,
   and the flagship at the end. */
function seaPlan(): Plan[] {
  const out: Plan[] = [];
  const add = (t: number, type: EType, y = 0, a = 0) => out.push({ t, type, y: clamp(y, 18, H - 18), a });
  for (let k = 0; k < 9; k++) {
    add(160 + k * 320, "gunboat");
    if (k % 2) add(160 + k * 320 + 90, "gunboat");
  }
  add(1400, "destroyer");
  add(2500, "destroyer");
  for (let k = 0; k < 6; k++) {
    const cy = 36 + ((k * 47) % 80);
    for (let i = 0; i < 3; i++) add(260 + k * 480 + i * 18, "jet", cy + (i - 1) * 22, i * 0.9);
  }
  for (const [t, y] of [[700, 60], [1700, 80], [2800, 60]]) add(t, "gunship", y);
  for (const [t, y] of [[500, 40], [1200, 60], [2000, 50], [3000, 40]]) add(t, "airbomber", y);
  for (const [t, y] of [[460, 110], [2400, 120]]) add(t, "pod", y);
  return out.sort((a, b) => a.t - b.t);
}

const PLANS: Plan[][] = [[], landPlan(), seaPlan(), plan(1), plan(2), plan(3), plan(4), plan(5), plan(6)];

/* A gold heart may drift in at each of these moments, and it only does with a chance of
   UPGRADE_LUCK: a roll that takes the luck of the run, so some runs find three or four of
   them in the first chapters and some find none for a while. They are the only thing that
   counts toward a level (see LEVEL_AT). */
export const UPGRADE_LUCK = 0.3;
export const PICKUP_PLANS: { t: number; y: number }[][] = [
  [],
  [{ t: 1100, y: 100 }],
  [{ t: 900, y: 80 }, { t: 1900, y: 120 }],
  [{ t: 1250, y: 100 }],
  [{ t: 900, y: 150 }, { t: 1900, y: 70 }],
  [{ t: 800, y: 110 }, { t: 2000, y: 160 }],
  [{ t: 900, y: 100 }, { t: 2300, y: 60 }],
  [{ t: 800, y: 150 }, { t: 1900, y: 80 }],
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
  swarm: [10, 8, 1],
  bomber: [26, 16, 6],
  sniper: [18, 12, 4],
  orbiter: [18, 18, 6],
  splitter: [24, 20, 6],
  cruiser: [58, 34, 44],
  shard: [10, 14, 2],
  comet: [12, 12, 4],
  fighter: [20, 14, 6],
  funnel: [9, 9, 2],
  tank: [26, 16, 6],
  aagun: [18, 16, 4],
  bunker: [32, 20, 12],
  samsite: [20, 18, 5],
  jet: [22, 10, 3],
  gunship: [28, 14, 7],
  airbomber: [38, 14, 9],
  gunboat: [28, 14, 5],
  destroyer: [54, 22, 20],
  boulder: [28, 26, 16],
  /* Boss health is set from the damage a ship of the usual level for that chapter
     does when it keeps hitting: about 15 seconds of steady fire for the first boss,
     rising to about 38 for the seventh, and a few minutes for the last, then
     doubled or more for every boss. The
     serpent's coils block shots, so it needs less. */
  boss1: [64, 60, 160],
  boss2: [96, 52, 300],
  boss3: [74, 66, 650],
  boss4: [70, 74, 720],
  boss5: [34, 28, 560],
  boss6: [64, 52, 1100],
  boss7: [60, 38, 1250],
  boss8: [96, 84, 5000],
};

/* Where the last boss's layers break, as a share of its health: the energy shield,
   the armour, the core, the overload, a last stand, and at the very end a barrage
   of C4 charges. */
export const FINAL_PHASE_AT = [0.85, 0.66, 0.47, 0.3, 0.14];

/* How many phases each boss has, for the bar that shows its health. */
export const BOSS_PHASES: Record<string, number> = { boss1: 3, boss2: 3, boss3: 3, boss4: 3, boss5: 3, boss6: 3, boss7: 3, boss8: 6 };

const SCORE: Record<EType, number> = {
  scout: 10, wave: 20, rock: 30, smallrock: 5, diver: 20, gunner: 40, mine: 25, drone: 5,
  turret: 40, zigzag: 25, armor: 80, seeker: 15, pod: 20,
  swarm: 5, bomber: 45, sniper: 45, orbiter: 50, splitter: 50, cruiser: 400, shard: 5, comet: 20, fighter: 60, funnel: 10,
  tank: 40, aagun: 35, bunker: 90, samsite: 45, jet: 25, gunship: 60, airbomber: 70, gunboat: 40, destroyer: 450, boulder: 30,
  boss1: 1000, boss2: 1800, boss3: 800, boss4: 1500, boss5: 2200, boss6: 2800, boss7: 3500, boss8: 12000,
};

export const isBoss = (t: EType) => t.startsWith("boss");

/* How hard each chapter is, set in one place: enemies reload more slowly in the
   early chapters and reach full pace by chapter seven. Their torpedoes run the
   same in every chapter (TORPEDO). Index 0 is unused. */
export const DIFFICULTY = [
  { fire: 1 },
  { fire: 1.9 },
  { fire: 1.8 },
  { fire: 1.4 },
  { fire: 1.2 },
  { fire: 1.12 },
  { fire: 1.05 },
  { fire: 1 },
  { fire: 1 },
];
export const profile = (s: State) => DIFFICULTY[s.chapter] ?? DIFFICULTY[DIFFICULTY.length - 1];

/* Every torpedo runs the same way, the ship's and the enemy's alike: it slides
   out of its tube slowly, coasts for a moment while its motor lights, then runs
   flat out. Every shot an enemy fires is one of these torpedoes, so it is never
   faster or slower than the ship's own. Speeds in pixels a frame. */
export const TORPEDO = { eject: 10, ignite: 8, slide: 0.9, coast: 0.5, accel: 0.55, top: 4.4 };

export type TorpedoStage = "eject" | "ignite" | "burn";

export function torpedoStage(age: number): TorpedoStage {
  return age <= TORPEDO.eject ? "eject" : age <= TORPEDO.eject + TORPEDO.ignite ? "ignite" : "burn";
}

export function torpedoSpeed(age: number) {
  const burn = age - TORPEDO.eject - TORPEDO.ignite;
  if (burn <= 0) return age <= TORPEDO.eject ? TORPEDO.slide : TORPEDO.coast;
  return Math.min(TORPEDO.top, TORPEDO.coast + burn * TORPEDO.accel);
}

/* A torpedo leaving its tube at (x, y), heading along `angle`. */
function torpedo(x: number, y: number, angle: number, over: Pick<Bullet, "r" | "own" | "dmg" | "kind"> & Partial<Bullet>): Bullet {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  return { x, y, vx: ux * TORPEDO.slide, vy: uy * TORPEDO.slide, ux, uy, age: 0, ...over };
}

/* What each gun does: frames between shots, and how many shots a crate holds. */
export const GUNS: Record<Exclude<Gun, "blaster">, { cooldown: number; ammo: number }> = {
  machine: { cooldown: 4, ammo: 130 },
  spread: { cooldown: 19, ammo: 36 },
  laser: { cooldown: 3, ammo: 115 },
  torpedo: { cooldown: 32, ammo: 14 },
  icebomb: { cooldown: 38, ammo: 14 },
  flame: { cooldown: 4, ammo: 150 },
  katana: { cooldown: 22, ammo: 28 },
};

export function createState(chapter = 1, score = 0, weapon = 1, level = 1, extra = 0): State {
  const pose = launchPose(0);
  const state: State = {
    chapter,
    phase: "launch",
    t: 0,
    frame: 0,
    seed: 1234567 + chapter * 977,
    nextId: 1,
    planIdx: 0,
    p: { x: pose.x, y: launchShipY(level), hp: 0, inv: 0, weapon, gun: "blaster", ammo: 0, bombs: 2, cd: 0, bombT: 0, level, extra, launchCd: 0, tilt: 0, swap: 0, chill: 0, shield: 0, calm: 0, shieldFlash: 0, morph: 0, nukes: NUKE.count + (level >= MAX_LEVEL ? 1 : 0), slashT: 0 },
    enemies: [],
    bullets: [],
    beams: [],
    hazards: [],
    pickups: [],
    bursts: [],
    smoke: [],
    charges: [],
    timedBombs: [],
    warheads: [],
    warp: 0,
    hq: { slide: 0, cd: HQ_LAUNCHERS.map(() => 0), kick: HQ_LAUNCHERS.map(() => 0), gap: 0 },
    score,
    bossId: 0,
    clearFor: 0,
    banner: 0,
    chapterStartScore: score,
    chapterStartWeapon: weapon,
    chapterStartLevel: level,
    chapterStartExtra: extra,
    nuke: null,
    pickupIdx: 0,
    bombFlash: 0,
    shake: 0,
    callout: null,
    launchT: 0,
    scroll: 0,
    talk: null,
    stats: { spawned: 0, kills: 0, hits: 0, bossFrames: 0 },
    result: null,
    checkpoint: false,
  };
  state.p.hp = maxLife(state.p);
  state.p.shield = maxShield(state.p);
  return state;
}

/* The same chapter again from its start, after the ship is lost. */
export function retryChapter(s: State) {
  return createState(s.chapter, s.chapterStartScore, s.chapterStartWeapon, s.chapterStartLevel, s.chapterStartExtra);
}

/* Seconds a good run should take over each boss: beating it sooner earns a share
   of the speed bonus. The bosses take a couple of minutes at the end, so the later
   ones are given longer. Index 0 is unused. */
const BOSS_PAR = [0, 30, 55, 60, 50, 90, 75, 100, 240];

/* What the chapter's play earned: a share of the bonus for every enemy destroyed,
   all of it again for not being hit, and more for beating the boss quickly. */
export function chapterResult(s: State): ChapterResult {
  const { spawned, kills, hits, bossFrames } = s.stats;
  const base = 500 + s.chapter * 250;
  const killRate = s.checkpoint ? null : spawned ? Math.min(1, kills / spawned) : 1;
  const killBonus = killRate === null ? 0 : Math.round((base * killRate) / 10) * 10;
  const noHitBonus = hits === 0 ? base : 0;
  const bossSeconds = bossFrames / 60;
  const par = BOSS_PAR[s.chapter] ?? 60;
  const speedBonus = bossSeconds < par ? Math.round((((par - bossSeconds) / par) * base) / 10) * 10 : 0;
  return { kills, spawned, killRate, hits, bossSeconds, killBonus, noHitBonus, speedBonus, bonus: killBonus + noHitBonus + speedBonus };
}

/* The same chapter again, starting at its boss: the ship as it began the chapter,
   no launch and no enemies before the boss. Offered after the ship is lost there. */
export function bossCheckpoint(s: State) {
  const next = createState(s.chapter, s.chapterStartScore, s.chapterStartWeapon, s.chapterStartLevel, s.chapterStartExtra);
  const list = PLANS[s.chapter];
  next.phase = "play";
  next.planIdx = list.length;
  next.t = list.length ? list[list.length - 1].t : 0;
  next.pickupIdx = PICKUP_PLANS[s.chapter].length;
  next.p.x = 36;
  next.p.y = H / 2;
  next.p.inv = 90;
  next.checkpoint = true;
  return next;
}

/* How far through the chapter's script the run is, 0 to 1, for the progress bar. */
export function chapterProgress(s: State) {
  const list = PLANS[s.chapter];
  const end = list.length ? list[list.length - 1].t : 1;
  return Math.max(0, Math.min(1, s.t / end));
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

const hits = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* The parts of a hazard that hurt right now. */
export function hazardBoxes(h: Hazard): Box[] {
  if (h.kind === "flare") return h.t >= FLARE_WARN ? [{ x: h.x, y: 0, w: h.w, h: H }] : [];
  if (h.kind === "wave") return [{ x: h.x, y: h.base, w: h.w, h: h.half }];
  if (h.kind === "spire") {
    const tall = spireHeight(h.t);
    return tall > 0 ? [{ x: h.x, y: H - tall, w: h.w, h: tall }] : [];
  }
  const out: Box[] = [];
  let top = 0;
  for (const g of [...h.g].sort((a, b) => a - b)) {
    const bottom = g - h.half;
    if (bottom > top) out.push({ x: h.x, y: top, w: h.w, h: bottom - top });
    top = g + h.half;
  }
  if (top < H) out.push({ x: h.x, y: top, w: h.w, h: H - top });
  return out;
}

/* The siege tank's shockwave runs along the ground, left, as high as the stomp that
   made it; the iron worm's spires rise from the floor at a marked spot. */
export const WAVE = { speed: 2.8, w: 30, heights: [14, 24, 34] };
export const SPIRE = { warn: 26, rise: 12, hold: 42, fall: 12, height: 140, w: 22 };
export const SPIRE_END = SPIRE.warn + SPIRE.rise + SPIRE.hold + SPIRE.fall;

/* How tall a spire is `t` frames after it was marked. */
export function spireHeight(t: number) {
  if (t < SPIRE.warn) return 0;
  const up = t - SPIRE.warn;
  if (up < SPIRE.rise) return (SPIRE.height * up) / SPIRE.rise;
  if (up < SPIRE.rise + SPIRE.hold) return SPIRE.height;
  const down = up - SPIRE.rise - SPIRE.hold;
  return down < SPIRE.fall ? (SPIRE.height * (SPIRE.fall - down)) / SPIRE.fall : 0;
}

export const FLARE_WARN = 70;
export const FLARE_LIVE = 45;

function spawnHazard(s: State, it: Plan) {
  const kind = it.type as HKind;
  const h: Hazard =
    kind === "flare"
      ? { id: s.nextId++, kind, x: it.x ?? 150, w: 24, g: [], half: 0, base: 0, t: 0 }
      : kind === "gate"
        ? { id: s.nextId++, kind, x: W + 8, w: 6, g: [it.y], half: s.chapter <= 7 ? 30 : 27, base: it.y, t: 0 }
        : { id: s.nextId++, kind, x: W + 8, w: 14, g: it.g ?? [60, 156], half: 25, base: 0, t: 0 };
  s.hazards.push(h);
}

function spawn(s: State, type: EType, x: number, y: number, a = 0): Enemy {
  const [baseW, baseH, hp] = SIZE[type];
  const scale = bossScale({ type });
  const w = baseW * scale, h = baseH * scale;
  const e: Enemy = {
    id: s.nextId++, type, x, y, w, h, vx: -1.2, vy: 0, hp, maxHp: hp, t: 0,
    cd: 40 + Math.floor(rand(s) * 50), y0: y, flash: 0, stun: 0, a, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [],
    ...(BOSS_SHIELD_AT[type] ? { shield: BOSS_SHIELD_AT[type], maxShield: BOSS_SHIELD_AT[type], shieldWait: 0 } : {}),
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
    case "swarm": e.vx = -2.4; break;
    case "bomber": e.vx = -1.1; break;
    case "sniper": e.vx = -1.6; break;
    case "orbiter": e.vx = 0; e.b = W - 120 - (Math.floor(y) % 3) * 26; break;
    case "splitter": e.vx = -1; break;
    case "cruiser": e.vx = -0.9; break;
    case "shard": e.vx = -2.3; e.vy = a === 1 ? -1.5 : 1.5; break;
    case "comet": e.vx = -3.2; e.vy = a === 1 ? -0.8 : 0.8; break;
    case "fighter": e.vx = -2.2; break;
    case "funnel": e.vx = 0; break;
    case "tank": e.vx = -1.5; break;
    case "aagun": case "bunker": case "samsite": e.vx = -1.1; break;
    case "jet": e.vx = -3; break;
    case "gunship": e.vx = -1.8; break;
    case "airbomber": e.vx = -1.4; break;
    case "gunboat": e.vx = -1.5; break;
    case "destroyer": e.vx = -0.9; break;
    default: e.vx = -1; e.cd = 90; break;
  }
  if (GROUND_UNITS.includes(type)) e.y = e.y0 = GROUND_Y - h;
  if (SHIPS.includes(type)) e.y = e.y0 = WATER_Y - h;
  s.enemies.push(e);
  return e;
}

/* Frostbite: a hit from a frost shard slows the ship to this share of its speed. */
export const CHILL = { frames: 150, slow: 0.55 };

/* An enemy torpedo from (x, y) along `angle`; `extra` adds the fields of a guided
   or returning one. */
function shoot(s: State, x: number, y: number, angle: number, kind: Bullet["kind"] = "orb", r = 2.6, extra: Partial<Bullet> = {}) {
  if (x < 12 || x > W - 2 || y < 4 || y > H - 4 || s.bullets.filter(b => b.own === "e").length >= 160) return;
  s.bullets.push(torpedo(x, y, angle, { r, own: "e", dmg: 1, kind, ...extra }));
}

/* A shot from the end of the enemy's own barrel (enemyMuzzle), at the ship. The
   drawing aims its barrel with the same enemyMuzzle, so what the player sees
   pointing at the ship is exactly what fires. */
function aimed(s: State, e: Enemy, spread = 0, kind: Bullet["kind"] = "orb", slot = 0) {
  /* The barrel's own angle: a fixed barrel's line, or the line to the spot the
     ship was locked on. Either way it fires exactly the way the barrel points. */
  const m = enemyMuzzle(e, s, slot);
  shoot(s, m.x, m.y, m.angle + spread, kind);
}

/* A ring of shots, the first at `from` radians. */
function ring(s: State, x: number, y: number, n: number, from = 0, kind: Bullet["kind"] = "orb", r = 2.4) {
  for (let i = 0; i < n; i++) shoot(s, x, y, from + (i / n) * Math.PI * 2, kind, r);
}

function burst(s: State, x: number, y: number, big = false) {
  s.bursts.push({ x, y, t: 0, big });
}

/* Damage to an enemy, less of it while it is guarding. */
function damage(e: Enemy, n: number) {
  /* The dreadnought's plating turns most of the damage away, and gives less as it breaks. */
  const plating = e.type === "boss8" ? [0.55, 0.65, 0.8, 0.9, 1, 1][e.a] ?? 1 : 1;
  const shatter = e.freeze !== undefined && e.freeze > 0 ? FREEZE.shatter : 1;
  let dealt = (e.guard > 0 ? n * 0.15 : n) * plating * shatter;
  /* A shield takes it first. */
  if (e.shield !== undefined && e.shield > 0) {
    const taken = Math.min(e.shield, dealt);
    e.shield -= taken;
    dealt -= taken;
    e.shieldWait = BOSS_SHIELD.wait;
    e.shieldHit = 8;
  }
  e.hp -= dealt;
}

/* Everything that is not a boss within `radius` of the point freezes. */
function freezeNear(s: State, x: number, y: number, radius: number) {
  for (const e of s.enemies) {
    if (isBoss(e.type) || e.hp <= 0) continue;
    if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < radius + Math.max(e.w, e.h) / 2) e.freeze = FREEZE.frames;
  }
}

/* A torpedo or an ice bomb going off. A frost torpedo and an ice bomb freeze what they
   catch; a shot that hit a wall rather than an enemy goes off smaller. */
function detonate(s: State, b: Bullet, except = 0, small = false) {
  if (b.kind === "icebomb") {
    const radius = small ? 30 : ICEBOMB.radius;
    explode(s, b.x, b.y, radius, ICEBOMB.damage * POWER, except);
    freezeNear(s, b.x, b.y, radius);
    return;
  }
  const radius = small ? 24 : b.icy ? 38 : 30;
  explode(s, b.x, b.y, radius, (small ? 2 : 4) * POWER, except);
  if (b.icy) freezeNear(s, b.x, b.y, radius);
}

/* The guns a crate can hold. There are fewer crates than there were, so each is a find. */
const GUN_CRATES: PickupKind[] = ["M", "S", "L", "R", "I", "F", "K"];
const GUN_OF: Record<string, Exclude<Gun, "blaster">> = { M: "machine", S: "spread", L: "laser", R: "torpedo", I: "icebomb", F: "flame", K: "katana" };

function drop(s: State, e: Enemy) {
  const x = e.x + e.w / 2;
  const y = e.y + e.h / 2;
  /* A boss leaves nothing: the ship flies off as it falls, with no time to pick anything up. */
  if (isBoss(e.type)) return;
  if (e.type === "pod") {
    /* A supply pod always holds a gun. */
    s.pickups.push({ x, y, kind: GUN_CRATES[Math.floor(rand(s) * GUN_CRATES.length)], t: 0 });
    return;
  }
  if (e.type === "shard" || e.type === "swarm" || e.type === "funnel" || e.type === "smallrock") return;
  if (e.type === "cruiser" || e.type === "destroyer") {
    s.pickups.push({ x, y, kind: "H", t: 0 });
    if (rand(s) < 0.5) s.pickups.push({ x, y: y + 18, kind: GUN_CRATES[Math.floor(rand(s) * GUN_CRATES.length)], t: 0 });
    return;
  }
  const r = rand(s);
  /* The blaster has no power-ups: that share of drops is simply nothing. */
  if (r < 0.12) return;
  if (r < 0.2) s.pickups.push({ x, y, kind: "H", t: 0 });
  else if (r < 0.25) s.pickups.push({ x, y, kind: "B", t: 0 });
  else if (r < 0.27) s.pickups.push({ x, y, kind: GUN_CRATES[Math.floor(rand(s) * GUN_CRATES.length)], t: 0 });
}

function kill(s: State, e: Enemy) {
  s.score += SCORE[e.type];
  if (e.fromPlan) s.stats.kills += 1;
  burst(s, e.x + e.w / 2, e.y + e.h / 2, isBoss(e.type) || e.type === "armor" || e.type === "rock" || HEAVY.includes(e.type));
  if (e.type === "rock" || e.type === "boulder") {
    const a = spawn(s, "smallrock", e.x, e.y - 6);
    const b = spawn(s, "smallrock", e.x, e.y + 8);
    a.vy = -0.9;
    b.vy = 0.9;
  }
  if (e.type === "splitter") {
    for (const vy of [-1.1, 1.1]) {
      const c = spawn(s, "swarm", e.x, e.y + e.h / 2, 0);
      c.vy = vy;
      c.a = -1;
    }
  }
  if (e.type === "mine") ring(s, e.x + e.w / 2, e.y + e.h / 2, 6, 0, "orb", 2.2);
  drop(s, e);
  if (isBoss(e.type)) {
    s.bullets = s.bullets.filter((b) => b.own === "p");
    s.beams = [];
    s.charges = [];
    s.hazards = s.hazards.filter((h) => h.kind !== "flare");
    for (const o of s.enemies) if (o.type === "funnel" || o.type === "shard") o.hp = 0;
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
    p.hp = maxLife(p);
    p.shield = maxShield(p);
    if (p.level === MAX_LEVEL) p.nukes += 1;
    p.morph = MORPH;
    p.inv = Math.max(p.inv, 60);
    s.shake = 18;
    s.bombFlash = 6;
    setCallout(
      s,
      p.level === UPGRADE_AT.hypersonic ? "hypersonic" : p.level === UPGRADE_AT.armor ? "mechshield" : p.level === TWIN_AT ? "launcher" : p.level === UPGRADE_AT.repair ? "repair" : p.level === UPGRADE_AT.hq ? "hq" : "levelup",
    );
    burst(s, p.x + shipSize(p.level).w / 2, p.y + shipSize(p.level).h / 2, true);
  }
}

/* Returns whether the ship was actually hurt (it is not while it is flashing). A hit
   takes LIFE.hit, less with the armour; the shield takes it first and then the ship's own
   health, and nothing else is touched: no upgrade and no level is ever lost. */
function hurtPlayer(s: State, amount = LIFE.hit): boolean {
  const p = s.p;
  if (p.inv > 0 || s.phase !== "play") return false;
  let dmg = amount * (hasUpgrade(p, "armor") ? 1 - ARMOR.reduction : 1);
  s.stats.hits += 1;
  p.inv = 100;
  p.calm = CALM;
  const soaked = Math.min(p.shield, dmg);
  if (soaked > 0) {
    p.shield -= soaked;
    p.shieldFlash = 24;
    dmg -= soaked;
  }
  if (dmg > 0) p.hp -= dmg;
  burst(s, p.x + shipSize(p.level).w / 2, p.y + shipSize(p.level).h / 2, false);
  if (p.hp <= 0) {
    p.hp = 0;
    s.phase = "dead";
  }
  return true;
}

/* A nuclear blast: for as long as it lasts the screen is clear of enemy fire, and every
   few frames everything caught in it is hurt. */
function tickNuke(s: State) {
  const n = s.nuke;
  if (!n) return;
  n.t += 1;
  s.bullets = s.bullets.filter((b) => b.own === "p");
  s.beams = [];
  s.charges = s.charges.filter((c) => (c.kind ?? "c4") === "c4" && c.t >= C4.fuse);
  s.hazards = s.hazards.filter((h) => h.kind === "gate" || h.kind === "wall");
  s.shake = Math.max(s.shake, 10);
  if (n.t % NUKE.every === 1) {
    for (const e of s.enemies) {
      damage(e, isBoss(e.type) ? NUKE.boss : NUKE.regular);
      e.flash = 5;
    }
  }
  if (n.t >= NUKE.frames) s.nuke = null;
}

/* A throw of ten bombs, fanned out ahead of the ship, some falling short and some going
   far. They slow to a stop and the scenery carries them back a little. */
function throwBombs(s: State) {
  const m = podMuzzle(s.p);
  for (let i = 0; i < BOMBS.count; i++) {
    const u = i / (BOMBS.count - 1);
    const ang = -0.95 + u * 1.9;
    const speed = 3 + (2.4 * ((i * 7) % 10)) / 9;
    s.timedBombs.push({ x: m.x, y: m.y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, t: 0 });
  }
}

function tickBombs(s: State) {
  for (const b of s.timedBombs) {
    b.t += 1;
    b.x += b.vx;
    b.y = clamp(b.y + b.vy, 22, H - 10);
    b.vx *= 0.95;
    b.vy *= 0.95;
    if (b.t > 30) b.x -= 0.12;
    if (b.t < BOMBS.fuse) continue;
    burst(s, b.x, b.y, true);
    s.shake = Math.max(s.shake, 5);
    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      if (Math.hypot(e.x + e.w / 2 - b.x, e.y + e.h / 2 - b.y) < BOMBS.radius + Math.max(e.w, e.h) / 2) {
        damage(e, isBoss(e.type) ? BOMBS.boss : BOMBS.damage);
        e.flash = 5;
      }
    }
    s.bullets = s.bullets.filter((o) => o.own === "p" || Math.hypot(o.x - b.x, o.y - b.y) > BOMBS.radius + 4);
    s.charges = s.charges.filter((c) => Math.hypot(c.x - b.x, c.y - b.y) > BOMBS.radius + 4 || ((c.kind ?? "c4") === "c4" && c.t >= C4.fuse));
  }
  s.timedBombs = s.timedBombs.filter((b) => b.t < BOMBS.fuse);
}

/* A warhead leaves the ship slowly, then speeds up and steers after its target: the boss
   if there is one, else the nearest enemy ahead, else the middle of the screen. */
function launchWarhead(s: State) {
  const p = s.p;
  const m = podMuzzle(p);
  const boss = s.enemies.find((e) => isBoss(e.type) && e.hp > 0);
  let target = boss?.id ?? 0;
  if (!target) {
    let best = 1e9;
    for (const e of s.enemies) {
      if (e.hp <= 0 || e.x + e.w < p.x) continue;
      const d = Math.hypot(e.x + e.w / 2 - m.x, e.y + e.h / 2 - m.y);
      if (d < best) { best = d; target = e.id; }
    }
  }
  s.warheads.push({ x: m.x, y: m.y, vx: 2, vy: 0, t: 0, target });
}

function detonateWarhead(s: State, w: Warhead) {
  w.done = true;
  s.nuke = { t: 0, x: w.x, y: w.y };
  s.p.inv = Math.max(s.p.inv, NUKE.frames);
  s.bombFlash = 14;
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    if (Math.hypot(e.x + e.w / 2 - w.x, e.y + e.h / 2 - w.y) < NUKE.blast + Math.max(e.w, e.h) / 2) {
      damage(e, isBoss(e.type) ? e.maxHp * NUKE.bossShare : NUKE.direct);
      e.flash = 6;
    }
  }
}

function tickWarheads(s: State) {
  for (const w of s.warheads) {
    w.t += 1;
    const target = s.enemies.find((e) => e.id === w.target && e.hp > 0);
    const tx = target ? target.x + target.w / 2 : W * 0.7;
    const ty = target ? target.y + target.h / 2 : w.y;
    const cur = Math.atan2(w.vy, w.vx);
    const want = Math.atan2(ty - w.y, tx - w.x);
    const heading = cur + clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -0.14, 0.14);
    const speed = Math.min(NUKE.speed, 1.6 + w.t * 0.14);
    w.vx = Math.cos(heading) * speed;
    w.vy = Math.sin(heading) * speed;
    w.x += w.vx;
    w.y += w.vy;
    const hit = s.enemies.some((e) => e.hp > 0 && w.x > e.x && w.x < e.x + e.w && w.y > e.y && w.y < e.y + e.h);
    if (hit || (!target && Math.hypot(tx - w.x, ty - w.y) < 8) || w.x > W - 4 || w.t > 170) detonateWarhead(s, w);
  }
  s.warheads = s.warheads.filter((w) => !w.done);
}

/* Whether the self-repair is mending something right now, for the drawing. */
export function isRepairing(p: State["p"]) {
  return hasUpgrade(p, "repair") && p.calm <= 0 && (p.hp < maxLife(p) || p.shield < maxShield(p));
}

/* The HQ slides in at level 9 and out if it is lost. Once it is in, each launcher fires in
   its turn while there is an enemy on screen; with nothing to shoot at they wait, ready. */
function tickHq(s: State) {
  const hq = s.hq;
  const on = hasUpgrade(s.p, "hq");
  hq.slide = clamp(hq.slide + (on ? 0.04 : -0.06), 0, 1);
  for (let i = 0; i < hq.kick.length; i++) if (hq.kick[i] > 0) hq.kick[i] -= 1;
  if (!on || hq.slide < 1 || s.phase !== "play") return;
  const foes = s.enemies.some((e) => e.hp > 0 && e.x < W - 4 && e.x + e.w > 0);
  if (hq.gap > 0) hq.gap -= 1;
  for (let i = 0; i < HQ_LAUNCHERS.length; i++) if (hq.cd[i] > 0) hq.cd[i] -= 1;
  if (!foes || hq.gap > 0) return;
  for (let i = 0; i < HQ_LAUNCHERS.length; i++) {
    if (hq.cd[i] > 0) continue;
    const l = HQ_LAUNCHERS[i];
    s.bullets.push(torpedo(l.x, l.y, i < HQ_LAUNCHERS.length / 2 ? HQ.tilt : -HQ.tilt, { r: 3, own: "p", dmg: HQ.damage, kind: "torpedo", life: 300, track: HQ.track, turn: HQ.turn }));
    hq.cd[i] = HQ.cooldown;
    hq.kick[i] = 8;
    hq.gap = HQ.stagger;
    return;
  }
}

/* The boss is down: the ship settles in the middle of the screen, then lights its engines
   and flies off to the right, on to the next chapter. */
function flyAway(s: State) {
  const p = s.p;
  const size = shipSize(p.level);
  const ty = H / 2 - size.h / 2;
  p.inv = 0;
  if (s.clearFor < CLEAR.go) {
    p.x += (W / 2 - size.w / 2 - p.x) * 0.07;
    p.y += (ty - p.y) * 0.07;
  } else {
    p.x += Math.min(16, 1.5 + (s.clearFor - CLEAR.go) * 0.4);
    p.y += (ty - p.y) * 0.1;
  }
  p.tilt += (clamp((ty - p.y) / 20, -1, 1) * 0.26 - p.tilt) * 0.18;
}

/* How hard the stars are streaking past, 0 to 1: after take-off in space, and as the ship
   leaves at the end of a chapter. */
export function warpPower(s: State) {
  if (s.chapter < 3) return 0;
  if (s.phase === "clear") return clamp((s.clearFor - CLEAR.go) / 40, 0, 1);
  return clamp(s.warp / WARP.frames, 0, 1);
}

/* A blast: everything near the point takes damage, the boss included. */
function explode(s: State, x: number, y: number, radius: number, dmg: number, except = 0) {
  burst(s, x, y, true);
  for (const e of s.enemies) {
    if (e.id === except) continue;
    const reach = radius + Math.max(e.w, e.h) / 2;
    if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < reach) {
      damage(e, dmg);
      e.flash = 4;
    }
  }
}

function setCallout(s: State, kind: Callout) {
  s.callout = { kind, t: 150 };
}

function puff(s: State, x: number, y: number, vx: number, vy: number, life: number, r: number, tone: number) {
  if (s.smoke.length > 220) s.smoke.shift();
  s.smoke.push({ x, y, vx, vy, t: 0, life, r, tone });
}

function tickSmoke(s: State) {
  for (const k of s.smoke) {
    k.t += 1;
    k.x += k.vx;
    k.y += k.vy;
    k.vx *= 0.97;
    k.vy -= 0.004;
    k.r += 0.09;
  }
  s.smoke = s.smoke.filter((k) => k.t < k.life);
}

/* Enemies that aim at the ship lock on first: for the last LOCK_FRAMES before a shot
   (and for the whole of a burst) the barrel stops turning and stays on the spot the
   ship was in when the lock began, with a red mark there. The shot goes to that
   spot. A ship that has moved on is simply missed. */
export const LOCK_FRAMES = 30;

/* A guided missile (seeker) is thrown clear of its launcher and slows, then hangs
   there while its nose swings round after the ship a little at a time, then locks
   the spot the ship is in and holds that lock, red mark and all, before its motor
   lights and it runs straight at the spot, on the torpedo's motor but 15% slower
   than the ship's torpedo (pace). Once it runs it never turns. Frames for each
   stage, the most its nose turns in a frame while it tracks, and its pace. */
export const MISSILE = { out: 16, track: 44, lock: 40, turn: 0.07, pace: 0.85 };
export const MISSILE_RUN = MISSILE.out + MISSILE.track + MISSILE.lock;

export type MissileStage = "out" | "track" | "lock" | "run";

export function missileStage(t: number): MissileStage {
  if (t <= MISSILE.out) return "out";
  if (t <= MISSILE.out + MISSILE.track) return "track";
  if (t <= MISSILE_RUN) return "lock";
  return "run";
}
const LOCKING = new Set<string>(["tank", "aagun", "gunship", "destroyer", "cruiser", "armor", "splitter", "funnel"]);

/* How each enemy fires. Which of these an enemy does is also what its drawing
   shows, so the two cannot disagree:
     aimed, from a swivelling barrel (aimed): tank, aagun, destroyer, gunship,
       cruiser's upper turret, the flagship's forward turrets
     fixed barrel, on a bracket that does not turn (fixedAim): gunner, turret,
       bunker, gunboat, cruiser's lower turret, the flagship's aft turret
     aimed, from the front of the body (aimed): armor, splitter, funnel
     fixed, straight ahead (no barrel): wave, jet, fighter; sniper (one marked, fast shot)
     dropped, straight down, only when the ship is below: bomber, airbomber
     all round: orbiter (a cross), mine (a ring when it dies)
     guided missiles: seeker (hangs, turns after the ship, locks its spot, then runs
       straight; see MISSILE), which is also what the sam site, cruiser, destroyer
       and the bosses launch
   Every shot is a torpedo with the ship's own motor (TORPEDO), so the line it
   leaves on is the line it keeps, at the same speed in every chapter. */
function updateEnemy(s: State, e: Enemy) {
  /* Early chapters reload more slowly (see DIFFICULTY). */
  const ease = profile(s).fire;
  e.t += 1;
  if (e.flash > 0) e.flash -= 1;
  if (e.guard > 0) e.guard -= 1;
  e.parts = [];
  /* A frozen enemy barely moves and does not fire until it thaws. */
  if (e.freeze !== undefined && e.freeze > 0 && !isBoss(e.type)) {
    e.freeze -= 1;
    e.x += e.vx * FREEZE.slow;
    return;
  }
  const p = s.p;
  const py = p.y + shipSize(s.p.level).h / 2;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  if (LOCKING.has(e.type)) {
    if (e.n > 0) {
      /* Mid-burst: it keeps the lock it began with. */
    } else if (e.cd <= 0) e.lock = { x: p.x + shipSize(p.level).w / 2, y: py };
    else if (e.cd <= LOCK_FRAMES) e.lock ??= { x: p.x + shipSize(p.level).w / 2, y: py };
    else e.lock = undefined;
  }

  switch (e.type) {
    case "scout":
    case "smallrock":
    case "rock":
    case "pod":
    case "shard":
    case "comet":
      e.x += e.vx;
      e.y += e.vy;
      if (e.type === "pod") e.y = e.y0 + Math.sin(e.t / 24) * 10;
      break;
    case "wave":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 22) * 34;
      if (--e.cd <= 0 && e.x < W - 20) {
        shoot(s, e.x, e.y + e.h / 2, Math.PI);
        e.cd = Math.round(100 * ease);
      }
      break;
    case "swarm":
      e.x += e.vx;
      e.y += e.vy;
      if (e.a >= 0) e.y = e.y0 + Math.sin(e.t / 11 + e.a) * 22;
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
          aimed(s, e);
          e.cd = Math.round(75 * ease);
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
        aimed(s, e, 0, "needle");
        e.cd = Math.round(100 * ease);
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
        for (const sp of [-0.35, 0, 0.35]) aimed(s, e, sp);
        e.cd = Math.round(110 * ease);
      }
      break;
    case "seeker": {
      /* A guided missile, in the stages set out at MISSILE. Its heading is e.rot. */
      const stage = missileStage(e.t);
      const tx = p.x + shipSize(p.level).w / 2;
      if (e.t === 1) e.rot = Math.atan2(e.vy, e.vx);
      if (stage === "out") {
        /* Thrown clear of the launcher, slowing as it goes. */
        e.vx *= 0.9;
        e.vy *= 0.9;
      } else if (stage === "track") {
        /* Hangs there, edging toward the ship's height while its nose swings
           round after the ship. */
        const want = Math.atan2(py - cy, tx - cx);
        e.rot += clamp(Math.atan2(Math.sin(want - e.rot), Math.cos(want - e.rot)), -MISSILE.turn, MISSILE.turn);
        e.vx = -0.3;
        e.vy = clamp((py - cy) * 0.02, -0.45, 0.45);
      } else if (stage === "lock") {
        /* Locked on the spot the ship was in, and holding still on it. */
        if (!e.lock) e.lock = { x: tx, y: py };
        e.rot = Math.atan2(e.lock.y - cy, e.lock.x - cx);
        e.vx = 0;
        e.vy = 0;
      } else {
        /* The motor lights and it runs straight at the locked spot. */
        const v = torpedoSpeed(TORPEDO.eject + TORPEDO.ignite + e.t - MISSILE_RUN) * MISSILE.pace;
        e.vx = Math.cos(e.rot) * v;
        e.vy = Math.sin(e.rot) * v;
      }
      e.x += e.vx;
      e.y += e.vy;
      if (e.t > 420) e.x = -200;
      break;
    }
    case "bomber":
      /* Drops a slow bomb from the bay under it, straight down, and only when the
         ship is below; with the ship above it flies on and keeps its bombs. */
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 40) * 10;
      if (--e.cd <= 0 && e.x < W - 20 && e.x > 40) {
        if (py > cy + 4) {
          shoot(s, cx, e.y + e.h, Math.atan2(1.6, -0.45), "orb", 3.2);
          e.cd = Math.round(70 * ease);
        } else e.cd = Math.round(10 * ease);
      }
      break;
    case "sniper":
      /* Takes a place at the edge, follows the ship's height, then marks a line
         and fires one fast shot down it. */
      if (e.x > W - 34) e.x += e.vx;
      else if (e.t > 640) e.x -= 2.4;
      else if (e.d > 0) {
        if (--e.d === 0) { const m = enemyMuzzle(e, s); shoot(s, m.x, m.y, Math.PI, "needle", 2.4); }
      } else {
        e.y = clamp(e.y + clamp(py - cy, -0.55, 0.55), 12, H - 12 - e.h);
        if (--e.cd <= 0) {
          e.d = 40;
          s.beams.push({ y: cy, h: 0, x0: enemyMuzzle(e, s).x, t: 0, warn: 40, live: 0 });
          e.cd = Math.round(130 * ease);
        }
      }
      break;
    case "orbiter": {
      /* Slides in, then wheels around a point, throwing a cross of shots. */
      const ax = e.t > 700 ? e.b - (e.t - 700) * 1.6 : Math.max(e.b, W + 20 - e.t * 1.6);
      e.c += 0.035;
      e.x = ax + Math.cos(e.c) * 26;
      e.y = clamp(e.y0 + Math.sin(e.c) * 26, 14, H - 14 - e.h);
      if (--e.cd <= 0 && e.x < W - 20) {
        ring(s, cx, cy, 4, e.c, "orb", 2.3);
        e.cd = Math.round(110 * ease);
      }
      break;
    }
    case "splitter":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 34) * 16;
      if (--e.cd <= 0 && e.x < W - 24) {
        aimed(s, e);
        e.cd = Math.round(90 * ease);
      }
      break;
    case "cruiser":
      /* A mid-boss: parks at the edge, sways, and fires fans of shots and missiles. */
      if (e.x > W - 92 && e.b === 0) e.x += e.vx;
      else {
        e.b += 1;
        e.y = clamp(H / 2 - e.h / 2 + Math.sin(e.b / 60) * 38, 14, H - 14 - e.h);
        if (--e.cd <= 0) {
          /* Its two turrets take turns. */
          e.d = 1 - e.d;
          for (const sp of [-0.3, 0, 0.3]) aimed(s, e, sp, "orb", e.d);
          e.cd = Math.round(85 * ease);
        }
        if (e.b % 210 === 100) {
          const m = spawn(s, "seeker", e.x, cy);
          m.vx = -1.4;
        }
        if (e.b > 1000) e.x -= 1.2;
      }
      break;
    case "fighter":
      /* Dives in, then chases the ship's height and fires in bursts of three. */
      if (e.x > W - 110) e.x += e.vx;
      else if (e.t > 620) e.x -= 2.6;
      else {
        e.y = clamp(e.y + clamp(py - cy, -1.15, 1.15), 12, H - 12 - e.h);
        e.x = W - 110 + Math.sin(e.t / 50) * 14;
        if (e.n > 0) {
          if (--e.cd <= 0) {
            shoot(s, e.x, cy, Math.PI, "needle", 2.2);
            e.n -= 1;
            e.cd = e.n > 0 ? 6 : Math.round(70 * ease);
          }
        } else if (--e.cd <= 0) {
          e.n = 3;
          e.cd = 0;
        }
      }
      break;
    case "funnel": {
      /* A floating gun that wheels around its boss; it falls with the boss. */
      const owner = s.enemies.find((o) => o.id === e.a);
      if (!owner || owner.hp <= 0) {
        e.hp = 0;
        break;
      }
      e.b += 0.045;
      e.x = owner.x + owner.w / 2 + Math.cos(e.b) * 54 - e.w / 2;
      e.y = owner.y + owner.h / 2 + Math.sin(e.b) * 40 - e.h / 2;
      if (--e.cd <= 0) {
        aimed(s, e, 0, "needle");
        e.cd = Math.round(100 * ease);
      }
      break;
    }
    case "tank":
      e.x += e.vx;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 40) {
        aimed(s, e);
        e.cd = Math.round(105 * ease);
      }
      break;
    case "aagun":
      /* Fires short bursts straight up at the ship. */
      e.x += e.vx;
      if (e.n > 0) {
        if (--e.d <= 0) {
          aimed(s, e, 0, "needle");
          e.n -= 1;
          e.d = 5;
        }
      } else if (--e.cd <= 0 && e.x < W - 24 && e.x > 40) {
        e.n = s.chapter === 1 ? 2 : 3;
        e.d = 0;
        e.cd = Math.round(90 * ease);
      }
      break;
    case "bunker":
      e.x += e.vx;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 40) {
        for (const sp of s.chapter === 1 ? [-0.25, 0, 0.25] : [-0.4, -0.2, 0, 0.2, 0.4]) aimed(s, e, sp);
        e.cd = Math.round(120 * ease);
      }
      break;
    case "samsite":
      /* Lofts a homing missile that climbs, then turns on the ship. */
      e.x += e.vx;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 70) {
        const tip = missileMuzzle(e);
        const m = spawn(s, "seeker", tip.x - 7, tip.y - 3.5);
        m.vx = -0.7;
        m.vy = -1.5;
        e.cd = Math.round(170 * ease);
      }
      break;
    case "jet":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 26 + e.a) * 14;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 40) {
        shoot(s, e.x, cy, Math.PI, "needle", 2.2);
        e.cd = Math.round(80 * ease);
      }
      break;
    case "gunship":
      /* A helicopter: comes in, hovers and sways, fires bursts of three. */
      if (e.x > W - 96) e.x += e.vx;
      else if (e.t > 620) e.x -= 2;
      else {
        e.y = clamp(e.y0 + Math.sin(e.t / 30) * 20, 20, GROUND_Y - 60);
        if (e.n > 0) {
          if (--e.d <= 0) {
            aimed(s, e, 0, "needle");
            e.n -= 1;
            e.d = 6;
          }
        } else if (--e.cd <= 0) {
          e.n = s.chapter === 1 ? 2 : 3;
          e.d = 0;
          e.cd = Math.round(95 * ease);
        }
      }
      break;
    case "airbomber":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 50) * 8;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 40) {
        /* Bombs fall straight from the bay; with the ship above, it holds them. */
        if (py > cy + 4) {
          shoot(s, cx, e.y + e.h, Math.atan2(1.6, -0.6), "orb", 3.2);
          e.cd = Math.round(60 * ease);
        } else e.cd = Math.round(10 * ease);
      }
      break;
    case "gunboat":
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 22) * 1.2;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 40) {
        aimed(s, e);
        e.cd = Math.round(95 * ease);
      }
      break;
    case "destroyer":
      /* The sea's mid-boss: holds station off the bow, fans of shells and
         missiles that climb away from the deck. */
      if (e.x > W - 112 && e.b === 0) e.x += e.vx;
      else {
        e.b += 1;
        e.y = e.y0 + Math.sin(e.b / 40) * 1.5;
        if (--e.cd <= 0) {
          for (const sp of [-0.3, 0, 0.3]) aimed(s, e, sp);
          e.cd = Math.round(85 * ease);
        }
        if (e.b % 190 === 100) {
          const m = spawn(s, "seeker", cx, e.y);
          m.vx = -0.8;
          m.vy = -1.5;
        }
        if (e.b > 1000) e.x -= 1.2;
      }
      break;
    case "boulder":
      /* Thrown by the hermit: it tumbles across the screen and bounces off the
         top and the bottom, and breaks into rocks when it is shot. */
      e.x += e.vx;
      e.y += e.vy;
      e.rot += 0.06;
      if (e.y < 22 || e.y + e.h > H - 8) e.vy = -e.vy * 0.8;
      if (e.t > 500) e.x = -200;
      break;
    case "boss1": case "boss2": case "boss3": case "boss4":
    case "boss5": case "boss6": case "boss7": case "boss8":
      updateBoss(s, e);
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

/* Moves a boss toward a point, a few pixels a frame at most. */
function glide(e: Enemy, tx: number, ty: number, max = 3) {
  e.x += clamp(tx - e.x, -max, max);
  e.y += clamp(ty - e.y, -max, max);
}

/* A boss moves up a phase when its health passes a mark: what it has fired is
   wiped, it goes quiet for a moment, and the next phase has more attacks. */
function phaseUp(s: State, e: Enemy, cuts: number[]) {
  let ph = 0;
  for (const c of cuts) if (e.hp / e.maxHp <= c) ph += 1;
  if (ph > e.a) {
    e.a = ph;
    s.bullets = s.bullets.filter((b) => b.own === "p");
    s.beams = [];
    s.shake = 30;
    s.bombFlash = 6;
    e.stun = 55;
    setCallout(s, "phase");
    for (let i = 0; i < 7; i++) burst(s, e.x + rand(s) * e.w, e.y + rand(s) * e.h, true);
  }
  if (e.stun > 0) {
    e.stun -= 1;
    return true;
  }
  return false;
}

export const BOSS_SCALE: Partial<Record<EType, number>> = {
  boss1: 1.3, boss2: 1.3, boss3: 1.3, boss4: 1.3,
  boss5: 1.65, boss6: 1.45, boss7: 1.65, boss8: 1.35,
};
export const bossScale = (e: Pick<Enemy, "type" | "renderScale">) => e.renderScale ?? BOSS_SCALE[e.type] ?? 1;
export function bossModel(e: Enemy): Enemy {
  const k = bossScale(e);
  return { ...e, w: e.w / k, h: e.h / k, renderScale: 1,
    lock: e.lock ? { x: e.x + (e.lock.x - e.x) / k, y: e.y + (e.lock.y - e.y) / k } : undefined,
    trail: e.trail?.map(p => ({ x: e.x + (p.x - e.x) / k, y: e.y + (p.y - e.y) / k })) };
}
export function bossPoint(e: Enemy, p: { x: number; y: number }) {
  const k = bossScale(e);
  return { x: e.x + (p.x - e.x) * k, y: e.y + (p.y - e.y) * k };
}

export function coils(e: Enemy, n = 10, gap = 15 * bossScale(e)) {
  const out: { x: number; y: number }[] = [];
  const trail = e.trail ?? [];
  let carried = 0;
  for (let i = trail.length - 1; i > 0 && out.length < n; i--) {
    carried += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
    if (carried >= gap) { out.push(trail[i - 1]); carried = 0; }
  }
  return out;
}

/* Barrels that do not turn. These guns fire along the same line whatever the ship
   does, and are drawn on a fixed bracket instead of a swivel, so a player can see
   at a glance which guns track them and which only cover one line. Returns the
   angle the barrel is fixed at, or null when it turns toward the ship. */
export function fixedAim(e: Enemy, slot = 0): number | null {
  switch (e.type) {
    case "sniper":
    case "gunner":
      return Math.PI;
    case "turret":
      /* A wall gun covers a diagonal down or up the screen from its mount. */
      return e.a === 0 ? Math.PI - 0.55 : Math.PI + 0.55;
    case "bunker":
      return Math.PI + 0.3;
    case "gunboat":
      return Math.PI + 0.1;
    case "cruiser":
      return slot === 1 ? Math.PI : null;
    case "boss2":
      return ((slot % 3) + 3) % 3 === 2 ? Math.PI + 0.2 : null;
    default:
      return null;
  }
}

/* The renderer and firing rules use the same mount and barrel geometry. */
export function enemyMuzzle(e: Enemy, s: State, slot = 0): { x: number; y: number; angle: number } {
  if (bossScale(e) !== 1) {
    const k = bossScale(e);
    const model = bossModel(e);
    const size = shipSize(s.p.level);
    const target = { ...s, p: { ...s.p, x: e.x + (s.p.x + size.w / 2 - e.x) / k - size.w / 2, y: e.y + (s.p.y + size.h / 2 - e.y) / k - size.h / 2 } };
    const m = enemyMuzzle(model, target, slot);
    return { ...bossPoint(e, m), angle: m.angle };
  }
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  let x = e.x, y = cy, length = 0;
  switch (e.type) {
    case "boss1": x = e.x + 30; y = e.y + 14; length = 34; break;
    case "boss2": x = e.x + [18, 34, 78][((slot % 3) + 3) % 3]; y = e.y + e.h - 26; length = 17; break;
    case "boss3": x = e.x - 10; y = cy + (slot === 0 ? 0 : slot * 22); break;
    case "boss4": x = e.x - 2; y = cy + slot * 20; break;
    case "boss5": x = e.x - 14; y = cy + 3; break;
    case "boss6": x = cx - 31; y = cy - 1; break;
    case "boss7": x = e.x - 3; y = e.y + 19; break;
    case "boss8": x = e.x + 5; y = cy + slot * 24; break;
    case "tank": x = e.x + 14; y = e.y + 4; length = 14; break;
    case "aagun": x = cx; y = e.y + 4; length = 14; break;
    case "gunboat": x = e.x + 6; y = e.y + 2; length = 12; break;
    case "destroyer": x = e.x + 10; y = e.y + 2; length = 14; break;
    case "turret": x = cx; y = e.a === 0 ? e.y + 4 : e.y + e.h - 4; length = 12; break;
    case "sniper": x = e.x + 8; length = 16; break;
    case "gunner": x = e.x + 5; length = 9; break;
    case "gunship": x = e.x + 4; y = cy + 2; length = 9; break;
    case "cruiser": x = e.x + 29; y = cy + (slot ? 12 : -12); length = 12; break;
    case "bunker": x = cx; y = e.y + 10; length = 8; break;
  }
  const tx = e.lock ? e.lock.x : s.p.x + shipSize(s.p.level).w / 2;
  const ty = e.lock ? e.lock.y : s.p.y + shipSize(s.p.level).h / 2;
  const angle = fixedAim(e, slot) ?? e.attack?.angle ?? Math.atan2(ty - y, tx - x);
  return { x: x + Math.cos(angle) * length, y: y + Math.sin(angle) * length, angle };
}

export function beamMuzzle(e: Enemy, slot = 0): { x: number; y: number } {
  if (bossScale(e) !== 1) return bossPoint(e, beamMuzzle(bossModel(e), slot));
  const cy = e.y + e.h / 2;
  if (e.type === "boss2") return { x: e.x - 8, y: e.y + e.h - 20 };
  if (e.type === "boss7") return { x: e.x - 3, y: e.y + 19 };
  return { x: e.x + (e.type === "boss8" ? 5 : -10), y: cy + slot * (e.type === "boss8" ? 24 : 20) };
}

export function missileMuzzle(e: Enemy, slot = 0): { x: number; y: number } {
  if (bossScale(e) !== 1) return bossPoint(e, missileMuzzle(bossModel(e), slot));
  if (e.type === "samsite") return { x: e.x + 8 + Math.cos(-2) * 15, y: e.y + e.h - 7 + Math.sin(-2) * 15 };
  if (e.type === "boss1") return { x: e.x + e.w - 17, y: e.y + 12 };
  if (e.type === "boss2") return { x: e.x + 31, y: e.y + e.h - 33 };
  return { x: e.x + 78, y: e.y + e.h / 2 + (slot ? 17 : -17) };
}

export function attackSlot(e: Enemy) {
  return e.type === "boss3" && e.attack?.kind === "fan" ? ((e.attackIndex ?? 0) % 2 ? -1 : 1) : 0;
}

const BOSS_MOVES: Record<string, AttackKind[][]> = {
  boss1: [["fan", "burst"], ["fan", "stomp", "burst", "flak", "missiles"], ["stomp", "flak", "fan", "stomp", "missiles", "curtain", "flak"]],
  boss2: [["burst", "fan"], ["burst", "surge", "fan", "salvo", "missiles"], ["salvo", "burst", "surge", "beam", "missiles", "salvo", "fan"]],
  boss3: [["fan", "burst"], ["fan", "boulders", "beam", "pincer", "support"], ["pincer", "boulders", "fan", "beam", "pincer", "burst", "support"]],
  boss4: [["spiral", "fan"], ["spiral", "spores", "beam", "undertow", "support"], ["undertow", "spores", "spiral", "beam", "curtain", "spores", "support"]],
  boss5: [["fan", "curtain"], ["fan", "frost", "charge", "breach", "curtain"], ["breach", "frost", "curtain", "charge", "fan", "frost"]],
  boss6: [["fan", "charge"], ["fan", "wisps", "flare", "dive", "charge"], ["dive", "wisps", "curtain", "flare", "dive", "charge", "wisps"]],
  boss7: [["burst", "charge"], ["burst", "crescent", "support", "blink", "charge"], ["blink", "crescent", "burst", "beam", "blink", "charge", "support", "crescent"]],
  boss8: [["burst", "fan", "beam"], ["missiles", "fan", "beam", "support"], ["spiral", "beam", "charge", "curtain", "missiles"], ["nova", "beam", "flare", "curtain", "charge", "spiral"], ["nova", "spiral", "beam", "flare", "curtain", "charge", "missiles", "nova"], ["c4", "burst", "c4", "spiral", "c4", "missiles"]],
};

/* The signature attacks, each belonging to one boss: its move, and its weapon.
     1 siege tank   stomp (rears and slams, shockwaves run along the ground)
                    flak (mortar shells burst into rings of fire at marked spots)
     2 flagship     surge (rams forward along the water)
                    salvo (heavy shells down four marked lanes)
     3 hermit       pincer (two arms clamp shut across the screen around a gap)
                    boulders (hurls rocks you can shoot, which break into more)
     4 hive carrier undertow (a tractor beam pulls the ship in, then blooms)
                    spores (clouds that settle and stay)
     5 iron worm    breach (dives under, then spires erupt from the floor)
                    frost (a cone of shards that chill: slow the ship)
     6 bomber       dive (a plunge across the screen, leaving fire behind)
                    wisps (plasma that steers after the ship for a while)
     7 Crimson Fang blink (vanishes and strikes at a marked spot)
                    crescent (blades that turn round and come back)
   Every one warns for 44 to 60 frames, shows where it will land, and leaves a
   way through. Warn and live frames for each: */
export const SIGNATURE: AttackKind[] = [
  "stomp", "flak", "surge", "salvo", "pincer", "boulders", "undertow", "spores", "breach", "frost", "dive", "wisps", "blink", "crescent", "c4",
];
const TIMING: Partial<Record<AttackKind, [number, number]>> = {
  stomp: [52, 62], flak: [48, 100], surge: [56, 112], salvo: [56, 72], pincer: [56, 88], boulders: [44, 50], undertow: [48, 96],
  spores: [44, 36], breach: [56, 70], frost: [48, 46], dive: [60, 90], wisps: [44, 30], blink: [56, 40], crescent: [52, 20],
};
export const STOMP = { lift: 14, slam: 3 };
export const SURGE = { out: 5.2, stop: 70, hold: 8, back: 3.2, wind: 10 };
export const PINCER = { gap: 54, open: 26, hold: 34, close: 26 };
export const UNDERTOW = { pull: 1.15, ramp: 12 };
export const DIVE = { top: 22, speed: 6.4 };
export const BLINK = { gone: 14, blade: 4, strike: 22, reach: 104, bladeH: 26 };
export const WISP = { track: 90, turn: 0.024 };
export const CRESCENT = { turnX: 58 };
const SPORE_COLS = [70, 115, 160, 205];
const SPORE_ROWS = [52, 96, 140, 182];

/* How far the pincer arms have closed, 0 to 1, `t` frames into the attack. */
export function pinch(t: number) {
  if (t < PINCER.open) return t / PINCER.open;
  if (t < PINCER.open + PINCER.hold) return 1;
  const down = t - PINCER.open - PINCER.hold;
  return down < PINCER.close ? 1 - down / PINCER.close : 0;
}

/* Some spots on a grid, leaving one cell and every cell beside it clear, so a
   volley never covers the whole of the ship's side of the screen. */
function pickSpots(s: State, n: number, cols: number[], rows: number[], jitter: number) {
  const cells: { c: number; r: number }[] = [];
  for (let c = 0; c < cols.length; c++) for (let r = 0; r < rows.length; r++) cells.push({ c, r });
  const safe = cells[Math.floor(rand(s) * cells.length)];
  const open = cells.filter((k) => Math.abs(k.c - safe.c) + Math.abs(k.r - safe.r) > 1);
  for (let i = open.length - 1; i > 0; i--) {
    const j = Math.floor(rand(s) * (i + 1));
    [open[i], open[j]] = [open[j], open[i]];
  }
  return open.slice(0, n).map((k) => ({ x: cols[k.c] + (rand(s) - 0.5) * jitter, y: rows[k.r] + (rand(s) - 0.5) * jitter }));
}

function nextBossAttack(s: State, e: Enemy) {
  const moves = BOSS_MOVES[e.type][e.a];
  const index = e.attackIndex ?? 0;
  const kind = moves[index % moves.length];
  e.attackIndex = index + 1;
  const timing = TIMING[kind];
  const warn = timing ? timing[0] : kind === "charge" ? 64 : kind === "beam" ? 62 : kind === "curtain" ? 48 : kind === "nova" ? 44 : kind === "c4" ? 40 : 36;
  const live = timing ? timing[1] : kind === "charge" ? 104 : kind === "beam" ? 34 : kind === "spiral" ? 84 : kind === "burst" ? 42 : kind === "missiles" ? 32 : kind === "nova" ? 26 : kind === "c4" ? C4.count * C4.every : 1;
  const muzzle = enemyMuzzle(e, s);
  /* What a signature attack will cover is chosen now, so that the warning can show it. */
  const extra: Partial<BossAttack> = {};
  if (kind === "salvo") {
    const y0 = 34 + rand(s) * 22;
    extra.lanes = [0, 1, 2, 3].map((i) => Math.round(y0 + i * 40));
  }
  if (kind === "pincer") extra.gapY = Math.round(70 + rand(s) * 76);
  if (kind === "spores") extra.spots = pickSpots(s, e.a >= 2 ? 5 : 4, SPORE_COLS, SPORE_ROWS, 12);
  e.attack = { kind, t: 0, warn, live, recover: e.type === "boss8" ? [40, 36, 34, 32, 32, 34][e.a] : (e.a >= 2 ? 38 : 52) + (e.type === "boss1" ? 24 : 0), angle: muzzle.angle, targetY: s.p.y + shipSize(s.p.level).h / 2, targetX: s.p.x, ...extra };
  if (kind === "charge") { e.c = 1; e.d = 0; }
}

/* The last boss's C4. A volley is thrown from the bay in its belly, one charge
   every few frames, each to its own spot on a grid over the ship's side of the
   screen. One spot on the grid, and every spot next to it, is always left clear,
   so a volley never covers the whole screen. A charge flies out, sits with its
   blast marked, and goes off at its fuse, hurting the ship only if the ship is in
   the blast at that moment. Frames: in flight, from launch to the blast, and the
   blast drawn afterwards; the blast's radius; charges in a volley and frames
   between them. */
export const C4 = { flight: 26, fuse: 100, blast: 14, radius: 24, count: 12, every: 5 };
const C4_COLS = [36, 80, 124, 168, 212];
const C4_ROWS = [48, 90, 132, 174];

export function c4Muzzle(e: Enemy): { x: number; y: number } {
  if (bossScale(e) !== 1) return bossPoint(e, c4Muzzle(bossModel(e)));
  return { x: e.x + 48, y: e.y + 69 };
}

function throwC4(s: State, e: Enemy) {
  const cells: { c: number; r: number }[] = [];
  for (let c = 0; c < C4_COLS.length; c++) for (let r = 0; r < C4_ROWS.length; r++) cells.push({ c, r });
  const safe = cells[Math.floor(rand(s) * cells.length)];
  const open = cells.filter((k) => Math.abs(k.c - safe.c) + Math.abs(k.r - safe.r) > 1);
  for (let i = open.length - 1; i > 0; i--) {
    const j = Math.floor(rand(s) * (i + 1));
    [open[i], open[j]] = [open[j], open[i]];
  }
  const bay = c4Muzzle(e);
  open.slice(0, C4.count).forEach((k, i) => {
    const tx = C4_COLS[k.c] + (rand(s) - 0.5) * 10;
    const ty = C4_ROWS[k.r] + (rand(s) - 0.5) * 10;
    s.charges.push({ x: bay.x, y: bay.y, sx: bay.x, sy: bay.y, tx, ty, t: -i * C4.every });
  });
}

/* The siege tank's flak: a shell flies a high arc to a marked spot and bursts there
   into a ring of fire. The hive's spores: a cloud that settles on a spot and stays,
   hurting whatever stays in it. The bomber's embers: fire left along its dive. */
export const FLAK = { flight: 34, burst: 62, count: 10, arc: 44, every: 10 };
export const SPORE = { flight: 40, life: 300, radius: 17, drift: 0.12, cap: 7, every: 8 };
export const EMBER = { life: 120, radius: 10, every: 6 };

/* Whether the ship's body is within `reach` of a point. */
function near(s: State, x: number, y: number, reach: number) {
  const size = shipSize(s.p.level);
  const nx = clamp(x, s.p.x + 3, s.p.x + size.w - 3);
  const ny = clamp(y, s.p.y + 2, s.p.y + size.h - 2);
  return Math.hypot(x - nx, y - ny) < reach;
}

/* Everything thrown or dropped: it flies, sits, and does what it was made to do. */
function tickCharges(s: State) {
  for (const c of s.charges) {
    c.t += 1;
    if (c.t < 0) continue;
    const kind = c.kind ?? "c4";
    if (kind === "ember") {
      c.x = c.tx;
      c.y = c.ty;
      if (near(s, c.x, c.y, EMBER.radius)) hurtPlayer(s);
      continue;
    }
    const flight = kind === "flak" ? FLAK.flight : kind === "spore" ? SPORE.flight : C4.flight;
    const u = Math.min(1, c.t / flight);
    const k = 1 - (1 - u) * (1 - u);
    if (kind === "spore" && c.t > flight) c.tx -= SPORE.drift;
    c.x = c.sx + (c.tx - c.sx) * k;
    c.y = c.sy + (c.ty - c.sy) * k - (kind === "flak" ? Math.sin(Math.PI * u) * FLAK.arc : 0);
    if (kind === "c4" && c.t === C4.fuse) {
      if (near(s, c.x, c.y, C4.radius)) hurtPlayer(s);
      burst(s, c.x, c.y, true);
      s.shake = Math.max(s.shake, 8);
    } else if (kind === "flak" && c.t === FLAK.burst) {
      ring(s, c.tx, c.ty, FLAK.count, rand(s) * Math.PI * 2, "fire", 2.4);
      burst(s, c.tx, c.ty, true);
      s.shake = Math.max(s.shake, 6);
    } else if (kind === "spore" && c.t > flight + 8 && near(s, c.x, c.y, SPORE.radius)) hurtPlayer(s);
  }
  s.charges = s.charges.filter((c) => {
    switch (c.kind ?? "c4") {
      case "flak": return c.t < FLAK.burst + 8;
      case "spore": return c.t < SPORE.flight + SPORE.life && c.x > -20;
      case "ember": return c.t < EMBER.life;
      default: return c.t < C4.fuse + C4.blast;
    }
  });
}

function bossFan(s: State, e: Enemy, count: number, width: number, slot = 0, gapped = false) {
  const muzzle = enemyMuzzle(e, s, slot);
  const kind = e.type === "boss5" ? "ice" : e.type === "boss6" ? "fire" : "orb";
  /* The opening moves between attacks rather than closing mid-flight, and a dense
     curtain loses three shots instead of two, so the way through stays at least as
     wide as in a sparse one. */
  const opening = count >= 17 ? 3 : 2;
  const gap = Math.floor(count / 2) + ((e.attackIndex ?? 0) % 2 ? -1 : 1);
  for (let i = 0; i < count; i++) {
    if (gapped && i >= gap && i < gap + opening) continue;
    const angle = muzzle.angle - width / 2 + (i * width) / (count - 1);
    shoot(s, muzzle.x, muzzle.y, angle, kind, 2.5);
  }
}

function bossBeam(s: State, e: Enemy, slot = 0) {
  const m = beamMuzzle(e, slot);
  const a = e.attack!;
  s.beams.push({ x0: m.x, y: m.y, h: e.type === "boss8" ? 18 : 14, t: 0, warn: a.warn, live: a.live, ownerId: e.id, slot });
}

/* Moves that carry the boss about on their own, so the usual drift is left alone. */
const OWN_MOVE: AttackKind[] = ["charge", "surge", "dive", "blink", "breach"];

function updateBoss(s: State, e: Enemy) {
  /* The shield mends once it has been left alone. */
  if (e.maxShield !== undefined && e.shield !== undefined) {
    if (e.shieldHit !== undefined && e.shieldHit > 0) e.shieldHit -= 1;
    if (e.shieldWait !== undefined && e.shieldWait > 0) e.shieldWait -= 1;
    else if (e.shield < e.maxShield) e.shield = Math.min(e.maxShield, e.shield + BOSS_SHIELD.regen);
  }
  const home = Math.min(e.type === "boss1" ? W - 96 : e.type === "boss2" ? W - 126 : e.type === "boss5" ? W - 112 : e.type === "boss8" ? W - 112 : W - 90, W - e.w - 14);
  if (!e.attack && e.b === 0 && !enterX(e, home)) {
    if (e.type === "boss1") e.y = GROUND_Y - e.h;
    if (e.type === "boss2") e.y = WATER_Y - e.h;
    return;
  }
  const oldPhase = e.a;
  if (e.type === "boss8") {
    const share = e.hp / e.maxHp;
    e.a = FINAL_PHASE_AT.filter((cut) => share <= cut).length;
    if (e.a > oldPhase) {
      s.bullets = s.bullets.filter(b => b.own === "p");
      s.beams = [];
      s.charges = [];
      e.stun = 70;
      setCallout(s, e.a === 1 ? "shield" : e.a === 2 ? "armor" : e.a === 3 ? "overload" : e.a === 4 ? "warning" : "c4");
      s.shake = 24;
      for (let i = 0; i < 6; i++) burst(s, e.x + rand(s) * e.w, e.y + rand(s) * e.h, true);
      if (e.a === 1) s.pickups.push({ x: 210, y: 165, kind: "B", t: 0 });
      if (e.a === 2) s.pickups.push({ x: 210, y: 50, kind: "H", t: 0 }, { x: 210, y: 165, kind: "L", t: 0 });
      if (e.a === 3) s.pickups.push({ x: 210, y: 50, kind: "H", t: 0 }, { x: 210, y: 165, kind: "B", t: 0 }, { x: 230, y: 108, kind: "M", t: 0 });
      if (e.a === 4) s.pickups.push({ x: 210, y: 50, kind: "H", t: 0 }, { x: 210, y: 165, kind: "H", t: 0 }, { x: 230, y: 108, kind: "B", t: 0 });
      /* A bomb defuses every charge, so the barrage begins with one to hand. */
      if (e.a === 5) s.pickups.push({ x: 210, y: 50, kind: "H", t: 0 }, { x: 210, y: 165, kind: "B", t: 0 });
    }
  } else phaseUp(s, e, [0.66, 0.33]);
  if (e.a !== oldPhase) {
    e.attack = undefined; e.attackIndex = 0; e.c = 0; e.guard = 0;
    e.x = home;
    e.trail = [];
    /* Whatever the last phase left lying about goes, and so does a boss caught in the
       middle of a dive, a blink or a breach. */
    s.charges = [];
    s.hazards = s.hazards.filter((h) => h.kind !== "wave" && h.kind !== "spire");
    if (e.type === "boss1") e.y = GROUND_Y - e.h;
    else if (e.type === "boss2") e.y = WATER_Y - e.h;
    else e.y = clamp(e.y, 30, H - 16 - e.h);
  }
  if (e.stun > 0) {
    if (e.type === "boss8") e.stun--;
    return;
  }
  e.b++;
  if (!e.attack) nextBossAttack(s, e);
  const a = e.attack!;
  const firing = a.t >= a.warn && a.t < a.warn + a.live;
  const recovering = a.t >= a.warn + a.live;
  const warning = a.t < a.warn;
  const lock = a.warn - 18;
  const ship = s.p;

  if (warning && a.t < lock) {
    a.targetY = s.p.y + shipSize(s.p.level).h / 2;
    a.targetX = s.p.x + shipSize(s.p.level).w / 2;
    const m = enemyMuzzle(e, s, attackSlot(e));
    a.angle = Math.atan2(a.targetY - m.y, a.targetX - m.x);
  }
  /* The siege tank's flak lands around where the ship is when it locks. */
  if (a.t === lock && a.kind === "flak") {
    const fx = clamp(a.targetX, 60, 190);
    const fy = clamp(a.targetY, 44, 184);
    a.spots = [
      { x: fx, y: fy },
      { x: Math.min(fx + 62, 230), y: clamp(fy - 58, 40, 186) },
      { x: Math.min(fx + 62, 230), y: clamp(fy + 58, 40, 186) },
    ];
    if (e.a >= 2) a.spots.push({ x: Math.max(fx - 56, 40), y: fy });
  }
  // Beam mounts remain still for both the warning and live beam.
  if (a.kind !== "beam" && !OWN_MOVE.includes(a.kind) && (recovering || (warning && a.t < lock))) {
    if (e.type === "boss1") e.y = GROUND_Y - e.h;
    else if (e.type === "boss2") e.y = WATER_Y - e.h + Math.sin(e.b / 45) * 1.2;
    else {
      const amplitude = Math.min(e.type === "boss5" ? 60 : e.type === "boss8" ? 38 + e.a * 7 : 48, Math.max(0, (H - e.h) / 2 - 26));
      glide(e, home, H / 2 - e.h / 2 + Math.sin(e.b / (e.type === "boss6" ? 62 : 85)) * amplitude, e.type === "boss8" ? 1.2 + e.a * 0.3 : 1.2);
    }
  }
  if (a.kind === "beam" && a.t === 0) {
    if (e.type === "boss3" || (e.a >= 2 && ["boss4", "boss8"].includes(e.type))) {
      bossBeam(s, e, -1); bossBeam(s, e, 1);
    } else bossBeam(s, e);
    if (e.type === "boss8" && e.a >= 3) bossBeam(s, e, 0);
  }
  if (a.kind === "charge") {
    if (warning) {
      if (a.t < lock) e.y = clamp(e.y + clamp(a.targetY - e.h / 2 - e.y, -2, 2), 28, H - 16 - e.h);
      e.c = 1; e.d = a.t;
    } else if (firing) {
      if (e.c === 1) e.c = 2;
      if (e.c === 2) {
        e.x -= e.type === "boss7" ? 6.5 : 7;
        if (e.x < -e.w - 10) { e.x = W + 30; e.c = 3; e.trail = []; }
      } else if (e.c === 3) e.x = Math.max(home, e.x - 4);
      if (e.type === "boss7" && e.c === 2) {
        const k = bossScale(e);
        e.parts.push({ x: e.x - 48 * k, y: e.y + e.h / 2 - 5 * k, w: 48 * k, h: 10 * k });
      }
    } else { e.x = Math.max(home, e.x - 4); e.c = 0; }
  }

  /* The chapter bosses' own moves. */
  const t2 = a.t - a.warn;
  const rest = H / 2 - e.h / 2;
  if (a.kind === "stomp" && e.type === "boss1") {
    /* It rears up on its pistons while it winds up, and slams down. */
    const lift = warning ? STOMP.lift * Math.min(1, a.t / (a.warn - 10)) : firing && t2 < STOMP.slam ? STOMP.lift * (1 - (t2 + 1) / STOMP.slam) : 0;
    e.y = GROUND_Y - e.h - lift;
  }
  if (a.kind === "surge") {
    if (warning) {
      e.c = 0;
      e.x = home + SURGE.wind * Math.min(1, a.t / a.warn);
    } else if (firing) {
      if (e.c === 0) e.c = 1;
      if (e.c === 1) {
        e.x -= SURGE.out;
        if (e.x <= SURGE.stop) { e.x = SURGE.stop; e.c = 2; e.d = 0; }
      } else if (e.c === 2) {
        if (++e.d >= SURGE.hold) e.c = 3;
      } else e.x = Math.min(home, e.x + SURGE.back);
    } else e.x = Math.min(home, e.x + SURGE.back);
  }
  if (a.kind === "pincer" && firing) {
    const reach = (e.x - 8) * pinch(t2);
    const gy = a.gapY ?? H / 2;
    const half = PINCER.gap / 2;
    if (reach > 2) {
      e.parts.push(
        { x: e.x - 8 - reach, y: 26, w: reach, h: gy - half - 26 },
        { x: e.x - 8 - reach, y: gy + half, w: reach, h: H - 12 - (gy + half) },
      );
    }
  }
  if (a.kind === "dive") {
    if (warning) {
      e.c = 1;
      if (a.t < lock) glide(e, home, DIVE.top, 3);
    } else if (firing) {
      if (e.c === 1) {
        e.c = 2;
        a.angle = Math.atan2(a.targetY - (e.y + e.h / 2), a.targetX - (e.x + e.w / 2));
      }
      if (e.c === 2) {
        e.x += Math.cos(a.angle) * DIVE.speed;
        e.y += Math.sin(a.angle) * DIVE.speed;
        if (t2 % EMBER.every === 0) {
          const ex = e.x + e.w / 2;
          const ey = e.y + e.h / 2 + 8;
          s.charges.push({ kind: "ember", x: ex, y: ey, sx: ex, sy: ey, tx: ex, ty: ey, t: 0 });
        }
        if (e.x < -e.w - 10 || e.y > H + 10 || e.y < -e.h - 10) { e.x = W + 30; e.y = DIVE.top; e.c = 3; }
      } else glide(e, home, rest, 4);
    } else {
      glide(e, home, rest, 4);
      e.c = 0;
    }
  }
  if (a.kind === "blink") {
    if (a.t === lock) {
      /* It will come back at the right of where the ship is now, blade out. */
      a.spots = [{ x: clamp(a.targetX + 92, 150, W - 11 - e.w), y: clamp(a.targetY - e.h / 2, 30, H - 16 - e.h) }];
    }
    if (firing && a.spots) {
      const spot = a.spots[0];
      if (t2 === 0) { e.c = 1; e.x = W + 100; }
      if (t2 === BLINK.gone) {
        e.c = 2;
        e.x = spot.x;
        e.y = spot.y;
        burst(s, e.x, e.y + e.h / 2, true);
        s.shake = Math.max(s.shake, 6);
      }
      if (e.c === 2 && t2 >= BLINK.gone + BLINK.blade && t2 < BLINK.gone + BLINK.strike) {
        e.parts.push({ x: e.x - BLINK.reach, y: e.y + e.h / 2 - BLINK.bladeH / 2, w: BLINK.reach, h: BLINK.bladeH });
      }
      if (e.c === 2 && t2 >= BLINK.gone + BLINK.strike) e.c = 3;
      if (e.c === 3) glide(e, home, rest, 7);
    } else if (recovering) {
      glide(e, home, rest, 7);
      e.c = 0;
    }
  }
  if (a.kind === "breach") {
    if (a.t === lock) {
      const mid = clamp(a.targetX, 110, 160);
      a.spots = [mid, mid - 76, mid + 76].map((x) => ({ x, y: H }));
    }
    if (warning || firing) {
      /* It dives under the screen, and what is left of it hangs where it was. */
      e.c = 1;
      glide(e, home, H + 44, 4.5);
      if (firing && a.spots && t2 % 16 === 0 && t2 / 16 < a.spots.length) {
        s.hazards.push({ id: s.nextId++, kind: "spire", x: a.spots[t2 / 16].x - SPIRE.w / 2, w: SPIRE.w, g: [], half: 0, base: 0, t: 0 });
      }
    } else {
      glide(e, home, rest, 5);
      e.c = 0;
    }
  }
  if (firing) {
    const t = a.t - a.warn;
    const m = enemyMuzzle(e, s);
    switch (a.kind) {
      case "fan":
        if (t === 0) bossFan(s, e, 5 + e.a * 2, 0.8 + e.a * 0.15, attackSlot(e));
        break;
      case "burst":
        if (t % (e.type === "boss8" && e.a >= 2 ? 6 : 10) === 0) {
          const slot = e.type === "boss2" ? (t / 10) % 3 : 0;
          const origin = enemyMuzzle(e, s, slot);
          shoot(s, origin.x, origin.y, origin.angle, "needle", 2.3);
          if (e.type === "boss8" && e.a >= 3) for (const d of [-0.15, 0.15]) shoot(s, origin.x, origin.y, origin.angle + d, "needle", 2.3);
        }
        break;
      case "missiles":
        if (t % (e.type === "boss8" ? 10 : 16) === 0 && s.enemies.filter(o => o.type === "seeker").length < (e.type === "boss8" ? 5 : 3)) {
          const tip = missileMuzzle(e, t ? 1 : 0);
          const missile = spawn(s, "seeker", tip.x - 7, tip.y - 3.5);
          missile.vx = -1.3; missile.vy = t ? 1 : -1;
        }
        break;
      case "spiral":
        if (e.type === "boss8" && e.a >= 3) {
          /* A wheel of shots turning in every direction. */
          if (t % 6 === 0) for (let k = 0; k < 4; k++) {
            const ang = t * 0.12 + (k * Math.PI) / 2;
            const reactor = bossPoint(e, { x: e.x + 53, y: e.y + 44 });
            shoot(s, reactor.x, reactor.y, ang, "spiral", 2.5);
          }
        } else if (t % (e.a >= 2 ? 7 : 10) === 0) {
          const swing = Math.sin(t / 20) * 0.65;
          for (const side of [-1, 1]) {
            const angle = Math.PI + swing * side;
            shoot(s, m.x, m.y, angle, "spiral", 2.5);
          }
        }
        break;
      case "curtain":
        if (t === 0) bossFan(s, e, e.type === "boss8" ? 17 + e.a : 13 + (e.a >= 2 ? 2 : 0), e.type === "boss8" ? 2.3 : 2.05, 0, true);
        break;
      case "flare":
        if (t === 0) {
          const xs = e.type === "boss8" ? [a.targetX, a.targetX - 80, a.targetX + 80].slice(0, e.a >= 4 ? 3 : 2) : [a.targetX];
          for (const fx of xs) spawnHazard(s, { t: 0, type: "flare", y: 0, x: clamp(fx, 45, W * 0.55) });
        }
        break;
      case "c4":
        if (t === 0) throwC4(s, e);
        break;
      case "stomp":
        /* Waves run left along the ground, each taller than the last. */
        if (t % 26 === 0 && t / 26 < (e.a >= 2 ? 3 : 2)) {
          const tall = WAVE.heights[t / 26];
          s.hazards.push({ id: s.nextId++, kind: "wave", x: e.x - 8, w: WAVE.w, g: [], half: H - (GROUND_Y - tall), base: GROUND_Y - tall, t: 0 });
          burst(s, e.x + 4, GROUND_Y - 6, true);
          s.shake = Math.max(s.shake, 12);
        }
        break;
      case "flak":
        if (a.spots && t % FLAK.every === 0 && t / FLAK.every < a.spots.length) {
          const spot = a.spots[t / FLAK.every];
          s.charges.push({ kind: "flak", x: e.x + 40, y: e.y + 6, sx: e.x + 40, sy: e.y + 6, tx: spot.x, ty: spot.y, t: 0 });
        }
        break;
      case "salvo":
        /* Four lanes, one after the other; the second salvo of a late phase comes
           down lanes halfway between the first's. */
        for (const [start, shift] of e.a >= 2 ? [[0, 0], [40, 20]] : [[0, 0]]) {
          const lane = (t - start) / 8;
          if (Number.isInteger(lane) && lane >= 0 && a.lanes && lane < a.lanes.length) shoot(s, e.x - 4, a.lanes[lane] + shift, Math.PI, "shell", 4.5);
        }
        break;
      case "boulders":
        if (t % 16 === 0 && t / 16 < 3 && s.enemies.filter((o) => o.type === "boulder").length < 4) {
          const i = t / 16;
          const rock = spawn(s, "boulder", e.x - 14, e.y + e.h / 2 - 13 + (i - 1) * 12);
          const frames = Math.max(30, (rock.x - a.targetX) / 2.3);
          rock.vx = -2.3;
          rock.vy = clamp((a.targetY + (i - 1) * 34 - (rock.y + 13)) / frames, -1.5, 1.5);
        }
        break;
      case "undertow": {
        /* The ship is drawn toward the bell, a little harder as it goes, then the
           bell blooms: a ring of spores with a gap toward the ship. */
        const size = shipSize(ship.level);
        const bx = e.x + e.w * 0.25;
        const by = e.y + e.h / 2;
        const dx = bx - (ship.x + size.w / 2);
        const dy = by - (ship.y + size.h / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const ramp = Math.min(1, t / UNDERTOW.ramp, (a.live - t) / UNDERTOW.ramp);
        if (dist > 12) {
          const k = shipScale(ship.level);
          ship.x = clamp(ship.x + (dx / dist) * UNDERTOW.pull * ramp, 6 * k + 1, W * 0.55);
          ship.y = clamp(ship.y + (dy / dist) * UNDERTOW.pull * ramp * 0.8, 13 * k + 1, H - 12 - size.h);
        }
        if (t === a.live - 1) {
          const n = 18;
          const aim = Math.atan2(-dy, -dx);
          const hole = Math.round(((((aim % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * n);
          for (let i = 0; i < n; i++) {
            if (Math.abs(i - hole) <= 1 || Math.abs(i - hole - n) <= 1 || Math.abs(i - hole + n) <= 1) continue;
            shoot(s, e.x + e.w / 2, e.y + e.h / 2, (i / n) * Math.PI * 2, "spiral", 2.5);
          }
        }
        break;
      }
      case "spores":
        if (a.spots && t % SPORE.every === 0 && t / SPORE.every < a.spots.length && s.charges.filter((c) => c.kind === "spore").length < SPORE.cap) {
          const spot = a.spots[t / SPORE.every];
          const mx = e.x + 10;
          const my = e.y + e.h * 0.6;
          s.charges.push({ kind: "spore", x: mx, y: my, sx: mx, sy: my, tx: spot.x, ty: spot.y, t: 0 });
        }
        break;
      case "frost":
        /* Waves of shards in a wide cone, each with a gap that moves from one wave to
           the next. A hit chills the ship. */
        if (t % 14 === 0 && t / 14 < (e.a >= 2 ? 4 : 3)) {
          const n = 11;
          const width = 1.3;
          const gap = 3 + ((t / 14) % 2) * 3;
          for (let i = 0; i < n; i++) {
            if (i >= gap && i < gap + 3) continue;
            shoot(s, m.x, m.y, m.angle - width / 2 + (i * width) / (n - 1), "frost", 2.5);
          }
        }
        break;
      case "wisps":
        if (t % 14 === 0 && t / 14 < 2) {
          for (const d of e.a >= 2 ? [-0.6, 0, 0.6] : [-0.5, 0.5]) {
            shoot(s, m.x, m.y, m.angle + d, "wisp", 3.2, { track: WISP.track, turn: WISP.turn, life: 300 });
          }
        }
        break;
      case "crescent":
        if (t === 0) {
          for (const d of e.a >= 2 ? [-0.62, -0.31, 0, 0.31, 0.62] : [-0.42, 0, 0.42]) {
            shoot(s, m.x, m.y, m.angle + d, "crescent", 9, { back: CRESCENT.turnX, life: 420 });
          }
        }
        break;
      case "nova":
        /* A ring of shots from the prow, with a gap cut toward the ship (never
           straight at it), and a second ring behind the first. */
        if (t === 0 || t === 13) {
          const n = 30 + e.a;
          const aim = Math.atan2(a.targetY - m.y, a.targetX - m.x) + (rand(s) - 0.5) * 0.9;
          const hole = Math.round(((((aim % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * n);
          for (let i = 0; i < n; i++) {
            if (Math.abs(i - hole) <= 1 || Math.abs(i - hole - n) <= 1 || Math.abs(i - hole + n) <= 1) continue;
            const ang = (i / n) * Math.PI * 2 + (t ? Math.PI / n : 0);
            shoot(s, m.x, m.y, ang, "orb", 2.5);
          }
        }
        break;
      case "support":
        if (t === 0) {
          const type = e.type === "boss7" ? "funnel" : e.type === "boss4" ? "drone" : e.type === "boss8" ? "fighter" : "scout";
          if (s.enemies.filter(o => o.type === type).length < (e.type === "boss8" ? 2 : 3)) {
            for (let i = 0; i < 2; i++) {
              const child = spawn(s, type, e.x + e.w / 2, e.y + i * 28, e.type === "boss7" ? e.id : i);
              if (type === "funnel") child.b = i * Math.PI;
            }
          }
        }
        break;
    }
  }
  if (e.type === "boss7") e.guard = recovering ? 2 : 0;
  if (e.type === "boss5") {
    e.trail ??= [];
    e.trail.push({ x: e.x + e.w / 2, y: e.y + e.h / 2 });
    if (e.trail.length > 240) e.trail.shift();
    coils(e).forEach((pt, i) => { const r = Math.max(4, 9 - i * 0.45) * bossScale(e); e.parts.push({ x: pt.x - r, y: pt.y - r, w: r * 2, h: r * 2 }); });
  }
  a.t++;
  if (a.t >= a.warn + a.live + a.recover) { e.attack = undefined; e.c = 0; }
}

/* Whether there is something in front of the ship for a special gun to hit. Its
   ammunition is limited, so it is only spent when a shot would find a target:
   straight guns need a ship in their line, the spread one a ship inside its fan,
   and the torpedoes, which run dead straight, a ship in their lane. `laneY` asks
   about a lane other than the gunpod's, for the tubes under the hull. */
function hasTarget(s: State, gun: Exclude<Gun, "blaster">, laneY?: number) {
  const p = s.p;
  const pod = podMuzzle(p);
  const fx = pod.x;
  const fy = laneY ?? pod.y;
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
      case "torpedo":
        if (dy < e.h / 2 + 12) return true;
        break;
      case "icebomb":
        if (dx < 190 && dy < e.h / 2 + 18) return true;
        break;
      case "flame":
        if (dx < 78 && dy < dx * 0.4 + e.h / 2 + 6) return true;
        break;
      case "katana":
        if (dx < KATANA.reach + 14 && dy < KATANA.half + e.h / 2) return true;
        break;
    }
  }
  /* The katana also cuts enemy shots out of the air. */
  if (gun === "katana") {
    for (const b of s.bullets) {
      if (b.own === "e" && b.x > fx - 4 && b.x < fx + KATANA.reach && Math.abs(b.y - fy) < KATANA.half) return true;
    }
  }
  return false;
}

/* The katana: a swing that cuts everything in front of the ship, enemies and their
   shots alike, and throws a thin wave that goes on through whatever is beyond. */
function slash(s: State, ox: number, oy: number) {
  const box: Box = { x: ox - 4, y: oy - KATANA.half, w: KATANA.reach, h: KATANA.half * 2 };
  s.p.slashT = 10;
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    if (hits(box, { x: e.x, y: e.y, w: e.w, h: e.h })) {
      damage(e, (isBoss(e.type) ? KATANA.boss : KATANA.damage) * POWER);
      e.flash = 4;
    }
  }
  s.bullets = s.bullets.filter((b) => b.own === "p" || !hits(box, { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 }));
  s.bullets.push({ x: ox + KATANA.reach - 6, y: oy, vx: 5.5, vy: 0, r: 6, own: "p", dmg: KATANA.wave, kind: "slash", pierce: true, hit: [], life: 22 });
  s.shake = Math.max(s.shake, 2);
}

/* The mouth of the gunpod, which hangs under the nose on its arm: every shot the
   ship fires leaves from here. */
export function podMuzzle(p: { x: number; y: number; level: number; tilt?: number }) {
  const k = shipSize(p.level).w / PLAYER_W;
  const angle = p.tilt ?? 0;
  const dx = GUNPOD.x + GUNPOD.w + GUNPOD.barrel - PLAYER_W / 2;
  const dy = GUNPOD.y + GUNPOD.h / 2 - PLAYER_H / 2;
  return {
    x: p.x + (PLAYER_W / 2 + dx * Math.cos(angle) - dy * Math.sin(angle)) * k,
    y: p.y + (PLAYER_H / 2 + dx * Math.sin(angle) + dy * Math.cos(angle)) * k,
  };
}

/* The ship's guns. */
function fire(s: State) {
  const p = s.p;
  const { x: ox, y: oy } = podMuzzle(p);
  const shot = (vx: number, vy: number, dy: number, over: Partial<Bullet>): Bullet => ({
    x: ox, y: oy + dy, vx, vy, r: 2, own: "p", dmg: 1, kind: "pulse", ...over,
  });

  if (p.gun !== "blaster" && p.ammo <= 0) p.gun = "blaster";

  if (p.gun === "blaster") {
    /* The blaster: one bolt at a time. While a weapon is equipped it is switched off. */
    const fast = hasUpgrade(p, "hypersonic");
    const v = fast ? HYPERSONIC.shot : BLASTER.speed;
    p.cd = fast ? Math.round(BLASTER.cooldown * HYPERSONIC.rate) : BLASTER.cooldown;
    s.bullets.push(shot(v, 0, 0, {}));
    return;
  }

  /* An equipped weapon is the only gun: with nothing in its line it waits, keeping its
     ammunition, and fires at the next frame once something is. */
  if (!hasTarget(s, p.gun)) return;
  p.cd = hasUpgrade(p, "hypersonic") ? Math.max(2, Math.round(GUNS[p.gun].cooldown * HYPERSONIC.rate)) : GUNS[p.gun].cooldown;
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
    case "torpedo":
      /* Fired straight ahead and never turns: what is in its lane is what it hits. */
      s.bullets.push(torpedo(ox, oy, 0, { kind: "torpedo", own: "p", dmg: 5, r: 3, life: 150 }));
      break;
    case "icebomb":
      s.bullets.push(shot(ICEBOMB.speed, 0, 0, { kind: "icebomb", dmg: ICEBOMB.damage, r: 4, life: ICEBOMB.life, icy: true }));
      break;
    case "flame":
      for (const a of [-FLAME.spread, 0, FLAME.spread]) {
        s.bullets.push(shot(Math.cos(a) * FLAME.speed, Math.sin(a) * FLAME.speed, 0, { kind: "flame", dmg: FLAME.damage, r: FLAME.r, pierce: true, hit: [], life: FLAME.life }));
      }
      break;
    case "katana":
      slash(s, ox, oy);
      break;
  }
  if (p.ammo <= 0) p.gun = "blaster";
}

/* The launchers: one under the hull from the start, another on top from level TWIN_AT.
   They never run out, and each fires straight ahead along its own line, and only when a
   ship is in that line. */
function fireLaunchers(s: State) {
  const p = s.p;
  const size = shipSize(p.level);
  const ox = p.x + size.w * 0.5;
  const spec = p.level >= TWIN_AT ? TUBES.twin : TUBES.single;
  const tube = (y: number) => torpedo(ox, y, 0, { r: 3, own: "p", dmg: spec.damage, kind: "torpedo", life: 150 });
  const lanes = p.level >= TWIN_AT ? [p.y + size.h + 2, p.y - 2] : [p.y + size.h + 2];
  let fired = false;
  for (const y of lanes) {
    if (hasTarget(s, "torpedo", y)) {
      s.bullets.push(tube(y));
      fired = true;
    }
  }
  if (fired) p.launchCd = spec.cooldown;
}

/* The launch, a frame at a time. */
function stepLaunch(s: State) {
  s.launchT += 1;
  const pose = launchPose(s.launchT);
  const p = s.p;
  p.x = pose.x;
  p.y = pose.y + (launchShipY(p.level) - (H / 2 + 26)) * (1 - ease(unit((s.launchT - LAUNCH_GO) / 60)));
  s.scroll += pose.speed;
  const size = shipSize(p.level);
  const nx = p.x;
  const ny = p.y + size.h / 2;

  /* Engines: smoke from the nozzle and from vents under the hull while they warm,
     thicker and hotter as the throttle opens. */
  if (pose.throttle > 0) {
    const n = pose.throttle > 0.5 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      if (s.launchT % 2 === 0 || pose.throttle > 0.7) {
        puff(s, nx - 1, ny + (Math.random() - 0.5) * 3, -(0.8 + Math.random() * 1.1) - pose.throttle * 1.4, (Math.random() - 0.5) * 0.5 - 0.1, 34 + Math.random() * 30, 2.2 + Math.random() * 2, pose.throttle > 0.7 ? 1 : 0);
      }
    }
    if (s.launchT < LAUNCH_GO && s.launchT % 3 === 0) {
      puff(s, p.x + 8, p.y + size.h + 2, -0.2, 0.25, 40, 2.4, 0);
      puff(s, p.x + 12, p.y + size.h + 2, -0.1, 0.3, 40, 2, 0);
    }
  }
  if (s.launchT < LAUNCH_GO && pose.throttle > 0.3) s.shake = Math.max(s.shake, 4);
  if (s.launchT >= LAUNCH_GO && s.launchT < LAUNCH_GO + 22) s.shake = Math.max(s.shake, 16);
  if (s.launchT === LAUNCH_GO) s.bombFlash = 5;

  if (s.launchT >= LAUNCH_END) {
    s.phase = "play";
    p.x = 36;
    p.y = H / 2;
    s.banner = 150;
    /* In space the stars streak past after take-off. */
    if (s.chapter >= 3) s.warp = WARP.frames;
  }
}

export function step(s: State, input: Input) {
  s.frame += 1;
  const p = s.p;

  if (s.phase === "dead" || s.phase === "won") {
    for (const b of s.bursts) b.t += 1;
    s.bursts = s.bursts.filter((b) => b.t < BURST_LIFE);
    tickSmoke(s);
    if (s.shake > 0) s.shake -= 1;
    return;
  }

  if (s.shake > 0) s.shake -= 1;
  if (s.bombFlash > 0) s.bombFlash -= 1;

  if (s.phase === "launch") {
    stepLaunch(s);
    for (const b of s.bursts) b.t += 1;
    tickSmoke(s);
    return;
  }

  if (s.banner > 0) s.banner -= 1;
  if (s.callout && --s.callout.t <= 0) s.callout = null;
  if (p.inv > 0) p.inv -= 1;
  /* Self-repair (level 5): after CALM frames without a hit the shield and the ship's own
     health mend together. */
  if (p.calm > 0) p.calm -= 1;
  else if (hasUpgrade(p, "repair")) {
    if (p.shield < maxShield(p)) p.shield = Math.min(maxShield(p), p.shield + SHIELD.regen);
    if (p.hp < maxLife(p)) p.hp = Math.min(maxLife(p), p.hp + HEAL.life);
  }
  if (p.shieldFlash > 0) p.shieldFlash -= 1;
  if (p.morph > 0) p.morph -= 1;
  if (p.slashT > 0) p.slashT -= 1;
  s.scroll += 1;
  /* The warp: the scenery runs fast after take-off in space, and as the ship leaves. */
  if (s.warp > 0) {
    s.scroll += (WARP.boost * s.warp) / WARP.frames;
    s.warp -= 1;
  }
  if (s.phase === "clear") s.scroll += WARP.boost * clamp((s.clearFor - CLEAR.go) / 40, 0, 1);

  /* The ship. */
  const hullScale = shipScale(p.level);
  // Keep the new fins inside the playfield; collision dimensions stay the same.
  /* Frostbite slows the ship for a while (CHILL); the hypersonic drive speeds it up. */
  const pace = (p.chill > 0 ? CHILL.slow : 1) * (hasUpgrade(p, "hypersonic") ? HYPERSONIC.speed : 1);
  if (p.chill > 0) p.chill -= 1;
  const free = s.phase !== "clear";
  if (free) {
    p.x = clamp(p.x + input.mx * pace, Math.max(6 * hullScale + 1, (HQ.width + 6) * s.hq.slide), W * 0.55);
    p.y = clamp(p.y + input.my * pace, 13 * hullScale + 1, H - 12 - shipSize(s.p.level).h);
    p.tilt += (clamp(input.my / 2.7, -1, 1) * 0.26 - p.tilt) * 0.18;
  } else flyAway(s);
  if (p.cd > 0) p.cd -= 1;
  if (p.cd <= 0 && s.phase === "play") fire(s);
  if (p.launchCd > 0) p.launchCd -= 1;
  if (hasUpgrade(p, "torpedo") && p.launchCd <= 0 && s.phase === "play") fireLaunchers(s);
  if (input.bomb && p.bombs > 0 && p.bombT <= 0 && s.phase === "play") {
    p.bombs -= 1;
    p.bombT = 30;
    throwBombs(s);
  }
  if (p.bombT > 0) p.bombT -= 1;
  tickBombs(s);
  /* The ultimate: a nuclear warhead, a missile that runs down the boss or the nearest enemy,
     and the ship cannot be hurt while its blast burns. */
  if (input.nuke && p.nukes > 0 && !s.nuke && s.warheads.length === 0 && s.phase === "play") {
    p.nukes -= 1;
    launchWarhead(s);
  }
  tickWarheads(s);
  tickHq(s);
  if (s.nuke) tickNuke(s);
  if (p.swap > 0) p.swap -= 1;

  /* The exhaust: a thin trail of smoke, longer when the ship is pushed. */
  if (s.phase === "play" && s.frame % 3 === 0) {
    const sz = shipSize(p.level);
    const push = Math.min(1, Math.hypot(input.mx, input.my) / 2.7);
    puff(s, p.x - 1, p.y + sz.h / 2 + p.tilt * 6, -1.1 - push * 0.9, (Math.random() - 0.5) * 0.3, 20 + push * 12, 1.2 + push * 0.8, 0);
  }
  tickSmoke(s);

  /* Enemies arrive. */
  s.t += 1;
  const hearts = PICKUP_PLANS[s.chapter];
  while (s.pickupIdx < hearts.length && hearts[s.pickupIdx].t <= s.t) {
    /* Luck decides whether this one turns up at all. */
    if (rand(s) < UPGRADE_LUCK) s.pickups.push({ x: W + 10, y: hearts[s.pickupIdx].y, kind: "E", t: 0 });
    s.pickupIdx += 1;
  }
  const list = PLANS[s.chapter];
  while (s.planIdx < list.length && list[s.planIdx].t <= s.t) {
    const it = list[s.planIdx++];
    if (isHazardType(it.type)) spawnHazard(s, it);
    else {
      spawn(s, it.type, W + 14, it.y, it.a ?? 0).fromPlan = true;
      s.stats.spawned += 1;
    }
  }
  if (s.planIdx >= list.length && s.bossId === 0) {
    const regular = s.enemies.filter((e) => !isBoss(e.type)).length;
    if (regular <= 2 || s.t > list[list.length - 1].t + 900) {
      const type = `boss${s.chapter}` as EType;
      const b = spawn(s, type, W + 20, H / 2 - SIZE[type][1] / 2);
      s.bossId = b.id;
      s.talk = "boss";
      setCallout(s, "warning");
    }
  }

  /* Everything moves. */
  for (const e of [...s.enemies]) updateEnemy(s, e);
  for (const h of s.hazards) {
    h.t += 1;
    if (h.kind === "flare") h.x -= 0.3;
    else if (h.kind === "gate") {
      h.x -= 1.1;
      h.g[0] = h.base + Math.sin(h.t / 48) * 40;
    } else if (h.kind === "wave") h.x -= WAVE.speed;
    else if (h.kind !== "spire") h.x -= 1;
  }
  s.hazards = s.hazards.filter(
    (h) => h.x > -h.w - 6 && (h.kind !== "flare" || h.t < FLARE_WARN + FLARE_LIVE) && (h.kind !== "spire" || h.t < SPIRE_END),
  );
  tickCharges(s);
  for (const b of s.bullets) {
    if (b.ux !== undefined && b.uy !== undefined) {
      /* A torpedo: out of the tube, motor lit, then flat out (TORPEDO). */
      b.age = (b.age ?? 0) + 1;
      if (b.own === "e" && b.track !== undefined && b.track > 0) {
        /* A wisp swings a little toward the ship each frame, for a while. */
        b.track -= 1;
        const size = shipSize(p.level);
        const want = Math.atan2(p.y + size.h / 2 - b.y, p.x + size.w / 2 - b.x);
        const cur = Math.atan2(b.uy, b.ux);
        const turn = clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -(b.turn ?? 0.02), b.turn ?? 0.02);
        b.ux = Math.cos(cur + turn);
        b.uy = Math.sin(cur + turn);
      }
      if (b.own === "e" && b.back !== undefined && b.x <= b.back) {
        /* A crescent reaches its turning point, hangs, and comes back the way it came. */
        b.ux = -b.ux;
        b.uy = -b.uy;
        b.back = undefined;
        b.age = TORPEDO.eject + TORPEDO.ignite - 4;
      }
      if (b.own === "p" && b.track !== undefined && b.track > 0) {
        /* The HQ's torpedoes swing toward the nearest enemy ahead of them. */
        b.track -= 1;
        let best = 1e9;
        let tx = 0;
        let ty = 0;
        for (const o of s.enemies) {
          if (o.hp <= 0 || o.x > W - 4 || o.x + o.w < b.x - 6) continue;
          const d = Math.hypot(o.x + o.w / 2 - b.x, o.y + o.h / 2 - b.y);
          if (d < best) { best = d; tx = o.x + o.w / 2; ty = o.y + o.h / 2; }
        }
        if (best < 1e9) {
          const want = Math.atan2(ty - b.y, tx - b.x);
          const cur = Math.atan2(b.uy, b.ux);
          const turn = clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -(b.turn ?? 0.05), b.turn ?? 0.05);
          b.ux = Math.cos(cur + turn);
          b.uy = Math.sin(cur + turn);
        }
      }
      const v = torpedoSpeed(b.age);
      b.vx = b.ux * v;
      b.vy = b.uy * v;
    }
    b.x += b.vx;
    b.y += b.vy;
    if (b.life !== undefined) b.life -= 1;
    /* An ice bomb that finds nothing goes off where it runs out. */
    if (b.kind === "icebomb" && b.own === "p" && b.life !== undefined && b.life <= 0) detonate(s, b);
  }
  s.bullets = s.bullets.filter((b) => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10 && (b.life === undefined || b.life > 0));
  for (const b of s.beams) {
    b.t += 1;
    if (b.ownerId !== undefined) {
      const owner = s.enemies.find(e => e.id === b.ownerId && e.hp > 0);
      if (!owner) { b.t = b.warn + b.live; continue; }
      const m = beamMuzzle(owner, b.slot);
      b.x0 = m.x;
      b.y = m.y;
    }
  }
  s.beams = s.beams.filter((b) => b.t < b.warn + b.live);
  for (const k of s.pickups) {
    k.x -= 0.9;
    k.t += 1;
  }
  s.pickups = s.pickups.filter((k) => k.x > -12);
  for (const b of s.bursts) b.t += 1;
  s.bursts = s.bursts.filter((b) => b.t < BURST_LIFE);

  /* The ship's shots against enemies, then against what stands in the way. */
  const solids: Box[] = [];
  for (const h of s.hazards) if (h.kind !== "flare") solids.push(...hazardBoxes(h));
  for (const b of s.bullets) {
    if (b.own !== "p") continue;
    const shotBox = { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 };
    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      if (b.pierce && b.hit?.includes(e.id)) continue;
      const body: Box = { x: e.x + 2, y: e.y + 2, w: e.w - 4, h: e.h - 4 };
      if (!hits(shotBox, body)) continue;
      damage(e, b.dmg * POWER);
      e.flash = 3;
      if (b.kind === "torpedo" || b.kind === "icebomb") {
        detonate(s, b, e.id);
        b.x = W + 99;
        break;
      }
      if (b.pierce) b.hit?.push(e.id);
      else {
        b.x = W + 99;
        break;
      }
    }
    if (b.x > W + 90 || b.pierce) continue;
    if (solids.some((r) => hits(shotBox, r)) || s.enemies.some((e) => e.parts.some((r) => hits(shotBox, r)))) {
      if (b.kind === "torpedo" || b.kind === "icebomb") detonate(s, b, 0, true);
      b.x = W + 99;
    }
  }
  const dying = s.enemies.filter((e) => e.hp <= 0);
  for (const e of dying) kill(s, e);
  s.enemies = s.enemies.filter((e) => e.hp > 0 && e.x > -110 && e.x < W + 140);

  /* The ship against enemy fire, enemies, obstacles and beams. */
  const me: Box = { x: p.x + 3, y: p.y + 2, w: shipSize(s.p.level).w - 6, h: shipSize(s.p.level).h - 4 };
  for (const b of s.bullets) {
    if (b.own !== "e") continue;
    if (hits({ x: b.x - b.r + 0.6, y: b.y - b.r + 0.6, w: b.r * 2 - 1.2, h: b.r * 2 - 1.2 }, me)) {
      b.x = -99;
      if (hurtPlayer(s) && b.kind === "frost") p.chill = CHILL.frames;
    }
  }
  for (const e of s.enemies) {
    if (hits(me, { x: e.x + 3, y: e.y + 3, w: e.w - 6, h: e.h - 6 })) {
      if (!isBoss(e.type) && !HEAVY.includes(e.type)) {
        e.hp = 0;
        kill(s, e);
      }
      hurtPlayer(s);
    }
    if (e.parts.some((r) => hits(me, r))) hurtPlayer(s);
  }
  s.enemies = s.enemies.filter((e) => e.hp > 0);
  for (const h of s.hazards) if (hazardBoxes(h).some((r) => hits(me, r))) hurtPlayer(s);
  for (const bm of s.beams) {
    if (bm.t >= bm.warn && bm.live > 0 && hits(me, { x: 0, y: bm.y - bm.h / 2, w: bm.x0, h: bm.h })) hurtPlayer(s);
  }
  for (const k of s.pickups) {
    if (s.phase === "play" && hits(me, { x: k.x - 7.5, y: k.y - 7.5, w: 15, h: 15 })) {
      if (k.kind === "H") {
        p.hp = Math.min(maxLife(p), p.hp + LIFE.heal);
      } else if (k.kind === "E") {
        p.hp = Math.min(maxLife(p), p.hp + LIFE.heal);
        addExtra(s);
      }
      else if (k.kind === "B") p.bombs = Math.min(4, p.bombs + 1);
      else {
        const gun = GUN_OF[k.kind] ?? "torpedo";
        /* Picking up the gun already held tops up its ammunition. */
        p.ammo = p.gun === gun ? Math.min(GUNS[gun].ammo * 1.5, p.ammo + GUNS[gun].ammo) : GUNS[gun].ammo;
        if (p.gun !== gun) p.swap = 16;
        p.gun = gun;
        p.cd = 0;
      }
      s.score += 5;
      k.x = -99;
    }
  }

  /* The boss falls: the chapter is over a moment later. The story and the
     screen that follows are the player's to move on from. */
  if (s.bossId !== 0 && s.phase === "play" && s.enemies.some((e) => e.id === s.bossId)) s.stats.bossFrames += 1;
  if (s.bossId !== 0 && !s.enemies.some((e) => e.id === s.bossId) && s.phase === "play") {
    s.phase = "clear";
    s.clearFor = 0;
    s.result = chapterResult(s);
    s.score += s.result.bonus;
  }
  if (s.phase === "clear") s.clearFor += 1;
}

