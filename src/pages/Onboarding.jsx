import React, { useState } from 'react'
import { ChevronRight, User } from 'lucide-react'

export default function Onboarding({ onSubmit }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) { setError('Display name must be at least 2 characters.'); return }
    if (trimmed.length > 20) { setError('Display name must be 20 characters or less.'); return }
    setLoading(true)
    const { error: err } = await onSubmit(trimmed)
    if (err) { setError(err.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#7C3AED' }} />

      <div className="card relative w-full max-w-sm p-8 text-center animate-slide-up">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
          <User size={28} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to Track-It! 👋</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Choose a display name — this is what your teammates will see on the leaderboard.
        </p>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <div>
            <label className="label" htmlFor="display-name">Display Name</label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input text-center"
              placeholder="e.g. Rythan"
              minLength={2}
              maxLength={20}
              autoFocus
            />
            <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
              {name.trim().length}/20
            </p>
          </div>

          {error && (
            <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || name.trim().length < 2} className="btn btn-primary w-full">
            {loading ? 'Saving...' : 'Get Started'}
            {!loading && <ChevronRight size={15} />}
          </button>
        </form>
      </div>
    </div>
  )
}
