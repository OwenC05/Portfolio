import {
  createMcpHandler,
  hostHeaderValidationResponse,
  originValidationResponse,
  isJsonContentType,
  readRequestBody,
} from '@modelcontextprotocol/server'
import { siteUrl } from '../siteUrl'
import { buildPortfolioServer } from './server'
import { createRateLimit } from './rateLimit'

const allowedHostnames = [
  ...new Set([new URL(siteUrl).hostname, 'localhost', '127.0.0.1', '[::1]']),
]
export function createPortfolioHandler(
  options: { capacity?: number; perMinute?: number } = {}
) {
  const take = createRateLimit(options.capacity, options.perMinute)
  const sdk = createMcpHandler(buildPortfolioServer, {
    legacy: 'stateless',
    maxRequestBodySize: 16384,
    maxSubscriptions: 0, // No persistent streams for this finite public dataset.
  })
  return async (request: Request): Promise<Response> => {
    const finish = (response: Response) => {
      response.headers.set('Cache-Control', 'no-store')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      return response
    }
    const rejected =
      hostHeaderValidationResponse(request, allowedHostnames) ??
      originValidationResponse(request, allowedHostnames)
    if (rejected) return finish(rejected)
    const allowance = take()
    if (!allowance.allowed)
      return finish(
        new Response('Request limit reached. Try again shortly.', {
          status: 429,
          headers: { 'Retry-After': String(allowance.retryAfter) },
        })
      )
    const origin = request.headers.get('origin')
    if (request.method === 'OPTIONS') {
      return finish(
        new Response(null, {
          status: 204,
          headers: {
            Allow: 'POST, OPTIONS',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Accept, MCP-Protocol-Version, MCP-Method, MCP-Name',
            ...(origin
              ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
              : {}),
          },
        })
      )
    }
    if (request.method !== 'POST')
      return finish(
        new Response('Method not allowed', {
          status: 405,
          headers: { Allow: 'POST, OPTIONS' },
        })
      )
    if (!isJsonContentType(request.headers.get('content-type')))
      return finish(
        new Response('Content-Type must be application/json.', { status: 415 })
      )
    try {
      // Bound the ORIGINAL stream with the official reader before envelope inspection.
      // Do not clone an unbounded body or bypass the SDK limit with parsedBody.
      let body: Awaited<ReturnType<typeof readRequestBody>>
      try {
        body = await readRequestBody(request, 16384)
      } catch {
        return finish(
          new Response('Request body could not be read.', { status: 400 })
        )
      }
      if (body.tooLarge)
        return finish(
          new Response('Request body exceeds 16 KiB.', { status: 413 })
        )
      let isBatch = false
      try {
        isBatch = Array.isArray(JSON.parse(body.text))
      } catch {
        // Malformed JSON remains the SDK's protocol-error responsibility.
      }
      if (isBatch)
        return finish(
          new Response(
            'Batch requests are not supported. Send one MCP message per request.',
            { status: 400 }
          )
        )
      // Only bounded text is reconstructed; Request inherits headers and AbortSignal.
      const response = await sdk.fetch(
        new Request(request, { body: body.text })
      )
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Vary', 'Origin')
      }
      return finish(response)
    } catch {
      // Deliberately do not log request content, identifiers, headers or raw errors.
      return finish(
        Response.json(
          { error: 'Unable to process MCP request.' },
          { status: 500 }
        )
      )
    }
  }
}
export const portfolioMcpHandler = createPortfolioHandler()
