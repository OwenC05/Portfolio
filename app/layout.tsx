import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Owen Cheung — CS & AI | Data Science @ LexisNexis',
  description: 'I build data-driven systems and clean developer tooling across Python/SQL/Snowflake and TypeScript/Django/Flutter.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased bg-ice text-snow dark:bg-sky dark:text-snow overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}