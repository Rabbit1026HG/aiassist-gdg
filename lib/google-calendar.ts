// Google Calendar API integration
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  status: "confirmed" | "tentative" | "cancelled"
  created: string
  updated: string
}

export interface CreateEventData {
  title: string
  description?: string
  startDateTime: string
  endDateTime: string
  location?: string
  attendees?: string[]
  timeZone?: string
}

class GoogleCalendarService {
  private accessToken: string | null = null

  async authenticate(): Promise<boolean> {
    // In a real implementation, this would handle OAuth2 flow
    // For demo purposes, we'll simulate authentication
    this.accessToken = "demo_access_token"
    return true
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    // Simulate API call to Google Calendar
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data - in real implementation, this would fetch from Google Calendar API
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "Design Team Meeting",
        description: "Weekly design team sync to discuss current projects",
        start: {
          dateTime: new Date(2025, 5, 12, 10, 0).toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: new Date(2025, 5, 12, 11, 0).toISOString(),
          timeZone: "America/New_York",
        },
        location: "Conference Room A",
        status: "confirmed",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Client Presentation",
        description: "Present Q2 results to key stakeholders",
        start: {
          dateTime: new Date(2025, 5, 12, 14, 0).toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: new Date(2025, 5, 12, 15, 30).toISOString(),
          timeZone: "America/New_York",
        },
        location: "Main Boardroom",
        attendees: [{ email: "client@example.com", displayName: "Client Representative" }],
        status: "confirmed",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Weekly Team Sync",
        description: "Team standup and project updates",
        start: {
          dateTime: new Date(2025, 5, 13, 9, 0).toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: new Date(2025, 5, 13, 10, 0).toISOString(),
          timeZone: "America/New_York",
        },
        location: "Virtual Meeting",
        status: "confirmed",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    ]

    return mockEvents
  }

  async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    // Simulate API call to create event in Google Calendar
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || "America/New_York",
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || "America/New_York",
      },
      location: eventData.location,
      attendees: eventData.attendees?.map((email) => ({ email })),
      status: "confirmed",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }

    return newEvent
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<CalendarEvent> {
    // Simulate API call to update event
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock updated event
    const updatedEvent: CalendarEvent = {
      id: eventId,
      title: eventData.title || "Updated Event",
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime || new Date().toISOString(),
        timeZone: eventData.timeZone || "America/New_York",
      },
      end: {
        dateTime: eventData.endDateTime || new Date().toISOString(),
        timeZone: eventData.timeZone || "America/New_York",
      },
      location: eventData.location,
      status: "confirmed",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }

    return updatedEvent
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    // Simulate API call to delete event
    await new Promise((resolve) => setTimeout(resolve, 800))
    return true
  }
}

export const googleCalendar = new GoogleCalendarService()
