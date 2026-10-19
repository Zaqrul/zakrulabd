import assert from "node:assert/strict";
import test from "node:test";
import { ALTERNATE_SONGS, SagaMusic, SONGS } from "../src/components/games/space2-music.ts";
import { ASCENSION_PROFILES, arrangeAscension } from "../src/components/games/space2-ascension.ts";
import { ALBUMS, trackTitle } from "../src/lib/soundtrack.ts";
import { cells, midiOf } from "../src/components/games/space-music.ts";

test("Ascension covers the entire Space 2 album in order with separate engine identities", () => {
  assert.equal(Object.keys(ALTERNATE_SONGS).length, Object.keys(SONGS).length);
  assert.deepEqual(Object.keys(ASCENSION_PROFILES).sort(), Object.keys(SONGS).sort());
  /* The original album is the game's tunes; Ascension is those in the same order, then the bonus tracks. */
  const own = ALBUMS.space2.filter((t) => !t.bonus);
  assert.equal(ALBUMS.space2alt.filter((t) => !t.bonus).length, own.length);
  assert.ok(ALBUMS.space2alt.every((t) => !t.bonus), "Ascension lists no bonus tracks");
  own.forEach((original, i) => {
    const alt = ALBUMS.space2alt[i];
    assert.equal(alt.engine, `alt:${original.engine}`);
    assert.equal(alt.album, "space2alt");
    assert.equal(alt.bonus, original.bonus);
    for (const lang of ["en", "ms"]) assert.equal(trackTitle(alt, lang), trackTitle(original, lang));
  });
});

test("alternate arrangement leaves every original score and its nested sections intact", () => {
  const before = JSON.stringify(SONGS);
  const freeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  const copies = structuredClone(SONGS);
  const result = arrangeAscension(freeze(copies));
  assert.equal(JSON.stringify(SONGS), before);
  for (const [id, song] of Object.entries(SONGS)) {
    const alt = result[`alt:${id}`];
    assert.notStrictEqual(alt, copies[id]);
    assert.notStrictEqual(alt.bars, copies[id].bars);
    assert.equal(alt.transpose, song.transpose);
    assert.equal(alt.intro, song.intro);
    assert.equal(alt.once, song.once);
    // Final Extremity II is the new Codex suite commissioned in this session;
    // every other entry replaces its previous lead score entirely.
    if (!["s2bonus12", "s2bonus13", "s2bonus14"].includes(id)) {
      assert.notDeepEqual(alt.bars.map((b) => b[0]), song.bars.map((b) => b[0]), `${id}: replacement melody`);
      assert.notEqual(alt.bars[0][0], song.bars[0][0], `${id}: original opening replaced`);
    }
    assert.notDeepEqual(alt, song, `${id}: audible arrangement change`);
  }
});

test("all alternate scores have valid counter-lines, compatible meter and ordered section boundaries", () => {
  const pitches = (line) => cells(line, midiOf).map((n) => n.value);
  for (const [id, song] of Object.entries(ALTERNATE_SONGS)) {
    assert.ok(song.bpm >= 60 && song.bpm <= 200, id);
    for (const [i, [lead, , , counter]] of song.bars.entries()) {
      const length = lead.split(/\s+/).length;
      assert.ok([12, 14, 16].includes(length));
      assert.equal(counter.split(/\s+/).length, length, `${id}: counter bar ${i + 1}`);
      assert.ok(pitches(counter).every((p) => Number.isFinite(p) && p >= 36 && p <= 108));
    }
    const leadPitches = song.bars.flatMap((b) => pitches(b[0]));
    for (let i = 0; i < leadPitches.length - 1; i++) assert.ok(Math.abs(leadPitches[i + 1] - leadPitches[i]) <= 12, `${id}: connected melodic line at ${i}`);
    let previous = -1;
    for (const section of song.sections ?? []) {
      assert.ok(section.from > previous && section.from < song.bars.length);
      previous = section.from;
    }
    for (const mark of [...song.fills ?? [], ...song.crashes ?? [], ...song.riser ?? []]) assert.ok(mark >= 0 && mark < song.bars.length);
  }
});

test("every alternate track schedules through completion or loop; victory stays in its alternate album", () => {
  for (const [id, song] of Object.entries(ALTERNATE_SONGS)) {
    const engine = new SagaMusic(), ctx = { currentTime: 0 };
    let notes = 0, bass = 0, steps = 0, looped = false, previous = -1;
    engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
    engine.voice = (voice, pitch) => { assert.ok(Number.isFinite(pitch), `${id}: valid played pitch`); notes++; };
    engine.bass = () => bass++;
    engine.drum = () => {};
    engine.riser = () => {};
    const playStep = engine.playStep;
    engine.playStep = function (...args) {
      if (args[2] < previous) looped = true;
      previous = args[2]; steps++;
      return playStep.apply(this, args);
    };
    const total = song.bars.reduce((n, b) => n + b[0].split(/\s+/).length, 0);
    try {
      engine.start(ctx, {}, id);
      for (let i = 0; i < total + 8 && engine.playing; i++) {
        ctx.currentTime = engine.nextTime;
        engine.schedule();
        if (looped || (song.then && engine.playing !== id)) break;
      }
      assert.ok(notes > 0 && bass > 0 && steps >= total, `${id}: whole track scheduled`);
      if (song.then) assert.equal(engine.playing, song.then);
      else if (song.once) assert.equal(engine.playing, null);
      else assert.ok(looped, `${id}: loops`);
    } finally { engine.stop(); }
  }
  assert.equal(ALTERNATE_SONGS["alt:s2victory"].then, "alt:s2hangar");
});

test("each Ascension score keeps a small piece of its original's DNA: one bar of the original melody, and only one", () => {
  const shape = (line) => cells(line, midiOf).map((n) => `${n.at}:${n.len}:${n.value % 12}`).join(",");
  for (const [id, song] of Object.entries(SONGS)) {
    const alt = ALTERNATE_SONGS[`alt:${id}`], own = new Set(song.bars.map((b) => shape(b[0])));
    const quoted = alt.bars.filter((b) => own.has(shape(b[0]))).length;
    if (["s2bonus12", "s2bonus13", "s2bonus14"].includes(id)) continue; // Final Extremity II and the later Final Extremity phases keep their own scores
    if (["s2victory", "s2gameover", "s2fanfare"].includes(id)) { assert.equal(quoted, 0, `${id}: a cue this short is left alone`); continue; }
    assert.equal(quoted, 1, `${id}: one bar of the original, not a rewrite of it (${quoted})`);
  }
});

test("every chapter's boss has its own Ascension score in Ashen Crown's shape, in the key of its original", () => {
  const root = (chord) => /^([A-G][#b]?)/.exec(chord)[1];
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const id = `s2boss${n}`, song = SONGS[id], alt = ALTERNATE_SONGS[`alt:${id}`];
    assert.equal(alt.bars.length, 17, id);
    assert.equal(alt.intro, 1, `${id}: an opening bar played once`);
    assert.equal(root(alt.bars[1][1]), root(song.bars[song.intro ?? 0][1]), `${id}: the original's key`);
    assert.deepEqual([alt.fills, alt.crashes, alt.riser], [[12], [13], [11, 12]], `${id}: the lead-in to the gallop`);
    assert.ok(alt.bars.every((b) => !["gallop16", "drive16", "six12", "seven14", "pedal16"].includes(b[2])), `${id}: no bass in sixteenths`);
    assert.equal(alt.bars[16][2], "chrom16", `${id}: the chromatic close`);
    assert.ok(new Set(alt.bars.slice(5, 9).map((b) => b[0].split(/\s+/).length)).size === 1 && alt.bars[5][0].split(/\s+/).length !== alt.bars[1][0].split(/\s+/).length, `${id}: B is in another meter`);
  }
  const atlas = ALTERNATE_SONGS["alt:s2boss8"].bars.map((b) => b[0]);
  for (const phase of ["s2boss8b", "s2boss8c"]) {
    const bars = ALTERNATE_SONGS[`alt:${phase}`].bars.map((b) => b[0]);
    assert.ok(bars.filter((b, i) => b !== atlas[i]).length <= 1, `${phase}: Atlas's score, with its own quote (the last stand quotes the same bar)`);
  }
});
