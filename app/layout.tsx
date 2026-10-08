import type { Metadata } from 'next'
import { Inter, Hanken_Grotesk } from 'next/font/google'
import { siteUrl } from '@/lib/siteUrl'
import { SiteHeader, SiteFooter } from '@/components/portfolio/SiteChrome'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})
const description =
  'Owen Cheung — AI Engineer at LexisNexis Risk Solutions and Computer Science & AI student at Bath. Human-governed agentic workflows, applied research and thoughtful software.'
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Owen Cheung — AI Engineer', template: '%s — Owen Cheung' },
  description,
  openGraph: {
    type: 'website',
    siteName: 'Owen Cheung',
    url: '/',
    title: 'Owen Cheung — AI Engineer',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Owen Cheung — AI Engineer',
    description,
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${hanken.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
