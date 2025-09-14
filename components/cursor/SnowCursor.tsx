"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { createParticlePool } from './particlePool'
import { defaultSettings, type ParticleInit } from './types'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { usePointer } from './usePointer'

export default function SnowCursor() {
  // SSR/feature guards
  const isClient = typeof window !== 'undefined'
  const prefersReduced = usePrefersReducedMotion()
  const [pointerFine, setPointerFine] = useState(false)

  useEffect(() => {
    if (!isClient) return
    const mq = window.matchMedia('(pointer: fine)')
    const set = () => setPointerFine(!!mq.matches)
    set()
    mq.addEventListener?.('change', set)
    return () => mq.removeEventListener?.('change', set)
  }, [isClient])

  const enabled = isClient && pointerFine

  // enable global cursor hiding only on client
  useEffect(() => {
    if (!enabled) return
    const html = document.documentElement
    html.setAttribute('data-cursor', 'on')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        html.setAttribute('data-cursor', 'disabled')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (html.getAttribute('data-cursor') === 'on' || html.getAttribute('data-cursor') === 'disabled') {
        html.removeAttribute('data-cursor')
      }
    }
  }, [enabled])

  // refs for DOM + canvas
  const rootRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)

  const { x, y, speed, hoveringInteractive, onPointerMove, onPointerDown, onPointerUp } = usePointer()
  const pointerRef = useRef({ x: -100, y: -100, speed: 0, hovering: false })
  useEffect(() => {
    pointerRef.current.x = x
    pointerRef.current.y = y
    pointerRef.current.speed = speed
    pointerRef.current.hovering = hoveringInteractive
  }, [x, y, speed, hoveringInteractive])

  // Init canvas & pool
  const pool = useMemo(() => createParticlePool(defaultSettings.maxParticles), [])
  const rafRef = useRef<number | null>(null)
  const dprRef = useRef(1)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const runningRef = useRef(false)
  const lastTsRef = useRef<number>(0)
  const carryRef = useRef(0)
  const hoverBoostRef = useRef(0)

  // Ring/dot smoothing
  const smoothPos = useRef({ x: -100, y: -100 })
  const ringRadius = useRef(14)

  // Visibility pause on tab hidden
  useEffect(() => {
    if (!enabled) return
    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        runningRef.current = false
      } else if (!prefersReduced) {
        start()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [enabled, prefersReduced])

  // Resize handling
  useEffect(() => {
    if (!enabled || !canvasRef.current) return
    const canvas = canvasRef.current
    const resize = () => {
      const max = defaultSettings.dprMax
      const dpr = Math.min(window.devicePixelRatio || 1, max)
      dprRef.current = dpr
      const w = Math.floor(window.innerWidth * dpr)
      const h = Math.floor(window.innerHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctxRef.current = ctx
        }
      }
    }
    let t: any
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(resize, 150)
    }
    resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(t)
    }
  }, [enabled])

  // Pointer listeners
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => onPointerMove(e)
    const onDown = (e: PointerEvent) => {
      onPointerDown(e)
      // click burst
      if (!prefersReduced) spawnBurst(e.clientX, e.clientY)
      ringRef.current?.classList.add('is-press')
      setTimeout(() => ringRef.current?.classList.remove('is-press'), 120)
    }
    const onUp = (e: PointerEvent) => onPointerUp(e)
    const onEnter = () => {
      if (!prefersReduced) start()
      setVisible(true)
    }
    const onLeave = () => {
      stop()
      setVisible(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointerenter', onEnter)
    window.addEventListener('pointerleave', onLeave)
    // Start initially
    if (!prefersReduced) start()
    setVisible(true)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointerenter', onEnter)
      window.removeEventListener('pointerleave', onLeave)
      stop()
    }
  }, [enabled, onPointerMove, onPointerDown, onPointerUp, prefersReduced])

  // Hover boost toggle
  useEffect(() => {
    if (hoveringInteractive) {
      ringRef.current?.classList.add('is-hover')
      hoverBoostRef.current = 0.18 // transient boost window in seconds; consumed in loop
    } else {
      ringRef.current?.classList.remove('is-hover')
    }
  }, [hoveringInteractive])

  function setVisible(v: boolean) {
    const r = ringRef.current
    const d = dotRef.current
    if (!r || !d) return
    r.style.opacity = v ? '1' : '0'
    d.style.opacity = v ? '1' : '0'
  }

  function spawnOne(px: number, py: number, spd: number) {
    const theta = Math.random() * Math.PI * 2
    const v = Math.min(600, 80 + spd * 0.25) // px/s
    const vx = Math.cos(theta) * v
    const vy = Math.sin(theta) * v * 0.35 // bias flatter
    const init: ParticleInit = {
      x: px,
      y: py,
      vx,
      vy,
      size: 1.6 + Math.random() * 2.6,
      maxLife: 0.6 + Math.random() * 0.6,
    }
    pool.spawn(init)
  }

  function spawnBurst(px: number, py: number) {
    const n = Math.floor(defaultSettings.clickBurstMin + Math.random() * (defaultSettings.clickBurstMax - defaultSettings.clickBurstMin + 1))
    for (let i = 0; i < n; i++) spawnOne(px, py, speed)
  }

  function start() {
    if (runningRef.current) return
    runningRef.current = true
    lastTsRef.current = performance.now()
    rafRef.current = requestAnimationFrame(loop)
  }
  function stop() {
    runningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  function loop(ts: number) {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) {
      rafRef.current = requestAnimationFrame(loop)
      return
    }
    const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000)
    lastTsRef.current = ts

    // emission rate
    const base = defaultSettings.baseRate
    const cur = pointerRef.current
    let rate = base + defaultSettings.ratePerSpeed * Math.min(1200, cur.speed)
    if (hoverBoostRef.current > 0) {
      rate *= 1.18
      hoverBoostRef.current -= dt
    }
    const want = rate * dt + carryRef.current
    const spawnCount = Math.floor(want)
    carryRef.current = want - spawnCount
    const px = cur.x
    const py = cur.y
    for (let i = 0; i < spawnCount; i++) spawnOne(px, py, cur.speed)

    // update pool physics
    pool.update(dt)

    // draw
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const snow = getComputedStyle(document.documentElement).getPropertyValue('--snow').trim() || '#E6EEF6'
    ctx.fillStyle = snow
    ctx.strokeStyle = snow
    ctx.lineWidth = 1
    pool.forEachAlive((p) => {
      // alpha and size over life
      const t = 1 - Math.min(1, p.life / p.maxLife)
      const r = Math.max(0, p.size * t)
      const a = Math.max(0, Math.min(1, t * 0.9))
      ctx.globalAlpha = a
      if (p.kind === 'flake') {
        // small rotated plus
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.spin)
        ctx.beginPath()
        ctx.moveTo(-r, 0)
        ctx.lineTo(r, 0)
        ctx.moveTo(0, -r)
        ctx.lineTo(0, r)
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 0.66, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1

    // DOM ring/dot smoothing & transform
    const s = smoothPos.current
    s.x += (pointerRef.current.x - s.x) * 0.22
    s.y += (pointerRef.current.y - s.y) * 0.22
    const r = ringRef.current
    const d = dotRef.current
    if (r && d) {
      const targetRadius = pointerRef.current.hovering ? 18 : 14
      ringRadius.current += (targetRadius - ringRadius.current) * 0.25
      r.style.transform = `translate3d(${s.x - ringRadius.current}px, ${s.y - ringRadius.current}px, 0)`
      r.style.width = `${ringRadius.current * 2}px`
      r.style.height = `${ringRadius.current * 2}px`
      d.style.transform = `translate3d(${s.x - 3}px, ${s.y - 3}px, 0)`
    }

    if (runningRef.current) rafRef.current = requestAnimationFrame(loop)
  }

  return (
    <div ref={rootRef} data-snow-cursor-root style={{ display: enabled ? 'block' : 'none' }}>
      <canvas ref={canvasRef} data-snow-canvas />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
