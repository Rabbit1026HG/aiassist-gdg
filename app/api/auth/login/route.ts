import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, validatePassword, createToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = findUserByEmail(email)
    if (!user || !validatePassword(email, password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = createToken(user)
    await setAuthCookie(token)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
