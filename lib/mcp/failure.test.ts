import { afterEach, expect, it, vi } from 'vitest'
const sdk = vi.hoisted(() => ({
  fetch: vi.fn<(request: Request) => Promise<Response>>(),
}))
vi.mock('@modelcontextprotocol/server', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@modelcontextprotocol/server')>()
  return {
    ...actual,
    createMcpHandler: () => ({ fetch: sdk.fetch }),
  }
})
import { createPortfolioHandler } from './handler'
afterEach(() => {
  vi.restoreAllMocks()
  sdk.fetch.mockReset()
})
it('unexpected SDK rejection fails closed without exposing or logging details', async () => {
  sdk.fetch.mockRejectedValueOnce(new Error('PRIVATE_ERROR_SENTINEL'))
  const logs = [
    vi.spyOn(console, 'log').mockImplementation(() => {}),
    vi.spyOn(console, 'warn').mockImplementation(() => {}),
    vi.spyOn(console, 'error').mockImplementation(() => {}),
  ]
  const response = await createPortfolioHandler()(
    new Request('http://localhost/mcp', {
      method: 'POST',
      headers: { host: 'localhost', 'content-type': 'application/json' },
      body: '{}',
    })
  )
  expect(response.status).toBe(500)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toEqual({
    error: 'Unable to process MCP request.',
  })
  for (const log of logs) expect(log).not.toHaveBeenCalled()
})

it('never dispatches JSON arrays to the SDK', async () => {
  const response = await createPortfolioHandler()(
    new Request('http://localhost/mcp', {
      method: 'POST',
      headers: { host: 'localhost', 'content-type': 'application/json' },
      body: '[{}]',
    })
  )
  expect(response.status).toBe(400)
  expect(sdk.fetch).not.toHaveBeenCalled()
})
it('preserves headers, body and AbortSignal in the bounded forwarded request', async () => {
  sdk.fetch.mockResolvedValueOnce(new Response('{}'))
  const controller = new AbortController()
  const original = new Request('http://localhost/mcp', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      host: 'localhost',
      'content-type': 'application/json',
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': 'tools/list',
      'x-test-marker': 'preserved',
    },
    body: '{"jsonrpc":"2.0"}',
  })
  await createPortfolioHandler()(original)
  const forwarded = sdk.fetch.mock.calls[0][0]
  expect([...forwarded.headers]).toEqual([...original.headers])
  expect(await forwarded.text()).toBe('{"jsonrpc":"2.0"}')
  expect(forwarded.signal.aborted).toBe(false)
  controller.abort()
  expect(forwarded.signal.aborted).toBe(true)
})
