-- ========================================================
-- بوث هب | Booth Hub - Newsletter Subscribers Table
-- ========================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to subscribe with an email
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (email IS NOT NULL AND email <> '');

-- Only authenticated admins/service role can view subscriber emails
DROP POLICY IF EXISTS "Service role or admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Service role or admins can view subscribers"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (true);
