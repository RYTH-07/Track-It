import { useEffect } from 'react'

const LAST_UPDATED = 'July 14, 2026'

const sections = [
  {
    title: '1. Who We Are',
    content: `Track-It is a spaced repetition DSA and competitive programming 
tracker built by students of Amrita Vishwa Vidyapeetham, Chennai Campus. 
It is a free, non-commercial academic tool.

Track-It is operated by C Rythan and the Track-It team 
(rythcomputes@gmail.com).`,
  },
  {
    title: '2. Who Can Use Track-It',
    content: `Track-It is exclusively available to students with a valid 
@ch.students.amrita.edu email address. Access is restricted at 
the account creation level — no other email domains are accepted.`,
  },
  {
    title: '3. What Data We Collect',
    content: `We collect only what is necessary to run the service:

• Email address — your @ch.students.amrita.edu email, used for 
  authentication only.

• Display name — the nickname you choose during onboarding, 
  shown on the leaderboard.

• Department and year — collected during signup for context, 
  not shared publicly.

• Problems you log — title, URL, topics, difficulty, notes, 
  syntax reminders, and review history. This data is private 
  to you.

• Review activity — mastery ratings, streaks, XP, and review 
  timestamps used to power spaced repetition scheduling.

• Usage data — timestamps of logins and review sessions, 
  stored to maintain streaks and activity heatmaps.`,
  },
  {
    title: '4. What We Do Not Collect',
    content: `• We do not collect payment information of any kind.
• We do not collect your college ID, roll number, or grades.
• We do not track you across other websites.
• We do not use advertising cookies or third-party trackers.
• We do not sell, rent, or share your personal data with 
  any third party.`,
  },
  {
    title: '5. What Others Can See',
    content: `Track-It is designed so your personal study data stays private.

Public (visible to other signed-in students):
• Your display name
• Your XP total
• Your current rank title (e.g. Adept, Expert)
• Your current streak
• Your problems solved count (only on the leaderboard, 
  and only after you have solved 10+ problems)

Private (visible only to you):
• Your problem notes
• Your syntax reminders
• Your review history and mastery ratings
• Your email address
• Your department and year`,
  },
  {
    title: '6. How We Store Your Data',
    content: `Your data is stored in Supabase — a managed Postgres database 
hosted on AWS infrastructure. All data is protected by Row Level 
Security (RLS) policies, meaning database queries are enforced 
at the row level so no user can access another user's data, 
even if they were to find the API endpoint.

All connections to our database use HTTPS/TLS encryption.`,
  },
  {
    title: '7. Data Retention',
    content: `Your data is retained for as long as your account exists. 

If you request account deletion by emailing rythcomputes@gmail.com, 
we will permanently delete your account and all associated data 
(problems, notes, review history, stats, and profile) within 7 days.

We do not retain backups of deleted accounts beyond 30 days.`,
  },
  {
    title: '8. Cookies',
    content: `Track-It uses minimal browser storage:

• localStorage — used to store your theme preference 
  (dark/light mode). No personal data is stored here.

• Session tokens — Supabase sets a secure session cookie 
  to keep you logged in. This is essential for the service 
  to function and is not used for tracking.

We do not use advertising cookies, analytics cookies, 
or any third-party cookies.`,
  },
  {
    title: '9. Third-Party Services',
    content: `We use the following third-party services to operate Track-It:

• Supabase (supabase.com) — database, authentication, and 
  API layer. Your email and account data passes through 
  Supabase. Their privacy policy applies to data they process.

• Vercel (vercel.com) — hosting for the frontend application. 
  Vercel may log request metadata (IP address, user agent) 
  for security and performance purposes.

• EmailJS (emailjs.com) — used only for the Contact form. 
  Messages you submit through the Contact page are routed 
  through EmailJS to our email address.

We do not use Google Analytics, Meta Pixel, or any 
advertising or analytics platforms.`,
  },
  {
    title: '10. Children\'s Privacy',
    content: `Track-It is intended for college students aged 18 and above. 
We do not knowingly collect data from anyone under 18. 
If you believe a minor has created an account, please 
contact us at rythcomputes@gmail.com and we will 
delete the account promptly.`,
  },
  {
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy as the product evolves. 
When we do, we will update the "Last updated" date at the 
top of this page. Continued use of Track-It after changes 
are posted constitutes acceptance of the updated policy.

For significant changes, we will attempt to notify active 
users via the app.`,
  },
  {
    title: '12. Contact',
    content: `For any privacy-related questions, data deletion requests, 
or concerns, contact us at:

rythcomputes@gmail.com

We aim to respond within 48 hours.`,
  },
]

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '3rem 2rem 2.5rem',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.75rem',
          }}>
            Legal
          </div>
          <h1 style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem 0' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)',
          borderRadius: '8px',
          padding: '16px 20px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}>
          Track-It is a free, non-commercial tool built by students for students. 
          We collect the minimum data needed to make the app work. 
          We don't sell your data, show you ads, or share your study notes with anyone. 
          This policy explains exactly what we collect and why.
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.75rem',
              letterSpacing: '-0.01em',
            }}>
              {s.title}
            </h2>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}>
              {s.content}
            </div>
            {i < sections.length - 1 && (
              <hr style={{ marginTop: '2.5rem', border: 'none', borderTop: '1px solid var(--border)' }} />
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 0',
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontFamily: 'JetBrains Mono, monospace',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span>© 2026 Track-It · Amrita Chennai</span>
          <span>rythcomputes@gmail.com</span>
        </div>
      </div>
    </div>
  )
}