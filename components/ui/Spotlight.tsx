'use client'

import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

export function Spotlight() {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    const rect = el.parentElement?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background:
          'radial-gradient(260px 190px at var(--mx, -100px) var(--my, -100px), rgba(127,176,255,0.25), transparent 60%)',
      }}
    />
  )
}

