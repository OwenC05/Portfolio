import type { Metadata } from 'next'
import './globals.css'
import '../styles/projects.css'
import '../styles/grain.css'
import '../styles/three.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Inter, Outfit } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className={`antialiased bg-[var(--bg)] text-[var(--ink)]`}>
        <ThemeProvider>
          {/* Minimal header with theme toggle */}
          <div className="fixed top-4 right-4 z-[1000]">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
