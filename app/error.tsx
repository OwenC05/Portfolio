'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)] flex items-center">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <p className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">ERROR · AVALANCHE</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Something went wrong.
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--ink)]/80">
          The run hit an unexpected obstacle.
          {error.digest && (
            <span className="block mt-1 font-mono text-[12px] text-[var(--muted)]">
              {error.digest}
            </span>
          )}
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <button onClick={reset} className="chip-link cursor-pointer">
            Try again
          </button>
          <Link href="/" className="chip-link">↑ Back to the run</Link>
        </div>
      </div>
    </main>
  )
}
