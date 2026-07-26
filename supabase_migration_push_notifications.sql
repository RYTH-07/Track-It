-- Push notifications: table to store each user's browser subscription.
-- Run this in Supabase SQL Editor.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- Users can only see/manage their own subscription rows
drop policy if exists "users manage own push subscriptions" on push_subscriptions;
create policy "users manage own push subscriptions"
  on push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- NOTE: the daily reminder job (api/send-reminders.js) runs server-side using
-- the Supabase SERVICE ROLE key, which bypasses RLS entirely — it does not
-- need its own policy here.
