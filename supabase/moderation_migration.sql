-- BADDEL: anonymous listing submission with manual admin approval.
-- Run this migration in Supabase SQL Editor after the original schema.sql.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.listings
  alter column seller_id drop not null,
  add column if not exists contact_phone text;

alter table public.listings
  drop constraint if exists listings_status_check;

alter table public.listings
  add constraint listings_status_check
  check (status in ('pending_review','active','rejected','reserved','sold','exchanged','hidden','removed'));

-- Only the project owner should be made admin. Replace the email below with
-- the exact email used for the owner's BADDEL account, then run this statement.
-- update public.profiles p
-- set is_admin = true
-- from auth.users u
-- where p.id = u.id and u.email = 'YOUR_ADMIN_EMAIL';

drop policy if exists "Active listings are public" on public.listings;
drop policy if exists "Users create own listings" on public.listings;
drop policy if exists "Owners update own listings" on public.listings;
drop policy if exists "Owners delete own listings" on public.listings;

create policy "Public sees approved listings and admins see all"
on public.listings for select
using (
  status = 'active'
  or seller_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- Visitors can submit a listing, but only as pending_review with no seller identity.
create policy "Visitors submit listings for review"
on public.listings for insert
to anon, authenticated
with check (
  seller_id is null
  and status = 'pending_review'
);

create policy "Admins moderate listings"
on public.listings for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins delete listings"
on public.listings for delete
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Keep listing images private until approval; image upload is not part of this first form.
