"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { stickFrom } from "./joystick-math";

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/* Whether the player is on a phone or a tablet, where a finger is the main pointer and the
   joystick belongs, and whether it is held upright. Upright, the controls go under the game;
   on its side the game takes the whole screen and they sit over its corners. Anywhere with
   a mouse or a trackpad this says no, and nothing is drawn. */
export function useTouchPad() {
  const touch = useMedia("(pointer: coarse)");
  const portrait = useMedia("(orientation: portrait)");
  return { touch, portrait };
}

/* An on-screen joystick: put a thumb anywhere on it and the knob follows, held inside the
   rim, and `onChange` hears each move as x and y from -1 to 1 (zero in the middle and when
   the thumb lifts). `glass` is for over the game, where it is see-through. */
export function Joystick({
  label,
  size = 124,
  glass = false,
  onChange,
  className = "",
}: {
  label: string;
  size?: number;
  glass?: boolean;
  onChange: (x: number, y: number) => void;
  className?: string;
}) {
  const base = useRef<HTMLDivElement>(null);
  const finger = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const knobSize = Math.round(size * 0.42);
  const radius = (size - knobSize) / 2;

  function follow(e: React.PointerEvent) {
    const el = base.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const v = stickFrom(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), radius);
    setKnob({ x: v.kx, y: v.ky });
    onChange(v.x, v.y);
  }

  function letGo() {
    finger.current = null;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  }

  return (
    <div
      ref={base}
      role="group"
      aria-label={label}
      style={{ width: size, height: size }}
      className={`relative shrink-0 touch-none select-none rounded-full ${
        glass ? "bg-navy/35 ring-2 ring-white/40" : "bg-navy/90 ring-2 ring-amber-400/40"
      } ${className}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (finger.current !== null) return;
        finger.current = e.pointerId;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        follow(e);
      }}
      onPointerMove={(e) => {
        if (e.pointerId === finger.current) follow(e);
      }}
      onPointerUp={(e) => {
        if (e.pointerId === finger.current) letGo();
      }}
      onPointerCancel={(e) => {
        if (e.pointerId === finger.current) letGo();
      }}
      onLostPointerCapture={(e) => {
        if (e.pointerId === finger.current) letGo();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* The cross hairs, so it reads as a stick at a glance. */}
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 bg-white/15" />
      <span aria-hidden="true" className="pointer-events-none absolute left-[14%] top-1/2 h-px w-[72%] -translate-y-1/2 bg-white/15" />
      <span
        aria-hidden="true"
        style={{
          width: knobSize,
          height: knobSize,
          left: (size - knobSize) / 2,
          top: (size - knobSize) / 2,
          transform: `translate(${knob.x}px, ${knob.y}px)`,
        }}
        className={`pointer-events-none absolute rounded-full border-2 border-navy ${glass ? "bg-amber-400/85" : "bg-amber-400"}`}
      />
    </div>
  );
}
