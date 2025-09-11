'use client'

import { useEffect, useRef } from 'react'

// Usage: import and mount <CustomCursor /> at the root (e.g., in layout) when desired.
// It hides the system cursor and renders a ring + dot that track velocity. Disabled on touch/reduced motion.
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const last = useRef({ x: 0, y: 0, t: 0 })

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (isTouch || media.matches) return

    const ring = ringRef.current!
    const dot = dotRef.current!

    function onMove(e: MouseEvent) {
      const { clientX: x, clientY: y } = e
      const now = performance.now()
      const dt = Math.max(1, now - last.current.t)
      const vx = (x - last.current.x) / dt
      const sx = Math.min(1.4, 1 + Math.abs(vx) * 12)

      dot.style.transform = `translate(${x}px, ${y}px)`
      ring.style.transform = `translate(${x}px, ${y}px) scaleX(${sx})`

      last.current = { x, y, t: now }
    }

    document.addEventListener('mousemove', onMove)
    document.documentElement.classList.add('cursor-none')

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.documentElement.classList.remove('cursor-none')
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--ink)]/30 backdrop-blur-sm"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)]"
      />
    </>
  )
}

