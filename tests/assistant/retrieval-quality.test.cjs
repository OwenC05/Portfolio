const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { createLoader } = require('../helpers/assistant-loader.cjs')
const root = path.resolve(__dirname, '../..')
const { retrieve } = createLoader()(
  path.join(root, 'lib/assistant/retrieval.ts')
)
const href = (record) => `/work/${record.slug}`
const record = (id, sections, tags = []) => ({
  id,
  slug: id,
  title: id,
  publication: 'published',
  category: 'project',
  tags,
  sections,
})
const section = (id, heading, text) => ({ id, heading, text })
const ids = (hits) => hits.map((hit) => hit.chunkId)

test('natural inflections find customer work without a project name', () => {
  const work = record('work-history', [
    section(
      'role',
      'Experience',
      'Customer-facing work includes a placement in financial analysis.'
    ),
  ])
  assert.ok(
    ids(retrieve('Has he worked with customers?', [work], href)).includes(
      'work-history:role:0'
    )
  )
})

test('bounded vocabulary connects visitor terms to excerpts and assistant behavior', () => {
  const preview = record('search-preview', [
    section(
      'behavior',
      'Source excerpts',
      'The assistant displays excerpts; generated answers are disabled.'
    ),
  ])
  assert.ok(
    ids(
      retrieve('Does the bot show extracts or write replies?', [preview], href)
    ).includes('search-preview:behavior:0')
  )
})

test('education and boosted-tree vocabulary generalize beyond question templates', () => {
  const education = record(
    'profile',
    [
      section(
        'degree',
        'Education',
        'A university student expects graduation in 2028.'
      ),
    ],
    ['education']
  )
  const tooling = record(
    'rule-tools',
    [
      section(
        'method',
        'Team tooling',
        'LightGBM rule mining helps the team inspect models.'
      ),
    ],
    ['LightGBM']
  )
  assert.ok(
    ids(
      retrieve('Which college is he studying at?', [education], href)
    ).includes('profile:degree:0')
  )
  assert.ok(
    ids(
      retrieve('Are boosted trees used to find rules?', [tooling], href)
    ).includes('rule-tools:method:0')
  )
})

test('contractions retain useful multiword headings', () => {
  const profile = record('person', [
    section(
      'interests',
      'Away from the screen',
      'Music and snowboarding are listed interests.'
    ),
  ])
  assert.ok(
    ids(
      retrieve(
          "When he's away from coding, what kinds of things does he enjoy doing?",
        [profile],
        href
      )
    ).includes('person:interests:0')
  )
})

test('one overlapping limitation can accompany direct project evidence within the budget', () => {
  const project = record('application-workspace', [
    section(
      'mechanism',
      'Workflow retries',
      'Durable jobs make workflow retries inspectable and idempotent.'
    ),
    section(
      'details',
      'Workflow records',
      'Workflow jobs record retry history.'
    ),
    section(
      'interface',
      'Workflow interface',
      'Workflow jobs show recorded stages.'
    ),
    section(
      'process',
      'Workflow process',
      'Workflow jobs include human review.'
    ),
    section(
      'limits',
      'Validation so far',
      'Workflow recovery remains unqualified.'
    ),
    section(
      'unrelated',
      'Disclosure limits',
      'Unpublished compensation details are excluded.'
    ),
  ])
  const found = retrieve(
    'Explain inspectable workflow jobs and retry history',
    [project],
    href
  )
  assert.equal(found.length, 4)
  assert.ok(ids(found).includes('application-workspace:mechanism:0'))
  assert.ok(ids(found).includes('application-workspace:limits:0'))
  assert.ok(!ids(found).includes('application-workspace:unrelated:0'))
  assert.deepEqual(
    found,
    retrieve(
      'Explain inspectable workflow jobs and retry history',
      [project],
      href
    )
  )
  assert.ok(found.every((hit) => Number.isFinite(hit.score) && hit.score > 0))
  assert.ok(
    found.every(
      (hit, index) => index === 0 || found[index - 1].score >= hit.score
    )
  )
})

test('metadata alone does not attach every caveat and unrelated topics stay empty', () => {
  const metadataOnly = record(
    'team-notes',
    [
      section('method', 'Method', 'A prototype is being developed.'),
      section('limits', 'Validation', 'Recovery remains unqualified.'),
    ],
    ['workflow']
  )
  const found = retrieve('workflow', [metadataOnly], href)
  assert.ok(found.every((hit) => hit.score >= 1.5))
  const source = record(
    'profile',
    [
      section(
        'background',
        'Education',
        'A university student uses Python for analysis.'
      ),
    ],
    ['education']
  )
  for (const query of [
    'quantum submarines',
    'Who is Owen in quantum submarines?',
    'What political policy would Owen propose?',
    'quantum submarine candidate',
  ]) {
    assert.deepEqual(retrieve(query, [source], href), [], query)
  }
})

test('context completion preserves sole passages from other sources and never invents zero-overlap context', () => {
  const primary = record('alpha', [
    section(
      'mechanism',
      'Workflow jobs',
      'Workflow jobs record inspectable history.'
    ),
    section('limits', 'Validation', 'Workflow recovery is unqualified.'),
    section(
      'unrelated',
      'Disclosure limits',
      'Coffee preferences are unavailable.'
    ),
  ])
  const others = ['beta', 'gamma', 'delta'].map((id) =>
    record(id, [
      section('mechanism', 'Workflow jobs', 'Workflow jobs record history.'),
    ])
  )
  const found = retrieve(
    'inspectable workflow jobs history',
    [primary, ...others],
    href
  )
  assert.deepEqual(
    new Set(found.map((hit) => hit.sourceId)),
    new Set(['alpha', 'beta', 'gamma', 'delta'])
  )
  const metadata = record(
    'epsilon',
    [
      section(
        'mechanism',
        'Records',
        'Durable jobs record inspectable history.'
      ),
      section('limits', 'Validation', 'Recovery is unqualified.'),
    ],
    ['history']
  )
  assert.ok(
    !ids(
      retrieve('inspectable durable jobs history', [metadata], href)
    ).includes('epsilon:limits:0')
  )
})

test('normalization preserves publication, identity, text and request/context bounds', () => {
  const publicRecord = record(
    'public',
    [section('details', 'Customer work', 'Customer '.repeat(1000))],
    ['customer']
  )
  const draft = {
    ...publicRecord,
    id: 'private',
    slug: 'private',
    publication: 'draft',
  }
  const found = retrieve('Customers', [draft, publicRecord], href)
  assert.ok(found.length > 0 && found.length <= 4)
  assert.ok(
    found.every((hit) => hit.sourceId === 'public' && hit.text.length <= 1200)
  )
  for (const hit of found) {
    const offset = Number(hit.chunkId.split(':')[2]) * 1200
    assert.equal(
      hit.text,
      publicRecord.sections[0].text.slice(offset, offset + 1200)
    )
    assert.equal(hit.href, '/work/public#details')
  }
  assert.deepEqual(
    retrieve('z'.repeat(600) + ' Customers', [publicRecord], href),
    []
  )
  assert.deepEqual(retrieve('the and or', [publicRecord], href), [])
})
