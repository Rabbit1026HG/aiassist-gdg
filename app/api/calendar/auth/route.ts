import { NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET() {
  try {
    const authUrl = serverGoogleCalendar.getAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Calendar auth error:", error)
    return NextResponse.json({ error: "Failed to initiate calendar authentication" }, { status: 500 })
  }
}
