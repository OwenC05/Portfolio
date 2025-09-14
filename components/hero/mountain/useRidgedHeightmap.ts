import * as THREE from 'three'

export type HeightmapOpts = {
  width?: number
  depth?: number
  segX?: number
  segZ?: number
  amp?: number
  scaleX?: number
  scaleZ?: number
  terraceSteps?: number
  seed?: number
}

class PRNG {
  s: number
  constructor(seed = 1) { this.s = seed >>> 0 }
  next() { this.s = (this.s * 1664525 + 1013904223) >>> 0; return this.s / 0xffffffff }
}

// Value noise 2D with bilinear interpolation
function noise2(prng: PRNG, x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  function hash(ix: number, iy: number) {
    const s = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123
    return s - Math.floor(s)
  }
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  return (a * (1 - u) + b * u) + (c - a) * v * (1 - u) + (d - b) * u * v
}

function ridged(n: number) { n = 2 * n - 1; n = 1 - Math.abs(n); return n * n }

function fbmRidged(x: number, y: number, o: number) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < o; i++) {
    const n = ridged(noise2(undefined as any, x * freq, y * freq)) // hash only, stateless
    sum += amp * n
    freq *= 2
    amp *= 0.5
  }
  return Math.max(0, Math.min(1, sum))
}

export function createRidgedTerracedTerrain({
  width = 900,
  depth = 200,
  segX = 320,
  segZ = 64,
  amp = 22,
  scaleX = 0.015,
  scaleZ = 0.04,
  terraceSteps = 8,
  seed = 42,
}: HeightmapOpts = {}) {
  const geom = new THREE.PlaneGeometry(width, depth, segX, segZ)
  geom.rotateX(-Math.PI / 2)
  const pos = geom.attributes.position as THREE.BufferAttribute
  const count = pos.count
  const rng = new PRNG(seed)

  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const nx = x * scaleX
    const nz = z * scaleZ
    // Stateless noise via hash (seed baked into transform)
    const h = fbmRidged(nx + seed * 0.123, nz + seed * 0.317, 5)
    const steps = Math.max(1, terraceSteps)
    const t = Math.floor(h * steps) / steps
    const ht = t * 0.75 + h * 0.25
    const y = ht * amp
    pos.setY(i, y)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  geom.computeVertexNormals()
  return geom
}

