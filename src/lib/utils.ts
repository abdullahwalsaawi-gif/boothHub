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
 * Returns the unified realistic image for an exhibition matching the homepage
 */
export function getExhibitionImage(ex: { title?: string; category?: string; cover_image_url?: string | null }, index?: number): string {
  if (ex.cover_image_url && ex.cover_image_url.startsWith('http')) {
    return ex.cover_image_url;
  }
  const title = ex.title?.toLowerCase() || '';
  const cat = ex.category?.toLowerCase() || '';
  
  if (title.includes('تقنية') || cat.includes('تقنية')) {
    return '/images/exhibition-tech.jpg';
  }
  if (title.includes('كليجا') || cat.includes('أغذية')) {
    return '/images/exhibition-kleija.jpg';
  }
  if (title.includes('كتاب') || cat.includes('ثقافة')) {
    return '/images/exhibition-book.jpg';
  }
  
  if (index === 0) return '/images/exhibition-tech.jpg';
  if (index === 1) return '/images/exhibition-kleija.jpg';
  return '/images/exhibition-book.jpg';
}
