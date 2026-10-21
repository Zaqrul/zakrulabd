import assert from "node:assert/strict";
import test from "node:test";
import { BAR, SIXTEENTH, fromMidi, newTrack, parseMidi, toMidi, trackerLines, voiceFor } from "../src/lib/studio.ts";

const song = {
  bpm: 152,
  tracks: [
    { ...newTrack("Lead", "square"), notes: [{ pitch: 64, start: 0, len: SIXTEENTH * 3, vel: 0.8 }, { pitch: 71, start: SIXTEENTH * 3, len: SIXTEENTH * 3, vel: 1 }] },
    { ...newTrack("Kit", "drums"), notes: [{ pitch: 36, start: 0, len: SIXTEENTH, vel: 1 }, { pitch: 38, start: SIXTEENTH * 4, len: SIXTEENTH, vel: 1 }] },
  ],
};

test("a song written as MIDI reads back with the same tempo, notes and kit channel", () => {
  const parsed = parseMidi(toMidi(song));
  assert.equal(parsed.bpm, 152);
  assert.equal(parsed.tracks.length, 2);
  assert.deepEqual(parsed.tracks[0].notes.map(({ pitch, start, len }) => [pitch, start, len]), [[64, 0, 72], [71, 72, 72]]);
  assert.equal(parsed.tracks[1].channel, 9, "the kit on channel 10");
  const back = fromMidi(parsed);
  assert.deepEqual(back.tracks.map((t) => t.voice), ["square", "drums"]);
});

test("a MIDI program becomes the nearest voice, and a low part a bass", () => {
  assert.equal(voiceFor(0, 9, []), "drums");
  assert.equal(voiceFor(33, 0, [{ pitch: 40, start: 0, len: 1, vel: 1 }]), "pickedBass");
  assert.equal(voiceFor(0, 0, [{ pitch: 36, start: 0, len: 1, vel: 1 }]), "pickedBass", "a piano left hand down low");
  assert.equal(voiceFor(0, 0, [{ pitch: 72, start: 0, len: 1, vel: 1 }]), "piano");
  assert.equal(voiceFor(48, 0, [{ pitch: 72, start: 0, len: 1, vel: 1 }]), "strings");
  assert.equal(voiceFor(56, 0, [{ pitch: 72, start: 0, len: 1, vel: 1 }]), "trumpet");
});

test("a track copies as the engine's tracker lines, one bar of sixteenths each", () => {
  const lines = trackerLines(song.tracks[0], BAR);
  assert.deepEqual(lines, ["E4 - - B4 - - . . . . . . . . . ."]);
  /* Overlapping notes: the highest on a sixteenth wins, and a note is cut where the next starts. */
  const chord = { ...newTrack("Pad", "strings"), notes: [{ pitch: 60, start: 0, len: BAR, vel: 1 }, { pitch: 67, start: 0, len: BAR, vel: 1 }, { pitch: 62, start: SIXTEENTH * 8, len: SIXTEENTH * 2, vel: 1 }] };
  assert.deepEqual(trackerLines(chord, BAR), ["G4 - - - - - - - D4 - . . . . . ."]);
});
