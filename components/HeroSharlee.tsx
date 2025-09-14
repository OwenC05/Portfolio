"use client"

import BlobField from './BlobField'
import dynamic from 'next/dynamic'
import Headline from './hero/Headline'
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
    <section className="relative min-h-[92dvh] overflow-hidden bg-[var(--bg)] transition-colors">
      <BlobField key={canAnimate ? 'anim' : 'static'} animate={!!canAnimate} reduced={!!reduced} />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.035]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
      <LazyMotion features={domAnimation}>
        <m.div
          key={canAnimate ? 'anim' : 'static'}
          className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-28 md:pb-32 text-center"
          initial={canAnimate && reduced ? { opacity: 0 } : undefined}
          animate={canAnimate && reduced ? { opacity: 1 } : undefined}
          transition={canAnimate && reduced ? { duration: 0.17, ease: 'easeOut' } : undefined}
        >
          <Headline animate={!!canAnimate} reduced={!!reduced} onComplete={onHeadlineComplete} />

          <div className="mt-10 flex items-center justify-center gap-4">
            <m.a
              href="#projects"
              className="rounded-full px-6 py-3 bg-brand-primary text-slate-900 font-semibold shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
              data-cursor-fill="var(--ink)"
              initial={canAnimate && !reduced ? { opacity: 0, y: 10, boxShadow: '0 0 0 0 rgba(0,0,0,0)' } : undefined}
              animate={
                canAnimate && !reduced
                  ? headlineDone
                    ? { opacity: 1, y: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.16)' }
                    : undefined
                  : undefined
              }
              transition={canAnimate && !reduced ? { delay: ctaDelay, duration: 0.28, ease: 'easeOut' } : undefined}
            >
              View Projects
            </m.a>
            <m.a
              href="#contact"
              className="rounded-full px-6 py-3 text-[var(--ink)] ring-1 ring-[var(--line)] bg-[var(--ide-bg)] transition hover:bg-[var(--ide-chrome)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              data-cursor-fill="var(--ink)"
              initial={canAnimate && !reduced ? { opacity: 0, y: 10, boxShadow: '0 0 0 0 rgba(0,0,0,0)' } : undefined}
              animate={
                canAnimate && !reduced
                  ? headlineDone
                    ? { opacity: 1, y: 0, boxShadow: '0 8px 22px rgba(0,0,0,0.12)' }
                    : undefined
                  : undefined
              }
              transition={canAnimate && !reduced ? { delay: ctaDelay, duration: 0.32, ease: 'easeOut' } : undefined}
            >
              Get In Touch
            </m.a>
          </div>
        </m.div>
      </LazyMotion>
      {/* Mountain band pinned to bottom */}
      <div className="mountain-band pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[26vh] sm:h-[22vh] md:h-[28vh]">
        <Suspense
          fallback={<div className="w-full h-full" aria-hidden />}
        >
          <MountainBand key={canAnimate ? 'anim' : 'static'} animate={!!canAnimate} reduced={!!reduced} />
        </Suspense>
      </div>
    </section>
  )
}
