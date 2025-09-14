"use client"

import BlobField from './BlobField'
import dynamic from 'next/dynamic'
import Headline from './hero/Headline'
import CTAGroup from './hero/CTAGroup'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Suspense, useState } from 'react'
import { useHeroReveal } from '@/lib/useHeroReveal'

const MountainBand = dynamic(() => import('./hero/MountainBand'), { ssr: false, suspense: true })

export default function HeroSharlee() {
  const { mounted, reduced, shouldAnimate, forceReveal, markDone, removeRevealParam } = useHeroReveal()
  const [headlineDone, setHeadlineDone] = useState(false)

  const ctaDelay = 0.18 // after headline completes

  const onHeadlineComplete = () => {
    setHeadlineDone(true)
    markDone()
    if (forceReveal) removeRevealParam()
  }

  // ensure no hydration mismatch: render static until mounted
  const canAnimate = mounted && shouldAnimate

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-brand-bg">
      <BlobField key={canAnimate ? 'anim' : 'static'} animate={!!canAnimate} reduced={!!reduced} />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.035]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
      <LazyMotion features={domAnimation}>
        <m.div
          key={canAnimate ? 'anim' : 'static'}
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center gap-6 px-6 pb-36 md:pb-40 text-center"
          initial={canAnimate && reduced ? { opacity: 0 } : undefined}
          animate={canAnimate && reduced ? { opacity: 1 } : undefined}
          transition={canAnimate && reduced ? { duration: 0.17, ease: 'easeOut' } : undefined}
        >
          <Headline animate={!!canAnimate} reduced={!!reduced} onComplete={onHeadlineComplete} />
          <CTAGroup animate={canAnimate && !reduced} visible={headlineDone} delay={ctaDelay} />
        </m.div>
      </LazyMotion>
      {/* Mountain band pinned to bottom */}
      <div className="mountain-band pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[30vh] sm:h-[24vh] md:h-[34vh]">
        <Suspense
          fallback={<div className="w-full h-full" aria-hidden />}
        >
          <MountainBand key={canAnimate ? 'anim' : 'static'} animate={!!canAnimate} reduced={!!reduced} />
        </Suspense>
      </div>
    </section>
  )
}
