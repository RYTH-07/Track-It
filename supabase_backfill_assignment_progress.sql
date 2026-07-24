-- Backfill: give every current student a pending row for every existing
-- assignment. Fixes accounts (like your friend's) created AFTER an
-- assignment already existed, which the creation-time trigger never covers.
-- Safe to run any time — "on conflict do nothing" means it won't duplicate
-- or overwrite anyone who already has a row (including completed ones).

insert into assignment_progress (assignment_id, student_id, status)
select a.id, p.user_id, 'pending'
from assignments a
cross join profiles p
where not exists (
  select 1 from assignment_progress ap
  where ap.assignment_id = a.id and ap.student_id = p.user_id
)
on conflict (assignment_id, student_id) do nothing;
