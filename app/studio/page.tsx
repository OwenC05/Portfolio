import type { Metadata } from 'next'
import Link from 'next/link'
import ProjectEvidence from '@/components/studio/ProjectEvidence'
import StudioExperience from '@/components/studio/StudioExperience'
import { studioProfile, studioProjects } from '@/lib/studio-content'
import styles from './studio.module.css'

export const metadata: Metadata = {
  title: `${studioProfile.name} — After-hours Studio`,
  description: studioProfile.intro,
}

export default function StudioPage() {
  return (
    <StudioExperience
      evidence={
        <section
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
        </section>
      }
    >
      <section
        id="about"
        className={styles.about}
        tabIndex={-1}
        aria-labelledby="about-title"
      >
        <h2 id="about-title" className={styles.sectionLabel}>
          About
        </h2>
        <div className={styles.aboutBody}>
          <p className={styles.aboutRole}>{studioProfile.role}</p>
          <p className={styles.aboutLead}>{studioProfile.intro}</p>
          <p className={styles.aboutNote}>{studioProfile.personalNote}</p>
        </div>
      </section>

      <footer
        id="contact"
        className={styles.contact}
        tabIndex={-1}
        aria-labelledby="contact-title"
      >
        <h2 id="contact-title" className={styles.contactTitle}>
          Get in touch.
        </h2>
        <nav className={styles.contactLinks} aria-label="Contact and profiles">
          <Link href="/ask">Ask the portfolio</Link>
          <Link href="/work">Work & background</Link>
          <Link href="/writing">Writing</Link>
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
