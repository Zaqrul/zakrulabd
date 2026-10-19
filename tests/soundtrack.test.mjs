import assert from "node:assert/strict";
import test from "node:test";
import { SONGS as SPACE } from "../src/components/games/space-music.ts";
import { ALTERNATE_SONGS, SONGS as SPACE2 } from "../src/components/games/space2-music.ts";
import { ALBUMS, trackTitle } from "../src/lib/soundtrack.ts";

test("the soundtrack lists every tune of Space and of Space 2, once each", () => {
  assert.deepEqual(ALBUMS.space.map((t) => t.engine).sort(), Object.keys(SPACE).filter((id) => !id.startsWith("bonus")).sort(), "Space lists no bonus tracks");
  assert.deepEqual(ALBUMS.space2.map((t) => t.engine).sort(), Object.keys(SPACE2).filter((id) => !id.startsWith("s2bonus") || ["s2bonus7", "s2bonus9", "s2bonus10", "s2bonus13", "s2bonus14"].includes(id)).sort(), "of the bonus tracks, only Ashen Crown, the extended Battle Theme and the three phases of Final Extremity are on the original album");
  assert.deepEqual(ALBUMS.space2alt.map((t) => t.engine).sort(), Object.keys(ALTERNATE_SONGS).filter((id) => !id.startsWith("alt:s2bonus")).sort(), "Ascension lists no bonus tracks");
});

test("every title is in both languages, and a tune with versions says which", () => {
  for (const [album, tracks] of Object.entries(ALBUMS)) for (const track of tracks) {
    assert.ok(trackTitle(track, "en").length > 2 && trackTitle(track, "ms").length > 2, `${album} ${track.engine}`);
    assert.equal(track.album, album);
  }
  const hangar = ALBUMS.space.filter((t) => t.engine.startsWith("hangar"));
  assert.deepEqual(hangar.map((t) => trackTitle(t, "en")), ["Hangar: Engines Warm", "Hangar: Night Shift", "Hangar: Before the Storm"]);
  assert.deepEqual(hangar.map((t) => trackTitle(t, "ms")), ["Hangar: Enjin Dipanaskan", "Hangar: Syif Malam", "Hangar: Sebelum Ribut"]);
  assert.equal(trackTitle(ALBUMS.space.find((t) => t.engine === "boss1"), "en"), "Showdown: Siege Tank");
  assert.equal(trackTitle(ALBUMS.space.find((t) => t.engine === "boss8c"), "ms"), "Pertarungan: Benteng Terakhir Dreadnought");
  assert.equal(trackTitle(ALBUMS.space.find((t) => t.engine === "title"), "en"), "Starfall Overture");
  for (const album of Object.values(ALBUMS)) { const names = album.map((t) => trackTitle(t, "en")); assert.equal(new Set(names).size, names.length, "every name in an album is its own"); }
});

test("a variation number is never repeated within a tune, and starts at 1", () => {
  for (const tracks of Object.values(ALBUMS)) {
    const groups = new Map();
    for (const t of tracks) if (t.variation) groups.set(`${t.title[0]}|${t.boss?.[0] ?? ""}`, [...(groups.get(`${t.title[0]}|${t.boss?.[0] ?? ""}`) ?? []), t.variation]);
    for (const [name, v] of groups) assert.deepEqual(v, [...v.keys()].map((i) => i + 1), name);
  }
});

const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const midi = (n) => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return (Number(m[2]) + 1) * 12 + NOTE[m[1]]; };
const notes = (line) => {
  const out = [];
  line.trim().split(/\s+/).forEach((c, i) => {
    if (c === "-") { const last = out[out.length - 1]; if (last && last.at + last.len === i) last.len += 1; }
    else if (c !== ".") out.push({ at: i, len: 1, v: midi(c) });
  });
  return out;
};
const TONES = { "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], dim: [0, 3, 6] };

test("the chiptune and the orchestral Wanderer's Battle carry the same tune", () => {
  const chip = SPACE.bonus1.bars, orchestra = SPACE2.s2bonus1.bars;
  assert.equal(chip.length, orchestra.length);
  chip.forEach((bar, i) => { assert.equal(bar[0], orchestra[i][0]); assert.equal(bar[1], orchestra[i][1]); });
});

test("only the original Space 2 album lists bonus tracks, five of them, together at its end", () => {
  assert.deepEqual(ALBUMS.space2.filter((t) => t.bonus).map((t) => trackTitle(t, "en")), ["Ashen Crown", "Battle: Vanguard Run, Extended", "Final Extremity: Phase 1", "Final Extremity: Phase 2", "Final Extremity: Phase 3"]);
  for (const [album, count] of [["space2", 5]]) {
    const flags = ALBUMS[album].map((t) => Boolean(t.bonus));
    assert.equal(flags.filter(Boolean).length, count, album);
    assert.deepEqual(flags.slice(-count), Array(count).fill(true), "the bonus tracks come last, together");
    assert.ok(flags.slice(0, -count).every((f) => !f));
  }
  assert.ok(ALBUMS.space.every((t) => !t.bonus) && ALBUMS.space2alt.every((t) => !t.bonus), "Space and Ascension list none");
});

test("every bonus tune has the same notes and chords in the chiptune and in the orchestra", () => {
  for (let i = 1; i <= 5; i++) { // bonus6 to bonus8 are chiptune-only
    const chip = SPACE[`bonus${i}`].bars, orchestra = SPACE2[`s2bonus${i}`].bars;
    assert.equal(chip.length, orchestra.length, `bonus${i}`);
    chip.forEach((bar, n) => { assert.equal(bar[0], orchestra[n][0], `bonus${i} bar ${n + 1}`); assert.equal(bar[1], orchestra[n][1]); });
  }
});

test("the three Space 2 battle bonus themes follow the pattern of Space 2's own battle themes", () => {
  const own = [SPACE2.s2stage, SPACE2.s2stage2];
  for (const id of ["s2bonus6", "s2bonus7", "s2bonus8"]) {
    const song = SPACE2[id];
    assert.equal(song.bars.length, id === "s2bonus7" ? 25 : 12, id);   // Ashen Crown is the extended version
    assert.equal(song.drums, "battle", id);
    assert.equal(song.stabs, true, id);
    assert.ok(!song.counter && !song.arps, `${id} has no second line and no arpeggio`);
    assert.ok(["lead", "brass"].includes(song.lead), id);
    assert.ok(song.bpm >= 144 && song.bpm <= 164, id);
    const cellsOf = (bar) => bar[0].trim().split(/\s+/).length;
    const meters = new Set(song.bars.map(cellsOf));
    assert.ok(meters.has(16) && (meters.has(14) || meters.has(12)), `${id} changes meter like the originals`);
    assert.equal(song.bars.at(-1)[2], "chrom16", `${id} ends over the chromatic bass`);
    assert.ok(song.bars.filter((b) => ["gallop16", "pump16"].includes(b[2])).length >= 3, `${id} drives through its second section`);
    assert.ok(/m$/.test(song.bars[0][1]), `${id} opens in a minor key`);
  }
  assert.ok(own.every((s) => s.drums === "battle" && s.stabs), "the originals are what these are measured against");
});

test("the Space 2 battle themes move by step more than by chord jump, as the originals do", () => {
  const NOTE = { C: 0, "C#": 1, D: 2, Eb: 3, E: 4, F: 5, "F#": 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
  const midi = (n) => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return (Number(m[2]) + 1) * 12 + NOTE[m[1]]; };
  const stepShare = (song) => {
    const pitches = song.bars.flatMap((b) => b[0].trim().split(/\s+/).filter((c) => c !== "-" && c !== ".").map(midi));
    let step = 0;
    for (let i = 1; i < pitches.length; i++) if (Math.abs(pitches[i] - pitches[i - 1]) <= 2) step++;
    return step / (pitches.length - 1);
  };
  const original = Math.min(stepShare(SPACE2.s2stage), stepShare(SPACE2.s2stage2));
  for (const id of ["s2bonus6", "s2bonus7", "s2bonus8"]) assert.ok(stepShare(SPACE2[id]) >= original * 0.75, `${id} moves by step: ${stepShare(SPACE2[id]).toFixed(2)} against ${original.toFixed(2)}`);
});

test("the three new field battle variations follow the house pattern measured from Space's own battle themes", () => {
  const own = [SPACE.stage, SPACE.stage2, SPACE.stage3];
  for (const id of ["bonus6", "bonus7", "bonus8"]) {
    const song = SPACE[id];
    assert.equal(song.bars.length, 16, `${id}: sixteen bars`);
    assert.ok(!song.intro && !song.once, `${id}: no intro, a loop`);
    assert.ok(["drive", "rush"].includes(song.drums), id);
    assert.ok(song.bpm >= 150 && song.bpm <= 164, `${id}: tempo`);
    const riffAt = (i) => song.bars[i][2] ?? song.riff;
    assert.ok(new Set([0, 1, 2, 3, 4, 5, 6, 7].map(riffAt)).size === 1, `${id}: eight bars on one riff`);
    assert.ok(new Set([8, 9, 10, 11].map(riffAt)).size === 1 && riffAt(8) !== riffAt(0), `${id}: the bass changes at bar nine`);
    assert.ok([12, 13, 14].every((i) => riffAt(i) === "drive"), `${id}: three bars of the drive`);
    assert.equal(riffAt(15), "chrom", `${id}: the chromatic close`);
    const roleAt = (i) => song.bars[i][3] ?? song.role;
    assert.notEqual(roleAt(8), roleAt(0), `${id}: the second pulse changes its job with the bass`);
    assert.ok(!["arp", "arp8", "sweep"].includes(roleAt(0)) && ![8, 12, 15].some((i) => ["arp", "arp8", "sweep"].includes(roleAt(i))), `${id}: no arpeggiating second voice`);
    assert.ok(/m$/.test(song.bars[0][1]), `${id}: a minor key`);
    const rootOf = (chord) => NOTE[/^([A-G][#b]?)/.exec(chord)[1]];
    const tonic = rootOf(song.bars[0][1]);
    for (const i of [3, 7, 15]) assert.equal(rootOf(song.bars[i][1]), (tonic + 7) % 12, `${id}: the dominant at bar ${i + 1}`);
    for (const i of [7, 15]) assert.ok(/7$/.test(song.bars[i][1]), `${id}: a dominant seventh at bar ${i + 1}`);
  }
  assert.ok(own.every((s) => s.bars.length === 16), "the originals are what these are measured against");
});

/* The composition rules from docs/composition-method.md, checked on every bonus tune. */
const CHORD = { "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], dim: [0, 3, 6] };
const chordPcs = (chord) => { const [, root, q] = /^([A-G][#b]?)(.*)$/.exec(chord); return CHORD[q].map((i) => (NOTE[root] + i) % 12); };
const leadNotes = (line) => {
  const out = [];
  line.trim().split(/\s+/).forEach((c, i) => { if (c === "-") { out[out.length - 1].len += 1; } else if (c !== ".") out.push({ at: i, len: 1, v: midi(c) }); });
  return out;
};
const everyBonus = [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [`bonus${i}`, SPACE[`bonus${i}`]]), ...[1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14].map((i) => [`s2bonus${i}`, SPACE2[`s2bonus${i}`]])];

test("every bonus tune is built from a hook that comes back, and not from bars that are all alike", () => {
  for (const [id, song] of everyBonus) {
    const bars = song.bars.slice(song.intro ?? 0);
    const shape = (b) => leadNotes(b[0]).map((n) => `${n.at}:${n.len}`).join(",");
    const shapes = bars.map(shape);
    const repeats = shapes.filter((s, i) => shapes.indexOf(s) < i).length;
    assert.ok(repeats / bars.length >= 0.3, `${id}: the hook's rhythm comes back (${repeats}/${bars.length})`);
    assert.ok(new Set(shapes).size >= 4, `${id}: at least four different rhythms, so it is not one bar copied`);
    for (let i = 1; i < bars.length; i++) assert.ok(bars[i][0] !== bars[i - 1][0] || bars[i][1] !== bars[i - 1][1], `${id}: bars ${i} and ${i + 1} are not the same`);
  }
});

test("every bonus tune puts its strong beats on the chord, and does not outline chords as arpeggios", () => {
  for (const [id, song] of everyBonus) {
    let first = 0, on = 0, strong = 0, strongOn = 0;
    const pitches = [];
    song.bars.forEach(([lead, chord]) => {
      const pcs = chordPcs(chord), n = lead.trim().split(/\s+/).length, beats = n === 16 ? [0, 4, 8, 12] : [0, 3, 6, 9];
      for (const note of leadNotes(lead)) {
        pitches.push(note.v);
        if (note.at === 0) { first++; if (pcs.includes(note.v % 12)) on++; }
        if (beats.includes(note.at)) { strong++; if (pcs.includes(note.v % 12)) strongOn++; }
      }
    });
    assert.ok(on / first >= 0.9, `${id}: bar downbeats on the chord (${on}/${first})`);
    assert.ok(strongOn / strong >= 0.6, `${id}: strong beats on the chord (${strongOn}/${strong})`);
    let triples = 0;
    for (let i = 2; i < pitches.length; i++) {
      const a = pitches[i - 1] - pitches[i - 2], b = pitches[i] - pitches[i - 1];
      if (a !== 0 && (a > 0) === (b > 0) && Math.abs(a) >= 3 && Math.abs(a) <= 4 && Math.abs(b) >= 3 && Math.abs(b) <= 4) triples++;
    }
    assert.ok(triples <= 4, `${id}: arpeggio triples ${triples}`);
  }
});

test("every bonus tune reaches its top note in the second half and has a held note for a half cadence", () => {
  for (const [id, song] of everyBonus) {
    const tops = song.bars.map((b) => Math.max(...leadNotes(b[0]).map((n) => n.v)));
    const top = Math.max(...tops);
    const first = tops.indexOf(top), last = tops.lastIndexOf(top);
    assert.ok(last >= song.bars.length / 2 - 1, `${id}: the top note is reached in the second half (bars ${first + 1} to ${last + 1})`);
    assert.ok(song.bars.some((b) => leadNotes(b[0]).some((n) => n.len >= 6)), `${id}: a held note somewhere`);
  }
});

test("Ashen Crown leads from its slow part into its fast one with two bars of slow melody over a building bass and a drum fill", () => {
  const bars = SPACE2.s2bonus7.bars;
  const noteCount = (b) => b[0].trim().split(/\s+/).filter((c) => c !== "-" && c !== ".").length;
  const cells = (b) => b[0].trim().split(/\s+/).length;
  assert.equal(cells(bars[11]), 12, "the slow part is in 6/8 before it");
  assert.deepEqual([12, 13].map((i) => cells(bars[i])), [16, 16]);
  assert.deepEqual([12, 13].map((i) => noteCount(bars[i])), [4, 4], "four long notes a bar, not the fast notes");
  assert.deepEqual([bars[12][2], bars[13][2]], ["pump16", "gallop16"], "the bass builds into the gallop");
  assert.deepEqual(SPACE2.s2bonus7.fills, [13], "a drum fill at the end of the lead-in");
  assert.deepEqual(SPACE2.s2bonus7.crashes, [14], "and a crash as the gallop comes in");
  assert.deepEqual(SPACE2.s2bonus7.riser, [12, 13], "and a riser under the two bars");
  assert.equal(cells(bars[14]), 16);
  assert.ok(bars[13][0].trim().split(/\s+/).filter((c) => c !== "-" && c !== ".").at(-1) === "B4" && bars[14][0].startsWith("C5"), "it falls onto the leading tone, which the gallop resolves");
});

test("the extended Space 2 battle theme keeps the game's own bars and adds a flowing line, a melodic lead-in and rising arcs between them", () => {
  const own = SPACE2.s2stage.bars, ext = SPACE2.s2bonus9.bars;
  assert.equal(ext.length, 21);
  assert.deepEqual(ext.slice(0, 8), own.slice(0, 8), "the drive and the 7/8, untouched");
  assert.deepEqual(ext.slice(14, 17), own.slice(8, 11), "the gallop, untouched");
  assert.deepEqual(ext[20], own[11], "and the chromatic close");
  const noteCount = (b) => b[0].trim().split(/\s+/).filter((c) => c !== "-" && c !== ".").length;
  assert.deepEqual([12, 13].map((i) => noteCount(ext[i])), [4, 4], "two bars of slow melody before the gallop");
  assert.deepEqual([ext[12][2], ext[13][2]], ["pump16", "gallop16"], "the bass builds into it");
  assert.deepEqual(SPACE2.s2bonus9.fills, [13]);
  assert.deepEqual(SPACE2.s2bonus9.crashes, [14]);
  assert.deepEqual(SPACE2.s2bonus9.riser, [12, 13], "a riser under the lead-in");
  /* Each part starts close to where the one before it ended. */
  const NOTES = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
  const pitch = (n) => { const m = /^([A-G]#?)(\d)$/.exec(n); return (Number(m[2]) + 1) * 12 + NOTES[m[1]]; };
  const firstLast = (bar) => { const cells = bar[0].trim().split(/\s+/).filter((c) => c !== "-" && c !== "."); return cells.length ? [pitch(cells[0]), pitch(cells.at(-1))] : null; };
  for (const [from, to] of [[7, 8], [11, 12], [12, 13], [13, 14], [16, 17], [19, 20]]) {
    const a = firstLast(ext[from]), b = firstLast(ext[to]);
    assert.ok(Math.abs(b[0] - a[1]) <= 7, `bar ${to + 1} starts within a fifth of where bar ${from + 1} ended`);
  }
});

test("no song has a bar the lead skips whole, and only the extended tunes and the finale ask for a drum fill, a crash and a riser", () => {
  const allRest = (b) => b[0].trim().split(/\s+/).every((c) => c === ".");
  for (const [id, song] of Object.entries(SPACE2)) {
    assert.ok(!song.bars.some(allRest), `${id}: no silent lead bar`);
    if (!["s2bonus7", "s2bonus9", "s2bonus10", "s2bonus11", "s2bonus12", "s2bonus13", "s2bonus14"].includes(id)) assert.ok(!song.fills && !song.crashes && !song.riser, `${id}: no fills, crashes or risers asked for`);
  }
});

test("Final Extremity's three phases are one score a tone higher and faster each time, each with a long solo of its own", () => {
  const phases = [SPACE2.s2bonus10, SPACE2.s2bonus13, SPACE2.s2bonus14];
  const len = (b) => b[0].trim().split(/\s+/).length;
  const pitches = (song) => song.bars.map((b) => b[0].trim().split(/\s+/).filter((c) => /^[A-G]/.test(c)).map(midi));
  const solo = (i) => i >= 22 && i < 30;
  assert.deepEqual(phases.map((p) => p.bpm), [164, 172, 180], "faster each phase");
  for (const [n, song] of phases.entries()) {
    assert.equal(song.bars.length, 40);
    assert.deepEqual(song.bars.map(len), [...Array(14).fill(16), ...Array(4).fill(14), ...Array(22).fill(16)]);
    assert.deepEqual([song.fills, song.crashes, song.riser], [[5, 13, 17, 21, 29, 37], [6, 14, 18, 22, 30, 38], [4, 5]]);
    assert.equal(song.sections[0].drums, "none", "a drumless intro");
    assert.deepEqual(song.sections.map((s) => s.from), [0, 4, 6, 14, 18, 22, 30, 38], "the band changes at the same bars");
    // The same melody a tone higher per phase, except in the solo.
    pitches(song).forEach((bar, i) => { if (!solo(i)) bar.forEach((v, k) => assert.equal(v, pitches(phases[0])[i][k] + 2 * n, `phase ${n + 1} bar ${i + 1}`)); });
    // The solo: eight bars, most of them in sixteenths.
    assert.ok(pitches(song).slice(22, 30).filter((bar) => bar.length >= 12).length >= 5, `phase ${n + 1}: a long, busy solo`);
    // The turning sixteenth figure is a touch, only in the climb.
    song.bars.forEach((b, i) => assert.equal(Boolean(b[3]) && i >= 6, i >= 30 && i < 38, `phase ${n + 1} bar ${i + 1}: counter-line`));
  }
  const solos = phases.map((song) => pitches(song).slice(22, 30).flat().join(","));
  assert.equal(new Set(solos).size, 3, "each phase has a solo of its own");
  assert.deepEqual(phases.map((song) => song.sections[5].lead), ["violin", "guitar", "lead"]);
});

test("both Codex battle themes have independent melodies and playable loop joins", () => {
  const tunes = [["bonus9", SPACE.bonus9], ["s2bonus11", SPACE2.s2bonus11]];
  for (const [id, song] of tunes) {
    assert.ok(!song.once && !song.then && !song.intro, `${id}: standalone complete loop`);
    const pitches = song.bars.flatMap((b) => notes(b[0]).map((n) => n.v));
    assert.ok(pitches.every((p) => p >= midi("C4") && p <= midi("F6")), `${id}: lead register`);
    for (let i = 0; i < pitches.length; i++) {
      assert.ok(Math.abs(pitches[(i + 1) % pitches.length] - pitches[i]) <= 12, `${id}: singable joins including loop`);
    }
    for (const bar of song.bars) if (bar[3] && id.startsWith("s2")) {
      assert.equal(bar[3].split(/\s+/).length, bar[0].split(/\s+/).length, `${id}: counter fits the bar`);
      assert.ok(notes(bar[3]).every((n) => Number.isFinite(n.v)), `${id}: valid counter pitches`);
    }
    const library = id.startsWith("s2") ? SPACE2 : SPACE;
    const signature = (s) => s.bars.map((b) => b[0]).join("|");
    for (const [otherId, other] of Object.entries(library)) if (otherId !== id) {
      assert.notEqual(signature(song), signature(other), `${id}: independent from ${otherId}`);
    }
  }
  assert.notEqual(SPACE.bonus9.bars[0][0], SPACE2.s2bonus11.bars[0][0], "two different hooks");
});
