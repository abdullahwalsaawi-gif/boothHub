-- ========================================================
-- بوث هب | Booth Hub - Update Kleija Exhibition Location
-- ========================================================

UPDATE public.exhibitions
SET city = 'القصيم',
    venue = 'بريدة',
    updated_at = NOW()
WHERE id = 'e0e920b6-b195-4e6d-ad6d-16dbf4d9af43'
   OR title ILIKE '%كليجا%';
