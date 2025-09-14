"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Props = {
  active: boolean
  width: number
  height: number
  reducedMotion: boolean
  onExitComplete: () => void
}

// BUILD: Hammer swing → IDE typing
export function BuildAssemble({ active, width, height, reducedMotion, onExitComplete }: Props) {
  // effect-layer uses inset:-12px; coordinates include that padding
  const parentInset = 12

  // 1) Responsive bounds derived from the word box
  const wordW = Math.max(1, width)
  const wordH = Math.max(1, height)
  const pad = clamp(8, Math.round(Math.max(wordW, wordH) * 0.02), 16)
  const AR = 2.6
  const maxW = wordW - 2 * pad
  const maxH = wordH - 2 * pad
  const baseW = clamp(220, Math.round(wordW * 0.5), Math.min(520, Math.round(maxW)))
  const hFromW = baseW / AR
  const hCap = Math.min(Math.round(wordH * 0.44), Math.round(maxH))
  const ideH = Math.min(hFromW, hCap)
  const ideW = hFromW > hCap ? Math.round(hCap * AR) : baseW
  // Anchor bottom-right inside the word box
  const ideX = parentInset + wordW - pad - ideW
  const ideY = parentInset + wordH - pad - ideH

  // Hammer pivot near top-right inside the word area
  const pivotX = parentInset + wordW - 10
  const pivotY = parentInset + Math.round(wordH * 0.45)
  const handleLen = Math.max(18, Math.round(Math.min(wordW, wordH) * 0.42))
  const handleW = Math.max(3, Math.round(Math.min(wordW, wordH) * 0.04))
  const headW = Math.max(14, Math.round(Math.min(wordW, wordH) * 0.14))
  const headH = Math.max(8, Math.round(Math.min(wordW, wordH) * 0.07))

  const strokeW = Math.max(1.4, Math.min(2.0, height * 0.018))
  const stroke = "color-mix(in oklab, var(--ink) 88%, transparent)"
  const fill = "color-mix(in oklab, var(--ink) 16%, transparent)"
  const ideBg = "var(--ide-bg)"
  const ideChrome = "var(--ide-chrome)"
  const ideLine = "var(--ide-line)"
  const accent = "var(--accent)"
  const buildOutline = "var(--build-outline)"

  // Match outline text to actual word styles
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [textCss, setTextCss] = React.useState<{ fontSize?: string; fontFamily?: string; fontWeight?: string; letterSpacing?: string } | null>(null)
  React.useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const layer = svg.closest(".effect-layer")
    const word = layer?.previousElementSibling as HTMLElement | null
    if (!word) return
    const cs = getComputedStyle(word)
    setTextCss({ fontSize: cs.fontSize, fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing })
  }, [width, height])

  // Exit fade callback
  useEffect(() => {
    if (!active) {
      const to = window.setTimeout(onExitComplete, 280)
      return () => window.clearTimeout(to)
    }
  }, [active, onExitComplete])

  // Caret blink while held
  const [blink, setBlink] = useState(true)
  useEffect(() => {
    if (!active || reducedMotion) return
    const id = window.setInterval(() => setBlink((b) => !b), 700)
    return () => window.clearInterval(id)
  }, [active, reducedMotion])

  // Reduced motion: final IDE snapshot only
  if (reducedMotion) {
    const r = 12
    const d = rrPath(ideX, ideY, ideW, ideH, r)
    const pathId = `ide-card-path-rm`
    const clipId = `ide-clip-rm`
    return (
      <svg ref={svgRef} viewBox={`0 0 ${width + parentInset * 2} ${height + parentInset * 2}`} width={width + parentInset * 2} height={height + parentInset * 2} aria-hidden shapeRendering="geometricPrecision">
        <defs>
          <path id={pathId} d={d} />
          <clipPath id={clipId}>
            <use href={`#${pathId}`} />
          </clipPath>
        </defs>
        <g opacity={0.85}>
          <IDEFrame x={ideX} y={ideY} w={ideW} h={ideH} stroke={stroke} strokeW={strokeW} bg={ideBg} chrome={ideChrome} line={ideLine} accent={accent} reduced />
          {/* Clipped word outline */}
          <g clipPath={`url(#${clipId})`}>
            <text
              x={parentInset}
              y={parentInset + wordH * 0.86}
              fill="none"
              stroke={buildOutline}
              strokeWidth={Math.max(1.5, Math.min(2.0, height * 0.018))}
              vectorEffect="non-scaling-stroke"
              style={{
                fontSize: textCss?.fontSize,
                fontFamily: textCss?.fontFamily,
                fontWeight: textCss?.fontWeight || "800",
                letterSpacing: textCss?.letterSpacing || "-0.01em",
              }}
              dominantBaseline="alphabetic"
            >
              BUILD
            </text>
          </g>
        </g>
      </svg>
    )
  }

  // Impact point (approx end of swing at +10deg)
  const impact = swingTip(pivotX, pivotY, handleLen, 10)

  // Rounded rect radius reused across stroke/clip to prevent misaligns
  const r = 12
  const pathD = rrPath(ideX, ideY, ideW, ideH, r)
  const pathId = useMemo(() => `ide-card-path-${Math.random().toString(36).slice(2, 7)}` , [])
  const clipId = useMemo(() => `ide-clip-${Math.random().toString(36).slice(2, 7)}` , [])

  return (
    <svg ref={svgRef} viewBox={`0 0 ${width + parentInset * 2} ${height + parentInset * 2}`} width={width + parentInset * 2} height={height + parentInset * 2} aria-hidden shapeRendering="geometricPrecision">
      <defs>
        <path id={pathId} d={pathD} />
        <clipPath id={clipId}>
          <use href={`#${pathId}`} />
        </clipPath>
      </defs>
      <AnimatePresence>
        {active && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12, ease: "easeOut" }}>
            {/* Hammer: 0–450ms swing */}
            <g transform={`translate(${pivotX}, ${pivotY})`}>
              <motion.g
                initial={{ rotate: -25 }}
                animate={{ rotate: [ -25, 12, 6 ] }}
                transition={{ duration: 0.45, ease: "easeOut", times: [0, 0.78, 1] }}
              >
                {/* Handle */}
                <rect x={-handleW / 2} y={0} width={handleW} height={handleLen} rx={handleW / 2} fill={fill} stroke={stroke} strokeWidth={strokeW} />
                {/* Head */}
                <rect x={-headW + 2} y={-headH + 2} width={headW} height={headH} rx={Math.min(6, headH / 2)} fill={fill} stroke={stroke} strokeWidth={strokeW} />
              </motion.g>
            </g>

            {/* Impact spark (~300–360ms) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ delay: 0.32, duration: 0.14, ease: "easeOut" }}
              transform={`translate(${impact.x}, ${impact.y})`}
              stroke={stroke}
              strokeWidth={strokeW * 0.9}
            >
              <line x1={0} y1={0} x2={4} y2={-2} />
              <line x1={0} y1={0} x2={-3} y2={-3} />
              <line x1={0} y1={0} x2={3} y2={2} />
            </motion.g>

            {/* IDE: 300–900ms */}
            <IDEFrameAnimated
              x={ideX}
              y={ideY}
              w={ideW}
              h={ideH}
              stroke={stroke}
              strokeW={strokeW}
              bg={ideBg}
              chrome={ideChrome}
              line={ideLine}
              accent={accent}
              caretVisible={blink}
              delay={0.30}
              clipId={clipId}
              pathId={pathId}
              r={r}
            />

            {/* Optional tiny badge at end */}
            <motion.rect
              x={ideX + ideW - 10}
              y={ideY - 8}
              width={8}
              height={8}
              fill="none"
              stroke={accent}
              strokeWidth={strokeW * 0.9}
              transform={`rotate(45 ${ideX + ideW - 6} ${ideY - 4})`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.9, duration: 0.12, ease: "easeOut" }}
            />
            {/* Clipped word outline above IDE to preserve legibility under overlap */}
            <g clipPath={`url(#${clipId})`}>
              {/* We stroke an SVG text replica; keep stroke width fixed */}
              <text
                x={parentInset}
                y={parentInset + wordH * 0.86}
                fill="none"
                stroke={buildOutline}
                strokeWidth={Math.max(1.5, Math.min(2.0, height * 0.018))}
                vectorEffect="non-scaling-stroke"
                style={{ fontSize: textCss?.fontSize, fontFamily: textCss?.fontFamily, fontWeight: textCss?.fontWeight || "800", letterSpacing: textCss?.letterSpacing || "-0.01em" }}
                dominantBaseline="alphabetic"
              >
                BUILD
              </text>
            </g>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

// --- Hammer math ---
function swingTip(px: number, py: number, len: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  const x = px + Math.sin(rad) * len
  const y = py + Math.cos(rad) * len
  return { x, y }
}

// --- IDE components ---
function IDEFrameAnimated({ x, y, w, h, stroke, strokeW, bg, chrome, line, accent, caretVisible, delay = 0, clipId, pathId, r }: { x: number; y: number; w: number; h: number; stroke: string; strokeW: number; bg: string; chrome: string; line: string; accent: string; caretVisible: boolean; delay?: number; clipId: string; pathId: string; r: number }) {
  const spring = { type: "spring", stiffness: 220, damping: 22 }
  const pad = clamp(10, Math.round(w * 0.04), 18)
  const chromeH = Math.max(10, Math.round(h * 0.16))
  const gutterW = Math.max(14, Math.round(w * 0.12))
  const editorX = x + pad + gutterW
  const editorY = y + pad + chromeH
  const editorW = Math.max(10, w - pad * 2 - gutterW)
  const editorH = h - pad * 2 - chromeH
  const lineH = Math.max(6, Math.round(editorH / 8))
  const gap = Math.max(3, Math.round(lineH * 0.6))

  // Prepare lines positions
  const lines = Array.from({ length: 6 }, (_, i) => ({
    y: editorY + i * (lineH + gap),
    w: Math.min(Math.round(editorW * (0.45 + 0.5 * Math.random())), editorW - 2),
  }))
  // Deterministic widths for first 3 lines for consistency
  lines[0].w = Math.round(editorW * 0.62)
  lines[1].w = Math.round(editorW * 0.78)
  lines[2].w = Math.round(editorW * 0.52)
  lines[3].w = Math.round(editorW * 0.68)
  lines[4].w = Math.round(editorW * 0.38)
  lines[5].w = Math.round(editorW * 0.56)

  // Typing on these lines
  const typeIdx = [1, 3]

  return (
    <g>
      {/* Frame container */}
      <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay, duration: 0.18 }}>
        {/* Outer (stroke uses same rounded path as clip to avoid misaligns) */}
        <use href={`#${pathId}`} fill={bg} stroke={stroke} strokeWidth={strokeW} />
        {/* Chrome */}
        <rect x={x + pad} y={y + pad} width={w - pad * 2} height={chromeH} rx={r - 6} fill={chrome} stroke={stroke} strokeWidth={strokeW * 0.8} />
        {/* Gutter outline */}
        <rect x={x + pad} y={y + pad + chromeH} width={gutterW - 4} height={h - pad * 2 - chromeH} rx={4} fill={"none"} stroke={stroke} strokeWidth={strokeW * 0.6} opacity={0.6} />
      </motion.g>

      {/* Window dots (clipped to card) */}
      <g clipPath={`url(#${clipId})`}>
        <g fill={accent} opacity={0.8}>
          <circle cx={x + pad + 10} cy={y + pad + chromeH / 2} r={1.7} />
          <circle cx={x + pad + 18} cy={y + pad + chromeH / 2} r={1.7} />
          <circle cx={x + pad + 26} cy={y + pad + chromeH / 2} r={1.7} />
        </g>
        {/* Lines appear top→bottom with stagger, clipped to card */}
        {lines.map((ln, i) => {
          const isTyped = typeIdx.includes(i)
          const baseDelay = delay + 0.18 + i * 0.06
          const maxW = editorW - 2
          const w0 = Math.min(lines[i].w, maxW)
          if (!isTyped) {
            return (
              <motion.rect key={i} x={editorX} y={ln.y} width={w0} height={lineH} rx={3} fill={line} initial={{ opacity: 0, scaleX: 0, originX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: baseDelay, duration: 0.14, ease: "easeOut" }} />
            )
          }
          // Typed line: grow width in beats and move caret (never exceed editor bounds)
          const beats = [0.4, 0.72, 1.0]
          const widths = beats.map((b) => Math.min(Math.round(w0 * b), maxW))
          const carets = widths.map((ww) => editorX + ww)
          const caretDelay = baseDelay + 0.02
          return (
            <g key={i}>
              <motion.rect x={editorX} y={ln.y} height={lineH} rx={3} fill={line} initial={{ width: 0 }} animate={{ width: widths }} transition={{ delay: baseDelay, times: [0, 0.6, 1], duration: 0.36, ease: "easeOut" }} />
              {/* Caret */}
              <motion.rect x={editorX} y={ln.y} width={1.2} height={lineH} fill={accent} initial={{ x: editorX, opacity: 1 }} animate={{ x: carets, opacity: caretVisible ? [1, 1, blinkOpacity(caretVisible)] : 1 }} transition={{ delay: caretDelay, duration: 0.36, ease: "easeOut" }} />
            </g>
          )
        })}
      </g>
    </g>
  )
}

function blinkOpacity(on: boolean) {
  return on ? 1 : 0.2
}

function IDEFrame({ x, y, w, h, stroke, strokeW, bg, chrome, line, accent, reduced = false }: { x: number; y: number; w: number; h: number; stroke: string; strokeW: number; bg: string; chrome: string; line: string; accent: string; reduced?: boolean }) {
  const pad = clamp(10, Math.round(w * 0.04), 18)
  const chromeH = Math.max(10, Math.round(h * 0.16))
  const gutterW = Math.max(14, Math.round(w * 0.12))
  const editorX = x + pad + gutterW
  const editorY = y + pad + chromeH
  const editorW = Math.max(10, w - pad * 2 - gutterW)
  const editorH = h - pad * 2 - chromeH
  const lineH = Math.max(6, Math.round(editorH / 8))
  const gap = Math.max(3, Math.round(lineH * 0.6))

  const lines = Array.from({ length: 6 }, (_, i) => ({ y: editorY + i * (lineH + gap), w: Math.round(editorW * (0.5 + 0.4 * Math.random())) }))
  lines[0].w = Math.round(editorW * 0.62)
  lines[1].w = Math.round(editorW * 0.78)
  lines[2].w = Math.round(editorW * 0.52)
  lines[3].w = Math.round(editorW * 0.68)
  lines[4].w = Math.round(editorW * 0.38)
  lines[5].w = Math.round(editorW * 0.56)

  const r = 12
  const d = rrPath(x, y, w, h, r)
  return (
    <g>
      <path d={d} fill={bg} stroke={stroke} strokeWidth={strokeW} />
      <rect x={x + pad} y={y + pad} width={w - pad * 2} height={chromeH} rx={r - 6} fill={chrome} stroke={stroke} strokeWidth={strokeW * 0.8} />
      <g fill={accent} opacity={0.8}>
        <circle cx={x + pad + 10} cy={y + pad + chromeH / 2} r={1.7} />
        <circle cx={x + pad + 18} cy={y + pad + chromeH / 2} r={1.7} />
        <circle cx={x + pad + 26} cy={y + pad + chromeH / 2} r={1.7} />
      </g>
      <rect x={x + pad} y={y + pad + chromeH} width={gutterW - 4} height={h - pad * 2 - chromeH} rx={4} fill={"none"} stroke={stroke} strokeWidth={strokeW * 0.6} opacity={0.6} />
      {lines.map((ln, i) => (
        <rect key={i} x={editorX} y={ln.y} width={ln.w} height={lineH} rx={3} fill={line} opacity={reduced ? 0.85 : 1} />
      ))}
    </g>
  )
}

// Rounded-rect path (for perfect stroke/clip reuse)
function rrPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, Math.min(w, h) / 2)
  return [
    `M ${x + rr},${y}`,
    `H ${x + w - rr}`,
    `A ${rr},${rr} 0 0 1 ${x + w},${y + rr}`,
    `V ${y + h - rr}`,
    `A ${rr},${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H ${x + rr}`,
    `A ${rr},${rr} 0 0 1 ${x},${y + h - rr}`,
    `V ${y + rr}`,
    `A ${rr},${rr} 0 0 1 ${x + rr},${y}`,
    `Z`,
  ].join(" ")
}

function clamp(min: number, v: number, max: number) {
  return Math.max(min, Math.min(max, v))
}






