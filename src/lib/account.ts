import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseEnabled } from "@/lib/supabase-client";

export const accountsEnabled = supabaseEnabled;

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
export const PASSWORD_MIN = 8;

const GAMES = ["space", "space2"] as const;
/* Remembers on this browser that someone signed in, so a visitor who never made
   an account never loads the auth client just to find out there is no session. */
const HINT_KEY = "account-hint";
export const SCORES_EVENT = "game-scores-changed";

export type AuthFailure =
  | "username-taken"
  | "username-invalid"
  | "email-taken"
  | "invalid-login"
  | "unconfirmed"
  | "weak-password"
  | "rate-limit"
  | "offline"
  | "unknown";

export type AuthResult = { ok: true; needsConfirm?: boolean } | { ok: false; reason: AuthFailure };

export function hasAccountHint() {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function setHint(on: boolean) {
  try {
    if (on) localStorage.setItem(HINT_KEY, "1");
    else localStorage.removeItem(HINT_KEY);
  } catch {
    /* Storage blocked: the session still works, it just loads the client eagerly. */
  }
}

/* Raw 0 means "no score"; otherwise the bigger number is the better one. */
function better(a: number, b: number) {
  if (!a) return b;
  if (!b) return a;
  return Math.max(a, b);
}

function failure(error: { code?: string; message?: string; status?: number }): AuthFailure {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "email-taken";
    case "invalid_credentials":
      return "invalid-login";
    case "email_not_confirmed":
      return "unconfirmed";
    case "weak_password":
      return "weak-password";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rate-limit";
  }
  if (error.status === 429) return "rate-limit";
  /* The sign-up trigger raises a unique violation for a username that was taken
     between the availability check and the insert. */
  if (/database error saving new user/i.test(error.message ?? "")) return "username-taken";
  if (/fetch|network/i.test(error.message ?? "")) return "offline";
  return "unknown";
}

export async function usernameAvailable(username: string): Promise<boolean | null> {
  const pending = getSupabase();
  if (!pending) return null;
  try {
    const client = await pending;
    const { data, error } = await client.rpc("username_available", { p_username: username });
    return error || typeof data !== "boolean" ? null : data;
  } catch {
    return null;
  }
}

export async function signUp(input: { username: string; email: string; password: string; redirectTo: string }): Promise<AuthResult> {
  const pending = getSupabase();
  if (!pending) return { ok: false, reason: "unknown" };
  const username = input.username.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) return { ok: false, reason: "username-invalid" };

  try {
    const client = await pending;
    if ((await usernameAvailable(username)) === false) return { ok: false, reason: "username-taken" };

    const { data, error } = await client.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: { data: { username }, emailRedirectTo: input.redirectTo },
    });
    if (error) return { ok: false, reason: failure(error) };
    /* With "Confirm email" on, there is no session until the link is opened. An
       address that is already registered also comes back without a session
       (by design, so sign-up cannot be used to discover who has an account);
       "check your email" is true for both. */
    if (!data.session) return { ok: true, needsConfirm: true };
    setHint(true);
    return { ok: true };
  } catch {
    return { ok: false, reason: "offline" };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const pending = getSupabase();
  if (!pending) return { ok: false, reason: "unknown" };
  try {
    const client = await pending;
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, reason: failure(error) };
    setHint(true);
    return { ok: true };
  } catch {
    return { ok: false, reason: "offline" };
  }
}

export async function signOut() {
  setHint(false);
  const pending = getSupabase();
  if (!pending) return;
  try {
    const client = await pending;
    await client.auth.signOut();
  } catch {
    /* Offline: the local session is cleared by signOut's scope anyway. */
  }
}

function usernameOf(session: Session | null) {
  const name = session?.user.user_metadata?.username;
  return typeof name === "string" ? name : null;
}

/* Reports who is signed in now and whenever that changes (sign-in, sign-out,
   the confirmation link being opened in this tab). The first time a session
   appears, local and saved scores are merged both ways. */
export function watchAccount(onUser: (username: string | null) => void) {
  const pending = getSupabase();
  if (!pending) return () => {};

  let stopped = false;
  let unsubscribe = () => {};

  pending.then((client) => {
    if (stopped) return;
    const { data } = client.auth.onAuthStateChange((event, session) => {
      const name = usernameOf(session);
      onUser(name);
      void import("@/lib/achievements").then((m) => m.setAchievementUser(name));
      if (name && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        setHint(true);
        /* Deferred: supabase-js holds a lock during this callback, and calling
           back into it from here would wait on itself. */
        setTimeout(() => void syncScores(), 0);
        setTimeout(() => void import("@/lib/achievements").then((m) => m.syncAchievements()), 400);
      }
      if (!session && event === "SIGNED_OUT") setHint(false);
    });
    unsubscribe = () => data.subscription.unsubscribe();
  });

  return () => {
    stopped = true;
    unsubscribe();
  };
}

/* Merges this browser's best scores with the saved ones: whichever is better
   wins on both sides, so playing as a guest first and signing in afterwards
   loses nothing. */
export async function syncScores() {
  const pending = getSupabase();
  if (!pending) return;
  try {
    const client = await pending;
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return;

    const { data: rows, error } = await client.from("game_scores").select("game, best");
    if (error) return;
    const saved = new Map<string, number>(rows.map((r: { game: string; best: number }) => [r.game, r.best]));

    let changed = false;
    for (const game of GAMES) {
      const local = readLocal(game);
      const remote = saved.get(game) ?? 0;
      const best = better(local, remote);
      if (best && best !== local) {
        writeLocal(game, best);
        changed = true;
      }
      if (local && local !== remote && best === local) {
        await client.rpc("submit_score", { p_game: game, p_score: local });
      }
    }
    if (changed) window.dispatchEvent(new Event(SCORES_EVENT));
  } catch {
    /* Offline: the next sign-in or the next record tries again. */
  }
}

/* Called after a new personal best. Free for anyone not signed in. */
export async function pushScore(game: string, score: number) {
  if (!hasAccountHint() || !(GAMES as readonly string[]).includes(game) || !(score >= 1)) return;
  const pending = getSupabase();
  if (!pending) return;
  try {
    const client = await pending;
    const { data } = await client.auth.getSession();
    if (!data.session) return;
    await client.rpc("submit_score", { p_game: game, p_score: Math.floor(score) });
  } catch {
    /* Offline: it is still saved on this device, and syncs at the next sign-in. */
  }
}

/* A game's saved run, kept in the account's own metadata so it follows the player to any
   device. It needs no table: the browser may write its own metadata, and a run is a few
   numbers. Free for anyone not signed in; null clears it. */
const progressField = (game: string) => `progress_${game}`;

export async function pushProgress(game: (typeof GAMES)[number] | "space3", data: object | null) {
  if (!hasAccountHint()) return;
  const pending = getSupabase();
  if (!pending) return;
  try {
    const client = await pending;
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return;
    await client.auth.updateUser({ data: { [progressField(game)]: data } });
  } catch {
    /* Offline: it is still saved on this device, and the next chapter tries again. */
  }
}

export async function pullProgress(game: (typeof GAMES)[number] | "space3"): Promise<unknown> {
  if (!hasAccountHint()) return null;
  const pending = getSupabase();
  if (!pending) return null;
  try {
    const client = await pending;
    const { data } = await client.auth.getUser();
    return data.user?.user_metadata?.[progressField(game)] ?? null;
  } catch {
    return null;
  }
}

/* Achievements live in a table of their own (see accounts.sql), because the account's metadata
   travels inside every sign-in token. Both calls are quiet when offline or signed out. */
export async function pushAchievements(data: object) {
  if (!hasAccountHint()) return;
  const pending = getSupabase();
  if (!pending) return;
  try {
    const client = await pending;
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return;
    await client.rpc("save_achievements", { p_data: data });
  } catch {
    /* Offline: the next change tries again. */
  }
}

export async function pullAchievements(): Promise<unknown> {
  if (!hasAccountHint()) return null;
  const pending = getSupabase();
  if (!pending) return null;
  try {
    const client = await pending;
    const { data, error } = await client.from("player_achievements").select("data").maybeSingle();
    return error ? null : (data?.data ?? null);
  } catch {
    return null;
  }
}

function readLocal(game: string) {
  try {
    return Number(localStorage.getItem(`game-best-${game}`)) || 0;
  } catch {
    return 0;
  }
}

function writeLocal(game: string, value: number) {
  try {
    localStorage.setItem(`game-best-${game}`, String(value));
  } catch {
    /* Storage blocked. */
  }
}
