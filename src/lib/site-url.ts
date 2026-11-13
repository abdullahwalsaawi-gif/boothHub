import { headers } from 'next/headers'

/**
 * Returns the resolved base site URL.
 * Prioritizes:
 * 1. NEXT_PUBLIC_SITE_URL environment variable if explicitly set
 * 2. Dynamic host header from incoming request (supports production Netlify & localhost)
 * 3. Netlify system URL environment variable (URL or DEPLOY_PRIME_URL)
 * 4. Production fallback domain (https://boothhub-sa.netlify.app)
 * 5. Localhost fallback for local development (http://localhost:3000)
 */
export async function getSiteUrl(): Promise<string> {
  // 1. Explicitly configured NEXT_PUBLIC_SITE_URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl) {
    return envUrl.replace(/\/+$/, '')
  }

  // 2. Incoming request headers (works seamlessly in Server Actions & Route Handlers)
  try {
    const headerList = await headers()
    const host = headerList.get('x-forwarded-host') || headerList.get('host')
    const proto = headerList.get('x-forwarded-proto') || 'https'
    if (host) {
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
      const protocol = isLocal ? 'http' : (proto || 'https')
      return `${protocol}://${host}`
    }
  } catch {
    // headers() might not be available outside of request scopes
  }

  // 3. Netlify system URL
  const netlifyUrl = process.env.URL?.trim() || process.env.DEPLOY_PRIME_URL?.trim()
  if (netlifyUrl) {
    return netlifyUrl.replace(/\/+$/, '')
  }

  // 4. Production fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://boothhub-sa.netlify.app'
  }

  // 5. Local development fallback
  return 'http://localhost:3000'
}

/**
 * Returns the full absolute URL for auth callbacks or redirects.
 */
export async function getAuthRedirectUrl(subpath: string = '/auth/callback'): Promise<string> {
  const baseUrl = await getSiteUrl()
  const cleanSubpath = subpath.startsWith('/') ? subpath : `/${subpath}`
  return `${baseUrl}${cleanSubpath}`
}
