import { describe, expect, it } from 'vitest'
import {
  getPublicProject,
  escapeMarkdown,
  portfolioMarkdown,
  projectMarkdown,
  publicPortfolio,
} from './publicPortfolio'

describe('hiring-focused public narrative', () => {
  it('shows architecture and stakeholder communication without claiming deployment', () => {
    const project = getPublicProject('lexisnexis-applied-ai')!
    const story = projectMarkdown(project)
    expect(story).toContain('designed for organisation-wide use')
    expect(story).toContain('end-to-end')
    expect(story).toContain('senior stakeholders')
    expect(story).toContain('not a launched production platform')
    expect(project.status).toBe('Internal pilot · toward production')
  })

  it('shares the three capability areas with machine readers', () => {
    expect(publicPortfolio.capabilities.map((item) => item.id)).toEqual([
      'research',
      'ai-systems',
      'data-modelling',
    ])
    const markdown = portfolioMarkdown()
    expect(markdown).toContain('## Capabilities')
    for (const item of publicPortfolio.capabilities) {
      expect(item.labels.length).toBeGreaterThan(0)
      expect(markdown).toContain(escapeMarkdown(item.title))
      expect(item.evidence.length).toBeGreaterThan(0)
    }
  })

  it('qualifies study and includes compute experience without disclosing exact volumes', () => {
    const output = JSON.stringify(publicPortfolio)
    expect(output).toMatch(/Multimodal contrastive learning \(study\)/)
    expect(output).toContain('GPU compute')
    expect(output).toContain('Batch training')
    expect(output).toContain('large-scale financial data')
    expect(output).not.toMatch(
      /hundreds of billions|\b\d{3,}\s*billion|CUDA|multi-GPU/i
    )
  })

  it('excludes the deferred foundation-model/day-zero story from public outputs', () => {
    for (const output of [
      JSON.stringify(publicPortfolio),
      portfolioMarkdown(),
    ]) {
      expect(output).not.toMatch(
        /foundation[- ]models?|day[- ]?(?:0|zero)|cold[- ]start/i
      )
    }
  })
})
