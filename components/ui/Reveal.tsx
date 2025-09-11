// install (optional): npm i framer-motion
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  delay?: number
  y?: number
}>

export function Reveal({ children, delay = 0, y = 12 }: Props) {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

