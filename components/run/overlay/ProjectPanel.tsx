'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useRunStore } from '@/lib/runStore'
import { runStations, getProject } from '@/lib/projects'
import { contact, about } from '@/lib/content'
import { gradeColor } from '@/lib/theme'

const GRADE_LABEL = { green: 'Green', blue: 'Blue', black: 'Black diamond' } as const

function keepRiding() {
  useRunStore.getState().openStation(null)
}

export default function ProjectPanel() {
  const activeId = useRunStore((s) => s.activeStationId)
  const station = runStations.find((s) => s.id === activeId)

  return (
    <AnimatePresence>
      {station && (
        <motion.div
          key={station.id}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6 sm:pb-10"
        >
          <div className="pointer-events-auto w-full max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-2xl backdrop-blur-xl sm:p-7">
            {station.kind === 'project' &&
              (() => {
                const p = getProject(station.slug || '')
                if (!p) return null
                return (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="font-mono text-[11px] tracking-[0.2em]"
                        style={{ color: gradeColor[p.grade] }}
                      >
                        {p.grade === 'green' ? '●' : p.grade === 'blue' ? '■' : '◆'}{' '}
                        {GRADE_LABEL[p.grade].toUpperCase()}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
                        {p.year}
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
                      {p.title}
                    </h2>
                    <p className="mt-1 text-[var(--accent)]">{p.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{p.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.slice(0, 6).map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[#1b2350] transition hover:brightness-110"
                      >
                        Open case study →
                      </Link>
                      <button
                        onClick={keepRiding}
                        className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink)] transition hover:bg-[var(--snow)]/10"
                      >
                        Keep riding ↓
                      </button>
                    </div>
                  </>
                )
              })()}

            {station.kind === 'lodge' && (
              <>
                <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent)]">
                  ⌂ BASE LODGE
                </span>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
                  About Owen
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{about.bio[0]}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/about"
                    className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[#1b2350] transition hover:brightness-110"
                  >
                    Open About →
                  </Link>
                  <button
                    onClick={keepRiding}
                    className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink)] transition hover:bg-[var(--snow)]/10"
                  >
                    Keep riding ↓
                  </button>
                </div>
              </>
            )}

            {station.kind === 'lift' && (
              <>
                <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent-pink)]">
                  ↟ THE LIFT
                </span>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
                  Let’s talk
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  Building toward AI research & engineering. Always up for a good problem — or a good run.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a className="chip-link" href={`mailto:${contact.email}`}>
                    Email
                  </a>
                  <a className="chip-link" href={contact.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="chip-link" href={contact.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                  <a className="chip-link" href={contact.cvUrl} target="_blank" rel="noreferrer">
                    CV
                  </a>
                </div>
                <div className="mt-6">
                  <button
                    onClick={keepRiding}
                    className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--ink)] transition hover:bg-[var(--snow)]/10"
                  >
                    Ride to the base ↓
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
