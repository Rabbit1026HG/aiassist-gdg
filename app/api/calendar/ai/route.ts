import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { serverGoogleCalendar } from "@/lib/google-calendar-server"
import type { CreateEventData } from "@/lib/google-calendar-real"

export const maxDuration = 30

interface CalendarAction {
  action: "create" | "update" | "delete" | "list" | "none"
  eventId?: string
  eventData?: Partial<CreateEventData>
  timeRange?: {
    start: string
    end: string
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    // First, analyze the user's intent and extract calendar action
    const analysisResult = await generateText({
      model: openai("gpt-4o"),
      system: `You are a calendar AI assistant. Analyze the user's message and determine what calendar action they want to perform.

IMPORTANT: You must respond with a valid JSON object containing:
{
  "action": "create" | "update" | "delete" | "list" | "none",
  "eventId": "string (only for update/delete)",
  "eventData": {
    "title": "string",
    "description": "string (optional)",
    "startDateTime": "ISO string",
    "endDateTime": "ISO string", 
    "location": "string (optional)",
    "attendees": ["email1", "email2"] (optional)
  },
  "timeRange": {
    "start": "ISO string (for list action)",
    "end": "ISO string (for list action)"
  },
  "response": "Natural language response to user"
}

Examples:
- "Create a meeting tomorrow at 2pm" -> action: "create"
- "Delete my 3pm appointment" -> action: "delete" (but you'll need to ask for more details)
- "Update my meeting to 4pm" -> action: "update" (but you'll need to ask for more details)
- "What meetings do I have today?" -> action: "list"
- "Hello" -> action: "none"

For date/time parsing:
- "tomorrow" = next day
- "today" = current day  
- "next week" = 7 days from now
- Default duration: 1 hour if not specified
- Default time: 9:00 AM if not specified

Current date/time: ${new Date().toISOString()}`,
      prompt: message,
      temperature: 0.3,
    })

    let parsedAction: CalendarAction & { response: string }

    try {
      parsedAction = JSON.parse(analysisResult.text)
    } catch (error) {
      // Fallback if JSON parsing fails
      parsedAction = {
        action: "none",
        response:
          "I'm sorry, I didn't understand that. Please try asking me to create, update, delete, or list calendar events.",
      }
    }

    // Execute the calendar action
    let actionResult = ""

    try {
      switch (parsedAction.action) {
        case "create":
          if (parsedAction.eventData) {
            const event = await serverGoogleCalendar.createEvent(parsedAction.eventData as CreateEventData)
            actionResult = `✅ Event "${event.title}" created successfully for ${new Date(event.start.dateTime).toLocaleString()}`
          } else {
            actionResult = "❌ I need more details to create the event. Please specify at least a title and time."
          }
          break

        case "update":
          if (parsedAction.eventId && parsedAction.eventData) {
            const event = await serverGoogleCalendar.updateEvent(parsedAction.eventId, parsedAction.eventData)
            actionResult = `✅ Event "${event.title}" updated successfully`
          } else {
            actionResult =
              "❌ To update an event, I need you to specify which event and what changes to make. You can say something like 'Update my 2pm meeting to 3pm'"
          }
          break

        case "delete":
          if (parsedAction.eventId) {
            await serverGoogleCalendar.deleteEvent(parsedAction.eventId)
            actionResult = "✅ Event deleted successfully"
          } else {
            actionResult =
              "❌ To delete an event, I need you to specify which event. You can say something like 'Delete my 2pm meeting today'"
          }
          break

        case "list":
          const timeRange = parsedAction.timeRange || {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next 24 hours
          }

          const events = await serverGoogleCalendar.getEvents(timeRange.start, timeRange.end)

          if (events.length === 0) {
            actionResult = "📅 No events found for the specified time period."
          } else {
            actionResult =
              `📅 Found ${events.length} event(s):\n\n` +
              events
                .map(
                  (event) =>
                    `• **${event.title}**\n  ${new Date(event.start.dateTime).toLocaleString()}${event.location ? `\n  📍 ${event.location}` : ""}`,
                )
                .join("\n\n")
          }
          break

        case "none":
        default:
          actionResult =
            parsedAction.response ||
            "I can help you create, update, delete, or list calendar events. What would you like to do?"
          break
      }
    } catch (error) {
      console.error("Calendar action error:", error)
      actionResult = `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`
    }

    // Generate a natural response
    const finalResponse = await generateText({
      model: openai("gpt-4o"),
      system: `You are a helpful calendar AI assistant. Based on the action result, provide a natural, conversational response to the user. Keep it concise but friendly.

If the action was successful, acknowledge it positively.
If there was an error, be helpful and suggest what the user can try instead.
If you need more information, ask specific questions.

Action performed: ${parsedAction.action}
Result: ${actionResult}`,
      prompt: `User said: "${message}"\nAction result: ${actionResult}`,
      temperature: 0.7,
    })

    return new Response(
      JSON.stringify({
        success: true,
        response: finalResponse.text,
        action: parsedAction.action,
        actionResult,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Calendar AI error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process calendar request",
        response: "I'm sorry, I'm having trouble right now. Please try again in a moment.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
