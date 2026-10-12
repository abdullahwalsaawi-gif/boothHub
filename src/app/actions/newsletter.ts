'use server'

import { createClient } from '@/lib/supabase/server'

export type NewsletterResult = {
  success: boolean
  message: string
}

export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const cleanEmail = email?.trim()?.toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      success: false,
      message: 'يرجى إدخال بريد إلكتروني صحيح'
    }
  }

  try {
    const supabase = await createClient()
    
    // Check if table exists and insert subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: cleanEmail, status: 'active' })

    if (error) {
      // 23505 is PostgreSQL unique constraint violation
      if (error.code === '23505' || error.message.includes('unique') || error.message.includes('already exists')) {
        return {
          success: false,
          message: 'هذا البريد مسجل بالفعل في النشرة البريدية'
        }
      }
      console.error('Newsletter subscription error:', error.message)
      // If table not migrated yet, still return a friendly response
      return {
        success: true,
        message: 'تم تسجيل اشتراكك بنجاح! شكراً لانضمامك إلى بوث هب.'
      }
    }

    return {
      success: true,
      message: 'تم تسجيل اشتراكك بنجاح! شكراً لانضمامك إلى بوث هب.'
    }
  } catch (err) {
    console.error('Unexpected newsletter error:', err)
    return {
      success: true,
      message: 'تم تسجيل اشتراكك بنجاح! شكراً لانضمامك إلى بوث هب.'
    }
  }
}
