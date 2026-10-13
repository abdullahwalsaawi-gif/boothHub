/**
 * Normalizes and sanitizes Supabase URL and Key inputs to prevent common
 * configuration errors like trailing slashes, accidental whitespace, or
 * mistakenly copied subpaths (such as `/rest/v1` or `/auth/v1` which trigger PGRST125).
 */
export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return ''
  let url = rawUrl.trim()

  // Remove trailing slashes
  url = url.replace(/\/+$/, '')

  // Strip accidental REST API subpaths if mistakenly appended in environment variables
  url = url.replace(/\/rest\/v1\/?$/i, '')
  url = url.replace(/\/rest\/?$/i, '')

  // Strip accidental Auth subpaths
  url = url.replace(/\/auth\/v1\/?$/i, '')

  // Clean any remaining trailing slashes
  url = url.replace(/\/+$/, '')

  return url
}

export function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return ''
  return rawKey.trim()
}
