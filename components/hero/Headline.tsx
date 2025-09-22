'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useEffect, useState } from 'react'

type Props = {
  animate: boolean
  reduced: boolean
  onComplete?: () => void
}

export default function Headline({ animate, reduced, onComplete }: Props) {
  const [headlineDone, setHeadlineDone] = useState(!animate)

  useEffect(() => {
    if (!animate || reduced) {
      setHeadlineDone(true)
      onComplete?.()
    }
  }, [animate, reduced, onComplete])

  const stagger = 0.12
  const analyzeDur = 0.24
  const designDur = 0.45
  const sublineDelayAfterHeadline = 0.18

  return (
    <div className="text-center">
      <p className="mb-6 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)] font-body">
        OWEN | DATA SCIENCE &times; SOFTWARE ENGINEER
      </p>

      <LazyMotion features={domAnimation}>
        <m.h1
          key={animate && !reduced ? 'reveal' : 'static'}
          className="font-display font-extrabold leading-[0.9] tracking-[0.1em] uppercase text-6xl sm:text-7xl md:text-8xl text-[color:var(--ink)]"
          initial={animate && !reduced ? 'hidden' : undefined}
          animate={animate && !reduced ? 'visible' : undefined}
          variants={
            animate && !reduced
              ? {
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: stagger,
                      when: 'beforeChildren',
                    },
                  },
                }
              : undefined
          }
          onAnimationComplete={() => {
            if (animate && !reduced) {
              setHeadlineDone(true)
              onComplete?.()
            }
          }}
        >
          {/* ANALYZE */}
          <m.span
            className="block text-[color:var(--ink)] text-glow"
            variants={
              animate && !reduced
                ? {
                    hidden: { y: 12, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: { duration: analyzeDur, ease: 'easeOut' },
                    },
                  }
                : undefined
            }
          >
            Analyze
          </m.span>

          {/* DESIGN + BUILD row */}
          <m.span className="block">
            <m.span
              className="inline-block stroke-1"
              style={{ color: 'var(--build-outline)' }}
              variants={
                animate && !reduced
                  ? {
                      hidden: { opacity: 0, y: 12 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: designDur, ease: 'easeOut' },
                      },
                    }
                  : undefined
              }
            >
              Design
            </m.span>
            <m.span
              className="ml-3 inline-block text-[color:var(--ink)] text-glow"
              variants={
                animate && !reduced
                  ? {
                      hidden: { opacity: 0, scale: 0.98 },
                      visible: {
                        opacity: 1,
                        scale: [1, 1.02, 1],
                        transition: {
                          opacity: { duration: 0.2, ease: 'easeOut' },
                          scale: {
                            type: 'spring',
                            stiffness: 200,
                            damping: 24,
                          },
                        },
                      },
                    }
                  : undefined
              }
            >
              Build
            </m.span>
          </m.span>
        </m.h1>
      </LazyMotion>

      {/* Subline after headline completes */}
      <LazyMotion features={domAnimation}>
        <m.p
          className="mt-6 text-[color:var(--muted)] max-w-2xl mx-auto font-body"
          initial={animate && !reduced ? { opacity: 0, y: 8 } : undefined}
          animate={
            animate && !reduced
              ? headlineDone
                ? { opacity: 1, y: 0 }
                : undefined
              : undefined
          }
          transition={
            animate && !reduced
              ? {
                  delay: sublineDelayAfterHeadline,
                  duration: 0.22,
                  ease: 'easeOut',
                }
              : undefined
          }
        >
          I carve lines through messy data
        </m.p>
      </LazyMotion>
    </div>
  )
}
