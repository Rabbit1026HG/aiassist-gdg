import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      system: `You are a helpful AI assistant designed to manage daily activities, organize tasks, schedule appointments, and provide timely reminders. 

Key capabilities:
- Help with task management and organization
- Assist with calendar scheduling and time management
- Provide productivity tips and suggestions
- Answer questions about daily planning
- Help with meeting preparation and follow-ups
- Suggest optimal work schedules and break times
- Provide reminders and deadline management

Maintain a professional yet friendly tone. Be concise but thorough in your responses. Always prioritize user privacy and data security. When discussing calendar events or tasks, be specific about timing and actionable steps.`,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
