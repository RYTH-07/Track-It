import React, { useState } from 'react'
import { GraduationCap, Link, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import TopicInput from '../components/TopicInput.jsx'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function TeacherAssign({ allAssignments = [], loading, onCreate, professorEmail }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [topics, setTopics] = useState([])
  const [difficulty, setDiff] = useState('Medium')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Problem title is required'); return }
    setSubmitting(true)
    const { error } = await onCreate({
      title, url, topics,
      difficulty: difficulty.toLowerCase(),
      notes,
      createdByEmail: professorEmail,
    })
    setSubmitting(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Assigned to the whole class 🎯')
      setTitle(''); setUrl(''); setTopics([]); setNotes(''); setDiff('Medium')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <GraduationCap size={20} style={{ color: 'var(--accent)' }} /> Assign a Problem
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Assigns to every current student in the class
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label" htmlFor="a-title">Problem Title *</label>
          <input
            id="a-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder="e.g. Two Sum"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="a-url">URL (Optional)</label>
          <div className="relative">
            <Link size={14} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              id="a-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input pl-20"
              placeholder="https://leetcode.com/problems/..."
            />
          </div>
        </div>

        <div>
          <label className="label">Topics</label>
          <TopicInput topics={topics} onChange={setTopics} placeholder="Type a topic, press Enter or comma..." />
        </div>

        <div>
          <label className="label">Difficulty</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={`btn flex-1 text-sm ${
                  d === 'Easy'   ? 'btn-good'   :
                  d === 'Medium' ? 'btn-hard'   :
                  'btn-again'
                } ${difficulty === d ? 'ring-2 ring-white/20' : 'opacity-50'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="a-notes">Notes for students (Optional)</label>
          <textarea
            id="a-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input"
            rows={3}
            placeholder="Hints, focus area, deadline..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Assigning...' : '📋 Assign to Class'}
          {!submitting && <ChevronRight size={15} />}
        </button>
      </form>

      <div>
        <div className="section-header mb-3">Past Assignments</div>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : allAssignments.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No assignments yet.</p>
        ) : (
          <div className="space-y-2">
            {allAssignments.map(a => {
              const progress = a.assignment_progress || []
              const doneCount = progress.filter(p => p.status === 'completed').length
              const expanded = expandedId === a.id
              return (
                <div key={a.id} className="card p-4">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : a.id)}
                    className="w-full flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {doneCount}/{progress.length} completed · assigned {a.assigned_date}
                      </p>
                    </div>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expanded && (
                    <div className="mt-3 pt-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                      {progress.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>{p.student_name}</span>
                          <span style={{ color: p.status === 'completed' ? '#4ADE80' : '#FDE047' }}>
                            {p.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
