create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  last_active_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.streaks enable row level security;

create policy "Users can read own streak"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "Users can upsert own streak"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streak"
  on public.streaks for update
  using (auth.uid() = user_id);
