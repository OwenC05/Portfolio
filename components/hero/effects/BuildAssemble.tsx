"use client"

import React, { useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Props = {
  active: boolean
  width: number
  height: number
  reducedMotion: boolean
  onExitComplete: () => void
}

export function BuildAssemble({ active, width, height, reducedMotion, onExitComplete }: Props) {
  const pad = Math.round(Math.min(width, height) * 0.08)
  const stroke = 1.5

  const pieces = useMemo(() => layoutPieces(width, height, pad), [width, height, pad])

  useEffect(() => {
    if (!active) {
      const to = window.setTimeout(onExitComplete, 360)
      return () => window.clearTimeout(to)
    }
  }, [active, onExitComplete])

  const color = "var(--ink)"
  const fill = "color-mix(in oklab, var(--ink) 14%, transparent)"
  const snapColor = "color-mix(in oklab, var(--ink) 60%, transparent)"

  if (reducedMotion) {
    return (
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
        {pieces.map((p, i) => (
          <rect
            key={i}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            rx={p.r}
            ry={p.r}
            stroke={color}
            fill={fill}
            opacity={0.6}
            strokeWidth={stroke}
          />
        ))}
      </svg>
    )
  }

  const spring = { type: "spring", stiffness: 220, damping: 20, mass: 0.7 }

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden>
      <AnimatePresence>
        {active && (
          <g>
            {/* Snap lines */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
              {pieces.filter((p) => p.snap).map((p, i) => (
                <line key={`s${i}`} x1={p.snap!.x1} y1={p.snap!.y1} x2={p.snap!.x2} y2={p.snap!.y2} stroke={snapColor} strokeWidth={0.6} />
              ))}
            </motion.g>

            {/* Pieces */}
            {pieces.map((p, i) => (
              <motion.rect
                key={i}
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={p.r}
                ry={p.r}
                stroke={color}
                fill={fill}
                strokeWidth={stroke}
                initial={p.initial}
                animate={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
                exit={p.exit}
                transition={spring}
                style={{ opacity: 0, scale: 0.96 }}
              />
            ))}

            {/* Bolt pulse */}
            <motion.circle
              cx={pieces[0].x + pieces[0].w - 10}
              cy={pieces[0].y + pieces[0].h / 2}
              r={3.2}
              fill={color}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: [1, 1.08, 1] }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            />
          </g>
        )}
      </AnimatePresence>
    </svg>
  )
}

function layoutPieces(width: number, height: number, pad: number) {
  const r = Math.round(Math.min(width, height) * 0.06)
  const innerW = Math.max(10, width - pad * 2)
  const innerH = Math.max(10, height - pad * 2)
  const baseX = pad
  const baseY = pad

  // Header
  const headerH = Math.round(innerH * 0.16)
  const header = {
    x: baseX,
    y: baseY,
    w: innerW,
    h: headerH,
    r,
    initial: { x: baseX - 40, y: baseY + 8, opacity: 0, scale: 0.96 },
    exit: { x: baseX - 40, y: baseY + 8, opacity: 0, scale: 0.96 },
    snap: { x1: baseX, y1: baseY + headerH, x2: baseX + innerW, y2: baseY + headerH },
  }

  // Columns
  const gap = Math.round(innerW * 0.04)
  const colW = Math.round((innerW - gap) / 2)
  const colY = baseY + headerH + gap
  const colH = Math.round(innerH * 0.46)
  const leftCol = {
    x: baseX,
    y: colY,
    w: colW,
    h: colH,
    r,
    initial: { x: baseX - 36, y: colY + 30, opacity: 0, scale: 0.96 },
    exit: { x: baseX - 36, y: colY + 30, opacity: 0, scale: 0.96 },
    snap: { x1: baseX + colW, y1: colY, x2: baseX + colW, y2: colY + colH },
  }
  const rightTop = {
    x: baseX + colW + gap,
    y: colY,
    w: colW,
    h: Math.round(colH * 0.56),
    r,
    initial: { x: baseX + colW + gap + 40, y: colY + 30, opacity: 0, scale: 0.96 },
    exit: { x: baseX + colW + gap + 40, y: colY + 30, opacity: 0, scale: 0.96 },
    snap: { x1: baseX + colW + gap, y1: colY + Math.round(colH * 0.56) + gap / 2, x2: baseX + colW * 2 + gap, y2: colY + Math.round(colH * 0.56) + gap / 2 },
  }
  const rightBottom = {
    x: baseX + colW + gap,
    y: colY + Math.round(colH * 0.56) + gap,
    w: colW,
    h: Math.round(colH * 0.44) - gap,
    r,
    initial: { x: baseX + colW + gap + 36, y: colY + Math.round(colH * 0.56) + gap + 40, opacity: 0, scale: 0.96 },
    exit: { x: baseX + colW + gap + 36, y: colY + Math.round(colH * 0.56) + gap + 40, opacity: 0, scale: 0.96 },
  }

  // Footer
  const footerY = baseY + innerH - Math.round(innerH * 0.16)
  const footerH = Math.round(innerH * 0.16)
  const footer = {
    x: baseX,
    y: footerY,
    w: innerW,
    h: footerH,
    r,
    initial: { x: baseX, y: footerY + 48, opacity: 0, scale: 0.96 },
    exit: { x: baseX, y: footerY + 48, opacity: 0, scale: 0.96 },
    snap: { x1: baseX, y1: footerY, x2: baseX + innerW, y2: footerY },
  }

  return [header, leftCol, rightTop, rightBottom, footer]
}

