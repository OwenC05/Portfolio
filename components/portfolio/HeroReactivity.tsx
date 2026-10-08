'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { enhanceAlpineHero } from './alpineMotion'

/** Client boundary contains only lifecycle logic; its complete content is server rendered. */
export function HeroReactivity({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (ref.current) return enhanceAlpineHero(ref.current)
  }, [])
  return (
    <section
      ref={ref}
      className="alpine-hero"
      aria-labelledby="hero-heading"
      data-alpine-hero
    >
      {children}
    </section>
  )
}
