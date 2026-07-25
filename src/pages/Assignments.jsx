import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ExternalLink, CheckCircle2, Clock } from 'lucide-react'
import TopicTag from '../components/TopicTag.jsx'

export default function Assignments({ myAssignments = [], loading }) {
  const navigate = useNavigate()

  const pending = myAssignments.filter(a => a.status === 'pending')
  const completed = myAssignments.filter(a => a.status === 'completed')

  const solveAssignment = (progressRow) => {
    const a = progressRow.assignments
    if (!a) return
    const params = new URLSearchParams({
      assignment: progressRow.id,
      title: a.title || '',
      url: a.url || '',
      difficulty: a.difficulty || 'medium',
      topics: (a.topics || []).join(','),
    })
    navigate(`/log?${params.toString()}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <ClipboardList size={20} style={{ color: 'var(--accent)' }} /> Assigned by Professor
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {pending.length} pending · {completed.length} completed
        </p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : myAssignments.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nothing assigned yet. Check back after your next class.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <div className="section-header">Pending</div>
              {pending.map(row => (
                <AssignmentCard key={row.id} row={row} onSolve={() => solveAssignment(row)} />
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2 mt-6">
              <div className="section-header">Completed</div>
              {completed.map(row => (
                <AssignmentCard key={row.id} row={row} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AssignmentCard({ row, onSolve }) {
  const a = row.assignments
  if (!a) return null
  const isDone = row.status === 'completed'
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = !isDone && a.due_date && a.due_date < today

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`badge ${
            a.difficulty === 'easy' ? 'badge-easy' : a.difficulty === 'hard' ? 'badge-hard' : 'badge-medium'
          }`}>
            {a.difficulty || 'medium'}
          </span>
          {isDone ? (
            <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.3)' }}>
              <CheckCircle2 size={11} className="inline mr-1" />Completed
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(234,179,8,0.15)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.3)' }}>
              <Clock size={11} className="inline mr-1" />Pending
            </span>
          )}
          {isOverdue && (
            <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              Overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
          {a.url && (
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
              <ExternalLink size={12} />
            </a>
          )}
        </div>
        {a.due_date && (
          <p className="text-xs mt-0.5" style={{ color: isOverdue ? '#F87171' : 'var(--text-muted)' }}>
            Due {a.due_date}
          </p>
        )}
        {(a.topics || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {a.topics.map(t => <TopicTag key={t} label={t} />)}
          </div>
        )}
        {a.notes && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{a.notes}</p>
        )}
      </div>
      {!isDone && (
        <button
          type="button"
          onClick={isOverdue ? undefined : onSolve}
          disabled={isOverdue}
          className="btn btn-primary btn-sm shrink-0"
          style={isOverdue ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          title={isOverdue ? 'The due date has passed' : undefined}
        >
          {isOverdue ? 'Deadline passed' : 'Solve'}
        </button>
      )}
    </div>
  )
} 