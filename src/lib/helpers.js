import { SR_INTERVALS, XP_VALUES, DIFFICULTY_BONUS, RANKS, ACHIEVEMENTS } from './constants.js'

// ─── Date utilities ───────────────────────────────────────────────────────────
export function today() {
  return new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function isSameDay(a, b) {
  return a?.slice(0, 10) === b?.slice(0, 10)
}

export function daysBetween(a, b) {
  const msA = new Date(a).getTime()
  const msB = new Date(b).getTime()
  return Math.floor(Math.abs(msB - msA) / (1000 * 60 * 60 * 24))
}

/** Get ISO Monday of the week containing dateStr */
export function getWeekStart(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function getLast90Days() {
  const days = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

// ─── SR helpers ───────────────────────────────────────────────────────────────
export function getNextReviewDate(rating) {
  const days = SR_INTERVALS[rating]
  return addDays(today(), days)
}

export function isOverdue(nextReview) {
  return nextReview < today()
}

export function isDue(nextReview) {
  return nextReview <= today()
}

// ─── XP helpers ──────────────────────────────────────────────────────────────
export function calculateXP(rating, difficulty = 'medium') {
  return (XP_VALUES[rating] || 0) + (DIFFICULTY_BONUS[difficulty?.toLowerCase()] || 0)
}

// ─── Rank helpers ─────────────────────────────────────────────────────────────
export function getRankFromXP(xp) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r
  }
  return rank
}

export function getNextRank(xp) {
  for (const r of RANKS) {
    if (xp < r.minXP) return r
  }
  return null // at max rank
}

export function getXPProgress(xp) {
  const current = getRankFromXP(xp)
  const next = getNextRank(xp)
  if (!next) return { pct: 100, current, next: null, xpIntoRank: 0, xpNeeded: 0 }
  const xpIntoRank = xp - current.minXP
  const xpNeeded = next.minXP - current.minXP
  const pct = Math.min(100, Math.round((xpIntoRank / xpNeeded) * 100))
  return { pct, current, next, xpIntoRank, xpNeeded }
}

// ─── Weak Topic Detection ─────────────────────────────────────────────────────
/**
 * Score per problem by mastery: again=2, hard=1, good=0, master=-1
 * Aggregate by topic, return topic with highest positive score.
 */
export function getWeakTopic(problems) {
  if (!problems || problems.length < 3) return null
  const scores = {}
  const counts = {}
  const MASTERY_SCORE = { again: 2, hard: 1, good: 0, master: -1 }
  for (const p of problems) {
    const topics = p.topics || []
    const score = MASTERY_SCORE[p.mastery] ?? 0
    for (const topic of topics) {
      scores[topic] = (scores[topic] || 0) + score
      counts[topic] = (counts[topic] || 0) + 1
    }
  }
  let worst = null
  let worstScore = -Infinity
  for (const [topic, score] of Object.entries(scores)) {
    if (score > worstScore) { worst = topic; worstScore = score }
  }
  return worstScore > 0 ? worst : null
}

// ─── Achievement Checker ─────────────────────────────────────────────────────
/**
 * Returns array of achievement IDs newly unlocked.
 * Pass current unlocked[], stats, problems[], notebooks[].
 */
export function checkNewAchievements({ unlockedIds = [], stats = {}, problems = [], notebooks = [] }) {
  const newly = []
  const has = (id) => unlockedIds.includes(id)
  const unlock = (id) => { if (!has(id)) newly.push(id) }

  const totalProblems = problems.length
  const hardCount = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length
  const masteredCount = problems.filter(p => p.mastery === 'master').length
  const topicsSet = new Set(problems.flatMap(p => p.topics || []))
  const topicCount = topicsSet.size

  // Problems logged
  if (totalProblems >= 1)   unlock('first_blood')
  if (totalProblems >= 10)  unlock('ten_down')
  if (totalProblems >= 50)  unlock('fifty_grind')
  if (totalProblems >= 100) unlock('century')

  // Streaks
  const streak = stats.streak || 0
  if (streak >= 3)   unlock('on_fire')
  if (streak >= 7)   unlock('week_warrior')
  if (streak >= 30)  unlock('monthly_legend')
  if (streak >= 100) unlock('unbreakable')

  // Mastery
  if (masteredCount >= 1)  unlock('first_master')
  if (masteredCount >= 10) unlock('sharpshooter')
  if (masteredCount >= 25) unlock('deadeye')

  // XP
  const xp = stats.xp || 0
  if (xp >= 100)  unlock('xp_hunter')
  if (xp >= 500)  unlock('xp_grinder')
  if (xp >= 1500) unlock('reach_master')
  if (xp >= 3000) unlock('grandmaster')

  // Difficulty
  if (hardCount >= 5)  unlock('hard_mode')
  if (hardCount >= 20) unlock('hardcore')

  // Topics
  if (topicCount >= 5)  unlock('well_rounded')
  if (topicCount >= 10) unlock('polymath')

  // Reviews
  const totalReviews = stats.total_reviews || 0
  if (totalReviews >= 50)  unlock('reviewer')
  if (totalReviews >= 200) unlock('drill_sergeant')

  // Weekly goal
  const weekCount = stats.week_count || 0
  const weeklyGoal = stats.weekly_goal || 5
  if (weekCount >= weeklyGoal) unlock('goal_crusher')

  // Notebooks
  if (notebooks.length >= 1) unlock('scholar')
  if (notebooks.length >= 5) unlock('librarian')

  return newly
}

// ─── Export helpers ───────────────────────────────────────────────────────────
export function problemsToCSV(problems) {
  const headers = ['title', 'url', 'topics', 'difficulty', 'notes', 'mastery', 'next_review', 'review_count', 'added_at']
  const rows = problems.map(p =>
    headers.map(h => {
      const val = h === 'topics' ? (p.topics || []).join(';') : (p[h] ?? '')
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export function downloadFile(content, filename, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Mastery colour util ──────────────────────────────────────────────────────
export function masteryColor(mastery) {
  return {
    again: '#F87171',
    hard: '#FDE047',
    good: '#4ADE80',
    master: '#A78BFA',
  }[mastery] || '#8B949E'
}

export function masteryLabel(mastery) {
  return {
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    master: 'Master',
  }[mastery] || mastery
}

// ─── Streak helpers ───────────────────────────────────────────────────────────
/**
 * Given current streak state and last_review_date, compute the new streak.
 * Call this when a review is performed today.
 */
export function computeNewStreak(lastReviewDate, currentStreak) {
  const t = today()
  if (!lastReviewDate) return 1
  const diff = daysBetween(lastReviewDate, t)
  if (isSameDay(lastReviewDate, t)) return currentStreak // already reviewed today
  if (diff === 1) return currentStreak + 1 // consecutive day
  return 1 // streak broken
}
