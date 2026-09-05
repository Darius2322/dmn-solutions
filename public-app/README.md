# DMN Solutions — Rebuilt App (Greenfield)

## What this is

This is a **complete, self-consistent Next.js 14 App Router application** —
every page from the spec exists as a real route, the schema/types/components
all agree with each other, and it's structured to actually run. It replaces
your existing repo entirely, as you asked — it does **not** attempt to merge
with or preserve whatever currently exists in your live Supabase project or
GitHub repo, since I don't have access to either.

**This has never been run.** No `npm install`, no `npm run build`, no real
Supabase project behind it. Treat first setup as a debugging pass, not a
guarantee — see "What to expect on first run" below.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL + keys
```

In Supabase: run `supabase/migrations/20260828000000_full_schema.sql` against
a **fresh or staging** Supabase project (SQL Editor, or `supabase db push`).
Do not run it against a project that already has tables named `profiles`,
`services`, `portfolio`, or `feedback` — it will conflict with them, not
merge into them.

Create your first admin manually after signup, since there's no seed super-admin:
```sql
update profiles set is_admin = true where email = 'you@example.com';
```

```bash
npm run dev
```

## What's real vs. placeholder

**Real and complete:**
- Every route from the spec (home, services list/detail, portfolio list/detail,
  about, contact, support, donate, referral, track-order + dashboard, legal
  pages, 404, hidden admin area with dashboard/services/requests)
- Full schema with RLS policies, tracking numbers, audit logging, analytics tables
- Track Order flow end-to-end: submit → tracking number → lookup → token-scoped dashboard
- Admin auth enforced via middleware + RLS, not a frontend check
- Design tokens (colors/typography) defined centrally in `globals.css` + `tailwind.config.ts`

**Placeholder / needs your input:**
- PWA icons in `public/icons/` are solid navy squares — replace with real artwork
- Contact page phone/email/WhatsApp numbers are placeholders from what I saw
  on your live site — verify and move into `site_content` via `lib/content.ts`
  if you want them admin-editable rather than hardcoded
- Legal pages (privacy/terms/refund) are literally placeholder text
- Only 4 seed services exist — add the rest of your Electrical/Computer
  Training/ISP catalog either via SQL or (once built) an admin create form
- Admin area only has Services (read + activate/deactivate) and Requests
  (read + status change) — Portfolio, Referrals, Reviews, Media, Content,
  Settings, Visitor Analytics, and Audit Log screens don't exist yet.
  `lib/actions/admin/services.ts` is the pattern to replicate for each.
- No service worker / offline fallback yet (manifest exists, that's it)
- No portfolio/service images seeded — `image_url` fields are null until you add some

## What to expect on first run

This was written without a compiler or a real database in the loop, so
expect some friction:
- TypeScript errors from the loosely-typed `Database` type in `lib/supabase/types.ts`
  (I wrote this by hand to match the schema — a generated one via
  `supabase gen types typescript` will be more accurate once your project is live)
- The `(Icons as any)[...]` dynamic icon lookups in service cards are a
  pragmatic shortcut, not ideal typing — fine functionally, worth tightening later
- Tailwind/PostCSS versions in `package.json` are current as of my knowledge,
  but pin/update them if `npm install` complains

## Security notes carried over from earlier decisions

- Admin path lives at `app/portal-x7k2/` — **rename this folder and update
  `ADMIN_ROUTE_SEGMENT` + `NEXT_PUBLIC_ADMIN_ROUTE_SEGMENT` together** before
  going live. The obscure name is not the actual protection — `middleware.ts`
  checking `profiles.is_admin` is.
- `SUPABASE_SERVICE_ROLE_KEY` is only ever imported inside `"use server"`
  files (`lib/supabase/server.ts`'s `createSupabaseAdminClient`). After your
  first real `npm run build`, run:
  ```bash
  grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/static || echo clean
  ```
  to confirm it never leaked into a client bundle.
- Track Order tokens expire after 30 minutes and are the only read path into
  a customer's request — there is no way to look up a request by tracking
  number alone.

## Bring back what breaks

Real build errors, real schema mismatches, real screenshots of things
looking wrong — that's what turns this from "written blind" into something
that actually works. I can't verify any of this myself, so what happens next
depends on what you find when you actually run it.
