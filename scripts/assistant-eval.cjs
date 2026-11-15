// Offline retrieval report only. This runner never calls an inference provider.
const path = require('node:path')
const { createLoader } = require('../tests/helpers/assistant-loader.cjs')
const fixtures = require('../tests/assistant/retrieval-fixtures.json')
const load = createLoader()
const root = path.resolve(__dirname, '..')
const { retrieve } = load(path.join(root, 'lib/assistant/retrieval.ts'))
const { publishedKnowledge, knowledgeHref, knowledgeVersion } = load(
  path.join(root, 'lib/knowledge/catalog.ts')
)
const cases = fixtures.cases.map((fixture) => {
  const hits = retrieve(fixture.question, publishedKnowledge, knowledgeHref)
  const passed = fixture.expectedEmpty
    ? hits.length === 0
    : (!fixture.expectedSource ||
        hits.some((hit) => hit.sourceId === fixture.expectedSource)) &&
      (!fixture.expectedChunkIds ||
        fixture.expectedChunkIds.every((id) =>
          hits.some((hit) => hit.chunkId === id)
        ))
  return {
    ...fixture,
    passed,
    retrieved: hits.map(({ sourceId, chunkId, score }) => ({
      sourceId,
      chunkId,
      score,
    })),
  }
})
const supported = cases.filter((item) => item.kind === 'supported-topic')
console.log(
  JSON.stringify(
    {
      fixtureVersion: fixtures.version,
      knowledgeVersion,
      retrieval: {
        method:
          'Deterministic normalized lexical matching of published passages, with one optional related limitation; at most four hits.',
        fixtureChecksPassed: cases.filter((item) => item.passed).length,
        fixtureChecksTotal: cases.length,
        supportedTopicRecallAt4:
          supported.filter((item) => item.passed).length / supported.length,
        cases,
      },
      generation: {
        status: 'not-run',
        reason:
          'Generation is deferred at the owner’s request. This offline runner never makes model requests.',
      },
      semanticReview: {
        status: 'not-performed',
        reason:
          'Retrieval and exact-quote/schema tests do not establish factual entailment, model injection resistance, or human answer quality.',
      },
    },
    null,
    2
  )
)
if (cases.some((item) => !item.passed)) process.exitCode = 1
