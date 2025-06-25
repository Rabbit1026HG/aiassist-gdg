import { type NextRequest, NextResponse } from "next/server"
import { generateSuggestions } from "@/lib/ai-service"

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json()) as {
      tasks: string[]
      events: { title: string; date: string | Date }[]
      preferences: Record<string, any>
    }

    // Ensure each `date` is a Date instance
    const safeEvents = raw.events.map((e) => ({
      ...e,
      // convert only if needed
      date: e.date instanceof Date ? e.date : new Date(e.date),
    }))

    const suggestions = await generateSuggestions({
      tasks: raw.tasks,
      events: safeEvents,
      preferences: raw.preferences,
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Suggestion API error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
