// Run state — deliberately small. The hot per-frame values (position, etc.)
// live in refs inside the scene; only throttled, render-worthy state lands here.
// zustand v5: use single-value selectors, or useShallow for object selectors,
// to avoid the strict-equality re-render loop.

import { create } from 'zustand'
import type { Zone } from './theme'

export type RunPhase = 'intro' | 'riding' | 'finished'

type RunState = {
  phase: RunPhase
  epoch: number // bumped on restart so the scene can reset its refs
  reducedMotion: boolean
  lowPower: boolean // drop bloom / heavy effects on weak GPUs
  activeStationId: string | null // which checkpoint panel is open
  ridden: string[] // gates we've passed — drives persistent carve memory
  // Throttled telemetry (committed ~10Hz from the Player, never per-frame).
  progress: number // 0..1 down the run
  altitude: number // metres
  zone: Zone

  start: () => void
  finish: () => void
  reset: () => void
  setReducedMotion: (v: boolean) => void
  setLowPower: (v: boolean) => void
  openStation: (id: string | null) => void
  markRidden: (id: string) => void
  setTelemetry: (t: { progress: number; altitude: number; zone: Zone }) => void
}

export const useRunStore = create<RunState>((set) => ({
  phase: 'intro',
  epoch: 0,
  reducedMotion: false,
  lowPower: false,
  activeStationId: null,
  ridden: [],
  progress: 0,
  altitude: 2480,
  zone: 'SUMMIT',

  start: () => set({ phase: 'riding' }),
  finish: () => set({ phase: 'finished' }),
  reset: () =>
    set((s) => ({
      epoch: s.epoch + 1,
      phase: 'riding',
      activeStationId: null,
      ridden: [],
      progress: 0,
    })),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setLowPower: (v) => set({ lowPower: v }),
  openStation: (id) => set({ activeStationId: id }),
  markRidden: (id) =>
    set((s) => (s.ridden.includes(id) ? s : { ridden: [...s.ridden, id] })),
  setTelemetry: (t) => set(t),
}))
