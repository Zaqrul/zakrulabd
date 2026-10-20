import assert from "node:assert/strict";
import test from "node:test";
import { NesMusic, SONGS as SPACE1 } from "../src/components/games/space-music.ts";
import { SagaMusic, SONGS as SPACE2 } from "../src/components/games/space2-music.ts";

/* A fader that records what is asked of it. */
const fader = () => {
  const calls = [];
  return {
    calls,
    gain: {
      value: 1,
      cancelScheduledValues: () => calls.push("cancel"),
      setValueAtTime: (v, t) => calls.push(["set", v, t]),
      linearRampToValueAtTime: (v, t) => calls.push(["ramp", v, t]),
    },
    disconnect: () => calls.push("disconnect"),
  };
};

function sagaWith(ctx) {
  const engine = new SagaMusic();
  engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
  for (const method of ["voice", "bass", "drum", "riser"]) engine[method] = () => {};
  engine.ctx = ctx;
  return engine;
}

test("a looping Space 2 tune picked up again begins part-way through, in steps of its tempo", () => {
  const ctx = { currentTime: 0 }, song = SPACE2.s2stage, stepSec = 60 / song.bpm / 4;
  const fresh = sagaWith(ctx);
  fresh.start(ctx, {}, "s2stage");
  const first = fresh.step;
  fresh.stop();
  const resumed = sagaWith(ctx);
  resumed.start(ctx, {}, "s2stage", 7.3);
  const wanted = Math.floor(7.3 / stepSec);
  assert.ok(resumed.step >= wanted && resumed.step < wanted + 12, `step ${resumed.step} from ${wanted}`);
  assert.ok(resumed.step > first, "it did not start from the top");
  resumed.stop();
});

test("a position past the end of a loop wraps, and a tune that plays once always starts from the top", () => {
  const ctx = { currentTime: 0 };
  const engine = sagaWith(ctx);
  engine.start(ctx, {}, "s2stage", 100000);
  assert.ok(Number.isFinite(engine.step) && engine.step >= 0, "wrapped to a real step");
  engine.stop();
  const once = sagaWith(ctx);
  once.start(ctx, {}, "s2victory", 5);
  assert.ok(once.step < 12, `a one-shot starts at the beginning (step ${once.step})`);
  once.stop();
});

test("stopping with a fade ramps the tune's fader to silence and gives the next tune a mixer of its own", () => {
  const ctx = { currentTime: 2 };
  const engine = sagaWith(ctx);
  engine.start(ctx, {}, "s2stage");
  const f = fader();
  engine.fader = f;
  engine.stop(0.25);
  assert.deepEqual(f.calls.slice(0, 3), ["cancel", ["set", 1, 2], ["ramp", 0, 2.25]]);
  assert.equal(engine.fader, null, "the next tune builds a fresh fader");
  assert.equal(engine.bus, null, "and a fresh bus");
  assert.equal(engine.timer, null, "scheduling has stopped");
});

test("stopping without a fade, or with no fader (silence, or a test double), does not throw and cuts at once", () => {
  const ctx = { currentTime: 0 };
  const engine = sagaWith(ctx);
  engine.start(ctx, {}, "s2stage");
  assert.doesNotThrow(() => engine.stop(0.25), "no fader to fade");
  const again = sagaWith(ctx);
  again.start(ctx, {}, "s2stage");
  const f = fader();
  again.fader = f;
  again.stop();
  assert.deepEqual(f.calls, [], "a plain stop leaves the fader alone");
});

test("Space's chip engine picks up a looping tune part-way and fades the old one when the tune changes", () => {
  const ctx = { currentTime: 0 }, song = SPACE1.stage, stepSec = 60 / song.bpm / 4;
  const engine = new NesMusic();
  engine.prepare = (audio, out) => { engine.ctx = audio; engine.out = out; };
  for (const method of ["pulse", "triangle", "drum"]) engine[method] = () => {};
  engine.start(ctx, {}, "stage", 9);
  const wanted = Math.floor(9 / stepSec);
  assert.ok(engine.step >= wanted && engine.step < wanted + 12, `step ${engine.step} from ${wanted}`);
  const f = fader();
  engine.fader = f;
  engine.stop(0.25);
  assert.deepEqual(f.calls.slice(0, 3), ["cancel", ["set", 1, 0], ["ramp", 0, 0.25]]);
  assert.equal(engine.playing, null);
});
