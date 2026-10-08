/** Build-time configuration only: canonical citations never trust request headers. */
export type SiteUrlEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string
  VERCEL_PROJECT_PRODUCTION_URL?: string
  VERCEL_URL?: string
}

function validateOrigin(value: string, label: string): string {
  // Check the original spelling too: URL normalisation can hide /.., empty ?/#,
  // backslashes or whitespace that are not an origin-only configuration.
  if (!/^https?:\/\/[^/?#@\\\s]+\/?$/i.test(value)) {
    throw new Error(
      `${label} must be an HTTP(S) origin without credentials, path, query or fragment`
    )
  }
  try {
    const url = new URL(value)
    if (url.username || url.password || !url.hostname)
      throw new Error('Invalid origin')
    return url.origin
  } catch {
    throw new Error(
      `${label} must be an HTTP(S) origin without credentials, path, query or fragment`
    )
  }
}

function vercelOrigin(hostname: string, label: string): string {
  if (!hostname || /[\s/@?#\\:]/.test(hostname)) {
    throw new Error(
      `${label} must be a hostname without scheme, credentials, path or port`
    )
  }
  return validateOrigin(`https://${hostname}`, label)
}

export function resolveSiteUrl(env: SiteUrlEnvironment): string {
  if (env.NEXT_PUBLIC_SITE_URL !== undefined)
    return validateOrigin(env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL')
  if (env.VERCEL_PROJECT_PRODUCTION_URL !== undefined)
    return vercelOrigin(
      env.VERCEL_PROJECT_PRODUCTION_URL,
      'VERCEL_PROJECT_PRODUCTION_URL'
    )
  if (env.VERCEL_URL !== undefined)
    return vercelOrigin(env.VERCEL_URL, 'VERCEL_URL')
  return 'http://localhost:3000'
}

export const siteUrl = resolveSiteUrl({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  VERCEL_URL: process.env.VERCEL_URL,
})
