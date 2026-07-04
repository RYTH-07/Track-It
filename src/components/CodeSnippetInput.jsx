import React, { useMemo } from 'react'
import { Code2 } from 'lucide-react'
import { detectLanguage, LANGUAGE_LABELS } from '../lib/detectLanguage'

export default function CodeSnippetInput({ value, onChange, placeholder }) {
  const language = useMemo(() => detectLanguage(value), [value])

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color, #333)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5 text-xs"
        style={{ background: 'var(--bg-secondary, #1a1a1a)', color: 'var(--text-muted)' }}
      >
        <span className="flex items-center gap-1.5">
          <Code2 size={13} /> Code
        </span>
        <span
          className="px-2 py-0.5 rounded-full font-medium"
          style={{
            background: value.trim() ? 'rgba(139,92,246,0.15)' : 'transparent',
            color: value.trim() ? '#a78bfa' : 'var(--text-muted)',
          }}
        >
          {LANGUAGE_LABELS[language] || language}
        </span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Place your important syntaxes here...'}
        spellCheck={false}
        rows={8}
        className="w-full px-3 py-2 text-sm font-mono resize-y outline-none"
        style={{
          background: 'var(--bg-primary, #111)',
          color: 'var(--text-primary)',
          tabSize: 2,
        }}
        onKeyDown={e => {
          // Tab inserts spaces instead of moving focus
          if (e.key === 'Tab') {
            e.preventDefault()
            const { selectionStart, selectionEnd } = e.target
            const newValue = value.slice(0, selectionStart) + '  ' + value.slice(selectionEnd)
            onChange(newValue)
            requestAnimationFrame(() => {
              e.target.selectionStart = e.target.selectionEnd = selectionStart + 2
            })
          }
        }}
      />
    </div>
  )
}