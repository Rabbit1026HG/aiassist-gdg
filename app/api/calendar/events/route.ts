import { type NextRequest, NextResponse } from "next/server"
import { calendarService } from "@/lib/calendar-service"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get("timeMin")
    const timeMax = searchParams.get("timeMax")

    console.log("API: Fetching events with params:", { timeMin, timeMax })

    let events
    if (calendarService.getDataSource() === "real") {
      // Use server-side service for real data
      events = await serverGoogleCalendar.getEvents(timeMin || undefined, timeMax || undefined)
    } else {
      // Use mock service for test data
      events = await calendarService.getEvents(timeMin || undefined, timeMax || undefined)
    }

    return NextResponse.json({
      events,
      dataSource: calendarService.getDataSource(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events",
        dataSource: calendarService.getDataSource(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    console.log("API: Creating event:", eventData)

    let newEvent
    if (calendarService.getDataSource() === "real") {
      // Use server-side service for real data
      newEvent = await serverGoogleCalendar.createEvent(eventData)
    } else {
      // Use mock service for test data
      newEvent = await calendarService.createEvent(eventData)
    }

    return NextResponse.json(
      {
        event: newEvent,
        dataSource: calendarService.getDataSource(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json(
      {
        error: "Failed to create calendar event",
        dataSource: calendarService.getDataSource(),
      },
      { status: 500 },
    )
  }
}
