import { type NextRequest, NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

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
    await serverGoogleCalendar.exchangeCodeForTokens(code)
    return NextResponse.redirect(new URL("/dashboard/calendar?success=authenticated", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/dashboard/calendar?error=callback_failed", request.url))
  }
}
