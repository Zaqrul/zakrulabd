"use client";

/* A self-contained Space 3 control bank. The engine owns availability and
   consumes one queued action per activation. No held or repeating inputs. */
import { BARRIER, PHASE, RESONANCE } from "./space3-resonance";
import { useEffect, useState } from "react";
import { Joystick } from "./touch-controls";
import { LANCE, PUSH } from "./space3-arsenal";

export type ResonanceControlsStatus = {
  meter: number;
  phase: number;
  phaseCd: number;
  barrier: number;
  barrierCd: number;
  overdrive: number;
};

type Props = {
  status: ResonanceControlsStatus;
  disabled?: boolean;
  glass?: boolean;
  onPhase?: () => void;
  onBarrier?: () => void;
  onOverdrive?: () => void;
  onLance?: () => void;
  onPush?: () => void;
  lanceActive?: boolean;
  compact?: boolean;
  lang?: "en" | "ms";
};

export function Space3TouchControls({ status, disabled = false, glass = false, onPhase, onBarrier, onOverdrive, onLance, onPush, lanceActive = false, compact = false, lang = "en" }: Props) {
  const triggerPush = onPush ?? onLance;
  const pushReady = status.meter >= PUSH.cost && !disabled;
  const pushProgress = Math.min(1, status.meter / PUSH.cost);
  const ms = lang === "ms";

  return (
    <div role="group" aria-label="Space 3 flight controls" className="flex items-center gap-2">
      {triggerPush && (
        <button
          type="button"
          aria-label={ms ? "Tolakan Kinetik" : "Kinetic Push"}
          title={ms ? "Tolakan Kinetik (B): tolak musuh dan peluru" : "Kinetic Push (B): repel enemies and bullets"}
          disabled={!pushReady}
          onPointerDown={e => {
            e.preventDefault(); e.stopPropagation();
            if (e.button === 0 && pushReady) triggerPush();
          }}
          onClick={e => { e.stopPropagation(); if (e.detail === 0 && pushReady) triggerPush(); }}
          className={`relative flex min-h-12 flex-1 touch-none select-none flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border px-3 py-1.5 text-[11px] font-bold leading-tight shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 enabled:active:scale-95 disabled:cursor-default ${
            pushReady ? "border-amber-400/60 bg-amber-500/20 text-amber-300 shadow-amber-500/10" : "border-white/15 bg-neutral-900/80 text-neutral-400 opacity-60"
          } ${glass ? "backdrop-blur-md" : ""}`}
        >
          <div className="flex items-center gap-1.5">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M7 7a7 7 0 0 1 10 0" />
              <path d="M4 4a12 12 0 0 1 16 0" />
              <path d="M17 17a7 7 0 0 1-10 0" />
              <path d="M20 20a12 12 0 0 1-16 0" />
            </svg>
            <span className="tracking-wide uppercase">{ms ? "Tolakan Kinetik" : "Kinetic Push"}</span>
          </div>
          <span className="text-[9px] font-semibold tabular-nums text-white/80">
            {pushReady ? (ms ? "SEDIA · B" : "READY · B") : `${Math.floor(status.meter)}/${PUSH.cost}`}
          </span>
          <span aria-hidden="true" className="absolute inset-x-2 bottom-1 h-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full bg-amber-400 transition-all duration-100" style={{ width: `${pushProgress * 100}%` }} />
          </span>
        </button>
      )}
    </div>
  );
}

export type FlightControlsStatus = ResonanceControlsStatus & { flying: boolean; lanceActive: boolean };

/* Poll only the mounted touch UI, at 10 Hz. Canvas simulation remains at its
   original rate and React does not rerender the whole game every frame. */
export function Space3FlightControls({ readStatus, playing, compact, onJoystick, onPhase, onBarrier, onOverdrive, onLance, onPush, onPause, lang = "en" }: {
  readStatus: () => FlightControlsStatus | null;
  playing: boolean;
  compact: boolean;
  onJoystick: (x: number, y: number) => void;
  onPhase?: () => void;
  onBarrier?: () => void;
  onOverdrive?: () => void;
  onLance?: () => void;
  onPush?: () => void;
  onPause: () => void;
  lang?: "en" | "ms";
}) {
  const [status, setStatus] = useState<FlightControlsStatus>({ meter: 0, phase: 0, phaseCd: 0, barrier: 0, barrierCd: 0, overdrive: 0, flying: false, lanceActive: false });
  useEffect(() => {
    let raf = 0, last = -100;
    const update = (now: number) => {
      if (now - last >= 100) {
        last = now;
        const next = readStatus();
        if (next) setStatus(previous => Object.keys(next).every(key => next[key as keyof FlightControlsStatus] === previous[key as keyof FlightControlsStatus]) ? previous : next);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [readStatus]);
  return (
    <div data-space-controls className="flex items-center gap-2 py-1">
      <div className={`flex shrink-0 items-center gap-1.5 ${compact ? "flex-row" : "flex-col"}`}>
        <Joystick key={playing ? "play" : "paused"} label={lang === "ms" ? "Kayu bedal penerbangan" : "Flight joystick"} size={72} disabled={!playing || !status.flying} onChange={onJoystick} />
        <button type="button" onClick={onPause} aria-label={playing ? (lang === "ms" ? "Jeda" : "Pause") : (lang === "ms" ? "Teruskan" : "Resume")} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">{playing ? <path d="M5 3h3v14H5zm7 0h3v14h-3z" /> : <path d="m6 3 11 7-11 7z" />}</svg>
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <Space3TouchControls status={status} disabled={!playing || !status.flying} onPhase={onPhase} onBarrier={onBarrier} onOverdrive={onOverdrive} onLance={onLance} onPush={onPush} lanceActive={status.lanceActive} compact={compact} lang={lang} />
      </div>
    </div>
  );
}
