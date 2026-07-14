import React, { useState, useEffect, useRef } from 'react'

const DOMAIN = '@ch.students.amrita.edu'
function isAmritaEmail(e) { return e.toLowerCase().endsWith(DOMAIN) }

const DEMO_PROBLEMS = [
  { title: 'Two Sum', difficulty: 'Easy', topics: ['Arrays', 'HashMap'], notes: 'Store complement in hashmap. Single pass O(n).\nKey: target − current = complement.' },
  { title: 'Valid Parentheses', difficulty: 'Easy', topics: ['Stack'], notes: 'Push open brackets onto stack.\nPop and match on every close bracket.\nStack empty at end = valid.' },
  { title: 'Binary Search', difficulty: 'Easy', topics: ['Binary Search'], notes: 'mid = left + (right−left)/2 prevents overflow.\nAdjust bounds: arr[mid] > target → right = mid−1.' },
]

const MASTERY = {
  again:  { label: 'Again',  xp: 2,  interval: '1d',  color: '#DC2626', bg: '#FEF2F2', darkBg: 'rgba(220,38,38,0.12)', border: '#FECACA', darkBorder: 'rgba(220,38,38,0.3)' },
  hard:   { label: 'Hard',   xp: 5,  interval: '3d',  color: '#D97706', bg: '#FFFBEB', darkBg: 'rgba(217,119,6,0.12)',  border: '#FDE68A', darkBorder: 'rgba(217,119,6,0.3)' },
  good:   { label: 'Good',   xp: 10, interval: '7d',  color: '#16A34A', bg: '#F0FDF4', darkBg: 'rgba(22,163,74,0.12)',  border: '#BBF7D0', darkBorder: 'rgba(22,163,74,0.3)' },
  master: { label: 'Master', xp: 20, interval: '14d', color: '#4F46E5', bg: '#EEF2FF', darkBg: 'rgba(79,70,229,0.12)',  border: '#C7D2FE', darkBorder: 'rgba(79,70,229,0.3)' },
}

const FEATURES = [
  { icon: '◎', title: 'Active Recall',      sub: 'Notes hidden by default. Force retrieval before revealing. Mastery buttons unlock only after recall attempt.' },
  { icon: '⟳', title: 'Spaced Repetition',  sub: 'SM-2 schedules each problem at the optimal interval. Again=1d · Hard=3d · Good=7d · Master=14d.' },
  { icon: '⊞', title: 'Custom Topics',       sub: 'Organize by any topic you define — not a fixed list. Your structure for your curriculum.' },
  { icon: '▤', title: 'Master Notebook',     sub: 'One theory notebook per topic. Rules, templates, patterns — alongside problem tracking.' },
  { icon: '⚡', title: 'XP + Rank Ladder',   sub: 'Novice → Apprentice → Adept → Expert → Master → Grandmaster. Every review earns XP.' },
  { icon: '◈', title: 'Peer Leaderboard',    sub: 'Compete with your actual batchmates. Amrita Chennai exclusive. Appear after 10+ problems.' },
  { icon: '▲', title: 'Weak Topic Radar',    sub: 'Auto-detects where you struggle most. Surfaces your Focus Area daily — e.g. ⚠️ Dynamic Programming (Accuracy: 40%).' },
  { icon: '◻', title: 'Archive System',      sub: 'Mastered problems leave your queue. Auto-suggested after 3 consecutive Master ratings.' },
  { icon: '◷', title: 'Weekly Goals',        sub: 'Set a weekly review target. Resets Monday. Hit it to unlock Goal Crusher achievement.' },
]

const LB_ROWS = [
  { initials: 'RA', name: 'Riya Anand',  dept: 'CSE · 3rd Year', xp: '4,820', streak: '41d', blur: false },
  { initials: 'VK', name: 'Vetri K',     dept: 'CSE · 2nd Year', xp: '4,310', streak: '29d', blur: false },
  { initials: 'NS', name: 'Navya S',     dept: 'IT · 2nd Year',  xp: '3,980', streak: '22d', blur: false },
  { initials: 'AP', name: 'Arjun P',     dept: 'ECE · 3rd Year', xp: '3,450', streak: '15d', blur: true },
  { initials: 'ML', name: 'Meera L',     dept: 'CSE · 2nd Year', xp: '3,110', streak: '11d', blur: true },
]

const HERO_METRICS = [
  { value: 'SM-2', label: 'Review engine' },
  { value: '4', label: 'Mastery levels' },
  { value: '14d', label: 'Max interval' },
  { value: '∞', label: 'Problems' },
]

const DEMO_QUEUE_TAGS = ['Arrays', 'DP', 'Binary Search', 'Graphs']

const HOW_IT_WORKS = [
  { n: '01', title: 'Log after solving', body: 'Title, link, topic, a quick note on your approach. Under 30 seconds. LeetCode, GFG, contest problems — any platform.' },
  { n: '02', title: 'Recall first, then reveal', body: 'Notes are hidden on every card. Force your brain to retrieve the approach before checking. Active recall — the mechanism that builds durable memory.' },
  { n: '03', title: 'Show up when scheduled', body: 'Again · 1d    Hard · 3d    Good · 7d    Master · 14d\n\nYour queue updates automatically every morning. No planning required.' },
]

const FAQ_ITEMS = [
  { q: 'Does it support LeetCode, CodeChef, GFG?', a: 'Yes — log problems from any platform. Paste the link or just the title. Track-It doesn\'t care where the problem came from.' },
  { q: 'How much time does logging a problem take?', a: 'Under 30 seconds. Title, topic, difficulty, and a short approach note. The SR scheduling happens automatically after that.' },
  { q: 'Why is it restricted to @ch.students.amrita.edu?', a: 'The leaderboard and community layer only works if everyone on it is a real peer you know. Campus exclusivity is the feature, not the limitation.' },
]

const PLATFORMS = [
  { name: 'LeetCode', color: '#F59E0B', mark: 'LC' },
  { name: 'HackerRank', color: '#22C55E', mark: 'HR' },
  { name: 'GeeksforGeeks', color: '#16A34A', mark: 'G4G' },
  { name: 'Codeforces', color: '#3B82F6', mark: 'CF' },
  { name: 'CodeChef', color: '#8B5CF6', mark: 'CC' },
  { name: 'CodeStudio', color: '#EC4899', mark: 'CS' },
  { name: 'InterviewBit', color: '#F97316', mark: 'IB' },
  { name: 'AtCoder', color: '#0EA5E9', mark: 'AC' },
]

const JOURNEY_STEPS = [
  { icon: '✎', title: 'Log it',    desc: 'Solve on any platform, log the approach in under 30 seconds.' },
  { icon: '◎', title: 'Recall it', desc: 'Come back before you forget — active recall, not re-reading.' },
  { icon: '⟳', title: 'Review it', desc: 'SM-2 schedules the next check-in at just the right interval.' },
  { icon: '▲', title: 'Track it',  desc: 'Weak Topic Radar shows exactly where to focus next.' },
  { icon: '⚡', title: 'Master it', desc: 'Consistent reviews turn into durable, interview-ready recall.' },
]

// ── Cosmic hero background (dark mode) ──────────────────────────────────────
function CosmicBackground({ fixed }) {
  const stars = React.useMemo(() => Array.from({ length: 70 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  })), [])
  return (
    <div className={`cosmic-bg${fixed ? ' fixed-bg' : ''}`}>
      <div className="cosmic-base" />
      <div className="cosmic-blob cosmic-blob-1" />
      <div className="cosmic-blob cosmic-blob-2" />
      <div className="cosmic-blob cosmic-blob-3" />
      <div className="cosmic-blob cosmic-blob-4" />
      {stars.map(s => (
        <div key={s.id} className="cosmic-star" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
        }} />
      ))}
    </div>
  )
}

// ── Light mode "aurora" hero background ─────────────────────────────────────
const SPARKLE_COLORS = ['#db2777', '#f472b6', '#3b82f6', '#0ea5e9']
function LightAuroraBackground({ fixed }) {
  const sparkles = React.useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 3 + Math.random() * 3,
    color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
    delay: Math.random() * 4,
    duration: 2.4 + Math.random() * 2.6,
  })), [])
  return (
    <div className={`aurora-bg${fixed ? ' fixed-bg' : ''}`}>
      <div className="aurora-base" />
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
      {sparkles.map(s => (
        <div key={s.id} className="aurora-sparkle" style={{
          left: `${s.left}%`, top: `${s.top}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          background: s.color,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
        }} />
      ))}
    </div>
  )
}

// ── Flying rocket (hero) ─────────────────────────────────────────────────────
// ── AI robot mascot (holding a laptop) ──────────────────────────────────────
function RobotIcon({ size = 30 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <line x1="32" y1="6" x2="32" y2="1" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="1" r="2" fill="#38BDF8" />
      <rect x="19" y="5" width="26" height="19" rx="7" fill="#F4F4F5" stroke="#818CF8" strokeWidth="2" />
      <circle cx="27" cy="15" r="2.2" fill="#1E293B" />
      <circle cx="37" cy="15" r="2.2" fill="#1E293B" />
      <rect x="15" y="26" width="34" height="23" rx="9" fill="#E5E7EB" stroke="#818CF8" strokeWidth="2" />
      <circle cx="14" cy="39" r="4.5" fill="#818CF8" />
      <circle cx="50" cy="39" r="4.5" fill="#818CF8" />
      <rect x="20" y="31" width="24" height="15" rx="2" fill="#0EA5E9" stroke="#1E3A8A" strokeWidth="1.5" />
      <rect x="22.5" y="33.5" width="19" height="9.5" rx="1" fill="#BAE6FD" />
      <rect x="18" y="46" width="28" height="4" rx="2" fill="#38BDF8" stroke="#1E3A8A" strokeWidth="1" />
    </svg>
  )
}
// ── Platform monogram icon (simple letter-mark, not a copied logo) ──────────
function PlatformIcon({ mark, color, size = 26 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      fontSize: size * 0.36, letterSpacing: '-0.03em', flexShrink: 0,
      lineHeight: 1,
    }}>
      {mark}
    </div>
  )
}

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

const PASSWORD_CRITERIA = [
  { key: 'len',     label: 'At least 8 characters',       test: p => p.length >= 8 },
  { key: 'upper',   label: 'One uppercase letter',         test: p => /[A-Z]/.test(p) },
  { key: 'num',     label: 'One number',                   test: p => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character (!@#$)', test: p => /[!@#$%^&*(),.?":{}|<>_\-]/.test(p) },
]

// ── Floating-label input ────────────────────────────────────────────────────
function FloatingInput({ label, optional, type = 'text', value, onChange, error, onFocusChange, C, autoComplete, shakeTick, name, rightAdornment }) {
  const [focused, setFocused] = useState(false)
  const floated = focused || (value && value.length > 0)
  return (
    <div
      key={error ? `${name}-err-${shakeTick}` : name}
      className={`floating-field${focused ? ' focused' : ''}${error ? ' field-error' : ''}`}
    >
      <div className="field-glow" />
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        onFocus={() => { setFocused(true); onFocusChange && onFocusChange(true) }}
        onBlur={() => { setFocused(false); onFocusChange && onFocusChange(false) }}
        className="floating-input"
        style={{
          background: C.panel,
          borderColor: error ? '#DC2626' : (focused ? '#818CF8' : C.border),
          color: C.text,
        }}
      />
      <label
        className={`floating-label${floated ? ' floated' : ''}`}
        style={{
          color: floated ? (focused ? '#818CF8' : C.muted) : C.muted,
          background: floated ? C.panel : 'transparent',
        }}
      >
        {label}{optional ? <span style={{ opacity: 0.65 }}> (optional)</span> : null}
      </label>
      {rightAdornment}
    </div>
  )
}

// ── Password strength meter + criteria checklist ────────────────────────────
function PasswordStrength({ password, C }) {
  const passed = PASSWORD_CRITERIA.filter(c => c.test(password))
  const score = passed.length
  let color = '#DC2626', label = 'Weak'
  if (score >= 4) { color = '#16A34A'; label = 'Strong' }
  else if (score >= 2) { color = '#D97706'; label = 'Medium' }

  return (
    <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {PASSWORD_CRITERIA.map((c, i) => (
          <div key={c.key} style={{ flex: 1, height: '5px', borderRadius: '3px', background: C.border, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: password && i < score ? '100%' : '0%',
              background: color,
              borderRadius: '3px',
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
            }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color, marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace', height: '13px', transition: 'color 0.3s ease' }}>
        {password ? label : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {PASSWORD_CRITERIA.map(c => {
          const ok = c.test(password)
          return (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', color: ok ? '#16A34A' : C.muted, transition: 'color 0.25s ease' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                width: '14px', height: '14px', borderRadius: '50%',
                border: `1.5px solid ${ok ? '#16A34A' : C.border}`,
                background: ok ? '#16A34A' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: ok ? 'scale(1)' : 'scale(0.88)',
              }}>
                <span style={{ color: '#fff', fontSize: '9px', lineHeight: 1, opacity: ok ? 1 : 0, transition: 'opacity 0.15s ease' }}>✓</span>
              </span>
              {c.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Animated mascot ──────────────────────────────────────────────────────────
function Mascot({ covering, C }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
      <svg viewBox="0 0 200 170" width="108" height="92" className="mascot-float">
        <ellipse cx="100" cy="150" rx="46" ry="8" fill={C.border} opacity="0.5" />
        <line x1="100" y1="32" x2="100" y2="12" stroke={C.muted} strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="9" r="6" fill="#818CF8" />
        <circle cx="100" cy="90" r="56" fill={C.card} stroke={C.border} strokeWidth="3" />
        <circle className="mascot-eye" cx="80" cy="88" r="7.5" fill={C.text} style={{ transformOrigin: '80px 88px', transform: covering ? 'scaleY(0.15)' : 'scaleY(1)' }} />
        <circle className="mascot-eye" cx="120" cy="88" r="7.5" fill={C.text} style={{ transformOrigin: '120px 88px', transform: covering ? 'scaleY(0.15)' : 'scaleY(1)' }} />
        <path d="M84 114 Q100 124 116 114" stroke={C.muted} strokeWidth="3" fill="none" strokeLinecap="round" />
        <g className={`mascot-hand${covering ? ' covering' : ''}`} style={{ transformOrigin: '78px 150px' }}>
          <ellipse cx="78" cy="150" rx="17" ry="21" fill="#818CF8" />
        </g>
        <g className={`mascot-hand${covering ? ' covering' : ''}`} style={{ transformOrigin: '122px 150px' }}>
          <ellipse cx="122" cy="150" rx="17" ry="21" fill="#38BDF8" />
        </g>
      </svg>
    </div>
  )
}

// ── Success checkmark + confetti ────────────────────────────────────────────
const CONFETTI_COLORS = ['#f472b6', '#818cf8', '#38bdf8', '#facc15', '#4ade80', '#fb7185']
function darkBgFor(C) { return C.bg === '#09090B' ? 'rgba(9,9,11,0.92)' : 'rgba(250,250,250,0.92)' }
function SuccessOverlay({ name, C }) {
  const confetti = React.useMemo(() => Array.from({ length: 70 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.5,
    duration: 2.4 + Math.random() * 1.6,
    size: 6 + Math.random() * 7,
    drift: (Math.random() - 0.5) * 240,
    round: Math.random() > 0.5,
  })), [])

  return (
    <div className="success-overlay" style={{ background: darkBgFor(C) }}>
      {confetti.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          width: `${p.size}px`,
          height: `${p.size * 0.4}px`,
          background: p.color,
          borderRadius: p.round ? '50%' : '2px',
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          '--drift': `${p.drift}px`,
        }} />
      ))}
      <div className="success-card" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <svg viewBox="0 0 100 100" width="84" height="84">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#16A34A" strokeWidth="5" className="check-circle" />
          <path d="M28 52 L44 68 L74 34" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="check-path" />
        </svg>
        <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, color: C.text, marginTop: '1rem' }}>Account created</h3>
        <p style={{ fontSize: '13px', color: C.muted, marginTop: '6px' }}>Welcome{name ? `, ${name}` : ''}. Let's start retaining.</p>
      </div>
    </div>
  )
}

// ── Demo Card ─────────────────────────────────────────────────────────────────
function DemoCard({ showToast, darkMode }) {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [entering, setEntering] = useState(false)
  const [xp, setXp] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [lastXp, setLastXp] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const p = DEMO_PROBLEMS[idx]

  const C = {
    card: darkMode ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.92)',
    panel: darkMode ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.88)',
    border: darkMode ? '#1F2937' : '#E4E4E7',
    text: darkMode ? '#F4F4F5' : '#201B4D',
    muted: darkMode ? '#94A3B8' : '#756FA0',
    sub: darkMode ? '#CBD5E1' : '#4B4380',
  }

  const rate = (level) => {
    const gain = MASTERY[level].xp
    setXp(x => x + gain)
    setLastXp(gain)
    setReviewed(r => r + 1)
    if (showToast) showToast(`+${gain} XP · Log in to save your progress`, true)
    setExiting(true)
    setTimeout(() => {
      setIdx(i => (i + 1) % DEMO_PROBLEMS.length)
      setRevealed(false)
      setExiting(false)
      setEntering(true)
      setTimeout(() => setEntering(false), 320)
      setTimeout(() => setLastXp(null), 1200)
    }, 300)
  }

  const pct = Math.min(100, Math.round((xp / 100) * 100))

  return (
    <div>
      {/* XP row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted }}>
          Novice · {xp} XP
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
          color: '#16A34A', opacity: lastXp ? 1 : 0,
          transform: lastXp ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}>
          +{lastXp} XP ✓
        </span>
      </div>

      {/* XP bar */}
      <div style={{ height: '3px', background: C.border, borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: darkMode ? '#F4F4F5' : '#09090B',
          width: pct + '%',
          borderRadius: '2px',
          transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>

      {/* Card */}
      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        padding: '20px',
        minHeight: '270px',
        opacity: exiting ? 0 : entering ? 0 : 1,
        transform: exiting ? 'translateY(-12px) scale(0.98)' : entering ? 'translateY(8px)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>{p.title}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: darkMode ? 'rgba(22,163,74,0.12)' : '#F0FDF4', border: darkMode ? '1px solid rgba(22,163,74,0.3)' : '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                {p.difficulty}
              </span>
              {p.topics.map(t => (
                <span key={t} style={{ fontSize: '11px', color: C.muted, background: C.panel, border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted }}>{idx + 1}/{DEMO_PROBLEMS.length}</span>
        </div>

        {/* Notes / Recall area */}
        {!revealed ? (
          <div style={{
            background: C.panel,
            border: `1px dashed ${C.border}`,
            borderRadius: '8px',
            padding: '22px',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px', color: C.muted, animation: 'pulse 2.5s ease-in-out infinite' }}>◎</div>
            <div style={{ fontSize: '13px', color: C.muted, marginBottom: '14px', lineHeight: 1.5 }}>
              Recall the approach before revealing.
            </div>
            <button
              onClick={() => setRevealed(true)}
              style={{
                background: C.text,
                color: C.card,
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'transform 0.1s ease, opacity 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            >
              Reveal approach
            </button>
          </div>
        ) : (
          <div style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: C.text,
            lineHeight: 1.7,
            fontFamily: 'JetBrains Mono, monospace',
            whiteSpace: 'pre-line',
            animation: 'revealSlide 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {p.notes}
          </div>
        )}

        {/* Mastery buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '6px',
          opacity: revealed ? 1 : 0.2,
          pointerEvents: revealed ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}>
          {Object.entries(MASTERY).map(([key, cfg], i) => {
            const isHov = hoveredBtn === key
            const bg = darkMode ? cfg.darkBg : cfg.bg
            const border = darkMode ? cfg.darkBorder : cfg.border
            return (
              <button
                key={key}
                onClick={() => rate(key)}
                onMouseEnter={() => setHoveredBtn(key)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  background: isHov ? cfg.color : bg,
                  border: `1px solid ${isHov ? cfg.color : border}`,
                  color: isHov ? '#fff' : cfg.color,
                  padding: '8px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  textAlign: 'center',
                  lineHeight: 1.4,
                  transition: 'all 0.15s ease',
                  transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHov ? `0 4px 12px ${cfg.color}44` : 'none',
                  animation: revealed ? `btnAppear 0.3s ease ${i * 0.06}s both` : 'none',
                }}
              >
                <span style={{ display: 'block', fontWeight: 700 }}>{cfg.label}</span>
                <span style={{ display: 'block', fontSize: '10px', opacity: 0.75 }}>{cfg.interval}</span>
              </button>
            )
          })}
        </div>

        {!revealed && (
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>
            Reveal approach to rate
          </div>
        )}
      </div>

      {reviewed > 0 && (
        <div style={{
          marginTop: '10px', textAlign: 'center',
          fontSize: '11px', color: '#16A34A',
          fontFamily: 'JetBrains Mono, monospace',
          animation: 'fadeIn 0.3s ease',
        }}>
          {reviewed} reviewed this session · Log in to save your progress →
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Landing({
  onSignIn = () => {},
  onSignUp = () => {},
  onForgotPassword = () => {},
  darkMode: darkModeProp,
  toggleDark: toggleDarkProp,
}) {
  const [modal, setModal] = useState(null)
  const [forgot, setForgot] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', ok: true })
  const [scrolled, setScrolled] = useState(false)
  const [faqOpen, setFaqOpen] = useState(-1)
  const [hoveredFeat, setHoveredFeat] = useState(null)

  const [internalDark, setInternalDark] = useState(true)
  const darkMode = darkModeProp !== undefined ? darkModeProp : internalDark
  const toggleDark = toggleDarkProp || (() => setInternalDark(d => !d))

  const [su, setSu] = useState({ firstName: '', lastName: '', email: '', dept: '', year: '', password: '', confirmPassword: '' })
  const [si, setSi] = useState({ email: '', password: '' })
  const [fe, setFe] = useState('')
  const [suErrors, setSuErrors] = useState({})
  const [suShakeTick, setSuShakeTick] = useState(0)
  const [suSubmitting, setSuSubmitting] = useState(false)
  const [suSuccess, setSuSuccess] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  const [heroRef, heroIn] = useInView(0.15)
  const [curveRef, curveIn] = useInView(0.15)
  const [howRef, howIn] = useInView(0.1)
  const [journeyRef, journeyIn] = useInView(0.1)
  const [featRef, featIn] = useInView(0.1)
  const [lbRef, lbIn] = useInView(0.15)
  const [faqRef, faqIn] = useInView(0.15)
  const [ctaRef, ctaIn] = useInView(0.2)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { setModal(null); setForgot(false) } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
  }

  const openModal = m => { setModal(m); setForgot(false) }
  const closeModal = () => { setModal(null); setForgot(false) }
  const switchModal = to => { closeModal(); setTimeout(() => setModal(to), 120) }
  const overlayClick = e => { if (e.target === e.currentTarget) closeModal() }

  const suPasswordValid = PASSWORD_CRITERIA.every(c => c.test(su.password))

  const validateSignup = () => {
    const errs = {}
    if (!su.firstName.trim()) errs.firstName = true
    if (!su.email.trim() || !isAmritaEmail(su.email)) errs.email = true
    if (!su.dept) errs.dept = true
    if (!su.year) errs.year = true
    if (!suPasswordValid) errs.password = true
    if (!su.confirmPassword || su.confirmPassword !== su.password) errs.confirmPassword = true
    return errs
  }

  const handleSignup = async () => {
    const errs = validateSignup()
    if (Object.keys(errs).length) {
      setSuErrors(errs)
      setSuShakeTick(t => t + 1)
      if (errs.email && !isAmritaEmail(su.email) && su.email) showToast('Track-It is exclusive to Amrita Chennai students.', false)
      else showToast('Check the highlighted fields.', false)
      return
    }
    setSuErrors({})
    setSuSubmitting(true)
    try {
      const r = await onSignUp(su.email, su.password)
      if (r?.error) {
        setSuSubmitting(false)
        showToast(r.error.message || 'Signup failed.', false)
        return
      }
    } catch (e) {
      setSuSubmitting(false)
      showToast('Something went wrong.', false)
      return
    }
    setTimeout(() => {
      setSuSubmitting(false)
      setSuSuccess(true)
      setTimeout(() => {
        closeModal()
        setSuSuccess(false)
        setSu({ firstName: '', lastName: '', email: '', dept: '', year: '', password: '', confirmPassword: '' })
        showToast(`Welcome, ${su.firstName}.`, true)
      }, 2600)
    }, 700)
  }

  const handleSignin = async () => {
    if (!si.email) return showToast('Enter your email.', false)
    if (!isAmritaEmail(si.email)) return showToast('Only Amrita Chennai accounts can sign in.', false)
    if (!si.password) return showToast('Enter your password.', false)
    const r = await onSignIn(si.email, si.password)
    if (r?.error) return showToast(r.error.message || 'Sign-in failed.', false)
    closeModal()
  }

  const handleForgot = async () => {
    if (!fe) return showToast('Enter your email.', false)
    if (!isAmritaEmail(fe)) return showToast('Use your Amrita Chennai student email.', false)
    const r = await onForgotPassword(fe)
    if (r?.error) return showToast(r.error.message || 'Failed.', false)
    closeModal(); showToast('Reset link sent. Check your inbox.', true)
  }

  // Theme colors
  const C = {
    bg:       'transparent',
    text:     darkMode ? '#F4F4F5' : '#201B4D',
    section:  darkMode ? 'rgba(15,23,42,0.5)'   : 'rgba(255,255,255,0.55)',
    alt:      darkMode ? 'rgba(17,24,39,0.55)'  : 'rgba(248,250,252,0.6)',
    card:     darkMode ? 'rgba(17,24,39,0.9)'   : 'rgba(255,255,255,0.92)',
    panel:    darkMode ? 'rgba(15,23,42,0.85)'  : 'rgba(250,250,250,0.88)',
    border:   darkMode ? '#1F2937' : '#E4E4E7',
    muted:    darkMode ? '#94A3B8' : '#756FA0',
    sub:      darkMode ? '#CBD5E1' : '#4B4380',
    cta:      darkMode ? '#09090B' : '#111827',
    ctaText:  '#F4F4F5',
    ctaSub:   darkMode ? '#94A3B8' : '#CBD5E1',
    ctaBorder:darkMode ? '#374151' : '#D1D5DB',
  }

  const inp = {
    width: '100%', background: C.panel, border: `1px solid ${C.border}`,
    borderRadius: '8px', padding: '10px 12px', color: C.text,
    fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  const lbl = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: C.muted, marginBottom: '5px',
    fontFamily: 'JetBrains Mono, monospace',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  const fade = (v, d = 0) => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.65s ease ${d}s, transform 0.65s ease ${d}s`,
  })

  const eyebrow = {
    fontSize: '11px', fontWeight: 700, color: C.muted,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
  }

  const h2style = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 700, letterSpacing: '-0.03em',
    ...(darkMode ? { color: C.text } : {}),
  }
  const headingClass = darkMode ? '' : 'gradient-text'

  const footerHead = {
    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700,
    color: C.ctaText, textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '14px',
  }
  const footerLink = {
    display: 'block', fontSize: '13px', color: C.ctaSub,
    marginBottom: '10px', textDecoration: 'none', width: 'fit-content',
  }

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif', overflowX: 'hidden', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes revealSlide {
          from { opacity: 0; transform: translateY(8px); max-height: 0; }
          to   { opacity: 1; transform: translateY(0);   max-height: 200px; }
        }
        @keyframes btnAppear {
          from { opacity: 0; transform: translateY(8px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes liveBlip {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
        @keyframes fomoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,70,229,0.0); }
          50%       { box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        }
        @keyframes gradientMove {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shakeX {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes confettiFall {
          0%   { transform: translate(0, -10vh) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
        @keyframes cardPop {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(24px, -28px) scale(1.08); }
        }
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); }
          50%       { box-shadow: 0 0 26px 5px rgba(129,140,248,0.38); }
        }
        @keyframes shimmerBadge {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .gradient-text {
          background: linear-gradient(120deg, #db2777, #6366f1, #0284c7, #db2777);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: gradientMove 7s ease infinite;
        }
        .bg-blob {
          position: absolute; border-radius: 50%; filter: blur(64px);
          opacity: 0.32; pointer-events: none; z-index: 0;
          animation: floatBlob 11s ease-in-out infinite;
        }
        .blob-1 { width: 340px; height: 340px; background: #f9a8d4; top: -90px; left: -70px; }
        .blob-2 { width: 300px; height: 300px; background: #a5b4fc; top: 100px; right: -80px; animation-delay: -3.5s; }
        .blob-3 { width: 260px; height: 260px; background: #7dd3fc; bottom: -70px; left: 32%; animation-delay: -7s; }

        .hero-cta { animation: ctaGlow 2.6s ease-in-out infinite; }

        .feat-icon { display: inline-block; transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), color 0.3s ease; }
        .feat-cell:hover .feat-icon { transform: scale(1.3) rotate(10deg); color: #818CF8; }

        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .platform-track {
          display: flex; width: max-content; gap: 14px;
          animation: marqueeScroll 24s linear infinite;
        }
        .platform-track:hover { animation-play-state: paused; }
        .platform-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 999px; white-space: nowrap;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600;
          transition: transform 0.2s ease;
        }
        .platform-badge:hover { transform: translateY(-3px); }
        .platform-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          animation: pulse 2.4s ease-in-out infinite;
        }

        .footer-grid a:hover, .footer-grid span:hover { color: ${C.ctaText} !important; }
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes dashFlow { to { background-position: 32px 0; } }
        .journey-line {
          position: absolute; top: 27px; left: 6%; right: 6%; height: 2px;
          background-image: repeating-linear-gradient(90deg, #818CF8 0 8px, transparent 8px 18px);
          background-size: 32px 2px;
          animation: dashFlow 1s linear infinite;
        }
        @keyframes journeyPop {
          0%   { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .journey-node { animation: journeyPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

        .cosmic-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .aurora-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .cosmic-bg.fixed-bg, .aurora-bg.fixed-bg { position: fixed; z-index: -1; }
        .cosmic-base { position: absolute; inset: 0; background: linear-gradient(180deg, #0b0f27 0%, #080a1c 45%, #05060f 100%); }
        .cosmic-blob { position: absolute; border-radius: 50%; filter: blur(75px); mix-blend-mode: screen; animation: floatBlob 15s ease-in-out infinite; }
        .cosmic-blob-1 { width: 440px; height: 440px; background: #ec4899; opacity: 0.42; top: -130px; left: -110px; }
        .cosmic-blob-2 { width: 380px; height: 380px; background: #3b82f6; opacity: 0.4;  top: 50px;   right: -130px; animation-delay: -4s; }
        .cosmic-blob-3 { width: 360px; height: 360px; background: #0ea5e9; opacity: 0.32; bottom: -110px; left: 18%;   animation-delay: -8s; }
        .cosmic-blob-4 { width: 300px; height: 300px; background: #db2777; opacity: 0.32; bottom: 10px;  right: 12%;  animation-delay: -11s; }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50%       { opacity: 1;    transform: scale(1.15); }
        }
        .cosmic-star {
          position: absolute; border-radius: 50%; background: #fff;
          box-shadow: 0 0 4px rgba(255,255,255,0.8);
          animation-name: twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite;
        }

        .aurora-base { position: absolute; inset: 0; background: linear-gradient(160deg, #fdf2f8 0%, #eef2ff 45%, #f0f9ff 100%); }
        .aurora-blob { position: absolute; border-radius: 50%; filter: blur(80px); animation: floatBlob 15s ease-in-out infinite; }
        .aurora-blob-1 { width: 420px; height: 420px; background: #f472b6; opacity: 0.55; top: -120px;  left: -100px; }
        .aurora-blob-2 { width: 380px; height: 380px; background: #93c5fd; opacity: 0.55; top: 60px;    right: -120px; animation-delay: -4s; }
        .aurora-blob-3 { width: 340px; height: 340px; background: #7dd3fc; opacity: 0.5;  bottom: -100px; left: 20%;   animation-delay: -8s; }
        .aurora-blob-4 { width: 300px; height: 300px; background: #f9a8d4; opacity: 0.45; bottom: 20px;  right: 15%;  animation-delay: -11s; }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
        .aurora-sparkle {
          position: absolute; border-radius: 50%;
          animation-name: sparkleTwinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite;
        }

        @keyframes rocketFly { from { offset-distance: 0%; } to { offset-distance: 100%; } }
        .hero-rocket {
          position: absolute; top: 0; left: 0; z-index: 2; pointer-events: none;
          offset-path: path('M40,380 C160,110 380,50 560,180 C710,270 660,430 480,470 C300,510 110,460 40,380 Z');
          offset-rotate: 0deg;
          animation: rocketFly 16s linear infinite;
          filter: drop-shadow(0 0 8px rgba(129,140,248,0.6));
        }
        @keyframes rocketBounce {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50%       { transform: translateY(-4px) rotate(4deg); }
        }
        .inline-rocket {
          display: inline-block; font-size: 0.75em;
          animation: rocketBounce 1.8s ease-in-out infinite;
        }

        .floating-field { position: relative; margin-bottom: 20px; border-radius: 10px; }
        .floating-field.field-error { animation: shakeX 0.5s ease; }
        .field-glow {
          position: absolute; inset: -4px; border-radius: 12px;
          background: linear-gradient(120deg, #f472b6, #818cf8, #38bdf8, #f472b6);
          background-size: 300% 300%;
          opacity: 0; filter: blur(7px);
          transition: opacity 0.35s ease;
          animation: gradientMove 4s linear infinite;
          z-index: 0; pointer-events: none;
        }
        .floating-field.focused .field-glow { opacity: 0.6; }
        .floating-field.field-error .field-glow { opacity: 0; }
        .floating-input {
          position: relative; z-index: 1; width: 100%;
          border: 1.5px solid; border-radius: 8px;
          padding: 19px 12px 9px; font-family: Inter, sans-serif;
          font-size: 14px; outline: none;
          transition: border-color 0.25s ease;
        }
        .floating-label {
          position: absolute; left: 13px; top: 15px;
          font-size: 13px; pointer-events: none; z-index: 2;
          padding: 0 4px; border-radius: 4px;
          transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .floating-label.floated { top: -8px; left: 9px; font-size: 10.5px; font-weight: 600; }

        .mascot-float { animation: mascotFloat 3.2s ease-in-out infinite; }
        .mascot-hand {
          transform: translateY(0);
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mascot-hand.covering { transform: translateY(-58px); }

        .signup-submit { transition: width 0.35s ease, border-radius 0.35s ease, padding 0.35s ease, opacity 0.15s ease; }
        .signup-submit.is-loading {
          width: 46px !important; min-width: 46px !important;
          border-radius: 999px !important; padding: 11px 0 !important;
        }
        .signup-submit .btn-text { transition: opacity 0.2s ease; }
        .signup-submit.is-loading .btn-text { opacity: 0; }
        .btn-spinner {
          position: absolute; top: 50%; left: 50%;
          width: 16px; height: 16px; margin: -8px 0 0 -8px;
          border: 2px solid rgba(255,255,255,0.35); border-top-color: currentColor;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }

        .success-overlay {
          position: fixed; inset: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px); overflow: hidden;
          animation: fadeIn 0.35s ease;
        }
        .confetti-piece { position: absolute; top: 0; pointer-events: none; animation-name: confettiFall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
        .success-card {
          position: relative; z-index: 2; text-align: center;
          border-radius: 16px; padding: 2.5rem 3rem;
          animation: cardPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .check-circle { stroke-dasharray: 283; stroke-dashoffset: 283; animation: drawCircle 0.6s ease forwards; }
        .check-path { stroke-dasharray: 70; stroke-dashoffset: 70; animation: drawCheck 0.4s ease forwards 0.55s; }

        input:focus, select:focus {
          border-color: ${darkMode ? '#4B5563' : '#09090B'} !important;
          outline: none;
        }
        input::placeholder { color: ${darkMode ? '#6B7280' : '#A1A1AA'}; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${darkMode ? '#374151' : '#D4D4D8'}; border-radius: 2px; }

        .land-btn-p {
          background: ${darkMode ? '#F4F4F5' : '#09090B'};
          color: ${darkMode ? '#09090B' : '#FAFAFA'};
          border: none; padding: 11px 22px; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: Inter, sans-serif; letter-spacing: 0.01em;
          transition: opacity 0.15s ease, transform 0.12s ease;
          display: inline-block;
        }
        .land-btn-p:hover { opacity: 0.88; transform: translateY(-1px); }
        .land-btn-p:active { transform: scale(0.97); }

        .land-btn-g {
          background: transparent;
          color: ${C.text};
          border: 1px solid ${C.border};
          padding: 11px 22px; border-radius: 8px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          font-family: Inter, sans-serif;
          transition: border-color 0.15s ease, transform 0.12s ease, background 0.15s ease;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .land-btn-g:hover { border-color: ${C.text}; transform: translateY(-1px); }
        .land-btn-g:active { transform: scale(0.97); }

        .feat-cell {
          background: ${C.card};
          padding: 1.5rem;
          border-left: 2px solid transparent;
          transition: background 0.18s ease, border-left-color 0.18s ease, transform 0.18s ease;
          cursor: default;
        }
        .feat-cell:hover {
          background: ${C.alt};
          border-left-color: ${darkMode ? '#F4F4F5' : '#09090B'};
          transform: translateX(4px);
        }

        .lb-row {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid ${C.border};
          transition: background 0.15s ease;
          cursor: default;
        }
        .lb-row:last-child { border-bottom: none; }
        .lb-row:hover { background: ${C.alt}; }

        .faq-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${C.text};
          font-family: Inter, sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          transition: color 0.15s ease;
        }
        .faq-btn:hover { color: ${darkMode ? '#CBD5E1' : '#374151'}; }

        .nav-toggler {
          background: transparent;
          color: ${C.muted};
          border: 1px solid ${C.border};
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          font-family: Inter, sans-serif;
          transition: all 0.15s ease;
        }
        .nav-toggler:hover { border-color: ${C.text}; color: ${C.text}; }

        .cta-primary-btn {
          background: ${C.ctaText};
          color: ${C.cta};
          border: none; padding: 12px 24px; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: Inter, sans-serif;
          transition: opacity 0.15s ease, transform 0.12s ease;
        }
        .cta-primary-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cta-primary-btn:active { transform: scale(0.97); }

        .cta-ghost-btn {
          background: transparent;
          color: ${C.ctaSub};
          border: 1px solid ${C.ctaBorder};
          padding: 12px 24px; border-radius: 8px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          font-family: Inter, sans-serif;
          transition: all 0.15s ease;
        }
        .cta-ghost-btn:hover { border-color: ${C.ctaSub}; }

        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .three-col { grid-template-columns: 1fr 1fr !important; }
          .hide-sm { display: none !important; }
        }
      `}</style>

      {darkMode ? <CosmicBackground fixed /> : <LightAuroraBackground fixed />}

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '56px',
        background: darkMode
          ? `rgba(9,9,11,${scrolled ? 0.95 : 0.7})`
          : `rgba(250,250,250,${scrolled ? 0.95 : 0.7})`,
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <span className="gradient-text" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>
          Track-It
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="nav-toggler" onClick={toggleDark}>
            {darkMode ? '☀ Light' : '☾ Dark'}
          </button>
          <button className="land-btn-g" onClick={() => openModal('signin')} style={{ padding: '7px 16px', fontSize: '13px' }}>
            Sign in
          </button>
          <button className="land-btn-p" onClick={() => openModal('signup')} style={{ padding: '7px 16px', fontSize: '13px' }}>
            Get started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7rem 2rem 5rem', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '720px', width: '100%', position: 'relative', zIndex: 1, ...fade(heroIn) }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: C.muted, background: C.card, border: `1px solid ${C.border}`, padding: '4px 12px', borderRadius: '999px', marginBottom: '1.5rem', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>
            Designed for Amrita Chennai Placement Prep
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.04em', color: C.text, margin: 0 }}>
              Stop solving.<br />
              <span className={headingClass} style={darkMode ? { color: C.muted } : {}}>Start retaining.</span>
            </h1>
            <div className="mascot-float">
              <RobotIcon size={72} />
            </div>
          </div>

          <p style={{ fontSize: '1.05rem', color: C.sub, lineHeight: 1.78, marginBottom: '2.5rem', maxWidth: '500px' }}>
            Track-It turns every placement problem you solve into a review that helps you retain the idea long term. It schedules reviews just before forgetting sets in.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button className="land-btn-p hero-cta" onClick={() => openModal('signup')}>
              Start retaining for placements (Free)
            </button>
            <a href="#how" className="land-btn-g">See how it works</a>
          </div>

          {/* Stats + Queue widget */}
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', paddingTop: '2rem', borderTop: `1px solid ${C.border}` }}>
              {HERO_METRICS.map(item => (
                <div key={item.label}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, color: C.text, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Queue widget */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: '14px', padding: '16px',
              boxShadow: darkMode ? '0 16px 40px rgba(0,0,0,0.3)' : '0 16px 40px rgba(0,0,0,0.06)',
              animation: heroIn ? 'fadeIn 0.8s ease 0.3s both' : 'none',
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: C.muted, marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>Daily queue</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: '4px' }}>5 problems due</div>
              <div style={{ fontSize: '12px', color: C.sub, lineHeight: 1.6, marginBottom: '14px' }}>A focused review queue each morning keeps placement prep on track.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {DEMO_QUEUE_TAGS.map(tag => (
                  <span key={tag} style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '999px', background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: C.sub, fontFamily: 'JetBrains Mono, monospace', border: `1px solid ${C.border}` }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section style={{ padding: '2.75rem 0', background: C.section, borderBottom: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem', fontFamily: 'JetBrains Mono, monospace' }}>
          Log problems from any platform
        </div>
        <div style={{
          maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        }}>
          <div className="platform-track">
            {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <div key={i} className="platform-badge" style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}>
                <PlatformIcon mark={p.mark} color={p.color} size={20} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORGETTING CURVE ── */}
      <section ref={curveRef} style={{ padding: '6rem 2rem', background: C.section, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ ...fade(curveIn), marginBottom: '3rem' }}>
            <div style={eyebrow}>The Problem</div>
            <h2 className={headingClass} style={{ ...h2style, marginBottom: '0.75rem' }}>You forget 70% of what you solve within 24 hours.</h2>
            <p style={{ fontSize: '15px', color: C.sub, maxWidth: '480px', lineHeight: 1.7 }}>Ebbinghaus's forgetting curve, established in 1885. The fix is spaced repetition — review just before you forget and the memory consolidates permanently.</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', ...fade(curveIn, 0.15) }}>
            {/* Without */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.75rem' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Without review</div>
              {[['Day 1', 100], ['Day 3', 40], ['Day 7', 20], ['Day 30', 5]].map(([l, pct]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted, width: '44px', flexShrink: 0 }}>{l}</div>
                  <div style={{ flex: 1, height: '6px', background: C.panel, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#FCA5A5', width: curveIn ? pct + '%' : '0%', borderRadius: '3px', transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted, width: '32px', textAlign: 'right' }}>{pct}%</div>
                </div>
              ))}
              <p style={{ fontSize: '12px', color: C.muted, marginTop: '1rem', lineHeight: 1.6, paddingTop: '1rem', borderTop: `1px solid ${C.border}` }}>
                Grinding 200 problems means nothing if you can't reproduce them under pressure.
              </p>
            </div>
            {/* With */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.75rem' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>With Track-It</div>
              {[['Review 1', 100], ['Review 2', 100], ['Review 3', 100], ['Review 4', 100]].map(([l, pct]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted, width: '44px', flexShrink: 0 }}>{l}</div>
                  <div style={{ flex: 1, height: '6px', background: C.panel, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#86EFAC', width: curveIn ? pct + '%' : '0%', borderRadius: '3px', transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.35s' }} />
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted, width: '32px', textAlign: 'right' }}>{pct}%</div>
                </div>
              ))}
              <p style={{ fontSize: '12px', color: C.muted, marginTop: '1rem', lineHeight: 1.6, paddingTop: '1rem', borderTop: `1px solid ${C.border}` }}>
                After 4 spaced reviews, the pattern becomes automatic. Solving and knowing are different things.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS + DEMO ── */}
      <section id="how" ref={howRef} style={{ padding: '6rem 2rem', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem', ...fade(howIn) }}>
            <div style={eyebrow}>How it works</div>
            <h2 className={headingClass} style={h2style}>Try it — this is the real experience.</h2>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
            <div style={{ ...fade(howIn, 0.1) }}>
              <DemoCard darkMode={darkMode} showToast={showToast} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', ...fade(howIn, 0.2) }}>
              {HOW_IT_WORKS.map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: C.muted, paddingTop: '3px', flexShrink: 0, width: '20px' }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '6px' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: C.sub, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── YOUR JOURNEY ── */}
      <section ref={journeyRef} style={{ padding: '6rem 2rem', borderBottom: `1px solid ${C.border}`, position: 'relative' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem', ...fade(journeyIn) }}>
            <div style={eyebrow}>Your journey</div>
            <h2 className={headingClass} style={h2style}>From first solve to placement-ready.</h2>
            <p style={{ fontSize: '14px', color: C.sub, marginTop: '0.6rem', maxWidth: '480px', lineHeight: 1.7 }}>Every problem you log starts a personal learning-and-reviewing loop — here's what that looks like over time.</p>
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${JOURNEY_STEPS.length}, 1fr)`, gap: '12px' }} className="three-col">
            {journeyIn && <div className="journey-line" />}
            {JOURNEY_STEPS.map((s, i) => (
              <div key={s.title} className="journey-node" style={{ textAlign: 'center', animationDelay: `${i * 0.12}s`, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: C.card, border: `2px solid ${C.border}`,
                  fontSize: '20px', color: C.text, fontFamily: 'JetBrains Mono, monospace',
                  boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '5px', fontFamily: 'JetBrains Mono, monospace' }}>{s.title}</div>
                <div style={{ fontSize: '11.5px', color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} style={{ padding: '6rem 2rem', background: C.section, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem', ...fade(featIn) }}>
            <div style={eyebrow}>Features</div>
            <h2 className={headingClass} style={h2style}>Everything built to make knowledge stick.</h2>
          </div>
          <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: C.border, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feat-cell"
                style={{ ...fade(featIn, i * 0.05) }}
              >
                <div className="feat-icon" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', color: C.text, marginBottom: '10px' }}>{f.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: C.text, marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: C.muted, lineHeight: 1.65 }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" ref={faqRef} style={{ padding: '5rem 2rem', background: C.alt, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem', ...fade(faqIn) }}>
            <div style={eyebrow}>FAQ</div>
            <h2 className={headingClass} style={h2style}>Quick answers.</h2>
          </div>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.q}
              style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: '10px', marginBottom: '10px', overflow: 'hidden',
                ...fade(faqIn, i * 0.08),
                transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s, border-color 0.2s ease`,
                borderColor: faqOpen === i ? (darkMode ? '#374151' : '#D1D5DB') : C.border,
              }}
            >
              <button className="faq-btn" onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}>
                <span>{item.q}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', color: C.muted, fontSize: '16px',
                  transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform 0.25s ease',
                  display: 'inline-block',
                }}>+</span>
              </button>
              <div style={{
                maxHeight: faqOpen === i ? '200px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                <div style={{ padding: '0 20px 18px', color: C.sub, fontSize: '14px', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section id="leaderboard" ref={lbRef} style={{ padding: '6rem 2rem', background: C.section, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ ...fade(lbIn) }}>
              <div style={eyebrow}>Leaderboard</div>
              <h2 className={headingClass} style={{ ...h2style, marginBottom: '1rem' }}>Your batchmates are already grinding.</h2>
              <p style={{ fontSize: '14px', color: C.sub, lineHeight: 1.75, marginBottom: '1rem' }}>
                A competitive ladder for Amrita Chennai students only. See exactly where you stand with peers who are also prepping for placements.
              </p>
              <p style={{ fontSize: '14px', color: C.sub, lineHeight: 1.75, marginBottom: '1.5rem' }}>
                Streaks show daily review consistency — not just problem counts. Keep the streak and your focus area sharp.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.muted, background: C.alt, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                Appear after solving 10+ problems
              </div>
            </div>

            <div style={{ ...fade(lbIn, 0.15) }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: C.text, fontFamily: 'JetBrains Mono, monospace' }}>Amrita Chennai</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#16A34A', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ width: '5px', height: '5px', background: '#16A34A', borderRadius: '50%', animation: 'liveBlip 1.8s ease-in-out infinite' }} />
                    Live
                  </div>
                </div>

                {LB_ROWS.map((r, i) => (
                  <div
                    key={r.name}
                    className="lb-row"
                    style={{
                      opacity: lbIn ? (r.blur ? 0.45 : 1) : 0,
                      transform: lbIn ? 'translateX(0)' : 'translateX(-16px)',
                      transition: `opacity 0.45s ease ${i * 0.09}s, transform 0.45s ease ${i * 0.09}s`,
                      filter: r.blur ? 'blur(3px)' : 'none',
                    }}
                  >
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: i < 3 ? C.text : C.muted, textAlign: 'center' }}>
                      {i === 0 ? '①' : i === 1 ? '②' : i === 2 ? '③' : `${i + 1}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.alt, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: C.sub, flexShrink: 0 }}>
                        {r.blur ? '??' : r.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{r.blur ? '••••• •••••' : r.name}</div>
                        <div style={{ fontSize: '11px', color: C.muted }}>{r.blur ? 'CSE · ?rd Year' : r.dept}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.text, fontFamily: 'JetBrains Mono, monospace' }}>{r.blur ? '?,???' : r.xp} XP</div>
                      <div style={{ fontSize: '11px', color: C.muted, fontFamily: 'JetBrains Mono, monospace' }}>🔥 {r.blur ? '??d' : r.streak} streak</div>
                    </div>
                  </div>
                ))}

                {/* FOMO row */}
                <div style={{
                  padding: '14px 18px',
                  borderTop: `1px solid ${C.border}`,
                  background: darkMode ? 'rgba(79,70,229,0.06)' : 'rgba(79,70,229,0.03)',
                  animation: lbIn ? 'fomoPulse 3s ease-in-out infinite' : 'none',
                }}>
                  <div style={{ fontSize: '13px', color: C.muted, marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
                    You? (CSE · Your Year) — Join the ladder
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button className="land-btn-p" onClick={() => openModal('signup')} style={{ fontSize: '13px', padding: '8px 18px' }}>
                      Claim your spot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} style={{ padding: '7rem 2rem', background: C.cta }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', ...fade(ctaIn) }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.04em', color: C.ctaText, marginBottom: '1rem' }}>
            Placement season doesn't wait.
          </h2>
          <p style={{ fontSize: '15px', color: C.ctaSub, lineHeight: 1.75, marginBottom: '0.5rem' }}>
            The students who retained what they practiced will outperform the ones who just solved more.
          </p>
          <p style={{ fontSize: '12px', color: C.ctaSub, marginBottom: '2.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
            Built by Amrita Chennai CSE students · In active development
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button className="cta-primary-btn" onClick={() => openModal('signup')}>Create free account</button>
            <button className="cta-ghost-btn" onClick={() => openModal('signin')}>Sign in</button>
          </div>
          <p style={{ fontSize: '12px', color: C.ctaSub, fontFamily: 'JetBrains Mono, monospace' }}>
            {DOMAIN} · Free forever · No credit card
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.cta, borderTop: `1px solid ${C.ctaBorder}`, padding: '4.5rem 2rem 0' }}>
        <div className="footer-grid" style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 0.9fr 0.9fr 0.9fr 0.9fr 0.9fr', gap: '2.25rem', paddingBottom: '2.5rem' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>🚀</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', fontWeight: 700, color: C.ctaText }}>Track-It</span>
            </div>
            <p style={{ fontSize: '13px', color: C.ctaSub, lineHeight: 1.7, marginBottom: '18px', maxWidth: '260px' }}>
              Master DSA with active recall, spaced repetition, and a peer leaderboard built exclusively for Amrita Chennai students.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => <PlatformIcon key={p.name} mark={p.mark} color={p.color} size={24} />)}
            </div>
          </div>

          <div>
            <div style={footerHead}>Product</div>
            <a href="#features" style={footerLink}>Features</a>
            <a href="#how" style={footerLink}>How it works</a>
            <a href="#leaderboard" style={footerLink}>Leaderboard</a>
            <a href="#faq" style={footerLink}>FAQ</a>
          </div>

          <div>
            <div style={footerHead}>Learn</div>
            <a href="#features" style={footerLink}>Spaced Repetition</a>
            <a href="#features" style={footerLink}>Weak Topic Radar</a>
            <a href="#features" style={footerLink}>Master Notebook</a>
            <a href="#features" style={footerLink}>XP &amp; Rank Ladder</a>
          </div>

          <div>
            <div style={footerHead}>Account</div>
            <span onClick={() => openModal('signup')} style={{ ...footerLink, cursor: 'pointer' }}>Create account</span>
            <span onClick={() => openModal('signin')} style={{ ...footerLink, cursor: 'pointer' }}>Sign in</span>
            <a href="#faq" style={footerLink}>Help &amp; FAQ</a>
          </div>

          <div>
            <div style={footerHead}>Company</div>
            <a href="#" style={footerLink}>About</a>
            <a href="#" style={footerLink}>Contact</a>
            <a href="#" style={footerLink}>Feedback</a>
          </div>

          <div>
            <div style={footerHead}>Legal</div>
            <a href="#" style={footerLink}>Privacy Policy</a>
            <a href="#" style={footerLink}>Terms of Service</a>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.ctaBorder}`, maxWidth: '1140px', margin: '0 auto', padding: '1.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: C.ctaSub, fontFamily: 'JetBrains Mono, monospace' }}>📧 example@ch.students.amrita.edu</span>
          <span style={{ fontSize: '12px', color: C.ctaSub, fontFamily: 'JetBrains Mono, monospace' }}>🌍 Amrita Vishwa Vidyapeetham · Chennai Campus</span>
        </div>

        <div style={{ borderTop: `1px solid ${C.ctaBorder}`, maxWidth: '1140px', margin: '0 auto', padding: '1.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '0 0 6px' }}>
              <a href="/about" style={{ fontSize: '12px', color: C.ctaSub, textDecoration: 'underline' }}>About</a>
              <a href="/contact" style={{ fontSize: '12px', color: C.ctaSub, textDecoration: 'underline' }}>Contact</a>
              <a href="/privacy" style={{ fontSize: '12px', color: C.ctaSub, textDecoration: 'underline' }}>Privacy</a>
              <a href="/terms" style={{ fontSize: '12px', color: C.ctaSub, textDecoration: 'underline' }}>Terms</a>
            </div>
            <span style={{ fontSize: '11.5px', color: C.ctaSub }}>© 2026 Track-It. Built for students who want to become better programmers.</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ fontSize: '11.5px', color: C.ctaSub, textDecoration: 'none' }}>GitHub</a>
            <a href="#" style={{ fontSize: '11.5px', color: C.ctaSub, textDecoration: 'none' }}>LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* ── SIGNUP MODAL ── */}
      {modal === 'signup' && !suSuccess && (
        <div onClick={overlayClick} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '1.75rem 2rem 2rem', position: 'relative', animation: 'modalIn 0.22s ease', maxHeight: '92vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: C.muted, lineHeight: 1, zIndex: 3 }}>✕</button>

            <Mascot covering={pwFocused} C={C} />

            <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: C.text }}>Track-It</div>
            <h2 style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px', color: C.text }}>Create your account</h2>
            <p style={{ textAlign: 'center', fontSize: '13px', color: C.muted, marginBottom: '1.1rem' }}>
              Already have one? <span onClick={() => switchModal('signin')} style={{ color: C.text, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Sign in</span>
            </p>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 12px', marginBottom: '1.25rem', fontSize: '12px', color: C.muted, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
              Requires {DOMAIN}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FloatingInput name="firstName" label="First name" C={C} value={su.firstName} error={suErrors.firstName} shakeTick={suShakeTick}
                onChange={e => { setSu(p => ({ ...p, firstName: e.target.value })); setSuErrors(er => ({ ...er, firstName: false })) }} />
              <FloatingInput name="lastName" label="Last name" optional C={C} value={su.lastName} shakeTick={suShakeTick}
                onChange={e => setSu(p => ({ ...p, lastName: e.target.value }))} />
            </div>

            <FloatingInput name="email" label="College email" type="email" autoComplete="email" C={C} value={su.email} error={suErrors.email} shakeTick={suShakeTick}
              onChange={e => { setSu(p => ({ ...p, email: e.target.value })); setSuErrors(er => ({ ...er, email: false })) }} />

            <div key={suErrors.dept ? `dept-err-${suShakeTick}` : 'dept'} className={`floating-field${suErrors.dept ? ' field-error' : ''}`} style={{ marginBottom: '20px' }}>
              <label style={lbl}>Department</label>
              <select style={{ ...inp, borderColor: suErrors.dept ? '#DC2626' : C.border }} value={su.dept} onChange={e => { setSu(p => ({ ...p, dept: e.target.value })); setSuErrors(er => ({ ...er, dept: false })) }}>
                <option value="" disabled>Select</option>
                {['CSE','AIE','AI/DS','RAI','CCE','MECH','ECE'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div key={suErrors.year ? `year-err-${suShakeTick}` : 'year'} className={`floating-field${suErrors.year ? ' field-error' : ''}`} style={{ marginBottom: '18px' }}>
              <label style={lbl}>Year</label>
              <select style={{ ...inp, borderColor: suErrors.year ? '#DC2626' : C.border }} value={su.year} onChange={e => { setSu(p => ({ ...p, year: e.target.value })); setSuErrors(er => ({ ...er, year: false })) }}>
                <option value="" disabled>Select</option>
                {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 600, color: C.muted, marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 1 · Choose a password
            </div>
            <FloatingInput name="password" label="Password" type="password" autoComplete="new-password" C={C} value={su.password} error={suErrors.password} shakeTick={suShakeTick}
              onFocusChange={f => setPwFocused(f)}
              onChange={e => { setSu(p => ({ ...p, password: e.target.value })); setSuErrors(er => ({ ...er, password: false })) }} />
            <PasswordStrength password={su.password} C={C} />

            <div style={{ fontSize: '11px', fontWeight: 600, color: C.muted, marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Step 2 · Confirm password
            </div>
            <FloatingInput name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" C={C} value={su.confirmPassword} error={suErrors.confirmPassword} shakeTick={suShakeTick}
              onFocusChange={f => setPwFocused(f)}
              onChange={e => { setSu(p => ({ ...p, confirmPassword: e.target.value })); setSuErrors(er => ({ ...er, confirmPassword: false })) }} />
            {su.confirmPassword && (
              <div style={{ marginTop: '-10px', marginBottom: '14px', fontSize: '11.5px', color: su.confirmPassword === su.password ? '#16A34A' : '#DC2626', transition: 'color 0.2s ease' }}>
                {su.confirmPassword === su.password ? '✓ Passwords match' : 'Passwords do not match yet'}
              </div>
            )}

            <button
              className={`land-btn-p signup-submit${suSubmitting ? ' is-loading' : ''}`}
              onClick={handleSignup}
              disabled={suSubmitting}
              style={{ width: '100%', padding: '11px', marginTop: '6px', position: 'relative', overflow: 'hidden', color: darkMode ? '#09090B' : '#FAFAFA' }}
            >
              <span className="btn-text">Create account</span>
              {suSubmitting && <span className="btn-spinner" />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.25rem' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${C.border}` }} />
              <span style={{ fontSize: '11px', color: C.muted, whiteSpace: 'nowrap' }}>Free forever · No card needed</span>
              <hr style={{ flex: 1, border: 'none', borderTop: `1px solid ${C.border}` }} />
            </div>
          </div>
        </div>
      )}

      {/* ── SIGNUP SUCCESS ── */}
      {suSuccess && <SuccessOverlay name={su.firstName} C={C} />}

      {/* ── SIGNIN MODAL ── */}
      {modal === 'signin' && (
        <div onClick={overlayClick} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '2rem', position: 'relative', animation: 'modalIn 0.22s ease' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: C.muted, lineHeight: 1 }}>✕</button>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: C.text }}>Track-It</div>
            {!forgot ? (
              <>
                <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px', color: C.text }}>Welcome back</h2>
                <p style={{ fontSize: '13px', color: C.muted, marginBottom: '1.25rem' }}>
                  New here? <span onClick={() => switchModal('signup')} style={{ color: C.text, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Create account</span>
                </p>
                <div style={{ marginBottom: '10px' }}><label style={lbl}>College email</label><input type="email" style={inp} placeholder={`ch.sc.u4cse22xxx${DOMAIN}`} value={si.email} onChange={e => setSi(p => ({ ...p, email: e.target.value }))} /></div>
                <div style={{ marginBottom: '6px' }}><label style={lbl}>Password</label><input type="password" style={inp} placeholder="Your password" value={si.password} onChange={e => setSi(p => ({ ...p, password: e.target.value }))} /></div>
                <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                  <span onClick={() => setForgot(true)} style={{ fontSize: '12px', color: C.muted, cursor: 'pointer', textDecoration: 'underline' }}>Forgot password?</span>
                </div>
                <button className="land-btn-p" onClick={handleSignin} style={{ width: '100%', padding: '11px' }}>Sign in</button>
              </>
            ) : (
              <>
                <button onClick={() => setForgot(false)} style={{ background: 'none', border: 'none', fontSize: '13px', color: C.muted, cursor: 'pointer', padding: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ← Back
                </button>
                <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px', color: C.text }}>Reset password</h2>
                <p style={{ fontSize: '13px', color: C.muted, marginBottom: '1.25rem' }}>Enter your college email and we'll send a reset link.</p>
                <div style={{ marginBottom: '1rem' }}><label style={lbl}>College email</label><input type="email" style={inp} placeholder={`ch.sc.u4cse22xxx${DOMAIN}`} value={fe} onChange={e => setFe(e.target.value)} /></div>
                <button className="land-btn-p" onClick={handleForgot} style={{ width: '100%', padding: '11px' }}>Send reset link</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)',
        background: toast.ok ? C.card : (darkMode ? 'rgba(127,29,29,0.9)' : '#FEF2F2'),
        border: `1px solid ${toast.ok ? C.border : (darkMode ? '#991B1B' : '#FECACA')}`,
        borderLeft: `3px solid ${toast.ok ? (darkMode ? '#4B5563' : '#09090B') : '#DC2626'}`,
        color: toast.ok ? C.text : (darkMode ? '#FECACA' : '#DC2626'),
        borderRadius: '8px', padding: '10px 18px',
        fontSize: '13px', fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        zIndex: 999,
        opacity: toast.show ? 1 : 0,
        animation: toast.show ? 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1)' : 'none',
        transition: 'opacity 0.25s ease',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        {toast.msg}
      </div>
    </div>
  )
}