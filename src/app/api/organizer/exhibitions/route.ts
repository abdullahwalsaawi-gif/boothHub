import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/organizer/exhibitions - Fetch ONLY current organizer's exhibitions
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح: يجب تسجيل الدخول' }, { status: 401 })
    }

    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select(`
        *,
        booths (id, operational_status)
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formatted = exhibitions.map((item: any) => ({
      ...item,
      total_booths: item.booths?.length || 0,
      available_booths: item.booths?.filter((b: any) => b.operational_status === 'operational').length || 0
    }))

    return NextResponse.json(formatted)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/organizer/exhibitions - Create a new exhibition belonging strictly to the current organizer
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح: يجب تسجيل الدخول' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, city, venue, start_date, end_date, status = 'published' } = body

    if (!title || !category || !city || !venue || !start_date || !end_date) {
      return NextResponse.json({ error: 'يرجى تزويد جميع الحقول الإلزامية' }, { status: 400 })
    }

    // Insert exhibition with strict organizer_id assignment
    const { data: exhibition, error: insertError } = await supabase
      .from('exhibitions')
      .insert({
        organizer_id: user.id,
        title,
        description,
        category,
        city,
        venue,
        start_date,
        end_date,
        status
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Seed default booths for the newly created exhibition
    const defaultBooths = [
      { exhibition_id: exhibition.id, booth_number: 'A1', size_sqm: 9, price: 4500, position_x: 50, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
      { exhibition_id: exhibition.id, booth_number: 'A2', size_sqm: 9, price: 4500, position_x: 120, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
      { exhibition_id: exhibition.id, booth_number: 'A3', size_sqm: 9, price: 4500, position_x: 190, position_y: 50, width: 60, height: 60, operational_status: 'operational' },
      { exhibition_id: exhibition.id, booth_number: 'B1', size_sqm: 16, price: 7500, position_x: 50, position_y: 150, width: 80, height: 80, operational_status: 'operational' },
      { exhibition_id: exhibition.id, booth_number: 'B2', size_sqm: 16, price: 7500, position_x: 140, position_y: 150, width: 80, height: 80, operational_status: 'operational' },
      { exhibition_id: exhibition.id, booth_number: 'C1', size_sqm: 25, price: 11000, position_x: 50, position_y: 270, width: 120, height: 60, operational_status: 'operational' }
    ]
    await supabase.from('booths').insert(defaultBooths)

    return NextResponse.json({ success: true, exhibition }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/organizer/exhibitions - Update exhibition with ownership validation
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح: يجب تسجيل الدخول' }, { status: 401 })
    }

    const body = await req.json()
    const { id, title, description, category, city, venue, start_date, end_date, status } = body

    if (!id) {
      return NextResponse.json({ error: 'معرف المعرض مطلوب' }, { status: 400 })
    }

    // Ownership check: Verify exhibition belongs to this organizer
    const { data: existing, error: checkError } = await supabase
      .from('exhibitions')
      .select('id, organizer_id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'المعرض غير موجود' }, { status: 404 })
    }

    if (existing.organizer_id !== user.id) {
      return NextResponse.json({ error: 'مرفوض: ليس لديك صلاحية تعديل هذا المعرض' }, { status: 403 })
    }

    const { data: updated, error: updateError } = await supabase
      .from('exhibitions')
      .update({
        title,
        description,
        category,
        city,
        venue,
        start_date,
        end_date,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organizer_id', user.id) // Double-check constraint
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, exhibition: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/organizer/exhibitions - Delete exhibition with ownership validation
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح: يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'معرف المعرض مطلوب' }, { status: 400 })
    }

    // Ownership check: Verify exhibition belongs to this organizer
    const { data: existing, error: checkError } = await supabase
      .from('exhibitions')
      .select('id, organizer_id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'المعرض غير موجود' }, { status: 404 })
    }

    if (existing.organizer_id !== user.id) {
      return NextResponse.json({ error: 'مرفوض: ليس لديك صلاحية حذف هذا المعرض' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', id)
      .eq('organizer_id', user.id) // Double-check constraint

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'تم حذف المعرض بنجاح' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ في الخادم' }, { status: 500 })
  }
}
