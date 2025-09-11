"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & {
  color?: string
  roughness?: number
  metalness?: number
  clearcoat?: number
}

const Snowflake = forwardRef<THREE.Group, Props>(function Snowflake(
  { color = '#0f1627', roughness = 0.4, metalness = 0.1, clearcoat = 0.9, ...props },
  ref
) {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness, metalness, clearcoat }),
    [color, roughness, metalness, clearcoat]
  )
  return (
    <group ref={ref} {...props}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.06]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  )
})

export default Snowflake
