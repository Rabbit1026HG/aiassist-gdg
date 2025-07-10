import { type NextRequest, NextResponse } from "next/server"
import { validateCredentials, createToken, setAuthCookie, initializeAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Initialize Pantry if needed
    await initializeAuth()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("Login attempt for email:", email)

    const user = await validateCredentials(email, password)

    if (!user) {
      console.log("Invalid credentials for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Login successful for user:", user.id)

    // Create token
    const token = createToken(user)

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
