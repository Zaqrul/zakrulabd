import assert from "node:assert/strict";
import test from "node:test";
import { SONGS, RIFFS, midiOf, cells } from "../src/components/games/space-music.ts";

const LOW = midiOf("C4"), HIGH = midiOf("F6");
const tracks = Object.entries(SONGS);
const leadOf = (bar) => cells(bar[0], midiOf);

test("every Space 1 tune is written in whole bars of sixteen cells, on known riffs", () => {
  assert.equal(tracks.length, 34);
  for (const [name, song] of tracks) song.bars.forEach((bar, i) => {
    assert.equal(bar[0].trim().split(/\s+/).length, 16, `${name} bar ${i + 1}`);
    assert.ok(RIFFS[bar[2] ?? song.riff], `${name} bar ${i + 1}: riff`);
  });
});

test("every Space 1 lead stays in one register, C4 to F6", () => {
  for (const [name, song] of tracks) song.bars.forEach((bar, i) => {
    for (const n of leadOf(bar)) assert.ok(n.value >= LOW && n.value <= HIGH, `${name} bar ${i + 1}: ${n.value}`);
  });
});

test("no Space 1 lead leaps more than an octave, within a bar, between bars or back into the loop", () => {
  for (const [name, song] of tracks) {
    const notes = song.bars.flatMap((bar, i) => leadOf(bar).map((n) => ({ ...n, bar: i })));
    for (let i = 1; i < notes.length; i++) {
      const leap = Math.abs(notes[i].value - notes[i - 1].value);
      assert.ok(leap <= 12, `${name}: ${leap} semitones into bar ${notes[i].bar + 1}`);
    }
    if (!song.once && notes.length) {
      const first = notes.find((n) => n.bar === (song.intro ?? 0));
      assert.ok(Math.abs(first.value - notes[notes.length - 1].value) <= 12, `${name}: back into the loop`);
    }
  }
});

test("each boss opens on a bar that plays once, and every looping tune is at least eight bars", () => {
  for (const [name, song] of tracks) {
    if (name.startsWith("boss")) assert.equal(song.intro, 1, name);
    if (!song.once) assert.ok(song.bars.length - (song.intro ?? 0) >= 8, name);
  }
});
