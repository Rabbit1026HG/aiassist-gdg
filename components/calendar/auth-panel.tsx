"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CalendarAuthState } from "@/lib/google-calendar-server"
import { Calendar, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"

interface AuthPanelProps {
  onAuthChange?: (isAuthenticated: boolean) => void
}

export function GoogleCalendarAuthPanel({ onAuthChange }: AuthPanelProps) {
  const [authState, setAuthState] = useState<CalendarAuthState | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    checkAuthState()

    // Check for URL parameters indicating success or error
    const calendarError = searchParams.get("calendar_error")
    const calendarSuccess = searchParams.get("calendar_success")

    if (calendarError) {
      setError(
        calendarError === "oauth_error"
          ? "Calendar OAuth authentication failed."
          : calendarError === "no_code"
            ? "No authorization code received."
            : calendarError === "oauth_failed"
              ? "Calendar authentication failed."
              : "Calendar authentication error occurred.",
      )
    }

    if (calendarSuccess === "connected") {
      setSuccess("Successfully connected to Google Calendar!")
      setTimeout(() => setSuccess(null), 5000)
    }
  }, [searchParams])

  const checkAuthState = async () => {
    try {
      const response = await fetch("/api/calendar/auth/status")
      if (response.ok) {
        const state = await response.json()
        setAuthState(state)
        onAuthChange?.(state?.isAuthenticated || false)
      }
    } catch (err) {
      console.error("Failed to check calendar auth state:", err)
    }
  }

  const handleAuthenticate = async () => {
    setIsAuthenticating(true)
    setError(null)

    try {
      // Redirect to calendar auth endpoint
      window.location.href = "/api/calendar/auth"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      setIsAuthenticating(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/calendar/auth/logout", { method: "POST" })
      if (response.ok) {
        await checkAuthState()
        setError(null)
        setSuccess("Disconnected from Google Calendar")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError("Failed to disconnect from calendar")
    }
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Calendar className="h-4 w-4" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Status:</span>
            <Badge variant={authState?.isAuthenticated ? "default" : "secondary"}>
              {authState?.isAuthenticated ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>

          <Button size="sm" onClick={checkAuthState} variant="ghost" className="h-6 w-6 p-0" title="Refresh status">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {authState?.isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Successfully connected to Google Calendar. You can now view and manage your real calendar events.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Connect your Google Calendar to view and manage your real calendar events.
            </p>
            <Button
              size="sm"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>• Requires Google account authentication</p>
          <p>• Permissions: Read and write calendar events</p>
          <p>• Data is stored securely and never shared</p>
        </div>
      </CardContent>
    </Card>
  )
}
