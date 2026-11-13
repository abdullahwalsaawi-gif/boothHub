'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatSaudiPhoneNumber } from '@/lib/utils'
import { getAuthRedirectUrl } from '@/lib/site-url'

export type AuthActionResult = {
  success: boolean
  error?: string
  redirectUrl?: string
  message?: string
}

export async function sendPhoneOtp(phone: string): Promise<AuthActionResult> {
  if (!phone || phone.trim().length < 8) {
    return { success: false, error: 'يرجى إدخال رقم جوال صحيح (مثال: 05XXXXXXXX)' }
  }

  const formattedPhone = formatSaudiPhoneNumber(phone)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  })

  if (error) {
    console.error('Phone OTP error:', error.message)
    if (error.message.includes('provider') || error.message.includes('SMS') || error.message.includes('twilio') || error.message.includes('disabled')) {
      return { 
        success: false, 
        error: 'يلزم تفعيل مزود الرسائل النصية (SMS Provider مثل Twilio أو MessageBird) في لوحة تحكم Supabase > Auth > Providers > Phone لإرسال الرسائل الحقيقية، أو إضافة أرقام تجريبية.' 
      }
    }
    return { success: false, error: error.message || 'فشل إرسال رمز التحقق' }
  }

  return {
    success: true,
    message: `تم إرسال رمز التحقق في رسالة نصية SMS إلى ${formattedPhone}`,
  }
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthActionResult> {
  if (!phone || !token) {
    return { success: false, error: 'يرجى إدخال رقم الجوال ورمز التحقق المكون من 6 أرقام' }
  }

  const formattedPhone = formatSaudiPhoneNumber(phone)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token.trim(),
    type: 'sms',
  })

  if (error) {
    console.error('Verify OTP error:', error.message)
    if (error.message.includes('Token has expired') || error.message.includes('expired')) {
      return { success: false, error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' }
    }
    if (error.message.includes('invalid') || error.message.includes('Token is invalid') || error.message.includes('incorrect')) {
      return { success: false, error: 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة' }
    }
    return { success: false, error: error.message || 'فشل التحقق من الرمز' }
  }

  let redirectUrl = '/dashboard/exhibitor'
  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: 'مستخدم بوث هب',
        phone: formattedPhone,
        email: data.user.email || `${formattedPhone.replace('+', '')}@boothhub.sa`,
        account_type: 'exhibitor',
      })
    } else if (profile.account_type === 'organizer') {
      redirectUrl = '/dashboard/organizer'
    }
  }

  return {
    success: true,
    redirectUrl,
  }
}

export async function signUpWithPhoneOtp(data: {
  phone: string
  fullName: string
  accountType: string
  organizationName?: string
}): Promise<AuthActionResult> {
  const { phone, fullName, accountType, organizationName } = data

  if (!phone || phone.trim().length < 8) {
    return { success: false, error: 'يرجى إدخال رقم جوال صحيح (مثال: 05XXXXXXXX)' }
  }

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'يرجى إدخال الاسم الكامل' }
  }

  if (accountType === 'organizer' && (!organizationName || !organizationName.trim())) {
    return { success: false, error: 'يرجى إدخال اسم الجهة المنظمة' }
  }

  const formattedPhone = formatSaudiPhoneNumber(phone)
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: formattedPhone,
        account_type: accountType,
        organization_name: organizationName?.trim() || '',
      },
    },
  })

  if (error) {
    console.error('Phone Signup OTP error:', error.message)
    if (error.message.includes('provider') || error.message.includes('SMS') || error.message.includes('twilio') || error.message.includes('disabled')) {
      return { 
        success: false, 
        error: 'يلزم تفعيل مزود الرسائل النصية (SMS Provider) في لوحة تحكم Supabase > Auth > Providers > Phone أو استخدام أرقام التجربة (Test Numbers).' 
      }
    }
    return { success: false, error: error.message || 'فشل إرسال رمز التحقق إلى الجوال' }
  }

  return {
    success: true,
    message: `تم إرسال رمز التحقق بنجاح إلى الرقم ${formattedPhone}`,
  }
}

export async function verifySignUpPhoneOtp(data: {
  phone: string
  token: string
  fullName: string
  accountType: string
  organizationName?: string
}): Promise<AuthActionResult> {
  const { phone, token, fullName, accountType, organizationName } = data

  if (!phone || !token) {
    return { success: false, error: 'يرجى إدخال رقم الجوال ورمز التحقق' }
  }

  const formattedPhone = formatSaudiPhoneNumber(phone)
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token.trim(),
    type: 'sms',
  })

  if (error) {
    console.error('Verify Signup OTP error:', error.message)
    if (error.message.includes('Token has expired') || error.message.includes('expired')) {
      return { success: false, error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' }
    }
    if (error.message.includes('invalid') || error.message.includes('Token is invalid') || error.message.includes('incorrect')) {
      return { success: false, error: 'رمز التحقق غير صحيح، يرجى التأكد وإعادة المحاولة' }
    }
    return { success: false, error: error.message || 'فشل التحقق من رمز الجوال' }
  }

  if (authData?.user) {
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: fullName.trim(),
      phone: formattedPhone,
      email: authData.user.email || `${formattedPhone.replace('+', '')}@boothhub.sa`,
      account_type: accountType || 'exhibitor',
    })

    if (accountType === 'organizer' && organizationName) {
      try {
        const { data: org } = await supabase
          .from('organizations')
          .insert({
            name: organizationName.trim(),
            phone: formattedPhone,
            contact_email: `${formattedPhone.replace('+', '')}@boothhub.sa`,
          })
          .select()
          .single()

        if (org) {
          await supabase.from('organization_members').insert({
            organization_id: org.id,
            user_id: authData.user.id,
            role: 'owner',
          })
        }
      } catch (orgErr) {
        console.error('Error creating organization during phone signup:', orgErr)
      }
    }
  }

  const redirectUrl = accountType === 'organizer' ? '/dashboard/organizer' : '/dashboard/exhibitor'

  return {
    success: true,
    redirectUrl,
  }
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const accountType = (formData.get('accountType') as string) || 'exhibitor'
  const organizationName = (formData.get('organizationName') as string)?.trim()

  if (!email || !password || !fullName) {
    return { success: false, error: 'يرجى ملء جميع الحقول المطلوبة' }
  }

  if (!phone || phone.trim().length < 8) {
    return { success: false, error: 'يرجى إدخال رقم جوال صحيح (مثال: 05XXXXXXXX)' }
  }

  if (password.length < 6) {
    return { success: false, error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'كلمتا المرور غير متطابقتين' }
  }

  if (accountType === 'organizer' && !organizationName) {
    return { success: false, error: 'يرجى إدخال اسم الجهة المنظمة' }
  }

  const formattedPhone = formatSaudiPhoneNumber(phone)
  const supabase = await createClient()
  const emailRedirectTo = await getAuthRedirectUrl('/auth/confirm')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        full_name: fullName,
        phone: formattedPhone,
        account_type: accountType,
        organization_name: organizationName || '',
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    if (error.message.includes('already registered')) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' }
    }
    if (error.message.includes('Password')) {
      return { success: false, error: 'كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى' }
    }
    if (error.message.includes('Invalid path') || error.message.includes('PGRST125')) {
      return { success: false, error: 'تعذر الاتصال بخدمة المصادقة، يرجى التأكد من إعدادات الربط' }
    }
    return { success: false, error: error.message || 'حدث خطأ أثناء إنشاء الحساب' }
  }

  if (data?.user) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: formattedPhone,
        email: email,
        account_type: accountType,
      })
    } catch (profErr) {
      console.error('Error saving profile in signUp:', profErr)
    }
  }

  if (data?.user && accountType === 'organizer' && organizationName) {
    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          contact_email: email,
          phone: formattedPhone,
        })
        .select()
        .single()

      if (org && !orgError) {
        await supabase.from('organization_members').insert({
          organization_id: org.id,
          user_id: data.user.id,
          role: 'owner',
        })
      }
    } catch (orgErr) {
      console.error('Error creating organization:', orgErr)
    }
  }

  const targetPath = accountType === 'organizer' ? '/dashboard/organizer' : '/dashboard/exhibitor'
  
  if (data?.user && !data.session) {
    return {
      success: true,
      message: 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد التسجيل.',
    }
  }

  return {
    success: true,
    redirectUrl: targetPath,
  }
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('SignIn error:', error.message)
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { success: false, error: 'يرجى تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول' }
    }
    if (error.message.includes('Invalid path') || error.message.includes('PGRST125')) {
      return { success: false, error: 'تعذر الاتصال بخدمة المصادقة، يرجى التأكد من إعدادات الربط' }
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return { success: false, error: 'فشل الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت وإعادة المحاولة' }
    }
    return { success: false, error: error.message || 'فشل تسجيل الدخول' }
  }

  let redirectUrl = '/dashboard/exhibitor'
  if (data?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', data.user.id)
      .single()

    if (profile?.account_type === 'organizer') {
      redirectUrl = '/dashboard/organizer'
    } else if (data.user.user_metadata?.account_type === 'organizer') {
      redirectUrl = '/dashboard/organizer'
    }
  }

  return {
    success: true,
    redirectUrl,
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function resetPasswordForEmail(email: string): Promise<AuthActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' }
  }

  const supabase = await createClient()
  const resetRedirectTo = await getAuthRedirectUrl('/auth/callback?next=/reset-password')
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: resetRedirectTo,
  })

  if (error) {
    console.error('Reset password error:', error.message)
    if (error.message.includes('rate limit') || error.message.includes('security purposes') || error.message.includes('seconds')) {
      return { success: false, error: 'يرجى الانتظار دقيقة واحدة قبل محاولة طلب رابط جديد' }
    }
    return { success: false, error: error.message || 'فشل إرسال رابط استعادة كلمة المرور' }
  }

  return {
    success: true,
    message: 'إذا كان البريد مسجلاً في المنصة، فستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.',
  }
}

export async function checkResetSession(): Promise<{ valid: boolean; email?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { valid: false }
    }
    return { valid: true, email: user.email }
  } catch {
    return { valid: false }
  }
}

export async function exchangeRecoveryCode(code: string): Promise<AuthActionResult> {
  if (!code) return { success: false, error: 'رمز التحقق مفقود' }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    return { 
      success: false, 
      error: 'انتهت صلاحية رمز الاستعادة أو تم استخدامه مسبقاً، يرجى طلب رابط جديد.' 
    }
  }
  return { success: true }
}

export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { success: false, error: 'يرجى إدخال كلمة المرور وتأكيدها' }
  }

  if (password.length < 6) {
    return { success: false, error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'كلمتا المرور غير متطابقتين' }
  }

  const supabase = await createClient()

  // Verify that the user currently has an active recovery session
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { 
      success: false, 
      error: 'انتهت صلاحية جلسة الاستعادة أو الرابط غير صالح. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.' 
    }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  })

  if (updateError) {
    console.error('Update password error:', updateError.message)
    if (updateError.message.includes('same password') || updateError.message.includes('different from the old')) {
      return { success: false, error: 'يرجى اختيار كلمة مرور جديدة تختلف عن السابقة' }
    }
    return { success: false, error: updateError.message || 'حدث خطأ أثناء تحديث كلمة المرور' }
  }

  // Sign out the temporary recovery session so user explicitly logs in with the new credentials
  await supabase.auth.signOut()

  return {
    success: true,
    redirectUrl: '/login?message=' + encodeURIComponent('تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة'),
  }
}

export async function resendConfirmationEmail(email: string): Promise<AuthActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' }
  }

  const supabase = await createClient()
  const emailRedirectTo = await getAuthRedirectUrl('/auth/confirm')

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo,
    },
  })

  if (error) {
    console.error('Resend verification email error:', error.message)
    if (error.message.includes('rate limit') || error.message.includes('security purposes') || error.message.includes('seconds')) {
      return { success: false, error: 'يرجى الانتظار دقيقة واحدة قبل محاولة إعادة الإرسال مرة أخرى' }
    }
    return { success: false, error: error.message || 'فشل إرسال رابط التفعيل' }
  }

  return {
    success: true,
    message: 'تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني بنجاح. يرجى مراجعة بريدك.',
  }
}

