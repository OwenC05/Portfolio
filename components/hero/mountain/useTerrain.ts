import * as THREE from 'three'

export type TerrainOptions = {
  width?: number
  depth?: number
  segX?: number
  segZ?: number
  amplitude?: number
  scaleX?: number
  scaleZ?: number
  octaves?: number
  lacunarity?: number
  gain?: number
  seed?: number
  snowColor?: THREE.Color | string
  rockColor?: THREE.Color | string
}

// Small Perlin noise implementation (2D)
class Perlin {
  private p: Uint8Array
  constructor(seed = 1) {
    const perm = new Uint8Array(256)
    for (let i = 0; i < 256; i++) perm[i] = i
    let s = seed >>> 0
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0
      const j = s % (i + 1)
      const t = perm[i]
      perm[i] = perm[j]
      perm[j] = t
    }
    this.p = new Uint8Array(512)
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255]
  }
  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a)
  }
  private grad(hash: number, x: number, y: number) {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  noise2(x: number, y: number) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    const u = this.fade(x)
    const v = this.fade(y)
    const A = this.p[X] + Y
    const B = this.p[X + 1] + Y
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x - 1, y)),
      this.lerp(
        u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    )
  }
}

function fbm(perlin: Perlin, x: number, y: number, octaves: number, lac: number, gain: number) {
  let amp = 0.5
  let freq = 1
  let sum = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * perlin.noise2(x * freq, y * freq)
    freq *= lac
    amp *= gain
  }
  return sum
}

export function createLowPolyTerrain({
  width = 800,
  depth = 160,
  segX = 320,
  segZ = 64,
  amplitude = 22,
  scaleX = 0.015,
  scaleZ = 0.04,
  octaves = 4,
  lacunarity = 2.0,
  gain = 0.5,
  seed = 1,
  snowColor = '#E6EEF6',
  rockColor = '#5F6772',
}: TerrainOptions = {}) {
  const geom = new THREE.PlaneGeometry(width, depth, segX, segZ)
  // Rotate to XZ plane so Y is up
  geom.rotateX(-Math.PI / 2)

  const pos = geom.attributes.position as THREE.BufferAttribute
  const count = pos.count
  const perlin = new Perlin(seed)

  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const nx = x * scaleX
    const nz = z * scaleZ
    const h = fbm(perlin, nx, nz, octaves, lacunarity, gain)
    const y = h * amplitude
    pos.setY(i, y)
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  geom.computeVertexNormals()

  // Bake vertex colors for snow/rock by height & slope
  const normals = geom.attributes.normal as THREE.BufferAttribute
  const colors = new Float32Array(count * 3)
  const snow = new THREE.Color(snowColor as any).convertSRGBToLinear()
  const rock = new THREE.Color(rockColor as any).convertSRGBToLinear()
  const up = new THREE.Vector3(0, 1, 0)
  const n = new THREE.Vector3()

  const heightRange = maxY - minY || 1
  for (let i = 0; i < count; i++) {
    const y = pos.getY(i)
    const t = (y - minY) / heightRange // 0..1
    n.set(normals.getX(i), normals.getY(i), normals.getZ(i)).normalize()
    const slope = 1 - Math.abs(n.dot(up)) // 0 flat .. 1 steep
    // More snow on high elevation and gentle slopes
    const snowFactor = smoothstep(0.35, 0.75, t) * (1 - smoothstep(0.25, 0.65, slope))
    const c = rock.clone().lerp(snow, snowFactor)
    colors[i * 3 + 0] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  return geom
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / Math.max(1e-6, edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

