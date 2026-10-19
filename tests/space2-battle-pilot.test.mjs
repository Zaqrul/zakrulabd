import assert from "node:assert/strict";
import test from "node:test";
import { ALTERNATE_SONGS, SagaMusic, SONGS } from "../src/components/games/space2-music.ts";
import { midiOf } from "../src/components/games/space-music.ts";

function playback(id) {
  const song = ALTERNATE_SONGS[id] ?? SONGS[id], engine = new SagaMusic(), ctx = { currentTime: 0 }, events = [];
  const total = song.bars.reduce((n, b) => n + b[0].split(/\s+/).length, 0);
  engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
  for (const method of ["voice", "bass", "drum", "riser"]) engine[method] = (...args) => events.push({ step: engine.step, method, args });
  try {
    engine.start(ctx, {}, id);
    for (let i = 0; i < total; i++) { ctx.currentTime = engine.nextTime; engine.schedule(); }
    return events;
  } finally { engine.stop(); }
}

test("Ascension's Battle Theme (Variation 1) plays its written drums, accents and articulation, and changes band by part", () => {
  const events = playback("alt:s2stage"), song = ALTERNATE_SONGS["alt:s2stage"];
  const at = (step, method) => events.filter((e) => e.step === step && e.method === method);
  const start = (bar) => song.bars.slice(0, bar).reduce((n, b) => n + b[0].split(/\s+/).length, 0);
  assert.equal(song.bars.length, 24);
  const theme = start(2);
  assert.deepEqual(new Set(at(theme, "drum").map((e) => e.args[0])), new Set(["k", "h", "c"]), "the theme opens on a crash");
  assert.deepEqual(new Set(at(theme + 4, "drum").map((e) => e.args[0])), new Set(["s"]), "the backbeat");
  assert.ok(at(theme + 2, "drum").every((e) => e.args[2] === song.performance[2].drumAccents[2]));
  const hook = at(theme + 3, "voice").find((e) => e.args[0] === "trumpet");
  assert.equal(hook.args[1], midiOf("A5"));
  assert.ok(Math.abs(hook.args[3] - 3 * (60 / song.bpm / 4) * 0.9) < 1e-9, "the gate shortens the note");
  assert.ok(at(start(10), "voice").some((e) => e.args[0] === "violin"), "the violin takes the 7/8");
  assert.ok(at(start(10), "bass").every((e) => e.args[3] === "slap"));
  assert.ok(at(start(14), "voice").some((e) => e.args[0] === "guitar"), "the guitar takes the half-time break");
  assert.deepEqual(new Set(at(start(14) + 4, "drum").map((e) => e.args[0])), new Set(["h"]), "half time: no backbeat on two");
  assert.ok(song.bars.every((b) => !["gallop16", "drive16", "six12", "seven14"].includes(b[2])), "the bass moves in eighths at most");
});

test("the original Space 2 battle retains its default kit and root-relative bass", () => {
  const events = playback("s2stage");
  assert.ok(!SONGS.s2stage.performance);
  const bass = events.find((e) => e.step === 0 && e.method === "bass");
  assert.equal(bass.args[0], midiOf("A2"));
  assert.deepEqual(new Set(events.filter((e) => e.step === 0 && e.method === "drum").map((e) => e.args[0])), new Set(["k", "c"]));
});
