// Real Google Calendar API integration - Client Side
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

export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

class RealGoogleCalendarService {
  async getAuthState(): Promise<AuthState> {
    try {
      const response = await fetch("/api/auth/google/status")
      if (response.ok) {
        return await response.json()
      }
      return {
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
      return {
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }
    }
  }

  async authenticate(): Promise<string> {
    const response = await fetch("/api/auth/google")
    const data = await response.json()
    return data.authUrl
  }

  async clearAuthentication(): Promise<void> {
    await fetch("/api/auth/google/logout", { method: "POST" })
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams()
    if (timeMin) params.append("timeMin", timeMin)
    if (timeMax) params.append("timeMax", timeMax)

    const response = await fetch(`/api/calendar/events?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.events || []
  }

  async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    const response = await fetch("/api/calendar/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.event
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<CalendarEvent> {
    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.event
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const response = await fetch(`/api/calendar/events/${eventId}`, {
      method: "DELETE",
    })

    return response.ok
  }
}

export const realGoogleCalendar = new RealGoogleCalendarService()
