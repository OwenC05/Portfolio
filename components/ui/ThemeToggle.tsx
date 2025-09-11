"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = (mounted ? resolvedTheme : theme) === 'dark'
  const nextLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      aria-label={nextLabel}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)]/60 text-[var(--ink)] p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      {/* sun/moon */}
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 1 1-9.45-9.45 1 1 0 0 0-.14-1.05A1 1 0 0 0 9 2a10 10 0 1 0 13 13 1 1 0 0 0-.36-2Z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.45 12.02l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 5a1 1 0 0 0 1-1V2h-2v2a1 1 0 0 0 1 1zm0 14a1 1 0 0 0-1 1v2h2v-2a1 1 0 0 0-1-1zM5 11H3v2h2v-2zm16 0h-2v2h2v-2zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM18.36 4.84l1.4-1.4 1.8 1.79-1.41 1.41-1.79-1.8zM12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7z" />
        </svg>
      )}
    </button>
  )
}

