import React, { useState, useEffect } from 'react'
import { Medal, RefreshCw, Crown, Code2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { getRankFromXP } from '../lib/helpers.js'

export default function Leaderboard({ currentUserId }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [lcRows, setLcRows] = useState([])
  const [lcLoading, setLcLoading] = useState(true)
  const [lcError, setLcError] = useState('')

  const fetchLeaderboard = async () => {
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('public_leaderboard')
      .select('*')
    if (err) { setError(err.message); setLoading(false); return }
    setRows(data || [])
    setLoading(false)
  }

  // Fully independent of the XP leaderboard above — separate table, separate
  // ranking, on purpose. Someone's XP rank and their LeetCode rank have no
  // relationship to each other.
  const fetchLeetCodeLeaderboard = async () => {
    setLcLoading(true); setLcError('')
    const { data, error: err } = await supabase
      .from('leetcode_stats')
      .select('*')
      .order('total_solved', { ascending: false })
    if (err) { setLcError(err.message); setLcLoading(false); return }

    // leetcode_stats.user_id has no direct FK to profiles (it references
    // auth.users), so PostgREST can't auto-embed display_name — fetch and
    // merge separately instead.
    const userIds = (data || []).map((r) => r.user_id)
    let namesById = {}
    if (userIds.length) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)
      namesById = Object.fromEntries((profileRows || []).map((p) => [p.user_id, p.display_name]))
    }
    setLcRows((data || []).map((r) => ({ ...r, display_name: namesById[r.user_id] || 'Anonymous' })))
    setLcLoading(false)
  }

  useEffect(() => { fetchLeaderboard(); fetchLeetCodeLeaderboard() }, [])

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

      {/* ── LeetCode Leaderboard ──────────────────────────────────────────
          Deliberately separate from the XP leaderboard above: different
          table, different ranking, no combined score. Someone's Track-It
          XP rank and LeetCode solved-count rank are unrelated. */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Code2 size={18} className="text-orange-400" /> LeetCode Leaderboard
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Ranked by total problems solved on LeetCode · updates once a day
            </p>
          </div>
          <button onClick={fetchLeetCodeLeaderboard} disabled={lcLoading} className="btn btn-ghost text-sm">
            <RefreshCw size={14} className={lcLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {lcError && (
          <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
            {lcError}
          </div>
        )}

        {lcLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 shimmer h-16" />
            ))}
          </div>
        ) : lcRows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💻</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No one has linked a LeetCode username yet.<br />
              Link yours from your Profile page to appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {lcRows.map((row, i) => {
              const isMe = row.user_id === currentUserId
              return (
                <div
                  key={row.user_id}
                  className={`card p-4 flex items-center gap-4 transition-all duration-200 ${isMe ? 'card-glow' : ''}`}
                >
                  <div className="w-10 text-center shrink-0">
                    <span className="text-lg" style={{ fontFamily: 'JetBrains Mono,monospace' }}>{rankMedal(i)}</span>
                  </div>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #FB923C)' }}>
                    {(row.display_name || '?')[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: isMe ? '#FB923C' : 'var(--text-primary)' }}>
                        {row.display_name}
                      </span>
                      {isMe && <span className="badge text-xs" style={{ background: 'rgba(251,146,60,0.2)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.4)' }}>You</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{row.username}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold" style={{ color: '#FB923C', fontFamily: 'JetBrains Mono,monospace' }}>
                      {row.total_solved} solved
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
                      {row.easy_solved}E · {row.medium_solved}M · {row.hard_solved}H
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
