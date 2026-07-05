import React, { useState, useMemo, useEffect} from 'react'
import { Tag, Plus, Trash2 } from 'lucide-react'
import { isDue } from '../lib/helpers.js'
import Modal from '../components/Modal.jsx'
import toast from 'react-hot-toast'

export default function Topics({ problems, notebooks, onUpsertNotebook, onDeleteNotebook, onAchievementCheck }) {
  const [newTopicModal, setNewTopicModal] = useState(false)
  const [newTopicName, setNewTopicName]   = useState('')
  const [saving, setSaving]              = useState(null) // topic being saved
  const [deleteModal, setDeleteModal] = useState(false)
const [selectedNotebook, setSelectedNotebook] = useState(null)
const [deleting, setDeleting] = useState(false)

  // Topic distribution
  const topicStats = useMemo(() => {
    const map = {}
    for (const p of problems) {
      for (const t of (p.topics || [])) {
        if (!map[t]) map[t] = { total: 0, due: 0 }
        map[t].total++
        if (isDue(p.next_review)) map[t].due++
      }
    }
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total)
  }, [problems])

  const maxCount = topicStats[0]?.[1]?.total || 1

  const handleAddNotebook = async () => {
    const name = newTopicName.trim().toLowerCase()
    if (!name) return
    const exists = notebooks.find(n => n.topic_name === name)
    if (exists) { toast('Notebook already exists for this topic'); setNewTopicModal(false); return }
    await onUpsertNotebook(name, '')
    await onAchievementCheck?.()
    toast.success(`Notebook created for "${name}"`)
    setNewTopicName('')
    setNewTopicModal(false)
  }

  const handleNotebookBlur = async (topicName, value) => {
    setSaving(topicName)
    await onUpsertNotebook(topicName, value)
    setSaving(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Tag size={20} className="text-violet-400" /> Topics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Distribution of your logged problems</p>
        </div>
        <button onClick={() => setNewTopicModal(true)} className="btn btn-primary text-sm">
          <Plus size={14} /> Add Topic Notebook
        </button>
      </div>

      {/* Distribution + SR Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="card p-4">
          <div className="section-header">Topic Distribution</div>
          {topicStats.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No topics yet.</p>
          ) : (
            <div className="space-y-2">
              {topicStats.map(([topic, s]) => (
                <div key={topic}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono,monospace' }}>
                    <span className="capitalize truncate">{topic}</span>
                    <span>{s.total}</span>
                  </div>
                  <div className="progress-track" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${(s.total / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SR Status */}
        <div className="card p-4">
          <div className="section-header">SR Status by Topic</div>
          {topicStats.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topicStats.map(([topic, s]) => (
                <div key={topic} className="flex items-center justify-between text-xs gap-2">
                  <span className="capitalize truncate" style={{ color: 'var(--text-primary)' }}>{topic}</span>
                  <div className="flex gap-2 shrink-0">
                    <span style={{ color: '#A78BFA', fontFamily: 'JetBrains Mono,monospace' }}>{s.total} total</span>
                    {s.due > 0 && <span style={{ color: '#FDE047', fontFamily: 'JetBrains Mono,monospace' }}>{s.due} due</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Master Notebook */}
      <div className="card p-4">
        <div className="section-header">Master Notebook</div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Foundational rules, templates and theory — one notebook per topic
        </p>
        {notebooks.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No notebooks yet — click "+ Add Topic Notebook" to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {notebooks.map(nb => (
              <div key={nb.id} className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm capitalize" style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono,monospace' }}>
                    📓 {nb.topic_name}
                  </span>
                  <div className="flex items-center gap-2">
                    {saving === nb.topic_name && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>saving...</span>
                    )}
                   <button
  onClick={() => {
    setSelectedNotebook(nb)
    setDeleteModal(true)
  }}
  className="btn btn-danger px-2 py-1"
>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <textarea
                  defaultValue={nb.theory || ''}
                  onBlur={e => handleNotebookBlur(nb.topic_name, e.target.value)}
                  placeholder="Write foundational rules, templates, theory for this topic..."
                  rows={4}
                  className="input resize-y text-sm w-full"
                  style={{ fontFamily: 'Inter,sans-serif' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Last updated: {new Date(nb.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New notebook modal */}
      <Modal open={newTopicModal} onClose={() => setNewTopicModal(false)} title="New Topic Notebook" maxWidth={360}>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="nb-topic">Topic Name</label>
            <input
              id="nb-topic"
              type="text"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              className="input"
              placeholder="e.g. dynamic programming"
              onKeyDown={e => { if (e.key === 'Enter') handleAddNotebook() }}
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setNewTopicModal(false)} className="btn btn-ghost">Cancel</button>
            <button onClick={handleAddNotebook} disabled={!newTopicName.trim()} className="btn btn-primary">Create</button>
          </div>
        </div>
      </Modal>
      <Modal
  open={deleteModal}
  onClose={() => {
    if (!deleting) {
      setDeleteModal(false)
      setSelectedNotebook(null)
    }
  }}
  title="Delete Notebook"
  maxWidth={420}
>
  <div className="space-y-5">

    <div className="flex items-center gap-4">

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(239,68,68,.12)",
          color: "#ef4444"
        }}
      >
        🗑️
      </div>

      <div>

        <h3
          className="font-semibold text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          Delete Notebook?
        </h3>

        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong>{selectedNotebook?.topic_name}</strong> will be permanently
          deleted.

          <br /><br />

          This action cannot be undone.
        </p>

      </div>

    </div>

    <div className="flex justify-end gap-3">

      <button
        className="btn btn-ghost"
        disabled={deleting}
        onClick={() => {
          setDeleteModal(false)
          setSelectedNotebook(null)
        }}
      >
        Cancel
      </button>

      <button
        className="btn btn-danger"
        disabled={deleting}
        onClick={async () => {

          setDeleting(true)

          await onDeleteNotebook(selectedNotebook.id)

          toast.success("Notebook deleted")

          setDeleting(false)

          setDeleteModal(false)

          setSelectedNotebook(null)

        }}
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>

    </div>

  </div>
</Modal>
    </div>
  )
}
