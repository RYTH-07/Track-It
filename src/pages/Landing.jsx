import React, { useState, useEffect, useRef, useCallback } from 'react'

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

const HOW_IT_WORKS = [
  { n: '01', title: 'Log after solving', body: 'Title, link, topic, a quick note on your approach. Under 30 seconds. LeetCode, GFG, contest problems — any platform.' },
  { n: '02', title: 'Recall first, then reveal', body: 'Notes are hidden on every card. Force your brain to retrieve the approach before checking. Active recall — the mechanism that builds durable memory.' },
  { n: '03', title: 'Show up when scheduled', body: 'Again · 1d    Hard · 3d    Good · 7d    Master · 14d\n\nYour queue updates automatically every morning. No planning required.' },
]

const FAQ_ITEMS = [
  { q: 'Does it support LeetCode, CodeChef, GFG?', a: "Yes — log problems from any platform. Paste the link or just the title. Track-It doesn't care where the problem came from." },
  { q: 'How much time does logging a problem take?', a: 'Under 30 seconds. Title, topic, difficulty, and a short approach note. The SR scheduling happens automatically after that.' },
  { q: 'Why is it restricted to @ch.students.amrita.edu?', a: 'The leaderboard and community layer only works if everyone on it is a real peer you know. Campus exclusivity is the feature, not the limitation.' },
]

// ─── Intersection observer ────────────────────────────────────────────────────
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

// ─── Particle Canvas ─────────────────────────────────────────────────────────
function ParticleCanvas({ darkMode }) {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = 0, H = 0
    let particles = []

    const PARTICLE_COLOR = darkMode
      ? 'rgba(148,163,184,'  // slate-400 in dark
      : 'rgba(100,116,139,'  // slate-500 in light

    const LINE_COLOR = darkMode
      ? 'rgba(99,102,241,'   // indigo tint in dark
      : 'rgba(79,70,229,'    // violet tint in light

    const resize = () => {
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H
      initParticles()
    }

    const initParticles = () => {
      const count = Math.floor((W * H) / 14000)
      particles = Array.from({ length: Math.min(count, 80) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.5 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Update + draw particles
      particles.forEach(p => {
        // Drift
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.012

        // Mouse attraction (gentle)
        const dx = mouse.current.x - p.x
        const dy = mouse.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160) {
          const force = (160 - dist) / 160 * 0.018
          p.vx += dx * force * 0.1
          p.vy += dy * force * 0.1
        }

        // Dampen velocity
        p.vx *= 0.995
        p.vy *= 0.995

        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 0.8) { p.vx = (p.vx / speed) * 0.8; p.vy = (p.vy / speed) * 0.8 }

        // Wrap edges
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10

        // Pulsing opacity
        const o = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = PARTICLE_COLOR + o + ')'
        ctx.fill()
      })

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            const alpha = (1 - d / 120) * 0.18
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = LINE_COLOR + alpha + ')'
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMouseLeave = () => { mouse.current = { x: -9999, y: -9999 } }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [darkMode])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    />
  )
}

// ─── Demo Card ────────────────────────────────────────────────────────────────
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
    card:   darkMode ? '#111827' : '#FFFFFF',
    panel:  darkMode ? '#0F172A' : '#F8FAFC',
    border: darkMode ? '#1F2937' : '#E4E4E7',
    text:   darkMode ? '#F4F4F5' : '#09090B',
    muted:  darkMode ? '#94A3B8' : '#71717A',
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
      setTimeout(() => setEntering(false), 340)
      setTimeout(() => setLastXp(null), 1400)
    }, 300)
  }

  const pct = Math.min(100, Math.round((xp / 100) * 100))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted }}>
          Novice · {xp} XP
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#16A34A',
          opacity: lastXp ? 1 : 0,
          transform: lastXp ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}>
          +{lastXp} XP ✓
        </span>
      </div>

      <div style={{ height: '3px', background: C.border, borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: darkMode ? '#F4F4F5' : '#09090B',
          width: pct + '%',
          borderRadius: '2px',
          transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>

      <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        padding: '20px',
        minHeight: '270px',
        opacity: exiting ? 0 : entering ? 0 : 1,
        transform: exiting ? 'translateY(-12px) scale(0.98)' : entering ? 'translateY(10px)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.35)' : '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>{p.title}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', background: darkMode ? 'rgba(22,163,74,0.12)' : '#F0FDF4', border: darkMode ? '1px solid rgba(22,163,74,0.3)' : '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                {p.difficulty}
              </span>
              {p.topics.map(t => (
                <span key={t} style={{ fontSize: '11px', color: C.muted, background: C.panel, border: `1px solid ${C.border}`, padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{t}</span>
              ))}
            </div>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: C.muted }}>{idx + 1}/{DEMO_PROBLEMS.length}</span>
        </div>

        {!revealed ? (
          <div style={{ background: C.panel, border: `1px dashed ${C.border}`, borderRadius: '8px', padding: '22px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px', color: C.muted, animation: 'demoPulse 2.5s ease-in-out infinite' }}>◎</div>
            <div style={{ fontSize: '13px', color: C.muted, marginBottom: '14px', lineHeight: 1.5 }}>Recall the approach before revealing.</div>
            <button
              onClick={() => setRevealed(true)}
              style={{ background: C.text, color: C.card, border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'transform 0.1s ease, opacity 0.15s ease' }}
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
            background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px',
            padding: '14px', marginBottom: '16px', fontSize: '13px', color: C.text,
            lineHeight: 1.7, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-line',
            animation: 'revealSlide 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {p.notes}
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px',
          opacity: revealed ? 1 : 0.2, pointerEvents: revealed ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}>
          {Object.entries(MASTERY).map(([key, cfg], i) => {
            const isHov = hoveredBtn === key
            const bg = darkMode ? cfg.darkBg : cfg.bg
            const bd = darkMode ? cfg.darkBorder : cfg.border
            return (
              <button key={key}
                onClick={() => rate(key)}
                onMouseEnter={() => setHoveredBtn(key)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  background: isHov ? cfg.color : bg,
                  border: `1px solid ${isHov ? cfg.color : bd}`,
                  color: isHov ? '#fff' : cfg.color,
                  padding: '8px 4px', borderRadius: '6px', fontSize: '11px',
                  fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', textAlign: 'center', lineHeight: 1.4,
                  transition: 'all 0.15s ease',
                  transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHov ? `0 4px 12px ${cfg.color}44` : 'none',
                  animation: revealed ? `btnAppear 0.3s ease ${i * 0.07}s both` : 'none',
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
        <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '11px', color: '#16A34A', fontFamily: 'JetBrains Mono, monospace', animation: 'fadeIn 0.3s ease' }}>
          {reviewed} reviewed this session · Log in to save your progress →
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Landing({
  onSignIn = () => {},
  onSignUp = () => {},
  onForgotPassword = () => {},
  darkMode = true,
  toggleDark = () => {},
}) {
  const [modal, setModal] = useState(null)
  const [forgot, setForgot] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', ok: true })
  const [scrolled, setScrolled] = useState(false)
  const [faqOpen, setFaqOpen] = useState(-1)
  const [heroVisible, setHeroVisible] = useState(false)

  const [su, setSu] = useState({ firstName: '', lastName: '', email: '', dept: '', year: '', password: '' })
  const [si, setSi] = useState({ email: '', password: '' })
  const [fe, setFe] = useState('')

  const [heroRef, heroIn] = useInView(0.1)
  const [curveRef, curveIn] = useInView(0.15)
  const [howRef, howIn] = useInView(0.1)
  const [featRef, featIn] = useInView(0.1)
  const [lbRef, lbIn] = useInView(0.15)
  const [faqRef, faqIn] = useInView(0.15)
  const [ctaRef, ctaIn] = useInView(0.2)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

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

  const handleSignup = async () => {
    if (!su.firstName || !su.lastName) return showToast('Enter your full name.', false)
    if (!su.email) return showToast('Enter your email.', false)
    if (!isAmritaEmail(su.email)) return showToast('Track-It is exclusive to Amrita Chennai students.', false)
    if (!su.dept) return showToast('Select your department.', false)
    if (!su.year) return showToast('Select your year.', false)
    if (su.password.length < 8) return showToast('Password must be at least 8 characters.', false)
    const r = await onSignUp(su.email, su.password)
    if (r?.error) return showToast(r.error.message || 'Signup failed.', false)
    closeModal(); showToast(`Account created. Welcome, ${su.firstName}.`, true)
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

  const C = {
    bg:        darkMode ? '#09090B' : '#FAFAFA',
    text:      darkMode ? '#F4F4F5' : '#09090B',
    section:   darkMode ? '#0F172A' : '#FFFFFF',
    alt:       darkMode ? '#111827' : '#F8FAFC',
    card:      darkMode ? '#111827' : '#FFFFFF',
    panel:     darkMode ? '#0F172A' : '#FAFAFA',
    border:    darkMode ? '#1F2937' : '#E4E4E7',
    muted:     darkMode ? '#94A3B8' : '#71717A',
    sub:       darkMode ? '#CBD5E1' : '#52525B',
    cta:       '#09090B',
    ctaText:   '#F4F4F5',
    ctaSub:    darkMode ? '#94A3B8' : '#CBD5E1',
    ctaBorder: darkMode ? '#374151' : '#D1D5DB',
  }

  const inp = { width: '100%', background: C.panel, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 12px', color: C.text, fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s ease' }
  const lbl = { display: 'block', fontSize: '11px', fontWeight: 600, color: C.muted, marginBottom: '5px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }
  const eyebrow = { fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }
  const h2s = { fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: C.text }

  const stagger = (v, i = 0, base = 0) => ({
    opacity: v ? 1 : 0,
    transform: v ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.65s ease ${base + i * 0.1}s, transform 0.65s ease ${base + i * 0.1}s`,
  })

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes revealSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes btnAppear { from { opacity:0; transform:translateY(8px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes toastSlide { from { opacity:0; transform:translateX(-50%) translateY(14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes demoPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
        @keyframes liveBlip { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.3;transform:scale(0.65);} }
        @keyframes fomoPulse { 0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,0);} 50%{box-shadow:0 0 0 4px rgba(79,70,229,0.12);} }
        @keyframes floatWidget { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        input:focus, select:focus { border-color: ${darkMode ? '#4B5563' : '#09090B'} !important; outline:none; }
        input::placeholder { color: ${darkMode ? '#6B7280' : '#A1A1AA'}; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${darkMode ? '#374151' : '#D4D4D8'}; border-radius:2px; }

        .land-p {
          background:${darkMode ? '#F4F4F5' : '#09090B'};
          color:${darkMode ? '#09090B' : '#FAFAFA'};
          border:none; padding:11px 22px; border-radius:8px;
          font-size:14px; font-weight:600; cursor:pointer;
          font-family:Inter,sans-serif; letter-spacing:0.01em;
          transition:opacity 0.15s ease,transform 0.12s ease;
          display:inline-block;
        }
        .land-p:hover { opacity:0.88; transform:translateY(-1px); }
        .land-p:active { transform:scale(0.97); }

        .land-g {
          background:transparent; color:${C.text};
          border:1px solid ${C.border}; padding:11px 22px; border-radius:8px;
          font-size:14px; font-weight:500; cursor:pointer; font-family:Inter,sans-serif;
          transition:border-color 0.15s,transform 0.12s,background 0.15s;
          text-decoration:none; display:inline-flex; align-items:center;
        }
        .land-g:hover { border-color:${C.text}; transform:translateY(-1px); }
        .land-g:active { transform:scale(0.97); }

        .feat-cell {
          background:${C.card}; padding:1.5rem;
          border-left:2px solid transparent;
          transition:background 0.18s,border-left-color 0.18s,transform 0.18s;
          cursor:default;
        }
        .feat-cell:hover {
          background:${C.alt};
          border-left-color:${darkMode ? '#F4F4F5' : '#09090B'};
          transform:translateX(4px);
        }

        .lb-row {
          display:grid; grid-template-columns:28px 1fr auto;
          align-items:center; gap:12px; padding:12px 18px;
          border-bottom:1px solid ${C.border};
          transition:background 0.15s; cursor:default;
        }
        .lb-row:last-child { border-bottom:none; }
        .lb-row:hover { background:${C.alt}; }

        .faq-btn {
          width:100%; display:flex; justify-content:space-between; align-items:center;
          padding:18px 20px; background:transparent; border:none; cursor:pointer;
          color:${C.text}; font-family:Inter,sans-serif; font-size:14px; font-weight:600;
          text-align:left; transition:color 0.15s;
        }
        .faq-btn:hover { color:${darkMode ? '#CBD5E1' : '#374151'}; }

        .nav-tog {
          background:transparent; color:${C.muted}; border:1px solid ${C.border};
          padding:6px 12px; border-radius:6px; font-size:13px; cursor:pointer;
          font-family:Inter,sans-serif; transition:all 0.15s;
        }
        .nav-tog:hover { border-color:${C.text}; color:${C.text}; }

        .cta-p {
          background:#F4F4F5; color:#09090B; border:none; padding:12px 24px;
          border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
          font-family:Inter,sans-serif; transition:opacity 0.15s,transform 0.12s;
        }
        .cta-p:hover { opacity:0.9; transform:translateY(-1px); }
        .cta-p:active { transform:scale(0.97); }

        .cta-g {
          background:transparent; color:${C.ctaSub}; border:1px solid ${C.ctaBorder};
          padding:12px 24px; border-radius:8px; font-size:14px; font-weight:500;
          cursor:pointer; font-family:Inter,sans-serif; transition:all 0.15s;
        }
        .cta-g:hover { border-color:${C.ctaSub}; }

        @media(max-width:768px){
          .two-col{grid-template-columns:1fr!important;gap:2rem!important;}
          .three-col{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 2rem',height:'56px',
        background: darkMode ? `rgba(9,9,11,${scrolled?0.95:0.6})` : `rgba(250,250,250,${scrolled?0.95:0.6})`,
        backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${scrolled?C.border:'transparent'}`,
        transition:'background 0.3s,border-color 0.3s',
      }}>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:700,fontSize:'15px',color:C.text,letterSpacing:'-0.02em'}}>
          Track-It
        </span>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button className="nav-tog" onClick={toggleDark}>{darkMode?'☀ Light':'☾ Dark'}</button>
          <button className="land-g" onClick={()=>openModal('signin')} style={{padding:'7px 16px',fontSize:'13px'}}>Sign in</button>
          <button className="land-p" onClick={()=>openModal('signup')} style={{padding:'7px 16px',fontSize:'13px'}}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        padding:'7rem 2rem 5rem', borderBottom:`1px solid ${C.border}`,
        position:'relative', overflow:'hidden',
      }}>
        {/* Particle background */}
        <ParticleCanvas darkMode={darkMode} />

        {/* Radial gradient overlay */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          background: darkMode
            ? 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79,70,229,0.08) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79,70,229,0.05) 0%, transparent 70%)',
        }} />

        {/* Animated gradient line at top */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'1px',
          background:'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(139,92,246,0.6), transparent)',
          backgroundSize:'200% 100%',
          animation:'gradShift 4s ease infinite',
        }} />

        <div style={{maxWidth:'720px',width:'100%',position:'relative',zIndex:1}}>
          {/* Staggered hero children */}
          <div style={{...stagger(heroVisible,0), display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'11px', fontWeight:600, color:C.muted, background:C.card, border:`1px solid ${C.border}`, padding:'4px 12px', borderRadius:'999px', marginBottom:'1.5rem', fontFamily:'JetBrains Mono,monospace', letterSpacing:'0.04em'}}>
            <span style={{width:'5px',height:'5px',background:'#4ADE80',borderRadius:'50%',display:'inline-block',animation:'liveBlip 2s ease-in-out infinite'}}/>
            Designed for Amrita Chennai Placement Prep
          </div>

          <h1 style={{...stagger(heroVisible,1), fontFamily:'JetBrains Mono,monospace', fontSize:'clamp(2.4rem,5.5vw,3.8rem)', fontWeight:700, lineHeight:1.08, letterSpacing:'-0.04em', marginBottom:'1.5rem', color:C.text}}>
            Stop solving.<br/>
            <span style={{color:C.muted}}>Start retaining.</span>
          </h1>

          <p style={{...stagger(heroVisible,2), fontSize:'1.05rem', color:C.sub, lineHeight:1.78, marginBottom:'2.5rem', maxWidth:'500px'}}>
            Track-It turns every placement problem you solve into a review that helps you retain the idea long term. It schedules reviews just before forgetting sets in.
          </p>

          <div style={{...stagger(heroVisible,3), display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'3rem'}}>
            <button className="land-p" onClick={()=>openModal('signup')}>Start retaining for placements (Free)</button>
            <a href="#how" className="land-g">See how it works</a>
          </div>

          {/* Stats + widget */}
          <div className="two-col" style={{...stagger(heroVisible,4), display:'grid', gridTemplateColumns:'1fr 220px', gap:'20px', alignItems:'start'}}>
            <div style={{display:'flex', gap:'2.5rem', flexWrap:'wrap', paddingTop:'2rem', borderTop:`1px solid ${C.border}`}}>
              {HERO_METRICS.map(m=>(
                <div key={m.label}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'1.2rem',fontWeight:700,color:C.text,lineHeight:1}}>{m.value}</div>
                  <div style={{fontSize:'12px',color:C.muted,marginTop:'4px'}}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Floating queue widget */}
            <div style={{
              background:C.card, border:`1px solid ${C.border}`,
              borderRadius:'14px', padding:'16px',
              boxShadow: darkMode ? '0 20px 48px rgba(0,0,0,0.4)' : '0 20px 48px rgba(0,0,0,0.08)',
              animation:'floatWidget 4s ease-in-out infinite',
              backdropFilter:'blur(8px)',
            }}>
              <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.16em',color:C.muted,marginBottom:'8px',fontFamily:'JetBrains Mono,monospace'}}>Daily queue</div>
              <div style={{fontSize:'1rem',fontWeight:700,color:C.text,marginBottom:'4px'}}>5 problems due</div>
              <div style={{fontSize:'12px',color:C.sub,lineHeight:1.6,marginBottom:'14px'}}>A focused review queue each morning keeps placement prep on track.</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {['Arrays','DP','Binary Search','Graphs'].map(tag=>(
                  <span key={tag} style={{fontSize:'10px',padding:'4px 8px',borderRadius:'999px',background:darkMode?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',color:C.sub,fontFamily:'JetBrains Mono,monospace',border:`1px solid ${C.border}`}}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORGETTING CURVE ── */}
      <section ref={curveRef} style={{padding:'6rem 2rem',background:C.section,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <div style={{...stagger(curveIn,0),marginBottom:'3rem'}}>
            <div style={eyebrow}>The Problem</div>
            <h2 style={{...h2s,marginBottom:'0.75rem'}}>You forget 70% of what you solve within 24 hours.</h2>
            <p style={{fontSize:'15px',color:C.sub,maxWidth:'480px',lineHeight:1.7}}>Ebbinghaus's forgetting curve, established in 1885. The fix is spaced repetition — review just before you forget and the memory consolidates permanently.</p>
          </div>
          <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{...stagger(curveIn,1), background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'1.75rem'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'#DC2626',fontFamily:'JetBrains Mono,monospace',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'1.25rem'}}>Without review</div>
              {[['Day 1',100],['Day 3',40],['Day 7',20],['Day 30',5]].map(([l,pct],ri)=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',color:C.muted,width:'44px',flexShrink:0}}>{l}</div>
                  <div style={{flex:1,height:'6px',background:C.panel,borderRadius:'3px',overflow:'hidden'}}>
                    <div style={{height:'100%',background:'#FCA5A5',width:curveIn?pct+'%':'0%',borderRadius:'3px',transition:`width 0.9s cubic-bezier(0.4,0,0.2,1) ${ri*0.12}s`}}/>
                  </div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',color:C.muted,width:'32px',textAlign:'right'}}>{pct}%</div>
                </div>
              ))}
              <p style={{fontSize:'12px',color:C.muted,marginTop:'1rem',lineHeight:1.6,paddingTop:'1rem',borderTop:`1px solid ${C.border}`}}>Grinding 200 problems means nothing if you can't reproduce them under pressure.</p>
            </div>
            <div style={{...stagger(curveIn,2), background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'1.75rem'}}>
              <div style={{fontSize:'12px',fontWeight:700,color:'#16A34A',fontFamily:'JetBrains Mono,monospace',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'1.25rem'}}>With Track-It</div>
              {[['Review 1',100],['Review 2',100],['Review 3',100],['Review 4',100]].map(([l,pct],ri)=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',color:C.muted,width:'44px',flexShrink:0}}>{l}</div>
                  <div style={{flex:1,height:'6px',background:C.panel,borderRadius:'3px',overflow:'hidden'}}>
                    <div style={{height:'100%',background:'#86EFAC',width:curveIn?pct+'%':'0%',borderRadius:'3px',transition:`width 0.9s cubic-bezier(0.4,0,0.2,1) ${0.4+ri*0.12}s`}}/>
                  </div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',color:C.muted,width:'32px',textAlign:'right'}}>{pct}%</div>
                </div>
              ))}
              <p style={{fontSize:'12px',color:C.muted,marginTop:'1rem',lineHeight:1.6,paddingTop:'1rem',borderTop:`1px solid ${C.border}`}}>After 4 spaced reviews, the pattern becomes automatic. Solving and knowing are different things.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS + DEMO ── */}
      <section id="how" ref={howRef} style={{padding:'6rem 2rem',borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem',...stagger(howIn,0)}}>
            <div style={eyebrow}>How it works</div>
            <h2 style={h2s}>Try it — this is the real experience.</h2>
          </div>
          <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4rem',alignItems:'start'}}>
            <div style={{...stagger(howIn,1)}}><DemoCard darkMode={darkMode} showToast={showToast}/></div>
            <div style={{display:'flex',flexDirection:'column',gap:'2rem',...stagger(howIn,2)}}>
              {HOW_IT_WORKS.map((s,i)=>(
                <div key={s.n} style={{display:'flex',gap:'1rem',...stagger(howIn,i+2)}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',fontWeight:700,color:C.muted,paddingTop:'3px',flexShrink:0,width:'20px'}}>{s.n}</div>
                  <div>
                    <div style={{fontSize:'14px',fontWeight:600,color:C.text,marginBottom:'6px'}}>{s.title}</div>
                    <div style={{fontSize:'13px',color:C.sub,lineHeight:1.7,whiteSpace:'pre-line'}}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featRef} style={{padding:'6rem 2rem',background:C.section,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div style={{marginBottom:'3rem',...stagger(featIn,0)}}>
            <div style={eyebrow}>Features</div>
            <h2 style={h2s}>Everything built to make knowledge stick.</h2>
          </div>
          <div className="three-col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:C.border,borderRadius:'12px',overflow:'hidden',border:`1px solid ${C.border}`}}>
            {FEATURES.map((f,i)=>(
              <div key={f.title} className="feat-cell" style={{...stagger(featIn, i, 0)}}>
                <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'16px',color:C.text,marginBottom:'10px'}}>{f.icon}</div>
                <div style={{fontSize:'13px',fontWeight:600,color:C.text,marginBottom:'6px'}}>{f.title}</div>
                <div style={{fontSize:'12px',color:C.muted,lineHeight:1.65}}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqRef} style={{padding:'5rem 2rem',background:C.alt,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:'700px',margin:'0 auto'}}>
          <div style={{marginBottom:'2.5rem',...stagger(faqIn,0)}}>
            <div style={eyebrow}>FAQ</div>
            <h2 style={h2s}>Quick answers.</h2>
          </div>
          {FAQ_ITEMS.map((item,i)=>(
            <div key={item.q} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'10px',marginBottom:'10px',overflow:'hidden',...stagger(faqIn,i+1)}}>
              <button className="faq-btn" onClick={()=>setFaqOpen(faqOpen===i?-1:i)}>
                <span>{item.q}</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',color:C.muted,fontSize:'16px',transform:faqOpen===i?'rotate(45deg)':'rotate(0)',transition:'transform 0.25s ease',display:'inline-block'}}>+</span>
              </button>
              <div style={{maxHeight:faqOpen===i?'200px':'0',overflow:'hidden',transition:'max-height 0.35s cubic-bezier(0.16,1,0.3,1)'}}>
                <div style={{padding:'0 20px 18px',color:C.sub,fontSize:'14px',lineHeight:1.7}}>{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section ref={lbRef} style={{padding:'6rem 2rem',background:C.section,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:'960px',margin:'0 auto'}}>
          <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:'4rem',alignItems:'center'}}>
            <div style={{...stagger(lbIn,0)}}>
              <div style={eyebrow}>Leaderboard</div>
              <h2 style={{...h2s,marginBottom:'1rem'}}>Your batchmates are already grinding.</h2>
              <p style={{fontSize:'14px',color:C.sub,lineHeight:1.75,marginBottom:'1rem'}}>A competitive ladder for Amrita Chennai students only. See exactly where you stand with peers who are also prepping for placements.</p>
              <p style={{fontSize:'14px',color:C.sub,lineHeight:1.75,marginBottom:'1.5rem'}}>Streaks show daily review consistency — not just problem counts.</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'12px',color:C.muted,background:C.alt,border:`1px solid ${C.border}`,padding:'6px 12px',borderRadius:'6px',fontFamily:'JetBrains Mono,monospace'}}>
                Appear after solving 10+ problems
              </div>
            </div>
            <div style={{...stagger(lbIn,1)}}>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'12px',overflow:'hidden',boxShadow:darkMode?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 32px rgba(0,0,0,0.06)'}}>
                <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{fontSize:'13px',fontWeight:600,color:C.text,fontFamily:'JetBrains Mono,monospace'}}>Amrita Chennai</div>
                  <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',fontWeight:600,color:'#16A34A',fontFamily:'JetBrains Mono,monospace'}}>
                    <span style={{width:'5px',height:'5px',background:'#16A34A',borderRadius:'50%',animation:'liveBlip 1.8s ease-in-out infinite'}}/>
                    Live
                  </div>
                </div>
                {LB_ROWS.map((r,i)=>(
                  <div key={r.name} className="lb-row" style={{
                    opacity: lbIn?(r.blur?0.45:1):0,
                    transform: lbIn?'translateX(0)':'translateX(-18px)',
                    transition:`opacity 0.45s ease ${i*0.09}s,transform 0.45s ease ${i*0.09}s`,
                    filter:r.blur?'blur(3px)':'none',
                  }}>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'12px',fontWeight:700,color:i<3?C.text:C.muted,textAlign:'center'}}>
                      {i===0?'①':i===1?'②':i===2?'③':`${i+1}`}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'28px',height:'28px',borderRadius:'50%',background:C.alt,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:C.sub,flexShrink:0}}>
                        {r.blur?'??':r.initials}
                      </div>
                      <div>
                        <div style={{fontSize:'13px',fontWeight:600,color:C.text}}>{r.blur?'••••• •••••':r.name}</div>
                        <div style={{fontSize:'11px',color:C.muted}}>{r.blur?'CSE · ?rd Year':r.dept}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'12px',fontWeight:700,color:C.text,fontFamily:'JetBrains Mono,monospace'}}>{r.blur?'?,???':r.xp} XP</div>
                      <div style={{fontSize:'11px',color:C.muted,fontFamily:'JetBrains Mono,monospace'}}>🔥 {r.blur?'??d':r.streak} streak</div>
                    </div>
                  </div>
                ))}
                <div style={{padding:'14px 18px',borderTop:`1px solid ${C.border}`,background:darkMode?'rgba(79,70,229,0.06)':'rgba(79,70,229,0.03)',animation:lbIn?'fomoPulse 3s ease-in-out infinite':'none'}}>
                  <div style={{fontSize:'13px',color:C.muted,marginBottom:'8px',fontFamily:'JetBrains Mono,monospace',textAlign:'center'}}>You? (CSE · Your Year) — Join the ladder</div>
                  <div style={{textAlign:'center'}}>
                    <button className="land-p" onClick={()=>openModal('signup')} style={{fontSize:'13px',padding:'8px 18px'}}>Claim your spot</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} style={{padding:'7rem 2rem',background:C.cta,position:'relative',overflow:'hidden'}}>
        {/* Subtle particle bg in CTA too */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)',backgroundSize:'200% 100%',animation:'gradShift 4s ease infinite'}}/>
        <div style={{maxWidth:'560px',margin:'0 auto',textAlign:'center',...stagger(ctaIn,0),position:'relative',zIndex:1}}>
          <h2 style={{fontFamily:'JetBrains Mono,monospace',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:700,letterSpacing:'-0.04em',color:C.ctaText,marginBottom:'1rem'}}>
            Placement season doesn't wait.
          </h2>
          <p style={{fontSize:'15px',color:C.ctaSub,lineHeight:1.75,marginBottom:'0.5rem'}}>The students who retained what they practiced will outperform the ones who just solved more.</p>
          <p style={{fontSize:'12px',color:C.ctaSub,marginBottom:'2.5rem',fontFamily:'JetBrains Mono,monospace'}}>Built by Amrita Chennai CSE students · In active development</p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginBottom:'1.5rem'}}>
            <button className="cta-p" onClick={()=>openModal('signup')}>Create free account</button>
            <button className="cta-g" onClick={()=>openModal('signin')}>Sign in</button>
          </div>
          <p style={{fontSize:'12px',color:C.ctaSub,fontFamily:'JetBrains Mono,monospace'}}>{DOMAIN} · Free forever · No credit card</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:C.cta,borderTop:`1px solid ${C.ctaBorder}`,padding:'2rem',textAlign:'center'}}>
        <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'13px',fontWeight:700,color:C.ctaText,marginBottom:'4px'}}>Track-It</div>
        <p style={{fontSize:'12px',color:C.ctaSub,marginBottom:'2px'}}>Built by Amrita Chennai students, for Amrita Chennai students.</p>
        <p style={{fontSize:'11px',color:C.ctaSub}}>© 2026 Track-It</p>
      </footer>

      {/* ── SIGNUP MODAL ── */}
      {modal==='signup'&&(
        <div onClick={overlayClick} style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'16px',width:'100%',maxWidth:'420px',padding:'2rem',position:'relative',animation:'modalIn 0.22s ease',maxHeight:'90vh',overflowY:'auto'}}>
            <button onClick={closeModal} style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:C.muted,lineHeight:1}}>✕</button>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'13px',fontWeight:700,marginBottom:'4px',color:C.text}}>Track-It</div>
            <h2 style={{fontFamily:'JetBrains Mono,monospace',fontSize:'1.2rem',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'4px',color:C.text}}>Create your account</h2>
            <p style={{fontSize:'13px',color:C.muted,marginBottom:'1.25rem'}}>Already have one? <span onClick={()=>switchModal('signin')} style={{color:C.text,fontWeight:600,cursor:'pointer',textDecoration:'underline'}}>Sign in</span></p>
            <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:'8px',padding:'8px 12px',marginBottom:'1.25rem',fontSize:'12px',color:C.muted,fontFamily:'JetBrains Mono,monospace'}}>Requires {DOMAIN}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
              <div><label style={lbl}>First name</label><input style={inp} placeholder="Navya" value={su.firstName} onChange={e=>setSu(p=>({...p,firstName:e.target.value}))}/></div>
              <div><label style={lbl}>Last name</label><input style={inp} placeholder="Sree" value={su.lastName} onChange={e=>setSu(p=>({...p,lastName:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:'10px'}}><label style={lbl}>College email</label><input type="email" style={inp} placeholder={`cb.en.u4cse22xxx${DOMAIN}`} value={su.email} onChange={e=>setSu(p=>({...p,email:e.target.value}))}/></div>
            <div style={{marginBottom:'10px'}}><label style={lbl}>Department</label>
              <select style={inp} value={su.dept} onChange={e=>setSu(p=>({...p,dept:e.target.value}))}>
                <option value="" disabled>Select</option>
                {['CSE','IT','ECE','EEE','MECH','CIVIL','AIDS','AIML'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
              <div><label style={lbl}>Year</label>
                <select style={inp} value={su.year} onChange={e=>setSu(p=>({...p,year:e.target.value}))}>
                  <option value="" disabled>Select</option>
                  {['1st Year','2nd Year','3rd Year','4th Year'].map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Password</label><input type="password" style={inp} placeholder="Min. 8 chars" value={su.password} onChange={e=>setSu(p=>({...p,password:e.target.value}))}/></div>
            </div>
            <button className="land-p" onClick={handleSignup} style={{width:'100%',padding:'11px',marginTop:'6px'}}>Create account</button>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'1.25rem'}}>
              <hr style={{flex:1,border:'none',borderTop:`1px solid ${C.border}`}}/>
              <span style={{fontSize:'11px',color:C.muted,whiteSpace:'nowrap'}}>Free forever · No card needed</span>
              <hr style={{flex:1,border:'none',borderTop:`1px solid ${C.border}`}}/>
            </div>
          </div>
        </div>
      )}

      {/* ── SIGNIN MODAL ── */}
      {modal==='signin'&&(
        <div onClick={overlayClick} style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'16px',width:'100%',maxWidth:'380px',padding:'2rem',position:'relative',animation:'modalIn 0.22s ease'}}>
            <button onClick={closeModal} style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:C.muted,lineHeight:1}}>✕</button>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'13px',fontWeight:700,marginBottom:'4px',color:C.text}}>Track-It</div>
            {!forgot?(
              <>
                <h2 style={{fontFamily:'JetBrains Mono,monospace',fontSize:'1.2rem',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'4px',color:C.text}}>Welcome back</h2>
                <p style={{fontSize:'13px',color:C.muted,marginBottom:'1.25rem'}}>New here? <span onClick={()=>switchModal('signup')} style={{color:C.text,fontWeight:600,cursor:'pointer',textDecoration:'underline'}}>Create account</span></p>
                <div style={{marginBottom:'10px'}}><label style={lbl}>College email</label><input type="email" style={inp} placeholder={`cb.en.u4cse22xxx${DOMAIN}`} value={si.email} onChange={e=>setSi(p=>({...p,email:e.target.value}))}/></div>
                <div style={{marginBottom:'6px'}}><label style={lbl}>Password</label><input type="password" style={inp} placeholder="Your password" value={si.password} onChange={e=>setSi(p=>({...p,password:e.target.value}))}/></div>
                <div style={{textAlign:'right',marginBottom:'1rem'}}><span onClick={()=>setForgot(true)} style={{fontSize:'12px',color:C.muted,cursor:'pointer',textDecoration:'underline'}}>Forgot password?</span></div>
                <button className="land-p" onClick={handleSignin} style={{width:'100%',padding:'11px'}}>Sign in</button>
              </>
            ):(
              <>
                <button onClick={()=>setForgot(false)} style={{background:'none',border:'none',fontSize:'13px',color:C.muted,cursor:'pointer',padding:0,marginBottom:'1rem',display:'flex',alignItems:'center',gap:'4px'}}>← Back</button>
                <h2 style={{fontFamily:'JetBrains Mono,monospace',fontSize:'1.2rem',fontWeight:700,letterSpacing:'-0.02em',marginBottom:'4px',color:C.text}}>Reset password</h2>
                <p style={{fontSize:'13px',color:C.muted,marginBottom:'1.25rem'}}>Enter your college email and we'll send a reset link.</p>
                <div style={{marginBottom:'1rem'}}><label style={lbl}>College email</label><input type="email" style={inp} placeholder={`cb.en.u4cse22xxx${DOMAIN}`} value={fe} onChange={e=>setFe(e.target.value)}/></div>
                <button className="land-p" onClick={handleForgot} style={{width:'100%',padding:'11px'}}>Send reset link</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div style={{
        position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',
        background:toast.ok?C.card:(darkMode?'rgba(127,29,29,0.95)':'#FEF2F2'),
        border:`1px solid ${toast.ok?C.border:(darkMode?'#991B1B':'#FECACA')}`,
        borderLeft:`3px solid ${toast.ok?(darkMode?'#4B5563':'#09090B'):'#DC2626'}`,
        color:toast.ok?C.text:(darkMode?'#FECACA':'#DC2626'),
        borderRadius:'8px',padding:'10px 18px',fontSize:'13px',fontFamily:'Inter,sans-serif',
        boxShadow:'0 4px 24px rgba(0,0,0,0.15)',zIndex:999,
        opacity:toast.show?1:0,
        animation:toast.show?'toastSlide 0.3s cubic-bezier(0.16,1,0.3,1)':'none',
        transition:'opacity 0.25s ease',
        pointerEvents:'none',whiteSpace:'nowrap',
      }}>
        {toast.msg}
      </div>
    </div>
  )
} 