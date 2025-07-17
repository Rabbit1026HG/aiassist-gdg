"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Trash2, Calendar, Clock, MapPin } from "lucide-react"
import { calendarService } from "@/lib/calendar-service"
import type { CalendarEvent } from "@/lib/google-calendar-real"

interface DeleteEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onEventDeleted: () => void
  event: CalendarEvent | null
}

export function DeleteEventDialog({ isOpen, onClose, onEventDeleted, event }: DeleteEventDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!event) return

    setIsLoading(true)

    try {
      await calendarService.deleteEvent(event.id)
      onEventDeleted()
      onClose()
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[450px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">Delete Event</DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                This action cannot be undone. The event will be permanently removed from your Google Calendar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Event Details Preview */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{event.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>{formatDate(event.start.dateTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span>
                  {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-11 text-sm bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-11 text-sm font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Event
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
