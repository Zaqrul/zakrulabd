/* The studio's sound: a mixer graph built from the song, and a transport that queues notes ahead on the audio clock.
   Each channel plays on a synthesiser of its own (space2-music.ts), through its volume and pan into its mixer insert;
   each insert runs its chain of effects, then its fader, pan and meter, into the master insert, and the master into
   the soundtrack player's mastering. The same graph is built on an offline context to render the song to a file. */
import type { SagaMusic } from "@/components/games/space2-music";
import { PPQ, flatten, patternLength, songLength, type Effect, type StudioNote, type StudioSong } from "@/lib/studio";

type Engine = typeof SagaMusic;
type FxNodes = { input: AudioNode; output: AudioNode; set: (p: Record<string, number>) => void };
type InsertNodes = { input: GainNode; fader: GainNode; pan: StereoPannerNode; meter: AnalyserNode; chain: FxNodes[]; signature: string };
type ChannelNodes = { gain: GainNode; pan: StereoPannerNode; synth: SagaMusic; insert: number };

const impulses = new Map<string, AudioBuffer>();
function impulse(ctx: BaseAudioContext, decay: number) {
  const key = `${ctx.sampleRate}:${decay.toFixed(1)}`;
  let buf = impulses.get(key);
  if (!buf) {
    const len = Math.floor(ctx.sampleRate * decay);
    buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.5; }
    impulses.set(key, buf);
  }
  return buf;
}

/* One effect as the node signal goes in at and the node it comes out of, and a way to turn its knobs in place. */
function effect(ctx: BaseAudioContext, fx: Effect, bpm: number): FxNodes {
  const p = fx.params;
  const biquad = (type: BiquadFilterType, frequency: number, gain = 0, q = 0.707) => {
    const node = ctx.createBiquadFilter();
    node.type = type; node.frequency.value = frequency; node.gain.value = gain; node.Q.value = q;
    return node;
  };
  /* Effects that blend a wet signal with the dry one. */
  const blend = (wetIn: AudioNode, wetOut: AudioNode, set: (q: Record<string, number>) => void): FxNodes => {
    const input = ctx.createGain(), output = ctx.createGain(), dry = ctx.createGain(), wet = ctx.createGain();
    input.connect(dry).connect(output);
    input.connect(wetIn);
    wetOut.connect(wet).connect(output);
    const all = (q: Record<string, number>) => { dry.gain.value = 1 - q.mix; wet.gain.value = q.mix; set(q); };
    all(p);
    return { input, output, set: all };
  };
  switch (fx.kind) {
    case "eq": {
      const low = biquad("lowshelf", 200), mid = biquad("peaking", 1000, 0, 0.9), high = biquad("highshelf", 5000);
      low.connect(mid).connect(high);
      const set = (q: Record<string, number>) => { low.gain.value = q.low; mid.gain.value = q.mid; mid.frequency.value = q.freq; high.gain.value = q.high; };
      set(p);
      return { input: low, output: high, set };
    }
    case "filter": {
      const f = biquad("lowpass", 6000);
      const set = (q: Record<string, number>) => { f.type = q.type >= 0.5 ? "highpass" : "lowpass"; f.frequency.value = q.cutoff; f.Q.value = q.q; };
      set(p);
      return { input: f, output: f, set };
    }
    case "comp": {
      const c = ctx.createDynamicsCompressor(), makeup = ctx.createGain();
      c.knee.value = 6;
      c.connect(makeup);
      const set = (q: Record<string, number>) => {
        c.threshold.value = q.threshold; c.ratio.value = q.ratio; c.attack.value = q.attack; c.release.value = q.release;
        makeup.gain.value = 10 ** (q.makeup / 20);
      };
      set(p);
      return { input: c, output: makeup, set };
    }
    case "dist": {
      const shaper = ctx.createWaveShaper(), level = ctx.createGain();
      shaper.oversample = "2x";
      shaper.connect(level);
      let drive = -1;
      return blend(shaper, level, (q) => {
        if (q.drive === drive) return;
        drive = q.drive;
        const k = 1 + q.drive * 60;
        shaper.curve = Float32Array.from({ length: 1024 }, (_, i) => Math.tanh(k * (2 * i / 1023 - 1)) / Math.tanh(k));
        level.gain.value = 1 - q.drive * 0.45;
      });
    }
    case "delay": {
      const d = ctx.createDelay(4), feedback = ctx.createGain(), tone = biquad("lowpass", 3500);
      d.connect(tone).connect(feedback).connect(d);
      return blend(d, tone, (q) => { d.delayTime.value = Math.min(4, (q.beats * 60) / bpm); feedback.gain.value = q.feedback; });
    }
    case "reverb": {
      const conv = ctx.createConvolver();
      let decay = -1;
      return blend(conv, conv, (q) => { if (q.decay !== decay) { decay = q.decay; conv.buffer = impulse(ctx, q.decay); } });
    }
  }
}

/* The mixer graph for a song on one context. `sync` brings it up to date with the song: an insert's chain is rebuilt
   when effects are added, removed, reordered or switched, and otherwise its knobs are turned in place. */
export class StudioGraph {
  readonly ctx: BaseAudioContext;
  private Engine: Engine;
  private out: AudioNode;
  private inserts = new Map<number, InsertNodes>();
  private channels = new Map<string, ChannelNodes>();

  constructor(ctx: BaseAudioContext, out: AudioNode, Engine: Engine) {
    this.ctx = ctx; this.out = out; this.Engine = Engine;
  }

  private insert(index: number): InsertNodes {
    let ins = this.inserts.get(index);
    if (!ins) {
      const input = this.ctx.createGain(), fader = this.ctx.createGain(), pan = this.ctx.createStereoPanner(), meter = this.ctx.createAnalyser();
      meter.fftSize = 512;
      input.connect(fader);
      fader.connect(pan);
      pan.connect(meter);
      pan.connect(index === 0 ? this.out : this.insert(0).input);
      ins = { input, fader, pan, meter, chain: [], signature: "" };
      this.inserts.set(index, ins);
    }
    return ins;
  }

  sync(song: StudioSong) {
    song.mixer.forEach((mix, index) => {
      const ins = this.insert(index);
      const active = mix.effects.filter((fx) => fx.on);
      const signature = `${active.map((fx) => fx.id).join(",")}:${song.bpm}`;
      if (signature !== ins.signature) {
        ins.input.disconnect();
        for (const fx of ins.chain) fx.output.disconnect();
        ins.chain = [];
        let at: AudioNode = ins.input;
        for (const fx of active) {
          const nodes = effect(this.ctx, fx, song.bpm);
          at.connect(nodes.input);
          ins.chain.push(nodes);
          at = nodes.output;
        }
        at.connect(ins.fader);
        ins.signature = signature;
      } else {
        active.forEach((fx, i) => ins.chain[i].set(fx.params));
      }
      ins.fader.gain.value = mix.mute ? 0 : mix.volume;
      ins.pan.pan.value = mix.pan;
    });
    const anySolo = song.channels.some((c) => c.solo);
    for (const c of song.channels) {
      const insert = Math.max(0, Math.min(c.insert, song.mixer.length - 1));
      const ch = this.channel(c.id, insert);
      if (ch.insert !== insert) { ch.pan.disconnect(); ch.pan.connect(this.insert(insert).input); ch.insert = insert; }
      ch.gain.gain.value = c.mute || (anySolo && !c.solo) ? 0 : c.volume;
      ch.pan.pan.value = c.pan;
    }
  }

  channel(id: string, insert = 1) {
    let ch = this.channels.get(id);
    if (!ch) {
      const gain = this.ctx.createGain(), pan = this.ctx.createStereoPanner();
      gain.connect(pan);
      pan.connect(this.insert(insert).input);
      const synth = new this.Engine();
      synth.attach(this.ctx as AudioContext, gain);
      ch = { gain, pan, synth, insert };
      this.channels.set(id, ch);
    }
    return ch;
  }

  /* Cuts off whatever the channels have queued: each fades out and is let go, and the next note makes it anew. */
  silence() {
    for (const ch of this.channels.values()) {
      ch.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.015);
      setTimeout(() => ch.pan.disconnect(), 200);
    }
    this.channels.clear();
  }

  /* Each insert's peak level now, 0 to 1 and over, for the meters. */
  levels() {
    const out = new Map<number, number>(), data = new Float32Array(512);
    for (const [index, ins] of this.inserts) {
      ins.meter.getFloatTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v));
      out.set(index, peak);
    }
    return out;
  }

  close() {
    for (const ch of this.channels.values()) ch.pan.disconnect();
    for (const ins of this.inserts.values()) ins.pan.disconnect();
  }
}

/* Plays every note that starts in [from, to) of the song's ticks, at `when(tick)` on the clock. */
function queue(graph: StudioGraph, song: StudioSong, notes: Map<string, StudioNote[]>, from: number, to: number, when: (tick: number) => number, spt: number) {
  for (const c of song.channels) {
    const list = notes.get(c.id);
    if (!list?.length) continue;
    let lo = 0, hi = list.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (list[mid].start < from) lo = mid + 1; else hi = mid; }
    if (lo >= list.length || list[lo].start >= to) continue;
    const synth = graph.channel(c.id, c.insert).synth;
    for (let i = lo; i < list.length && list[i].start < to; i++) {
      const n = list[i];
      synth.note(c.voice, n.pitch, when(n.start), n.len * spt, n.vel);
    }
  }
}

/* The live studio: an audio context, its graph, and the transport. The play position runs on in "virtual" ticks;
   inside a loop they wrap back to the loop's start. */
export class StudioEngine {
  readonly ctx: AudioContext;
  readonly graph: StudioGraph;
  private Engine: Engine;
  private run: { timer: ReturnType<typeof setInterval>; t0: number; from: number; cursor: number; spt: number } | null = null;
  private song: StudioSong;
  private notes = new Map<string, StudioNote[]>();
  private loop: [number, number] | null = null;
  private end = 0;

  private constructor(ctx: AudioContext, input: AudioNode, Engine: Engine, song: StudioSong) {
    this.ctx = ctx; this.Engine = Engine; this.song = song;
    this.graph = new StudioGraph(ctx, input, Engine);
  }

  static async create(song: StudioSong, master: (ctx: AudioContext, out: AudioNode) => AudioNode) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const out = ctx.createGain();
    out.gain.value = 0.6;
    out.connect(ctx.destination);
    const { SagaMusic: Engine } = await import("@/components/games/space2-music");
    const engine = new StudioEngine(ctx, master(ctx, out), Engine, song);
    engine.update(song, undefined, null);
    return engine;
  }

  get playing() { return !!this.run; }

  /* The song as it now is, and what the transport plays of it: the whole playlist (with an optional loop), or one
     pattern over and over. A change of tempo while playing carries on from where the music is. */
  update(song: StudioSong, pattern: string | undefined, loop: [number, number] | null) {
    const retime = this.run && Math.abs(this.run.spt - 60 / song.bpm / PPQ) > 1e-9;
    const at = this.position();
    this.song = song;
    this.notes = flatten(song, pattern);
    this.end = pattern ? patternLength(song, song.patterns.find((p) => p.id === pattern)) : songLength(song);
    this.loop = pattern ? [0, this.end] : loop;
    this.graph.sync(song);
    if (retime) this.play(at);
  }

  async resume() { if (this.ctx.state === "suspended") await this.ctx.resume(); }

  audition(channelId: string, pitch: number, dur = 0.3, vel = 0.9) {
    const c = this.song.channels.find((x) => x.id === channelId);
    if (!c) return;
    this.graph.channel(c.id, c.insert).synth.note(c.voice, pitch, this.ctx.currentTime + 0.005, dur, vel);
  }

  private wrap(v: number) {
    const l = this.loop;
    return l && v >= l[0] && l[1] > l[0] ? l[0] + ((v - l[0]) % (l[1] - l[0])) : v;
  }

  /* Where the music is, in ticks. */
  position() {
    const r = this.run;
    return r ? this.wrap(r.from + Math.max(0, this.ctx.currentTime - r.t0) / r.spt) : 0;
  }

  play(from = 0, onEnd?: () => void) {
    this.stop();
    const l = this.loop;
    let start = Math.max(0, from);
    if (l && (start < l[0] || start >= l[1])) start = l[0];
    const state = { timer: 0 as unknown as ReturnType<typeof setInterval>, t0: this.ctx.currentTime + 0.06, from: start, cursor: start, spt: 60 / this.song.bpm / PPQ };
    const tick = () => {
      const target = state.from + (this.ctx.currentTime + 0.15 - state.t0) / state.spt;
      let v = state.cursor;
      while (v < target) {
        const r = this.wrap(v), lp = this.loop;
        const segEnd = lp && v >= lp[0] ? lp[1] : this.end + PPQ;
        const span = Math.min(target - v, segEnd - r);
        if (span <= 0) break;
        const base = v - r;
        queue(this.graph, this.song, this.notes, r, r + span, (t) => state.t0 + (base + t - state.from) * state.spt, state.spt);
        v += span;
      }
      state.cursor = v;
      if (!this.loop && state.from + (this.ctx.currentTime - state.t0) / state.spt >= this.end + PPQ) { this.stop(); onEnd?.(); }
    };
    tick();
    state.timer = setInterval(tick, 25);
    this.run = state;
  }

  stop() {
    if (!this.run) return;
    clearInterval(this.run.timer);
    this.run = null;
    this.graph.silence();
    this.graph.sync(this.song);
  }

  close() {
    this.stop();
    this.graph.close();
    this.ctx.close().catch(() => {});
  }

  /* The whole playlist rendered offline to stereo at 44.1 kHz, with two seconds for the tails, a couple of seconds
     of score queued at a time so no one moment builds thousands of nodes. */
  async render(onProgress?: (share: number) => void) {
    const song = this.song, spt = 60 / song.bpm / PPQ, length = songLength(song), rate = 44100;
    const off = new OfflineAudioContext(2, Math.ceil((length * spt + 2) * rate), rate);
    const graph = new StudioGraph(off, offlineMaster(off, off.destination), this.Engine);
    graph.sync(song);
    const notes = flatten(song), chunk = Math.round(2 / spt), when = (t: number) => t * spt;
    queue(graph, song, notes, 0, chunk, when, spt);
    for (let at = chunk; at < length; at += chunk) {
      const from = at;
      off.suspend(Math.max(0, (from - chunk / 2) * spt)).then(() => {
        queue(graph, song, notes, from, from + chunk, when, spt);
        onProgress?.(from / length);
        return off.resume();
      }).catch(() => {});
    }
    const buffer = await off.startRendering();
    return [buffer.getChannelData(0), buffer.getChannelData(1)];
  }
}

/* The soundtrack's mastering without its live leveler: the same filters, glue and limiter, at a fixed gain. */
function offlineMaster(ctx: BaseAudioContext, output: AudioNode) {
  const filter = (type: BiquadFilterType, frequency: number, gain = 0, q = 0.707) => {
    const node = ctx.createBiquadFilter();
    node.type = type; node.frequency.value = frequency; node.gain.value = gain; node.Q.value = q;
    return node;
  };
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -24; glue.knee.value = 12; glue.ratio.value = 3; glue.attack.value = 0.02; glue.release.value = 0.25;
  const level = ctx.createGain();
  level.gain.value = 3;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -1; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.002; limiter.release.value = 0.12;
  const chain: AudioNode[] = [filter("highpass", 28), filter("peaking", 320, -1.5, 0.9), filter("lowshelf", 110, 1.5), filter("highshelf", 8500, 2), glue, level, limiter, output];
  for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
  return chain[0];
}

