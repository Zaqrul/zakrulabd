"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { TbMusic, TbPlayerPlayFilled, TbPlayerSkipBackFilled, TbPlayerSkipForwardFilled, TbPlayerStopFilled, TbVolume } from "react-icons/tb";
import type { NesMusic } from "@/components/games/space-music";
import type { SagaMusic } from "@/components/games/space2-music";
import { ALBUMS, trackTitle, type Album, type Track } from "@/lib/soundtrack";

const copy = {
  en: {
    heading: "Soundtrack",
    intro: "The Space soundtracks, bonus tracks and a complete alternate edition of Space 2.",
    albums: { space: "Space", space2: "Space 2", space2alt: "Space 2: Ascension" } as Record<Album, string>,
    albumNote: { space: "Chiptune on the four voices of an 8-bit console", space2: "A 16-bit orchestra with brass, strings and organ", space2alt: "New Codex melodies across the complete album, with written counter-melodies and changing orchestration" } as Record<Album, string>,
    nothing: "Pick a track to play",
    nowPlaying: "Now playing",
    play: "Play",
    stop: "Stop",
    previous: "Previous track",
    next: "Next track",
    volume: "Volume",
    tracks: (n: number) => `${n} tracks`,
    bonus: "Bonus track",
    bonusTracks: "Bonus tracks",
    bonusNote: "Not in the game",
  },
  ms: {
    heading: "Runut bunyi",
    intro: "Runut bunyi Space, lagu bonus dan edisi alternatif penuh Space 2.",
    albums: { space: "Angkasa", space2: "Angkasa 2", space2alt: "Angkasa 2: Ascension" } as Record<Album, string>,
    albumNote: { space: "Chiptune pada empat suara konsol 8-bit", space2: "Orkestra 16-bit dengan brass, tali dan organ", space2alt: "Melodi baharu gubahan Codex untuk seluruh album, dengan melodi iringan dan perubahan instrumen" } as Record<Album, string>,
    nothing: "Pilih lagu untuk dimainkan",
    nowPlaying: "Sedang dimainkan",
    play: "Main",
    stop: "Henti",
    previous: "Lagu sebelumnya",
    next: "Lagu seterusnya",
    volume: "Kelantangan",
    tracks: (n: number) => `${n} lagu`,
    bonus: "Lagu bonus",
    bonusTracks: "Lagu bonus",
    bonusNote: "Tiada dalam permainan",
  },
};

/* The slider's gain sits after the mastering chain below, which already brings every track to the same loud level
   (peaks held at -3 dBFS). That was too loud, so full volume is 0.7 of it (30% quieter, about -3 dB), and the
   default 70% is 0.49. */
const LEVEL = 0.7;

/* Mastering, in the order a mix goes through it: cut the rumble below hearing, take a little mud out of the
   low mids, add weight at the bottom and air at the top, glue the layers together with a slow gentle compressor,
   bring every track to the same loudness, then catch the peaks with a fast limiter. The tunes are written quiet
   (their voices sit near 0.04), so the loudness stage does the real work: it listens to the mix and raises it
   until its level is about -16 dBFS RMS, whatever the track, and only then does the volume slider apply, so the
   slider still means something. Returns the node the engines play into. */
const TARGET_RMS = 10 ** (-16 / 20);
/* The most the leveler raises the mix (about +16 dB), and where it drops to when the output device changes. */
const LEVELER_MAX = 6;
const LEVELER_SAFE = 2;
function master(audio: AudioContext, output: AudioNode) {
  const filter = (type: BiquadFilterType, frequency: number, gain = 0, q = 0.707) => {
    const node = audio.createBiquadFilter();
    node.type = type;
    node.frequency.value = frequency;
    node.gain.value = gain;
    node.Q.value = q;
    return node;
  };
  const glue = audio.createDynamicsCompressor();
  glue.threshold.value = -24;
  glue.knee.value = 12;
  glue.ratio.value = 3;
  glue.attack.value = 0.02;
  glue.release.value = 0.25;
  const leveler = audio.createGain();
  leveler.gain.value = LEVELER_SAFE;
  const meter = audio.createAnalyser();
  meter.fftSize = 2048;
  const limiter = audio.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.12;
  const chain = [filter("highpass", 28), filter("peaking", 320, -1.5, 0.9), filter("lowshelf", 110, 1.5), filter("highshelf", 8500, 2), glue, leveler, limiter, output];
  chain.slice(1).reduce<AudioNode>((from, to) => from.connect(to), chain[0]);
  leveler.connect(meter);

  /* Measure the mix after the leveler and steer the leveler towards the target. The level is averaged over a
     few seconds, and quiet gaps (a rest, a fade, a pause) are not counted, so a soft passage cannot pump the
     gain up just before a loud one. The gain falls quickly and rises slowly, and never past LEVELER_MAX. When
     the output changes (earphones swapped, Bluetooth reconnected) or the context is interrupted, it drops to a
     safe level and settles again from there, since the new device may be much louder. */
  const samples = new Float32Array(meter.fftSize);
  let power = 0;
  const calm = () => {
    power = 0;
    leveler.gain.cancelScheduledValues(audio.currentTime);
    leveler.gain.setTargetAtTime(Math.min(leveler.gain.value, LEVELER_SAFE), audio.currentTime, 0.05);
  };
  const devices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  devices?.addEventListener?.("devicechange", calm);
  audio.addEventListener("statechange", calm);
  const timer = setInterval(() => {
    if (audio.state === "closed") {
      devices?.removeEventListener?.("devicechange", calm);
      return clearInterval(timer);
    }
    if (audio.state !== "running") return;
    meter.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const v of samples) sum += v * v;
    const now = sum / samples.length;
    if (now < 0.002 ** 2) return;
    power = power ? power + (now - power) * 0.04 : now;
    const rms = Math.sqrt(power), gain = leveler.gain.value;
    const wanted = Math.min(LEVELER_MAX, Math.max(1, gain * (TARGET_RMS / rms)));
    leveler.gain.value = gain + (wanted - gain) * (wanted < gain ? 0.3 : 0.02);
  }, 100);
  return chain[0];
}

/* A player for the games' own tunes, in zakrulOS. It makes its own audio context the first time a
   tune is played (a click, so the browser allows it) and loads the synthesisers only then, one for
   each album. Leaving the view stops the music. */
export function SoundtrackView({ lang }: { lang: "en" | "ms" }) {
  const t = copy[lang];
  const [album, setAlbum] = useState<Album>("space");
  const [current, setCurrent] = useState<Track | null>(null);
  const [volume, setVolume] = useState(70);
  const ctx = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const input = useRef<AudioNode | null>(null);
  const nes = useRef<NesMusic | null>(null);
  const saga = useRef<SagaMusic | null>(null);
  const volumeRef = useRef(volume);

  const engines = useCallback(() => [nes.current, saga.current], []);

  const stop = useCallback(() => {
    for (const engine of engines()) engine?.stop();
    setCurrent(null);
  }, [engines]);

  const play = useCallback(
    async (track: Track) => {
      if (!ctx.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        ctx.current = new Ctor();
        gain.current = ctx.current.createGain();
        gain.current.gain.value = (volumeRef.current / 100) * LEVEL;
        gain.current.connect(ctx.current.destination);
        input.current = master(ctx.current, gain.current);
      }
      const audio = ctx.current;
      if (audio.state === "suspended") await audio.resume();
      if (track.album === "space") {
        nes.current ??= new (await import("@/components/games/space-music")).NesMusic();
        saga.current?.stop();
        nes.current.start(audio, input.current!, track.engine);
      } else {
        saga.current ??= new (await import("@/components/games/space2-music")).SagaMusic();
        nes.current?.stop();
        saga.current.start(audio, input.current!, track.engine);
      }
      setCurrent(track);
    },
    [],
  );

  /* A tune that plays once ends, or hands on to another (the victory fanfare to the hangar), and the
     view follows whichever is sounding. */
  useEffect(() => {
    if (!current) return;
    const timer = setInterval(() => {
      const engine = current.album === "space" ? nes.current : saga.current;
      const sounding = engine?.playing ?? null;
      if (sounding === null) setCurrent(null);
      else if (sounding !== current.engine) {
        const next = ALBUMS[current.album].find((track) => track.engine === sounding);
        if (next) setCurrent(next);
      }
    }, 400);
    return () => clearInterval(timer);
  }, [current]);

  useEffect(() => {
    volumeRef.current = volume;
    if (gain.current) gain.current.gain.value = (volume / 100) * LEVEL;
  }, [volume]);

  useEffect(() => {
    return () => {
      nes.current?.stop();
      saga.current?.stop();
      ctx.current?.close().catch(() => {});
      ctx.current = null;
    };
  }, []);

  const list = ALBUMS[album];
  const step = (by: number) => {
    const pool = current ? ALBUMS[current.album] : list;
    const at = current ? pool.findIndex((track) => track.engine === current.engine) : -1;
    const next = pool[(at + by + pool.length) % pool.length];
    void play(next);
    setAlbum(next.album);
  };

  const control =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-amber-400 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

  return (
    <section aria-label={t.heading} className="rise-in mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div>
        <h3 className="font-display text-[20px] font-extrabold tracking-tight">{t.heading}</h3>
        <p className="mt-1 text-[13px] leading-snug text-slate-300">{t.intro}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-navy">
            <TbMusic className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">{t.nowPlaying}</p>
            <p className="truncate font-display text-[16px] font-extrabold">{current ? trackTitle(current, lang) : t.nothing}</p>
            {current && <p className="truncate text-[12px] text-slate-300">{t.albums[current.album]}{current.bonus ? ` · ${t.bonus}` : ""}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button type="button" aria-label={t.previous} title={t.previous} className={control} onClick={() => step(-1)}>
              <TbPlayerSkipBackFilled aria-hidden="true" className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              aria-label={current ? t.stop : t.play}
              title={current ? t.stop : t.play}
              className={`${control} h-11 w-11 bg-amber-400 text-navy hover:bg-white`}
              onClick={() => (current ? stop() : void play(list[0]))}
            >
              {current ? <TbPlayerStopFilled aria-hidden="true" className="h-5 w-5" /> : <TbPlayerPlayFilled aria-hidden="true" className="h-5 w-5" />}
            </button>
            <button type="button" aria-label={t.next} title={t.next} className={control} onClick={() => step(1)}>
              <TbPlayerSkipForwardFilled aria-hidden="true" className="h-4.5 w-4.5" />
            </button>
          </div>
          <label className="ml-auto flex min-w-36 flex-1 items-center gap-2 text-[12px] font-bold text-slate-300 sm:max-w-52 sm:flex-none">
            <TbVolume aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
            <span className="sr-only">{t.volume}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-amber-400"
            />
          </label>
        </div>
      </div>

      <div role="tablist" aria-label={t.heading} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(Object.keys(ALBUMS) as Album[]).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={album === id}
            onClick={() => setAlbum(id)}
            className={`min-w-0 rounded-xl px-4 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              album === id ? "bg-amber-400 text-navy" : "bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10"
            }`}
          >
            <span className="block font-display text-[14px] font-extrabold leading-tight">{t.albums[id]}</span>
            <span className={`block text-[11px] leading-snug ${album === id ? "text-navy/80" : "text-slate-300"}`}>{t.tracks(ALBUMS[id].length)}</span>
          </button>
        ))}
      </div>
      <p className="-mt-3 text-[12px] text-slate-300">{t.albumNote[album]}</p>

      <ol role="tabpanel" aria-label={t.albums[album]} className="flex flex-col gap-1.5">
        {list.map((track, n) => {
          const active = current?.engine === track.engine;
          const opens = track.bonus && !list[n - 1]?.bonus;
          return (
            <Fragment key={track.engine}>
              {opens && (
                <li role="presentation" className="mt-3 flex items-baseline gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-300">
                  {t.bonusTracks}
                  <span className="text-[11px] font-semibold normal-case tracking-normal text-slate-500">{t.bonusNote}</span>
                </li>
              )}
              <li>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => (active ? stop() : void play(track))}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active ? "bg-amber-400 text-navy" : "bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className={`w-6 shrink-0 text-right font-mono text-[12px] tabular-nums ${active ? "text-navy/70" : "text-slate-500"}`}>{n + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{trackTitle(track, lang)}</span>
                  {track.bonus && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide ${active ? "bg-navy text-amber-400" : "bg-amber-400 text-navy"}`}>
                      {t.bonus}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${active ? "bg-navy text-amber-400" : "bg-white/10 text-white group-hover:bg-amber-400 group-hover:text-navy"}`}
                  >
                    {active ? <TbPlayerStopFilled className="h-3.5 w-3.5" /> : <TbPlayerPlayFilled className="h-3.5 w-3.5" />}
                  </span>
                </button>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}
