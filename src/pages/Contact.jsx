import React, { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { Bug, Lightbulb, MessageCircle, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase.js'

const TYPES = ['General Inquiry', 'Bug Report', 'Feature Request', 'Feedback', 'Other']

const CONTACT_CARDS = [
  { icon: Bug, type: 'Bug Report', title: 'Bug Report', sub: 'Found something broken?', color: '#F87171' },
  { icon: Lightbulb, type: 'Feature Request', title: 'Feature Request', sub: 'Have an idea?', color: '#FDE047' },
  { icon: MessageCircle, type: 'General Inquiry', title: 'General', sub: 'Just want to say hi?', color: '#A78BFA' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', type: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setForm(f => ({ ...f, email: session.user.email }))
      }
    })
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.type) errs.type = 'Select a type'
    if (!form.message.trim()) errs.message = 'Message is required'
    else if (form.message.trim().length < 20) errs.message = 'Message must be at least 20 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSending(true)
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          inquiry_type: form.type,
          message: form.message,
          to_email: 'rythcomputes@gmail.com',
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      setSent(true)
    } catch (err) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setForm(f => ({ name: '', email: f.email, type: '', message: '' }))
    setErrors({})
    setSent(false)
  }

  const inputStyle = (hasError) => ({
    width: '100%', background: 'var(--bg-tertiary)', border: `1px solid ${hasError ? '#F87171' : 'var(--border)'}`,
    borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', outline: 'none',
  })

  const labelStyle = {
    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)',
    marginBottom: '6px', display: 'block',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="two-col-contact" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem' }}>
        {/* Form */}
        <div className="card" style={{ padding: '1.75rem', order: 1 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'contactCheckPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <CheckCircle2 size={28} color="#4ADE80" />
              </div>
              <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Message sent!
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                We'll get back to you soon.
              </p>
              <button onClick={resetForm} className="btn btn-ghost">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Send a message
              </h2>

              <div>
                <label style={labelStyle}>Name</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle(errors.name)}
                  placeholder="Your name"
                />
                {errors.name && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.name}</p>}
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle(errors.email)}
                  placeholder="you@ch.students.amrita.edu"
                />
                {errors.email && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              <div>
                <label style={labelStyle}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={inputStyle(errors.type)}
                >
                  <option value="">Select a type</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.type}</p>}
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle(errors.message), resize: 'vertical', minHeight: '110px', fontFamily: 'Inter, sans-serif' }}
                  placeholder="Tell us what's on your mind (min. 20 characters)"
                />
                {errors.message && <p style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {sending ? (<><Loader2 size={15} className="animate-spin" /> Sending...</>) : 'Send message'}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div style={{ order: 2 }}>
          <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Get in touch
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <Mail size={14} /> rythcomputes@gmail.com
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Usually within 24 hours
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CONTACT_CARDS.map(c => {
              const Icon = c.icon
              return (
                <button
                  key={c.type}
                  onClick={() => setForm(f => ({ ...f, type: c.type }))}
                  className="card"
                  style={{
                    padding: '14px', display: 'flex', alignItems: 'center', gap: '12px',
                    textAlign: 'left', cursor: 'pointer', border: form.type === c.type ? `1px solid ${c.color}` : undefined,
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={c.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.sub}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes contactCheckPop {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .two-col-contact { grid-template-columns: 1fr !important; }
          .two-col-contact > div:first-child { order: 2 !important; }
          .two-col-contact > div:last-child { order: 1 !important; }
        }
      `}</style>
    </div>
  )
}