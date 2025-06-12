import { type NextRequest, NextResponse } from "next/server"
import { googleCalendar } from "@/lib/google-calendar"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get("timeMin")
    const timeMax = searchParams.get("timeMax")

    const events = await googleCalendar.getEvents(timeMin || undefined, timeMax || undefined)

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    const newEvent = await googleCalendar.createEvent(eventData)

    return NextResponse.json({ event: newEvent }, { status: 201 })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }
}
