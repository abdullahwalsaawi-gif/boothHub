import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from './sanitize'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseKey = sanitizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run Supabase code if keys are missing
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes check
    const path = request.nextUrl.pathname
    if (!user && (path.startsWith('/dashboard'))) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (err) {
    console.error('Middleware auth check error:', err)
  }

  return supabaseResponse
}
