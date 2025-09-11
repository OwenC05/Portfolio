"use client"

import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
// import { Perf } from '@react-three/drei'

export default function Experience() {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1
  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ fov: 45, position: [8, 6, 10] }}
    >
      {/* <Perf position="top-left" minimal /> */}
      <Scene />
    </Canvas>
  )
}
