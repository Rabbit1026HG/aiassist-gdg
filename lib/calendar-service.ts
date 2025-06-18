import { CALENDAR_CONFIG, type CalendarDataSource } from "./calendar-config"
import { realGoogleCalendar, type AuthState, type CalendarEvent, type CreateEventData } from "./google-calendar-real"

class CalendarService {
  private dataSource: CalendarDataSource = CALENDAR_CONFIG.dataSource

  setDataSource(source: CalendarDataSource) {
    this.dataSource = source
  }

  async getAuthState(): Promise<AuthState | null> {
    return await realGoogleCalendar.getAuthState()
  }

  async authenticate(): Promise<string | boolean> {
    return await realGoogleCalendar.authenticate()
  }

  async clearAuthentication(): Promise<void> {
    await realGoogleCalendar.clearAuthentication()
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      // Check authentication first
      const authState = await realGoogleCalendar.getAuthState()
      if (!authState.isAuthenticated) {
        throw new Error("Not authenticated with Google Calendar")
      }
      return await realGoogleCalendar.getEvents(timeMin, timeMax)
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      throw error
    }
  }

  async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    try {
      const authState = await realGoogleCalendar.getAuthState()
      if (!authState.isAuthenticated) {
        throw new Error("Not authenticated with Google Calendar")
      }
      return await realGoogleCalendar.createEvent(eventData)
    } catch (error) {
      console.error("Error creating calendar event:", error)
      throw error
    }
  }

  async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<CalendarEvent> {
    try {
      const authState = await realGoogleCalendar.getAuthState()
      if (!authState.isAuthenticated) {
        throw new Error("Not authenticated with Google Calendar")
      }
      return await realGoogleCalendar.updateEvent(eventId, eventData)
    } catch (error) {
      console.error("Error updating calendar event:", error)
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const authState = await realGoogleCalendar.getAuthState()
      if (!authState.isAuthenticated) {
        throw new Error("Not authenticated with Google Calendar")
      }
      return await realGoogleCalendar.deleteEvent(eventId)
    } catch (error) {
      console.error("Error deleting calendar event:", error)
      throw error
    }
  }

  getDataSource(): CalendarDataSource {
    return this.dataSource
  }
}

export const calendarService = new CalendarService()
