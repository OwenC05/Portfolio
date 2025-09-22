'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  size: number
}

const MAX_PARTICLES = 120
const TWO_PI = Math.PI * 2

export default function SnowCursor() {
  const { resolvedTheme } = useTheme()
  const prefersReduced = usePrefersReducedMotion()
  const [pointerFine, setPointerFine] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(pointer: fine)')
    const update = () => setPointerFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const enabled = pointerFine
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const spawnQueueRef = useRef<{ x: number; y: number; speed: number } | null>(
    null
  )
  const pointerRef = useRef({ x: -100, y: -100, speed: 0, active: false })
  const colorsRef = useRef(readCursorColors())
  const [cursorVisible, setCursorVisible] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setCursorVisible(false)
      toggleCursorAttribute(true)
    }
  }, [enabled])

  useEffect(() => {
    colorsRef.current = readCursorColors()
  }, [resolvedTheme])

  useEffect(() => {
    if (!enabled) return
    const doc = document.documentElement
    doc.setAttribute('data-cursor', 'on')
    return () => {
      if (doc.getAttribute('data-cursor') === 'on') {
        doc.removeAttribute('data-cursor')
      }
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const handleMove = (event: PointerEvent) => {
      const { clientX, clientY } = event
      const dx = clientX - pointerRef.current.x
      const dy = clientY - pointerRef.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)
      pointerRef.current = { x: clientX, y: clientY, speed, active: true }

      const disabled = isInputTarget(event.target as HTMLElement | null)
      setCursorVisible(!disabled)
      toggleCursorAttribute(disabled)

      if (!prefersReduced && !disabled) {
        spawnQueueRef.current = { x: clientX, y: clientY, speed }
      }
    }

    const handleDown = (event: PointerEvent) => {
      if (prefersReduced) return
      if (isInputTarget(event.target as HTMLElement | null)) return
      spawnParticles(particlesRef.current, event.clientX, event.clientY, 90)
    }

    const handleLeave = () => {
      pointerRef.current = { x: -100, y: -100, speed: 0, active: false }
      setCursorVisible(false)
      toggleCursorAttribute(true)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerleave', handleLeave)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerleave', handleLeave)
    }
  }, [enabled, prefersReduced])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.floor(window.innerWidth * dpr)
      const height = Math.floor(window.innerHeight * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
      }
    }

    resize()
    const handleResize = () => requestAnimationFrame(resize)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    lastTimeRef.current = performance.now()

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000)
      lastTimeRef.current = time

      const showParticles = cursorVisible && !prefersReduced
      if (showParticles && spawnQueueRef.current) {
        const spawn = spawnQueueRef.current
        spawnParticles(particlesRef.current, spawn.x, spawn.y, spawn.speed)
        spawnQueueRef.current = null
      }

      updateParticles(particlesRef.current, dt, showParticles)
      drawParticles(
        ctx,
        particlesRef.current,
        showParticles ? colorsRef.current.snow : null
      )
      updateCursorSprites(
        ringRef.current,
        dotRef.current,
        pointerRef.current,
        cursorVisible
      )

      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [enabled, cursorVisible, prefersReduced])

  useEffect(() => {
    if (!cursorVisible) {
      updateCursorSprites(
        ringRef.current,
        dotRef.current,
        pointerRef.current,
        false
      )
    }
  }, [cursorVisible])

  return (
    <div
      data-snow-cursor-root
      style={{
        display: enabled ? 'block' : 'none',
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
      }}
    >
      <canvas
        ref={canvasRef}
        data-snow-canvas
        style={{ display: !prefersReduced && cursorVisible ? 'block' : 'none' }}
      />
      <div ref={ringRef} className="cursor-ring">
        <div className="cursor-fill" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}

function spawnParticles(
  particles: Particle[],
  x: number,
  y: number,
  speed: number
) {
  const count = Math.min(6, 3 + Math.floor(Math.min(speed, 600) / 160))
  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift()
    const angle = Math.random() * TWO_PI
    const velocity = 26 + speed * 0.1
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity * 0.45 - 14,
      life: 0,
      ttl: 0.45 + Math.random() * 0.3,
      size: 0.9 + Math.random() * 1.1,
    })
  }
}

function updateParticles(particles: Particle[], dt: number, enabled: boolean) {
  if (!enabled) {
    particles.length = 0
    return
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life += dt
    if (p.life >= p.ttl) {
      particles.splice(i, 1)
      continue
    }
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 30 * dt
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  color: string | null
) {
  ctx.save()
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  if (!color) {
    ctx.restore()
    return
  }
  ctx.fillStyle = color
  particles.forEach((particle) => {
    const alpha = 1 - particle.life / particle.ttl
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, TWO_PI)
    ctx.fill()
  })
  ctx.restore()
}

function updateCursorSprites(
  ring: HTMLDivElement | null,
  dot: HTMLDivElement | null,
  pointer: { x: number; y: number; active: boolean },
  visible: boolean
) {
  if (!ring || !dot) return
  if (!visible || !pointer.active) {
    ring.style.opacity = '0'
    dot.style.opacity = '0'
    return
  }

  ring.style.opacity = '1'
  dot.style.opacity = '1'

  const smoothing = 0.22
  const prevX = Number(ring.dataset.x ?? pointer.x)
  const prevY = Number(ring.dataset.y ?? pointer.y)
  const nextX = prevX + (pointer.x - prevX) * smoothing
  const nextY = prevY + (pointer.y - prevY) * smoothing
  ring.dataset.x = String(nextX)
  ring.dataset.y = String(nextY)

  ring.style.transform = `translate3d(${nextX - 16}px, ${nextY - 16}px, 0)`
  dot.style.transform = `translate3d(${pointer.x - 3}px, ${pointer.y - 3}px, 0)`
}

function toggleCursorAttribute(disabled: boolean) {
  if (typeof window === 'undefined') return
  const doc = document.documentElement
  if (disabled) {
    doc.setAttribute('data-cursor', 'off')
  } else {
    doc.setAttribute('data-cursor', 'on')
  }
}

function isInputTarget(target: HTMLElement | null) {
  if (!target) return false
  return !!target.closest('input, textarea, select, [contenteditable="true"]')
}

function readCursorColors() {
  if (typeof window === 'undefined') {
    return { ring: '#dce6ff', accent: '#9db8ff', snow: '#e6eef6' }
  }
  const styles = getComputedStyle(document.documentElement)
  return {
    ring: styles.getPropertyValue('--ink').trim() || '#dce6ff',
    accent: styles.getPropertyValue('--accent').trim() || '#9db8ff',
    snow: styles.getPropertyValue('--snow').trim() || '#e6eef6',
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
