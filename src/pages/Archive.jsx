import React from 'react'
import { Archive as ArchiveIcon, RotateCcw } from 'lucide-react'
import TopicTag from '../components/TopicTag.jsx'
import { masteryColor, masteryLabel } from '../lib/helpers.js'

export default function Archive({ problems, onRestore }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <ArchiveIcon size={20} className="text-violet-400" /> Archive
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {problems.length} archived problem{problems.length === 1 ? '' : 's'}
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Archived problems will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {problems.map(p => (
            <div key={p.id} className="card p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="badge badge-medium">{p.difficulty || 'Medium'}</span>
                  <span className="text-xs font-mono" style={{ color: masteryColor(p.mastery) }}>
                    {masteryLabel(p.mastery)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                </div>
                {(p.topics || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.topics.map(t => <TopicTag key={t} label={t} />)}
                  </div>
                )}
                {(p.companies || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.companies.map(c => <TopicTag key={c} label={c} variant="company" />)}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRestore?.(p.id)}
                className="btn btn-ghost btn-sm gap-1"
              >
                <RotateCcw size={12} /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
