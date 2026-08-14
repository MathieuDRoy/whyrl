-- trend-cards bucket is currently public: any request to
-- /storage/v1/object/public/trend-cards/<user_id>/<card_id>.json
-- returns the file with no auth check. Paths are UUIDs so not
-- enumerable, but any code path that leaks a user_id + card_id pair
-- (logs, the storage_url column, screenshots, referer headers) hands
-- out that user's saved data. Lock the bucket and add per-user RLS
-- so only the storage/download API path (already used by the app)
-- keeps working, scoped to the owning user.

update storage.buckets set public = false where id = 'trend-cards';

drop policy if exists "Users can read own trend card files" on storage.objects;
create policy "Users can read own trend card files"
  on storage.objects for select
  using (
    bucket_id = 'trend-cards'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can upload own trend card files" on storage.objects;
create policy "Users can upload own trend card files"
  on storage.objects for insert
  with check (
    bucket_id = 'trend-cards'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own trend card files" on storage.objects;
create policy "Users can update own trend card files"
  on storage.objects for update
  using (
    bucket_id = 'trend-cards'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own trend card files" on storage.objects;
create policy "Users can delete own trend card files"
  on storage.objects for delete
  using (
    bucket_id = 'trend-cards'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- trends table itself was never checked into a migration either.
-- Lock it down the same way the streaks table already is.
alter table public.trends enable row level security;

drop policy if exists "Users can read own trends" on public.trends;
create policy "Users can read own trends"
  on public.trends for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own trends" on public.trends;
create policy "Users can insert own trends"
  on public.trends for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own trends" on public.trends;
create policy "Users can update own trends"
  on public.trends for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own trends" on public.trends;
create policy "Users can delete own trends"
  on public.trends for delete
  using (auth.uid() = user_id);

-- profiles table: same gap.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
