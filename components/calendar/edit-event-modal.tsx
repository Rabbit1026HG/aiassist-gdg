"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, MapPin, Users, Sparkles, Bell, Mail, Edit } from "lucide-react"
import { calendarService } from "@/lib/calendar-service"
import type { CalendarEvent, CreateEventData } from "@/lib/google-calendar-real"
import { useToast } from "@/hooks/use-toast"

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventUpdated: () => void
  event: CalendarEvent | null
}

export function EditEventModal({ isOpen, onClose, onEventUpdated, event }: EditEventModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    attendees: "",
    enableReminders: true,
  })

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start.dateTime)
      const endDate = new Date(event.end.dateTime)

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        location: event.location || "",
        attendees: event.attendees?.map((a) => a.email).join(", ") || "",
        enableReminders: event.reminders ? !event.reminders.useDefault : true,
      })
    }
  }, [event])

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your event",
        variant: "destructive",
      })
      return false
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`)
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`)

    if (startDateTime >= endDateTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString()
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`).toISOString()

      // Configure reminders based on user preferences
      let reminders = undefined
      if (formData.enableReminders) {
        const reminderOverrides = []

        reminderOverrides.push(
          { method: "email" as const, minutes: 2880 }, // 2 days before
          { method: "email" as const, minutes: 1440 }, // 1 day before
          { method: "email" as const, minutes: 60 }, // 1 hour before
        )

        // Always add popup reminder
        reminderOverrides.push({ method: "popup" as const, minutes: 15 })

        reminders = {
          useDefault: false,
          overrides: reminderOverrides,
        }
      }

      const eventData: Partial<CreateEventData> = {
        title: formData.title,
        description: formData.description,
        startDateTime,
        endDateTime,
        location: formData.location,
        attendees: formData.attendees ? formData.attendees.split(",").map((email) => email.trim()) : undefined,
        reminders,
      }

      await calendarService.updateEvent(event.id, eventData)
      onEventUpdated()
      onClose()

      toast({
        title: "Event updated",
        description: "Your event has been successfully updated",
      })
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Failed to update event",
        description: "There was an error updating your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[95vh] overflow-y-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-0">
        <div className="p-4 sm:p-6">
          <DialogHeader className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Edit Event
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                  Update your Google Calendar event details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Event Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500 flex-shrink-0" />
                  Event Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter event title"
                  required
                  className="h-10 sm:h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Add event description (optional)"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl resize-none text-sm"
                  rows={2}
                />
              </div>

              {/* Date and Time Grid */}
              <div className="space-y-3">
                {/* Date - Full Width on Mobile */}
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 flex-shrink-0" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                    className="h-10 sm:h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm w-full"
                  />
                </div>

                {/* Time Fields - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="startTime"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 sm:gap-2"
                    >
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Start</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      required
                      className="h-10 sm:h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="endTime"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 sm:gap-2"
                    >
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">End</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      required
                      className="h-10 sm:h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Add location (optional)"
                  className="h-10 sm:h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm"
                />
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <Label
                  htmlFor="attendees"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
                  Attendees
                </Label>
                <Input
                  id="attendees"
                  value={formData.attendees}
                  onChange={(e) => handleInputChange("attendees", e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                  className="h-10 sm:h-11 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Example: john@example.com, jane@example.com
                </p>
              </div>

              {/* Reminder Settings */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-orange-500" />
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reminder Settings</Label>
                </div>

                <div className="space-y-3">
                  {/* Email Reminders */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-blue-500" />
                      <Label htmlFor="emailReminders" className="text-sm text-slate-600 dark:text-slate-400">
                        Email reminders (2 days, 1 day, 1 hour before)
                      </Label>
                    </div>
                    <Switch
                      id="enableReminders"
                      checked={formData.enableReminders}
                      onCheckedChange={(checked) => handleInputChange("enableReminders", checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 sm:mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 sm:h-11 text-sm bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-10 sm:h-11 text-sm font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  "Update Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
