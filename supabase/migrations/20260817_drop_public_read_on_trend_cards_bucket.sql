-- Applied directly to the database and checked in for tracking.
-- Leftover duplicate from before 20260813_lock_down_trend_cards_bucket.sql:
-- "public read" has no owner check (bucket_id = 'trend-cards' only), so it
-- permissively OR's with the scoped "Users can read own trend card files"
-- policy and let any authenticated user read any other user's saved
-- trend card files. The scoped policy is the one that should remain.

drop policy if exists "public read" on storage.objects;
