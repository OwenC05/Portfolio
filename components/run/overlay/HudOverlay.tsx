'use client'

import Link from 'next/link'
import { useRunStore } from '@/lib/runStore'
import { site } from '@/lib/content'
import Telemetry from './Telemetry'

export default function HudOverlay() {
  const phase = useRunStore((s) => s.phase)
  const activeStation = useRunStore((s) => s.activeStationId)
  const progress = useRunStore((s) => s.progress)
  const showHint = phase === 'riding' && !activeStation && progress < 0.14

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* logotype */}
      <div className="absolute left-5 top-5 sm:left-8 sm:top-7">
        <Link
          href="/"
          className="pointer-events-auto font-display text-sm font-semibold tracking-[0.04em] text-[var(--ink)]"
        >
          {site.name}
        </Link>
        <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--muted)]">
          {site.coords}
        </div>
      </div>

      {/* nav */}
      <nav className="pointer-events-auto absolute right-5 top-6 flex items-center gap-4 font-mono text-[11px] tracking-[0.18em] text-[var(--muted)] sm:right-8 sm:top-8">
        <Link href="/projects" className="transition hover:text-[var(--ink)]">
          TRAIL MAP
        </Link>
        <Link href="/about" className="transition hover:text-[var(--ink)]">
          ABOUT
        </Link>
      </nav>

      {/* telemetry */}
      {phase !== 'intro' && (
        <div className="absolute bottom-6 left-5 sm:bottom-8 sm:left-8">
          <Telemetry />
        </div>
      )}

      {/* controls hint */}
      {showHint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 font-mono text-[11px] tracking-[0.12em] text-[var(--muted)] backdrop-blur">
          ← → / drag to carve · ride into a gate
        </div>
      )}
    </div>
  )
}
