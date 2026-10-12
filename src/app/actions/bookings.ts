'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BoothData = {
  id: string
  number: string
  name?: string
  size_sqm: number
  price: number
  status: 'available' | 'booked' | 'unavailable'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  amenities?: string[]
  hallWidth?: number
  hallHeight?: number
}

export type BookingRecord = {
  id: string
  booking_reference: string
  booth_id: string
  exhibition_id: string
  exhibition_title?: string
  booth_number?: string
  organization_name?: string
  contact_name: string
  contact_phone: string
  total_amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'expired'
  created_at: string
}

export async function getExhibitionBooths(exhibitionId: string): Promise<BoothData[]> {
  try {
    const supabase = await createClient()

    // Fetch exhibition plan if available
    const { data: plan } = await supabase
      .from('exhibition_plans')
      .select('width, height')
      .eq('exhibition_id', exhibitionId)
      .maybeSingle()

    const hallWidth = plan?.width ? Number(plan.width) : undefined
    const hallHeight = plan?.height ? Number(plan.height) : undefined

    // Fetch booths
    const { data: booths, error: boothError } = await supabase
      .from('booths')
      .select('*')
      .eq('exhibition_id', exhibitionId)

    // Fetch active bookings for this exhibition to dynamically compute availability
    const { data: bookings } = await supabase
      .from('bookings')
      .select('booth_id, status')
      .eq('exhibition_id', exhibitionId)
      .in('status', ['pending', 'confirmed'])

    const bookedBoothIds = new Set(bookings?.map(b => b.booth_id) || [])

    if (boothError || !booths || booths.length === 0) {
      // Return default visual booths with realistic interactive coordinates
      return [
        { id: 'b-1', number: 'A1', size_sqm: 9, price: 5000, status: 'available', x: 50, y: 50, width: 60, height: 60, amenities: ['كهرباء', 'طاولة وكراسي', 'إنترنت فائق السرعة'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-2', number: 'A2', size_sqm: 9, price: 5000, status: 'booked', x: 120, y: 50, width: 60, height: 60, amenities: ['كهرباء', 'طاولة وكراسي'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-3', number: 'A3', size_sqm: 9, price: 5000, status: 'available', x: 190, y: 50, width: 60, height: 60, amenities: ['كهرباء', 'طاولة وكراسي'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-4', number: 'A4', size_sqm: 9, price: 5000, status: 'available', x: 260, y: 50, width: 60, height: 60, amenities: ['كهرباء', 'طاولة وكراسي'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-5', number: 'B1', size_sqm: 16, price: 8000, status: 'available', x: 50, y: 150, width: 80, height: 80, amenities: ['كهرباء ثلاثية الفاز', 'شاشة عرض 55 بوصة'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-6', number: 'B2', size_sqm: 16, price: 8000, status: 'unavailable', x: 140, y: 150, width: 80, height: 80, amenities: ['تحت الصيانة'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-7', number: 'B3', size_sqm: 16, price: 8000, status: 'available', x: 230, y: 150, width: 80, height: 80, amenities: ['كهرباء ثلاثية الفاز', 'شاشة عرض'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-8', number: 'C1', size_sqm: 25, price: 12000, status: 'available', x: 50, y: 270, width: 120, height: 60, amenities: ['موقع مميز', 'شاشة LED', 'أثاث فاخر'], hallWidth: 420, hallHeight: 420 },
        { id: 'b-9', number: 'C2', size_sqm: 25, price: 12000, status: 'booked', x: 180, y: 270, width: 120, height: 60, amenities: ['موقع مميز', 'أثاث فاخر'], hallWidth: 420, hallHeight: 420 }
      ]
    }

    return booths.map(b => {
      let status: 'available' | 'booked' | 'unavailable' = 'available'
      if (b.operational_status !== 'operational') {
        status = 'unavailable'
      } else if (bookedBoothIds.has(b.id)) {
        status = 'booked'
      }

      return {
        id: b.id,
        number: b.booth_number,
        name: Array.isArray(b.amenities) && b.amenities[0] ? String(b.amenities[0]) : undefined,
        size_sqm: Number(b.size_sqm),
        price: Number(b.price),
        status,
        x: Number(b.position_x),
        y: Number(b.position_y),
        width: Number(b.width),
        height: Number(b.height),
        rotation: Number(b.rotation || 0),
        amenities: Array.isArray(b.amenities) ? b.amenities : [],
        hallWidth,
        hallHeight
      }
    })
  } catch (err) {
    console.error('Error fetching booths:', err)
    return []
  }
}

export async function isUserExhibitionManager(
  userId: string,
  userEmail: string | undefined,
  exhibitionId: string
): Promise<boolean> {
  if (!userId || !exhibitionId) return false
  try {
    const supabase = await createClient()

    // 1. Fetch exhibition to get its organization_id
    const { data: exh } = await supabase
      .from('exhibitions')
      .select('id, organization_id')
      .eq('id', exhibitionId)
      .maybeSingle()

    if (!exh || !exh.organization_id) {
      return false
    }

    // 2. Check if user is an authorized organization member (owner / admin / member)
    const { data: member } = await supabase
      .from('organization_members')
      .select('id, role')
      .eq('organization_id', exh.organization_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (member) {
      return true
    }

    // 3. Check if user email matches organization contact_email
    if (userEmail) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, contact_email')
        .eq('id', exh.organization_id)
        .maybeSingle()

      if (org?.contact_email && org.contact_email.trim().toLowerCase() === userEmail.trim().toLowerCase()) {
        return true
      }
    }

    return false
  } catch (err) {
    console.error('Error verifying exhibition manager permissions:', err)
    return false
  }
}

export async function checkIsExhibitionManagerAction(exhibitionId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    return await isUserExhibitionManager(user.id, user.email, exhibitionId)
  } catch {
    return false
  }
}

export async function createBooking(data: {
  boothId: string
  exhibitionId: string
  organizationName?: string
  contactName: string
  contactPhone: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { 
      success: false, 
      requireAuth: true, 
      error: 'يجب تسجيل الدخول لمتابعة حجز البوث' 
    }
  }

  // 1. Verify booth exists and resolve its true exhibition_id directly from the database
  const { data: boothRecord, error: boothFetchError } = await supabase
    .from('booths')
    .select('id, exhibition_id, price, currency, operational_status')
    .eq('id', data.boothId)
    .maybeSingle()

  const targetExhibitionId = boothRecord?.exhibition_id || data.exhibitionId

  // 2. SERVER-SIDE SECURITY CHECK:
  // Strictly prevent exhibition organizers/managers/owners from booking booths in their own exhibitions!
  const isManager = await isUserExhibitionManager(user.id, user.email, targetExhibitionId)
  if (isManager) {
    return {
      success: false,
      isOrganizer: true,
      error: 'لا يمكنك حجز بوث في معرض تديره. يمكنك إدارة البوثات والحجوزات من لوحة تحكم المنظم.'
    }
  }

  if (boothRecord && boothRecord.operational_status !== 'operational') {
    return {
      success: false,
      error: 'عذراً! هذا البوث غير متاح حالياً للحجز (تحت الصيانة أو مغلق).'
    }
  }

  // Attempt to call RPC first for atomic locking
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_booth_booking', {
      p_booth_id: data.boothId,
      p_exhibition_id: targetExhibitionId,
      p_organization_name: data.organizationName || '',
      p_contact_name: data.contactName,
      p_contact_phone: data.contactPhone
    })

    if (!rpcError && rpcData?.success) {
      revalidatePath(`/explore/${targetExhibitionId}`)
      revalidatePath('/dashboard/exhibitor')
      return { 
        success: true, 
        bookingReference: rpcData.booking_reference, 
        bookingId: rpcData.booking_id 
      }
    }

    if (rpcError) {
      if (rpcError.message.includes('لا يمكنك حجز بوث في معرض تديره')) {
        return {
          success: false,
          isOrganizer: true,
          error: 'لا يمكنك حجز بوث في معرض تديره. يمكنك إدارة البوثات والحجوزات من لوحة تحكم المنظم.'
        }
      }
      if (rpcError.message.includes('محجوز بالفعل')) {
        return { success: false, error: 'عذراً! تم حجز هذا البوث من قبل عارض آخر' }
      }
    }
  } catch (e) {
    console.log('RPC execution fallback to direct insert')
  }

  // Direct insert fallback
  try {
    // Check if booth is already booked
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('booth_id', data.boothId)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (existingBooking) {
      return { success: false, error: 'عذراً! هذا البوث محجوز بالفعل' }
    }

    const reference = 'BH-' + Math.floor(100000 + Math.random() * 900000)

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        booking_reference: reference,
        booth_id: data.boothId,
        exhibition_id: targetExhibitionId,
        exhibitor_id: user.id,
        organization_name: data.organizationName || user.user_metadata?.organization_name || '',
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        total_amount: boothRecord?.price || 5000,
        currency: boothRecord?.currency || 'SAR',
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    revalidatePath(`/explore/${targetExhibitionId}`)
    revalidatePath('/dashboard/exhibitor')
    return { success: true, bookingReference: reference, bookingId: booking.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ أثناء إتمام الحجز' }
  }
}

export async function getUserBookings(): Promise<BookingRecord[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        exhibitions (title),
        booths (booth_number)
      `)
      .eq('exhibitor_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((b: any) => ({
      id: b.id,
      booking_reference: b.booking_reference,
      booth_id: b.booth_id,
      exhibition_id: b.exhibition_id,
      exhibition_title: b.exhibitions?.title || 'معرض تقني',
      booth_number: b.booths?.booth_number || 'A1',
      organization_name: b.organization_name,
      contact_name: b.contact_name,
      contact_phone: b.contact_phone,
      total_amount: Number(b.total_amount),
      currency: b.currency,
      status: b.status,
      created_at: b.created_at
    }))
  } catch (e) {
    console.error('Error fetching user bookings:', e)
    return []
  }
}

export async function getOrganizerBookings(): Promise<BookingRecord[]> {
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

    if (orgIds.length === 0) {
      return []
    }

    const { data: myExhibitions } = await supabase
      .from('exhibitions')
      .select('id')
      .in('organization_id', orgIds)

    const myExhibitionIds = myExhibitions?.map(e => e.id) || []
    if (myExhibitionIds.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        exhibitions (title),
        booths (booth_number)
      `)
      .in('exhibition_id', myExhibitionIds)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((b: any) => ({
      id: b.id,
      booking_reference: b.booking_reference,
      booth_id: b.booth_id,
      exhibition_id: b.exhibition_id,
      exhibition_title: b.exhibitions?.title || 'معرض',
      booth_number: b.booths?.booth_number || 'B1',
      organization_name: b.organization_name || b.contact_name,
      contact_name: b.contact_name,
      contact_phone: b.contact_phone,
      total_amount: Number(b.total_amount),
      currency: b.currency,
      status: b.status,
      created_at: b.created_at
    }))
  } catch (e) {
    console.error('Error getting organizer bookings:', e)
    return []
  }
}
