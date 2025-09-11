"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectsStore } from '@/lib/projectsStore'
import { getParent, indexById } from '@/lib/tree'
import { projectTree } from '@/app/projects/data'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'

const idIndex = indexById(projectTree)

export default function HUD() {
  const router = useRouter()
  const { currentId, mode } = useProjectsStore((s) => ({ currentId: s.currentId, mode: s.mode }))
  const setTarget = useProjectsStore((s) => s.setTarget)
  const setReduced = useProjectsStore((s) => s.setReducedMotion)
  const prefersReduced = useReducedMotion()
  const controls = useAnimation()

  useEffect(() => {
    setReduced(!!prefersReduced)
  }, [prefersReduced, setReduced])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!currentId || mode !== 'idle') return
      const cur = idIndex[currentId]
      if (!cur) return
      if (e.key === 'ArrowLeft') {
        if (cur.left) setTarget(cur.left.id, 'ride')
      } else if (e.key === 'ArrowRight') {
        if (cur.right) setTarget(cur.right.id, 'ride')
      } else if (e.key === 'ArrowUp') {
        const p = getParent(projectTree, currentId)
        if (p) setTarget(p.id, 'lift')
      } else if (e.key === 'Enter' || e.key === ' ') {
        const node = idIndex[currentId]
        if (node) router.push(`/projects/${node.slug}`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentId, mode, setTarget, router])

  const backToHero = async () => {
    if (prefersReduced) {
      router.push('/#hero')
      return
    }
    await controls.start({ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } })
    router.push('/#hero')
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={controls}
      className="pointer-events-none absolute inset-0"
    >
      <div className="pointer-events-auto absolute top-4 left-4 flex items-center gap-2">
        <button
          onClick={backToHero}
          className="rounded-full bg-white/80 backdrop-blur shadow-lg border border-white/40 px-4 py-2 text-sm text-sky-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          ← Back to Hero
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="rounded bg-white/80 backdrop-blur px-3 py-1 text-xs text-gray-700 shadow border border-white/40">
          Arrows to navigate, Enter to open
        </div>
      </div>

      {/* DOM fallback for screen readers */}
      <nav aria-label="Projects list" className="sr-only">
        <ul>
          {Object.values(idIndex).map((n) => (
            <li key={n.id}>
              <a href={`/projects/${n.slug}`}>{n.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  )
}
