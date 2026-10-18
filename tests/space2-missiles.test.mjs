import assert from "node:assert/strict";
import test from "node:test";
import { BLOOM, SEA_MISSILE, STINGER, WATER_Y, createState, domeCenter, step, STINGER_SHARE, isStingerVolley } from "../src/components/games/space-logic.ts";
import { SECOND_PLANS } from "../src/components/games/space2-plans.ts";

const idle = { mx: 0, my: 0, bomb: false };
let id = 5000;
const foe = (type, x, y, over = {}) => ({ id: id++, type, x, y, w: 26, h: 14, vx: 0, vy: 0, hp: 50, maxHp: 50, t: 0, cd: 1, y0: y, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [], ...over });

function quiet(ch) {
  const s = createState(ch);
  s.phase = "play";
  s.planIdx = 9999;
  s.pickupIdx = 999;
  s.p.x = 40;
  s.p.y = 100;
  s.p.inv = 1e9;
  s.p.cd = 1e9;
  s.p.launchCd = 1e9;
  const far = foe("boss1", 500, 60, { w: 64, h: 60, hp: 1e9, maxHp: 1e9, stun: 1e9, cd: 1e9 });
  s.enemies.push(far);
  s.bossId = far.id;
  return s;
}

test("Earth Force mixes stingers with torpedoes in Space 2, where Space 1's enemies fire only torpedoes", () => {
  let stingers = 0;
  for (let frame = 0; frame < 1000; frame++) if (isStingerVolley(frame, 260)) stingers += 1;
  assert.equal(stingers, 1000 * STINGER_SHARE / 5, "three volleys in five are stingers");
  const two = quiet(9);
  const boat = foe("gunboat", 260, WATER_Y - 14, { y0: WATER_Y - 14 });
  two.enemies.push(boat);
  const seen = new Set(), kinds = new Set();
  for (let i = 0; i < 1500; i++) {
    boat.x = 260; boat.hp = 1e9; two.p.inv = 1e9;
    step(two, idle);
    for (const b of two.bullets) if (b.own === "e" && !seen.has(b)) { seen.add(b); kinds.add(b.kind === "stinger" ? "stinger" : "torpedo"); }
  }
  assert.deepEqual([...kinds].sort(), ["stinger", "torpedo"], "both kinds come");

  const one = quiet(2);
  one.enemies.push(foe("gunboat", 260, WATER_Y - 14, { y0: WATER_Y - 14 }));
  for (let i = 0; i < 4; i++) step(one, idle);
  const shots1 = one.bullets.filter((b) => b.own === "e");
  assert.ok(shots1.length > 0 && shots1.every((b) => b.kind !== "stinger"));
});

test("a stinger picks up speed and steers after the ship only for its first moments", () => {
  const s = quiet(9);
  s.bullets.push({ x: 300, y: 40, vx: -STINGER.speed, vy: 0, r: 2.4, own: "e", dmg: 1, kind: "stinger", life: STINGER.life, home: STINGER.home });
  const b = s.bullets[0];
  step(s, idle);
  assert.ok(b.vy > 0, "it turns toward the ship below it");
  for (let i = 0; i < STINGER.home + 5; i++) step(s, idle);
  const dir = Math.atan2(b.vy, b.vx);
  s.p.y = 20;
  step(s, idle);
  assert.ok(Math.abs(Math.atan2(b.vy, b.vx) - dir) < 1e-9, "after that it flies straight");
  assert.ok(Math.hypot(b.vx, b.vy) > STINGER.speed, "faster than it left");
  assert.ok(Math.hypot(b.vx, b.vy) <= STINGER.top + 1e-9);
});

test("a submarine launches a sea missile that climbs, turns toward the ship, and bursts on its own", () => {
  const s = quiet(9);
  s.enemies.push(foe("sub", 250, WATER_Y - 3, { w: 40, h: 12, cd: 1, y0: WATER_Y - 3 }));
  step(s, idle);
  step(s, idle);
  const m = s.bullets.find((b) => b.kind === "seamissile");
  assert.ok(m, "it fired");
  assert.ok(m.vy < 0, "climbing out of the water");
  for (let i = 0; i < SEA_MISSILE.turnAt; i++) step(s, idle);
  assert.ok(m.vx < 0, "turned toward the ship");
  s.p.x = 10;
  s.p.y = 10;
  let burst = false;
  for (let i = 0; i < SEA_MISSILE.fuse + 5; i++) {
    step(s, idle);
    if (!s.bullets.includes(m)) {
      burst = true;
      break;
    }
  }
  assert.ok(burst, "it went off");
  assert.ok(s.bullets.filter((b) => b.kind === "needle").length >= SEA_MISSILE.split - 1, "in a ring of shards");
});

test("a sea missile that comes close to the ship goes off at once", () => {
  const s = quiet(9);
  const size = 18;
  s.bullets.push({ x: s.p.x + size + 10, y: s.p.y + 5, vx: -0.5, vy: 0, r: 3, own: "e", dmg: 1, kind: "seamissile", fuse: 80, split: 6, splitKind: "needle" });
  step(s, idle);
  step(s, idle);
  assert.equal(s.bullets.filter((b) => b.kind === "seamissile").length, 0);
});

test("the water chapters have submarines, and Bloom swallows stingers but not sea missiles", () => {
  for (const i of [0, 1, 5, 6]) assert.ok(SECOND_PLANS[i].filter((p) => p.type === "sub").length >= 4, `chapter ${i + 1}`);
  const s = quiet(9);
  s.p.bloom = BLOOM.energy;
  const c = domeCenter(s.p);
  s.bullets.push({ x: c.x + 30, y: c.y, vx: -1, vy: 0, r: 2.4, own: "e", dmg: 1, kind: "stinger", life: 100 });
  s.bullets.push({ x: c.x + 30, y: c.y + 6, vx: -1, vy: 0, r: 3, own: "e", dmg: 1, kind: "seamissile", fuse: 200, split: 6 });
  for (let i = 0; i < 12; i++) step(s, idle);
  assert.equal(s.bullets.filter((b) => b.kind === "stinger").length, 0, "the stinger was swallowed");
  assert.ok(s.p.absorbed >= 1);
});
