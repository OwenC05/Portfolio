'use client'

import { useEffect, useState } from 'react'

export function ParallaxMountains() {
  const [scrollY, setScrollY] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    const handleScroll = () => {
      if (!prefersReducedMotion) {
        setScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/assets/mountains-back.svg"
          alt=""
          className="absolute bottom-0 w-full h-auto opacity-20"
        />
        <img
          src="/assets/mountains-mid.svg"
          alt=""
          className="absolute bottom-0 w-full h-auto opacity-30"
        />
        <img
          src="/assets/mountains-front.svg"
          alt=""
          className="absolute bottom-0 w-full h-auto opacity-40"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src="/assets/mountains-back.svg"
        alt=""
        className="parallax-layer absolute bottom-0 w-full h-auto opacity-20"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />
      <img
        src="/assets/mountains-mid.svg"
        alt=""
        className="parallax-layer absolute bottom-0 w-full h-auto opacity-30"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      <img
        src="/assets/mountains-front.svg"
        alt=""
        className="parallax-layer absolute bottom-0 w-full h-auto opacity-40"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
    </div>
  )
}
