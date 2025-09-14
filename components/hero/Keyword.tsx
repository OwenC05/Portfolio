"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHoverFocus } from "@/components/hero/useHoverFocus"
import { AnalyzeBinary } from "@/components/hero/effects/AnalyzeBinary"
import { DesignBlueprint } from "@/components/hero/effects/DesignBlueprint"
import { BuildAssemble } from "@/components/hero/effects/BuildAssemble"

type Kind = "analyze" | "design" | "build"

type Props = {
  kind: Kind
  children: React.ReactNode
  className?: string
}

export function Keyword({ kind, children, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const { active } = useHoverFocus(ref)
  const [mounted, setMounted] = useState(false)
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  const reduced = usePrefersReducedMotion()

  // Manage mount/unmount around exit animations
  useEffect(() => {
    if (active) setMounted(true)
  }, [active])

  const handleExitComplete = useCallback(() => {
    setMounted(false)
  }, [])

  // Measure size via ResizeObserver
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setSize({ w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const Effect = useMemo(() => {
    switch (kind) {
      case "analyze":
        return AnalyzeBinary
      case "design":
        return DesignBlueprint
      case "build":
        return BuildAssemble
      default:
        return null
    }
  }, [kind])

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={0}
      className={[
        "relative inline-block align-baseline outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm",
        className ?? "",
      ].join(" ")}
    >
      <span className="relative z-[1] select-text">{children}</span>
      {/* Overlay */}
      {Effect && mounted ? (
        <div className="effect-layer" aria-hidden>
          <Effect
            active={active}
            width={size.w}
            height={size.h}
            reducedMotion={reduced}
            onExitComplete={handleExitComplete}
          />
        </div>
      ) : null}
    </span>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const set = () => setReduced(!!mq.matches)
    set()
    mq.addEventListener?.("change", set)
    return () => mq.removeEventListener?.("change", set)
  }, [])
  return reduced
}

