import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, Clock3, CheckCircle2 } from 'lucide-react'
import ReviewCard from '../components/ReviewCard.jsx'
import { today } from '../lib/helpers.js'

export default function TopicSession({ problems = [], topicName = '', onRate, onNotesChange, onEarlyReview }) {
  const navigate = useNavigate()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [earlyUnlocked, setEarlyUnlocked] = useState(false)
  const [reviewingProblemId, setReviewingProblemId] = useState(null)
  const [ratedIds, setRatedIds] = useState(new Set())

  const ordered = useMemo(() => {
    return [...problems].sort((a, b) => {
      const aDue = a.next_review <= today()
      const bDue = b.next_review <= today()
      if (aDue !== bDue) return aDue ? -1 : 1
      return (a.next_review || '').localeCompare(b.next_review || '')
    })
  }, [problems])

  const current = ordered[selectedIndex]
  const currentIsRated = current ? ratedIds.has(current.id) : false
  const allRated = ordered.length > 0 && ordered.every(p => ratedIds.has(p.id))

  useEffect(() => {
    setEarlyUnlocked(false)
  }, [selectedIndex])

  const handleEarlyReview = () => {
    if (!current) return
    setEarlyUnlocked(true)
  }

  const handleRate = async (problemId, gradeKey) => {
    if (!onRate || reviewingProblemId === problemId) return
    setReviewingProblemId(problemId)
    try {
      await onRate(problemId, gradeKey)
      setRatedIds(prev => new Set(prev).add(problemId))
      setEarlyUnlocked(false)
      // auto-advance to the next unrated problem, if any
      setSelectedIndex((prev) => (prev < ordered.length - 1 ? prev + 1 : prev))
    } finally {
      setReviewingProblemId(null)
    }
  }

  const restartSession = () => {
    setRatedIds(new Set())
    setSelectedIndex(0)
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
              {ratedIds.size} / {ordered.length} reviewed · focused practice mode
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
        ) : allRated ? (
          <div className="flex flex-1 items-center justify-center rounded-[28px] border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <CheckCircle2 size={44} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Session complete!</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                You reviewed {ordered.length} problem{ordered.length === 1 ? '' : 's'} in {topicName}.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <button type="button" onClick={restartSession} className="btn btn-ghost rounded-full">
                  Review again
                </button>
                <button type="button" onClick={() => navigate('/topics')} className="btn btn-primary rounded-full">
                  Back to Topics
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between rounded-[20px] border px-3 py-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Clock3 size={14} />
                {currentIsRated
                  ? 'Already reviewed this session'
                  : current?.next_review <= today() ? 'Due for review' : 'Review early'}
              </div>
              {current && !currentIsRated && current.next_review > today() && (
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
                  onRate={!currentIsRated && (current.next_review <= today() || earlyUnlocked) ? handleRate : undefined}
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