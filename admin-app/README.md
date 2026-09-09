# DMN Solutions — Admin App

A standalone Next.js app, meant to deploy separately from the public site
(e.g. to `dmn-solution-admin.vercel.app`). It shares the same Supabase
project as the public site but is otherwise a completely independent
codebase and deployment — nothing about the public site knows this exists.

## Why a separate app instead of a hidden route

A hidden URL is not a security boundary — anyone who finds the link, checks
your source maps, or brute-forces common paths gets to the login screen.
The real protection here is:

1. **`middleware.ts`** — runs on every request, queries `profiles.is_admin`
   in Postgres as the logged-in user, and redirects (and signs out) anyone
   who isn't a verified admin.
2. **Row Level Security in Postgres** — every table this app touches has a
   policy requiring `profiles.is_admin = true` for the querying user. Even
   if a bug in this app's code somehow skipped the middleware check, the
   database itself would refuse to return or accept the data.
3. **Separate deployment** — putting this on its own domain means the
   public site's bundle contains zero references to admin routes, admin
   components, or the service-role key.

There is no allow-listed email anywhere in this codebase. Granting admin
access is a database write (`profiles.is_admin = true`), done from the
**Customers** page by an existing admin, or directly in Supabase for the
very first admin (see Setup below).

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL + keys
```

Run the migrations in `public-app/supabase/migrations/` against your
Supabase project first (both apps share one database — migrations live in
the public app's repo as the single source of truth).

Create your first admin manually, since there's no self-signup on this app:

```sql
-- 1. Create the user in Supabase Dashboard > Authentication > Users > Add user
-- 2. Then, in the SQL Editor:
update profiles set is_admin = true where email = 'you@example.com';
```

```bash
npm run dev   # runs on :3001 so it can run alongside the public app locally
```

Deploy to Vercel as its own project, pointed at this folder, with its own
domain. Do not deploy it as a subpath of the public site's project.

## What's real vs. what needs your input

**Fully wired to the database, no fake data:**
Dashboard counts, Services (create/edit/delete/activate/deactivate),
Requests (status/assignment/internal notes), Portfolio (create/edit/delete/
featured), Reviews (approve/hide/delete), Referrals (status), Support
(status), Messages (status), Customers (grant/revoke admin), Visitors
(reads `visitor_sessions`), Analytics (reads `page_views` /
`analytics_events`), Media (upload to Supabase Storage + list + delete),
Content (edits `site_content` JSON that the public site reads live),
Settings (change own password), Audit Logs (read-only, auto-populated by
every mutating action above).

**Needs your input to be genuinely useful:**
- Visitors/Analytics tables are empty until the public site's tracking
  beacon (an API route + a tiny client script) is built and deployed — that's
  part of the public site work, not this app.
- Reordering services (drag-and-drop) has a server action (`reorderServices`)
  but no drag UI yet — the sort-order column exists and works, just via
  numbers rather than a visual drag.
- Media upload assumes a `website-media` Storage bucket exists — the
  migration creates it with `insert into storage.buckets`, but Supabase
  Storage bucket policies occasionally need to be re-checked in the
  dashboard after this runs the first time.
- This code has not been run through `npm install` / a real Supabase project
  in this environment (no network access here) — treat first boot as a
  short debugging pass, in the same spirit as the public app's own README.
