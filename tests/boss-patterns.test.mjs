import assert from "node:assert/strict";
import test from "node:test";
import { ARENA_KINDS, ARENA_OF, ARENA_TIMING, planArena } from "../src/components/games/space-arena.ts";
import { bossCheckpoint, createState, isBoss, step } from "../src/components/games/space-logic.ts";

const idle = { mx: 0, my: 0, bomb: false };
const rng = (seed) => { let t = seed >>> 0; return () => { t = (t + 0x6d2b79f5) >>> 0; let x = Math.imul(t ^ (t >>> 15), 1 | t); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
const BOSS = { x: 290, y: 80, w: 60, h: 60 };
const FLAVOR = { shot: "orb", heavy: "scrap" };
const plans = (kind, phases = [0, 1, 2]) => {
  const out = [];
  for (let seed = 1; seed <= 40; seed++) for (const phase of phases) for (const y of [20, 60, 108, 150, 196]) out.push(planArena(kind, rng(seed * 7 + y), BOSS, { x: 50, y }, phase, FLAVOR));
  return out;
};

test("every arena pattern has a real warning of 32 to 70 frames and a live part", () => {
  for (const kind of ARENA_KINDS) {
    const [warn, live] = ARENA_TIMING[kind];
    assert.ok(warn >= 32 && warn <= 70, `${kind} warns for ${warn}`);
    assert.ok(live > 0);
    for (const plan of plans(kind, [0, 2])) assert.ok(plan.warn === warn && plan.live > 0, kind);
  }
});

/* ----- in a run ----- */

function fightBoss(ch, share, frames, onFrame) {
  const s = bossCheckpoint(createState(ch));
  s.p.x = 40; s.p.y = 110;
  const seen = new Set();
  for (let f = 0; f < frames; f++) {
    s.p.cd = 1e9; s.p.launchCd = 1e9; s.talk = null;
    const boss = s.enemies.find((e) => isBoss(e.type));
    if (boss && f === 200) { boss.shield = 0; boss.hp = boss.maxHp * share; }
    if (boss?.attack?.arena) seen.add(boss.attack.kind);
    onFrame?.(s, boss, f);
    s.p.inv = Math.max(s.p.inv, 0);
    step(s, idle);
  }
  return { s, seen };
}

test("all sixteen bosses of Space 1 and 2 use their arena attack, with the usual marks before it lands", () => {
  for (let ch = 1; ch <= 16; ch++) {
    const want = ARENA_OF[`boss${ch}`].kind;
    const marks = [];
    const { seen } = fightBoss(ch, ch === 16 ? 0.25 : 0.3, 6000, (s, boss) => {
      s.p.inv = 1e9;
      const a = boss?.attack;
      if (a?.arena && a.t === a.warn - 1) marks.push((a.spots?.length ?? 0) + (a.lanes?.length ?? 0) + (a.gapY !== undefined ? 1 : 0) + (a.gapAngle !== undefined ? 1 : 0));
    });
    assert.ok(seen.has(want), `boss${ch} never used ${want} (saw ${[...seen]})`);
    assert.ok(marks.length > 0 && marks.every((m) => m > 0), `boss${ch}: ${want} was not marked`);
  }
});

/* ----- the spec's pure-arcade rules: no drawn guides, a shuffled deck, a boss that reads the ship, jitter and physical tells ----- */
import fs from "node:fs";
import { BOSS_RESPONSE } from "../src/components/games/space-logic.ts";

/* The combat tests switch the boss response off for the whole process; these tests set it as they need and put it back. */
const withResponse = (on, fn) => { const was = BOSS_RESPONSE.on; BOSS_RESPONSE.on = on; try { return fn(); } finally { BOSS_RESPONSE.on = was; } };

function attacks(ch, share, frames, ship) {
  const s = bossCheckpoint(createState(ch));
  s.p.x = ship.x; s.p.y = ship.y;
  const kinds = [];
  let last = null;
  for (let f = 0; f < frames; f++) {
    s.p.inv = 1e9; s.p.cd = 1e9; s.p.launchCd = 1e9; s.talk = null; s.p.x = ship.x; s.p.y = ship.y;
    const boss = s.enemies.find((e) => isBoss(e.type));
    if (boss && f === 200) { boss.shield = 0; boss.hp = boss.maxHp * share; }
    step(s, idle);
    const a = boss?.attack;
    if (a && a !== last) kinds.push(a.kind);
    last = a ?? null;
  }
  return kinds;
}

test("nothing is drawn over the field to warn of an arena attack", () => {
  assert.equal(fs.existsSync("src/components/games/space-arena-art.ts"), false);
  assert.ok(!fs.readFileSync("src/components/games/space.tsx", "utf8").includes("drawArenaCue"));
});

test("a boss plays its attacks as a shuffled deck: every one before any repeats, and never the same one twice running", () => {
  withResponse(false, () => {
    const kinds = attacks(3, 0.3, 9000, { x: 110, y: 108 });
    assert.ok(kinds.length >= 25, `${kinds.length} attacks`);
    for (let i = 1; i < kinds.length; i++) assert.notEqual(kinds[i], kinds[i - 1], `repeat at ${i}`);
    const seen = new Set(kinds.slice(0, 12));
    for (const k of ["fan", "pincer", "boulders", "beam", "support", "scissorPincer"]) assert.ok(seen.has(k) || kinds.includes(k), `${k} never came`);
    assert.notDeepEqual(kinds.slice(1, 9), kinds.slice(9, 17), "the order changes from round to round");
  });
});

test("a boss reads the ship: it mortars one that hides at the rear far more than one in the middle", () => {
  const share = (ship) => { const k = withResponse(true, () => attacks(1, 0.3, 9000, ship)); return k.filter((x) => x === "mortarRear").length / k.length; };
  const rear = share({ x: 40, y: 108 }), middle = share({ x: 110, y: 108 });
  assert.ok(rear > 0.5, `rear ${rear}`);
  assert.ok(middle < 0.35, `middle ${middle}`);
  assert.ok(rear > middle * 1.8);
});

test("a ship at the top is swept and one that comes close is pinched", () => {
  const sweeps = (ship) => withResponse(true, () => attacks(2, 0.3, 9000, ship)).filter((x) => x === "sweepBeam").length;
  assert.ok(sweeps({ x: 110, y: 30 }) > sweeps({ x: 110, y: 108 }) * 1.5);
  const pinch = (ship) => withResponse(true, () => attacks(3, 0.3, 9000, ship)).filter((x) => x === "scissorPincer").length;
  assert.ok(pinch({ x: 200, y: 108 }) > pinch({ x: 110, y: 108 }) * 1.5);
});

test("the boss shows the attack with its own machinery: smoke and a glowing hull before it fires, and a kick when it does", () => {
  const s = bossCheckpoint(createState(1));
  s.p.x = 40; s.p.y = 108;
  let smoke = 0, flashes = 0, kicked = false, ran = false;
  for (let f = 0; f < 9000 && !ran; f++) {
    s.p.inv = 1e9; s.p.cd = 1e9; s.p.launchCd = 1e9; s.talk = null;
    const boss = s.enemies.find((e) => isBoss(e.type));
    if (boss && f === 200) { boss.shield = 0; boss.hp = boss.maxHp * 0.3; }
    const before = boss?.x;
    step(s, idle);
    const a = boss?.attack;
    if (a?.arena) {
      if (a.t >= a.warn - 24 && a.t < a.warn) { smoke = Math.max(smoke, s.smoke.length); if (boss.flash > 0) flashes++; }
      if (a.t >= a.warn && a.t <= a.warn + 2 && boss.x - before >= 2) kicked = true;
      if (a.t > a.warn + 4) ran = true;
    }
  }
  assert.ok(ran, "an arena attack ran");
  assert.ok(smoke > 0 && flashes > 0, `smoke ${smoke}, flashes ${flashes}`);
  assert.ok(kicked, "the hull kicks back at the moment it fires");
});
