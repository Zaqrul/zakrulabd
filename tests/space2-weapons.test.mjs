import assert from "node:assert/strict";
import test from "node:test";
import { BLOOM, GUNS, HYPER, MAX_LEVEL, ROCKET, XP, createState, domeCenter, isSecond, podMuzzle, step, xpGauge, xpOf } from "../src/components/games/space-logic.ts";

const idle = { mx: 0, my: 0, bomb: false };

/* A quiet moment in a chapter: no script, no boss coming, the ship safe. */
function arena(chapter = 9) {
  const s = createState(chapter);
  s.phase = "play";
  s.planIdx = 9999;
  s.pickupIdx = 999;
  s.p.x = 40;
  s.p.y = 100;
  s.p.inv = 1e6;
  s.p.launchCd = 1e6;
  /* Kite's own Bloom is tested on its own; keep it out of the way here. */
  s.coverCd = 1e9;
  /* A boss far off screen and asleep, so the chapter neither ends nor sends one. */
  const far = enemy(s, "boss1", 500, 60, { w: 64, h: 60, hp: 1e9, maxHp: 1e9, stun: 1e9 });
  s.bossId = far.id;
  return s;
}
let id = 1000;
function enemy(s, type, x, y, over = {}) {
  const e = { id: id++, type, x, y, w: 20, h: 14, vx: 0, vy: 0, hp: 6, maxHp: 6, t: 0, cd: 1e9, y0: y, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [], ...over };
  s.enemies.push(e);
  return e;
}
const shot = (s, x, y, vx = -1, over = {}) => s.bullets.push({ x, y, vx, vy: 0, r: 2.4, own: "e", dmg: 1, kind: "orb", ...over });
const run = (s, n) => {
  for (let i = 0; i < n; i++) step(s, idle);
};

test("only chapters above the first eight use the experience gauge", () => {
  assert.equal(isSecond(8), false);
  assert.equal(isSecond(9), true);
});

test("in Space 2 every kill fills the gauge, and a hundred points is a level", () => {
  const s = arena(9);
  assert.equal(s.p.level, 1);
  const e = enemy(s, "scout", 300, 40);
  e.hp = 0;
  step(s, idle);
  assert.equal(s.p.extra, xpOf("scout"));
  assert.ok(xpGauge(s.p) > 0 && xpGauge(s.p) < 1);

  s.p.extra = XP.perLevel - 1;
  const f = enemy(s, "scout", 300, 70);
  f.hp = 0;
  step(s, idle);
  assert.equal(s.p.level, 2);
  assert.ok(s.p.extra >= XP.perLevel);
  assert.ok(s.callout, "a level-up is announced");
});

test("the gauge climbs to the top level and stops there", () => {
  const s = arena(9);
  s.p.extra = XP.perLevel * 20;
  const e = enemy(s, "scout", 300, 40);
  e.hp = 0;
  step(s, idle);
  assert.equal(s.p.level, MAX_LEVEL);
  assert.equal(xpGauge(s.p), 1);
});

test("big enemies and bosses are worth far more than small ones", () => {
  assert.ok(xpOf("cruiser") > xpOf("scout") * 10);
  assert.ok(xpOf("boss8") >= XP.boss);
  assert.ok(xpOf("swarm") >= 1);
});

test("Space 1 fills the same experience gauge, a little faster a kill", () => {
  const s = createState(3);
  s.phase = "play";
  s.planIdx = 9999;
  s.pickupIdx = 999;
  s.bossId = 77;
  s.p.inv = 1e6;
  const e = enemy(s, "scout", 300, 40);
  e.hp = 0;
  step(s, idle);
  assert.equal(s.p.extra, xpOf("scout", false));
  assert.ok(xpOf("scout", false) >= xpOf("scout"));
  assert.equal(s.p.level, 1);
});

test("a mini rocket pack is four rockets, and it waits for something to shoot at", () => {
  const s = arena();
  s.p.gun = "minirocket";
  s.p.ammo = GUNS.minirocket.ammo;
  run(s, 3);
  assert.equal(s.bullets.filter((b) => b.kind === "minirocket").length, 0, "nothing in range, nothing fired");
  enemy(s, "gunner", 200, 96);
  step(s, idle);
  assert.equal(s.bullets.filter((b) => b.kind === "minirocket").length, ROCKET.count);
  assert.equal(s.p.ammo, GUNS.minirocket.ammo - 1);
});

test("a mini rocket shoots down an enemy shot, and goes with it", () => {
  const s = arena();
  s.p.gun = "minirocket";
  s.p.ammo = GUNS.minirocket.ammo;
  const m = podMuzzle(s.p);
  /* An enemy shot coming straight at the ship from a little way off. */
  shot(s, m.x + 80, m.y, -1.2);
  run(s, 60);
  assert.equal(s.bullets.filter((b) => b.own === "e").length, 0, "the shot was stopped");
  assert.equal(s.p.hp, s.p.hp, "nothing hurt the ship");
  assert.equal(s.stats.hits, 0);
});

test("with no shot to stop, rockets hit enemy ships; a boss barely feels them", () => {
  const s = arena();
  s.p.gun = "minirocket";
  s.p.ammo = GUNS.minirocket.ammo;
  const small = enemy(s, "gunner", 160, 96, { hp: 5, maxHp: 5 });
  run(s, 90);
  assert.ok(small.hp < 5 || !s.enemies.includes(small), "the rockets found it");

  const t = arena();
  t.p.gun = "minirocket";
  t.p.ammo = GUNS.minirocket.ammo;
  const boss = enemy(t, "boss1", 190, 70, { w: 64, h: 60, hp: 500, maxHp: 500, stun: 1e6 });
  t.bossId = boss.id;
  const u = arena();
  u.p.gun = "laser";
  u.p.ammo = 100;
  assert.ok(ROCKET.boss < 1);
  run(t, 90);
  assert.ok(boss.hp < 500);
  assert.ok(boss.hp > 500 - 40, "a boss takes only a scratch");
});

test("Bloom stays shut with no fire about, opens for it, swallows it, and drains while open", () => {
  const s = arena();
  s.p.bloom = BLOOM.energy;
  run(s, 20);
  assert.equal(s.p.dome, 0);
  assert.equal(s.p.bloom, BLOOM.energy);
  const c = domeCenter(s.p);
  shot(s, c.x + 40, c.y, -1);
  run(s, 40);
  assert.equal(s.bullets.filter((b) => b.own === "e" && b.x > 0).length, 0, "swallowed");
  assert.equal(s.stats.hits, 0);
  assert.ok(s.p.bloom < BLOOM.energy, "it cost energy to hold open");
});

test("Bloom does not stop blades, and it gives a little energy back for every shot", () => {
  const s = arena();
  s.p.bloom = 300;
  const c = domeCenter(s.p);
  s.bullets.push({ x: c.x + 20, y: c.y, vx: -1, vy: 0, r: 4, own: "e", dmg: 1, kind: "crescent" });
  shot(s, c.x + 30, c.y + 4, -1);
  run(s, 10);
  assert.ok(s.bullets.some((b) => b.kind === "crescent" && b.x > 0 || b.kind === "crescent"), "the blade is not swallowed");
  assert.ok(s.p.absorbed >= 1 || s.p.bloom !== 300);
});

test("having swallowed enough, Bloom sheds petals when it closes", () => {
  const s = arena();
  s.p.bloom = BLOOM.max;
  const c = domeCenter(s.p);
  for (let i = 0; i < BLOOM.burstAt + 2; i++) shot(s, c.x + BLOOM.radius - 9 + (i % 3) * 4, c.y + ((i % 5) - 2) * 3, -0.6);
  run(s, 4);
  assert.ok(s.p.absorbed >= BLOOM.burstAt, `absorbed ${s.p.absorbed}`);
  let petals = 0;
  for (let i = 0; i < 80; i++) {
    step(s, idle);
    petals = Math.max(petals, s.bullets.filter((b) => b.kind === "petal").length);
  }
  assert.equal(petals, 5);
});

test("without energy Bloom does nothing", () => {
  const s = arena();
  s.p.inv = 0;
  s.p.shield = 0;
  const c = domeCenter(s.p);
  shot(s, c.x + 20, c.y, -3);
  run(s, 20);
  assert.ok(s.p.hp < 100 || s.stats.hits > 0, "the shot landed");
});

test("the hyperbeam holds its fire for a tough target, then charges, fires once and spends one charge", () => {
  const s = arena();
  s.p.gun = "hyperbeam";
  s.p.ammo = GUNS.hyperbeam.ammo;
  enemy(s, "scout", 250, 96, { hp: 2, maxHp: 2 });
  run(s, 5);
  assert.equal(s.hyper, null, "not worth a charge");
  s.enemies = s.enemies.filter((e) => e.id === s.bossId);
  const big = enemy(s, "armor", 250, 96, { w: 32, h: 28, hp: 12, maxHp: 12 });
  step(s, idle);
  assert.ok(s.hyper, "charging");
  assert.equal(s.hyper.live, 0);
  const x0 = s.p.x;
  s.p.y = 100;
  run(s, HYPER.charge - 3);
  assert.equal(s.p.ammo, GUNS.hyperbeam.ammo, "nothing is spent until it fires");
  run(s, 6);
  assert.equal(s.p.ammo, GUNS.hyperbeam.ammo - 1);
  assert.ok(!s.enemies.includes(big), "the beam killed it");
  assert.ok(x0 === s.p.x);
});

test("the beam goes through everything in its lane, erases enemy shots there, and spares the rest", () => {
  const s = arena();
  s.p.gun = "hyperbeam";
  s.p.ammo = 3;
  const m = podMuzzle(s.p);
  const a = enemy(s, "armor", 200, m.y - 14, { w: 32, h: 28, hp: 40, maxHp: 40 });
  const b = enemy(s, "armor", 300, m.y - 14, { w: 32, h: 28, hp: 40, maxHp: 40 });
  const off = enemy(s, "armor", 250, 10, { w: 32, h: 28, hp: 40, maxHp: 40 });
  shot(s, 120, m.y, 0, { vx: 0 });
  shot(s, 120, 20, 0, { vx: 0 });
  run(s, HYPER.charge + 2);
  assert.ok(!s.enemies.includes(a) && !s.enemies.includes(b), "both in the lane died");
  assert.ok(s.enemies.includes(off), "the one off the lane did not");
  assert.equal(s.bullets.filter((q) => q.own === "e" && Math.abs(q.y - m.y) < 5).length, 0, "the shot in the lane is gone");
  assert.equal(s.bullets.filter((q) => q.own === "e" && q.y === 20).length, 1, "the other shot is not");
});

test("a boss is hurt by the hyperbeam, but nowhere near killed", () => {
  const s = arena();
  s.p.gun = "hyperbeam";
  s.p.ammo = 3;
  const boss = enemy(s, "boss1", 200, 70, { w: 64, h: 60, hp: 1000, maxHp: 1000, stun: 1e6 });
  s.bossId = boss.id;
  run(s, HYPER.charge + 3);
  assert.ok(boss.hp <= 1000 - HYPER.boss + 1);
  assert.ok(boss.hp > 500);
});

test("the ship is slow while it charges, and the last charge hands the gun back to the blaster", () => {
  const s = arena();
  s.p.gun = "hyperbeam";
  s.p.ammo = 1;
  enemy(s, "armor", 300, 90, { w: 32, h: 28, hp: 40, maxHp: 40 });
  step(s, idle);
  const y0 = s.p.y;
  step(s, { mx: 0, my: 2, bomb: false });
  const slow = s.p.y - y0;
  const t = arena();
  step(t, { mx: 0, my: 2, bomb: false });
  assert.ok(slow < (t.p.y - 100) * 0.75, `charging ${slow} against ${t.p.y - 100}`);
  run(s, HYPER.charge + HYPER.live + 5);
  step(s, idle);
  assert.equal(s.p.gun, "blaster");
});

test("a Space 2 supply pod can hold the new weapons, Space 1's cannot", () => {
  const seen = new Set();
  for (let k = 0; k < 300; k++) {
    const s = arena(9);
    s.seed = k * 7919 + 13;
    const pod = enemy(s, "pod", 300, 60);
    pod.hp = 0;
    step(s, idle);
    for (const p of s.pickups) seen.add(p.kind);
  }
  for (const k of ["N", "Y", "U"]) assert.ok(seen.has(k), `${k} never dropped`);
  const old = new Set();
  for (let k = 0; k < 300; k++) {
    const s = arena(3);
    s.seed = k * 7919 + 13;
    const pod = enemy(s, "pod", 300, 60);
    pod.hp = 0;
    step(s, idle);
    for (const p of s.pickups) old.add(p.kind);
  }
  for (const k of ["N", "Y", "U"]) assert.ok(!old.has(k), `${k} dropped in Space 1`);
});

test("picking up the crates equips the rocket and the hyperbeam, and Bloom fills its energy without changing the gun", () => {
  const take = (kind) => {
    const s = arena(9);
    s.pickups.push({ x: s.p.x + 8, y: s.p.y + 5, kind, t: 0 });
    step(s, idle);
    return s;
  };
  assert.equal(take("N").p.gun, "minirocket");
  assert.equal(take("Y").p.gun, "hyperbeam");
  const u = arena(9);
  u.p.gun = "laser";
  u.p.ammo = 50;
  u.pickups.push({ x: u.p.x + 8, y: u.p.y + 5, kind: "U", t: 0 });
  step(u, idle);
  assert.equal(u.p.gun, "laser");
  assert.equal(u.p.bloom, BLOOM.energy);
});

test("in Space 2 the ship's launchers fire deadly stingers that home, never torpedoes", async () => {
  const { PSTINGER, TWIN_AT } = await import("../src/components/games/space-logic.ts");
  const s = arena(9);
  s.p.level = 1;
  s.p.launchCd = 0;
  const target = enemy(s, "gunner", 260, 30, { hp: 40, maxHp: 40 });
  step(s, idle);
  const mine = s.bullets.filter((b) => b.own === "p" && b.kind === "stinger");
  assert.equal(mine.length, 1);
  assert.ok(!s.bullets.some((b) => b.kind === "torpedo"));
  const b = mine[0];
  for (let i = 0; i < 6; i++) step(s, idle);
  assert.ok(b.vy < 0, "it turns up toward the enemy above");
  const hp = target.hp;
  for (let i = 0; i < 80 && s.bullets.includes(b); i++) step(s, idle);
  assert.ok(target.hp < hp - PSTINGER.single.damage * 0.5, "and hits hard");

  const t = arena(9);
  t.p.level = TWIN_AT;
  t.p.launchCd = 0;
  enemy(t, "gunner", 260, 100);
  step(t, idle);
  assert.equal(t.bullets.filter((q) => q.own === "p" && q.kind === "stinger").length, 2, "two tubes from the twin upgrade");

  const one = createState(3);
  one.phase = "play";
  one.planIdx = 9999;
  one.p.level = 1;
  one.p.inv = 1e6;
  one.p.cd = 1e6;
  enemy(one, "gunner", 260, one.p.y + 2);
  const far = enemy(one, "boss1", 500, 60, { w: 64, h: 60, hp: 1e9, maxHp: 1e9, stun: 1e9 });
  one.bossId = far.id;
  for (let i = 0; i < 3; i++) step(one, idle);
  assert.ok(!one.bullets.some((q) => q.own === "p" && q.kind === "stinger"), "Space 1 keeps its torpedoes");
});
