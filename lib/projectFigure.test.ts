import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProjectFigure } from '../components/portfolio/ProjectFigure'

const render = (props: Parameters<typeof ProjectFigure>[0] = {}) =>
  renderToStaticMarkup(createElement(ProjectFigure, props))

describe('conceptual editorial figures', () => {
  it.each(['representation', 'lexisnexis', 'lexisnexis-ml', 'typeforge'])(
    'renders the supported %s figure with its visible conceptual caption',
    (kind) => {
      const html = render({ kind })
      expect(html).toContain(`figure-${kind}`)
      expect(html).toMatch(/<figcaption>[^<]*Conceptual[^<]*<\/figcaption>/)
      expect(html).toContain('aria-hidden="true"')
      expect(html).not.toContain('FIELD NOTES')
      expect(html).toMatch(/class="figure-topline"><span>[^<]+<\/span>/)
      expect(html).not.toContain('figure-compact')
    }
  )
  it('defaults only an omitted kind to the representation illustration', () => {
    expect(render()).toContain('figure-representation')
    expect(render()).toContain('not employer data or measured results')
  })
  it('keeps compact styling independent of the figure and caption', () => {
    const normal = render({ kind: 'typeforge' })
    const compact = render({ kind: 'typeforge', compact: true })
    expect(compact.replace(' figure-compact', '')).toBe(normal)
  })
  it('spells PRACTISE across eight illustrated keys', () => {
    const html = render({ kind: 'typeforge' })
    const letters = [...html.matchAll(/<text[^>]*>([A-Z])<\/text>/g)]
      .map((match) => match[1])
      .join('')
    expect(letters).toBe('PRACTISE')
  })
  it('shows the ML process without implying measured performance', () => {
    const html = render({ kind: 'lexisnexis-ml' })
    expect(html).toContain('FEATURES')
    expect(html).toContain('REPRESENTATION')
    expect(html).toContain('EVALUATION')
    expect(html).toContain('not employer data or measured results')
    expect(html).not.toMatch(
      /<polyline|<ellipse|<text[^>]*>\s*(?:SIGNAL|UPLIFT|ACCURACY)/
    )
    expect(html).not.toMatch(/\bd="[^"\n]*[CQ]/)
  })
})

describe('unsupported figure identifiers', () => {
  it.each([
    'unknown',
    'knowtrients',
    'sortify',
    'dishd',
    'toString',
    'constructor',
    '__proto__',
    '',
  ])('rejects %j instead of disguising it as another project', (kind) => {
    expect(() => render({ kind })).toThrow(
      `Unsupported project figure: ${kind}`
    )
  })
})
