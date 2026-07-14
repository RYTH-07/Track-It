import React from 'react'

export default function AppFooter() {
  return (
    <footer style={{
      padding: '24px', textAlign: 'center',
      borderTop: '1px solid var(--border)',
      marginTop: '2rem',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: '4px',
      }}>
        Track-It
      </div>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '10px 0 6px' }}>
        <a href="/about" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>About</a>
        <a href="/contact" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>Contact</a>
        <a href="https://github.com/RYTH-07/Track-It" target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>GitHub</a>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        © 2026 Track-It · Built by Amrita Chennai students
      </p>
    </footer>
  )
}
