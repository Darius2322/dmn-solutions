import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * User-scoped client for Server Components / Server Actions. Respects RLS
 * as the logged-in user — use this for anything that should honor row-level
 * security (e.g. reading a customer's own profile).
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
            // Called from a Server Component render — safe to ignore since
            // middleware refreshes the session cookie separately.
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
 * Service-role client. Bypasses RLS entirely — only ever import this inside
 * files marked "use server" (server actions or route handlers). NEVER import
 * this into a client component or a shared file that a client component also
 * imports from, or the service role key can end up in the browser bundle.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
