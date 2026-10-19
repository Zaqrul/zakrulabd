/* Procedural Web Audio Engine for Space 1 & Space 2: sound effects here, Space 1's NES-style music
   in space-music.ts and Space 2's 16-bit orchestra in space2-music.ts. 100% procedural, zero
   external MP3/audio assets, zero licensing issues. */
import { isSecond, isThird, type Gun } from "./space-logic";
import { NesMusic, type NesTrack } from "./space-music";
import { SagaMusic, type SagaTrack } from "./space2-music";

class SpaceAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private music = new NesMusic();
  private saga = new SagaMusic();
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("game-sound-space");
        this.isMuted = saved === "0";
      } catch {
        this.isMuted = false;
      }
    }
  }

  private init() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    try {
      localStorage.setItem("game-sound-space", muted ? "0" : "1");
    } catch {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    if (muted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  /* ---------------- SOUND EFFECTS (SFX) ---------------- */

  /* Player Blaster / Vulcan shot; guns without a sound of their own use the standard one. */
  public playBlaster(type: Gun = "blaster") {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;

    if (type === "laser") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    if (type === "hyperbeam") {
      // Deep energy sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.28);
      return;
    }

    if (type === "torpedo") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
      return;
    }

    // Standard Blaster / Machine gun / Spread
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const isSpread = type === "spread";
    osc.type = "square";
    osc.frequency.setValueAtTime(isSpread ? 700 : 880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

    gain.gain.setValueAtTime(type === "machine" ? 0.06 : 0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /* Explosions */
  public playExplosion(kind: "small" | "heavy" | "boss" = "small") {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const dur = kind === "boss" ? 0.6 : kind === "heavy" ? 0.35 : 0.18;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(kind === "boss" ? 500 : kind === "heavy" ? 800 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(kind === "boss" ? 0.3 : kind === "heavy" ? 0.22 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);

    // Add sub-bass punch for heavy and boss
    if (kind !== "small") {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(35, now + dur);
      subGain.gain.setValueAtTime(0.25, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      sub.connect(subGain);
      subGain.connect(this.sfxGain);
      sub.start(now);
      sub.stop(now + dur);
    }
  }

  /* Player hit / shield deflection */
  public playHit(isShield = true) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isShield) {
      // Resonant metallic chime
      osc.type = "triangle";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    } else {
      // Hull thud
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + (isShield ? 0.08 : 0.12));
  }

  /* Bloom Shield Absorbed Bullet (Space 2) */
  public playBloomAbsorb() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.5, now); // C6
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.06); // G6

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /* Boss warning siren / incoming hazard cue */
  public playBossAlarm() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.08);
    osc.frequency.setValueAtTime(880, now + 0.16);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  /* Level Up / Crate pickup */
  public playPowerup() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.05;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + 0.12);
    });
  }

  /* Nuke / Bomb blast */
  public playNuke() {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const dur = 1.0;

    // Sub-bass drop
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(200, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + dur);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + dur);

    // Resonant rumble
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + dur);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  /* ---------------- MUSIC (see space-music.ts and space2-music.ts) ---------------- */

  /* Each campaign has its own music, and each chapter's boss its own track: Space 1 (chapters 1 to
     8) on the NES voices, Space 2 (9 to 16) on the 16-bit orchestra. The last three chapters of
     each fight to a battle tune of their own. */
  /* `phase` is the boss's: Atlas's music changes with it. */
  public startMusic(mode: Exclude<NesTrack, `boss${number}`> | "boss" = "stage", chapter = 1, phase = 0) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.musicGain) return;
    const place = ((chapter - 1) % 8) + 1;
    /* Each game's last boss changes its music with its phases. */
    const shift = place === 8 && mode === "boss" ? (phase >= 5 ? "c" : phase >= 3 ? "b" : "") : "";
    /* Each campaign's hangar and warning take turns between three tunes, chapter by chapter. */
    const turn = (place - 1) % 3, variant = (mode === "hangar" || mode === "alert") && turn > 0 ? String(turn + 1) : "";
    if (isThird(chapter)) {
      /* Space 3's tunes (space3-music.ts); the cues it has not written yet borrow Space 2's. */
      /* Space 3's tunes (space3-orchestra.ts); the cues it has not written borrow Space 2's. */
      /* Each chapter its own battle and boss; the hangar and the warning take turns between three; the Herald changes with its phases. */
      const n = Math.min(12, Math.max(1, chapter - 16)), turn3 = ["", "2", "3"][(n - 1) % 3];
      const boss = n === 12 ? (phase >= 2 ? "s3boss12c" : phase >= 1 ? "s3boss12b" : "s3boss12") : `s3boss${n}`;
      const own: Partial<Record<string, SagaTrack>> = { hangar: `s3hangar${turn3}` as SagaTrack, stage: `s3stage${n}` as SagaTrack, alert: `s3alert${turn3}` as SagaTrack, boss: boss as SagaTrack, victory: "s3victory", title: "s3title", fanfare: "s3fanfare", pause: "s3pause", gameover: "s3gameover", ending: "s3ending" };
      this.music.stop();
      this.saga.start(ctx, this.musicGain, own[mode] ?? (`s2${mode}` as SagaTrack));
    } else if (isSecond(chapter)) {
      const tune = mode === "boss" ? `boss${place}${shift}` : mode === "stage" && place >= 6 ? "stage2" : mode;
      this.music.stop();
      this.saga.start(ctx, this.musicGain, `s2${tune}${variant}` as SagaTrack);
    } else {
      /* Space 1's battles: one tune for chapters 1 and 2, another for 3 to 5, a third for 6 to 8. */
      const tune = mode === "boss" ? `boss${place}${shift}` : mode === "stage" ? (place >= 6 ? "stage2" : place >= 3 ? "stage3" : "stage") : mode;
      this.saga.stop();
      this.music.start(ctx, this.musicGain, `${tune}${variant}` as NesTrack);
    }
  }

  public stopMusic() {
    this.music.stop();
    this.saga.stop();
  }

  /* The launch countdown: a short beep for 3, 2 and 1, and a longer, higher one for GO. */
  public playCountdown(go = false) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime, dur = go ? 0.4 : 0.14;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(go ? 1320 : 880, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + dur * 0.8);
    gain.gain.linearRampToValueAtTime(0, now + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  /* Take-off: the engines roar (noise sweeping up over a low rumble) under the fanfare. */
  public playLiftoff(chapter = 1) {
    if (this.isMuted) return;
    const ctx = this.init();
    if (!ctx || !this.sfxGain || !this.musicGain) return;
    const now = ctx.currentTime, dur = 1.4;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + dur * 0.7);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = "sawtooth";
    rumble.frequency.setValueAtTime(48, now);
    rumble.frequency.exponentialRampToValueAtTime(90, now + dur);
    rumbleGain.gain.setValueAtTime(0.12, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    rumble.connect(rumbleGain);
    rumbleGain.connect(this.sfxGain);
    rumble.start(now);
    rumble.stop(now + dur);
    if (isThird(chapter)) {
      this.music.stop();
      this.saga.start(ctx, this.musicGain, "s3victory");
    } else if (isSecond(chapter)) {
      this.music.stop();
      this.saga.start(ctx, this.musicGain, "s2fanfare");
    } else {
      this.saga.stop();
      this.music.fanfare(ctx, this.musicGain);
    }
  }
}

export const spaceAudio = new SpaceAudioEngine();
