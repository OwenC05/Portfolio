import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects, getProject } from '@/lib/projects'
import { gradeColor } from '@/lib/theme'

const GLYPH = { green: '●', blue: '■', black: '◆' } as const
const GRADE_LABEL = { green: 'Green run', blue: 'Blue run', black: 'Black diamond' } as const

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = getProject(slug)
  return p
    ? { title: `${p.title} — Owen Cheung`, description: p.blurb }
    : { title: 'Project — Owen Cheung' }
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) notFound()

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      <article className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <nav className="flex items-center gap-5 font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--ink)]">
            ↑ BACK TO THE RUN
          </Link>
          <Link href="/projects" className="transition hover:text-[var(--ink)]">
            TRAIL MAP
          </Link>
        </nav>

        <header className="mt-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.18em]">
            <span style={{ color: gradeColor[p.grade] }}>
              {GLYPH[p.grade]} {GRADE_LABEL[p.grade].toUpperCase()}
            </span>
            <span className="text-[var(--muted)]">{p.year}</span>
            {p.role && <span className="text-[var(--muted)]">{p.role}</span>}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {p.title}
          </h1>
          <p className="mt-3 text-xl text-[var(--accent)]">{p.tagline}</p>
        </header>

        <p className="mt-8 text-[17px] leading-relaxed text-[var(--ink)]/90">{p.summary}</p>

        <section className="mt-10">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">HIGHLIGHTS</h2>
          <ul className="mt-4 space-y-3">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-[var(--ink)]/90">
                <span aria-hidden style={{ color: gradeColor[p.grade] }}>
                  ›
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">STACK</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.stack.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>

        {(p.confidential || p.liveUrl || p.repoUrl) && (
          <section className="mt-10 border-t border-[var(--line)] pt-6">
            {p.confidential ? (
              <p className="text-sm text-[var(--muted)]">
                Internal work — happy to talk through the approach and results in more depth.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {p.liveUrl && (
                  <a className="chip-link" href={p.liveUrl} target="_blank" rel="noreferrer">
                    Live ↗
                  </a>
                )}
                {p.repoUrl && (
                  <a className="chip-link" href={p.repoUrl} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
              </div>
            )}
          </section>
        )}
      </article>
    </main>
  )
}
