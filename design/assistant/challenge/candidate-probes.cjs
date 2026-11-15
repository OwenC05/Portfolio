// Development diagnostics only: no pass rate and no generated answers.
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { createLoader } = require('../../../tests/helpers/assistant-loader.cjs')
const root = path.resolve(__dirname, '../../..')
const load = createLoader()
const { retrieve: candidate } = load(path.join(root, 'lib/assistant/retrieval.ts'))
const { retrieve: baseline } = load(path.join(__dirname, 'retrieval.snapshot.ts'))
const { publishedKnowledge, knowledgeHref, knowledgeVersion } = load(path.join(root, 'lib/knowledge/catalog.ts'))
const queries = [
  'Who is Owen in quantum submarines?',
  'Which submarines explored Neptune?',
  'What political policy would Owen propose?',
  'quantum submarine candidate',
  'quantum university submarines',
  'bot submarine career',
  'banana coffee quasars',
  'Does TypeForge use cloud backups?',
  'How many customers did he help?',
  'coffee espresso machine',
  'Which college degree is Owen completing?',
  'Show me the chatbot source quotes',
]
const summarize = (hits) => hits.map(({ sourceId, chunkId, score, text, href }) => ({ sourceId, chunkId, score, text, href }))
const probes = queries.map((question) => ({ question,
  baseline: summarize(baseline(question, publishedKnowledge, knowledgeHref)),
  candidate: summarize(candidate(question, publishedKnowledge, knowledgeHref)),
}))
const workflow = {
  id: 'application-workspace', slug: 'application-workspace', title: 'application-workspace',
  publication: 'published', category: 'project', tags: [],
  sections: [
    { id: 'mechanism', heading: 'Workflow retries', text: 'Durable jobs make workflow retries inspectable and idempotent.' },
    { id: 'details', heading: 'Workflow records', text: 'Workflow jobs record retry history.' },
    { id: 'interface', heading: 'Workflow interface', text: 'Workflow jobs show recorded stages.' },
    { id: 'process', heading: 'Workflow process', text: 'Workflow jobs include human review.' },
    { id: 'limits', heading: 'Validation so far', text: 'Workflow recovery remains unqualified.' },
  ],
}
const contextQuestion = 'Explain inspectable workflow jobs and retry history'
const result = {
  recordedAtUtc: new Date().toISOString(),
  classification: 'Development diagnostics, not independent evaluation or semantic support judgments',
  catalogVersion: knowledgeVersion,
  candidateRetrieverSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'lib/assistant/retrieval.ts'))).digest('hex'),
  probes,
  syntheticContextBudget: {
    question: contextQuestion,
    baseline: summarize(baseline(contextQuestion, [workflow], knowledgeHref)),
    candidate: summarize(candidate(contextQuestion, [workflow], knowledgeHref)),
  },
}
fs.writeFileSync(path.join(__dirname, 'candidate-probe-results.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({
  probes: probes.map(({ question, baseline, candidate }) => ({ question, baseline: baseline.map((hit) => hit.chunkId), candidate: candidate.map((hit) => hit.chunkId) })),
  context: result.syntheticContextBudget,
}, null, 2))
