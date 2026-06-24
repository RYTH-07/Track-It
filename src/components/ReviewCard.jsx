import React, { useState, useRef, useEffect } from 'react'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { isOverdue, masteryColor } from '../lib/helpers.js'
import TopicTag from './TopicTag.jsx'

const MASTERY_BUTTONS = [
  { rating: 'again',  label: 'Again',  sub: '1d',  cls: 'btn-again'  },
  { rating: 'hard',   label: 'Hard',   sub: '3d',  cls: 'btn-hard'   },
  { rating: 'good',   label: 'Good',   sub: '7d',  cls: 'btn-good'   },
  { rating: 'master', label: 'Master', sub: '21d', cls: 'btn-master' },
]

export default function ReviewCard({ problem, onRate, onNotesChange, disabled }) {
  const [expanded, setExpanded] = useState(true)
  const [notes, setNotes] = useState(problem.notes || '')
  const [rating, setRating] = useState(null)
  const saveTimer = useRef(null)
  const overdue = isOverdue(problem.next_review)

  useEffect(() => { setNotes(problem.notes || '') }, [problem.notes])

  const handleNotesBlur = () => {
    clearTimeout(saveTimer.current)
    if (notes !== problem.notes) {
      onNotesChange?.(problem.id, notes)
    }
  }

  const handleRate = async (r) => {
    if (disabled || rating) return
    setRating(r)
    await onRate(problem.id, r)
  }

  const diffClass = {
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard',
  }[problem.difficulty?.toLowerCase()] || 'badge-medium'

  return (
    <div className={`card p-4 animate-fade-in transition-all duration-300 ${overdue ? 'overdue-card' : ''} ${rating ? 'opacity-60 scale-[0.99]' : ''}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {overdue && (
              <span className="badge text-xs" style={{ background: 'rgba(234,179,8,0.15)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.3)' }}>
                ⏰ Overdue
              </span>
            )}
            <span className={`badge ${diffClass}`}>{problem.difficulty || 'Medium'}</span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
              {problem.title}
            </h3>
            {problem.url && (
              <a href={problem.url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 text-violet-400 hover:text-violet-300 transition-colors"
                onClick={e => e.stopPropagation()}>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          {/* Topics */}
          {problem.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {problem.topics.map(t => <TopicTag key={t} label={t} />)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs" style={{ fontFamily: 'JetBrains Mono,monospace', color: masteryColor(problem.mastery) }}>
            {problem.mastery || 'new'}
          </span>
          <button onClick={() => setExpanded(v => !v)} className="btn btn-ghost px-1.5 py-1" aria-label="Toggle card">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Inline notes */}
          <div>
            <span className="label">Notes</span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Click to add notes..."
              rows={2}
              className="input resize-none text-sm"
              style={{ fontFamily: 'Inter,sans-serif', minHeight: '60px' }}
            />
          </div>

          {/* Mastery buttons */}
          <div>
            <span className="label">How did it go?</span>
            <div className="flex gap-2 flex-wrap">
              {MASTERY_BUTTONS.map(({ rating: r, label, sub, cls }) => (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  disabled={disabled || !!rating}
                  className={`btn ${cls} flex-col gap-0.5 px-4 py-2 ${rating === r ? 'ring-2 ring-white/30' : ''}`}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs opacity-70" style={{ fontFamily: 'JetBrains Mono,monospace' }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Review count */}
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
            Reviews: {problem.review_count || 0} · Next: {problem.next_review}
          </p>
        </div>
      )}
    </div>
  )
}
