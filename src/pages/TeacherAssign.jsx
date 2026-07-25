import React, { useState } from 'react'
import { GraduationCap, Link, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import TopicInput from '../components/TopicInput.jsx'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const MAX_RANGE_SIZE = 500 // safety cap so a typo can't silently generate thousands of entries

// Expands one entry into one or more targeting strings. Supports:
//   "25108"                    -> ["25108"]
//   "25101-25120"              -> ["25101", "25102", ..., "25120"]
//   "u4cse25101-25120"         -> ["u4cse25101", ..., "u4cse25120"] (prefix from the left side reused)
//   "u4cse25101-u4cse25120"    -> same as above
//   "someone@ch.students.amrita.edu" -> left untouched (no trailing digits to range against)
function expandTargetEntry(raw) {
  const entry = raw.trim()
  if (!entry.includes('-')) return [entry]

  const [left, right] = entry.split('-').map(s => s.trim())
  if (!left || !right) return [entry]

  const leftMatch = left.match(/^(.*?)(\d+)$/)
  const rightMatch = right.match(/^(.*?)(\d+)$/)
  if (!leftMatch || !rightMatch) return [entry] // not a numeric range, treat literally

  const prefix = leftMatch[1]
  const startStr = leftMatch[2]
  const start = parseInt(startStr, 10)
  const end = parseInt(rightMatch[2], 10)
  const width = startStr.length

  if (isNaN(start) || isNaN(end) || end < start) return [entry]
  if (end - start + 1 > MAX_RANGE_SIZE) return [entry] // refuse to silently explode a typo'd range

  const results = []
  for (let n = start; n <= end; n++) {
    results.push(prefix + String(n).padStart(width, '0'))
  }
  return results
}

function parseTargetInput(input) {
  return input
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)
    .flatMap(expandTargetEntry)
}

export default function TeacherAssign({ allAssignments = [], loading, onCreate, onUpdateDueDate, professorEmail }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [topics, setTopics] = useState([])
  const [difficulty, setDiff] = useState('Medium')
  const [notes, setNotes] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [dueDateEdits, setDueDateEdits] = useState({}) // assignmentId -> in-progress edit value
  const [savingDueDate, setSavingDueDate] = useState(null) // assignmentId currently saving

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Problem title is required'); return }
    setSubmitting(true)
    const targetEmails = parseTargetInput(targetInput)
    const { error } = await onCreate({
      title, url, topics,
      difficulty: difficulty.toLowerCase(),
      notes,
      targetEmails: targetEmails.length ? targetEmails : null,
      dueDate: dueDate || null,
      createdByEmail: professorEmail,
    })
    setSubmitting(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(targetEmails.length ? `Assigned to ${targetEmails.length} student(s) 🎯` : 'Assigned to the whole class 🎯')
      setTitle(''); setUrl(''); setTopics([]); setNotes(''); setDiff('Medium'); setTargetInput(''); setDueDate('')
    }
  }

  const handleSaveDueDate = async (assignmentId) => {
    setSavingDueDate(assignmentId)
    const value = dueDateEdits[assignmentId] ?? ''
    const { error } = await onUpdateDueDate(assignmentId, value || null)
    setSavingDueDate(null)
    if (error) toast.error(error.message)
    else toast.success(value ? 'Due date updated' : 'Due date cleared')
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

        <div>
          <label className="label" htmlFor="a-targets">Only for these students (Optional)</label>
          <textarea
            id="a-targets"
            value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
            className="input"
            rows={3}
            placeholder={"Leave blank to assign to the whole class.\nRanges work too, one per line or comma-separated:\n25101-25120\nu4cse25101-25120\nu4cse25201-25230"}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Matches against each student's email. Accepts a roll number, a full email, or a range like 25101-25120 — mix multiple ranges/emails separated by commas or new lines.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="a-due">Due Date (Optional)</label>
          <input
            id="a-due"
            type="date"
            value={dueDate}
            min={today}
            onChange={e => setDueDate(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Assigning...' : '📋 Assign'}
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
              const isOverdue = a.due_date && a.due_date < today && doneCount < progress.length
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
                        {a.target_emails?.length ? ` · targeted (${a.target_emails.length})` : ' · whole class'}
                        {a.due_date && (
                          <span style={{ color: isOverdue ? '#F87171' : 'var(--text-muted)' }}>
                            {' · due '}{a.due_date}{isOverdue ? ' (overdue)' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expanded && (
                    <div className="mt-3 pt-3 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <label className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>Due date:</label>
                        <input
                          type="date"
                          value={dueDateEdits[a.id] ?? a.due_date ?? ''}
                          onChange={e => setDueDateEdits(prev => ({ ...prev, [a.id]: e.target.value }))}
                          className="input py-1 text-xs"
                          style={{ maxWidth: '160px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveDueDate(a.id)}
                          disabled={savingDueDate === a.id}
                          className="btn btn-ghost px-2 py-1 text-xs shrink-0"
                        >
                          {savingDueDate === a.id ? '...' : 'Save'}
                        </button>
                      </div>
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
