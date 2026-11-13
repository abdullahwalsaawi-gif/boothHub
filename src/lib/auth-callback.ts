import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Common handler for Supabase Auth email confirmation & OAuth callbacks.
 * Exchanges the PKCE code for a session, securely persists cookies,
 * and redirects the user to the correct role-based dashboard.
 */
export async function handleAuthCallback(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next')
  const origin = requestUrl.origin

  // 1. Handle error parameters returned by Supabase Auth (e.g. expired link)
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || 'فشل التحقق من البريد الإلكتروني'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  // 2. Exchange authorization code for active session
  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('exchangeCodeForSession error:', exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    if (data?.user) {
      let destination = '/dashboard/exhibitor'

      if (data.user.user_metadata?.account_type === 'organizer') {
        destination = '/dashboard/organizer'
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profile?.account_type === 'organizer') {
          destination = '/dashboard/organizer'
        }
      }

      // Respect safe internal relative next parameter
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        destination = next
      }

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // 3. Fallback: check if session already exists
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const destination = user.user_metadata?.account_type === 'organizer' 
        ? '/dashboard/organizer' 
        : '/dashboard/exhibitor'
      return NextResponse.redirect(`${origin}${destination}`)
    }
  } catch {
    // Non-blocking
  }

  return NextResponse.redirect(`${origin}/login`)
}
