/* Where a Space run got to, and where it is kept. Without an account only Chapter 1 can be
   played and nothing is saved; clearing it leaves a marker that the first sign-in picks up,
   so a visitor who makes an account straight after the first boss does not fly it again.
   A signed-in player's run is kept under their own name on this browser, and the account
   (see account.ts) keeps a copy for other devices; whichever is further along wins. */

/* The series' limits, as space-logic has them (a test keeps the two together). This file
   imports nothing from the game so that the tests can load it on its own. */
export const LIMITS = { chapters: 8, level: 10 };

export type Progress = { chapter: number; score: number; weapon: number; level: number; extra: number };

/* The key before accounts, and the marker a guest leaves on clearing Chapter 1. */
const LEGACY_KEY = "space-progress-v1";
const GUEST_KEY = "space-guest-clear-v1";
export const progressKey = (slot: string) => `space-progress-v2:${slot}`;

/* A run read back from storage or from the account, or null if it is not one. */
export function parseProgress(raw: unknown): Progress | null {
  if (!raw || typeof raw !== "object") return null;
  const { chapter, score, weapon, level, extra } = raw as Record<string, unknown>;
  const nums = [chapter, score, weapon, level, extra];
  if (!nums.every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  const c = Math.floor(chapter as number);
  if (c < 2 || c > LIMITS.chapters) return null;
  return {
    chapter: c,
    score: Math.max(0, Math.floor(score as number)),
    weapon: Math.min(3, Math.max(1, Math.floor(weapon as number))),
    level: Math.min(LIMITS.level, Math.max(1, Math.floor(level as number))),
    extra: Math.max(0, Math.floor(extra as number)),
  };
}

/* The run that is further along: the later chapter, and at the same chapter the higher
   score. The first one wins a tie. */
export function furthest(a: Progress | null, b: Progress | null): Progress | null {
  if (!a) return b;
  if (!b) return a;
  if (b.chapter !== a.chapter) return b.chapter > a.chapter ? b : a;
  return b.score > a.score ? b : a;
}

function read(key: string): Progress | null {
  try {
    return parseProgress(JSON.parse(localStorage.getItem(key) ?? "null"));
  } catch {
    return null;
  }
}

function write(key: string, p: Progress | null) {
  try {
    if (p) localStorage.setItem(key, JSON.stringify(p));
    else localStorage.removeItem(key);
  } catch {
    /* Storage blocked: progress lasts until the game is closed. */
  }
}

/* A signed-in player's saved run. Whatever a guest cleared before signing in, and the key
   from before accounts, are taken in once: the furthest of them is kept under this name
   and the markers go. */
export function loadSaved(slot: string): Progress | null {
  const own = read(progressKey(slot));
  const waiting = furthest(read(GUEST_KEY), read(LEGACY_KEY));
  const best = furthest(own, waiting);
  if (waiting) {
    if (best !== own) write(progressKey(slot), best);
    write(GUEST_KEY, null);
    write(LEGACY_KEY, null);
  }
  return best;
}

export function saveSaved(slot: string, p: Progress | null) {
  write(progressKey(slot), p);
}

/* A guest cleared Chapter 1: remembered only so that signing in carries it over. */
export function stashGuest(p: Progress) {
  write(GUEST_KEY, p);
}
