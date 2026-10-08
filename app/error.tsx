'use client'
import Link from 'next/link'
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="page-shell recovery-page">
      <p className="eyebrow">Something went wrong</p>
      <h1>
        A brief
        <br />
        <em>interruption.</em>
      </h1>
      <p className="lede">
        The page could not be loaded. Try again, or return to the work.
      </p>
      <div className="hero-actions">
        <button className="text-link" onClick={reset}>
          Try again ↗
        </button>
        <Link href="/projects">Explore the work</Link>
      </div>
    </section>
  )
}
