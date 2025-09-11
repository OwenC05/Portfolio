"use client"

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useProjectsStore } from '@/lib/projectsStore'

const COUNT = 200

export default function Snow() {
  const reduced = useProjectsStore((s) => s.reducedMotion)
  const ref = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const velocities = useMemo(() => new Float32Array(COUNT).map(() => 0.2 + Math.random() * 0.5), [])
  const bounds = 60

  useMemo(() => {
    if (!ref.current) return
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set((Math.random() - 0.5) * bounds, Math.random() * 20 + 5, (Math.random() - 0.2) * bounds)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  useFrame((_, delta) => {
    if (!ref.current || reduced) return
    for (let i = 0; i < COUNT; i++) {
      ref.current.getMatrixAt(i, dummy.matrix)
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
      dummy.position.y -= velocities[i] * delta * 4
      if (dummy.position.y < -1) dummy.position.y = 20
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, COUNT]}
    >
      <sphereGeometry args={[0.05, 6, 6]} />
      <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
    </instancedMesh>
  )
}
