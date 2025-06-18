import { type NextRequest, NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get("timeMin")
    const timeMax = searchParams.get("timeMax")

    console.log("API: Fetching events with params:", { timeMin, timeMax })

    // Always use server-side service for real data
    const events = await serverGoogleCalendar.getEvents(timeMin || undefined, timeMax || undefined)

    return NextResponse.json({
      events,
      dataSource: "real",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events",
        dataSource: "real",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    console.log("API: Creating event:", eventData)

    // Always use server-side service for real data
    const newEvent = await serverGoogleCalendar.createEvent(eventData)

    return NextResponse.json(
      {
        event: newEvent,
        dataSource: "real",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json(
      {
        error: "Failed to create calendar event",
        dataSource: "real",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
