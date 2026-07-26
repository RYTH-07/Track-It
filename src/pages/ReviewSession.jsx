import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewCard from '../components/ReviewCard.jsx'

export default function ReviewSession({ dueProblems, onRate, onNotesChange, onArchive }) {
  const navigate = useNavigate()
  const [slideIndex, setSlideIndex] = useState(0)

  const sortedDue = useMemo(() => {
    return [...dueProblems].sort((a, b) => (a.next_review || '').localeCompare(b.next_review || ''))
  }, [dueProblems])

  useEffect(() => {
    if (sortedDue.length === 0) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, sortedDue.length])

  const currentProblem = sortedDue[slideIndex]
  const prevDisabled = slideIndex === 0
  const nextDisabled = slideIndex >= sortedDue.length - 1

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="relative min-h-screen flex flex-col justify-center px-4 py-8 sm:px-10">
        {currentProblem ? (
          <div className="relative mx-auto w-full max-w-5xl">
            <div className="hidden sm:block fixed top-1/2 left-6 -translate-y-1/2 z-50">
              <button
                type="button"
                className="btn btn-ghost rounded-full p-3 disabled:opacity-40"
                disabled={prevDisabled}
                onClick={() => setSlideIndex((idx) => Math.max(0, idx - 1))}
              >
                ‹
              </button>
            </div>
            <div
              className="overflow-hidden rounded-[30px] p-3 sm:p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <ReviewCard
                key={currentProblem.id}
                problem={currentProblem}
                onRate={onRate}
                onNotesChange={onNotesChange}
                onArchive={onArchive}
              />
            </div>
            <div className="hidden sm:block fixed top-1/2 right-6 -translate-y-1/2 z-50">
              <button
                type="button"
                className="btn btn-ghost rounded-full p-3 disabled:opacity-40"
                disabled={nextDisabled}
                onClick={() => setSlideIndex((idx) => Math.min(sortedDue.length - 1, idx + 1))}
              >
                ›
              </button>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-3 sm:hidden">
                <button
                  type="button"
                  className="btn btn-ghost rounded-full px-3 py-2 disabled:opacity-40"
                  disabled={prevDisabled}
                  onClick={() => setSlideIndex((idx) => Math.max(0, idx - 1))}
                  aria-label="Previous card"
                >
                  ‹
                </button>
                <div>{slideIndex + 1} / {sortedDue.length}</div>
                <button
                  type="button"
                  className="btn btn-ghost rounded-full px-3 py-2 disabled:opacity-40"
                  disabled={nextDisabled}
                  onClick={() => setSlideIndex((idx) => Math.min(sortedDue.length - 1, idx + 1))}
                  aria-label="Next card"
                >
                  ›
                </button>
              </div>
              <div className="hidden sm:block">{slideIndex + 1} / {sortedDue.length} review cards</div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-ghost rounded-full"
              >
                Exit review
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No review cards ready.</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-ghost rounded-full mt-4"
            >
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}