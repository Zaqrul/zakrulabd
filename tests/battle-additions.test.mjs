import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { NesMusic, SONGS as SPACE1, RIFFS } from "../src/components/games/space-music.ts";
import { SagaMusic, SONGS as SPACE2 } from "../src/components/games/space2-music.ts";
import { MORE_BATTLES } from "../src/components/games/space-battles-more.ts";
import { SECOND_BATTLES } from "../src/components/games/space2-battles-more.ts";
import { STAGE_TUNES, SECOND_STAGE_TUNES } from "../src/components/games/space-stage-tunes.ts";
import { ALBUMS, trackTitle } from "../src/lib/soundtrack.ts";

const hash = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex").slice(0, 16);

test("the tunes the series began with are exactly as they were: the new battles were added, nothing was changed", () => {
  const space1 = { stage: "41f8bb6e787e0441", stage2: "927e8e6c674ddd18", stage3: "ab9a4b5612c46c66", boss1: "a7b213bf70e580f0", boss8: "61a5e7c35b86b222", hangar: "44dce30b75296321", title: "12003e3813375a27" };
  const space2 = { s2stage: "e609820a8575586c", s2stage2: "0447c41f9c3021a7", s2boss1: "04df948329d79a9a", s2boss8: "4f94fbf148040703", s2hangar: "0c30387998f93d12", s2title: "cdda17430ad32a1b" };
  for (const [id, h] of Object.entries(space1)) assert.equal(hash(SPACE1[id]), h, `Space ${id}`);
  for (const [id, h] of Object.entries(space2)) assert.equal(hash(SPACE2[id]), h, `Space 2 ${id}`);
});

test("Space's added battles keep the series' tempo and style: 150 to 160 bpm, sixteen bars of sixteen cells, the same drums and riffs", () => {
  const originals = [SPACE1.stage, SPACE1.stage2, SPACE1.stage3];
  const drums = new Set(originals.map((s) => s.drums)), duties = new Set(originals.map((s) => s.duty));
  for (const [id, song] of Object.entries(MORE_BATTLES)) {
    assert.ok(song.bpm >= 150 && song.bpm <= 160, `${id} tempo ${song.bpm}`);
    assert.equal(song.bars.length, 16, `${id} bars`);
    assert.ok(drums.has(song.drums), `${id} drums ${song.drums}`);
    assert.ok(duties.has(song.duty), `${id} pulse width ${song.duty}`);
    for (const bar of song.bars) {
      assert.equal(bar[0].trim().split(/\s+/).length, 16, `${id}: sixteen cells`);
      assert.ok(RIFFS[bar[2] ?? song.riff], `${id}: a known riff`);
    }
    const key = (s) => s.bars[0][1];
    assert.ok(![SPACE1.stage, SPACE1.stage2, SPACE1.stage3].some((o) => key(o) === key(song)), `${id} is in a key of its own (${key(song)})`);
    assert.ok(song.bars.every((b) => /^[A-G]#?m?7?$/.test(b[1])), `${id}: chords in the idiom`);
    assert.ok(song.bars[15][1].endsWith("7"), `${id} turns round on the dominant`);
  }
  assert.ok(new Set(Object.values(MORE_BATTLES).map((s) => s.bpm)).size >= 4, "the tempos differ");
});

test("Space 2's added battles keep Vanguard Run's tempo and the series' voices, but each has a form, a band and a groove of its own", () => {
  const voices = ["lead", "brass", "strings", "organ", "guitar", "violin", "trumpet", "piano", "bell"];
  const shapes = new Set(), kits = new Set();
  for (const [id, song] of Object.entries(SECOND_BATTLES)) {
    assert.equal(song.bpm, SPACE2.s2stage.bpm, `${id} keeps the tempo of Vanguard Run`);
    assert.ok(song.bars.length >= 24 && song.bars.length <= 40, `${id} bars ${song.bars.length}`);
    assert.equal(song.performance.length, song.bars.length, `${id} performs every bar`);
    const lengths = song.bars.map((b) => b[0].trim().split(/\s+/).length);
    assert.ok(lengths.every((n) => [12, 14, 16].includes(n)), `${id} meters ${lengths}`);
    assert.ok(new Set(lengths).size >= 2, `${id} changes meter, as the originals do`);
    song.performance.forEach((p, i) => {
      assert.equal(p.bass.trim().split(/\s+/).length, lengths[i], `${id} bar ${i}: the bass fills the bar`);
      assert.equal(p.kit.trim().split(/\s+/).length, lengths[i], `${id} bar ${i}: the kit fills the bar`);
    });
    assert.ok(song.sections.length >= 4 && song.sections[0].from === 0, `${id} has sections`);
    assert.ok(new Set(song.sections.map((s) => s.lead)).size >= 2, `${id} changes who leads`);
    for (const s of song.sections) assert.ok(voices.includes(s.lead) && voices.includes(s.pad), `${id} voices`);
    assert.ok(song.bars[song.bars.length - 1][1].endsWith("7"), `${id} turns round on the dominant`);
    shapes.add(song.bars.length + ":" + lengths.join(","));
    kits.add(song.performance.map((p) => p.kit).join("|"));
  }
  assert.equal(shapes.size, 6, "no two have the same arrangement");
  assert.equal(kits.size, 6, "no two share a drum part");
});

test("each chapter of Space and Space 2 has a field battle of its own, and the first tunes still play where they always did", () => {
  assert.equal(new Set(STAGE_TUNES).size, 8, "eight different battles in Space");
  assert.equal(new Set(SECOND_STAGE_TUNES).size, 8, "eight different battles in Space 2");
  for (const id of STAGE_TUNES) assert.ok(SPACE1[id], `Space ${id}`);
  for (const id of SECOND_STAGE_TUNES) assert.ok(SPACE2[`s2${id}`], `Space 2 ${id}`);
  /* Space: stage for 1, stage3 for 3 and stage2 for 6; Space 2: stage for the first chapter and stage2 for the sixth. */
  assert.deepEqual([STAGE_TUNES[0], STAGE_TUNES[2], STAGE_TUNES[5]], ["stage", "stage3", "stage2"]);
  assert.deepEqual([SECOND_STAGE_TUNES[0], SECOND_STAGE_TUNES[5]], ["stage", "stage2"]);
});

test("the soundtrack lists the added battles in chapter order, in both languages, and the Ascension album leaves them out", () => {
  const space = ALBUMS.space.map((t) => t.engine).filter((e) => /^stage/.test(e));
  assert.deepEqual(space, STAGE_TUNES);
  const space2 = ALBUMS.space2.map((t) => t.engine).filter((e) => /^s2stage/.test(e));
  assert.deepEqual(space2, SECOND_STAGE_TUNES.map((id) => `s2${id}`));
  for (const track of [...ALBUMS.space, ...ALBUMS.space2].filter((t) => /stage\d$/.test(t.engine))) {
    assert.ok(trackTitle(track, "en").startsWith("Battle: ") && trackTitle(track, "ms").startsWith("Pertempuran: "), track.engine);
  }
  assert.ok(!ALBUMS.space2alt.some((t) => /s2stage[3-8]/.test(t.engine)), "Ascension is unchanged");
});

test("every added battle plays through the scheduler, with a melody and a bass, and loops", () => {
  const run = (engine, ctx, id, song) => {
    const events = [];
    for (const method of ["voice", "bass", "drum", "riser", "pulse", "triangle"]) if (method in engine || ["voice", "bass", "drum", "pulse", "triangle"].includes(method)) engine[method] = (...a) => events.push([method, a]);
    const total = song.bars.reduce((n, b) => n + b[0].trim().split(/\s+/).length, 0);
    engine.start(ctx, {}, id);
    for (let i = 0; i < total + 20; i++) { ctx.currentTime = engine.nextTime; engine.schedule(); }
    engine.stop();
    return events;
  };
  for (const [id, song] of Object.entries(MORE_BATTLES)) {
    const ctx = { currentTime: 0 }, engine = new NesMusic();
    engine.prepare = (audio, out) => { engine.ctx = audio; engine.out = out; };
    const events = run(engine, ctx, id, song);
    assert.ok(events.some((e) => e[0] === "pulse"), `${id} has a lead`);
    assert.ok(events.some((e) => e[0] === "triangle"), `${id} has a bass`);
  }
  for (const [id, song] of Object.entries(SECOND_BATTLES)) {
    const ctx = { currentTime: 0 }, engine = new SagaMusic();
    engine.prepare = (audio) => { engine.ctx = audio; engine.bus = {}; };
    const events = run(engine, ctx, id, song);
    assert.ok(events.some((e) => e[0] === "voice"), `${id} has a lead`);
    assert.ok(events.some((e) => e[0] === "bass"), `${id} has a bass`);
  }
});
