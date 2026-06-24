import React from 'react'
import { Trophy } from 'lucide-react'
import AchievementBadge from '../components/AchievementBadge.jsx'
import { ACHIEVEMENTS } from '../lib/constants.js'

export default function Achievements({ unlockedIds = [] }) {
  const unlocked = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id))
  const locked   = ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={20} className="text-violet-400" /> Achievements
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {unlockedIds.length} / {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
        <div className="stat-chip">
          <span style={{ fontFamily: 'JetBrains Mono,monospace' }}>🏆 {unlockedIds.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono,monospace' }}>
          <span>Achievement Progress</span>
          <span>{Math.round((unlockedIds.length / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(unlockedIds.length / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="mb-6">
          <div className="section-header">Unlocked</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {unlocked.map(a => (
              <AchievementBadge key={a.id} achievement={a} unlocked={true} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <div className="section-header">Locked</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {locked.map(a => (
              <AchievementBadge key={a.id} achievement={a} unlocked={false} />
            ))}
          </div>
        </div>
      )}

      {unlockedIds.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 animate-float">🎯</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Log your first problem to start earning achievements!
          </p>
        </div>
      )}
    </div>
  )
}
