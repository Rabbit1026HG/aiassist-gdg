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
import { Trash2, Calendar, Clock, MapPin, AlertTriangle } from "lucide-react"
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

  if (!event) return null

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[450px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-0">
        <div className="p-4 sm:p-6">
          <DialogHeader className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Delete Event
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                Are you sure you want to delete this event? This action cannot be undone.
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{event.title}</h3>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{formatDate(event.start.dateTime)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>
                    {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 sm:h-11 text-sm bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-10 sm:h-11 text-sm font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </div>
              ) : (
                "Delete Event"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
