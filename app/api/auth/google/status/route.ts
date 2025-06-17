import { NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET() {
  try {
    const authState = await serverGoogleCalendar.getAuthState()
    return NextResponse.json(authState)
  } catch (error) {
    console.error("Error checking auth status:", error)
    return NextResponse.json({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    })
  }
}
