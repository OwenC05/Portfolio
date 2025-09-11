'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProjectNode as Node } from '@/app/projects/data'

interface Props {
  node: Node
  selected: boolean
  onSelect: () => void
}

export default function ProjectNode({ node, selected, onSelect }: Props) {
  return (
    <div className="relative flex flex-col items-start">
      <motion.button
        layout
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSelect}
        aria-label={`${node.title}, project node`}
        className={`rounded-2xl backdrop-blur bg-white/70 shadow-lg border border-white/40 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
          selected ? 'ring-2 ring-sky-400' : ''
        }`}
      >
        <div className="text-sm font-semibold text-gray-800">{node.title}</div>
        <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-1">
          {node.tags.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
              {t}
            </span>
          ))}
        </div>
      </motion.button>
      <Link
        href={`/projects/${node.slug}`}
        className="mt-1 text-xs text-sky-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        View project
      </Link>
    </div>
  )
}
