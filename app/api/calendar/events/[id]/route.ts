import { type NextRequest, NextResponse } from "next/server"
import { googleCalendar } from "@/lib/google-calendar"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventData = await request.json()
    const updatedEvent = await googleCalendar.updateEvent(params.id, eventData)

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await googleCalendar.deleteEvent(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 })
  }
}
