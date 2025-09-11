"use client"

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useProjectsStore } from '@/lib/projectsStore'

export default function Chairlift() {
  const { layout, currentId, targetId, mode } = useProjectsStore((s) => ({
    layout: s.layout,
    currentId: s.currentId,
    targetId: s.targetId,
    mode: s.mode,
  }))
  const ref = useRef<THREE.Group>(null)
  const tRef = useRef(0)

  useFrame((_, delta) => {
    if (!layout || !currentId || !targetId || mode !== 'lift') return
    const key = `${targetId}->${currentId}`
    const curve = layout.edgeCurves[key]
    if (!curve) return
    tRef.current = Math.min(1, tRef.current + delta / 2.0)
    const pos = curve.getPointAt(tRef.current)
    ref.current?.position.copy(pos.clone().add(new THREE.Vector3(0, 1.5, 0)))
  })

  return (
    <group ref={ref}>
      {/* Simple gondola */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#e11d48" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  )
}
