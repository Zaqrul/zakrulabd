import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);

/* One client for the whole site, imported on demand so the visitor who never
   opens the deck pays nothing for it. Presence and accounts share it: a second
   client on the same storage key would fight over the saved session. */
let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase() {
  if (!url || !key) return null;
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }),
  );
  return clientPromise;
}
