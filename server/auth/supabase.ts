import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/server/config";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  return createServerClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. proxy.ts refreshes them.
        }
      },
    },
  });
}
