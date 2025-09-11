"use client"

import { create } from 'zustand'
import * as THREE from 'three'

type Mode = 'idle' | 'ride' | 'lift' | 'zoom'

export type LayoutMaps = {
  nodeWorldPos: Record<string, THREE.Vector3>
  edgeCurves: Record<string, THREE.CatmullRomCurve3>
}

type ProjectsState = {
  currentId: string | null
  targetId: string | null
  mode: Mode
  reducedMotion: boolean
  layout: LayoutMaps | null
  setCurrent: (id: string) => void
  setTarget: (id: string | null, mode?: Mode) => void
  setReducedMotion: (v: boolean) => void
  setLayout: (layout: LayoutMaps) => void
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  currentId: null,
  targetId: null,
  mode: 'idle',
  reducedMotion: false,
  layout: null,
  setCurrent: (id) => set({ currentId: id }),
  setTarget: (id, mode = 'ride') => set({ targetId: id, mode: id ? mode : 'idle' }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setLayout: (layout) => set({ layout }),
}))
