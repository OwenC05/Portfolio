"use client"

import BlobField from './BlobField'
import dynamic from 'next/dynamic'
import Headline from './hero/Headline'

const MountainBand = dynamic(() => import('./hero/MountainBand'), { ssr: false })

export default function HeroSharlee() {
  return (
    <section className="relative min-h-[92dvh] overflow-hidden bg-[var(--bg)] transition-colors">
      <BlobField />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.035]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-28 md:pb-32 text-center">
        <Headline />

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#projects"
            className="rounded-full px-6 py-3 bg-brand-primary text-slate-900 font-semibold shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="rounded-full px-6 py-3 text-[var(--ink)] ring-1 ring-[var(--line)] bg-[var(--ide-bg)] transition hover:bg-[var(--ide-chrome)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          >
            Get In Touch
          </a>
        </div>
      </div>
      {/* Mountain band pinned to bottom */}
      <div className="mountain-band pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[26vh] sm:h-[22vh] md:h-[28vh]">
        <MountainBand />
      </div>
    </section>
  )
}
