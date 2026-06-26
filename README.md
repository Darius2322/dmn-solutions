# DMN Solutions Kenya — Next.js 14 Enterprise App

Hyper-modern, production-ready enterprise web application built with Next.js 14 App Router, Supabase, Framer Motion, React Three Fiber, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (JWT + SSR cookies) |
| Styling | Tailwind CSS + custom design tokens |
| Animations | Framer Motion |
| 3D | React Three Fiber + Drei |
| Icons | Lucide React (spring-physics wrapped) |
| Charts | Recharts |
| Validation | Zod |
| Toast | Sonner |
| Deployment | Vercel Edge Network |

---

## Project Structure

```
dmn-solutions/
├── app/
│   ├── layout.tsx              # Root layout, font injection, env validation
│   ├── page.tsx                # Homepage (ISR, 60s revalidation)
│   ├── globals.css             # Design tokens + Tailwind
│   ├── error.tsx               # Global error boundary
│   ├── loading.tsx             # Global loading skeleton
│   ├── login/page.tsx          # Auth page (sign in + sign up)
│   ├── profile/page.tsx        # Client portal (auth-guarded)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (server-side auth check)
│   │   └── page.tsx            # Admin overview dashboard
│   ├── 403/page.tsx            # Access denied page
│   └── api/auth/signout/       # Sign-out route handler
├── components/
│   ├── brand/Logo.tsx          # Animated SVG logo (Framer Motion)
│   ├── hero/
│   │   ├── Hero3D.tsx          # React Three Fiber 3D scene
│   │   └── HeroSection.tsx     # Hero with dynamic 3D import (SSR safe)
│   ├── icons/SpringIcon.tsx    # Spring-physics icon wrapper
│   ├── portfolio/
│   │   └── PortfolioGrid.tsx   # Animated filter grid
│   ├── sections/
│   │   ├── ServicesSection.tsx # DB-driven services grid
│   │   └── FeedbackSection.tsx # Review form + cards
│   ├── layout/
│   │   ├── Navbar.tsx          # Server component navbar
│   │   ├── NavActions.tsx      # Client auth menu
│   │   └── Footer.tsx          # Footer with contact info
│   ├── admin/
│   │   ├── Sidebar.tsx         # Collapsible admin sidebar
│   │   ├── StatsCards.tsx      # Metrics + Recharts
│   │   ├── ReviewsTable.tsx    # Reviews management table
│   │   ├── MembersTable.tsx    # Members + badge award modal
│   │   └── RequestsQueue.tsx   # Expandable requests queue
│   └── profile/
│       └── ProfileClient.tsx   # Full client portal with sidebar
├── lib/
│   ├── env-check.ts            # Pre-flight environment validation
│   ├── supabase/
│   │   ├── server.ts           # Server + admin Supabase clients
│   │   ├── client.ts           # Browser singleton client
│   │   └── types.ts            # Full Database type definitions
│   ├── actions/index.ts        # ALL server actions (no DB in browser)
│   └── validators/index.ts     # Zod schemas for all inputs
├── middleware.ts               # Edge JWT guard (/admin, /profile)
├── next.config.ts              # Security headers + image domains
├── tailwind.config.ts          # Custom tokens
├── tsconfig.json
└── .env.example
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/dmn-solutions.git
cd dmn-solutions
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and service role key
```

Get your keys from: **Supabase Dashboard → Project → Settings → API**

### 3. Run the database schema

Paste `DMN_full_schema.sql` into **Supabase → SQL Editor** and click Run.

### 4. Set your admin account

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'dmnsolutions63@gmail.com';
```

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy --prod
```

Then in **Vercel Dashboard → Project → Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | `dmnsolutions63@gmail.com` |
| `NEXT_PUBLIC_WHATSAPP` | `254110554040` |

### After deployment

1. Go to **Supabase → Auth → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://dmn-solution.vercel.app`)
3. Add the same URL to **Redirect URLs**
4. Remove `http://localhost:3000` from redirect URLs

---

## Security Architecture

- **Zero credentials in browser**: all DB reads/writes go through Server Actions or Route Handlers
- **Edge Middleware**: JWT inspected at the Vercel edge before any request reaches `/admin` or `/profile`
- **RLS Policies**: every table has Row Level Security — users only see their own data
- **Service Role key**: only used server-side in `createSupabaseAdminClient()`, never exposed to client
- **Zod validation**: every form input validated server-side before any DB operation
- **Security headers**: X-Frame-Options, CSP, XSS protection applied globally

---

## Admin Access

Navigate to `/admin` after signing in with `dmnsolutions63@gmail.com`.

The middleware will:
1. Verify the session JWT
2. Check `profiles.role === 'admin'` OR `email === ADMIN_EMAIL`
3. Redirect unauthorized users to `/403`
