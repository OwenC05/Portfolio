import Link from 'next/link'
export default function NotFound() {
  return (
    <section className="page-shell recovery-page">
      <p className="eyebrow">404 / A missing page</p>
      <h1>
        Not every path
        <br />
        leads <em>somewhere.</em>
      </h1>
      <p className="lede">
        This page could not be found. There is plenty of work to explore
        elsewhere.
      </p>
      <div className="hero-actions">
        <Link className="text-link" href="/projects">
          Explore the work ↗
        </Link>
        <Link href="/">Back to home</Link>
      </div>
    </section>
  )
}
