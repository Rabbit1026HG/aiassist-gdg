"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calendarService } from "@/lib/calendar-service"
import type { CalendarDataSource } from "@/lib/calendar-config"
import { Settings, Database, TestTube } from "lucide-react"

interface DebugPanelProps {
  onDataSourceChange?: () => void
}

export function CalendarDebugPanel({ onDataSourceChange }: DebugPanelProps) {
  const [currentSource, setCurrentSource] = useState<CalendarDataSource>(calendarService.getDataSource())

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null
  }

  const handleSourceChange = (source: CalendarDataSource) => {
    calendarService.setDataSource(source)
    setCurrentSource(source)
    onDataSourceChange?.()
  }

  return (
    <Card className="border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Settings className="h-4 w-4" />
          Development Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Data Source:</span>
          <Badge variant={currentSource === "real" ? "default" : "secondary"}>
            {currentSource === "real" ? "Real API" : "Mock Data"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={currentSource === "mock" ? "default" : "outline"}
            onClick={() => handleSourceChange("mock")}
            className="flex items-center gap-1"
          >
            <TestTube className="h-3 w-3" />
            Mock Data
          </Button>
          <Button
            size="sm"
            variant={currentSource === "real" ? "default" : "outline"}
            onClick={() => handleSourceChange("real")}
            className="flex items-center gap-1"
          >
            <Database className="h-3 w-3" />
            Real API
          </Button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch between mock data (for testing) and real Google Calendar API calls. This panel only appears in
          development mode.
        </p>
      </CardContent>
    </Card>
  )
}
