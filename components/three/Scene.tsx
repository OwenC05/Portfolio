"use client"

import * as THREE from 'three'
import { Suspense, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useProjectsStore } from '@/lib/projectsStore'
import { projectTree } from '@/app/projects/data'
import { layoutBinarySlope } from '@/lib/tree'
import TreeNodes from './TreeNodes'
import Edges from './Edges'
import Player from './Player'
import Chairlift from './Chairlift'
import Snow from './Snow'

export default function Scene() {
  const setLayout = useProjectsStore((s) => s.setLayout)
  const setCurrent = useProjectsStore((s) => s.setCurrent)

  useEffect(() => {
    // Compute layout once on mount
    const layout = layoutBinarySlope(projectTree)
    setLayout(layout)
    setCurrent(projectTree.id)
  }, [setLayout, setCurrent])

  return (
    <>
      <color attach="background" args={["#e6f3ff"]} />
      <fog attach="fog" args={["#e6f3ff", 10, 80]} />

      {/* Lights */}
      <hemisphereLight args={[0xffffff, 0x88aaff, 0.4]} />
      <directionalLight position={[10, 15, 8]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      {/* Snow slope plane (tilted) */}
      <mesh rotation={[-THREE.MathUtils.degToRad(25), 0, 0]} position={[0, -0.5, 15]} receiveShadow>
        <planeGeometry args={[120, 120, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Parallax low-poly mountains backdrop */}
      <group position={[0, -2, -30]}>
        <mesh rotation={[-0.2, 0, 0]}>
          <coneGeometry args={[30, 20, 6]} />
          <meshStandardMaterial color="#cfd8e3" />
        </mesh>
        <mesh position={[-20, 0, -5]} rotation={[-0.2, 0, 0]}>
          <coneGeometry args={[22, 18, 6]} />
          <meshStandardMaterial color="#dfe7ef" />
        </mesh>
      </group>

      <Physics gravity={[0, -9.81, 0]}> 
        <Suspense fallback={<Html center>Loading…</Html>}>
          <Edges />
          <TreeNodes />
          <Player />
          <Chairlift />
        </Suspense>
      </Physics>

      <Snow />

      {/* Controls for debugging only; comment out for production */}
      {/* <OrbitControls makeDefault /> */}
    </>
  )
}
