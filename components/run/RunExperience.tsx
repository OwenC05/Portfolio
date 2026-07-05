'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRunStore } from '@/lib/runStore'
import { site } from '@/lib/content'
import HudOverlay from './overlay/HudOverlay'
import ProjectPanel from './overlay/ProjectPanel'
import RunStage from './overlay/RunStage'
import TrailMap from './fallback/TrailMap'

// First paint: a CSS sky that matches the WebGL one, so there's never a white
// flash while the canvas chunk loads.
function RunLoading() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'radial-gradient(120% 90% at 50% 8%, #ff7aa8 0%, #3f5fa8 34%, #1b2350 70%, #0b0f24 100%)' }}
    >
      <div className="text-center">
        <div className="font-display text-2xl font-semibold tracking-tight text-[#eaf0ff]">
          {site.name}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.28em] text-[#eaf0ff]/70">
          PREPARING THE RUN…
        </div>
      </div>
    </div>
  )
}

const RunCanvas = dynamic(() => import('./RunCanvas'), {
  ssr: false,
  loading: () => <RunLoading />,
})

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function RunExperience() {
  const [mode, setMode] = useState<'loading' | 'canvas' | 'fallback'>('loading')

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    useRunStore.getState().setReducedMotion(reduce)
    setMode(reduce || !hasWebGL() ? 'fallback' : 'canvas')
  }, [])

  if (mode === 'fallback') return <TrailMap />
  if (mode === 'loading') return <RunLoading />

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--bg)]" style={{ touchAction: 'none' }}>
      <RunCanvas />
      <HudOverlay />
      <ProjectPanel />
      <RunStage />
    </div>
  )
}
