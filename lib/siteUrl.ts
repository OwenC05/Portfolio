// Canonical site origin for metadata/sitemap/robots.
// Order: explicit env → Vercel production domain → deployment host → local placeholder.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  // Stable production domain (custom domain if set), unlike per-deploy VERCEL_URL.
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (prod) return `https://${prod}`
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000' // placeholder until NEXT_PUBLIC_SITE_URL is set in prod
}

export const siteUrl = resolveSiteUrl()
