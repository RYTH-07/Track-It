import React, { useState } from 'react'
import { Plus, Link, ChevronRight } from 'lucide-react'
import TopicInput from '../components/TopicInput.jsx'
import CodeSnippetInput from '../components/CodeSnippetInput.jsx'
import MarkdownEditor from '../components/MarkdownEditor.jsx'
import { detectLanguage } from '../lib/detectLanguage.js'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const CONFIDENCE_OPTIONS = [
  { value: 'again', label: "Couldn't solve it (Again)" },
  { value: 'hard',  label: 'Solved with hints (Hard)' },
  { value: 'good',  label: 'Solved cleanly (Good)' },
  { value: 'master',label: 'Solved perfectly (Master)' },
]

export default function LogProblem({ onAdd, notebooks = [] }) {
  const [title, setTitle]       = useState('')
  const [url, setUrl]           = useState('')
  const [topics, setTopics]     = useState([])
  const [difficulty, setDiff]   = useState('Medium')
  const [notes, setNotes]       = useState('')
  const [code, setCode]         = useState('')
  const [confidence, setConf]   = useState('good')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Problem title is required'); return }
    setLoading(true)
    const { error } = await onAdd({
      title, url, topics,
      difficulty: difficulty.toLowerCase(),
      notes,
      code,
      codeLanguage: detectLanguage(code),
      initialConfidence: confidence,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Problem logged! 🎯')
      setTitle(''); setUrl(''); setTopics([]); setNotes(''); setCode(''); setDiff('Medium'); setConf('good')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Plus size={20} style={{ color: 'var(--accent)' }} /> Log a Problem
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Add to your matrix — SR scheduling starts immediately
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="label" htmlFor="prob-title">Problem Title *</label>
          <input
            id="prob-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder="e.g. Two Sum"
            required
          />
        </div>

        {/* URL */}
        <div>
          <label className="label" htmlFor="prob-url">URL (Optional)</label>
          <div className="relative">
            <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              id="prob-url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input pl-8"
              placeholder="https://leetcode.com/problems/..."
            />
          </div>
        </div>

        {/* Topics */}
        <div>
          <label className="label">Topics</label>
          <select
            className="input"
            onChange={(e) => {
              if (e.target.value && !topics.includes(e.target.value)) {
                setTopics([...topics, e.target.value]);
              }
            }}
          >
            <option value="">Select Topic</option>
            {notebooks?.map((n) => (
              <option key={n.id} value={n.topic_name}>
                {n.topic_name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2 mt-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 rounded bg-violet-600 text-white text-xs cursor-pointer"
                onClick={() => setTopics(topics.filter((t) => t !== topic))}
              >
                {topic} ✕
              </span>
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Select a topic from the dropdown to tag this problem
          </p>
        </div>

        {/* Difficulty */}
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

        {/* Code snippet — auto language detection */}
        <div>
          <label className="label">IMPORTANT SYNTAXES</label>
          <CodeSnippetInput value={code} onChange={setCode} />
        </div>

        {/* Notes — markdown editor with write/preview */}
        <div>
          <label className="label" htmlFor="prob-notes">Notes / Key Patterns</label>
          <MarkdownEditor
            value={notes}
            onChange={setNotes}
            placeholder="Edge cases, approach, traps, time complexity..."
          />
        </div>

        {/* Initial confidence */}
        <div>
          <label className="label" htmlFor="prob-confidence">Initial Confidence</label>
          <select
            id="prob-confidence"
            value={confidence}
            onChange={e => setConf(e.target.value)}
            className="input"
          >
            {CONFIDENCE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="btn btn-primary w-full"
        >
          {loading ? 'Logging...' : '⚡ Inject to Matrix'}
          {!loading && <ChevronRight size={15} />}
        </button>
      </form>
    </div>
  )
}