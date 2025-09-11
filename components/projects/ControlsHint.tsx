'use client'

import { useState, useEffect } from 'react'

export default function ControlsHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = () => setVisible(false)
    window.addEventListener('keydown', hide, { once: true })
    window.addEventListener('click', hide, { once: true })
    return () => {
      window.removeEventListener('keydown', hide)
      window.removeEventListener('click', hide)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-white/80 px-4 py-2 text-sm text-gray-700 shadow">
      Arrow keys to navigate, Enter to open project
    </div>
  )
}
