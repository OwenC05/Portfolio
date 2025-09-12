"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & {
  material: THREE.Material
  capMaterial?: THREE.Material
}

/**
 * Mountain icon — 3–4 merged low-poly wedges with a small snowcap mesh.
 * Merge idea: stack a few pyramids (cones with low radialSegments) at slight offsets.
 */
const Mountain = forwardRef<THREE.Group, Props>(function Mountain(
  { material, capMaterial, ...props },
  ref
) {
  const parts = useMemo(() => {
    const meshes: { geom: THREE.ConeGeometry; pos: [number, number, number]; rot?: [number, number, number]; scale?: number }[] = []
    const g1 = new THREE.ConeGeometry(1.2, 1.6, 5)
    const g2 = new THREE.ConeGeometry(0.9, 1.2, 4)
    const g3 = new THREE.ConeGeometry(0.7, 0.9, 4)
    g1.computeVertexNormals(); g2.computeVertexNormals(); g3.computeVertexNormals()
    meshes.push({ geom: g1, pos: [0.1, -0.1, -0.05], rot: [0, 0, 0] })
    meshes.push({ geom: g2, pos: [-0.7, -0.25, 0.1], rot: [0, 0.2, 0], scale: 0.96 })
    meshes.push({ geom: g3, pos: [0.65, -0.35, 0.2], rot: [0, -0.2, 0], scale: 0.98 })
    return meshes
  }, [])

  // Snowcap: duplicate a small cone near the top with highlight material
  const caps = useMemo(() => {
    const geom = new THREE.ConeGeometry(0.5, 0.42, 5)
    geom.translate(0, 0.55, 0)
    geom.computeVertexNormals()
    return [geom]
  }, [])

  return (
    <group ref={ref} {...props}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geom} position={p.pos} rotation={p.rot as any} scale={p.scale ?? 1} castShadow material={material} />
      ))}
      {caps.map((g, i) => (
        <mesh key={`cap-${i}`} geometry={g} position={[0, 0.4, -0.06]} material={capMaterial ?? material} />
      ))}
    </group>
  )
})

export default Mountain
