'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'

import BlobField from '../BlobField'
import ThemeToggle from '../ui/ThemeToggle'
import Headline from './Headline'
import CTAGroup from './CTAGroup'
import { useHeroReveal } from '@/lib/useHeroReveal'

const MountainBand = dynamic(() => import('./MountainBand'), {
  ssr: false,
  suspense: true,
})

export default function Hero() {
  const {
    mounted,
    reduced,
    shouldAnimate,
    forceReveal,
    markDone,
    removeRevealParam,
  } = useHeroReveal()

  const [headlineDone, setHeadlineDone] = useState(false)
  const canAnimate = mounted && shouldAnimate

  const handleHeadlineComplete = () => {
    setHeadlineDone(true)
    markDone()
    if (forceReveal) removeRevealParam()
  }

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>
      <BlobField animate={!!canAnimate} reduced={!!reduced} />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.035]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
      <LazyMotion features={domAnimation}>
        <m.div
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center gap-6 px-6 pb-36 md:pb-40 text-center"
          initial={canAnimate && reduced ? { opacity: 0 } : undefined}
          animate={canAnimate && reduced ? { opacity: 1 } : undefined}
          transition={
            canAnimate && reduced
              ? { duration: 0.18, ease: 'easeOut' }
              : undefined
          }
        >
          <Headline
            animate={!!canAnimate}
            reduced={!!reduced}
            onComplete={handleHeadlineComplete}
          />
          <CTAGroup
            animate={canAnimate && !reduced}
            visible={headlineDone}
            delay={0.18}
          />
        </m.div>
      </LazyMotion>
      <Suspense fallback={<div className="h-[30vh]" aria-hidden />}>
        <MountainBand />
      </Suspense>
    </section>
  )
}
