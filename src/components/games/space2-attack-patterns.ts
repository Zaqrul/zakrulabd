/* Timings tuned for Space's 384 x 216 arena and visible ship hitbox. These are
   game-specific values, not frame data copied from Metal Slug. */
import type { AttackKind } from "./space-logic.ts";

export const PATTERN = {
  bossLock: 24, miniLock: 20, miniRecovery: 60, bossRecovery: 40, hydraRecovery: 56,
  finalRecovery: 36, lastRecovery: 24, shotLife: 210, gapHalf: 26, vortexRadius: 72,
} as const;

export const SECOND_BOSS_TIMING: Partial<Record<AttackKind, [number, number]>> = {
  railshot: [56, 40], geysers: [60, 64], broadside: [76, 160],
  deckbomb: [56, 74], silorocket: [66, 70], arsenalsalvo: [76, 128],
  avalanche: [66, 96], icewall: [66, 100], lances: [76, 144],
  sandspout: [60, 96], burrow: [72, 84], pinwheel: [76, 160],
  ram: [60, 112], searchlight: [56, 104], sweep: [76, 144],
  icebreak: [66, 112], harpoon: [60, 72], vortex: [76, 116],
  lightning: [60, 112], twister: [66, 42], maelstrom: [76, 164],
  quake: [66, 96], rocketfist: [60, 84], orbital: [66, 120], cluster: [66, 80], scissor: [76, 108], march: [82, 288],
  volley: [48, 44],
  helix: [54, 96], rain: [56, 90], tidewall: [54, 84], shatter: [56, 70], barrage: [50, 60], grid: [72, 40],
};
export const SECOND_MINI_TIMING: Partial<Record<AttackKind, [number, number]>> = {
  rotorwash: [60, 64], sweepgun: [54, 72], skip: [66, 84], netgun: [60, 64],
  cableslide: [66, 100], chaff: [60, 64], duneram: [66, 84], mortar: [60, 64],
  ladder: [66, 80], lattice: [66, 72], torpfan: [60, 78], periscope: [66, 52],
  featherfan: [54, 64], divebomb: [72, 84], gatelaser: [72, 52], shielddrones: [66, 112],
};

/* Shift the whole formation at an edge, rather than clamping several hazards to
   the same coordinate and accidentally stacking their collision/visual cues. */
export function spacedPositions(center: number, count: number, step: number, min: number, max: number): number[] {
  const half = (count - 1) * step / 2;
  const middle = Math.max(min + half, Math.min(max - half, center));
  return Array.from({ length: count }, (_, i) => middle + (i - (count - 1) / 2) * step);
}
export const angleDifference = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
