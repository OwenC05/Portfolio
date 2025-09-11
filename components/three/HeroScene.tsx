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

type ThemeColors = {
  base: THREE.Color
  highlight: THREE.Color
  shadow: THREE.Color
  sky: THREE.Color
  sun: THREE.Color
  fog: THREE.Color
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
    const strength = 0.4 // cap to ±0.4 so it never crosses text column
    const tx = THREE.MathUtils.clamp(mouse.current.x, -1, 1) * strength
    const ty = THREE.MathUtils.clamp(-mouse.current.y, -1, 1) * strength
    const targetPos = new THREE.Vector3(tx, ty, camera.position.z)
    camera.position.lerp(targetPos, 0.05)
    camera.lookAt(0, 0, -4)
  })
  return null
}

function useThemeColors(): ThemeColors {
  const fallback: ThemeColors = {
    base: new THREE.Color('#0f1627'),
    highlight: new THREE.Color('#1b2438'),
    shadow: new THREE.Color('#0a0f1c'),
    sky: new THREE.Color('#0d1324'),
    sun: new THREE.Color('#dfe7ff'),
    fog: new THREE.Color('#0b1220'),
  }
  const [colors, setColors] = useState<ThemeColors>(fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const get = (): ThemeColors => {
      const s = getComputedStyle(document.documentElement)
      const pick = (v: string) => new THREE.Color((s.getPropertyValue(v) || '').trim() || '#000')
      return {
        base: pick('--three-base'),
        highlight: pick('--three-highlight'),
        shadow: pick('--three-shadow'),
        sky: pick('--three-sky'),
        sun: pick('--three-sun'),
        fog: pick('--three-fog'),
      }
    }
    setColors(get())
    const ro = new MutationObserver(() => setColors(get()))
    ro.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => ro.disconnect()
  }, [])
  return colors
}

function Icons({
  baseColor,
  roughness,
  metalness,
  clearcoat,
  clearcoatRoughness,
  compact,
}: {
  baseColor: string
  roughness: number
  metalness: number
  clearcoat: number
  clearcoatRoughness: number
  compact?: boolean
}) {
  // Predefined positions to avoid overlapping hero copy
  const nodes = useMemo(
    () => [
      // right-side bounding box; values tuned to stay in right column
      { p: [0.4, 0.9, -5.5] as [number, number, number], r: [0.1, 0.4, 0] as [number, number, number] },
      { p: [1.6, 1.0, -6.2] as [number, number, number], r: [0.0, -0.5, 0] as [number, number, number] },
      { p: [0.9, -0.1, -6.8] as [number, number, number], r: [0.2, 0.2, 0] as [number, number, number] },
      { p: [2.1, -0.8, -4.8] as [number, number, number], r: [0.1, -0.2, 0] as [number, number, number] },
      { p: [0.5, -1.0, -6.5] as [number, number, number], r: [0, 0.3, 0] as [number, number, number] },
      { p: [2.3, -0.6, -5.2] as [number, number, number], r: [0, -0.2, 0] as [number, number, number] },
    ],
    []
  )

  const reduced = useReducedMotion()
  const mouse = useCursorParallax(!!reduced || !!compact)

  return (
    <group>
      {nodes.map((n, i) => (
        <Floating key={i} position={n.p} rotation={n.r} mouse={mouse} reduced={!!reduced}>
          {i === 0 && (
            <Gondola color={baseColor} scale={1.1} {...{}} />
          )}
          {i === 1 && (
            <Snowboard color={baseColor} scale={1.2} {...{}} />
          )}
          {i === 2 && (
            <Goggles color={baseColor} scale={1.1} {...{}} />
          )}
          {i === 3 && <Mountain color={baseColor} scale={1.05} />}
          {i === 4 && <Snowflake color={baseColor} scale={1.0} />}
          {i === 5 && <Snowflake color={baseColor} scale={0.88} />}
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
  useFrame(({ camera }, dt) => {
    if (!ref.current) return
    if (reduced) return
    t.current += dt * speed
    const [x0, y0, z0] = position
    // Compute safe bounds based on camera frustum at mean distance
    const meanZ = Math.abs(z0)
    const persp = camera as THREE.PerspectiveCamera
    const vFOV = (persp.fov * Math.PI) / 180
    const height = 2 * Math.tan(vFOV / 2) * meanZ
    const width = height * persp.aspect
    const SAFE_X = width * 0.42
    const SAFE_Y = height * 0.35
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

    const targetX = clamp(x0 + mouse.current.x * 0.6, -SAFE_X * 0.1, SAFE_X)
    const targetY = clamp(y0 + Math.sin(t.current) * amp + (-mouse.current.y * 0.3), -SAFE_Y, SAFE_Y)

    ref.current.position.x += (targetX - ref.current.position.x) * 0.02
    ref.current.position.y = targetY
    ref.current.position.z = -meanZ
    ref.current.rotation.y += 0.002
  })
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  )
}

export default function HeroScene({ compact = false }: { compact?: boolean }) {
  const reduced = useReducedMotion()
  const { resolvedTheme } = useTheme()
  const colors = useThemeColors()
  const isDark = resolvedTheme === 'dark'

  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 45, position: [0, 0, 8] }}
    >
      {/* Scene background and fog driven by theme tokens */}
      <Setter colors={colors} isDark={isDark} />

      {/* Lighting (theme-synced) */}
      <hemisphereLight args={[colors.sky, colors.shadow, 0.6]} />
      <directionalLight color={colors.sun} position={[5, 6, 4]} intensity={isDark ? 1.1 : 0.9} castShadow />

      <Suspense fallback={null}>
        <IconColumn compact={compact} colors={colors} isDark={isDark} />
        <Environment preset="city" />
      </Suspense>

      {!reduced && (
        <EffectComposer>
          <Bloom intensity={isDark ? 0.15 : 0.08} luminanceThreshold={0.24} luminanceSmoothing={0.35} />
          <Vignette eskil={false} offset={0.25} darkness={isDark ? 0.22 : 0.12} />
        </EffectComposer>
      )}

      <CameraRig disabled={!!reduced} />
    </Canvas>
  )
}

function Setter({ colors, isDark }: { colors: ThemeColors; isDark: boolean }) {
  const { scene, invalidate } = useThree()
  useEffect(() => {
    // Keep canvas transparent so underlying DOM background shows; only fog colors the depth
    scene.background = null
    scene.fog = new THREE.Fog(colors.fog.getHex(), 6, 22)
    invalidate()
  }, [colors, isDark, scene, invalidate])
  return null
}

function IconColumn({ compact, colors, isDark }: { compact: boolean; colors: ThemeColors; isDark: boolean }) {
  const { camera } = useThree()
  const persp = camera as THREE.PerspectiveCamera
  const meanZ = 6
  const vFOV = (persp.fov * Math.PI) / 180
  const height = 2 * Math.tan(vFOV / 2) * meanZ
  const width = height * persp.aspect
  const groupX = compact ? width * 0.18 : width * 0.25
  const groupY = compact ? 0.4 : 0.1
  return (
    <group position={[groupX, groupY, -meanZ]} scale={compact ? 0.75 : 1}>
      <Icons
        baseColor={colors.base.getStyle()}
        roughness={isDark ? 0.35 : 0.5}
        metalness={isDark ? 0.1 : 0.05}
        clearcoat={isDark ? 1 : 0.8}
        clearcoatRoughness={0.25}
        compact={compact}
      />
    </group>
  )
}
