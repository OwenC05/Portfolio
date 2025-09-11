import type { Metadata } from 'next'
import './globals.css'
import '../styles/projects.css'
import '../styles/grain.css'
import { Inter, Fraunces } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

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
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} antialiased bg-[var(--bg)] text-[var(--ink)]`}>
        {children}
      </body>
    </html>
  )
}
