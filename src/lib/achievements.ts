/* The engine behind zakrulOS achievements. Games report what happens (a stat that only goes up, or
   one that adds up); this keeps the numbers, works out what has been earned, remembers it under
   the player's name on this browser, and sends a copy to the account so it follows them. Nothing
   here knows how a game works, only the names of its stats. */
import { ACHIEVEMENTS, BY_GAME, GAME_IDS, type Ach } from "./achievements-data.ts";

export const ACH_EVENT = "zakrulos:achievement";
export const ACH_CHANGED = "zakrulos:achievements-changed";

export type Store = {
  v: 1;
  /* game id -> stat -> value. "player" holds the few stats that belong to no game. */
  stats: Record<string, Record<string, number>>;
  /* achievement id -> when it was earned. */
  unlocked: Record<string, number>;
  /* Which stats add up rather than keep the highest, as "game.stat". */
  counters: Record<string, 1>;
  /* The dates (YYYY-MM-DD) something was played on, most recent 90. */
  days: string[];
};

const KEY = (slot: string) => `zakrulos-ach-v1:${slot}`;
const GUEST = "guest";
let slot = GUEST;
const cache = new Map<string, Store>();
let pushTimer: ReturnType<typeof setTimeout> | undefined;

const empty = (): Store => ({ v: 1, stats: {}, unlocked: {}, counters: {}, days: [] });

function parse(raw: unknown): Store | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Store>;
  if (r.v !== 1 || typeof r.stats !== "object" || typeof r.unlocked !== "object" || !r.stats || !r.unlocked) return null;
  const clean = empty();
  for (const [g, rec] of Object.entries(r.stats)) {
    if (!rec || typeof rec !== "object") continue;
    for (const [k, v] of Object.entries(rec)) if (typeof v === "number" && Number.isFinite(v) && v >= 0) (clean.stats[g] ??= {})[k] = v;
  }
  for (const [id, t] of Object.entries(r.unlocked)) if (typeof t === "number") clean.unlocked[id] = t;
  if (r.counters && typeof r.counters === "object") for (const k of Object.keys(r.counters)) clean.counters[k] = 1;
  if (Array.isArray(r.days)) clean.days = r.days.filter((d): d is string => typeof d === "string").slice(-90);
  return clean;
}

function load(which = slot): Store {
  const hit = cache.get(which);
  if (hit) return hit;
  let s = empty();
  try {
    s = parse(JSON.parse(localStorage.getItem(KEY(which)) ?? "null")) ?? s;
  } catch {
    /* Storage blocked or unreadable: start empty. */
  }
  cache.set(which, s);
  return s;
}

function save(which: string, s: Store) {
  cache.set(which, s);
  try {
    localStorage.setItem(KEY(which), JSON.stringify(s));
  } catch {
    /* Storage blocked: it lasts until the page is closed. */
  }
}

/* ---------- What the player's stats add up to ---------- */

const tierCount = (s: Store, tier: number) => GAME_IDS.filter((g) => s.unlocked[`${g}.score.t${tier}`]).length;

export function longestStreak(days: string[]) {
  const set = new Set(days);
  let best = 0;
  for (const d of set) {
    const prev = new Date(`${d}T00:00:00Z`);
    prev.setUTCDate(prev.getUTCDate() - 1);
    if (set.has(prev.toISOString().slice(0, 10))) continue;
    let run = 1;
    const next = new Date(`${d}T00:00:00Z`);
    for (;;) {
      next.setUTCDate(next.getUTCDate() + 1);
      if (!set.has(next.toISOString().slice(0, 10))) break;
      run++;
    }
    best = Math.max(best, run);
  }
  return best;
}

export function derive(s: Store): Record<string, number> {
  let opens = 0;
  let seconds = 0;
  let played = 0;
  for (const g of GAME_IDS) {
    const o = s.stats[g]?.opens ?? 0;
    opens += o;
    seconds += s.stats[g]?.seconds ?? 0;
    if (o > 0) played++;
  }
  const own = s.stats.player ?? {};
  const unlocked = Object.keys(s.unlocked).filter((id) => !id.startsWith("player.")).length;
  const completed = GAME_IDS.filter((g) => (BY_GAME[g] ?? []).every((a) => s.unlocked[a.id])).length;
  return {
    member: own.member ?? 0,
    gamesPlayed: played,
    opens,
    seconds,
    unlocked,
    tier1: tierCount(s, 1),
    tier3: tierCount(s, 3),
    tier5: tierCount(s, 5),
    tier6: tierCount(s, 6),
    streak: longestStreak(s.days),
    night: own.night ?? 0,
    early: own.early ?? 0,
    session: own.session ?? 0,
    completed,
  };
}

const valueOf = (s: Store, a: Ach, d: Record<string, number>) => (a.game === "player" ? d[a.stat] ?? 0 : s.stats[a.game]?.[a.stat] ?? 0);

/* Earn whatever the numbers now allow, in as many passes as it takes (earning some makes others
   reachable). Returns the new ones. */
export function evaluate(s: Store, games?: string[], now = Date.now()): Ach[] {
  const earned: Ach[] = [];
  for (let pass = 0; pass < 4; pass++) {
    const d = derive(s);
    let any = false;
    for (const a of ACHIEVEMENTS) {
      if (s.unlocked[a.id] || (games && a.game !== "player" && !games.includes(a.game))) continue;
      if (valueOf(s, a, d) >= a.min) {
        s.unlocked[a.id] = now;
        earned.push(a);
        any = true;
      }
    }
    if (!any) break;
  }
  return earned;
}

/* ---------- Reporting ---------- */

function announce(earned: Ach[]) {
  if (typeof window === "undefined") return;
  for (const a of earned) window.dispatchEvent(new CustomEvent(ACH_EVENT, { detail: { id: a.id } }));
  window.dispatchEvent(new Event(ACH_CHANGED));
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* A game says something happened. "max" keeps the highest value ever; "add" counts up. */
export function report(game: string, key: string, value: number, mode: "max" | "add" = "max") {
  if (!(value > 0) && mode === "max") return;
  const s = load();
  const rec = (s.stats[game] ??= {});
  const before = rec[key] ?? 0;
  if (mode === "add") {
    rec[key] = before + value;
    s.counters[`${game}.${key}`] = 1;
  } else if (value > before) rec[key] = value;
  else return;
  const earned = evaluate(s, [game]);
  save(slot, s);
  announce(earned);
  schedulePush();
}

/* A game has been opened: counts it, notes the day and the hour. */
export function opened(game: string) {
  const s = load();
  const day = today();
  if (!s.days.includes(day)) s.days = [...s.days, day].slice(-90);
  const hour = new Date().getHours();
  const own = (s.stats.player ??= {});
  if (hour < 4) own.night = 1;
  if (hour >= 5 && hour < 7) own.early = 1;
  save(slot, s);
  report(game, "opens", 1, "add");
  reportBest(game);
}

/* Scores kept on this browser from before achievements existed still count. */
function reportBest(game: string) {
  try {
    report(game, "score", Number(localStorage.getItem(`game-best-${game}`)) || 0);
  } catch {
    /* Storage blocked. */
  }
}

export function scanBests() {
  for (const g of GAME_IDS) reportBest(g);
}

/* Time spent in a game, in seconds, and the longest single sitting. */
export function played(game: string, seconds: number, sitting: number) {
  report(game, "seconds", seconds, "add");
  report("player", "session", Math.floor(sitting));
}

/* ---------- Whose they are ---------- */

function mergeInto(into: Store, from: Store, adding: boolean) {
  for (const [g, rec] of Object.entries(from.stats)) {
    const out = (into.stats[g] ??= {});
    for (const [k, v] of Object.entries(rec)) {
      const counter = from.counters[`${g}.${k}`] || into.counters[`${g}.${k}`];
      out[k] = counter && adding ? (out[k] ?? 0) + v : Math.max(out[k] ?? 0, v);
      if (counter) into.counters[`${g}.${k}`] = 1;
    }
  }
  for (const [id, t] of Object.entries(from.unlocked)) into.unlocked[id] = Math.min(into.unlocked[id] ?? t, t);
  into.days = [...new Set([...into.days, ...from.days])].sort().slice(-90);
}

/* Who is signed in changes: the numbers kept under their name from now on. What a guest earned
   before signing in is brought across, once. */
export function setAchievementUser(username: string | null) {
  const next = username ?? GUEST;
  if (next === slot) return;
  slot = next;
  if (next !== GUEST) {
    const guest = load(GUEST);
    const mine = load(next);
    if (Object.keys(guest.stats).length || Object.keys(guest.unlocked).length) {
      mergeInto(mine, guest, true);
      cache.set(GUEST, empty());
      save(GUEST, empty());
    }
    (mine.stats.player ??= {}).member = 1;
    const earned = evaluate(mine);
    save(next, mine);
    announce(earned);
  }
  window.dispatchEvent(new Event(ACH_CHANGED));
}

export const currentStore = () => load();

/* Pulls the saved copy from the account and merges it with this browser's, both ways. */
export async function syncAchievements() {
  if (slot === GUEST) return;
  const account = await import("@/lib/account");
  const remote = parse(await account.pullAchievements());
  const mine = load();
  if (remote) mergeInto(mine, remote, false);
  const earned = evaluate(mine);
  save(slot, mine);
  announce(earned);
  void account.pushAchievements(mine);
}

function schedulePush() {
  if (slot === GUEST) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void import("@/lib/account").then((m) => m.pushAchievements(load()));
  }, 5000);
}

/* ---------- For the screens ---------- */

export type Progress = { done: number; total: number };

export function progressOf(s: Store, game: string): Progress {
  const all = BY_GAME[game] ?? [];
  return { done: all.filter((a) => s.unlocked[a.id]).length, total: all.length };
}

export function overall(s: Store): Progress {
  return { done: ACHIEVEMENTS.filter((a) => s.unlocked[a.id]).length, total: ACHIEVEMENTS.length };
}

export function fill(text: string, gameName: string) {
  return text.replaceAll("{game}", gameName);
}
