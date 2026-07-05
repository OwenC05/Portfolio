'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRunStore } from '@/lib/runStore'
import { gradeStops } from '@/lib/theme'

// Signature (b): the sky is a vertical-gradient dome whose colours grade with
// the descent — pink-lit alpenglow at the summit, deep indigo by the valley.
// Driven per-frame from the (transient) run progress; zero React re-renders.

const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  void main() {
    float h = normalize(vDir).y; // -1 (down) .. 1 (up)
    vec3 col = h > 0.0
      ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.55))
      : mix(uHorizon, uBottom, pow(clamp(-h, 0.0, 1.0), 0.8));
    gl_FragColor = vec4(col, 1.0);
  }
`

export default function SkyDome() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  const stops = useMemo(
    () =>
      gradeStops.map((g) => ({
        p: g.p,
        top: new THREE.Color(g.stop.top),
        horizon: new THREE.Color(g.stop.horizon),
        bottom: new THREE.Color(g.stop.top).multiplyScalar(0.35),
      })),
    [],
  )

  const uniforms = useMemo(
    () => ({
      uTop: { value: stops[0].top.clone() },
      uHorizon: { value: stops[0].horizon.clone() },
      uBottom: { value: stops[0].bottom.clone() },
    }),
    [stops],
  )

  // Scratch colours so we never allocate per frame.
  const tmpTop = useMemo(() => new THREE.Color(), [])
  const tmpHorizon = useMemo(() => new THREE.Color(), [])
  const tmpBottom = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    // Keep the dome centred on the viewer.
    mesh.position.copy(camera.position)

    const p = useRunStore.getState().progress
    // Find the bracketing grade stops and lerp.
    let a = stops[0]
    let b = stops[stops.length - 1]
    for (let i = 0; i < stops.length - 1; i++) {
      if (p >= stops[i].p && p <= stops[i + 1].p) {
        a = stops[i]
        b = stops[i + 1]
        break
      }
    }
    const span = b.p - a.p || 1
    const t = THREE.MathUtils.clamp((p - a.p) / span, 0, 1)
    uniforms.uTop.value.copy(tmpTop.copy(a.top).lerp(b.top, t))
    uniforms.uHorizon.value.copy(tmpHorizon.copy(a.horizon).lerp(b.horizon, t))
    uniforms.uBottom.value.copy(tmpBottom.copy(a.bottom).lerp(b.bottom, t))
  })

  return (
    <mesh ref={meshRef} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[400, 32, 16]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  )
}
