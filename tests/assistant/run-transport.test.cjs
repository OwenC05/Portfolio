/* eslint-disable @typescript-eslint/no-require-imports -- Existing Node/TypeScript test convention. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { createLoader } = require('../helpers/assistant-loader.cjs')

const root = path.resolve(__dirname, '../..')
const load = createLoader()
const { sourcesAnswer } = load(path.join(root, 'lib/assistant/generation.ts'))
const hit = {
  sourceId: 'typing',
  chunkId: 'typing:method:0',
  title: 'Typing project',
  heading: 'Python benchmark',
  text: 'A café benchmark — with exact quotes.',
  href: '/work/typing#method',
  score: 2.5,
}
const question = 'Python benchmark'
const events = (hits = [hit], answer = sourcesAnswer(hits, 'disabled')) => [
  { type: 'retrieval-start', question },
  { type: 'retrieval', hits, durationMs: 3 },
  { type: 'answer', answer },
  { type: 'done', durationMs: 8 },
]
const wire = (items) => items.map((item) => JSON.stringify(item)).join('\n')
const tick = () => new Promise((resolve) => setImmediate(resolve))
async function until(check) {
  for (let n = 0; n < 80; n++) {
    if (check()) return
    await tick()
  }
  assert.fail('Expected asynchronous completion did not arrive')
}
function responseInBytes(text) {
  const bytes = new TextEncoder().encode(text)
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte))
        controller.close()
      },
    })
  )
}

// A small hook/JSX harness for component regression tests, not a DOM/browser proof.
// The real component and its relative imports execute; only React's host is faked.
function workbench(props = {}) {
  const slots = [],
    effects = [],
    updates = [],
    cache = new Map()
  let cursor = 0,
    dirty = false,
    tree
  const same = (a, b) =>
    a && b && a.length === b.length && a.every((x, i) => Object.is(x, b[i]))
  const react = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots))
        slots[i] = typeof initial === 'function' ? initial() : initial
      return [
        slots[i],
        (value) => {
          updates.push(() => {
            slots[i] = typeof value === 'function' ? value(slots[i]) : value
          })
          dirty = true
        },
      ]
    },
    useRef(initial) {
      const i = cursor++
      return (slots[i] ??= { current: initial })
    },
    useId() {
      const i = cursor++
      return (slots[i] ??= `test-${i}`)
    },
    useMemo(fn, deps) {
      const i = cursor++
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, value: fn() }
      return slots[i].value
    },
    useCallback(fn, deps) {
      return react.useMemo(() => fn, deps)
    },
    useEffect(fn, deps) {
      const i = cursor++
      if (!same(slots[i]?.deps, deps))
        effects.push(() => {
          slots[i]?.cleanup?.()
          slots[i] = { deps, setup: fn, cleanup: fn() }
        })
    },
    useLayoutEffect(fn, deps) {
      react.useEffect(fn, deps)
    },
  }
  const jsx = (type, props) => ({ type, props })
  function read(filename) {
    if (!path.extname(filename))
      filename += fs.existsSync(`${filename}.ts`) ? '.ts' : '.tsx'
    if (cache.has(filename)) return cache.get(filename).exports
    const loadedModule = { exports: {} }
    cache.set(filename, loadedModule)
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: filename,
    }).outputText
    const localRequire = (id) => {
      if (id === 'react') return react
      if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx }
      if (id.endsWith('.css')) return { default: {} }
      if (id.startsWith('@/')) return read(path.join(root, id.slice(2)))
      if (id.startsWith('.'))
        return read(path.resolve(path.dirname(filename), id))
      return require(id)
    }
    new Function('require', 'module', 'exports', compiled)(
      localRequire,
      loadedModule,
      loadedModule.exports
    )
    return loadedModule.exports
  }
  const Component = read(
    path.join(root, 'components/assistant/AssistantWorkbench.tsx')
  ).default
  function render() {
    do {
      dirty = false
      while (updates.length) updates.shift()()
      cursor = 0
      tree = Component(props)
      while (effects.length) effects.shift()()
    } while (dirty)
    return tree
  }
  function nodes(node = tree) {
    if (!node || typeof node !== 'object') return []
    if (Array.isArray(node))
      return node.flatMap((child) => nodes(child ?? null))
    return [node, ...nodes(node.props?.children ?? null)]
  }
  function text(node = tree) {
    if (node == null || typeof node === 'boolean') return ''
    if (typeof node !== 'object') return String(node)
    if (Array.isArray(node))
      return node.map((child) => text(child ?? null)).join('')
    return text(node.props?.children ?? null)
  }
  function edit(value) {
    nodes()
      .find((node) => node.type === 'textarea')
      .props.onChange({ target: { value } })
    render()
  }
  render()
  return {
    render,
    nodes,
    text,
    edit,
    state: () =>
      nodes().find((node) => node.type?.name === 'Constellation').props.run,
    replayEffects() {
      for (const slot of slots) slot?.cleanup?.()
      for (const slot of slots) if (slot?.setup) slot.cleanup = slot.setup()
    },
    submit(value) {
      edit(value)
      nodes()
        .find((node) => node.type === 'form')
        .props.onSubmit({ preventDefault() {} })
      render()
    },
    dispose() {
      for (const slot of slots) slot?.cleanup?.()
    },
  }
}

async function withWorkbench(t, fetcher, props, check) {
  t.mock.method(globalThis, 'fetch', fetcher)
  const oldWindow = globalThis.window
  globalThis.window = globalThis
  const ui = workbench(props)
  try {
    await check(ui)
  } finally {
    ui.dispose()
    globalThis.window = oldWindow
  }
}

test('Workbench preserves source content, citations, normalization and byte-chunked EOF', async (t) => {
  let calls = 0
  await withWorkbench(
    t,
    async (url, init) => {
      calls++
      assert.equal(url, '/api/assistant')
      assert.equal(init.method, 'POST')
      assert.deepEqual(JSON.parse(init.body), { question })
      assert.ok(init.signal instanceof AbortSignal)
      return responseInBytes(`\n${wire(events())}\n\n`)
    },
    {},
    async (ui) => {
      ui.submit(`  ${question}  `)
      await until(() => {
        ui.render()
        return ui.text().includes('Finished in 8 ms')
      })
      assert.equal(calls, 1)
      assert.ok(ui.text().includes(hit.text))
      assert.ok(ui.text().includes('They do not confirm a premise'))
      assert.ok(
        ui
          .nodes()
          .some((node) => node.type === 'a' && node.props.href === hit.href)
      )
      assert.ok(ui.text().includes('1 hit · 3 ms'))
    }
  )
})

test('Workbench keeps complete answers without done explicitly incomplete', async (t) => {
  await withWorkbench(
    t,
    async () => responseInBytes(wire(events().slice(0, -1))),
    {},
    async (ui) => {
      ui.submit(question)
      await until(() => {
        ui.render()
        return ui.text().includes('closed before the final event')
      })
      assert.ok(ui.text().includes(hit.text))
      assert.ok(!ui.text().includes('Finished in'))
    }
  )
})

test('Workbench preserves a source-only abstention', async (t) => {
  await withWorkbench(
    t,
    async () => responseInBytes(wire(events([]))),
    {},
    async (ui) => {
      ui.submit(question)
      await until(() => {
        ui.render()
        return ui.text().includes('Finished in 8 ms')
      })
      assert.ok(
        ui.text().includes('No matching published passages were found.')
      )
      assert.ok(ui.text().includes('oc608@bath.ac.uk'))
      assert.equal(
        ui.nodes().filter((node) => node.type === 'blockquote').length,
        0
      )
    }
  )
})

test('Workbench preserves the opt-in generation branch and its exact citation', async (t) => {
  const generated = {
    ...sourcesAnswer([hit]),
    mode: 'generated',
    text: 'A supported reply.',
    model: 'test/model',
  }
  const sequence = events([hit], generated)
  sequence.splice(2, 0, { type: 'generation' })
  await withWorkbench(
    t,
    async () => responseInBytes(wire(sequence)),
    { generationEnabled: true },
    async (ui) => {
      ui.submit(question)
      await until(() => {
        ui.render()
        return ui.text().includes('Finished in 8 ms')
      })
      assert.ok(ui.text().includes('A supported reply.'))
      assert.ok(ui.text().includes('test/model'))
      assert.ok(ui.text().includes(hit.text))
    }
  )
})

for (const phase of ['error', 'cancelled']) {
  test(`Workbench Retry submits the edited draft after ${phase} with Ask normalization and a new run identity`, async (t) => {
    const bodies = []
    const stream = delayedReader()
    const draft =
      phase === 'error'
        ? ' \tEdited current draft\n '
        : ` \tEdited current draft ${'x'.repeat(610)}\n `
    const expected =
      phase === 'error'
        ? 'Edited current draft'
        : `Edited current draft ${'x'.repeat(579)}`
    await withWorkbench(
      t,
      async (_url, init) => {
        bodies.push(JSON.parse(init.body))
        if (phase === 'cancelled' && bodies.length === 1) return stream.response
        return Response.json({ error: 'Fixture HTTP failure' }, { status: 503 })
      },
      {},
      async (ui) => {
        ui.submit(question)
        if (phase === 'cancelled') {
          await stream.chunk(`${wire(events().slice(0, 2))}\n`)
          ui.render()
          ui.nodes()
            .find(
              (node) => node.type === 'button' && ui.text(node) === 'Cancel'
            )
            .props.onClick()
        }
        await until(() => {
          ui.render()
          return ui.state().phase === phase
        })
        const previousId = ui.state().runId
        assert.ok(previousId)
        ui.edit(draft)
        const retry = ui
          .nodes()
          .find(
            (node) => node.type === 'button' && ui.text(node) === 'Try again'
          )
        assert.ok(!retry.props.disabled)
        retry.props.onClick()
        ui.render()
        const retryId = ui.state().runId
        assert.ok(retryId)
        assert.notEqual(retryId, previousId)
        assert.deepEqual(bodies, [{ question }, { question: expected }])
        assert.equal(
          ui.nodes().find((node) => node.type === 'textarea').props.value,
          draft
        )
        await until(() => {
          ui.render()
          return ui.state().phase === 'error'
        })
        // The form handler must produce the same wire value as Retry.
        ui.nodes()
          .find((node) => node.type === 'form')
          .props.onSubmit({ preventDefault() {} })
        ui.render()
        assert.deepEqual(bodies[2], bodies[1])
        assert.notEqual(ui.state().runId, retryId)
      }
    )
  })

  test(`Workbench Retry is disabled for a blank edited draft after ${phase}`, async (t) => {
    let calls = 0
    await withWorkbench(
      t,
      async () => {
        calls++
        return Response.json({ error: 'Fixture HTTP failure' }, { status: 503 })
      },
      {},
      async (ui) => {
        ui.submit(question)
        if (phase === 'cancelled')
          ui.nodes()
            .find(
              (node) => node.type === 'button' && ui.text(node) === 'Cancel'
            )
            .props.onClick()
        await until(() => {
          ui.render()
          return ui.state().phase === phase
        })
        const previousId = ui.state().runId
        for (const draft of ['', ' \t\n ']) {
          ui.edit(draft)
          const retry = ui
            .nodes()
            .find(
              (node) => node.type === 'button' && ui.text(node) === 'Try again'
            )
          assert.equal(retry.props.disabled, true)
          // Even a programmatic invocation is rejected by the shared submit path.
          retry.props.onClick()
          ui.render()
          assert.equal(calls, 1)
          assert.equal(ui.state().runId, previousId)
          assert.equal(ui.state().phase, phase)
        }
      }
    )
  })
}

test('Workbench zero-hit pending caption is rendered by the nested Constellation', async (t) => {
  const stream = delayedReader()
  await withWorkbench(
    t,
    async () => stream.response,
    {},
    async (ui) => {
      ui.submit(question)
      await stream.chunk(`${wire(events([]).slice(0, 2))}\n`)
      ui.render()
      assert.equal(ui.state().phase, 'retrieved')
      assert.equal(ui.state().hits.length, 0)
      assert.equal(ui.state().answer, undefined)
      const graph = ui
        .nodes()
        .find((node) => node.type?.name === 'Constellation')
      // The JSX walker does not execute nested components: render the real function.
      const svg = graph.type(graph.props)
      assert.equal(svg.type, 'svg')
      const caption = ui
        .nodes(svg)
        .find((node) => node.type === 'text' && node.props.y === 20)
      assert.equal(ui.text(caption), '0 passages; response pending')
      assert.ok(
        ui
          .text()
          .includes('Zero passages retrieved; the response is still pending.')
      )
      assert.ok(!ui.text(svg).includes('no passages matched'))
      await stream.chunk(`${wire(events([]).slice(2))}\n`)
      await stream.end()
      ui.render()
      assert.equal(ui.state().completion, 'complete')
      assert.equal(ui.state().answer.mode, 'abstained')
    }
  )
})

const { createAssistantRunOwner, ASSISTANT_TIMEOUT_MS } = load(
  path.join(root, 'lib/assistant/run-transport.ts')
)
const { hitKey } = load(path.join(root, 'lib/assistant/run-state.ts'))
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function owner(t, fetcher, options = {}) {
  const changes = []
  const run = createAssistantRunOwner({
    fetcher,
    onChange: (snapshot) => changes.push(snapshot),
    ...options,
  })
  t.after(() => run.dispose())
  return { ...run, changes, state: () => run.getSnapshot().run }
}
// Intentionally ignores AbortSignal/cancel: models a completion already queued by an external API.
function delayedReader() {
  const pending = []
  let acquired = 0,
    cancelled = 0,
    released = 0
  const reader = {
    read() {
      const next = deferred()
      pending.push(next)
      return next.promise
    },
    async cancel() {
      cancelled++
    },
    releaseLock() {
      released++
    },
  }
  return {
    response: {
      ok: true,
      body: {
        getReader() {
          acquired++
          return reader
        },
      },
    },
    reader,
    async chunk(text) {
      await until(() => pending.length)
      pending
        .shift()
        .resolve({ done: false, value: new TextEncoder().encode(text) })
      await tick()
    },
    async end() {
      await until(() => pending.length)
      pending.shift().resolve({ done: true })
      await tick()
    },
    async reject(error) {
      await until(() => pending.length)
      pending.shift().reject(error)
      await tick()
    },
    counts: () => ({ acquired, cancelled, released }),
  }
}
function cleared(run, phase) {
  assert.equal(run.phase, phase)
  assert.deepEqual(run.hits, [])
  assert.equal(run.answer, undefined)
  assert.equal(run.selectedKey, null)
  assert.equal(run.retrievalMs, undefined)
  assert.equal(run.totalMs, undefined)
}

test('real source-only handler fixtures traverse the owner with no provider and one request each', async (t) => {
  const { createAssistantHandler } = load(
    path.join(root, 'lib/assistant/handler.ts')
  )
  let providerCalls = 0,
    calls = 0
  const handler = createAssistantHandler({
    records: [
      {
        id: 'typing',
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
      providerCalls++
      throw new Error('provider forbidden')
    },
  })
  const run = owner(t, async (_url, init) => {
    calls++
    return handler(
      new Request('https://portfolio.test/api/assistant', {
        ...init,
        headers: { ...init.headers, origin: 'https://portfolio.test' },
      })
    )
  })
  for (const [text, mode] of [
    ['Python benchmark', 'sources'],
    ['submarines', 'abstained'],
  ]) {
    run.actions.submit(text)
    await until(() => run.state().cursor === 'sealed')
    assert.equal(run.state().answer.mode, mode)
    assert.equal(run.state().completion, 'complete')
  }
  assert.equal(calls, 2)
  assert.equal(providerCalls, 0)
})

test('zero retrieval waits for abstention and done drains to EOF with exactly one reader owner', async (t) => {
  const stream = delayedReader()
  const run = owner(t, async () => stream.response)
  run.actions.submit(question)
  await stream.chunk(`${wire(events([]).slice(0, 2))}\n`)
  assert.equal(run.getSnapshot().result, 'pending')
  assert.equal(run.getSnapshot().tray, 'waiting')
  assert.equal(run.getSnapshot().pose, 'attention')
  await stream.chunk(`${wire(events([]).slice(2))}\n`)
  assert.equal(run.state().completion, 'complete')
  assert.equal(run.state().cursor, 'eof')
  assert.equal(run.getSnapshot().result, 'no-match')
  assert.deepEqual(stream.counts(), { acquired: 1, cancelled: 0, released: 0 })
  await stream.chunk('\n  \n')
  await stream.end()
  assert.equal(run.state().cursor, 'sealed')
  assert.deepEqual(stream.counts(), { acquired: 1, cancelled: 1, released: 1 })
})

test('cancel, close and dispose invalidate before abort and reject already queued reads', async (t) => {
  for (const action of ['cancel', 'close', 'dispose']) {
    const stream = delayedReader()
    let abortedSnapshot
    const run = owner(t, async (_url, init) => {
      init.signal.addEventListener('abort', () => {
        abortedSnapshot = run.getSnapshot()
      })
      return stream.response
    })
    run.actions.submit(question)
    await stream.chunk(`${wire(events().slice(0, 2))}\n`)
    run.actions.select(run.state().runId, hitKey(hit))
    const before = run.changes.length
    if (action === 'dispose') run.dispose()
    else run.actions[action]()
    cleared(run.state(), action === 'cancel' ? 'cancelled' : 'idle')
    assert.deepEqual(abortedSnapshot.run.hits, [])
    const after = run.getSnapshot()
    await stream.chunk(`${wire(events().slice(2))}\n`)
    assert.equal(run.getSnapshot(), after)
    assert.equal(run.changes.length, before + (action === 'dispose' ? 0 : 1))
    assert.deepEqual(stream.counts(), {
      acquired: 1,
      cancelled: 1,
      released: 1,
    })
  }
})

test('supersession rejects stale read errors/finally and same-key selection without clearing the new request', async (t) => {
  const old = delayedReader(),
    current = delayedReader()
  let calls = 0,
    oldSignal,
    currentSignal
  const run = owner(t, async (_url, init) => {
    if (++calls === 1) {
      oldSignal = init.signal
      return old.response
    }
    currentSignal = init.signal
    return current.response
  })
  run.actions.submit(question)
  await old.chunk(`${wire(events().slice(0, 2))}\n`)
  const oldId = run.state().runId
  run.actions.select(oldId, hitKey(hit))
  run.actions.submit(question)
  const newId = run.state().runId
  assert.notEqual(newId, oldId)
  cleared(run.state(), 'requesting')
  assert.equal(oldSignal.aborted, true)
  await old.reject(new TypeError('Late old read error'))
  assert.equal(currentSignal.aborted, false)
  assert.equal(run.state().runId, newId)
  await current.chunk(`${wire(events().slice(0, 2))}\n`)
  run.actions.select(oldId, hitKey(hit))
  assert.equal(run.state().selectedKey, null)
  run.actions.cancel()
  assert.equal(currentSignal.aborted, true)
  await current.end()
  assert.equal(calls, 2)
  assert.deepEqual(old.counts(), { acquired: 1, cancelled: 1, released: 1 })
})

test('late fetches cancel their body without acquiring a reader; old HTTP JSON cannot overwrite a retry', async (t) => {
  const lateFetch = deferred(),
    lateJson = deferred()
  let bodyCancelled = 0,
    readerAcquired = 0,
    calls = 0
  const run = owner(t, async () => {
    calls++
    if (calls === 1) return lateFetch.promise
    if (calls === 2)
      return { ok: false, status: 429, json: () => lateJson.promise }
    return responseInBytes(wire(events()))
  })
  run.actions.submit(question)
  run.actions.submit(question)
  await tick()
  lateFetch.resolve({
    ok: true,
    body: {
      async cancel() {
        bodyCancelled++
      },
      getReader() {
        readerAcquired++
        throw new Error('Stale reader acquired')
      },
    },
  })
  run.actions.submit(question)
  await until(() => run.state().cursor === 'sealed')
  const finished = run.getSnapshot()
  lateJson.resolve({ error: 'Old throttle message' })
  await tick()
  assert.equal(run.getSnapshot(), finished)
  assert.equal(bodyCancelled, 1)
  assert.equal(readerAcquired, 0)
  assert.equal(run.state().phase, 'done')
})

test('timeout clears immediately even when fetch ignores abort; stale timer cannot cancel a newer run', async (t) => {
  const timers = []
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    const token = { callback, delay, cleared: false }
    timers.push(token)
    return token
  })
  t.mock.method(globalThis, 'clearTimeout', (token) => {
    if (token) token.cleared = true
  })
  const requests = []
  const run = owner(t, async (_url, init) => {
    const response = deferred()
    requests.push({ ...response, signal: init.signal })
    return response.promise
  })
  run.actions.submit(question)
  assert.equal(timers[0].delay, ASSISTANT_TIMEOUT_MS)
  assert.equal(ASSISTANT_TIMEOUT_MS, 60000)
  run.actions.submit(question)
  timers[0].callback()
  assert.equal(requests[1].signal.aborted, false)
  timers[1].callback()
  cleared(run.state(), 'error')
  assert.equal(run.state().failure, 'timeout')
  assert.match(run.state().notice, /60 s/)
  assert.equal(requests[1].signal.aborted, true)
  assert.ok(timers.every((timer) => timer.cleared))
  for (const request of requests) request.resolve(new Response('late'))
  await tick()
  assert.equal(run.state().failure, 'timeout')
})

test('HTTP errors retain server retry guidance, absent/invalid JSON falls back to status, network/body failures stay errors', async (t) => {
  const cases = [
    [
      async () =>
        Response.json(
          { error: 'Please try again in a minute.' },
          { status: 429 }
        ),
      'http',
      /in a minute/,
    ],
    [async () => new Response('bad json', { status: 503 }), 'http', /HTTP 503/],
    [
      async () =>
        Response.json({ error: { unsafe: 'object' } }, { status: 500 }),
      'http',
      /HTTP 500/,
    ],
    [async () => new Response(null), 'protocol', /response was empty/],
    [
      async () => {
        throw new TypeError('Fetch failed')
      },
      'network',
      /Check your connection/,
    ],
  ]
  for (const [fetcher, failure, notice] of cases) {
    const run = owner(t, fetcher)
    run.actions.submit(question)
    await until(() => run.state().phase === 'error')
    cleared(run.state(), 'error')
    assert.equal(run.state().failure, failure)
    assert.match(run.state().notice, notice)
  }
  const stream = delayedReader()
  const run = owner(t, async () => stream.response)
  run.actions.submit(question)
  await stream.chunk(`${wire(events().slice(0, 3))}\n`)
  await stream.reject(new TypeError('Reader failed'))
  cleared(run.state(), 'error')
  assert.equal(run.state().failure, 'network')
  assert.deepEqual(stream.counts(), { acquired: 1, cancelled: 1, released: 1 })
})

test('malformed/truncated/extra events after answer or done clear all data instead of preserving partial success', async (t) => {
  const badOrder = events()
  ;[badOrder[0], badOrder[1]] = [badOrder[1], badOrder[0]]
  const overflow = events(
    Array.from({ length: 5 }, (_, i) => ({ ...hit, chunkId: `chunk-${i}` }))
  )
  const inconsistent = events()
  inconsistent[2].answer = { ...inconsistent[2].answer, citations: [] }
  for (const text of [
    '',
    wire(events().slice(0, 2)),
    wire(badOrder),
    wire(overflow),
    wire(inconsistent),
    `${wire(events().slice(0, 3))}\n{`,
    `${wire(events())}\n{"type":"retrieval"}`,
    `${wire(events())}\n${JSON.stringify(events()[3])}`,
    `${wire(events())}\nfalse`,
    `${wire(events())}\n{"type":"generation"}`,
    `${wire(events())}\n{"type":"done","durationMs":1e400}`,
  ]) {
    const run = owner(t, async () => responseInBytes(text))
    run.actions.submit(question)
    await until(() => run.state().cursor === 'sealed')
    cleared(run.state(), 'error')
    assert.equal(run.state().failure, 'protocol', text)
    assert.equal(run.getSnapshot().result, 'none')
  }
})

test('late content after done is still validated before sealing', async (t) => {
  const stream = delayedReader()
  let signal
  const run = owner(t, async (_url, init) => {
    signal = init.signal
    return stream.response
  })
  run.actions.submit(question)
  await stream.chunk(`${wire(events())}\n`)
  assert.equal(run.state().phase, 'done')
  run.actions.select(run.state().runId, hitKey(hit))
  await stream.chunk('{"type":"generation"}\n')
  cleared(run.state(), 'error')
  assert.equal(signal.aborted, true)
  assert.deepEqual(stream.counts(), { acquired: 1, cancelled: 1, released: 1 })
})

test('pending-buffer bound is preserved, not treated as a cumulative response-byte limit', async (t) => {
  const large = owner(t, async () => new Response(' '.repeat(100001)))
  large.actions.submit(question)
  await until(() => large.state().phase === 'error')
  assert.match(large.state().notice, /exceeded the page’s limit/)
  const run = owner(
    t,
    async () =>
      new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder()
            for (let i = 0; i < 120; i++)
              controller.enqueue(encoder.encode(`${' '.repeat(1000)}\n`))
            controller.enqueue(encoder.encode(wire(events())))
            controller.close()
          },
        })
      )
  )
  run.actions.submit(question)
  await until(() => run.state().cursor === 'sealed')
  assert.equal(run.state().phase, 'done')
})

test('normalization ignores empty input, caps at 600 units, and identical submissions/mounts get distinct IDs', async (t) => {
  const bodies = []
  const run = owner(t, async (_url, init) => {
    bodies.push(JSON.parse(init.body).question)
    return new Response('')
  })
  run.actions.submit('   ')
  assert.equal(run.state().runId, null)
  const raw = ' x'.repeat(400)
  run.actions.submit(raw)
  const first = run.state().runId
  run.actions.submit(raw)
  assert.notEqual(run.state().runId, first)
  assert.deepEqual(bodies, [raw.trim().slice(0, 600), raw.trim().slice(0, 600)])
  const another = owner(t, async () => new Response(''))
  another.actions.submit(raw)
  assert.notEqual(another.state().runId, first)
})

test('reader cancellation rejection still releases its lock', async (t) => {
  const stream = delayedReader()
  stream.reader.cancel = async () => {
    throw new Error('Cancellation failed')
  }
  const run = owner(t, async () => stream.response)
  run.actions.submit(question)
  await stream.chunk(`${wire(events())}\n`)
  await stream.end()
  assert.equal(stream.counts().released, 1)
  assert.equal(run.state().phase, 'done')
})

test('queued React updates cannot revive cancelled data and effect replay creates a fresh owner', async (t) => {
  const old = delayedReader(),
    current = delayedReader()
  let calls = 0,
    oldSignal
  await withWorkbench(
    t,
    async (_url, init) => {
      if (++calls === 1) {
        oldSignal = init.signal
        return old.response
      }
      return current.response
    },
    {},
    async (ui) => {
      ui.submit(question)
      const oldId = ui.state().runId
      // Queue results without applying the React state updater yet.
      await old.chunk(`${wire(events().slice(0, 2))}\n`)
      ui.nodes()
        .find(
          (node) => node.type === 'button' && node.props.children === 'Cancel'
        )
        .props.onClick()
      ui.render()
      cleared(ui.state(), 'cancelled')
      assert.equal(oldSignal.aborted, true)
      ui.replayEffects()
      ui.render()
      assert.equal(ui.state().phase, 'idle')
      ui.submit(question)
      assert.notEqual(ui.state().runId, oldId)
      await old.chunk(`${wire(events().slice(2))}\n`)
      ui.render()
      assert.equal(ui.state().phase, 'requesting')
      await current.chunk(`${wire(events())}\n`)
      await current.end()
      ui.render()
      assert.equal(ui.state().completion, 'complete')
      assert.equal(calls, 2)
    }
  )
})

test('queued source focus is fenced by run/revision/key and resolves the current DOM row after commit', async (t) => {
  let focused = 0,
    scrolled = 0,
    lookedUp = 0,
    calls = 0
  const nextFetch = deferred()
  const oldDocument = globalThis.document
  try {
    await withWorkbench(
      t,
      async () =>
        ++calls === 1 ? responseInBytes(wire(events())) : nextFetch.promise,
      {},
      async (ui) => {
        ui.submit(question)
        await until(() => {
          ui.render()
          return ui.state().cursor === 'sealed'
        })
        const runId = ui.state().runId
        globalThis.document = {
          getElementById(id) {
            lookedUp++
            assert.match(id, /-s-1$/)
            return {
              dataset: { runId, hitKey: hitKey(hit) },
              querySelector: () => ({
                focus: () => {
                  focused++
                },
              }),
              scrollIntoView: () => {
                scrolled++
              },
            }
          },
        }
        const reveal = () =>
          ui
            .nodes()
            .find(
              (node) =>
                node.type === 'button' &&
                Array.isArray(node.props.children) &&
                node.props.children[0] === 'Show passage '
            )
            .props.onClick()
        reveal()
        ui.render()
        assert.equal(focused, 1)
        assert.equal(scrolled, 1)
        // Queue another reveal, then supersede before that commit can focus anything.
        reveal()
        ui.nodes()
          .find((node) => node.type === 'form')
          .props.onSubmit({ preventDefault() {} })
        ui.render()
        assert.equal(lookedUp, 1)
        cleared(ui.state(), 'requesting')
        nextFetch.resolve(new Response(''))
        await tick()
      }
    )
  } finally {
    globalThis.document = oldDocument
  }
})

test('public evaluation fixtures all satisfy the shared source-only protocol and exact citations', async (t) => {
  const { createAssistantHandler } = load(
    path.join(root, 'lib/assistant/handler.ts')
  )
  const { publishedKnowledge, knowledgeHref } = load(
    path.join(root, 'lib/knowledge/catalog.ts')
  )
  const fixtures = require('./retrieval-fixtures.json')
  for (const fixture of fixtures.cases) {
    const handler = createAssistantHandler({
      records: publishedKnowledge,
      href: knowledgeHref,
      env: {},
    })
    const run = owner(t, async (_url, init) =>
      handler(
        new Request('https://portfolio.test/api/assistant', {
          ...init,
          headers: { ...init.headers, origin: 'https://portfolio.test' },
        })
      )
    )
    run.actions.submit(fixture.question)
    await until(() => run.state().cursor === 'sealed')
    assert.equal(run.state().completion, 'complete', fixture.id)
    assert.equal(
      run.state().answer.mode,
      fixture.expectedEmpty ? 'abstained' : 'sources',
      fixture.id
    )
    assert.deepEqual(
      run.state().answer.citations.map((citation) => citation.quote),
      run.state().hits.map((view) => view.hit.text),
      fixture.id
    )
  }
})

test('truncation preserves the request body while accepting the server-normalized echoed question', async (t) => {
  const { createAssistantHandler } = load(
    path.join(root, 'lib/assistant/handler.ts')
  )
  const handler = createAssistantHandler({
    records: [],
    href: () => '/',
    env: {},
  })
  const raw = 'x '.repeat(400)
  let submitted
  const run = owner(t, async (_url, init) => {
    submitted = JSON.parse(init.body).question
    return handler(
      new Request('https://portfolio.test/api/assistant', {
        ...init,
        headers: { ...init.headers, origin: 'https://portfolio.test' },
      })
    )
  })
  run.actions.submit(raw)
  await until(() => run.state().cursor === 'sealed')
  assert.equal(submitted, raw.trim().slice(0, 600))
  assert.equal(run.state().completion, 'complete')
  assert.equal(run.state().question, submitted.trim())
})
