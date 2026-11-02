-- BADDEL: secure manual moderation and anonymous listing submissions.
-- Safe to run after the first moderation_migration.sql; this version hardens admin access.

-- Keep the existing nullable seller_id and contact_phone changes.
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.listings alter column seller_id drop not null;
alter table public.listings add column if not exists contact_phone text;

alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('pending_review','active','rejected','reserved','sold','exchanged','hidden','removed'));

-- IMPORTANT: admin privileges live in a separate table. A user cannot promote
-- themselves by editing their public profile.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;
drop policy if exists "Admins can view own admin record" on public.admin_users;
create policy "Admins can view own admin record"
  on public.admin_users for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Remove the earlier, insecure profile-column based policies.
drop policy if exists "Public sees approved listings and admins see all" on public.listings;
drop policy if exists "Visitors submit listings for review" on public.listings;
drop policy if exists "Admins moderate listings" on public.listings;
drop policy if exists "Admins delete listings" on public.listings;
drop policy if exists "Active listings are public" on public.listings;
drop policy if exists "Users create own listings" on public.listings;
drop policy if exists "Owners update own listings" on public.listings;
drop policy if exists "Owners delete own listings" on public.listings;

create policy "Public sees approved listings and admins see all"
  on public.listings for select
  using (status = 'active' or seller_id = (select auth.uid()) or public.is_admin());

create policy "Visitors submit listings for review"
  on public.listings for insert to anon, authenticated
  with check (seller_id is null and status = 'pending_review');

create policy "Admins moderate listings"
  on public.listings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete listings"
  on public.listings for delete to authenticated
  using (public.is_admin());

-- Assign the site owner as admin by email. Replace the placeholder with the
-- exact email used to sign in to BADDEL, then uncomment and run this statement:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'YOUR_LOGIN_EMAIL'
-- on conflict (user_id) do nothing;
