import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  findPublishedKnowledge,
  publishedKnowledge,
} from '@/lib/knowledge/catalog'
import styles from '../../work/content.module.css'

export function generateStaticParams() {
  return publishedKnowledge
    .filter((record) => record.category === 'writing')
    .map(({ slug }) => ({ slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const record = findPublishedKnowledge((await params).slug)
  return {
    title:
      record?.category === 'writing'
        ? `${record.title} | Owen Cheung`
        : 'Not found | Owen Cheung',
  }
}
export default async function WritingDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const record = findPublishedKnowledge((await params).slug)
  if (!record || record.category !== 'writing') notFound()
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Portfolio">
          <Link href="/writing">All writing</Link>
          <Link href="/work">Work</Link>
          <Link href="/ask">Ask the portfolio</Link>
        </nav>
        <article className={styles.article}>
          <p className={styles.eyebrow}>Writing / {record.status}</p>
          <h1 className={styles.title}>{record.title}</h1>
          <p className={styles.intro}>{record.summary}</p>
          <p className={styles.meta}>
            {record.updatedAt} · Evidence: {record.evidenceKind}
          </p>
          {record.sections.map((section) => (
            <section
              className={styles.section}
              id={section.id}
              key={section.id}
            >
              <h2>{section.heading}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          <section className={styles.section}>
            <h2>Sources</h2>
            <ul className={styles.links}>
              {record.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </main>
  )
}
