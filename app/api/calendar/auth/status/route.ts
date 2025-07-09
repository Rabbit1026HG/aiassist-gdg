import { NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET() {
  try {
    const authState = await serverGoogleCalendar.getAuthState()
    return NextResponse.json(authState)
  } catch (error) {
    console.error("Calendar auth status error:", error)
    return NextResponse.json({ error: "Failed to check calendar authentication status" }, { status: 500 })
  }
}
