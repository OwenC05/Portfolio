// Canonical site origin for metadata/sitemap/robots.
// Order: explicit env → Vercel deployment host → local placeholder.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000' // placeholder until NEXT_PUBLIC_SITE_URL is set in prod
}

export const siteUrl = resolveSiteUrl()
