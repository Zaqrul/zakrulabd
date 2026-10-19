import assert from "node:assert/strict";
import test from "node:test";
import { createState, step } from "../src/components/games/space-logic.ts";
import { CELL, CHAIN, DASH, RESONANCE, chainMultiplier, createResonance, dashDirection, dashGraze, grazeShots, hurt, tickResonance } from "../src/components/games/space3-resonance.ts";
import { FOCUS, createLumen, stepLumen } from "../src/components/games/space3-recruit.ts";
import { MODE, seedVolley } from "../src/components/games/space3-arsenal.ts";
import { hintFor } from "../src/components/games/space3-hints-art.ts";

const IDLE = { mx: 0, my: 0, bomb: false };
const ship = { x: 100, y: 100 };
const shot = (dx, dy = 0, r = 2) => ({ x: ship.x + dx, y: ship.y + dy, vx: -2, vy: 0, r, own: "e", dmg: 6 });
function air() {
  const s = createState(17);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.enemies.length = 0; s.p.cd = 1e9;
  return s;
}

test("grazes in a chain are worth more each time, up to a cap, and a hit or a pause ends the chain", () => {
  const r = createResonance();
  const near = RESONANCE.hit + 2 + 4;
  grazeShots(r, ship, [shot(near)]);
  assert.equal(r.meter, RESONANCE.graze, "the first is worth the base");
  grazeShots(r, ship, [shot(near, 1)]);
  assert.ok(r.meter > RESONANCE.graze * 2, "the second is worth more");
  for (let i = 0; i < 20; i++) grazeShots(r, ship, [shot(near, i)]);
  assert.equal(chainMultiplier(r), CHAIN.max);
  hurt(r);
  assert.equal(r.chain, 0);
  r.chain = 3;
  for (let i = 0; i <= CHAIN.window; i++) tickResonance(r, { ...ship, fire: false });
  assert.equal(r.chain, 0, "the chain lapses");
});

test("a dash pays for every enemy shot along its path, once, and not for shots far from it", () => {
  const r = createResonance();
  const n = dashGraze(r, { x: 100, y: 100 }, { x: 140, y: 100 }, [shot(20, 4), shot(30, -3), shot(20, 60)]);
  assert.equal(n, 2);
  assert.equal(dashGraze(r, { x: 100, y: 100 }, { x: 140, y: 100 }, [shot(20, 4)]), 1, "a new shot pays");
  assert.equal(DASH.distance, 40);
  assert.deepEqual(dashDirection(0, 0), { x: 1, y: 0 });
  const d = dashDirection(0, -3);
  assert.ok(d.x === 0 && d.y === -1);
});

test("pod modes: wide adds barrels, pierce marks bolts and hits harder, rapid is faster in the engine", () => {
  const plain = seedVolley(2), wide = seedVolley(2, "wide"), pierce = seedVolley(2, "pierce");
  assert.ok(wide.length > plain.length);
  assert.ok(pierce.every((v) => v.pierce && v.dmg > plain[0].dmg));
  const run = (kind) => {
    const s = air();
    s.p.cd = 0;
    if (kind) s.mode = { kind, t: MODE.frames };
    let shots = 0;
    for (let i = 0; i < 120; i++) { const before = s.bullets.filter((b) => b.own === "p").length; step(s, { ...IDLE, fire: true }); shots += Math.max(0, s.bullets.filter((b) => b.own === "p").length - before); }
    return shots;
  };
  assert.ok(run("rapid") > run(null), "rapid fires more");
});

test("a Resonance cell fills the meter, a mode pickup sets the mode and the mode runs out", () => {
  const s = air();
  s.pickups.push({ x: s.p.x + 6, y: s.p.y + 6, kind: "Z", t: 0 }, { x: s.p.x + 6, y: s.p.y + 6, kind: "P", t: 0 });
  step(s, IDLE);
  assert.ok(s.res.meter >= CELL.gain - 1, `meter ${s.res.meter}`);
  assert.equal(s.mode?.kind, "pierce");
  for (let i = 0; i < MODE.frames + 2; i++) { s.enemies.length = 0; s.pickups.length = 0; step(s, IDLE); }
  assert.equal(s.mode, null);
});

test("the first chapter's three lessons come in order and then stop", () => {
  assert.match(hintFor(200), /KINETIC/);
  assert.match(hintFor(600), /KINETIC PUSH/);
  assert.match(hintFor(1000), /TORPEDO/);
  assert.equal(hintFor(50), null);
  assert.equal(hintFor(2000), null);
});
