import assert from "node:assert/strict";
import test from "node:test";
import { GROUND, PH, WORLD, createState, respawn, respawnReady, step } from "../src/components/games/trap-logic.ts";

const idle = { left: false, right: false, jump: false };
const find = (s, id) => s.things.find((t) => t.id === id);
const tick = (s, frames, input = idle) => {
  for (let i = 0; i < frames; i++) step(s, input);
};

test("the opening spike gives a warning, kills once, then resets on a fast respawn", () => {
  const s = createState();
  s.p.x = 150;
  step(s, idle);
  assert.equal(find(s, "intro").warning, 10);
  assert.equal(find(s, "intro").deadly, false);
  tick(s, 10);
  assert.equal(find(s, "intro").deadly, true);
  for (let i = 0; i < 40 && s.phase === "playing"; i++) step(s, { ...idle, right: true });
  assert.equal(s.cause, "pop");
  assert.equal(s.deaths, 1);
  tick(s, 36);
  assert(respawnReady(s));
  assert.equal(s.deaths, 1);
  const death = s.lastDeath;
  respawn(s);
  assert.equal(s.p.x, 24);
  assert.equal(find(s, "intro").visible, false);
  assert.equal(s.f.intro, false);
  assert.deepEqual(s.lastDeath, death);
});

test("the bridge supports the player before cracking and collapsing", () => {
  const s = createState();
  s.p.x = 1110;
  step(s, idle);
  assert.equal(find(s, "fake").solid, true);
  assert.equal(find(s, "fake").warning, 14);
  tick(s, 13);
  assert.equal(find(s, "fake").solid, true);
  tick(s, 1);
  assert.equal(find(s, "fake").solid, false);
  for (let i = 0; i < 45 && s.phase === "playing"; i++) step(s, idle);
  assert.equal(s.cause, "fakefloor");
});

test("the low ceiling punishes jumping, but leaves a walking route underneath", () => {
  const s = createState();
  s.p.x = 1004;
  tick(s, 20);
  assert.equal(s.phase, "playing");
  assert.equal(find(s, "ceiling").deadly, true);
  s.p.y = 90;
  s.p.ground = false;
  step(s, idle);
  assert.equal(s.cause, "ceiling");
});

test("the sideways spike warns before launching and kills on contact", () => {
  const s = createState();
  s.walkers = [];
  s.p.x = 1801;
  step(s, idle);
  assert.equal(find(s, "dart").warning, 16);
  assert.equal(find(s, "dart").deadly, false);
  tick(s, 15);
  assert.equal(find(s, "dart").x, 1870);
  tick(s, 1);
  assert(find(s, "dart").x < 1870);
  assert.equal(find(s, "dart").deadly, true);
  for (let i = 0; i < 40 && s.phase === "playing"; i++) step(s, idle);
  assert.equal(s.cause, "dart");
});

test("the false goal becomes spikes while the real flag still ends the course", () => {
  const s = createState();
  s.walkers = [];
  s.p.x = 2070;
  step(s, idle);
  assert.equal(find(s, "fakeflag").kind, "fakeflag");
  tick(s, 14);
  assert.equal(find(s, "fakeflag").kind, "spike");
  assert.equal(find(s, "fakeflag").deadly, true);
  s.p.x = 2326;
  step(s, idle);
  assert.equal(s.phase, "won");
  assert.equal(s.furthestX, WORLD);
});

test("checkpoints require landing at the flag; respawn preserves progress and deaths", () => {
  const s = createState();
  s.p.x = 620;
  step(s, idle);
  assert.equal(s.checkpointX, 24);
  s.p.x = 598;
  s.p.y = 70;
  s.p.ground = false;
  step(s, idle);
  assert.equal(s.checkpointX, 24);
  s.p.y = GROUND - PH;
  s.p.vy = 0;
  step(s, idle);
  assert.equal(s.checkpointX, 614);
  s.deaths = 4;
  const progress = s.furthestX;
  respawn(s);
  assert.equal(s.p.x, 614);
  assert.equal(s.deaths, 4);
  assert.equal(s.furthestX, progress);
});

test("a jump pressed just before landing is buffered", () => {
  const s = createState();
  s.p.x = 50;
  s.p.y = GROUND - PH - 5;
  s.p.vy = 2;
  s.p.ground = false;
  step(s, { ...idle, jump: true });
  assert(s.p.jumpBuffer > 0);
  step(s, { ...idle, jump: true });
  assert(s.p.ground);
  step(s, { ...idle, jump: true });
  assert(s.p.vy < 0);
  assert.equal(s.p.ground, false);
});

// This replay uses only the same left/right/jump inputs as a human player.
// It does not disable collisions, move the character, or edit traps while running.
function completeCourse(s) {
  const jumps = [155, 491, 664, 873, 1075, 1273, 1673, 1810, 2080, 2177];
  const checkpoints = new Set();
  for (let i = 0; i < 2400 && s.phase === "playing"; i++) {
    const p = s.p;
    const waitForRain = s.f.rain > 0 && s.frame - s.f.rain < 86 && p.x < 1590;
    const jumpHere = jumps.some((x) => p.x >= x && p.x < x + 12)
      || s.walkers.some((w) => w.alive && w.x + 14 > p.x - 10 && w.x - p.x < 34);
    step(s, { left: false, right: !waitForRain, jump: p.ground ? !p.jumpHeld && jumpHere : true });
    checkpoints.add(s.checkpointX);
  }
  assert.equal(s.phase, "won", `Stopped at ${s.p.x.toFixed(1)}: ${s.cause}`);
  return checkpoints;
}

test("the entire course is beatable without dying and reaches all three checkpoints", () => {
  const s = createState();
  const checkpoints = completeCourse(s);
  assert.equal(s.deaths, 0);
  for (const x of [614, 1394, 1794]) assert(checkpoints.has(x));
});

for (const checkpoint of [614, 1394, 1794]) {
  test(`the course remains beatable after respawning at checkpoint ${checkpoint}`, () => {
    const s = createState();
    s.checkpointX = checkpoint;
    s.frame = 1300;
    s.deaths = 3;
    respawn(s);
    completeCourse(s);
    assert.equal(s.deaths, 3);
  });
}
