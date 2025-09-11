"use client"

import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useTheme } from 'next-themes'
import { useReducedMotion } from 'framer-motion'

import Gondola from './icons/Gondola'
import Snowboard from './icons/Snowboard'
import Goggles from './icons/Goggles'
import Mountain from './icons/Mountain'
import Snowflake from './icons/Snowflake'

type IconProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
  baseColor: string
}

function useCursorParallax(disabled: boolean | null = false) {
  const target = useRef(new THREE.Vector2(0, 0))
  const eased = useRef(new THREE.Vector2(0, 0))

  useEffect(() => {
    if (disabled) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      target.current.set(x, y)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [disabled])

  // Springy easing
  useFrame((_, dt) => {
    if (disabled) return
    eased.current.lerp(target.current, 1 - Math.pow(0.0001, dt))
  })

  return eased
}

function CameraRig({ disabled = false }: { disabled?: boolean }) {
  const { camera } = useThree()
  const mouse = useCursorParallax(disabled)
  useFrame(() => {
    if (disabled) return
    const strength = 0.6
    const targetPos = new THREE.Vector3(mouse.current.x * strength, -mouse.current.y * strength, camera.position.z)
    camera.position.lerp(targetPos, 0.05)
    camera.lookAt(0, 0, -4)
  })
  return null
}

function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const [colors, setColors] = useState({ base: '#0f1627', highlight: '#1b2438' })
  useEffect(() => {
    const style = getComputedStyle(document.documentElement)
    const next = {
      base: style.getPropertyValue('--three-base').trim() || '#0f1627',
      highlight: style.getPropertyValue('--three-highlight').trim() || '#1b2438',
    }
    setColors(next)
  }, [resolvedTheme])
  return colors
}

function Icons({ baseColor }: { baseColor: string }) {
  // Predefined positions to avoid overlapping hero copy
  const nodes = useMemo(
    () => [
      { p: [-3.5, 1.0, -5.5] as [number, number, number], r: [0.1, 0.4, 0] as [number, number, number] },
      { p: [3.0, 1.2, -6.5] as [number, number, number], r: [0.0, -0.5, 0] as [number, number, number] },
      { p: [-1.2, -0.2, -7.0] as [number, number, number], r: [0.2, 0.2, 0] as [number, number, number] },
      { p: [1.8, -1.0, -4.5] as [number, number, number], r: [0.1, -0.2, 0] as [number, number, number] },
      { p: [-4.0, -1.2, -6.8] as [number, number, number], r: [0, 0.3, 0] as [number, number, number] },
      { p: [4.2, -0.6, -5.2] as [number, number, number], r: [0, -0.2, 0] as [number, number, number] },
    ],
    []
  )

  const reduced = useReducedMotion()
  const mouse = useCursorParallax(!!reduced)

  return (
    <group>
      {nodes.map((n, i) => (
        <Floating key={i} position={n.p} rotation={n.r} mouse={mouse} reduced={!!reduced}>
          {i === 0 && <Gondola color={baseColor} scale={1.2} />}
          {i === 1 && <Snowboard color={baseColor} scale={1.25} />}
          {i === 2 && <Goggles color={baseColor} scale={1.2} />}
          {i === 3 && <Mountain color={baseColor} scale={1.1} />}
          {i === 4 && <Snowflake color={baseColor} scale={1.1} />}
          {i === 5 && <Snowflake color={baseColor} scale={0.9} />}
        </Floating>
      ))}
    </group>
  )
}

function Floating({ children, position, rotation = [0, 0, 0], mouse, reduced }: {
  children: React.ReactNode
  position: [number, number, number]
  rotation?: [number, number, number]
  mouse: React.MutableRefObject<THREE.Vector2>
  reduced: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(Math.random() * Math.PI * 2)
  const speed = 0.4 + Math.random() * 0.4
  const amp = 0.2 + Math.random() * 0.25
  useFrame((_, dt) => {
    if (!ref.current) return
    if (reduced) return
    t.current += dt * speed
    const [x0, y0, z0] = position
    ref.current.position.x += ((x0 + mouse.current.x * 0.6) - ref.current.position.x) * 0.02
    ref.current.position.y = y0 + Math.sin(t.current) * amp + (-mouse.current.y * 0.3)
    ref.current.position.z = z0
    ref.current.rotation.y += 0.002
  })
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  )
}

export default function HeroScene() {
  const reduced = useReducedMotion()
  const { base, highlight } = useThemeColors()

  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      camera={{ fov: 45, position: [0, 0, 8] }}
    >
      <color attach="background" args={["transparent"]} />
      {/* Lighting */}
      <hemisphereLight args={[0xbfd8ff, 0xffe0b4, 0.6]} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <Icons baseColor={base} />
        </group>
        <Environment preset="city" />
      </Suspense>

      {!reduced && (
        <EffectComposer>
          <Bloom intensity={0.15} luminanceThreshold={0.2} luminanceSmoothing={0.3} />
          <Vignette eskil={false} offset={0.2} darkness={0.3} />
        </EffectComposer>
      )}

      <CameraRig disabled={!!reduced} />
    </Canvas>
  )
}
