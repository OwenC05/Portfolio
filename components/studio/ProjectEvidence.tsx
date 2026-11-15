import { projectAnchor, type StudioProject } from '@/lib/studio-contract'
import styles from '@/app/studio/studio.module.css'

export default function ProjectEvidence({
  project,
  index,
  idPrefix = '',
}: {
  project: StudioProject
  index: number
  idPrefix?: string
}) {
  const sectionId = `${idPrefix}${projectAnchor(project.id).slice(1)}`
  const headingId = `${sectionId}-heading`

  return (
    <section
      id={sectionId}
      className={styles.project}
      aria-labelledby={headingId}
    >
      <header className={styles.projectHeader}>
        <span className={styles.projectIndex} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className={styles.projectEyebrow}>{project.eyebrow}</p>
        <h2 id={headingId} className={styles.projectTitle} tabIndex={-1}>
          {project.title}
        </h2>
        <p className={styles.projectSummary}>{project.summary}</p>
      </header>

      <div className={styles.projectBody}>
        <dl className={styles.projectFacts}>
          {project.facts.map((fact) => (
            <div key={fact.label} className={styles.projectFact}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.projectSections}>
          {project.sections.map((section, sectionIndex) => (
            <section
              key={section.heading}
              className={styles.projectSection}
              aria-labelledby={`${sectionId}-section-${sectionIndex + 1}`}
            >
              <h3 id={`${sectionId}-section-${sectionIndex + 1}`}>
                {section.heading}
              </h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>

      {project.links.length > 0 ? (
        <nav
          className={styles.projectLinks}
          aria-label={`${project.title} links`}
        >
          {project.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}

      <a className={styles.returnLink} href="#studio">
        Back to studio
      </a>
    </section>
  )
}
