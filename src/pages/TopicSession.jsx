import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, Clock3 } from 'lucide-react'
import ReviewCard from '../components/ReviewCard.jsx'
import { today } from '../lib/helpers.js'

export default function TopicSession({ problems = [], topicName = '', onRate, onNotesChange, onEarlyReview }) {
  const navigate = useNavigate()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const ordered = useMemo(() => {
    return [...problems].sort((a, b) => {
      const aDue = a.next_review <= today()
      const bDue = b.next_review <= today()
      if (aDue !== bDue) return aDue ? -1 : 1
      return (a.next_review || '').localeCompare(b.next_review || '')
    })
  }, [problems])

  const current = ordered[selectedIndex]

  const handleEarlyReview = () => {
    if (!current) return
    onEarlyReview?.(current.id)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-8">
        <div className="mb-4 flex items-center justify-between rounded-[24px] border px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              <Sparkles size={16} /> {topicName} session
            </div>
            <div className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {ordered.length} problem{ordered.length === 1 ? '' : 's'} · focused practice mode
            </div>
          </div>
          <button type="button" onClick={() => navigate('/topics')} className="btn btn-ghost rounded-full">
            <X size={14} /> Exit
          </button>
        </div>

        {ordered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-[28px] border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <div className="text-center">
              <div className="mb-3 text-4xl">🧠</div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No problems for this topic yet.</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Add a few problems and come back to start a focused session.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between rounded-[20px] border px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Clock3 size={14} />
                {current?.next_review <= today() ? 'Due for review' : 'Review early'}
              </div>
              {current && current.next_review > today() && (
                <button type="button" onClick={handleEarlyReview} className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                  Review early?
                </button>
              )}
            </div>

            <div className="flex-1 rounded-[28px] border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              {current ? (
                <ReviewCard
                  key={current.id}
                  problem={current}
                  onRate={onRate}
                  onNotesChange={onNotesChange}
                />
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {selectedIndex + 1} / {ordered.length}
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost rounded-full" disabled={selectedIndex === 0} onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}>
                  Previous
                </button>
                <button type="button" className="btn btn-primary rounded-full" disabled={selectedIndex >= ordered.length - 1} onClick={() => setSelectedIndex((i) => Math.min(ordered.length - 1, i + 1))}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
