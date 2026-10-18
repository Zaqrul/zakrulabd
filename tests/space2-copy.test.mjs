import assert from 'node:assert/strict';
import test from 'node:test';
import { SPACE2_STORY, SPACE2_SPEAKERS, SPACE2_EVENTS } from '../src/components/games/space2-story.ts';
import { SPACE2_COPY, SPACE2_CHAPTERS, SPACE2_ACHIEVEMENTS, space2ChapterName } from '../src/components/games/space2-copy.ts';

test('all eight engine chapters have bilingual intro, boss and outro scenes', () => {
  const expected = Array.from({ length: 8 }, (_, i) => ['intro', 'boss', 'outro'].map(part => `c${i + 9}-${part}`)).flat();
  for (const lang of ['en', 'ms']) assert.deepEqual(Object.keys(SPACE2_STORY[lang]).sort(), [...expected].sort());
  for (const key of expected) {
    const en = SPACE2_STORY.en[key], ms = SPACE2_STORY.ms[key];
    assert.deepEqual(en.map(line => line.who), ms.map(line => line.who), key);
    assert(en.some(line => line.who === 'halo'), `${key}: Halo must participate`);
    for (const line of [...en, ...ms]) {
      assert(SPACE2_SPEAKERS[line.who], `${key}: unknown speaker`);
      assert(line.text.trim().length > 0 && line.text.length <= 180, `${key}: dialogue too long`);
      assert(!line.text.includes('\uFFFD'), `${key}: invalid encoding`);
    }
  }
});

test('player-facing chapter names map 9–16 to 1–8 without leaking engine numbers', () => {
  for (let i = 0; i < 8; i++) {
    assert.equal(SPACE2_CHAPTERS[i].engine, i + 9);
    assert.equal(SPACE2_CHAPTERS[i].chapter, i + 1);
    assert(space2ChapterName('en', i + 9).startsWith(`Chapter ${i + 1}: `));
    assert(space2ChapterName('ms', i + 9).startsWith(`Bab ${i + 1}: `));
  }
  for (const invalid of [0, 1, 8, 17, 9.5, NaN]) assert.equal(space2ChapterName('en', invalid), null);
});

test('the second final boss has its own transition, before the campaign outro', () => {
  for (const lang of ['en', 'ms']) {
    const transition = SPACE2_EVENTS[lang].judgement;
    assert(transition.some(line => line.text.includes('Judgement')));
    assert(transition.some(line => line.who === 'halo'));
    assert(SPACE2_STORY[lang]['c16-outro'].some(line => line.text.includes('Judgement')));
  }
});

test('UI copy exposes the same nonempty fields in both languages', () => {
  const keys = (value, path = '') => Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' ? keys(child, `${path}${key}.`) : [`${path}${key}`]);
  assert.deepEqual(keys(SPACE2_COPY.en), keys(SPACE2_COPY.ms));
  for (const lang of ['en', 'ms']) {
    assert(SPACE2_COPY[lang].guide.includes('100 XP'));
    for (const call of Object.values(SPACE2_COPY[lang].calls)) {
      assert(SPACE2_SPEAKERS[call.who]);
      assert(call.text.length <= 100);
    }
  }
});

test('achievement IDs are unique and scoped to Space 2 with paired text', () => {
  assert.equal(new Set(SPACE2_ACHIEVEMENTS.map(a => a.id)).size, SPACE2_ACHIEVEMENTS.length);
  for (const achievement of SPACE2_ACHIEVEMENTS) {
    assert.equal(achievement.game, 'space2');
    assert(achievement.id.startsWith('space2.'));
    assert(achievement.min > 0);
    for (const pair of [achievement.name, achievement.desc]) {
      assert.equal(pair.length, 2);
      assert(pair.every(text => typeof text === 'string' && text.trim().length > 0));
    }
  }
  assert.deepEqual(SPACE2_ACHIEVEMENTS.filter(a => a.stat === 'chapter').map(a => a.min), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const stat of ['minirocketUses', 'bloomUses', 'hyperbeamUses', 'bloomBlocks', 'hyperbeamMultiKill', 'noHitChapters', 'orbCovers']) {
    assert(SPACE2_ACHIEVEMENTS.some(a => a.stat === stat), `missing ${stat}`);
  }
});
