import assert from "node:assert/strict";
import test from "node:test";
import { H, W, createState, isBoss, step } from "../src/components/games/space-logic.ts";
import { BARRIER, createResonance, reflectShots } from "../src/components/games/space3-resonance.ts";
import { CORVET, EXCAVATOR, WYRM, bossShotRadius } from "../src/components/games/space3-boss.ts";

const IDLE = { mx: 0, my: 0, bomb: false };

test("larger boss rounds preserve which shots the Barrier can reflect", () => {
  for (const radius of [2, 2.2, 2.3, 2.4, 2.6, 3, 3.2, 4.2, 5]) {
    const r = createResonance(); r.barrier = BARRIER.frames;
    const shot = { x: 60, y: 90, vx: -2, vy: 0, r: bossShotRadius(radius), own: "e", dmg: 1 };
    assert.ok(shot.r >= radius && shot.r <= radius * 1.15 + 1e-9);
    reflectShots(r, { x: 60, y: 90 }, [shot]);
    assert.equal(shot.own === "p", radius <= BARRIER.maxShot, `base radius ${radius}`);
  }
});

for (const [chapter, kit, initialRadii] of [[17, CORVET, [2.2]], [18, EXCAVATOR, [4.2, 2.6]], [19, WYRM, [2.2]]]) {
  test(`chapter ${chapter}: enlarged boss fits the arena and emits correctly sized signature shots`, () => {
    const s = createState(chapter); s.seed = 21 * chapter; s.phase = "play";
    s.p.x = 40; s.p.y = 90; s.p.inv = 1e6;
    s.planIdx = s.plan.length; s.t = s.plan.at(-1).t; s.enemies = [];
    let boss, sawShots = false;
    for (let frame = 0; frame < 1600; frame++) {
      s.talk = null; step(s, IDLE);
      boss ??= s.enemies.find(e => isBoss(e.type));
      if (!boss) continue;
      assert.equal(boss.w, kit.w); assert.equal(boss.h, kit.h);
      if (boss.b > 0) {
        assert.ok(boss.x >= 0 && boss.x + boss.w <= W);
        assert.ok(boss.y >= 24 && boss.y + boss.h <= H - 20);
      }
      const shots = s.bullets.filter(b => b.own === "e");
      if (shots.length) {
        /* The crossfire's needles come in from every side as well. */
        assert.ok(shots.every(b => [...initialRadii, 2.2].some(r => Math.abs(b.r - bossShotRadius(r)) < 1e-9)));
        sawShots = true; break;
      }
    }
    assert.ok(boss && sawShots);
  });
}

test("Space 3 blasting fragments grow once; earlier campaign fragments retain their radius", () => {
  for (const chapter of [1, 9, 17, 18, 19]) {
    const s = createState(chapter); s.phase = "play"; s.p.inv = 1e6;
    s.bullets = [{ x: 220, y: 110, vx: -1, vy: 0, r: 5, own: "e", dmg: 1, kind: "scrap", fuse: 1, split: 10, splitKind: "scrap" }];
    step(s, IDLE);
    const fragments = s.bullets.filter(b => b.own === "e");
    assert.equal(fragments.length, 10);
    assert.ok(fragments.every(b => Math.abs(b.r - (chapter >= 17 ? bossShotRadius(2.3) : 2.3)) < 1e-9));
  }
});
