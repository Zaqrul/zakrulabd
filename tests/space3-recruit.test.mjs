import assert from "node:assert/strict";
import test from "node:test";
import { createState, isBoss, shipSize, step } from "../src/components/games/space-logic.ts";
import { LUMEN, createLumen, stepLumen } from "../src/components/games/space3-recruit.ts";

const ship = { x: 60, y: 100 };
const foe = (x, y, w = 16, h = 12, hp = 5) => ({ x, y, w, h, hp });
const IDLE = { mx: 0, my: 0, bomb: false };
const settle = (l, foes, n) => { let last = []; for (let i = 0; i < n; i++) last = stepLumen(l, ship, foes); return last; };

test("Lumen flies on the ship's wing, below and behind it, when there is nothing to burn", () => {
  const l = createLumen({ x: 0, y: 0 });
  settle(l, [], 80);
  assert.ok(Math.abs(l.x - (ship.x + LUMEN.dx)) < 0.1 && Math.abs(l.y - (ship.y + LUMEN.dy)) < 0.1);
  assert.equal(l.firing, false);
  assert.equal(l.aim, null);
});

test("she slides to the nearest enemy ahead of her, and burns it once she is lined up", () => {
  const l = createLumen(ship);
  const near = foe(150, 40), far = foe(200, 190);
  settle(l, [near, far], 3);
  assert.equal(l.firing, false, "not lined up yet");
  settle(l, [near, far], 80);
  assert.ok(Math.abs(l.y - (near.y + near.h / 2)) <= near.h / 2 + LUMEN.half);
  assert.equal(l.firing, true);
  assert.deepEqual(stepLumen(l, ship, [near, far]), [near]);
});

test("the beam goes through everything in her lane, to its length and no farther, and not what is behind her", () => {
  const l = createLumen(ship);
  l.y = 50;
  const a = foe(100, 44), b = foe(180, 44), tooFar = foe(l.x + LUMEN.muzzle + LUMEN.reach + 40, 44), behind = foe(-30, 44, 20), other = foe(140, 120);
  const burned = settle(l, [a, b, tooFar, behind, other], 40);
  assert.ok(burned.includes(a) && burned.includes(b));
  assert.ok(!burned.includes(tooFar) && !burned.includes(behind) && !burned.includes(other));
});

test("she overheats after max frames of firing, goes cold for a while, and then burns again", () => {
  const l = createLumen(ship);
  const target = foe(120, 80, 20, 40, 1e9);
  settle(l, [target], 120);
  let firedFor = 0;
  while (l.hot === 0 && firedFor < LUMEN.max + 60) { if (stepLumen(l, ship, [target]).length) firedFor++; }
  assert.ok(l.hot > 0, "she overheated");
  assert.ok(firedFor <= LUMEN.max && firedFor >= LUMEN.max - 130, `after ${firedFor} frames of fire`);
  assert.deepEqual(stepLumen(l, ship, [target]), [], "a cold beam burns nothing");
  let cold = 0;
  while (l.hot > 0 && cold < LUMEN.cool + 5) { stepLumen(l, ship, [target]); cold++; }
  assert.ok(cold >= LUMEN.cool - 3 && cold <= LUMEN.cool, `cold for ${cold} frames`);
  assert.equal(l.heat, 0);
  stepLumen(l, ship, [target]);
  assert.equal(l.firing, true, "and she is firing again");
});

test("a beam that stops early lets her cool before she overheats", () => {
  const l = createLumen(ship);
  const target = foe(120, 80, 20, 40, 1e9);
  settle(l, [target], 100);
  const hot = l.heat;
  assert.ok(hot > 0);
  settle(l, [], 200);
  assert.equal(l.heat, 0);
  assert.equal(l.hot, 0);
});

test("a dead enemy is not a target", () => {
  const l = createLumen(ship);
  settle(l, [foe(120, 80, 20, 40, 0)], 60);
  assert.equal(l.aim, null);
});

/* ----- in a run ----- */

function air(chapter = 17) {
  const s = createState(chapter);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.enemies.length = 0; s.p.launchCd = 1e9;
  return s;
}
const dummy = (s, hp, y = 100, type = "armor") => {
  const e = { id: 900 + s.nextId++, type, x: 150, y, w: 16, h: 14, vx: 0, vy: 0, hp, maxHp: hp, t: 0, cd: 1e9, y0: y, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] };
  s.enemies.push(e);
  return e;
};

test("Lumen exists from chapter 17 on and not before, and Kite and the old arsenal stay behind", () => {
  for (const c of [1, 8, 9, 16]) assert.equal(createState(c).lumen, null, `chapter ${c}`);
  for (const c of [17, 18, 19]) assert.ok(createState(c).lumen, `chapter ${c}`);
  const s = createState(17);
  assert.equal(s.kite, null);
  assert.equal(s.p.bombs, 0);
});

test("in a run her beam burns an enemy in her reach and the ship's own gun is not what does it", () => {
  const s = air();
  const e = dummy(s, 1000, 60);
  s.p.cd = 1e9;
  for (let i = 0; i < 200; i++) { e.cd = 1e9; e.x = 150; step(s, IDLE); }
  assert.ok(e.hp < 1000, `hp ${e.hp}`);
  assert.ok(s.lumen.y < 100 + LUMEN.dy - 5, "she went up to it");
});

test("the beam hurts a boss a little less than anything else", () => {
  const damage = (type) => {
    const s = air();
    const e = dummy(s, 1e6, 100 + LUMEN.dy, type);
    s.p.cd = 1e9;
    s.lumen.y = e.y + e.h / 2;
    let frames = 0;
    for (let i = 0; i < 60; i++) { e.x = 150; e.hp = e.hp; step(s, IDLE); if (s.lumen.firing) frames++; }
    return (1e6 - e.hp) / Math.max(1, frames);
  };
  assert.ok(damage("boss17") < damage("armor"));
  assert.ok(isBoss("boss17"));
});

test("her ship is on the screen and the ship's own bullets are still only seed, lance and plasma torpedo", () => {
  const s = air();
  for (let i = 0; i < 300; i++) step(s, { mx: i % 120 < 60 ? 2 : -2, my: i % 90 < 45 ? 2 : -2, bomb: false });
  assert.ok(s.lumen.x > -20 && s.lumen.x < 400 && s.lumen.y > 0 && s.lumen.y < 216);
  assert.ok(s.bullets.filter((b) => b.own === "p").every((b) => ["seed", "lance", "plasmatorp"].includes(b.kind)));
  assert.ok(shipSize(s.p.level).w > 0);
});
