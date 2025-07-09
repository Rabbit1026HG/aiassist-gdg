import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectUrl = searchParams.get("redirect") || "/dashboard"

  // Store redirect URL in state parameter
  const state = Buffer.from(redirectUrl).toString("base64")

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!)
  googleAuthUrl.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI!)
  googleAuthUrl.searchParams.set("response_type", "code")
  googleAuthUrl.searchParams.set("scope", "email profile")
  googleAuthUrl.searchParams.set("state", state)

  return NextResponse.redirect(googleAuthUrl.toString())
}
