// Server-renderable, keyboard-navigable index of the whole run. Used both as
// the /projects page (crawlable, no JS needed) and as the reduced-motion /
// no-WebGL fallback inside the run. No client hooks — safe in both contexts.

import Link from 'next/link'
import { projects, type Project } from '@/lib/projects'
import { site, contact, about } from '@/lib/content'
import { gradeColor } from '@/lib/theme'

const GLYPH = { green: '●', blue: '■', black: '◆' } as const
const GRADE_LABEL = { green: 'Green', blue: 'Blue', black: 'Black' } as const

function Row({ p }: { p: Project }) {
  return (
    <Link
      href={`/projects/${p.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-transparent px-4 py-4 transition hover:border-[var(--line)] hover:bg-[var(--snow)]/[0.04]"
    >
      <span
        aria-hidden
        className="mt-1 font-mono text-sm"
        style={{ color: gradeColor[p.grade] }}
        title={`${GRADE_LABEL[p.grade]} run`}
      >
        {GLYPH[p.grade]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-display text-lg font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">
            {p.title}
          </span>
          <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--muted)]">
            {p.year}
          </span>
        </span>
        <span className="mt-1 block text-sm text-[var(--muted)]">{p.tagline}</span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          {p.stack.slice(0, 5).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </span>
      </span>
      <span aria-hidden className="mt-1 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]">
        →
      </span>
    </Link>
  )
}

export default function TrailMap() {
  const summit = projects.filter((p) => p.lane === 'center')
  const research = projects.filter((p) => p.lane === 'research')
  const build = projects.filter((p) => p.lane === 'build')

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="font-mono text-[11px] tracking-[0.32em] text-[var(--accent)]">TRAIL MAP</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">{site.tagline}</p>
        <Link
          href="/"
          className="mt-5 inline-block text-[13px] text-[var(--muted)] underline-offset-4 transition hover:text-[var(--ink)] hover:underline"
        >
          ↑ Ride the run
        </Link>

        <section className="mt-12">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">◆ SUMMIT</h2>
          <div className="mt-2">
            {summit.map((p) => (
              <Row key={p.slug} p={p} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">
            RESEARCH LINE
          </h2>
          <div className="mt-2">
            {research.map((p) => (
              <Row key={p.slug} p={p} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">
            BUILD LINE
          </h2>
          <div className="mt-2">
            {build.map((p) => (
              <Row key={p.slug} p={p} />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/about"
            className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]/40"
          >
            <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent)]">⌂ BASE LODGE</div>
            <div className="mt-2 font-display text-lg font-semibold">About Owen</div>
            <p className="mt-1 text-sm text-[var(--muted)]">{about.bio[1]}</p>
          </Link>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
            <div className="font-mono text-[11px] tracking-[0.2em] text-[var(--accent-pink)]">↟ THE LIFT</div>
            <div className="mt-2 font-display text-lg font-semibold">Get in touch</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="chip-link" href={`mailto:${contact.email}`}>
                Email
              </a>
              <a className="chip-link" href={contact.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="chip-link" href={contact.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
