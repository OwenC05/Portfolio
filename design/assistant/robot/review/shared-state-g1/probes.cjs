'use strict'
// Review-only probes. No app writes, browser, network, build, or provider call.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const root = path.resolve(__dirname, '../../../../..')
const loaderPath = path.join(root, 'tests/helpers/assistant-loader.cjs')
const load = require(loaderPath).createLoader()
const { createAssistantRunOwner } = load(path.join(root, 'lib/assistant/run-transport.ts'))
const { createAssistantHandler } = load(path.join(root, 'lib/assistant/handler.ts'))
const originalTest = path.join(root, 'tests/assistant/run-transport.test.cjs')
const testSource = fs.readFileSync(originalTest, 'utf8')
const firstTest = testSource.indexOf("test('Workbench preserves source content")
assert.ok(firstTest > 0)
const fixtureModule = { exports: {} }
vm.runInThisContext('(function(require,module,__dirname){\n' + testSource.slice(0, firstTest) +
  '\nmodule.exports={workbench,events,wire,question,tick};\n})', { filename: originalTest })(
  createRequire(originalTest), fixtureModule, path.dirname(originalTest))
const { workbench, events, wire, question, tick } = fixtureModule.exports
const output = { generatedAt: new Date().toISOString(), scope: 'Actual production modules; simulated React hook host only', results: [] }
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
async function until(check) {
  for (let n = 0; n < 80; n++) { if (check()) return; await tick() }
  throw new Error('Probe completion did not arrive')
}

async function retryDraftAndCopy() {
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window
  const bodies = []
  let ui
  try {
    globalThis.window = globalThis
    globalThis.fetch = async (_url, init) => {
      bodies.push(JSON.parse(init.body).question)
      return Response.json({ error: 'Probe HTTP failure' }, { status: 503 })
    }
    ui = workbench()
    ui.submit('Previous submitted question')
    await until(() => { ui.render(); return ui.state().phase === 'error' })
    ui.nodes().find(node => node.type === 'textarea').props.onChange({ target: { value: 'Edited current draft' } })
    ui.render()
    ui.nodes().find(node => node.type === 'button' && node.props.children === 'Try again').props.onClick()
    await until(() => { ui.render(); return bodies.length === 2 && ui.state().phase === 'error' })
    const draft = ui.nodes().find(node => node.type === 'textarea').props.value
    assert.equal(draft, 'Edited current draft')
    assert.equal(bodies[1], 'Previous submitted question')
    assert.notEqual(bodies[1], draft)
    output.results.push({ name: 'retry-current-draft', findingReproduced: true, draft, requestBodies: bodies,
      expectedByStateContract: 'Second request equals Edited current draft', actual: 'Second request repeats previous submitted question' })
  } finally {
    ui?.dispose()
    globalThis.fetch = originalFetch
    globalThis.window = originalWindow
  }
  // The original harness does not execute function components while walking JSX.
  // Execute the actual Constellation function once to inspect its pending text.
  try {
    globalThis.window = globalThis
    globalThis.fetch = async () => new Response(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode(wire(events([]).slice(0, 2)) + '\n')) },
    }))
    ui = workbench()
    ui.submit(question)
    await until(() => { ui.render(); return ui.state().phase === 'retrieved' })
    const graph = ui.nodes().find(node => node.type?.name === 'Constellation')
    const graphTree = graph.type(graph.props)
    const caption = ui.nodes(graphTree).find(node => node.type === 'text' && node.props.y === 20).props.children
    assert.equal(caption, '0 passages ? response pending')
    output.results.push({ name: 'zero-hit-svg-caption', findingReproduced: true, caption,
      codePoints: Array.from(caption).map(c => c.codePointAt(0)) })
  } finally {
    ui?.dispose()
    globalThis.fetch = originalFetch
    globalThis.window = originalWindow
  }
}

async function delayedCallbacks() {
  let cases = 0
  for (const stage of ['fetch', 'http-json']) {
    for (const stop of ['cancel', 'close', 'dispose', 'supersede']) {
      for (const settle of ['resolve', 'reject']) {
        const gate = deferred()
        const changes = []
        let calls = 0, bodyCancelled = 0, oldSignal
        const owner = createAssistantRunOwner({
          onChange: snapshot => changes.push(snapshot),
          fetcher: async (_url, init) => {
            if (++calls > 1) return new Response(wire(events()))
            oldSignal = init.signal
            return stage === 'fetch' ? gate.promise : { ok: false, status: 503, json: () => gate.promise }
          },
        })
        try {
          owner.actions.submit(question)
          await tick()
          if (stop === 'supersede') {
            owner.actions.submit(question)
            await until(() => owner.getSnapshot().run.cursor === 'sealed')
          } else if (stop === 'dispose') owner.dispose()
          else owner.actions[stop]()
          const after = owner.getSnapshot(), count = changes.length
          assert.equal(oldSignal.aborted, true)
          if (settle === 'reject') gate.reject(new TypeError('Late old rejection'))
          else gate.resolve(stage === 'fetch' ? {
            ok: true,
            body: { async cancel() { bodyCancelled++ }, getReader() { throw new Error('Stale response acquired reader') } },
          } : { error: 'Late old HTTP body' })
          await tick()
          assert.equal(owner.getSnapshot(), after)
          assert.equal(changes.length, count)
          if (stage === 'fetch' && settle === 'resolve') assert.equal(bodyCancelled, 1)
          cases++
        } finally { owner.dispose() }
      }
    }
  }
  output.results.push({ name: 'late-fetch-http-body-matrix', passed: true, cases,
    stages: ['fetch', 'http-json'], stops: ['cancel', 'close', 'dispose', 'supersede'], settlements: ['resolve', 'reject'] })
}

async function actualHandlerGeneration() {
  const results = []
  for (const mode of ['generated', 'abstained', 'provider-error']) {
    let providerFixtureCalls = 0
    const handler = createAssistantHandler({
      records: [{ id: 'review', slug: 'review', title: 'Review source', publication: 'published', tags: ['Python'],
        sections: [{ id: 'method', heading: 'Python benchmark', text: 'Python benchmark compares a baseline and a candidate with a documented limitation.' }] }],
      href: () => '/work/review',
      env: { ASSISTANT_GENERATION_ENABLED: 'true', ASSISTANT_MODEL: 'openai/gpt-4o-mini', AI_GATEWAY_API_KEY: 'local-fixture-no-network' },
      fetcher: async (_url, init) => {
        providerFixtureCalls++
        if (mode === 'provider-error') return new Response('', { status: 503 })
        const context = JSON.parse(JSON.parse(init.body).messages[1].content)
        const answer = { answer: 'Python benchmark comparison.', abstain: mode === 'abstained',
          citations: mode === 'abstained' ? [] : [{ chunkId: context.passages[0].chunkId, quote: 'Python benchmark compares a baseline' }] }
        return Response.json({ choices: [{ message: { content: JSON.stringify(answer) } }] })
      },
    })
    const owner = createAssistantRunOwner({
      generationEnabled: true,
      onChange() {},
      fetcher: (_url, init) => handler(new Request('https://review.test/api/assistant', {
        ...init, headers: { ...init.headers, origin: 'https://review.test' },
      })),
    })
    try {
      owner.actions.submit('Python benchmark')
      await until(() => owner.getSnapshot().run.cursor === 'sealed')
      const run = owner.getSnapshot().run
      assert.equal(run.completion, 'complete')
      assert.equal(run.answer.mode, mode === 'provider-error' ? 'sources' : mode)
      assert.equal(providerFixtureCalls, 1)
      results.push({ fixture: mode, answerMode: run.answer.mode, completion: run.completion, providerFixtureCalls })
    } finally { owner.dispose() }
  }
  output.results.push({ name: 'real-handler-opt-in-generation-fixtures', passed: true, realNetworkCalls: 0, results })
}

async function nativeReaderRelease() {
  const cases = []
  for (const stop of ['cancel', 'close', 'dispose']) {
    let cancelled = 0
    const response = new Response(new ReadableStream({ cancel() { cancelled++ } }))
    const owner = createAssistantRunOwner({ onChange() {}, fetcher: async () => response })
    try {
      owner.actions.submit(question)
      await until(() => response.body.locked)
      if (stop === 'dispose') owner.dispose()
      else owner.actions[stop]()
      await until(() => !response.body.locked)
      assert.equal(cancelled, 1)
      cases.push({ stop, locked: response.body.locked, cancelCalls: cancelled })
    } finally { owner.dispose() }
  }
  output.results.push({ name: 'native-readable-stream-release', passed: true, cases })
}

;(async () => {
  await retryDraftAndCopy()
  await delayedCallbacks()
  await actualHandlerGeneration()
  await nativeReaderRelease()
  fs.writeFileSync(path.join(__dirname, 'probe-results.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(JSON.stringify(output, null, 2))
})().catch(error => { console.error(error); process.exitCode = 1 })
