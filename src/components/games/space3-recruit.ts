/* Lumen, Space 3's new wingman: Ensign Sera Okoro, a recruit straight from the academy, flying Zephyr-04, the same ship as
   Nova's, and armed with a plasma beam. She does not guard or copy; she hunts.

     - She flies on the ship's wing, below and behind it, and slides up or down to put the nearest enemy in her sights
       (up to `reach` ahead of her), so her beam covers a lane the ship is not in.
     - The beam burns everything along its length at once, a little every frame, the boss a little less.
     - It runs hot. After `max` frames of firing she overheats and goes cold for `cool` frames; a beam that stops early
       cools sooner. A recruit is not a reactor.

   Pure logic with no link to the engine; space-logic calls `stepLumen` once a frame and damages what it returns, and
   doubles the damage in Overdrive. The design is in docs/space3-design.md. The numbers are first guesses. */

export const LUMEN = {
  /* Her place on the ship's wing, relative to the ship's centre. */
  dx: -15, dy: 17,
  follow: 0.1,
  /* Pixels a frame she slides toward a target, and how far ahead of her the beam reaches. */
  seek: 1.5, reach: 150,
  /* Half the beam's width for hitting, and damage a frame: to anything, and to a boss. */
  half: 2.2, dmg: 0.1, boss: 0.08,
  /* Heat: gained a frame while firing, lost a frame while not; at `max` she overheats for `cool` frames. */
  rise: 1, fall: 1.6, max: 240, cool: 150,
  /* Where the beam leaves her ship, ahead of its centre. */
  muzzle: 7,
};

/* The command: Z sends her to the ship's own lane to burn there for `frames`, half again as hard, with her heat rising half as fast.
   Then she must wait `cooldown`. */
export const FOCUS = { frames: 180, cooldown: 600, boost: 1.5 };

export type Lumen = {
  x: number;
  y: number;
  heat: number;
  /* Frames of overheat left. */
  hot: number;
  firing: boolean;
  /* The height she is lining up on, or null. */
  aim: number | null;
  /* Frames of the command left, and frames before it can be given again. */
  focus: number;
  focusCd: number;
};
type Foe = { x: number; y: number; w: number; h: number; hp: number };

export const createLumen = (ship: { x: number; y: number }): Lumen => ({ x: ship.x + LUMEN.dx, y: ship.y + LUMEN.dy, heat: 0, hot: 0, firing: false, aim: null, focus: 0, focusCd: 0 });

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* The enemy she lines up on: ahead of her and within reach, the one whose height is nearest hers. */
function target<T extends Foe>(l: Lumen, foes: readonly T[]) {
  let best: T | null = null, bestGap = Infinity;
  for (const f of foes) {
    if (f.hp <= 0 || f.x + f.w < l.x + LUMEN.muzzle || f.x > l.x + LUMEN.muzzle + LUMEN.reach) continue;
    const gap = Math.abs(f.y + f.h / 2 - l.y);
    if (gap < bestGap) { bestGap = gap; best = f; }
  }
  return best;
}

/* One frame. Moves her, runs her heat, and returns the enemies her beam is burning this frame. `command` is the player asking her to
   focus on the ship's own lane. */
export function stepLumen<T extends Foe>(l: Lumen, ship: { x: number; y: number }, foes: readonly T[], command = false, top = 14, bottom = 194): T[] {
  const restX = ship.x + LUMEN.dx, restY = ship.y + LUMEN.dy;
  l.x += (restX - l.x) * LUMEN.follow;
  if (l.focusCd > 0) l.focusCd -= 1;
  if (command && l.focus === 0 && l.focusCd === 0 && l.hot === 0) {
    l.focus = FOCUS.frames;
    l.focusCd = FOCUS.cooldown + FOCUS.frames;
  }
  const focusing = l.focus > 0 && l.hot === 0;
  if (l.focus > 0) l.focus -= 1;
  const hunted = focusing || l.hot > 0 ? null : target(l, foes);
  l.aim = focusing ? ship.y : hunted ? hunted.y + hunted.h / 2 : null;
  if (focusing) l.y += clamp(ship.y - l.y, -LUMEN.seek * 2, LUMEN.seek * 2);
  else if (hunted) l.y += clamp(l.aim! - l.y, -LUMEN.seek, LUMEN.seek);
  else l.y += (restY - l.y) * LUMEN.follow;
  l.y = clamp(l.y, top, bottom);

  l.firing = false;
  if (l.hot > 0) {
    l.hot -= 1;
    l.heat = Math.max(0, l.heat - LUMEN.max / LUMEN.cool);
    if (l.hot === 0) l.heat = 0;
    return [];
  }
  if (focusing) l.firing = true;
  else if (hunted && Math.abs(l.aim! - l.y) <= hunted.h / 2 + LUMEN.half) l.firing = true;
  if (!l.firing) {
    l.heat = Math.max(0, l.heat - LUMEN.fall);
    return [];
  }
  l.heat += LUMEN.rise * (focusing ? 0.5 : 1);
  if (l.heat >= LUMEN.max) l.hot = LUMEN.cool;
  const from = l.x + LUMEN.muzzle, to = from + LUMEN.reach;
  return foes.filter((f) => f.hp > 0 && f.x + f.w >= from && f.x <= to && f.y <= l.y + LUMEN.half && f.y + f.h >= l.y - LUMEN.half);
}
