'use client'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}
