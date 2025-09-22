import type { Metadata } from 'next'
import './globals.css'
import '../styles/projects.css'
import '../styles/grain.css'
import '../styles/hero-mountain.css'
import '../styles/three.css'
import '../styles/cursor.css'
import dynamic from 'next/dynamic'
import { Providers } from './providers'
import { Inter, Outfit } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const SnowCursor = dynamic(() => import('@/components/cursor/SnowCursor'), {
  ssr: false,
})

export const metadata: Metadata = {
  title: 'Owen Cheung',
  description: 'Personal portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body
        className={`no-scrollbar antialiased bg-[var(--bg)] text-[var(--ink)] overflow-x-clip`}
      >
        <Providers>
          <SnowCursor />
          {children}
          <div className="grain-overlay" aria-hidden />
        </Providers>
      </body>
    </html>
  )
}
