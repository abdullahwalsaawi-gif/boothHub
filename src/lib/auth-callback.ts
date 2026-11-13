import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Universal handler for Supabase Auth confirmation & callback routes:
 * 1. Token Hash verification (verifyOtp): Cross-device compatible! Eliminates PKCE code_verifier errors
 *    when registration occurs on one device (e.g. laptop) and email link is opened on another (e.g. mobile/iPad).
 * 2. PKCE code exchange (exchangeCodeForSession): Fallback for same-browser flows, OAuth, and legacy links.
 * 3. Role-based redirect to /dashboard/organizer or /dashboard/exhibitor.
 */
export async function handleAuthConfirmation(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next')
  const origin = requestUrl.origin

  // 1. Handle error parameters returned by Supabase Auth (e.g. expired link)
  if (error || errorDescription) {
    let msg = errorDescription || error || 'فشل التحقق من البريد الإلكتروني'
    if (msg.includes('expired') || msg.includes('otp_expired')) {
      msg = 'انتهت صلاحية رابط التحقق، يرجى طلب رابط جديد أو تسجيل الدخول.'
    } else if (msg.includes('invalid') || msg.includes('access_denied')) {
      msg = 'رابط التحقق غير صالح أو تم استخدامه مسبقاً.'
    }
    const errorRedirect = (next === '/reset-password' || type === 'recovery')
      ? `${origin}/forgot-password?error=${encodeURIComponent(msg)}`
      : `${origin}/login?error=${encodeURIComponent(msg)}`
    return NextResponse.redirect(errorRedirect)
  }

  const supabase = await createClient()

  // 2. Token Hash flow: Cross-device verification without PKCE code_verifier dependency
  if (token_hash) {
    const otpType: EmailOtpType = type || 'email'
    const isRecovery = otpType === 'recovery' || next === '/reset-password'
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash,
    })

    if (verifyError) {
      console.error('verifyOtp error:', verifyError.message)
      let msg = verifyError.message
      if (msg.includes('expired') || msg.includes('Token has expired')) {
        msg = isRecovery
          ? 'انتهت صلاحية رابط استعادة كلمة المرور، يرجى طلب رابط جديد.'
          : 'انتهت صلاحية رابط التحقق، يرجى طلب رابط تفعيل جديد.'
      } else if (msg.includes('invalid') || msg.includes('Token is invalid')) {
        msg = isRecovery
          ? 'رابط استعادة كلمة المرور غير صالح أو تم استخدامه مسبقاً. يرجى طلب رابط جديد.'
          : 'رابط التحقق غير صالح أو تم استخدامه مسبقاً. يمكنك تسجيل الدخول إذا كان حسابك مفعلاً.'
      }
      const errorRedirect = isRecovery
        ? `${origin}/forgot-password?error=${encodeURIComponent(msg)}`
        : `${origin}/login?error=${encodeURIComponent(msg)}`
      return NextResponse.redirect(errorRedirect)
    }

    if (data?.user) {
      const destination = await resolveUserDestination(supabase, data.user, next, isRecovery)
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // 3. PKCE Code flow: Fallback for OAuth and same-device code verifier links
  if (code) {
    const isRecovery = next === '/reset-password'
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('exchangeCodeForSession error:', exchangeError.message)
      let msg = exchangeError.message
      if (msg.includes('code verifier') || msg.includes('storage') || msg.includes('PKCE')) {
        msg = isRecovery
          ? 'تم فتح الرابط من جهاز مختلف عن جهاز الطلب. يرجى طلب رابط استعادة جديد من جهازك الحالي.'
          : 'تم فتح الرابط من جهاز مختلف عن جهاز التسجيل. يرجى تسجيل الدخول مباشرة ببريدك وكلمة المرور، أو طلب رابط تفعيل جديد.'
      } else if (msg.includes('expired')) {
        msg = isRecovery
          ? 'انتهت صلاحية رابط استعادة كلمة المرور، يرجى طلب رابط جديد.'
          : 'انتهت صلاحية رمز التحقق، يرجى طلب رابط تفعيل جديد.'
      }
      const errorRedirect = isRecovery
        ? `${origin}/forgot-password?error=${encodeURIComponent(msg)}`
        : `${origin}/login?error=${encodeURIComponent(msg)}`
      return NextResponse.redirect(errorRedirect)
    }

    if (data?.user) {
      const destination = await resolveUserDestination(supabase, data.user, next, isRecovery)
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // 4. Fallback: check if session already exists
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const isRecovery = next === '/reset-password'
      const destination = await resolveUserDestination(supabase, user, next, isRecovery)
      return NextResponse.redirect(`${origin}${destination}`)
    }
  } catch {
    // Non-blocking
  }

  return NextResponse.redirect(`${origin}/login`)
}

export const handleAuthCallback = handleAuthConfirmation

async function resolveUserDestination(
  supabase: any, 
  user: any, 
  nextParam?: string | null, 
  isRecovery?: boolean
): Promise<string> {
  if (isRecovery) {
    return '/reset-password'
  }

  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    return nextParam
  }

  if (user.user_metadata?.account_type === 'organizer') {
    return '/dashboard/organizer'
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.account_type === 'organizer') {
    return '/dashboard/organizer'
  }

  return '/dashboard/exhibitor'
}
