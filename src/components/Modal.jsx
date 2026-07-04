import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { style } = document.body
    const prevPosition = style.position
    const prevTop = style.top
    const prevWidth = style.width
    const prevOverflow = style.overflow

    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.width = '100%'
    style.overflow = 'hidden'

    return () => {
      style.position = prevPosition
      style.top = prevTop
      style.width = prevWidth
      style.overflow = prevOverflow
      window.scrollTo(0, scrollY)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="card animate-slide-up w-full flex flex-col"
        style={{ maxWidth, maxHeight: '85vh', padding: 0 }}
      >
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '24px 24px 16px' }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="btn btn-ghost px-2 py-1.5" aria-label="Close modal">
            <X size={15} />
          </button>
        </div>
        <div
          className="overflow-y-auto"
          style={{ padding: '0 24px 24px' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}