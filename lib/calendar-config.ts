// Configuration for calendar data source
export const CALENDAR_CONFIG = {
  // Set to 'mock' for development/testing, 'real' for production
  dataSource: process.env.NODE_ENV === "production" ? "real" : "mock",

  // API endpoints
  endpoints: {
    events: "/api/calendar/events",
    auth: "/api/auth/google",
  },

  // Mock data settings
  mockDelay: 1000, // Simulate API delay in milliseconds
}

export type CalendarDataSource = "mock" | "real"
