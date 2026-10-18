import assert from 'node:assert/strict';
import test from 'node:test';
import { CHAPTERS, MAX_LEVEL } from '../src/components/games/space-logic.ts';
import { LIMITS, furthest, loadSaved, parseProgress, progressKey, saveSaved, stashGuest } from '../src/components/games/space-progress.ts';

/* A browser's localStorage, for the one the tests run without. */
function freshStorage() {
  const data = new Map();
  globalThis.localStorage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
  return data;
}
const run = (chapter, score = 100) => ({ chapter, score, weapon: 1, level: 1, extra: 0 });

test('the limits a saved run is checked against are the ones the game has', () => {
  assert.equal(LIMITS.chapters, CHAPTERS);
  assert.equal(LIMITS.level, MAX_LEVEL);
});

test('a saved run is read back only if it is one: chapter 2 to 8, whole numbers, clamped', () => {
  assert.deepEqual(parseProgress(run(3, 250)), run(3, 250));
  assert.equal(parseProgress(null), null);
  assert.equal(parseProgress('x'), null);
  assert.equal(parseProgress({ chapter: 3 }), null, 'missing fields');
  assert.equal(parseProgress({ ...run(3), score: Number.NaN }), null);
  assert.equal(parseProgress(run(1)), null, 'there is nothing to continue from before Chapter 2');
  assert.equal(parseProgress(run(9)), null, 'there are eight chapters');
  assert.deepEqual(parseProgress({ chapter: 4.9, score: -5, weapon: 9, level: 99, extra: -1 }), { chapter: 4, score: 0, weapon: 3, level: 10, extra: 0 });
});

test('the run that is further along wins: the later chapter, then the higher score, then the first', () => {
  const a = run(3, 900), b = run(4, 10), c = run(3, 1200);
  assert.equal(furthest(a, b), b);
  assert.equal(furthest(b, a), b);
  assert.equal(furthest(a, c), c);
  assert.equal(furthest(c, a), c);
  assert.equal(furthest(a, { ...a }), a, 'a tie keeps the first');
  assert.equal(furthest(null, a), a);
  assert.equal(furthest(a, null), a);
  assert.equal(furthest(null, null), null);
});

test('a signed-in run is kept under the player\'s own name and nobody else\'s', () => {
  freshStorage();
  assert.equal(loadSaved('nova'), null);
  saveSaved('nova', run(3, 500));
  assert.deepEqual(loadSaved('nova'), run(3, 500));
  assert.equal(loadSaved('rin'), null, 'another account on the same browser starts clean');
  saveSaved('nova', null);
  assert.equal(loadSaved('nova'), null, 'cleared when the whole series is won');
  assert.notEqual(progressKey('nova'), progressKey('rin'));
});

test('a guest who cleared Chapter 1 is carried into the account made next, once', () => {
  const data = freshStorage();
  stashGuest(run(2, 700));
  assert(data.size > 0, 'the clear is noted');
  assert.deepEqual(loadSaved('nova'), run(2, 700), 'the first sign-in picks it up');
  assert.deepEqual(JSON.parse(data.get(progressKey('nova'))), run(2, 700), 'and keeps it under that name');
  assert.equal(loadSaved('rin'), null, 'it is not handed to a second account');
  assert.deepEqual([...data.keys()], [progressKey('nova')], 'the marker is gone');
});

test('what a guest cleared never replaces a run the account already has further along', () => {
  const data = freshStorage();
  saveSaved('nova', run(5, 3000));
  stashGuest(run(2, 700));
  assert.deepEqual(loadSaved('nova'), run(5, 3000));
  assert.deepEqual([...data.keys()], [progressKey('nova')], 'the marker is still cleared');
});

test('the key from before accounts is taken in too, and the furthest of the old and the new wins', () => {
  const data = freshStorage();
  data.set('space-progress-v1', JSON.stringify(run(4, 2000)));
  stashGuest(run(2, 700));
  assert.deepEqual(loadSaved('nova'), run(4, 2000));
  assert.equal(data.has('space-progress-v1'), false);
});

test('storage that cannot be used loses nothing and throws nothing', () => {
  globalThis.localStorage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  assert.equal(loadSaved('nova'), null);
  assert.doesNotThrow(() => saveSaved('nova', run(3)));
  assert.doesNotThrow(() => stashGuest(run(2)));
});

test("a run keeps the chances it has left, and a spent chance is never handed back", async () => {
  const { CHANCES } = await import("../src/components/games/space-progress.ts");
  assert.equal(CHANCES, 2);
  assert.equal(parseProgress({ ...run(3, 250), chances: 1 }).chances, 1);
  assert.equal(parseProgress({ ...run(3, 250), chances: 9 }).chances, CHANCES);
  assert.equal(parseProgress({ ...run(3, 250), chances: -1 }).chances, 0);
  assert.equal(parseProgress(run(3, 250)).chances, undefined, "an old save: the game gives it the full count");
  const fresh = { ...run(4, 900), chances: 2 };
  const spent = { ...run(4, 900), chances: 0 };
  assert.equal(furthest(fresh, spent), spent);
  assert.equal(furthest(spent, fresh), spent);
  assert.equal(furthest({ ...run(5, 100), chances: 2 }, spent).chapter, 5, "a later chapter still wins");
});
