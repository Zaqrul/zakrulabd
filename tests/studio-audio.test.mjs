import assert from "node:assert/strict";
import test from "node:test";
import { SagaMusic } from "../src/components/games/space2-music.ts";
import { STUDIO_VOICES } from "../src/lib/studio.ts";

function audioContext() {
  const sources = [], gains = [];
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} });
  const node = () => ({ gain: param(), frequency: param(), detune: param(), Q: param(), pan: param(), delayTime: param(), connect(to) { return to; }, disconnect() {}, setPeriodicWave() {} });
  const source = () => { const n = { ...node(), starts: [], stops: [], start(t) { this.starts.push(t); }, stop(t) { this.stops.push(t); } }; sources.push(n); return n; };
  const ctx = { currentTime: 2, sampleRate: 8000, createGain() { const g = node(); gains.push(g); return g; }, createOscillator: source, createBufferSource: source, createBiquadFilter: node, createConvolver: node, createDelay: node, createStereoPanner: node, createWaveShaper: node, createPeriodicWave: () => ({}), createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; } };
  return { ctx, sources, gains };
}

test("all studio voices release their live sources, including LFOs, without affecting another held key", () => {
  for (const voice of STUDIO_VOICES) {
    const { ctx, sources, gains } = audioContext(), synth = new SagaMusic();
    synth.attach(ctx, {});
    const bus = synth.bus;
    const firstGain = gains.length;
    const release = synth.holdNote(voice, voice === "drums" ? 36 : 64, 0.42);
    assert.equal(synth.bus, bus, `${voice}: sequenced notes keep their original bus`);
    assert.equal(gains[firstGain].gain.value, 0.42, `${voice}: input velocity controls the live gate`);
    const first = sources.slice();
    assert.ok(first.length, `${voice}: creates playable sources`);
    const releaseSecond = synth.holdNote(voice, voice === "drums" ? 38 : 67, 0.8);
    const second = sources.slice(first.length), secondStops = second.map((n) => n.stops.length);
    ctx.currentTime = 4;
    release();
    assert.ok(first.every((n) => n.stops.at(-1) === 4.05), `${voice}: every first-key source stops on release`);
    assert.deepEqual(second.map((n) => n.stops.length), secondStops, `${voice}: another held key keeps playing`);
    const lengths = first.map((n) => n.stops.length);
    release();
    assert.deepEqual(first.map((n) => n.stops.length), lengths, `${voice}: repeated key-up is safe`);
    releaseSecond();
  }
});
