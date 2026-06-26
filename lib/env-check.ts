/**
 * lib/env-check.ts
 * Pre-flight environment validation. Runs at Next.js bootstrap.
 * If any critical secret is absent the build is halted immediately.
 */

const REQUIRED_ENV = {
  NEXT_PUBLIC_SUPABASE_URL:   process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:  process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

type EnvKey = keyof typeof REQUIRED_ENV;

export function validateEnv(): void {
  const missing: EnvKey[] = [];

  for (const [key, value] of Object.entries(REQUIRED_ENV) as [EnvKey, string | undefined][]) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const list = missing.map((k) => `  ❌  ${k}`).join('\n');
    throw new Error(
      `\n\n🚨  DMN Solutions — Build Aborted\n` +
      `The following required environment variables are missing or empty:\n\n` +
      `${list}\n\n` +
      `Add them to your .env.local file or Vercel project settings.\n` +
      `See .env.example for reference.\n`
    );
  }
}

/** Typed, validated environment object — use this everywhere instead of process.env */
export const env = {
  supabaseUrl:          process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey:      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceKey:   process.env.SUPABASE_SERVICE_ROLE_KEY!,
  adminEmail:           process.env.ADMIN_EMAIL ?? 'dmnsolutions63@gmail.com',
  siteUrl:              process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmn-solution.vercel.app',
  whatsappNumber:       process.env.NEXT_PUBLIC_WHATSAPP ?? '254110554040',
  nodeEnv:              process.env.NODE_ENV,
  isProd:               process.env.NODE_ENV === 'production',
} as const;
