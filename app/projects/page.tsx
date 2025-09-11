'use client'

import dynamic from 'next/dynamic'
import HUD from '@/components/ui/HUD'

const Experience = dynamic(() => import('@/components/three/Experience'), { ssr: false })

export default function ProjectsPage() {
  return (
    <div className="relative h-[calc(100dvh)] w-full bg-gradient-to-b from-sky-100 via-slate-100 to-white r3f-container">
      <Experience />
      <HUD />
    </div>
  )
}
