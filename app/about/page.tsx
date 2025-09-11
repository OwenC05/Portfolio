import { Reveal } from '@/components/ui/Reveal'

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      <div className="grain-overlay" aria-hidden />

      <section className="mx-auto max-w-6xl px-6 pt-28 pb-12">
        <Reveal>
          <p className="eyebrow mb-4 text-[var(--muted)]">ABOUT</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display-2 font-extrabold tracking-[-0.01em] text-balance">
            Intentional systems, human interfaces.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[65ch] text-[17.5px] leading-relaxed text-[var(--muted)]">
            I’m Owen — CS & AI @ University of Bath with a placement in Fraud Analytics (LNRS).
            I care about clarity, craft, and making complex things feel simple.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Portrait */}
          <Reveal>
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)]/50 p-4 shadow-sm">
              <div
                aria-hidden
                className="aspect-[4/5] w-full rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[#0c1a30] to-[#13233a]"
              />
            </div>
          </Reveal>

          {/* Right Column */}
          <div className="md:col-span-2 grid grid-cols-1 gap-10">
            {/* Quick facts */}
            <Reveal>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)]/50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Quick facts</h2>
                <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]">
                  <li>• UK-based</li>
                  <li>• CS &amp; AI @ University of Bath</li>
                  <li>• Bath Snowsports · Snowboard enjoyer</li>
                  <li>• Custom keyboards (180 WPM)</li>
                  <li>• Espresso + data viz</li>
                  <li>• Curious about ML systems</li>
                </ul>
              </div>
            </Reveal>

            {/* Values */}
            <Reveal delay={0.05}>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)]/50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Values</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">Clarity</span>
                  <span className="chip">Empathy</span>
                  <span className="chip">Craft</span>
                </div>
              </div>
            </Reveal>

            {/* Experience timeline */}
            <Reveal>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)]/50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Experience</h2>
                <div className="mt-6 relative">
                  <div className="absolute left-[10px] top-0 h-full w-[1px] bg-[var(--line)]" />
                  <div className="space-y-6">
                    <article className="relative pl-10">
                      <span
                        aria-hidden
                        className="absolute left-[6px] top-[4px] h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
                      />
                      <p className="text-sm text-[var(--muted)]">Data Science · LexisNexis Risk · 2024–2025</p>
                      <h3 className="mt-1 text-[var(--ink)] font-medium">Fraud analytics and narrative dashboards</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Built ROC/KS reporting and Snowflake pipelines, packaging insights into
                        clear Streamlit narratives for product and ops.
                      </p>
                    </article>
                    <article className="relative pl-10">
                      <span
                        aria-hidden
                        className="absolute left-[6px] top-[4px] h-2.5 w-2.5 rounded-full bg-[var(--accent)]/70"
                      />
                      <p className="text-sm text-[var(--muted)]">Personal Projects · Ongoing</p>
                      <h3 className="mt-1 text-[var(--ink)] font-medium">Full‑stack interfaces & data stories</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Focused on clarity and polish across Next.js, TypeScript, and Python — shipping small, often.
                      </p>
                    </article>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Now */}
            <Reveal delay={0.05}>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--card)]/50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Now</h2>
                <p className="mt-3 text-[var(--ink)]">
                  Exploring data storytelling, refining snowboard‑themed projects, and pushing tactile UI details that reward attention.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}

