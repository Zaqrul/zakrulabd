/* The rules, enemies and eight chapters of the side-scrolling space shooter, kept
   apart from the screen so they can be run by a script. Each chapter starts with
   the ship being launched from a hangar, then flies it through its own place:
   enemies come from the right, each kind moving and attacking in its own way,
   obstacles slide past (rocks, laser gates, bulkheads, solar flares), and the
   chapter ends with a boss built differently from the last, in phases. Supply
   pods carry weapons with their own ammunition (a machine gun, a spread, a
   piercing laser and straight-running torpedoes); when the ammo runs out the ship goes back
   to its blaster. */
import { SECOND_PLANS } from "./space2-plans.ts";
import { bossShotRadius, CORVET, EXCAVATOR, RECLAIMER, THIRD_BOSSES, WYRM, type ThirdBoss } from "./space3-boss.ts";
import { createLumen, LUMEN, stepLumen, type Lumen } from "./space3-recruit.ts";
import { MODE, PLASMA, PUSH, SEED, seedVolley, type SeedMode } from "./space3-arsenal.ts";
import { DASH as ARMS_DASH } from "./space3-arms.ts";
import { BLINK3, DASH3, GRAVITY, dash3Cycle } from "./space3-havoc.ts";
import { ACT2, ACT2_BOSS, ACT2_ENEMIES, ACT2_ENEMY_SCORE, ACT2_KITS, ACT2_MINI, ACT2_MINI_KITS, ACT2_STAGES, eventPlan, isAct2, landPlan as outerLandPlan, type EventKind, type EventSpec, type LandSpec, type Mod } from "./space3-act2.ts";
import { ARENA_CALLOUT, ARENA_OF, ARENA_TIMING, bandAt, isArenaKind, planArena, type ArenaKind, type ArenaPlan } from "./space-arena.ts";
import { attackShots, charge, createDirector, finished, nextAttack, observe, restFrames, VERBS, type Attack, type Director, type Verb } from "./space3-director.ts";
import { generateWaves } from "./space3-waves.ts";
import { CELL, createResonance, damageScale, gain, ghostShot, hurt, killGain, tickResonance, type Resonance } from "./space3-resonance.ts";
import { PATTERN, SECOND_BOSS_TIMING, SECOND_MINI_TIMING, angleDifference, spacedPositions } from "./space2-attack-patterns.ts";

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
const HEAVY: string[] = ["cruiser", "destroyer", "bunker", "mini9", "mini10", "mini11", "mini12", "mini13", "mini14", "mini15", "mini16"];

/* The ship levels up to MAX_LEVEL by experience (see XP): every enemy destroyed adds to it, and a
   gold heart, when luck brings one (see UPGRADE_LUCK), adds a third of a level and mends health. A
   life crate only mends health.
   Every level is an upgrade that arrives by itself, and the ship's own shape hardly
   changes with them (its power goes into what it does, not into parts bolted on): level 1
   the torpedo launcher, 2 a second launcher, 3 the hypersonic drive, 4 the mechanical
   shield, 5 self-repair, 6 to 8 harder-hitting shots (POWER_UP), and 9 the HQ's support: a
   carrier's hangar fills the left edge of the screen and its four launchers fire homing
   torpedoes. Level 10 brings a fourth nuclear warhead. The second launcher comes at level two
   because it is the biggest jump in firepower, and the bosses of chapters two and three
   are met around levels one and two. The ship grows through its
   first three levels and stays that size after. */
export const MAX_LEVEL = 10;
export const maxHpFor = () => MAX_HP;

export type Upgrade = "torpedo" | "hypersonic" | "armor" | "repair" | "hq";
export const UPGRADES: Upgrade[] = ["torpedo", "hypersonic", "armor", "repair", "hq"];
/* The level at which each upgrade arrives, and the one at which the second launcher does. */
export const UPGRADE_AT: Record<Upgrade, number> = { torpedo: 1, hypersonic: 3, armor: 4, repair: 5, hq: 9 };
export const TWIN_AT = 2;
/* Levels 6, 7 and 8 bring no new gear: each makes every shot the ship fires hit `each` harder. */
export const POWER_UP = { at: [6, 7, 8], each: 0.12 };
export const powerBonus = (p: { level: number }) => 1 + POWER_UP.each * POWER_UP.at.filter((l) => p.level >= l).length;

/* Health. The ship has a small shield and, under it, its own health bar of MAX_HP
   points, and it never grows: no level or upgrade makes it longer. A hit takes LIFE.hit: from the shield first
   and then from the health bar, and from nothing else: a ship that is hit loses health and
   never a level or an upgrade. The ship mends its own health from the start: once CALM frames
   (six seconds) have passed without a hit, the health mends a little every frame, at HEAL.base of
   HEAL.life until the self-repair upgrade (level 5) brings it up to the full rate (and in Space 2
   mends the shield too, as in SHIELD). Before that only a life crate (LIFE.heal), a level gained, a new chapter or a retry
   puts them back. The shield holds SHIELD.base, also fixed. In Space 1 the ship sets out with
   no shield at all, and only a shield crate (SHIELD.drop) fills it: no level, chapter or
   self-repair does. In Space 2 it sets out with SHIELD.start of it, a level gained mends only
   the health, and self-repair brings the shield back slowly. What levels bring is how the ship copes:
   the mechanical shield takes ARMOR.reduction off every hit, self-repair mends it. */
export const LIFE = { hit: 20, heal: 20 };
/* `start` is the share Space 2 sets out with; Space 1 sets out with none. */
export const SHIELD = { base: 50, regen: 0.05, drop: 25, start: 0.5 };
export const CALM = 360;
export const HEAL = { life: 0.06, base: 0.7 };

/* The upgrades. Torpedo: a launcher under the hull that never runs out of torpedoes;
   twin: a second one on top, firing faster and harder. Hypersonic: the ship flies faster
   and every gun fires more often. Mechanical shield: the hull is plated, so every hit does
   less, but the bars stay the same length. Self-repair: see CALM. HQ: see HQ. */
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
export const ARMOR = { reduction: 0.3 };
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
export const NUKE = { count: 3, frames: 72, every: 6, regular: 7, boss: 1.4, blast: 80, direct: 60, bossShare: 0.05, speed: 7, eject: 12, ignite: 12, slide: 0.8, coast: 1.2, accel: 0.16, drop: 0.2 };
export const warheadStage = (t: number): "eject" | "ignite" | "burn" => (t <= NUKE.eject ? "eject" : t <= NUKE.eject + NUKE.ignite ? "ignite" : "burn");
export type Warhead = { x: number; y: number; vx: number; vy: number; t: number; target: number; done?: boolean };

/* After take-off in space the stars streak past, fast at first and then settling, for
   `frames`. When a boss falls the ship settles in the middle of the screen (until `go`),
   then lights its engines and flies off, and the story (`talk`) comes after. */
export const WARP = { frames: 170, boost: 5 };
export const CLEAR = { go: 70, talk: 170 };

/* The last boss has a shield of its own that takes damage before its health does, and
   comes back after `wait` frames without a hit, `regen` a frame. */
/* Dreadnought's shield is half its original 1500, as requested after boss testing. */
export const BOSS_SHIELD_AT: Partial<Record<EType, number>> = { boss8: 750, boss16: 2200 };
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

/* Space 2. Chapters above FIRST_CAMPAIGN are Space 2's; there the ship grows by experience, not by
   gold hearts: every enemy destroyed fills a gauge, and each `perLevel` points of it is a level.
   (The ship keeps its experience in `p.extra`, the field Space 1 uses for hearts, so a saved run
   needs nothing new.) `div` turns an enemy's score into its experience, and a boss is worth `boss`. */
export const FIRST_CAMPAIGN = 8;
/* Space 1 levels a tenth more slowly: `div1`, `boss1` and `heart1` are its share of each. */
export const XP = { perLevel: 100, div: 28, div1: 22, boss: 30, heart: 40, boss1: 27, heart1: 36 };
export const isSecond = (chapter: number) => chapter > FIRST_CAMPAIGN;
/* Space 3 is chapters 17 to 28, on Space 2's ship (so `isSecond` is true there too). It has no sea or ground
   of its own: `placeOf` is 0 for it, and the campaign is told apart with `campaignOf` and `isThird`. */
export const SECOND_LAST = 16;
export const campaignOf = (chapter: number): 1 | 2 | 3 => (chapter <= FIRST_CAMPAIGN ? 1 : chapter <= SECOND_LAST ? 2 : 3);
export const isThird = (chapter: number) => chapter > SECOND_LAST;

/* The mini rocket: four small rockets fan out and then home, on an enemy shot first and on an
   enemy ship if there is no shot to stop. Strong against little things, weak against a boss. */
export const ROCKET = { count: 4, fan: [-0.5, -0.17, 0.17, 0.5], speed: 3.2, top: 5.2, turn: 0.13, seekBullet: 120, seekEnemy: 170, life: 108, damage: 1.5, boss: 0.4, arm: 18,
  /* A rocket leaves its rail like a torpedo leaves its tube: it drops away cold (eject), its motor
     lights and sputters (ignite), then it burns up to `top`. It does not steer before the burn. */
  eject: 10, ignite: 8, slide: 0.9, coast: 0.6, accel: 0.3, drop: 0.22,
  /* It goes off where it hits (a small blast of `blast` radius and `splash` damage, which a boss feels
     at the same share as a direct hit) and where its fuse runs out. */
  blast: 17, splash: 0.9 };
export const rocketStage = (age: number): "eject" | "ignite" | "burn" => (age <= ROCKET.eject ? "eject" : age <= ROCKET.eject + ROCKET.ignite ? "ignite" : "burn");
export const rocketSpeed = (age: number) => {
  const burn = age - ROCKET.eject - ROCKET.ignite;
  return burn <= 0 ? (age <= ROCKET.eject ? ROCKET.slide : ROCKET.coast) : Math.min(ROCKET.top, ROCKET.coast + burn * ROCKET.accel);
};

/* Bloom: an umbrella that opens in front of the nose when enemy fire comes close and swallows what
   touches it. It drains while open (`energy` frames to a pickup, `max` at most), every shot it
   swallows costs `cost` more, and having swallowed `burstAt` or more it sheds a fan of petals when
   it closes. It stops shots and nothing else: beams, flares, blades and bodies pass through. Dense
   fire empties it quickly, so it buys a moment, not a wall. */
export const BLOOM = { radius: 22, energy: 240, max: 300, cost: 15, hold: 16, burstAt: 16, petal: 1.4 };

/* The hyperbeam: when a tough enemy is in its lane the pod charges for `charge` frames (the ship at
   half speed), then fires one beam `h` thick across the screen for `live` frames. It goes through
   everything, wipes the enemy shots in its lane, and hurts each thing it crosses once. */
export const HYPER = { charge: 60, live: 20, h: 14, damage: 250, boss: 90, after: 40, slow: 0.5 };
export type Hyper = { t: number; x: number; y: number; live: number; hit: number[] };

/* Kite, ORB's wingman: it keeps a little behind and above the ship, catches up with a short delay,
   and fires a light shot whenever something is ahead. It cannot be hit, and does a boss only a
   fraction of its harm, so it helps without carrying the fight. */
export const KITE = { dx: -16, dy: -14, follow: 0.12, cooldown: 18, damage: 0.45, boss: 0.35, speed: 5 };
export type Kite = { x: number; y: number; cd: number; kick: number };

/* Halo's ORB cover: Kite carries a Bloom of its own that it can use again and again. When enemy fire
   comes within `reach` of the ship it lays the Bloom over it for `frames`, and is ready again
   `cooldown` frames (fifteen seconds) after the cover ends. */
export const COVER = { frames: 120, cooldown: 900, reach: 70 };

/* Space 2: the ship's launchers fire deadly stingers instead of torpedoes. They leave the tubes
   angled a little, home hard on the nearest enemy ahead, and hit harder than a torpedo. */
export const PSTINGER = { single: { cooldown: 60, damage: 6.5 }, twin: { cooldown: 46, damage: 8.5 }, speed: 3.4, top: 6.6, accel: 0.16, turn: 0.1, home: 90, life: 110 };

/* What Space 2's own achievements count, chapter by chapter: rocket volleys, Bloom openings, shots
   it swallowed, hyperbeams fired and the most a single beam destroyed, and covers given. */
export type Counters2 = { rockets: number; bloomOpens: number; blocks: number; beams: number; bestBeam: number; covers: number };

type Equipped = { level: number };
export const hasUpgrade = (p: { level: number }, u: Upgrade) => p.level >= UPGRADE_AT[u];
/* Fixed for every level (LIFE, SHIELD); `p` stays so callers need not change. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const maxLife = (p: Equipped) => MAX_HP;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const maxShield = (p: Equipped) => SHIELD.base;
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
  | "boss1" | "boss2" | "boss3" | "boss4" | "boss5" | "boss6" | "boss7" | "boss8"
  | "boss9" | "boss10" | "boss11" | "boss12" | "boss13" | "boss14" | "boss15" | "boss16"
  /* Space 3's Ghost Corvet. */
  | "boss17" | "boss18" | "boss19" | "boss20"
  /* Space 3's chapters 5 to 12 (space3-act2.ts): their bosses, their mini bosses and the outer system's own enemies. */
  | "boss21" | "boss22" | "boss23" | "boss24" | "boss25" | "boss26" | "boss27" | "boss28"
  | "mini21" | "mini22" | "mini23" | "mini24" | "mini25" | "mini26" | "mini27" | "mini28"
  | "lancer" | "magnet" | "frigate" | "hangar" | "shade"
  /* Space 2's mini bosses, one before each chapter's boss. */
  | "mini9" | "mini10" | "mini11" | "mini12" | "mini13" | "mini14" | "mini15" | "mini16"
  /* Space 2's submarine, under the water, with its sea missiles. */
  | "sub";

export type Gun = "blaster" | "machine" | "spread" | "laser" | "torpedo" | "icebomb" | "flame" | "katana" | "minirocket" | "hyperbeam";

export type Box = { x: number; y: number; w: number; h: number };
/* A piece of floating land: solid, it stops shots and the ship, and drifts left (space3-act2.ts). */
export type Land = LandSpec & { id: number; x: number };

/* The first eleven are shared; each chapter boss also has two of its own, a move and
   a weapon, and the last boss has the C4. */
export type AttackKind =
  | "fan" | "burst" | "missiles" | "beam" | "spiral" | "charge" | "curtain" | "flare" | "support" | "nova"
  | "stomp" | "flak" | "surge" | "salvo" | "pincer" | "boulders" | "undertow" | "spores"
  | "breach" | "frost" | "dive" | "wisps" | "blink" | "crescent" | "c4"
  /* Space 2's own (see secondAttack). */
  | "railshot" | "geysers" | "broadside" | "deckbomb" | "silorocket" | "arsenalsalvo" | "avalanche" | "icewall" | "lances"
  | "sandspout" | "burrow" | "pinwheel" | "ram" | "searchlight" | "sweep" | "icebreak" | "harpoon" | "vortex"
  | "lightning" | "twister" | "maelstrom" | "quake" | "rocketfist" | "orbital" | "cluster" | "scissor" | "march" | "volley"
  /* Space 2's bullet patterns, two to each boss (see PATTERN_SHOT). */
  | "helix" | "rain" | "tidewall" | "shatter" | "barrage"
  /* Atlas's own set piece. */
  | "grid"
  /* Space 2's mini bosses' own (see updateMini). */
  | "rotorwash" | "sweepgun" | "skip" | "netgun" | "cableslide" | "chaff" | "duneram" | "mortar"
  | "ladder" | "lattice" | "torpfan" | "periscope" | "featherfan" | "divebomb" | "gatelaser" | "shielddrones"
  /* The arena attacks every boss of Space 1 and 2 now carries one of (space-arena.ts). */
  | ArenaKind;
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
  /* Columns a Space 2 attack will strike, by their x. */
  cols?: number[];
  gapY?: number;
  gapX?: number;
  gapAngle?: number;
  safeHalf?: number;
  lockFrames?: number;
  origin?: { x: number; y: number };
  spots?: { x: number; y: number }[];
  /* An arena attack's plan: its shots, beams, warning marks and the way through (space-arena.ts). */
  arena?: ArenaPlan;
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
  /* A boss of several bodies (space3-act2.ts): the parts of its current stage, and which stage it is on. */
  mods?: Mod[];
  stage?: number;
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
  kind: "pulse" | "orb" | "spiral" | "needle" | "ice" | "fire" | "mg" | "spread" | "laser" | "torpedo" | "shell" | "wisp" | "crescent" | "frost" | "icebomb" | "flame" | "slash" | "minirocket" | "petal" | "stinger" | "seamissile" | "deckrocket" | "seed" | "echo" | "lance" | "scrap" | "plasmatorp";
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
  /* A rocket's heading, which its motor follows; its drop while it is cold is added on top. */
  heading?: number;
  /* Frames left in which it steers after the ship, and how far it can turn a frame. */
  track?: number;
  turn?: number;
  /* The x at which it turns round and comes back, once. */
  back?: number;
  /* An ice bomb: what it hits freezes. */
  icy?: boolean;
  /* Fired by Kite, which does a boss only a fraction of the harm. */
  kite?: boolean;
  /* Space 2's boss shots: frames before it bursts into `split` shots (of `splitKind`), or frames it
     hangs still before setting off at (hvx, hvy). */
  fuse?: number;
  split?: number;
  splitKind?: Bullet["kind"];
  splitAngle?: number;
  splitGap?: number;
  splitHalf?: number;
  patternOwner?: number;
  hold?: number;
  hvx?: number;
  hvy?: number;
  /* Space 2's enemy missiles: frames a stinger keeps steering after the ship, and frames before a
     sea missile turns from its climb toward the ship at `speed2`. */
  home?: number;
  retarget?: number;
  speed2?: number;
  /* A deck rocket turns once toward a spot locked before its hatch opens. */
  aim?: { x: number; y: number };
};

export type Beam = { patternOwner?: number; y: number; h: number; x0: number; t: number; warn: number; live: number; ownerId?: number; slot?: number; vy?: number };
export type PickupKind = "H" | "B" | "M" | "S" | "L" | "R" | "I" | "F" | "K" | "E" | "N" | "Y" | "U" | "D"
  /* Space 3: a Resonance cell, and the Seed Bolt's wide, piercing and rapid modes. */
  | "Z" | "W" | "P" | "Q";
export type Pickup = { x: number; y: number; kind: PickupKind; t: number };
export type Burst = { x: number; y: number; t: number; big: boolean };
export type Smoke = { x: number; y: number; vx: number; vy: number; t: number; life: number; r: number; tone: number };

/* Things that are in the way rather than at war with you. The ship's shots
   cannot destroy them. A flare is a column of fire that is marked first; a gate
   is a pair of laser pylons with a gap that drifts up and down; a wall is a
   bulkhead with two gaps cut in it. */
/* Space 2 adds a marked column strike and a drifting twister. */
export type HKind = "flare" | "gate" | "wall" | "wave" | "spire" | "strike" | "twister" | "cover" | "perch";
export type Hazard = { patternOwner?: number; id: number; kind: HKind; x: number; w: number; g: number[]; half: number; base: number; t: number };

/* Space 3 adds three keys: the Phase Shift dodge, the Kinetic Barrier and Overdrive. */
export type Input = { mx: number; my: number; bomb: boolean; nuke?: boolean; phase?: boolean; barrier?: boolean; overdrive?: boolean; focus?: boolean };

export type Phase = "launch" | "play" | "clear" | "dead" | "won";

export type Callout = "shield" | "armor" | "overload" | "levelup" | "phase" | "warning" | "c4" | "hypersonic" | "mechshield" | "launcher" | "repair" | "hq" | "power" | "cover"
  | "ultimate" | "decks" | "magazines" | "shed" | "molt" | "decouple" | "breach" | "pressure"
  | "plating" | "buckle" | "judgement" | "core" | "laststand" | "miniboss"
  | "mortar" | "sweep" | "scissor" | "wheel" | "flank" | "tether"
  | "storm" | "surge" | "stage" | "trueform"
  | "seaspray" | "downpour" | "blizzard" | "sandstorm" | "fogbank" | "polar" | "turbulence" | "clearsky";

/* A C4 charge the last boss throws in its final phase. t counts from its launch
   (below zero it is still waiting in the bay); it flies from (sx, sy) to (tx, ty),
   sits there, and goes off at C4.fuse. */
export type ZoneKind = "c4" | "flak" | "spore" | "ember" | "deckbomb";
export type Charge = { patternOwner?: number; x: number; y: number; sx: number; sy: number; tx: number; ty: number; t: number; kind?: ZoneKind };

export type Accolade = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
};

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
  maxCombo?: number;
  medals?: Accolade[];
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
    /* Bloom's energy, how far the umbrella is open (0 to 1), the frames it stays open after the
       last threat, and the shots it has swallowed since it opened. */
    bloom: number;
    dome: number;
    domeHold: number;
    absorbed: number;
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
  /* The hyperbeam, while it is charging or firing. */
  hyper: Hyper | null;
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
  /* A gust pushing the ship (Cyclone's last phases): its age and how hard, up or down. */
  gust: { t: number; dy: number } | null;
  shake: number;
  callout: { kind: Callout; t: number } | null;
  /* Frames of the launch so far, and how far the background has scrolled. */
  launchT: number;
  scroll: number;
  /* Set when the story needs the game to stop: the boss has just arrived. */
  talk: "boss" | "judgement" | null;
  /* Space 3's Resonance meter and the record the Vanguard copies; null in Space 1 and 2. */
  res: Resonance | null;
  /* Lumen, Space 3's new wingman with a plasma beam (space3-recruit.ts); null elsewhere. */
  lumen: Lumen | null;
  /* The Seed Bolt's mode from a supply pod, and the frames left of it (space3-arsenal.ts). */
  mode: { kind: SeedMode; t: number } | null;
  /* Space 3's chapters 5 to 12: the floating land in the field and the plan it comes from, the disasters to come, and a gravity
     surge dragging the ship (space3-act2.ts). */
  lands: Land[];
  landPlan: LandSpec[];
  landIdx: number;
  events: EventSpec[];
  eventIdx: number;
  pull: { x: number; y: number; t: number } | null;
  /* The Kinetic Push wave being drawn: frames since it left the ship, and where from. */
  kinetic: { t: number; x: number; y: number } | null;
  /* Space 3 builds each flight's waves when it starts (space3-waves.ts); null elsewhere, where PLANS holds the script. */
  plan: Plan[] | null;
  /* The Lance beam while it burns: frames so far. It follows the ship's height. */
  lance: { t: number } | null;
  /* Space 2: Kite, the frames left of Halo's cover and whether it has been given, and what the
     chapter's own achievements count. */
  kite: Kite | null;
  coverT: number;
  /* Frames before Kite's Bloom is ready again. */
  coverCd: number;
  counters2: Counters2;
  /* What the chapter has seen so far, for its results. */
  stats: { spawned: number; kills: number; hits: number; bossFrames: number; maxCombo?: number };
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

const isHazardType = (t: string): t is HKind => t === "flare" || t === "gate" || t === "wall" || t === "perch";

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

/* The chapter's script: Space 3's is built per flight, the others are fixed. */
const planOf = (s: { chapter: number; plan: Plan[] | null }): Plan[] => s.plan ?? PLANS[s.chapter] ?? [];
const PLANS: Plan[][] = [[], landPlan(), seaPlan(), plan(1), plan(2), plan(3), plan(4), plan(5), plan(6), ...SECOND_PLANS];

/* A gold heart may drift in at each of these moments, and it only does with a chance of
   UPGRADE_LUCK: a roll that takes the luck of the run, so some runs find three or four of
   them in the first chapters and some find none for a while. Each is worth XP.heart1. */
export const UPGRADE_LUCK = 0.4;
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
  /* Space 3's outer-system enemies (space3-act2.ts). */
  lancer: [ACT2_ENEMIES.lancer[0], ACT2_ENEMIES.lancer[1], ACT2_ENEMIES.lancer[2]],
  magnet: [ACT2_ENEMIES.magnet[0], ACT2_ENEMIES.magnet[1], ACT2_ENEMIES.magnet[2]],
  frigate: [ACT2_ENEMIES.frigate[0], ACT2_ENEMIES.frigate[1], ACT2_ENEMIES.frigate[2]],
  hangar: [ACT2_ENEMIES.hangar[0], ACT2_ENEMIES.hangar[1], ACT2_ENEMIES.hangar[2]],
  shade: [ACT2_ENEMIES.shade[0], ACT2_ENEMIES.shade[1], ACT2_ENEMIES.shade[2]],
  /* Boss health is set from the damage a ship of the usual level for that chapter
     does when it keeps hitting: about 15 seconds of steady fire for the first boss,
     rising to about 38 for the seventh, and a few minutes for the last, then
     doubled or more for every boss. The
     serpent's coils block shots, so it needs less. */
  boss1: [64, 60, 225],
  boss2: [96, 52, 340],
  boss3: [74, 66, 880],
  boss4: [70, 74, 1340],
  boss5: [34, 28, 1110],
  boss6: [64, 52, 1760],
  boss7: [60, 38, 1550],
  boss8: [96, 84, 5000],
  /* Space 2's bosses: Tidebreaker, Mangrove Hydra, Ice Wyvern, Dune Maw, Iron Meridian, Permafrost,
     Cyclone and Atlas. */
  boss9: [100, 48, 400],
  boss10: [116, 62, 700],
  boss11: [70, 56, 900],
  boss12: [44, 38, 1000],
  boss13: [110, 56, 1200],
  boss14: [104, 56, 1500],
  boss15: [80, 50, 1800],
  boss16: [92, 90, 7000],
  /* Space 3's first boss, Ghost Corvet. */
  boss17: [CORVET.w, CORVET.h, CORVET.hp],
  /* Space 3's second boss, Excavator-X. */
  boss18: [EXCAVATOR.w, EXCAVATOR.h, EXCAVATOR.hp],
  /* Space 3's third boss, Abyssal Wyrm. */
  boss19: [WYRM.w, WYRM.h, WYRM.hp],
  /* Space 3's fourth boss, Armada Reclaimer. */
  boss20: [RECLAIMER.w, RECLAIMER.h, RECLAIMER.hp],
  /* Space 3's bosses of chapters 5 to 12 and their mini bosses (space3-act2.ts). */
  boss21: [ACT2_BOSS.boss21.w, ACT2_BOSS.boss21.h, ACT2_BOSS.boss21.hp],
  boss22: [ACT2_BOSS.boss22.w, ACT2_BOSS.boss22.h, ACT2_BOSS.boss22.hp],
  boss23: [ACT2_BOSS.boss23.w, ACT2_BOSS.boss23.h, ACT2_BOSS.boss23.hp],
  boss24: [ACT2_BOSS.boss24.w, ACT2_BOSS.boss24.h, ACT2_BOSS.boss24.hp],
  boss25: [ACT2_BOSS.boss25.w, ACT2_BOSS.boss25.h, ACT2_BOSS.boss25.hp],
  boss26: [ACT2_BOSS.boss26.w, ACT2_BOSS.boss26.h, ACT2_BOSS.boss26.hp],
  boss27: [ACT2_BOSS.boss27.w, ACT2_BOSS.boss27.h, ACT2_BOSS.boss27.hp],
  boss28: [ACT2_BOSS.boss28.w, ACT2_BOSS.boss28.h, ACT2_BOSS.boss28.hp],
  mini21: [ACT2_MINI.mini21.w, ACT2_MINI.mini21.h, ACT2_MINI.mini21.hp],
  mini22: [ACT2_MINI.mini22.w, ACT2_MINI.mini22.h, ACT2_MINI.mini22.hp],
  mini23: [ACT2_MINI.mini23.w, ACT2_MINI.mini23.h, ACT2_MINI.mini23.hp],
  mini24: [ACT2_MINI.mini24.w, ACT2_MINI.mini24.h, ACT2_MINI.mini24.hp],
  mini25: [ACT2_MINI.mini25.w, ACT2_MINI.mini25.h, ACT2_MINI.mini25.hp],
  mini26: [ACT2_MINI.mini26.w, ACT2_MINI.mini26.h, ACT2_MINI.mini26.hp],
  mini27: [ACT2_MINI.mini27.w, ACT2_MINI.mini27.h, ACT2_MINI.mini27.hp],
  mini28: [ACT2_MINI.mini28.w, ACT2_MINI.mini28.h, ACT2_MINI.mini28.hp],
  /* Space 2's mini bosses: Skyhook, Mudskipper, Cable Fort, Sand Skimmer, Tunnel Sentry, Ice Hunter,
     Storm Petrel and Gatekeeper. */
  sub: [40, 12, 9],
  mini9: [56, 30, 110],
  mini10: [52, 26, 130],
  mini11: [40, 30, 210],
  mini12: [58, 30, 240],
  mini13: [44, 52, 270],
  mini14: [70, 22, 300],
  mini15: [48, 24, 330],
  mini16: [50, 60, 400],
};

/* Space 1 sorts its enemies into three tiers, and this table overrides SIZE's health for it
   (Space 2 shares the same enemy types and keeps SIZE). Small ones die to a hit or two
   (the blaster does 0.75 a shot), light gunners and turrets to three or four, and the big
   ones take a few seconds of steady fire. The chapter bosses (SIZE) sit well above the big
   ones, and rise from chapter to chapter up to the dreadnought. */
const HP_SPACE1: Partial<Record<EType, number>> = {
  swarm: 1, scout: 1, smallrock: 1, drone: 1, shard: 1, funnel: 1, seeker: 1,
  wave: 2, diver: 2, mine: 2, zigzag: 2, pod: 2, comet: 2, jet: 2,
  sniper: 3, gunner: 3, aagun: 3,
  turret: 4, samsite: 4, gunboat: 4, tank: 4, bomber: 4, orbiter: 4, splitter: 4, fighter: 4,
  rock: 5,
  armor: 14, bunker: 14, boulder: 14, airbomber: 12, gunship: 10, destroyer: 30, cruiser: 40,
};

export const enemyHp = (type: EType, chapter: number) => (!isSecond(chapter) && HP_SPACE1[type]) || SIZE[type][2];

/* Where the last boss's layers break, as a share of its health: the energy shield,
   the armour, the core, the overload, a last stand, and at the very end a barrage
   of C4 charges. */
export const FINAL_PHASE_AT = [0.85, 0.66, 0.47, 0.3, 0.14];

/* How many phases each boss has, for the bar that shows its health. */
export const BOSS_PHASES: Record<string, number> = { boss1: 3, boss2: 3, boss3: 3, boss4: 3, boss5: 3, boss6: 3, boss7: 3, boss8: 6, boss9: 3, boss10: 3, boss11: 3, boss12: 3, boss13: 3, boss14: 3, boss15: 3, boss16: 6, boss17: 3, boss18: 3, boss19: 3, boss20: 3, boss21: 3, boss22: 3, boss23: 3, boss24: 3, boss25: 3, boss26: 3, boss27: 3, boss28: 3 };

const SCORE: Record<EType, number> = {
  scout: 10, wave: 20, rock: 30, smallrock: 5, diver: 20, gunner: 40, mine: 25, drone: 5,
  turret: 40, zigzag: 25, armor: 80, seeker: 15, pod: 20,
  swarm: 5, bomber: 45, sniper: 45, orbiter: 50, splitter: 50, cruiser: 400, shard: 5, comet: 20, fighter: 60, funnel: 10,
  tank: 40, aagun: 35, bunker: 90, samsite: 45, jet: 25, gunship: 60, airbomber: 70, gunboat: 40, destroyer: 450, boulder: 30,
  boss1: 1000, boss2: 1800, boss3: 800, boss4: 1500, boss5: 2200, boss6: 2800, boss7: 3500, boss8: 12000,
  boss9: 2000, boss10: 2600, boss11: 3200, boss12: 3600, boss13: 4200, boss14: 5000, boss15: 6000, boss16: 20000, boss17: CORVET.score, boss18: EXCAVATOR.score, boss19: WYRM.score, boss20: RECLAIMER.score,
  boss21: ACT2_BOSS.boss21.score, boss22: ACT2_BOSS.boss22.score, boss23: ACT2_BOSS.boss23.score, boss24: ACT2_BOSS.boss24.score, boss25: ACT2_BOSS.boss25.score, boss26: ACT2_BOSS.boss26.score, boss27: ACT2_BOSS.boss27.score, boss28: ACT2_BOSS.boss28.score,
  mini21: ACT2_MINI.mini21.score, mini22: ACT2_MINI.mini22.score, mini23: ACT2_MINI.mini23.score, mini24: ACT2_MINI.mini24.score, mini25: ACT2_MINI.mini25.score, mini26: ACT2_MINI.mini26.score, mini27: ACT2_MINI.mini27.score, mini28: ACT2_MINI.mini28.score,
  lancer: ACT2_ENEMY_SCORE.lancer, magnet: ACT2_ENEMY_SCORE.magnet, frigate: ACT2_ENEMY_SCORE.frigate, hangar: ACT2_ENEMY_SCORE.hangar, shade: ACT2_ENEMY_SCORE.shade,
  sub: 70,
  mini9: 900, mini10: 1000, mini11: 1100, mini12: 1200, mini13: 1300, mini14: 1400, mini15: 1500, mini16: 1700,
};

export const isBoss = (t: EType) => t.startsWith("boss");
/* The last boss of each game has the shield, the plating, the six phases and the C4. */
export const isFinal = (t: EType) => t === "boss8" || t === "boss16";
/* Space 1 and 2 boss encounters omit predictive overlays. Physical attacks and
   their original warning clocks remain unchanged; Space 3 retains its cues. */
export const hidesAttackPrediction = (e: Pick<Enemy, "type">) => isMini(e.type) || (isBoss(e.type) && Number(e.type.slice(4)) <= 16);
export const hidesTells = (s: State) => s.chapter <= 16 && s.enemies.some(e => e.hp > 0 && e.x < W && e.x + e.w > 0 && hidesAttackPrediction(e));
/* Whether a hazard is still only a warning, not yet harmful. */
export function hazardWarning(h: Hazard) {
  return h.kind === "strike" || h.kind === "twister" ? h.t < h.g[0] : h.kind === "flare" ? h.t < FLARE_WARN : h.kind === "spire" ? h.t < SPIRE.warn : false;
}

/* How hard each chapter is, set in one place: enemies reload more slowly in the
   early chapters and reach full pace by chapter seven. Their torpedoes run the
   same in every chapter (TORPEDO). Index 0 is unused. */
/* Space 2's chapters (9 to 16) follow at the end: they begin where Space 1 left off. */
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
  { fire: 1.6 },
  { fire: 1.45 },
  { fire: 1.35 },
  { fire: 1.25 },
  { fire: 1.15 },
  { fire: 1.1 },
  { fire: 1.05 },
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
  minirocket: { cooldown: 26, ammo: 60 },
  hyperbeam: { cooldown: 40, ammo: 3 },
};

export function createState(chapter = 1, score = 0, weapon = 1, level = 1, extra = 0): State {
  const pose = launchPose(0);
  const state: State = {
    chapter,
    phase: "launch",
    t: 0,
    frame: 0,
    /* Space 3 draws a new seed for every flight, so no two play alike. */
    seed: 1234567 + chapter * 977 + (isThird(chapter) ? Math.floor(Math.random() * 2 ** 30) : 0),
    nextId: 1,
    planIdx: 0,
    p: { x: pose.x, y: launchShipY(level), hp: 0, inv: 0, weapon, gun: "blaster", ammo: 0, bombs: 2, cd: 0, bombT: 0, level, extra, launchCd: 0, tilt: 0, swap: 0, chill: 0, shield: 0, calm: 0, shieldFlash: 0, morph: 0, nukes: NUKE.count + (level >= MAX_LEVEL ? 1 : 0), slashT: 0, bloom: 0, dome: 0, domeHold: 0, absorbed: 0 },
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
    hyper: null,
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
    gust: null,
    shake: 0,
    callout: null,
    launchT: 0,
    scroll: 0,
    talk: null,
    res: isThird(chapter) ? createResonance() : null,
    lumen: null,
    mode: null,
    kinetic: null,
    lands: [],
    landPlan: [],
    landIdx: 0,
    events: [],
    eventIdx: 0,
    pull: null,
    plan: null,
    lance: null,
    kite: isSecond(chapter) && !isThird(chapter) ? { x: pose.x + KITE.dx, y: launchShipY(level) + KITE.dy, cd: 30, kick: 0 } : null,
    coverT: 0,
    coverCd: 0,
    counters2: { rockets: 0, bloomOpens: 0, blocks: 0, beams: 0, bestBeam: 0, covers: 0 },
    stats: { spawned: 0, kills: 0, hits: 0, bossFrames: 0, maxCombo: 0 },
    result: null,
    checkpoint: false,
  };
  /* A run saved when Space 1 still counted gold hearts keeps its level: its experience starts at
     that level's floor. */
  if (state.p.extra < XP.perLevel * (level - 1)) {
    state.p.extra = XP.perLevel * (level - 1);
    state.chapterStartExtra = state.p.extra;
  }
  state.p.hp = maxLife(state.p);
  state.p.shield = isSecond(chapter) ? maxShield(state.p) * SHIELD.start : 0;
  /* Space 3 leaves the old arsenal behind: no bombs and no nukes, and its waves are drawn from the seed. */
  if (isThird(chapter)) {
    state.p.bombs = 0;
    state.p.nukes = 0;
    state.plan = generateWaves(state.seed, { chapter }).plan;
    state.lumen = createLumen({ x: pose.x, y: launchShipY(level) });
    state.landPlan = outerLandPlan(state.seed, chapter);
    state.events = eventPlan(state.seed, chapter, 7000);
  }
  return state;
}

/* The same chapter again from its start, after the ship is lost. */
export function retryChapter(s: State) {
  return createState(s.chapter, s.chapterStartScore, s.chapterStartWeapon, s.chapterStartLevel, s.chapterStartExtra);
}

/* Seconds a good run should take over each boss: beating it sooner earns a share
   of the speed bonus. The bosses take a couple of minutes at the end, so the later
   ones are given longer. Index 0 is unused. */
const BOSS_PAR = [0, 45, 65, 85, 105, 125, 145, 180, 240, 60, 70, 80, 80, 90, 100, 110, 260, CORVET.par, EXCAVATOR.par, WYRM.par, RECLAIMER.par, ACT2_BOSS.boss21.par, ACT2_BOSS.boss22.par, ACT2_BOSS.boss23.par, ACT2_BOSS.boss24.par, ACT2_BOSS.boss25.par, ACT2_BOSS.boss26.par, ACT2_BOSS.boss27.par, ACT2_BOSS.boss28.par];

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
  const medals: Accolade[] = [];
  if (hits === 0) {
    medals.push({ id: "untouchable", name: "UNTOUCHABLE", desc: "No damage taken", icon: "🛡️", color: "#f59e0b" });
  }
  if (bossSeconds < par * 0.8) {
    medals.push({ id: "speed", name: "SPEED DEMON", desc: "Record boss time", icon: "⚡", color: "#06b6d4" });
  }
  if (killRate !== null && killRate >= 0.85) {
    medals.push({ id: "titan", name: "TITAN SLAYER", desc: "85%+ kill rate", icon: "🎯", color: "#ef4444" });
  }
  if ((s.stats.maxCombo ?? 0) >= 6) {
    medals.push({ id: "combo", name: "CHAIN MASTER", desc: `${s.stats.maxCombo}x combo chain`, icon: "🔥", color: "#ec4899" });
  }
  return { kills, spawned, killRate, hits, bossSeconds, killBonus, noHitBonus, speedBonus, bonus: killBonus + noHitBonus + speedBonus, maxCombo: s.stats.maxCombo ?? 0, medals };
}

/* The same chapter again, starting at its boss: the ship as it began the chapter,
   no launch and no enemies before the boss. Offered after the ship is lost there. */
export function bossCheckpoint(s: State) {
  const next = createState(s.chapter, s.chapterStartScore, s.chapterStartWeapon, s.chapterStartLevel, s.chapterStartExtra);
  const list = planOf(s);
  next.phase = "play";
  next.planIdx = list.length;
  next.t = list.length ? list[list.length - 1].t : 0;
  next.pickupIdx = (PICKUP_PLANS[s.chapter] ?? []).length;
  next.p.x = 36;
  next.p.y = H / 2;
  next.p.inv = 90;
  next.checkpoint = true;
  return next;
}

/* How far through the chapter's script the run is, 0 to 1, for the progress bar. */
export function chapterProgress(s: State) {
  const list = planOf(s);
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
  if (h.kind === "wave" || h.kind === "cover" || h.kind === "perch") return [{ x: h.x, y: h.base, w: h.w, h: h.half }];
  if (h.kind === "strike") return h.t >= h.g[0] && h.t < h.g[0] + h.g[1] ? [{ x: h.x, y: h.base, w: h.w, h: h.half }] : [];
  if (h.kind === "twister") return h.t >= h.g[0] ? [{ x: h.x + 3, y: h.base, w: h.w - 6, h: h.half }] : [];
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

/* Space 2: Earth Force digs in. Most ground units come with a wall in front of them, and most ships
   with a floating barrier (a wreck, rocks, a block of ice). It stops the ship's shots, not theirs.
   It is never destroyed: shot, it crumbles down to a stump (`stump` of its height), which leaves
   the top of the unit behind it open. It moves with its unit and stays once the unit is gone.
   g = [hp, maxHp, unit id, gap to the unit, 0 land / 1 sea, hit flash, chapter, bottom, full height]. */
export const COVER2 = { land: { hp: 10, w: 12, rise: 5 }, sea: { hp: 14, w: 16, rise: 4, under: 5 }, gap: 5, share: 0.75, stump: 0.4 };

function digIn(s: State, e: Enemy) {
  const sea = SHIPS.includes(e.type);
  if (!sea && !GROUND_UNITS.includes(e.type)) return;
  if (noise1(e.id) >= COVER2.share) return;
  const c = sea ? COVER2.sea : COVER2.land;
  const top = e.y - c.rise;
  const bottom = sea ? WATER_Y + COVER2.sea.under : e.y + e.h;
  s.hazards.push({ id: s.nextId++, kind: "cover", x: e.x - COVER2.gap - c.w, w: c.w, g: [c.hp, c.hp, e.id, COVER2.gap + c.w, sea ? 1 : 0, 0, s.chapter, bottom, bottom - top], half: bottom - top, base: top, t: 0 });
}
/* Space 2: high ground. On land some ground units sit up on a hill or a crag, and at sea every gun
   emplacement stands on an island; the script also sends big rocks out of the sea on their own.
   A perch is solid: it stops the ship's shots and hurts the ship that flies into it. Under a unit
   it moves with the unit, and drifts with the ground once the unit is gone.
   g = [unit id (0 for none), how far it reaches left of the unit, 0 hill / 1 island / 2 sea rock, chapter]. */
export const PERCH = { share: 0.45, land: [22, 46], island: [20, 34], pad: 20, right: 6 };
export const SEA_PLACES = [1, 2, 6, 7];

function perchUp(s: State, e: Enemy) {
  if (!GROUND_UNITS.includes(e.type)) return;
  const sea = SEA_PLACES.includes(s.chapter - 8);
  if (!sea && noise1(e.id * 1.7 + 3) >= PERCH.share) return;
  const [lo, hi] = sea ? PERCH.island : PERCH.land;
  const tall = Math.round(lo + (hi - lo) * noise1(e.id * 2.3 + 1));
  const floor = sea ? WATER_Y : GROUND_Y;
  const top = floor - tall;
  e.y = e.y0 = top - e.h;
  s.hazards.push({ id: s.nextId++, kind: "perch", x: e.x - PERCH.pad, w: e.w + PERCH.pad + PERCH.right, g: [e.id, PERCH.pad, sea ? 1 : 0, s.chapter], half: (sea ? WATER_Y + 6 : GROUND_Y) - top, base: top, t: 0 });
}

const noise1 = (n: number) => {
  const x = Math.sin(n * 91.345 + 12.9) * 43758.5453;
  return x - Math.floor(x);
};

/* Space 2: every place does something to the ship, announced as the chapter starts.
   1 Pacific: low over the sea (below `below`) the spray slows it.  2 Monsoon: the rain pushes it down.
   3 Himalayas: the wind pushes it back.  4 Sahara: sand in the guns, which cycle at `jam` speed.
   5 Alps: inside a fog band enemy aim scatters (the fog is on the ship's side).  6 Arctic: cold
   engines, slower.  7 Hurricane: turbulence shoves it about.  8 Citadel: home air, the shield
   recharges slowly on its own. */
export const TERRAIN = {
  spray: { below: WATER_Y - 40, slow: 0.75 },
  rain: { push: 0.3 },
  wind: { push: 0.4 },
  sand: { jam: 0.8 },
  fog: { bands: [120, 142, 164], half: 8, scatter: 0.7 },
  cold: { slow: 0.82 },
  turbulence: { x: 0.45, y: 0.6 },
  dawn: { regen: 0.02 },
};
export const TERRAIN_CALL: Callout[] = ["seaspray", "downpour", "blizzard", "sandstorm", "fogbank", "polar", "turbulence", "clearsky"];
export const placeOf = (s: { chapter: number }) => (campaignOf(s.chapter) === 2 ? s.chapter - 8 : 0);

/* Is the ship inside one of the alpine fog bands? */
export function inFog(s: State) {
  if (placeOf(s) !== 5) return false;
  const c = s.p.y + shipSize(s.p.level).h / 2;
  return TERRAIN.fog.bands.some((y) => Math.abs(c - y) < TERRAIN.fog.half);
}

export const FLARE_WARN = 70;
export const FLARE_LIVE = 45;

function spawnHazard(s: State, it: Plan) {
  const kind = it.type as HKind;
  const h: Hazard =
    kind === "flare"
      ? { id: s.nextId++, kind, x: it.x ?? 150, w: 24, g: [], half: 0, base: 0, t: 0 }
      : kind === "perch"
        ? { id: s.nextId++, kind, x: W + 8, w: it.g?.[0] ?? 44, g: [0, 0, 2, s.chapter], half: it.y + 6, base: WATER_Y - it.y, t: 0 }
      : kind === "gate"
        ? { id: s.nextId++, kind, x: W + 8, w: 6, g: [it.y], half: s.chapter <= 7 ? 30 : 27, base: it.y, t: 0 }
        : { id: s.nextId++, kind, x: W + 8, w: 14, g: it.g ?? [60, 156], half: 25, base: 0, t: 0 };
  s.hazards.push(h);
}

function spawn(s: State, type: EType, x: number, y: number, a = 0): Enemy {
  const [baseW, baseH] = SIZE[type];
  const hp = enemyHp(type, s.chapter);
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
    case "lancer": e.vx = -1.6; break;
    case "magnet": e.vx = -0.7; break;
    case "frigate": case "hangar": e.vx = -0.9; break;
    case "shade": e.vx = -2.4; break;
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
    case "sub": e.vx = -1; e.cd = 70 + Math.floor(rand(s) * 60); break;
    default: e.vx = -1; e.cd = 90; break;
  }
  if (GROUND_UNITS.includes(type)) e.y = e.y0 = GROUND_Y - h;
  if (SHIPS.includes(type)) e.y = e.y0 = WATER_Y - h;
  if (type === "sub") e.y = e.y0 = WATER_Y - 3;
  s.enemies.push(e);
  if (isSecond(s.chapter)) {
    perchUp(s, e);
    digIn(s, e);
  }
  return e;
}

/* Frostbite: a hit from a frost shard slows the ship to this share of its speed. */
export const CHILL = { frames: 150, slow: 0.55 };

/* An enemy torpedo from (x, y) along `angle`; `extra` adds the fields of a guided
   or returning one. */
/* Space 2: Earth Force fires stingers as well as torpedoes (STINGER_SHARE of its volleys). A stinger leaves fast, picks up speed,
   and steers a little after the ship for its first moments, then flies straight. A sub's sea
   missile climbs out of the water, turns toward where the ship is, and bursts on its own after a
   while or when it comes close. */
export const STINGER = { speed: 2.6, top: 4.6, accel: 0.08, home: 26, turn: 0.035, life: 150 };
export const SEA_MISSILE = { climb: 2.6, turnAt: 20, speed: 3.4, fuse: 95, split: 6, near: 24, every: 150 };
/* How many of every five Space 2 volleys are stingers; the rest are torpedoes. Which it is goes by
   the frame and where the shot leaves, so every shot of one volley is the same, and no random
   number is spent on it. */
export const STINGER_SHARE = 3;
export const isStingerVolley = (frame: number, x: number) => (Math.floor(x) * 7 + frame) % 5 < STINGER_SHARE;

function shoot(s: State, x: number, y: number, angle: number, kind: Bullet["kind"] = "orb", r = 2.6, extra: Partial<Bullet> = {}) {
  if (x < 12 || x > W - 2 || y < 4 || y > H - 4 || s.bullets.filter(b => b.own === "e").length >= 160) return;
  if (isSecond(s.chapter) && extra.back === undefined && extra.track === undefined) {
    if (inFog(s)) angle += (noise1(s.frame * 3 + s.bullets.length) - 0.5) * TERRAIN.fog.scatter;
    if (!isStingerVolley(s.frame, x)) {
      s.bullets.push(torpedo(x, y, angle, { r, own: "e", dmg: 1, kind, ...extra }));
      return;
    }
    s.bullets.push({ x, y, vx: Math.cos(angle) * STINGER.speed, vy: Math.sin(angle) * STINGER.speed, r: Math.min(r, 2.4), own: "e", dmg: 1, kind: "stinger", life: STINGER.life, home: STINGER.home, ...extra });
    return;
  }
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
  const plating = isFinal(e.type) ? [0.55, 0.65, 0.8, 0.9, 1, 1][e.a] ?? 1 : 1;
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
  if (b.kind === "plasmatorp") {
    explode(s, b.x, b.y, PLASMA.radius, PLASMA.splash * POWER, except, PLASMA.boss);
    s.shake = Math.max(s.shake, 5);
    return;
  }
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
const GUN_OF: Record<string, Exclude<Gun, "blaster">> = { M: "machine", S: "spread", L: "laser", R: "torpedo", I: "icebomb", F: "flame", K: "katana", N: "minirocket", Y: "hyperbeam" };
/* Space 2 adds the mini rocket and the hyperbeam to the crates, and Bloom to what a supply pod can hold. */
const NEW_CRATES: PickupKind[] = ["N", "Y", "U"];
const crateFor = (s: State): PickupKind => {
  /* Space 3 has no guns to find: a supply pod holds a repair, or a mode for the Seed Bolt. */
  if (isThird(s.chapter)) {
    const roll = rand(s);
    return roll < 0.25 ? "H" : roll < 0.5 ? "W" : roll < 0.75 ? "P" : "Q";
  }
  const all = isSecond(s.chapter) ? [...GUN_CRATES, ...NEW_CRATES] : GUN_CRATES;
  return all[Math.floor(rand(s) * all.length)];
};

function drop(s: State, e: Enemy) {
  const x = e.x + e.w / 2;
  const y = e.y + e.h / 2;
  /* A boss leaves nothing: the ship flies off as it falls, with no time to pick anything up. */
  if (isBoss(e.type)) return;
  /* Space 3: a big enemy often leaves a Resonance cell. */
  if (s.res && SCORE[e.type] >= 45 && rand(s) < 0.4) s.pickups.push({ x, y: y - 8, kind: "Z", t: 0 });
  if (isMini(e.type)) {
    /* A mini boss always leaves a gun and a repair. */
    s.pickups.push({ x, y: y - 10, kind: crateFor(s), t: 0 }, { x, y: y + 10, kind: "H", t: 0 });
    if (!isSecond(s.chapter)) s.pickups.push({ x: x + 16, y, kind: "D", t: 0 });
    return;
  }
  if (e.type === "pod") {
    /* A supply pod always holds a gun. */
    s.pickups.push({ x, y, kind: crateFor(s), t: 0 });
    return;
  }
  if (e.type === "shard" || e.type === "swarm" || e.type === "funnel" || e.type === "smallrock") return;
  if (e.type === "cruiser" || e.type === "destroyer") {
    s.pickups.push({ x, y, kind: "H", t: 0 });
    if (rand(s) < 0.5) s.pickups.push({ x, y: y + 18, kind: crateFor(s), t: 0 });
    return;
  }
  const r = rand(s);
  /* The blaster has no power-ups: that share of drops is simply nothing, but in Space 1 part
     of it is a shield crate, the only thing that fills the shield there. */
  if (r < 0.06 && !isSecond(s.chapter)) s.pickups.push({ x, y, kind: "D", t: 0 });
  if (r < 0.12) return;
  if (r < 0.2) s.pickups.push({ x, y, kind: "H", t: 0 });
  else if (r < 0.25) s.pickups.push({ x, y, kind: "B", t: 0 });
  else if (r < 0.285) s.pickups.push({ x, y, kind: crateFor(s), t: 0 });
}

function kill(s: State, e: Enemy) {
  s.score += SCORE[e.type];
  /* Space 3: what a ship destroys feeds its Resonance (bosses give their reward in score, not in meter). */
  if (s.res && !isBoss(e.type)) gain(s.res, killGain(SCORE[e.type]));
  addXp(s, xpOf(e.type, isSecond(s.chapter)));
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
  if (isMini(e.type)) clearPatternOrdnance(s, e.id);
  if (isBoss(e.type)) {
    s.bullets = s.bullets.filter((b) => b.own === "p");
    s.beams = [];
    s.charges = [];
    s.hazards = s.hazards.filter((h) => h.kind !== "flare" && h.kind !== "strike" && h.kind !== "twister");
    s.gust = null;
    for (const o of s.enemies) if (o.type === "funnel" || o.type === "shard") o.hp = 0;
    s.shake = 40;
    for (let i = 0; i < 7; i++) burst(s, e.x + rand(s) * e.w, e.y + rand(s) * e.h, true);
  }
}

/* One more point of extra health; enough of it makes the ship a level bigger. */
/* The ship becomes a level bigger: refilled, a flash, and the upgrade that level brings. */
function gainLevel(s: State) {
  const p = s.p;
  p.level += 1;
  p.hp = maxLife(p);
  if (p.level === MAX_LEVEL) p.nukes += 1;
  p.morph = MORPH;
  p.inv = Math.max(p.inv, 60);
  s.shake = 18;
  s.bombFlash = 6;
  setCallout(
    s,
    p.level === UPGRADE_AT.hypersonic ? "hypersonic" : p.level === UPGRADE_AT.armor ? "mechshield" : p.level === TWIN_AT ? "launcher" : p.level === UPGRADE_AT.repair ? "repair" : p.level === UPGRADE_AT.hq ? "hq" : POWER_UP.at.includes(p.level) ? "power" : "levelup",
  );
  burst(s, p.x + shipSize(p.level).w / 2, p.y + shipSize(p.level).h / 2, true);
}

/* Returns whether the ship was actually hurt (it is not while it is flashing). A hit
   takes LIFE.hit, less with the armour; the shield takes it first and then the ship's own
   health, and nothing else is touched: no upgrade and no level is ever lost. */
function hurtPlayer(s: State, amount = LIFE.hit): boolean {
  const p = s.p;
  if (p.inv > 0 || s.phase !== "play") return false;
  /* Space 3: a ship in its Phase Shift cannot be touched, and a hit costs Resonance. */
  if (s.res && !hurt(s.res)) return false;
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
    /* Like every missile it drops away cold, lights its motor, and only then runs down its target. */
    const stage = warheadStage(w.t);
    const burnT = w.t - NUKE.eject - NUKE.ignite;
    if (w.t === NUKE.eject + 1) for (let i = 0; i < 3; i++) puff(s, w.x - 8, w.y + (i - 1) * 2, -1.2 - i * 0.3, (i - 1) * 0.25, 22, 2.4, 0);
    const cur = Math.atan2(w.vy - (stage === "eject" ? NUKE.drop : 0), w.vx);
    const want = Math.atan2(ty - w.y, tx - w.x);
    const heading = stage === "burn" ? cur + clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -0.14, 0.14) : cur;
    const speed = stage === "eject" ? NUKE.slide : stage === "ignite" ? NUKE.coast : Math.min(NUKE.speed, NUKE.coast + burnT * NUKE.accel);
    w.vx = Math.cos(heading) * speed;
    w.vy = Math.sin(heading) * speed + (stage === "eject" ? NUKE.drop : 0);
    w.x += w.vx;
    w.y += w.vy;
    const hit = s.enemies.some((e) => e.hp > 0 && w.x > e.x && w.x < e.x + e.w && w.y > e.y && w.y < e.y + e.h);
    if (hit || (!target && Math.hypot(tx - w.x, ty - w.y) < 8) || w.x > W - 4 || w.t > 170) detonateWarhead(s, w);
  }
  s.warheads = s.warheads.filter((w) => !w.done);
}

/* Whether the self-repair is mending something right now, for the drawing. */
export function isRepairing(p: State["p"], second = true) {
  return p.calm <= 0 && (p.hp < maxLife(p) || (second && hasUpgrade(p, "repair") && p.shield < maxShield(p)));
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
function explode(s: State, x: number, y: number, radius: number, dmg: number, except = 0, bossShare = 1) {
  burst(s, x, y, true);
  blastSmoke(s, x, y, radius);
  for (const e of s.enemies) {
    if (e.id === except) continue;
    const reach = radius + Math.max(e.w, e.h) / 2;
    if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < reach) {
      if (modsAlive(e)) {
        for (const m of e.mods!) if (m.hp > 0 && Math.hypot(e.x + m.ox + m.w / 2 - x, e.y + m.oy + m.h / 2 - y) < radius + Math.max(m.w, m.h) / 2) hurtMod(s, e, m, dmg * bossShare);
      } else damage(e, isBoss(e.type) ? dmg * bossShare : dmg);
      e.flash = 4;
    }
  }
}

/* A burst of warm smoke that cools and drifts as a blast goes off. */
function blastSmoke(s: State, x: number, y: number, radius: number) {
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + s.frame * 0.7;
    puff(s, x + Math.cos(a) * radius * 0.3, y + Math.sin(a) * radius * 0.3, Math.cos(a) * 0.45, Math.sin(a) * 0.45 - 0.1, 30 + i * 4, radius * 0.16 + 1.2, 1);
  }
}

/* A mini rocket going off: where it hit (the thing it hit takes its direct damage and not this),
   against a wall, or where its fuse ran out. A small blast, a small share against a boss. */
function rocketBlast(s: State, b: Bullet, except = 0, small = false) {
  explode(s, b.x, b.y, small ? ROCKET.blast * 0.7 : ROCKET.blast, small ? ROCKET.splash * 0.6 * POWER : ROCKET.splash * POWER, except, ROCKET.boss);
}

/* Every missile leaves smoke: a puff as it drops off its rail, a warm one as the motor lights, and a
   thin trail behind it while it burns, thicker for the ship's own than for an enemy's, since an enemy
   fires so many of them. */
function trailSmoke(s: State, b: Bullet) {
  const rocket = b.kind === "minirocket" && b.own === "p";
  const torp = b.ux !== undefined && b.uy !== undefined;
  if ((!rocket && !torp) || b.x < 4 || b.x > W - 4) return;
  const age = rocket ? ROCKET.life - (b.life ?? 0) : b.age ?? 0;
  const eject = rocket ? ROCKET.eject : TORPEDO.eject;
  const ignite = rocket ? ROCKET.ignite : TORPEDO.ignite;
  const a = rocket ? b.heading ?? Math.atan2(b.vy, b.vx) : Math.atan2(b.uy as number, b.ux as number);
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const mine = b.own === "p";
  const sway = Math.sin(s.frame * 0.9 + b.x * 0.3) * 0.12;
  if (age === 1) puff(s, b.x - ux * 5, b.y - uy * 5, -ux * 0.3, -uy * 0.3 + sway, 14, 1.3, 0);
  else if (age === eject + 1) {
    for (let i = 0; i < 3; i++) puff(s, b.x - ux * 7, b.y - uy * 7, -ux * (0.5 + i * 0.25), -uy * (0.5 + i * 0.25) + (i - 1) * 0.18, 20 + i * 3, 1.6 + i * 0.3, 1);
  } else if (age > eject + ignite && age % (mine ? 2 : 4) === 0) {
    puff(s, b.x - ux * 8, b.y - uy * 8, -ux * 0.2, -uy * 0.2 + sway, mine ? 32 : 20, mine ? 1.2 : 0.9, 0);
  }
}

function setCallout(s: State, kind: Callout) {
  s.callout = { kind, t: 150 };
}

function puff(s: State, x: number, y: number, vx: number, vy: number, life: number, r: number, tone: number) {
  if (s.smoke.length > 320) s.smoke.shift();
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
      /* Space 3: a flamethrower, a short cone of fire in bursts as it passes. */
      if (isThird(s.chapter) && e.x < W - 30 && e.x > 50 && e.t % 100 < 28 && e.t % 4 === 0) {
        for (const d of [-0.2, 0, 0.2]) shoot(s, e.x, e.y + e.h / 2, Math.PI + d, "fire", 2.6, { life: 30 });
      }
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
        if (isThird(s.chapter)) {
          /* Nothing is dropped in space: it throws three explosive shells ahead of it. */
          for (const d of [-0.3, 0, 0.3]) shoot(s, cx, cy, Math.PI + d, "scrap", 3.6, { fuse: 40, split: 6, splitKind: "pulse", splitAngle: d * 10 });
          e.cd = Math.round(110 * ease);
        } else if (py > cy + 4) {
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
        if (--e.d === 0) { const m = enemyMuzzle(e, s); if (isThird(s.chapter)) for (const d of [-0.05, 0, 0.05]) shoot(s, m.x, m.y, Math.PI + d, "needle", 1.8); else shoot(s, m.x, m.y, Math.PI, "needle", 2.4); }
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
        /* Space 3: it throws a spinning blade that turns round and comes back. */
        if (isThird(s.chapter)) shoot(s, e.x, e.y + e.h / 2, Math.PI, "crescent", 6, { back: 70, life: 420 });
        else aimed(s, e);
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
            if (isThird(s.chapter)) for (const d of [-0.07, 0, 0.07]) shoot(s, e.x, cy, Math.PI + d, "needle", 1.8);
            else shoot(s, e.x, cy, Math.PI, "needle", 2.2);
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
    case "sub":
      /* Under the water, only its sail breaking the surface; now and then a sea missile out of its hatch. */
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 30) * 0.8;
      if (e.n > 0) e.n -= 1;
      if (--e.cd <= 0 && e.x < W - 30 && e.x > 30) {
        e.cd = Math.round(SEA_MISSILE.every * ease);
        e.n = 14;
        s.bullets.push({ x: e.x + e.w * 0.62, y: e.y - 2, vx: -0.3, vy: -SEA_MISSILE.climb, r: 3, own: "e", dmg: 1, kind: "seamissile", retarget: SEA_MISSILE.turnAt, speed2: SEA_MISSILE.speed, fuse: SEA_MISSILE.fuse, split: SEA_MISSILE.split, splitKind: "needle" });
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
    case "boss9": case "boss10": case "boss11": case "boss12":
    case "boss13": case "boss14": case "boss15": case "boss16":
      updateBoss(s, e);
      break;
    case "boss17": case "boss18": case "boss19": case "boss20":
    case "boss21": case "boss22": case "boss23": case "boss24": case "boss25": case "boss26": case "boss27": case "boss28":
    case "mini21": case "mini22": case "mini23": case "mini24": case "mini25": case "mini26": case "mini27": case "mini28":
      updateThirdBoss(s, e);
      break;
    case "lancer": case "magnet": case "frigate": case "hangar": case "shade":
      updateOuterEnemy(s, e);
      break;
    case "mini9": case "mini10": case "mini11": case "mini12":
    case "mini13": case "mini14": case "mini15": case "mini16":
      updateMini(s, e);
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

/* Bosses that stand on the ground or float on the water, and where each waits at the right of the
   screen (the rest hang in the air at `W - 90`). */
export const BOSS_FLOOR: Partial<Record<EType, "ground" | "sea">> = { boss1: "ground", boss2: "sea", boss9: "sea", boss10: "sea", boss13: "ground", boss14: "sea", boss16: "ground" };
export const BOSS_HOME: Partial<Record<EType, number>> = { boss1: W - 96, boss2: W - 126, boss5: W - 112, boss8: W - 112, boss9: W - 126, boss10: W - 112, boss13: W - 124, boss14: W - 120, boss15: W - 108, boss16: W - 112 };
const floorY = (e: Pick<Enemy, "type" | "h">) => (BOSS_FLOOR[e.type] === "ground" ? GROUND_Y - e.h : BOSS_FLOOR[e.type] === "sea" ? WATER_Y - e.h : null);

export const BOSS_SCALE: Partial<Record<EType, number>> = {
  boss1: 1.3, boss2: 1.3, boss3: 1.3, boss4: 1.3,
  boss5: 1.65, boss6: 1.45, boss7: 1.65, boss8: 1.35,
  boss9: 1.3, boss10: 1.3, boss11: 1.4, boss12: 1.5, boss13: 1.2, boss14: 1.3, boss15: 1.45, boss16: 1.75,
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
/* Where each of Space 2's bosses fires from, as an offset from its top left corner in the drawing's
   own units, and how far apart its mounts are. The art is drawn to put its barrels here. */
export const BOSS_MUZZLE: Partial<Record<EType, { x: number; y: number; dy: number }>> = {
  boss9: { x: 6, y: 22, dy: 14 },
  boss10: { x: 44, y: 32, dy: 0 },
  boss11: { x: -2, y: 24, dy: 12 },
  boss12: { x: 0, y: 19, dy: 10 },
  boss13: { x: 4, y: 22, dy: 14 },
  boss14: { x: 4, y: 24, dy: 14 },
  boss15: { x: 2, y: 26, dy: 14 },
  boss16: { x: 5, y: 45, dy: 24 },
};

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
    case "boss9": case "boss10": case "boss11": case "boss12": case "boss13": case "boss14": case "boss15": case "boss16": {
      const m = BOSS_MUZZLE[e.type]!;
      x = e.x + m.x;
      y = e.y + m.y + slot * m.dy;
      break;
    }
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
  const own = BOSS_MUZZLE[e.type];
  if (own) return { x: e.x + own.x - 4, y: e.y + own.y + slot * own.dy };
  if (e.type === "boss2") return { x: e.x - 8, y: e.y + e.h - 20 };
  if (e.type === "boss7") return { x: e.x - 3, y: e.y + 19 };
  return { x: e.x + (e.type === "boss8" ? 5 : -10), y: cy + slot * (e.type === "boss8" ? 24 : 20) };
}

export function missileMuzzle(e: Enemy, slot = 0): { x: number; y: number } {
  if (bossScale(e) !== 1) return bossPoint(e, missileMuzzle(bossModel(e), slot));
  if (e.type === "boss10") return hydraMuzzle(e, 2);
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
  boss9: [["railshot", "tidewall", "geysers", "volley", "helix"], ["geysers", "helix", "railshot", "tidewall", "volley", "railshot"], ["broadside", "helix", "railshot", "tidewall", "geysers", "broadside", "volley"]],
  boss10: [["deckbomb", "rain", "silorocket", "volley", "barrage"], ["silorocket", "barrage", "deckbomb", "rain", "volley", "deckbomb"], ["arsenalsalvo", "rain", "silorocket", "barrage", "deckbomb", "arsenalsalvo", "volley"]],
  boss11: [["avalanche", "shatter", "icewall", "volley", "helix"], ["icewall", "helix", "avalanche", "shatter", "volley", "icewall"], ["lances", "helix", "avalanche", "shatter", "icewall", "lances", "volley"]],
  boss12: [["sandspout", "barrage", "burrow", "volley", "rain"], ["burrow", "rain", "sandspout", "barrage", "volley", "burrow"], ["pinwheel", "barrage", "burrow", "rain", "sandspout", "pinwheel", "volley"]],
  boss13: [["searchlight", "tidewall", "ram", "volley", "shatter"], ["ram", "shatter", "searchlight", "tidewall", "volley", "ram"], ["sweep", "tidewall", "searchlight", "shatter", "ram", "sweep", "volley"]],
  boss14: [["icebreak", "rain", "harpoon", "volley", "helix"], ["harpoon", "helix", "icebreak", "rain", "volley", "harpoon"], ["vortex", "rain", "icebreak", "helix", "harpoon", "vortex", "volley"]],
  boss15: [["lightning", "helix", "twister", "volley", "barrage"], ["twister", "barrage", "lightning", "helix", "volley", "lightning"], ["maelstrom", "helix", "twister", "barrage", "lightning", "maelstrom", "volley"]],
  /* Atlas is the final exam: its own armour first, then Tidebreaker's walls, then Hydra's rain and
     the Wyvern's shatter, then its set piece, the Judgement grid, then all of it, and last a stand
     with no filler at all. */
  boss16: [
    ["quake", "rocketfist", "barrage", "volley", "cluster"],
    ["tidewall", "rocketfist", "quake", "scissor", "volley", "barrage"],
    ["rain", "shatter", "orbital", "cluster", "rocketfist", "volley"],
    ["grid", "march", "helix", "scissor", "grid", "barrage"],
    ["grid", "helix", "shatter", "tidewall", "rocketfist", "rain", "march"],
    ["march", "grid", "helix", "rain", "shatter", "tidewall", "barrage", "grid"],
  ],
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

/* The boss draws its next attack from its phase's pool, shuffled like a deck: every attack is played before any comes round again,
   never the same one twice running, and a phase opens with its first (an ultimate stays an opener). A boss also reads the ship: one
   that hides at the rear is mortared (or flanked) three times in four, one that camps at the top is swept seven times in ten, and one
   that comes close is pinched. */
/* Whether a boss reads where the ship hides. The tests that follow one attack through its phases switch it off. */
export const BOSS_RESPONSE = { on: true };
const DECKS = new WeakMap<Enemy, { bag: AttackKind[]; last: AttackKind | null }>();
function pickAttack(s: State, e: Enemy, moves: AttackKind[], index: number): AttackKind {
  let deck = DECKS.get(e);
  if (!deck || index === 0) { deck = { bag: [], last: null }; DECKS.set(e, deck); }
  let kind: AttackKind;
  if (index === 0) kind = moves[0];
  else {
    if (!deck.bag.length) {
      deck.bag = moves.slice(1).concat(moves[0]);
      for (let i = deck.bag.length - 1; i > 0; i--) {
        const j = Math.floor(rand(s) * (i + 1));
        [deck.bag[i], deck.bag[j]] = [deck.bag[j], deck.bag[i]];
      }
    }
    const at = deck.bag.findIndex((k) => k !== deck!.last);
    kind = deck.bag.splice(at < 0 ? 0 : at, 1)[0];
    const arena = ARENA_OF[e.type]?.kind;
    if (BOSS_RESPONSE.on && arena && moves.includes(arena)) {
      const x = s.p.x, y = s.p.y;
      if (x < 80 && (arena === "mortarRear" || arena === "flankTorpedo") && rand(s) < 0.75) kind = arena;
      else if (y < 50 && arena === "sweepBeam" && rand(s) < 0.7) kind = arena;
      else if (x > 180 && arena === "scissorPincer" && rand(s) < 0.7) kind = arena;
    }
  }
  deck.last = kind;
  return kind;
}

/* Every boss of Space 1 and 2 carries one arena attack (space-arena.ts), in its second phase and after. */
for (const [boss, arena] of Object.entries(ARENA_OF)) {
  BOSS_MOVES[boss].forEach((moves, i) => {
    if (i >= 1) moves.splice(Math.floor(moves.length / 2), 0, arena.kind);
    if (i >= 2) moves.push(arena.kind);
  });
}

function nextBossAttack(s: State, e: Enemy) {
  /* Launched ordnance finishes its own lifetime across ordinary pattern changes. */
  const moves = BOSS_MOVES[e.type][e.a];
  const index = e.attackIndex ?? 0;
  const kind = pickAttack(s, e, moves, index);
  e.attackIndex = index + 1;
  const timing = TIMING[kind] ?? SECOND_TIMING[kind] ?? (isArenaKind(kind) ? ARENA_TIMING[kind] : undefined);
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
  e.attack = { kind, t: 0, warn, live, recover: isSecondBoss(e.type) ? (e.type === "boss10" ? PATTERN.hydraRecovery : isFinal(e.type) ? (e.a >= 4 ? PATTERN.lastRecovery : PATTERN.finalRecovery) : PATTERN.bossRecovery) : isFinal(e.type) ? [40, 36, 34, 32, 32, 34][e.a] : (e.a >= 2 ? 38 : 52) + (e.type === "boss1" ? 24 : 0), lockFrames: isSecondBoss(e.type) && e.type !== "boss10" ? PATTERN.bossLock : 18, angle: muzzle.angle, targetY: s.p.y + shipSize(s.p.level).h / 2, targetX: s.p.x, ...extra };
  if (kind === "charge") { e.c = 1; e.d = 0; }
  if (isArenaKind(kind)) {
    const arena = planArena(kind, () => rand(s), { x: e.x, y: e.y, w: e.w, h: e.h }, shipCenter(s), e.a, ARENA_OF[e.type].flavor);
    e.attack.arena = arena;
    e.attack.warn = arena.warn;
    e.attack.live = arena.live;
    markArena(e.attack, arena);
  }
}

/* What an arena attack declares, in the fields the other attacks use for their warnings (spots, lanes, a gap), so it is read the same way. */
function markArena(a: BossAttack, plan: ArenaPlan) {
  const targets = plan.markers.filter((m) => m.kind === "target"), arrows = plan.markers.filter((m) => m.kind === "arrow" && m.x2 === undefined);
  if (targets.length) a.spots = targets.map((m) => ({ x: m.x, y: m.y }));
  if (arrows.length) a.lanes = arrows.map((m) => m.y);
  if (plan.corridor) a.gapY = (plan.corridor.y0 + plan.corridor.y1) / 2;
  if (plan.bands.length === 2) a.gapY = (bandAt(plan.bands[0], 0).y1 + bandAt(plan.bands[1], 0).y0) / 2;
  if (plan.bands.length === 1) a.gapY = (bandAt(plan.bands[0], 0).y0 + bandAt(plan.bands[0], 0).y1) / 2;
  const spoke = plan.markers.find((m) => m.kind === "line" && plan.arms);
  if (spoke && plan.arms) a.gapAngle = Math.atan2((spoke.y2 ?? spoke.y) - spoke.y, (spoke.x2 ?? spoke.x) - spoke.x) + Math.PI / plan.arms;
}

function shipCenter(s: State) {
  const size = shipSize(s.p.level);
  return { x: s.p.x + size.w / 2, y: s.p.y + size.h / 2 };
}

/* An arena attack played back: the callout, the plan taken again where the ship is when the warning locks (the beams open around it),
   the shots launched on their frames, and the beams moved along their keys. */
function arenaTick(s: State, e: Enemy, a: BossAttack) {
  let plan = a.arena!;
  if (a.t === 0) setCallout(s, ARENA_CALLOUT[plan.kind]);
  /* The tells are the machine's own, nothing is drawn over the field: the exhaust boils and the hull glows for the last 24 frames of the
     wind-up, and the hull kicks back when it fires. */
  if (a.t >= a.warn - 24 && a.t < a.warn) {
    const cy = e.y + e.h / 2;
    if (a.t % 3 === 0) {
      const rear = plan.kind === "mortarRear" || plan.kind === "flankTorpedo";
      puff(s, rear ? e.x + e.w : e.x, cy + (rand(s) - 0.5) * e.h * 0.5, rear ? 0.7 : -0.7, (rand(s) - 0.5) * 0.4, 26, 3.5, 1);
    }
    if (a.t % 6 < 3) e.flash = Math.max(e.flash, 2);
    if (plan.kind === "scissorPincer" || plan.kind === "spiralWheel") e.x += Math.sin(a.t * 2.3) * 0.8;
  }
  if (a.t === a.warn) {
    e.x = Math.min(W - e.w - 2, e.x + (plan.kind === "mortarRear" ? 6 : 3));
    s.shake = Math.max(s.shake, 5);
  }
  if (a.t === a.warn - 18 && plan.bands.length) {
    /* Taken again as the warning locks, against where the ship is now: the slit goes to the far side of it. */
    plan = planArena(plan.kind, () => rand(s), { x: e.x, y: e.y, w: e.w, h: e.h }, shipCenter(s), e.a, ARENA_OF[e.type].flavor);
    a.arena = plan;
    a.live = plan.live;
    markArena(a, plan);
  }
  if (a.t < a.warn) return;
  const t = a.t - a.warn;
  for (const shot of plan.shots) {
    if (shot.at !== t) continue;
    raw(s, shot.x, shot.y, shot.vx, shot.vy, shot.kind, shot.r, { life: shot.life, patternOwner: e.id, ...(shot.hold ? { hold: shot.hold, hvx: shot.hvx, hvy: shot.hvy } : {}) });
  }
  if (!plan.bands.length) return;
  if (t === 0) {
    plan.bands.forEach((band, i) => {
      const { y0, y1 } = bandAt(band, 0);
      s.beams.push({ x0: e.x - 6, y: (y0 + y1) / 2, h: y1 - y0, t: 0, warn: 0, live: plan.live, slot: 100 + i, patternOwner: e.id });
    });
  }
  for (const beam of s.beams) {
    if (beam.patternOwner !== e.id || beam.slot === undefined || beam.slot < 100) continue;
    const { y0, y1 } = bandAt(plan.bands[beam.slot - 100], t);
    beam.y = (y0 + y1) / 2;
    beam.h = y1 - y0;
    beam.x0 = e.x - 6;
  }
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
    const flight = kind === "deckbomb" ? HYDRA.flight : kind === "flak" ? FLAK.flight : kind === "spore" ? SPORE.flight : C4.flight;
    const u = Math.min(1, c.t / flight);
    const k = kind === "deckbomb" ? u : 1 - (1 - u) * (1 - u);
    if (kind === "spore" && c.t > flight) c.tx -= SPORE.drift;
    c.x = c.sx + (c.tx - c.sx) * k;
    c.y = c.sy + (c.ty - c.sy) * k - (kind === "deckbomb" ? 4 * HYDRA.arc * u * (1 - u) : kind === "flak" ? Math.sin(Math.PI * u) * FLAK.arc : 0);
    if (kind === "deckbomb" && c.t >= HYDRA.fuse && c.t < HYDRA.fuse + HYDRA.blast) {
      if (near(s, c.x, c.y, HYDRA.radius)) hurtPlayer(s);
      if (c.t === HYDRA.fuse) { burst(s, c.x, c.y, true); s.shake = Math.max(s.shake, 4); }
    }
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
      case "deckbomb": return c.t < HYDRA.fuse + HYDRA.blast;
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
  s.beams.push({ x0: m.x, y: m.y, h: isFinal(e.type) ? 18 : 14, t: 0, warn: a.warn, live: a.live, ownerId: e.id, slot });
}

/* Moves that carry the boss about on their own, so the usual drift is left alone. */
const OWN_MOVE: AttackKind[] = ["charge", "surge", "dive", "blink", "breach", "burrow"];

/* ---------- Space 2's bosses: their own attacks, ultimates and phase shifts ----------

   None of Space 2's bosses borrows a Space 1 move. Each has two signature attacks, an ultimate
   that opens its last phase (and comes back), and a phase shift of its own. Every attack warns
   first and shows where it will land: lanes (`a.lanes`), columns (`a.cols`) or spots (`a.spots`),
   drawn by space2-boss-fx-art.ts, and always leaves a way through.

     9  Tidebreaker   railshot (a locked rail lane), geysers (columns burst from the sea)
                      ultimate: broadside (wave after wave of shells, the gap shifting)
                      shift: decks awash (escort boats and floating mines)
     10 Hydra         deckbomb (locked mortar arcs), silorocket (below-deck vertical launches)
                      ultimate: arsenal salvo (a marked safe corridor) shift: magazine shutters rupture
     11 Ice Wyvern    avalanche (ice down every column but one), icewall (a wall that forms, then flies)
                      ultimate: lances (three great icicles, each shattering)   shift: shed frost
     12 Dune Maw      sandspout (columns marching out of the sand), burrow (under, and up beneath you)
                      ultimate: pinwheel (four arms turning, then turning back) shift: molt
     13 Iron Meridian ram (a car let loose along the rails), searchlight (a light that hunts, then fires)
                      ultimate: sweep (the great gun's beam rolls down the sky) shift: decoupled
     14 Permafrost    icebreak (spikes out of the sea, marching), harpoon (a chain pulled tight)
                      ultimate: vortex (a ring closing on where you were)       shift: hull breach
     15 Cyclone       lightning (strikes that walk after you), twister (a funnel drifting through)
                      ultimate: maelstrom (six turning arms)       shift: pressure drop (gusts)
     16 Atlas         quake, rocket fist, orbital, cluster, scissor; ultimate: march of Judgement;
                      set piece: the Judgement grid (columns and beams at once, one marked safe cell)
   Each also has two of Space 2's bullet patterns, in a shot of its own (PATTERN_SHOT):
     helix     arms of slow shots wheeling out of the main gun, turning back halfway
     rain      columns of shots falling from the top, but for a marked lane
     tidewall  walls of shots from the right with a marked gap, fast and slow shots in turn
     shatter   shells that burst into rings at marked spots around the ship
     barrage   shotgun blasts at the locked spot, the pellets at mixed speeds
   and every ultimate ends on a fan from the hull, forward only, with an opening toward the ship.
   Every one of them also has volley: its guns fire a fan or two at the ship's locked height, with
   a marked opening just off to one side, so the ship has to move between the bigger attacks. */
export const SECOND_TIMING = SECOND_BOSS_TIMING;
export const PATTERN_SHOT: Partial<Record<EType, Bullet["kind"]>> = {
  boss9: "shell", boss10: "needle", boss11: "ice", boss12: "orb", boss13: "needle", boss14: "frost", boss15: "spiral", boss16: "orb",
};
export const ULTIMATES: AttackKind[] = ["broadside", "arsenalsalvo", "lances", "pinwheel", "sweep", "vortex", "maelstrom", "march"];
export const isSecondBoss = (t: EType) => /^boss(9|1[0-6])$/.test(t);
/* What each column strike looks like: sea spray, sand, white-hot light, ice. */
export const STRIKE_STYLE = { sea: 0, sand: 1, light: 2, ice: 3 } as const;
export const GUST = { every: 420, warn: 54, live: 48, push: 0.7 };

/* A shot that runs straight, unlike the torpedo-paced shots most enemies fire. */
function raw(s: State, x: number, y: number, vx: number, vy: number, kind: Bullet["kind"], r: number, extra: Partial<Bullet> = {}) {
  s.bullets.push({ x, y, vx, vy, r, own: "e", dmg: 1, kind, life: PATTERN.shotLife, ...extra });
}

/* Each encounter owns only its pattern ordnance. Structural scenery and other
   actors are retained on phase changes, defeat or mini-boss retreat.
   Ordinary pattern changes leave launched ordnance to expire naturally. */
function patternCounts(s: State) { return [s.bullets.length, s.beams.length, s.charges.length, s.hazards.length]; }
function tagPattern(s: State, e: Enemy, start: number[]) {
  for (const b of s.bullets.slice(start[0])) b.patternOwner = e.id;
  for (const b of s.beams.slice(start[1])) b.patternOwner = e.id;
  for (const b of s.charges.slice(start[2])) b.patternOwner = e.id;
  for (const b of s.hazards.slice(start[3])) b.patternOwner = e.id;
}
function clearPatternOrdnance(s: State, owner: number) {
  s.bullets = s.bullets.filter(b => b.patternOwner !== owner);
  s.beams = s.beams.filter(b => b.patternOwner !== owner);
  s.charges = s.charges.filter(b => b.patternOwner !== owner);
  s.hazards = s.hazards.filter(b => b.patternOwner !== owner);
}

/* A column of harm, marked for `warn` frames, then live for `live`. */
function strike(s: State, x: number, w: number, warn: number, live: number, style: number, top = 22, height = H - 22) {
  s.hazards.push({ id: s.nextId++, kind: "strike", x: x - w / 2, w, g: [warn, live, style], half: height, base: top, t: 0 });
}

/* A beam across the screen from the left edge to `x0`, already warned, that can roll up or down. */
function lane(s: State, x0: number, y: number, h: number, live: number, vy = 0) {
  s.beams.push({ x0, y, h, t: 0, warn: 0, live, vy });
}

/* Three internal magazines replace the old exposed hydraulic heads. */
export const HYDRA = {
  bays: [{ x: 20, y: 32 }, { x: 44, y: 32 }, { x: 68, y: 32 }],
  flight: 64, fuse: 82, blast: 16, radius: 17, arc: 48,
  climb: 24, launchSpeed: 2.4, rocketSpeed: 3, safeHalf: 25,
} as const;

export function hydraMuzzle(e: Enemy, bay: number) {
  const p = HYDRA.bays[((bay % 3) + 3) % 3];
  return bossPoint(e, { x: e.x + p.x, y: e.y + p.y });
}

function throwDeckBomb(s: State, e: Enemy, bay: number, target: { x: number; y: number }) {
  const p = hydraMuzzle(e, bay);
  s.charges.push({ kind: "deckbomb", x: p.x, y: p.y, sx: p.x, sy: p.y, tx: target.x, ty: target.y, t: 0 });
}

function launchDeckRocket(s: State, e: Enemy, bay: number, target: { x: number; y: number }) {
  const p = hydraMuzzle(e, bay);
  raw(s, p.x, p.y, 0, -HYDRA.launchSpeed, "deckrocket", 3,
    { retarget: HYDRA.climb + 1, speed2: HYDRA.rocketSpeed, aim: { ...target }, life: 200 });
}

function secondAttack(s: State, e: Enemy, a: BossAttack) {
  const start = patternCounts(s);
  const warning = a.t < a.warn, firing = a.t >= a.warn && a.t < a.warn + a.live;
  const lock = a.warn - (a.lockFrames ?? PATTERN.bossLock), t2 = a.t - a.warn;
  const late = e.a >= 2, m = enemyMuzzle(e, s);
  const sx = s.p.x + shipSize(s.p.level).w / 2, sy = s.p.y + shipSize(s.p.level).h / 2;
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  if (a.t === 0 && ULTIMATES.includes(a.kind)) setCallout(s, "ultimate");
  switch (a.kind) {
    case "volley": {
      /* Fans of shells at the locked height, with the opening a little to one side of it. */
      if (a.t <= lock) {
        const aim = Math.atan2(sy - m.y, sx - m.x), side = (e.attackIndex ?? 0) % 4 < 2 ? 1 : -1;
        a.angle = aim; a.gapAngle = aim + side * 0.3;
      }
      const waves = e.a >= 1 ? 3 : 2, count = e.a >= 1 ? 11 : 9;
      if (firing && t2 % 18 === 0 && t2 / 18 < waves) for (let k = 0; k < count; k++) {
        const angle = a.angle + (k - (count - 1) / 2) * 0.13;
        if (Math.abs(angleDifference(angle, a.gapAngle!)) < 0.2) continue;
        raw(s, m.x, m.y, Math.cos(angle) * 2.6, Math.sin(angle) * 2.6, "shell", 2.4);
      }
      break;
    }
    case "helix": {
      /* Arms wheeling round the gun, only those facing left firing; they turn back halfway. */
      if (a.t === 0) a.spots = [{ x: m.x, y: m.y }];
      const arms = 3 + Math.min(2, e.a), every = e.a >= 2 ? 4 : 5;
      if (firing && t2 % every === 0) {
        const half = a.live / 2, turn = (t2 < half ? t2 : 2 * half - t2) * 0.07;
        for (let k = 0; k < arms; k++) {
          const angle = Math.PI + turn + (k * Math.PI * 2) / arms;
          if (Math.cos(angle) < 0.15) raw(s, m.x, m.y, Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, PATTERN_SHOT[e.type] ?? "orb", 2.4);
        }
      }
      break;
    }
    case "rain": {
      /* Columns falling from the top edge, every one but the lane nearest the ship. */
      const grid = Array.from({ length: 11 }, (_, i) => 30 + i * 20);
      if (a.t <= lock) {
        a.gapX = grid.reduce((best, x) => Math.abs(x - sx) < Math.abs(best - sx) ? x : best);
        a.safeHalf = PATTERN.gapHalf;
        a.cols = grid.filter((x) => Math.abs(x - a.gapX!) > 20);
      }
      const gap = e.a >= 2 ? 7 : 9;
      if (firing && t2 % gap === 0) for (const x of a.cols!) raw(s, x + ((t2 / gap) % 2 ? 6 : -6), 24, 0, 2.3, PATTERN_SHOT[e.type] ?? "needle", 2.3, { life: 96 });
      break;
    }
    case "tidewall": {
      /* Walls of shots from the right with a gap at the locked height; every other shot is
         slower, so each wall shears into layers as it comes. */
      if (a.t <= lock) { a.gapY = clamp(sy, 50, 170); a.safeHalf = 22; }
      const walls = e.a >= 1 ? 7 : 6;
      if (firing && t2 % 13 === 0 && t2 / 13 < walls) {
        /* The rows stop above the sea or the ground the boss stands on. */
        const floor = (BOSS_FLOOR[e.type] === "sea" ? WATER_Y : GROUND_Y) - 8;
        let k = 0;
        for (let y = 30; y <= floor; y += 14, k++) {
          if (Math.abs(y - a.gapY!) < 22) continue;
          const speed = k % 2 ? 1.9 : 2.6;
          raw(s, e.x - 4, y, -speed, 0, PATTERN_SHOT[e.type] ?? "shell", 2.4);
        }
      }
      break;
    }
    case "shatter": {
      /* Shells to marked spots round the ship, each bursting into a ring. */
      const count = e.a >= 1 ? 4 : 3;
      if (a.t <= lock) a.spots = spacedPositions(sy, count, 40, 36, 184).map((y, i) => ({ x: clamp(sx + (i % 2 ? 36 : 12), 50, 200), y }));
      if (firing && t2 % 16 === 0 && t2 / 16 < count) {
        const p = a.spots![t2 / 16], angle = Math.atan2(p.y - m.y, p.x - m.x), dist = Math.hypot(p.x - m.x, p.y - m.y);
        raw(s, m.x, m.y, Math.cos(angle) * 3, Math.sin(angle) * 3, "shell", 3.4,
          { fuse: Math.max(12, Math.round(dist / 3)), split: e.a >= 2 ? 12 : 10, splitKind: PATTERN_SHOT[e.type] ?? "needle", splitAngle: t2 * 0.3 });
      }
      break;
    }
    case "barrage": {
      /* Shotgun blasts at the locked spot, the pellets spread a little and at mixed speeds. */
      if (a.t <= lock) a.spots = [{ x: sx, y: sy }];
      const blasts = e.a >= 1 ? 5 : 4;
      if (firing && t2 % 14 === 0 && t2 / 14 < blasts) {
        const aim = Math.atan2(a.spots![0].y - m.y, a.spots![0].x - m.x);
        for (let k = 0; k < 7; k++) {
          const angle = aim + (rand(s) - 0.5) * 0.5, speed = 1.9 + rand(s) * 1.2;
          raw(s, m.x, m.y, Math.cos(angle) * speed, Math.sin(angle) * speed, PATTERN_SHOT[e.type] ?? "shell", 2.2);
        }
      }
      break;
    }
    case "railshot":
      if (a.t <= lock) {
        const count = e.a >= 1 ? 2 : 1;
        a.lanes = spacedPositions(sy, count, 58, 34, 188);
      }
      if (firing && t2 % 24 < 6 && t2 % 3 === 0 && Math.floor(t2 / 24) < (a.lanes?.length ?? 0)) {
        const angle = Math.atan2(a.lanes![Math.floor(t2 / 24)] - m.y, 24 - m.x);
        raw(s, m.x, m.y, Math.cos(angle) * 4.4, Math.sin(angle) * 4.4, "needle", 2.6);
        s.shake = Math.max(s.shake, 4);
      }
      break;
    case "geysers": {
      const grid = [40, 96, 152, 208];
      if (a.t === 0) {
        a.gapX = grid.reduce((best, x) => Math.abs(x - sx) < Math.abs(best - sx) ? x : best);
        a.safeHalf = PATTERN.gapHalf; a.cols = grid.filter(x => x !== a.gapX);
      }
      if (firing && t2 % 18 === 0 && t2 / 18 < 3) strike(s, a.cols![t2 / 18], 18, 12, 18, STRIKE_STYLE.sea, 30, WATER_Y - 30);
      break;
    }
    case "broadside":
      if (a.t === 0) { a.gapY = clamp(sy, 64, 152); a.safeHalf = 28; }
      if (firing && t2 % 32 === 0) {
        const wave = t2 / 32, gapY = clamp(a.gapY! + Math.sin(wave * 0.7) * 18, 52, 166);
        for (const slot of [-1, 0, 1]) {
          const port = enemyMuzzle(e, s, slot), gap = Math.atan2(gapY - port.y, 40 - port.x);
          for (let k = -4; k <= 4; k++) {
            const angle = Math.PI + k * 0.2;
            if (Math.abs(angleDifference(angle, gap)) < 0.24) continue;
            raw(s, port.x, port.y, Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, "shell", 2.6);
          }
        }
      }
      break;
    case "deckbomb": {
      const count = e.a === 0 ? 2 : 3;
      if (a.t <= lock) a.spots = spacedPositions(sx, count, 48, 30, W * 0.48).map((x, i) => ({ x, y: clamp(sy + (i % 2 ? 14 : -14), 42, 154) }));
      if (firing && t2 % 24 === 0 && t2 / 24 < count) throwDeckBomb(s, e, t2 / 24, a.spots![t2 / 24]);
      break;
    }
    case "silorocket": {
      if (a.t <= lock) a.spots = spacedPositions(sy, 3, 34, 40, 154).map(y => ({ x: clamp(sx, 30, W * 0.48), y }));
      const count = late ? 5 : e.a >= 1 ? 4 : 3;
      if (firing && t2 % 14 === 0 && t2 / 14 < count) { const i = t2 / 14; launchDeckRocket(s, e, 2 - i % 3, a.spots![i % 3]); }
      break;
    }
    case "arsenalsalvo":
      if (a.t === 0) {
        a.gapY = sy < 100 ? 155 : 48; a.safeHalf = 25;
        const row = a.gapY > 100 ? 62 : 137;
        a.spots = [{ x: 68, y: row }, { x: 140, y: row }, { x: 104, y: row + (row < 100 ? 12 : -12) }];
      }
      if (firing && t2 % 32 === 0 && t2 < 96) { const i = t2 / 32; throwDeckBomb(s, e, i, a.spots![i % 3]); }
      if (firing && t2 % 18 === 9 && t2 < 108) { const i = (t2 - 9) / 18; launchDeckRocket(s, e, 2 - i % 3, a.spots![i % 3]); }
      break;
    case "avalanche": {
      const grid = [42, 98, 154, 210];
      if (a.t === 0) { a.gapX = grid[(e.attackIndex ?? 0) % grid.length]; a.safeHalf = 26; a.cols = grid.filter(x => x !== a.gapX); a.spots = [{ x: a.gapX, y: 0 }]; }
      if (firing && t2 % 24 === 0 && t2 < (late ? 96 : 72)) for (const x of a.cols!) raw(s, x, 24, 0, 2.6, "ice", 3);
      break;
    }
    case "icewall":
      if (a.t === 0) { a.gapY = [62, 108, 154][(e.attackIndex ?? 0) % 3]; a.safeHalf = 32; }
      if (firing && t2 === 0) for (let y = 30; y < H - 12; y += 18) {
        if (Math.abs(y - a.gapY!) < 37) continue;
        raw(s, e.x - 20, y, 0, 0, "ice", 3, { hold: 30, hvx: -2.6, hvy: 0 });
      }
      break;
    case "lances":
      if (a.t <= lock) a.spots = spacedPositions(sy, 3, 48, 38, 182).map((y, i) => ({ x: clamp(sx + (i - 1) * 22, 40, 182), y }));
      a.gapAngle = Math.PI;
      if (firing && t2 % 44 === 0 && t2 / 44 < 3) {
        const p = a.spots![t2 / 44], angle = Math.atan2(p.y - m.y, p.x - m.x);
        raw(s, m.x, m.y, Math.cos(angle) * 3.4, Math.sin(angle) * 3.4, "ice", 5,
          { fuse: Math.max(12, Math.round(Math.hypot(p.x - m.x, p.y - m.y) / 3.4)), split: 8, splitKind: "frost", splitGap: Math.PI, splitHalf: 0.65 });
      }
      break;
    case "sandspout": {
      const grid = [40, 96, 152, 208];
      if (a.t === 0) { a.gapX = grid[(e.attackIndex ?? 0) % 4]; a.safeHalf = 26; a.cols = grid.filter(x => x !== a.gapX).reverse(); }
      if (firing && t2 % 22 === 0 && t2 / 22 < 3) strike(s, a.cols![t2 / 22], 18, 14, 20, STRIKE_STYLE.sand, 46, GROUND_Y - 38);
      break;
    }
    case "burrow": {
      if (a.t <= lock) a.spots = [{ x: clamp(sx, 56, 182), y: GROUND_Y }];
      const p = a.spots?.[0];
      if (warning) glide(e, e.x, H + 30, 4);
      else if (firing && p) {
        if (t2 === 0) { e.x = p.x - e.w / 2; e.y = H + 10; }
        if (t2 < 24) e.y -= (H + 10 - (GROUND_Y - e.h - 30)) / 24;
        if (t2 === 24) {
          for (const angle of [Math.PI + 0.35, Math.PI + 0.8, Math.PI + 1.2]) raw(s, e.x, e.y + e.h / 2, Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, "shell", 2.6);
          s.shake = Math.max(s.shake, 6);
        }
      } else glide(e, Math.min(BOSS_HOME[e.type] ?? W - 100, W - e.w - 14), H / 2 - e.h / 2, 5);
      break;
    }
    case "pinwheel":
      if (a.t === 0) { a.gapAngle = Math.PI; a.spots = [{ x: m.x, y: m.y }]; }
      if (firing && t2 % 10 === 0) {
        const turn = Math.min(t2, a.live - t2) * 0.022;
        for (let k = 0; k < 5; k++) {
          const angle = turn + k * Math.PI * 2 / 5;
          if (Math.abs(angleDifference(angle, Math.PI)) < 0.34) continue;
          raw(s, m.x, m.y, Math.cos(angle) * 2, Math.sin(angle) * 2, "spiral", 2.4, { life: 180 });
        }
      }
      break;
    case "ram":
      a.lanes = [GROUND_Y - 13];
      if (firing) for (let i = 0; i < (e.a >= 1 ? 2 : 1); i++) {
        const age = t2 - i * 40;
        if (age < 0) continue;
        const x = e.x - 4 - age * 4.4;
        if (x > -30) e.parts.push({ x: x - 26, y: GROUND_Y - 25, w: 26, h: 24 });
      }
      break;
    case "searchlight":
      if (a.t <= lock) a.spots = [{ x: clamp(sx, 30, 190), y: clamp(sy, 34, 184) }];
      if (firing && t2 % 26 === 0) {
        const p = a.spots![0], angle = Math.atan2(p.y - m.y, p.x - m.x);
        for (const d of [-0.14, 0, 0.14]) raw(s, m.x, m.y, Math.cos(angle + d) * 2.8, Math.sin(angle + d) * 2.8, "needle", 2.2);
      }
      break;
    case "sweep": {
      const down = (e.attackIndex ?? 0) % 2 === 1;
      if (a.t === 0) { a.lanes = down ? [30, 142] : [194, 82]; a.gapY = down ? 180 : 50; a.safeHalf = 20; }
      if (firing && t2 === 0) lane(s, m.x, a.lanes![0], 16, a.live, (a.lanes![1] - a.lanes![0]) / a.live);
      break;
    }
    case "icebreak": {
      const grid = [40, 96, 152, 208];
      if (a.t === 0) { a.gapX = grid[(e.attackIndex ?? 0) % 4]; a.safeHalf = 26; a.cols = grid.filter(x => x !== a.gapX); }
      if (firing && t2 % 26 === 0 && t2 / 26 < 3) strike(s, a.cols![t2 / 26], 18, 16, 24, STRIKE_STYLE.ice, WATER_Y - 104, 104);
      break;
    }
    case "harpoon":
      if (a.t <= lock) a.lanes = spacedPositions(sy, e.a >= 1 ? 2 : 1, 58, 36, 186);
      if (firing && (t2 === 0 || t2 >= 28 && t2 < 44 && t2 % 4 === 0)) a.lanes!.forEach((y, i) => {
        const p = enemyMuzzle(e, s, i), angle = Math.atan2(y - p.y, 24 - p.x);
        raw(s, p.x, p.y, Math.cos(angle) * (t2 === 0 ? 4 : 3), Math.sin(angle) * (t2 === 0 ? 4 : 3), "needle", t2 === 0 ? 2.6 : 1.7);
      });
      break;
    case "vortex":
      if (a.t <= lock) { a.spots = [{ x: clamp(sx, 100, 178), y: clamp(sy, 76, 140) }]; a.gapAngle = sy < 108 ? Math.PI / 2 : -Math.PI / 2; }
      if (firing && t2 === 0) {
        const p = a.spots![0];
        for (let i = 0; i < 20; i++) {
          const angle = i * Math.PI / 10;
          if (Math.abs(angleDifference(angle, a.gapAngle!)) < 0.6) continue;
          raw(s, p.x + Math.cos(angle) * PATTERN.vortexRadius, p.y + Math.sin(angle) * PATTERN.vortexRadius, -Math.cos(angle) * 1.2, -Math.sin(angle) * 1.2, "frost", 2.4, { life: 82 });
        }
      }
      break;
    case "lightning":
      if (a.t <= lock) { a.cols = spacedPositions(sx, late ? 4 : 3, 48, 24, 224); if ((e.attackIndex ?? 0) % 2) a.cols.reverse(); }
      if (firing && t2 % 26 === 0 && t2 / 26 < a.cols!.length) strike(s, a.cols![t2 / 26], 16, 24, 10, STRIKE_STYLE.light);
      break;
    case "twister":
      if (a.t === 0) { const top = (e.attackIndex ?? 0) % 2 === 0; a.lanes = top ? [30, 128] : [102, 200]; a.gapY = top ? 176 : 54; a.safeHalf = 22; }
      if (firing && t2 === 0) s.hazards.push({ id: s.nextId++, kind: "twister", x: e.x - 20, w: 20, g: [24, 190, 0], half: 98, base: a.lanes![0], t: 0 });
      break;
    case "maelstrom":
      if (a.t <= lock) a.gapAngle = Math.atan2(sy - cy, sx - cx);
      if (firing && t2 % 10 === 0) {
        const turn = Math.min(t2, a.live - t2) * 0.02;
        for (let k = 0; k < 6; k++) {
          const angle = turn + k * Math.PI / 3;
          if (Math.abs(angleDifference(angle, a.gapAngle!)) < 0.38) continue;
          raw(s, cx, cy, Math.cos(angle) * 1.95, Math.sin(angle) * 1.95, "spiral", 2.3, { life: 180 });
        }
      }
      break;
    case "quake": {
      const grid = [38, 86, 134, 182];
      if (a.t === 0) { a.gapX = grid[(e.attackIndex ?? 0) % 4]; a.safeHalf = 24; a.spots = grid.filter(x => x !== a.gapX).map(x => ({ x, y: GROUND_Y })); }
      if (firing && t2 % 22 === 0 && t2 / 22 < 3) {
        const p = a.spots![t2 / 22];
        for (const dx of [-4, 4]) raw(s, p.x + dx, GROUND_Y - 2, 0, -2.6, "shell", 2.5);
        /* Once the plating has cracked each vent fans out as well. */
        if (e.a >= 1) for (const d of [-0.4, 0.4]) raw(s, p.x, GROUND_Y - 2, Math.sin(d) * 2.4, -Math.cos(d) * 2.4, "orb", 2.4);
        if (t2 === 0) s.shake = Math.max(s.shake, 6);
      }
      break;
    }
    case "rocketfist":
      if (a.t <= lock) { a.spots = [{ x: clamp(sx, 44, 184), y: clamp(sy, 38, 178) }]; a.lanes = [a.spots[0].y]; a.origin = { x: m.x, y: m.y }; }
      if (firing) {
        const from = a.origin!, to = a.spots![0];
        const u = t2 < 32 ? t2 / 32 : Math.max(0, (64 - t2) / 32);
        if (u > 0) e.parts.push({ x: from.x + (to.x - from.x) * u - 10, y: from.y + (to.y - from.y) * u - 9, w: 20, h: 18 });
        /* Once the plating has cracked the fist bursts into a ring where it lands. */
        if (t2 === 32 && e.a >= 1) {
          for (let i = 0; i < 8; i++) { const ang = (i / 8) * Math.PI * 2 + Math.PI / 8; raw(s, to.x, to.y, Math.cos(ang) * 2, Math.sin(ang) * 2, "orb", 2.4); }
          s.shake = Math.max(s.shake, 6);
        }
      }
      break;
    case "grid": {
      /* The Judgement grid: every column but one burns, and every lane but one, at once; the one
         safe cell is where the open column and the open lane cross, nearest the ship at lock. */
      const columns = [38, 86, 134, 182], lanesY = [52, 92, 132, 172];
      if (a.t <= lock) {
        a.gapX = columns.reduce((best, x) => Math.abs(x - sx) < Math.abs(best - sx) ? x : best);
        a.gapY = lanesY.reduce((best, y) => Math.abs(y - sy) < Math.abs(best - sy) ? y : best);
        a.safeHalf = 22;
        a.cols = columns.filter((x) => x !== a.gapX);
        a.lanes = lanesY.filter((y) => y !== a.gapY);
      }
      if (firing && t2 === 0) {
        for (const x of a.cols!) strike(s, x, 22, 0, a.live, STRIKE_STYLE.light);
        for (const y of a.lanes!) lane(s, e.x - 4, y, 14, a.live);
        s.shake = Math.max(s.shake, 8);
      }
      break;
    }
    case "orbital": {
      const grid = [38, 86, 134, 182];
      if (a.t === 0) { a.gapX = grid[(e.attackIndex ?? 0) % 4]; a.safeHalf = 24; a.cols = grid.filter(x => x !== a.gapX); }
      if (firing && t2 % 28 === 0 && t2 / 28 < 3) strike(s, a.cols![t2 / 28], 20, 30, 12, STRIKE_STYLE.light);
      break;
    }
    case "cluster":
      if (a.t <= lock) a.spots = spacedPositions(sy, 3, 52, 38, 182).map(y => ({ x: clamp(sx + 18, 56, 182), y }));
      a.gapAngle = Math.PI;
      if (firing && t2 % 22 === 0 && t2 / 22 < 3) {
        const p = a.spots![t2 / 22], angle = Math.atan2(p.y - m.y, p.x - m.x);
        raw(s, m.x, m.y, Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, "shell", 3.6,
          { fuse: Math.max(12, Math.round(Math.hypot(p.x - m.x, p.y - m.y) / 2.8)), split: 8, splitAngle: 0, splitGap: Math.PI, splitHalf: 0.6 });
      }
      break;
    case "scissor": {
      const top = beamMuzzle(e, -1), bottom = beamMuzzle(e, 1);
      if (a.t === 0) { a.lanes = [top.y, bottom.y]; a.gapY = 108; a.safeHalf = 22; }
      if (firing && t2 === 0) {
        lane(s, top.x, top.y, 12, a.live, (78 - top.y) / a.live);
        lane(s, bottom.x, bottom.y, 12, a.live, (138 - bottom.y) / a.live);
      }
      break;
    }
    case "march":
      if (a.t === 0) a.cols = [204, 170, 136, 102, 68, 34];
      if (firing) {
        if (t2 % 22 === 0 && t2 / 22 < 6) strike(s, a.cols![t2 / 22], 18, 36, 10, STRIKE_STYLE.light);
        const second = t2 - 162;
        if (e.a >= 4 && second >= 0 && second % 22 === 0 && second / 22 < 6) strike(s, [...a.cols!].reverse()[second / 22], 18, 36, 10, STRIKE_STYLE.light);
      }
      break;
  }
  /* An ultimate ends on a fan from the hull, every way forward of it, with an opening toward the
     ship; nothing is thrown back behind the boss. */
  if (ULTIMATES.includes(a.kind) && firing && t2 === a.live - 1) {
    const n = 22 + e.a * 2, aim = Math.atan2(sy - cy, sx - cx);
    for (let i = 0; i < n; i++) {
      const angle = aim + Math.PI / n + (i / n) * Math.PI * 2;
      if (Math.abs(angleDifference(angle, aim)) < 0.42 || Math.cos(angle) > 0.15) continue;
      raw(s, cx, cy, Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, PATTERN_SHOT[e.type] ?? "orb", 2.4);
    }
    s.shake = Math.max(s.shake, 10);
  }
  tagPattern(s, e, start);
}

/* ---------- Space 2's mini bosses ----------

   Before each chapter's boss, a mini boss holds the way: a machine of its own with two attacks
   of its own, marked before they land like everything else. It comes in from the right, takes its
   place, alternates its attacks, and after MINI.stay frames gives up and flies off (it is then not
   counted as destroyed). The chapter's boss waits until it has gone. Destroyed, it always leaves a
   gun crate and a repair crate.

     9  Skyhook       tiltrotor gunship   rotor wash (mines that hang, then drop), sweep gun (a stream that swings)
     10 Mudskipper    hovercraft          skip (a hop to a marked spot, a splash ring), net gun (a net that opens)
     11 Cable Fort    gondola on a cable  cable slide (along the top, icicles below), chaff (a slow ring)
     12 Sand Skimmer  sail tank           dune ram (a dash along the ground), mortar (shells that burst in a cross)
     13 Tunnel Sentry guns in the rock    ladder (lanes, one by one, top to bottom), lattice (a grid that lets go)
     14 Ice Hunter    submarine           torpedo fan (low lanes), periscope (a column up from the sea)
     15 Storm Petrel  drone leader        feather fan (two fans crossing), dive bomb (a dive to a marked spot)
     16 Gatekeeper    gate mech           gate laser (columns with one gap), shield drones (it guards and fires) */
export const MINI = { stay: 2400, recover: PATTERN.miniRecovery };
export const isMini = (t: EType) => t.startsWith("mini");
const MINI_MOVES: Partial<Record<EType, AttackKind[]>> = {
  mini9: ["rotorwash", "sweepgun"],
  mini10: ["skip", "netgun"],
  mini11: ["cableslide", "chaff"],
  mini12: ["duneram", "mortar"],
  mini13: ["ladder", "lattice"],
  mini14: ["torpfan", "periscope"],
  mini15: ["featherfan", "divebomb"],
  mini16: ["gatelaser", "shielddrones"],
};
export const MINI_TIMING = SECOND_MINI_TIMING;
/* Where each stands: on the water, on the ground, along the top, or in the air. */
const MINI_FLOOR: Partial<Record<EType, "sea" | "ground" | "top" | "air">> = {
  mini9: "air", mini10: "sea", mini11: "top", mini12: "ground", mini13: "air", mini14: "sea", mini15: "air", mini16: "ground",
};

function miniRest(e: Enemy) {
  const f = MINI_FLOOR[e.type];
  return f === "sea" ? WATER_Y - e.h : f === "ground" ? GROUND_Y - e.h : f === "top" ? 20 : H / 2 - e.h / 2;
}

/* Canonical visible gun apertures; the Sentry has three separate rails. */
export function miniMuzzle(e: Enemy, slot = 0) {
  if (e.type === "mini13") return { x: e.x + (slot === 1 ? 2 : 1), y: e.y + [12, 26, 39][Math.max(0, Math.min(2, slot))] };
  return { x: e.x + 2, y: e.y + e.h / 2 };
}

function updateMini(s: State, e: Enemy) {
  const home = W - e.w - 22, rest = miniRest(e);
  if (e.t > MINI.stay) {
    clearPatternOrdnance(s, e.id); e.attack = undefined; e.guard = 0; e.x += 2.2;
    if (e.x > W + 60) e.x = W + 200;
    return;
  }
  if (!e.attack && e.b === 0) {
    e.x = Math.max(home, e.x - 2); e.y = rest;
    if (e.x > home) return;
    setCallout(s, "miniboss");
  }
  e.b += 1;
  if (!e.attack) {
    const moves = MINI_MOVES[e.type] ?? [], kind = moves[(e.attackIndex ?? 0) % moves.length];
    e.attackIndex = (e.attackIndex ?? 0) + 1;
    const [warn, live] = MINI_TIMING[kind] ?? [60, 60];
    e.attack = { kind, t: 0, warn, live, recover: MINI.recover, lockFrames: PATTERN.miniLock, angle: Math.PI, targetX: s.p.x, targetY: s.p.y };
  }
  const a = e.attack, start = patternCounts(s);
  const warning = a.t < a.warn, firing = a.t >= a.warn && a.t < a.warn + a.live;
  const lock = a.warn - (a.lockFrames ?? PATTERN.miniLock), t2 = a.t - a.warn;
  const sx = s.p.x + shipSize(s.p.level).w / 2, sy = s.p.y + shipSize(s.p.level).h / 2;
  const port = miniMuzzle(e), mx = port.x, my = port.y;
  const settle = () => { e.x += (home - e.x) * 0.12; e.y += (rest - e.y) * 0.12; };
  e.guard = 0;
  switch (a.kind) {
    case "rotorwash":
      if (a.t === 0) { a.cols = [88, 148, 208]; a.gapY = 56; a.safeHalf = 26; a.spots = a.cols.map(x => ({ x, y: H - 8 })); }
      if (firing && t2 === 0) for (const target of a.spots!) {
        const source = { x: e.x + 47, y: e.y + 22 };
        raw(s, source.x, source.y, (target.x - source.x) / 76, (target.y - source.y) / 76, "orb", 3.3, { life: 100 });
      }
      break;
    case "sweepgun":
      if (a.t === 0) { a.lanes = [my - 64, my, my + 64]; a.spots = a.lanes.map(y => ({ x: 32, y: clamp(y, 28, 194) })); }
      if (firing && t2 % 24 < 9 && t2 % 3 === 0 && Math.floor(t2 / 24) < 3) {
        const p = a.spots![Math.floor(t2 / 24)], angle = Math.atan2(p.y - my, p.x - mx);
        raw(s, mx, my, Math.cos(angle) * 2.7, Math.sin(angle) * 2.7, "needle", 2.1);
      }
      break;
    case "skip": {
      if (a.t <= lock) { a.spots = [{ x: clamp(sx + 30, 84, 220), y: WATER_Y }]; a.origin = { x: e.x, y: e.y }; }
      if (firing) {
        const p = a.spots![0], from = a.origin!;
        if (t2 <= 36) {
          const u = t2 / 36; e.x = from.x + (p.x - e.w / 2 - from.x) * u; e.y = rest - Math.sin(Math.PI * u) * 42;
          if (t2 === 36) { for (const angle of [Math.PI + 0.25, Math.PI + 0.65, Math.PI + 1.05]) raw(s, p.x, WATER_Y - 4, Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, "orb", 2.4); }
        } else settle();
      } else if (!warning) settle();
      break;
    }
    case "netgun":
      if (a.t <= lock) { a.spots = [{ x: clamp(sx, 30, 190), y: clamp(sy, 34, 184) }]; a.gapAngle = Math.atan2(a.spots[0].y - my, a.spots[0].x - mx); }
      if (firing && (t2 === 0 || t2 === 28)) for (const side of [-1, 1]) for (const d of [0.25, 0.43, 0.61]) {
        const angle = a.gapAngle! + side * d; raw(s, mx, my, Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, "spiral", 2.3);
      }
      break;
    case "cableslide": {
      if (a.t <= lock) a.cols = spacedPositions(sx, 3, 52, 32, 224);
      if (warning && a.cols) e.x += clamp(a.cols[0] - e.w / 2 - e.x, -4, 4);
      if (firing && t2 < 96) {
        const index = Math.floor(t2 / 32), target = a.cols![index];
        e.x += clamp(target - e.w / 2 - e.x, -4, 4);
        if (t2 % 32 === 22) raw(s, e.x + 20, e.y + 29, 0, 2.7, "ice", 3);
      } else if (!warning) settle();
      break;
    }
    case "chaff":
      if (a.t <= lock) { a.gapAngle = Math.atan2(sy - my, sx - mx); a.spots = [{ x: sx, y: sy }]; }
      if (firing && (t2 === 0 || t2 === 30)) for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6 + (t2 ? Math.PI / 12 : 0);
        if (Math.abs(angleDifference(angle, a.gapAngle!)) < 0.5) continue;
        raw(s, mx, my, Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, "frost", 2.4, { life: 180 });
      }
      break;
    case "duneram":
      a.lanes = [GROUND_Y - e.h / 2];
      if (a.t === 0) a.origin = { x: e.x, y: e.y };
      if (firing) { if (t2 < 32) e.x = a.origin!.x - (a.origin!.x - 34) * t2 / 32; else settle(); }
      break;
    case "mortar":
      if (a.t <= lock) a.spots = spacedPositions(sx, 2, 70, 34, 190).map((x, i) => ({ x, y: clamp(sy + (i ? 20 : -20), 42, 176) }));
      if (firing && (t2 === 0 || t2 === 28)) {
        const p = a.spots![t2 / 28], angle = Math.atan2(p.y - my, p.x - mx);
        raw(s, mx, my, Math.cos(angle) * 2.7, Math.sin(angle) * 2.7, "shell", 3.3,
          { fuse: Math.max(12, Math.round(Math.hypot(p.x - mx, p.y - my) / 2.7)), split: 4, splitAngle: 0 });
      }
      break;
    case "ladder":
      if (a.t === 0) a.lanes = [0, 1, 2].map(i => miniMuzzle(e, i).y);
      if (firing && t2 % 24 === 0 && t2 / 24 < 3) { const p = miniMuzzle(e, t2 / 24); lane(s, p.x, p.y, 4, 12); }
      break;
    case "lattice":
      if (a.t === 0) { a.gapY = e.y + 26; a.safeHalf = 26; a.lanes = [e.y + 12, e.y + 39]; }
      if (firing && (t2 === 0 || t2 === 30)) for (const side of [-1, 1]) {
        const p = miniMuzzle(e, side === -1 ? 0 : 2);
        for (const d of [0.16, 0.34, 0.52]) {
          const angle = Math.PI - side * d;
          raw(s, p.x, p.y, Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, "orb", 2.4);
        }
      }
      break;
    case "torpfan":
      if (a.t === 0) { a.lanes = [WATER_Y - 55, WATER_Y - 30, WATER_Y - 5]; a.gapY = 56; a.safeHalf = 26; }
      if (firing && t2 % 22 === 0 && t2 / 22 < 3) {
        const angle = Math.atan2(a.lanes![t2 / 22] - my, 24 - mx);
        raw(s, mx, my, Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, "shell", 2.8);
      }
      break;
    case "periscope":
      if (a.t <= lock) a.cols = spacedPositions(sx, 2, 64, 28, 220);
      if (firing && (t2 === 0 || t2 === 26)) strike(s, a.cols![t2 / 26], 20, 12, 18, STRIKE_STYLE.sea, 30, WATER_Y - 30);
      break;
    case "featherfan":
      if (a.t === 0) { a.gapAngle = Math.PI; a.spots = [{ x: 30, y: my }]; }
      if (firing && t2 % 18 === 0 && t2 / 18 < 3) for (const side of [-1, 1]) for (const d of [0.25, 0.47, 0.69]) {
        const angle = Math.PI + side * (d + t2 / 18 * 0.06);
        raw(s, mx, my, Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, "spiral", 2.2);
      }
      break;
    case "divebomb":
      if (a.t <= lock) { a.spots = [{ x: clamp(sx, 48, 184), y: clamp(sy, 50, 168) }]; a.origin = { x: e.x, y: e.y }; }
      if (firing) {
        if (t2 <= 32) {
          const p = a.spots![0], u = t2 / 32; e.x = a.origin!.x + (p.x - e.w / 2 - a.origin!.x) * u; e.y = a.origin!.y + (p.y - e.h / 2 - a.origin!.y) * u;
          if (t2 === 32) burst(s, p.x, p.y, false);
        } else settle();
      } else if (!warning) settle();
      break;
    case "gatelaser": {
      const grid = [44, 100, 156, 212];
      if (a.t === 0) { a.gapX = grid.reduce((best, x) => Math.abs(x - sx) < Math.abs(best - sx) ? x : best); a.safeHalf = 26; a.cols = grid.filter(x => x !== a.gapX); }
      if (firing && t2 % 16 === 0 && t2 / 16 < 3) strike(s, a.cols![t2 / 16], 20, 0, 14, STRIKE_STYLE.light);
      break;
    }
    case "shielddrones":
      if (a.t <= lock) { a.spots = [{ x: clamp(sx, 30, 184), y: clamp(sy, 34, 184) }]; a.angle = Math.atan2(a.spots[0].y - my, a.spots[0].x - mx); }
      e.guard = firing && t2 < 56 ? 1 : 0;
      if (firing && (t2 === 0 || t2 === 28)) for (const d of [-0.2, 0, 0.2]) raw(s, mx, my, Math.cos(a.angle + d) * 2.6, Math.sin(a.angle + d) * 2.6, "needle", 2.2);
      break;
  }
  if (!["skip", "cableslide", "duneram", "divebomb"].includes(a.kind)) settle();
  tagPattern(s, e, start);
  a.t += 1;
  if (a.t >= a.warn + a.live + a.recover) e.attack = undefined;
}

/* A boss of Space 2 crossing into a new phase: each changes in its own way. */
export const PHASE_CALL: Partial<Record<EType, Callout>> = {
  boss9: "decks", boss10: "magazines", boss11: "shed", boss12: "molt", boss13: "decouple", boss14: "breach", boss15: "pressure",
};
export const ATLAS_CALLS: Callout[] = ["plating", "buckle", "judgement", "core", "laststand"];

function secondPhaseShift(s: State, e: Enemy) {
  const call = e.type === "boss16" ? ATLAS_CALLS[e.a - 1] : PHASE_CALL[e.type];
  if (call) setCallout(s, call);
  // A transformation is a quiet visual beat. No unannounced escorts, mines or
  // shards are allowed to interrupt the player's phase recovery window.
  clearPatternOrdnance(s, e.id);
  s.bullets = s.bullets.filter(b => b.own === "p");
  s.gust = null;
  burst(s, e.x + e.w * 0.45, e.y + e.h * 0.5, true);
  if (e.type === "boss15") e.n = 120;
}

/* A gust: marked, then it pushes the ship up or down for a while. */
function tickGust(s: State) {
  const g = s.gust;
  if (!g) return;
  g.t += 1;
  if (g.t >= GUST.warn + GUST.live) s.gust = null;
}


/* Space 3, once a frame while the ship flies: the keys, shots turned back by the barrier, grazes, and the ship's path
   put on record for the ghost. The ship's hurt circle is at its centre. */
/* Enemies still sliding from a Kinetic Push: the velocity left. */
const PUSHED = new WeakMap<Enemy, { vx: number; vy: number }>();

function stepResonance(s: State, input: Input, fired: boolean) {
  const r = s.res!, p = s.p, size = shipSize(p.level);
  const ship = { x: p.x + size.w / 2, y: p.y + size.h / 2 };
  /* The plasma cell charges on its own, and from kills (kill() in this file). */
  gain(r, PUSH.charge);
  /* The plasma torpedo: on its own, whenever an enemy is ahead. */
  if (p.launchCd <= 0 && s.phase === "play" && hasTarget(s, "torpedo")) {
    s.bullets.push(torpedo(ship.x + 8, ship.y, 0, { kind: "plasmatorp", own: "p", dmg: PLASMA.dmg, r: PLASMA.r, life: PLASMA.life }));
    p.launchCd = PLASMA.cooldown;
  }
  /* Kinetic Push: B spends part of the cell on a wave that shoves enemies, mini bosses, bosses and enemy fire away from the ship. */
  if (input.bomb && r.meter >= PUSH.cost) {
    r.meter -= PUSH.cost;
    s.kinetic = { t: 0, x: ship.x, y: ship.y };
    s.shake = Math.max(s.shake, 5);
    for (const e of s.enemies) {
      if (e.hp <= 0 || e.x > W - 4) continue;
      const dx = e.x + e.w / 2 - ship.x, dy = e.y + e.h / 2 - ship.y, d = Math.hypot(dx, dy);
      if (d > PUSH.radius + Math.max(e.w, e.h) / 2) continue;
      const k = (isBoss(e.type) ? PUSH.boss : isMini(e.type) ? PUSH.mini : 1) * PUSH.speed / Math.max(d, 1);
      PUSHED.set(e, { vx: dx * k, vy: dy * k * 0.5 });
    }
    for (const b of s.bullets) {
      if (b.own !== "e") continue;
      const dx = b.x - ship.x, dy = b.y - ship.y, d = Math.hypot(dx, dy);
      if (d > PUSH.radius) continue;
      const ux = dx / Math.max(d, 1), uy = dy / Math.max(d, 1);
      if (b.ux !== undefined && b.uy !== undefined) {
        b.ux = ux; b.uy = uy;
        b.age = Math.max(b.age ?? 0, TORPEDO.eject + TORPEDO.ignite + 10);
      } else {
        b.vx = ux * PUSH.bullet; b.vy = uy * PUSH.bullet;
      }
      b.hold = undefined; b.home = undefined; b.back = undefined; b.track = undefined;
    }
  }
  for (const e of s.enemies) {
    const v = PUSHED.get(e);
    if (!v) continue;
    e.x = Math.min(W - 6 - e.w, e.x + v.vx);
    e.y = clamp(e.y + v.vy, 12, H - 12 - e.h);
    v.vx *= PUSH.decay; v.vy *= PUSH.decay;
    if (Math.hypot(v.vx, v.vy) < 0.15) PUSHED.delete(e);
  }
  if (s.kinetic && ++s.kinetic.t >= PUSH.frames) s.kinetic = null;
  /* Lumen's plasma beam burns whatever is in her lane, a little a frame. */
  if (s.lumen) {
    const foes = s.enemies.filter((e) => e.hp > 0 && e.x < W - 4);
    for (const e of stepLumen(s.lumen, ship, foes)) {
      const burn = (isBoss(e.type) ? LUMEN.boss : LUMEN.dmg) * damageScale(r);
      if (modsAlive(e)) {
        for (const m of e.mods!) if (m.hp > 0 && e.y + m.oy <= s.lumen.y + LUMEN.half && e.y + m.oy + m.h >= s.lumen.y - LUMEN.half) hurtMod(s, e, m, burn);
      } else damage(e, burn);
      e.flash = Math.max(e.flash, 2);
    }
  }
  if (s.mode && --s.mode.t <= 0) s.mode = null;
  tickResonance(r, { ...ship, fire: fired });
}

/* What Ghost Corvet is thinking about, kept beside the boss and not in the saved State: the director that draws its
   attacks (space3-director.ts), the attack under way, the quiet before the next, and where it means to be. */
type Brain = { d: Director; a: Attack | null; t: number; rest: number; phase: number; to: number; moveIn: number; force: Verb | null; ults: number };
const BRAINS = new WeakMap<Enemy, Brain>();

/* How the ship has been moving over the last few frames, in pixels a frame, for the attack that aims where it is going. */
function shipVelocity(trail: readonly { x: number; y: number }[] | undefined) {
  if (!trail || trail.length < 9) return { vx: 0, vy: 0 };
  const a = trail[trail.length - 9], b = trail[trail.length - 1];
  return { vx: (b.x - a.x) / 8, vy: (b.y - a.y) / 8 };
}

/* Crossfire: while a Space 3 boss (or mini boss) is on the field, aimed shots come in from every side of the screen in turn, the rear, the
   top, the bottom and the boss itself, each leading the ship by where it is going. It never stops, between attacks too, and it comes
   quicker each phase and quickest in an ultimate. There is no safe corner. */
export const CROSSFIRE = { every: [46, 34, 24], ultimate: 14, speed: 2.5, r: 2.2, life: 280 };
function crossfire(s: State, e: Enemy, ship: { x: number; y: number }, vel: { vx: number; vy: number }, ultimate: boolean) {
  const every = ultimate ? CROSSFIRE.ultimate : CROSSFIRE.every[Math.min(2, e.a)];
  if (e.b % every !== 0) return;
  const side = Math.floor(e.b / every) % 4;
  const from = side === 0 ? { x: -4, y: clamp(ship.y + (rand(s) - 0.5) * 120, 12, H - 12) }
    : side === 1 ? { x: 30 + rand(s) * 300, y: 10 }
    : side === 2 ? { x: 30 + rand(s) * 300, y: H - 8 }
    : { x: e.x, y: e.y + e.h / 2 };
  const t = Math.hypot(ship.x - from.x, ship.y - from.y) / CROSSFIRE.speed;
  const aim = Math.atan2(clamp(ship.y + vel.vy * t, 8, H - 8) - from.y, clamp(ship.x + vel.vx * t, 4, W - 4) - from.x);
  for (const d of side === 3 ? [-0.12, 0, 0.12] : [0]) {
    raw(s, from.x, from.y, Math.cos(aim + d) * CROSSFIRE.speed, Math.sin(aim + d) * CROSSFIRE.speed, "needle", bossShotRadius(CROSSFIRE.r), { life: CROSSFIRE.life, patternOwner: e.id });
  }
}

/* The dash: the boss winds back, rams out to the ship's side down the lane marked when the attack began, holds, and returns home. */
function dashBoss(e: Enemy, a: Attack, t: number, home: number, ship: { x: number; y: number }) {
  const at = t - a.warn;
  if (at < 0) {
    e.x = home + ARMS_DASH.wind * (t / a.warn);
    return;
  }
  const k = at < ARMS_DASH.out ? at / ARMS_DASH.out : at < ARMS_DASH.hold ? 1 : Math.max(0, 1 - (at - ARMS_DASH.hold) / (a.live - ARMS_DASH.hold));
  /* It rams straight through where the ship is, not up to it. */
  const ease = k * k * (3 - 2 * k), end = clamp(ship.x - e.w * 0.5, 2, home);
  e.x = home + ARMS_DASH.wind * (1 - ease) + (end - home) * ease;
  if (at < ARMS_DASH.hold) e.y = clamp(e.y + clamp(a.lane - e.h / 2 - e.y, -4, 4), 24, H - 20 - e.h);
}

/* ---------- Space 3, chapters 5 to 12: bosses of several bodies ---------- */

const modsAlive = (e: Enemy) => !!e.mods?.some((m) => m.hp > 0);
export const modBox = (e: Enemy, m: Mod): Box => ({ x: e.x + m.ox, y: e.y + m.oy, w: m.w, h: m.h });

/* The first stage of parts, the first time the boss moves. */
function initMods(s: State, e: Enemy) {
  const stages = ACT2_STAGES[e.type];
  if (!stages || e.stage !== undefined) return;
  e.stage = 0;
  e.mods = stages[0].mods.map((m) => ({ ...m, id: s.nextId++, maxHp: m.hp, flash: 0 }));
}

/* A part takes a hit; when the last of a stage falls the next stage comes out, and after the last, the true form. */
function hurtMod(s: State, e: Enemy, m: Mod, amount: number) {
  m.hp -= amount;
  m.flash = 3;
  if (m.hp > 0) return;
  burst(s, e.x + m.ox + m.w / 2, e.y + m.oy + m.h / 2, true);
  s.score += 600;
  s.shake = Math.max(s.shake, 8);
  if (modsAlive(e)) return;
  const stages = ACT2_STAGES[e.type] ?? [];
  e.stage = (e.stage ?? 0) + 1;
  s.bullets = s.bullets.filter((b) => b.own === "p");
  s.shake = Math.max(s.shake, 20);
  const brain = BRAINS.get(e);
  if (e.stage < stages.length) {
    e.mods = stages[e.stage].mods.map((x) => ({ ...x, id: s.nextId++, maxHp: x.hp, flash: 0 }));
    setCallout(s, "stage");
  } else {
    e.mods = [];
    setCallout(s, "trueform");
    if (brain) brain.force = (ACT2_KITS[e.type] ?? ACT2_MINI_KITS[e.type])?.ultimate ?? null;
  }
  if (brain) { brain.a = null; brain.rest = 30; }
}

/* The attacks a boss may draw: its own, and each standing part's. */
function unlockedFor(unlocked: Verb[][], e: Enemy): Verb[][] {
  if (!modsAlive(e)) return unlocked;
  const extra = e.mods!.filter((m) => m.hp > 0 && m.verb).map((m) => m.verb as Verb);
  return unlocked.map((list) => [...list, ...extra]);
}

/* Hyper beams: one from each gun, charging for the warning while the boss steers them onto the ship's lane, then burning. */
function hyperBeams(s: State, e: Enemy, a: Attack, t: number, ship: { x: number; y: number }) {
  if (t === 0) {
    const slots = a.count >= 3 ? [-1, 0, 1] : a.count === 2 ? [-1, 1] : [0];
    for (const slot of slots) {
      const m = beamMuzzle(e, slot);
      s.beams.push({ x0: m.x, y: m.y, h: 12, t: 0, warn: a.warn, live: a.live, ownerId: e.id, slot, patternOwner: e.id });
    }
  }
  if (t < a.warn - 14) e.y = clamp(e.y + clamp(ship.y - e.h / 2 - e.y, -1.8, 1.8), 24, H - 20 - e.h);
}

/* Drones out of the hangars still standing, or out of the boss's front. */
function launchDrones(s: State, e: Enemy, a: Attack) {
  const pods = e.mods?.filter((m) => m.hp > 0 && m.kind === "pod") ?? [];
  for (let i = 0; i < a.count; i++) {
    const pod = pods[i % Math.max(1, pods.length)];
    const x = pod ? e.x + pod.ox : e.x - 6, y = pod ? e.y + pod.oy + pod.h / 2 : e.y + e.h / 2 + (i - (a.count - 1) / 2) * 16;
    const d = spawn(s, i % 2 && s.chapter >= 25 ? "shade" : "drone", x, clamp(y, 16, H - 20));
    d.vx = -1.5 - rand(s) * 0.6;
  }
}

/* ---------- Space 3, chapters 5 to 12: the field, its land and its disasters ---------- */

function stepOuter(s: State) {
  if (!isAct2(s.chapter)) return;
  const p = s.p, size = shipSize(p.level), hull = shipScale(p.level), info = ACT2[s.chapter];
  /* Land comes in on its plan, drifts left and is gone. */
  while (s.landIdx < s.landPlan.length && s.landPlan[s.landIdx].t <= s.t) {
    const l = s.landPlan[s.landIdx++];
    s.lands.push({ ...l, id: s.nextId++, x: W + 4 });
  }
  for (const l of s.lands) l.x += l.vx;
  s.lands = s.lands.filter((l) => l.x + l.w > -8);
  if (s.phase === "play") {
    /* The ship cannot pass through land; land that pins it to the rear edge crushes it. */
    const minX = 6 * hull + 1, minY = 13 * hull + 1, maxY = H - 12 - size.h;
    for (const l of s.lands) {
      const me = { x: p.x, y: p.y, w: size.w, h: size.h };
      if (!hits(me, l)) continue;
      const left = me.x + me.w - l.x, right = l.x + l.w - me.x, up = me.y + me.h - l.y, down = l.y + l.h - me.y, least = Math.min(left, right, up, down);
      if (least === left) p.x -= left; else if (least === right) p.x += right; else if (least === up) p.y -= up; else p.y += down;
      if (p.x < minX || p.y < minY || p.y > maxY) {
        p.x = Math.max(minX, p.x); p.y = clamp(p.y, minY, maxY);
        hurtPlayer(s);
      }
    }
    /* The field's weather. */
    if (info.field === "magnetic") for (const b of s.bullets) { if (b.own === "e") { if (b.home) b.home = 0; if (b.track) b.track = 0; } }
    if (info.field === "wind") p.x = Math.max(minX, p.x - 0.42);
    if (info.field === "frost" && p.y + size.h > 168) p.chill = Math.max(p.chill, 6);
    if (info.field === "gravity") for (const b of s.bullets) if (b.own === "e" && b.ux === undefined) b.vy += (H / 2 - b.y) * 0.0004;
    if (s.pull) {
      const dx = s.pull.x - (p.x + size.w / 2), dy = s.pull.y - (p.y + size.h / 2), d = Math.max(1, Math.hypot(dx, dy));
      p.x = clamp(p.x + (dx / d) * 1.1, minX, W * 0.55);
      p.y = clamp(p.y + (dy / d) * 1.1, minY, maxY);
      if (--s.pull.t <= 0) s.pull = null;
    }
    while (s.eventIdx < s.events.length && s.events[s.eventIdx].t <= s.t) runEvent(s, s.events[s.eventIdx++].kind);
  }
  /* Land stops every shot; a plasma torpedo goes off against it. */
  s.bullets = s.bullets.filter((b) => {
    const land = s.lands.find((l) => b.x > l.x && b.x < l.x + l.w && b.y > l.y && b.y < l.y + l.h);
    if (!land) return true;
    if (b.kind === "plasmatorp") detonate(s, b, 0, true);
    return false;
  });
}

/* A disaster falls on the ship. */
function runEvent(s: State, kind: EventKind) {
  const p = s.p, size = shipSize(p.level), sx = p.x + size.w / 2, sy = p.y + size.h / 2;
  switch (kind) {
    case "lightning":
      setCallout(s, "storm");
      for (let k = 0; k < 5; k++) strike(s, clamp(sx + (k - 2) * 46 + (rand(s) - 0.5) * 20, 16, W - 16), 16, 28 + k * 6, 14, 0);
      break;
    case "geyser":
      setCallout(s, "storm");
      for (let k = 0; k < 4; k++) strike(s, clamp(sx + (k - 1.5) * 52 + (rand(s) - 0.5) * 16, 16, W - 16), 22, 32 + k * 8, 30, 1, H - 120, 120);
      break;
    case "comets":
      for (let k = 0; k < 8; k++) {
        const top = k % 2 === 1, x = top ? W - rand(s) * 160 : W + 10, y = top ? 4 : 20 + rand(s) * (H - 40);
        const c = spawn(s, "comet", x, y), aim = Math.atan2(sy + (rand(s) - 0.5) * 60 - y, sx - x);
        c.vx = Math.cos(aim) * 3.2; c.vy = Math.sin(aim) * 3.2;
      }
      break;
    case "flare":
      setCallout(s, "storm");
      for (let k = 0; k < 5; k++) strike(s, W - 40 - k * 70, 30, 20 + k * 10, 18, 0);
      break;
    case "mines":
      for (let k = 0; k < 6; k++) { const m = spawn(s, "mine", clamp(sx + 40 + rand(s) * 220, 70, W - 20), 20 + rand(s) * (H - 50)); m.vx = -0.5; }
      break;
    case "lasergrid":
      setCallout(s, "storm");
      for (let k = 0; k < 6; k++) s.beams.push({ x0: W, y: 28 + k * 32, h: 10, t: 0, warn: 40 + k * 4, live: 26 });
      break;
    case "surge":
      setCallout(s, "surge");
      s.pull = { x: W * 0.75, y: H / 2, t: 150 };
      break;
  }
}

/* The outer system's own enemies. */
function updateOuterEnemy(s: State, e: Enemy) {
  const p = s.p, size = shipSize(p.level), sx = p.x + size.w / 2, sy = p.y + size.h / 2, cy = e.y + e.h / 2;
  switch (e.type) {
    case "lancer":
      /* It takes a place, follows the ship's lane, glows, and fires a hyper beam down it. */
      if (e.x > W - 64) e.x += e.vx;
      else if (e.t > 900) e.x -= 2;
      else if (e.d > 0) {
        e.d -= 1;
        if (e.d > 16) e.y = clamp(e.y + clamp(sy - cy, -0.9, 0.9), 14, H - 14 - e.h);
      } else {
        e.y = clamp(e.y + clamp(sy - cy, -0.6, 0.6), 14, H - 14 - e.h);
        if (--e.cd <= 0) {
          e.d = 60;
          s.beams.push({ x0: e.x - 2, y: cy, h: 9, t: 0, warn: 46, live: 30, ownerId: e.id, slot: 0 });
          e.cd = 170;
        }
      }
      break;
    case "magnet": {
      /* It drifts and drags the ship toward itself. */
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 30) * 18;
      const dx = e.x + e.w / 2 - sx, dy = cy - sy, d = Math.hypot(dx, dy);
      if (d < 130 && d > 4 && s.phase === "play") {
        const f = 0.8 * (1 - d / 130), hull = shipScale(p.level);
        p.x = clamp(p.x + (dx / d) * f, 6 * hull + 1, W * 0.55);
        p.y = clamp(p.y + (dy / d) * f, 13 * hull + 1, H - 12 - size.h);
      }
      break;
    }
    case "frigate":
      /* It holds the far side and lobs frost shells that burst into ice. */
      if (e.x > W - 90) e.x += e.vx;
      else if (e.t > 1000) e.x -= 1.4;
      else e.y = e.y0 + Math.sin(e.t / 50) * 20;
      if (--e.cd <= 0 && e.x < W - 20) {
        const aim = Math.atan2(sy - cy, sx - e.x);
        for (const d of [-0.25, 0, 0.25]) raw(s, e.x, cy, Math.cos(aim + d) * 1.8, Math.sin(aim + d) * 1.8, "frost", 4, { life: 300, fuse: 50, split: 8, splitKind: "ice", splitAngle: d * 10 });
        e.cd = 120;
      }
      break;
    case "hangar":
      /* It parks and launches drones. */
      if (e.x > W - 72) e.x += e.vx;
      else if (e.t > 900) e.x -= 1.2;
      if (--e.cd <= 0 && e.x < W - 30) {
        for (const dy of [-12, 12]) { const d = spawn(s, "drone", e.x, clamp(cy + dy, 14, H - 20)); d.vx = -1.6; }
        e.cd = 140;
      }
      break;
    case "shade":
      /* Hard to see: it weaves in fast and fires at the ship as it passes. */
      e.x += e.vx;
      e.y = e.y0 + Math.sin(e.t / 14) * 26;
      if (e.t % 50 === 0 && e.x < W - 20) {
        const aim = Math.atan2(sy - cy, sx - e.x);
        raw(s, e.x, cy, Math.cos(aim) * 2.8, Math.sin(aim) * 2.8, "needle", 2, { life: 200 });
      }
      break;
  }
}

/* The triple dash: three rams, each locked on the ship's lane as it starts, each straight through the ship. */
function dash3Boss(e: Enemy, a: Attack, t: number, home: number, ship: { x: number; y: number }) {
  const at = t - a.warn;
  if (at < 0) { e.x = home + ARMS_DASH.wind * (t / a.warn); return; }
  const c = at % dash3Cycle;
  if (c === 0) a.lane = clamp(ship.y, 26, H - 26);
  const k = c < DASH3.out ? c / DASH3.out : c < DASH3.out + DASH3.hold ? 1 : Math.max(0, 1 - (c - DASH3.out - DASH3.hold) / DASH3.back);
  const ease = k * k * (3 - 2 * k), end = clamp(ship.x - e.w * 0.5, 2, home);
  e.x = home + (end - home) * ease;
  if (c < DASH3.out) e.y = clamp(e.y + clamp(a.lane - e.h / 2 - e.y, -7, 7), 24, H - 20 - e.h);
}

/* The blink: it shimmers, vanishes, comes out behind the ship (or over or under it if there is no room behind), fires, and goes home. */
function blinkBoss(e: Enemy, a: Attack, t: number, home: number, ship: { x: number; y: number }) {
  const at = t - a.warn;
  if (at < 0) { if (t % 4 < 2) e.flash = Math.max(e.flash, 2); return; }
  if (at === 0) {
    let x = ship.x - BLINK3.behind - e.w, y = clamp(ship.y - e.h / 2, 24, H - 20 - e.h);
    if (x < 2) {
      x = clamp(ship.x - e.w / 2, 2, W - e.w - 2);
      y = ship.y < H / 2 ? clamp(ship.y + BLINK3.over, 24, H - 20 - e.h) : clamp(ship.y - BLINK3.over - e.h, 24, H - 20 - e.h);
    }
    a.extra = x; a.lane = y;
  }
  if (at >= a.live - 1) { e.x = home; return; }
  e.x = a.extra; e.y = a.lane;
}

/* The pull: the ship is dragged toward the boss's middle. */
function pullShip(s: State, e: Enemy) {
  const p = s.p, size = shipSize(p.level), hull = shipScale(p.level);
  const dx = e.x + e.w / 2 - (p.x + size.w / 2), dy = e.y + e.h / 2 - (p.y + size.h / 2);
  p.x = clamp(p.x + clamp(dx * GRAVITY.share, -GRAVITY.pull, GRAVITY.pull), 6 * hull + 1, W * 0.55);
  p.y = clamp(p.y + clamp(dy * GRAVITY.share, -GRAVITY.pull, GRAVITY.pull), 13 * hull + 1, H - 12 - size.h);
}

/* Thrown terrain: rock torn from the boss, hurled at the ship; it bounces off the edges and breaks into more when shot. */
function throwTerrain(s: State, e: Enemy, a: Attack, ship: { x: number; y: number }) {
  for (let i = 0; i < a.count; i++) {
    const y = clamp(e.y + e.h / 2 - 13 + (i - (a.count - 1) / 2) * 22, 22, H - 40);
    const rock = spawn(s, i % 2 ? "rock" : "boulder", e.x - 12, y);
    const aim = Math.atan2(ship.y - y, ship.x - e.x) + (i - (a.count - 1) / 2) * 0.16;
    rock.vx = Math.cos(aim) * a.speed;
    rock.vy = Math.sin(aim) * a.speed;
  }
}

/* The disaster: lightning walks in around the ship while the debris (space3-havoc.ts) comes from every edge. */
function callDisaster(s: State, ship: { x: number; y: number }) {
  setCallout(s, "warning");
  s.shake = Math.max(s.shake, 16);
  for (let k = 0; k < 4; k++) strike(s, clamp(ship.x + (k - 1.5) * 44 + (rand(s) - 0.5) * 12, 20, W - 20), 16, 26 + k * 10, 16, 0);
}

/* A Space 3 boss (Ghost Corvet, Excavator-X, Abyssal Wyrm): it hovers and drifts to heights it picks at random, and between
   pauses of random length it makes the attack the director draws. Each phase opens with its own signature attack, the boss
   leans on its signatures afterwards, and its ultimate is forced when its health first falls to each share of the kit's
   ultimateAt. The wind-up shows on the boss (c: kind, d: percent, n: height). */
function updateThirdBoss(s: State, e: Enemy) {
  const kit = THIRD_BOSSES[e.type as ThirdBoss] ?? ACT2_KITS[e.type] ?? ACT2_MINI_KITS[e.type];
  initMods(s, e);
  const home = Math.min(W - e.w - 20, W - 90);
  if (e.b === 0 && !enterX(e, home)) return;
  if (phaseUp(s, e, kit.cuts)) return;
  e.b++;
  const p = s.p, size = shipSize(p.level), ship = { x: p.x + size.w / 2, y: p.y + size.h / 2 };
  let brain = BRAINS.get(e);
  if (!brain) {
    brain = { d: createDirector((s.seed ^ Math.imul(e.id, 0x9e3779b1)) >>> 0), a: null, t: 0, rest: 60, phase: 0, to: e.y, moveIn: 0, force: kit.signature[0] ?? null, ults: 0 };
    BRAINS.set(e, brain);
  }
  observe(brain.d, ship.y);
  /* A new phase drops the attack that was winding up, and opens with its signature. */
  if (e.a !== brain.phase) {
    brain.phase = e.a;
    brain.a = null;
    brain.rest = 50;
    brain.force = kit.signature[e.a] ?? null;
  }
  if (--brain.moveIn <= 0) {
    brain.to = 28 + rand(s) * (H - 56 - e.h);
    brain.moveIn = 70 + Math.floor(rand(s) * 100);
  }
  e.y = clamp(e.y + clamp(brain.to - e.y, -kit.speed, kit.speed), 24, H - 20 - e.h);
  if (brain.a?.verb === "dash") dashBoss(e, brain.a, brain.t, home, ship);
  if (brain.a?.verb === "dash3") dash3Boss(e, brain.a, brain.t, home, ship);
  if (brain.a?.verb === "blink") blinkBoss(e, brain.a, brain.t, home, ship);
  if (brain.a?.verb === "gravity" && brain.t >= brain.a.warn) pullShip(s, e);
  if (brain.a?.verb === "terrain" && brain.t === brain.a.warn) throwTerrain(s, e, brain.a, ship);
  if (brain.a?.verb === "disaster" && brain.t === brain.a.warn) callDisaster(s, ship);
  if (brain.a?.verb === "hyper") hyperBeams(s, e, brain.a, brain.t, ship);
  if (brain.a?.verb === "launch" && brain.t === brain.a.warn) launchDrones(s, e, brain.a);
  const muzzle = { x: e.x, y: e.y + e.h / 2 };
  const ctx = { trail: s.res?.trail, vel: shipVelocity(s.res?.trail) };
  crossfire(s, e, ship, ctx.vel, brain.a?.verb === kit.ultimate);
  /* The ultimate: dropped on top of whatever was happening, with a long warning. */
  if (brain.ults < kit.ultimateAt.length && e.hp / e.maxHp <= kit.ultimateAt[brain.ults]) {
    brain.ults += 1;
    brain.force = null;
    brain.a = nextAttack(brain.d, e.a, ship, unlockedFor(kit.unlocked, e), { force: kit.ultimate, ctx });
    brain.t = 0;
    /* Already launched rounds, held missiles and fused mines finish naturally. */
    setCallout(s, "warning");
    s.shake = Math.max(s.shake, 14);
  }
  if (!brain.a) {
    e.c = 0;
    e.d = 0;
    if (--brain.rest <= 0) {
      brain.a = nextAttack(brain.d, e.a, ship, unlockedFor(kit.unlocked, e), { force: brain.force ?? undefined, prefer: kit.signature.slice(0, e.a + 1), ctx });
      brain.force = null;
      brain.t = 0;
    }
  } else {
    for (const o of attackShots(brain.a, brain.t, muzzle, ship)) {
      if (o.back !== undefined) {
        shoot(s, o.x, o.y, Math.atan2(o.vy, o.vx), o.kind, bossShotRadius(o.r), { back: o.back, life: 420 });
        continue;
      }
      raw(s, o.x, o.y, o.vx, o.vy, o.kind, bossShotRadius(o.r), { life: o.life ?? 520, ...(o.fuse ? { fuse: o.fuse, split: o.split, splitKind: o.splitKind, splitAngle: o.splitAngle } : {}), ...(o.hold ? { hold: o.hold, hvx: o.hvx, hvy: o.hvy } : {}) });
    }
    /* Echo: for its length the ghost fires back the ship's own shots, and only then. */
    if (brain.a.verb === "echo" && brain.t >= brain.a.warn && s.res) {
      const g = ghostShot(s.res);
      if (g) raw(s, g.x, g.y, g.vx, g.vy, "needle", bossShotRadius(g.r), { life: 520 });
    }
    e.c = VERBS.indexOf(brain.a.verb) + 1;
    e.d = Math.round(charge(brain.a, brain.t) * 100);
    e.n = Math.round(brain.a.lane);
    brain.t += 1;
    if (finished(brain.a, brain.t)) {
      brain.a = null;
      brain.rest = restFrames(brain.d);
    }
  }
}

function updateBoss(s: State, e: Enemy) {
  /* The shield mends once it has been left alone. */
  if (e.maxShield !== undefined && e.shield !== undefined) {
    if (e.shieldHit !== undefined && e.shieldHit > 0) e.shieldHit -= 1;
    if (e.shieldWait !== undefined && e.shieldWait > 0) e.shieldWait -= 1;
    else if (e.shield < e.maxShield) e.shield = Math.min(e.maxShield, e.shield + BOSS_SHIELD.regen);
  }
  const home = Math.min(BOSS_HOME[e.type] ?? W - 90, W - e.w - 14);
  if (!e.attack && e.b === 0 && !enterX(e, home)) {
    const rest0 = floorY(e);
    if (rest0 !== null) e.y = rest0;
    return;
  }
  const oldPhase = e.a;
  if (isFinal(e.type)) {
    const share = e.hp / e.maxHp;
    e.a = FINAL_PHASE_AT.filter((cut) => share <= cut).length;
    if (e.a > oldPhase) {
      s.bullets = s.bullets.filter(b => b.own === "p");
      s.beams = [];
      s.charges = [];
      e.stun = 70;
      setCallout(s, e.a === 1 ? "shield" : e.a === 2 ? "armor" : e.a === 3 ? "overload" : e.a === 4 ? "warning" : "c4");
      if (e.type === "boss16" && e.a >= 3 && oldPhase < 3) s.talk = "judgement";
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
    s.hazards = s.hazards.filter((h) => h.kind !== "wave" && h.kind !== "spire" && h.kind !== "strike" && h.kind !== "twister");
    s.beams = [];
    const rest1 = floorY(e);
    if (rest1 !== null) e.y = rest1;
    else e.y = clamp(e.y, 30, H - 16 - e.h);
  }
  if (e.a > oldPhase && isSecondBoss(e.type)) secondPhaseShift(s, e);
  if (e.stun > 0) {
    if (isFinal(e.type)) e.stun--;
    return;
  }
  /* Cyclone, past its first phase, throws a gust now and then. */
  if (e.type === "boss15" && e.a >= 1 && !s.gust && (!e.attack || e.attack.t >= e.attack.warn + e.attack.live) && --e.n <= 0) {
    e.n = GUST.every;
    s.gust = { t: 0, dy: (rand(s) < 0.5 ? -1 : 1) * GUST.push };
  }
  e.b++;
  if (!e.attack) nextBossAttack(s, e);
  const a = e.attack!;
  const firing = a.t >= a.warn && a.t < a.warn + a.live;
  const recovering = a.t >= a.warn + a.live;
  const warning = a.t < a.warn;
  const lock = a.warn - (a.lockFrames ?? 18);
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
    const rest2 = floorY(e);
    if (rest2 !== null) e.y = rest2 + (BOSS_FLOOR[e.type] === "sea" ? Math.sin(e.b / 45) * 1.2 : 0);
    else {
      const amplitude = Math.min(e.type === "boss5" ? 60 : isFinal(e.type) ? 38 + e.a * 7 : 48, Math.max(0, (H - e.h) / 2 - 26));
      glide(e, home, H / 2 - e.h / 2 + Math.sin(e.b / (e.type === "boss6" ? 62 : 85)) * amplitude, isFinal(e.type) ? 1.2 + e.a * 0.3 : 1.2);
    }
  }
  if (a.kind === "beam" && a.t === 0) {
    if (e.type === "boss3" || (e.a >= 2 && (e.type === "boss4" || isFinal(e.type)))) {
      bossBeam(s, e, -1); bossBeam(s, e, 1);
    } else bossBeam(s, e);
    if (isFinal(e.type) && e.a >= 3) bossBeam(s, e, 0);
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

  if (a.arena) arenaTick(s, e, a);
  if (isSecondBoss(e.type)) secondAttack(s, e, a);

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
        if (t % (isFinal(e.type) && e.a >= 2 ? 6 : 10) === 0) {
          const slot = e.type === "boss2" ? (t / 10) % 3 : 0;
          const origin = enemyMuzzle(e, s, slot);
          shoot(s, origin.x, origin.y, origin.angle, "needle", 2.3);
          if (isFinal(e.type) && e.a >= 3) for (const d of [-0.15, 0.15]) shoot(s, origin.x, origin.y, origin.angle + d, "needle", 2.3);
        }
        break;
      case "missiles":
        if (t % (isFinal(e.type) ? 10 : 16) === 0 && s.enemies.filter(o => o.type === "seeker").length < (isFinal(e.type) ? 5 : 3)) {
          const tip = missileMuzzle(e, t ? 1 : 0);
          const missile = spawn(s, "seeker", tip.x - 7, tip.y - 3.5);
          missile.vx = -1.3; missile.vy = t ? 1 : -1;
        }
        break;
      case "spiral":
        if (isFinal(e.type) && e.a >= 3) {
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
        if (t === 0) bossFan(s, e, isFinal(e.type) ? 17 + e.a : 13 + (e.a >= 2 ? 2 : 0), isFinal(e.type) ? 2.3 : 2.05, 0, true);
        break;
      case "flare":
        if (t === 0) {
          const xs = isFinal(e.type) ? [a.targetX, a.targetX - 80, a.targetX + 80].slice(0, e.a >= 4 ? 3 : 2) : [a.targetX];
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
          const type = e.type === "boss7" ? "funnel" : e.type === "boss4" ? "drone" : isFinal(e.type) ? "fighter" : "scout";
          if (s.enemies.filter(o => o.type === type).length < (isFinal(e.type) ? 2 : 3)) {
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
      case "minirocket":
        if (dx < ROCKET.seekEnemy + 20 && dy < 80 + e.h / 2) return true;
        break;
      case "hyperbeam":
        /* Saved for what is worth it: a boss, or something that takes a few hits. */
        if (dy < e.h / 2 + 8 && (isBoss(e.type) || e.maxHp >= 6)) return true;
        break;
    }
  }
  /* The rockets are as much for stopping shots as for hitting ships. */
  if (gun === "minirocket") {
    for (const b of s.bullets) {
      if (b.own === "e" && b.kind !== "crescent" && b.x > fx && b.x < fx + ROCKET.seekBullet + 40 && Math.abs(b.y - fy) < 80) return true;
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
      damage(e, (isBoss(e.type) ? KATANA.boss : KATANA.damage) * POWER * powerBonus(s.p));
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

/* How full the experience gauge is, 0 to 1 (full at the top level). */
export function xpGauge(p: { level: number; extra: number }) {
  return p.level >= MAX_LEVEL ? 1 : (p.extra % XP.perLevel) / XP.perLevel;
}

/* What an enemy's fall adds to the gauge. */
/* Space 1 has fewer enemies a chapter, so each is worth a little more (`div1`). */
export const xpOf = (t: EType, second = true) => (isBoss(t) ? (second ? XP.boss : XP.boss1) : Math.max(1, Math.round(SCORE[t] / (second ? XP.div : XP.div1))));

function addXp(s: State, n: number) {
  const p = s.p;
  p.extra += n;
  while (p.level < MAX_LEVEL && p.extra >= XP.perLevel * p.level) gainLevel(s);
}

/* Where Bloom's umbrella is centred: just ahead of the nose. */
export function domeCenter(p: { x: number; y: number; level: number }) {
  const sz = shipSize(p.level);
  return { x: p.x + sz.w * 0.9, y: p.y + sz.h / 2 };
}

const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/* A mini rocket steers after the nearest enemy shot, or else the nearest enemy, once it has
   fanned out. */
function steerRocket(s: State, b: Bullet) {
  const age = ROCKET.life - (b.life ?? 0);
  let tx = 0;
  let ty = 0;
  let best = 1e9;
  if (age > ROCKET.arm) {
    for (const o of s.bullets) {
      if (o.own !== "e" || o.kind === "crescent" || o.x < b.x - 30) continue;
      const d = Math.hypot(o.x - b.x, o.y - b.y);
      if (d < ROCKET.seekBullet && d < best) {
        best = d;
        tx = o.x;
        ty = o.y;
      }
    }
    if (best >= 1e9) {
      for (const e of s.enemies) {
        if (e.hp <= 0 || e.x > W - 4 || e.x + e.w < b.x - 10) continue;
        const d = Math.hypot(e.x + e.w / 2 - b.x, e.y + e.h / 2 - b.y);
        if (d < ROCKET.seekEnemy && d < best) {
          best = d;
          tx = e.x + e.w / 2;
          ty = e.y + e.h / 2;
        }
      }
    }
  }
  const cur = b.heading ?? Math.atan2(b.vy, b.vx);
  const stage = rocketStage(age);
  const a = stage === "burn" && best < 1e9 ? cur + clamp(angleDiff(Math.atan2(ty - b.y, tx - b.x), cur), -ROCKET.turn, ROCKET.turn) : cur;
  const speed = rocketSpeed(age);
  const drop = stage === "eject" ? ROCKET.drop * (age / ROCKET.eject) : 0;
  b.heading = a;
  b.vx = Math.cos(a) * speed;
  b.vy = Math.sin(a) * speed + drop;
}

/* A rocket that reaches an enemy shot takes it out, and itself. */
function tickRockets(s: State) {
  for (const b of s.bullets) {
    if (b.own !== "p" || b.kind !== "minirocket") continue;
    for (const o of s.bullets) {
      if (o.own !== "e" || o.kind === "crescent" || o.x < 0) continue;
      if (Math.hypot(o.x - b.x, o.y - b.y) <= b.r + o.r + 2) {
        burst(s, o.x, o.y, false);
        rocketBlast(s, b, 0, true);
        o.x = -99;
        b.x = W + 99;
        break;
      }
    }
  }
}

/* Bloom: open when fire comes close, swallow it, close, and shed petals if it swallowed enough. */
function tickBloom(s: State) {
  const p = s.p;
  if (s.phase !== "play") {
    p.dome = Math.max(0, p.dome - 0.2);
    return;
  }
  const c = domeCenter(p);
  let threat = false;
  for (const b of s.bullets) {
    if (b.own !== "e" || b.kind === "crescent" || b.kind === "seamissile" || b.kind === "deckrocket" || b.x < c.x - 10) continue;
    if (Math.hypot(b.x - c.x, b.y - c.y) < BLOOM.radius + 46) {
      threat = true;
      break;
    }
  }
  if (p.bloom > 0 && threat) p.domeHold = BLOOM.hold;
  else if (p.domeHold > 0) p.domeHold -= 1;
  const covering = s.coverT > 0;
  if (covering) s.coverT -= 1;
  const open = covering || (p.bloom > 0 && p.domeHold > 0);
  if (open && p.dome === 0 && !covering) s.counters2.bloomOpens += 1;
  p.dome = clamp(p.dome + (open ? 0.25 : -0.2), 0, 1);
  if (p.dome === 0 && !open) {
    if (p.absorbed >= BLOOM.burstAt) {
      for (const a of [-0.5, -0.25, 0, 0.25, 0.5]) {
        s.bullets.push({ x: c.x, y: c.y, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, r: 2.2, own: "p", dmg: BLOOM.petal, kind: "petal", life: 50 });
      }
      burst(s, c.x, c.y, false);
    }
    p.absorbed = 0;
    return;
  }
  if (p.dome < 0.6) return;
  if (!covering) p.bloom = Math.max(0, p.bloom - 1);
  for (const b of s.bullets) {
    if (b.own !== "e" || b.kind === "crescent" || b.kind === "seamissile" || b.kind === "deckrocket" || b.x < c.x - 6 || b.x < 0) continue;
    if (Math.hypot(b.x - c.x, b.y - c.y) <= BLOOM.radius + b.r) {
      b.x = -99;
      p.absorbed += 1;
      s.counters2.blocks += 1;
      if (!covering) p.bloom = Math.max(0, p.bloom - BLOOM.cost);
    }
  }
}

/* Kite follows and fires. */
function tickKite(s: State) {
  const k = s.kite;
  if (!k) return;
  const p = s.p;
  if (k.kick > 0) k.kick -= 1;
  const tx = p.x + KITE.dx;
  const ty = clamp(p.y + KITE.dy, 14, H - 22);
  k.x += (tx - k.x) * KITE.follow;
  k.y += (ty - k.y) * KITE.follow;
  if (s.phase !== "play") return;
  if (k.cd > 0) {
    k.cd -= 1;
    return;
  }
  const ahead = s.enemies.some((e) => e.hp > 0 && e.x > k.x && e.x < W - 4 && Math.abs(e.y + e.h / 2 - k.y) < 60);
  if (!ahead) return;
  k.cd = KITE.cooldown;
  k.kick = 4;
  s.bullets.push({ x: k.x + 10, y: k.y + 3, vx: KITE.speed, vy: 0, r: 1.8, own: "p", dmg: KITE.damage, kind: "pulse", life: 90, kite: true });
}

/* The hyperbeam: charge, then one long beam. */
function tickHyper(s: State) {
  const h = s.hyper;
  if (!h) return;
  const p = s.p;
  if (s.phase !== "play") {
    s.hyper = null;
    return;
  }
  const m = podMuzzle(p);
  h.x = m.x;
  if (h.live === 0) {
    h.y = m.y;
    h.t += 1;
    if (h.t < HYPER.charge) return;
    h.live = HYPER.live;
    p.ammo -= 1;
    /* The last charge spent, the pod goes back to the blaster as soon as the beam has gone. */
    if (p.ammo <= 0) p.gun = "blaster";
    p.cd = HYPER.after;
    s.shake = Math.max(s.shake, 10);
    s.bombFlash = Math.max(s.bombFlash, 4);
    for (const e of s.enemies) {
      if (e.hp <= 0 || h.hit.includes(e.id)) continue;
      if (e.x + e.w < h.x || e.y > h.y + HYPER.h / 2 || e.y + e.h < h.y - HYPER.h / 2) continue;
      h.hit.push(e.id);
      damage(e, isBoss(e.type) ? HYPER.boss : HYPER.damage);
      e.flash = 6;
    }
    s.counters2.beams += 1;
    s.counters2.bestBeam = Math.max(s.counters2.bestBeam, s.enemies.filter((e) => h.hit.includes(e.id) && e.hp <= 0).length);
  } else {
    h.live -= 1;
    if (h.live <= 0) s.hyper = null;
  }
  s.bullets = s.bullets.filter((b) => b.own === "p" || b.x < h.x || Math.abs(b.y - h.y) > HYPER.h / 2 + b.r);
}

/* The ship's guns. */
/* Space 3's main gun, the Seed Bolt (see space3-arsenal.ts). */
function fireSeed(s: State) {
  const p = s.p;
  const { x: ox, y: oy } = podMuzzle(p);
  const mode = s.mode?.kind;
  p.cd = mode === "rapid" ? Math.round(SEED.cooldown * MODE.rapidCooldown) : SEED.cooldown;
  for (const v of seedVolley(p.level, mode)) {
    s.bullets.push({ x: ox, y: oy + v.dy, vx: v.vx, vy: v.vy, r: SEED.r, own: "p", dmg: v.dmg * powerBonus(p), kind: "seed", life: SEED.life, ...(v.pierce ? { pierce: true, hit: [] } : {}) });
  }
}

function fire(s: State) {
  const p = s.p;
  if (s.res) {
    fireSeed(s);
    return;
  }
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
  if (p.gun === "hyperbeam") {
    /* One shot, charged first; tickHyper does the rest and spends the ammunition. */
    if (!s.hyper) s.hyper = { t: 0, x: ox, y: oy, live: 0, hit: [] };
    return;
  }
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
    case "minirocket":
      s.counters2.rockets += 1;
      for (const a of ROCKET.fan) {
        s.bullets.push(shot(Math.cos(a) * ROCKET.slide, Math.sin(a) * ROCKET.slide, 0, { kind: "minirocket", dmg: ROCKET.damage, r: 2.2, life: ROCKET.life, heading: a }));
        puff(s, ox - 2, oy, -0.7 + Math.sin(a * 9) * 0.2, Math.cos(a * 9) * 0.25, 14, 1.5, 0);
      }
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
  if (isSecond(s.chapter)) {
    /* Space 2: deadly stingers, one tube, then two. */
    if (!s.enemies.some((e) => e.hp > 0 && e.x > p.x && e.x < W - 4)) return;
    const sp = p.level >= TWIN_AT ? PSTINGER.twin : PSTINGER.single;
    const tubes = p.level >= TWIN_AT ? [[p.y + size.h + 2, 0.18], [p.y - 2, -0.18]] : [[p.y + size.h + 2, 0.12]];
    for (const [y, a] of tubes) s.bullets.push({ x: ox, y, vx: Math.cos(a) * PSTINGER.speed, vy: Math.sin(a) * PSTINGER.speed, r: 2.4, own: "p", dmg: sp.damage, kind: "stinger", life: PSTINGER.life, home: PSTINGER.home });
    p.launchCd = sp.cooldown;
    return;
  }
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
  /* After CALM frames without a hit the ship's own health mends, slower until self-repair
     (level 5), which brings it to the full rate and in Space 2 mends the shield as well. */
  if (p.calm > 0) p.calm -= 1;
  else {
    const repair = hasUpgrade(p, "repair");
    if (repair && isSecond(s.chapter) && p.shield < maxShield(p)) p.shield = Math.min(maxShield(p), p.shield + SHIELD.regen);
    if (p.hp < maxLife(p)) p.hp = Math.min(maxLife(p), p.hp + HEAL.life * (repair ? 1 : HEAL.base));
  }
  if (placeOf(s) === 8 && s.phase === "play" && p.shield < maxShield(p)) p.shield = Math.min(maxShield(p), p.shield + TERRAIN.dawn.regen);
  if (placeOf(s) > 0 && s.phase === "play" && s.t === 90) setCallout(s, TERRAIN_CALL[placeOf(s) - 1]);
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
  const place = s.phase === "play" ? placeOf(s) : 0;
  const low = place === 1 && p.y + shipSize(p.level).h > TERRAIN.spray.below;
  const ground = low ? TERRAIN.spray.slow : place === 6 ? TERRAIN.cold.slow : 1;
  const pace = ground * (p.chill > 0 ? CHILL.slow : 1) * (hasUpgrade(p, "hypersonic") ? HYPERSONIC.speed : 1) * (s.hyper && s.hyper.live === 0 ? HYPER.slow : 1);
  if (p.chill > 0) p.chill -= 1;
  const free = s.phase !== "clear";
  if (free) {
    p.x = clamp(p.x + input.mx * pace, Math.max(6 * hullScale + 1, (HQ.width + 6) * s.hq.slide), W * 0.55);
    p.y = clamp(p.y + input.my * pace, 13 * hullScale + 1, H - 12 - shipSize(s.p.level).h);
    if (s.gust && s.gust.t >= GUST.warn) p.y = clamp(p.y + s.gust.dy, 13 * hullScale + 1, H - 12 - shipSize(s.p.level).h);
    /* The weather of the place pushes the ship. */
    const dx = place === 3 ? -TERRAIN.wind.push : place === 7 ? Math.sin(s.t / 50) * TERRAIN.turbulence.x : 0;
    const dy = place === 2 ? TERRAIN.rain.push : place === 7 ? Math.cos(s.t / 37) * TERRAIN.turbulence.y : 0;
    if (dx || dy) {
      p.x = clamp(p.x + dx, Math.max(6 * hullScale + 1, (HQ.width + 6) * s.hq.slide), W * 0.55);
      p.y = clamp(p.y + dy, 13 * hullScale + 1, H - 12 - shipSize(s.p.level).h);
    }
    p.tilt += (clamp(input.my / 2.7, -1, 1) * 0.26 - p.tilt) * 0.18;
  } else flyAway(s);
  if (p.cd > 0) p.cd -= place === 4 ? TERRAIN.sand.jam : 1;
  let fired = false;
  if (p.cd <= 0 && s.phase === "play") {
    const before = s.bullets.length;
    fire(s);
    fired = s.bullets.length > before;
    /* Overdrive hits harder. */
    if (s.res) for (const b of s.bullets.slice(before)) if (b.own === "p") b.dmg *= damageScale(s.res);
  }
  if (s.res && s.phase === "play") stepResonance(s, input, fired);
  if (p.launchCd > 0) p.launchCd -= 1;
  if (!s.res && hasUpgrade(p, "torpedo") && p.launchCd <= 0 && s.phase === "play") fireLaunchers(s);
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
  if (!s.res) tickHq(s);
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
  /* Kite's Bloom: ready, it covers the ship as soon as enemy fire comes close; then it recharges. */
  if (s.kite && s.phase === "play") {
    if (s.coverT === 0 && s.coverCd > 0) s.coverCd -= 1;
    if (s.coverT === 0 && s.coverCd === 0) {
      const c = domeCenter(p);
      const near = s.bullets.some((b) => b.own === "e" && b.kind !== "crescent" && b.kind !== "seamissile" && b.kind !== "deckrocket" && b.x > 0 && Math.hypot(b.x - c.x, b.y - c.y) < BLOOM.radius + COVER.reach);
      if (near) {
        s.coverT = COVER.frames;
        s.coverCd = COVER.cooldown;
        s.counters2.covers += 1;
        setCallout(s, "cover");
      }
    }
  }
  const hearts = (PICKUP_PLANS[s.chapter] ?? []);
  while (s.pickupIdx < hearts.length && hearts[s.pickupIdx].t <= s.t) {
    /* Luck decides whether this one turns up at all. */
    if (rand(s) < UPGRADE_LUCK) s.pickups.push({ x: W + 10, y: hearts[s.pickupIdx].y, kind: "E", t: 0 });
    s.pickupIdx += 1;
  }
  const list = planOf(s);
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
    /* A mini boss still holding the way keeps the boss back. */
    if (!s.enemies.some((e) => isMini(e.type) && e.x < W + 100) && (regular <= 2 || s.t > list[list.length - 1].t + 900)) {
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
    else if (h.kind === "twister") h.x += -0.85 + Math.sin(h.t / 18) * 0.6;
    else if (h.kind === "perch") {
      const unit = h.g[0] ? s.enemies.find((e) => e.id === h.g[0] && e.hp > 0) : undefined;
      if (unit) h.x = unit.x - h.g[1];
      else {
        h.g[0] = 0;
        h.x -= 1;
      }
    } else if (h.kind === "cover") {
      if (h.g[5] > 0) h.g[5] -= 1;
      const unit = h.g[2] ? s.enemies.find((e) => e.id === h.g[2] && e.hp > 0) : undefined;
      if (unit) h.x = unit.x - h.g[3];
      else {
        h.g[2] = 0;
        h.x -= 1;
      }
    }
    else if (h.kind !== "spire" && h.kind !== "strike") h.x -= 1;
  }
  s.hazards = s.hazards.filter(
    (h) => h.x > -h.w - 6 && (h.kind !== "flare" || h.t < FLARE_WARN + FLARE_LIVE) && (h.kind !== "spire" || h.t < SPIRE_END) && (h.kind !== "strike" || h.t < h.g[0] + h.g[1]) && (h.kind !== "twister" || h.g[1] === 0 || h.t < h.g[0] + h.g[1]),
  );
  stepOuter(s);
  tickCharges(s);
  const born: Bullet[] = [];
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
    if (b.own === "e" && b.hold !== undefined && b.hold > 0) {
      b.hold -= 1;
      if (b.hold === 0) {
        b.vx = b.hvx ?? 0;
        b.vy = b.hvy ?? 0;
      }
    }
    if (b.own === "e" && b.home !== undefined && b.home > 0) {
      b.home -= 1;
      const size = shipSize(p.level);
      const cur = Math.atan2(b.vy, b.vx);
      const want = Math.atan2(p.y + size.h / 2 - b.y, p.x + size.w / 2 - b.x);
      const sp = Math.min(STINGER.top, Math.hypot(b.vx, b.vy) + STINGER.accel);
      const a2 = cur + clamp(Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), -STINGER.turn, STINGER.turn);
      b.vx = Math.cos(a2) * sp;
      b.vy = Math.sin(a2) * sp;
    } else if (b.own === "e" && b.kind === "stinger") {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp < STINGER.top) {
        b.vx *= (sp + STINGER.accel) / sp;
        b.vy *= (sp + STINGER.accel) / sp;
      }
    }
    if (b.own === "e" && b.retarget !== undefined && b.retarget > 0 && --b.retarget === 0) {
      const size = shipSize(p.level);
      const ang = Math.atan2((b.aim?.y ?? p.y + size.h / 2) - b.y, (b.aim?.x ?? p.x + size.w / 2) - b.x);
      b.vx = Math.cos(ang) * (b.speed2 ?? 3);
      b.vy = Math.sin(ang) * (b.speed2 ?? 3);
    }
    if (b.own === "e" && b.kind === "seamissile" && b.fuse !== undefined && b.fuse > 1) {
      const size = shipSize(p.level);
      if (Math.hypot(p.x + size.w / 2 - b.x, p.y + size.h / 2 - b.y) < SEA_MISSILE.near) b.fuse = 1;
    }
    if (b.own === "e" && b.fuse !== undefined && --b.fuse <= 0) {
      const n = b.split ?? 6;
      const from = b.splitAngle ?? Math.atan2(b.vy, b.vx);
      for (let i = 0; i < n; i++) {
        const ang = from + (i / n) * Math.PI * 2;
        if (b.splitGap !== undefined && Math.abs(angleDifference(ang, b.splitGap)) < (b.splitHalf ?? 0.55)) continue;
        born.push({ x: b.x, y: b.y, vx: Math.cos(ang) * 2.2, vy: Math.sin(ang) * 2.2, r: isThird(s.chapter) ? bossShotRadius(2.3) : 2.3, own: "e", dmg: 1, kind: b.splitKind ?? "needle", patternOwner: b.patternOwner, life: PATTERN.shotLife });
      }
      burst(s, b.x, b.y, false);
      b.x = -99;
      continue;
    }
    if (b.kind === "minirocket") steerRocket(s, b);
    if (b.own === "p" && b.kind === "stinger") {
      let best = 1e9;
      let tx = 0;
      let ty = 0;
      if (b.home !== undefined && b.home > 0) {
        b.home -= 1;
        for (const o of s.enemies) {
          if (o.hp <= 0 || o.x > W - 4 || o.x + o.w < b.x - 10) continue;
          const d = Math.hypot(o.x + o.w / 2 - b.x, o.y + o.h / 2 - b.y);
          if (d < best) {
            best = d;
            tx = o.x + o.w / 2;
            ty = o.y + o.h / 2;
          }
        }
      }
      const cur = Math.atan2(b.vy, b.vx);
      const sp = Math.min(PSTINGER.top, Math.hypot(b.vx, b.vy) + PSTINGER.accel);
      const a2 = best < 1e9 ? cur + clamp(Math.atan2(Math.sin(Math.atan2(ty - b.y, tx - b.x) - cur), Math.cos(Math.atan2(ty - b.y, tx - b.x) - cur)), -PSTINGER.turn, PSTINGER.turn) : cur;
      b.vx = Math.cos(a2) * sp;
      b.vy = Math.sin(a2) * sp;
    }
    b.x += b.vx;
    b.y += b.vy;
    /* Over Space 2's seas an enemy shot that dives into the water splashes and is gone, rather
       than flying on under the surface. */
    if (b.own === "e" && b.vy > 0 && b.y > WATER_Y + 2 && isSecond(s.chapter) && SEA_PLACES.includes(placeOf(s))) {
      burst(s, b.x, WATER_Y, false);
      b.x = -99;
      continue;
    }
    if (b.life !== undefined) b.life -= 1;
    trailSmoke(s, b);
    /* A shot of the ship's with a fuse goes off where the fuse runs out, if that is on the screen. */
    if (b.own === "p" && b.life !== undefined && b.life <= 0 && b.x > 0 && b.x < W) {
      if (b.kind === "minirocket") rocketBlast(s, b, 0, true);
      else if (b.kind === "torpedo" || b.kind === "plasmatorp") detonate(s, b, 0, true);
    }
    /* An ice bomb that finds nothing goes off where it runs out. */
    if (b.kind === "icebomb" && b.own === "p" && b.life !== undefined && b.life <= 0) detonate(s, b);
  }
  s.bullets.push(...born);
  s.bullets = s.bullets.filter((b) => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10 && (b.life === undefined || b.life > 0));
  for (const b of s.beams) {
    b.t += 1;
    if (b.vy && b.t >= b.warn) b.y += b.vy;
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

  /* Rockets against shots, Bloom against shots, the hyperbeam against everything in its lane. */
  tickRockets(s);
  if (!s.res) {
    tickBloom(s);
    tickHyper(s);
  }
  tickKite(s);
  tickGust(s);

  /* The ship's shots against enemies, then against what stands in the way. */
  const solids: Box[] = [];
  for (const h of s.hazards) if (h.kind !== "flare" && h.kind !== "strike" && h.kind !== "twister" && h.kind !== "cover") solids.push(...hazardBoxes(h));
  const covers = s.hazards.filter((h) => h.kind === "cover");
  for (const b of s.bullets) {
    if (b.own !== "p") continue;
    const shotBox = { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 };
    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      if (b.pierce && b.hit?.includes(e.id)) continue;
      const body: Box = { x: e.x + 2, y: e.y + 2, w: e.w - 4, h: e.h - 4 };
      const part = modsAlive(e) ? e.mods!.find((m) => m.hp > 0 && hits(shotBox, modBox(e, m))) : undefined;
      if (!hits(shotBox, body) && !part) continue;
      const amount = b.dmg * POWER * powerBonus(s.p) * (isBoss(e.type) ? (b.kind === "minirocket" ? ROCKET.boss : b.kite ? KITE.boss : 1) : 1);
      /* While a boss still has parts standing, its core shrugs shots off; only the parts can be hurt. */
      if (part) hurtMod(s, e, part, amount);
      else if (!modsAlive(e)) damage(e, amount);
      e.flash = 3;
      if (b.kind === "minirocket") rocketBlast(s, b, e.id);
      if (b.kind === "torpedo" || b.kind === "plasmatorp" || b.kind === "icebomb") {
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
    const cover = covers.find((h) => hits(shotBox, { x: h.x, y: h.base, w: h.w, h: h.half }));
    if (cover) {
      const was = cover.g[0];
      cover.g[0] = Math.max(0, cover.g[0] - b.dmg * (b.kind === "stinger" || b.kind === "minirocket" ? 2 : 1));
      cover.g[5] = 4;
      if (b.kind === "torpedo" || b.kind === "plasmatorp" || b.kind === "icebomb") detonate(s, b, 0, true);
      if (b.kind === "minirocket") rocketBlast(s, b, 0, true);
      b.x = W + 99;
      /* It crumbles as it is worn down, to a stump, and no further. */
      const tall = cover.g[8] * (1 - (1 - COVER2.stump) * (1 - cover.g[0] / cover.g[1]));
      cover.half = tall;
      cover.base = cover.g[7] - tall;
      if (was > 0 && cover.g[0] === 0) burst(s, cover.x + cover.w / 2, cover.base, false);
      continue;
    }
    if (solids.some((r) => hits(shotBox, r)) || s.enemies.some((e) => e.parts.some((r) => hits(shotBox, r)))) {
      if (b.kind === "torpedo" || b.kind === "plasmatorp" || b.kind === "icebomb") detonate(s, b, 0, true);
      if (b.kind === "minirocket") rocketBlast(s, b, 0, true);
      b.x = W + 99;
    }
  }
  const dying = s.enemies.filter((e) => e.hp <= 0);
  for (const e of dying) kill(s, e);
  s.enemies = s.enemies.filter((e) => e.hp > 0 && (e.x > -110 || isBoss(e.type)) && e.x < W + 140);

  /* The ship against enemy fire, enemies, obstacles and beams. */
  const me: Box = { x: p.x + 3, y: p.y + 2, w: shipSize(s.p.level).w - 6, h: shipSize(s.p.level).h - 4 };
  for (const b of s.bullets) {
    if (b.own !== "e") continue;
    if (hits({ x: b.x - b.r + 0.6, y: b.y - b.r + 0.6, w: b.r * 2 - 1.2, h: b.r * 2 - 1.2 }, me)) {
      burst(s, b.x, b.y, true);
      blastSmoke(s, b.x, b.y, 8);
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
        addXp(s, isSecond(s.chapter) ? XP.heart : XP.heart1);
      } else if (k.kind === "D") p.shield = Math.min(maxShield(p), p.shield + SHIELD.drop);
      else if (k.kind === "B") p.bombs = Math.min(4, p.bombs + 1);
      else if (k.kind === "U") p.bloom = Math.min(BLOOM.max, p.bloom + BLOOM.energy);
      else if (k.kind === "Z") {
        if (s.res) gain(s.res, CELL.gain);
      } else if (k.kind === "W" || k.kind === "P" || k.kind === "Q") s.mode = { kind: k.kind === "W" ? "wide" : k.kind === "P" ? "pierce" : "rapid", t: MODE.frames };
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
  if (s.phase === "clear") {
    s.clearFor += 1;
    if (s.clearFor < 60) {
      if (s.clearFor % 8 === 0) {
        const bx = W - 35 - ((s.clearFor * 17) % 65);
        const by = H / 2 - 30 + ((s.clearFor * 23) % 60);
        burst(s, bx, by, true);
        s.shake = Math.max(s.shake, 6);
      }
      if (s.clearFor === 54) {
        burst(s, W - 60, H / 2, true);
        s.bombFlash = 12;
        s.shake = Math.max(s.shake, 18);
      }
    }
  }
}

