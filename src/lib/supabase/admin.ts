import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Service-role Supabase client — bypasses RLS entirely.
 *
 * Only ever import this inside Route Handlers (e.g. /api/checkout). The
 * `server-only` import above makes any accidental import from a Client
 * Component fail the build instead of leaking the service role key.
 */
export function getAdminClient() {
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (see SETUP.md)."
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
