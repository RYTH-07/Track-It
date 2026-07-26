import React, { useState } from 'react'
import { User, Save, LogOut, Bell, BellOff, Code2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePushNotifications } from '../hooks/usePushNotifications.js'

export default function Profile({ user, profile, onUpdateDisplayName, onUpdateLeetCodeUsername, onSignOut }) {
  const [name, setName]     = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [leetcodeUsername, setLeetcodeUsername] = useState(profile?.leetcode_username || '')
  const [savingLeetcode, setSavingLeetcode] = useState(false)
  const { supported, permission, subscribed, loading, enable, disable } = usePushNotifications(user?.id)

  const handleSave = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) { toast.error('Name must be at least 2 characters'); return }
    if (trimmed.length > 20) { toast.error('Name must be 20 characters or less'); return }
    setSaving(true)
    const { error } = await onUpdateDisplayName(trimmed)
    if (error) toast.error(error.message)
    else toast.success('Display name updated!')
    setSaving(false)
  }

  const handleSaveLeetcode = async (e) => {
    e.preventDefault()
    setSavingLeetcode(true)
    const { error } = await onUpdateLeetCodeUsername(leetcodeUsername.trim())
    setSavingLeetcode(false)
    if (error) toast.error(error.message)
    else toast.success(leetcodeUsername.trim() ? 'LeetCode username linked!' : 'LeetCode username removed')
  }

  const handleToggleNotifications = async () => {
    if (subscribed) {
      await disable()
      toast('Reminders turned off', { icon: '🔕' })
    } else {
      const { error } = await enable()
      if (error) toast.error(error)
      else toast.success('Reminders enabled! 🔔')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <User size={20} className="text-violet-400" /> Profile & Settings
        </h1>
      </div>

      <div className="card p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
            {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {profile?.display_name || 'No name set'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Display name form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label" htmlFor="profile-name">Display Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="Your leaderboard name"
              minLength={2}
              maxLength={20}
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>
              {name.trim().length}/20
            </p>
          </div>
          <button type="submit" disabled={saving || name.trim().length < 2} className="btn btn-primary w-full">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* LeetCode linking */}
        <form onSubmit={handleSaveLeetcode} className="space-y-3">
          <div>
            <label className="label" htmlFor="leetcode-username" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code2 size={13} /> LeetCode Username
            </label>
            <input
              id="leetcode-username"
              type="text"
              value={leetcodeUsername}
              onChange={e => setLeetcodeUsername(e.target.value)}
              className="input"
              placeholder="Your LeetCode username"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Links your public LeetCode stats to the LeetCode Leaderboard. Refreshes automatically once a day.
            </p>
          </div>
          <button type="submit" disabled={savingLeetcode} className="btn btn-ghost w-full">
            {savingLeetcode ? 'Saving...' : 'Save LeetCode Username'}
          </button>
        </form>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Push notifications */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {subscribed ? <Bell size={16} style={{ color: 'var(--accent)' }} /> : <BellOff size={16} style={{ color: 'var(--text-muted)' }} />}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Reminders</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {!supported
                  ? 'Not supported on this browser/device'
                  : permission === 'denied'
                  ? 'Blocked — enable notifications for this site in your browser settings'
                  : 'Get notified about due reviews and pending assignments'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleNotifications}
            disabled={!supported || loading || permission === 'denied'}
            className={`btn ${subscribed ? 'btn-ghost' : 'btn-primary'} px-3 py-2 text-sm shrink-0`}
          >
            {loading ? '...' : subscribed ? 'On' : 'Off'}
          </button>
        </div>

        <hr style={{ borderColor: 'var(--border)' }} />

        {/* Sign out */}
        <button onClick={onSignOut} className="btn btn-danger w-full">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )
}
