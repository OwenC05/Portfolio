'use client'

import dynamic from 'next/dynamic'

// Client-only mount for the custom cursor. `ssr: false` is only allowed inside
// a Client Component in Next 16, so this thin wrapper isolates it.
const Cursor = dynamic(() => import('@/components/Cursor'), { ssr: false })

export default function CursorMount() {
  return <Cursor />
}
