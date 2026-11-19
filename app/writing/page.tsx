import Link from 'next/link'
import { knowledgeHref, publishedKnowledge } from '@/lib/knowledge/catalog'
import styles from '../work/content.module.css'

export const metadata = {
  title: 'Writing | Owen Cheung',
  description: 'Research notes, experiments, engineering and personal writing.',
}
const categories = [
  [
    'Research notes',
    'Sources, the ideas they raise and a considered personal response.',
  ],
  [
    'Experiments',
    'Questions tested, methods used, results and the limits of those results.',
  ],
  [
    'Engineering',
    'Decisions, implementation details and lessons from building software.',
  ],
  [
    'Personal writing',
    'Space for interests and observations beyond technical work.',
  ],
]

export default function WritingPage() {
  const posts = publishedKnowledge.filter(
    (record) => record.category === 'writing'
  )
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Portfolio">
          <Link href="/">Home</Link>
          <Link href="/work">Work & background</Link>
          <Link href="/ask">Ask the portfolio</Link>
          <Link href="/studio">Studio</Link>
        </nav>
        <p className={styles.eyebrow}>Owen Cheung / Writing</p>
        <h1 className={styles.title}>Notes worth sharing.</h1>
        <p className={styles.intro}>
          A home for research notes, experiments, engineering and personal
          writing.
        </p>
        {posts.length ? (
          <div className={styles.grid}>
            {posts.map((post) => (
              <article className={styles.card} key={post.id}>
                <p className={styles.meta}>
                  {post.status} · {post.updatedAt}
                </p>
                <h2>
                  <Link href={knowledgeHref(post)}>{post.title}</Link>
                </h2>
                <p>{post.summary}</p>
              </article>
            ))}
          </div>
        ) : (
          <section
            className={styles.notice}
            aria-labelledby="publication-status"
          >
            <h2 id="publication-status">No published posts yet.</h2>
            <p>
              I’m putting together notes on the papers I read and the things I
              build. In the meantime, explore my{' '}
              <Link href="/work">work and projects</Link>.
            </p>
          </section>
        )}
        <div className={styles.grid}>
          {categories.map(([title, description]) => (
            <section className={styles.card} key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
