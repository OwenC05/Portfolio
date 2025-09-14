"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useReducedMotion } from 'framer-motion'

const SESSION_KEY = 'hero:revealed'

export function useHeroReveal() {
  const reduced = useReducedMotion()
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const forceReveal = params?.get('reveal') === '1'

  const cleanUrl = useMemo(() => {
    if (!params) return pathname
    const sp = new URLSearchParams(params.toString())
    sp.delete('reveal')
    return sp.toString() ? `${pathname}?${sp.toString()}` : pathname
  }, [params, pathname])

  const markDone = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, '1')
      }
    } catch {}
  }

  const removeRevealParam = () => {
    // keep URL tidy after a forced replay
    try {
      router.replace(cleanUrl as any)
    } catch {}
  }

  // decide whether to animate on mount
  useEffect(() => {
    // wait one RAF so client-only initial states can apply
    const id = requestAnimationFrame(() => setMounted(true))
    let played = false
    try {
      played = typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {}

    // bfcache handling: if page restored from cache, do not animate
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setShouldAnimate(false)
    }
    window.addEventListener('pageshow', onPageShow as any)

    setShouldAnimate(forceReveal || !played)
    return () => {
      window.removeEventListener('pageshow', onPageShow as any)
      cancelAnimationFrame(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    mounted,
    reduced,
    shouldAnimate,
    forceReveal,
    markDone,
    removeRevealParam,
  }
}
