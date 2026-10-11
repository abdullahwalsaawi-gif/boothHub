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
