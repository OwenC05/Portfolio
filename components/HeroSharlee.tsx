import BlobField from './BlobField'

export default function HeroSharlee() {
  return (
    <section className="relative min-h-[92dvh] overflow-hidden bg-brand-bg">
      <BlobField />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.035]"
        style={{ backgroundImage: "url('/noise.png')" }}
      />
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.25em] text-slate-400">
          OWEN | DATA SCIENCE × SOFTWARE ENGINEER
        </p>

        <h1 className="font-display font-extrabold leading-[0.9] tracking-wide uppercase text-6xl sm:text-7xl md:text-8xl">
          <span className="block text-[#cfe0ff] text-glow">Analyze</span>
          <span className="block">
            <span className="stroke-1 text-brand-primary/90">Design</span>
            <span className="ml-3 text-[#cfe0ff] text-glow">Build</span>
          </span>
        </h1>

        <p className="mt-6 text-slate-300 max-w-2xl mx-auto font-body">
          I carve clean lines through messy data — analyze → design → build.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#projects"
            className="rounded-full px-6 py-3 bg-brand-primary text-slate-900 font-semibold shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="rounded-full px-6 py-3 bg-white/5 text-slate-200 ring-1 ring-white/15 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  )
}

