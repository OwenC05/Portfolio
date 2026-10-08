import Link from 'next/link'
import { publicProjects } from '@/lib/publicPortfolio'
import { ProjectFigure } from './ProjectFigure'

type PublicProject = (typeof publicProjects)[number]
export function ProjectRow({
  project: p,
  index,
  featured = false,
  headingLevel = 3,
}: {
  project: PublicProject
  index: number
  featured?: boolean
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className={`project-row${featured ? ' project-featured' : ''}`}>
      <div className="project-copy">
        <div className="project-kicker">
          <span className="eyebrow">
            {String(index + 1).padStart(2, '0')} / {p.year}
          </span>
          <span className="project-status">{p.status}</span>
        </div>
        <Heading className="project-title">
          <Link href={`/projects/${p.slug}`}>
            {p.title}
            <span className="project-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        </Heading>
        <p className="project-deck">{p.tagline}</p>
        <p className="project-description">{p.blurb}</p>
        <div className="contribution">
          <span className="eyebrow">My contribution</span>
          <p>{p.contribution}</p>
        </div>
        <Link className="text-link" href={`/projects/${p.slug}`}>
          Read{' '}
          {p.id.startsWith('lexisnexis')
            ? 'the case study'
            : `about ${p.title}`}{' '}
          <span aria-hidden="true">↗</span>
        </Link>
        {p.liveUrl && (
          <a className="text-link project-live" href={p.liveUrl}>
            Try the public demo <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
      <ProjectFigure kind={p.id} compact={!featured} />
    </article>
  )
}
