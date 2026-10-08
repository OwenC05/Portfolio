import type { Metadata } from 'next'
import { publicProjects } from '@/lib/publicPortfolio'
import { ProjectRow } from '@/components/portfolio/ProjectRow'
export const metadata: Metadata = {
  title: 'Work',
  description:
    'Applied AI, adaptive practice and thoughtful software — projects by Owen Cheung.',
  alternates: { canonical: '/projects' },
}
export default function Projects() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">
          The work / {String(publicProjects.length).padStart(2, '0')} projects
        </p>
        <h1>
          Selected work
          <br />& <em>explorations.</em>
        </h1>
        <p className="lede">
          From human-governed AI to the small details of everyday software. The
          context, my contribution, and what the evidence actually says.
        </p>
      </header>
      <section className="project-index" aria-label="Projects">
        {publicProjects.map((p, i) => (
          <ProjectRow
            key={p.slug}
            project={p}
            index={i}
            featured
            headingLevel={2}
          />
        ))}
      </section>
    </div>
  )
}
