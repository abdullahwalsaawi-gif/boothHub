'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isUserExhibitionManager } from '@/app/actions/bookings'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export type Exhibition = {
  id: string
  organization_id?: string
  organizer_id?: string
  title: string
  description: string
  category: string
  city: string
  venue: string
  start_date: string
  end_date: string
  booking_start_date?: string
  booking_end_date?: string
  cover_image_url?: string
  status: 'draft' | 'published' | 'hidden' | 'cancelled' | 'completed'
  available_booths?: number
  total_booths?: number
  organization_name?: string
}

// Fallback seed data in case database tables are not yet created in Supabase
const FALLBACK_EXHIBITIONS: Exhibition[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'معرض التقنية السعودي 2026',
    description: 'الحدث التقني الأكبر في المنطقة يجمع رواد التكنولوجيا والشركات الناشئة تحت سقف واحد لاستعراض أحدث ابتكارات الذكاء الاصطناعي والحوسبة السحابية.',
    category: 'تقنية',
    city: 'الرياض',
    venue: 'واجهة الرياض للمعارض والمؤتمرات',
    start_date: '2026-10-15',
    end_date: '2026-10-18',
    status: 'published',
    available_booths: 15,
    organization_name: 'شركة تنظيم المعارض الوطنية'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'معرض الكتاب الدولي',
    description: 'تظاهرة ثقافية كبرى تحتفي بالكلمة والأدب والإنتاج المعرفي العربي والعالمي بمشاركة مئات دور النشر.',
    category: 'ثقافة',
    city: 'جدة',
    venue: 'سوبر دوم جدة',
    start_date: '2026-11-01',
    end_date: '2026-11-10',
    status: 'published',
    available_booths: 0,
    organization_name: 'الهيئة الثقافية'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'قمة العقار والابتكار المعماري',
    description: 'ملتقى كبرى شركات التطوير العقاري والمستثمرين لاستعراض المشاريع العقارية الكبرى والحلول السكنية الذكية.',
    category: 'عقارات',
    city: 'الدمام',
    venue: 'مركز الظهران إكسبو',
    start_date: '2026-12-22',
    end_date: '2026-12-25',
    status: 'published',
    available_booths: 42,
    cover_image_url: '/images/exhibition-real-estate.jpg',
    organization_name: 'المجلس العقاري'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'معرض القهوة والشوكولاتة الدولي',
    description: 'الحدث السنوي الأشهر لعشاق وصناع القهوة المختصة والحلويات الفاخرة وخبراء التحميص.',
    category: 'أغذية',
    city: 'الرياض',
    venue: 'مركز الرياض الدولي للمؤتمرات',
    start_date: '2027-01-05',
    end_date: '2027-01-09',
    status: 'published',
    available_booths: 8,
    cover_image_url: '/images/exhibition-coffee.jpg',
    organization_name: 'رابطة القهوة'
  }
]

export async function getExhibitions(filters?: {
  search?: string
  city?: string
  category?: string
  status?: string
}): Promise<Exhibition[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('exhibitions')
      .select(`
        *,
        organizations (name),
        booths (id, operational_status)
      `)
      .eq('status', filters?.status || 'published')

    if (filters?.city && filters.city !== 'الكل' && filters.city !== 'المدينة') {
      const c = filters.city.trim()
      if (c === 'القصيم' || c === 'بريدة') {
        query = query.or(`city.eq.القصيم,city.eq.بريدة,city.ilike.%القصيم%,city.ilike.%بريدة%,venue.ilike.%بريدة%,venue.ilike.%القصيم%`)
      } else {
        query = query.or(`city.eq.${c},city.ilike.%${c}%,venue.ilike.%${c}%`)
      }
    }

    if (filters?.category && filters.category !== 'الكل' && filters.category !== 'النوع') {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    const { data, error } = await query.order('start_date', { ascending: true })

    if (error || !data || data.length === 0) {
      // Return filtered fallback if table is empty or not yet migrated
      return FALLBACK_EXHIBITIONS.filter(ex => {
        if (filters?.city && filters.city !== 'الكل' && filters.city !== 'المدينة') {
          const c = filters.city.trim()
          const exCity = (ex.city || '').trim()
          const exVenue = (ex.venue || '').trim()
          const matches = exCity.includes(c) || c.includes(exCity) || exVenue.includes(c) ||
            ((c === 'القصيم' || c === 'بريدة') && (exCity.includes('قصيم') || exCity.includes('بريدة') || exVenue.includes('قصيم') || exVenue.includes('بريدة')))
          if (!matches) return false
        }
        if (filters?.category && filters.category !== 'الكل' && filters.category !== 'النوع' && ex.category !== filters.category) return false
        if (filters?.search && !ex.title.includes(filters.search)) return false
        return true
      })
    }

    return data.map((item: any) => {
      const isKleija = item.id === 'e0e920b6-b195-4e6d-ad6d-16dbf4d9af43' || item.title?.includes('كليجا')
      
      let coverImage = item.cover_image_url
      if (!coverImage || coverImage === '') {
        if (item.id === 'e06ecf0a-421d-431a-9fb7-72e2405ff77d' || item.id === '33333333-3333-3333-3333-333333333333' || item.title?.includes('عقار') || item.category === 'عقارات') {
          coverImage = '/images/exhibition-real-estate.jpg'
        } else if (item.id === 'd1823810-9069-43fa-bef8-485c95863d98' || item.id === '44444444-4444-4444-4444-444444444444' || item.title?.includes('قهوة') || item.title?.includes('شوكولاتة')) {
          coverImage = '/images/exhibition-coffee.jpg'
        } else if (item.id === 'a7569820-9fc0-4bcd-bb0a-ad37f6d39f37' || item.title?.includes('تقنية')) {
          coverImage = '/images/exhibition-tech.jpg'
        } else if (isKleija) {
          coverImage = '/images/exhibition-kleija.jpg'
        } else if (item.id === 'bde40e86-72c3-47f3-b90f-ed4510e4298b' || item.title?.includes('كتاب')) {
          coverImage = '/images/exhibition-book.jpg'
        }
      }

      return {
        ...item,
        city: isKleija ? 'القصيم' : item.city,
        venue: isKleija ? 'بريدة' : item.venue,
        cover_image_url: coverImage,
        organization_name: item.organizations?.name,
        total_booths: item.booths?.length || 0,
        available_booths: item.booths?.filter((b: any) => b.operational_status === 'operational').length || 0
      }
    })
  } catch (err) {
    console.error('Error fetching exhibitions:', err)
    return FALLBACK_EXHIBITIONS
  }
}

export async function getExhibitionById(id: string): Promise<Exhibition | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('exhibitions')
      .select(`
        *,
        organizations (name, contact_email, phone)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      // Check fallback by ID or numeric index for backwards compatibility
      const found = FALLBACK_EXHIBITIONS.find(ex => ex.id === id || id === '1' && ex.id === FALLBACK_EXHIBITIONS[0].id)
      return found || FALLBACK_EXHIBITIONS[0] // Return fallback if matched
    }

    const isKleija = data.id === 'e0e920b6-b195-4e6d-ad6d-16dbf4d9af43' || data.title?.includes('كليجا')
    
    let coverImage = data.cover_image_url
    if (!coverImage || coverImage === '') {
      if (data.id === 'e06ecf0a-421d-431a-9fb7-72e2405ff77d' || data.id === '33333333-3333-3333-3333-333333333333' || data.title?.includes('عقار') || data.category === 'عقارات') {
        coverImage = '/images/exhibition-real-estate.jpg'
      } else if (data.id === 'd1823810-9069-43fa-bef8-485c95863d98' || data.id === '44444444-4444-4444-4444-444444444444' || data.title?.includes('قهوة') || data.title?.includes('شوكولاتة')) {
        coverImage = '/images/exhibition-coffee.jpg'
      } else if (data.id === 'a7569820-9fc0-4bcd-bb0a-ad37f6d39f37' || data.title?.includes('تقنية')) {
        coverImage = '/images/exhibition-tech.jpg'
      } else if (isKleija) {
        coverImage = '/images/exhibition-kleija.jpg'
      } else if (data.id === 'bde40e86-72c3-47f3-b90f-ed4510e4298b' || data.title?.includes('كتاب')) {
        coverImage = '/images/exhibition-book.jpg'
      }
    }

    return {
      ...data,
      city: isKleija ? 'القصيم' : data.city,
      venue: isKleija ? 'بريدة' : data.venue,
      cover_image_url: coverImage,
      organization_name: data.organizations?.name
    }
  } catch (err) {
    console.error('Error getting exhibition by ID:', err)
    return FALLBACK_EXHIBITIONS[0]
  }
}

export async function createExhibition(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
    }

    // 1. Resolve user organization ID
    let organizationId: string | null = null

    // Check existing organization membership
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (member?.organization_id) {
      organizationId = member.organization_id
    }

    // Check if an organization with user's email exists
    if (!organizationId && user.email) {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('contact_email', user.email)
        .maybeSingle()

      if (existingOrg?.id) {
        organizationId = existingOrg.id
      }
    }

    // If still no organization, create one or link to default
    if (!organizationId) {
      const orgName = (user.user_metadata?.organization_name as string)?.trim() || 
                      (user.user_metadata?.full_name as string)?.trim() || 
                      'جهة تنظيم المعارض'
      
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          contact_email: user.email || '',
          phone: user.user_metadata?.phone || ''
        })
        .select('id')
        .maybeSingle()

      if (newOrg?.id) {
        organizationId = newOrg.id
      } else {
        // Fallback to first available organization in table
        const { data: fallbackOrg } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .maybeSingle()

        if (fallbackOrg?.id) {
          organizationId = fallbackOrg.id
        }
      }
    }

    // Ensure user is recorded in organization_members to satisfy RLS is_organization_admin check
    if (organizationId) {
      try {
        await supabase
          .from('organization_members')
          .upsert({
            organization_id: organizationId,
            user_id: user.id,
            role: 'owner'
          }, { onConflict: 'organization_id,user_id' })
      } catch (memErr) {
        console.warn('Organization members upsert notice:', memErr)
      }
    }

    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const category = (formData.get('category') as string)?.trim()
    const city = (formData.get('city') as string)?.trim()
    const venue = (formData.get('venue') as string)?.trim()
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const status = (formData.get('status') as string) || 'published'

    if (!title || !category || !city || !venue || !startDate || !endDate) {
      return { success: false, error: 'يرجى استكمال جميع الحقول الإلزامية (اسم المعرض، التصنيف، المدينة، المقر، وتواريخ البداية والنهاية)' }
    }

    let coverImageUrl = (formData.get('cover_image_url') as string)?.trim() || ''
    const coverImageFile = formData.get('cover_image') as File | null
    if (coverImageFile && typeof coverImageFile === 'object' && coverImageFile.size > 0) {
      const uploadRes = await saveExhibitionCoverFile(coverImageFile)
      if (uploadRes.success && uploadRes.url) {
        coverImageUrl = uploadRes.url
      }
    }

    // Insert exhibition using the real columns present in Supabase exhibitions table
    const { data, error } = await supabase
      .from('exhibitions')
      .insert({
        organization_id: organizationId,
        title,
        description: description || '',
        category,
        city,
        venue,
        start_date: startDate,
        end_date: endDate,
        cover_image_url: coverImageUrl || null,
        status
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting exhibition:', error)
      return { success: false, error: error.message || 'فشل حفظ المعرض في قاعدة البيانات' }
    }

    // Seed default booths for newly created exhibition
    if (data?.id) {
      const defaultBooths = [
        { exhibition_id: data.id, booth_number: 'A1', size_sqm: 9, price: 4500, position_x: 50, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
        { exhibition_id: data.id, booth_number: 'A2', size_sqm: 9, price: 4500, position_x: 120, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
        { exhibition_id: data.id, booth_number: 'A3', size_sqm: 9, price: 4500, position_x: 190, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
        { exhibition_id: data.id, booth_number: 'B1', size_sqm: 16, price: 7500, position_x: 50, position_y: 150, width: 80, height: 80, operational_status: 'operational' },
        { exhibition_id: data.id, booth_number: 'B2', size_sqm: 16, price: 7500, position_x: 140, position_y: 150, width: 80, height: 80, operational_status: 'operational' },
        { exhibition_id: data.id, booth_number: 'C1', size_sqm: 25, price: 11000, position_x: 50, position_y: 270, width: 120, height: 60, operational_status: 'operational' }
      ]
      try {
        await supabase.from('booths').insert(defaultBooths)
      } catch (boothErr) {
        console.warn('Booths insert notice:', boothErr)
      }
    }

    revalidatePath('/explore')
    revalidatePath('/dashboard/organizer')

    return { success: true, exhibitionId: data.id }
  } catch (err: any) {
    console.error('Unexpected error in createExhibition:', err)
    return { success: false, error: err.message || 'حدث خطأ غير متوقع أثناء إضافة المعرض' }
  }
}

// Helper to save image file locally to public/uploads/exhibitions
async function saveExhibitionCoverFile(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validMimes.includes(file.type)) {
      return { success: false, error: 'صيغة الصورة غير مدعومة. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP' }
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'حجم الصورة يتجاوز الحد المسموح (الحد الأقصى 5 ميجابايت)' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'exhibitions')
    await mkdir(uploadsDir, { recursive: true })

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `cover_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = path.join(uploadsDir, fileName)

    await writeFile(filePath, buffer)
    const publicUrl = `/uploads/exhibitions/${fileName}`

    // Also attempt Supabase Storage if bucket exists (non-blocking fallback)
    try {
      const supabase = await createClient()
      await supabase.storage.from('exhibitions').upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })
    } catch {
      // Supabase storage bucket may not exist, local upload is primary
    }

    return { success: true, url: publicUrl }
  } catch (err: any) {
    console.error('Error saving exhibition cover file:', err)
    return { success: false, error: err.message || 'فشل حفظ ملف الصورة' }
  }
}

// Server action to upload cover image separately
export async function uploadExhibitionCoverImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('image') as File | null
    if (!file || typeof file !== 'object' || file.size === 0) {
      return { success: false, error: 'يرجى اختيار ملف صورة صالح' }
    }
    return await saveExhibitionCoverFile(file)
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء رفع الصورة' }
  }
}

// Fetch exhibitions owned exclusively by the authenticated organizer
export async function getOrganizerExhibitions(): Promise<Exhibition[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Fetch user's organization IDs
    const { data: members } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)

    const orgIds: string[] = members?.map(m => m.organization_id).filter(Boolean) || []

    // Also check organizations where contact_email = user.email
    if (user.email) {
      const { data: emailOrgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('contact_email', user.email)

      if (emailOrgs) {
        emailOrgs.forEach(o => {
          if (o.id && !orgIds.includes(o.id)) {
            orgIds.push(o.id)
          }
        })
      }
    }

    let query = supabase
      .from('exhibitions')
      .select(`
        *,
        organizations (name),
        booths (id, operational_status)
      `)
      .neq('status', 'cancelled')

    if (orgIds.length > 0) {
      query = query.in('organization_id', orgIds)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) {
      console.error('Error in getOrganizerExhibitions query:', error)
      return []
    }

    return data.map((item: any) => ({
      ...item,
      organization_name: item.organizations?.name,
      total_booths: item.booths?.length || 0,
      available_booths: item.booths?.filter((b: any) => b.operational_status === 'operational').length || 0
    }))
  } catch (err) {
    console.error('Error fetching organizer exhibitions:', err)
    return []
  }
}

// Update exhibition basic details and cover image
export async function updateExhibition(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
    }

    const id = formData.get('id') as string
    if (!id) {
      return { success: false, error: 'معرّف المعرض مفقود' }
    }

    const isManager = await isUserExhibitionManager(user.id, user.email, id)
    if (!isManager) {
      return { success: false, error: 'ليس لديك صلاحية لتعديل هذا المعرض' }
    }

    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const category = (formData.get('category') as string)?.trim()
    const city = (formData.get('city') as string)?.trim()
    const venue = (formData.get('venue') as string)?.trim()
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    let coverImageUrl = (formData.get('cover_image_url') as string)?.trim() || ''

    const coverImageFile = formData.get('cover_image') as File | null
    if (coverImageFile && typeof coverImageFile === 'object' && coverImageFile.size > 0) {
      const uploadRes = await saveExhibitionCoverFile(coverImageFile)
      if (uploadRes.success && uploadRes.url) {
        coverImageUrl = uploadRes.url
      }
    }

    if (!title || !category || !city || !venue || !startDate || !endDate) {
      return { success: false, error: 'يرجى استكمال جميع الحقول الإلزامية (اسم المعرض، التصنيف، المدينة، المقر، والتواريخ)' }
    }

    const updatePayload: Record<string, any> = {
      title,
      description: description || '',
      category,
      city,
      venue,
      start_date: startDate,
      end_date: endDate,
      updated_at: new Date().toISOString()
    }

    if (coverImageUrl !== undefined) {
      updatePayload.cover_image_url = coverImageUrl || null
    }

    const { error } = await supabase
      .from('exhibitions')
      .update(updatePayload)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message || 'فشل تحديث بيانات المعرض' }
    }

    revalidatePath('/explore')
    revalidatePath(`/explore/${id}`)
    revalidatePath('/dashboard/organizer')

    return { success: true }
  } catch (err: any) {
    console.error('Error updating exhibition:', err)
    return { success: false, error: err.message || 'حدث خطأ أثناء تعديل المعرض' }
  }
}

// Toggle exhibition visibility (Hide / Unhide)
export async function toggleExhibitionVisibility(
  id: string,
  newStatus: 'published' | 'hidden'
): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
    }

    const isManager = await isUserExhibitionManager(user.id, user.email, id)
    if (!isManager) {
      return { success: false, error: 'ليس لديك صلاحية لإدارة ظهور هذا المعرض' }
    }

    // When re-publishing / unhiding, validate essential fields
    if (newStatus === 'published') {
      const { data: exh, error: fetchErr } = await supabase
        .from('exhibitions')
        .select('title, city, venue, start_date, end_date')
        .eq('id', id)
        .single()

      if (fetchErr || !exh) {
        return { success: false, error: 'تعذر العثور على بيانات المعرض' }
      }

      if (!exh.title || !exh.city || !exh.venue || !exh.start_date || !exh.end_date) {
        return { 
          success: false, 
          error: 'لا يمكن نشر المعرض: يرجى استكمال البيانات الأساسية أولاً (العنوان، المدينة، المقر، وتواريخ البداية والنهاية).' 
        }
      }
    }

    // Try updating with newStatus ('published' | 'hidden')
    let { error } = await supabase
      .from('exhibitions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    // Fallback: If DB check constraint only accepts ('draft', 'published', ...) before migration runs, map 'hidden' to 'draft'
    if (error && newStatus === 'hidden') {
      const fallbackResult = await supabase
        .from('exhibitions')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', id)
      error = fallbackResult.error
    }

    if (error) {
      return { success: false, error: error.message || 'فشل تحديث حالة ظهور المعرض' }
    }

    revalidatePath('/explore')
    revalidatePath(`/explore/${id}`)
    revalidatePath('/dashboard/organizer')

    return { success: true, status: newStatus }
  } catch (err: any) {
    console.error('Error toggling exhibition visibility:', err)
    return { success: false, error: err.message || 'حدث خطأ أثناء تغيير حالة المعرض' }
  }
}

// Secure and safe delete exhibition
export async function deleteExhibition(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
    }

    // Check organizer authorization
    let isManager = await isUserExhibitionManager(user.id, user.email, id)
    if (!isManager) {
      // Secondary check: verify if the user's role is organizer and exhibition belongs to their list
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role === 'organizer' || profile?.role === 'admin') {
        const organizerExhibitions = await getOrganizerExhibitions()
        if (organizerExhibitions.some(e => e.id === id)) {
          isManager = true
        }
      }
    }

    if (!isManager) {
      return { success: false, error: 'ليس لديك صلاحية لحذف هذا المعرض' }
    }

    // Use admin client if available to ensure cascading deletes succeed without RLS restriction
    const adminSupabase = createAdminClient()
    const dbClient = adminSupabase || supabase

    // 1. Delete associated payments for any bookings of this exhibition
    try {
      const { data: exhBookings } = await dbClient
        .from('bookings')
        .select('id')
        .eq('exhibition_id', id)

      if (exhBookings && exhBookings.length > 0) {
        const bookingIds = exhBookings.map((b: any) => b.id)
        await dbClient.from('payments').delete().in('booking_id', bookingIds)
      }
    } catch (payErr) {
      console.warn('Notice cleaning up payments during exhibition deletion:', payErr)
    }

    // 2. Delete bookings
    try {
      await dbClient.from('bookings').delete().eq('exhibition_id', id)
    } catch (bookErr) {
      console.warn('Notice cleaning up bookings during exhibition deletion:', bookErr)
    }

    // 3. Delete floor plans
    try {
      await dbClient.from('booth_floor_plans').delete().eq('exhibition_id', id)
    } catch (floorErr) {
      console.warn('Notice cleaning up floor plans during exhibition deletion:', floorErr)
    }

    // 4. Delete booths
    try {
      await dbClient.from('booths').delete().eq('exhibition_id', id)
    } catch (boothErr) {
      console.warn('Notice cleaning up booths during exhibition deletion:', boothErr)
    }

    // 5. Delete exhibition itself
    const { error } = await dbClient
      .from('exhibitions')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Hard delete encountered error, applying status cancellation fallback:', error.message)
      const { error: cancelErr } = await dbClient
        .from('exhibitions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (cancelErr) {
        console.error('Error cancelling exhibition record:', cancelErr)
        return { success: false, error: cancelErr.message || 'فشل حذف المعرض من قاعدة البيانات' }
      }
    }

    revalidatePath('/explore')
    revalidatePath(`/explore/${id}`)
    revalidatePath('/dashboard/organizer')
    revalidatePath('/')

    return { success: true }
  } catch (err: any) {
    console.error('Error deleting exhibition:', err)
    return { success: false, error: err.message || 'حدث خطأ أثناء حذف المعرض' }
  }
}
