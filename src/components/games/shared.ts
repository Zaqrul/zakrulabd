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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
