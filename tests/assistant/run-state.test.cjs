/* eslint-disable @typescript-eslint/no-require-imports -- Existing Node/TypeScript test convention. */
'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { createLoader } = require('../helpers/assistant-loader.cjs')
const load = createLoader()
const { INITIAL_RUN, reduceAssistantRun, presentAssistantRun, hitKey } = load(
  path.resolve(__dirname, '../../lib/assistant/run-state.ts')
)
const { sourcesAnswer } = load(
  path.resolve(__dirname, '../../lib/assistant/generation.ts')
)
const hit = {
  sourceId: 'source',
  chunkId: 'chunk',
  title: 'Title',
  heading: 'Heading',
  text: 'An exact passage with a limitation.',
  href: '/work/source#heading',
  score: 1.5,
}
const hits = (n) =>
  Array.from({ length: n }, (_, i) => ({
    ...hit,
    chunkId: `chunk-${i}`,
    score: n - i,
  }))
const start = () =>
  reduceAssistantRun(INITIAL_RUN, {
    type: 'submit',
    runId: 'mount:1',
    question: 'Python',
  })
const event = (run, value, enabled = false) =>
  reduceAssistantRun(
    run,
    { type: 'event', runId: run.runId, event: value },
    enabled
  )
const retrieved = (items = [hit]) =>
  event(event(start(), { type: 'retrieval-start', question: 'Python' }), {
    type: 'retrieval',
    hits: items,
    durationMs: 2,
  })
const answered = (items = [hit]) =>
  event(retrieved(items), {
    type: 'answer',
    answer: sourcesAnswer(items, 'disabled'),
  })
function emptyFailure(run) {
  assert.equal(run.phase, 'error')
  assert.equal(run.failure, 'protocol')
  assert.deepEqual(run.hits, [])
  assert.equal(run.answer, undefined)
  assert.equal(run.selectedKey, null)
  assert.equal(run.retrievalMs, undefined)
  assert.equal(run.totalMs, undefined)
  const view = presentAssistantRun(run)
  assert.equal(view.count, 0)
  assert.equal(view.result, 'none')
  assert.equal(view.tray, 'hidden')
  assert.equal(view.pose, 'attention')
}

test('0..4 exact ordered hits, one revision and measured timings survive valid answers and EOF', () => {
  for (let n = 0; n <= 4; n++) {
    const items = hits(n)
    let run = retrieved(items)
    assert.deepEqual(
      run.hits.map((view) => view.hit),
      items
    )
    assert.deepEqual(
      run.hits.map((view) => view.rank),
      items.map((_, i) => i + 1)
    )
    const pending = presentAssistantRun(run)
    assert.equal(pending.run, run)
    assert.equal(pending.result, 'pending')
    assert.equal(pending.count, n)
    assert.equal(pending.tray, n ? 'hits' : 'waiting')
    assert.equal(pending.pose, n ? 'sources' : 'attention')
    run = event(run, {
      type: 'answer',
      answer: sourcesAnswer(items, 'disabled'),
    })
    assert.equal(presentAssistantRun(run).result, n ? 'sources' : 'no-match')
    assert.equal(presentAssistantRun(run).tray, n ? 'hits' : 'empty')
    run = event(run, { type: 'done', durationMs: 7 })
    assert.equal(run.completion, 'complete')
    assert.equal(run.cursor, 'eof')
    run = reduceAssistantRun(run, { type: 'eof', runId: run.runId })
    assert.equal(run.cursor, 'sealed')
    assert.equal(run.retrievalMs, 2)
    assert.equal(run.totalMs, 7)
    assert.equal(run.revision, 6)
  }
})

test('snapshots defensively copy and freeze result records, citations and arrays', () => {
  const input = { ...hit }
  const answer = sourcesAnswer([input])
  const run = event(retrieved([input]), { type: 'answer', answer })
  const snapshot = presentAssistantRun(run)
  input.text = 'changed outside'
  answer.citations[0].quote = 'changed outside'
  assert.equal(run.hits[0].hit.text, hit.text)
  assert.equal(run.answer.citations[0].quote, hit.text)
  for (const object of [
    snapshot,
    run,
    run.hits,
    run.hits[0],
    run.hits[0].hit,
    run.answer,
    run.answer.citations,
    run.answer.citations[0],
  ])
    assert.ok(Object.isFrozen(object))
  assert.throws(() => {
    run.hits[0].hit.text = 'mutated'
  }, TypeError)
  assert.throws(() => run.answer.citations.pop(), TypeError)
})

test('selection uses collision-free keys and run identity, not rank or question text', () => {
  const a = { ...hit, sourceId: 'a::b', chunkId: 'c' }
  const b = { ...hit, sourceId: 'a', chunkId: 'b::c' }
  assert.notEqual(hitKey(a), hitKey(b))
  let run = retrieved([a, b])
  run = reduceAssistantRun(run, {
    type: 'select',
    runId: run.runId,
    key: hitKey(b),
  })
  assert.equal(run.selectedKey, hitKey(b))
  const selected = run
  for (const action of [
    { type: 'select', runId: 'old', key: hitKey(a) },
    { type: 'select', runId: run.runId, key: 'missing' },
    { type: 'select', runId: run.runId, key: hitKey(b) },
  ])
    assert.equal(reduceAssistantRun(run, action), selected)
  run = reduceAssistantRun(run, {
    type: 'submit',
    runId: 'mount:2',
    question: run.question,
  })
  assert.equal(run.selectedKey, null)
  assert.deepEqual(run.hits, [])
  for (const action of [
    { type: 'select', runId: 'mount:1', key: hitKey(b) },
    { type: 'event', runId: 'mount:1', event: { type: 'done', durationMs: 8 } },
    {
      type: 'fail',
      runId: 'mount:1',
      failure: 'network',
      notice: 'Old failure',
    },
    { type: 'cancel', runId: 'mount:1' },
    { type: 'eof', runId: 'mount:1' },
  ])
    assert.equal(reduceAssistantRun(run, action), run)
})

test('all reset paths clear results, selection and timings together', () => {
  let run = event(answered(), { type: 'done', durationMs: 7 })
  run = reduceAssistantRun(run, {
    type: 'select',
    runId: run.runId,
    key: hitKey(hit),
  })
  for (const action of [
    { type: 'submit', runId: 'next', question: 'Next' },
    { type: 'cancel', runId: run.runId },
    { type: 'close' },
    { type: 'fail', runId: run.runId, failure: 'timeout', notice: 'Stopped' },
  ]) {
    const next = reduceAssistantRun(run, action)
    assert.deepEqual(next.hits, [])
    assert.equal(next.answer, undefined)
    assert.equal(next.selectedKey, null)
    assert.equal(next.retrievalMs, undefined)
    assert.equal(next.totalMs, undefined)
    assert.equal(next.completion, 'none')
    assert.equal(next.revision, run.revision + 1)
    assert.equal(next.question, action.type === 'submit' ? 'Next' : 'Python')
  }
})

test('out-of-order, duplicate, overflow and echoed-question contradictions fail closed', () => {
  const startEvent = { type: 'retrieval-start', question: 'Python' }
  const retrievalEvent = { type: 'retrieval', hits: [hit], durationMs: 1 }
  const answerEvent = { type: 'answer', answer: sourcesAnswer([hit]) }
  const doneEvent = { type: 'done', durationMs: 4 }
  const atRetrieval = event(start(), startEvent)
  const atAnswer = retrieved()
  const atDone = answered()
  const atEof = event(atDone, doneEvent)
  for (const [run, invalid] of [
    [start(), retrievalEvent],
    [start(), answerEvent],
    [start(), doneEvent],
    [start(), { ...startEvent, question: 'Different' }],
    [atRetrieval, startEvent],
    [atRetrieval, answerEvent],
    [atRetrieval, doneEvent],
    [atRetrieval, { ...retrievalEvent, hits: hits(5) }],
    [atRetrieval, { ...retrievalEvent, hits: [hit, { ...hit }] }],
    [atAnswer, startEvent],
    [atAnswer, retrievalEvent],
    [atAnswer, doneEvent],
    [atAnswer, { type: 'generation' }],
    [atDone, answerEvent],
    [atDone, retrievalEvent],
    [atEof, startEvent],
    [atEof, retrievalEvent],
    [atEof, answerEvent],
    [atEof, doneEvent],
  ])
    emptyFailure(event(run, invalid))
})

test('source-only citations must correspond exactly, completely and in retrieval order', () => {
  const items = hits(2)
  const valid = sourcesAnswer(items)
  const invalid = [
    { ...valid, mode: 'generated' },
    { ...valid, mode: 'abstained', citations: [] },
    { ...valid, fallbackReason: 'no-sources' },
    { ...valid, citations: [] },
    { ...valid, citations: valid.citations.slice(0, 1) },
    { ...valid, citations: [...valid.citations].reverse() },
    { ...valid, citations: [valid.citations[0], valid.citations[0]] },
    { ...valid, citations: [...valid.citations, valid.citations[0]] },
  ]
  for (const field of ['sourceId', 'chunkId', 'title', 'href', 'quote']) {
    invalid.push({
      ...valid,
      citations: [
        { ...valid.citations[0], [field]: 'foreign' },
        valid.citations[1],
      ],
    })
  }
  for (const answer of invalid)
    emptyFailure(event(retrieved(items), { type: 'answer', answer }))
  for (const answer of [
    { ...sourcesAnswer([]), mode: 'sources' },
    { ...sourcesAnswer([]), mode: 'generated' },
    { ...sourcesAnswer([]), citations: valid.citations },
    { ...sourcesAnswer([]), fallbackReason: 'timeout' },
  ])
    emptyFailure(event(retrieved([]), { type: 'answer', answer }))
})

test('clean missing-done completion is distinct from EOF before answer and trailing events', () => {
  for (const items of [[], [hit]]) {
    let run = answered(items)
    run = reduceAssistantRun(run, { type: 'eof', runId: run.runId })
    assert.equal(run.phase, 'done')
    assert.equal(run.completion, 'missing-done')
    assert.equal(run.totalMs, undefined)
    assert.match(run.notice, /closed before the final event/)
  }
  for (const run of [start(), retrieved()])
    emptyFailure(reduceAssistantRun(run, { type: 'eof', runId: run.runId }))
  const sealed = reduceAssistantRun(answered(), {
    type: 'eof',
    runId: 'mount:1',
  })
  assert.equal(event(sealed, { type: 'done', durationMs: 9 }), sealed)
})

test('generation-enabled compatibility preserves provider subset quotes, fallback and abstention', () => {
  const items = hits(2)
  const generation = event(retrieved(items), { type: 'generation' }, true)
  const generated = {
    ...sourcesAnswer(items),
    mode: 'generated',
    citations: [
      { ...sourcesAnswer(items).citations[1], quote: 'exact passage' },
    ],
    model: 'test/model',
  }
  for (const answer of [
    generated,
    sourcesAnswer(items, 'provider-error'),
    { mode: 'abstained', text: 'Not established.', citations: [] },
  ]) {
    const run = event(generation, { type: 'answer', answer }, true)
    assert.equal(run.phase, 'answered')
    assert.equal(run.generated, true)
    assert.equal(run.answer.mode, answer.mode)
  }
  emptyFailure(event(generation, { type: 'generation' }, true))
})
