import assert from "node:assert/strict";
import test from "node:test";
import { SagaMusic, SONGS } from "../src/components/games/space2-music.ts";
import { cells, midiOf } from "../src/components/games/space-music.ts";

const song = SONGS.s2bonus12;
const lengths = song.bars.map((b) => b[0].trim().split(/\s+/).length);

test("Final Extremity II is a separate complete bonus suite with a connected melody and valid counter-lines", () => {
  assert.equal(song.bars.length, 60);
  assert.ok(!song.once && !song.intro && !song.then);
  assert.deepEqual([...new Set(lengths)].sort(), [12, 14, 16]);
  const lead = song.bars.flatMap((b) => cells(b[0], midiOf));
  assert.ok(lead.every((n) => Number.isFinite(n.value) && n.value >= midiOf("C4") && n.value <= midiOf("G6")));
  for (let i = 0; i < lead.length; i++) assert.ok(Math.abs(lead[i].value - lead[(i + 1) % lead.length].value) <= 12, `melody join ${i}, including loop`);
  for (const [i, bar] of song.bars.entries()) if (bar[3]) {
    assert.equal(bar[3].split(/\s+/).length, lengths[i], `counter fits bar ${i + 1}`);
    assert.ok(cells(bar[3], midiOf).every((n) => Number.isFinite(n.value)));
  }
  assert.ok(song.bars.filter((b) => b[3]).length >= 12, "written counterpoint across the suite");
  assert.equal(song.bars[48][1], "F#m", "climax reaches a new tonal centre");
  assert.equal(song.bars.at(-1)[1], song.bars[0][1], "return to the opening tonic");
  assert.notDeepEqual(song.bars.slice(0, 4), SONGS.s2bonus10.bars.slice(0, 4), "new thematic material");
});

// Exercise the real scheduler and playStep, replacing only the sound-producing
// leaves. This checks section selection, optional-voice removal and loop reset.
function tracePlayback(id, loops) {
  const tune = SONGS[id], steps = tune.bars.reduce((n, b) => n + b[0].split(/\s+/).length, 0);
  const engine = new SagaMusic(), ctx = { currentTime: 0 }, calls = [];
  let loop = 0, previous = -1;
  const original = engine.playStep;
  engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
  for (const method of ["voice", "bass", "drum", "riser"]) engine[method] = (...args) => calls.push({ loop, step: engine.step, method, args });
  engine.playStep = function (...args) {
    if (args[2] < previous) loop++;
    previous = args[2];
    return original.apply(this, args);
  };
  try {
    engine.start(ctx, {}, id);
    for (let i = 0; i < steps * loops; i++) {
      ctx.currentTime = engine.nextTime;
      engine.schedule();
      if (loop >= loops) break;
    }
    assert.ok(loop >= loops - 1, "scheduler crosses the loop boundary");
    return calls;
  } finally { engine.stop(); }
}

test("section orchestration changes in playback and resets when Final Extremity II loops", () => {
  const calls = tracePlayback("s2bonus12", 2);
  const start = (bar) => lengths.slice(0, bar).reduce((a, b) => a + b, 0);
  const at = (bar, loop = 0) => calls.filter((c) => c.loop === loop && c.step >= start(bar) && c.step < start(bar + 1));
  const voices = (events) => new Set(events.filter((c) => c.method === "voice").map((c) => c.args[0]));
  for (const loop of [0, 1]) {
    assert.ok(voices(at(0, loop)).has("organ"));
    assert.ok(!voices(at(0, loop)).has("lead"), "intro drops the synth layer, including after loop reset");
    assert.ok(voices(at(4, loop)).has("lead"), "full band enters");
    assert.ok(voices(at(24, loop)).has("harp"), "lament changes accompaniment");
    assert.ok(!voices(at(24, loop)).has("organ") && !voices(at(24, loop)).has("lead"), "lament removes both heavy voices");
    assert.ok(voices(at(36, loop)).has("organ") && voices(at(36, loop)).has("lead"), "reprise restores the doubled lead");
    assert.ok(at(35, loop).some((c) => c.method === "drum" && c.args[0] === "t"), "transition fill plays");
    assert.ok(at(34, loop).some((c) => c.method === "riser"), "riser starts on the intended bar");
  }
});

test("tracks without section orchestration retain their original instrument choices", () => {
  const calls = tracePlayback("s2stage", 1);
  const voices = new Set(calls.filter((c) => c.method === "voice").map((c) => c.args[0]));
  const own = SONGS.s2stage;
  assert.ok(voices.has(own.lead));
  assert.ok(!voices.has("harp") && !voices.has("bell"));
  assert.ok(!own.sections);
});
