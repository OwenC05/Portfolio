import { describe, expect, it } from 'vitest'
import { resolveSiteUrl } from './siteUrl'

describe('canonical site origin', () => {
  it('uses explicit origin before Vercel environment values', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://owencdev.info/', VERCEL_PROJECT_PRODUCTION_URL: 'production.vercel.app', VERCEL_URL: 'preview.vercel.app' })).toBe('https://owencdev.info')
  })

  it('prefers the production hostname over deployment hostname', () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'production.vercel.app', VERCEL_URL: 'preview.vercel.app' })).toBe('https://production.vercel.app')
    expect(resolveSiteUrl({ VERCEL_URL: 'preview.vercel.app' })).toBe('https://preview.vercel.app')
  })

  it('supports local ports and IPv6 without deriving URLs from request headers', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3100' })).toBe('http://localhost:3100')
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://[::1]:3000/' })).toBe('http://[::1]:3000')
    expect(resolveSiteUrl({})).toBe('http://localhost:3000')
  })

  it.each(['', ' ', 'example.com', 'ftp://example.com', 'https://user:secret@example.com', 'https://@example.com', 'https://example.com/path', 'https://example.com//', 'https://example.com?query', 'https://example.com#fragment', 'https://example.com?', 'https://example.com#', ' https://example.com', 'https://example.com\\evil', 'https://example.com/..'])('fails clearly on an invalid explicit value: %j', (value) => {
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: value, VERCEL_URL: 'fallback.vercel.app' })).toThrow('NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin')
  })

  it.each(['', 'https://example.com', 'example.com/path', 'user@example.com', 'example.com?x', 'example.com#x'])('rejects invalid Vercel hostname configuration: %j', (value) => {
    expect(() => resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: value })).toThrow('VERCEL_PROJECT_PRODUCTION_URL must be a hostname')
  })
})
