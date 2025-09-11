'use client'

import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

type Props = {
  children: React.ReactNode
  strength?: number // 0.1–0.4
  className?: string
}

export function Magnet({ children, strength = 0.18, className }: Props) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = (e.clientX - (rect.left + rect.width / 2)) / rect.width
    const my = (e.clientY - (rect.top + rect.height / 2)) / rect.height
    const tx = mx * 12 * strength
    const ty = my * 12 * strength
    const rx = -my * 2.5 * strength
    const ry = mx * 2.5 * strength
    el.style.transform = `translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = `translate(0px, 0px) rotateX(0deg) rotateY(0deg)`
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

