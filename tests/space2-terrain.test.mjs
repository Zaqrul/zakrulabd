import assert from "node:assert/strict";
import test from "node:test";
import { SHIELD, TERRAIN, TERRAIN_CALL, createState, inFog, maxLife, maxShield, step } from "../src/components/games/space-logic.ts";

const idle = { mx: 0, my: 0, bomb: false };

/* A quiet Space 2 place: no script, a sleeping boss far off, the ship mid-screen and holding fire. */
function place(n) {
  const s = createState(n + 8);
  s.phase = "play";
  s.planIdx = 9999;
  s.pickupIdx = 999;
  s.kite = null;
  s.p.inv = 1e9;
  s.p.cd = 1e9;
  s.p.launchCd = 1e9;
  s.p.x = 60;
  s.p.y = 90;
  const far = { id: 900, type: "boss1", x: 500, y: 60, w: 64, h: 60, vx: 0, vy: 0, hp: 1e9, maxHp: 1e9, t: 0, cd: 1e9, y0: 60, flash: 0, stun: 1e9, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] };
  s.enemies.push(far);
  s.bossId = far.id;
  return s;
}
const run = (s, n, input = idle) => {
  for (let i = 0; i < n; i++) step(s, input);
};

test("each place announces what it does to the ship", () => {
  for (let n = 1; n <= 8; n++) {
    const s = place(n);
    s.t = 0;
    run(s, 95);
    assert.equal(s.callout?.kind, TERRAIN_CALL[n - 1], `place ${n}`);
  }
});

test("Pacific: low over the water the spray slows the ship", () => {
  const high = place(1);
  run(high, 10, { mx: 2, my: 0, bomb: false });
  const low = place(1);
  low.p.y = 160;
  run(low, 10, { mx: 2, my: 0, bomb: false });
  assert.ok(Math.abs(low.p.x - 60 - (high.p.x - 60) * TERRAIN.spray.slow) < 1e-6);
});

test("monsoon pushes the ship down, the Himalayan wind pushes it back, turbulence moves it both ways", () => {
  const rain = place(2);
  run(rain, 20);
  assert.ok(Math.abs(rain.p.y - (90 + 20 * TERRAIN.rain.push)) < 1e-6);
  const wind = place(3);
  run(wind, 20);
  assert.ok(Math.abs(wind.p.x - (60 - 20 * TERRAIN.wind.push)) < 1e-6);
  const storm = place(7);
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    const [x, y] = [storm.p.x, storm.p.y];
    step(storm, idle);
    seen.add(`${Math.sign(storm.p.x - x)}${Math.sign(storm.p.y - y)}`);
  }
  assert.ok(seen.size >= 3, [...seen].join(" "));
});

test("Sahara sand slows the guns; polar cold slows the engines", () => {
  const sand = place(4);
  sand.p.cd = 8;
  run(sand, 8);
  assert.ok(sand.p.cd > 0, "still cycling");
  const cold = place(6);
  const warm = place(1);
  run(cold, 10, { mx: 2, my: 0, bomb: false });
  run(warm, 10, { mx: 2, my: 0, bomb: false });
  assert.ok(Math.abs(cold.p.x - 60 - (warm.p.x - 60) * TERRAIN.cold.slow) < 1e-6);
});

test("alpine fog bands scatter enemy aim at a ship inside them", () => {
  const s = place(5);
  const size = 18;
  s.p.y = TERRAIN.fog.bands[0] - size / 2;
  assert.ok(inFog(s) || inFog({ ...s, p: { ...s.p, y: TERRAIN.fog.bands[0] - 7 } }));
  s.p.y = 20;
  assert.ok(!inFog(s));
  assert.ok(!inFog(place(4)));
});

test("Citadel dawn recharges the shield; health and shield never grow past 100 and 50", () => {
  const s = place(8);
  s.p.shield = 10;
  run(s, 100);
  assert.ok(Math.abs(s.p.shield - (10 + 100 * TERRAIN.dawn.regen)) < 1e-6);
  const elsewhere = place(4);
  elsewhere.p.shield = 10;
  run(elsewhere, 100);
  assert.equal(elsewhere.p.shield, 10);
  for (const level of [1, 3, 5, 10]) {
    assert.equal(maxLife({ level }), 100);
    assert.equal(maxShield({ level }), 50);
  }
  assert.equal(SHIELD.base, 50);
});
