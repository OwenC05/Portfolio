'use client'

import * as THREE from 'three'
import { useMemo } from 'react'
import { slope } from '@/lib/projects'
import { groundY } from '@/lib/descent'
import { scene as palette } from '@/lib/theme'

// --- compact value noise (no deps) -----------------------------------------
const hash = (x: number, z: number) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}
const vnoise = (x: number, z: number) => {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const a = hash(xi, zi)
  const b = hash(xi + 1, zi)
  const c = hash(xi, zi + 1)
  const d = hash(xi + 1, zi + 1)
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}
const fbm = (x: number, z: number) => {
  let f = 0
  let amp = 0.5
  let fr = 1
  for (let i = 0; i < 3; i++) {
    f += amp * vnoise(x * fr, z * fr)
    fr *= 2
    amp *= 0.5
  }
  return f
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

function buildSlope() {
  const W = 70
  const x0 = -W / 2
  const Z_START = -18
  const Z_END = slope.length + 22
  const L = Z_END - Z_START
  const wseg = 70
  const lseg = 130
  const half = W / 2

  const colSummit = new THREE.Color(palette.terrainSnowLit) // pink-lit
  const colValley = new THREE.Color(palette.terrainSnow) // cool blue
  const tmp = new THREE.Color()

  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []

  for (let j = 0; j <= lseg; j++) {
    const z = Z_START + (j / lseg) * L
    for (let i = 0; i <= wseg; i++) {
      const x = x0 + (i / wseg) * W
      const base = groundY(z)
      // Raised berms beyond the rideable corridor (|x| > halfWidth).
      const edge = smoothstep(slope.halfWidth, half, Math.abs(x))
      const berm = edge * edge * 7.0
      // Gentle moguls — calmer inside the corridor so steering stays clean.
      const inCorridor = 1 - smoothstep(slope.halfWidth - 4, slope.halfWidth + 6, Math.abs(x))
      const mog = (fbm(x * 0.11, z * 0.11) - 0.5) * (0.7 + 2.4 * (1 - inCorridor))
      const y = base + berm + mog

      positions.push(x, y, z)

      // Colour grades with descent (summit pink -> valley blue), brighter on
      // raised snow.
      const t = THREE.MathUtils.clamp(z / slope.length, 0, 1)
      tmp.copy(colSummit).lerp(colValley, t)
      const lift = 1 + (berm + Math.max(0, mog)) * 0.02
      tmp.multiplyScalar(Math.min(1.15, lift) * (1 - 0.18 * t))
      colors.push(tmp.r, tmp.g, tmp.b)
    }
  }

  const row = wseg + 1
  for (let j = 0; j < lseg; j++) {
    for (let i = 0; i < wseg; i++) {
      const a = j * row + i
      const b = a + 1
      const c = a + row
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// A few distant peak silhouettes for parallax depth.
function Peaks() {
  const peaks = useMemo(
    () => [
      { pos: [-46, groundY(40) + 2, 30] as const, s: [26, 30, 6] as const, c: palette.ridgeFar },
      { pos: [52, groundY(70) + 4, 60] as const, s: [30, 38, 6] as const, c: palette.ridgeMid },
      { pos: [-38, groundY(95) + 2, 96] as const, s: [22, 26, 6] as const, c: palette.ridgeFar },
      { pos: [40, groundY(110) + 2, 120] as const, s: [24, 30, 6] as const, c: palette.ridgeMid },
      { pos: [0, groundY(135) + 8, 150] as const, s: [44, 52, 6] as const, c: palette.ridgeFar },
    ],
    [],
  )
  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={p.pos as unknown as THREE.Vector3} rotation={[0, i * 0.7, 0]}>
          <coneGeometry args={[p.s[0], p.s[1], p.s[2]]} />
          <meshBasicMaterial color={p.c} fog />
        </mesh>
      ))}
    </group>
  )
}

export default function Terrain() {
  const geo = useMemo(() => buildSlope(), [])
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} flatShading={false} />
      </mesh>
      <Peaks />
    </group>
  )
}
