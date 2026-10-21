import assert from "node:assert/strict";
import test from "node:test";
import { SagaMusic } from "../src/components/games/space2-music.ts";
import { SELF_TITLED } from "../src/components/games/self-titled-music.ts";
import { MIDI_ALTERNATES } from "../src/components/games/self-titled-midi-alternates.ts";
import * as phrases from "../src/components/games/self-titled-midi-phrases.ts";
import { ALBUMS, trackTitle } from "../src/lib/soundtrack.ts";

test("Self-Titled lists both MIDI-shaped battles in the player and studio alongside its other songs", () => {
  assert.deepEqual(ALBUMS.selftitled.map((t) => t.engine), Object.keys(SELF_TITLED));
  for (const [id, song] of Object.entries(MIDI_ALTERNATES)) {
    const track = ALBUMS.selftitled.find((t) => t.engine === id);
    assert.ok(trackTitle(track, "en").startsWith("Battle: ") && !/alternate|saga|seymour/i.test(trackTitle(track, "en")), "a title of its own");
    assert.ok(trackTitle(track, "ms").startsWith("Pertempuran: "));
    const exported = SagaMusic.score(id);
    assert.equal(exported.bpm, song.bpm);
    assert.ok(exported.parts.some((p) => p.voice === "drums"));
    for (const part of exported.parts) for (const note of part.notes) {
      assert.ok(Number.isInteger(note.pitch) && note.pitch >= 0 && note.pitch <= 127, `${id}/${part.name}: valid pitch`);
      assert.ok(Number.isFinite(note.step) && note.step >= 0);
      assert.ok(Number.isFinite(note.steps) && note.steps > 0);
      assert.ok(Number.isFinite(note.vel) && note.vel > 0 && note.vel <= 1);
    }
  }
});

test("the phrases are written new, not taken from the reference MIDI files, and every line is a whole bar", () => {
  /* The references' best-known openings must not come back (docs/composition-method.md). */
  assert.notEqual(phrases.RS_HOOK[0], "C#5 - - - - - - - - - B4 - F#4 - B4 -");
  assert.notEqual(phrases.SEY_CASCADE[0].split(" ").slice(0, 4).join(" "), "E6 A5 B5 F#5");
  assert.notEqual(phrases.SEY_BASS[0], "E3 - B2 - D3 B2 - B2 E3 - B2 - D3 - B2 -");
  assert.notEqual(phrases.RS_BASS[0], "B2 - B2 - B2 - A2 - B2 - B2 - B2 - F#2 -");
  for (const lines of Object.values(phrases)) for (const line of lines) {
    assert.equal(line.split(" ").length, 16);
    assert.notEqual(line[0], "-", "no orphaned hold at a bar boundary");
  }
});

test("arrangements preserve space for the piano introduction and use a shorter meter in the cathedral bridge", () => {
  const piano = SagaMusic.score("self:battle4");
  const intro = piano.parts.flatMap((p) => p.notes.filter((n) => n.step < 64).map(() => p.voice));
  assert.ok(intro.length > 0 && intro.every((voice) => voice === "piano"));
  const song = MIDI_ALTERNATES["self:battle4"];
  assert.ok(song.bars.slice(48, 56).every((b) => b[0].split(" ").length === 14));
  assert.ok(song.performance.slice(48, 56).every((p) => p.kit.split(" ").length === 14));
  assert.equal(song.sections.find((s) => s.from === 56).lead, "brass");
  assert.equal(MIDI_ALTERNATES["self:battle3"].sections.find((s) => s.from === 4).lead, "trumpet", "the hook on the trumpet");
  assert.equal(MIDI_ALTERNATES["self:battle3"].sections.find((s) => s.from === 52).lead, "trumpet");
  assert.equal(song.sections.find((s) => s.from === 24).lead, "brass", "the G minor answer on the brass");
});

test("both arrangements schedule past their endings into their intended loop without losing the melody", () => {
  for (const [id, song] of Object.entries(MIDI_ALTERNATES)) {
    const engine = new SagaMusic(), ctx = { currentTime: 0 }, events = [];
    const total = song.bars.reduce((n, b) => n + b[0].split(" ").length, 0);
    const stepSec = 15 / song.bpm;
    const loop = song.bars.slice(0, song.intro).reduce((n, b) => n + b[0].split(" ").length, 0);
    engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
    engine.record = () => {};
    for (const method of ["voice", "bass", "drum", "riser"]) engine[method] = (...args) => events.push({ method, step: engine.step, args });
    try {
      engine.start(ctx, {}, id, (total - 4) * stepSec);
      for (let i = 0; i < 16; i++) { ctx.currentTime = engine.nextTime; engine.schedule(); }
      assert.ok(events.some((e) => e.method === "voice" && e.step >= loop && e.step < loop + 16), `${id}: melody after wrap`);
      assert.ok(engine.step >= loop && engine.step < total - 4, `${id}: loops after its intro`);
      assert.ok(events.every((e) => e.args.every((arg) => typeof arg !== "number" || Number.isFinite(arg))));
    } finally { engine.stop(); }
  }
});
