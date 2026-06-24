import React, { useState, useMemo } from 'react'
import { BookOpen, Search, ExternalLink, Trash2, ChevronDown } from 'lucide-react'
import TopicTag from '../components/TopicTag.jsx'
import { masteryColor, masteryLabel, isOverdue, isDue, today } from '../lib/helpers.js'
import Modal from '../components/Modal.jsx'
import toast from 'react-hot-toast'

export default function Problems({ problems, onDelete }) {
  const [search, setSearch]     = useState('')
  const [filterTopic, setFTopic]= useState('All')
  const [filterDiff, setFDiff]  = useState('All')
  const [filterStatus, setFStat]= useState('All')
  const [deleteId, setDeleteId] = useState(null)

  const allTopics = useMemo(() => {
    const s = new Set()
    problems.forEach(p => (p.topics || []).forEach(t => s.add(t)))
    return ['All', ...Array.from(s).sort()]
  }, [problems])

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q || p.title?.toLowerCase().includes(q) ||
        (p.topics || []).some(t => t.toLowerCase().includes(q)) ||
        p.notes?.toLowerCase().includes(q)
      const matchTopic = filterTopic === 'All' || (p.topics || []).includes(filterTopic)
      const matchDiff  = filterDiff  === 'All' || p.difficulty?.toLowerCase() === filterDiff.toLowerCase()
      const matchStat  = filterStatus === 'All' ||
        (filterStatus === 'Due'      && isDue(p.next_review)) ||
        (filterStatus === 'Overdue'  && isOverdue(p.next_review)) ||
        (filterStatus === 'Mastered' && p.mastery === 'master')
      return matchSearch && matchTopic && matchDiff && matchStat
    })
  }, [problems, search, filterTopic, filterDiff, filterStatus])

  const confirmDelete = async () => {
    if (!deleteId) return
    await onDelete(deleteId)
    toast.success('Problem deleted')
    setDeleteId(null)
  }

  const diffClass = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BookOpen size={20} className="text-violet-400" /> All Problems
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{filtered.length} of {problems.length} problems</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-8 text-sm"
            placeholder="Search by title, topic, notes..."
          />
        </div>
        <select value={filterTopic} onChange={e => setFTopic(e.target.value)} className="input w-auto text-sm">
          {allTopics.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterDiff} onChange={e => setFDiff(e.target.value)} className="input w-auto text-sm">
          {['All', 'Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFStat(e.target.value)} className="input w-auto text-sm">
          {['All', 'Due', 'Overdue', 'Mastered'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No problems found. Try adjusting your filters or{' '}
            <a href="/log" style={{ color: 'var(--accent)' }}>log a new problem</a>.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const due = isDue(p.next_review)
            const overdue = isOverdue(p.next_review)
            return (
              <div key={p.id} className={`card p-4 flex items-start gap-3 ${overdue ? 'overdue-card' : ''}`}>
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge ${diffClass[p.difficulty?.toLowerCase()] || 'badge-medium'}`}>
                      {p.difficulty || 'Medium'}
                    </span>
                    <span className="text-xs font-mono" style={{ color: masteryColor(p.mastery) }}>
                      {masteryLabel(p.mastery)}
                    </span>
                    {overdue && <span className="badge" style={{ background: 'rgba(234,179,8,0.15)', color: '#FDE047', border: '1px solid rgba(234,179,8,0.3)' }}>Overdue</span>}
                    {due && !overdue && <span className="badge" style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>Due</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {(p.topics || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.topics.map(t => <TopicTag key={t} label={t} />)}
                    </div>
                  )}
                  {p.notes && (
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.notes}</p>
                  )}
                </div>
                {/* Right */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                    Next: {p.next_review}
                  </span>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="btn btn-danger px-2 py-1"
                    aria-label="Delete problem"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Problem?" maxWidth={360}>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          This will permanently remove the problem and all its history.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn btn-ghost">Cancel</button>
          <button onClick={confirmDelete} className="btn btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
