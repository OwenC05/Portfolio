'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SnowCursor from '@/components/cursor/SnowCursor'

declare global {
  interface Window {
    __cursorSingleton?: boolean
  }
}

export default function Cursor() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.__cursorSingleton) {
      return
    }

    window.__cursorSingleton = true

    const existing = document.getElementById('cursor-root')
    if (existing?.parentNode) {
      existing.parentNode.removeChild(existing)
    }

    const container = document.createElement('div')
    container.id = 'cursor-root'
    container.style.position = 'fixed'
    container.style.inset = '0px'
    container.style.pointerEvents = 'none'
    container.style.zIndex = '1000'

    document.body.appendChild(container)
    setRoot(container)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
      setRoot(null)
      delete window.__cursorSingleton
    }
  }, [])

  if (!root) return null

  return createPortal(<SnowCursor />, root)
}
