-- ========================================================
-- بوث هب | Booth Hub - Database Schema & Security (Supabase)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    account_type TEXT NOT NULL CHECK (account_type IN ('exhibitor', 'organizer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    phone TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Organization Members Table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- 4. Exhibitions Table
CREATE TABLE IF NOT EXISTS public.exhibitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    venue TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    booking_start_date DATE,
    booking_end_date DATE,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Exhibition Plans Table
CREATE TABLE IF NOT EXISTS public.exhibition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    plan_file_url TEXT,
    width NUMERIC DEFAULT 800,
    height NUMERIC DEFAULT 600,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Booths Table
CREATE TABLE IF NOT EXISTS public.booths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.exhibition_plans(id) ON DELETE SET NULL,
    booth_number TEXT NOT NULL,
    size_sqm NUMERIC NOT NULL DEFAULT 9,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'SAR',
    position_x NUMERIC NOT NULL DEFAULT 0,
    position_y NUMERIC NOT NULL DEFAULT 0,
    width NUMERIC NOT NULL DEFAULT 60,
    height NUMERIC NOT NULL DEFAULT 60,
    rotation NUMERIC NOT NULL DEFAULT 0,
    amenities JSONB DEFAULT '[]'::jsonb,
    operational_status TEXT NOT NULL DEFAULT 'operational' CHECK (operational_status IN ('operational', 'maintenance', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(exhibition_id, booth_number)
);

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT NOT NULL UNIQUE,
    booth_id UUID NOT NULL REFERENCES public.booths(id) ON DELETE RESTRICT,
    exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE RESTRICT,
    exhibitor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    organization_name TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'SAR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Atomic constraint to prevent double bookings on active bookings
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booth_booking
ON public.bookings (booth_id)
WHERE status IN ('pending', 'confirmed');

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_transaction_id TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'SAR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================================
-- Trigger: Auto-create profile on user signup
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, account_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'account_type', 'exhibitor')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- Row Level Security (RLS)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations Policies
CREATE POLICY "Organizations are viewable by everyone" 
ON public.organizations FOR SELECT USING (true);

CREATE POLICY "Members can update their organization" 
ON public.organizations FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = organizations.id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can create organization"
ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);

-- Organization Members Policies
CREATE POLICY "Organization members viewable by members"
ON public.organization_members FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can join or add members"
ON public.organization_members FOR INSERT TO authenticated WITH CHECK (true);

-- Exhibitions Policies
CREATE POLICY "Published exhibitions are viewable by everyone"
ON public.exhibitions FOR SELECT USING (
    status = 'published' OR 
    (auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = exhibitions.organization_id 
        AND user_id = auth.uid()
    ))
);

CREATE POLICY "Organizers can create exhibitions"
ON public.exhibitions FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = exhibitions.organization_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Organizers can update their exhibitions"
ON public.exhibitions FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = exhibitions.organization_id 
        AND user_id = auth.uid()
    )
);

-- Booths Policies
CREATE POLICY "Booths viewable by everyone"
ON public.booths FOR SELECT USING (true);

CREATE POLICY "Organizers can manage booths"
ON public.booths FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.exhibitions e
        JOIN public.organization_members om ON e.organization_id = om.organization_id
        WHERE e.id = booths.exhibition_id 
        AND om.user_id = auth.uid()
    )
);

-- Bookings Policies
CREATE POLICY "Exhibitors can view their own bookings"
ON public.bookings FOR SELECT TO authenticated USING (
    exhibitor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.exhibitions e
        JOIN public.organization_members om ON e.organization_id = om.organization_id
        WHERE e.id = bookings.exhibition_id 
        AND om.user_id = auth.uid()
    )
);

CREATE POLICY "Exhibitors can create bookings"
ON public.bookings FOR INSERT TO authenticated WITH CHECK (
    exhibitor_id = auth.uid()
);

CREATE POLICY "Exhibitors can cancel or organizers can update bookings"
ON public.bookings FOR UPDATE TO authenticated USING (
    exhibitor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.exhibitions e
        JOIN public.organization_members om ON e.organization_id = om.organization_id
        WHERE e.id = bookings.exhibition_id 
        AND om.user_id = auth.uid()
    )
);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT TO authenticated USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated USING (
    user_id = auth.uid()
);

-- ========================================================
-- Atomic Booth Booking RPC (Safe Concurrent Booking)
-- ========================================================
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
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'المستخدم غير مسجل الدخول';
    END IF;

    -- Lock the booth row for update to ensure atomic state check
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

    -- Check if there is already an active booking
    IF EXISTS (
        SELECT 1 FROM public.bookings
        WHERE booth_id = p_booth_id AND status IN ('pending', 'confirmed')
    ) THEN
        RAISE EXCEPTION 'عذراً، هذا البوث محجوز بالفعل أو قيد المراجعة';
    END IF;

    -- Generate reference
    v_booking_ref := 'BH-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));

    -- Insert Booking
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

    -- Create notification for user
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

-- ========================================================
-- Seed Initial Sample Data (Demonstration Exhibitions & Booths)
-- ========================================================
DO $$
DECLARE
    v_org_id UUID;
    v_ex1_id UUID;
    v_ex2_id UUID;
    v_ex3_id UUID;
    v_ex4_id UUID;
BEGIN
    -- Check if sample data already exists
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'شركة تنظيم المعارض الوطنية') THEN
        INSERT INTO public.organizations (name, description, contact_email, phone)
        VALUES ('شركة تنظيم المعارض الوطنية', 'الجهة الرائدة في تنظيم المعارض والمؤتمرات في المملكة', 'info@exhibitions.sa', '0112345678')
        RETURNING id INTO v_org_id;

        -- Exhibition 1
        INSERT INTO public.exhibitions (
            organization_id, title, description, category, city, venue, 
            start_date, end_date, booking_start_date, booking_end_date, status
        ) VALUES (
            v_org_id,
            'معرض التقنية السعودي 2026',
            'الحدث التقني الأكبر في المنطقة يجمع رواد التكنولوجيا والشركات الناشئة تحت سقف واحد لاستعراض أحدث ابتكارات الذكاء الاصطناعي والحوسبة السحابية.',
            'تقنية',
            'الرياض',
            'واجهة الرياض للمعارض والمؤتمرات',
            '2026-10-15',
            '2026-10-18',
            '2026-08-01',
            '2026-10-10',
            'published'
        ) RETURNING id INTO v_ex1_id;

        -- Booths for Exhibition 1
        INSERT INTO public.booths (exhibition_id, booth_number, size_sqm, price, position_x, position_y, width, height, amenities, operational_status)
        VALUES
            (v_ex1_id, 'A1', 9, 5000, 50, 50, 60, 60, '["كهرباء", "طاولة وكراسي", "إنترنت فائق السرعة"]', 'operational'),
            (v_ex1_id, 'A2', 9, 5000, 120, 50, 60, 60, '["كهرباء", "طاولة وكراسي"]', 'operational'),
            (v_ex1_id, 'A3', 9, 5000, 190, 50, 60, 60, '["كهرباء", "طاولة وكراسي"]', 'operational'),
            (v_ex1_id, 'A4', 9, 5000, 260, 50, 60, 60, '["كهرباء", "طاولة وكراسي"]', 'operational'),
            (v_ex1_id, 'B1', 16, 8000, 50, 150, 80, 80, '["كهرباء ثلاثية الفاز", "شاشة عرض 55 بوصة", "طاولة اجتماعات"]', 'operational'),
            (v_ex1_id, 'B2', 16, 8000, 140, 150, 80, 80, '["كهرباء ثلاثية الفاز", "طاولة اجتماعات"]', 'maintenance'),
            (v_ex1_id, 'B3', 16, 8000, 230, 150, 80, 80, '["كهرباء ثلاثية الفاز", "شاشة عرض 55 بوصة"]', 'operational'),
            (v_ex1_id, 'C1', 25, 12000, 50, 270, 120, 60, '["موقع مميز", "شاشة LED", "أثاث فاخر", "ضيافة خاصة"]', 'operational'),
            (v_ex1_id, 'C2', 25, 12000, 180, 270, 120, 60, '["موقع مميز", "شاشة LED", "أثاث فاخر"]', 'operational');

        -- Exhibition 2
        INSERT INTO public.exhibitions (
            organization_id, title, description, category, city, venue, 
            start_date, end_date, booking_start_date, booking_end_date, status
        ) VALUES (
            v_org_id,
            'معرض الكتاب الدولي',
            'تظاهرة ثقافية كبرى تحتفي بالكلمة والأدب والإنتاج المعرفي العربي والعالمي بمشاركة مئات دور النشر.',
            'ثقافة',
            'جدة',
            'سوبر دوم جدة',
            '2026-11-01',
            '2026-11-10',
            '2026-09-01',
            '2026-10-25',
            'published'
        ) RETURNING id INTO v_ex2_id;

        -- Booths for Exhibition 2
        INSERT INTO public.booths (exhibition_id, booth_number, size_sqm, price, position_x, position_y, width, height, amenities, operational_status)
        VALUES
            (v_ex2_id, 'K1', 12, 6000, 60, 60, 70, 70, '["أرفف كتب", "إضاءة مركزة", "نقطة بيع"]', 'operational'),
            (v_ex2_id, 'K2', 12, 6000, 150, 60, 70, 70, '["أرفف كتب", "إضاءة مركزة"]', 'operational');

        -- Exhibition 3
        INSERT INTO public.exhibitions (
            organization_id, title, description, category, city, venue, 
            start_date, end_date, booking_start_date, booking_end_date, status
        ) VALUES (
            v_org_id,
            'قمة العقار والابتكار المعماري',
            'ملتقى كبرى شركات التطوير العقاري والمستثمرين لاستعراض المشاريع العقارية الكبرى والحلول السكنية الذكية.',
            'عقارات',
            'الدمام',
            'مركز الظهران إكسبو',
            '2026-12-22',
            '2026-12-25',
            '2026-10-01',
            '2026-12-10',
            'published'
        ) RETURNING id INTO v_ex3_id;

        -- Booths for Exhibition 3
        INSERT INTO public.booths (exhibition_id, booth_number, size_sqm, price, position_x, position_y, width, height, amenities, operational_status)
        VALUES
            (v_ex3_id, 'RE-1', 30, 20000, 50, 50, 100, 80, '["مساحة خاصة للمجسمات", "شاشة عرض ضخمة"]', 'operational');

        -- Exhibition 4
        INSERT INTO public.exhibitions (
            organization_id, title, description, category, city, venue, 
            start_date, end_date, booking_start_date, booking_end_date, status
        ) VALUES (
            v_org_id,
            'معرض القهوة والشوكولاتة الدولي',
            'الحدث السنوي الأشهر لعشاق وصناع القهوة المختصة والحلويات الفاخرة.',
            'أغذية',
            'الرياض',
            'مركز الرياض الدولي للمؤتمرات والمعارض',
            '2027-01-05',
            '2027-01-09',
            '2026-11-01',
            '2026-12-28',
            'published'
        ) RETURNING id INTO v_ex4_id;

        -- Booths for Exhibition 4
        INSERT INTO public.booths (exhibition_id, booth_number, size_sqm, price, position_x, position_y, width, height, amenities, operational_status)
        VALUES
            (v_ex4_id, 'CF-1', 12, 7500, 60, 60, 70, 70, '["توصيلات مياه وتصريف", "طاقة كهربائية عالية"]', 'operational');
    END IF;
END $$;
