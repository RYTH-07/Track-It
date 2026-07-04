import React, { useState, useMemo } from 'react'
import { Eye, Edit3 } from 'lucide-react'
import { detectLanguage, LANGUAGE_LABELS } from '../lib/detectLanguage'

// Minimal, dependency-free markdown renderer.
// Supports: # headers, **bold**, *italic*, `inline code`,
// ```fenced code blocks``` (with auto language detection),
// - / * lists, and blank-line paragraphs.
function renderMarkdown(md) {
  if (!md) return ''

  const escapeHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Pull out fenced code blocks first so their contents aren't mangled
  const blocks = []
  let working = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const detected = lang || detectLanguage(code)
    const idx = blocks.length
    blocks.push({ lang: detected, code })
    return `@@CODEBLOCK${idx}@@`
  })

  working = escapeHtml(working)

  // Headers
  working = working.replace(/^### (.*)$/gm, '<h3>$1</h3>')
  working = working.replace(/^## (.*)$/gm, '<h2>$1</h2>')
  working = working.replace(/^# (.*)$/gm, '<h1>$1</h1>')

  // Bold / italic / inline code
  working = working.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  working = working.replace(/\*(.+?)\*/g, '<em>$1</em>')
  working = working.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>')

  // Lists
  working = working.replace(/^[-*] (.*)$/gm, '<li>$1</li>')
  working = working.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)

  // Paragraphs (lines left over)
  working = working
    .split(/\n{2,}/)
    .map(chunk => {
      if (/^<h\d|^<ul|^@@CODEBLOCK/.test(chunk.trim())) return chunk
      return `<p>${chunk.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')

  // Re-insert code blocks as styled <pre><code> with a language badge
  working = working.replace(/@@CODEBLOCK(\d+)@@/g, (_, idx) => {
    const { lang, code } = blocks[idx]
    return `
      <div class="code-block">
        <div class="code-block-lang">${LANGUAGE_LABELS[lang] || lang}</div>
        <pre><code>${escapeHtml(code.trim())}</code></pre>
      </div>`
  })

  return working
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 6 }) {
  const [mode, setMode] = useState('write') // 'write' | 'preview'
  const html = useMemo(() => renderMarkdown(value), [value])

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color, #333)' }}>
      <div className="flex items-center gap-1 px-2 py-1" style={{ background: 'var(--bg-secondary, #1a1a1a)' }}>
        <button
          type="button"
          onClick={() => setMode('write')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${mode === 'write' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-400'}`}
        >
          <Edit3 size={12} /> Write
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${mode === 'preview' ? 'bg-violet-500/20 text-violet-300' : 'text-gray-400'}`}
        >
          <Eye size={12} /> Preview
        </button>
        <span className="ml-auto text-[10px] pr-1" style={{ color: 'var(--text-muted)' }}>
          Markdown supported
        </span>
      </div>

      {mode === 'write' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-sm resize-y outline-none"
          style={{ background: 'var(--bg-primary, #111)', color: 'var(--text-primary)' }}
        />
      ) : (
        <div
          className="markdown-preview px-3 py-2 text-sm min-h-[80px]"
          style={{ color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: html || '<p style="opacity:0.5">Nothing to preview yet.</p>' }}
        />
      )}
    </div>
  )
}