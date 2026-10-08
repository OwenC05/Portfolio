import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  publicPortfolio,
  publicProjects,
  selectedProjects,
  getPublicProject,
  portfolioMarkdown,
  projectMarkdown,
  searchProjects,
  escapeMarkdown,
} from './publicPortfolio'

// Optional private intake is read only by this local test, never bundled or copied.
const sourcePath = resolve(process.cwd(), 'Owen_Cheung_-_AI_Researcher.md')
const source = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : ''
const references = source.split(/^## References\s*$/m)[1] ?? ''
const excluded = references
  .split('\n')
  .filter((line) => line.startsWith('- '))
  .flatMap((line) => [
    line.match(/^- (.*?)\s*\(/)?.[1],
    line.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]+/)?.[0],
  ])
  .filter((value): value is string => Boolean(value))
const phone = source.match(/^\+\d[\d\s-]+(?=,)/m)?.[0]?.replace(/\D/g, '')

describe('approved public portfolio', () => {
  it('publishes only the three approved projects', () => {
    expect(publicProjects.map((p) => p.slug).sort()).toEqual([
      'lexisnexis-applied-ai',
      'lexisnexis-ml',
      'typeforge',
    ])
    expect(selectedProjects.map((p) => p.slug)).toEqual([
      'lexisnexis-applied-ai',
      'lexisnexis-ml',
      'typeforge',
    ])
    for (const slug of ['../typeforge', 'knowtrients', 'sortify', 'dishd'])
      expect(getPublicProject(slug)).toBeUndefined()
    const ml = getPublicProject('lexisnexis-ml')!
    expect(ml.confidential).toBe(true)
    expect(ml.evidence.join(' ')).toContain('Two fraud-model optimisations')
    expect(
      getPublicProject('lexisnexis-applied-ai')!.evidence.join(' ')
    ).not.toContain('Two fraud-model optimisations')
  })
  it('reconciles current role, contact and project maturity', () => {
    expect(publicPortfolio.profile.email).toBe('oc608@bath.ac.uk')
    expect(publicPortfolio.experience[0].period).toBe(
      'Aug 2026 — present · Contract'
    )
    expect(publicPortfolio.experience[1].period).toBe(
      'Jul 2025 — Aug 2026 · Industrial placement'
    )
    expect(getPublicProject('typeforge')?.status).toBe('In development')
    expect(getPublicProject('lexisnexis-applied-ai')?.status).toBe(
      'Internal pilot · toward production'
    )
  })
  it('exports only curated public fields, not raw sources or old claims', () => {
    const outputs = [
      JSON.stringify(publicPortfolio),
      portfolioMarkdown(),
      ...publicProjects.map(projectMarkdown),
    ]
    for (const output of outputs) {
      expect(output).not.toMatch(/"(?:phone|references|referees|rawCv)"\s*:/i)
      expect(output).not.toMatch(
        /Owen_Cheung_-_AI_Researcher|currently on placement|not built yet|empirical.Bayes|~180/
      )
      expect(Buffer.byteLength(output)).toBeLessThan(65536)
    }
    expect(Object.keys(publicProjects[0])).not.toContain('z')
    expect(publicProjects.every((p) => !p.repoUrl)).toBe(true)
    expect(publicProjects.filter((p) => p.liveUrl).map((p) => p.slug)).toEqual([
      'typeforge',
    ])
  })
  it('exports the TypeForge public demo without claiming a full release', () => {
    const typeforge = getPublicProject('typeforge')!
    const url = 'https://typeforge-alpha.vercel.app'
    expect(typeforge.liveUrl).toBe(url)
    expect(
      JSON.parse(JSON.stringify(publicPortfolio)).projects.find(
        (p: { slug: string }) => p.slug === 'typeforge'
      ).liveUrl
    ).toBe(url)
    expect(projectMarkdown(typeforge)).toContain(`Live demo: <${url}>`)
    expect(portfolioMarkdown()).toContain(`Live demo: <${url}>`)
    expect(typeforge.status).toBe('In development')
    expect(typeforge.limitations.join(' ')).not.toContain(
      'no public launch or demo'
    )
    expect(typeforge.limitations.join(' ')).toContain(
      'not a full product release'
    )
  })
  it.skipIf(!source)(
    'excludes private values derived from the local intake source',
    () => {
      expect(Boolean(phone), 'Phone exclusion could not be derived').toBe(true)
      const referenceCount = references
        .split('\n')
        .filter((line) => line.startsWith('- ')).length
      expect(
        referenceCount,
        'Reference exclusions could not be derived'
      ).toBeGreaterThan(0)
      expect(excluded.length, 'Not all reference fields were parsed').toBe(
        referenceCount * 2
      )
      for (const output of [
        JSON.stringify(publicPortfolio),
        portfolioMarkdown(),
        ...publicProjects.map(projectMarkdown),
      ]) {
        for (const value of excluded)
          expect(
            output.toLowerCase().includes(value.toLowerCase()),
            'Excluded reference field leaked'
          ).toBe(false)
        expect(
          output.replace(/\D/g, '').includes(phone!),
          'Excluded phone leaked'
        ).toBe(false)
      }
    }
  )
  it('escapes Markdown markup and carries role, methods and personal context', () => {
    expect(escapeMarkdown('[label](https://example.invalid) <script>')).toBe(
      '\\[label\\](https://example\\.invalid) \\<script\\>'
    )
    const markdown = portfolioMarkdown()
    expect(markdown).toContain('## Skills')
    expect(markdown).toContain('## Interests')
    for (const project of publicProjects) {
      expect(projectMarkdown(project)).toContain(escapeMarkdown(project.role))
      for (const value of project.highlights)
        expect(projectMarkdown(project)).toContain(escapeMarkdown(value))
    }
  })
  it('search is deterministic, bounded and validated', () => {
    expect(searchProjects('TYPEFORGE')[0].slug).toBe('typeforge')
    expect(searchProjects('   ')).toHaveLength(3)
    expect(searchProjects('unfindablezz')).toEqual([])
    expect(searchProjects('fraud python', 1)).toHaveLength(1)
    expect(searchProjects('!!!')).toEqual([])
    expect(searchProjects('键盘')).toEqual([])
    expect(() => searchProjects('a'.repeat(201))).toThrow()
    for (const limit of [0, 6, 1.2, NaN])
      expect(() => searchProjects('', limit)).toThrow()
  })
})
