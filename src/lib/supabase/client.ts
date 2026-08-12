"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (anon key only — safe to expose).
 * Most data fetching happens in Server Components via lib/supabase/server.ts;
 * this exists for the rare client component that needs a live read.
 *
 * Created lazily (not at module scope) so importing this file never throws
 * just because env vars aren't set yet — the error only surfaces if/when a
 * component actually calls getBrowserClient().
 */
export function getBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}
