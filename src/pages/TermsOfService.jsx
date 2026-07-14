import React from 'react'
import { FileText } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using Track-It, you agree to these Terms of Service. If you do not agree, please do not use the app.',
  },
  {
    title: '2. Eligibility',
    body: 'Track-It is exclusively for students with a valid @ch.students.amrita.edu email address. Accounts created with any other email domain are not permitted and may be removed without notice.',
  },
  {
    title: '3. Your Account',
    body: 'You are responsible for keeping your login credentials secure. You are responsible for all activity that happens under your account. Notify us immediately if you suspect unauthorized access.',
  },
  {
    title: '4. Acceptable Use',
    body: 'Track-It is built for personal DSA/CP practice and peer learning. You agree not to: use the leaderboard or any feature to harass classmates, submit false or misleading problem data, attempt to access other users\' accounts or data, or use the app in any way that disrupts its normal operation for other students.',
  },
  {
    title: '5. Content You Submit',
    body: 'Problems, notes, code snippets, and notebook entries you log remain yours. By submitting them, you grant Track-It permission to store and display this content back to you as part of the app\'s core functionality (spaced repetition scheduling, stats, leaderboard rankings where applicable).',
  },
  {
    title: '6. Leaderboard & Public Data',
    body: 'Your display name, department, year, XP, and streak may be visible to other Amrita Chennai students on the leaderboard once you\'ve met the visibility threshold. Your private notes, code snippets, and notebook content are never shown to other users.',
  },
  {
    title: '7. Availability',
    body: 'Track-It is an actively developed student project, not a commercial product with uptime guarantees. Features may change, and the app may occasionally be unavailable during updates. We\'ll try to minimize disruption but can\'t promise 100% uptime.',
  },
  {
    title: '8. Termination',
    body: 'You may stop using Track-It and request account deletion at any time by contacting us. We reserve the right to suspend or terminate accounts that violate these terms or the eligibility requirement above.',
  },
  {
    title: '9. Disclaimer',
    body: 'Track-It is provided "as is" without warranties of any kind. It is a student-built tool intended to support your placement preparation, not a substitute for your own judgment about what and how to study.',
  },
  {
    title: '10. Changes to These Terms',
    body: 'We may update these terms as the app evolves. Continued use of Track-It after changes are posted means you accept the updated terms.',
  },
  {
    title: '11. Contact',
    body: 'Questions about these terms? Reach out at rythcomputes@gmail.com or through the Contact page.',
  },
]

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={22} style={{ color: 'var(--accent)' }} />
          <h1 style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)',
          }}>
            Terms of Service
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          Last updated: July 2026
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {SECTIONS.map((s, i) => (
          <div key={s.title} style={{ marginBottom: i === SECTIONS.length - 1 ? 0 : '1.75rem' }}>
            <h2 style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '8px',
            }}>
              {s.title}
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
