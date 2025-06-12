import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system:
      "You are a helpful AI assistant designed to manage daily activities, organize tasks, schedule appointments, and provide timely reminders. Maintain a formal and supportive tone in all interactions. Prioritize user privacy and data security.",
  })

  return result.toDataStreamResponse()
}
