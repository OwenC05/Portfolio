"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & {
  color?: string
  roughness?: number
  metalness?: number
  clearcoat?: number
  clearcoatRoughness?: number
}

const Gondola = forwardRef<THREE.Group, Props>(function Gondola(
  { color = '#0f1627', roughness = 0.35, metalness = 0.1, clearcoat = 1, clearcoatRoughness = 0.25, ...props },
  ref
) {
  const material = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat, clearcoatRoughness }),
    [color, roughness, metalness, clearcoat, clearcoatRoughness]
  )
  return (
    <group ref={ref} {...props}>
      {/* Hanger removed to avoid vertical bar on the right */}
      {/* Cabin */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 1.0, 0.6]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Rounded corners via tiny spheres */}
      <mesh position={[0.7, 0.4, 0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-0.7, 0.4, 0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.7, 0.4, -0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-0.7, 0.4, -0.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  )
})

export default Gondola
