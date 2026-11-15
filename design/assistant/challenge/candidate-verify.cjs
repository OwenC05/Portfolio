// Reconcile saved development evidence and protect the original frozen study.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '../../..')
const bytes = (file) => fs.readFileSync(path.join(__dirname, file))
const json = (file) => JSON.parse(bytes(file))
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex')
const preservation = json('candidate-preservation.json')
for (const [file, expected] of Object.entries(preservation.protectedSha256)) {
  assert.equal(sha(fs.readFileSync(path.join(root, file))), expected, `Protected artifact changed: ${file}`)
}
const frozen = json('frozen-questions.json')
const baseline = json('results.json')
const candidate = json('candidate-results-v2.json')
assert.equal(candidate.frozenQuestionsSha256, sha(bytes('frozen-questions.json')))
assert.equal(candidate.catalogVersion, frozen.catalogVersion)
assert.equal(candidate.provenance.dependencySha256['lib/assistant/retrieval.ts'], sha(fs.readFileSync(path.join(root, 'lib/assistant/retrieval.ts'))))
const { createLoader } = require('../../../tests/helpers/assistant-loader.cjs')
const { publishedKnowledge, knowledgeHref } = createLoader()(path.join(root, 'lib/knowledge/catalog.ts'))
const changes = []
let selectedPassages = 0
let selectedCharacters = 0
for (const [index, item] of candidate.cases.entries()) {
  const question = frozen.questions[index]
  assert.equal(item.id, question.id)
  assert.equal(item.question, question.question)
  assert.equal(item.answerability, question.answerability)
  assert.deepEqual(item.expectedSourceIds, question.expectedSourceIds)
  const ids = new Set(item.selected.map((hit) => hit.chunkId))
  assert.equal(ids.size, item.selected.length)
  assert.ok(item.selected.length <= 4)
  const expectedGroups = question.requiredEvidenceGroups.map((group) => ({
    ...group, hit: group.anyOf.some((id) => ids.has(id)),
    matchedPassageIds: group.anyOf.filter((id) => ids.has(id)),
  }))
  assert.deepEqual(item.groups, expectedGroups)
  assert.equal(item.passed, expectedGroups.length ? expectedGroups.every((group) => group.hit) : null)
  for (const [rank, hit] of item.selected.entries()) {
    const [recordId, sectionId, sliceIndex] = hit.chunkId.split(':')
    const record = publishedKnowledge.find((record) => record.id === recordId && record.publication === 'published')
    const section = record?.sections.find((section) => section.id === sectionId)
    assert.ok(section)
    const offset = Number(sliceIndex) * 1200
    assert.equal(hit.text, section.text.slice(offset, offset + 1200))
    assert.equal(hit.href, `${knowledgeHref(record)}#${section.id}`)
    assert.equal(hit.sourceId, record.id)
    assert.ok(Number.isFinite(hit.score) && hit.score > 0)
    if (rank) assert.ok(item.selected[rank - 1].score >= hit.score)
    selectedPassages++
    selectedCharacters += hit.text.length
  }
  if (baseline.cases[index].passed !== item.passed) changes.push({ id: item.id, before: baseline.cases[index].passed, after: item.passed })
}
const groups = candidate.cases.flatMap((item) => item.groups)
assert.equal(candidate.summary.passedQuestions, candidate.cases.filter((item) => item.passed === true).length)
assert.equal(candidate.summary.hitGroups, groups.filter((group) => group.hit).length)
assert.equal(candidate.summary.requiredGroups, groups.length)
assert.equal(candidate.summary.scoredQuestions, candidate.cases.filter((item) => item.groups.length).length)
assert.equal(candidate.summary.failedQuestions, candidate.cases.filter((item) => item.passed === false).length)
assert.equal(candidate.summary.emptySelections, candidate.cases.filter((item) => !item.selected.length).length)
const fixtures = json('candidate-fixtures-final.json')
assert.equal(fixtures.retrieval.fixtureChecksTotal, 17)
assert.equal(fixtures.retrieval.fixtureChecksPassed, 17)
const probes = json('candidate-probe-results.json')
assert.equal(probes.candidateRetrieverSha256, candidate.provenance.dependencySha256['lib/assistant/retrieval.ts'])
const result = {
  verifiedAtUtc: new Date().toISOString(),
  status: 'passed',
  protectedArtifactsVerified: Object.keys(preservation.protectedSha256).length,
  originalChallengeArtifactsByteIdentical: true,
  catalogVersion: candidate.catalogVersion,
  frozenQuestionsSha256: candidate.frozenQuestionsSha256,
  candidateRetrieverSha256: candidate.provenance.dependencySha256['lib/assistant/retrieval.ts'],
  candidateResultsSha256: sha(bytes('candidate-results-v2.json')),
  candidateQualityTestsSha256: sha(fs.readFileSync(path.join(root, 'tests/assistant/retrieval-quality.test.cjs'))),
  baseline: baseline.summary,
  candidate: candidate.summary,
  changes,
  remainingMisses: candidate.cases.filter((item) => item.passed === false).map((item) => ({ id: item.id, question: item.question, missing: item.groups.filter((group) => !group.hit).flatMap((group) => group.anyOf) })),
  context: {
    baselineSelectedPassages: baseline.cases.reduce((sum, item) => sum + item.selected.length, 0),
    candidateSelectedPassages: selectedPassages,
    baselineSelectedCharacters: baseline.cases.reduce((sum, item) => sum + item.selected.reduce((total, hit) => total + hit.text.length, 0), 0),
    candidateSelectedCharacters: selectedCharacters,
    belowStandaloneThreshold: candidate.cases.flatMap((item) => item.selected.filter((hit) => hit.score < 1.5).map((hit) => ({ questionId: item.id, chunkId: hit.chunkId, score: hit.score }))),
  },
  validation: 'All saved passage text, source IDs, links and coverage decisions checked; original artifacts hashed; no retrieval or generation invocation in this verifier',
}
fs.writeFileSync(path.join(__dirname, 'candidate-verification.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(result, null, 2))
