"use client"

import * as THREE from 'three'
import { forwardRef, useMemo } from 'react'

type Props = JSX.IntrinsicElements['group'] & {
  material: THREE.Material
}

/**
 * Snowboard icon — constructed from a 2D Shape with symmetric sidecut and extruded with bevels.
 * - Outline uses two semi-circular ends and Bezier sidecuts so waist ≈ 0.88–0.90 of straight width.
 * - Camber: vertices are offset along Z by sin(pi * x/L) with peak ≈ 0.14 at center.
 */
const Snowboard = forwardRef<THREE.Group, Props>(function Snowboard(
  { material, ...props },
  ref
) {
  const { geom, bindings } = useMemo(() => {
    // Board proportions: length:width ≈ 7.5:1
    const L = 7.5
    const W = 1.0
    const hl = L / 2
    const hw = W / 2
    const r = 0.48 * hw // quarter-circle radius for nose/tail rounding
    const waist = 0.88 * W
    const wy = waist / 2

    const shape = new THREE.Shape()
    // Start on top edge, left of center, at start of left-rounding
    shape.moveTo(-hl + r, hw)
    // Left semi-circular end (top → bottom)
    shape.absarc(-hl + r, 0, r, Math.PI / 2, -Math.PI / 2, true)
    // Bottom edge sidecut from tail → waist → nose
    shape.bezierCurveTo(-hl * 0.2, -hw * 0.92, -hl * 0.2, -wy, 0, -wy)
    shape.bezierCurveTo(hl * 0.2, -wy, hl * 0.2, -hw * 0.92, hl - r, -hw)
    // Right semi-circular end (bottom → top)
    shape.absarc(hl - r, 0, r, -Math.PI / 2, Math.PI / 2, true)
    // Top edge sidecut back to start
    shape.bezierCurveTo(hl * 0.2, hw * 0.92, hl * 0.2, wy, 0, wy)
    shape.bezierCurveTo(-hl * 0.2, wy, -hl * 0.2, hw * 0.92, -hl + r, hw)

    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.02,
      bevelSegments: 6,
      steps: 1,
      curveSegments: 32,
    })
    extrude.center()

    // Apply simple camber along length (x axis): z += A * sin(pi * (x/L + 0.5))
    const pos = extrude.attributes.position as THREE.BufferAttribute
    const A = 0.14
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const s = Math.sin(Math.PI * (x / L + 0.5))
      pos.setZ(i, z + A * s)
    }
    extrude.computeVertexNormals()

    // Low-poly bindings: base plate + two straps each
    const bindings: { base: THREE.CylinderGeometry; straps: THREE.TorusGeometry[]; offsetX: number }[] = []
    const baseGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 12)
    const strapGeom1 = new THREE.TorusGeometry(0.22, 0.03, 8, 16, Math.PI * 0.9)
    const strapGeom2 = new THREE.TorusGeometry(0.18, 0.025, 8, 16, Math.PI * 0.9)
    const x1 = -L * 0.5 + L * 0.42
    const x2 = -L * 0.5 + L * 0.58
    bindings.push({ base: baseGeom, straps: [strapGeom1, strapGeom2], offsetX: x1 })
    bindings.push({ base: baseGeom.clone(), straps: [strapGeom1.clone(), strapGeom2.clone()], offsetX: x2 })

    return { geom: extrude, bindings }
  }, [])

  return (
    <group ref={ref} {...props}>
      <mesh
        geometry={geom}
        rotation={[THREE.MathUtils.degToRad(-18), THREE.MathUtils.degToRad(12), THREE.MathUtils.degToRad(4)]}
        castShadow
        receiveShadow
        material={material}
      />
      {/* Bindings: simple base + two straps each, kept low-poly to respect tri budget */}
      {bindings.map((b, i) => (
        <group key={i} position={[b.offsetX, 0, 0.12]} rotation={[0, 0, i === 0 ? THREE.MathUtils.degToRad(-12) : THREE.MathUtils.degToRad(12)]}>
          <mesh geometry={b.base} rotation={[Math.PI / 2, 0, 0]} material={material} castShadow />
          <mesh geometry={b.straps[0]} rotation={[Math.PI / 2, 0, 0]} position={[0.02, 0.02, 0.08]} material={material} />
          <mesh geometry={b.straps[1]} rotation={[Math.PI / 2, 0, 0]} position={[-0.02, 0.02, 0.02]} material={material} />
        </group>
      ))}
    </group>
  )
})

export default Snowboard
