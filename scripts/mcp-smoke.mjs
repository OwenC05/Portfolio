import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client'

const endpoint = new URL(process.argv[2] ?? 'http://localhost:3000/mcp')
if (
  !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname) ||
  !['http:', 'https:'].includes(endpoint.protocol)
)
  throw new Error('Smoke verification is restricted to a local preview.')
const denied =
  /Owen_Cheung_-_AI_Researcher|currently on placement|not built yet|empirical.Bayes/
let source = ''
try {
  source = await readFile(
    new URL('../Owen_Cheung_-_AI_Researcher.md', import.meta.url),
    'utf8'
  )
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}
const references = source.split(/^## References\s*$/m)[1] ?? ''
const excluded = references
  .split('\n')
  .filter((line) => line.startsWith('- '))
  .flatMap((line) => [
    line.match(/^- (.*?)\s*\(/)?.[1],
    line.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]+/)?.[0],
  ])
  .filter(Boolean)
const phone = source.match(/^\+\d[\d\s-]+(?=,)/m)?.[0]?.replace(/\D/g, '')
const referenceCount = references
  .split('\n')
  .filter((line) => line.startsWith('- ')).length
const privateSourceChecks =
  Boolean(phone) && referenceCount > 0 && excluded.length === referenceCount * 2
if (source)
  assert(
    privateSourceChecks,
    'Private-source exclusions could not be derived completely'
  )
function privacy(text) {
  assert(!denied.test(text), 'Private or obsolete content found')
  for (const value of excluded)
    assert(
      !text.toLowerCase().includes(value.toLowerCase()),
      'Excluded reference field found'
    )
  if (phone)
    assert(!text.replace(/\D/g, '').includes(phone), 'Excluded phone found')
}
let assertions = 0
const check = (value) => {
  const text = JSON.stringify(value)
  privacy(text)
  assert(Buffer.byteLength(text) < 65536, 'Response exceeds budget')
  assertions++
}
for (const mode of ['legacy', { pin: '2026-07-28' }]) {
  const formats = new Set()
  const transport = new StreamableHTTPClientTransport(endpoint, {
    fetch: async (input, init) => {
      const response = await fetch(input, { ...init, redirect: 'error' })
      if (response.ok && response.headers.has('content-type'))
        formats.add(response.headers.get('content-type').split(';')[0])
      assert.equal(response.headers.get('cache-control'), 'no-store')
      const wire = await response.clone().text()
      assert(Buffer.byteLength(wire) < 65536, 'Wire response exceeds budget')
      privacy(wire)
      return response
    },
  })
  const client = new Client(
    { name: 'portfolio-verifier', version: '1.0.0' },
    { capabilities: {}, versionNegotiation: { mode } }
  )
  try {
    await client.connect(transport)
    const tools = await client.listTools()
    assert.deepEqual(tools.tools.map((t) => t.name).sort(), [
      'get_project',
      'search_projects',
    ])
    check(tools)
    const resources = await client.listResources()
    assert.equal(resources.resources.length, 6)
    for (const resource of resources.resources)
      check(await client.readResource({ uri: resource.uri }))
    const search = await client.callTool({
      name: 'search_projects',
      arguments: { query: '', limit: 5 },
    })
    check(search)
    assert.equal(search.structuredContent.projects.length, 3)
    for (const p of search.structuredContent.projects) {
      const found = await client.callTool({
        name: 'get_project',
        arguments: { slug: p.slug },
      })
      check(found)
      assert.equal(found.structuredContent.project.slug, p.slug)
      assert(
        new URL(found.structuredContent.project.url).pathname ===
          `/projects/${p.slug}`
      )
    }
    const invalid = await client.callTool({
      name: 'get_project',
      arguments: { slug: '../private' },
    })
    assert.equal(invalid.isError, true)
    for (const args of [{ query: 'a'.repeat(201) }, { query: '', limit: 6 }]) {
      assert.equal(
        (await client.callTool({ name: 'search_projects', arguments: args }))
          .isError,
        true
      )
    }
    await assert.rejects(client.readResource({ uri: 'file:///private' }))
    console.log(
      JSON.stringify({
        mode,
        tools: tools.tools.length,
        resources: resources.resources.length,
        projects: 3,
        responseFormats: [...formats],
        assertions,
        result: 'PASS',
        privateSourceChecks,
      })
    )
  } finally {
    await client.close()
  }
}
console.log('Official @modelcontextprotocol/client 2.2.0 interoperability PASS')

for (const count of [0, 1, 4, 10]) {
  const body = Array.from({ length: count }, (_, id) => ({
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name: 'search_projects', arguments: { query: '', limit: 5 } },
  }))
  const response = await fetch(endpoint, {
    method: 'POST',
    redirect: 'error',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify(body),
  })
  const wire = await response.text()
  assert.equal(response.status, 400)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert(wire.includes('Batch requests are not supported'))
  assert(Buffer.byteLength(wire) < 65536)
  assert(!wire.includes('structuredContent'))
}
console.log(
  'Single-message policy: empty/single/four/ten-element batch rejection PASS'
)
