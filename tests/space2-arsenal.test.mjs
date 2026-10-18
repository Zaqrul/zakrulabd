import assert from 'node:assert/strict';
import test from 'node:test';
import { BLOOM, HYDRA, SECOND_TIMING, W, H, WATER_Y, bossCheckpoint, bossModel, bossScale, createState, domeCenter, hydraMuzzle, step, TERRAIN } from '../src/components/games/space-logic.ts';
const idle = { mx: 0, my: 0, bomb: false };
const close = (a, b) => assert(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
function arena(phase = 0) {
  const s = bossCheckpoint(createState(10));
  for (let f = 0; f < 620; f++) { s.p.inv = 1e9; s.talk = null; step(s, idle); }
  const e = s.enemies.find(e => e.type === 'boss10'); assert(e);
  s.enemies = [e]; s.bullets = []; s.charges = []; s.hazards = []; s.kite = null; s.talk = null; s.coverT = 0; s.coverCd = 0; s.p.absorbed = 0;
  s.p.x = 80; s.p.y = 95; s.p.cd = 1e9; s.p.launchCd = 1e9; s.p.inv = 1e9;
  e.a = phase; e.hp = e.maxHp * (phase === 2 ? 0.3 : phase === 1 ? 0.6 : 1); e.shield = 0; e.stun = 0; e.cd = 1e9; e.attack = undefined;
  return { s, e };
}
function attack(e, kind) {
  const [warn, live] = SECOND_TIMING[kind];
  e.attack = { kind, t: 0, warn, live, recover: 60, angle: Math.PI, targetX: 80, targetY: 95 };
  return e.attack;
}
function tick(s, frames = 1) { for (let i = 0; i < frames; i++) { s.talk = null; step(s, idle); } }

test('the new arsenal hull stays afloat, on screen, and leaves over half the field clear', () => {
  const { e } = arena();
  close(bossModel(e).w, 116); close(bossModel(e).h, 62);
  assert(e.x >= W / 2); assert(e.x + e.w <= W - 12); assert(e.y > 24); assert(e.y + e.h < H);
  assert(Math.abs(e.y + e.h - WATER_Y) < 4);
  for (let i = 0; i < 3; i++) { const p = hydraMuzzle(e, i), local = HYDRA.bays[i]; close(p.x, e.x + local.x * bossScale(e)); close(p.y, e.y + local.y * bossScale(e)); }
});
for (const kind of ['deckbomb', 'silorocket', 'arsenalsalvo']) test(`${kind}: hatch warning precedes all ordnance and locks its marked targets`, () => {
  const { s, e } = arena(kind === 'arsenalsalvo' ? 2 : 0), a = attack(e, kind);
  tick(s, a.warn - 17); const spots = structuredClone(a.spots); assert(spots.length > 0);
  s.p.x += 60; s.p.y += 40;
  tick(s, 17);
  assert.equal(s.charges.length + s.bullets.filter(b => b.own === 'e').length, 0);
  assert.deepEqual(a.spots, spots, 'locks before the player dodges');
  tick(s);
  assert(s.charges.length || s.bullets.some(b => b.kind === 'deckrocket'));
});

test('bombs emerge from the drawn scaled hatch and follow the advertised parabolic arc', () => {
  const { s, e } = arena(); const a = attack(e, 'deckbomb'); tick(s, a.warn + 1);
  const b = s.charges[0], port = hydraMuzzle(e, 0); assert.equal(b.kind, 'deckbomb'); close(b.sx, port.x); close(b.sy, port.y);
  tick(s, HYDRA.flight / 2 - b.t);
  close(b.x, (b.sx + b.tx) / 2); close(b.y, (b.sy + b.ty) / 2 - HYDRA.arc);
  tick(s, HYDRA.flight - b.t); close(b.x, b.tx); close(b.y, b.ty);
});

test('bombs do no contact damage in flight, warn after landing, and only hurt during their blast', () => {
  const { s, e } = arena(); e.stun = 1e9; s.p.inv = 0; const hits = s.stats.hits;
  /* The monsoon pushes the ship down while the bomb is in the air. */
  const tx = s.p.x + 8, ty = s.p.y + 6 + TERRAIN.rain.push * HYDRA.fuse;
  s.charges.push({ kind: 'deckbomb', x: 300, y: 130, sx: 300, sy: 130, tx, ty, t: 0 });
  tick(s, HYDRA.fuse - 1); assert.equal(s.stats.hits, hits, 'flight and landing are harmless');
  tick(s); assert(s.stats.hits > hits, 'marked blast hurts');
  tick(s, HYDRA.blast); assert.equal(s.charges.length, 0);
  const after = s.stats.hits; s.p.inv = 0; tick(s); assert.equal(s.stats.hits, after, 'expired blast is harmless');
});

test('a silo rocket climbs from its hatch, turns once to the premarked spot, and never homes afterwards', () => {
  const { s, e } = arena(); const a = attack(e, 'silorocket'); tick(s, a.warn + 1);
  const b = s.bullets.find(b => b.kind === 'deckrocket'), port = hydraMuzzle(e, 2); assert(b);
  close(b.x, port.x); close(b.y, port.y - HYDRA.launchSpeed); close(b.vx, 0); close(b.vy, -HYDRA.launchSpeed);
  const target = { ...b.aim }, x = b.x, y = b.y;
  tick(s, HYDRA.climb - 1); close(b.x, x); close(b.y, y - (HYDRA.climb - 1) * HYDRA.launchSpeed); assert.equal(b.retarget, 1);
  s.p.x = 15; s.p.y = 170; tick(s);
  const angle = Math.atan2(target.y - (y - (HYDRA.climb - 1) * HYDRA.launchSpeed), target.x - x);
  close(b.vx, Math.cos(angle) * HYDRA.rocketSpeed); close(b.vy, Math.sin(angle) * HYDRA.rocketSpeed);
  const velocity = { x: b.vx, y: b.vy }; tick(s, 8); close(b.vx, velocity.x); close(b.vy, velocity.y); assert.deepEqual(b.aim, target);
});

test('physical deck rockets pass through Bloom and do not waste an ORB cover activation', () => {
  const { s, e } = arena(); e.stun = 1e9;
  const center = domeCenter(s.p);
  s.p.bloom = BLOOM.energy;
  s.kite = { x: 40, y: 50, cd: 1e9, kick: 0 };
  const rocket = { x: center.x + 28, y: center.y, vx: -1, vy: 0, r: 3, own: 'e', dmg: 1, kind: 'deckrocket', life: 100 };
  s.bullets.push(rocket);
  tick(s, 5);
  assert(s.bullets.includes(rocket)); assert.equal(s.p.absorbed, 0); assert.equal(s.coverT, 0);
});

for (const playerY of [40, 135]) test(`ultimate retains a navigable fixed corridor with player at y=${playerY}`, () => {
  const { s, e } = arena(2); s.p.y = playerY; const a = attack(e, 'arsenalsalvo');
  let gap, bombs = 0, rockets = 0; const seenBombs = new Set(), seenRockets = new Set();
  for (let f = 0; f < a.warn + a.live + HYDRA.fuse + HYDRA.blast; f++) {
    tick(s); gap ??= a.gapY; assert.equal(a.gapY, gap);
    for (const b of s.charges.filter(b => b.kind === 'deckbomb')) {
      seenBombs.add(b);
      if (b.t >= HYDRA.fuse) assert(Math.abs(b.ty - gap) > HYDRA.safeHalf + HYDRA.radius);
    }
    for (const b of s.bullets.filter(b => b.kind === 'deckrocket')) {
      seenRockets.add(b);
      if (b.x < 190) assert(Math.abs(b.y - gap) > HYDRA.safeHalf + b.r, `rocket closed corridor at ${b.x},${b.y}`);
    }
  }
  bombs = seenBombs.size; rockets = seenRockets.size;
  assert.equal(bombs, 3); assert.equal(rockets, 6);
});
