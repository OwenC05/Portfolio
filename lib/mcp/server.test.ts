import { expect, it } from 'vitest'
import {
  publicPortfolio,
  publicProjects,
  searchProjects,
} from '../publicPortfolio'
import { resourceValues } from './server'
it('all finite resource and tool results fit the output budget and use public citations', () => {
  for (const value of [
    ...resourceValues.map((r) => r.value),
    ...publicProjects,
    { projects: searchProjects('') },
  ]) {
    const output = JSON.stringify(value)
    expect(Buffer.byteLength(output)).toBeLessThan(65536)
    expect(output).not.toMatch(/Owen_Cheung_-_AI_Researcher/)
  }
  expect(resourceValues.map((r) => r.uri)).toContain('portfolio://profile')
  expect(resourceValues).toHaveLength(6)
  expect(
    resourceValues.find((r) => r.uri === 'portfolio://profile')?.value
  ).toEqual({
    profile: publicPortfolio.profile,
    capabilities: publicPortfolio.capabilities,
    sourceUrl: expect.stringMatching(/^https?:\/\//),
    provenance: publicPortfolio.provenance,
  })
})
