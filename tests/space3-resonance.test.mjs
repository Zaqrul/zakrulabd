import assert from "node:assert/strict";
import test from "node:test";
import {
  BARRIER, GHOST, OVERDRIVE, PHASE, RESONANCE, createResonance, damageScale, ghostPose, ghostShot, gain, grazeShots, hurt, phaseShift,
  phased, raiseBarrier, reflectShots, spend, startOverdrive, tickResonance,
} from "../src/components/games/space3-resonance.ts";

const ship = { x: 100, y: 100 };
const shot = (dx, dy = 0, r = 2, own = "e") => ({ x: ship.x + dx, y: ship.y + dy, vx: -2, vy: 0.5, r, own, dmg: 6 });
const frames = (r, n, pose = { ...ship, fire: false }) => { for (let i = 0; i < n; i++) tickResonance(r, pose); };

test("a shot that passes close without touching grazes once, and pays only once", () => {
  const r = createResonance(), s = shot(RESONANCE.hit + 2 + 4);
  assert.equal(grazeShots(r, ship, [s]), 1);
  assert.equal(r.meter, RESONANCE.graze);
  assert.equal(grazeShots(r, ship, [s]), 0, "the same shot pays once");
  assert.equal(r.meter, RESONANCE.graze);
});

test("a far shot, the ship's own shot, and a shot on the hurt circle pay nothing outside a phase", () => {
  const r = createResonance();
  assert.equal(grazeShots(r, ship, [shot(60), shot(RESONANCE.hit + 2 + 4, 0, 2, "p"), shot(1)]), 0);
  assert.equal(r.meter, 0);
});

test("Phase Shift is 12 frames of invulnerability, then a wait; a shot through the ship in it pays the larger sum", () => {
  const r = createResonance();
  assert.equal(phaseShift(r), true);
  assert.equal(phaseShift(r), false, "not while phasing");
  assert.equal(grazeShots(r, ship, [shot(1)]), 1);
  assert.equal(r.meter, RESONANCE.phaseGraze);
  assert.equal(hurt(r), false, "untouchable");
  frames(r, PHASE.frames);
  assert.equal(phased(r), false);
  assert.equal(phaseShift(r), false, "the wait is still running");
  frames(r, PHASE.cooldown);
  assert.equal(phaseShift(r), true);
});

test("a hit costs a share of the meter, never all of it", () => {
  const r = createResonance();
  gain(r, 50);
  assert.equal(hurt(r), true);
  assert.equal(r.meter, 50 * (1 - RESONANCE.hitLoss));
  assert.ok(r.meter > 0);
});

test("the barrier turns small enemy shots into the ship's and feeds the meter; big shots go through", () => {
  const r = createResonance(), small = shot(10, 0, 2), big = shot(10, 5, 6), far = shot(80, 0, 2);
  assert.equal(reflectShots(r, ship, [small]), 0, "no barrier, no reflection");
  assert.equal(raiseBarrier(r), true);
  assert.equal(reflectShots(r, ship, [small, big, far]), 1);
  assert.equal(small.own, "p");
  assert.equal(small.vx, 2);
  assert.equal(small.vy, -0.5);
  assert.equal(big.own, "e");
  assert.equal(far.own, "e");
  assert.equal(r.meter, BARRIER.gain);
  frames(r, BARRIER.frames);
  assert.equal(raiseBarrier(r), false, "recharging");
  frames(r, BARRIER.cooldown);
  assert.equal(raiseBarrier(r), true);
});

test("an idle meter leaks until it is earned again; a gain resets the wait", () => {
  const r = createResonance();
  gain(r, 40);
  frames(r, RESONANCE.idle);
  assert.equal(r.meter, 40);
  frames(r, 100);
  assert.ok(r.meter < 40);
  const before = r.meter;
  gain(r, 1);
  frames(r, RESONANCE.idle);
  assert.equal(r.meter, before + 1);
});

test("a full meter starts Overdrive, which hits harder and burns the meter to nothing", () => {
  const r = createResonance();
  gain(r, 99);
  assert.equal(startOverdrive(r), false);
  gain(r, 1);
  assert.equal(startOverdrive(r), true);
  assert.equal(damageScale(r), OVERDRIVE.scale);
  gain(r, 50);
  assert.equal(spend(r, 10), false, "nothing is spent while it burns");
  frames(r, OVERDRIVE.frames / 2);
  assert.ok(Math.abs(r.meter - RESONANCE.max / 2) < 1e-9);
  frames(r, OVERDRIVE.frames / 2);
  assert.equal(r.meter, 0);
  assert.equal(damageScale(r), 1);
});

test("a hit in Overdrive does not drain it", () => {
  const r = createResonance();
  gain(r, 100);
  startOverdrive(r);
  hurt(r);
  assert.equal(r.meter, RESONANCE.max);
});

test("spending takes exactly the cost and refuses when short", () => {
  const r = createResonance();
  gain(r, 30);
  assert.equal(spend(r, 40), false);
  assert.equal(r.meter, 30);
  assert.equal(spend(r, 25), true);
  assert.equal(r.meter, 5);
});

test("the ghost replays the ship's path 3 s late and fires when the ship fired", () => {
  const r = createResonance();
  assert.equal(ghostPose(r), null);
  for (let i = 0; i < GHOST.delay + 40; i++) tickResonance(r, { x: i, y: 50 + (i % 7), fire: i % 10 === 0 });
  const now = GHOST.delay + 40 - 1, then = now - GHOST.delay;
  assert.deepEqual(ghostPose(r), { x: then, y: 50 + (then % 7), fire: then % 10 === 0 });
  const g = ghostShot(r);
  assert.equal(g === null, then % 10 !== 0);
  assert.equal(r.trail.length, GHOST.delay + 1, "the record is as long as the delay and no longer");
  for (let i = 0; i < 20; i++) {
    tickResonance(r, { x: 0, y: 0, fire: true });
    if (ghostPose(r).fire) {
      const s = ghostShot(r);
      assert.equal(s.own, "e");
      assert.ok(s.vx < 0, "it fires back at the ship");
      return;
    }
  }
  assert.fail("the ghost never fired");
});

/* The economy: the meter has to fill often enough that its abilities are used. A first version earned 24 to 138 in a whole chapter
   and never reached the cost of Overdrive. */
test("a ship that simply weaves through chapter 17 earns enough Resonance to use the Lance several times", async () => {
  const { createState, step } = await import("../src/components/games/space-logic.ts");
  const { generateWaves } = await import("../src/components/games/space3-waves.ts");
  const { LANCE } = await import("../src/components/games/space3-arsenal.ts");
  let total = 0;
  for (const seed of [11, 12, 13]) {
    const s = createState(17);
    s.seed = seed; s.plan = generateWaves(seed).plan; s.phase = "play"; s.p.x = 60; s.p.y = 100;
    let last = 0;
    for (let i = 0; i < 4000 && s.phase === "play"; i++) {
      const m = s.res.meter;
      step(s, { mx: Math.cos(i / 90) * 1.5, my: Math.sin(i / 40) * 2.7, bomb: m >= LANCE.cost && i % 30 === 0 });
      const now = s.res.meter;
      if (now > last) total += now - last;
      last = now;
    }
  }
  assert.ok(total / 3 >= 150, `earned ${Math.round(total / 3)} on average`);
});
