// Configuration for calendar data source
export const CALENDAR_CONFIG = {
  // Always use real data in both development and production
  dataSource: "real" as const,

  // API endpoints
  endpoints: {
    events: "/api/calendar/events",
    auth: "/api/auth/google",
  },
}

export type CalendarDataSource = "real"
