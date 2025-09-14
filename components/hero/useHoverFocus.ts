"use client"

import { useEffect, useRef, useState } from "react"

type HFReturn = { active: boolean }

/**
 * Hover OR focus-visible activation with tiny enter/exit debounce.
 * - enter: 60ms
 * - exit: 120ms
 * Also exits on Escape while focused.
 */
export function useHoverFocus<T extends HTMLElement>(ref: React.RefObject<T>): HFReturn {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(false)

  const enterTimer = useRef<number | null>(null)
  const exitTimer = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMouseEnter = () => setHovered(true)
    const onMouseLeave = () => setHovered(false)
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      // Prefer focus-visible; fallback to true if API unsupported
      const isVisible = typeof (target as any).matches === "function" ? target.matches(":focus-visible") : true
      if (isVisible) setFocused(true)
    }
    const onFocusOut = () => setFocused(false)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHovered(false)
        setFocused(false)
      }
    }

    el.addEventListener("mouseenter", onMouseEnter, { passive: true })
    el.addEventListener("mouseleave", onMouseLeave, { passive: true })
    el.addEventListener("focusin", onFocusIn)
    el.addEventListener("focusout", onFocusOut)
    el.addEventListener("keydown", onKeyDown)

    return () => {
      el.removeEventListener("mouseenter", onMouseEnter)
      el.removeEventListener("mouseleave", onMouseLeave)
      el.removeEventListener("focusin", onFocusIn)
      el.removeEventListener("focusout", onFocusOut)
      el.removeEventListener("keydown", onKeyDown)
    }
  }, [ref])

  useEffect(() => {
    // Debounced activation state
    const wantActive = hovered || focused

    if (wantActive) {
      if (exitTimer.current) {
        window.clearTimeout(exitTimer.current)
        exitTimer.current = null
      }
      if (!active) {
        if (enterTimer.current) window.clearTimeout(enterTimer.current)
        enterTimer.current = window.setTimeout(() => setActive(true), 60)
      }
    } else {
      if (enterTimer.current) {
        window.clearTimeout(enterTimer.current)
        enterTimer.current = null
      }
      if (active) {
        if (exitTimer.current) window.clearTimeout(exitTimer.current)
        exitTimer.current = window.setTimeout(() => setActive(false), 120)
      }
    }

    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current)
      if (exitTimer.current) window.clearTimeout(exitTimer.current)
      enterTimer.current = null
      exitTimer.current = null
    }
  }, [hovered, focused, active])

  return { active }
}

