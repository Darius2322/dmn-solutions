// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env-check';
import type { Database } from '@/lib/supabase/types';

/** Standard server client — respects RLS (uses user JWT from cookies) */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* Called from Server Component — cookies are read-only */ }
      },
    },
  });
}

/** Admin client — bypasses RLS entirely. NEVER send to the browser. */
export function createSupabaseAdminClient() {
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Get current authenticated user from session (server-side) */
export async function getServerUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Get current user + their profile row from the database */
export async function getServerUserWithProfile() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  return { user, profile };
}
