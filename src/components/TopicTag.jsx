import React from 'react'
import { X } from 'lucide-react'

export default function TopicTag({ label, onRemove }) {
  return (
    <span className="topic-tag">
      {label}
      {onRemove && (
        <button
          onClick={() => onRemove(label)}
          className="ml-1 hover:text-white transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
