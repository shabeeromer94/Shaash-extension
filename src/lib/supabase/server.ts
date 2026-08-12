import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server Component / route-handler Supabase client using the anon key.
 * Reads only — RLS restricts these queries to public, non-hidden catalog rows.
 * There's no user session to manage (guest checkout only), so this is a
 * plain client rather than a cookie-aware one.
 */
export function getServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
