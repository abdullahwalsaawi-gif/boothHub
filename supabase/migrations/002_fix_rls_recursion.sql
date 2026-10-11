-- ========================================================
-- بوث هب | Booth Hub - Fix RLS Infinite Recursion Migration
-- ========================================================

-- 1. Helper Functions (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  );
$$;

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
    JOIN public.organization_members om ON e.organization_id = om.organization_id
    WHERE e.id = exh_id
      AND om.user_id = auth.uid()
  );
$$;

-- 2. Drop existing recursive policies
DROP POLICY IF EXISTS "Organization members viewable by members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization members viewable by self or org members" ON public.organization_members;
DROP POLICY IF EXISTS "Members can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Published exhibitions are viewable by everyone" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can create exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can update their exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Organizers can manage booths" ON public.booths;
DROP POLICY IF EXISTS "Exhibitors can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Exhibitors can cancel or organizers can update bookings" ON public.bookings;

-- 3. Re-create safe, non-recursive policies

-- Organization Members: Direct condition for current user + safe helper for organization co-members
CREATE POLICY "Organization members viewable by self or org members"
ON public.organization_members FOR SELECT USING (
    user_id = auth.uid() OR public.is_organization_member(organization_id)
);

-- Organizations: Secure check via helper function
CREATE POLICY "Members can update their organization" 
ON public.organizations FOR UPDATE USING (
    public.is_organization_admin(id)
);

-- Exhibitions: View published exhibitions or own draft exhibitions via helper function
CREATE POLICY "Published exhibitions are viewable by everyone"
ON public.exhibitions FOR SELECT USING (
    status = 'published' OR 
    (auth.uid() IS NOT NULL AND public.is_organization_member(organization_id))
);

CREATE POLICY "Organizers can create exhibitions"
ON public.exhibitions FOR INSERT TO authenticated WITH CHECK (
    public.is_organization_member(organization_id)
);

CREATE POLICY "Organizers can update their exhibitions"
ON public.exhibitions FOR UPDATE TO authenticated USING (
    public.is_organization_member(organization_id)
);

-- Booths: Viewable by everyone, managed by verified exhibition organizers
CREATE POLICY "Organizers can manage booths"
ON public.booths FOR ALL TO authenticated USING (
    public.is_exhibition_organizer(booths.exhibition_id)
);

-- Bookings: Exhibitors view their own bookings; Organizers view bookings for their exhibitions
CREATE POLICY "Exhibitors can view their own bookings"
ON public.bookings FOR SELECT TO authenticated USING (
    exhibitor_id = auth.uid() OR public.is_exhibition_organizer(bookings.exhibition_id)
);

CREATE POLICY "Exhibitors can cancel or organizers can update bookings"
ON public.bookings FOR UPDATE TO authenticated USING (
    exhibitor_id = auth.uid() OR public.is_exhibition_organizer(bookings.exhibition_id)
);
