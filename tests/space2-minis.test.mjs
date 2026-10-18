import assert from "node:assert/strict";
import test from "node:test";
import { MINI, MINI_TIMING, SECOND_TIMING, SIGNATURE, createState, isMini, step } from "../src/components/games/space-logic.ts";
import { SECOND_PLANS } from "../src/components/games/space2-plans.ts";

const idle = { mx: 0, my: 0, bomb: false };

/* A Space 2 chapter, its script run on, until the mini boss is on screen. */
function toMini(ch) {
  const s = createState(ch);
  s.phase = "play";
  s.p.x = 40;
  s.p.y = 110;
  for (let f = 0; f < 9000; f++) {
    s.p.inv = 1e9;
    s.p.cd = 1e9;
    s.p.launchCd = 1e9;
    s.talk = null;
    step(s, idle);
    const m = s.enemies.find((e) => isMini(e.type));
    if (m && m.b > 0) return { s, m };
    /* Clear the way so the test gets there quickly. */
    s.enemies = s.enemies.filter((e) => isMini(e.type));
  }
  throw new Error(`no mini boss in chapter ${ch}`);
}

test("every Space 2 chapter's script ends with its own mini boss", () => {
  SECOND_PLANS.forEach((plan, i) => {
    const last = plan[plan.length - 1];
    assert.equal(last.type, `mini${i + 9}`);
  });
});

test("the mini bosses' attacks are their own, each warned, and none of them is a boss's or a Space 1 move", () => {
  const space1 = ["fan", "burst", "missiles", "beam", "spiral", "charge", "curtain", "flare", "support", "nova", ...SIGNATURE];
  for (const [kind, [warn]] of Object.entries(MINI_TIMING)) {
    assert.ok(warn >= 30, `${kind} warns for ${warn}`);
    assert.ok(!space1.includes(kind) && !(kind in SECOND_TIMING), kind);
  }
  assert.equal(Object.keys(MINI_TIMING).length, 16);
});

for (let ch = 9; ch <= 16; ch++) {
  test(`mini boss ${ch - 8}: announced, alternates two attacks, holds back the boss, then leaves crates when destroyed`, () => {
    const { s, m } = toMini(ch);
    assert.equal(s.callout?.kind, "miniboss");
    const kinds = new Set();
    for (let f = 0; f < 600; f++) {
      s.p.inv = 1e9;
      s.talk = null;
      step(s, idle);
      if (m.attack) kinds.add(m.attack.kind);
      assert.equal(s.bossId, 0, "the boss waits while the mini boss is there");
    }
    assert.equal(kinds.size, 2, [...kinds].join(", "));
    /* Ramming it does not destroy it. */
    s.p.x = m.x + 2;
    s.p.y = m.y + 2;
    s.p.inv = 0;
    step(s, idle);
    assert.ok(s.enemies.includes(m), "it is too heavy to ram");
    m.hp = 0;
    s.p.inv = 1e9;
    s.p.x = 40;
    s.p.y = 110;
    step(s, idle);
    assert.ok(!s.enemies.includes(m));
    assert.ok(s.pickups.some((p) => p.kind === "H"), "a repair crate");
    assert.ok(s.pickups.length >= 2, "and a gun");
    assert.ok(s.p.extra > 0, "worth experience");
  });
}

test("a mini boss left alone long enough flies off, and then the boss comes", () => {
  const { s, m } = toMini(9);
  for (let f = 0; f < MINI.stay + 1600 && s.bossId === 0; f++) {
    s.p.inv = 1e9;
    s.talk = null;
    step(s, idle);
  }
  assert.ok(!s.enemies.includes(m) || m.x > 384, "it left");
  assert.notEqual(s.bossId, 0, "the boss arrived");
});
