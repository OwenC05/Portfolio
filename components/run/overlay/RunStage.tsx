'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useRunStore } from '@/lib/runStore'
import { site, contact } from '@/lib/content'

export default function RunStage() {
  const phase = useRunStore((s) => s.phase)
  const start = useRunStore((s) => s.start)
  const reset = useRunStore((s) => s.reset)

  return (
    <AnimatePresence mode="wait">
      {phase === 'intro' && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(46% 42% at 50% 48%, rgba(11,15,36,0.6), transparent 72%)',
            }}
          />
          <div className="pointer-events-auto relative max-w-xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-mono text-[11px] tracking-[0.32em] text-[var(--accent)]"
            >
              INTERACTIVE PORTFOLIO
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl"
            >
              {site.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mx-auto mt-4 max-w-md text-balance text-[var(--muted)]"
            >
              {site.tagline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <button
                onClick={start}
                className="rounded-full bg-[var(--accent)] px-8 py-3 font-medium text-[#1b2350] shadow-[0_0_40px_-8px_var(--accent)] transition hover:brightness-110"
              >
                Drop in ↓
              </button>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[var(--muted)]">
                ← → or drag to carve · ride into a gate to open a project
              </p>
              <Link
                href="/projects"
                className="text-[13px] text-[var(--muted)] underline-offset-4 transition hover:text-[var(--ink)] hover:underline"
              >
                Prefer to read? View the trail map
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}

      {phase === 'finished' && (
        <motion.div
          key="finish"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-6"
        >
          <div className="pointer-events-auto w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7 text-center shadow-2xl backdrop-blur-xl">
            <p className="font-mono text-[11px] tracking-[0.3em] text-[var(--accent)]">
              ⌂ BASE REACHED
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--ink)]">
              Thanks for riding.
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              That’s the run. Take the lift back up, or dig into the detail.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link href="/projects" className="chip-link">
                Trail map
              </Link>
              <Link href="/about" className="chip-link">
                About
              </Link>
              <a className="chip-link" href={`mailto:${contact.email}`}>
                Email
              </a>
              <a className="chip-link" href={contact.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
            <button
              onClick={reset}
              className="mt-6 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[#1b2350] transition hover:brightness-110"
            >
              Ride again ↑
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
