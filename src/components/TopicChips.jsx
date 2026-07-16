import React from 'react'

export default function TopicChips({ topics = [], selectedTopics = [], onToggleTopic, dueCounts = {}, totalDue = 0 }) {
  const allSelected = selectedTopics.length === 0

  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
      <button
        type="button"
        onClick={() => onToggleTopic('all')}
        className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition ${allSelected ? 'text-white' : 'text-[var(--text-secondary)]'}`}
        style={{
          background: allSelected ? 'var(--accent)' : 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
        }}
      >
        All ({totalDue})
      </button>

      {topics.map((topic) => {
        const active = selectedTopics.includes(topic)
        const count = dueCounts[topic] || 0
        return (
          <button
            key={topic}
            type="button"
            onClick={() => onToggleTopic(topic)}
            className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition ${active ? 'text-white' : 'text-[var(--text-secondary)]'}`}
            style={{
              background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
            }}
          >
            {topic} ({count})
          </button>
        )
      })}
    </div>
  )
}
