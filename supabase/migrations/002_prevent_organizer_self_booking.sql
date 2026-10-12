-- ========================================================
-- بوث هب | Booth Hub - Migration 002
-- منع منظم المعرض أو مديريه من حجز بوث داخل معرضهم الخاص
-- ========================================================

-- 1. تحديث دالة التحقق من صفة منظم/مدير المعرض (SECURITY DEFINER لمنع التكرار اللانهائي)
CREATE OR REPLACE FUNCTION public.is_exhibition_organizer(exh_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.exhibitions e
    LEFT JOIN public.organizations o ON e.organization_id = o.id
    LEFT JOIN public.organization_members om ON e.organization_id = om.organization_id
    LEFT JOIN public.profiles p ON p.id = auth.uid()
    WHERE e.id = exh_id
      AND (
        om.user_id = auth.uid()
        OR (p.email IS NOT NULL AND LOWER(TRIM(o.contact_email)) = LOWER(TRIM(p.email)))
      )
  );
$$;

-- 2. تحديث سياسة الأمان RLS على جدول الحجوزات (bookings) لمنع منظم المعرض من إنشاء حجز
DROP POLICY IF EXISTS "Exhibitors can create bookings" ON public.bookings;

CREATE POLICY "Exhibitors can create bookings"
ON public.bookings FOR INSERT TO authenticated WITH CHECK (
    exhibitor_id = auth.uid()
    AND NOT public.is_exhibition_organizer(bookings.exhibition_id)
);

-- 3. تحديث الدالة الذرية create_booth_booking لمنع حجز المنظم داخل المعرض
CREATE OR REPLACE FUNCTION public.create_booth_booking(
    p_booth_id UUID,
    p_exhibition_id UUID,
    p_organization_name TEXT,
    p_contact_name TEXT,
    p_contact_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_booth RECORD;
    v_booking_ref TEXT;
    v_booking_id UUID;
    v_is_organizer BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'المستخدم غير مسجل الدخول';
    END IF;

    -- التحقق الأمني الصارم: منع منظم أو مدير المعرض من حجز بوث داخل هذا المعرض
    IF public.is_exhibition_organizer(p_exhibition_id) THEN
        RAISE EXCEPTION 'لا يمكنك حجز بوث في معرض تديره. يمكنك إدارة البوثات والحجوزات من لوحة تحكم المنظم.';
    END IF;

    -- قفل سجل البوث للتأكد من عدم الحجز المتزامن
    SELECT * INTO v_booth
    FROM public.booths
    WHERE id = p_booth_id AND exhibition_id = p_exhibition_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'البوث غير موجود في هذا المعرض';
    END IF;

    IF v_booth.operational_status != 'operational' THEN
        RAISE EXCEPTION 'البوث غير متاح حالياً للحجز (تحت الصيانة أو مغلق)';
    END IF;

    -- التحقق من عدم وجود حجز نشط سابق
    IF EXISTS (
        SELECT 1 FROM public.bookings
        WHERE booth_id = p_booth_id AND status IN ('pending', 'confirmed')
    ) THEN
        RAISE EXCEPTION 'عذراً، هذا البوث محجوز بالفعل أو قيد المراجعة';
    END IF;

    -- توليد رقم الحجز المرجعي الفريد
    v_booking_ref := 'BH-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));

    -- إدراج الحجز
    INSERT INTO public.bookings (
        booking_reference,
        booth_id,
        exhibition_id,
        exhibitor_id,
        organization_name,
        contact_name,
        contact_phone,
        total_amount,
        currency,
        status
    ) VALUES (
        v_booking_ref,
        p_booth_id,
        p_exhibition_id,
        v_user_id,
        p_organization_name,
        p_contact_name,
        p_contact_phone,
        v_booth.price,
        v_booth.currency,
        'pending'
    ) RETURNING id INTO v_booking_id;

    -- إنشاء إشعار للمستخدم
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        v_user_id,
        'تم استلام طلب الحجز',
        'تم استلام طلب حجز البوث رقم ' || v_booth.booth_number || ' بنجاح وهو قيد المراجعة.',
        'success'
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_booking_ref
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
