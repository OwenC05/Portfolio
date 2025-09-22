'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={mounted ? isDark : undefined}
      onClick={() => mounted && setTheme(nextTheme)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] hover:text-[color:var(--accent)]"
      style={{
        borderColor: 'color-mix(in oklab, var(--ink) 28%, transparent)',
        background: 'color-mix(in oklab, var(--bg) 92%, transparent)',
        color: 'var(--ink)',
      }}
      data-state={mounted ? (isDark ? 'dark' : 'light') : 'system'}
    >
      <span
        className="inline-flex h-5 w-5 items-center justify-center"
        aria-hidden
      >
        {!mounted ? <PlaceholderIcon /> : isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  )
}

function PlaceholderIcon() {
  return (
    <span className="block h-full w-full rounded-full border border-current opacity-30" />
  )
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5.6 5.6l-1.8-1.8M20.2 20.2l-1.8-1.8M18.4 5.6l1.8-1.8M3.8 20.2l1.8-1.8" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
    >
      <path d="M21.5 13.1A9 9 0 1 1 10.9 2.5 7 7 0 1 0 21.5 13.1Z" />
    </svg>
  )
}
