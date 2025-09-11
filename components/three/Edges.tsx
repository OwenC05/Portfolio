"use client"

import * as THREE from 'three'
import { useMemo } from 'react'
import { useProjectsStore } from '@/lib/projectsStore'

export default function Edges() {
  const layout = useProjectsStore((s) => s.layout)

  const tubes = useMemo(() => {
    if (!layout) return [] as { key: string; geom: THREE.TubeGeometry }[]
    const keys = Object.keys(layout.edgeCurves)
    return keys.map((k) => {
      const curve = layout.edgeCurves[k]
      const geom = new THREE.TubeGeometry(curve, 50, 0.04, 6, false)
      return { key: k, geom }
    })
  }, [layout])

  if (!layout) return null

  return (
    <group>
      {tubes.map(({ key, geom }) => (
        <mesh key={key} geometry={geom} castShadow receiveShadow>
          <meshStandardMaterial color="#94a3b8" metalness={0.1} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

