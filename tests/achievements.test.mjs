import assert from "node:assert/strict";
import test from "node:test";
import { ACHIEVEMENTS, BY_GAME, GAME_IDS, TIERS } from "../src/lib/achievements-data.ts";
import { derive, evaluate, fill, longestStreak, overall, progressOf } from "../src/lib/achievements.ts";

const fresh = () => ({ v: 1, stats: {}, unlocked: {}, counters: {}, days: [] });

test("every achievement has a unique id, both languages, and a sensible target", () => {
  const ids = new Set();
  for (const a of ACHIEVEMENTS) {
    assert.ok(!ids.has(a.id), `duplicate ${a.id}`);
    ids.add(a.id);
    assert.ok(a.name[0] && a.name[1] && a.desc[0] && a.desc[1], `${a.id} lacks words`);
    assert.ok(a.min > 0);
  }
});

test("the Space series is the whole library, each campaign has plenty to earn, and the player has their own", () => {
  assert.deepEqual([...GAME_IDS], ["space", "space2"]);
  for (const g of GAME_IDS) assert.ok(BY_GAME[g].length >= 18, `${g} has only ${BY_GAME[g].length}`);
  assert.ok(BY_GAME.player.length >= 20);
  for (const g of GAME_IDS) assert.equal(TIERS[g].length, 6);
  for (const g of GAME_IDS) assert.ok(TIERS[g].every((n, i, a) => i === 0 || n > a[i - 1]), `${g} tiers climb`);
  /* Every player achievement that counts achievements can be earned with what exists. */
  const most = Math.max(...BY_GAME.player.filter((a) => a.stat === "unlocked").map((a) => a.min));
  assert.ok(most < ACHIEVEMENTS.length, `${most} of ${ACHIEVEMENTS.length}`);
});

test("a stat reaching its target earns the achievement, once", () => {
  const s = fresh();
  s.stats.space = { chapter: 3 };
  const first = evaluate(s, ["space"], 100);
  const ids = first.map((a) => a.id);
  assert.ok(ids.includes("space.chapter.1") && ids.includes("space.chapter.3"));
  assert.ok(!ids.includes("space.chapter.4"));
  assert.equal(s.unlocked["space.chapter.1"], 100);
  assert.deepEqual(evaluate(s, ["space"], 200), []);
  assert.equal(s.unlocked["space.chapter.1"], 100, "the time it was earned does not move");
});

test("score tiers follow the best score", () => {
  const s = fresh();
  s.stats.space = { score: 8000 };
  const ids = evaluate(s, ["space"]).map((a) => a.id);
  assert.deepEqual(ids.filter((i) => i.includes(".score.")).sort(), ["space.score.t1", "space.score.t2"]);
});

test("the player's achievements follow what both campaigns add up to, including each other", () => {
  const s = fresh();
  s.stats.space = { opens: 1, score: 10000000 };
  let ids = evaluate(s).map((a) => a.id);
  assert.ok(ids.includes("player.gamesPlayed.1"));
  assert.ok(!ids.includes("player.gamesPlayed.2"));
  assert.ok(ids.includes("player.tier6.1"), "a Legend score");
  assert.ok(!ids.includes("player.tier6.2"));
  s.stats.space2 = { opens: 1, score: 10000000 };
  ids = evaluate(s).map((a) => a.id);
  assert.ok(ids.includes("player.gamesPlayed.2"));
  assert.ok(ids.includes("player.tier6.2"), "Legend in both");
  assert.ok(ids.includes("player.unlocked.10"), "earning those earned the collector ones");
  const d = derive(s);
  assert.equal(d.tier6, 2);
});

test("playing on consecutive days builds a streak, and a gap breaks it", () => {
  assert.equal(longestStreak([]), 0);
  assert.equal(longestStreak(["2026-03-01"]), 1);
  assert.equal(longestStreak(["2026-03-01", "2026-03-02", "2026-03-03"]), 3);
  assert.equal(longestStreak(["2026-03-01", "2026-03-02", "2026-03-05", "2026-03-06", "2026-03-07", "2026-03-08"]), 4);
  assert.equal(longestStreak(["2026-02-28", "2026-03-01"]), 2, "across the end of a month");
});

test("finishing every achievement of a campaign counts as completing it", () => {
  const s = fresh();
  for (const a of BY_GAME.space) s.unlocked[a.id] = 1;
  assert.equal(derive(s).completed, 1);
  assert.deepEqual(progressOf(s, "space"), { done: BY_GAME.space.length, total: BY_GAME.space.length });
  assert.equal(overall(s).done, BY_GAME.space.length);
});

test("the game's name goes where {game} is", () => {
  assert.equal(fill("Score 500 in {game}.", "Space"), "Score 500 in Space.");
});
