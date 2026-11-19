import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  findPublishedKnowledge,
  publishedKnowledge,
} from '@/lib/knowledge/catalog'
import styles from '../content.module.css'

export function generateStaticParams() {
  return publishedKnowledge
    .filter((record) => record.category !== 'writing')
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
      record && record.category !== 'writing'
        ? `${record.title} | Owen Cheung`
        : 'Not found | Owen Cheung',
  }
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const record = findPublishedKnowledge((await params).slug)
  if (!record || record.category === 'writing') notFound()
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Portfolio">
          <Link href="/work">All work</Link>
          <Link href="/ask">Ask the portfolio</Link>
          <Link href="/writing">Writing</Link>
          <Link href="/studio">Studio</Link>
        </nav>
        <article className={styles.article}>
          <p className={styles.eyebrow}>
            {record.category} / {record.status}
          </p>
          <h1 className={styles.title}>{record.title}</h1>
          <p className={styles.intro}>{record.summary}</p>
          <p className={styles.meta}>
            Evidence: {record.evidenceKind} · Updated{' '}
            <time dateTime={record.updatedAt}>{record.updatedAt}</time>
          </p>
          <ul className={styles.links} aria-label="On this page">
            {record.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading}</a>
              </li>
            ))}
          </ul>
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
            <h2>Sources & further reading</h2>
            <ul className={styles.links}>
              {record.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </section>
        </article>
        <footer className={styles.footer}>
          <Link href="/work">Back to all work</Link>
        </footer>
      </div>
    </main>
  )
}
