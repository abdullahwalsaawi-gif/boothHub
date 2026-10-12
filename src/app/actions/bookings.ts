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
  exhibition_city?: string
  exhibition_venue?: string
  exhibition_dates?: string
  booth_number?: string
  booth_size_sqm?: number
  booth_price?: number
  organization_name?: string
  contact_name: string
  contact_phone: string
  contact_email?: string
  total_amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'expired'
  payment_status?: 'paid' | 'pending' | 'unpaid'
  created_at: string
}

export type OrganizerBoothRecord = {
  id: string
  booth_number: string
  exhibition_id: string
  exhibition_title: string
  size_sqm: number
  price: number
  currency: string
  operational_status: 'operational' | 'maintenance' | 'disabled'
  status: 'available' | 'pending' | 'booked' | 'unavailable'
  booking?: {
    id: string
    booking_reference: string
    contact_name: string
    contact_phone?: string
    contact_email?: string
    organization_name?: string
    status: 'pending' | 'confirmed'
    total_amount: number
    created_at?: string
  }
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
        exhibitions (id, title, city, venue, start_date, end_date),
        booths (id, booth_number, size_sqm, price)
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
      exhibition_city: b.exhibitions?.city,
      exhibition_venue: b.exhibitions?.venue,
      exhibition_dates: b.exhibitions?.start_date && b.exhibitions?.end_date ? `${b.exhibitions.start_date} إلى ${b.exhibitions.end_date}` : undefined,
      booth_number: b.booths?.booth_number || 'B1',
      booth_size_sqm: b.booths?.size_sqm ? Number(b.booths.size_sqm) : undefined,
      booth_price: b.booths?.price ? Number(b.booths.price) : undefined,
      organization_name: b.organization_name || b.contact_name,
      contact_name: b.contact_name,
      contact_phone: b.contact_phone,
      contact_email: b.contact_email || undefined,
      total_amount: Number(b.total_amount),
      currency: b.currency,
      status: b.status,
      payment_status: b.status === 'confirmed' ? 'paid' : (b.status === 'pending' ? 'pending' : 'unpaid'),
      created_at: b.created_at
    }))
  } catch (e) {
    console.error('Error getting organizer bookings:', e)
    return []
  }
}

/**
 * Update a booking's status (Accept / Reject) with atomic validation and ownership checks
 */
export async function updateBookingStatus(
  bookingId: string, 
  newStatus: 'confirmed' | 'rejected'
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً' }
    }

    // 1. Fetch booking record to verify exhibition ownership
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('id, booth_id, exhibition_id, booking_reference, status, exhibitor_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchErr || !booking) {
      return { success: false, error: 'طلب الحجز غير موجود' }
    }

    // 2. Strict ownership verification
    const isManager = await isUserExhibitionManager(user.id, user.email, booking.exhibition_id)
    if (!isManager) {
      return { success: false, error: 'ليس لديك صلاحية لإدارة حجوزات هذا المعرض' }
    }

    // 3. If confirming, ensure no conflict exists for this booth
    if (newStatus === 'confirmed') {
      const { data: conflict } = await supabase
        .from('bookings')
        .select('id, booking_reference')
        .eq('booth_id', booking.booth_id)
        .eq('status', 'confirmed')
        .neq('id', bookingId)
        .maybeSingle()

      if (conflict) {
        return { 
          success: false, 
          error: `عذراً! يوجد حجز مؤكد بالفعل لهذا البوث برقم مرجعي (${conflict.booking_reference}). لا يمكن تأكيد حجزين متعارضين.` 
        }
      }
    }

    // 4. Update booking status
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (updateErr) {
      return { success: false, error: updateErr.message || 'فشل تحديث حالة الحجز' }
    }

    // 5. Send notification to exhibitor
    if (booking.exhibitor_id) {
      const notifMessage = newStatus === 'confirmed'
        ? `تهانينا! تم تأكيد طلب حجز البوث ذو الرقم المرجعي (${booking.booking_reference}) من قبل منظم المعرض.`
        : `نأسف لإبلاغك، تم رفض طلب حجز البوث ذو الرقم المرجعي (${booking.booking_reference}) من قبل منظم المعرض.`

      try {
        await supabase.from('notifications').insert({
          user_id: booking.exhibitor_id,
          title: newStatus === 'confirmed' ? 'تم تأكيد طلب الحجز' : 'تم رفض طلب الحجز',
          message: notifMessage,
          type: newStatus === 'confirmed' ? 'success' : 'error'
        })
      } catch (notifErr) {
        console.warn('Notification insert notice:', notifErr)
      }
    }

    revalidatePath('/dashboard/organizer')
    revalidatePath('/dashboard/exhibitor')
    revalidatePath(`/explore/${booking.exhibition_id}`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ غير متوقع أثناء تحديث الحجز' }
  }
}

/**
 * Fetch all booths belonging to all exhibitions owned by the authenticated organizer
 */
export async function getOrganizerBooths(): Promise<OrganizerBoothRecord[]> {
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

    if (orgIds.length === 0) return []

    // Fetch organizer exhibitions
    const { data: myExhibitions } = await supabase
      .from('exhibitions')
      .select('id, title')
      .in('organization_id', orgIds)

    if (!myExhibitions || myExhibitions.length === 0) return []
    const exhMap = new Map(myExhibitions.map(e => [e.id, e.title]))
    const myExhIds = myExhibitions.map(e => e.id)

    // Fetch all booths
    const { data: booths, error: boothErr } = await supabase
      .from('booths')
      .select('*')
      .in('exhibition_id', myExhIds)
      .order('booth_number', { ascending: true })

    if (boothErr || !booths) return []

    // Fetch active bookings for these exhibitions
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booth_id, booking_reference, contact_name, contact_phone, organization_name, status, total_amount, created_at')
      .in('exhibition_id', myExhIds)
      .in('status', ['pending', 'confirmed'])

    const bookingByBoothId = new Map<string, any>()
    bookings?.forEach(b => {
      // Prioritize confirmed over pending if multiple
      const existing = bookingByBoothId.get(b.booth_id)
      if (!existing || b.status === 'confirmed') {
        bookingByBoothId.set(b.booth_id, b)
      }
    })

    return booths.map(b => {
      const activeBooking = bookingByBoothId.get(b.id)
      let status: 'available' | 'pending' | 'booked' | 'unavailable' = 'available'

      if (b.operational_status !== 'operational') {
        status = 'unavailable'
      } else if (activeBooking) {
        status = activeBooking.status === 'confirmed' ? 'booked' : 'pending'
      }

      return {
        id: b.id,
        booth_number: b.booth_number,
        exhibition_id: b.exhibition_id,
        exhibition_title: exhMap.get(b.exhibition_id) || 'معرض',
        size_sqm: Number(b.size_sqm),
        price: Number(b.price),
        currency: b.currency || 'SAR',
        operational_status: b.operational_status || 'operational',
        status,
        booking: activeBooking ? {
          id: activeBooking.id,
          booking_reference: activeBooking.booking_reference,
          contact_name: activeBooking.contact_name,
          contact_phone: activeBooking.contact_phone,
          organization_name: activeBooking.organization_name,
          status: activeBooking.status,
          total_amount: Number(activeBooking.total_amount),
          created_at: activeBooking.created_at
        } : undefined
      }
    })
  } catch (err) {
    console.error('Error fetching organizer booths:', err)
    return []
  }
}
