import { type NextRequest, NextResponse } from "next/server"
import { realGoogleCalendar } from "@/lib/google-calendar-real"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/calendar?error=access_denied", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/calendar?error=no_code", request.url))
  }

  try {
    await realGoogleCalendar.exchangeCodeForTokens(code)

    // In a real app, you'd store the tokens securely (database, encrypted cookies, etc.)
    // For now, we'll redirect back to calendar with success
    return NextResponse.redirect(new URL("/dashboard/calendar?connected=true", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/dashboard/calendar?error=token_exchange_failed", request.url))
  }
}
