import assert from "node:assert/strict";
import test from "node:test";
import { createState, step } from "../src/components/games/space-logic.ts";
import { THIRD_BOSSES } from "../src/components/games/space3-boss.ts";
import { VERBS } from "../src/components/games/space3-director.ts";
import { generateWaves } from "../src/components/games/space3-waves.ts";

const IDLE = { mx: 0, my: 0, bomb: false };
const advance = (s, n = 1) => { for (let i = 0; i < n; i++) { s.talk = null; step(s, IDLE); } };

function regular(chapter, type) {
  const s = createState(chapter);
  s.phase = "play"; s.p.x = 30; s.p.y = 190;
  s.p.inv = 1e9; s.p.cd = 1e9; s.p.launchCd = 1e9; s.lumen = null;
  s.plan = [{ t: 0, type, x: 260, y: 60 }, { t: 1e9, type: "pod", y: 60 }];
  s.planIdx = 0; s.t = 0; s.enemies = []; advance(s);
  const enemy = s.enemies.find(e => e.type === type);
  assert(enemy); enemy.x = 260; enemy.y = enemy.y0 = 60; enemy.cd = 0;
  return { s, enemy };
}

for (const chapter of [17, 18, 19, 20]) {
  const roster = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    for (const wave of generateWaves(seed, { chapter }).plan) roster.add(wave.type);
  }
  for (const type of roster) {
    test(`Space 3 chapter ${chapter} ${type}: death and departure retain existing ordnance`, () => {
      for (const reason of ["death", "departure"]) {
        const { s, enemy } = regular(chapter, type);
        const { round, held, mine } = tails(s, enemy);
        if (reason === "death") enemy.hp = 0;
        else {
          enemy.x = -200;
          if (type === "fighter" || type === "orbiter") enemy.t = 1200;
        }
        advance(s);
        assert(!s.enemies.includes(enemy), reason);
        for (const bullet of [round, held, mine]) assert(s.bullets.includes(bullet), `${reason} preserves ordnance`);
        assert.equal(round.life, 179); assert.equal(held.hold, 99); assert.equal(mine.fuse, 99);
      }
    });
  }
}

for (const type of ["drone", "gunner", "sniper", "armor", "fighter", "cruiser", "bomber", "orbiter"]) {
  test(`Space 3 ${type}: an actual emitted shot survives its source's death`, () => {
    const { s, enemy } = regular(18, type);
    let shot;
    for (let i = 0; i < 250 && !shot; i++) {
      advance(s); shot = s.bullets.find(b => b.own === "e");
    }
    assert(shot, "enemy emits a real shot");
    const life = shot.life, x = shot.x;
    enemy.hp = 0; advance(s);
    assert(!s.enemies.includes(enemy)); assert(s.bullets.includes(shot));
    if (life !== undefined) assert.equal(shot.life, life - 1);
    assert.notEqual(shot.x, x);
  });
}

function encounter(chapter, phase = 0) {
  const s = createState(chapter);
  s.seed = chapter * 101; s.phase = "play"; s.p.x = 40; s.p.y = 100;
  s.p.inv = 1e9; s.p.cd = 1e9; s.p.launchCd = 1e9; s.lumen = null;
  s.planIdx = s.plan.length; s.t = s.plan.at(-1).t; s.enemies = [];
  let boss;
  for (let i = 0; i < 700; i++) {
    advance(s); boss = s.enemies.find(e => e.type === `boss${chapter}`);
    if (boss?.b > 0) break;
  }
  assert(boss?.b > 0);
  s.enemies = [boss];
  if (phase) { boss.hp = boss.maxHp * 0.3; advance(s, 60); }
  s.bullets = [];
  return { s, boss };
}

function tails(s, boss, life = 180, delay = 100) {
  const base = { x: 240, y: 28, vx: -0.2, vy: 0, r: 2, own: "e", dmg: 1, kind: "pulse", life, patternOwner: boss.id };
  const round = { ...base };
  const held = { ...base, x: 220, y: 44, vx: 0, hold: delay, hvx: -0.4, hvy: 0 };
  const mine = { ...base, x: 200, y: 60, vx: 0, kind: "scrap", r: 4, fuse: delay, split: 8, splitKind: "scrap" };
  s.bullets.push(round, held, mine);
  return { round, held, mine };
}

for (const chapter of [17, 18, 19, 20]) {
  test(`Space 3 boss ${chapter}: ordinary pattern changes retain flying, held and fused rounds`, () => {
    const { s, boss } = encounter(chapter);
    let active = false, resting = false;
    for (let i = 0; i < 1000; i++) {
      advance(s); active ||= boss.c > 0;
      if (active && boss.c === 0) { resting = true; break; }
    }
    assert(resting);
    const { round, held, mine } = tails(s, boss);
    let waited = 0;
    while (boss.c === 0 && waited < 100) { advance(s); waited++; }
    assert(boss.c > 0 && waited > 0);
    assert(s.bullets.includes(round)); assert(s.bullets.includes(held)); assert(s.bullets.includes(mine));
    assert.equal(round.life, 180 - waited); assert.equal(held.hold, 100 - waited); assert.equal(mine.fuse, 100 - waited);
    assert.ok(Math.abs(round.x - (240 - waited * 0.2)) < 1e-8);
  });

  test(`Space 3 boss ${chapter}: both ultimates preserve old rounds and their release/airburst timers`, () => {
    const { s, boss } = encounter(chapter, 2);
    const ultimate = VERBS.indexOf(THIRD_BOSSES[boss.type].ultimate) + 1;
    for (const share of [0.24, 0.09]) {
      s.bullets = [];
      const { round, held, mine } = tails(s, boss, 12, 5);
      boss.hp = boss.maxHp * share; advance(s);
      assert.equal(boss.c, ultimate); assert.equal(boss.a, 2, "ultimate is not an HP phase transition");
      assert(s.bullets.includes(round), "already flying round survives the ultimate warning");
      assert(s.bullets.includes(held), "old missile keeps hanging");
      assert(s.bullets.includes(mine), "old mine keeps its fuse");
      assert.equal(round.life, 11); assert.equal(held.hold, 4); assert.equal(mine.fuse, 4);
      advance(s, 4);
      assert.equal(held.hold, 0); assert.equal(held.vx, -0.4);
      assert(!s.bullets.includes(mine));
      const fragments = s.bullets.filter(b => b.patternOwner === boss.id && b !== round && b !== held);
      assert.equal(fragments.length, 8); assert(fragments.every(b => b.kind === "scrap"));
      advance(s, 7); assert(!s.bullets.includes(round), "old round still expires naturally");
    }
  });

  test(`Space 3 boss ${chapter}: HP phase and defeat still clear enemy fire`, () => {
    const { s, boss } = encounter(chapter);
    const { round, held, mine } = tails(s, boss);
    const friendly = { x: 10, y: 12, vx: 0.1, vy: 0, r: 1, own: "p", dmg: 1, kind: "seed", life: 200 };
    s.bullets.push(friendly); boss.hp = boss.maxHp * 0.6; advance(s);
    assert.equal(boss.a, 1); assert(boss.stun > 0);
    assert(!s.bullets.includes(round) && !s.bullets.includes(held) && !s.bullets.includes(mine));
    assert(s.bullets.includes(friendly));
    const after = tails(s, boss); boss.hp = 0; advance(s);
    assert(!s.enemies.includes(boss)); assert(!s.bullets.includes(after.round)); assert(s.bullets.includes(friendly));
  });
}
