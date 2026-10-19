/* Space 3's own arsenal. It carries none of Space 1 or 2's guns, torpedoes, bombs, Kite or Bloom: those are
   left behind, and the ship fights with three things built on its Resonance.

     Seed Bolt   the main gun, auto-fire. More barrels as the ship levels.
     Echo Wing   the ship's own past. The path it flew `ECHO.delay` frames ago flies again beside it, firing
                 wherever the ship fired then. The Vanguard copies you to hurt you; this turns the trick
                 round, and makes where you have been a weapon.
     Lance       B spends part of the Resonance meter on a beam that pierces everything along the ship's
                 height for a moment, and follows the ship as it moves.

   Pure numbers and shapes, no link to the engine; space-logic fires what these return. */
import type { Bullet } from "./space-logic";

export const SEED = { cooldown: 10, speed: 7, dmg: 0.9, r: 1.8, life: 70, spread: 0.06, maxBarrels: 4 };
export const ECHO = { delay: 90, dmg: 0.6 };
export const LANCE = { cost: 30, frames: 14, dmg: 2.5, speed: 12, r: 5, life: 40 };

/* The plasma torpedo: the ship's second weapon. Every `cooldown` frames, when an enemy is ahead, it launches one torpedo that leaves its tube
   the way every torpedo does (slides out, lights, burns) and explodes on the first thing it meets or where its fuse runs out. It hits for
   `dmg` (a torpedo's 5 and 7 are less) and its blast does `splash` to everything within `radius`, `boss` of it to a boss. */
export const PLASMA = { cooldown: 70, dmg: 12, splash: 9, radius: 34, life: 150, r: 2.4, boss: 0.5 };

/* Kinetic Push: B spends `cost` of the cell (which charges `charge` a frame and from kills) on a wave out of the ship that shoves
   everything within `radius` away from it: enemies (a mini boss `mini` as far, a boss `boss`) with a speed of `speed` that dies
   away by `decay` a frame, and enemy fire, which is sent off at `bullet`. It does no damage; it buys room. `frames` is how long the wave is drawn. */
export const PUSH = { cost: 40, charge: 0.05, radius: 130, speed: 7, decay: 0.9, mini: 0.6, boss: 0.25, bullet: 6, frames: 18 };

type Shot = Pick<Bullet, "x" | "y" | "vx" | "vy" | "r" | "own" | "dmg" | "kind" | "life" | "pierce" | "hit">;
type Pose = { x: number; y: number; fire: boolean };

/* One barrel at the start, a pair from level 3, three from level 6, four from level 9. */
export const barrels = (level: number) => Math.min(SEED.maxBarrels, 1 + Math.floor(Math.max(1, level) / 3));

/* Three modes a supply pod can give the Seed Bolt for `frames`: a wide volley (two more barrels, fanned out), bolts that pierce what
   they hit (and hit a fifth harder), and a rapid fire (a cooldown of `rapidCooldown` times the usual). */
export type SeedMode = "wide" | "pierce" | "rapid";
export const MODE = { frames: 900, wideExtra: 2, wideSpread: 0.14, pierceDmg: 1.2, rapidCooldown: 0.55 };

/* Where each bolt of a volley starts and heads, relative to the muzzle. */
export function seedVolley(level: number, mode?: SeedMode): { dy: number; vx: number; vy: number; dmg: number; pierce?: boolean }[] {
  const n = Math.min(SEED.maxBarrels + (mode === "wide" ? MODE.wideExtra : 0), barrels(level) + (mode === "wide" ? MODE.wideExtra : 0));
  const spread = mode === "wide" ? MODE.wideSpread : SEED.spread;
  return Array.from({ length: n }, (_, i) => {
    const k = i - (n - 1) / 2;
    return {
      dy: k * 2.2, vx: Math.cos(k * spread) * SEED.speed, vy: Math.sin(k * spread) * SEED.speed,
      dmg: SEED.dmg * (mode === "pierce" ? MODE.pierceDmg : 1), ...(mode === "pierce" ? { pierce: true } : {}),
    };
  });
}

/* The ship's pose `ECHO.delay` frames ago, or null while there is not that much record yet. The newest pose is last. */
export function echoPose(trail: readonly Pose[]): Pose | null {
  const at = trail.length - 1 - ECHO.delay;
  return at >= 0 ? trail[at] : null;
}

/* The bolt the Echo Wing fires this frame, if the ship fired at that moment. */
export function echoShot(trail: readonly Pose[]): Shot | null {
  const pose = echoPose(trail);
  if (!pose?.fire) return null;
  return { x: pose.x + 6, y: pose.y, vx: SEED.speed, vy: 0, r: SEED.r, own: "p", dmg: ECHO.dmg, kind: "echo", life: SEED.life };
}

/* The slice of the Lance beam for one frame: a thick bolt that goes through all it meets. */
export function lanceSlice(x: number, y: number): Shot {
  return { x, y, vx: LANCE.speed, vy: 0, r: LANCE.r, own: "p", dmg: LANCE.dmg, kind: "lance", life: LANCE.life, pierce: true, hit: [] };
}
