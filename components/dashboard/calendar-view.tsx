"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react"
import { EventModal } from "@/components/calendar/event-modal"
import type { CalendarEvent } from "@/lib/google-calendar-real"
import { cn } from "@/lib/utils"
import { calendarService } from "@/lib/calendar-service"
import { GoogleCalendarAuthPanel } from "@/components/calendar/auth-panel"
import { EditEventModal } from "@/components/calendar/edit-event-modal"
import { DeleteEventDialog } from "../calendar/delete-event-dialog"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadEventsForCurrentMonth()
  }, [currentDate, view])

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const error = urlParams.get("error")

    if (success === "authenticated") {
      console.log("Successfully authenticated with Google Calendar")
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Reload events
      loadEventsForCurrentMonth()
    }

    if (error) {
      console.error("OAuth error:", error)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const loadEventsForCurrentMonth = async () => {
    setIsLoading(true)
    try {
      // Check authentication for real data source
      const authState = await calendarService.getAuthState()
      if (!authState?.isAuthenticated) {
        console.log("Not authenticated, skipping API call")
        setEvents([])
        setIsLoading(false)
        return
      }

      // Calculate time range based on current view and date
      const { timeMin, timeMax } = getTimeRange()

      console.log(`Loading events for ${view} view:`, { timeMin, timeMax })
      const calendarEvents = await calendarService.getEvents(timeMin, timeMax)
      setEvents(calendarEvents)
    } catch (error) {
      console.error("Error loading events:", error)
      // Show user-friendly error message
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeRange = () => {
    const now = new Date(currentDate)
    let timeMin: string
    let timeMax: string

    switch (view) {
      case "month":
        // Get first day of the month
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        // Get last day of the month
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        timeMin = firstDay.toISOString()
        timeMax = lastDay.toISOString()
        break

      case "week":
        // Get start of week (Sunday)
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)

        // Get end of week (Saturday)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        timeMin = weekStart.toISOString()
        timeMax = weekEnd.toISOString()
        break

      case "day":
        // Get start of day
        const dayStart = new Date(now)
        dayStart.setHours(0, 0, 0, 0)

        // Get end of day
        const dayEnd = new Date(now)
        dayEnd.setHours(23, 59, 59, 999)

        timeMin = dayStart.toISOString()
        timeMax = dayEnd.toISOString()
        break

      default:
        // Default to current month
        const defaultFirst = new Date(now.getFullYear(), now.getMonth(), 1)
        const defaultLast = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        timeMin = defaultFirst.toISOString()
        timeMax = defaultLast.toISOString()
    }

    return { timeMin, timeMax }
  }

  const handleEventCreated = () => {
    loadEventsForCurrentMonth() // Use the new function name
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleEventUpdated = () => {
    loadEventsForCurrentMonth()
    setSelectedEvent(null)
  }

  const handleEventDeleted = () => {
    loadEventsForCurrentMonth()
    setSelectedEvent(null)
  }

  const handleDeleteEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setIsDeleteDialogOpen(true)
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start.dateTime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getEventColor = (index: number) => {
    const colors = [
      "bg-gradient-to-r from-violet-500 to-purple-500",
      "bg-gradient-to-r from-emerald-500 to-teal-500",
      "bg-gradient-to-r from-amber-500 to-orange-500",
      "bg-gradient-to-r from-pink-500 to-rose-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500",
      "bg-gradient-to-r from-indigo-500 to-purple-500",
    ]
    return colors[index % colors.length]
  }

  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []
    const today = new Date()

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 md:h-32 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
        />,
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
      const dayEvents = getEventsForDate(date)

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 md:h-32 border border-slate-200 dark:border-slate-700 p-1 md:p-2 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50",
            isToday &&
              "bg-gradient-to-br from-violet-50 to-emerald-50 dark:from-violet-900/20 dark:to-emerald-900/20 border-violet-300 dark:border-violet-600",
          )}
          onClick={() => {
            setSelectedDate(date)
            setIsModalOpen(true)
          }}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={cn(
                "text-sm font-medium",
                isToday
                  ? "bg-gradient-to-r from-violet-600 to-emerald-600 text-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs md:text-sm font-bold"
                  : "text-slate-700 dark:text-slate-300",
              )}
            >
              {day}
            </span>
            {dayEvents.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
              >
                {dayEvents.length}
              </Badge>
            )}
          </div>
          <div
            className="space-y-1 overflow-y-auto max-h-16 md:max-h-20"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "text-xs p-1 rounded text-white truncate animate-fade-in cursor-pointer hover:opacity-80 transition-opacity",
                  getEventColor(index),
                )}
                title={`${event.title} - ${formatTime(event.start.dateTime)}`}
                onClick={(e) => handleEventClick(event, e)}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-xs opacity-90">{formatTime(event.start.dateTime)}</div>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 px-1">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>,
      )
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-3 md:p-4 text-center font-semibold border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300"
          >
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
        {days}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.start.dateTime)
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      return eventDate >= weekStart && eventDate <= weekEnd
    })

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekEvents.map((event, index) => (
            <Card
              key={event.id}
              className="modern-card hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in cursor-pointer"
              onClick={(e) => handleEventClick(event, e)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-3 h-3 rounded-full mt-2 flex-shrink-0", getEventColor(index))} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {weekEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No events scheduled for this week</p>
          </div>
        )}
      </div>
    )
  }

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate)

    return (
      <div className="space-y-4">
        <div className="text-center p-6 bg-gradient-to-r from-violet-50 to-emerald-50 dark:from-violet-900/20 dark:to-emerald-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>

        <div className="space-y-3">
          {dayEvents.map((event, index) => (
            <Card key={event.id} className="modern-card hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn("w-4 h-4 rounded-full mt-1 flex-shrink-0", getEventColor(index))} />
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <h3
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEventClick(event, e)}
                            className="h-8 px-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-600"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeleteEvent(event, e)}
                            className="h-8 px-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-slate-600 dark:text-slate-300 mb-3">{event.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dayEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No events scheduled for this day</p>
            <Button
              onClick={() => {
                setSelectedDate(currentDate)
                setIsModalOpen(true)
              }}
              className="mt-4 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        )}
      </div>
    )
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
    // Data will be loaded automatically via useEffect
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
    // Data will be loaded automatically via useEffect
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
    // Data will be loaded automatically via useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Manage your schedule with Google Calendar integration
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Google Calendar
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      <GoogleCalendarAuthPanel onAuthChange={setIsAuthenticated} />

      <Card className="modern-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={navigatePrevious}
                className="hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToday}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateNext}
                className="hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 ml-2">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  day: view !== "month" ? "numeric" : undefined,
                })}
              </h2>
            </div>
            <Select value={view} onValueChange={(value) => setView(value as "month" | "week" | "day")}>
              <SelectTrigger className="w-32 border-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <span className="ml-2 text-slate-600 dark:text-slate-300">Loading calendar events...</span>
            </div>
          ) : (
            <>
              {view === "month" && renderMonthView()}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
            </>
          )}
        </CardContent>
      </Card>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventCreated={handleEventCreated}
        selectedDate={selectedDate}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEvent(null)
        }}
        onEventUpdated={handleEventUpdated}
        event={selectedEvent}
      />

      <DeleteEventDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedEvent(null)
        }}
        onEventDeleted={handleEventDeleted}
        event={selectedEvent}
      />
    </div>
  )
}
