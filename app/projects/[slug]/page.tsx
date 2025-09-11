'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { projectTree } from '../data'
import { indexBySlug } from '@/lib/tree'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'

export default function ProjectDetail({ params }: { params: { slug: string } }) {
  const map = indexBySlug(projectTree)
  const node = map[params.slug]

  const router = useRouter()
  const controls = useAnimation()
  const prefersReduced = useReducedMotion()

  const handleReturn = async () => {
    if (prefersReduced) {
      router.push('/projects')
      return
    }
    await controls.start({ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } })
    router.push('/projects')
  }

  if (!node) {
    return (
      <div className="p-8">
        <p>Project not found.</p>
        <Link href="/projects" className="text-sky-600 underline">
          Back
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={controls}
      className="relative p-8 max-w-2xl mx-auto"
    >
      <button
        onClick={handleReturn}
        aria-label="Back to Projects"
        className="absolute top-4 left-4 rounded-full bg-white/80 backdrop-blur shadow-lg border border-white/40 px-4 py-2 text-sm text-sky-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        ← Back to Projects
      </button>

      <h1 className="mt-12 text-3xl font-bold">{node.title}</h1>
      <p className="mt-4 text-gray-700">{node.blurb}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {node.tags.map((t) => (
          <span key={t} className="px-2 py-1 rounded bg-sky-100 text-sky-700 text-sm">
            {t}
          </span>
        ))}
      </div>
      <Link href="/projects" className="mt-8 inline-block text-sky-600 underline">
        Back to Projects
      </Link>
    </motion.div>
  )
}
