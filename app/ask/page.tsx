import type { Metadata } from 'next'
import Link from 'next/link'
import AssistantWorkbench from '@/components/assistant/AssistantWorkbench'
import styles from '@/components/assistant/assistant.module.css'

export const metadata: Metadata = {
  title: 'Ask the portfolio | Owen Cheung',
  description:
    'Explore Owen’s experience and projects through their published sources, with an inspectable retrieval map.',
}

export default function AskPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.navigation} aria-label="Portfolio">
        <Link href="/">Owen Cheung</Link>
        <Link href="/studio">Studio</Link>
        <Link href="/work">Work & background</Link>
        <Link href="/writing">Writing</Link>
      </nav>
      <AssistantWorkbench
        generationEnabled={process.env.ASSISTANT_GENERATION_ENABLED === 'true'}
      />
      <noscript>
        <p className={styles.navigation}>
          The interactive assistant needs JavaScript.{' '}
          <Link href="/work">Browse the published sources</Link> or{' '}
          <a href="mailto:oc608@bath.ac.uk">contact Owen</a>.
        </p>
      </noscript>
    </main>
  )
}
