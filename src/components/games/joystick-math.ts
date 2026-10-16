/* The arithmetic of the on-screen joystick, apart from the screen, so it can be tested on
   its own. */

export const DEADZONE = 0.16;

/* Where the knob of a stick of `radius` goes when the finger is `dx`, `dy` from its centre
   (kx, ky: held inside the rim), and what the stick reports (x, y, each -1 to 1, y down):
   nothing inside the dead zone, then growing smoothly from zero to one at the rim. */
export function stickFrom(dx: number, dy: number, radius: number, deadzone = DEADZONE) {
  if (!(radius > 0)) return { x: 0, y: 0, kx: 0, ky: 0 };
  const mag = Math.hypot(dx, dy);
  const hold = mag > radius ? radius / mag : 1;
  const kx = dx * hold;
  const ky = dy * hold;
  const m = Math.min(1, mag / radius);
  if (m < deadzone || mag === 0) return { x: 0, y: 0, kx, ky };
  const strength = (m - deadzone) / (1 - deadzone);
  return { x: (dx / mag) * strength, y: (dy / mag) * strength, kx, ky };
}

/* A platformer's left and right from the stick's sideways pull: it has to be pushed a good
   way over before the character runs. */
export function runKeys(x: number, threshold = 0.35) {
  return { left: x <= -threshold, right: x >= threshold };
}
