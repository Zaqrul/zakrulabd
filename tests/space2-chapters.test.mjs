import assert from "node:assert/strict";
import test from "node:test";
import { BOSS_FLOOR, BOSS_PHASES, COVER, GROUND_Y, H, KITE, WATER_Y, bossCheckpoint, chapterProgress, createState, isFinal, nextChapter, step } from "../src/components/games/space-logic.ts";
import { LIMITS2, parseProgress, progressKey } from "../src/components/games/space-progress.ts";
import { SECOND_PLANS } from "../src/components/games/space2-plans.ts";

const idle = { mx: 0, my: 0, bomb: false };
const CHAPTERS2 = [9, 10, 11, 12, 13, 14, 15, 16];

/* The boss of a chapter, arrived and settled, with the ship out of harm's way. */
function atBoss(ch) {
  const s = bossCheckpoint(createState(ch));
  s.p.inv = 1e9;
  for (let i = 0; i < 400 && !s.enemies.some((e) => e.type === `boss${ch}`); i++) step(s, idle);
  s.talk = null;
  return { s, boss: s.enemies.find((e) => e.type === `boss${ch}`) };
}

test("Space 2 has eight scripted chapters full of things to shoot", () => {
  assert.equal(SECOND_PLANS.length, 8);
  SECOND_PLANS.forEach((plan, i) => {
    const enemies = plan.filter((p) => !["flare", "gate", "wall"].includes(p.type));
    /* The opening chapter is thinned by a fifth on purpose. */
    assert.ok(enemies.length >= (i === 0 ? 48 : 60), `chapter ${i + 1}: only ${enemies.length} enemies`);
    assert.ok(plan.some((p) => p.type === "pod"), "every chapter has supply pods");
    for (let i = 1; i < plan.length; i++) assert.ok(plan[i].t >= plan[i - 1].t, "the script is in time order");
  });
});

for (const ch of CHAPTERS2) {
  test(`Space 2 chapter ${ch - 8} ends with its own boss, which stands where it should, warns, and can be hurt`, () => {
    const { s, boss } = atBoss(ch);
    assert.ok(boss, "the boss arrived");
    const floor = BOSS_FLOOR[boss.type];
    for (let i = 0; i < 200; i++) step(s, idle);
    s.talk = null;
    if (floor === "ground") assert.ok(Math.abs(boss.y + boss.h - GROUND_Y) < 3, "on the ground");
    else if (floor === "sea") assert.ok(Math.abs(boss.y + boss.h - WATER_Y) < 4, "on the water");
    else assert.ok(boss.y > 0 && boss.y + boss.h < H, "in the air, on screen");
    assert.ok(boss.attack, "it has begun an attack");
    assert.ok(boss.attack.warn >= 30, "with a warning first");
    const hp = boss.hp;
    const shield = boss.shield ?? 0;
    s.bullets.push({ x: boss.x + boss.w / 2, y: boss.y + boss.h / 2, vx: 0, vy: 0, r: 3, own: "p", dmg: 20, kind: "pulse" });
    step(s, idle);
    assert.ok(boss.hp < hp || (boss.shield ?? 0) < shield, "it took the hit");
    assert.equal(BOSS_PHASES[boss.type], isFinal(boss.type) ? 6 : 3);
  });
}

test("Kite flies with the ship in Space 2 only, keeps up, and fires at what is ahead", () => {
  assert.equal(createState(3).kite, null);
  const s = createState(9);
  s.phase = "play";
  s.planIdx = 9999;
  s.p.inv = 1e9;
  const far = { id: 900, type: "boss1", x: 500, y: 60, w: 64, h: 60, vx: 0, vy: 0, hp: 1e9, maxHp: 1e9, t: 0, cd: 1e9, y0: 60, flash: 0, stun: 1e9, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] };
  s.enemies.push(far);
  s.bossId = far.id;
  s.p.x = 80;
  s.p.y = 120;
  for (let i = 0; i < 80; i++) step(s, idle);
  assert.ok(Math.abs(s.kite.x - (s.p.x + KITE.dx)) < 2 && Math.abs(s.kite.y - (s.p.y + KITE.dy)) < 2, "it caught up");
  s.enemies.push({ ...far, id: 901, type: "gunner", x: 250, y: s.kite.y - 8, w: 22, h: 20, hp: 50, maxHp: 50, stun: 0 });
  for (let i = 0; i < 30; i++) step(s, idle);
  assert.ok(s.bullets.some((b) => b.kite), "Kite fired");
});

test("Kite's Bloom covers the ship when fire comes close, holds without spending the ship's Bloom, then recharges for seven seconds", () => {
  const s = createState(9);
  s.phase = "play";
  s.planIdx = 9999;
  s.p.inv = 1e9;
  s.p.x = 60;
  s.p.y = 100;
  const far = { id: 900, type: "boss1", x: 500, y: 60, w: 64, h: 60, vx: 0, vy: 0, hp: 1e9, maxHp: 1e9, t: 0, cd: 1e9, y0: 60, flash: 0, stun: 1e9, a: 0, b: 0, c: 0, d: 0, n: 0, rot: 0, guard: 0, parts: [] };
  s.enemies.push(far);
  s.bossId = far.id;
  const shot = () => s.bullets.push({ x: s.p.x + 70, y: s.p.y + 5, vx: -1, vy: 0, r: 2.4, own: "e", dmg: 1, kind: "orb" });
  for (let i = 0; i < 20; i++) step(s, idle);
  assert.equal(s.coverT, 0, "nothing to cover");
  shot();
  for (let i = 0; i < 6; i++) step(s, idle);
  assert.ok(s.coverT > 0, "it covers");
  assert.equal(s.counters2.covers, 1);
  assert.ok(s.p.dome > 0);
  assert.equal(s.p.bloom, 0, "the ship's own Bloom is untouched");
  for (let i = 0; i < COVER.frames; i++) step(s, idle);
  assert.equal(s.coverT, 0);
  assert.ok(s.coverCd > COVER.cooldown - 20, "recharging");
  shot();
  for (let i = 0; i < 30; i++) step(s, idle);
  assert.equal(s.counters2.covers, 1, "not again until it has recharged");
  for (let i = 0; i < COVER.cooldown; i++) step(s, idle);
  shot();
  for (let i = 0; i < 6; i++) step(s, idle);
  assert.equal(s.counters2.covers, 2, "and again");
  assert.equal(COVER.cooldown, 900);
  assert.equal(createState(3).kite, null);
});

test("Atlas giving way wakes Judgement: the story stops the game for it, once", () => {
  const { s, boss } = atBoss(16);
  for (let i = 0; i < 300; i++) step(s, idle);
  s.talk = null;
  boss.shield = 0;
  boss.hp = boss.maxHp * 0.46;
  boss.stun = 0;
  s.talk = null;
  step(s, idle);
  assert.equal(s.talk, "judgement");
  s.talk = null;
  boss.hp = boss.maxHp * 0.25;
  for (let i = 0; i < 80; i++) step(s, idle);
  assert.notEqual(s.talk, "judgement");
});

test("Space 2 runs are saved apart from Space 1, from its second chapter on", () => {
  assert.notEqual(progressKey("zak", 2), progressKey("zak", 1));
  const run = { chapter: 11, score: 900, weapon: 1, level: 3, extra: 250 };
  assert.deepEqual(parseProgress(run, 2), run);
  assert.equal(parseProgress(run, 1), null, "Space 1 does not take a Space 2 run");
  assert.equal(parseProgress({ ...run, chapter: LIMITS2.first }, 2), null, "the first chapter is not worth saving");
  assert.equal(parseProgress({ ...run, chapter: 5 }, 2), null);
  assert.ok(parseProgress({ ...run, chapter: 16 }, 2));
});

test("a chapter's progress bar runs from its start to its boss, and the next chapter carries the experience", () => {
  const s = createState(12);
  assert.equal(chapterProgress(s), 0);
  s.p.extra = 345;
  s.p.level = 4;
  const next = nextChapter(s);
  assert.equal(next.chapter, 13);
  assert.equal(next.p.extra, 345);
  assert.equal(next.p.level, 4);
  assert.ok(next.kite);
});

/* A pilot that cannot be hurt, holds the left of the screen and lines up with the nearest enemy. */
function fly(ch, maxFrames = 120000) {
  const s = createState(ch);
  s.phase = "play";
  s.p.x = 40;
  for (let f = 0; f < maxFrames && s.phase !== "clear" && s.phase !== "won"; f++) {
    s.p.inv = 1e9;
    s.talk = null;
    const target = s.enemies.filter((e) => e.hp > 0 && e.x < 384).sort((a, b) => a.x - b.x)[0];
    const want = target ? target.y + target.h / 2 - 5 : 108;
    const my = Math.max(-2.7, Math.min(2.7, (want - s.p.y) * 0.3));
    const mx = Math.max(-2.7, Math.min(2.7, (40 - s.p.x) * 0.3));
    step(s, { mx, my, bomb: false });
  }
  return s;
}

test("every Space 2 chapter can be flown to the end and its boss beaten", () => {
  for (const ch of CHAPTERS2) {
    const s = fly(ch);
    assert.ok(s.phase === "clear" || s.phase === "won", `chapter ${ch - 8} ended ${s.phase} at frame ${s.frame}`);
    assert.ok(s.p.extra > 0, "it earned experience");
  }
});
