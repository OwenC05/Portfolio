"use client"

import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { useProjectsStore } from '@/lib/projectsStore'
import { createConstantSpeedSampler } from '@/lib/rideCurve'
import { projectTree } from '@/app/projects/data'
import { indexById } from '@/lib/tree'
import { useRouter } from 'next/navigation'

const idIndex = indexById(projectTree)

export default function Player() {
  const router = useRouter()
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)

  const currentId = useProjectsStore((s) => s.currentId)
  const targetId = useProjectsStore((s) => s.targetId)
  const mode = useProjectsStore((s) => s.mode)
  const reducedMotion = useProjectsStore((s) => s.reducedMotion)
  const layout = useProjectsStore((s) => s.layout)
  const setCurrent = useProjectsStore((s) => s.setCurrent)
  const setTarget = useProjectsStore((s) => s.setTarget)

  const [t, setT] = useState(0)
  const sampler = useMemo(() => {
    if (!layout || !currentId || !targetId) return null
    const key = mode === 'lift' ? `${targetId}->${currentId}` : `${currentId}->${targetId}`
    const curve = layout.edgeCurves[key]
    return curve ? createConstantSpeedSampler(curve) : null
  }, [layout, currentId, targetId, mode])

  useEffect(() => {
    if (!sampler) return
    setT(0)
  }, [sampler])

  // Camera follow
  const camOffset = new THREE.Vector3(4, 3, 6)
  useFrame((_, delta) => {
    const obj = group.current
    if (!obj) return
    // Follow camera with simple damped lerp
    const target = obj.getWorldPosition(new THREE.Vector3())
    const desired = target.clone().add(camOffset)
    camera.position.lerp(desired, 1 - Math.pow(0.0001, delta))
    camera.lookAt(target)
  })

  useFrame((_, delta) => {
    const obj = group.current
    if (!obj || !layout) return
    // Idle snap to current node
    if (mode === 'idle' && currentId) {
      const p = layout.nodeWorldPos[currentId]
      if (p) obj.position.lerp(p, 1 - Math.pow(0.0001, delta))
      return
    }

    if (sampler && targetId && currentId) {
      const speed = reducedMotion ? 3.5 : 1.8 // higher = faster progression per second
      const dt = Math.min(1, t + delta / speed)
      setT(dt)
      const pos = sampler(dt)
      obj.position.copy(pos)

      // Orient board to tangent direction (approx by next point)
      const next = sampler(Math.min(1, dt + 0.002))
      const dir = next.clone().sub(pos).normalize()
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir)
      obj.quaternion.slerp(quat, 0.2)

      if (dt >= 1) {
        // Arrived
        setCurrent(targetId)
        setTarget(null, 'idle')
        // Zoom and open detail
        const node = idIndex[targetId]
        if (node) {
          setTimeout(() => router.push(`/projects/${node.slug}`), reducedMotion ? 0 : 400)
        }
      }
    }
  })

  return (
    <group ref={group}>
      {/* Simple snowboarder: capsule + board */}
      <RigidBody type="kinematicPosition" colliders={false}>
        <group>
          <mesh castShadow position={[0, 0.7, 0]}>
            <capsuleGeometry args={[0.25, 0.6, 8, 16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh castShadow position={[0, 0.3, 0]} rotation={[THREE.MathUtils.degToRad(-2), 0, 0]}>
            <boxGeometry args={[1.0, 0.05, 0.3]} />
            <meshStandardMaterial color="#0ea5e9" />
          </mesh>
        </group>
      </RigidBody>
    </group>
  )
}

//
