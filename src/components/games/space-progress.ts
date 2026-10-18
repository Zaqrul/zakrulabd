/* Where a Space run got to, and where it is kept. Without an account only Chapter 1 can be
   played and nothing is saved; clearing it leaves a marker that the first sign-in picks up,
   so a visitor who makes an account straight after the first boss does not fly it again.
   A signed-in player's run is kept under their own name on this browser, and the account
   (see account.ts) keeps a copy for other devices; whichever is further along wins. */

/* The series' limits, as space-logic has them (a test keeps the two together). This file
   imports nothing from the game so that the tests can load it on its own. */
export const LIMITS = { chapters: 8, level: 10 };
/* Space 2 is the engine's chapters 9 to 16, saved apart from Space 1 (a run is saved from its second chapter). */
export const LIMITS2 = { first: 9, last: 16 };

/* A run has CHANCES: each time the ship is lost one is spent to fly the chapter (or the boss) again.
   Lost with none left, the run is over and starts again from Chapter 1. */
export const CHANCES = 2;

export type Progress = { chapter: number; score: number; weapon: number; level: number; extra: number; chances?: number };

/* The key before accounts, and the marker a guest leaves on clearing Chapter 1. */
const LEGACY_KEY = "space-progress-v1";
const GUEST_KEY = "space-guest-clear-v1";
const guestKey = (campaign: number) => campaign === 2 ? "space2-guest-clear-v1" : GUEST_KEY;
export const progressKey = (slot: string, campaign = 1) => (campaign === 2 ? `space2-progress-v1:${slot}` : `space-progress-v2:${slot}`);

/* A run read back from storage or from the account, or null if it is not one. */
export function parseProgress(raw: unknown, campaign = 1): Progress | null {
  if (!raw || typeof raw !== "object") return null;
  const { chapter, score, weapon, level, extra, chances } = raw as Record<string, unknown>;
  const nums = [chapter, score, weapon, level, extra];
  if (!nums.every((v) => typeof v === "number" && Number.isFinite(v))) return null;
  const c = Math.floor(chapter as number);
  if (campaign === 2 ? c < LIMITS2.first + 1 || c > LIMITS2.last : c < 2 || c > LIMITS.chapters) return null;
  return {
    chapter: c,
    score: Math.max(0, Math.floor(score as number)),
    weapon: Math.min(3, Math.max(1, Math.floor(weapon as number))),
    level: Math.min(LIMITS.level, Math.max(1, Math.floor(level as number))),
    extra: Math.max(0, Math.floor(extra as number)),
    ...(typeof chances === "number" && Number.isFinite(chances) ? { chances: Math.min(CHANCES, Math.max(0, Math.floor(chances))) } : {}),
  };
}

/* The run that is further along: the later chapter, and at the same chapter the higher
   score; at the same score the one with fewer chances left, so another device cannot hand
   back a chance already spent. The first one wins a tie. */
export function furthest(a: Progress | null, b: Progress | null): Progress | null {
  if (!a) return b;
  if (!b) return a;
  if (b.chapter !== a.chapter) return b.chapter > a.chapter ? b : a;
  if (b.score !== a.score) return b.score > a.score ? b : a;
  return (b.chances ?? CHANCES) < (a.chances ?? CHANCES) ? b : a;
}

function read(key: string, campaign = 1): Progress | null {
  try {
    return parseProgress(JSON.parse(localStorage.getItem(key) ?? "null"), campaign);
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
export function loadSaved(slot: string, campaign = 1): Progress | null {
  const own = read(progressKey(slot, campaign), campaign);
  const waiting = furthest(read(guestKey(campaign), campaign), campaign === 1 ? read(LEGACY_KEY) : null);
  const best = furthest(own, waiting);
  if (waiting) {
    if (best !== own) write(progressKey(slot, campaign), best);
    write(guestKey(campaign), null);
    if (campaign === 1) write(LEGACY_KEY, null);
  }
  return best;
}

export function saveSaved(slot: string, p: Progress | null, campaign = 1) {
  write(progressKey(slot, campaign), p);
}

/* A guest cleared Chapter 1: remembered only so that signing in carries it over. */
export function stashGuest(p: Progress, campaign = 1) {
  write(guestKey(campaign), p);
}
