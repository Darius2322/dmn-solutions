-- ============================================================================
-- DMN Solutions — Full consolidated schema
-- This is a FRESH schema for a rebuilt app. It does NOT know about whatever
-- currently exists in your live Supabase project. Do not run this against
-- your production project without first checking it for existing tables
-- with the same names — this will conflict with, not merge into, whatever
-- portfolio/feedback/profiles data you currently have.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  role_id uuid,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "users_read_own_profile" on profiles for select using (auth.uid() = id);
create policy "users_update_own_profile" on profiles for update using (auth.uid() = id);

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name in ('super_admin','administrator','content_manager','support_manager','analyst')),
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table profiles add column if not exists role_id uuid references admin_roles(id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Services (admin-editable, publicly readable when active)
-- ----------------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  category text not null check (category in ('digital_technology','electrical','computer_training','isp')),
  icon text not null default 'wrench',
  price_label text,
  features text[] not null default '{}',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_services_category on services(category);
create index if not exists idx_services_active on services(active);
alter table services enable row level security;
create policy "public_read_active_services" on services for select using (active = true);
create policy "admin_all_services" on services for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Portfolio
-- ----------------------------------------------------------------------------
create table if not exists portfolio (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  category text not null default 'business',
  technologies text[] not null default '{}',
  image_url text,
  live_url text,
  featured boolean not null default false,
  completion_date date,
  client_name text,
  tags text[] not null default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_portfolio_category on portfolio(category);
alter table portfolio enable row level security;
create policy "public_read_portfolio" on portfolio for select using (true);
create policy "admin_all_portfolio" on portfolio for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Feedback / reviews
-- ----------------------------------------------------------------------------
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  service text,
  comment text,
  approved boolean not null default true,
  created_at timestamptz default now()
);
alter table feedback enable row level security;
create policy "public_read_approved_feedback" on feedback for select using (approved = true);
create policy "auth_insert_feedback" on feedback for insert with check (auth.uid() = user_id or user_id is null);
create policy "admin_all_feedback" on feedback for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Tracking numbers + service requests
-- ----------------------------------------------------------------------------
create sequence if not exists tracking_number_seq start 1;

create or replace function generate_tracking_number()
returns text language plpgsql as $$
declare next_val bigint;
begin
  next_val := nextval('tracking_number_seq');
  return 'DMN-' || to_char(now(), 'YY') || '-' || lpad(next_val::text, 6, '0');
end;
$$;

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  tracking_number text unique not null default generate_tracking_number(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  service_id uuid references services(id),
  location text,
  description text,
  budget_range text,
  preferred_contact text default 'email',
  status text not null default 'request_received'
    check (status in ('request_received','reviewing','quote_prepared','payment_pending','work_started','in_progress','review_testing','completed','delivered','cancelled')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid','partial','paid','refunded')),
  assigned_to uuid references profiles(id),
  internal_notes text,
  customer_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_service_requests_tracking on service_requests(tracking_number);
create index if not exists idx_service_requests_email on service_requests(customer_email);
create index if not exists idx_service_requests_status on service_requests(status);
alter table service_requests enable row level security;
create policy "admin_all_service_requests" on service_requests for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists trg_service_requests_updated_at on service_requests;
create trigger trg_service_requests_updated_at before update on service_requests
  for each row execute function set_updated_at();

create table if not exists track_sessions (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  service_request_id uuid not null references service_requests(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists idx_track_sessions_token on track_sessions(token);
alter table track_sessions enable row level security;
-- No policies: only ever touched via the service-role client after a
-- validated tracking_number + email match.

-- ----------------------------------------------------------------------------
-- Referrals, donations
-- ----------------------------------------------------------------------------
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null default ('REF-' || to_char(now(),'YY') || '-' || lpad(nextval('tracking_number_seq')::text, 6, '0')),
  referrer_name text not null,
  referrer_email text not null,
  referrer_phone text,
  referred_name text not null,
  referred_contact text not null,
  service_interested text,
  notes text,
  status text default 'submitted' check (status in ('submitted','contacted','converted','declined')),
  created_at timestamptz default now()
);
alter table referrals enable row level security;
create policy "public_insert_referrals" on referrals for insert with check (true);
create policy "admin_all_referrals" on referrals for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists support_submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('equipment_donation','financial_support')),
  donor_name text,
  donor_email text,
  donor_phone text,
  details text not null,
  status text default 'pending' check (status in ('pending','acknowledged','received')),
  created_at timestamptz default now()
);
alter table support_submissions enable row level security;
create policy "public_insert_support_submissions" on support_submissions for insert with check (true);
create policy "admin_all_support_submissions" on support_submissions for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Content, FAQs, notifications, media, audit log
-- ----------------------------------------------------------------------------
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);
alter table site_content enable row level security;
create policy "public_read_site_content" on site_content for select using (true);
create policy "admin_write_site_content" on site_content for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));
drop trigger if exists trg_site_content_updated_at on site_content;
create trigger trg_site_content_updated_at before update on site_content
  for each row execute function set_updated_at();

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order int default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table faqs enable row level security;
create policy "public_read_active_faqs" on faqs for select using (active = true);
create policy "admin_all_faqs" on faqs for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null check (recipient_type in ('admin','customer')),
  recipient_id uuid,
  service_request_id uuid references service_requests(id) on delete cascade,
  type text not null check (type in ('success','warning','error','info')),
  title text not null,
  message text,
  read boolean not null default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "admin_all_notifications" on notifications for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  bucket text not null default 'website-media',
  file_name text not null,
  mime_type text,
  alt_text text,
  usage_context text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);
alter table media_assets enable row level security;
create policy "public_read_media_assets" on media_assets for select using (true);
create policy "admin_write_media_assets" on media_assets for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz default now()
);
alter table audit_log enable row level security;
create policy "admin_read_audit_log" on audit_log for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Analytics
-- ----------------------------------------------------------------------------
create table if not exists visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  device_category text,
  browser text,
  os text,
  country text,
  referrer text
);
create index if not exists idx_visitor_sessions_last_seen on visitor_sessions(last_seen);

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references visitor_sessions(id) on delete cascade,
  path text not null,
  viewed_at timestamptz default now()
);
create index if not exists idx_page_views_session on page_views(session_id);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references visitor_sessions(id) on delete cascade,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table visitor_sessions enable row level security;
alter table page_views enable row level security;
alter table analytics_events enable row level security;
create policy "admin_read_visitor_sessions" on visitor_sessions for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin_read_page_views" on page_views for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin_read_analytics_events" on analytics_events for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- ----------------------------------------------------------------------------
-- Seed: a starting set of services so the site isn't empty on first load
-- ----------------------------------------------------------------------------
insert into services (slug, title, description, category, icon, features, sort_order)
values
  ('website-development', 'Website Development', 'Custom websites built with modern frameworks — fast, secure, and scalable.', 'digital_technology', 'globe', array['Responsive design','SEO-ready','Fast hosting'], 1),
  ('mobile-app-development', 'Mobile App Development', 'Native and cross-platform apps for iOS and Android.', 'digital_technology', 'smartphone', array['iOS & Android','Push notifications','App store submission'], 2),
  ('electrical-installation', 'Electrical Installation', 'Residential and commercial electrical installation and wiring.', 'electrical', 'zap', array['Licensed technicians','Safety-compliant work','Maintenance plans available'], 3),
  ('computer-training-basics', 'Basic Computer Training', 'Foundational digital literacy: Word, Excel, PowerPoint, internet and email skills.', 'computer_training', 'monitor', array['Beginner-friendly','Certificate on completion','Flexible scheduling'], 4)
on conflict (slug) do nothing;

-- ============================================================================
-- End of schema.
-- ============================================================================
