/* Visual load and recoil sampled from the real attack, never a second clock. */
import type { Enemy } from "./space-logic";

export function finalAttackPose(e: Enemy, reduceMotion: boolean) {
  const a = e.attack;
  if (!a) return { kind: null, charge: 0, live: false, load: 0, kick: 0 };
  const charge = a.t < a.warn ? Math.max(0, a.t / Math.max(1, a.warn)) : 0;
  const elapsed = a.t - a.warn, live = elapsed >= 0 && elapsed < a.live;
  const recovery = Math.max(0, 1 - (elapsed - a.live) / Math.max(1, a.recover));
  const load = charge || (live ? 1 : elapsed >= a.live ? recovery : 0);
  const cadence = a.kind === "quake" || a.kind === "cluster" || a.kind === "march" ? 22
    : a.kind === "burst" || a.kind === "fan" ? 10 : 0;
  const shotAge = cadence ? elapsed % cadence : elapsed;
  const kick = live ? reduceMotion ? .65 : Math.exp(-Math.max(0, shotAge) / 7) : 0;
  return { kind: a.kind, charge, live, load, kick };
}
