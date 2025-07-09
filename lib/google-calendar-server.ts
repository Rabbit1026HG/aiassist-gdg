// Server-side Google Calendar API integration
import { cookies } from "next/headers"

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
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: "email" | "sms" | "popup"
      minutes: number
    }>
  }
}

export interface CreateEventData {
  title: string
  description?: string
  startDateTime: string
  endDateTime: string
  location?: string
  attendees?: string[]
  timeZone?: string
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: "email" | "sms" | "popup"
      minutes: number
    }>
  }
}

export interface CalendarAuthState {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

class ServerGoogleCalendarService {
  private async getStoredTokens(): Promise<{
    accessToken: string | null
    refreshToken: string | null
    expiresAt: number | null
  }> {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("google_calendar_access_token")?.value || null
    const refreshToken = cookieStore.get("google_calendar_refresh_token")?.value || null
    const expiresAt = cookieStore.get("google_calendar_expires_at")?.value

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? Number.parseInt(expiresAt) : null,
    }
  }

  private async setTokens(accessToken: string, refreshToken: string | null, expiresIn: number): Promise<void> {
    const cookieStore = await cookies()
    const expiresAt = Date.now() + expiresIn * 1000

    // Set secure HTTP-only cookies with calendar-specific names
    cookieStore.set("google_calendar_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
    })

    if (refreshToken) {
      cookieStore.set("google_calendar_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    cookieStore.set("google_calendar_expires_at", expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
    })
  }

  async clearTokens(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete("google_calendar_access_token")
    cookieStore.delete("google_calendar_refresh_token")
    cookieStore.delete("google_calendar_expires_at")
  }

  async getAuthState(): Promise<CalendarAuthState> {
    const { accessToken, refreshToken, expiresAt } = await this.getStoredTokens()

    return {
      isAuthenticated: !!accessToken && (!expiresAt || expiresAt > Date.now()),
      accessToken,
      refreshToken,
      expiresAt,
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/auth/callback`,
      scope: "https://www.googleapis.com/auth/calendar",
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/auth/callback`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Token exchange failed: ${error.error_description || error.error}`)
    }

    const tokens = await response.json()
    await this.setTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in)
  }

  async refreshAccessToken(): Promise<void> {
    const { refreshToken } = await this.getStoredTokens()

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      if (error.error === "invalid_grant") {
        await this.clearTokens()
      }
      throw new Error(`Token refresh failed: ${error.error_description || error.error}`)
    }

    const tokens = await response.json()
    await this.setTokens(tokens.access_token, null, tokens.expires_in)
  }

  private async ensureValidToken(): Promise<string> {
    const { accessToken, expiresAt } = await this.getStoredTokens()

    // Check if token is expired or about to expire (5 minutes buffer)
    if (expiresAt && expiresAt - Date.now() < 5 * 60 * 1000) {
      await this.refreshAccessToken()
      const { accessToken: newAccessToken } = await this.getStoredTokens()
      if (!newAccessToken) {
        throw new Error("Failed to refresh access token")
      }
      return newAccessToken
    }

    if (!accessToken) {
      throw new Error("Not authenticated. Please authenticate first.")
    }

    return accessToken
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    const accessToken = await this.ensureValidToken()

    const params = new URLSearchParams({
      orderBy: "startTime",
      singleEvents: "true",
      maxResults: "50",
    })

    if (timeMin) params.append("timeMin", timeMin)
    if (timeMax) params.append("timeMax", timeMax)

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.getEvents(timeMin, timeMax)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return (
        data.items?.map((item: any) => ({
          id: item.id,
          title: item.summary || "Untitled Event",
          description: item.description,
          start: {
            dateTime: item.start.dateTime || item.start.date,
            timeZone: item.start.timeZone || "UTC",
          },
          end: {
            dateTime: item.end.dateTime || item.end.date,
            timeZone: item.end.timeZone || "UTC",
          },
          location: item.location,
          attendees: item.attendees?.map((attendee: any) => ({
            email: attendee.email,
            displayName: attendee.displayName,
          })),
          status: item.status,
          created: item.created,
          updated: item.updated,
          reminders: item.reminders,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching events:", error)
      throw error
    }
  }

  async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    const accessToken = await this.ensureValidToken()

    // Set default reminders if not provided
    const defaultReminders = {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 2880 }, // 2 days before (48 hours * 60 minutes)
        { method: "sms", minutes: 2880 }, // 2 days before via SMS
        { method: "email", minutes: 1440 }, // 1 day before (24 hours * 60 minutes)
        { method: "sms", minutes: 1440 }, // 1 day before via SMS
        { method: "email", minutes: 60 }, // 1 hour before
        { method: "popup", minutes: 15 }, // 15 minutes before (popup)
      ],
    }

    const event = {
      summary: eventData.title,
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
      reminders: eventData.reminders || defaultReminders,
    }

    try {
      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.createEvent(eventData)
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Google Calendar API Error:", errorData)
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.error?.message || "Unknown error"}`,
        )
      }

      const createdEvent = await response.json()

      return {
        id: createdEvent.id,
        title: createdEvent.summary,
        description: createdEvent.description,
        start: {
          dateTime: createdEvent.start.dateTime,
          timeZone: createdEvent.start.timeZone,
        },
        end: {
          dateTime: createdEvent.end.dateTime,
          timeZone: createdEvent.end.timeZone,
        },
        location: createdEvent.location,
        attendees: createdEvent.attendees?.map((attendee: any) => ({
          email: attendee.email,
          displayName: attendee.displayName,
        })),
        status: createdEvent.status,
        created: createdEvent.created,
        updated: createdEvent.updated,
        reminders: createdEvent.reminders,
      }
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<CalendarEvent> {
    const accessToken = await this.ensureValidToken()

    const event: any = {}
    if (eventData.title) event.summary = eventData.title
    if (eventData.description) event.description = eventData.description
    if (eventData.startDateTime) {
      event.start = {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || "America/New_York",
      }
    }
    if (eventData.endDateTime) {
      event.end = {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || "America/New_York",
      }
    }
    if (eventData.location) event.location = eventData.location
    if (eventData.attendees) {
      event.attendees = eventData.attendees.map((email) => ({ email }))
    }
    if (eventData.reminders) {
      event.reminders = eventData.reminders
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.updateEvent(eventId, eventData)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedEvent = await response.json()

      return {
        id: updatedEvent.id,
        title: updatedEvent.summary,
        description: updatedEvent.description,
        start: {
          dateTime: updatedEvent.start.dateTime,
          timeZone: updatedEvent.start.timeZone,
        },
        end: {
          dateTime: updatedEvent.end.dateTime,
          timeZone: updatedEvent.end.timeZone,
        },
        location: updatedEvent.location,
        attendees: updatedEvent.attendees?.map((attendee: any) => ({
          email: attendee.email,
          displayName: attendee.displayName,
        })),
        status: updatedEvent.status,
        created: updatedEvent.created,
        updated: updatedEvent.updated,
        reminders: updatedEvent.reminders,
      }
    } catch (error) {
      console.error("Error updating event:", error)
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const accessToken = await this.ensureValidToken()

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.deleteEvent(eventId)
      }

      return response.ok
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }
}

export const serverGoogleCalendar = new ServerGoogleCalendarService()
