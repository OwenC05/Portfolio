// install: npm i framer-motion
import Hero from '@/components/hero/Hero'

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      {/* Centered Sharlee-style hero */}
      <Hero />
    </main>
  )
}
