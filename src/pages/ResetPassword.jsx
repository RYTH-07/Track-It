import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Check if we have a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
      else setError('Invalid or expired reset link. Please request a new one.')
    })
  }, [])

  const handleReset = async () => {
    if (!password) return setError('Enter a new password.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully. Redirecting...')
      // Sign out and redirect to landing after 2 seconds
      // so they log in fresh with the new password
      setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
      }, 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '380px'
      }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
          Track-It
        </div>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px', color: 'var(--text-primary)' }}>
          Set new password
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Choose a strong password for your Track-It account.
        </p>

        {!validSession && !message && (
          <div style={{ fontSize: '13px', color: '#F85149', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '1rem' }}>
            {error || 'Checking reset link...'}
          </div>
        )}

        {validSession && !message && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                New password
              </label>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#F85149', marginBottom: '12px', padding: '8px 12px', background: 'rgba(248,81,73,0.08)', borderRadius: '6px', border: '1px solid rgba(248,81,73,0.2)' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', padding: '11px', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </>
        )}

        {message && (
          <div style={{ fontSize: '13px', color: '#3FB950', background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', borderRadius: '8px', padding: '12px' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
