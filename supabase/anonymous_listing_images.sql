-- BADDEL: allow anonymous visitors to upload photos only for pending listings.
-- Run this script in Supabase SQL Editor. The listing-images bucket must already exist
-- and be configured as a PUBLIC bucket.

grant insert on table public.listing_images to anon, authenticated;

drop policy if exists "Visitors attach photos to pending listings" on public.listing_images;
create policy "Visitors attach photos to pending listings"
on public.listing_images
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.listings l
    where l.id = listing_id
      and l.seller_id is null
      and l.status = 'pending_review'
  )
);

drop policy if exists "Visitors upload pending listing photos" on storage.objects;
create policy "Visitors upload pending listing photos"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and coalesce(metadata->>'mimetype', '') like 'image/%'
  and coalesce((metadata->>'size')::bigint, 0) between 1 and 5242880
);
