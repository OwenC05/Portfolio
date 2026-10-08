import { portfolioMarkdown } from '@/lib/publicPortfolio'
export function GET() {
  return new Response(portfolioMarkdown(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
