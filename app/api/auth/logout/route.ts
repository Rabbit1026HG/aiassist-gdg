import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth-utils"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear auth cookie
  const cookieOptions = clearAuthCookie()
  response.cookies.set(cookieOptions)

  return response
}
