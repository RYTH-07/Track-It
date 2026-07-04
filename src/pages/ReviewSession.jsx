import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewCard from '../components/ReviewCard.jsx'

export default function ReviewSession({ dueProblems, onRate, onNotesChange }) {
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative min-h-screen flex flex-col justify-center px-4 py-8 sm:px-10">
        {currentProblem ? (
          <div className="relative mx-auto w-full max-w-5xl">
            <div className="fixed top-1/2 left-6 -translate-y-1/2 z-50">
              <button
                type="button"
                className="btn btn-ghost rounded-full p-3 disabled:opacity-40"
                disabled={prevDisabled}
                onClick={() => setSlideIndex((idx) => Math.max(0, idx - 1))}
              >
                ‹
              </button>
            </div>
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.9)]">
              <ReviewCard
                key={currentProblem.id}
                problem={currentProblem}
                onRate={onRate}
                onNotesChange={onNotesChange}
              />
            </div>
            <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50">
              <button
                type="button"
                className="btn btn-ghost rounded-full p-3 disabled:opacity-40"
                disabled={nextDisabled}
                onClick={() => setSlideIndex((idx) => Math.min(sortedDue.length - 1, idx + 1))}
              >
                ›
              </button>
            </div>
            <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
              <div>{slideIndex + 1} / {sortedDue.length} review cards</div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                Exit review
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold">No review cards ready.</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}