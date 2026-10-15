import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const presenceEnabled = Boolean(url && key);

/* The client is imported on demand so the visitor who never looks at the deck
   still pays nothing for it, and shared so presence and the total count ride
   the same connection. */
let clientPromise: Promise<SupabaseClient> | null = null;

function getClient() {
  if (!url || !key) return null;
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }),
  );
  return clientPromise;
}

/* Counts open tabs on the site right now through a Supabase Realtime Presence
   channel. Nothing is stored: presence lives in memory on the Realtime server
   and vanishes when the tab closes, and the only thing a tab sends is a random
   id it made up itself. Calls back with null while connecting or when the
   connection drops. */
export function watchOnlineCount(onCount: (count: number | null) => void) {
  const pending = getClient();
  if (!pending) return () => {};

  let stopped = false;
  let cleanup = () => {};

  pending.then((client) => {
    if (stopped) return;

    const channel = client.channel("site-visitors", { config: { presence: { key: crypto.randomUUID() } } });

    channel
      .on("presence", { event: "sync" }, () => onCount(Object.keys(channel.presenceState()).length))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") channel.track({ at: Date.now() });
        else if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") onCount(null);
      });

    cleanup = () => {
      client.removeChannel(channel);
    };
  });

  return () => {
    stopped = true;
    cleanup();
  };
}

const COUNTED_KEY = "visitor-counted";

/* Every visitor since the site began. A browser adds one to the total the first
   time it arrives and only reads it afterwards; the only thing kept on the
   visitor's side is a flag saying so. A browser that clears its storage, or a
   second device, counts again, so this is visits by browser, not by person.
   Resolves to null when the count cannot be reached. */
export async function loadTotalVisitors(): Promise<number | null> {
  const pending = getClient();
  if (!pending) return null;

  let counted = false;
  try {
    counted = localStorage.getItem(COUNTED_KEY) === "1";
  } catch {
    /* Storage blocked: read-only, so a blocked browser never inflates the total. */
    counted = true;
  }

  try {
    const client = await pending;
    const { data, error } = await client.rpc(counted ? "get_visitors" : "increment_visitors");
    if (error || typeof data !== "number") return null;

    if (!counted) {
      try {
        localStorage.setItem(COUNTED_KEY, "1");
      } catch {
        /* Nothing more to do. */
      }
    }
    return data;
  } catch {
    return null;
  }
}
