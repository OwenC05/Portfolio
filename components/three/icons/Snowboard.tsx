"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & { color?: string }

const Snowboard = forwardRef<THREE.Group, Props>(function Snowboard({ color = '#0f1627', ...props }, ref) {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, metalness: 0.08, clearcoat: 0.9, clearcoatRoughness: 0.25 }),
    [color]
  )
  return (
    <group ref={ref} {...props}>
      {/* Board: two capsules end-to-end */}
      <mesh rotation={[THREE.MathUtils.degToRad(-10), 0, THREE.MathUtils.degToRad(12)]} castShadow>
        <capsuleGeometry args={[0.12, 1.1, 8, 16]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, 0, -0.2]} rotation={[0, 0, THREE.MathUtils.degToRad(-8)]}>
        <boxGeometry args={[0.4, 0.06, 0.2]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  )
})

export default Snowboard

