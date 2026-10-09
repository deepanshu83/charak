import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Server-only administrative key - NEVER exposed to browser or prefixed with NEXT_PUBLIC_
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

let adminClientInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function hasServiceRoleKey(): boolean {
  return Boolean(serviceRoleKey && serviceRoleKey.trim().length > 0);
}

/**
 * Returns a server-side Supabase client for administrative operations and API routes.
 * Strictly uses server-only service-role credentials to perform privileged operations bypassing RLS.
 * NEVER falls back to client/anon credentials. Returns null if service role key is not configured.
 */
export function getAdminSupabaseClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  if (!adminClientInstance) {
    adminClientInstance = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClientInstance;
}

/**
 * Returns a server-side client for public, read-only queries respecting RLS.
 */
export function getServerPublicSupabaseClient() {
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!supabaseUrl || !anonKey) {
    return null;
  }
  return createSupabaseClient<Database>(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
