import { publicPortfolio } from '@/lib/publicPortfolio'
export function GET() {
  return Response.json(publicPortfolio, {
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
  })
}
