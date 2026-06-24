import React from 'react'
import { Lock } from 'lucide-react'
import { ACHIEVEMENTS } from '../lib/constants.js'

export default function AchievementBadge({ achievement, unlocked }) {
  return (
    <div
      className={`card p-3 flex flex-col items-center text-center gap-1.5 transition-all duration-300 ${unlocked ? 'card-glow' : 'opacity-40 grayscale'}`}
      style={{ minWidth: 100 }}
      title={achievement.desc}
    >
      <div className="text-2xl">{unlocked ? achievement.emoji : <Lock size={22} style={{ color: 'var(--text-muted)' }} />}</div>
      <span className="text-xs font-semibold leading-tight" style={{ color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
        {achievement.name}
      </span>
      <span className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{achievement.desc}</span>
    </div>
  )
}
