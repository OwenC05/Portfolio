"use client"

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

type Props = {
  active: boolean
  width: number
  height: number
  reducedMotion: boolean
  onExitComplete: () => void
}

export function DesignBlueprint({ active, width, height, reducedMotion, onExitComplete }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [drawReady, setDrawReady] = useState(false)
  const [drawing, setDrawing] = useState(false)

  const step = 8 // grid spacing
  const heavyEvery = 5 // every 5 steps (~40px)

  useEffect(() => {
    // Fade out and unmount after 250ms when deactivating
    if (!active && !reducedMotion) {
      const el = svgRef.current
      if (!el) return
      const to = window.setTimeout(onExitComplete, 260)
      return () => window.clearTimeout(to)
    }
    if (!active && reducedMotion) {
      const to = window.setTimeout(onExitComplete, 200)
      return () => window.clearTimeout(to)
    }
  }, [active, reducedMotion, onExitComplete])

  useLayoutEffect(() => {
    // Prepare stroke dash arrays for drawing animation
    if (!svgRef.current) return
    const paths = svgRef.current.querySelectorAll<SVGPathElement>("path[data-draw]")
    paths.forEach((p) => {
      const len = p.getTotalLength()
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = active && !reducedMotion ? `${len}` : "0"
    })
    setDrawReady(true)
    // trigger draw shortly after mount for stagger control
    if (active && !reducedMotion) {
      const to = window.setTimeout(() => setDrawing(true), 40)
      return () => window.clearTimeout(to)
    } else {
      setDrawing(false)
    }
  }, [active, reducedMotion, width, height])

  const grid = useMemo(() => buildGrid(width, height, step, heavyEvery), [width, height])

  const opacity = reducedMotion ? 0.5 : active ? 1 : 0
  const gridOpacity = reducedMotion ? 0.3 : active ? 0.3 : 0
  const guideOpacity = reducedMotion ? 0.6 : active ? 0.6 : 0

  // Guides definitions
  const g = useMemo(() => guides(width, height), [width, height])

  return (
    <svg
      ref={svgRef}
      className="w-full h-full effect-grid"
      viewBox={`0 0 ${Math.max(1, width)} ${Math.max(1, height)}`}
      width={width}
      height={height}
      style={{
        opacity,
        transition: "opacity 220ms ease",
        color: "color-mix(in oklab, var(--ink) 14%, transparent)",
      }}
      aria-hidden
    >
      {/* Grid */}
      <g stroke="currentColor" strokeWidth={1} opacity={gridOpacity}>
        {grid.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} opacity={l.heavy ? 0.45 : 1} />
        ))}
      </g>

      {/* Guides (stroked) */}
      <g
        stroke={"color-mix(in oklab, var(--ink) 80%, transparent)"}
        strokeWidth={1.4}
        opacity={guideOpacity}
        fill="none"
      >
        {/* Staggered draw animation */}
        {g.paths.map((d, idx) => (
          <path
            key={idx}
            d={d}
            data-draw
            style={{
              transition: drawing && !reducedMotion ? "stroke-dashoffset 760ms ease" : undefined,
              transitionDelay: drawing ? `${idx * 120}ms` : undefined,
              strokeDashoffset: drawing && !reducedMotion ? 0 : undefined,
            }}
          />
        ))}
      </g>

      {/* Nodes */}
      <g fill={"color-mix(in oklab, var(--ink) 70%, transparent)"} opacity={0.4}>
        {g.nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} />
        ))}
      </g>
    </svg>
  )
}

function buildGrid(w: number, h: number, step: number, heavyEvery: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number; heavy?: boolean }[] = []
  if (w <= 0 || h <= 0) return lines
  const vCount = Math.ceil(w / step)
  const hCount = Math.ceil(h / step)
  for (let i = 0; i <= vCount; i++) {
    const x = i * step
    const heavy = i % heavyEvery === 0
    lines.push({ x1: x, y1: 0, x2: x, y2: h, heavy })
  }
  for (let j = 0; j <= hCount; j++) {
    const y = j * step
    const heavy = j % heavyEvery === 0
    lines.push({ x1: 0, y1: y, x2: w, y2: y, heavy })
  }
  // cap nodes (<= 120 as budget). If too many, downsample.
  const max = 120
  if (lines.length > max) {
    const ratio = Math.ceil(lines.length / max)
    return lines.filter((_, i) => i % ratio === 0)
  }
  return lines
}

function guides(w: number, h: number) {
  const nodes: { x: number; y: number; r: number }[] = []
  const paths: string[] = []
  const phi = 1.618
  const pad = Math.min(w, h) * 0.08
  const x0 = pad
  const y0 = pad
  const x1 = w - pad
  const y1 = h - pad
  const ww = Math.max(8, x1 - x0)
  const hh = Math.max(8, y1 - y0)

  // Golden rectangle inside box
  const gw = Math.min(ww, hh * phi)
  const gh = gw / phi
  const gx = x0 + (ww - gw) / 2
  const gy = y0 + (hh - gh) / 2
  paths.push(rectPath(gx, gy, gw, gh))

  // Diagonals of outer box
  paths.push(`M ${x0},${y0} L ${x1},${y1}`)
  paths.push(`M ${x1},${y0} L ${x0},${y1}`)

  // Circle through golden rect center
  const cx = gx + gw / 2
  const cy = gy + gh / 2
  const r = Math.min(gw, gh) * 0.5
  paths.push(circlePath(cx, cy, r))

  // Chamfer arcs in corners
  const cr = Math.min(w, h) * 0.08
  paths.push(roundedCornerArc(x0, y0, cr, 0))
  paths.push(roundedCornerArc(x1, y0, cr, 90))

  // Intersection nodes
  nodes.push({ x: x0, y: y0, r: 2.4 })
  nodes.push({ x: x1, y: y1, r: 2.4 })
  nodes.push({ x: cx, y: cy, r: 2.4 })

  return { nodes, paths }
}

function rectPath(x: number, y: number, w: number, h: number) {
  return `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`
}
function circlePath(cx: number, cy: number, r: number) {
  return `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${2 * r},0 a ${r},${r} 0 1,0 ${-2 * r},0`
}
function roundedCornerArc(x: number, y: number, r: number, rot: number) {
  // rot: 0=TL, 90=TR, 180=BR, 270=BL (approx)
  const rad = (rot * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx = x + cos * r
  const cy = y + sin * r
  const x0 = cx
  const y0 = cy
  const x1 = cx + (-sin) * r
  const y1 = cy + cos * r
  const x2 = cx + cos * r
  const y2 = cy + sin * r
  return `M ${x0},${y0} A ${r},${r} 0 0,1 ${x1},${y1} M ${x0},${y0} A ${r},${r} 0 0,0 ${x2},${y2}`
}

