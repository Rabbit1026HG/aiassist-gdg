import { type NextRequest, NextResponse } from "next/server"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventData = await request.json()
    const updatedEvent = await serverGoogleCalendar.updateEvent(params.id, eventData)

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await serverGoogleCalendar.deleteEvent(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 })
  }
}
