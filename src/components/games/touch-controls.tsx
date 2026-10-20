"use client";

import { useSyncExternalStore } from "react";

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

/* What the screen is. `touch` is any touch screen (a phone, a tablet, a laptop with one);
   `handheld` is a device whose main pointer is a finger, which is where the game takes the whole
   screen when it is turned on its side; `portrait` is whether it is held upright. Anywhere with
   a mouse or a trackpad and no touch screen, all three say no, and nothing touch is drawn. */
export function useTouchPad() {
  const touch = useMedia("(any-pointer: coarse)");
  const handheld = useMedia("(pointer: coarse)");
  const portrait = useMedia("(orientation: portrait)");
  return { touch, handheld, portrait };
}

type Orientation = { lock?: (to: string) => Promise<void>; unlock?: () => void };
const orientation = () => (typeof screen === "undefined" ? undefined : (screen.orientation as unknown as Orientation | undefined));

/* Whether the browser lets a page go full screen. An iPhone's browser does not; there the game
   still fills the page when it is turned on its side. */
export const canFullscreen = () => typeof document !== "undefined" && Boolean(document.fullscreenEnabled);

/* True while the page is full screen. */
export function useFullscreen() {
  return useSyncExternalStore(
    (notify) => {
      document.addEventListener("fullscreenchange", notify);
      return () => document.removeEventListener("fullscreenchange", notify);
    },
    () => document.fullscreenElement !== null,
    () => false,
  );
}

/* Full screen, and turned on its side where the browser allows it (Android's does, once the page
   is full screen). Has to answer a tap. A refusal is fine: the game fills the page anyway. */
export async function enterFullscreen() {
  if (!canFullscreen()) return;
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    await orientation()?.lock?.("landscape");
  } catch {
    /* Refused or unsupported. */
  }
}

export async function leaveFullscreen() {
  try {
    orientation()?.unlock?.();
    if (document.fullscreenElement) await document.exitFullscreen();
  } catch {
    /* Already out. */
  }
}
