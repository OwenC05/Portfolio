// Validate saved evidence without running retrieval, generation, Next or a server.
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const bytes = (file) => fs.readFileSync(path.join(__dirname, file))
const json = (file) => JSON.parse(bytes(file))
const sha = (data) => crypto.createHash('sha256').update(data).digest('hex')
const manifest = json('freeze-manifest.json')
const frozen = json('frozen-questions.json')
const result = json('results.json')

assert.equal(sha(bytes('frozen-questions.json')), manifest.questionsSha256)
assert.equal(result.frozenQuestionsSha256, manifest.questionsSha256)
assert.equal(sha(bytes('catalog.snapshot.ts')), manifest.catalogSha256)
assert.equal(result.catalogSha256, manifest.catalogSha256)
assert.equal(result.catalogVersion, manifest.catalogVersion)
assert.equal(sha(bytes('retrieval.snapshot.ts')), result.provenance.dependencySha256['lib/assistant/retrieval.ts'])
assert.equal(sha(bytes('assistant-loader.snapshot.cjs')), result.provenance.dependencySha256['tests/helpers/assistant-loader.cjs'])
assert.equal(sha(bytes('run-challenge.cjs')), result.provenance.dependencySha256['design/assistant/challenge/run-challenge.cjs'])
assert.ok(Date.parse(result.startedAtUtc) > Date.parse(manifest.frozenAtUtc))
assert.equal(result.cases.length, frozen.questions.length)
const { createLoader } = require('./assistant-loader.snapshot.cjs')
const { publishedKnowledge, knowledgeHref, knowledgeVersion } = createLoader()(path.join(__dirname, 'catalog.snapshot.ts'))
assert.equal(knowledgeVersion, manifest.catalogVersion)

let selectedPassagesVerified = 0
for (let index = 0; index < frozen.questions.length; index++) {
  const question = frozen.questions[index]
  const item = result.cases[index]
  for (const key of ['id', 'question', 'answerability', 'explanation', 'expectedSourceIds']) {
    assert.deepEqual(item[key], question[key])
  }
  const ids = new Set(item.selected.map((hit) => hit.chunkId))
  assert.equal(ids.size, item.selected.length)
  for (const hit of item.selected) {
    const [sourceId, sectionId, sliceIndex] = hit.chunkId.split(':')
    const record = publishedKnowledge.find((record) => record.id === sourceId && record.publication === 'published')
    assert.ok(record)
    const section = record.sections.find((section) => section.id === sectionId)
    assert.ok(section)
    const start = Number(sliceIndex) * 1200
    assert.equal(hit.text, section.text.slice(start, start + 1200))
    assert.equal(hit.sourceId, sourceId)
    assert.equal(hit.title, record.title)
    assert.equal(hit.heading, section.heading)
    assert.equal(hit.href, `${knowledgeHref(record)}#${sectionId}`)
    assert.ok(Number.isFinite(hit.score))
    selectedPassagesVerified++
  }
  const expectedGroups = question.requiredEvidenceGroups.map((group) => ({
    ...group,
    hit: group.anyOf.some((id) => ids.has(id)),
    matchedPassageIds: group.anyOf.filter((id) => ids.has(id)),
  }))
  assert.deepEqual(item.groups, expectedGroups)
  assert.equal(item.scored, expectedGroups.length > 0)
  assert.equal(item.passed, expectedGroups.length ? expectedGroups.every((group) => group.hit) : null)
}

function count(items) {
  const allGroups = items.flatMap((item) => item.groups)
  const scored = items.filter((item) => item.groups.length > 0)
  return {
    questions: items.length,
    scoredQuestions: scored.length,
    passedQuestions: scored.filter((item) => item.groups.every((group) => group.hit)).length,
    failedQuestions: scored.filter((item) => item.groups.some((group) => !group.hit)).length,
    observationOnlyQuestions: items.length - scored.length,
    requiredGroups: allGroups.length,
    hitGroups: allGroups.filter((group) => group.hit).length,
    emptySelections: items.filter((item) => item.selected.length === 0).length,
  }
}
assert.deepEqual(result.summary, count(result.cases))
for (const [kind, summary] of Object.entries(result.byAnswerability)) {
  assert.deepEqual(summary, count(result.cases.filter((item) => item.answerability === kind)))
}
const verification = {
  verifiedAtUtc: new Date().toISOString(),
  status: 'passed',
  verificationScriptSha256: sha(bytes('verify-evidence.cjs')),
  resultsSha256: sha(bytes('results.json')),
  frozenQuestionsSha256: manifest.questionsSha256,
  catalogVersion: knowledgeVersion,
  selectedPassagesVerified,
  checks: [
    'Frozen question, catalog, retriever, loader and runner hashes match recorded evidence',
    'Retrieval timestamp follows freeze timestamp',
    'Saved case text, source expectations and criteria exactly match the frozen set',
    'Every selected excerpt and link matches the published catalog snapshot',
    'Every saved coverage decision and aggregate count recomputes from selected IDs',
    'Validation loaded only the saved catalog; no retrieval or generation rerun',
  ],
  summary: result.summary,
}
fs.writeFileSync(path.join(__dirname, 'verification.json'), JSON.stringify(verification, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(verification, null, 2))
