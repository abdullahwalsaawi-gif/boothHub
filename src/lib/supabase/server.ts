import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from './sanitize'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // Can be ignored if middleware is updating sessions.
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY)
  // Service role key in Supabase must be a JWT token starting with "eyJ"
  if (!serviceRoleKey || !supabaseUrl || !serviceRoleKey.startsWith('eyJ')) return null

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
