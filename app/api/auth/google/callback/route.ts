import { type NextRequest, NextResponse } from "next/server"

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
    // The token exchange will be handled on the client side
    // since we need to store tokens in localStorage
    return NextResponse.redirect(new URL(`/dashboard/calendar?code=${code}`, request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/dashboard/calendar?error=callback_failed", request.url))
  }
}
