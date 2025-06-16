// Real Google Calendar API integration
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  status: "confirmed" | "tentative" | "cancelled";
  created: string;
  updated: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees?: string[];
  timeZone?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

class RealGoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;

  getAuthState(): AuthState {
    return {
      isAuthenticated:
        !!this.accessToken && (!this.expiresAt || this.expiresAt > Date.now()),
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
    };
  }

  async authenticate(): Promise<string> {
    // Return the OAuth URL for user to authenticate
    const params = new URLSearchParams({
      client_id:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "",
      redirect_uri:
        process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
        "",
      scope: "https://www.googleapis.com/auth/calendar",
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });
  
    // return true;
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id:
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        code,
        grant_type: "authorization_code",
        redirect_uri:
          process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
          "",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token exchange failed: ${error.error_description || error.error}`
      );
    }

    const tokens = await response.json();
console.log(tokens);
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = Date.now() + tokens.expires_in * 1000;

    // Store tokens in localStorage for persistence (in production, use secure storage)
    if (typeof window !== "undefined") {

      if (this.accessToken) {
        localStorage.setItem("google_access_token", this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem("google_refresh_token", this.refreshToken);
      }
      localStorage.setItem("google_expires_at", this.expiresAt.toString());
    }
  }

  loadStoredTokens(): void {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("google_access_token");
      this.refreshToken = localStorage.getItem("google_refresh_token");
      const expiresAt = localStorage.getItem("google_expires_at");
      this.expiresAt = expiresAt ? Number.parseInt(expiresAt) : null;
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("google_access_token");
      localStorage.removeItem("google_refresh_token");
      localStorage.removeItem("google_expires_at");
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id:
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // If refresh token is invalid, clear all tokens
      if (error.error === "invalid_grant") {
        this.clearTokens();
      }
      throw new Error(
        `Token refresh failed: ${error.error_description || error.error}`
      );
    }

    const tokens = await response.json();
    this.accessToken = tokens.access_token;
    this.expiresAt = Date.now() + tokens.expires_in * 1000;

    // Update stored tokens
    if (typeof window !== "undefined") {
      if (this.accessToken) {
        localStorage.setItem("google_access_token", this.accessToken);
      }
      localStorage.setItem("google_expires_at", this.expiresAt.toString());
    }
  }

  private async ensureValidToken(): Promise<void> {
    // Load tokens from storage if not already loaded
    if (!this.accessToken) {
      this.loadStoredTokens();
    }

    // Check if token is expired or about to expire (5 minutes buffer)
    if (this.expiresAt && this.expiresAt - Date.now() < 5 * 60 * 1000) {
      await this.refreshAccessToken();
    }

    if (!this.accessToken) {
      throw new Error("Not authenticated. Please authenticate first.");
    }
  }

  async getEvents(
    timeMin?: string,
    timeMax?: string
  ): Promise<CalendarEvent[]> {
    await this.ensureValidToken();

    const params = new URLSearchParams({
      orderBy: "startTime",
      singleEvents: "true",
      maxResults: "50",
    });

    if (timeMin) params.append("timeMin", timeMin);
    if (timeMax) params.append("timeMax", timeMax);

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
        return this.getEvents(timeMin, timeMax);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
        })) || []
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  async createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
    await this.ensureValidToken();

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
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (response.status === 401) {
        await this.refreshAccessToken();
        return this.createEvent(eventData);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdEvent = await response.json();

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
      };
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(
    eventId: string,
    eventData: Partial<CreateEventData>
  ): Promise<CalendarEvent> {
    await this.ensureValidToken();

    const event: any = {};
    if (eventData.title) event.summary = eventData.title;
    if (eventData.description) event.description = eventData.description;
    if (eventData.startDateTime) {
      event.start = {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || "America/New_York",
      };
    }
    if (eventData.endDateTime) {
      event.end = {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || "America/New_York",
      };
    }
    if (eventData.location) event.location = eventData.location;
    if (eventData.attendees) {
      event.attendees = eventData.attendees.map((email) => ({ email }));
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (response.status === 401) {
        await this.refreshAccessToken();
        return this.updateEvent(eventId, eventData);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedEvent = await response.json();

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
      };
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    await this.ensureValidToken();

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        await this.refreshAccessToken();
        return this.deleteEvent(eventId);
      }

      return response.ok;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }
}

export const realGoogleCalendar = new RealGoogleCalendarService();
