import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { publicProjects, getPublicProject } from '@/lib/publicPortfolio'
import { TypeForgePreview } from '@/components/portfolio/TypeForgePreview'
export function generateStaticParams() {
  return publicProjects.map((p) => ({ slug: p.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = getPublicProject(slug)
  return p
    ? {
        title: p.title,
        description: p.blurb,
        alternates: { canonical: `/projects/${p.slug}` },
      }
    : { title: 'Project not found' }
}
export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = getPublicProject(slug)
  if (!p) notFound()
  const next =
    publicProjects[
      (publicProjects.findIndex((x) => x.slug === slug) + 1) %
        publicProjects.length
    ]
  return (
    <article className="page-shell case-study">
      <header className="page-heading">
        <Link className="back-link" href="/projects">
          ← All work
        </Link>
        <p className="eyebrow">
          {p.year} / {p.status}
        </p>
        <h1>{p.title}</h1>
        <p className="case-deck">{p.tagline}</p>
        <p className="lede">{p.summary}</p>
        {p.liveUrl && (
          <a className="text-link" href={p.liveUrl}>
            Try the live demo ↗
          </a>
        )}
      </header>
      <dl className="case-meta">
        <div>
          <dt>Role</dt>
          <dd>{p.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{p.status}</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>
            {p.confidential
              ? 'Public summary · confidential work'
              : 'Project summary'}
          </dd>
        </div>
      </dl>
      {p.id === 'typeforge' && (
        <div className="case-figure">
          <TypeForgePreview />
        </div>
      )}
      <div className="case-body">
        <section className="case-section">
          <h2>
            <span>01</span>The context
          </h2>
          <p>{p.context}</p>
        </section>
        <section className="case-section">
          <h2>
            <span>02</span>My contribution
          </h2>
          <p>{p.contribution}</p>
        </section>
        <section className="case-section">
          <h2>
            <span>03</span>The approach
          </h2>
          <ul>
            {p.approach.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="case-section">
          <h2>
            <span>04</span>Evidence & limitations
          </h2>
          <div>
            <ul>
              {p.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="evidence-note">
              <p className="eyebrow">The boundaries of this account</p>
              {p.limitations.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </section>
        <section className="case-section">
          <h2>
            <span>05</span>Tools & methods
          </h2>
          <ul className="tool-list">
            {p.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="case-next">
        <div>
          <p className="eyebrow">Continue exploring</p>
          <Link href={`/projects/${next.slug}`}>
            {next.title} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <a className="text-link" href={p.markdownUrl}>
          Read as Markdown ↗
        </a>
      </div>
    </article>
  )
}
