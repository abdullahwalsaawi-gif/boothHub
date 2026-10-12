import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSaudiPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('00966')) {
    cleaned = cleaned.substring(2)
  } else if (cleaned.startsWith('966')) {
    // already starts with 966
  } else if (cleaned.startsWith('05')) {
    cleaned = '966' + cleaned.substring(1)
  } else if (cleaned.startsWith('5')) {
    cleaned = '966' + cleaned
  }
  return '+' + cleaned
}

/**
 * Returns the unified realistic image for an exhibition matching the database and assets
 */
export function getExhibitionImage(
  ex: { id?: string; title?: string; category?: string; cover_image_url?: string | null }, 
  index?: number
): string {
  if (ex.cover_image_url && (ex.cover_image_url.startsWith('http') || ex.cover_image_url.startsWith('/images/'))) {
    return ex.cover_image_url;
  }
  
  const id = ex.id || '';
  const title = ex.title?.toLowerCase() || '';
  const cat = ex.category?.toLowerCase() || '';
  
  // 1. Real Estate exhibition: Database ID e06ecf0a-421d-431a-9fb7-72e2405ff77d or fallback 33333333-...
  if (
    id === 'e06ecf0a-421d-431a-9fb7-72e2405ff77d' || 
    id === '33333333-3333-3333-3333-333333333333' || 
    title.includes('عقار') || 
    title.includes('معمار') ||
    cat.includes('عقار')
  ) {
    return '/images/exhibition-real-estate.jpg';
  }

  // 2. Coffee & Chocolate exhibition: Database ID d1823810-9069-43fa-bef8-485c95863d98 or fallback 44444444-...
  if (
    id === 'd1823810-9069-43fa-bef8-485c95863d98' || 
    id === '44444444-4444-4444-4444-444444444444' || 
    title.includes('قهوة') || 
    title.includes('شوكولاتة')
  ) {
    return '/images/exhibition-coffee.jpg';
  }

  // 3. Tech exhibition: Database ID a7569820-9fc0-4bcd-bb0a-ad37f6d39f37 or fallback 11111111-...
  if (
    id === 'a7569820-9fc0-4bcd-bb0a-ad37f6d39f37' || 
    id === '11111111-1111-1111-1111-111111111111' || 
    title.includes('تقنية') || 
    cat.includes('تقنية')
  ) {
    return '/images/exhibition-tech.jpg';
  }

  // 4. Kleija exhibition: Database ID e0e920b6-b195-4e6d-ad6d-16dbf4d9af43
  if (
    id === 'e0e920b6-b195-4e6d-ad6d-16dbf4d9af43' || 
    title.includes('كليجا')
  ) {
    return '/images/exhibition-kleija.jpg';
  }

  // 5. Book Fair: Database ID bde40e86-72c3-47f3-b90f-ed4510e4298b or fallback 22222222-...
  if (
    id === 'bde40e86-72c3-47f3-b90f-ed4510e4298b' || 
    id === '22222222-2222-2222-2222-222222222222' || 
    title.includes('كتاب') || 
    cat.includes('ثقافة')
  ) {
    return '/images/exhibition-book.jpg';
  }

  // Fallbacks by category
  if (cat.includes('أغذية')) return '/images/exhibition-coffee.jpg';
  
  if (index === 0) return '/images/exhibition-tech.jpg';
  if (index === 1) return '/images/exhibition-kleija.jpg';
  return '/images/exhibition-book.jpg';
}

