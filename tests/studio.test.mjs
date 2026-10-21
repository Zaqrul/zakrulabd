import assert from "node:assert/strict";
import test from "node:test";
import {
  BAR, SIXTEENTH, barTicks, emptySong, encodeWav, flatten, fromMidi, migrate, newPattern, parseMidi, patternLength, songFromParts, songLength,
  toMidi, trackerLines, uid, voiceFor,
} from "../src/lib/studio.ts";

const parts = [
  { name: "Lead", voice: "square", notes: [{ pitch: 64, start: 0, len: SIXTEENTH * 3, vel: 0.8 }, { pitch: 71, start: SIXTEENTH * 3, len: SIXTEENTH * 3, vel: 1 }] },
  { name: "Kit", voice: "drums", notes: [{ pitch: 36, start: 0, len: SIXTEENTH, vel: 1 }, { pitch: 38, start: SIXTEENTH * 4, len: SIXTEENTH, vel: 1 }] },
];

test("a song written as MIDI reads back with the same tempo, meter, notes and kit channel", () => {
  const song = { ...songFromParts(152, parts), beats: 7, unit: 8 };
  const parsed = parseMidi(toMidi(song));
  assert.equal(parsed.bpm, 152);
  assert.deepEqual([parsed.beats, parsed.unit], [7, 8]);
  assert.equal(parsed.tracks.length, 2);
  assert.deepEqual(parsed.tracks[0].notes.map(({ pitch, start, len }) => [pitch, start, len]), [[64, 0, 72], [71, 72, 72]]);
  assert.equal(parsed.tracks[1].channel, 9, "the kit on channel 10");
  const back = fromMidi(parsed);
  assert.deepEqual(back.channels.map((c) => c.voice), ["square", "drums"]);
  assert.equal(barTicks(back), SIXTEENTH * 14, "a bar of 7/8 is fourteen sixteenths");
});

test("the playlist places each clip's pattern, and the song ends with its last clip", () => {
  const song = songFromParts(140, parts);
  const verse = song.patterns[0], fill = { ...newPattern("Fill"), notes: { [song.channels[1].id]: [{ pitch: 49, start: 0, len: SIXTEENTH, vel: 1 }] } };
  song.patterns.push(fill);
  song.playlist.push({ id: uid("k"), pattern: verse.id, lane: 0, start: BAR }, { id: uid("k"), pattern: fill.id, lane: 1, start: BAR * 3 });
  assert.equal(patternLength(song, verse), BAR);
  assert.equal(songLength(song), BAR * 4);
  const notes = flatten(song);
  assert.deepEqual(notes.get(song.channels[0].id).map((n) => n.start), [0, 72, BAR, BAR + 72], "the verse twice");
  assert.deepEqual(notes.get(song.channels[1].id).map((n) => [n.pitch, n.start]), [[36, 0], [38, 96], [36, BAR], [38, BAR + 96], [49, BAR * 3]]);
  assert.deepEqual(flatten(song, fill.id).get(song.channels[1].id).map((n) => n.start), [0], "a pattern alone, from its start");
});

test("a new song has a kit on the step sequencer, a bass, a lead, a pattern on the playlist and an insert each", () => {
  const song = emptySong();
  assert.deepEqual(song.channels.map((c) => [c.name, c.voice, c.stepPitch]), [["Kick", "drums", 36], ["Snare", "drums", 38], ["Hat", "drums", 42], ["Bass", "pickedBass", 40], ["Lead", "square", 72]]);
  assert.equal(song.mixer.length, song.channels.length + 1, "the master and an insert per channel");
  assert.ok(song.channels.every((c, i) => c.insert === i + 1));
  assert.equal(song.playlist.length, 1);
});

test("the first studio's songs open in this one", () => {
  const old = { bpm: 120, tracks: [{ id: "t1", name: "Piano", voice: "piano", volume: 0.5, mute: true, solo: false, notes: parts[0].notes }] };
  const song = migrate(old);
  assert.equal(song.version, 2);
  assert.equal(song.channels[0].volume, 0.5);
  assert.equal(song.channels[0].mute, true);
  assert.equal(flatten(song).get(song.channels[0].id).length, 2);
  assert.equal(migrate({ nonsense: true }), null);
});

test("a MIDI program becomes the nearest voice, and a low part a bass", () => {
  assert.equal(voiceFor(0, 9, []), "drums");
  assert.equal(voiceFor(33, 0, [{ pitch: 40, start: 0, len: 1, vel: 1 }]), "pickedBass");
  assert.equal(voiceFor(0, 0, [{ pitch: 36, start: 0, len: 1, vel: 1 }]), "pickedBass", "a piano left hand down low");
  assert.equal(voiceFor(0, 0, [{ pitch: 72, start: 0, len: 1, vel: 1 }]), "piano");
  assert.equal(voiceFor(48, 0, [{ pitch: 72, start: 0, len: 1, vel: 1 }]), "strings");
  assert.equal(voiceFor(56, 0, [{ pitch: 72, start: 0, len: 1, vel: 1 }]), "trumpet");
});

test("notes copy as the engine's tracker lines, one bar of sixteenths each, in the bar's own length", () => {
  assert.deepEqual(trackerLines(parts[0].notes, BAR), ["E4 - - B4 - - . . . . . . . . . ."]);
  /* Overlapping notes: the highest on a sixteenth wins, and a note is cut where the next starts. */
  const chord = [{ pitch: 60, start: 0, len: BAR, vel: 1 }, { pitch: 67, start: 0, len: BAR, vel: 1 }, { pitch: 62, start: SIXTEENTH * 8, len: SIXTEENTH * 2, vel: 1 }];
  assert.deepEqual(trackerLines(chord, BAR), ["G4 - - - - - - - D4 - . . . . . ."]);
  assert.deepEqual(trackerLines(parts[0].notes, SIXTEENTH * 14, SIXTEENTH * 14), ["E4 - - B4 - - . . . . . . . ."], "a bar of 7/8");
});

test("a render is written as a 16-bit stereo WAV", () => {
  const wav = encodeWav([Float32Array.from([0, 1, -1]), Float32Array.from([0.5, 0, 0])], 44100);
  const v = new DataView(wav.buffer);
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), "RIFF");
  assert.equal(v.getUint16(22, true), 2, "stereo");
  assert.equal(v.getUint32(24, true), 44100);
  assert.equal(v.getUint32(40, true), 12, "three frames of two 16-bit samples");
  assert.equal(v.getInt16(46, true), 0x7fff * 0.5 | 0);
  assert.equal(v.getInt16(48, true), 0x7fff);
});

test("every tune on the soundtrack opens in the studio as parts in the studio's voices", async () => {
  const { ALBUMS } = await import("../src/lib/soundtrack.ts");
  const { STUDIO_VOICES } = await import("../src/lib/studio.ts");
  const { SagaMusic } = await import("../src/components/games/space2-music.ts");
  const { NesMusic } = await import("../src/components/games/space-music.ts");
  let tunes = 0;
  for (const [album, list] of Object.entries(ALBUMS)) {
    for (const tune of list) {
      const score = album === "space" ? NesMusic.score(tune.engine) : SagaMusic.score(tune.engine);
      assert.ok(score.bpm > 0 && score.parts.length > 0, `${tune.engine} has parts`);
      for (const part of score.parts) {
        assert.ok(STUDIO_VOICES.includes(part.voice), `${tune.engine}: ${part.name} plays ${part.voice}`);
        assert.ok(part.notes.every((n) => n.step >= 0 && n.steps > 0 && n.pitch >= 0 && n.pitch <= 127), `${tune.engine}: ${part.name} notes are in range`);
      }
      tunes++;
    }
  }
  assert.ok(tunes > 100, `${tunes} tunes`);
  /* A Space 2 tune comes out in its band's parts. */
  const throne = SagaMusic.score("alt:asc3").parts.map((p) => p.name);
  for (const name of ["Lead (square)", "Layer (lead)", "Bass (synth)", "Drums"]) assert.ok(throne.includes(name), name);
});
