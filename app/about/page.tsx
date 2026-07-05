import type { Metadata } from 'next'
import Link from 'next/link'
import { about, contact, site } from '@/lib/content'

export const metadata: Metadata = {
  title: 'About — Owen Cheung',
  description: site.intro,
}

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <nav className="flex items-center gap-5 font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--ink)]">
            ↑ BACK TO THE RUN
          </Link>
          <Link href="/projects" className="transition hover:text-[var(--ink)]">
            TRAIL MAP
          </Link>
        </nav>

        <header className="mt-10">
          <p className="font-mono text-[11px] tracking-[0.32em] text-[var(--accent)]">⌂ BASE LODGE</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {site.name}
          </h1>
          <p className="mt-2 font-mono text-[12px] tracking-[0.12em] text-[var(--muted)]">
            {site.sub}
          </p>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-[var(--ink)]/90">
            {about.bio.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        </header>

        {/* Experience */}
        <section className="mt-14">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">EXPERIENCE</h2>
          <div className="mt-5 space-y-6">
            {about.experience.map((e) => (
              <article key={e.org + e.period} className="relative border-l border-[var(--line)] pl-5">
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="font-display text-lg font-semibold">{e.role}</h3>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--muted)]">
                    {e.period}
                  </span>
                </div>
                <div className="text-sm text-[var(--accent)]">
                  {e.org}
                  {e.location ? ` · ${e.location}` : ''}
                </div>
                {e.note && <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{e.note}</p>}
              </article>
            ))}
          </div>
        </section>

        <div className="mt-14 grid gap-12 sm:grid-cols-2">
          {/* Skills */}
          <section>
            <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">SKILLS</h2>
            <div className="mt-4 space-y-4">
              {Object.entries(about.skills).map(([group, items]) => (
                <div key={group}>
                  <div className="text-xs font-medium text-[var(--ink)]">{group}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education + Languages */}
          <section>
            <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">EDUCATION</h2>
            <div className="mt-4 space-y-4">
              {about.education.map((e) => (
                <div key={e.org}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="font-medium">{e.org}</h3>
                    <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--muted)]">
                      {e.period}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{e.detail}</p>
                  {e.note && <p className="text-xs text-[var(--accent)]">{e.note}</p>}
                </div>
              ))}
            </div>
            <h2 className="mt-8 font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">
              LANGUAGES
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {about.languages.map((l) => (
                <span key={l} className="chip">
                  {l}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Beyond the screen */}
        <section className="mt-14">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">
            BEYOND THE SCREEN
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {about.hobbies.map((h) => (
              <div key={h.label} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
                <div className="font-display font-semibold text-[var(--ink)]">{h.label}</div>
                <p className="mt-1 text-sm text-[var(--muted)]">{h.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Archive */}
        <section className="mt-14">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-[var(--muted)]">ARCHIVE</h2>
          <div className="mt-4 space-y-3">
            {about.archive.map((a) => (
              <div key={a.title} className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-medium">{a.title}</span>
                <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--muted)]">
                  {a.period}
                </span>
                <p className="w-full text-sm text-[var(--muted)]">{a.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-14 border-t border-[var(--line)] pt-8">
          <h2 className="font-display text-xl font-semibold">Let’s talk.</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
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
        </section>
      </div>
    </main>
  )
}
