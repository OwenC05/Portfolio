import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Home from '../app/page'
import { publicPortfolio } from './publicPortfolio'

const html = () => renderToStaticMarkup(createElement(Home))

describe('Alpine server-rendered portfolio', () => {
  it('renders a complete identity and full-bleed scene without a game or embedded text', () => {
    const markup = html()
    expect(markup.match(/<h1\b/g)).toHaveLength(1)
    expect(markup).toContain('Applied AI,')
    expect(markup).toContain('made practical.')
    expect(markup).toContain(publicPortfolio.profile.name)
    expect(markup).toContain('Conceptual terrain study')
    expect(markup).toContain('data-alpine-scene')
    expect(markup).not.toMatch(
      /<canvas\b|Concept comparison|Round 1|project-rail/
    )
  })

  it('connects three native skill links to unique evidence destinations before hydration', () => {
    const markup = html()
    for (const skill of publicPortfolio.capabilities) {
      expect(markup).toContain(`href="#${skill.id}"`)
      expect(markup.match(new RegExp(`id="${skill.id}"`, 'g'))).toHaveLength(1)
      expect(markup).toContain(skill.title.replaceAll('&', '&amp;'))
    }
    expect(markup).toContain('Multimodal contrastive learning (study)')
    expect(markup).toContain('GPU compute')
    expect(markup).toContain('Batch training')
    // Only the artwork, not the semantic skill navigation, is hidden.
    expect(markup).toMatch(/class="alpine-scene__media" aria-hidden="true"/)
    expect(markup).toContain('aria-label="Explore my skills"')
  })

  it('shows only the approved project set and a real, lazy-loaded product image', () => {
    const markup = html()
    for (const slug of [
      'lexisnexis-applied-ai',
      'lexisnexis-ml',
      'typeforge',
    ]) {
      expect(markup).toContain(`href="/projects/${slug}"`)
    }
    const projectList = markup.match(
      /<ul class="alpine-work__list">(.*?)<\/ul>/
    )?.[1]
    expect(projectList?.match(/<a\b/g)).toHaveLength(3)
    expect(markup).toContain('href="/projects"')
    expect(markup).toContain('TypeForge public demo')
    expect(markup).toMatch(/<img[^>]*loading="lazy"[^>]*typeforge-demo/)
    expect(markup).not.toMatch(
      /Knowtrients|Sortify|Dish&#x27;D|foundation.model|day.?0|cold.start/i
    )
    // Shared chrome owns contact and landmarks; don't duplicate it on Home.
    expect(markup).not.toMatch(/<header\b|<footer\b/)
  })
})
