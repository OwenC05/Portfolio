export default function Headline() {
  return (
    <div className="text-center">
      <p className="mb-6 text-xs uppercase tracking-[0.25em] text-[var(--muted)] font-body">
        OWEN | DATA SCIENCE &times; SOFTWARE ENGINEER
      </p>

      <h1 className="font-display font-extrabold leading-[0.9] tracking-wide uppercase text-6xl sm:text-7xl md:text-8xl">
        <span className="block text-[var(--headline-fill)] text-glow">Analyze</span>
        <span className="block">
          <span className="stroke-1 text-brand-primary/90">Design</span>
          <span className="ml-3 text-[var(--headline-fill)] text-glow">Build</span>
        </span>
      </h1>

      <p className="mt-6 text-[var(--muted)] max-w-2xl mx-auto font-body">
        I carve lines through messy data
      </p>
    </div>
  )
}
