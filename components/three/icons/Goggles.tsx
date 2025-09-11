"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & { color?: string }

const Goggles = forwardRef<THREE.Group, Props>(function Goggles({ color = '#0f1627', ...props }, ref) {
  const frame = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.4, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.25 }),
    [color]
  )
  const lens = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color).offsetHSL(0, 0, 0.2), roughness: 0.1, metalness: 0.5, transmission: 0.2, transparent: true, opacity: 0.9 }),
    [color]
  )
  return (
    <group ref={ref} {...props}>
      {/* Frame */}
      <mesh castShadow>
        <torusGeometry args={[0.7, 0.12, 12, 24]} />
        <primitive object={frame} attach="material" />
      </mesh>
      {/* Lens */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.02]}>
        <planeGeometry args={[1.2, 0.6, 1, 1]} />
        <primitive object={lens} attach="material" />
      </mesh>
    </group>
  )
})

export default Goggles

