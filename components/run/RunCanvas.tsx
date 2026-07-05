'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import RunScene from './RunScene'
import { useRunStore } from '@/lib/runStore'

export default function RunCanvas() {
  const [dpr, setDpr] = useState(1.5)
  const lowPower = useRunStore((s) => s.lowPower)

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 52, position: [0, 5, -9], near: 0.1, far: 700 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor
        flipflops={3}
        onChange={({ factor }) => setDpr(Math.round((0.75 + 1.25 * factor) * 10) / 10)}
        onDecline={() => useRunStore.getState().setLowPower(true)}
      />

      <Suspense fallback={null}>
        <RunScene />
      </Suspense>

      {!lowPower && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          {/* Only emissive materials with colour > 1 (toneMapped=false) glow. */}
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.95} radius={0.7} />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
          <ToneMapping />
        </EffectComposer>
      )}
    </Canvas>
  )
}
