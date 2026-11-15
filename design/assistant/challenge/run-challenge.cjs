// Offline evidence runner. Uses the existing loader and retriever without edits.
// Run from any directory: node design/assistant/challenge/run-challenge.cjs [new-output-name.json]
// Exit 0: all declared targets found; 1: measured misses; 2: invalid execution.
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../../..')
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
const read = (relative) => fs.readFileSync(path.join(root, relative))
const hashFile = (relative) => hash(read(relative))
const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

function main() {
  const outputName = process.argv[2] || 'results.json'
  assert.match(outputName, /^[a-z0-9][a-z0-9-]*\.json$/i, 'Output must be a filename inside this evidence directory')
  const outputPath = path.join(__dirname, outputName)
  assert.equal(fs.existsSync(outputPath), false, 'Do not overwrite existing evidence')
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'freeze-manifest.json'), 'utf8'))
  const frozenBytes = fs.readFileSync(path.join(__dirname, 'frozen-questions.json'))
  const set = JSON.parse(frozenBytes)
  assert.equal(hash(frozenBytes), manifest.questionsSha256, 'Frozen questions changed')
  assert.equal(hashFile(manifest.catalogFile), manifest.catalogSha256, 'Catalog changed after freeze')
  assert.equal(hash(fs.readFileSync(path.join(__dirname, manifest.catalogSnapshot))), manifest.catalogSha256)
  assert.equal(set.catalogVersion, manifest.catalogVersion)
  assert.equal(set.questions.length, manifest.questionCount)
  assert.equal(new Set(set.questions.map((q) => q.id)).size, set.questions.length)
  assert.equal(new Set(set.questions.map((q) => normalize(q.question))).size, set.questions.length)

  const dependencyFiles = [
    'lib/assistant/retrieval.ts',
    'lib/knowledge/catalog.ts',
    'tests/helpers/assistant-loader.cjs',
    'tests/assistant/retrieval-fixtures.json',
    'package.json',
    'node_modules/typescript/package.json',
    'design/assistant/challenge/run-challenge.cjs',
  ]
  const beforeHashes = Object.fromEntries(dependencyFiles.map((file) => [file, hashFile(file)]))
  const { createLoader } = require(path.join(root, 'tests/helpers/assistant-loader.cjs'))
  const load = createLoader()
  const { retrieve } = load(path.join(root, 'lib/assistant/retrieval.ts'))
  const { publishedKnowledge, knowledgeHref, knowledgeVersion } = load(path.join(root, 'lib/knowledge/catalog.ts'))
  assert.equal(knowledgeVersion, manifest.catalogVersion)

  // Validate targets without invoking retrieval or changing the frozen criteria.
  for (const question of set.questions) {
    assert.ok(question.question.length <= 600, `${question.id}: question exceeds documented request bound`)
    for (const group of question.requiredEvidenceGroups) {
      assert.ok(group.anyOf.length > 0, `${question.id}: empty evidence group`)
      for (const passageId of group.anyOf) {
        const [sourceId, sectionId, sliceId, extra] = passageId.split(':')
        assert.equal(extra, undefined)
        assert.equal(sliceId, '0')
        const record = publishedKnowledge.find((record) => record.id === sourceId && record.publication === 'published')
        const section = record?.sections.find((section) => section.id === sectionId)
        assert.ok(section, `${question.id}: missing published target ${passageId}`)
        assert.ok(section.text.length <= 1200, `${question.id}: unexpected slice boundary`)
        assert.ok(question.expectedSourceIds.includes(sourceId))
      }
    }
  }

  // This audit is after the freeze. Fixture expectations never affect scoring.
  const fixtures = JSON.parse(read('tests/assistant/retrieval-fixtures.json'))
  const fixtureQuestions = fixtures.cases.map((fixture) => fixture.question)
  const normalizedExactOverlaps = set.questions.flatMap((question) =>
    fixtureQuestions.filter((existing) => normalize(existing) === normalize(question.question))
      .map((existing) => ({ challengeId: question.id, existingQuestion: existing }))
  )

  const startedAtUtc = new Date().toISOString()
  assert.ok(Date.parse(startedAtUtc) > Date.parse(manifest.frozenAtUtc))
  const cases = set.questions.map((question) => {
    const selected = retrieve(question.question, publishedKnowledge, knowledgeHref)
    const selectedIds = new Set(selected.map((hit) => hit.chunkId))
    const groups = question.requiredEvidenceGroups.map((group) => ({
      ...group,
      hit: group.anyOf.some((id) => selectedIds.has(id)),
      matchedPassageIds: group.anyOf.filter((id) => selectedIds.has(id)),
    }))
    return {
      id: question.id,
      question: question.question,
      answerability: question.answerability,
      explanation: question.explanation,
      expectedSourceIds: question.expectedSourceIds,
      scored: groups.length > 0,
      passed: groups.length ? groups.every((group) => group.hit) : null,
      groups,
      selected,
    }
  })
  const finishedAtUtc = new Date().toISOString()
  const afterHashes = Object.fromEntries(dependencyFiles.map((file) => [file, hashFile(file)]))
  assert.deepEqual(afterHashes, beforeHashes, 'Execution inputs changed during the run')
  assert.equal(hash(fs.readFileSync(path.join(__dirname, 'frozen-questions.json'))), manifest.questionsSha256)
  const summarize = (items) => ({
    questions: items.length,
    scoredQuestions: items.filter((item) => item.scored).length,
    passedQuestions: items.filter((item) => item.passed === true).length,
    failedQuestions: items.filter((item) => item.passed === false).length,
    observationOnlyQuestions: items.filter((item) => !item.scored).length,
    requiredGroups: items.reduce((n, item) => n + item.groups.length, 0),
    hitGroups: items.reduce((n, item) => n + item.groups.filter((group) => group.hit).length, 0),
    emptySelections: items.filter((item) => item.selected.length === 0).length,
  })
  const summary = summarize(cases)
  assert.equal(summary.scoredQuestions, manifest.scoredQuestionCount)
  assert.equal(summary.requiredGroups, manifest.requiredEvidenceGroupCount)
  const result = {
    studyId: set.studyId,
    status: 'valid-offline-run',
    frozenAtUtc: manifest.frozenAtUtc,
    startedAtUtc,
    finishedAtUtc,
    frozenQuestionsSha256: manifest.questionsSha256,
    catalogVersion: knowledgeVersion,
    catalogSha256: manifest.catalogSha256,
    provenance: {
      nodeVersion: process.version,
      typescriptVersion: require(path.join(root, 'node_modules/typescript/package.json')).version,
      platform: process.platform,
      execution: 'Existing createLoader() and retrieve(question, publishedKnowledge, knowledgeHref), no overrides',
      dependencySha256: beforeHashes,
      inputsUnchangedDuringRun: true,
      generation: 'not invoked; only catalog and retrieval modules loaded',
      fixtures: {
        inspectedOnlyAfterFreeze: true,
        fixtureVersion: fixtures.version,
        fixtureQuestionCount: fixtureQuestions.length,
        normalizedExactOverlaps,
        limitation: 'Exact textual overlap audit only; shared topics and catalog-derived author bias remain.',
      },
    },
    summary,
    byAnswerability: Object.fromEntries([...new Set(cases.map((item) => item.answerability))].map((kind) => [
      kind, summarize(cases.filter((item) => item.answerability === kind)),
    ])),
    cases,
    interpretation: 'Coverage of predeclared passage targets only; unsupported-question hits locate limits, not requested facts. No generated answer, UI behavior or semantic entailment was evaluated.',
  }
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  console.log(JSON.stringify({ outputPath, ...summary, byAnswerability: result.byAnswerability, normalizedExactOverlaps }, null, 2))
  process.exitCode = summary.failedQuestions ? 1 : 0
}

try {
  main()
} catch (error) {
  console.error(error.stack || String(error))
  process.exitCode = 2
}
