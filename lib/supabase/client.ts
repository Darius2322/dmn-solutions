// lib/supabase/client.ts
'use client';
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env-check';
import type { Database } from '@/lib/supabase/types';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (client) return client;
  client = createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  return client;
}
