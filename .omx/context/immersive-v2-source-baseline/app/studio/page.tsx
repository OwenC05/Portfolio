import type { Metadata } from 'next'
import ProjectEvidence from '@/components/studio/ProjectEvidence'
import StudioExperience from '@/components/studio/StudioExperience'
import { studioProfile, studioProjects } from '@/lib/studio-content'
import { projectAnchor } from '@/lib/studio-contract'
import styles from './studio.module.css'

export const metadata: Metadata = {
  title: `${studioProfile.name} — After-hours Studio`,
  description: studioProfile.intro,
}

export default function StudioPage() {
  return (
    <StudioExperience
      introduction={
        <>
          <header className={styles.topbar}>
            <a className={styles.wordmark} href="#studio">
              After-hours Studio
            </a>
            <nav
              className={styles.contactNavigation}
              aria-label="Work and contact"
            >
              <a href="#work">Work</a>
              {studioProfile.links.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </header>

          <div className={styles.introduction}>
            <p className={styles.eyebrow}>{studioProfile.role}</p>
            <h1 id="studio-title" className={styles.name}>
              {studioProfile.name}
            </h1>
            <p className={styles.intro}>{studioProfile.intro}</p>

            <nav
              className={styles.projectNavigation}
              aria-label="Selected projects"
            >
              {studioProjects.map((project, index) => (
                <a
                  key={project.id}
                  className={styles.projectLink}
                  href={projectAnchor(project.id)}
                >
                  <span className={styles.projectNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.projectLinkLabel}>
                    {project.title}
                  </span>
                </a>
              ))}
            </nav>

            <p className={styles.personalNote}>{studioProfile.personalNote}</p>
          </div>
        </>
      }
    >
      <main
        id="work"
        className={styles.evidence}
        tabIndex={-1}
        aria-labelledby="work-title"
      >
        <div className={styles.workIntroduction}>
          <p className={styles.sectionLabel}>Selected work</p>
          <h2 id="work-title" className={styles.workTitle}>
            The work behind the studio.
          </h2>
        </div>

        {studioProjects.map((project, index) => (
          <ProjectEvidence key={project.id} project={project} index={index} />
        ))}
      </main>

      <footer className={styles.footer} aria-labelledby="contact-title">
        <h2 id="contact-title" className={styles.footerTitle}>
          Get in touch.
        </h2>
        <nav className={styles.footerLinks} aria-label="Contact and profiles">
          {studioProfile.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className={styles.returnLink} href="#studio">
          Back to studio
        </a>
      </footer>
    </StudioExperience>
  )
}
