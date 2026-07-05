'use client'

import { useRunStore } from '@/lib/runStore'

// Signature (b, cont.): an instrument readout in mono that the descent drives in
// real time. Isolated so only this subtree re-renders on the ~10Hz telemetry.
export default function Telemetry() {
  const altitude = useRunStore((s) => s.altitude)
  const zone = useRunStore((s) => s.zone)
  const progress = useRunStore((s) => s.progress)
  const pct = Math.round(progress * 100)

  return (
    <div className="pointer-events-none select-none font-mono text-[var(--snow)]">
      <div className="flex items-end gap-5">
        <div>
          <div className="text-[10px] tracking-[0.25em] text-[var(--muted)]">ALT</div>
          <div className="text-lg leading-none tabular-nums">
            {altitude.toLocaleString()}
            <span className="ml-1 text-[11px] text-[var(--muted)]">m</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] tracking-[0.25em] text-[var(--muted)]">RUN</div>
          <div className="text-lg leading-none tabular-nums">
            {pct}
            <span className="ml-0.5 text-[11px] text-[var(--muted)]">%</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] tracking-[0.25em] text-[var(--muted)]">ZONE</div>
          <div className="text-lg leading-none tracking-[0.12em] text-[var(--accent)]">
            {zone}
          </div>
        </div>
      </div>
      {/* altitude / descent bar */}
      <div className="mt-2 h-[3px] w-44 overflow-hidden rounded-full bg-[var(--snow)]/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-pink)] to-[var(--accent)] transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
