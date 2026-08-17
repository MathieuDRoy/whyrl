-- Drop redundant duplicate RLS policies on profiles and trends.
-- These existed live in the DB under different names than the ones
-- tracked in 20260813_lock_down_trend_cards_bucket.sql, with identical
-- auth.uid() checks - so every query was evaluating the same check twice.
-- The surviving policy (named to match the tracked migration) has the
-- exact same qual/with_check, so no access changes.

drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

drop policy if exists "delete own trends" on public.trends;
drop policy if exists "insert own trends" on public.trends;
drop policy if exists "select own trends" on public.trends;
