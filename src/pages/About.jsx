import React, { useState } from 'react'
import { Github, Linkedin, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

const TEAM = [
  {
    name: 'C Rythan',
    role: 'Project Lead · Gamification',
    dept: 'CSE · 2nd Year',
    photo: '/team/Profile.jpeg',
    github: 'RYTH-07',
    linkedin: 'https://linkedin.com/in/ryth07',
    color: '#7C3AED',
    bio: 'Ideated and prototyped Track-It from scratch. Leads the team, owns gamification features. Interested in LLMs and NLP.',
    built: ['Project architecture', 'XP system', 'Rank ladder', 'Achievements', 'Weekly goals', 'Active recall system'],
  },
  {
    name: 'Sishir',
    role: 'Backend · Auth',
    dept: 'CSE · 2nd Year',
    github: null,
    linkedin: null,
    color: '#3B82F6',
    bio: 'Built the entire Supabase backend — schema design, Row Level Security, authentication, and database triggers.',
    built: ['Supabase schema', 'RLS policies', 'Auth system', 'DB indexes & triggers'],
  },
  {
    name: 'Vetrivel',
    role: 'Core Features · SR Logic',
    dept: 'CSE · 2nd Year',
    github: null,
    linkedin: null,
    color: '#16A34A',
    bio: 'Ported the spaced repetition engine and core problem tracking logic into React.',
    built: ['SR scheduling', 'Problem CRUD', 'React scaffold', 'Initial app structure'],
  },
  {
    name: 'Thiruyazhini',
    role: 'Frontend · UI',
    dept: 'CSE · 2nd Year',
    github: 'https://github.com/Thiruyazhini-PS',
    linkedin: 'https://www.linkedin.com/in/thiruyazhini-p-s-5133373a2',
    color: '#EC4899',
    bio: 'Designed and built the core UI components and review card experience.',
    built: ['ReviewCard', 'Navbar', 'Glassmorphism UI', 'Horizontal review layout'],
  },
  {
    name: 'Deepsikha',
    role: 'Frontend · Components',
    dept: 'CSE · 2nd Year',
    photo: '/team/DEEP profile.jpeg',
    github: 'https://github.com/deepsikhakuppusamy-hash',
    linkedin: 'https://www.linkedin.com/in/deepsikha-k-959088377/',
    color: '#F59E0B',
    bio: "Built the reusable component library that powers the app's interface.",
    built: ['MasteryButton', 'StatCard', 'AchievementCard', 'WeeklyGoalBar', 'RankProgressBar'],
  },
  {
    name: 'Navyasree',
    role: 'Landing Page',
    dept: 'CSE · 2nd Year',
    photo: '/team/Navya profile.jpeg',
    github: 'https://github.com/NavyaSreeBojanapu',
    linkedin: 'https://www.linkedin.com/in/navya-sree-bojanapu-b64814395/',
    color: '#0EA5E9',
    bio: 'Designed and built the public-facing landing page that introduces Track-It to new students.',
    built: ['Landing page', 'Hero section', 'Feature showcase', 'Signup/signin modals'],
  },
]

function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function TeamSlide({ person }) {
  return (
    <div
      className="card"
      style={{
        padding: '2.5rem',
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '2.5rem',
        alignItems: 'center',
        borderColor: person.color + '55',
        boxShadow: `0 25px 60px -25px ${person.color}44`,
      }}
    >
      {/* Big photo */}
      <div style={{
        width: '220px', height: '220px', borderRadius: '24px',
        background: `${person.color}1a`, border: `2px solid ${person.color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '56px',
        color: person.color, overflow: 'hidden', flexShrink: 0,
        boxShadow: `0 0 0 6px ${person.color}14, 0 20px 40px -15px ${person.color}55`,
      }}>
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          initials(person.name)
        )}
      </div>

      {/* Content */}
      <div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)' }}>
          {person.name}
        </div>
        <div style={{
          display: 'inline-block', marginTop: '8px', fontSize: '13px', fontWeight: 600,
          color: person.color, background: `${person.color}18`,
          padding: '4px 12px', borderRadius: '999px',
        }}>
          {person.role}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
          {person.dept}
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px', marginBottom: '16px' }}>
          {person.bio}
        </p>

        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Built on Track-It
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
          {person.built.map(t => (
            <span key={t} style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '6px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace',
            }}>
              {t}
            </span>
          ))}
        </div>

        {(person.github || person.linkedin) && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {person.github && (
              <a
                href={`https://github.com/${person.github}`}
                target="_blank" rel="noreferrer"
                className="btn btn-ghost"
                style={{ gap: '6px', textDecoration: 'none' }}
              >
                <Github size={14} /> GitHub
              </a>
            )}
            {person.linkedin && (
              <a
                href={person.linkedin}
                target="_blank" rel="noreferrer"
                className="btn btn-ghost"
                style={{ gap: '6px', textDecoration: 'none' }}
              >
                <Linkedin size={14} /> LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamCarousel() {
  const [index, setIndex] = useState(0)
  const person = TEAM[index]

  const prev = () => setIndex(i => (i - 1 + TEAM.length) % TEAM.length)
  const next = () => setIndex(i => (i + 1) % TEAM.length)

  return (
    <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={prev}
          className="btn btn-ghost"
          style={{ borderRadius: '999px', padding: '10px', flexShrink: 0 }}
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <TeamSlide person={person} />
        </div>

        <button
          onClick={next}
          className="btn btn-ghost"
          style={{ borderRadius: '999px', padding: '10px', flexShrink: 0 }}
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {TEAM.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${p.name}`}
            style={{
              width: i === index ? '22px' : '8px', height: '8px', borderRadius: '999px',
              border: 'none', cursor: 'pointer', padding: 0,
              background: i === index ? p.color : 'var(--border)',
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block', fontSize: '11px', fontWeight: 600,
          color: 'var(--accent)', background: 'var(--accent-glow)',
          padding: '4px 12px', borderRadius: '999px', marginBottom: '1rem',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
        }}>
          Amrita Vishwa Vidyapeetham · Chennai Campus
        </div>
        <h1 style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.75rem',
        }}>
          Built by students, for students.
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          Track-It started as a personal localStorage prototype and grew into a full-stack team project built exclusively for Amrita Chennai students.
        </p>
      </div>

      {/* Team carousel */}
      <TeamCarousel />
      <style>{`
        @media (max-width: 640px) {
          .card > div[style*="grid-template-columns: 220px"] {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
        }
      `}</style>

      {/* Open source */}
      <div className="card" style={{ marginTop: '2.5rem', padding: '1.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
          Open Source
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Track-It is MIT licensed. The code is on GitHub.
        </p>

        <a
          href="https://github.com/RYTH-07/Track-It"
          target="_blank" rel="noreferrer"
          className="btn btn-primary"
          style={{ display: 'inline-flex', gap: '6px', textDecoration: 'none' }}
        >
          View on GitHub <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}