'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  disabled?: boolean
  onLift: () => void
}

export default function Chairlift({ disabled, onLift }: Props) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.button
      disabled={disabled}
      onClick={onLift}
      aria-label="Ascend to parent"
      className="fixed top-4 right-4 z-10 rounded-full bg-white/80 backdrop-blur shadow-lg border border-white/40 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      whileHover={disabled || prefersReduced ? {} : { y: -2 }}
      whileTap={disabled || prefersReduced ? {} : { scale: 0.95 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700">
        <path d="M3 10h18" />
        <path d="M8 10v8a2 2 0 0 0 2 2h4" />
        <path d="M16 6a2 2 0 1 1 4 0v12" />
        <circle cx="8" cy="6" r="2" />
      </svg>
    </motion.button>
  )
}
