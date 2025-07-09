import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, createToken } from "@/lib/auth"
import { setAuthCookie } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error("No access token received")
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const googleUser = await userResponse.json()

    // Check if user is authorized
    const user = findUserByEmail(googleUser.email)

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=unauthorized_email", request.url))
    }

    // Create token
    const token = createToken(user)

    // Determine redirect URL
    const redirectUrl = state ? Buffer.from(state, "base64").toString() : "/dashboard"

    // Create response
    const response = NextResponse.redirect(new URL(redirectUrl, request.url))

    // Set auth cookie
    const cookieOptions = setAuthCookie(token)
    response.cookies.set(cookieOptions)

    return response
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
  }
}
