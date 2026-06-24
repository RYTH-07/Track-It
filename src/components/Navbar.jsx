import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Plus, BookOpen, Tag, BarChart2,
  Trophy, Download, Sun, Moon, LogOut, User, Crown, Zap, Flame, CheckCircle, Medal
} from 'lucide-react'
import { getRankFromXP, getXPProgress } from '../lib/helpers.js'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Review Queue', icon: LayoutDashboard },
  { to: '/log',       label: 'Log Problem',  icon: Plus },
  { to: '/problems',  label: 'All Problems', icon: BookOpen },
  { to: '/topics',    label: 'Topics',       icon: Tag },
  { to: '/stats',     label: 'Stats',        icon: BarChart2 },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/leaderboard',  label: 'Leaderboard',  icon: Medal },
  { to: '/import-export', label: 'Import/Export', icon: Download },
]

export default function Navbar({ stats, dueCount, solvedCount, darkMode, toggleDark, onSignOut }) {
  const navigate = useNavigate()
  const xp = stats?.xp || 0
  const streak = stats?.streak || 0
  const rank = getRankFromXP(xp)
  const { pct } = getXPProgress(xp)

  return (
    <header className="sticky top-0 z-40 glass border-b" style={{ background: 'rgba(13,17,23,0.92)', borderColor: 'var(--border)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>T</div>
          <span className="font-bold text-sm tracking-wide hidden sm:block" style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--text-primary)' }}>Track-It</span>
        </button>

        {/* Stats chips */}
        <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
          <span className="stat-chip text-xs">
            <Flame size={13} className={streak > 0 ? 'text-orange-400' : ''} />
            <span style={{ fontFamily: 'JetBrains Mono,monospace' }}>{streak}d</span>
          </span>
          <span className="stat-chip text-xs">
            <span style={{ fontFamily: 'JetBrains Mono,monospace' }}>{rank.emoji} {rank.name}</span>
          </span>
          <span className="stat-chip text-xs">
            <Zap size={13} className="text-violet-400" />
            <span style={{ fontFamily: 'JetBrains Mono,monospace' }}>{xp} XP</span>
          </span>
          <span className="stat-chip text-xs" style={{ color: dueCount > 0 ? '#FDE047' : 'var(--text-secondary)' }}>
            <CheckCircle size={13} />
            <span style={{ fontFamily: 'JetBrains Mono,monospace' }}>{dueCount} due</span>
          </span>
          <span className="stat-chip text-xs">
            <BookOpen size={13} />
            <span style={{ fontFamily: 'JetBrains Mono,monospace' }}>{solvedCount} solved</span>
          </span>

          {/* Dark/light toggle */}
          <button onClick={toggleDark} className="btn btn-ghost px-2 py-1.5" title="Toggle dark/light mode" aria-label="Toggle theme">
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {/* Profile */}
          <button onClick={() => navigate('/profile')} className="btn btn-ghost px-2 py-1.5" title="Profile" aria-label="Profile">
            <User size={15} />
          </button>
          {/* Sign out */}
          <button onClick={onSignOut} className="btn btn-ghost px-2 py-1.5 text-red-400 hover:text-red-300" title="Sign out" aria-label="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* XP progress strip */}
      <div className="h-0.5 w-full" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 px-4 overflow-x-auto py-1 scrollbar-hide">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link text-xs ${isActive ? 'active' : ''}`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
