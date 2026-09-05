-- ============================================================================
-- Adds a dedicated contact_messages table (previously piggybacked on
-- notifications, which conflated "a customer wrote in" with "an admin got
-- pinged" — two different things with different lifecycles).
-- ============================================================================

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz default now()
);
create index if not exists idx_contact_messages_status on contact_messages(status);
alter table contact_messages enable row level security;
-- Public can insert (the contact form), never read (no select policy for anon).
create policy "public_insert_contact_messages" on contact_messages for insert with check (true);
create policy "admin_all_contact_messages" on contact_messages for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- profiles had only "read/update own row" policies — meaning no admin could
-- ever see the customer list or grant admin to anyone else. Add the same
-- admin-all pattern used everywhere else in this schema. This, plus the
-- setAdminStatus() server action, is the entire admin-promotion mechanism:
-- a database boolean, checked here, updated by an existing admin. No emails.
create policy "admin_read_all_profiles" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));
create policy "admin_update_all_profiles" on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- Give service_requests a public insert policy too, as defense-in-depth:
-- today it's only ever written via the service-role client in server
-- actions (already validated with zod), but a table that customers submit
-- into should not rely solely on "the frontend behaves" — if a future code
-- path ever queries with the anon key instead, this makes sure it still
-- can't do more than insert. Postgres has no CREATE POLICY IF NOT EXISTS,
-- so guard it explicitly.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'service_requests'
      and policyname = 'public_insert_service_requests'
  ) then
    execute 'create policy "public_insert_service_requests" on service_requests for insert with check (true)';
  end if;
end $$;

-- Storage bucket for admin-uploaded media (portfolio images, service icons,
-- etc). Public read (so images render on the public site), writes restricted
-- to admins via a storage policy that checks the same profiles.is_admin flag.
insert into storage.buckets (id, name, public)
values ('website-media', 'website-media', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'public_read_website_media'
  ) then
    execute 'create policy "public_read_website_media" on storage.objects for select using (bucket_id = ''website-media'')';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'admin_write_website_media'
  ) then
    execute 'create policy "admin_write_website_media" on storage.objects for all
      using (bucket_id = ''website-media'' and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))
      with check (bucket_id = ''website-media'' and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin))';
  end if;
end $$;
