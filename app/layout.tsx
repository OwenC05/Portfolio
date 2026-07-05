import type { Metadata } from 'next'
import './globals.css'
import '../styles/grain.css'
import CursorMount from '@/components/CursorMount'
import { Providers } from './providers'
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Owen Cheung — Applied AI · Snowboard Portfolio',
  description:
    'Snowboard down the slope to explore the work of Owen Cheung — applied AI at LexisNexis, CS & AI at Bath.',
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body
        className={`no-scrollbar antialiased bg-[var(--bg)] text-[var(--ink)] overflow-x-clip`}
      >
        <Providers>
          <CursorMount />
          {children}
          <div className="grain-overlay" aria-hidden />
        </Providers>
      </body>
    </html>
  )
}
