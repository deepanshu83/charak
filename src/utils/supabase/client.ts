import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (browserClientInstance) {
    return browserClientInstance;
  }
  browserClientInstance = createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );
  return browserClientInstance;
};
