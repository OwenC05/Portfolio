import { describe, expect, it } from 'vitest'
import { createPortfolioHandler } from './handler'
const make = (
  body: unknown,
  headers: Record<string, string> = {},
  method = 'POST'
) =>
  new Request('http://localhost:3000/mcp', {
    method,
    headers: {
      host: 'localhost:3000',
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...headers,
    },
    ...(method === 'POST'
      ? { body: typeof body === 'string' ? body : JSON.stringify(body) }
      : {}),
  })
const initialize = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'test', version: '1' },
  },
}
describe('MCP HTTP boundary', () => {
  it('accepts legacy initialize and never caches MCP', async () => {
    const response = await createPortfolioHandler()(make(initialize))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).toContain('protocolVersion')
  })
  it('rejects hostile host/origin and permits no-origin native clients', async () => {
    const handle = createPortfolioHandler()
    for (const headers of <Record<string, string>[]>[
      { host: 'evil.invalid' },
      { origin: 'https://evil.invalid' },
      { origin: 'null' },
      { origin: 'https://localhost, https://evil.invalid' },
    ]) {
      const response = await handle(make(initialize, headers))
      expect(response.status).toBe(403)
      expect(response.headers.get('cache-control')).toBe('no-store')
    }
    expect(
      (await handle(make(initialize, { origin: 'http://localhost:9000' })))
        .status
    ).toBe(200)
  })
  it('requires Host and the protocol media types', async () => {
    const handle = createPortfolioHandler()
    const noHost = make(initialize)
    noHost.headers.delete('host')
    expect((await handle(noHost)).status).toBe(403)
    expect(
      (await handle(make(initialize, { 'content-type': 'text/plain' }))).status
    ).toBe(415)
    expect(
      (await handle(make(initialize, { accept: 'text/html' }))).status
    ).toBe(406)
  })
  it('rejects unsupported HTTP methods and exposes only guarded preflight', async () => {
    const handle = createPortfolioHandler()
    for (const method of ['GET', 'DELETE'])
      expect((await handle(make(null, {}, method))).status).toBe(405)
    const safe = await handle(
      make(null, { origin: 'http://localhost:3000' }, 'OPTIONS')
    )
    expect(safe.status).toBe(204)
    expect(safe.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:3000'
    )
    expect(
      (await handle(make(null, { origin: 'https://evil.invalid' }, 'OPTIONS')))
        .status
    ).toBe(403)
  })
  it('disables modern persistent subscriptions and rejects unsupported metadata', async () => {
    const handle = createPortfolioHandler()
    const meta = {
      'io.modelcontextprotocol/protocolVersion': '2026-07-28',
      'io.modelcontextprotocol/clientInfo': { name: 'test', version: '1' },
      'io.modelcontextprotocol/clientCapabilities': {},
    }
    const body = {
      jsonrpc: '2.0',
      id: 2,
      method: 'subscriptions/listen',
      params: { notifications: {}, _meta: meta },
    }
    const response = await handle(
      make(body, {
        'mcp-protocol-version': '2026-07-28',
        'mcp-method': 'subscriptions/listen',
      })
    )
    expect(await response.text()).toContain('Subscription limit reached')
    const unsupported = await handle(
      make(
        {
          ...body,
          params: {
            ...body.params,
            _meta: {
              ...meta,
              'io.modelcontextprotocol/protocolVersion': '2099-01-01',
            },
          },
        },
        {
          'mcp-protocol-version': '2099-01-01',
          'mcp-method': 'subscriptions/listen',
        }
      )
    )
    expect(await unsupported.text()).toContain('error')
  })
  it('bounds original request bodies including dishonest content length', async () => {
    const handle = createPortfolioHandler()
    for (const headers of <Record<string, string>[]>[
      {},
      { 'content-length': '1' },
      { 'content-length': '20000' },
    ]) {
      expect((await handle(make(' '.repeat(17000), headers))).status).toBe(413)
    }
    expect((await handle(make('{'))).status).toBeGreaterThanOrEqual(400)
    expect((await handle(make(''))).status).toBeGreaterThanOrEqual(400)
  })
  it('bounds streamed bodies without trusting a declared length', async () => {
    const handle = createPortfolioHandler()
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(9000).fill(32))
        controller.enqueue(new Uint8Array(9000).fill(32))
        controller.close()
      },
    })
    const request = new Request('http://localhost:3000/mcp', {
      method: 'POST',
      headers: {
        host: 'localhost',
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body,
      duplex: 'half',
    } as RequestInit)
    expect((await handle(request)).status).toBe(413)
  })
  it('has one shared rate limit regardless of spoofed forwarded identities', async () => {
    const handle = createPortfolioHandler({ capacity: 2, perMinute: 120 })
    expect(
      (await handle(make(initialize, { 'x-forwarded-for': 'a' }))).status
    ).toBe(200)
    expect(
      (await handle(make(initialize, { 'x-forwarded-for': 'b' }))).status
    ).toBe(200)
    const denied = await handle(make(initialize, { 'x-forwarded-for': 'c' }))
    expect(denied.status).toBe(429)
    expect(denied.headers.get('retry-after')).toBeTruthy()
  })
})
