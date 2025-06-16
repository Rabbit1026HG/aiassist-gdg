import { CALENDAR_CONFIG, type CalendarDataSource } from "./calendar-config"
import { googleCalendar, type CalendarEvent, type CreateEventData } from "./google-calendar"
import { realGoogleCalendar, type AuthState } from "./google-calendar-real"

class CalendarService {
  private dataSource: CalendarDataSource = CALENDAR_CONFIG.dataSource as CalendarDataSource

  setDataSource(source: CalendarDataSource) {
    this.dataSource = source
  }

  getAuthState(): AuthState | null {
    if (this.dataSource === "real") {
      return realGoogleCalendar.getAuthState()
    }
    return null
  }

  async authenticate(): Promise<string | boolean> {
    if (this.dataSource === "real") {
      return await realGoogleCalendar.authenticate()
    } else {
      // Mock authentication always succeeds
      return true
    }
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    if (this.dataSource === "real") {
      await realGoogleCalendar.exchangeCodeForTokens(code)
    }
  }

  clearAuthentication(): void {
    if (this.dataSource === "real") {
      realGoogleCalendar.clearTokens()
    }
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      if (this.dataSource === "real") {
        // Check authentication first
        const authState = realGoogleCalendar.getAuthState()
        if (!authState.isAuthenticated) {
          throw new Error("Not authenticated with Google Calendar")
        }
        return await realGoogleCalendar.getEvents(timeMin, timeMax)
      } else {
        // Use mock data with simulated delay
        await new Promise((resolve) => setTimeout(resolve, CALENDAR_CONFIG.mockDelay))
        return await googleCalendar.getEvents(timeMin, timeMax)
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      // Fallback to mock data if real API fails
      if (this.dataSource === "real") {
        console.warn("Falling back to mock data due to API error")
        return await googleCalendar.getEvents(timeMin, timeMax)
      }
      throw error
    }
  }

  async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    try {
      if (this.dataSource === "real") {
        const authState = realGoogleCalendar.getAuthState()
        if (!authState.isAuthenticated) {
          throw new Error("Not authenticated with Google Calendar")
        }
        return await realGoogleCalendar.createEvent(eventData)
      } else {
        await new Promise((resolve) => setTimeout(resolve, CALENDAR_CONFIG.mockDelay))
        return await googleCalendar.createEvent(eventData)
      }
    } catch (error) {
      console.error("Error creating calendar event:", error)
      if (this.dataSource === "real") {
        console.warn("Falling back to mock data due to API error")
        return await googleCalendar.createEvent(eventData)
      }
      throw error
    }
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<CalendarEvent> {
    try {
      if (this.dataSource === "real") {
        const authState = realGoogleCalendar.getAuthState()
        if (!authState.isAuthenticated) {
          throw new Error("Not authenticated with Google Calendar")
        }
        return await realGoogleCalendar.updateEvent(eventId, eventData)
      } else {
        await new Promise((resolve) => setTimeout(resolve, CALENDAR_CONFIG.mockDelay))
        return await googleCalendar.updateEvent(eventId, eventData)
      }
    } catch (error) {
      console.error("Error updating calendar event:", error)
      if (this.dataSource === "real") {
        console.warn("Falling back to mock data due to API error")
        return await googleCalendar.updateEvent(eventId, eventData)
      }
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (this.dataSource === "real") {
        const authState = realGoogleCalendar.getAuthState()
        if (!authState.isAuthenticated) {
          throw new Error("Not authenticated with Google Calendar")
        }
        return await realGoogleCalendar.deleteEvent(eventId)
      } else {
        await new Promise((resolve) => setTimeout(resolve, CALENDAR_CONFIG.mockDelay))
        return await googleCalendar.deleteEvent(eventId)
      }
    } catch (error) {
      console.error("Error deleting calendar event:", error)
      if (this.dataSource === "real") {
        console.warn("Falling back to mock data due to API error")
        return await googleCalendar.deleteEvent(eventId)
      }
      throw error
    }
  }

  getDataSource(): CalendarDataSource {
    return this.dataSource
  }
}

export const calendarService = new CalendarService()
