import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * User-scoped client — respects RLS as whoever is logged in. Use this for
 * the auth check itself (getCurrentAdmin). This is what actually proves
 * someone is an admin; nothing in this file trusts the frontend.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session cookie separately, safe to ignore here.
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {
            // See note above.
          }
        },
      },
    }
  );
}

/**
 * Service-role client. Bypasses RLS entirely. Only ever call this AFTER
 * getCurrentAdmin() (or the middleware, which runs first on every request)
 * has confirmed the caller is a real admin via the database. Never import
 * this into a client component.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
