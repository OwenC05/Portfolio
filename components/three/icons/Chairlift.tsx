"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'

type Props = JSX.IntrinsicElements['group'] & {
  material: THREE.Material
  showCable?: boolean
}

/**
 * Chairlift icon
 * - Cable: thin cylinder spanning above the cab
 * - Hanger: vertical + arm cylinders
 * - Cab: rounded box with slight front tilt to catch rim light
 */
const Chairlift = forwardRef<THREE.Group, Props>(function Chairlift(
  { material, showCable = true, ...props },
  ref
) {
  const cable = useMemo(() => new THREE.CylinderGeometry(0.015, 0.015, 3.0, 8), [])
  const rod = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), [])
  const arm = useMemo(() => new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), [])

  return (
    <group ref={ref} {...props}>
      {/* Cable */}
      {showCable && <mesh geometry={cable} rotation={[0, 0, Math.PI / 2]} position={[0, 1.1, 0]} material={material} />}

      {/* Hanger and arm */}
      <mesh geometry={rod} position={[0, 0.6, 0]} material={material} />
      <mesh geometry={arm} rotation={[0, 0, Math.PI / 2]} position={[0.25, 1.0, 0]} material={material} />

      {/* Cabin */}
      <group position={[0.25, 0.2, 0]} rotation={[THREE.MathUtils.degToRad(-6), 0, 0]}>
        <RoundedBox args={[1.2, 0.8, 0.5]} radius={0.18} smoothness={4} material={material} />
        {/* Simple frame bars */}
        <mesh position={[0, 0.25, 0.27]} rotation={[0, 0, 0]} material={material}>
          <boxGeometry args={[1.05, 0.05, 0.02]} />
        </mesh>
        <mesh position={[0, -0.15, 0.27]} material={material}>
          <boxGeometry args={[1.05, 0.05, 0.02]} />
        </mesh>
        {/* Window splitters (visual cutouts) */}
        <mesh position={[0, 0.05, 0.28]} material={material}>
          <boxGeometry args={[0.04, 0.5, 0.02]} />
        </mesh>
      </group>
    </group>
  )
})

export default Chairlift
