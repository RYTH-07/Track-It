import React, { useEffect } from 'react'
import {
  BarChart2,
  Flame,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Target
} from 'lucide-react'
import ActivityHeatmap from '../components/ActivityHeatmap.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { getXPProgress, getRankFromXP, isDue } from '../lib/helpers.js'

export default function Stats({ problems, stats, activityMap, onFetchActivity }) {
  useEffect(() => { onFetchActivity?.() }, [])

  const xp = stats?.xp || 0
  const streak = stats?.streak || 0
  const longest = stats?.longest_streak || 0
  const { pct, current: rank, next, xpIntoRank, xpNeeded } = getXPProgress(xp)

  const totalSolved   = problems.length
  const dueCount      = problems.filter(p => isDue(p.next_review)).length
  const masteredCount = problems.filter(p => p.mastery === 'master').length
  const totalReviews  = stats?.total_reviews || 0
  const weeklyGoal = stats?.weekly_goal || 5
const weekCount = stats?.week_count || 0
const weeklyPct = Math.min(
  100,
  Math.round((weekCount / weeklyGoal) * 100)
)

  const easyCount   = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length
  const mediumCount = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length
  const hardCount   = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length

  const statCards = [
    { label: 'Total Solved', value: totalSolved, color: '#A78BFA', icon: BookOpen },
    { label: 'Due for Review', value: dueCount,  color: '#FDE047', icon: Clock },
    { label: 'Mastered',      value: masteredCount, color: '#4ADE80', icon: Star },
    { label: 'Total Reviews', value: totalReviews, color: '#60A5FA', icon: CheckCircle2 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart2 size={20} className="text-violet-400" /> Stats
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color, fontFamily: 'JetBrains Mono,monospace' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Streak & XP + Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak & XP */}
        <div className="card p-4">
          <div className="section-header"><Flame size={12} /> Streak & XP</div>
          <div className="text-center mb-4">
            <div className="text-5xl font-bold mb-1" style={{ color: '#F97316', fontFamily: 'JetBrains Mono,monospace' }}>{streak}</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              day streak 🔥 · best: {longest}d
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>{rank.emoji} {rank.name}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{xp} XP</span>
            </div>
            <ProgressBar pct={pct} />
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
              {next ? `${xpNeeded - xpIntoRank} XP to ${next.name}` : '🎉 Max rank reached!'}
            </p>
          </div>
        </div>

        {/* 90-Day Activity */}
        <div className="card p-4 overflow-x-auto">
          <div className="section-header">90-Day Activity</div>
          <ActivityHeatmap activityMap={activityMap} />
        </div>
      </div>
      {/*weekly goal*/}
      <div className="card p-4">
  <div className="section-header">
    <Target size={12} className="text-violet-400" />
    Weekly Goal
  </div>

  <div className="flex items-center gap-3">
    <div className="flex-1">
      <div
        className="flex justify-between text-xs mb-2"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <span>
          {weekCount} / {weeklyGoal} reviews this week
        </span>

        <span className="text-violet-300 font-semibold">
          {weeklyPct}%
        </span>
      </div>

      <ProgressBar pct={weeklyPct} />

      <div
        className="flex justify-between mt-2 text-xs"
        style={{
          color: "var(--text-muted)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <span>{Math.max(0, weeklyGoal - weekCount)} reviews remaining</span>

        {weeklyPct === 100 ? (
          <span className="text-green-400">Goal Completed 🎉</span>
        ) : (
          <span className="text-violet-300">
            {weeklyGoal - weekCount} to go
          </span>
        )}
      </div>
    </div>
  </div>
</div>


      {/* Difficulty breakdown */}
      <div className="card p-4">
        <div className="section-header">Difficulty Breakdown</div>
        <div className="flex gap-8">
          {[
            { label: 'Easy',   count: easyCount,   color: '#4ADE80' },
            { label: 'Medium', count: mediumCount,  color: '#FDE047' },
            { label: 'Hard',   count: hardCount,    color: '#F87171' },
          ].map(({ label, count, color }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold" style={{ color, fontFamily: 'JetBrains Mono,monospace' }}>{count}</div>
              <div className="text-xs mt-1 font-semibold tracking-widest" style={{ color, fontFamily: 'JetBrains Mono,monospace' }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
