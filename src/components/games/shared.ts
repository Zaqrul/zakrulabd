/* Small helpers the three mini games share. */

export function loadBest(key: string) {
  try {
    return Number(localStorage.getItem(`game-best-${key}`)) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(key: string, value: number) {
  try {
    localStorage.setItem(`game-best-${key}`, String(value));
  } catch {
    /* Storage blocked: the best score lasts until the panel is closed. */
  }
  /* Signed-in players also keep it on their account. Imported on demand so the
     account code never loads for anyone who just plays. */
  void import("@/lib/account").then((m) => m.pushScore(key, value));
  stat(key, "score", value);
}

/* Keys pressed while typing in a form are not the game's. */
export function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  return Boolean(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
}

/* Sizes the canvas's pixel buffer to how big it is on screen (up to 2x for sharp
   lines on phones) and returns a context that draws in the game's own units, so
   the same code works at any width. */
export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  /* A phone's canvas is drawn at up to 1.5 device pixels to a logical one, not 2: the same picture on 44% fewer pixels. */
  const dpr = Math.min(window.devicePixelRatio || 1, window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2);
  const cssWidth = canvas.clientWidth || width;
  const scale = (cssWidth * dpr) / width;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return ctx;
}

export const NAVY = "#171717";
export const AMBER = "#fbcf33";

/* Tells the achievements something happened. Loaded on demand, like the account code, so a game
   never waits for it. */
export function stat(game: string, key: string, value: number, mode: "max" | "add" = "max") {
  void import("@/lib/achievements").then((m) => m.report(game, key, value, mode));
}

/* A game's way of reporting: hand it a snapshot every frame and it sends only what changed. A
   total that has gone down means a new state began from zero, so it counts again from there. */
export function makeReporter(game: string) {
  const maxes: Record<string, number> = {};
  const adds: Record<string, number> = {};
  return {
    sync(snap: { max?: Record<string, number>; add?: Record<string, number> }) {
      for (const [k, v] of Object.entries(snap.max ?? {})) {
        if (v > (maxes[k] ?? 0)) {
          maxes[k] = v;
          stat(game, k, v, "max");
        }
      }
      for (const [k, v] of Object.entries(snap.add ?? {})) {
        const sent = adds[k] ?? 0;
        if (v < sent) adds[k] = 0;
        const diff = v - (adds[k] ?? 0);
        if (diff > 0) {
          adds[k] = v;
          stat(game, k, diff, "add");
        }
      }
    },
  };
}
