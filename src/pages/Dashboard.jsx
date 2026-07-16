import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, CheckCircle2, Target, CircleCheckBig } from 'lucide-react'
import ProgressBar from '../components/ProgressBar.jsx'
import Modal from '../components/Modal.jsx'
import TopicChips from '../components/TopicChips.jsx'
import { getWeakTopic } from '../lib/helpers.js'

export default function Dashboard({ problems, dueProblems, stats, onUpdateGoal, selectedTopics = [], onSelectTopic, onStartTopicSession }) {
  const navigate = useNavigate()
  const [goalModal, setGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState(stats?.weekly_goal || 5)
  const [submitting, setSubmitting] = useState(false)

  const weeklyGoal = stats?.weekly_goal || 5
  const weekCount = stats?.week_count || 0
  const goalPct = Math.min(100, Math.round((weekCount / weeklyGoal) * 100))
  const weakTopic = getWeakTopic(problems)
  const topicList = useMemo(() => {
    const map = {}
    for (const p of problems) {
      for (const t of (p.topics || [])) {
        if (!map[t]) map[t] = 0
        if (p.next_review <= new Date().toISOString().split('T')[0]) map[t] += 1
      }
    }
    return Object.keys(map).sort()
  }, [problems])

  const dueTopicCounts = useMemo(() => {
    const map = {}
    for (const p of problems) {
      if (p.next_review <= new Date().toISOString().split('T')[0]) {
        for (const t of (p.topics || [])) {
          map[t] = (map[t] || 0) + 1
        }
      }
    }
    return map
  }, [problems])

  const reviewSummary = useMemo(() => {
    const totalDue = dueProblems.length
    return { totalDue }
  }, [dueProblems])

  const handleStartReview = () => {
    navigate('/review')
  }

  const handleGoalSave = async () => {
    const val = parseInt(goalInput)
    if (!val || val < 1) return
    setSubmitting(true)
    await onUpdateGoal(val)
    setSubmitting(false)
    setGoalModal(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} /> Review Queue
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Cards due for spaced repetition today
          </p>
        </div>
        <span className="badge" style={{ background: dueProblems.length > 0 ? 'var(--accent-glow)' : 'rgba(34,197,94,0.15)', color: dueProblems.length > 0 ? 'var(--accent)' : '#4ADE80', border: `1px solid ${dueProblems.length > 0 ? 'var(--accent)' : 'rgba(34,197,94,0.3)'}`, fontSize: 13 }}>
          {dueProblems.length} due
        </span>
      </div>

      {/* Weekly goal */}
      <div className="card p-4">
        <div className="section-header">
          <Target size={12} /> Weekly Goal
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono,monospace' }}>
              <span>{weekCount} / {weeklyGoal} reviews this week</span>
              <span>{goalPct}%</span>
            </div>
            <ProgressBar pct={goalPct} />
          </div>
          <button onClick={() => { setGoalInput(weeklyGoal); setGoalModal(true) }}
            className="btn btn-ghost px-2 py-1.5 shrink-0" aria-label="Edit weekly goal">
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Weak topic focus */}
      {weakTopic && (
        <div className="rounded-lg p-3 flex items-center justify-between gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-center gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#F87171' }}>Focus Area</p>
              <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{weakTopic}</p>
            </div>
          </div>
          <button type="button" onClick={() => onStartTopicSession?.(weakTopic)} className="btn btn-ghost px-3 py-2 text-sm">
            Start focus session →
          </button>
        </div>
      )}

      {topicList.length > 0 && (
        <div className="card p-4 space-y-3">
          <div className="section-header">Topic filter</div>
          <TopicChips
            topics={topicList}
            selectedTopics={selectedTopics}
            onToggleTopic={(topic) => onSelectTopic?.(topic)}
            dueCounts={dueTopicCounts}
            totalDue={dueProblems.length}
          />
        </div>
      )}

      {dueProblems.length > 0 && (
        <div className="card-glass rounded-[28px] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>Ready to review</p>
              <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{dueProblems.length} cards due today</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Start a focused review session now.</p>
            </div>

            <button
              type="button"
              onClick={handleStartReview}
              className="btn btn-primary rounded-3xl px-5 py-3 text-sm"
            >
              Start review
            </button>
          </div>
        </div>
      )}

      {/* Review cards or empty state */}
      {dueProblems.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-xl" style={{ border: '1px solid var(--border)', background: 'var(--accent-glow)' }}>
              <CircleCheckBig
                size={30}
                style={{ color: 'var(--accent)' }}
                strokeWidth={1.8}
              />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>You're all caught up!</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No reviews due right now.{' '}
            <a href="/log"
              onClick={e => { e.preventDefault(); navigate('/log') }}
              style={{ color: 'var(--accent)' }}
            >
              Log new problems
            </a>{' '}to keep the streak going.
          </p>
        </div>
      ) : null}

      {/* Weekly goal modal */}
      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="Set Weekly Goal" maxWidth={360}>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="goal-input">Reviews per week</label>
            <input
              id="goal-input"
              type="number"
              min={1}
              max={200}
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              className="input"
              onKeyDown={e => { if (e.key === 'Enter') handleGoalSave() }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setGoalModal(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={handleGoalSave} disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}