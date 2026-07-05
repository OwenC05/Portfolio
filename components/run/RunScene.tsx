'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import SkyDome from './scene/SkyDome'
import Terrain from './scene/Terrain'
import Snow from './scene/Snow'
import Stations from './scene/Stations'
import Player from './scene/Player'
import CarveTrail from './scene/CarveTrail'
import { playerState } from './scene/playerState'
import { scene as palette } from '@/lib/theme'

// A soft blob shadow that tracks the rider (cheaper + cleaner than real-time
// shadow maps over a 130-unit slope).
function ContactBlob() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const m = ref.current
    if (!m) return
    m.position.set(
      playerState.contact.x,
      playerState.contact.y + 0.03,
      playerState.contact.z,
    )
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.95, 24]} />
      <meshBasicMaterial color="#0a0e22" transparent opacity={0.3} depthWrite={false} />
    </mesh>
  )
}

export default function RunScene() {
  return (
    <>
      <color attach="background" args={[palette.fog]} />
      <fogExp2 attach="fog" args={[palette.fog, 0.0135]} />

      <hemisphereLight args={['#3a3a6a', '#1b2350', 0.5]} />
      <ambientLight intensity={0.3} color="#6f86c9" />
      <directionalLight position={[-14, 18, -6]} intensity={1.4} color={palette.keyLight} />
      <directionalLight position={[12, 8, 16]} intensity={0.35} color={palette.fillLight} />

      <SkyDome />
      <Terrain />
      <Snow />
      <Stations />
      <CarveTrail />
      <ContactBlob />
      <Player />
    </>
  )
}
