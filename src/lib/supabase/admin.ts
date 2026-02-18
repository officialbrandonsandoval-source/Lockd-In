import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

/**
 * Admin Supabase client with elevated privileges.
 *
 * Uses the SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security.
 * This client must ONLY be used in server-side code (API routes, server
 * actions, cron jobs, etc.) — never expose it to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
