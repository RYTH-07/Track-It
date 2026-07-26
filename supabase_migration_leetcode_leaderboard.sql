-- LeetCode leaderboard: linking a username + storing auto-refreshed stats.
-- Run this in Supabase SQL Editor.

-- Users link their LeetCode username on their profile
alter table profiles
  add column if not exists leetcode_username text;

-- Stats fetched daily by the server-side cron job (api/refresh-leetcode-stats.js)
create table if not exists leetcode_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  total_solved int not null default 0,
  easy_solved int not null default 0,
  medium_solved int not null default 0,
  hard_solved int not null default 0,
  updated_at timestamptz not null default now()
);

alter table leetcode_stats enable row level security;

-- Everyone signed in can read the leaderboard data
drop policy if exists "leetcode stats readable by all" on leetcode_stats;
create policy "leetcode stats readable by all"
  on leetcode_stats for select
  using (auth.role() = 'authenticated');

-- NOTE: no insert/update policy for regular users — only the daily cron job
-- (using the Supabase SERVICE ROLE key, which bypasses RLS) writes to this
-- table. This keeps stats trustworthy — nobody can fake their own numbers.
