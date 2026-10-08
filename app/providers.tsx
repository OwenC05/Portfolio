import type { ReactNode } from 'react'

// Retained for callers outside the public reading routes; no global client shell.
export function Providers({ children }: { children: ReactNode }) {
  return children
}
