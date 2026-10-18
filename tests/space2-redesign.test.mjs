import assert from 'node:assert/strict';
import test from 'node:test';
import { W, H, GROUND_Y, FINAL_PHASE_AT, bossCheckpoint, bossModel, bossScale, beamMuzzle, enemyMuzzle, createState, step } from '../src/components/games/space-logic.ts';

function atlas() {
  const s = bossCheckpoint(createState(16));
  s.p.inv = 1e9;
  for (let i = 0; i < 620; i++) { s.talk = null; step(s, { mx: 0, my: 0, bomb: false }); }
  const boss = s.enemies.find(e => e.type === 'boss16');
  assert(boss);
  return { s, boss };
}

test('the enlarged final boss fills the battlefield but leaves the HUD and a flight corridor clear', () => {
  const { s, boss } = atlas();
  for (let phase = 0; phase < 6; phase++) {
    boss.hp = boss.maxHp * (phase === 0 ? 1 : FINAL_PHASE_AT[phase - 1] - 0.01);
    boss.shield = 0;
    s.talk = null;
    step(s, { mx: 0, my: 0, bomb: false });
    assert(boss.h >= H * 0.7, 'final boss should dominate the height');
    assert(boss.w >= W * 0.4, 'final boss should have a broad silhouette');
    assert(boss.y >= 24, 'keep the HUD clear');
    assert(boss.x >= W * 0.5, 'leave at least half the field for flying');
    assert(boss.x + boss.w <= W - 12, 'keep the outer armour on screen');
    assert(Math.abs(boss.y + boss.h - GROUND_Y) < 1, 'siege base stays grounded');
  }
});

test('enlarging Atlas scales both the collision armour and all three visible weapon mounts', () => {
  const { s, boss } = atlas();
  const model = bossModel(boss);
  assert.equal(model.w, 92); assert.equal(model.h, 90);
  assert(bossScale(boss) > 1.35, 'larger than the previous Space 2 boss');
  for (const slot of [-1, 0, 1]) {
    for (const point of [enemyMuzzle(boss, s, slot), beamMuzzle(boss, slot)]) {
      assert(point.x >= boss.x && point.x <= boss.x + boss.w);
      assert(point.y >= boss.y && point.y <= boss.y + boss.h);
    }
  }
  const oldShield = boss.shield;
  s.bullets.push({ x: boss.x + boss.w - 2, y: boss.y + boss.h / 2, vx: 0, vy: 0, r: 3, own: 'p', dmg: 20, kind: 'pulse' });
  step(s, { mx: 0, my: 0, bomb: false });
  assert(boss.shield < oldShield, 'shots hit the enlarged outer armour');
});
