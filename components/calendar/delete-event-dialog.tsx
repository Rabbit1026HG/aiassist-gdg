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
import { AlertTriangle, Calendar, Clock, MapPin, Users, Trash2 } from "lucide-react"
import { calendarService } from "@/lib/calendar-service"
import type { CalendarEvent } from "@/lib/google-calendar-real"
import { useToast } from "@/hooks/use-toast"

interface DeleteEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onEventDeleted: () => void
  event: CalendarEvent | null
}

export function DeleteEventDialog({ isOpen, onClose, onEventDeleted, event }: DeleteEventDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!event) return

    setIsLoading(true)

    try {
      await calendarService.deleteEvent(event.id)
      onEventDeleted()
      onClose()

      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Failed to delete event",
        description: "There was an error deleting your event. Please try again.",
        variant: "destructive",
      })
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
      <DialogContent className="w-[95vw] max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Delete Event
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Warning Message */}
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Are you sure you want to delete this event?
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              This will permanently remove the event from your Google Calendar.
            </p>
          </div>
        </div>

        {/* Event Preview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{event.title}</h3>

              {event.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.start.dateTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
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
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-11 text-sm font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
