import type { Metadata } from 'next'
import TrailMap from '@/components/run/fallback/TrailMap'

export const metadata: Metadata = {
  title: 'Trail Map — Owen Cheung',
  description: 'Every project on the run, graded by difficulty.',
}

export default function ProjectsPage() {
  return <TrailMap />
}
