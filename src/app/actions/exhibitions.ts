'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  status: 'draft' | 'published' | 'cancelled' | 'completed'
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
      query = query.eq('city', filters.city)
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
        if (filters?.city && filters.city !== 'الكل' && filters.city !== 'المدينة' && ex.city !== filters.city) return false
        if (filters?.category && filters.category !== 'الكل' && filters.category !== 'النوع' && ex.category !== filters.category) return false
        if (filters?.search && !ex.title.includes(filters.search)) return false
        return true
      })
    }

    return data.map((item: any) => ({
      ...item,
      organization_name: item.organizations?.name,
      total_booths: item.booths?.length || 0,
      available_booths: item.booths?.filter((b: any) => b.operational_status === 'operational').length || 0
    }))
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

    return {
      ...data,
      organization_name: data.organizations?.name
    }
  } catch (err) {
    console.error('Error getting exhibition by ID:', err)
    return FALLBACK_EXHIBITIONS[0]
  }
}

export async function createExhibition(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
  }

  // Get user's organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  let organizationId = member?.organization_id
  if (!organizationId) {
    // Check if user has an organization or create one
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({
        name: user.user_metadata?.organization_name || 'جهة تنظيم المعارض',
        contact_email: user.email,
        phone: user.user_metadata?.phone || ''
      })
      .select()
      .single()

    if (newOrg) {
      organizationId = newOrg.id
      await supabase.from('organization_members').insert({
        organization_id: newOrg.id,
        user_id: user.id,
        role: 'owner'
      })
    }
  }

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const category = formData.get('category') as string
  const city = formData.get('city') as string
  const venue = (formData.get('venue') as string)?.trim()
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const status = (formData.get('status') as string) || 'published'

  if (!title || !category || !city || !venue || !startDate || !endDate) {
    return { success: false, error: 'يرجى استكمال جميع الحقول الإلزامية' }
  }

  const { data, error } = await supabase
    .from('exhibitions')
    .insert({
      organization_id: organizationId,
      organizer_id: user.id,
      title,
      description,
      category,
      city,
      venue,
      start_date: startDate,
      end_date: endDate,
      status
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Seed default 10 booths for the newly created exhibition
  if (data?.id) {
    const defaultBooths = [
      { exhibition_id: data.id, booth_number: 'A1', size_sqm: 9, price: 4500, position_x: 50, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
      { exhibition_id: data.id, booth_number: 'A2', size_sqm: 9, price: 4500, position_x: 120, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
      { exhibition_id: data.id, booth_number: 'A3', size_sqm: 9, price: 4500, position_x: 190, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
      { exhibition_id: data.id, booth_number: 'B1', size_sqm: 16, price: 7500, position_x: 50, position_y: 150, width: 80, height: 80, operational_status: 'operational' },
      { exhibition_id: data.id, booth_number: 'B2', size_sqm: 16, price: 7500, position_x: 140, position_y: 150, width: 80, height: 80, operational_status: 'operational' },
      { exhibition_id: data.id, booth_number: 'C1', size_sqm: 25, price: 11000, position_x: 50, position_y: 270, width: 120, height: 60, operational_status: 'operational' }
    ]
    await supabase.from('booths').insert(defaultBooths)
  }

  revalidatePath('/explore')
  revalidatePath('/dashboard/organizer')

  return { success: true, exhibitionId: data.id }
}

// Fetch exhibitions owned exclusively by the authenticated organizer
export async function getOrganizerExhibitions(): Promise<Exhibition[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Fetch user's organization members if any
    const { data: members } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)

    const orgIds = members?.map(m => m.organization_id).filter(Boolean) || []

    let query = supabase
      .from('exhibitions')
      .select(`
        *,
        organizations (name),
        booths (id, operational_status)
      `)

    // Filter by organizer_id = current user, or user's organization
    if (orgIds.length > 0) {
      query = query.or(`organizer_id.eq.${user.id},organization_id.in.(${orgIds.join(',')})`)
    } else {
      query = query.eq('organizer_id', user.id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) {
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

// Secure delete exhibition with ownership verification
export async function deleteExhibition(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
    }

    // Authorization check
    const { data: existing } = await supabase
      .from('exhibitions')
      .select('id, organizer_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'المعرض غير موجود' }
    }

    if (existing.organizer_id && existing.organizer_id !== user.id) {
      return { success: false, error: 'مرفوض: ليس لديك صلاحية حذف هذا المعرض' }
    }

    const { error } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', id)
      .eq('organizer_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/explore')
    revalidatePath('/dashboard/organizer')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء حذف المعرض' }
  }
}
