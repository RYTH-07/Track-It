import React, { useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherProgress({ allAssignments = [], loading, onUpdateDueDate }) {
  const [expandedId, setExpandedId] = useState(null)
  const [dueDateEdits, setDueDateEdits] = useState({}) // assignmentId -> in-progress edit value
  const [savingDueDate, setSavingDueDate] = useState(null) // assignmentId currently saving

  const today = new Date().toISOString().split('T')[0]

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
          <ClipboardList size={20} style={{ color: 'var(--accent)' }} /> Past Assignments
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Track completion and manage due dates
        </p>
      </div>

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
  )
}
