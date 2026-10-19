import assert from "node:assert/strict";
import test from "node:test";
import { SagaMusic, SONGS as SPACE2 } from "../src/components/games/space2-music.ts";
import { SPACE3_SONGS } from "../src/components/games/space3-music.ts";
import { ALBUMS, trackTitle } from "../src/lib/soundtrack.ts";

const IDS = Object.keys(SPACE3_SONGS);
const cellsOf = (bar) => bar[0].trim().split(/\s+/).length;

function playback(id) {
  const song = SPACE3_SONGS[id], engine = new SagaMusic(), ctx = { currentTime: 0 }, events = [];
  const total = song.bars.reduce((n, b) => n + cellsOf(b), 0);
  engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
  for (const method of ["voice", "bass", "drum", "riser"]) engine[method] = (...args) => events.push({ step: engine.step, method, args });
  try {
    engine.start(ctx, {}, id);
    for (let i = 0; i < total; i++) { ctx.currentTime = engine.nextTime; engine.schedule(); }
    return events;
  } finally { engine.stop(); }
}

test("Space 3 lists its tunes as its own album and every one plays through the shared scheduler", () => {
  assert.deepEqual(ALBUMS.space3.map((t) => t.engine).sort(), [...IDS].sort());
  assert.ok(ALBUMS.space3.every((t) => t.album === "space3" && trackTitle(t, "en") === trackTitle(t, "ms")), "English in both languages");
  for (const id of IDS) {
    const events = playback(id);
    assert.ok(events.some((e) => e.method === "voice"), `${id} sounds`);
    assert.ok(events.some((e) => e.method === "bass"), `${id} has a bass`);
  }
});

test("the tunes use all three meters, and the fierce ones change band with each part", () => {
  const meters = new Set(IDS.flatMap((id) => SPACE3_SONGS[id].bars.map(cellsOf)));
  assert.deepEqual([...meters].sort(), [12, 14, 16]);
  for (const id of ["s3stage1", "s3stage2", "s3stage3", "s3boss1", "s3boss2", "s3boss3", "s3boss4"]) {
    const song = SPACE3_SONGS[id];
    assert.ok(song.sections.length >= 5, `${id} sections`);
    const leads = new Set([song.lead, ...song.sections.map((s) => s.lead).filter(Boolean)]);
    assert.ok(leads.size >= 3, `${id} lead voices: ${[...leads]}`);
    assert.ok(song.crashes.length >= 5 && song.fills.length >= 5, `${id} marks its parts with crashes and fills`);
  }
});

test("the victory fanfare plays once and hands on to the hangar", () => {
  assert.equal(SPACE3_SONGS.s3victory.once, true);
  assert.equal(SPACE3_SONGS.s3victory.then, "s3hangar");
});
