// install: npm i framer-motion
import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { Magnet } from '@/components/ui/Magnet'
import { Spotlight } from '@/components/ui/Spotlight'
import Hero from '@/components/hero/Hero'

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)]">
      {/* Centered Sharlee-style hero */}
      <Hero />
    </main>
  )
}
