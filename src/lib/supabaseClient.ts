import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let clientInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Returns a typed public Supabase client using the anon/publishable key.
 * Respects Row Level Security (RLS) policies.
 */
export function getPublicSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return clientInstance;
}
