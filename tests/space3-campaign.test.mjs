import assert from "node:assert/strict";
import test from "node:test";
import { campaignOf, createState, isSecond, isThird, placeOf } from "../src/components/games/space-logic.ts";

test("chapters 1-8 are Space 1, 9-16 Space 2, 17-28 Space 3", () => {
  const of = (c) => campaignOf(c);
  assert.deepEqual([1, 8, 9, 16, 17, 28].map(of), [1, 1, 2, 2, 3, 3]);
  assert.deepEqual([1, 8, 9, 16, 17, 28].map(isThird), [false, false, false, false, true, true]);
});

test("Space 3 flies Space 2's ship, but has none of Space 2's places", () => {
  assert.equal(isSecond(17), true);
  for (let c = 1; c <= 8; c++) assert.equal(placeOf({ chapter: c }), 0);
  for (let c = 9; c <= 16; c++) assert.equal(placeOf({ chapter: c }), c - 8, "Space 2 keeps its eight places");
  for (let c = 17; c <= 28; c++) assert.equal(placeOf({ chapter: c }), 0);
  const s = createState(17);
  assert.equal(s.kite, null, "Space 3 leaves Kite behind");
  assert.ok(s.p.shield > 0, "the shield comes with the ship");
});
