import { publicProjects } from '@/lib/publicPortfolio'
import { siteUrl } from '@/lib/siteUrl'
export function GET() {
  const text = `# Owen Cheung — AI Engineer\n\nCurated public portfolio. llms.txt is a proposed convention, not guaranteed agent discovery.\n\n- [Portfolio JSON](${siteUrl}/portfolio.json)\n- [Portfolio Markdown](${siteUrl}/portfolio.md)\n- [MCP documentation](${siteUrl}/agents)\n${publicProjects.map((p) => `- [${p.title}](${p.markdownUrl}): ${p.status}`).join('\n')}\n`
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
