import { createClient } from '@/lib/supabase/client'

/**
 * Supabase Storage Buckets helper
 * Buckets: 'exhibition-covers', 'organization-logos', 'floorplans'
 */
export async function uploadFileToBucket(
  bucket: 'exhibition-covers' | 'organization-logos' | 'floorplans',
  file: File,
  folderPath: string = ''
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()
  
  // Validation: Max file size 5MB
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { url: null, error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)' }
  }

  // Allowed MIME types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'نوع الملف غير مدعوم. يرجى رفع صورة (PNG, JPG, WEBP, SVG) أو ملف PDF.' }
  }

  // Generate unique file name
  const ext = file.name.split('.').pop()
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
  const filePath = folderPath ? `${folderPath}/${cleanFileName}` : cleanFileName

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return { url: null, error: error.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: publicUrlData.publicUrl, error: null }
  } catch (err: any) {
    return { url: null, error: err.message || 'فشل رفع الملف' }
  }
}
