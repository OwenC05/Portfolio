"use client"

import { LazyMotion, domAnimation, m } from 'framer-motion'

type Props = {
  text?: string
  animate: boolean
  reduced: boolean
  duration?: number
  className?: string
}

export default function DesignStroke({ text = 'Design', animate, reduced, duration = 0.4, className }: Props) {
  // Fallback: no animation path for reduced or when not animating
  if (reduced || !animate) {
    return (
      <span
        className={[className, 'stroke-1'].filter(Boolean).join(' ')}
        style={{ WebkitTextFillColor: 'transparent' as any }}
      >
        {text}
      </span>
    )
  }

  // Inline SVG text with stroke dash animation; scales with font-size via height: 1em
  return (
    <LazyMotion features={domAnimation}>
      <m.svg
        viewBox="0 0 100 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        role="img"
        className={className}
        style={{ height: '1em', width: 'auto', verticalAlign: '-0.08em' }}
      >
        <m.text
          x="0"
          y="15"
          fontSize="16"
          fontFamily="var(--font-outfit), Outfit, system-ui, sans-serif"
          fontWeight={800}
          letterSpacing="0.04em"
          fill="transparent"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: 400,
          }}
          initial={{ opacity: 0, strokeDashoffset: 400 }}
          animate={{ opacity: 1, strokeDashoffset: 0 }}
          transition={{ duration, ease: 'easeOut' }}
        >
          {text.toUpperCase()}
        </m.text>
      </m.svg>
    </LazyMotion>
  )
}
