'use client'

import { useTheme } from 'next-themes'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useState } from 'react'

type Palette = {
  bg: string
  fog: string
  near: string
  far: string
}

const CANVAS_CLASS =
  'mountainMask pointer-events-none absolute inset-x-0 bottom-0 h-[30vh] md:h-[32vh] xl:h-[36vh]'

export default function MountainBand() {
  const { resolvedTheme } = useTheme()
  const [palette, setPalette] = useState<Palette>(() => readPalette())

  useEffect(() => {
    setPalette(readPalette())
  }, [resolvedTheme])

  return (
    <div className={CANVAS_CLASS}>
      <Canvas
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ position: [0, 9, 22], fov: 35 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene palette={palette} />
      </Canvas>
    </div>
  )
}

function Scene({ palette }: { palette: Palette }) {
  const { gl, scene, invalidate } = useThree()
  const geometry = useMemo(() => createTerrainGeometry(palette), [palette])

  useEffect(() => {
    const clear = new THREE.Color(palette.bg)
    gl.setClearColor(clear, 0)

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.set(palette.fog)
      scene.fog.near = 12
      scene.fog.far = 52
    } else {
      scene.fog = new THREE.Fog(palette.fog, 12, 52)
    }

    invalidate()
  }, [palette, gl, scene, invalidate])

  useEffect(() => {
    invalidate()
  }, [geometry, invalidate])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 5, 3]} intensity={1.2} />
      <fog attach="fog" args={[palette.fog, 12, 52]} />

      <mesh geometry={geometry} position={[0, -1.8, -4]}>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.9}
          metalness={0.08}
        />
      </mesh>
    </>
  )
}

function createTerrainGeometry(palette: Palette) {
  const geometry = new THREE.PlaneGeometry(36, 22, 180, 60)
  geometry.rotateX(-Math.PI / 2)

  const position = geometry.attributes.position as THREE.BufferAttribute
  const count = position.count
  const colors = new Float32Array(count * 3)

  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (let i = 0; i < count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    const height = ridgedNoise(x * 0.12, z * 0.18)
    position.setY(i, height)
    if (height < minY) minY = height
    if (height > maxY) maxY = height
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()

  const range = Math.max(0.0001, maxY - minY)
  const nearColor = new THREE.Color(palette.near)
  const farColor = new THREE.Color(palette.far)

  for (let i = 0; i < count; i++) {
    const height = position.getY(i)
    const t = (height - minY) / range
    const color = farColor
      .clone()
      .lerp(nearColor, Math.pow(t, 1.4))
      .convertSRGBToLinear()
    colors[i * 3 + 0] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

function ridgedNoise(x: number, y: number) {
  let amplitude = 0.55
  let frequency = 0.55
  let sum = 0

  for (let octave = 0; octave < 4; octave += 1) {
    const value = smoothNoise(x * frequency, y * frequency)
    const ridge = 1 - Math.abs(2 * value - 1)
    sum += ridge * amplitude
    frequency *= 2
    amplitude *= 0.5
  }

  return sum * sum * 5 - 2.2
}

function smoothNoise(x: number, y: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const xf = x - x0
  const yf = y - y0

  const n00 = randomNoise(x0, y0)
  const n10 = randomNoise(x0 + 1, y0)
  const n01 = randomNoise(x0, y0 + 1)
  const n11 = randomNoise(x0 + 1, y0 + 1)

  const u = fade(xf)
  const v = fade(yf)

  const nx0 = THREE.MathUtils.lerp(n00, n10, u)
  const nx1 = THREE.MathUtils.lerp(n01, n11, u)
  return THREE.MathUtils.lerp(nx0, nx1, v)
}

function randomNoise(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function fade(t: number) {
  return t * t * (3 - 2 * t)
}

function readPalette(): Palette {
  if (typeof window === 'undefined') {
    return {
      bg: '#f6f8fc',
      fog: '#e4ebf6',
      near: '#7f90ad',
      far: '#a9b9d3',
    }
  }
  const styles = getComputedStyle(document.documentElement)
  const read = (token: string, fallback: string) => {
    return styles.getPropertyValue(token).trim() || fallback
  }
  return {
    bg: read('--bg', '#0c1420'),
    fog: read('--fog', '#0d1724'),
    near: read('--terrainNear', '#354761'),
    far: read('--terrainFar', '#4e6180'),
  }
}
