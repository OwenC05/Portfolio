"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & {
  color?: string
}

const Gondola = forwardRef<THREE.Group, Props>(function Gondola({ color = '#0f1627', ...props }, ref) {
  const material = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.25 }),
    [color]
  )
  return (
    <group ref={ref} {...props}>
      {/* Cable */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 6, 12]} />
        <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0, 0.1)} />
      </mesh>
      {/* Hanger */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
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

