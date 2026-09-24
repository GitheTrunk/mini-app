-- Run this manually in the Supabase SQL editor after reviewing it.
-- The bucket is public for reads, but every write policy is scoped to the
-- authenticated user's own first-level folder.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Supabase Storage upserts need SELECT in addition to INSERT and UPDATE.
-- This metadata policy is still restricted to the user's own folder.
create policy "Users can read their own avatar metadata"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can upload their own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can update their own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Needed only to clean up avatar.<old-extension> after an extension change.
create policy "Users can delete their own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- The app expects this column on the existing profiles table.
alter table public.profiles
add column if not exists avatar_url text;
