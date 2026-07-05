'use client'

import { useCallback, useEffect, useRef } from 'react'

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

export type SteeringInput = {
  /** Live steer value in [-1, 1]. Read in useFrame; never triggers re-render. */
  steer: React.MutableRefObject<number>
  /** Whether any input is currently engaged (for "tap to start" affordances). */
  engaged: React.MutableRefObject<boolean>
  /** Opt-in device-tilt steering (iOS needs a user-gesture permission prompt). */
  enableTilt: () => Promise<boolean>
}

/**
 * Unifies keyboard (←/→, A/D), pointer drag/hold (aim toward the side you press)
 * and optional device tilt into a single steer ref. Pointer overrides keyboard
 * overrides tilt. All listeners are passive-free where they must preventDefault.
 */
export function useSteeringInput(enabled = true): SteeringInput {
  const steer = useRef(0)
  const engaged = useRef(false)

  const keys = useRef({ left: false, right: false })
  const pointer = useRef({ active: false, value: 0 })
  const tilt = useRef({ active: false, value: 0 })

  const recompute = useCallback(() => {
    if (pointer.current.active) {
      steer.current = pointer.current.value
      engaged.current = true
      return
    }
    const k = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)
    if (k !== 0) {
      steer.current = k
      engaged.current = true
    } else if (tilt.current.active) {
      steer.current = tilt.current.value
    } else {
      steer.current = 0
    }
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.current.left = true
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.current.right = true
        e.preventDefault()
      } else return
      recompute()
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.current.left = false
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        keys.current.right = false
      else return
      recompute()
    }

    const updatePointer = (clientX: number) => {
      // Aim toward where you press: centre = 0, edges = ±1 (eased to reach full
      // tilt before the very edge of the screen).
      pointer.current.value = clamp((clientX / window.innerWidth - 0.5) * 2.2, -1, 1)
      recompute()
    }
    const onPointerDown = (e: PointerEvent) => {
      pointer.current.active = true
      updatePointer(e.clientX)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (pointer.current.active) updatePointer(e.clientX)
    }
    const onPointerUp = () => {
      pointer.current.active = false
      pointer.current.value = 0
      recompute()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [enabled, recompute])

  const enableTilt = useCallback(async () => {
    if (typeof window === 'undefined') return false
    const DOE = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> })
      | undefined
    if (!DOE) return false
    if (typeof DOE.requestPermission === 'function') {
      try {
        const res = await DOE.requestPermission()
        if (res !== 'granted') return false
      } catch {
        return false
      }
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      tilt.current.active = true
      tilt.current.value = clamp(e.gamma / 28, -1, 1) // ~28° = full lock
      recompute()
    }
    window.addEventListener('deviceorientation', onOrient)
    return true
  }, [recompute])

  return { steer, engaged, enableTilt }
}
