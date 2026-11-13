import { handleAuthConfirmation } from '@/lib/auth-callback'

/**
 * Route handler for /auth/confirm
 * Receives token_hash and type directly from the email confirmation link.
 * Validates with verifyOtp on the server and works cross-device without PKCE storage!
 */
export async function GET(request: Request) {
  return handleAuthConfirmation(request)
}
