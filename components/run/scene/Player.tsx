'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRunStore } from '@/lib/runStore'
import { slope, runStations } from '@/lib/projects'
import { groundY, descentProgress, altitudeAt, zoneAt } from '@/lib/descent'
import {
  stepSteering,
  boardAngles,
  initSteerState,
  defaultSteerConfig,
  type SteerState,
} from '@/lib/steering'
import { playerState } from './playerState'
import { useSteeringInput } from '../useSteeringInput'

const RIDER_Y = 0.18 // board offset above the snow
const CAM_H = 4.4
const CAM_BACK = 8.5
const LOOK_AHEAD = 11

const damp = (a: number, b: number, decay: number, dt: number) =>
  b + (a - b) * Math.exp(-decay * dt)

export default function Player() {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const { steer } = useSteeringInput(true)

  const s = useRef<SteerState>(initSteerState())
  const lastEpoch = useRef(0)
  const telAcc = useRef(0)
  const camTarget = useMemo(() => new THREE.Vector3(), [])
  const lookNow = useMemo(() => new THREE.Vector3(0, 0, 12), [])
  const lookTo = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const st = useRunStore.getState()
    const dt = Math.min(delta, 0.05)
    if (st.epoch !== lastEpoch.current) {
      lastEpoch.current = st.epoch
      s.current = initSteerState()
    }
    const paused = st.activeStationId !== null
    const riding = st.phase === 'riding' && !paused
    playerState.riding = riding

    if (riding) {
      s.current = stepSteering(s.current, steer.current, dt, defaultSteerConfig)
      if (s.current.d >= slope.length) {
        s.current.d = slope.length
        if (st.phase !== 'finished') st.finish()
      }
    } else {
      s.current.vx *= Math.exp(-8 * dt) // settle when paused / pre-start
    }

    const cur = s.current
    const gy = groundY(cur.d)
    const ang = boardAngles(cur)

    // publish shared state
    playerState.d = cur.d
    playerState.x = cur.x
    playerState.vx = cur.vx
    playerState.speed = cur.speed
    playerState.yaw = ang.yaw
    playerState.roll = ang.roll
    playerState.pos.set(cur.x, gy + RIDER_Y, cur.d)
    playerState.contact.set(cur.x, gy + 0.06, cur.d)

    // rider mesh
    const g = group.current
    if (g) {
      g.position.copy(playerState.pos)
      g.rotation.y = ang.yaw
      g.rotation.z = ang.roll
    }

    // camera: damped follow + damped lookAt (no nausea)
    camTarget.set(cur.x * 0.5, gy + CAM_H, cur.d - CAM_BACK)
    camera.position.x = damp(camera.position.x, camTarget.x, 4, dt)
    camera.position.y = damp(camera.position.y, camTarget.y, 4, dt)
    camera.position.z = damp(camera.position.z, camTarget.z, 5, dt)
    lookTo.set(cur.x * 0.55, gy + 1.1, cur.d + LOOK_AHEAD)
    lookNow.x = damp(lookNow.x, lookTo.x, 6, dt)
    lookNow.y = damp(lookNow.y, lookTo.y, 6, dt)
    lookNow.z = damp(lookNow.z, lookTo.z, 6, dt)
    camera.lookAt(lookNow)

    // proximity → open a checkpoint as you carve up to a gate. Centre gates
    // (summit, lodge, lift) are unmissable; lane gates need you to steer over.
    if (riding) {
      for (const stn of runStations) {
        if (st.ridden.includes(stn.id)) continue
        const dz = stn.z - cur.d
        const centered = Math.abs(stn.x) < 0.5
        const xHit = centered || Math.abs(cur.x - stn.x) < 6.5
        if (dz < 5.5 && dz > -2.5 && xHit) {
          st.openStation(stn.id)
          st.markRidden(stn.id)
          break
        }
      }
    }

    // throttled telemetry (~10Hz) — never set React state every frame
    telAcc.current += dt
    if (telAcc.current >= 0.1) {
      telAcc.current = 0
      const p = descentProgress(cur.d)
      st.setTelemetry({ progress: p, altitude: altitudeAt(p), zone: zoneAt(p) })
    }
  })

  return (
    <group ref={group}>
      {/* board */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.34]} />
        <meshStandardMaterial color="#161d3a" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.24, 0.02, 0.36]} />
        <meshStandardMaterial color="#ffd27a" emissive="#ffd27a" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* feet */}
      {[-0.32, 0.32].map((fx) => (
        <mesh key={fx} position={[fx, 0.12, 0]}>
          <boxGeometry args={[0.16, 0.12, 0.2]} />
          <meshStandardMaterial color="#0f1530" roughness={0.6} />
        </mesh>
      ))}
      {/* legs + torso */}
      <mesh castShadow position={[0, 0.6, 0]} rotation={[0.14, 0, 0]}>
        <capsuleGeometry args={[0.19, 0.62, 6, 12]} />
        <meshStandardMaterial color="#33407a" roughness={0.65} />
      </mesh>
      {/* jacket accent */}
      <mesh position={[0, 0.86, 0.02]}>
        <capsuleGeometry args={[0.205, 0.16, 6, 12]} />
        <meshStandardMaterial color="#ff7aa8" emissive="#ff7aa8" emissiveIntensity={0.5} roughness={0.5} />
      </mesh>
      {/* head + beanie */}
      <mesh castShadow position={[0, 1.16, 0.02]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#e8d7c6" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.27, 0.02]}>
        <sphereGeometry args={[0.175, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#ffd27a" roughness={0.6} />
      </mesh>
    </group>
  )
}
