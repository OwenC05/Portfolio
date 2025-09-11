'use client'

import { motion, useReducedMotion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'

export default function MountainScene({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [0, 1], [5, -5])
  const rotateY = useTransform(x, [0, 1], [-5, 5])

  useEffect(() => {
    if (prefersReduced) return
    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX / window.innerWidth)
      y.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [prefersReduced, x, y])

  return (
    <motion.div
      className="absolute inset-0 mountain-gradient overflow-hidden"
      style={prefersReduced ? {} : { rotateX, rotateY }}
    >
      {/* simple layered mountain */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,600 0,300 200,200 400,350 600,150 800,300 800,600" fill="#e2e8f0" />
        <polygon points="0,600 0,350 200,250 450,400 650,200 800,350 800,600" fill="#f8fafc" />
      </svg>
      {children}
    </motion.div>
  )
}
