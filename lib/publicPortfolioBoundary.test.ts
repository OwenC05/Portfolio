import { afterEach, expect, it, vi } from 'vitest'
import { projects } from './projects'
afterEach(() => {
  vi.doUnmock('./projects')
  vi.resetModules()
})
it.each([undefined, '', '   '])(
  'fails explicitly for a missing curated role %j rather than inventing one',
  async (role) => {
    vi.resetModules()
    vi.doMock('./projects', () => ({ projects: [{ ...projects[0], role }] }))
    await expect(import('./publicPortfolio')).rejects.toThrow(
      'Public project is missing a curated role.'
    )
  }
)
it('suppresses confidential external links from public exports', async () => {
  vi.resetModules()
  const liveUrl = 'https://private-demo.example.invalid'
  const repoUrl = 'https://private-repo.example.invalid'
  vi.doMock('./projects', () => ({
    projects: [{ ...projects[0], liveUrl, repoUrl }],
  }))
  const {
    publicProjects,
    publicPortfolio,
    projectMarkdown,
    portfolioMarkdown,
  } = await import('./publicPortfolio')
  expect(publicProjects[0]).not.toHaveProperty('liveUrl')
  expect(publicProjects[0]).not.toHaveProperty('repoUrl')
  for (const output of [JSON.stringify(publicPortfolio), portfolioMarkdown()]) {
    expect(output).not.toContain(liveUrl)
    expect(output).not.toContain(repoUrl)
  }
  expect(projectMarkdown({ ...publicProjects[0], liveUrl })).not.toContain(
    liveUrl
  )
})
