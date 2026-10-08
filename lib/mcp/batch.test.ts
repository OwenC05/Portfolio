import { expect, it } from 'vitest'
import { createPortfolioHandler } from './handler'

it.each([0, 1, 4, 10])(
  'rejects an entire %i-element JSON array before execution',
  async (count) => {
    const body = Array.from({ length: count }, (_, id) => ({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name: 'search_projects', arguments: { query: '', limit: 5 } },
    }))
    const response = await createPortfolioHandler()(
      new Request('http://localhost/mcp', {
        method: 'POST',
        headers: {
          host: 'localhost',
          'content-type': 'application/json',
          accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify(body),
      })
    )
    const wire = await response.text()
    expect(Buffer.byteLength(wire)).toBeLessThan(65536)
    expect(response.status).toBe(400)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(wire).toContain('Batch requests are not supported')
    expect(wire).not.toContain('structuredContent')
  }
)

it('leaves malformed JSON errors to the SDK', async () => {
  const response = await createPortfolioHandler()(
    new Request('http://localhost/mcp', {
      method: 'POST',
      headers: {
        host: 'localhost',
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: '{',
    })
  )
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({
    jsonrpc: '2.0',
    error: { code: -32700 },
  })
})

it('applies the original-stream byte limit before the array policy', async () => {
  const response = await createPortfolioHandler()(
    new Request('http://localhost/mcp', {
      method: 'POST',
      headers: {
        host: 'localhost',
        'content-type': 'application/json',
        'content-length': '1',
      },
      body: '[' + ' '.repeat(17000) + ']',
    })
  )
  expect(response.status).toBe(413)
  expect(response.headers.get('cache-control')).toBe('no-store')
})
it('rejects unreadable streams without leaking their failure', async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.error(new Error('PRIVATE_STREAM_SENTINEL'))
    },
  })
  const response = await createPortfolioHandler()(
    new Request('http://localhost/mcp', {
      method: 'POST',
      headers: { host: 'localhost', 'content-type': 'application/json' },
      body,
      duplex: 'half',
    } as RequestInit)
  )
  expect(response.status).toBe(400)
  expect(await response.text()).toBe('Request body could not be read.')
})
