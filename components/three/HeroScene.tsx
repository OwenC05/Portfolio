"use client"

import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useTheme } from 'next-themes'
import { useReducedMotion } from 'framer-motion'

import Snowboard from './icons/Snowboard'
import Mountain from './icons/Mountain'
import Chairlift from './icons/Chairlift'
import Snowflakes from './icons/Snowflakes'
import { useIconMaterial } from './iconMaterial'

type ThemeColors = {
  base: THREE.Color
  highlight: THREE.Color
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
    const strength = 0.25
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

type SafeRect = { cx: number; cy: number; z: number; hw: number; hh: number }

function Icons({ baseMat, capMat, compact, rect }: { baseMat: THREE.Material; capMat: THREE.Material; compact?: boolean; rect: SafeRect }) {
  const reduced = useReducedMotion()
  const mouse = useCursorParallax(!!reduced || !!compact)
  const { cx, cy, z, hw, hh } = rect
  const scaleMul = compact ? 0.85 : 1

  return (
    <group>
      {/* Snowboard — front-left */}
      <Floating position={[cx + (-0.72) * hw, cy + (-0.22) * hh, z + 0.15]} rotation={[0.05, 0.25, 0]} mouse={mouse} reduced={!!reduced} rect={rect}>
        <Snowboard material={baseMat} scale={0.45 * scaleMul} />
      </Floating>

      {/* Mountain — back-right, slightly farther back */}
      <Floating position={[cx + (0.68) * hw, cy + (-0.42) * hh, z - 0.65]} rotation={[0.1, -0.25, 0]} mouse={mouse} reduced={!!reduced} rect={rect}>
        <Mountain material={baseMat} capMaterial={capMat} scale={1.6 * scaleMul} />
      </Floating>

      {/* Chairlift — upper area */}
      <Floating position={[cx + (0.15) * hw, cy + (0.50) * hh, z + 0.35]} rotation={[0.04, -0.08, 0]} mouse={mouse} reduced={!!reduced} rect={rect}>
        <Chairlift material={baseMat} scale={1.1 * scaleMul} showCable={false} />
      </Floating>

      {/* Cable across top of rect */}
      <Cable material={baseMat} from={[cx + (-0.60) * hw, cy + (0.52) * hh, z]} to={[cx + (0.72) * hw, cy + (0.52) * hh, z]} />

      {/* Instanced flakes across rect */}
      <Snowflakes material={baseMat} count={80} scaleRange={[0.09, 0.18]} rect={rect} />
    </group>
  )
}

export default function HeroScene({ compact = false }: { compact?: boolean }) {
  const reduced = useReducedMotion()
  const { resolvedTheme } = useTheme()
  const colors = useThemeColors()
  const isDark = resolvedTheme === 'dark'
  const baseMat = useIconMaterial('base')
  const capMat = useIconMaterial('highlight')

  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 45, position: [0, 0, 8] }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Scene background and fog driven by theme tokens */}
      <Setter colors={colors} isDark={isDark} />

      {/* Lighting (theme-synced): warm key, cool rim, hemisphere */}
      <hemisphereLight args={[colors.base, colors.highlight, 0.65]} />
      <directionalLight color={new THREE.Color(isDark ? '#ffd9a8' : '#ffcf99')} position={[4, 5, 3]} intensity={isDark ? 1.0 : 0.85} castShadow />
      <directionalLight color={new THREE.Color(isDark ? '#9bc3ff' : '#8ab6ff')} position={[-3, 2, -4]} intensity={isDark ? 0.55 : 0.45} />

      <Suspense fallback={null}>
        <IconColumn compact={compact} colors={colors} isDark={isDark} mats={{ base: baseMat, cap: capMat }} />
        <Environment preset="city" />
      </Suspense>

      {!reduced && (
        <EffectComposer>
          <Bloom intensity={isDark ? 0.15 : 0.08} luminanceThreshold={0.24} luminanceSmoothing={0.35} />
          <Vignette eskil={false} offset={0.25} darkness={isDark ? 0.22 : 0.12} />
        </EffectComposer>
      )}

      {/* Parallax handled in-object; keep camera static */}
      <CameraRig disabled={true} />
    </Canvas>
  )
}

function Setter({ colors, isDark }: { colors: ThemeColors; isDark: boolean }) {
  const { scene, invalidate } = useThree()
  useEffect(() => {
    // Keep canvas transparent so underlying DOM background shows; only fog colors the depth
    scene.background = null
    const fogColor = colors.fog || new THREE.Color(isDark ? '#0b1220' : '#eef2f7')
    scene.fog = new THREE.Fog(fogColor.getHex(), 6, 22)
    invalidate()
  }, [colors, isDark, scene, invalidate])
  return null
}

function IconColumn({ compact, colors, isDark, mats }: { compact: boolean; colors: ThemeColors; isDark: boolean; mats: { base: THREE.Material; cap: THREE.Material } }) {
  const { camera } = useThree()
  const persp = camera as THREE.PerspectiveCamera
  const meanZ = 6
  const vFOV = (persp.fov * Math.PI) / 180
  const height = 2 * Math.tan(vFOV / 2) * meanZ
  const width = height * persp.aspect

  const vw = (typeof window !== 'undefined' ? window.innerWidth : 1280)
  const isDesktop = vw >= 1280 && !compact
  const isTablet = vw >= 768 && vw < 1280 && !compact
  const isMobile = vw < 768 || compact

  const rectWidthPct = isDesktop ? 0.52 : isTablet ? 0.48 : 0.46
  const rectHeightPct = isDesktop ? 0.70 : isTablet ? 0.62 : 0.55
  const rectCenterXPct = isDesktop ? 0.20 : isTablet ? 0.18 : 0.16
  const rectCenterYPct = -0.02

  const rect: SafeRect = {
    cx: rectCenterXPct * width,
    cy: rectCenterYPct * height,
    z: -meanZ,
    hw: (rectWidthPct * width) / 2,
    hh: (rectHeightPct * height) / 2,
  }

  return (
    <group position={[0, 0, rect.z]}>
      <Icons baseMat={mats.base} capMat={mats.cap} compact={isMobile || isTablet} rect={rect} />
    </group>
  )
}

function Cable({ material, from, to }: { material: THREE.Material; from: [number, number, number]; to: [number, number, number] }) {
  const dir = useMemo(() => new THREE.Vector3(to[0]-from[0], to[1]-from[1], to[2]-from[2]), [from, to])
  const len = useMemo(() => dir.length(), [dir])
  const mid = useMemo(() => new THREE.Vector3((from[0]+to[0])/2, (from[1]+to[1])/2, (from[2]+to[2])/2), [from, to])
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize()), [dir])
  return (
    <mesh position={mid} quaternion={q} material={material}>
      <cylinderGeometry args={[0.02, 0.02, len, 8]} />
    </mesh>
  )
}

function Floating({ children, position, rotation = [0, 0, 0], mouse, reduced, rect }: {
  children: React.ReactNode
  position: [number, number, number]
  rotation?: [number, number, number]
  mouse: React.MutableRefObject<THREE.Vector2>
  reduced: boolean
  rect: SafeRect
}) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(Math.random() * Math.PI * 2)
  const speed = 0.2 + Math.random() * 0.2
  const amp = 0.08 + Math.random() * 0.04 // <= 0.12
  useFrame(() => {
    if (!ref.current) return
    if (reduced) return
    t.current += 0.016 * speed
    const [x0, y0, z0] = position
    const { cx, cy, hw, hh } = rect
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
    // Cluster parallax limited to 35% of rect half-extent
    const px = THREE.MathUtils.clamp(mouse.current.x, -1, 1) * hw * 0.35
    const py = THREE.MathUtils.clamp(-mouse.current.y, -1, 1) * hh * 0.35
    const floatY = Math.sin(t.current) * amp

    let targetX = x0 + px
    let targetY = y0 + py + floatY
    // Clamp to safe rect bounds
    targetX = clamp(targetX, cx - hw, cx + hw)
    targetY = clamp(targetY, cy - hh, cy + hh)

    ref.current.position.x += (targetX - ref.current.position.x) * 0.08
    ref.current.position.y += (targetY - ref.current.position.y) * 0.1
    ref.current.position.z = z0
    // Slow spin <= 0.003 rad/frame
    ref.current.rotation.y += 0.002
  })
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  )
}
