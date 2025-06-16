import { NextResponse } from "next/server"
import { realGoogleCalendar } from "@/lib/google-calendar-real"
export async function GET() {
  try {
    const authUrl = await realGoogleCalendar.authenticate()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
