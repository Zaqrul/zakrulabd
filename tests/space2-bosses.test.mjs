import assert from "node:assert/strict";
import test from "node:test";
import { GUST, PHASE_CALL, ATLAS_CALLS, SECOND_TIMING, SIGNATURE, ULTIMATES, bossCheckpoint, createState, hazardBoxes, step } from "../src/components/games/space-logic.ts";

const idle = { mx: 0, my: 0, bomb: false };
const SPACE1_KINDS = ["fan", "burst", "missiles", "beam", "spiral", "charge", "curtain", "flare", "support", "nova", ...SIGNATURE];

/* A Space 2 boss fight, the ship untouchable, run until `until` says stop; returns what was seen. */
function fight(ch, share = 1, frames = 3000, onFrame = () => {}) {
  const s = bossCheckpoint(createState(ch));
  s.p.x = 40;
  s.p.y = 110;
  const seen = new Map();
  for (let f = 0; f < frames; f++) {
    s.p.inv = 1e9;
    s.p.cd = 1e9;
    s.p.launchCd = 1e9;
    s.talk = null;
    const boss = s.enemies.find((e) => e.type === `boss${ch}`);
    if (boss && f === 300 && share < 1) {
      boss.shield = 0;
      boss.hp = boss.maxHp * share;
    }
    step(s, { mx: 0, my: Math.sin(f / 50) * 1.4, bomb: false });
    if (boss?.attack) {
      const a = boss.attack;
      const rec = seen.get(a.kind) ?? { warn: a.warn, marked: false, phases: new Set() };
      rec.phases.add(boss.a);
      if (a.t === a.warn - 1 && ((a.lanes?.length ?? 0) > 0 || (a.cols?.length ?? 0) > 0 || (a.spots?.length ?? 0) > 0 || a.gapY !== undefined || a.gapX !== undefined || a.gapAngle !== undefined)) rec.marked = true;
      seen.set(a.kind, rec);
    }
    onFrame(s, boss);
  }
  return { s, seen };
}

test("no Space 2 boss uses a Space 1 attack", () => {
  for (let ch = 9; ch <= 16; ch++) {
    const { seen } = fight(ch, 1, 1500);
    for (const kind of seen.keys()) assert.ok(!SPACE1_KINDS.includes(kind), `boss${ch} used ${kind}`);
    assert.ok(seen.size >= 2, `boss${ch} showed ${seen.size} attacks`);
  }
});

test("every new attack has a timing with a real warning", () => {
  for (const [kind, [warn, live]] of Object.entries(SECOND_TIMING)) {
    assert.ok(warn >= 30, `${kind} warns for ${warn}`);
    assert.ok(live > 0);
  }
  assert.equal(ULTIMATES.length, 8);
});

for (let ch = 9; ch <= 16; ch++) {
  test(`Space 2 boss ${ch - 8}: its last phase opens with its ultimate, announced, and its attacks are marked before they land`, () => {
    let ultimateCall = false;
    const { seen } = fight(ch, ch === 16 ? 0.25 : 0.3, 2400, (s) => {
      if (s.callout?.kind === "ultimate") ultimateCall = true;
    });
    const ult = [...seen.keys()].find((k) => ULTIMATES.includes(k));
    assert.ok(ult, `no ultimate seen (saw ${[...seen.keys()].join(", ")})`);
    assert.ok(ultimateCall, "the ultimate was announced");
    for (const [kind, rec] of seen) assert.ok(rec.marked, `${kind} showed no marks before landing`);
  });
}

test("each Space 2 boss changes in its own way at a phase shift, with its own call", () => {
  for (let ch = 9; ch <= 15; ch++) {
    let call = null;
    fight(ch, 0.6, 500, (s) => {
      if (s.callout && s.callout.kind === PHASE_CALL[`boss${ch}`]) call = s.callout.kind;
    });
    assert.equal(call, PHASE_CALL[`boss${ch}`], `boss${ch}`);
  }
  assert.equal(new Set(Object.values(PHASE_CALL)).size, 7, "no two the same");
  assert.equal(ATLAS_CALLS.length, 5);
});

test("Cyclone's gusts are marked, then push the ship", () => {
  let pushed = false;
  let marked = false;
  fight(15, 0.6, 1600, (s) => {
    if (s.gust && s.gust.t < GUST.warn) marked = true;
    if (s.gust && s.gust.t >= GUST.warn) pushed = true;
  });
  assert.ok(marked && pushed);
});

test("a column strike only hurts once its warning is over, and only while it burns", () => {
  const h = { id: 1, kind: "strike", x: 100, w: 20, g: [30, 12, 2], half: 150, base: 22, t: 0 };
  assert.deepEqual(hazardBoxes(h), []);
  h.t = 31;
  assert.equal(hazardBoxes(h).length, 1);
  h.t = 50;
  assert.deepEqual(hazardBoxes(h), []);
});

test("a shot that hangs waits, then flies; a shot with a fuse bursts into a ring", () => {
  const s = createState(9);
  s.phase = "play";
  s.planIdx = 9999;
  s.p.inv = 1e9;
  const far = { id: 900, type: "boss1", x: 500, y: 60, w: 64, h: 60, vx: 0, vy: 0, hp: 1e9, maxHp: 1e9, t: 0, cd: 1e9, y0: 60, flash: 0, stun: 1e9, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] };
  s.enemies.push(far);
  s.bossId = far.id;
  s.bullets.push({ x: 300, y: 60, vx: 0, vy: 0, r: 3, own: "e", dmg: 1, kind: "ice", hold: 10, hvx: -3, hvy: 0 });
  for (let i = 0; i < 9; i++) step(s, idle);
  assert.equal(s.bullets[0].x, 300, "still");
  for (let i = 0; i < 5; i++) step(s, idle);
  assert.ok(s.bullets[0].x < 300, "and away");
  s.bullets = [{ x: 300, y: 100, vx: -1, vy: 0, r: 4, own: "e", dmg: 1, kind: "orb", fuse: 3, split: 6 }];
  for (let i = 0; i < 4; i++) step(s, idle);
  assert.equal(s.bullets.filter((b) => b.own === "e").length, 6);
});

test("the last boss of each game draws no warnings, and every other boss still does", async () => {
  const { hidesTells, hazardWarning, FLARE_WARN } = await import("../src/components/games/space-logic.ts");
  for (const [ch, final] of [[8, true], [16, true], [1, false], [9, false], [15, false]]) {
    const s = bossCheckpoint(createState(ch));
    s.p.inv = 1e9;
    for (let i = 0; i < 400 && !s.enemies.some((e) => e.id === s.bossId); i++) { s.talk = null; step(s, { mx: 0, my: 0, bomb: false }); }
    assert.equal(hidesTells(s), final, `chapter ${ch}`);
  }
  assert.equal(hidesTells(createState(16)), false, "not before the boss arrives");
  const strike = { kind: "strike", t: 5, g: [10, 20, 0] };
  assert.equal(hazardWarning(strike), true);
  assert.equal(hazardWarning({ ...strike, t: 12 }), false, "a strike that has gone live is drawn");
  assert.equal(hazardWarning({ kind: "flare", t: FLARE_WARN - 1, g: [] }), true);
  assert.equal(hazardWarning({ kind: "flare", t: FLARE_WARN, g: [] }), false);
});
