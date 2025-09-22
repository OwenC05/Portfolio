'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'

type Props = { animate: boolean; reduced: boolean }

export default function BlobField({ animate, reduced }: Props) {
  // target opacities for final state
  const o1 = 0.3
  const o2 = 0.25
  const o3 = 0.2

  const glowKeyframes = (target: number) =>
    animate && !reduced
      ? { opacity: [0, target, Math.max(0, target * 0.85)] }
      : undefined

  const glowTiming =
    animate && !reduced
      ? { duration: 1.2, times: [0, 0.8, 1], ease: 'easeOut' as const }
      : undefined
  const fadeTimingReduced =
    animate && reduced ? { duration: 0.2, ease: 'easeOut' as const } : undefined

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <LazyMotion features={domAnimation}>
        <m.div
          className="absolute -z-10 left-[-6rem] top-[-4rem] h-80 w-80 blur-3xl"
          style={{
            opacity: animate ? 0 : o1,
            backgroundImage:
              'radial-gradient(closest-side, color-mix(in oklab, var(--glow) 78%, transparent) 0%, transparent 72%)',
          }}
          animate={
            glowKeyframes(o1) ||
            (animate && reduced ? { opacity: o1 } : undefined)
          }
          transition={glowKeyframes(o1) ? glowTiming : fadeTimingReduced}
        />
        <m.div
          className="absolute -z-10 right-[-4rem] top-20 h-96 w-96 blur-3xl"
          style={{
            opacity: animate ? 0 : o2,
            backgroundImage:
              'radial-gradient(closest-side, color-mix(in oklab, var(--accent) 82%, transparent) 0%, transparent 70%)',
          }}
          animate={
            glowKeyframes(o2) ||
            (animate && reduced ? { opacity: o2 } : undefined)
          }
          transition={glowKeyframes(o2) ? glowTiming : fadeTimingReduced}
        />
        <m.div
          className="absolute -z-10 left-1/2 bottom-[-6rem] h-[28rem] w-[28rem] -translate-x-1/2 blur-3xl"
          style={{
            opacity: animate ? 0 : o3,
            backgroundImage:
              'radial-gradient(closest-side, color-mix(in oklab, var(--glow) 65%, var(--snow) 35%) 0%, transparent 72%)',
          }}
          animate={
            glowKeyframes(o3) ||
            (animate && reduced ? { opacity: o3 } : undefined)
          }
          transition={glowKeyframes(o3) ? glowTiming : fadeTimingReduced}
        />
      </LazyMotion>
    </div>
  )
}
