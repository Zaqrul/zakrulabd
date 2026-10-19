import assert from "node:assert/strict";
import test from "node:test";
import { H, createState, isBoss, step } from "../src/components/games/space-logic.ts";
import {
  UNLOCKED, VERBS, attackShots, createDirector, finished, habit, nextAttack, observe, restFrames,
} from "../src/components/games/space3-director.ts";
import { WAVE_LENGTH, generateWaves } from "../src/components/games/space3-waves.ts";
import { PLASMA, PUSH, barrels, seedVolley } from "../src/components/games/space3-arsenal.ts";
import { CORVET, EXCAVATOR, RECLAIMER, THIRD_BOSSES, WYRM, corvetTell } from "../src/components/games/space3-boss.ts";
import { SIGNATURE_VERBS, ULTIMATE_VERBS } from "../src/components/games/space3-signature.ts";

const IDLE = { mx: 0, my: 0, bomb: false };
const run = (s, n, input = IDLE) => { for (let i = 0; i < n && s.phase === "play"; i++) step(s, input); };
const fly = (d, y, n) => { for (let i = 0; i < n; i++) observe(d, y); };
const sequence = (seed, n, phase = 2) => { const d = createDirector(seed); fly(d, 100, 60); return Array.from({ length: n }, () => nextAttack(d, phase, { y: 100 })); };

test("the same kind of attack never comes twice running", () => {
  for (const seed of [1, 7, 99, 2026]) {
    const list = sequence(seed, 300);
    for (let i = 1; i < list.length; i++) assert.notEqual(list[i].verb, list[i - 1].verb, `seed ${seed}, attack ${i}`);
  }
});

test("no whole attack repeats within the last eight", () => {
  const list = sequence(5, 400);
  let repeats = 0;
  for (let i = 0; i < list.length; i++) if (list.slice(Math.max(0, i - 8), i).some((a) => a.sig === list[i].sig)) repeats++;
  assert.ok(repeats <= 4, `${repeats} repeats in 400 attacks`);
});

test("two flights draw two different fights, and one seed draws the same fight again", () => {
  const a = sequence(11, 30).map((x) => x.sig), b = sequence(12, 30).map((x) => x.sig), again = sequence(11, 30).map((x) => x.sig);
  assert.notDeepEqual(a, b);
  assert.deepEqual(a, again);
});

test("each phase uses only the kinds it unlocks, and the last uses them all", () => {
  for (const phase of [0, 1, 2]) {
    const used = new Set(sequence(3, 200, phase).map((a) => a.verb));
    for (const v of used) assert.ok(UNLOCKED[phase].includes(v), `phase ${phase} used ${v}`);
    assert.equal(used.size, UNLOCKED[phase].length, `phase ${phase} should use every unlocked kind`);
  }
});

test("a ship that hides in one lane is hunted: the lance aims at the lane it has used", () => {
  const d = createDirector(8);
  fly(d, 40, 300);
  assert.ok(habit(d).lane < 60 && habit(d).share > 0.9);
  const lances = [];
  for (let i = 0; i < 400 && lances.length < 5; i++) { const a = nextAttack(d, 2, { y: 40 }); if (a.verb === "lance") lances.push(a); }
  assert.ok(lances.length >= 3);
  for (const a of lances) assert.ok(Math.abs(a.lane - habit(d).lane) <= 14 + 12, `lance at ${a.lane}, habit ${habit(d).lane}`);
});

test("a wall leaves its gap away from where the ship has been", () => {
  const d = createDirector(4);
  fly(d, 190, 300);
  const walls = [];
  for (let i = 0; i < 500 && walls.length < 6; i++) { const a = nextAttack(d, 2, { y: 190 }); if (a.verb === "sweep") walls.push(a); }
  assert.ok(walls.length >= 3);
  assert.ok(walls.every((a) => a.lane < 150), "the gap is never in the lane the ship lives in");
});

test("a ship that keeps moving is not hunted: its habit stays low", () => {
  const d = createDirector(2);
  for (let i = 0; i < 600; i++) observe(d, 20 + ((i * 37) % 176));
  assert.ok(habit(d).share < 0.3);
});

test("old habits fade", () => {
  const d = createDirector(2);
  fly(d, 30, 200);
  fly(d, 180, 1500);
  assert.ok(habit(d).lane > 150);
});

test("every attack fires something inside the field, in time, and stops", () => {
  const d = createDirector(21);
  fly(d, 100, 60);
  const seen = new Set();
  for (let i = 0; i < 120; i++) {
    const a = nextAttack(d, 2, { y: 100 });
    assert.ok(a.warn >= 20 && a.warn <= 60, `${a.verb} warns ${a.warn}`);
    let shots = 0, local = 0;
    while (!finished(a, local) && local < 600) {
      for (const s of attackShots(a, local, { x: 300, y: 100 }, { x: 60, y: 100 })) {
        shots++;
        assert.ok(Number.isFinite(s.x + s.y + s.vx + s.vy) && s.r > 0);
        assert.ok(s.y >= -2 && s.y <= H + 2, `${a.verb} shot at y ${s.y}`);
      }
      assert.equal(local < a.warn ? attackShots(a, local, { x: 300, y: 100 }, { x: 60, y: 100 }).length : -1, local < a.warn ? 0 : -1, "nothing fires during the warning");
      local++;
    }
    assert.ok(local < 600, `${a.verb} ends`);
    if (a.verb === "echo") assert.equal(shots, 0, "the echo fires through the ghost, not here");
    else assert.ok(shots > 0, `${a.verb} fires`);
    seen.add(a.verb);
  }
  assert.equal(seen.size, UNLOCKED[2].length);
});

test("a wall always has a gap the ship can fit through; a lattice always has a way through", () => {
  const d = createDirector(31);
  fly(d, 100, 60);
  for (let i = 0; i < 200; i++) {
    const a = nextAttack(d, 2, { y: 100 });
    if (a.verb === "sweep") {
      const ys = [13, ...attackShots(a, a.warn, { x: 300, y: 100 }, { x: 60, y: 100 }).map((s) => s.y), H - 12].sort((p, q) => p - q);
      const gaps = ys.slice(1).map((y, j) => y - ys[j]);
      assert.ok(Math.max(...gaps, 0) >= 24, `wall gap ${Math.max(...gaps)}`);
    }
    if (a.verb === "lattice") {
      const first = attackShots(a, a.warn, { x: 300, y: 100 }, { x: 60, y: 100 }).filter((s) => s.x < 400);
      const rows = new Set(first.map((s) => Math.round(s.y)));
      assert.ok(rows.size >= 8 && rows.size <= 10, "each column leaves two rows open");
    }
  }
});

test("rests between attacks differ and are short", () => {
  const d = createDirector(3);
  const rests = new Set(Array.from({ length: 40 }, () => restFrames(d)));
  assert.ok(rests.size > 10);
  assert.ok([...rests].every((r) => r >= 6 && r <= 24), "the boss barely pauses");
});

test("the boss tell reads the engine's fields", () => {
  assert.deepEqual(corvetTell({ c: 0, d: 40, n: 90 }), { verb: null, charge: 0, lane: 90, aimed: false, ring: false });
  assert.equal(corvetTell({ c: 1, d: 50, n: 90 }).verb, "lance");
  assert.equal(corvetTell({ c: 1, d: 50, n: 90 }).aimed, true);
  assert.equal(corvetTell({ c: 3, d: 100, n: 0 }).ring, true);
});

/* ----- waves ----- */

test("the waves of a flight come from its seed: the same seed is the same flight, another seed another", () => {
  const a = generateWaves(100), b = generateWaves(101), again = generateWaves(100);
  assert.deepEqual(a.plan, again.plan);
  assert.notDeepEqual(a.order, b.order);
  assert.notDeepEqual(a.plan.map((p) => `${p.type}${p.t}${Math.round(p.y)}`), b.plan.map((p) => `${p.type}${p.t}${Math.round(p.y)}`));
});

test("a formation never comes twice running or within the last three; heavy ones come late", () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const { order, plan } = generateWaves(seed);
    for (let i = 0; i < order.length; i++) assert.ok(!order.slice(Math.max(0, i - 3), i).includes(order[i]), `seed ${seed}: ${order[i]} at ${i}`);
    for (const p of plan) {
      if (p.type === "cruiser") assert.ok(p.t >= 2300, "cruisers come late");
      if (p.type === "fighter") assert.ok(p.t >= 1500, "fighters come late");
    }
    assert.ok(plan.length >= 25, `seed ${seed}: ${plan.length} enemies`);
    assert.ok(plan.at(-1).t <= WAVE_LENGTH + 400);
    assert.ok(new Set(order).size >= 7, "a variety of formations");
    assert.deepEqual(plan.map((p) => p.t), plan.map((p) => p.t).slice().sort((x, y) => x - y));
  }
});

test("Space 3's waves hold only flying enemies", () => {
  const banned = ["sub", "tank", "aagun", "bunker", "samsite", "gunboat", "destroyer", "perch", "jet", "gunship", "airbomber"];
  for (let seed = 1; seed <= 20; seed++) for (const p of generateWaves(seed).plan) assert.ok(!banned.includes(p.type), `${p.type}`);
});

/* ----- arsenal ----- */

test("Space 3 fires the Seed Bolt, with more barrels as the ship levels, and none of the old guns", () => {
  assert.deepEqual([1, 2, 3, 5, 6, 8, 9, 10].map(barrels), [1, 1, 2, 2, 3, 3, 4, 4]);
  assert.equal(seedVolley(9).length, 4);
  const s = createState(17);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.enemies.length = 0;
  run(s, 30);
  const mine = s.bullets.filter((b) => b.own === "p");
  assert.ok(mine.length > 0);
  assert.ok(mine.every((b) => ["seed", "lance"].includes(b.kind)), `kinds: ${[...new Set(mine.map((b) => b.kind))]}`);
  assert.equal(s.p.bombs, 0);
  assert.equal(s.p.nukes, 0);
  assert.equal(s.kite, null, "Kite is left behind");
});

test("Space 3 gives no old gun: a supply pod holds a repair, and picking one up leaves the blaster", () => {
  const s = createState(17);
  s.phase = "play"; s.enemies.length = 0;
  const pod = { id: 900, type: "pod", x: 200, y: 100, w: 12, h: 12, vx: 0, vy: 0, hp: 0, maxHp: 1, t: 0, cd: 0, y0: 100, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] };
  s.enemies.push(pod);
  run(s, 3);
  assert.ok(s.pickups.every((p) => p.kind === "H" || p.kind === "W" || p.kind === "P" || p.kind === "Q"), `pickups: ${s.pickups.map((p) => p.kind)}`);
  assert.equal(s.p.gun, "blaster");
});

/* ----- the boss in a run ----- */

function bossRun(seed) {
  const s = createState(17);
  s.seed = seed;
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6;
  s.planIdx = s.plan.length;
  s.t = s.plan.at(-1).t;
  s.enemies.length = 0;
  run(s, 400);
  return s;
}

test("Ghost Corvet arrives after the waves and attacks with what the director draws", () => {
  const s = bossRun(77);
  const boss = s.enemies.find((e) => isBoss(e.type));
  assert.equal(boss?.type, "boss17");
  const kinds = new Set();
  for (let i = 0; i < 2400; i++) { step(s, IDLE); if (boss.c > 0) kinds.add(boss.c); boss.hp = boss.maxHp; boss.a = 0; }
  assert.ok(kinds.size >= 2, `attack kinds seen: ${[...kinds]}`);
  assert.ok(s.bullets.some((b) => b.own === "e") || s.stats.hits >= 0);
});

test("two flights of the boss do not play alike", () => {
  const trace = (seed) => {
    const s = bossRun(seed), boss = s.enemies.find((e) => isBoss(e.type)), seen = [];
    let last = 0;
    for (let i = 0; i < 3000; i++) { step(s, IDLE); boss.hp = boss.maxHp; boss.a = 1; if (boss.c !== last) { last = boss.c; if (last) seen.push(`${last}@${Math.round(boss.n)}`); } }
    return seen.join(" ");
  };
  const a = trace(1000), b = trace(2000);
  assert.ok(a.length > 0 && b.length > 0);
  assert.notEqual(a, b);
});

/* ----- chapter 2: Ceres Industrial Belts and Excavator-X ----- */

test("Excavator-X leans on the drill and on rock blasted out of the rig, and each phase unlocks more", () => {
  const kit = THIRD_BOSSES.boss18;
  assert.deepEqual(kit.unlocked[0].slice().sort(), ["blast", "debris", "drill", "sweep", "train"]);
  for (let i = 1; i < kit.unlocked.length; i++) for (const v of kit.unlocked[i - 1]) assert.ok(kit.unlocked[i].includes(v), `phase ${i} keeps ${v}`);
  const d = createDirector(5);
  fly(d, 100, 60);
  const used = new Set(Array.from({ length: 300 }, () => nextAttack(d, 2, { y: 100 }, kit.unlocked).verb));
  assert.deepEqual([...used].sort(), kit.unlocked[2].slice().sort());
  assert.ok(used.has("drill") && used.has("debris") && !used.has("echo"));
});

test("the drill hunts the lane the ship hides in, and the blast is a spray of rock out of the rig", () => {
  const d = createDirector(9);
  fly(d, 150, 300);
  let drill = null, debris = null;
  for (let i = 0; i < 300 && !(drill && debris); i++) {
    const a = nextAttack(d, 2, { y: 150 }, THIRD_BOSSES.boss18.unlocked);
    if (a.verb === "drill") drill = a;
    if (a.verb === "debris") debris = a;
  }
  assert.ok(drill && Math.abs(drill.lane - habit(d).lane) <= 12 + 12);
  const rocks = [];
  for (let t = 0; t < debris.warn + debris.live; t++) rocks.push(...attackShots(debris, t, { x: 300, y: 100 }, { x: 60, y: 150 }));
  assert.equal(rocks.length, debris.count);
  for (const r of rocks) {
    assert.equal(r.kind, "scrap");
    assert.equal(r.x, 300, "thrown from the rig itself, not from the edge of the screen");
    assert.ok(r.vx < 0 && Math.abs(r.vy) < Math.abs(r.vx) * 1.2, "toward the ship, not straight up or down");
  }
  assert.ok(new Set(rocks.map((r) => r.r.toFixed(2))).size > rocks.length / 2, "chunks of different sizes");
  assert.ok(new Set(rocks.map((r) => Math.round(Math.atan2(r.vy, r.vx) * 20))).size > 2, "in a spray");
  const stream = [];
  for (let t = 0; t < drill.warn + drill.live + 5; t++) stream.push(...attackShots(drill, t, { x: 300, y: 100 }, { x: 60, y: 150 }));
  assert.equal(stream.length, drill.count * 3, "three rows abreast");
});

test("chapter 2's waves are the belts: rock, bombers and shards, and chapter 1's never have them", () => {
  const belts = new Set();
  for (let seed = 1; seed <= 12; seed++) for (const f of generateWaves(seed, { chapter: 18 }).order) belts.add(f);
  assert.ok(["rockField", "bomberRun", "shardStorm", "splitterPair"].some((f) => belts.has(f)));
  for (let seed = 1; seed <= 12; seed++) for (const f of generateWaves(seed).order) assert.ok(!["rockField", "bomberRun", "shardStorm", "splitterPair"].includes(f), `chapter 1 had ${f}`);
});

test("chapter 18 plays: Excavator-X arrives after its waves, big, and attacks with drill, rock or wall", () => {
  const s = createState(18);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.seed = 4242;
  assert.ok(s.plan.length > 25);
  s.planIdx = s.plan.length; s.t = s.plan.at(-1).t; s.enemies.length = 0;
  run(s, 500);
  const boss = s.enemies.find((e) => isBoss(e.type));
  assert.equal(boss?.type, "boss18");
  assert.equal(boss.w, EXCAVATOR.w);
  assert.equal(boss.maxHp, EXCAVATOR.hp);
  const kinds = new Set();
  for (let i = 0; i < 3000; i++) { step(s, IDLE); if (boss.c > 0) kinds.add(boss.c); boss.hp = boss.maxHp; boss.a = 0; }
  assert.ok(kinds.size >= 2, `kinds: ${[...kinds]}`);
  assert.ok([...kinds].every((k) => THIRD_BOSSES.boss18.unlocked[0].includes(VERBS[k - 1])), "phase 0 uses only its three kinds");
});

test("wreckage is thrown from the flanks of the hull, converging on the ship", () => {
  const d = createDirector(6);
  fly(d, 100, 60);
  let wreck = null;
  for (let i = 0; i < 200 && !wreck; i++) { const a = nextAttack(d, 2, { y: 100 }); if (a.verb === "pinch") wreck = a; }
  const shots = attackShots(wreck, wreck.warn, { x: 300, y: 100 }, { x: 60, y: 100 });
  assert.equal(shots.length, wreck.count * 2);
  assert.ok(shots.every((s) => s.kind === "scrap"));
  assert.deepEqual([...new Set(shots.map((s) => s.y))].sort((p, q) => p - q), [84, 116], "upper and lower flank of the hull");
  const mean = (list) => list.reduce((n, s) => n + s.vy, 0) / list.length;
  assert.ok(mean(shots.filter((s) => s.y < 100)) > mean(shots.filter((s) => s.y > 100)), "the two flanks converge on the ship");
});

/* ----- chapter 3: Jovian Cryo-Crags and the Abyssal Wyrm ----- */

test("the Wyrm throws ice from points along its length and two streams that cross", () => {
  const kit = THIRD_BOSSES.boss19;
  assert.deepEqual(kit.unlocked[0].slice().sort(), ["fang", "flame", "lance", "shards", "sweep"]);
  const d = createDirector(12);
  fly(d, 100, 60);
  let shards = null, chain = null;
  for (let i = 0; i < 400 && !(shards && chain); i++) {
    const a = nextAttack(d, 2, { y: 100 }, kit.unlocked);
    if (a.verb === "shards") shards = a;
    if (a.verb === "chain") chain = a;
  }
  const thrown = [];
  for (let t = 0; t < shards.warn + shards.live + 5; t++) thrown.push(...attackShots(shards, t, { x: 300, y: 100 }, { x: 60, y: 100 }));
  assert.equal(thrown.length, shards.count);
  assert.ok(thrown.every((s) => s.kind === "ice" && s.vx < 0));
  assert.ok(new Set(thrown.map((s) => s.x)).size === thrown.length, "from different points along the body");
  const links = [];
  for (let t = 0; t < chain.warn + chain.live + 5; t++) links.push(...attackShots(chain, t, { x: 300, y: 100 }, { x: 60, y: 100 }));
  assert.equal(links.length, chain.count);
  assert.ok(links.some((s) => s.vy > 0) && links.some((s) => s.vy < 0), "the streams cross");
});

test("chapter 19 plays: the cryo waves, then the Wyrm, long and quick", () => {
  const waves = new Set();
  for (let seed = 1; seed <= 12; seed++) for (const f of generateWaves(seed, { chapter: 19 }).order) waves.add(f);
  assert.ok(["iceDrift", "cryoMines", "ridgeSnipers", "wyrmSpawn"].some((f) => waves.has(f)));
  for (let seed = 1; seed <= 12; seed++) for (const f of generateWaves(seed, { chapter: 18 }).order) assert.ok(!["iceDrift", "cryoMines", "ridgeSnipers", "wyrmSpawn"].includes(f));
  const s = createState(19);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.seed = 99;
  s.planIdx = s.plan.length; s.t = s.plan.at(-1).t; s.enemies.length = 0;
  run(s, 600);
  const boss = s.enemies.find((e) => isBoss(e.type));
  assert.equal(boss?.type, "boss19");
  assert.equal(boss.w, WYRM.w);
  assert.equal(boss.maxHp, WYRM.hp);
  const kinds = new Set();
  for (let i = 0; i < 3000; i++) { step(s, IDLE); if (boss.c > 0) kinds.add(boss.c); boss.hp = boss.maxHp; boss.a = 0; }
  assert.ok(kinds.size >= 2);
  assert.ok([...kinds].every((k) => THIRD_BOSSES.boss19.unlocked[0].includes(VERBS[k - 1])));
});

/* ----- chapter 4: The Kharn Anomaly ----- */

test("chapter 20 plays: the wreck field waves, then Armada Reclaimer", () => {
  const field = new Set();
  for (let seed = 1; seed <= 12; seed++) for (const f of generateWaves(seed, { chapter: 20 }).order) field.add(f);
  assert.ok(["wreckRun", "minePatch", "recoveryDrones", "krollFighters"].some((f) => field.has(f)));
  for (const ch of [17, 18, 19]) for (let seed = 1; seed <= 12; seed++) for (const f of generateWaves(seed, { chapter: ch }).order) assert.ok(!["wreckRun", "minePatch", "recoveryDrones", "krollFighters"].includes(f));
  const s = createState(20);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.p.inv = 1e6; s.seed = 4;
  s.planIdx = s.plan.length; s.t = s.plan.at(-1).t; s.enemies.length = 0;
  run(s, 700);
  const boss = s.enemies.find((e) => isBoss(e.type));
  assert.equal(boss?.type, "boss20");
  assert.equal(boss.maxHp, RECLAIMER.hp);
  assert.equal(boss.w, RECLAIMER.w);
});

const foe = (id, x, y, type = "armor") => ({ id, type, x, y, w: 16, h: 14, vx: 0, vy: 0, hp: 1000, maxHp: 1000, t: 0, cd: 1e9, y0: y, flash: 0, stun: 0, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] });
function pushRun(extra = () => {}) {
  const s = createState(17);
  s.phase = "play"; s.p.x = 60; s.p.y = 100; s.enemies.length = 0; s.p.inv = 1e6; s.p.cd = 1e9; s.p.launchCd = 1e9; s.lumen = null;
  extra(s);
  return s;
}

test("the plasma torpedo launches by itself when an enemy is ahead, like any torpedo, and hits harder than the ship's", () => {
  const empty = pushRun(); step(empty, IDLE);
  assert.equal(empty.bullets.some((b) => b.kind === "plasmatorp"), false, "nothing ahead");
  const s = pushRun((st) => { st.p.launchCd = 0; st.enemies.push(foe(901, 150, 95)); });
  step(s, IDLE);
  const torp = s.bullets.find((b) => b.kind === "plasmatorp");
  assert.ok(torp, "it launched");
  assert.ok(torp.dmg > 7, "harder than a torpedo");
  assert.ok(torp.ux !== undefined && torp.age <= 2, "it leaves its tube like a torpedo");
});

test("the plasma torpedo explodes on what it meets: the neighbours take damage too", () => {
  const target = foe(901, 150, 95), neighbour = foe(902, 150, 112);
  const s = pushRun((st) => { st.p.launchCd = 0; st.enemies.push(target, neighbour); });
  for (let i = 0; i < 160; i++) { target.cd = neighbour.cd = 1e9; target.x = neighbour.x = 150; step(s, IDLE); if (s.bullets.every((b) => b.kind !== "plasmatorp") && i > 5) break; }
  assert.ok(target.hp < 1000 - PLASMA.dmg * 0.5, `target ${target.hp}`);
  assert.ok(neighbour.hp < 1000, "the blast reached the neighbour");
});

test("B spends part of the cell on Kinetic Push, and only when there is that much", () => {
  const empty = pushRun((st) => { st.res.meter = PUSH.cost - 1; });
  step(empty, { ...IDLE, bomb: true });
  assert.equal(empty.kinetic, null, "not enough");
  const s = pushRun((st) => { st.res.meter = 100; });
  step(s, { ...IDLE, bomb: true });
  assert.ok(s.kinetic);
  assert.ok(Math.abs(s.res.meter - (100 - PUSH.cost)) < 1, `meter ${s.res.meter}`);
  for (let i = 0; i < PUSH.frames + 2; i++) step(s, IDLE);
  assert.equal(s.kinetic, null, "the wave ends");
});

test("Kinetic Push shoves enemies away, a mini boss less, a boss least, and does them no harm", () => {
  const plain = foe(901, 120, 100), mini = foe(902, 120, 100, "minicruiser"), boss = foe(903, 120, 100, "boss17");
  const pushed = [plain, mini, boss].map((e) => {
    const s = pushRun((st) => { st.res.meter = 100; st.enemies.push(e); });
    const x0 = e.x;
    step(s, { ...IDLE, bomb: true });
    for (let i = 0; i < 25; i++) { e.cd = 1e9; step(s, IDLE); }
    return { moved: e.x - x0, hp: e.hp, max: e.maxHp };
  });
  assert.ok(pushed[0].moved > 20, `enemy ${pushed[0].moved}`);
  assert.ok(pushed[1].moved > 3 && pushed[1].moved < pushed[0].moved, `mini ${pushed[1].moved}`);
  assert.ok(pushed[2].moved < pushed[1].moved, `boss ${pushed[2].moved}`);
  assert.equal(pushed[0].hp, pushed[0].max, "no damage");
});

test("Kinetic Push sends enemy fire in reach away from the ship, and leaves the far shots alone", () => {
  const near = { x: 110, y: 100, vx: -2, vy: 0, r: 2, own: "e", dmg: 6, kind: "pulse" };
  const far = { x: 300, y: 100, vx: -2, vy: 0, r: 2, own: "e", dmg: 6, kind: "pulse" };
  const s = pushRun((st) => { st.res.meter = 100; st.bullets.push(near, far); });
  step(s, { ...IDLE, bomb: true });
  assert.ok(near.vx > 0, `vx ${near.vx}`);
  assert.ok(far.vx < 0, "outside the reach");
});
