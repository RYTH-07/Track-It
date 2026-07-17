import React, { useState, useEffect } from 'react'
import { Medal, RefreshCw, Crown } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { getRankFromXP } from '../lib/helpers.js'

export default function Leaderboard({ currentUserId }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchLeaderboard = async () => {
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('public_leaderboard')
      .select('*')
    if (err) { setError(err.message); setLoading(false); return }
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLeaderboard() }, [])

  const rankMedal = (pos) => {
    if (pos === 0) return '🥇'
    if (pos === 1) return '🥈'
    if (pos === 2) return '🥉'
    return `#${pos + 1}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Medal size={20} className="text-violet-400" /> Leaderboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Top Amrita Chennai students · 10+ problems to appear
          </p>
        </div>
        <button onClick={fetchLeaderboard} disabled={loading} className="btn btn-ghost text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 shimmer h-16" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 animate-float">🏆</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No students on the leaderboard yet.<br />
            Log 10+ problems to appear here!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const rank = getRankFromXP(row.xp || 0)
            const isMe = row.user_id === currentUserId
            return (
              <div
                key={row.user_id}
                className={`card p-4 flex items-center gap-4 transition-all duration-200 ${isMe ? 'card-glow' : ''}`}
              >
                {/* Position */}
                <div className="w-10 text-center shrink-0">
                  <span className="text-lg" style={{ fontFamily: 'JetBrains Mono,monospace' }}>{rankMedal(i)}</span>
                </div>

                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: `linear-gradient(135deg, #7C3AED, #A78BFA)` }}>
                  {(row.display_name || '?')[0].toUpperCase()}
                </div>

                {/* Name + rank */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: isMe ? '#A78BFA' : 'var(--text-primary)' }}>
                      {row.display_name || 'Anonymous'}
                    </span>
                    {isMe && <span className="badge text-xs" style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.4)' }}>You</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rank.emoji} {rank.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                      🔥 {row.streak || 0}d
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ color: '#A78BFA', fontFamily: 'JetBrains Mono,monospace' }}>
                    ⚡ {row.xp || 0} XP
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                    {row.problems_solved || 0} solved
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
