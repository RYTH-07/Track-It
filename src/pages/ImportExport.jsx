import React, { useState, useRef } from 'react'
import { Download, Upload, FileJson, FileText, CheckCircle, XCircle } from 'lucide-react'
import { problemsToCSV, downloadFile, today } from '../lib/helpers.js'
import toast from 'react-hot-toast'

export default function ImportExport({ problems, onImport }) {
  const [importing, setImporting]   = useState(false)
  const [dragOver, setDragOver]     = useState(false)
  const [result, setResult]         = useState(null) // { imported, skipped }
  const fileRef = useRef(null)

  // ─── Export ─────────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const data = problems.map(({ id, user_id, ...rest }) => rest)
    downloadFile(JSON.stringify(data, null, 2), `trackit-export-${today()}.json`, 'application/json')
    toast.success('Exported as JSON')
  }

  const exportCSV = () => {
    const csv = problemsToCSV(problems)
    downloadFile(csv, `trackit-export-${today()}.csv`, 'text/csv')
    toast.success('Exported as CSV')
  }

  // ─── Import ─────────────────────────────────────────────────────────────────
  const processFile = async (file) => {
    if (!file || !file.name.endsWith('.json')) {
      toast.error('Please select a valid .json file')
      return
    }
    setImporting(true); setResult(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const arr = Array.isArray(parsed) ? parsed : parsed.problems || Object.values(parsed)
      if (!arr.length) { toast.error('No problems found in file'); setImporting(false); return }
      const { imported, skipped, error } = await onImport(arr)
      if (error) { toast.error(error.message); setImporting(false); return }
      setResult({ imported, skipped })
      toast.success(`Imported ${imported} problems (${skipped} skipped)`)
    } catch (e) {
      toast.error('Failed to parse JSON: ' + e.message)
    }
    setImporting(false)
  }

  const handleFileInput = (e) => { processFile(e.target.files[0]); e.target.value = '' }
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Download size={20} className="text-violet-400" /> Import / Export
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Back up your data or move it between accounts
        </p>
      </div>

      {/* Export */}
      <div className="card p-5">
        <div className="section-header">Export Data</div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Download all your problems — {problems.length} total
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportJSON} className="btn btn-primary gap-2">
            <FileJson size={15} /> Export JSON
          </button>
          <button onClick={exportCSV} className="btn btn-ghost gap-2">
            <FileText size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="card p-5">
        <div className="section-header">Import Data</div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Import from a JSON file. Duplicates (matched by title) will be skipped.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200"
          style={{
            borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
            background: dragOver ? 'rgba(124,58,237,0.08)' : 'var(--bg-tertiary)',
          }}
        >
          <Upload size={28} className="mx-auto mb-3" style={{ color: dragOver ? 'var(--accent)' : 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {importing ? 'Importing...' : 'Drop a JSON file here or click to browse'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Supports native Track-It export format
          </p>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileInput} />
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 rounded-lg p-3 flex items-start gap-3"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#4ADE80' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#4ADE80' }}>Import complete</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {result.imported} problems imported · {result.skipped} duplicates skipped
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Format reference */}
      <div className="card p-4">
        <div className="section-header">JSON Format Reference</div>
        <pre className="text-xs overflow-x-auto rounded p-3" style={{ background: 'var(--bg-tertiary)', color: '#A78BFA', fontFamily: 'JetBrains Mono,monospace', lineHeight: 1.6 }}>
{`[
  {
    "title": "Two Sum",
    "url": "https://leetcode.com/problems/two-sum/",
    "topics": ["arrays", "hash map"],
    "companies": ["Google", "Amazon"],
    "difficulty": "easy",
    "notes": "Use a hash map for O(n)",
    "mastery": "good",
    "next_review": "2025-01-15",
    "review_count": 3
  }
]`}
        </pre>
      </div>
    </div>
  )
}
