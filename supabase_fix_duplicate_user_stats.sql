-- Fix for recurring duplicate rows in user_stats
-- Run this in Supabase SQL Editor. Read the comments — step 1 is diagnostic only.

-- ── Step 1: check how bad it is (run this first, just to see) ──────────────
select user_id, count(*) as row_count
from user_stats
group by user_id
having count(*) > 1;

-- ── Step 2: dedupe — for each user_id with duplicates, keep the row with
--    the highest xp (assumed most "correct"/most recently trigger-updated)
--    and delete the rest. Review Step 1's output before running this.
with ranked as (
  select
    id,
    user_id,
    row_number() over (
      partition by user_id
      order by xp desc nulls last, total_reviews desc nulls last, id desc
    ) as rn
  from user_stats
)
delete from user_stats
where id in (
  select id from ranked where rn > 1
);

-- ── Step 3: the actual permanent fix — a unique constraint makes duplicate
--    rows impossible at the database level, regardless of what the app does.
alter table user_stats
  add constraint user_stats_user_id_unique unique (user_id);

-- ── Step 4: verify — should return zero rows ─────────────────────────────
select user_id, count(*) as row_count
from user_stats
group by user_id
having count(*) > 1;
