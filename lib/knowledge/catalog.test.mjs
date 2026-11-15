import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLoader } from '../../tests/helpers/assistant-loader.cjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const {
  publishedKnowledge,
  findPublishedKnowledge,
  knowledgeHref,
  knowledgeVersion,
} = createLoader()(path.join(__dirname, 'catalog.ts'))

test('published records have stable unique IDs, anchors, metadata and valid links', () => {
  assert.match(knowledgeVersion, /^\d{4}-\d{2}-\d{2}\.\d+$/)
  const ids = new Set()
  const slugs = new Set()
  const anchors = new Set()
  for (const record of publishedKnowledge) {
    assert.equal(record.publication, 'published')
    for (const value of [record.id, record.slug])
      assert.match(value, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(!ids.has(record.id))
    ids.add(record.id)
    assert.ok(!slugs.has(record.slug))
    slugs.add(record.slug)
    assert.ok(
      record.title &&
        record.summary &&
        record.status &&
        record.sections.length &&
        record.links.length
    )
    assert.ok(Number.isFinite(Date.parse(record.updatedAt)))
    assert.equal(findPublishedKnowledge(record.slug), record)
    assert.equal(
      knowledgeHref(record),
      `/${record.category === 'writing' ? 'writing' : 'work'}/${record.slug}`
    )
    for (const section of record.sections) {
      assert.match(section.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      assert.ok(!anchors.has(section.id))
      anchors.add(section.id)
      assert.ok(section.heading && section.text)
    }
    for (const link of record.links) {
      assert.ok(link.label)
      const url = new URL(link.href, 'https://portfolio.example')
      assert.ok(['https:', 'mailto:'].includes(url.protocol))
      if (
        url.origin === 'https://portfolio.example' &&
        url.pathname.startsWith('/work/')
      ) {
        const target = findPublishedKnowledge(
          url.pathname.slice('/work/'.length)
        )
        assert.ok(target)
        if (url.hash)
          assert.ok(
            target.sections.some((section) => `#${section.id}` === url.hash)
          )
      }
    }
  }
})

test('draft template slugs and text are not published or retrievable', () => {
  const draftDir = path.resolve(__dirname, '../../content/drafts')
  for (const file of fs.readdirSync(draftDir)) {
    const draft = fs.readFileSync(path.join(draftDir, file), 'utf8')
    const slug = draft.match(/^slug: (.+)$/m)?.[1]
    assert.ok(slug)
    assert.equal(findPublishedKnowledge(slug), undefined)
    assert.ok(!JSON.stringify(publishedKnowledge).includes(slug))
  }
  assert.equal(findPublishedKnowledge('unknown-private-draft'), undefined)
  assert.equal(
    publishedKnowledge.filter((record) => record.category === 'writing').length,
    0
  )
  assert.ok(
    !fs
      .readFileSync(path.join(__dirname, 'catalog.ts'), 'utf8')
      .includes('content/drafts')
  )
})

test('public summaries retain important evidence boundaries', () => {
  assert.equal(
    findPublishedKnowledge('reinforcement-learning').status,
    'Write-up in preparation'
  )
  assert.equal(
    findPublishedKnowledge('lexisnexis').evidenceKind,
    'owner-reported'
  )
  assert.match(
    JSON.stringify(findPublishedKnowledge('dissertation')),
    /not a completed dissertation result/
  )
  assert.match(
    JSON.stringify(findPublishedKnowledge('typeforge')),
    /User benefit remains unestablished/
  )
})
