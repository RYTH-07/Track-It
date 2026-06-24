import React from 'react'
import { getLast90Days } from '../lib/helpers.js'

function heatLevel(count) {
  if (!count || count === 0) return 'heat-0'
  if (count === 1) return 'heat-1'
  if (count <= 3) return 'heat-2'
  return 'heat-3'
}

export default function ActivityHeatmap({ activityMap = {} }) {
  const days = getLast90Days()

  // Group into weeks (columns of 7)
  const weeks = []
  let week = []
  // Pad so grid starts on correct day-of-week
  const firstDay = new Date(days[0])
  const startDow = firstDay.getDay() // 0=Sun
  for (let i = 0; i < startDow; i++) week.push(null)

  for (const day of days) {
    week.push(day)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return (
    <div>
      {/* Day labels */}
      <div className="flex gap-0.5 mb-1 ml-0">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="w-3 text-center" style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{d}</div>
        ))}
      </div>
      {/* Grid: rows = days of week, cols = weeks */}
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="w-3 h-3 rounded-sm opacity-0" />
              const count = activityMap[day] || 0
              const level = heatLevel(count)
              return (
                <div
                  key={day}
                  className={`w-3 h-3 rounded-sm ${level} transition-all duration-200 hover:ring-1 hover:ring-violet-400`}
                  title={`${day}: ${count} review${count !== 1 ? 's' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>Less</span>
        {['heat-0','heat-1','heat-2','heat-3'].map(cls => (
          <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>More</span>
      </div>
    </div>
  )
}
