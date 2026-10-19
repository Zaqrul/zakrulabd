import assert from "node:assert/strict";
import test from "node:test";
import { createState, step, isBoss } from "../src/components/games/space-logic.ts";
import { createDirector, nextAttack, attackShots, observe } from "../src/components/games/space3-director.ts";
import { THIRD_BOSSES } from "../src/components/games/space3-boss.ts";
import { ARMS_VERBS, DASH } from "../src/components/games/space3-arms.ts";

const IDLE = { mx: 0, my: 0, bomb: false };
const attackOf = (verb, seed = 3) => {
  const d = createDirector(seed);
  for (let i = 0; i < 60; i++) observe(d, 100);
  return nextAttack(d, 2, { y: 100 }, [[verb]], { force: verb });
};
const shotsOf = (a, boss = { x: 300, y: 100 }, ship = { x: 60, y: 110 }) => {
  const frames = [];
  for (let t = 0; t < a.warn + a.live + 5; t++) frames.push(attackShots(a, t, boss, ship));
  return frames;
};

test("every final boss carries all five weapons by its last phase, and none of them is drawn before it is unlocked", () => {
  for (const [name, kit] of Object.entries(THIRD_BOSSES)) {
    const last = new Set(kit.unlocked.at(-1));
    const have = ARMS_VERBS.filter((v) => last.has(v));
    assert.ok(have.length >= 4, `${name} has ${have}`);
    assert.ok(kit.unlocked[0].some((v) => ARMS_VERBS.includes(v)), `${name} opens with one`);
  }
  assert.ok(ARMS_VERBS.every((v) => Object.values(THIRD_BOSSES).some((k) => k.unlocked.at(-1).includes(v))));
});

test("triple hyper ballistic plasma: three long thin fast bolts side by side, in more than one volley", () => {
  const a = attackOf("plasma3"), volleys = shotsOf(a).filter((f) => f.length);
  assert.ok(volleys.length >= 2);
  for (const v of volleys) {
    assert.equal(v.length, 3);
    assert.ok(v.every((s) => s.kind === "needle" && s.r < 2 && Math.hypot(s.vx, s.vy) > 4.5));
  }
});

test("the double triple explosive: two volleys of three shells, each fused to burst into a ring", () => {
  const a = attackOf("blast"), volleys = shotsOf(a).filter((f) => f.length);
  assert.equal(volleys.length, 2);
  assert.ok(volleys.every((v) => v.length === 3 && v.every((s) => s.fuse > 20 && s.split >= 6)));
});

test("the flamethrower: a long run of short-lived fire in a cone", () => {
  const a = attackOf("flame"), fire = shotsOf(a).flat();
  assert.ok(fire.length >= 60);
  assert.ok(fire.every((s) => s.kind === "fire" && s.life <= 40 && s.vx < 0));
  assert.ok(new Set(fire.map((s) => Math.round(s.vy * 10))).size >= 3, "a cone, not a line");
});

test("the blades are thrown in a fan, each with a turning point so it comes back", () => {
  const a = attackOf("blades"), blades = shotsOf(a).flat();
  assert.ok(blades.length >= 3);
  assert.ok(blades.every((s) => s.kind === "crescent" && s.back > 30 && s.vx < 0));
});

test("the dash throws a bow wave ahead of the hull while it rams, and none while it winds up or returns", () => {
  const a = attackOf("dash"), frames = shotsOf(a);
  const firing = frames.map((f, t) => (f.length ? t - a.warn : null)).filter((t) => t !== null);
  assert.ok(firing.length >= 3);
  assert.ok(firing.every((t) => t >= 0 && t < DASH.hold));
});

test("in a run the final boss really rams in: its hull comes well forward of home during a dash", () => {
  const s = createState(17);
  s.seed = 41;
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.p.launchCd = 1e9; s.p.cd = 1e9; s.lumen = null;
  s.planIdx = s.plan.length;
  s.t = s.plan.at(-1).t;
  s.enemies.length = 0;
  for (let i = 0; i < 400; i++) step(s, IDLE);
  const boss = s.enemies.find((e) => isBoss(e.type));
  assert.ok(boss);
  const home = boss.x;
  let nearest = home;
  boss.hp = boss.maxHp * 0.3;
  for (let i = 0; i < 6000; i++) { boss.hp = boss.maxHp * 0.3; step(s, IDLE); nearest = Math.min(nearest, boss.x); if (nearest < home - 40) break; }
  assert.ok(nearest < home - 40, `closest ${nearest} from ${home}`);
});

/* ----- ordinary enemies ----- */

const foe = (type, x = 250, y = 100) => ({ id: 950, type, x, y, w: 16, h: 14, vx: -1, vy: 0, hp: 50, maxHp: 50, t: 20, cd: 0, y0: y, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] });
function watch(type, chapter = 20, frames = 80) {
  const s = createState(chapter);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.p.launchCd = 1e9; s.p.cd = 1e9; s.lumen = null; s.enemies.length = 0;
  if (s.plan) s.planIdx = s.plan.length;
  const e = foe(type);
  s.enemies.push(e);
  const seen = new Map();
  for (let i = 0; i < frames; i++) { e.hp = 50; e.x = Math.max(e.x, 200); step(s, IDLE); for (const b of s.bullets) if (b.own === "e" && !seen.has(b)) seen.set(b, { ...b }); }
  return [...seen.values()];
}

test("some ordinary enemies carry the same weapons in Space 3 and not in Space 2", () => {
  const fighters = watch("fighter");
  assert.ok(fighters.length >= 3, "fighters fire three needles at once");
  const bombers = watch("bomber", 18);
  assert.ok(bombers.some((b) => b.fuse > 0), "bombers throw explosive shells");
  const drones = watch("drone");
  assert.ok(drones.filter((b) => b.life <= 30 + 120).length >= 3, "drones breathe fire");
  const splitters = watch("splitter", 18, 120);
  assert.ok(splitters.some((b) => b.back !== undefined), "splitters throw blades");
  assert.equal(watch("drone", 10).length, 0, "Space 2's drones have no gun");
});
