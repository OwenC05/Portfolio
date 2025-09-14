"use client"

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LowPolyMaterial, createLowPolyTerrain } from './mountain'
import { getMountainTheme, layerTheme } from './mountain/theme'
import { useTheme } from 'next-themes'
import { LazyMotion, domAnimation, m } from 'framer-motion'

type HeightPct = { mobile: number; desktop: number }

export type MountainBandProps = {
  heightPct?: HeightPct
  ampNear?: number
  ampMid?: number
  ampFar?: number
  terraceStepsNear?: number
  terraceStepsMid?: number
  terraceStepsFar?: number
  seed?: number
  animate?: boolean
  reduced?: boolean
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(!!m.matches)
    onChange()
    m.addEventListener?.('change', onChange)
    return () => m.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

function usePointerSway(enabled: boolean) {
  const { camera, invalidate } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
      invalidate()
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled, invalidate])

  useFrame((state, delta) => {
    if (!enabled) return
    const targetYaw = THREE.MathUtils.degToRad(0.4) * mouse.current.x
    const targetPitch = THREE.MathUtils.degToRad(0.2) * -mouse.current.y
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, targetYaw, 2.5, delta)
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, targetPitch, 2.5, delta)
  })
}

export default function MountainBand({
  heightPct = { mobile: 0.20, desktop: 0.28 },
  ampNear = 48,
  ampMid = 32,
  ampFar = 22,
  terraceStepsNear = 6,
  terraceStepsMid = 8,
  terraceStepsFar = 10,
  seed = 42,
  animate = false,
  reduced = false,
}: MountainBandProps) {
  const { resolvedTheme } = useTheme()
  const userReduced = useReducedMotion()
  const baseTheme = useMemo(() => getMountainTheme((resolvedTheme as any) === 'light' ? 'light' : 'dark'), [resolvedTheme])
  const [warm, setWarm] = useState(true)

  // Ensure first-frame render reliably appears, then drop to demand
  useEffect(() => {
    if (userReduced || reduced) {
      setWarm(false)
      return
    }
    const t = setTimeout(() => setWarm(false), 900)
    return () => clearTimeout(t)
  }, [userReduced, reduced])

  const effectiveReduced = reduced || userReduced

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={animate ? { opacity: 0 } : undefined}
        animate={animate ? { opacity: 1 } : undefined}
        transition={{ duration: effectiveReduced ? 0.2 : 0.42, ease: 'easeOut' }}
        className="w-full h-full"
      >
        <Canvas
          className="w-full h-full"
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          frameloop={warm ? 'always' : 'demand'}
          camera={{ fov: 35, position: [0, 14, 42] }}
          eventSource={typeof window !== 'undefined' ? (document as any) : undefined}
          onCreated={(state) => {
            state.gl.setClearColor(0x000000, 0)
            state.invalidate()
          }}
        >
          <Scene
            reduced={effectiveReduced}
            baseTheme={baseTheme}
            amps={{ near: ampNear, mid: ampMid, far: ampFar }}
            steps={{ near: terraceStepsNear, mid: terraceStepsMid, far: terraceStepsFar }}
            seed={seed}
          />
        </Canvas>
      </m.div>
    </LazyMotion>
  )
}

function Scene({
  reduced,
  baseTheme,
  amps,
  steps,
  seed,
}: {
  reduced: boolean
  baseTheme: ReturnType<typeof getMountainTheme>
  amps: { near: number; mid: number; far: number }
  steps: { near: number; mid: number; far: number }
  seed: number
}) {
  const [time, setTime] = useState(0)
  const [wind] = useState(0.03)
  const { invalidate } = useThree()
  const { camera } = useThree()
  // Ensure the camera looks toward the band
  useEffect(() => {
    const c = camera as THREE.PerspectiveCamera
    c.position.set(0, 14, 42)
    c.lookAt(0, -4, -30)
    invalidate()
  }, [camera, invalidate])

  // Drive time at ~20fps when not reduced
  const accRef = useRef(0)
  useFrame((_, delta) => {
    if (reduced) return
    accRef.current += delta
    if (accRef.current > 0.05) {
      setTime((t) => t + accRef.current * 0.5)
      accRef.current = 0
      invalidate()
    }
  })

  usePointerSway(!reduced)

  // Bake low‑poly layers using Perlin FBM for a crisp faceted silhouette
  const farTheme = useMemo(() => layerTheme(baseTheme, 'far'), [baseTheme])
  const midTheme = useMemo(() => layerTheme(baseTheme, 'mid'), [baseTheme])
  const nearTheme = useMemo(() => layerTheme(baseTheme, 'near'), [baseTheme])

  const geoFar = useMemo(
    () =>
      createLowPolyTerrain({
        width: 1000,
        depth: 190,
        segX: 100,
        segZ: 34,
        amplitude: amps.far,
        scaleX: 0.013,
        scaleZ: 0.032,
        seed: seed + 3,
        snowColor: farTheme.snow,
        rockColor: farTheme.rockMid,
      }),
    [amps.far, seed, farTheme]
  )

  const geoMid = useMemo(
    () =>
      createLowPolyTerrain({
        width: 1000,
        depth: 190,
        segX: 120,
        segZ: 38,
        amplitude: amps.mid,
        scaleX: 0.012,
        scaleZ: 0.030,
        seed: seed + 7,
        snowColor: midTheme.snow,
        rockColor: midTheme.rockMid,
      }),
    [amps.mid, seed, midTheme]
  )

  const geoNear = useMemo(
    () =>
      createLowPolyTerrain({
        width: 1000,
        depth: 190,
        segX: 140,
        segZ: 42,
        amplitude: amps.near,
        scaleX: 0.010,
        scaleZ: 0.028,
        seed: seed + 13,
        snowColor: nearTheme.snow,
        rockColor: nearTheme.rockMid,
      }),
    [amps.near, seed, nearTheme]
  )

  return (
    <>
      <ambientLight intensity={0.48} />
      <hemisphereLight args={[0x7aa2ff, 0x0b1220, 0.35]} />
      <directionalLight position={[-26, 38, 24]} intensity={1.4} color={0xfff3e6} />
      <directionalLight position={[30, 28, -10]} intensity={0.45} color={0x9bc3ff} />

      {/* Far layer */}
      <group position={[0, -5.6, -46]} scale={[1.30, 1, 1]}>
        <mesh geometry={geoFar}>
          <LowPolyMaterial roughness={0.82} metalness={0.0} />
        </mesh>
      </group>
      {/* Mid layer */}
      <group position={[0, -4.8, -32]} scale={[1.22, 1, 1]}>
        <mesh geometry={geoMid}>
          <LowPolyMaterial roughness={0.78} metalness={0.02} />
        </mesh>
      </group>
      {/* Near layer */}
      <group position={[0, -3.8, -20]} scale={[1.12, 1, 1]}>
        <mesh geometry={geoNear}>
          <LowPolyMaterial roughness={0.76} metalness={0.03} />
        </mesh>
      </group>
    </>
  )
}
