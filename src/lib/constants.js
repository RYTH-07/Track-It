// ─── Auth ────────────────────────────────────────────────────────────────────
export const ALLOWED_DOMAIN = 'ch.students.amrita.edu'
export const DOMAIN_ERROR = 'Track-It is exclusive to Amrita Chennai students. Please use your @ch.students.amrita.edu email.'

// The professor's login email — bypasses the student domain check on signup
// and is granted assignment-management access. Fill this in once you know it,
// and keep it in sync (case-insensitive) with the four PROFESSOR_EMAIL_HERE
// placeholders in supabase_migration_teacher_assignments.sql.
export const PROFESSOR_EMAIL = 'r_annamalai@ch.amrita.edu'

// ─── Spaced Repetition Intervals (days) ──────────────────────────────────────
export const SR_INTERVALS = {
  again: 1,
  hard: 3,
  good: 7,
  master: 14,
}

// ─── XP Values ───────────────────────────────────────────────────────────────
export const XP_VALUES = {
  again: 2,
  hard: 5,
  good: 10,
  master: 20,
}

export const DIFFICULTY_BONUS = {
  easy: 0,
  medium: 5,
  hard: 10,
}

// ─── Rank Ladder ─────────────────────────────────────────────────────────────
export const RANKS = [
  { name: 'Novice',      minXP: 0,    emoji: '🌱' },
  { name: 'Apprentice',  minXP: 100,  emoji: '⚡' },
  { name: 'Adept',       minXP: 300,  emoji: '🔥' },
  { name: 'Expert',      minXP: 700,  emoji: '💎' },
  { name: 'Master',      minXP: 1500, emoji: '🏆' },
  { name: 'Grandmaster', minXP: 3000, emoji: '👑' },
]

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  // Problems logged
  { id: 'first_blood',    name: 'First Blood',       emoji: '🩸', desc: 'Log your first problem' },
  { id: 'ten_down',       name: 'Ten Down',           emoji: '🔟', desc: 'Log 10 problems' },
  { id: 'fifty_grind',    name: 'Fifty Grind',        emoji: '💪', desc: 'Log 50 problems' },
  { id: 'century',        name: 'Century',            emoji: '💯', desc: 'Log 100 problems' },
  // Streaks
  { id: 'on_fire',        name: 'On Fire',            emoji: '🔥', desc: '3-day review streak' },
  { id: 'week_warrior',   name: 'Week Warrior',       emoji: '⚔️', desc: '7-day review streak' },
  { id: 'monthly_legend', name: 'Monthly Legend',     emoji: '🗓️', desc: '30-day review streak' },
  { id: 'unbreakable',    name: 'Unbreakable',        emoji: '💎', desc: '100-day review streak' },
  // Mastery
  { id: 'first_master',   name: 'First Master',       emoji: '⭐', desc: 'Master your first problem' },
  { id: 'sharpshooter',   name: 'Sharpshooter',       emoji: '🎯', desc: 'Master 10 problems' },
  { id: 'deadeye',        name: 'Deadeye',            emoji: '🏹', desc: 'Master 25 problems' },
  // XP
  { id: 'xp_hunter',     name: 'XP Hunter',          emoji: '⚡', desc: 'Earn 100 XP' },
  { id: 'xp_grinder',    name: 'XP Grinder',         emoji: '⚙️', desc: 'Earn 500 XP' },
  { id: 'reach_master',  name: 'Reach Master Rank',  emoji: '🏆', desc: 'Reach 1500 XP' },
  { id: 'grandmaster',   name: 'Grandmaster',        emoji: '👑', desc: 'Reach 3000 XP' },
  // Difficulty
  { id: 'hard_mode',     name: 'Hard Mode',          emoji: '😤', desc: 'Log 5 hard problems' },
  { id: 'hardcore',      name: 'Hardcore',           emoji: '💀', desc: 'Log 20 hard problems' },
  // Topics
  { id: 'well_rounded',  name: 'Well-Rounded',       emoji: '🌐', desc: 'Cover 5 different topics' },
  { id: 'polymath',      name: 'Polymath',           emoji: '🧠', desc: 'Cover 10 different topics' },
  // Reviews
  { id: 'reviewer',      name: 'Reviewer',           emoji: '📝', desc: '50 total reviews' },
  { id: 'drill_sergeant',name: 'Drill Sergeant',     emoji: '🎖️', desc: '200 total reviews' },
  // Weekly goal
  { id: 'goal_crusher',  name: 'Goal Crusher',       emoji: '🎯', desc: 'Hit your weekly review goal' },
  // Notebooks
  { id: 'scholar',       name: 'Scholar',            emoji: '📚', desc: 'Create your first notebook' },
  { id: 'librarian',     name: 'Librarian',          emoji: '🏛️', desc: 'Create 5 notebooks' },
]

// ─── Default weekly goal ─────────────────────────────────────────────────────
export const DEFAULT_WEEKLY_GOAL = 5

// ─── Suggested company tags ──────────────────────────────────────────────────
export const SUGGESTED_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix',
  'Uber', 'Adobe', 'Bloomberg', 'Goldman Sachs', 'Flipkart',
  'Atlassian', 'Oracle', 'Salesforce', 'LinkedIn', 'TCS',
  'Infosys', 'Zoho', 'Swiggy', 'Zomato',
]
