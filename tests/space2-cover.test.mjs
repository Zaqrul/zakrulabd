import assert from "node:assert/strict";
import test from "node:test";
import { COVER2, createState, step } from "../src/components/games/space-logic.ts";

const idle = { mx: 0, my: 0, bomb: false };

/* Runs a chapter's script, the ship out of the way and holding fire, until a piece of cover is on screen. */
function toCover(ch, sea) {
  const s = createState(ch);
  s.phase = "play";
  s.p.x = 20;
  s.p.y = 20;
  for (let f = 0; f < 4000; f++) {
    s.p.inv = 1e9;
    s.p.cd = 1e9;
    s.p.launchCd = 1e9;
    s.talk = null;
    step(s, idle);
    const h = s.hazards.find((q) => q.kind === "cover" && q.g[4] === (sea ? 1 : 0) && q.x > 120 && q.x < 300 && q.g[2]);
    if (h) return { s, h, unit: s.enemies.find((e) => e.id === h.g[2]) };
  }
  throw new Error(`no cover in chapter ${ch}`);
}

test("in Space 2 ground units dig in behind a wall and ships sit behind a barrier; Space 1 has neither", () => {
  const land = toCover(12, false);
  assert.ok(["tank", "aagun", "bunker", "samsite"].includes(land.unit.type));
  assert.ok(land.h.x + land.h.w <= land.unit.x, "the wall stands in front of its unit");
  assert.ok(land.h.base < land.unit.y, "and is taller than it");
  const sea = toCover(9, true);
  assert.ok(["gunboat", "destroyer"].includes(sea.unit.type));
  assert.ok(sea.h.base < sea.unit.y);

  const one = createState(4);
  one.phase = "play";
  for (let f = 0; f < 2500; f++) {
    one.p.inv = 1e9;
    one.talk = null;
    step(one, idle);
  }
  assert.ok(!one.hazards.some((h) => h.kind === "cover"));
});

test("cover moves with its unit, stops the ship's shots, crumbles to a stump and is never destroyed", () => {
  const { s, h, unit } = toCover(12, false);
  step(s, idle);
  assert.equal(h.x, unit.x - h.g[3], "it keeps pace with its unit");
  const hp = unit.hp;
  const full = h.half;
  const bottom = h.base + h.half;
  for (let i = 0; i < COVER2.land.hp + 6; i++) {
    s.bullets.push({ x: h.x - 6, y: bottom - 2, vx: 6, vy: 0, r: 2, own: "p", dmg: 1, kind: "pulse" });
    step(s, idle);
    step(s, idle);
  }
  assert.equal(unit.hp, hp, "the unit behind it was not touched");
  assert.ok(s.hazards.includes(h), "never destroyed");
  assert.equal(h.g[0], 0);
  assert.ok(Math.abs(h.half - full * COVER2.stump) < 1e-9, "down to a stump");
  assert.ok(Math.abs(h.base + h.half - bottom) < 1e-9, "standing on the same ground");
  assert.ok(h.base > unit.y + 2, "the top of the unit is open now");
  s.bullets.push({ x: h.x - 6, y: unit.y + 3, vx: 6, vy: 0, r: 2, own: "p", dmg: 1, kind: "pulse" });
  for (let i = 0; i < 6; i++) step(s, idle);
  assert.ok(unit.hp < hp, "and a shot over the stump hits it");
});

test("enemy fire is not stopped by cover, and cover stays where it is once its unit is gone", () => {
  const { s, h, unit } = toCover(12, false);
  s.bullets.push({ x: h.x + h.w + 4, y: h.base + 3, vx: -3, vy: 0, r: 2, own: "e", dmg: 1, kind: "orb" });
  const shot = s.bullets[s.bullets.length - 1];
  for (let i = 0; i < 14; i++) step(s, idle);
  assert.ok(s.bullets.includes(shot) && shot.x < h.x, "it flew straight through");
  unit.hp = 0;
  step(s, idle);
  const x = h.x;
  step(s, idle);
  assert.equal(h.g[2], 0);
  assert.ok(Math.abs(h.x - (x - 1)) < 1e-9, "it drifts with the ground now");
});

test("some ground units stand on high ground; at sea every gun stands on an island and big rocks rise from the sea", async () => {
  const { GROUND_Y, WATER_Y, PERCH } = await import("../src/components/games/space-logic.ts");
  const { SECOND_PLANS } = await import("../src/components/games/space2-plans.ts");
  const s = createState(12);
  s.phase = "play";
  let up = 0;
  let flat = 0;
  for (let f = 0; f < 3200; f++) {
    s.p.inv = 1e9;
    s.p.cd = 1e9;
    s.p.launchCd = 1e9;
    s.talk = null;
    s.p.x = 20;
    s.p.y = 20;
    step(s, idle);
    for (const h of s.hazards) {
      if (h.kind !== "perch" || !h.g[0] || h.seen) continue;
      h.seen = true;
      const unit = s.enemies.find((e) => e.id === h.g[0]);
      assert.ok(Math.abs(unit.y + unit.h - h.base) < 1e-9, "the unit stands on top of it");
      assert.ok(h.base + h.half === GROUND_Y && h.base < GROUND_Y - PERCH.land[0] + 1);
      up += 1;
    }
    for (const e of s.enemies) if (e.y + e.h === GROUND_Y && !e.seen) {
      e.seen = true;
      flat += 1;
    }
  }
  assert.ok(up >= 2 && flat >= 2, `${up} up, ${flat} on the flat`);
  for (const i of [0, 1, 5, 6]) {
    assert.ok(SECOND_PLANS[i].filter((p) => p.type === "perch").length >= 4, `rocks in chapter ${i + 1}`);
    assert.ok(SECOND_PLANS[i].some((p) => p.type === "aagun"), `island guns in chapter ${i + 1}`);
  }
  const sea = createState(9);
  sea.phase = "play";
  let rock = false;
  for (let f = 0; f < 3000 && !rock; f++) {
    sea.p.inv = 1e9;
    sea.talk = null;
    step(sea, idle);
    rock = sea.hazards.some((h) => h.kind === "perch" && h.g[2] === 2 && h.base < WATER_Y);
  }
  assert.ok(rock || sea.hazards.some((h) => h.kind === "perch" && h.g[2] === 2 && h.base < WATER_Y), "a big rock");
});

test("high ground stops the ship's shots and moves with the unit on it", () => {
  const s = createState(12);
  s.phase = "play";
  let h;
  for (let f = 0; f < 4000 && !h; f++) {
    s.p.inv = 1e9;
    s.p.cd = 1e9;
    s.p.launchCd = 1e9;
    s.talk = null;
    s.p.x = 20;
    s.p.y = 20;
    step(s, idle);
    h = s.hazards.find((q) => q.kind === "perch" && q.g[0] && q.x > 140 && q.x < 300);
  }
  const unit = s.enemies.find((e) => e.id === h.g[0]);
  step(s, idle);
  assert.equal(h.x, unit.x - h.g[1]);
  const shot = { x: h.x - 4, y: h.base + h.half / 2, vx: 6, vy: 0, r: 2, own: "p", dmg: 1, kind: "pulse" };
  s.bullets.push(shot);
  step(s, idle);
  step(s, idle);
  assert.ok(!s.bullets.includes(shot) || shot.x > 384, "the rock took it");
});
