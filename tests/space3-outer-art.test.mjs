import assert from "node:assert/strict";
import test from "node:test";
import { createState, bossCheckpoint, step, beamMuzzle } from "../src/components/games/space-logic.ts";
import { ACT2_KITS, ACT2_MINI_KITS, ACT2_STAGES } from "../src/components/games/space3-act2.ts";
import { VERBS } from "../src/components/games/space3-director.ts";
import { drawOuterBoss, drawOuterBossLights } from "../src/components/games/space3-act2-boss-art.ts";
import { paintOuterMachine } from "../src/components/games/space3-outer-machine-art.ts";
import { drawHeraldEmitters } from "../src/components/games/space3-herald-art.ts";

const idle = { mx: 0, my: 0, bomb: false };
function clone(value) {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof WeakSet) return new WeakSet();
  if (value instanceof WeakMap) return new WeakMap();
  if (Array.isArray(value)) return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
}
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}
function context() {
  const trace = [];
  let depth = 0;
  const ctx = new Proxy({ globalAlpha: 1 }, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        for (const arg of args) if (typeof arg === "number") assert.ok(Number.isFinite(arg), `${String(key)}: finite geometry`);
        if (key === "save") depth++;
        if (key === "restore") { depth--; assert.ok(depth >= 0, "balanced canvas restore"); }
        if (key === "ellipse") assert.ok(args[2] > 0 && args[3] > 0, "positive ellipse radii");
        trace.push([key, ...args]);
        if (key === "measureText") return { width: args[0].length * 3 };
        if (key === "createLinearGradient") return { addColorStop(...stops) { trace.push(["addColorStop", ...stops]); } };
      };
    },
    set(target, key, value) { target[key] = value; trace.push([key, value && typeof value === "object" ? "gradient" : value]); return true; },
  });
  return { ctx, trace, depth: () => depth };
}

const specimens = [];
for (let chapter = 21; chapter <= 28; chapter++) {
  const bossState = bossCheckpoint(createState(chapter));
  // A fresh checkpoint has a fresh procedural plan: skip that actual plan completely.
  bossState.planIdx = bossState.plan.length;
  bossState.t = bossState.plan.at(-1).t;
  bossState.p.inv = 1e6;
  for (let i = 0; i < 250; i++) { bossState.talk = null; step(bossState, idle); }
  const boss = bossState.enemies.find(e => e.type === `boss${chapter}`);
  assert.ok(boss, `engine spawned boss ${chapter}`);
  specimens.push({ state: bossState, enemy: boss });
  const miniState = createState(chapter);
  miniState.phase = "play"; miniState.p.inv = 1e6;
  let mini;
  for (let i = 0; i < 18000 && !mini; i++) {
    miniState.p.inv = 1e6; miniState.talk = null; step(miniState, idle);
    mini = miniState.enemies.find(e => e.type === `mini${chapter}`);
  }
  assert.ok(mini, `engine spawned mini ${chapter}`);
  specimens.push({ state: miniState, enemy: mini });
}

function variant(specimen, ratio = 1) {
  const state = clone(specimen.state), enemy = state.enemies.find(e => e.id === specimen.enemy.id);
  enemy.hp = enemy.maxHp * ratio; enemy.flash = 0; enemy.c = 0; enemy.d = 0;
  enemy.a = ratio < .33 ? 2 : ratio < .66 ? 1 : 0;
  const stages = ACT2_STAGES[enemy.type];
  if (stages) {
    enemy.stage = ratio === 1 ? 0 : ratio > .33 ? Math.min(1, stages.length) : stages.length;
    enemy.mods = (stages[enemy.stage]?.mods ?? []).map((part, id) => ({ ...part, id, maxHp: part.hp, flash: 0 }));
  }
  return { state, enemy };
}

test("all sixteen engine-spawned outer machines render damage states without changing gameplay state", () => {
  for (const specimen of specimens) {
    const shapes = new Set();
    for (const ratio of [1, .6, .25]) {
      const { state, enemy } = variant(specimen, ratio), before = JSON.stringify(state), c = context();
      freeze(state);
      assert.equal(drawOuterBoss(c.ctx, enemy, state, true), true, enemy.type);
      assert.equal(JSON.stringify(state), before, enemy.type);
      assert.equal(c.depth(), 0, enemy.type);
      shapes.add(JSON.stringify(c.trace.filter(([method]) => ["moveTo", "lineTo", "ellipse", "fillRect"].includes(method))));
    }
    assert.ok(shapes.size >= 2, `${specimen.enemy.type}: damage changes geometry`);
  }
});

test("reduced motion freezes decoration while preserving hit and damage feedback", () => {
  for (const specimen of specimens) {
    const a = variant(specimen), b = variant(specimen), first = context(), later = context(), hit = context();
    a.enemy.t = 130; b.enemy.t = 517; a.state.frame = 130; b.state.frame = 517;
    drawOuterBoss(first.ctx, a.enemy, a.state, true);
    drawOuterBoss(later.ctx, b.enemy, b.state, true);
    assert.deepEqual(later.trace, first.trace, specimen.enemy.type);
    b.enemy.flash = 2;
    drawOuterBoss(hit.ctx, b.enemy, b.state, true);
    assert.notDeepEqual(hit.trace, first.trace, `${b.enemy.type}: hit remains visible`);
  }
});

test("every unlocked director warning still renders over the new body and modules", () => {
  let count = 0;
  for (const specimen of specimens) {
    const kit = ACT2_KITS[specimen.enemy.type] ?? ACT2_MINI_KITS[specimen.enemy.type];
    for (const verb of new Set(kit.unlocked.flat())) {
      const { state, enemy } = variant(specimen), c = context();
      enemy.c = VERBS.indexOf(verb) + 1; enemy.d = 80;
      assert.ok(enemy.c > 0, verb);
      freeze(state);
      assert.equal(drawOuterBoss(c.ctx, enemy, state, true), true);
      assert.equal(c.depth(), 0);
      count++;
    }
  }
  assert.ok(count > 100, "covers the actual boss and mini-boss attack rosters");
});

test("Void lights stay above darkness only for the Void machines; earlier campaigns fall through", () => {
  for (const chapter of [1, 8, 9, 16, 17, 20]) {
    const state = createState(chapter), c = context();
    assert.equal(drawOuterBoss(c.ctx, { type: `boss${chapter}` }, state, true), false);
    drawOuterBossLights(c.ctx, state, true);
    assert.equal(c.trace.length, 0, `chapter ${chapter} is untouched`);
  }
  for (const specimen of specimens.filter(s => s.state.chapter === 25)) {
    const { state, enemy } = variant(specimen), c = context();
    state.enemies = [enemy]; freeze(state);
    drawOuterBossLights(c.ctx, state, true);
    assert.ok(c.trace.some(([method, colour]) => method === "strokeStyle" && colour === "#f472b6"), enemy.type);
    assert.equal(c.depth(), 0);
  }
});

test("Herald poses follow charge and live attacks while reduced motion freezes decoration", () => {
  const specimen = specimens.find(s => s.enemy.type === "boss28");
  for (const ratio of [1, .6, .25]) {
    const { enemy } = variant(specimen, ratio), shapes = new Set();
    for (const verb of [null, ...new Set(ACT2_KITS.boss28.unlocked.flat())]) {
      const poses = [];
      for (const charge of [80, 0]) {
        const e = { ...enemy, c: verb ? VERBS.indexOf(verb) + 1 : 0, d: charge, t: 130 };
        const first = context(), later = context(), before = JSON.stringify(e);
        freeze(e);
        paintOuterMachine(first.ctx, e, 28, true);
        paintOuterMachine(later.ctx, { ...e, t: 517 }, 28, true);
        assert.deepEqual(later.trace, first.trace, `${verb}: held reduced-motion pose`);
        assert.equal(JSON.stringify(e), before, "pose does not write attack state");
        const geometry = JSON.stringify(first.trace.filter(([key]) => ["moveTo", "lineTo", "ellipse"].includes(key)));
        shapes.add(geometry); poses.push(geometry);
      }
      if (verb) assert.notEqual(poses[0], poses[1], `${verb}: charge differs from release`);
    }
    assert.ok(shapes.size >= 10, "distinct rest, charge and live poses in every structural form");
  }
});


test("Herald Hyper ports share exact beam origins and light only the selected slots", () => {
  const specimen = specimens.find(s => s.enemy.type === "boss28");
  for (const slots of [[0], [-1, 1], [-1, 0, 1]]) {
    const { state, enemy } = variant(specimen);
    enemy.c = VERBS.indexOf("hyper") + 1; enemy.d = 80;
    state.beams = slots.map(slot => ({ ownerId: enemy.id, slot }));
    const c = context(), before = JSON.stringify(state); freeze(state);
    drawHeraldEmitters(c.ctx, enemy, state);
    const arcs = c.trace.filter(([method]) => method === "arc");
    assert.equal(arcs.length, 3);
    for (const [index, slot] of [-1, 0, 1].entries()) {
      const muzzle = beamMuzzle(enemy, slot), arc = arcs[index];
      assert.deepEqual(arc.slice(1, 3), [muzzle.x, muzzle.y], "warning centre is the beam origin");
      assert.equal(arc[3] > 1.15, slots.includes(slot), "only firing mounts brighten");
    }
    assert.equal(c.depth(), 0); assert.equal(JSON.stringify(state), before);
  }
});
