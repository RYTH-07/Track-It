import React, { useState } from 'react'
import { Zap, Shield, BarChart2, Trophy, Users, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { ALLOWED_DOMAIN } from '../lib/constants.js'

const FEATURES = [
  { icon: '🔁', title: 'Spaced Repetition', desc: 'Again / Hard / Good / Master intervals keep knowledge fresh' },
  { icon: '⚡', title: 'XP & Rank Ladder', desc: 'Novice → Grandmaster progression with XP rewards' },
  { icon: '🔥', title: 'Daily Streaks', desc: 'Build consistency with streaks and personal bests' },
  { icon: '🏆', title: '20+ Achievements', desc: 'Unlock badges for real milestones as you progress' },
  { icon: '📊', title: 'Leaderboard', desc: 'Compete with fellow Amrita Chennai students' },
  { icon: '📘', title: 'Master Notebook', desc: 'Per-topic theory, templates, and patterns' },
]

export default function Landing({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    if (mode === 'signup') {
      const { error: err } = await onSignUp(email, password)
      if (err) { setError(err.message); setLoading(false); return }
      setSuccess('Account created! Check your email to confirm, then sign in.')
      setMode('login')
    } else {
      const { error: err } = await onSignIn(email, password)
      if (err) { setError(err.message); setLoading(false); return }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D1117 0%, #1a0a2e 50%, #0D1117 100%)' }}>
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{ background: '#7C3AED' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{ background: '#A78BFA', animationDelay: '1s' }} />

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#C4B5FD', fontFamily: 'JetBrains Mono,monospace' }}>
            <Shield size={12} /> Exclusive to Amrita Chennai
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight">
            <span className="gradient-text">Track-It</span>
          </h1>
          <p className="text-xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            DSA & CP Problem Tracker with Spaced Repetition
          </p>
          <p className="text-base max-w-lg mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Don't just solve problems — <em>retain</em> them. Log, review at the right time, earn XP, and dominate the leaderboard.
          </p>

          {/* Auth card */}
          <div className="card max-w-sm mx-auto p-6 text-left" style={{ background: 'rgba(22,27,39,0.95)' }}>
            {/* Toggle */}
            <div className="flex rounded-lg p-1 mb-5" style={{ background: 'var(--bg-tertiary)' }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className="flex-1 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
                  style={{
                    background: mode === m ? 'var(--accent)' : 'transparent',
                    color: mode === m ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Email</label>
                <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder={`you@${ALLOWED_DOMAIN}`} autoComplete="email" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input id="auth-password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} className="input pr-10"
                    placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg p-3 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80' }}>
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                {!loading && <ChevronRight size={15} />}
              </button>
            </form>

            {mode === 'signup' && (
              <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
                Only <code style={{ color: '#A78BFA', fontFamily: 'JetBrains Mono,monospace' }}>@{ALLOWED_DOMAIN}</code> emails accepted
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Everything you need to actually retain DSA</h2>
        <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>Built by Amrita Chennai students, for Amrita Chennai students.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-5 hover:border-violet-600 transition-all duration-300 group">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1 text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        Track-It · Amrita Vishwa Vidyapeetham, Chennai Campus
      </footer>
    </div>
  )
}
