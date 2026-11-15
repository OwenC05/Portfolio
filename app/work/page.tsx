import Link from 'next/link'
import {
  knowledgeHref,
  knowledgeVersion,
  publishedKnowledge,
} from '@/lib/knowledge/catalog'
import styles from './content.module.css'

export const metadata = {
  title: 'Work & background | Owen Cheung',
  description:
    'Projects, research preparation and experience, with source links and clear evidence limits.',
}

export default function WorkPage() {
  const records = publishedKnowledge.filter(
    (record) => record.category !== 'writing'
  )
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Portfolio">
          <Link href="/">Home</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/ask">Ask the portfolio</Link>
          <Link href="/writing">Writing</Link>
        </nav>
        <p className={styles.eyebrow}>Owen Cheung / Public sources</p>
        <h1 className={styles.title}>Work, with the evidence.</h1>
        <p className={styles.intro}>
          Projects, research and experience in applied AI and software
          engineering. Explore the problem, the work and the evidence behind
          each project.
        </p>
        <p className={styles.meta}>
          Source collection updated {knowledgeVersion.split('.')[0]}.
        </p>
        <div className={styles.grid}>
          {records.map((record) => (
            <article className={styles.card} key={record.id}>
              <p className={styles.eyebrow}>
                {record.category} / {record.status}
              </p>
              <h2>
                <Link href={knowledgeHref(record)}>{record.title}</Link>
              </h2>
              <p>{record.summary}</p>
              <p className={styles.meta}>
                Evidence: {record.evidenceKind} · Updated {record.updatedAt}
              </p>
            </article>
          ))}
        </div>
        <footer className={styles.footer}>
          <p>
            Have a question beyond these sources?{' '}
            <a href="mailto:oc608@bath.ac.uk">Contact Owen</a>.
          </p>
        </footer>
      </div>
    </main>
  )
}
