import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)] flex items-center">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <p className="font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">404 · OFF PISTE</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Nothing here.
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--ink)]/80">
          Looks like you dropped into uncharted terrain.
        </p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Link href="/" className="chip-link">↑ Back to the run</Link>
          <Link href="/projects" className="chip-link">Trail map</Link>
        </div>
      </div>
    </main>
  )
}
