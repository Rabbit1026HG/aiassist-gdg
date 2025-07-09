import { NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function POST() {
  try {
    await serverGoogleCalendar.clearTokens()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Calendar logout error:", error)
    return NextResponse.json({ error: "Failed to logout from calendar" }, { status: 500 })
  }
}
