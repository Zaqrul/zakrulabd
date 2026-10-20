"use client";

/* Space 3's one touch button: Kinetic Push, which repels enemies and bullets once its meter is
   full. The engine owns availability and consumes one queued action per tap; nothing is held or
   repeated. Movement is a drag on the game itself, like Space and Space 2. */
import { useEffect, useState } from "react";
import { PUSH } from "./space3-arsenal";

export type ResonanceControlsStatus = {
  meter: number;
  phase: number;
  phaseCd: number;
  barrier: number;
  barrierCd: number;
  overdrive: number;
};
export type FlightControlsStatus = ResonanceControlsStatus & { flying: boolean; lanceActive: boolean };

const RING = 2 * Math.PI * 29;

/* Polls only the mounted button, at 10 Hz. The canvas simulation keeps its own rate and React
   does not rerender the whole game every frame. */
export function KineticPushButton({ readStatus, playing, onPush, lang = "en", className = "" }: {
  readStatus: () => FlightControlsStatus | null;
  playing: boolean;
  onPush: () => void;
  lang?: "en" | "ms";
  className?: string;
}) {
  const [status, setStatus] = useState({ meter: 0, flying: false });
  useEffect(() => {
    let raf = 0, last = -100;
    const update = (now: number) => {
      if (now - last >= 100) {
        last = now;
        const next = readStatus();
        if (next) setStatus((previous) => (previous.meter === next.meter && previous.flying === next.flying ? previous : { meter: next.meter, flying: next.flying }));
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [readStatus]);

  const ms = lang === "ms";
  const ready = status.meter >= PUSH.cost && playing && status.flying;
  const progress = Math.min(1, status.meter / PUSH.cost);
  const name = ms ? "Tolakan Kinetik" : "Kinetic Push";
  return (
    <button
      type="button"
      aria-label={name}
      title={`${name} (B)`}
      disabled={!ready}
      data-space-controls
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.button === 0 && ready) onPush();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.detail === 0 && ready) onPush();
      }}
      className={`relative flex h-16 w-16 shrink-0 touch-none select-none items-center justify-center rounded-full text-amber-300 shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 enabled:active:scale-95 disabled:cursor-default ${
        ready ? "bg-amber-500/25 ring-2 ring-amber-400/70" : "bg-neutral-900/70 text-neutral-400 ring-1 ring-white/15"
      } ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 64 64" className="pointer-events-none absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <circle cx="32" cy="32" r="29" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M7 7a7 7 0 0 1 10 0" />
        <path d="M4 4a12 12 0 0 1 16 0" />
        <path d="M17 17a7 7 0 0 1-10 0" />
        <path d="M20 20a12 12 0 0 1-16 0" />
      </svg>
    </button>
  );
}
