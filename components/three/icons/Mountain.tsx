"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & { color?: string }

const Mountain = forwardRef<THREE.Group, Props>(function Mountain({ color = '#0f1627', ...props }, ref) {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, metalness: 0.05, clearcoat: 0.8 }),
    [color]
  )
  return (
    <group ref={ref} {...props}>
      <mesh castShadow rotation={[0, 0, 0]}>
        <coneGeometry args={[1.2, 1.4, 6]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[-0.9, -0.2, 0]} rotation={[0, 0.4, 0]}>
        <coneGeometry args={[0.7, 0.8, 5]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  )
})

export default Mountain

