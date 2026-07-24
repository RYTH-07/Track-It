-- Targeted assignments + permanent fix for "student joins after assignment
-- already exists" gap. Run this AFTER supabase_backfill_assignment_progress.sql
-- (that one-time backfill still applies correctly to your existing,
-- untargeted assignments — this migration doesn't change past behavior).

-- ── New column: which students this assignment applies to ─────────────────
-- NULL or empty array = everyone (same as today, fully backward compatible
-- with every assignment already created).
alter table assignments
  add column if not exists target_emails text[] default null;

-- ── Matching helper: does this student's email match a target list? ───────
-- Each entry in target_emails can be a full email OR just a fragment
-- (e.g. a roll number like '25108') — matched as a case-insensitive
-- substring against the student's actual email.
create or replace function email_matches_targets(student_email text, targets text[])
returns boolean
language sql
stable
as $$
  select targets is null
      or array_length(targets, 1) is null
      or exists (
        select 1 from unnest(targets) as t
        where student_email ilike '%' || t || '%'
      );
$$;

-- ── Update the assignment-creation fanout to respect target_emails ────────
create or replace function fanout_assignment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into assignment_progress (assignment_id, student_id, status)
  select new.id, u.id, 'pending'
  from auth.users u
  join profiles p on p.user_id = u.id
  where email_matches_targets(u.email, new.target_emails)
  on conflict (assignment_id, student_id) do nothing;
  return new;
end;
$$;
-- (trigger itself already exists from the first migration and doesn't
-- need to be re-created — it just calls this updated function now)

-- ── NEW: permanent fix for late signups. Whenever a new profile is
--    created, retroactively give that student pending rows for every
--    existing assignment they match. This is what your friend's account
--    was missing — going forward, this can never happen again. ───────────
create or replace function fanout_new_student_to_assignments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student_email text;
begin
  select email into student_email from auth.users where id = new.user_id;
  if student_email is null then
    return new;
  end if;

  insert into assignment_progress (assignment_id, student_id, status)
  select a.id, new.user_id, 'pending'
  from assignments a
  where email_matches_targets(student_email, a.target_emails)
  on conflict (assignment_id, student_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_fanout_new_student on profiles;
create trigger trg_fanout_new_student
  after insert on profiles
  for each row
  execute function fanout_new_student_to_assignments();
