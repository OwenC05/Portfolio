'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRunStore } from '@/lib/runStore'
import { scene as palette } from '@/lib/theme'

// Instanced snow that follows the viewer — one draw call, recycled within a box
// around the camera so flakes are always present without simulating the world.

const COUNT = 700
const BOX = { x: 34, y: 30, z: 40 }

export default function Snow() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const { camera } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Per-flake offset within the box + drift params. Positions are relative to
  // the camera each frame.
  const flakes = useMemo(() => {
    const arr = new Float32Array(COUNT * 5) // x,y,z, fallSpeed, driftPhase
    for (let i = 0; i < COUNT; i++) {
      arr[i * 5 + 0] = (Math.random() - 0.5) * BOX.x
      arr[i * 5 + 1] = Math.random() * BOX.y
      arr[i * 5 + 2] = (Math.random() - 0.5) * BOX.z
      arr[i * 5 + 3] = 1.6 + Math.random() * 2.4
      arr[i * 5 + 4] = Math.random() * Math.PI * 2
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const reduced = useRunStore.getState().reducedMotion
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const cx = camera.position.x
    const cy = camera.position.y
    const cz = camera.position.z

    for (let i = 0; i < COUNT; i++) {
      const o = i * 5
      if (!reduced) {
        flakes[o + 1] -= flakes[o + 3] * dt
        if (flakes[o + 1] < -4) {
          flakes[o + 1] = BOX.y
          flakes[o + 0] = (Math.random() - 0.5) * BOX.x
          flakes[o + 2] = (Math.random() - 0.5) * BOX.z
        }
      }
      const drift = Math.sin(t * 0.6 + flakes[o + 4]) * 0.6
      dummy.position.set(
        cx + flakes[o + 0] + drift,
        cy + flakes[o + 1] - 6,
        cz + flakes[o + 2] + 8, // bias ahead of the camera
      )
      const s = 0.04 + (i % 3) * 0.018
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={palette.snowParticle} transparent opacity={0.85} toneMapped={false} />
    </instancedMesh>
  )
}
