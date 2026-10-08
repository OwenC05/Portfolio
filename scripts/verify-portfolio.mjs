// Local, dependency-free publication smoke test. Never prints private source values.
// Usage: node scripts/verify-portfolio.mjs http://localhost:3000
import { readFile } from 'node:fs/promises'

const base = new URL(process.argv[2] ?? 'http://localhost:3000')
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) || !['http:', 'https:'].includes(base.protocol)) {
  throw new Error('Verification is restricted to a local preview.')
}
const slugs = ['lexisnexis-applied-ai', 'lexisnexis-ml', 'typeforge']
const errors = []
let assertions = 0
let linkChecks = 0
const documents = new Map()
const canonicalOrigins = new Set([base.origin])
function check(condition, message) {
  assertions++
  if (!condition) errors.push(message)
}
function decode(value) {
  return value.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}
const readable = (value) => decode(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ')).replace(/\\([\\`*_{}\[\]<>#+.!|])/g, '$1').replace(/\s+/g, ' ').trim()
const source = await readFile(new URL('../Owen_Cheung_-_AI_Researcher.md', import.meta.url), 'utf8')
const references = source.split(/^## References\s*$/m)[1]
const phone = source.match(/^\+\d[\d\s-]+(?=,)/m)?.[0]
const denied = references?.split('\n').filter(line => line.startsWith('- ')).flatMap(line => [
  line.match(/^- (.*?)\s*\(/)?.[1],
  line.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]+/)?.[0],
]).filter(Boolean) ?? []
check(Boolean(phone) && denied.length === 6, 'Private-source negative checks could not be derived completely')
const email = source.match(/Email:\s*(\S+)/)?.[1]
const linkedin = source.match(/\[LinkedIn\]\(([^)]+)\)/)?.[1]

function privacy(body, label) {
  const normalized = readable(body).toLowerCase()
  denied.forEach((value, index) => check(!normalized.includes(value.toLowerCase()), `${label}: excluded reference field ${index + 1} leaked`))
  if (phone) check(!body.replace(/\D/g, '').includes(phone.replace(/\D/g, '')), `${label}: excluded phone leaked`)
  check(!/Owen_Cheung_-_AI_Researcher\.(?:md|pdf)/i.test(body), `${label}: raw source filename exposed`)
  check(!/(?:currently|current role is|i am|i'm)\s+(?:on\s+)?(?:an?\s+)?(?:industrial\s+)?placement/i.test(normalized), `${label}: stale current placement claim`)
  check(!/\b180\s*wpm\b/i.test(normalized), `${label}: stale typing fact`)
}
async function get(path, expected = 200) {
  const key = new URL(path, base).pathname + new URL(path, base).search
  if (documents.has(key)) {
    const cached = documents.get(key)
    check(cached.status === expected, `${key}: expected ${expected}, got ${cached.status}`)
    return cached
  }
  check(documents.size < 80, 'Bounded local crawl exceeded 80 documents')
  if (documents.size >= 80) return null
  // No redirects are followed: a public href must not make the verifier contact another host.
  const response = await fetch(new URL(key, base), { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  const body = await response.text()
  const document = { body, type: response.headers.get('content-type') ?? '', headers: response.headers, status: response.status }
  documents.set(key, document)
  check(response.status === expected, `${key}: expected ${expected}, got ${response.status}`)
  privacy(body, key)
  return document
}
const requireText = (body, pattern, label) => check(pattern.test(readable(body)), label)

try {
  const json = await get('/portfolio.json')
  check(json.type.includes('application/json'), 'Portfolio JSON content type')
  const portfolio = JSON.parse(json.body)
  check(portfolio.schemaVersion === '1.0', 'JSON schema version')
  check(portfolio.profile.email === email, 'Latest email parity')
  check(portfolio.profile.linkedin === linkedin, 'Latest LinkedIn parity')
  check(portfolio.projects.length === 3 && slugs.every(slug => portfolio.projects.some(project => project.slug === slug)), 'Three approved project slugs')
  check(portfolio.projects.filter(p => p.selected).map(p => p.slug).join() === slugs.slice(0, 3).join(), 'Selected project order')
  for (const project of portfolio.projects) canonicalOrigins.add(new URL(project.url).origin)

  const humanPaths = ['/', '/projects', '/about', '/contact', '/agents', ...slugs.map(slug => `/projects/${slug}`)]
  for (const path of humanPaths) {
    const page = await get(path)
    check(page.type.includes('text/html'), `${path}: HTML content type`)
    check(/<h1[\s>]/i.test(page.body), `${path}: readable H1`)
    check(/<title>[^<]+<\/title>/i.test(page.body), `${path}: nonempty metadata title`)
    check(page.body.includes(email), `${path}: current email contact`)
    check(page.body.includes(linkedin), `${path}: current LinkedIn contact`)
  }
  const md = await get('/portfolio.md')
  check(md.type.includes('text/markdown'), 'Portfolio Markdown content type')
  check(readable(md.body).includes(email), 'Markdown current email')
  check(md.body.includes(linkedin), 'Markdown current LinkedIn')
  for (const [label, body] of [['JSON', json.body], ['Markdown', md.body], ['About', documents.get('/about').body]]) {
    requireText(body, /AI Engineer \(Agentic AI\)/i, `${label}: current AI engineering role`)
    requireText(body, /Aug 2026.{0,12}present.{0,12}Contract/i, `${label}: current contract date`)
    requireText(body, /Jul 2025.{0,12}Aug 2026.{0,12}Industrial placement/i, `${label}: prior placement date`)
  }
  requireText(documents.get('/about').body, /193\s*wpm/, 'About current typing fact')
  for (const slug of slugs) {
    const path = `/projects/${slug}/markdown`
    const document = await get(path)
    const project = portfolio.projects.find(p => p.slug === slug)
    check(document.type.includes('text/markdown'), `${path}: Markdown content type`)
    check(document.body.includes(project.url), `${path}: canonical citation`)
    for (const [label, body] of [['JSON', JSON.stringify(project)], ['HTML', documents.get(`/projects/${slug}`).body], ['Markdown', document.body]]) {
      check(readable(body).includes(project.status), `${slug} ${label}: status parity`)
      if (slug === 'typeforge') {
        requireText(body, /in development/i, `${label}: TypeForge development status`)
        requireText(body, /(?:implemented.{0,50}(?:drills|adaptive)|(?:drills|adaptive).{0,100}implemented)/i, `${label}: adaptive drills implemented`)
        requireText(body, /developing real-time analytics/i, `${label}: analytics still developing`)
        check(!/in design|not built|empirical.bayes/i.test(readable(body)), `${label}: no stale TypeForge claim`)
      }
      if (slug === 'lexisnexis-applied-ai') {
        requireText(body, /internal pilot/i, `${label}: employer pilot status`)
        requireText(body, /toward production/i, `${label}: employer production boundary`)
        requireText(body, /not a launched production platform/i, `${label}: no launched production claim`)
      }
    }
  }
  const llms = await get('/llms.txt')
  const sitemap = await get('/sitemap.xml')
  check(sitemap.type.includes('xml'), 'Sitemap content type')
  for (const path of ['/portfolio.json', '/portfolio.md', ...slugs.map(slug => `/projects/${slug}/markdown`)]) {
    const document = documents.get(path)
    check(Buffer.byteLength(document.body) <= 65536, `${path}: output within 64 KiB`)
    check(/public/.test(document.headers.get('cache-control') ?? ''), `${path}: public revalidation cache policy`)
  }

  const links = []
  for (const path of humanPaths) {
    const html = documents.get(path).body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']*)["']/gi)) links.push([path, decode(match[1])])
  }
  for (const match of llms.body.matchAll(/\]\(([^)]+)\)/g)) links.push(['/llms.txt', match[1]])
  for (const match of sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)) links.push(['/sitemap.xml', decode(match[1])])
  for (const slug of slugs) for (const match of documents.get(`/projects/${slug}/markdown`).body.matchAll(/Source: <([^>]+)>/g)) links.push([`/projects/${slug}/markdown`, match[1]])
  for (const [from, href] of links) {
    const url = new URL(href, new URL(from, base))
    if (!['http:', 'https:'].includes(url.protocol) || !canonicalOrigins.has(url.origin)) continue
    linkChecks++
    const document = await get(url.pathname + url.search)
    if (url.hash && document) {
      const target = decodeURIComponent(url.hash.slice(1))
      const ids = [...document.body.matchAll(/\bid=["']([^"']+)["']/g)].map(match => decode(match[1]))
      check(ids.includes(target), `${from}: missing local anchor ${url.pathname}#${target}`)
    }
  }
  for (const path of ['/not-a-real-page', '/projects/not-a-real-project', '/projects/not-a-real-project/markdown']) await get(path, 404)
  for (const slug of ['knowtrients', 'sortify', 'dishd']) {
    await get(`/projects/${slug}`, 404)
    await get(`/projects/${slug}/markdown`, 404)
    check(!sitemap.body.includes(`/projects/${slug}`), `Removed ${slug} absent from sitemap`)
  }
  for (const prefix of ['', '/public', '/assets', '/downloads']) {
    for (const extension of ['md', 'pdf']) await get(`${prefix}/Owen_Cheung_-_AI_Researcher.${extension}`, 404)
  }
} catch (error) {
  // Do not print response bodies, filesystem contents or exception messages containing private data.
  errors.push(`Verification aborted (${error instanceof Error ? error.name : 'unknown error'})`)
}
console.log(JSON.stringify({ baseUrl: base.origin, documents: documents.size, internalLinks: linkChecks, assertions, errors, passed: errors.length === 0 }, null, 2))
process.exitCode = errors.length ? 1 : 0
