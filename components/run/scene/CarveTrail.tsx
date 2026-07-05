'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { playerState } from './playerState'
import { scene as palette } from '@/lib/theme'

// Signature (a): a glowing alpenglow ribbon carved into the snow behind the
// rider. A rolling buffer of recent board-contact points, widened along the
// board's lateral axis, drawn additively with emissive colour > 1 so the bloom
// pass makes it glow. Zero per-frame allocation.

const MAX = 240 // samples kept
const HALF = 0.5 // ribbon half-width (board edge)
const MIN_STEP = 0.28 // min travel before laying a new sample

const VERT = /* glsl */ `
  attribute float aAge;
  varying float vAge;
  void main() {
    vAge = aAge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const FRAG = /* glsl */ `
  varying float vAge;
  uniform vec3 uHot;
  uniform vec3 uCool;
  void main() {
    float a = 1.0 - vAge;                 // newest = brightest
    vec3 col = mix(uHot, uCool, vAge);
    gl_FragColor = vec4(col * (1.3 + a * 1.7), a * a * 0.92);
  }
`

export default function CarveTrail() {
  const meshRef = useRef<THREE.Mesh>(null)

  const { geometry, positions, ages } = useMemo(() => {
    const positions = new Float32Array(MAX * 2 * 3)
    const ages = new Float32Array(MAX * 2)
    const index = new Uint16Array((MAX - 1) * 6)
    for (let k = 0; k < MAX - 1; k++) {
      const a = k * 2
      index.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], k * 6)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aAge', new THREE.BufferAttribute(ages, 1))
    geometry.setIndex(new THREE.BufferAttribute(index, 1))
    geometry.setDrawRange(0, 0)
    return { geometry, positions, ages }
  }, [])

  const uniforms = useMemo(
    () => ({
      uHot: { value: new THREE.Color(palette.trailHot) },
      uCool: { value: new THREE.Color(palette.trailCool) },
    }),
    [],
  )

  // Rolling sample buffer (centre + right-vector), plus scratch vectors.
  const pts = useRef<{ c: THREE.Vector3; r: THREE.Vector3 }[]>([])
  const lastEmit = useRef(new THREE.Vector3(0, -999, 0))
  const right = useMemo(() => new THREE.Vector3(), [])
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    if (!playerState.riding) return

    const c = playerState.contact
    const step = c.distanceTo(lastEmit.current)
    if (step > MIN_STEP) {
      if (step > 8) pts.current.length = 0 // teleport (restart) → drop old ribbon
      // right vector from yaw (forward = (sinθ,0,cosθ)) → right = (cosθ,0,-sinθ)
      right.set(Math.cos(playerState.yaw), 0, -Math.sin(playerState.yaw))
      pts.current.push({ c: c.clone(), r: right.clone() })
      if (pts.current.length > MAX) pts.current.shift()
      lastEmit.current.copy(c)
    }

    const arr = pts.current
    const n = arr.length
    for (let k = 0; k < n; k++) {
      const { c: cc, r } = arr[k]
      a.copy(cc).addScaledVector(r, -HALF)
      b.copy(cc).addScaledVector(r, HALF)
      const o = k * 6
      positions[o] = a.x
      positions[o + 1] = a.y
      positions[o + 2] = a.z
      positions[o + 3] = b.x
      positions[o + 4] = b.y
      positions[o + 5] = b.z
      const age = n > 1 ? 1 - k / (n - 1) : 0 // oldest(k=0)=1, newest=0
      ages[k * 2] = age
      ages[k * 2 + 1] = age
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.aAge.needsUpdate = true
    geometry.setDrawRange(0, Math.max(0, (n - 1) * 6))
  })

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
