import "server-only";

import { createClient } from "@supabase/supabase-js";

let adminClient:
  | ReturnType<typeof createClient>
  | null = null;

export function createAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  adminClient = createClient(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}
