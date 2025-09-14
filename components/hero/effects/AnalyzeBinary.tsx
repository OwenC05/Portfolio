"use client"

import React, { useEffect, useRef } from "react"

type Props = {
  active: boolean
  width: number
  height: number
  reducedMotion: boolean
  onExitComplete: () => void
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  age: number
  ch: "0" | "1"
  size: number
  rot: number
  rotVel: number
}

export function AnalyzeBinary({ active, width, height, reducedMotion, onExitComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const runningRef = useRef(false)
  const emissionOnRef = useRef(false)
  const themeRef = useRef({
    ink: "#000",
    accent: "#4f8ff7",
    bg: "#ffffff",
  })
  const dprRef = useRef(1)
  const lastTSRef = useRef<number | null>(null)
  const exitPendingRef = useRef(false)

  // Read and watch theme vars
  useEffect(() => {
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement)
      const ink = cs.getPropertyValue("--ink").trim() || "#000"
      const accent = cs.getPropertyValue("--accent").trim() || "#4f8ff7"
      const bg = cs.getPropertyValue("--bg").trim() || "#ffffff"
      themeRef.current.ink = ink
      themeRef.current.accent = accent
      themeRef.current.bg = bg
    }
    readTheme()
    const mo = new MutationObserver((m) => {
      for (const rec of m) {
        if (rec.type === "attributes" && (rec.attributeName === "class" || rec.attributeName === "data-theme")) {
          readTheme()
        }
      }
    })
    mo.observe(document.documentElement, { attributes: true })
    return () => mo.disconnect()
  }, [])

  // Size & DPR
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5)
    dprRef.current = dpr
    c.width = Math.max(1, Math.round(width * dpr))
    c.height = Math.max(1, Math.round(height * dpr))
    c.style.width = "100%"
    c.style.height = "100%"
  }, [width, height])

  // Reduced motion: render static halo
  useEffect(() => {
    if (!reducedMotion) return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    // simple static ring of 0/1 around perimeter
    const drawStatic = () => {
      const dpr = dprRef.current
      ctx.clearRect(0, 0, c.width, c.height)
      const ink = themeRef.current.ink
      const accent = themeRef.current.accent
      ctx.fillStyle = mixColors(ink, accent, 0.4)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const W = c.width
      const H = c.height
      const centerX = W / 2
      const centerY = H / 2
      const radius = Math.max(16 * dpr, Math.min(W, H) * 0.45)
      const count = Math.max(18, Math.floor(radius / (8 * dpr)))
      const fs = clamp(10 * dpr, 0.11 * (H / dpr), 22 * dpr)
      ctx.font = `${fs}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2
        const x = centerX + Math.cos(a) * radius
        const y = centerY + Math.sin(a) * radius
        ctx.globalAlpha = 0.35 + 0.1 * Math.sin(i * 1.7)
        const ch = Math.random() < 0.5 ? "0" : "1"
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(0.06 * Math.sin(a))
        ctx.fillText(ch, 0, 0)
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }
    drawStatic()

    const el = c
    el.style.opacity = active ? "1" : "0"
    el.style.transition = "opacity 180ms ease"

    if (!active) {
      const handle = () => onExitComplete()
      el.addEventListener("transitionend", handle, { once: true })
      return () => el.removeEventListener("transitionend", handle)
    }
  }, [reducedMotion, active, onExitComplete])

  // Full animation
  useEffect(() => {
    if (reducedMotion) return
    const c = canvasRef.current
    const ctx = c?.getContext("2d")
    if (!c || !ctx) return

    const isMobile = window.matchMedia("(max-width: 767px)").matches
    const maxParticles = isMobile ? 60 : 120
    const emitRate = isMobile ? 26 : 36 // particles/sec while active
    const backoffFrameMs = 1000 / 30

    let emissionAccumulator = 0

    const start = () => {
      if (runningRef.current) return
      runningRef.current = true
      emissionOnRef.current = active
      lastTSRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      runningRef.current = false
    }

    const rand = (min: number, max: number) => min + Math.random() * (max - min)
    const perimeterSpawn = (): { x: number; y: number } => {
      const W = c.width
      const H = c.height
      const perim = 2 * (W + H)
      let p = Math.random() * perim
      if (p < W) return { x: p, y: 0 }
      p -= W
      if (p < H) return { x: W, y: p }
      p -= H
      if (p < W) return { x: W - p, y: H }
      p -= W
      return { x: 0, y: H - p }
    }

    const addParticle = () => {
      if (particlesRef.current.length >= maxParticles) return
      const { x, y } = perimeterSpawn()
      const dpr = dprRef.current
      const W = c.width
      const H = c.height
      const cx = W / 2
      const cy = H / 2
      const toCenterX = cx - x
      const toCenterY = cy - y
      const len = Math.hypot(toCenterX, toCenterY) || 1
      const nx = toCenterX / len
      const ny = toCenterY / len
      // Even slower base speed for calmer motion
      const speed = rand(20, 50) * dpr // px/s
      // Tangential slight orbit component
      const tx = -ny
      const ty = nx
      const orbit = rand(0.15, 0.35)
      const vx = nx * speed * (1 - orbit) + tx * speed * orbit
      const vy = ny * speed * (1 - orbit) + ty * speed * orbit
      const life = rand(900, 1400)
      const fs = clamp(10 * dpr, 0.11 * (H / dpr), 22 * dpr)
      particlesRef.current.push({
        x,
        y,
        vx: vx / 1000,
        vy: vy / 1000,
        life,
        age: 0,
        ch: Math.random() < 0.5 ? "0" : "1",
        size: fs,
        rot: 0,
        rotVel: rand(0.0, 6 * (Math.PI / 180)) / life, // up to ~6deg over lifespan
      })
    }

    const tick = (ts: number) => {
      if (!runningRef.current) return

      const hidden = document.hidden
      const last = lastTSRef.current
      let dt = last == null ? 0 : ts - last
      lastTSRef.current = ts
      // Cap dt to avoid huge jumps
      dt = Math.min(dt, 50)

      if (!hidden) emissionAccumulator += dt
      const msPerParticle = 1000 / emitRate
      if (emissionOnRef.current) {
        while (emissionAccumulator >= msPerParticle) {
          addParticle()
          emissionAccumulator -= msPerParticle
        }
      }

      // Update and draw
      const dpr = dprRef.current
      const ctx = c.getContext("2d")!
      ctx.clearRect(0, 0, c.width, c.height)
      const ink = themeRef.current.ink
      const accent = themeRef.current.accent
      ctx.fillStyle = mixColors(ink, accent, 0.4)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const arr = particlesRef.current
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i]
        p.age += dt
        const t = p.age / p.life
        if (t >= 1) {
          arr.splice(i, 1)
          continue
        }
        // Simple curl-like drift
        const curl = curlNoise(p.x * 0.002, p.y * 0.002, ts * 0.0006)
        // Reduce curl drift to keep overall motion slower
        const drift = 6 * dpr
        p.vx += (curl.x * drift) / 1000
        p.vy += (curl.y * drift) / 1000
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.rotVel * dt

        // Alpha shape: 0 -> 0.85 -> 0 for more presence
        const alpha = Math.sin(Math.PI * t) * 0.85
        // Scale: 0.95 -> 1.08 -> 1.0
        const scl = 0.95 + 0.13 * t - 0.13 * t * t

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(scl, scl)
        ctx.globalAlpha = alpha
        ctx.font = `${p.size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
        ctx.fillText(p.ch, 0, 0)
        ctx.restore()
      }

      // Stop when inactive and no particles remain
      if (!emissionOnRef.current && arr.length === 0 && exitPendingRef.current) {
        exitPendingRef.current = false
        stop()
        onExitComplete()
        return
      }

      if (hidden) {
        // Backoff to ~30fps
        setTimeout(() => {
          rafRef.current = requestAnimationFrame(tick)
        }, backoffFrameMs)
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    start()

    return () => {
      stop()
      particlesRef.current = []
    }
  }, [reducedMotion, onExitComplete])

  // Toggle emission based on active
  useEffect(() => {
    if (reducedMotion) return
    const wasOn = emissionOnRef.current
    emissionOnRef.current = active
    if (!active && wasOn) {
      // Prepare to exit when particles settle
      exitPendingRef.current = true
    }
  }, [active, reducedMotion])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

function clamp(min: number, v: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

// Lightweight pseudo-curl noise from sin/cos
function curlNoise(x: number, y: number, t: number) {
  const n1 = Math.sin(1.2 * x + 1.7 * y + t)
  const n2 = Math.cos(1.1 * x - 1.3 * y - 1.3 * t)
  return { x: n2 * 0.7, y: n1 * 0.7 }
}

// Mix two CSS hex colors (#rrggbb or #rgb) by t in [0,1]
function mixColors(a: string, b: string, t: number) {
  const ca = parseHex(a)
  const cb = parseHex(b)
  const r = Math.round(ca.r + (cb.r - ca.r) * t)
  const g = Math.round(ca.g + (cb.g - ca.g) * t)
  const bl = Math.round(ca.b + (cb.b - ca.b) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

function parseHex(s: string): { r: number; g: number; b: number } {
  const hex = s.trim()
  // #rrggbb
  let m = /^#([0-9a-fA-F]{6})$/.exec(hex)
  if (m) {
    const n = parseInt(m[1], 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  // #rgb
  m = /^#([0-9a-fA-F]{3})$/.exec(hex)
  if (m) {
    const r = parseInt(m[1][0] + m[1][0], 16)
    const g = parseInt(m[1][1] + m[1][1], 16)
    const b = parseInt(m[1][2] + m[1][2], 16)
    return { r, g, b }
  }
  // Fallback: try rgb() or others via canvas parsing
  try {
    const c = document.createElement("canvas")
    c.width = 1
    c.height = 1
    const x = c.getContext("2d")!
    x.fillStyle = hex
    const computed = x.fillStyle as string
    const mm = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(computed)
    if (mm) return { r: +mm[1], g: +mm[2], b: +mm[3] }
  } catch {}
  return { r: 0, g: 0, b: 0 }
}
