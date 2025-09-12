"use client"

import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useTheme } from 'next-themes'

type Variant = 'base' | 'highlight'

function readCssColor(varName: string, fallback: string) {
  if (typeof window === 'undefined') return new THREE.Color(fallback)
  const s = getComputedStyle(document.documentElement)
  const v = (s.getPropertyValue(varName) || '').trim()
  try {
    return new THREE.Color(v || fallback)
  } catch {
    return new THREE.Color(fallback)
  }
}

/**
 * MeshPhysicalMaterial factory synced to CSS variables + theme.
 * - color: --three-base (variant 'base') or --three-highlight (variant 'highlight')
 * - sheenColor: --three-highlight
 * - roughness: dark -> 0.35, light -> 0.5
 * - metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.25, envMapIntensity: 0.9
 */
export function useIconMaterial(variant: Variant = 'base') {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const material = useMemo(() => {
    const base = readCssColor('--three-base', isDark ? '#0f1627' : '#f3f6fb')
    const highlight = readCssColor('--three-highlight', isDark ? '#1b2438' : '#e6edf7')
    const mat = new THREE.MeshPhysicalMaterial({
      color: variant === 'base' ? base : highlight,
      roughness: isDark ? 0.35 : 0.5,
      metalness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.25,
      sheen: 0.25,
      sheenColor: highlight,
      envMapIntensity: 0.9,
    })
    mat.needsUpdate = true
    return mat
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, variant])

  // Update on theme class changes as well (next-themes may toggle a class)
  const roRef = useRef<MutationObserver | null>(null)
  useEffect(() => {
    const updateFromCss = () => {
      const isDarkNow = document.documentElement.classList.contains('dark') || resolvedTheme === 'dark'
      const base = readCssColor('--three-base', isDarkNow ? '#0f1627' : '#f3f6fb')
      const highlight = readCssColor('--three-highlight', isDarkNow ? '#1b2438' : '#e6edf7')
      material.color.set(variant === 'base' ? base : highlight)
      // sheenColor is a Color but three stores it as Vector3 internally
      ;(material as any).sheenColor?.set?.(highlight)
      material.roughness = isDarkNow ? 0.35 : 0.5
      material.needsUpdate = true
    }
    updateFromCss()
    const ro = new MutationObserver(() => updateFromCss())
    ro.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    roRef.current = ro
    return () => ro.disconnect()
  }, [material, resolvedTheme, variant])

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  return material
}

