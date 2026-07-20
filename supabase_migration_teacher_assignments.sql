-- Teacher-assigned problems migration (single-professor MVP)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- AFTER the company tags migration.

-- ── Assignments (denormalized problem info, set by the professor) ──────────
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  topics text[] not null default '{}',
  difficulty text not null default 'medium',
  notes text,
  assigned_date date not null default current_date,
  created_by text not null,           -- professor's email, for audit
  created_at timestamptz not null default now()
);

-- ── Per-student progress on an assignment ───────────────────────────────────
create table if not exists assignment_progress (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',   -- pending | completed
  completed_at timestamptz,
  problem_id uuid references problems(id) on delete set null,  -- link into the student's own SR problem row
  created_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists idx_assignment_progress_student on assignment_progress (student_id);
create index if not exists idx_assignment_progress_assignment on assignment_progress (assignment_id);

-- ── Auto-fan-out: when an assignment is created, give every current student
--    a pending progress row. Runs as SECURITY DEFINER so it can insert rows
--    for other users without needing a broad RLS policy. ───────────────────
create or replace function fanout_assignment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into assignment_progress (assignment_id, student_id, status)
  select new.id, p.user_id, 'pending'
  from profiles p
  on conflict (assignment_id, student_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_fanout_assignment_progress on assignments;
create trigger trg_fanout_assignment_progress
  after insert on assignments
  for each row
  execute function fanout_assignment_progress();

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table assignments enable row level security;
alter table assignment_progress enable row level security;

-- IMPORTANT: replace this with your professor's real login email before
-- running, and keep it in sync with PROFESSOR_EMAIL in src/lib/constants.js
-- (case-insensitive compare used here to avoid mismatches).

-- Everyone signed in can see assignments (they're shared class-wide)
drop policy if exists "assignments readable by all students" on assignments;
create policy "assignments readable by all students"
  on assignments for select
  using (auth.role() = 'authenticated');

-- Only the professor can create assignments
drop policy if exists "only professor creates assignments" on assignments;
create policy "only professor creates assignments"
  on assignments for insert
  with check (lower(auth.jwt() ->> 'email') = lower('PROFESSOR_EMAIL_HERE'));

-- Only the professor can delete/edit assignments
drop policy if exists "only professor manages assignments" on assignments;
create policy "only professor manages assignments"
  on assignments for update
  using (lower(auth.jwt() ->> 'email') = lower('PROFESSOR_EMAIL_HERE'));

drop policy if exists "only professor deletes assignments" on assignments;
create policy "only professor deletes assignments"
  on assignments for delete
  using (lower(auth.jwt() ->> 'email') = lower('PROFESSOR_EMAIL_HERE'));

-- Students see their own progress row; professor sees all
drop policy if exists "students see own progress or professor sees all" on assignment_progress;
create policy "students see own progress or professor sees all"
  on assignment_progress for select
  using (
    student_id = auth.uid()
    or lower(auth.jwt() ->> 'email') = lower('PROFESSOR_EMAIL_HERE')
  );

-- Students can only update their own progress row (marking complete)
drop policy if exists "students update own progress" on assignment_progress;
create policy "students update own progress"
  on assignment_progress for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- No direct client-side inserts into assignment_progress — the trigger
-- (security definer) handles fan-out, so no insert policy is granted.
