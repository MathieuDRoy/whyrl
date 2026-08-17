-- Performance advisor flags auth_rls_initplan on every RLS policy in
-- profiles, trends, and streaks: each policy calls auth.uid() directly,
-- so Postgres re-evaluates it once per row instead of once per query.
-- Wrapping the call in a scalar subquery lets the planner evaluate it
-- once per query instead. See:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
--
-- This is a pure performance rewrite: every policy keeps its exact name,
-- table, command, role, and logical condition - only auth.uid() becomes
-- (select auth.uid()).

drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile" on public.profiles
  for insert
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update
  using ((select auth.uid()) = id);

drop policy if exists "Users can upsert own streak" on public.streaks;
create policy "Users can upsert own streak" on public.streaks
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own streak" on public.streaks;
create policy "Users can read own streak" on public.streaks
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update own streak" on public.streaks;
create policy "Users can update own streak" on public.streaks
  for update
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own trends" on public.trends;
create policy "Users can delete own trends" on public.trends
  for delete
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own trends" on public.trends;
create policy "Users can insert own trends" on public.trends
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read own trends" on public.trends;
create policy "Users can read own trends" on public.trends
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update own trends" on public.trends;
create policy "Users can update own trends" on public.trends
  for update
  using ((select auth.uid()) = user_id);
