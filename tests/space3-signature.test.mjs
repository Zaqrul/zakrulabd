import assert from "node:assert/strict";
import test from "node:test";
import { H, createState, isBoss, step } from "../src/components/games/space-logic.ts";
import { VERBS, attackShots, createDirector, finished, nextAttack, observe } from "../src/components/games/space3-director.ts";
import { SIGNATURE_VERBS, ULTIMATE_VERBS, sample } from "../src/components/games/space3-signature.ts";
import { THIRD_BOSSES } from "../src/components/games/space3-boss.ts";

const IDLE = { mx: 0, my: 0, bomb: false };
const boss = { x: 300, y: 100 };
const ship = { x: 60, y: 100 };
const trail = Array.from({ length: 181 }, (_, i) => ({ x: 60, y: 100 + Math.sin(i / 20) * 50, fire: false }));
const make = (verb, extra = {}) => {
  const d = createDirector(5);
  for (let i = 0; i < 60; i++) observe(d, 100);
  const unlocked = [[verb]];
  return nextAttack(d, 0, { ...ship, ...extra }, unlocked, { force: verb, ctx: { trail, vel: { vx: 0, vy: 2 } } });
};
const fire = (a, from = boss, to = ship) => {
  const shots = [];
  for (let t = 0; t < a.warn + a.live + 60; t++) for (const s of attackShots(a, t, from, to)) shots.push({ ...s, t });
  return shots;
};

test("every boss has a signature for each of its three phases and an ultimate, all its own", () => {
  const seen = new Set();
  for (const [id, kit] of Object.entries(THIRD_BOSSES)) {
    assert.equal(kit.signature.length, 3, id);
    assert.ok(ULTIMATE_VERBS.includes(kit.ultimate), id);
    assert.deepEqual(kit.ultimateAt, [0.25, 0.1]);
    for (const v of [...kit.signature, kit.ultimate]) { assert.ok(SIGNATURE_VERBS.includes(v), v); assert.ok(!seen.has(v), `${v} belongs to one boss`); seen.add(v); }
    kit.signature.forEach((v, phase) => assert.ok(kit.unlocked[phase].includes(v), `${id}: ${v} is in phase ${phase}'s pool`));
    assert.ok(!kit.unlocked.flat().includes(kit.ultimate), "the ultimate is never drawn at random");
  }
  assert.equal(seen.size, 16);
  assert.ok(SIGNATURE_VERBS.every((v) => VERBS.includes(v)));
});

test("scan: three arms wheel out of the hull, turning a little each step", () => {
  const a = make("scan");
  const shots = fire(a);
  assert.equal(shots.length, a.count * 3);
  const angles = shots.filter((s) => s.t === a.warn).map((s) => Math.atan2(s.vy, s.vx));
  assert.equal(angles.length, 3);
  const next = shots.filter((s) => s.t === a.warn + 2).map((s) => Math.atan2(s.vy, s.vx));
  assert.ok(Math.abs(next[0] - angles[0]) > 0.1 && Math.abs(next[0] - angles[0]) < 0.6, "the arms turn");
  assert.ok(shots.every((s) => s.x === boss.x && s.y === boss.y));
});

test("playback: your own recent heights come back as a wall, in order", () => {
  const a = make("playback");
  assert.ok(a.path.length >= 8 && a.path.length <= 15);
  const shots = fire(a);
  assert.equal(shots.length, a.path.length);
  shots.forEach((s, i) => { assert.equal(Math.round(s.y), Math.round(Math.min(206, Math.max(10, a.path[i].y)))); assert.equal(s.x, 388); assert.ok(s.vx < 0 && s.vy === 0); });
  const mine = sample(trail, 6, 15, 100).map((p) => Math.round(p.y));
  assert.deepEqual(a.path.map((p) => Math.round(p.y)), mine, "the path is the ship's, oldest first");
});

test("playback with no record yet still fires something, at the ship's height", () => {
  const d = createDirector(2);
  const a = nextAttack(d, 1, ship, [["playback"]], { force: "playback" });
  assert.ok(a.path.length > 0 && a.path.every((p) => p.y === ship.y));
});

test("pincer: two rows start apart and close on the height the ship was at", () => {
  const a = make("pincer");
  const shots = fire(a);
  assert.equal(shots.length, a.count * 2);
  const upper = shots.filter((s) => s.y < a.lane), lower = shots.filter((s) => s.y > a.lane);
  assert.equal(upper.length, lower.length);
  assert.ok(upper.every((s) => s.vy > 0) && lower.every((s) => s.vy < 0), "they converge");
  assert.ok(shots.every((s) => Math.abs(s.vy) < Math.abs(s.vx) * 0.5), "slowly, mostly along");
});

test("recall: the whole of the last three seconds comes back, then a ring", () => {
  const a = make("recall");
  assert.ok(a.warn >= 100, "a long warning");
  assert.ok(a.path.length >= 30);
  const shots = fire(a);
  const wall = shots.filter((s) => s.x === 388), rim = shots.filter((s) => s.x === boss.x);
  assert.equal(wall.length, a.path.length);
  assert.equal(rim.length, a.count);
  assert.ok(rim.every((s) => s.t === a.warn + a.path.length * 3 + 10), "the ring closes it");
});

test("train: a freight of ore down the lane, one cart after another", () => {
  const d = createDirector(8);
  for (let i = 0; i < 300; i++) observe(d, 150);
  const a = nextAttack(d, 0, ship, [["train"]], { force: "train" });
  assert.ok(Math.abs(a.lane - 150) < 20);
  const shots = fire(a);
  const carts = shots.filter((s) => s.r > 4);
  assert.equal(carts.length, a.count);
  assert.ok(carts.every((s) => s.y === a.lane && s.kind === "scrap"));
  assert.ok(new Set(carts.map((s) => s.t)).size === carts.length, "one after another");
});

test("charge: heavy charges that burst into rings before they reach the ship", () => {
  const a = make("charge");
  const shots = fire(a);
  assert.equal(shots.length, a.count);
  for (const s of shots) {
    assert.ok(s.fuse >= 30 && s.fuse <= 90 && s.split === 10 && s.splitKind === "scrap");
    const reach = (s.fuse * Math.hypot(s.vx, s.vy));
    assert.ok(reach < Math.hypot(boss.x - ship.x, boss.y - ship.y), "they burst short of the ship");
  }
});

test("quake: rings of rock, all but closed, one after another", () => {
  const a = make("quake");
  const shots = fire(a);
  const rings = [0, 1, 2].map((i) => shots.filter((s) => s.t === a.warn + i * 18));
  assert.ok(rings.every((r) => r.length >= a.count - 1), "no wide way through");
  const missing = (r) => { const angles = r.map((s) => Math.atan2(s.vy, s.vx)); let best = 0, at = 0; const sorted = angles.slice().sort((x, y) => x - y); for (let i = 0; i < sorted.length; i++) { const next = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + Math.PI * 2; if (next - sorted[i] > best) { best = next - sorted[i]; at = sorted[i] + best / 2; } } return at; };
  void missing;
});

test("breach: four rings at four speeds, each gap turned further, and a drill stream", () => {
  const a = make("breach");
  assert.ok(a.warn >= 100);
  const shots = fire(a);
  const speeds = [0, 1, 2, 3].map((i) => { const r = shots.filter((s) => s.t === a.warn + i * 22 && s.r > 3); return Math.hypot(r[0].vx, r[0].vy); });
  assert.ok(speeds.every((v, i) => i === 0 || v > speeds[i - 1]), `speeds ${speeds}`);
  assert.equal(shots.filter((s) => s.vx === -3.4).length, 12, "the drill stream");
});

test("fang: aimed where the ship is going, not where it is", () => {
  const a = make("fang");
  assert.deepEqual(a.lead, { vx: 0, vy: 2 });
  const shots = fire(a);
  assert.equal(shots.length, 9);
  const still = nextAttack(createDirector(5), 0, ship, [["fang"]], { force: "fang", ctx: { vel: { vx: 0, vy: 0 } } });
  const aimAt = (att) => { const s = fire(att).filter((x) => x.t === att.warn)[1]; return s.vy / Math.abs(s.vx); };
  assert.ok(aimAt(a) > aimAt(still), "a ship drifting down is led downward");
});

test("snap: an arc of ice in front of the ship, every shot closing on it, with one gap and none off the screen", () => {
  for (let seed = 1; seed < 15; seed++) {
    const d = createDirector(seed);
    const at = { x: 60, y: seed % 2 ? 20 : 190 };
    const a = nextAttack(d, 0, at, [["snap"]], { force: "snap" });
    const shots = attackShots(a, a.warn, boss, at);
    assert.ok(shots.length > 0 && shots.length < a.count);
    for (const s of shots) {
      assert.ok(s.y >= 6 && s.y <= H - 6 && s.x <= 384, `starts at ${s.x}, ${s.y}`);
      const toward = (at.x - s.x) * s.vx + (at.y - s.y) * s.vy;
      assert.ok(toward > 0, "closing on the ship");
    }
  }
});

test("surge: two closing jaws, then a coil", () => {
  const a = make("surge");
  assert.ok(a.warn >= 100);
  const shots = fire(a);
  const jaw1 = shots.filter((s) => s.t === a.warn), jaw2 = shots.filter((s) => s.t === a.warn + 40), wall = shots.filter((s) => s.t >= a.warn + 70);
  assert.ok(jaw1.length > 0 && jaw2.length > 0 && wall.length > 40);
  assert.ok(jaw1.every((s) => s.kind === "ice") && wall.every((s) => s.x === 388));
});

test("an ultimate and a signature always finish and fire something finite inside the field", () => {
  for (const verb of SIGNATURE_VERBS) for (let seed = 1; seed < 8; seed++) {
    const d = createDirector(seed);
    for (let i = 0; i < 40; i++) observe(d, 60 + i);
    const a = nextAttack(d, 2, ship, [[verb]], { force: verb, ctx: { trail, vel: { vx: 1, vy: -1 } } });
    let local = 0, n = 0;
    while (!finished(a, local) && local < 900) { for (const s of attackShots(a, local, boss, ship)) { n++; assert.ok(Number.isFinite(s.x + s.y + s.vx + s.vy) && s.r > 0, verb); assert.ok(s.y >= -2 && s.y <= H + 2, `${verb} at y ${s.y}`); } local++; }
    assert.ok(local < 900 && n > 0, verb);
  }
});

/* ----- in a run ----- */

function bossRun(chapter, seed) {
  const s = createState(chapter);
  s.seed = seed;
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6;
  s.planIdx = s.plan.length; s.t = s.plan.at(-1).t; s.enemies.length = 0;
  for (let i = 0; i < 700 && !s.enemies.some((e) => isBoss(e.type)); i++) step(s, IDLE);
  const b = s.enemies.find((e) => isBoss(e.type));
  for (let i = 0; i < 200 && b.x > 330; i++) step(s, IDLE);
  return { s, b };
}

for (const [chapter, type] of [[17, "boss17"], [18, "boss18"], [19, "boss19"], [20, "boss20"]]) {
  test(`${type}: each phase opens with its signature, and the ultimate comes at 25% and 10% with a long warning`, () => {
    const { s, b } = bossRun(chapter, 31 * chapter);
    assert.equal(b.type, type);
    const kit = THIRD_BOSSES[type];
    const opened = [];
    const watch = () => {
      for (let i = 0; i < 900; i++) { step(s, IDLE); b.hp = Math.max(b.hp, 1); if (b.c > 0) { opened.push(VERBS[b.c - 1]); break; } }
    };
    b.hp = b.maxHp; watch();
    assert.equal(opened[0], kit.signature[0], "phase 0 opens with its signature");
    b.hp = b.maxHp * 0.6; for (let i = 0; i < 120; i++) step(s, IDLE);
    b.hp = b.maxHp * 0.6; opened.length = 0; watch();
    assert.equal(b.a, 1);
    b.hp = b.maxHp * 0.3; for (let i = 0; i < 120; i++) step(s, IDLE);
    b.hp = b.maxHp * 0.3; opened.length = 0; watch();
    assert.equal(b.a, 2);
    assert.ok(kit.signature.every((v) => SIGNATURE_VERBS.includes(v)));
    // the ultimate
    let ults = 0, last = 0;
    b.hp = b.maxHp * 0.24;
    for (let i = 0; i < 400; i++) { step(s, IDLE); b.hp = Math.max(b.hp, b.maxHp * 0.09); if (b.c === VERBS.indexOf(kit.ultimate) + 1 && last !== b.c) ults++; last = b.c; }
    assert.ok(ults >= 1, "the first ultimate");
    b.hp = b.maxHp * 0.08;
    for (let i = 0; i < 400; i++) { step(s, IDLE); b.hp = Math.max(b.hp, 1); if (b.c === VERBS.indexOf(kit.ultimate) + 1 && last !== b.c) ults++; last = b.c; }
    assert.ok(ults >= 2, "and the second");
  });
}

/* ----- Armada Reclaimer ----- */

test("salvo: old missiles gather by the hull, hang, and then all go for the ship", () => {
  const a = make("salvo");
  const shots = fire(a);
  assert.equal(shots.length, a.count);
  for (const s of shots) {
    assert.equal(s.vx, 0); assert.equal(s.vy, 0);
    assert.ok(s.hold >= 40, "they hang first");
    assert.ok(s.hvx < 0 && Math.abs(s.hvy) <= Math.abs(s.hvx) * 1.2, "then fly mostly along, at the ship");
    assert.ok(s.x > boss.x - 12 && s.x < boss.x + 30, "gathered by the hull");
  }
  assert.ok(new Set(shots.map((s) => s.t)).size === shots.length, "one after another");
});

test("minefield: still mines scattered across the field, never on the ship, each bursting into a ring", () => {
  for (let seed = 1; seed < 12; seed++) {
    const d = createDirector(seed);
    for (let i = 0; i < 40; i++) observe(d, 100);
    const a = nextAttack(d, 1, ship, [["minefield"]], { force: "minefield" });
    const shots = attackShots(a, a.warn, boss, ship);
    assert.equal(shots.length, a.count);
    for (const s of shots) {
      assert.equal(s.vx, 0); assert.equal(s.vy, 0);
      assert.ok(s.fuse >= 60 && s.split === 8);
      assert.ok(Math.hypot(s.x - ship.x, s.y - ship.y) >= 50, "not on top of the ship");
      assert.ok(s.x > 100 && s.y > 10 && s.y < H - 10);
    }
  }
});

test("broadside: cannon fire at all six heights, three times, nothing left clear", () => {
  const a = make("broadside");
  const shots = fire(a);
  assert.equal(shots.length, 6 * 3);
  const rows = new Set(shots.map((s) => s.y));
  assert.equal(rows.size, 6);
  assert.ok(shots.every((s) => s.vx < 0 && s.vy === 0));
});

test("armada: a salvo, mines, a broadside and a ring, one after another, after a long warning", () => {
  const a = make("armada");
  assert.ok(a.warn >= 100);
  const shots = fire(a);
  assert.ok(shots.filter((s) => s.hold).length === a.count, "the salvo");
  assert.ok(shots.filter((s) => s.fuse).length === 6, "the mines");
  assert.ok(shots.filter((s) => s.t >= a.warn + 100 && s.vx < 0 && s.vy === 0 && s.x === boss.x - 6).length === 18, "the broadside");
  const ringAt = shots.filter((s) => s.t === a.warn + 150);
  assert.ok(ringAt.length >= 44, "two rings, all but closed");
});

test("Reclaimer's kit: signatures salvo, minefield and broadside, ultimate armada", () => {
  const kit = THIRD_BOSSES.boss20;
  assert.deepEqual(kit.signature, ["salvo", "minefield", "broadside"]);
  assert.equal(kit.ultimate, "armada");
  assert.ok(ULTIMATE_VERBS.includes("armada"));
});
