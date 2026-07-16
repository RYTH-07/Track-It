import React, { useState, useMemo } from 'react'
import { BookOpen, Search, ExternalLink, Trash2, Pencil, Archive as ArchiveIcon } from 'lucide-react'
import TopicTag from '../components/TopicTag.jsx'
import TopicInput from '../components/TopicInput.jsx'
import CodeSnippetInput from '../components/CodeSnippetInput.jsx'
import MarkdownEditor from '../components/MarkdownEditor.jsx'
import { detectLanguage } from '../lib/detectLanguage.js'
import { masteryColor, masteryLabel, isOverdue, isDue, today } from '../lib/helpers.js'
import Modal from '../components/Modal.jsx'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function Problems({ problems, onDelete, onUpdate, onArchive, onUnarchive }) {
  const [search, setSearch]     = useState('')
  const [filterTopic, setFTopic]= useState('All')
  const [filterDiff, setFDiff]  = useState('All')
  const [filterStatus, setFStat]= useState('All')
  const [filterView, setFilterView] = useState('Active')
  const [deleteId, setDeleteId] = useState(null)
  const [editProblem, setEditProblem] = useState(null)

  const allTopics = useMemo(() => {
    const s = new Set()
    problems.forEach(p => (p.topics || []).forEach(t => s.add(t)))
    return ['All', ...Array.from(s).sort()]
  }, [problems])

  const filtered = useMemo(() => {
    return problems.filter(p => {
      const archived = !!p.archived
      const viewMatch = filterView === 'All' || (filterView === 'Archived' ? archived : !archived)
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
      return viewMatch && matchSearch && matchTopic && matchDiff && matchStat
    })
  }, [problems, search, filterTopic, filterDiff, filterStatus, filterView])

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
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="relative flex-1 min-w-[280px]">
  <Search
    size={18}
    strokeWidth={2}
    className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
    style={{ color: "var(--text-muted)" }}
  />

  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by title, topic or notes..."
    className="input h-[52px] w-full pl-10 pr-4 text-sm"
  />
</div>
       <div className="filters-row">
  <div className="filter-group">
    <label className="filter-label">View</label>
    <select value={filterView} onChange={(e) => setFilterView(e.target.value)} className="filter-select">
      {['Active', 'Archived', 'All'].map((v) => <option key={v}>{v}</option>)}
    </select>
  </div>

  <div className="filter-group">
    <label className="filter-label">Topic</label>
    <select
      value={filterTopic}
      onChange={(e) => setFTopic(e.target.value)}
      className="filter-select"
    >
      {allTopics.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>
  </div>

  <div className="filter-group">
    <label className="filter-label">Difficulty</label>
    <select
      value={filterDiff}
      onChange={(e) => setFDiff(e.target.value)}
      className="filter-select"
    >
      {["All", "Easy", "Medium", "Hard"].map((d) => (
        <option key={d}>{d}</option>
      ))}
    </select>
  </div>

  <div className="filter-group">
    <label className="filter-label">Status</label>
    <select
      value={filterStatus}
      onChange={(e) => setFStat(e.target.value)}
      className="filter-select"
    >
      {["All", "Due", "Overdue", "Mastered"].map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  </div>
</div>
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
              <div key={p.id} className={`card p-4 flex items-start gap-3 ${overdue ? 'overdue-card' : ''}`} style={{ opacity: p.archived ? 0.7 : 1 }}>
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
                    {p.archived && <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Archived</span>}
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

                <div className="flex flex-col items-end gap-2">
                  {p.archived ? (
                    <button
                      type="button"
                      onClick={() => onUnarchive?.(p.id)}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      <RotateCcw size={12} /> Unarchive
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onArchive?.(p.id)
                        toast.success('Problem archived')
                      }}
                      className="btn btn-ghost btn-sm gap-1"
                    >
                      <ArchiveIcon size={12} /> Archive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditProblem(p)}
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(p.id)}
                    className="btn btn-primary btn-sm gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete problem">
        <div className="space-y-4">
          <p>Are you sure you want to delete this problem? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteId(null)} className="btn btn-ghost">Cancel</button>
            <button onClick={confirmDelete} className="btn btn-primary">Delete</button>
          </div>
        </div>
      </Modal>
      <EditProblemModal
        problem={editProblem}
        onClose={() => setEditProblem(null)}
        onSave={onUpdate}
      />
    </div>
  )
}
function EditProblemModal({ problem, onClose, onSave }) {
  const [title, setTitle]     = useState('')
  const [url, setUrl]         = useState('')
  const [topics, setTopics]   = useState([])
  const [difficulty, setDiff] = useState('Medium')
  const [notes, setNotes]     = useState('')
  const [code, setCode]       = useState('')
  const [saving, setSaving]   = useState(false)

  React.useEffect(() => {
    if (problem) {
      setTitle(problem.title || '')
      setUrl(problem.url || '')
      setTopics(problem.topics || [])
      setDiff(problem.difficulty ? problem.difficulty[0].toUpperCase() + problem.difficulty.slice(1) : 'Medium')
      setNotes(problem.notes || '')
      setCode(problem.code || '')
    }
  }, [problem])

  if (!problem) return null

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Problem title is required'); return }
    setSaving(true)
    const { error } = await onSave(problem.id, {
      title,
      url: url?.trim() || null,
      topics,
      difficulty: difficulty.toLowerCase(),
      notes,
      code,
      code_language: detectLanguage(code),
    })
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Problem updated')
      onClose()
    }
  }

  return (
    <Modal open={!!problem} onClose={onClose} title="Edit Problem">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="edit-title">Problem Title *</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="edit-url">URL</label>
          <input
            id="edit-url"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="input"
          />
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
          <label className="label">Important Syntaxes</label>
          <CodeSnippetInput value={code} onChange={setCode} />
        </div>

        <div>
          <label className="label" htmlFor="edit-notes">Notes / Key Patterns</label>
          <MarkdownEditor value={notes} onChange={setNotes} placeholder="Edge cases, approach, traps..." />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}