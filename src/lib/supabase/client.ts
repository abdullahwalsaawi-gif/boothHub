import { createBrowserClient } from '@supabase/ssr'
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from './sanitize'

export function createClient() {
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}
