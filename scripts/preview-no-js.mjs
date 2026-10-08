// Test-only localhost proxy: enforce script-src 'none' for safe browser inspection.
// Usage: node scripts/preview-no-js.mjs http://localhost:3000 3001
import { createServer } from 'node:http'

const upstream = new URL(process.argv[2] ?? 'http://localhost:3000')
const port = Number(process.argv[3] ?? 3001)
if (!['localhost', '127.0.0.1', '[::1]'].includes(upstream.hostname) || !['http:', 'https:'].includes(upstream.protocol)) {
  throw new Error('Upstream must be a localhost preview.')
}
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === Number(upstream.port || (upstream.protocol === 'https:' ? 443 : 80))) {
  throw new Error('Choose a distinct unprivileged local proxy port.')
}
const server = createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'")
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  try {
    // Extract path only; an absolute or scheme-relative client URL cannot select a host.
    const path = new URL(request.url, 'http://127.0.0.1')
    const target = new URL(upstream.origin)
    target.pathname = path.pathname
    target.search = path.search
    const result = await fetch(target, { method: request.method, redirect: 'manual', signal: AbortSignal.timeout(15000) })
    // Do not relay Location: navigations cannot escape this script-disabled preview.
    if (result.status >= 300 && result.status < 400) {
      response.writeHead(502).end('Redirects are disabled in this test preview.')
      return
    }
    response.setHeader('Content-Type', result.headers.get('content-type') ?? 'application/octet-stream')
    response.writeHead(result.status)
    // Streaming preserves asset bytes without buffering or forwarding compressed-length headers.
    if (result.body) for await (const chunk of result.body) response.write(chunk)
    response.end()
  } catch {
    if (!response.headersSent) response.writeHead(502)
    response.end('Local preview unavailable.')
  }
})
server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({ url: `http://127.0.0.1:${port}`, upstream: upstream.origin, scripts: 'blocked by CSP', purpose: 'local verification only' })))
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)))
