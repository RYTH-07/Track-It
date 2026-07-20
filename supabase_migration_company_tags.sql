-- Company tags migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

alter table problems
  add column if not exists companies text[] not null default '{}';

-- Optional: speed up filtering/searching by company on larger datasets
create index if not exists idx_problems_companies on problems using gin (companies);
