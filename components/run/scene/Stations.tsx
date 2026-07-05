'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { runStations, type RunStation } from '@/lib/projects'
import { gradeColor, scene as palette } from '@/lib/theme'
import { groundY } from '@/lib/descent'
import { useRunStore } from '@/lib/runStore'

const GRADE_GLYPH = { green: '●', blue: '■', black: '◆' } as const

function stationColor(s: RunStation): string {
  if (s.kind === 'lodge') return palette.stationActive
  if (s.kind === 'lift') return palette.trailCool
  return s.grade ? gradeColor[s.grade] : palette.stationIdle
}

function Station({
  s,
  active,
  ridden,
}: {
  s: RunStation
  active: boolean
  ridden: boolean
}) {
  const markerRef = useRef<THREE.Mesh>(null)
  const bannerRef = useRef<THREE.MeshStandardMaterial>(null)
  const color = stationColor(s)
  const y = groundY(s.z)

  useFrame((state) => {
    const m = markerRef.current
    if (m) {
      m.rotation.y = state.clock.elapsedTime * (active ? 1.6 : 0.6)
      m.position.y = 3.4 + Math.sin(state.clock.elapsedTime * 2 + s.z) * 0.12
    }
    if (bannerRef.current) {
      const target = active ? 2.6 : ridden ? 0.7 : 1.3
      bannerRef.current.emissiveIntensity +=
        (target - bannerRef.current.emissiveIntensity) * 0.1
    }
  })

  const onSelect = () => useRunStore.getState().openStation(s.id)

  return (
    <group position={[s.x, y, s.z]}>
      {/* posts */}
      {[-1.7, 1.7].map((px) => (
        <mesh key={px} position={[px, 1.4, 0]} castShadow onClick={onSelect}>
          <cylinderGeometry args={[0.07, 0.09, 2.8, 8]} />
          <meshStandardMaterial color="#cdd7f5" roughness={0.6} metalness={0.1} />
        </mesh>
      ))}

      {/* banner */}
      <mesh position={[0, 2.5, 0]} onClick={onSelect}>
        <planeGeometry args={[3.4, 0.7]} />
        <meshStandardMaterial
          ref={bannerRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.3}
          toneMapped={false}
          side={THREE.DoubleSide}
          roughness={0.5}
        />
      </mesh>

      {/* floating marker */}
      <mesh ref={markerRef} position={[0, 3.4, 0]}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 3 : 1.6}
          toneMapped={false}
        />
      </mesh>

      <Html position={[0, 4.3, 0]} center distanceFactor={18} pointerEvents="none">
        <div className="select-none whitespace-nowrap text-center">
          <div
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{ color, opacity: ridden ? 0.6 : 1 }}
          >
            {s.kind === 'project' && s.grade ? GRADE_GLYPH[s.grade] + '  ' : ''}
            {s.kind === 'lodge' ? '⌂  ' : s.kind === 'lift' ? '↟  ' : ''}
            {s.title.toUpperCase()}
          </div>
          <div className="mt-0.5 text-[11px] text-[var(--snow)]/80">{s.subtitle}</div>
        </div>
      </Html>
    </group>
  )
}

export default function Stations() {
  const activeId = useRunStore((st) => st.activeStationId)
  const ridden = useRunStore((st) => st.ridden)
  return (
    <group>
      {runStations.map((s) => (
        <Station key={s.id} s={s} active={activeId === s.id} ridden={ridden.includes(s.id)} />
      ))}
    </group>
  )
}
