"use client"

import * as THREE from 'three'
import { forwardRef, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type Props = JSX.IntrinsicElements['group'] & {
  material: THREE.Material
  count?: number
  scaleRange?: [number, number]
  rect?: { cx: number; cy: number; z: number; hw: number; hh: number }
}

/**
 * Procedural, instanced snowflakes (6-arm) kept lightweight.
 * One base flake is built from thin boxes then instanced ~40–80 times with slow rotation/float.
 */
const Snowflakes = forwardRef<THREE.Group, Props>(function Snowflakes(
  { material, count = 60, scaleRange = [0.06, 0.12], rect, ...props },
  ref
) {
  // Base flake geometry: central hex + spokes with small branches
  const flakeGeom = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = []
    const center = new THREE.BoxGeometry(0.08, 0.08, 0.02)
    geometries.push(center)
    const spoke = new THREE.BoxGeometry(0.6, 0.04, 0.02)
    const branch = new THREE.BoxGeometry(0.18, 0.03, 0.02)

    const addWith = (src: THREE.BufferGeometry, m: THREE.Matrix4) => {
      const g = src.clone()
      g.applyMatrix4(m)
      geometries.push(g)
    }

    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3
      const rot = new THREE.Matrix4().makeRotationZ(a)
      const pos = new THREE.Matrix4().makeTranslation(0.35, 0, 0)
      const m = new THREE.Matrix4().multiply(rot).multiply(pos)
      addWith(spoke, m)

      const m1 = new THREE.Matrix4().makeRotationZ(a + Math.PI / 3)
      const t1 = new THREE.Matrix4().makeTranslation(0.45, 0, 0)
      const mat1 = new THREE.Matrix4().multiply(m1).multiply(t1)
      addWith(branch, mat1)

      const m2 = new THREE.Matrix4().makeRotationZ(a - Math.PI / 3)
      const t2 = new THREE.Matrix4().makeTranslation(0.45, 0, 0)
      const mat2 = new THREE.Matrix4().multiply(m2).multiply(t2)
      addWith(branch, mat2)
    }

    const merged = mergeGeometries(geometries, false) as THREE.BufferGeometry
    geometries.forEach((g, i) => { if (i !== 0) g.dispose() })
    merged.computeVertexNormals()
    return merged
  }, [])

  const instanced = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const rotations = useRef<Float32Array>(new Float32Array(count))
  const phases = useRef<Float32Array>(new Float32Array(count))
  const baseScales = useRef<Float32Array>(new Float32Array(count))
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!instanced.current) return
    const r = rotations.current
    const p = phases.current
    const s = baseScales.current
    for (let i = 0; i < count; i++) {
      r[i] = (Math.random() * 2 - 1) * 0.003
      p[i] = Math.random() * Math.PI * 2
      s[i] = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0])
      // Scatter within the provided rect; if none, default to unit square
      const cx = rect?.cx ?? 0
      const cy = rect?.cy ?? 0
      const hw = rect?.hw ?? 1
      const hh = rect?.hh ?? 1
      const x = cx + (Math.random() * 2 - 1) * hw
      const y = cy + (Math.random() * 2 - 1) * hh
      const z = (rect?.z ?? 0) + (-0.3 + Math.random() * 0.6)
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, 0, Math.random() * Math.PI)
      dummy.scale.setScalar(s[i])
      dummy.updateMatrix()
      instanced.current.setMatrixAt(i, dummy.matrix)
    }
    instanced.current.instanceMatrix.needsUpdate = true
  }, [count, scaleRange, rect, dummy])

  useFrame((_, dt) => {
    if (!instanced.current) return
    if (reduced) return
    const r = rotations.current
    const p = phases.current
    const s = baseScales.current
    for (let i = 0; i < count; i++) {
      instanced.current.getMatrixAt(i, dummy.matrix)
      dummy.rotation.z += r[i] * dt * 60
      const t = (p[i] += dt * 0.4)
      const float = Math.sin(t) * 0.06
      dummy.position.y += (float - 0) * 0.05
      const scale = s[i] * (0.98 + Math.sin(t * 0.5) * 0.02)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      instanced.current.setMatrixAt(i, dummy.matrix)
    }
    instanced.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={ref} {...props}>
      <instancedMesh ref={instanced} args={[flakeGeom, (material as any), count]} />
    </group>
  )
})

export default Snowflakes
