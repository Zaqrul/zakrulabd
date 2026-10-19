/* Arena attacks for the Space 1 and Space 2 bosses (docs/space-boss-attack-enhancements.md): six patterns that leave the ship no corner
   to sit in. Each comes from more than one side at once (the rear, the corners, the boss's own guns), shuts the lanes the ship might
   use, and keeps the front guns firing; there is no corridor kept open for it. Planned once as plain data, played back by the engine:

     mortarRear     bombs lobbed onto the rear edge (one on the ship's own height), each bursting into a full ring
     sweepBeam      an energy curtain over the whole arena with a slit that starts on the far side from the ship
     scissorPincer  two beams close from top and bottom to a slit barely wider than the ship, away from it
     spiralWheel    two wheels of arms turning against each other
     flankTorpedo   torpedoes from behind on every lane but one, and out of the rear corners at the ship
     harpoonTether  two energised wires across the arena, one on the ship's own height

   Pure functions with no link to the engine. Times are frames from the start of the live part unless a marker says otherwise. */

export type ArenaKind = "mortarRear" | "sweepBeam" | "scissorPincer" | "spiralWheel" | "flankTorpedo" | "harpoonTether";
export const ARENA_KINDS: ArenaKind[] = ["mortarRear", "sweepBeam", "scissorPincer", "spiralWheel", "flankTorpedo", "harpoonTether"];
export const isArenaKind = (kind: string): kind is ArenaKind => (ARENA_KINDS as string[]).includes(kind);

export const ARENA = { top: 14, bottom: 204, width: 384 };
/* The tallest gap the ship must be able to use, and the corridor each pattern declares. */
export const MIN_LANE = 34;

/* Frames of warning and of live fire for each, then the callout (English, Malay). */
export const ARENA_TIMING: Record<ArenaKind, [warn: number, live: number]> = {
  mortarRear: [56, 190], sweepBeam: [56, 110], scissorPincer: [56, 140], spiralWheel: [48, 130], flankTorpedo: [56, 90], harpoonTether: [56, 120],
};
export type ArenaCallout = "mortar" | "sweep" | "scissor" | "wheel" | "flank" | "tether";
export const ARENA_CALLOUT: Record<ArenaKind, ArenaCallout> = {
  mortarRear: "mortar", sweepBeam: "sweep", scissorPincer: "scissor", spiralWheel: "wheel", flankTorpedo: "flank", harpoonTether: "tether",
};

export type ArenaShotKind = "orb" | "pulse" | "needle" | "scrap" | "fire" | "ice" | "torpedo";
export type Flavor = { shot: ArenaShotKind; heavy: ArenaShotKind };

/* Which pattern each boss gets (section 4 and 5 of the spec) and what its shots are made of. */
export const ARENA_OF: Record<string, { kind: ArenaKind; flavor: Flavor }> = {
  boss1: { kind: "mortarRear", flavor: { shot: "orb", heavy: "scrap" } },
  boss2: { kind: "sweepBeam", flavor: { shot: "pulse", heavy: "scrap" } },
  boss3: { kind: "scissorPincer", flavor: { shot: "pulse", heavy: "scrap" } },
  boss4: { kind: "spiralWheel", flavor: { shot: "orb", heavy: "orb" } },
  boss5: { kind: "scissorPincer", flavor: { shot: "ice", heavy: "ice" } },
  boss6: { kind: "scissorPincer", flavor: { shot: "fire", heavy: "fire" } },
  boss7: { kind: "flankTorpedo", flavor: { shot: "needle", heavy: "torpedo" } },
  boss8: { kind: "sweepBeam", flavor: { shot: "pulse", heavy: "scrap" } },
  boss9: { kind: "mortarRear", flavor: { shot: "orb", heavy: "scrap" } },
  boss10: { kind: "flankTorpedo", flavor: { shot: "needle", heavy: "torpedo" } },
  boss11: { kind: "scissorPincer", flavor: { shot: "ice", heavy: "ice" } },
  boss12: { kind: "spiralWheel", flavor: { shot: "scrap", heavy: "scrap" } },
  boss13: { kind: "flankTorpedo", flavor: { shot: "pulse", heavy: "torpedo" } },
  boss14: { kind: "harpoonTether", flavor: { shot: "needle", heavy: "scrap" } },
  boss15: { kind: "scissorPincer", flavor: { shot: "orb", heavy: "orb" } },
  boss16: { kind: "sweepBeam", flavor: { shot: "pulse", heavy: "scrap" } },
};

/* A shot the pattern launches `at` frames after live fire begins. `hold` freezes it where it lands (a bomb sitting). */
export type ArenaShot = {
  at: number; x: number; y: number; vx: number; vy: number; r: number; kind: ArenaShotKind; life: number;
  hold?: number; hvx?: number; hvy?: number;
};
/* What the warning draws, in frames from the start of the attack (the warning included). */
export type ArenaMarker = { kind: "target" | "arrow" | "line" | "gap"; x: number; y: number; x2?: number; y2?: number; r?: number; from: number; to: number };
/* A beam across the arena from the left edge: the band of heights it covers, as keyframes in frames of live fire (linear between). */
export type ArenaBand = { keys: { t: number; y0: number; y1: number }[] };
export type ArenaPlan = {
  kind: ArenaKind;
  warn: number;
  live: number;
  shots: ArenaShot[];
  markers: ArenaMarker[];
  bands: ArenaBand[];
  /* The way through: the heights of a corridor no shot sweeps (shot patterns), or null where the bands leave free lanes. */
  corridor: { y0: number; y1: number } | null;
  /* Spiral wheels: how many arms, and the angular gap between them. */
  arms?: number;
};

export type Rnd = () => number;
type Pose = { x: number; y: number };
type Boss = { x: number; y: number; w: number; h: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/* Every shot's speed and heading wander by about a tenth, so a volley is never a perfect wall (spec 4.3). */
const JITTER = 0.1;
const wobble = (r: Rnd) => 1 + (r() - 0.5) * 2 * JITTER;
const between = (r: Rnd, lo: number, hi: number) => lo + r() * (hi - lo);

/* The band's height range at `t` frames into live fire. */
export function bandAt(band: ArenaBand, t: number): { y0: number; y1: number } {
  const k = band.keys;
  if (t <= k[0].t) return { y0: k[0].y0, y1: k[0].y1 };
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i].t) {
      const f = (t - k[i - 1].t) / Math.max(1, k[i].t - k[i - 1].t);
      return { y0: k[i - 1].y0 + (k[i].y0 - k[i - 1].y0) * f, y1: k[i - 1].y1 + (k[i].y1 - k[i - 1].y1) * f };
    }
  }
  const last = k[k.length - 1];
  return { y0: last.y0, y1: last.y1 };
}

/* The heights the bands leave free at `t`, tallest first, within the arena. */
export function freeLanes(plan: ArenaPlan, t: number): { y0: number; y1: number }[] {
  const covered = plan.bands.map((b) => bandAt(b, t)).filter((b) => b.y1 - b.y0 > 0.5).sort((a, b) => a.y0 - b.y0);
  const out: { y0: number; y1: number }[] = [];
  let at = ARENA.top;
  for (const c of covered) {
    if (c.y0 > at) out.push({ y0: at, y1: Math.min(c.y0, ARENA.bottom) });
    at = Math.max(at, c.y1);
  }
  if (at < ARENA.bottom) out.push({ y0: at, y1: ARENA.bottom });
  return out.sort((a, b) => b.y1 - b.y0 - (a.y1 - a.y0));
}

/* ---------- the six plans ---------- */

/* Aimed fire from the boss's own guns, leading nothing: every pattern carries some, so the front is never quiet. */
function aimed(r: Rnd, boss: Boss, ship: Pose, from: number, to: number, every: number, f: Flavor): ArenaShot[] {
  const out: ArenaShot[] = [], bx = boss.x, by = boss.y + boss.h / 2;
  for (let at = from; at < to; at += every) {
    const aim = Math.atan2(ship.y - by, ship.x - bx);
    for (const d of [-0.14, 0, 0.14]) out.push({ at, x: bx, y: by, vx: Math.cos(aim + d * wobble(r)) * 2.6 * wobble(r), vy: Math.sin(aim + d * wobble(r)) * 2.6 * wobble(r), r: 2.4, kind: f.shot, life: 200 });
  }
  return out;
}

/* Bombs lobbed over the ship onto the rear edge, each landing on a height the ship might be at (its own height among them); each sits a
   moment and bursts into a full ring, so the rear is shut and the burst comes forward and back. The front guns keep firing. */
function mortarRear(r: Rnd, boss: Boss, ship: Pose, phase: number, f: Flavor): ArenaPlan {
  const [warn] = ARENA_TIMING.mortarRear;
  const n = phase >= 2 ? 6 : 4, flight = 34, sit = 60, bx = boss.x;
  const shots: ArenaShot[] = [], markers: ArenaMarker[] = [];
  for (let i = 0; i < n; i++) {
    const sy = i === 0 ? clamp(ship.y, 20, 196) : between(r, 24, 192), sx = between(r, 16, 70), edge = sy < 108 ? 22 : 200, at = i * 10;
    shots.push({ at, x: bx, y: edge, vx: (sx - bx) / flight, vy: (sy - edge) / flight, r: 4.5, kind: f.heavy, life: flight + sit, hold: flight, hvx: 0, hvy: 0 });
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + i;
      shots.push({ at: at + flight + sit, x: sx, y: sy, vx: Math.cos(ang) * 1.9 * wobble(r), vy: Math.sin(ang) * 1.9 * wobble(r), r: 2.4, kind: f.shot, life: 150 });
    }
    markers.push({ kind: "target", x: sx, y: sy, r: 11, from: 0, to: warn + at + flight + sit });
  }
  shots.push(...aimed(r, boss, ship, 0, 120, 20, f));
  return { kind: "mortarRear", warn, live: Math.max(...shots.map((x) => x.at + x.life)) + 2, shots, markers, bands: [], corridor: null };
}

/* Torpedoes from behind on every lane but one picked at random (the ship's own lane is always among them), and two more out of the rear
   corners straight at the ship, while the front guns fire. */
function flankTorpedo(r: Rnd, boss: Boss, ship: Pose, phase: number, f: Flavor): ArenaPlan {
  const [warn, live] = ARENA_TIMING.flankTorpedo;
  const speed = between(r, 3.0, 3.6), all = [26, 56, 86, 116, 146, 176, 200];
  const skip = Math.floor(r() * all.length), mine = all.reduce((best, y) => (Math.abs(y - ship.y) < Math.abs(best - ship.y) ? y : best));
  const lanes = all.filter((y, i) => i !== skip || y === mine), shots: ArenaShot[] = [], markers: ArenaMarker[] = [];
  lanes.forEach((y, i) => {
    for (const volley of phase >= 2 ? [0, 30, 60] : [0, 40]) shots.push({ at: i * 4 + volley, x: -6, y, vx: speed * wobble(r), vy: 0, r: 3, kind: f.heavy, life: 140 });
    markers.push({ kind: "arrow", x: 8, y, from: 0, to: warn + 40 });
  });
  for (const cy of [10, 206]) {
    const aim = Math.atan2(ship.y - cy, ship.x + 6);
    for (const at of [10, 50]) shots.push({ at, x: -6, y: cy, vx: Math.cos(aim) * speed, vy: Math.sin(aim) * speed, r: 3, kind: f.heavy, life: 160 });
  }
  shots.push(...aimed(r, boss, ship, 0, live, 24, f));
  return { kind: "flankTorpedo", warn, live, shots, markers, bands: [], corridor: null };
}

/* A wheel of arms turning one way and a second wheel turning the other, so the gaps between them close and open as they cross. */
function spiralWheel(r: Rnd, boss: Boss, ship: Pose, phase: number, f: Flavor): ArenaPlan {
  const [warn, live] = ARENA_TIMING.spiralWheel;
  const arms = phase >= 2 ? 6 : 5, dir = r() < 0.5 ? -1 : 1, spin = between(r, 0, Math.PI * 2), omega = 0.05, every = 4, speed = 1.6;
  const cx = boss.x + boss.w / 2, cy = boss.y + boss.h / 2, shots: ArenaShot[] = [];
  for (let k = 0; k * every < live - 50; k++) {
    for (let a = 0; a < arms; a++) {
      for (const turn of [dir, -dir]) {
        const ang = spin + turn * omega * k * every + (a * Math.PI * 2) / arms;
        const v = speed * wobble(r) * (turn === dir ? 1 : 0.8);
        shots.push({ at: k * every, x: cx, y: cy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, r: 2.4, kind: f.shot, life: 170 });
      }
    }
  }
  shots.push(...aimed(r, boss, ship, 10, live, 30, f));
  const markers: ArenaMarker[] = [];
  for (let a = 0; a < arms; a++) markers.push({ kind: "line", x: cx, y: cy, x2: cx + Math.cos(spin + (a * Math.PI * 2) / arms) * 70, y2: cy + Math.sin(spin + (a * Math.PI * 2) / arms) * 70, from: 0, to: warn });
  return { kind: "spiralWheel", warn, live, shots, markers, bands: [], corridor: null, arms };
}

/* A curtain of beam over the whole arena with a slit in it that starts on the far side from the ship and runs further away. */
function sweepBeam(r: Rnd, boss: Boss, ship: Pose, f: Flavor): ArenaPlan {
  const [warn, live] = ARENA_TIMING.sweepBeam;
  const half = 11, far = ship.y < 109 ? between(r, 150, 186) : between(r, 30, 66), dir = far > 109 ? 1 : -1;
  const c0 = clamp(far, ARENA.top + half + 4, ARENA.bottom - half - 4), c1 = clamp(c0 + dir * between(r, 20, 40), ARENA.top + half + 4, ARENA.bottom - half - 4);
  const upper: ArenaBand = { keys: [{ t: 0, y0: ARENA.top, y1: c0 - half }, { t: live, y0: ARENA.top, y1: c1 - half }] };
  const lower: ArenaBand = { keys: [{ t: 0, y0: c0 + half, y1: ARENA.bottom }, { t: live, y0: c1 + half, y1: ARENA.bottom }] };
  return { kind: "sweepBeam", warn, live, shots: aimed(r, boss, ship, 0, live, 26, f), markers: [], bands: [upper, lower], corridor: null };
}

/* Two beams close from the top and the bottom down to a slit barely wider than the ship, at a height picked away from it, hold, and open. */
function scissorPincer(r: Rnd, boss: Boss, ship: Pose, phase: number, f: Flavor): ArenaPlan {
  const [warn, live] = ARENA_TIMING.scissorPincer;
  const half = phase >= 2 ? 9 : 11, yc = clamp(ship.y < 109 ? between(r, 120, 180) : between(r, 40, 98), 30, 190), close = 48, hold = 44;
  const upper: ArenaBand = { keys: [{ t: 0, y0: ARENA.top, y1: ARENA.top }, { t: close, y0: ARENA.top, y1: yc - half }, { t: close + hold, y0: ARENA.top, y1: yc - half }, { t: live, y0: ARENA.top, y1: ARENA.top }] };
  const lower: ArenaBand = { keys: [{ t: 0, y0: ARENA.bottom, y1: ARENA.bottom }, { t: close, y0: yc + half, y1: ARENA.bottom }, { t: close + hold, y0: yc + half, y1: ARENA.bottom }, { t: live, y0: ARENA.bottom, y1: ARENA.bottom }] };
  return { kind: "scissorPincer", warn, live, shots: aimed(r, boss, ship, 0, live, 22, f), markers: [], bands: [upper, lower], corridor: null };
}

/* Two wires the harpoons pull across the arena, one on the ship's own height, while the front guns fire. */
function harpoonTether(r: Rnd, boss: Boss, ship: Pose, f: Flavor): ArenaPlan {
  const [warn, live] = ARENA_TIMING.harpoonTether;
  const y1 = clamp(ship.y, 30, 186), y2 = clamp(y1 + (y1 < 109 ? 1 : -1) * between(r, 40, 70), 26, 190);
  const bands: ArenaBand[] = [y1, y2].map((y) => ({ keys: [{ t: 0, y0: y - 3, y1: y + 3 }, { t: live, y0: y - 3, y1: y + 3 }] }));
  const shots: ArenaShot[] = [y1, y2].map((y, i) => ({ at: i * 6, x: boss.x, y, vx: -6.5, vy: 0, r: 3, kind: f.heavy, life: 56 }));
  shots.push(...aimed(r, boss, ship, 10, live, 24, f));
  return { kind: "harpoonTether", warn, live, shots, markers: [{ kind: "line", x: boss.x, y: y1, x2: 4, y2: y1, from: 0, to: warn + live }], bands, corridor: null };
}

/* Plans an arena attack when the boss chooses it. `phase` is the boss's phase (0 first). */
export function planArena(kind: ArenaKind, r: Rnd, boss: Boss, ship: Pose, phase: number, flavor: Flavor): ArenaPlan {
  switch (kind) {
    case "mortarRear": return mortarRear(r, boss, ship, phase, flavor);
    case "flankTorpedo": return flankTorpedo(r, boss, ship, phase, flavor);
    case "spiralWheel": return spiralWheel(r, boss, ship, phase, flavor);
    case "sweepBeam": return sweepBeam(r, boss, ship, flavor);
    case "scissorPincer": return scissorPincer(r, boss, ship, phase, flavor);
    case "harpoonTether": return harpoonTether(r, boss, ship, flavor);
  }
}
