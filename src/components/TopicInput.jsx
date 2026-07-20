import React, { useState, useRef } from 'react'
import TopicTag from './TopicTag.jsx'

export default function TopicInput({ topics = [], onChange, placeholder = 'Type a topic, press Enter or comma...', variant = 'topic' }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const addTopic = (val) => {
    const trimmed = val.trim().toLowerCase()
    if (trimmed && !topics.includes(trimmed)) {
      onChange([...topics, trimmed])
    }
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTopic(input)
    } else if (e.key === 'Backspace' && !input && topics.length > 0) {
      onChange(topics.slice(0, -1))
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    if (val.endsWith(',')) {
      addTopic(val.slice(0, -1))
    } else {
      setInput(val)
    }
  }

  const removeTopic = (t) => onChange(topics.filter(x => x !== t))

  return (
    <div
      className="input flex flex-wrap gap-1.5 cursor-text min-h-[42px]"
      style={{ padding: '6px 10px' }}
      onClick={() => inputRef.current?.focus()}
    >
      {topics.map(t => <TopicTag key={t} label={t} onRemove={removeTopic} variant={variant} />)}
      <input
        ref={inputRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={topics.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  )
}
