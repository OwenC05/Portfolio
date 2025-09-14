"use client"

import { LazyMotion, domAnimation, m } from 'framer-motion'

interface Props {
  animate: boolean
  visible: boolean
  delay?: number
}

export default function CTAGroup({ animate, visible, delay = 0 }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="mt-10 flex items-center justify-center gap-8"
        initial={animate ? { opacity: 0, y: 10 } : undefined}
        animate={animate ? (visible ? { opacity: 1, y: 0 } : undefined) : undefined}
        transition={animate ? { delay, duration: 0.28, ease: 'easeOut' } : undefined}
      >
        <a
          href="/work"
          className="group inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-[15px] font-medium text-brand-ink/85 transition-colors hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
        >
          <span>see my projects</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
        <a
          href="/about"
          className="group inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-[15px] font-medium text-brand-ink/85 transition-colors hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
        >
          <span>more about me</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </m.div>
    </LazyMotion>
  )
}
