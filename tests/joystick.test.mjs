import assert from 'node:assert/strict';
import test from 'node:test';
import { DEADZONE, runKeys, stickFrom } from '../src/components/games/joystick-math.ts';

const close = (a, b, msg) => assert(Math.abs(a - b) < 1e-9, `${msg ?? ''} ${a} vs ${b}`);

test('a thumb in the middle of the stick reports nothing, though the knob follows it', () => {
  const v = stickFrom(3, -2, 40);
  assert.equal(v.x, 0);
  assert.equal(v.y, 0);
  close(v.kx, 3);
  close(v.ky, -2);
  assert.deepEqual(stickFrom(0, 0, 40), { x: 0, y: 0, kx: 0, ky: 0 });
});

test('the dead zone ends where it says, and the push grows smoothly from zero there to one at the rim', () => {
  const edge = DEADZONE * 40;
  assert.equal(stickFrom(edge - 0.01, 0, 40).x, 0);
  assert(stickFrom(edge + 1e-6, 0, 40).x < 1e-6, "it starts from zero right past the dead zone");
  const half = stickFrom(20, 0, 40).x;
  assert(half > 0 && half < 1, `half way is ${half}`);
  close(half, (0.5 - DEADZONE) / (1 - DEADZONE));
  close(stickFrom(40, 0, 40).x, 1);
  let last = -1;
  for (let d = 0; d <= 40; d += 2) {
    const x = stickFrom(d, 0, 40).x;
    assert(x >= last, 'never less as the thumb goes further');
    last = x;
  }
});

test('past the rim the knob stays on it and the push stays at one, in whatever direction', () => {
  for (const [dx, dy] of [[100, 0], [-100, 0], [0, 100], [0, -100], [70, 70], [-30, 90]]) {
    const v = stickFrom(dx, dy, 40);
    close(Math.hypot(v.kx, v.ky), 40, 'the knob is on the rim');
    close(Math.hypot(v.x, v.y), 1, 'full push');
    close(Math.sign(v.x), Math.sign(dx) || 0);
    close(Math.sign(v.y), Math.sign(dy) || 0);
  }
});

test('the push points the way the thumb went, with y growing downward like the screen', () => {
  const up = stickFrom(0, -30, 40);
  assert(up.y < 0 && up.x === 0, 'up is negative');
  const down = stickFrom(0, 30, 40);
  assert(down.y > 0);
  const diagonal = stickFrom(25, 25, 40);
  close(diagonal.x, diagonal.y, 'a diagonal is the same each way');
  assert(Math.hypot(diagonal.x, diagonal.y) <= 1 + 1e-9);
});

test('a stick with no size does not divide by zero', () => {
  for (const radius of [0, -5, Number.NaN]) assert.deepEqual(stickFrom(10, 10, radius), { x: 0, y: 0, kx: 0, ky: 0 });
});

test('a platformer runs only when the stick is pushed a good way over, and never both ways', () => {
  assert.deepEqual(runKeys(0), { left: false, right: false });
  assert.deepEqual(runKeys(0.2), { left: false, right: false });
  assert.deepEqual(runKeys(0.35), { left: false, right: true });
  assert.deepEqual(runKeys(-0.35), { left: true, right: false });
  assert.deepEqual(runKeys(1), { left: false, right: true });
  assert.deepEqual(runKeys(-1), { left: true, right: false });
  for (let x = -1; x <= 1; x += 0.05) {
    const k = runKeys(x);
    assert(!(k.left && k.right));
  }
});
