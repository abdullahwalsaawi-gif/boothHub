'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type BoothInput = {
  id?: string
  booth_number: string
  name?: string
  width_m: number
  height_m: number
  size_sqm: number
  price: number
  x: number // in meters
  y: number // in meters
  rotation?: number
  operational_status?: 'operational' | 'maintenance' | 'disabled'
}

export type HallDimensions = {
  width_m: number
  height_m: number
  total_area_sqm: number
}

export type SaveFloorplanInput = {
  exhibitionId: string
  hall: HallDimensions
  booths: BoothInput[]
}

/**
 * Save complete exhibition floor plan & booths
 * Validates ownership, bounds, non-overlap, and preserves booked booths.
 */
export async function saveExhibitionFloorplan(input: SaveFloorplanInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'يجب تسجيل الدخول كمنظم أولاً لحفظ المخطط' }
    }

    const { exhibitionId, hall, booths } = input

    if (!exhibitionId) {
      return { success: false, error: 'معرّف المعرض غير محدد' }
    }

    // 1. Verify exhibition ownership / organization access
    const { data: exhibition, error: exhError } = await supabase
      .from('exhibitions')
      .select('id, organization_id, title')
      .eq('id', exhibitionId)
      .maybeSingle()

    if (exhError || !exhibition) {
      return { success: false, error: 'المعرض غير موجود أو ليس لديك صلاحية للوصول إليه' }
    }

    // 2. Fetch existing booths and active bookings for this exhibition
    const { data: existingBooths } = await supabase
      .from('booths')
      .select('id, booth_number, size_sqm, price')
      .eq('exhibition_id', exhibitionId)

    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id, booth_id, status, booking_reference')
      .eq('exhibition_id', exhibitionId)
      .in('status', ['pending', 'confirmed'])

    const bookedBoothIds = new Set((activeBookings || []).map(b => b.booth_id))
    const existingBoothsMap = new Map((existingBooths || []).map(b => [b.id, b]))

    // 3. Prevent deleting or modifying reserved booths inappropriately
    // Check if any booked booth was omitted from input
    const newBoothIds = new Set(booths.map(b => b.id).filter(Boolean))
    for (const bookedId of bookedBoothIds) {
      if (!newBoothIds.has(bookedId)) {
        const bookedRecord = existingBoothsMap.get(bookedId)
        return {
          success: false,
          error: `لا يمكن حذف البوث رقم (${bookedRecord?.booth_number || bookedId}) لوجود حجز مؤكد أو قيد المعالجة عليه.`
        }
      }
    }

    // 4. Validate hall dimensions
    if (hall.width_m <= 0 || hall.height_m <= 0) {
      return { success: false, error: 'أبعاد القاعة يجب أن تكون أرقاماً موجبة بالمتر' }
    }

    // 5. Server-side validation for booths:
    // a) unique booth numbers
    // b) bounds checking (must fit in hall)
    // c) non-overlap checking
    const numbersSet = new Set<string>()
    for (const b of booths) {
      const num = b.booth_number.trim()
      if (!num) {
        return { success: false, error: 'يجب تحديد رقم لكل بوث داخل المخطط' }
      }
      if (numbersSet.has(num)) {
        return { success: false, error: `رقم البوث (${num}) مكرر، يجب أن يكون لكل بوث رقم فريد.` }
      }
      numbersSet.add(num)

      if (b.width_m <= 0 || b.height_m <= 0) {
        return { success: false, error: `أبعاد البوث (${num}) يجب أن تكون أكبر من الصفر.` }
      }

      // Check within hall bounds (allow small epsilon for precision)
      if (b.x < 0 || b.y < 0 || (b.x + b.width_m) > hall.width_m + 0.1 || (b.y + b.height_m) > hall.height_m + 0.1) {
        return {
          success: false,
          error: `البوث رقم (${num}) يقع خارج حدود قاعة المعرض (${hall.width_m}م × ${hall.height_m}م).`
        }
      }
    }

    // Check overlaps among booths
    for (let i = 0; i < booths.length; i++) {
      for (let j = i + 1; j < booths.length; j++) {
        const b1 = booths[i]
        const b2 = booths[j]
        const overlap = !(
          b1.x + b1.width_m <= b2.x ||
          b2.x + b2.width_m <= b1.x ||
          b1.y + b1.height_m <= b2.y ||
          b2.y + b2.height_m <= b1.y
        )
        if (overlap) {
          return {
            success: false,
            error: `يوجد تداخل بين البوث (${b1.booth_number}) والبوث (${b2.booth_number}). يرجى تعديل مواقعهما.`
          }
        }
      }
    }

    // 6. Save or update exhibition plan record
    let planId: string | null = null
    const { data: existingPlan } = await supabase
      .from('exhibition_plans')
      .select('id')
      .eq('exhibition_id', exhibitionId)
      .maybeSingle()

    if (existingPlan?.id) {
      planId = existingPlan.id
      await supabase
        .from('exhibition_plans')
        .update({
          title: `مخطط ${exhibition.title || 'المعرض'}`,
          width: hall.width_m,
          height: hall.height_m,
        })
        .eq('id', planId)
    } else {
      const { data: newPlan } = await supabase
        .from('exhibition_plans')
        .insert({
          exhibition_id: exhibitionId,
          title: `مخطط ${exhibition.title || 'المعرض'}`,
          width: hall.width_m,
          height: hall.height_m,
        })
        .select('id')
        .maybeSingle()
      planId = newPlan?.id || null
    }

    // 7. Sync booths:
    // Determine which booths to delete (those in existingBooths not in new input and not booked)
    const inputIds = new Set(booths.map(b => b.id).filter(Boolean))
    const toDeleteIds = (existingBooths || [])
      .map(b => b.id)
      .filter(id => !inputIds.has(id) && !bookedBoothIds.has(id))

    if (toDeleteIds.length > 0) {
      await supabase
        .from('booths')
        .delete()
        .in('id', toDeleteIds)
    }

    // Upsert or insert booths
    // Conversion scale: For UI/SVG rendering compatibility, width in pixels/units:
    // We store width_m in width, height_m in height, position_x, position_y, size_sqm, price, rotation
    for (const b of booths) {
      const area = Math.round(b.width_m * b.height_m * 10) / 10
      const boothRow = {
        exhibition_id: exhibitionId,
        plan_id: planId,
        booth_number: b.booth_number.trim(),
        size_sqm: b.size_sqm || area,
        price: Number(b.price) || 0,
        currency: 'SAR',
        position_x: Number(b.x),
        position_y: Number(b.y),
        width: Number(b.width_m),
        height: Number(b.height_m),
        rotation: Number(b.rotation || 0),
        operational_status: b.operational_status || 'operational',
        amenities: b.name ? [b.name] : []
      }

      if (b.id && existingBoothsMap.has(b.id)) {
        await supabase
          .from('booths')
          .update(boothRow)
          .eq('id', b.id)
      } else {
        await supabase
          .from('booths')
          .insert(boothRow)
      }
    }

    revalidatePath(`/explore/${exhibitionId}`)
    revalidatePath('/dashboard/organizer')

    return {
      success: true,
      message: 'تم حفظ مخطط المعرض والبوثات بنجاح!'
    }
  } catch (err: any) {
    console.error('Error saving floor plan:', err)
    return { success: false, error: err.message || 'حدث خطأ غير متوقع أثناء حفظ المخطط' }
  }
}

/**
 * Load full exhibition floor plan editor data
 */
export async function getExhibitionFloorplanData(exhibitionId: string) {
  try {
    const supabase = await createClient()

    // 1. Exhibition info
    const { data: exhibition } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('id', exhibitionId)
      .maybeSingle()

    if (!exhibition) return null

    // 2. Plan info
    const { data: plan } = await supabase
      .from('exhibition_plans')
      .select('*')
      .eq('exhibition_id', exhibitionId)
      .maybeSingle()

    // 3. Booths info
    const { data: booths } = await supabase
      .from('booths')
      .select('*')
      .eq('exhibition_id', exhibitionId)
      .order('booth_number', { ascending: true })

    // 4. Bookings info
    const { data: bookings } = await supabase
      .from('bookings')
      .select('booth_id, status')
      .eq('exhibition_id', exhibitionId)
      .in('status', ['pending', 'confirmed'])

    const bookedMap = new Map((bookings || []).map(b => [b.booth_id, b.status]))

    const hall: HallDimensions = {
      width_m: plan?.width ? Number(plan.width) : 40,
      height_m: plan?.height ? Number(plan.height) : 30,
      total_area_sqm: (plan?.width ? Number(plan.width) : 40) * (plan?.height ? Number(plan.height) : 30)
    }

    const mappedBooths: BoothInput[] = (booths || []).map(b => {
      const isBooked = bookedMap.has(b.id)
      return {
        id: b.id,
        booth_number: b.booth_number,
        name: Array.isArray(b.amenities) && b.amenities[0] ? String(b.amenities[0]) : '',
        width_m: Number(b.width) || 3,
        height_m: Number(b.height) || 3,
        size_sqm: Number(b.size_sqm) || (Number(b.width) * Number(b.height)),
        price: Number(b.price) || 0,
        x: Number(b.position_x) || 0,
        y: Number(b.position_y) || 0,
        rotation: Number(b.rotation) || 0,
        operational_status: isBooked ? 'disabled' : (b.operational_status as any || 'operational')
      }
    })

    return {
      exhibition,
      hall,
      booths: mappedBooths,
      bookedBoothIds: Array.from(bookedMap.keys())
    }
  } catch (err) {
    console.error('Error getting floor plan data:', err)
    return null
  }
}
