import assert from 'node:assert/strict';
import test from 'node:test';
import { SECOND_PLANS } from '../src/components/games/space2-plans.ts';
import { PATTERN, SECOND_BOSS_TIMING, SECOND_MINI_TIMING, spacedPositions } from '../src/components/games/space2-attack-patterns.ts';
import { HYDRA, MINI, FINAL_PHASE_AT, GUST, TERRAIN, HYPERSONIC, hasUpgrade, bossCheckpoint, createState, hazardBoxes, miniMuzzle, shipSize, step } from '../src/components/games/space-logic.ts';

const idle = { mx: 0, my: 0, bomb: false };
export const bossKinds = [
  ['railshot', 'geysers', 'broadside', 'volley', 'tidewall', 'helix'], ['deckbomb', 'silorocket', 'arsenalsalvo', 'volley', 'rain', 'barrage'],
  ['avalanche', 'icewall', 'lances', 'volley', 'shatter', 'helix'], ['sandspout', 'burrow', 'pinwheel', 'volley', 'barrage', 'rain'],
  ['searchlight', 'ram', 'sweep', 'volley', 'tidewall', 'shatter'], ['icebreak', 'harpoon', 'vortex', 'volley', 'rain', 'helix'],
  ['lightning', 'twister', 'maelstrom', 'volley', 'helix', 'barrage'], ['quake', 'rocketfist', 'orbital', 'cluster', 'scissor', 'march', 'volley', 'helix', 'rain', 'tidewall', 'shatter', 'barrage', 'grid'],
];
export const miniKinds = [['rotorwash', 'sweepgun'], ['skip', 'netgun'], ['cableslide', 'chaff'], ['duneram', 'mortar'], ['ladder', 'lattice'], ['torpfan', 'periscope'], ['featherfan', 'divebomb'], ['gatelaser', 'shielddrones']];
const baseline = new Map();
function base(ch, mini) {
  const key = ch + ':' + mini;
  if (baseline.has(key)) return structuredClone(baseline.get(key));
  const s = mini ? createState(ch) : bossCheckpoint(createState(ch)); s.phase = 'play';
  if (mini) { const plan = SECOND_PLANS[ch - 9]; s.planIdx = plan.length - 1; s.t = plan.at(-1).t - 2; }
  let e;
  for (let f = 0; f < 720; f++) {
    s.p.inv = 1e9; s.p.cd = 1e9; s.p.launchCd = 1e9; s.talk = null;
    step(s, idle); e = s.enemies.find(e => e.type === (mini ? 'mini' : 'boss') + ch);
    if (mini && e?.b > 0) break;
  }
  assert(e); const result = { s, e }; baseline.set(key, structuredClone(result)); return result;
}
export function scenario(ch, kind, mini = false, level = 1) {
  const { s, e } = base(ch, mini);
  s.enemies = [e]; s.bullets = []; s.charges = []; s.beams = []; s.hazards = []; s.gust = null; s.kite = null; s.talk = null;
  s.p.x = 80; s.p.y = 96; s.p.level = level; s.p.inv = 1e9; s.p.cd = 1e9; s.p.launchCd = 1e9; s.coverT = 0; s.hq.slide = 0;
  e.stun = 0; e.cd = 1e9; e.b = Math.max(1, e.b); e.n = 1e9; e.t = 120;
  let phase = !mini && bossKinds[ch - 9].indexOf(kind) === 2 ? 2 : 0;
  /* Atlas's moves are tried in the hardest phase that has them. */
  if (ch === 16 && !mini) phase = kind === 'march' ? 5 : kind === 'grid' ? 3 : kind === 'scissor' ? 2 : ['orbital', 'cluster', 'quake', 'rocketfist'].includes(kind) ? 1 : 0;
  e.a = phase; e.hp = e.maxHp * (phase ? ch === 16 ? FINAL_PHASE_AT[phase - 1] - 0.01 : phase === 2 ? 0.3 : 0.6 : 1); e.shield = 0;
  const [warn, live] = (mini ? SECOND_MINI_TIMING : SECOND_BOSS_TIMING)[kind];
  e.attack = { kind, t: 0, warn, live, recover: mini ? MINI.recover : ch === 10 ? 96 : ch === 16 ? 64 : 72, lockFrames: mini ? 20 : ch === 10 ? 18 : 24, angle: Math.PI, targetX: 80, targetY: 96 };
  return { s, e, a: e.attack };
}
export function advance(s, n = 1) { for (let i = 0; i < n; i++) { s.talk = null; step(s, idle); } }
const everyPattern = [
  ...bossKinds.flatMap((kinds, i) => kinds.map(kind => ({ ch: i + 9, kind, mini: false }))),
  ...miniKinds.flatMap((kinds, i) => kinds.map(kind => ({ ch: i + 9, kind, mini: true }))),
];

test('formations remain separated when the player baits an edge', () => {
  for (const center of [-999, 24, 80, 190, 999]) for (const count of [2, 3, 4]) {
    const xs = spacedPositions(center, count, 44, 24, 224);
    assert.equal(new Set(xs).size, count); assert(xs[0] >= 24 && xs.at(-1) <= 224);
    for (let i = 1; i < xs.length; i++) assert.equal(xs[i] - xs[i - 1], 44);
  }
});
for (const { ch, kind, mini } of everyPattern) test(`${mini ? 'mini' : 'boss'} ${ch - 8} / ${kind}: complete tell, owned hazards and bounded emission`, () => {
  const { s, e, a } = scenario(ch, kind, mini);
  const total = a.warn + a.live + a.recover - 1;
  let peak = 0, marked = false, sawEmission = false;
  const origin = { x: e.x, y: e.y };
  for (let f = 0; f < total; f++) {
    const preparing = a.t < a.warn, recovering = a.t >= a.warn + a.live;
    const before = new Set([...s.bullets, ...s.beams, ...s.charges, ...s.hazards]);
    const splitting = s.bullets.filter(b => b.own === 'e' && b.fuse === 1).map(b => ({ x: b.x, y: b.y, kind: b.splitKind ?? 'needle' }));
    advance(s);
    const ordnance = [...s.bullets.filter(b => b.own === 'e'), ...s.beams, ...s.charges, ...s.hazards];
    const born = ordnance.filter(o => !before.has(o));
    if (preparing) assert.equal(ordnance.length, 0, 'no attack ordnance before its tell ends');
    if (recovering) for (const o of born) assert(splitting.some(p => o.kind === p.kind && Math.hypot(o.x - p.x, o.y - p.y) < 1e-6), 'recovery only finishes already announced airbursts');
    for (const o of ordnance) { assert.equal(o.patternOwner, e.id); assert(Number.isFinite(o.x ?? o.x0)); }
    peak = Math.max(peak, ordnance.length); sawEmission ||= ordnance.length > 0 || e.parts.length > 0;
    if (['duneram', 'divebomb'].includes(kind) && !preparing && !recovering) sawEmission ||= Math.hypot(e.x - origin.x, e.y - origin.y) > 40;
    if (a.t === a.warn - 1) marked = !!(a.lanes?.length || a.cols?.length || a.spots?.length || a.gapX !== undefined || a.gapY !== undefined || a.gapAngle !== undefined);
  }
  assert(marked, 'actual spatial cue before activation'); assert(sawEmission, 'pattern does something'); assert(peak <= (mini ? 64 : 128), `peak ${peak}`);
});

const aimed = ['railshot', 'deckbomb', 'silorocket', 'lances', 'burrow', 'searchlight', 'harpoon', 'vortex', 'lightning', 'rocketfist', 'cluster', 'skip', 'netgun', 'cableslide', 'chaff', 'mortar', 'periscope', 'divebomb', 'shielddrones'];
for (const { ch, kind, mini } of everyPattern.filter(p => aimed.includes(p.kind))) test(`${kind}: a late dodge cannot move a locked target`, () => {
  const { s, a } = scenario(ch, kind, mini); advance(s, a.warn - a.lockFrames + 1);
  const lock = structuredClone({ spots: a.spots, lanes: a.lanes, cols: a.cols, gapAngle: a.gapAngle });
  s.p.x = 164; s.p.y = 38; advance(s, a.lockFrames + 8);
  assert.deepEqual({ spots: a.spots, lanes: a.lanes, cols: a.cols, gapAngle: a.gapAngle }, lock);
});

test('starting a new pattern removes its owner tail and preserves unrelated actors and scenery', () => {
  for (const mini of [false, true]) {
    const { s, e, a } = scenario(9, mini ? 'sweepgun' : 'railshot', mini);
    a.t = a.warn + a.live + a.recover - 1;
    const own = { x: 310, y: 36, vx: 0, vy: 0, r: 2, own: 'e', dmg: 1, kind: 'orb', patternOwner: e.id, life: 999 };
    const other = { ...own, patternOwner: 99999 }; s.bullets = [own, other];
    const scenery = { id: 9000, kind: 'strike', x: 350, w: 8, g: [9999, 10, 2], half: 20, base: 24, t: 0 }; s.hazards = [scenery];
    advance(s, 2); assert(!s.bullets.includes(own)); assert(s.bullets.includes(other)); assert(s.hazards.includes(scenery));
  }
});

test('Sentry lasers emerge from its three visible apertures, without attachment snapping', () => {
  const { s, e, a } = scenario(13, 'ladder', true); advance(s, a.warn);
  for (let i = 0; i < 3; i++) {
    if (i) advance(s, 24);
    else advance(s);
    const beam = s.beams.at(-1), port = miniMuzzle(e, i);
    assert.equal(beam.patternOwner, e.id); assert.equal(beam.ownerId, undefined); assert.equal(beam.x0, port.x); assert.equal(beam.y, port.y);
  }
});

test('Gatekeeper drops its guard for a real counterattack window', () => {
  const { s, e, a } = scenario(16, 'shielddrones', true); advance(s, a.warn + 1); assert.equal(e.guard, 1);
  advance(s, 56); assert.equal(e.guard, 0);
  s.bullets = []; advance(s, 30); assert.equal(s.bullets.filter(b => b.own === 'e').length, 0); assert.equal(e.guard, 0);
});

test('vortex openings point to an exit inside the arena, rather than an off-screen gap', () => {
  for (const y of [30, 80, 140, 184]) {
    const { s, a } = scenario(14, 'vortex'); s.p.y = y; advance(s, a.warn);
    const p = a.spots[0], exitY = p.y + Math.sin(a.gapAngle) * (PATTERN.vortexRadius + 10);
    assert(exitY >= 24 && exitY <= 198, `exit ${exitY}`);
  }
});

test('all boss phase changes are quiet, with no unannounced reinforcements or lingering shots', () => {
  for (let ch = 9; ch <= 16; ch++) {
    const { s, e } = scenario(ch, bossKinds[ch - 9][0]);
    e.hp = e.maxHp * 0.6; e.shield = 0;
    s.bullets.push({ x: 160, y: 96, vx: -1, vy: 0, r: 2, own: 'e', dmg: 1, kind: 'orb', patternOwner: e.id });
    advance(s);
    assert(e.stun > 0); assert.equal(e.attack, undefined); assert.equal(s.bullets.filter(b => b.own === 'e').length, 0);
    assert.equal(s.enemies.length, 1); assert.equal(s.beams.length + s.charges.length + s.hazards.length, 0);
  }
});

test('Cyclone schedules a gust during recovery, not over a live attack', () => {
  const { s, e, a } = scenario(15, 'maelstrom'); e.n = 0;
  advance(s, a.warn + 12); assert.equal(s.gust, null);
  advance(s, a.live); assert(s.gust); assert(s.gust.t < GUST.warn); assert(GUST.push < 1);
});

/* A conservative time-expanded route search. It forecasts the real simulation
   after target lock and checks a full ship, with 4 extra px clearance. Eight-px
   cardinal moves take 5 frames (1.6 px/frame). Weather is compensated by legal
   input: even spray/cold and hurricane countersteering stay below 2.7 px/frame.
   It does not use bombs,
   shields, invulnerability, fast diagonal moves or the space outside x=40..184.
   This establishes sampled geometric routes; it is not human playtesting. */
function routeExists(ch, kind, mini, level, startY) {
  const { s, e, a } = scenario(ch, kind, mini, level);
  s.p.y = startY;
  function hold() {
    const dx = ch === 11 ? -TERRAIN.wind.push : ch === 15 ? Math.sin(s.t / 50) * TERRAIN.turbulence.x : 0;
    const dy = ch === 10 ? TERRAIN.rain.push : ch === 15 ? Math.cos(s.t / 37) * TERRAIN.turbulence.y : 0;
    const ground = ch === 14 ? TERRAIN.cold.slow : ch === 9 && s.p.y + shipSize(level).h > TERRAIN.spray.below ? TERRAIN.spray.slow : 1;
    const pace = ground * (hasUpgrade(s.p, 'hypersonic') ? HYPERSONIC.speed : 1);
    // Bound every cardinal movement plus compensation, not just the idle input.
    for (const [vx, vy] of [[0, 0], [1.6, 0], [-1.6, 0], [0, 1.6], [0, -1.6]])
      assert(Math.hypot((vx - dx) / pace, (vy - dy) / pace) <= 2.7);
    s.talk = null; step(s, { mx: -dx / pace, my: -dy / pace, bomb: false });
    assert(!s.gust, 'isolated forecast must not omit an active gust');
    assert(Math.abs(s.p.x - 80) < 1e-6 && Math.abs(s.p.y - startY) < 1e-6, 'forecast countersteering holds the declared start position');
  }
  for (let f = 0; f < a.warn - a.lockFrames + 1; f++) hold();
  const size = shipSize(level), dx = 8, minX = 40, minY = 24, nx = 19, ny = 21, count = nx * ny;
  const history = [];
  const frames = a.warn + a.live + a.recover - a.t - 1;
  for (let f = 0; f < frames; f++) {
    hold();
    const blocked = new Uint8Array(count), boxes = [];
    for (const enemy of s.enemies) { boxes.push({ x: enemy.x + 2, y: enemy.y + 2, w: enemy.w - 4, h: enemy.h - 4 }); boxes.push(...enemy.parts); }
    for (const b of s.bullets) if (b.own === 'e') boxes.push({ x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 });
    for (const h of s.hazards) boxes.push(...hazardBoxes(h));
    for (const b of s.beams) if (b.t >= b.warn && b.t < b.warn + b.live) boxes.push({ x: 0, y: b.y - b.h / 2, w: b.x0, h: b.h });
    for (const c of s.charges) if (c.kind === 'deckbomb' && c.t >= HYDRA.fuse && c.t < HYDRA.fuse + HYDRA.blast) boxes.push({ x: c.tx - HYDRA.radius, y: c.ty - HYDRA.radius, w: HYDRA.radius * 2, h: HYDRA.radius * 2 });
    for (const box of boxes) {
      const loX = Math.max(0, Math.ceil((box.x - 4 - (size.w - 3) - minX) / dx)), hiX = Math.min(nx - 1, Math.floor((box.x + box.w + 4 - 3 - minX) / dx));
      const loY = Math.max(0, Math.ceil((box.y - 4 - (size.h - 2) - minY) / dx)), hiY = Math.min(ny - 1, Math.floor((box.y + box.h + 4 - 2 - minY) / dx));
      for (let y = loY; y <= hiY; y++) for (let x = loX; x <= hiX; x++) blocked[y * nx + x] = 1;
    }
    history.push(blocked);
  }
  let reachable = new Uint8Array(count); reachable[((startY - minY) / dx) * nx + (80 - minX) / dx] = 1;
  for (let t = 0; t < history.length; t += 5) {
    const occupied = new Uint8Array(count);
    for (let f = t; f < Math.min(t + 5, history.length); f++) for (let i = 0; i < count; i++) occupied[i] |= history[f][i];
    const next = new Uint8Array(count);
    for (let i = 0; i < count; i++) if (reachable[i] && !occupied[i]) for (const j of [i, i % nx ? i - 1 : -1, i % nx < nx - 1 ? i + 1 : -1, i - nx, i + nx]) if (j >= 0 && j < count && !occupied[j]) next[j] = 1;
    if (!next.some(Boolean)) return { pass: false, frame: t, kind, level, x: e.x, y: e.y };
    reachable = next;
  }
  return { pass: true };
}
for (const { ch, kind, mini } of everyPattern) for (const level of [1, 10]) for (const startY of [48, 96, 160]) test(`${kind}: level-${level} ship at y=${startY} has a sampled route after target lock`, () => {
  const result = routeExists(ch, kind, mini, level, startY); assert(result.pass, JSON.stringify(result));
});
