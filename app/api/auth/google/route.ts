import { NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET() {
  try {
    const authUrl = serverGoogleCalendar.getAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
