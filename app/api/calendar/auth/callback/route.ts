import { type NextRequest, NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar?calendar_error=oauth_error`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar?calendar_error=no_code`)
    }

    await serverGoogleCalendar.exchangeCodeForTokens(code)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar?calendar_success=connected`)
  } catch (error) {
    console.error("Calendar OAuth callback error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar?calendar_error=oauth_failed`)
  }
}
