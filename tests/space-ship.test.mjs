import assert from "node:assert/strict";
import test from "node:test";
import { GUNPOD, H, LAUNCH_END, PLAYER_H, PLAYER_W, createState, podMuzzle, shipScale, shipSize, step } from "../src/components/games/space-logic.ts";

const idle = { mx: 0, my: 0, bomb: false };
const near = (a, b) => assert(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

function flight(level = 1) {
  const s = createState(1, 0, 1, level);
  for (let i = 0; i < LAUNCH_END; i++) step(s, idle);
  assert.equal(s.phase, "play");
  return s;
}

function targetAt(s, y) {
  return {
    id: 999, type: "rock", x: 200, y, w: 32, h: 32,
    vx: 0, vy: 0, hp: 1000, maxHp: 1000, t: 0, cd: 999,
    y0: y, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0,
    n: 0, rot: 0, guard: 0, parts: [],
  };
}

test("the launch still releases the ship into normal flight", () => {
  const s = flight();
  assert.equal(s.p.x, 36);
  assert.equal(s.p.y, H / 2);
  assert.equal(s.p.bombs, 2);
});

for (const level of [1, 2, 3]) {
  test(`the muzzle follows the banked gunpod at level ${level}`, () => {
    const p = { x: 40, y: 80, level, tilt: 0.26 };
    const k = shipScale(level);
    const flat = podMuzzle({ ...p, tilt: 0 });
    near(flat.x, p.x + (GUNPOD.x + GUNPOD.w + GUNPOD.barrel) * k);
    near(flat.y, p.y + (GUNPOD.y + GUNPOD.h / 2) * k);
    const center = { x: p.x + PLAYER_W * k / 2, y: p.y + PLAYER_H * k / 2 };
    const banked = podMuzzle(p);
    near(Math.hypot(banked.x - center.x, banked.y - center.y), Math.hypot(flat.x - center.x, flat.y - center.y));
    assert(banked.y > flat.y);
  });

  test(`the full silhouette stays inside the flight edges at level ${level}`, () => {
    const s = flight(level);
    step(s, { ...idle, mx: -1000, my: -1000 });
    const k = shipScale(level);
    assert(s.p.x - 6 * k >= 0);
    assert(s.p.y - 13 * k >= 0);
    step(s, { ...idle, my: 1000 });
    assert(s.p.y + 17 * k <= H);
  });
}

for (const gun of ["blaster", "machine", "spread", "laser", "torpedo"]) {
  test(`${gun} shots originate at the articulated pod without changing ammunition rules`, () => {
    const s = flight();
    s.p.gun = gun;
    s.p.ammo = 20;
    s.p.cd = 0;
    s.enemies = [targetAt(s, podMuzzle(s.p).y - 16)];
    step(s, { ...idle, my: 1.2 });
    const shot = s.bullets.find((b) => b.own === "p");
    assert(shot, "No projectile fired");
    const muzzle = podMuzzle(s.p);
    near(shot.x - shot.vx, muzzle.x);
    near(shot.y - shot.vy, muzzle.y + (gun === "machine" ? 2 : 0));
    assert.equal(s.p.ammo, gun === "blaster" ? 20 : 19);
  });
}

test("a special gun with nothing in range keeps its ammunition and the blaster stays off", () => {
  const s = flight();
  s.p.gun = "spread";
  s.p.ammo = 48;
  s.p.cd = 0;
  s.enemies = [targetAt(s, podMuzzle(s.p).y - 16)];
  s.enemies[0].x = 370;
  step(s, idle);
  assert(!s.bullets.some((b) => b.own === "p" && b.kind !== "torpedo"), "the pod fires nothing: the blaster is off while a weapon is equipped (the launcher is separate)");
  assert.equal(s.p.gun, "spread");
  assert.equal(s.p.ammo, 48);
});

test("empty gunpods still fall back to the unlimited blaster", () => {
  const s = flight();
  s.p.gun = "laser";
  s.p.ammo = 0;
  step(s, idle);
  assert.equal(s.p.gun, "blaster");
  assert(s.bullets.some((b) => b.own === "p" && b.kind === "pulse"));
});

test("decorative fins do not enlarge the player's collision body", () => {
  const s = flight();
  const hp = s.p.hp + s.p.shield;
  s.bullets.push({ x: s.p.x + 7, y: s.p.y - 7, vx: 0, vy: 0, r: 1, own: "e", dmg: 1, kind: "pulse" });
  step(s, idle);
  assert.equal(s.p.hp + s.p.shield, hp);
  near(shipSize(1).w, 18 * 0.85);
  near(shipSize(1).h, 10 * 0.85);
  s.bullets.push({ x: s.p.x + 9, y: s.p.y + 5, vx: 0, vy: 0, r: 1, own: "e", dmg: 1, kind: "pulse" });
  step(s, idle);
  assert.equal(s.p.hp + s.p.shield, hp - 20);
});
