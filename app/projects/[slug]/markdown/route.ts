import { getPublicProject, projectMarkdown } from '@/lib/publicPortfolio'
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const project = getPublicProject((await params).slug)
  return project
    ? new Response(projectMarkdown(project), {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      })
    : new Response('Project not found', { status: 404 })
}
