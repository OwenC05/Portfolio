"use client"

import { useCallback, useRef, useState } from 'react'

type PointerState = {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  hoveringInteractive: boolean
}

const SELECTOR_INTERACTIVE = 'a,button,[role="button"],input:not([type="hidden"]),select,textarea,[tabindex]:not([tabindex="-1"])'

export function usePointer(opts?: { smoothing?: number }) {
  const smoothing = opts?.smoothing ?? 0.2
  const [state, setState] = useState<PointerState>({ x: -100, y: -100, vx: 0, vy: 0, speed: 0, hoveringInteractive: false })
  const lastT = useRef<number>(0)
  const lastX = useRef<number>(-100)
  const lastY = useRef<number>(-100)
  const mouseDrivenRef = useRef<boolean>(true)

  const compute = useCallback((clientX: number, clientY: number, target?: EventTarget | null) => {
    const now = performance.now()
    const dt = Math.max(0.001, (now - (lastT.current || now)) / 1000)
    const dx = clientX - lastX.current
    const dy = clientY - lastY.current
    const vx = dx / dt
    const vy = dy / dt
    const speed = Math.hypot(vx, vy)
    lastT.current = now
    lastX.current = clientX
    lastY.current = clientY
    const el = (target as Element | null) || null
    const hoveringInteractive = !!el?.closest?.(SELECTOR_INTERACTIVE)
    setState((s) => ({ ...s, x: clientX, y: clientY, vx, vy, speed, hoveringInteractive }))
  }, [])

  const onPointerMove = useCallback((e: PointerEvent) => {
    mouseDrivenRef.current = true
    if (document.documentElement.dataset.cursor === 'disabled') {
      delete document.documentElement.dataset.cursor
      document.documentElement.setAttribute('data-cursor', 'on')
    }
    compute(e.clientX, e.clientY, e.target)
  }, [compute])

  const onPointerDown = useCallback((e: PointerEvent) => {
    compute(e.clientX, e.clientY, e.target)
  }, [compute])

  const onPointerUp = useCallback((e: PointerEvent) => {
    compute(e.clientX, e.clientY, e.target)
  }, [compute])

  const onEnter = useCallback(() => {
    // noop; SnowCursor decides visibility
  }, [])
  const onLeave = useCallback(() => {
    // noop
  }, [])

  return { ...state, smoothing, onPointerMove, onPointerDown, onPointerUp, onEnter, onLeave }
}

