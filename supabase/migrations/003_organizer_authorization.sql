-- ========================================================
-- بوث هب | Booth Hub - Multi-Organizer Isolation & Authorization Migration
-- ========================================================

-- 1. Add organizer_id to exhibitions table
ALTER TABLE public.exhibitions 
ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_exhibitions_organizer_id ON public.exhibitions(organizer_id);

-- 2. Backfill existing exhibitions to associate with existing organization owner if available
UPDATE public.exhibitions e
SET organizer_id = om.user_id
FROM public.organization_members om
WHERE e.organization_id = om.organization_id
  AND e.organizer_id IS NULL;

-- 3. Drop existing exhibition/booth/booking policies to apply strict isolation
DROP POLICY IF EXISTS "Published exhibitions are viewable by everyone" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can create exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can update their exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can delete their exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can manage booths" ON public.booths;
DROP POLICY IF EXISTS "Exhibitors can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Exhibitors can cancel or organizers can update bookings" ON public.bookings;

-- 4. Re-create strict RLS policies

-- Exhibitions:
-- Public can only see published exhibitions.
-- Organizers can see all their own exhibitions (draft, published, etc.)
CREATE POLICY "Published exhibitions or own exhibitions viewable"
ON public.exhibitions FOR SELECT USING (
    status = 'published' OR 
    (auth.uid() IS NOT NULL AND organizer_id = auth.uid())
);

-- Organizers can only create exhibitions where they are the organizer_id
CREATE POLICY "Organizers can create own exhibitions"
ON public.exhibitions FOR INSERT TO authenticated WITH CHECK (
    organizer_id = auth.uid()
);

-- Organizers can only update their own exhibitions
CREATE POLICY "Organizers can update own exhibitions"
ON public.exhibitions FOR UPDATE TO authenticated USING (
    organizer_id = auth.uid()
);

-- Organizers can only delete their own exhibitions
CREATE POLICY "Organizers can delete own exhibitions"
ON public.exhibitions FOR DELETE TO authenticated USING (
    organizer_id = auth.uid()
);

-- Booths:
-- Public can view booths
CREATE POLICY "Booths viewable by everyone"
ON public.booths FOR SELECT USING (true);

-- Organizers can ONLY manage booths belonging to their own exhibitions
CREATE POLICY "Organizers can manage booths of own exhibitions"
ON public.booths FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.exhibitions e
        WHERE e.id = booths.exhibition_id 
        AND e.organizer_id = auth.uid()
    )
);

-- Bookings:
-- Exhibitor sees their own bookings.
-- Organizer sees ONLY bookings for exhibitions they own.
CREATE POLICY "Strict booking isolation view policy"
ON public.bookings FOR SELECT TO authenticated USING (
    exhibitor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.exhibitions e
        WHERE e.id = bookings.exhibition_id 
        AND e.organizer_id = auth.uid()
    )
);

-- Organizer can update booking status ONLY for their own exhibitions. Exhibitor can cancel their own.
CREATE POLICY "Strict booking update policy"
ON public.bookings FOR UPDATE TO authenticated USING (
    exhibitor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.exhibitions e
        WHERE e.id = bookings.exhibition_id 
        AND e.organizer_id = auth.uid()
    )
);
