// Simple auth utilities for magic link authentication
export interface User {
  id: string
  email: string
  name?: string
}

export async function sendMagicLink(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // In a real application, this would:
    // 1. Generate a secure token
    // 2. Store it in a database with expiration
    // 3. Send an email with the magic link

    const token = generateSecureToken()
    const magicLink = `${window.location.origin}/auth/verify?token=${token}`

    // Simulate email sending
    console.log(`Magic link sent to ${email}: ${magicLink}`)

    return {
      success: true,
      message: "Magic link sent successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to send magic link",
    }
  }
}

export function generateSecureToken(): string {
  // Generate a secure random token
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function verifyMagicLink(token: string): Promise<{ success: boolean; user?: User }> {
  try {
    // In a real application, this would:
    // 1. Verify the token exists in the database
    // 2. Check if it's not expired
    // 3. Return the associated user

    // For demo purposes, accept any token
    if (token && token.length > 10) {
      return {
        success: true,
        user: {
          id: "user-1",
          email: "user@example.com",
          name: "AI Assistant User",
        },
      }
    }

    return { success: false }
  } catch (error) {
    return { success: false }
  }
}

export function isAuthenticated(): boolean {
  // In a real application, this would check for valid session/token
  // For demo purposes, always return true if we're on dashboard
  return typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")
}
