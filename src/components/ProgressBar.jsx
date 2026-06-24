import React from 'react'

export default function ProgressBar({ pct = 0, height = 6, color = 'linear-gradient(90deg, #7C3AED, #A78BFA)', label }) {
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono,monospace' }}>{label}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{clamped}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div className="progress-fill" style={{ width: `${clamped}%`, background: color }} />
      </div>
    </div>
  )
}
