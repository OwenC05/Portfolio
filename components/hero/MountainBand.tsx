'use client'

import { useTheme } from 'next-themes'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

import RidgedTerrain, { type LayerProps } from './mountain/RidgedTerrain'
import { getMountainTheme, type MountainTheme, type ThemeMode } from './mountain/theme'

const LAYER_DEPTHS = {
  far: -28,
  mid: -18,
  near: -10,
} as const

const BAND_DROP = 12

export default function MountainBand() {
  const { resolvedTheme } = useTheme()
  const [mode, setMode] = useState<ThemeMode>('dark')

  useEffect(() => {
    setMode(resolvedTheme === 'light' ? 'light' : 'dark')
  }, [resolvedTheme])

  const theme = useMemo(() => getMountainTheme(mode), [mode])

  return (
    <Canvas
      className="w-full h-full"
      dpr={[1, 2]}
      camera={{ position: [0, 10, 34], fov: 42, near: 0.1, far: 160 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <MountainScene theme={theme} />
    </Canvas>
  )
}

function MountainScene({ theme }: { theme: MountainTheme }) {
  const { gl, scene, camera, viewport, size } = useThree()

  useEffect(() => {
    gl.setClearColor(new THREE.Color(theme.fog), 0)
    scene.fog = new THREE.Fog(theme.fog, 12, 140)
  }, [gl, scene, theme.fog])

  const layers = useMemo<[LayerProps, LayerProps, LayerProps]>(() => {
    const viewportKey = size.width + size.height
    const computeWidth = (depth: number) => {
      void viewportKey
      return viewport.getCurrentViewport(camera, [0, 0, depth]).width * 1.18
    }

    const farWidth = ensureWidth(computeWidth(LAYER_DEPTHS.far), 160)
    const midWidth = ensureWidth(computeWidth(LAYER_DEPTHS.mid), 140)
    const nearWidth = ensureWidth(computeWidth(LAYER_DEPTHS.near), 120)

    return [
      {
        width: farWidth,
        depth: 140,
        segX: 360,
        segZ: 64,
        amp: 22,
        terraceSteps: 5,
        seed: 11,
        scaleX: 0.006,
        scaleZ: 0.01,
        wind: 0.004,
        xScale: 1.05,
        yOffset: -BAND_DROP - 3.2,
        zOffset: LAYER_DEPTHS.far,
        fogStrength: 0.35,
      },
      {
        width: midWidth,
        depth: 120,
        segX: 340,
        segZ: 60,
        amp: 32,
        terraceSteps: 6,
        seed: 19,
        scaleX: 0.0085,
        scaleZ: 0.014,
        wind: 0.006,
        xScale: 1.02,
        yOffset: -BAND_DROP + 0.6,
        zOffset: LAYER_DEPTHS.mid,
        fogStrength: 0.52,
      },
      {
        width: nearWidth,
        depth: 96,
        segX: 320,
        segZ: 56,
        amp: 44,
        terraceSteps: 8,
        seed: 31,
        scaleX: 0.011,
        scaleZ: 0.018,
        wind: 0.008,
        xScale: 1,
        yOffset: -BAND_DROP + 3.2,
        zOffset: LAYER_DEPTHS.near,
        fogStrength: 0.72,
      },
    ] as [LayerProps, LayerProps, LayerProps]
  }, [camera, viewport, size.width, size.height])

  return (
    <group>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 6, 3]} intensity={1.08} />
      <RidgedTerrain theme={theme} time={0.0} wind={0.0} layers={layers} />
    </group>
  )
}

function ensureWidth(width: number, fallback: number) {
  if (Number.isFinite(width) && width > 0) {
    return width
  }
  return fallback
}


