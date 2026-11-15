/* eslint-disable @typescript-eslint/no-require-imports -- This Node test uses the existing CommonJS loader. */
const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { createLoader } = require('../helpers/assistant-loader.cjs')

const load = createLoader()
const { parseAssistantEvent } = load(
  path.resolve(__dirname, '../../lib/assistant/events.ts')
)
const errorMessage = 'The assistant sent a response this page could not read.'
const hit = {
  sourceId: 'typing',
  chunkId: 'typing:method:0',
  title: 'Typing project',
  heading: 'Python benchmark',
  text: 'A Python benchmark compares a baseline with a candidate model.',
  href: '/work/typing#method',
  score: 2.5,
}
const citation = {
  sourceId: hit.sourceId,
  chunkId: hit.chunkId,
  title: hit.title,
  href: hit.href,
  quote: hit.text,
}
const answer = {
  mode: 'sources',
  text: 'Matching passages.',
  citations: [citation],
}
const rejects = (event) =>
  assert.throws(() => parseAssistantEvent(JSON.stringify(event)), {
    message: errorMessage,
  })

test('retrieval without hits is rejected before it can enter render state', () => {
  assert.throws(
    () => parseAssistantEvent('{"type":"retrieval","durationMs":1}'),
    { message: errorMessage }
  )
})

test('valid empty retrieval and malformed JSON retain their behavior', () => {
  const event = { type: 'retrieval', hits: [], durationMs: 0 }
  assert.deepEqual(parseAssistantEvent(JSON.stringify(event)), event)
  assert.throws(() => parseAssistantEvent('not-json'), {
    message: errorMessage,
  })
})

test('all supported event variants and answer modes preserve valid payloads', () => {
  for (const event of [
    { type: 'retrieval-start', question: 'Python benchmark?' },
    { type: 'retrieval', hits: [hit], durationMs: 0.5 },
    { type: 'generation' },
    { type: 'answer', answer },
    {
      type: 'answer',
      answer: { ...answer, mode: 'generated', model: 'test/model' },
    },
    {
      type: 'answer',
      answer: {
        mode: 'abstained',
        text: 'Please contact Owen.',
        citations: [],
      },
    },
    { type: 'done', durationMs: 10 },
    { type: 'done', durationMs: 0, extraMetadata: 'ignored by the component' },
  ]) {
    assert.deepEqual(parseAssistantEvent(JSON.stringify(event)), event)
  }
})

test('source fallback diagnostics remain valid for every supported reason', () => {
  for (const fallbackReason of [
    'disabled',
    'invalid-config',
    'missing-credential',
    'authentication-error',
    'rate-limited',
    'provider-error',
    'timeout',
    'cancelled',
    'invalid-output',
    'response-too-large',
    'no-sources',
  ]) {
    const event = { type: 'answer', answer: { ...answer, fallbackReason } }
    assert.deepEqual(parseAssistantEvent(JSON.stringify(event)), event)
  }
})

test('non-object events, unknown types and missing variant payloads are rejected', () => {
  for (const event of [
    null,
    [],
    'answer',
    5,
    true,
    {},
    { type: 'unknown' },
    { type: ['generation'] },
    { type: 'retrieval-start' },
    { type: 'retrieval-start', question: {} },
    { type: 'retrieval', hits: null, durationMs: 1 },
    { type: 'retrieval', hits: {}, durationMs: 1 },
    { type: 'answer' },
    { type: 'answer', answer: null },
    { type: 'answer', answer: [] },
    { type: 'done' },
  ])
    rejects(event)
})

test('hit payloads reject missing or non-string render fields and invalid scores', () => {
  for (const field of [
    'sourceId',
    'chunkId',
    'title',
    'heading',
    'text',
    'href',
  ]) {
    for (const value of [undefined, null, {}, [], 1]) {
      rejects({
        type: 'retrieval',
        hits: [{ ...hit, [field]: value }],
        durationMs: 1,
      })
    }
  }
  for (const value of [undefined, null, '2', {}, -1]) {
    rejects({
      type: 'retrieval',
      hits: [{ ...hit, score: value }],
      durationMs: 1,
    })
  }
  for (const value of [null, [], 'hit', 1]) {
    rejects({ type: 'retrieval', hits: [value], durationMs: 1 })
  }
  assert.throws(
    () =>
      parseAssistantEvent(
        JSON.stringify({
          type: 'retrieval',
          hits: [hit],
          durationMs: 1,
        }).replace('2.5', '1e400')
      ),
    { message: errorMessage }
  )
})

test('answer and citation payloads reject values that would break rendering', () => {
  for (const invalid of [
    { ...answer, mode: 'unknown' },
    { ...answer, mode: null },
    { ...answer, text: {} },
    { ...answer, text: undefined },
    { ...answer, citations: undefined },
    { ...answer, citations: null },
    { ...answer, citations: {} },
    { ...answer, citations: [null] },
    { ...answer, citations: [[]] },
    { ...answer, model: 1 },
    { ...answer, model: null },
    { ...answer, fallbackReason: 'unrecognized' },
    { ...answer, fallbackReason: 'toString' },
    { ...answer, fallbackReason: null },
  ])
    rejects({ type: 'answer', answer: invalid })
  for (const field of Object.keys(citation)) {
    for (const value of [undefined, null, {}, [], 1]) {
      rejects({
        type: 'answer',
        answer: { ...answer, citations: [{ ...citation, [field]: value }] },
      })
    }
  }
})

test('durations must be finite nonnegative numbers in retrieval and done events', () => {
  for (const type of ['retrieval', 'done']) {
    for (const durationMs of [undefined, null, '1', {}, -1]) {
      rejects({ type, hits: [], durationMs })
    }
    assert.throws(
      () =>
        parseAssistantEvent(`{"type":"${type}","hits":[],"durationMs":1e400}`),
      { message: errorMessage }
    )
  }
})

test('actual source-only handler events parse without calling a provider', async () => {
  const { createAssistantHandler } = load(
    path.resolve(__dirname, '../../lib/assistant/handler.ts')
  )
  let calls = 0
  const handler = createAssistantHandler({
    records: [
      {
        id: hit.sourceId,
        slug: 'typing',
        title: hit.title,
        publication: 'published',
        tags: ['Python'],
        sections: [{ id: 'method', heading: hit.heading, text: hit.text }],
      },
    ],
    href: () => '/work/typing',
    env: {},
    fetcher: async () => {
      calls++
      throw new Error('No provider call is allowed')
    },
  })
  for (const [question, mode] of [
    ['Python benchmark', 'sources'],
    ['submarines', 'abstained'],
  ]) {
    const response = await handler(
      new Request('https://portfolio.test/api/assistant', {
        method: 'POST',
        headers: {
          origin: 'https://portfolio.test',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })
    )
    assert.equal(response.status, 200)
    const events = (await response.text())
      .trim()
      .split('\n')
      .map(parseAssistantEvent)
    assert.deepEqual(
      events.map((event) => event.type),
      ['retrieval-start', 'retrieval', 'answer', 'done']
    )
    assert.equal(events[2].answer.mode, mode)
  }
  assert.equal(calls, 0)
})
