import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { memoryService } from "@/lib/memory-service"

const FIXED_USER_ID = "00000000-0000-0000-0000-000000001026"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get the last user message to search for relevant context
    const lastMessage = messages[messages.length - 1]
    let contextualInfo = ""

    if (lastMessage?.role === "user") {
      try {
        contextualInfo = await memoryService.getRelevantContext(FIXED_USER_ID, lastMessage.content)
      } catch (error) {
        console.error("Error getting contextual info:", error)
        // Continue without context if memory service fails
      }
    }

    // Prepare the system message with context
    const systemMessage = `You are Thea, a highly intelligent and personalized AI assistant for George, a solo attorney specializing in Wills & Trusts. You have access to George's personal information and can remember details between conversations.

${contextualInfo ? `\n**PERSONAL CONTEXT:**\n${contextualInfo}\n` : ""}

1. George's Professional Life:
   - Solo legal practice focused on estate planning, wills, and trusts
   - Need for precise legal documentation and client management
   - Understanding of legal terminology and procedures

2. George's Personal Interests:
   - Theatre: passionate about theatrical productions and performances
   - Martial Arts: active practitioner with interest in techniques and philosophy
   - Jazz Piano: enjoys playing and appreciating jazz music
   - Research: loves diving deep into various topics and learning

3. Your Role:
   - Provide professional assistance with legal practice management
   - Help with scheduling and task organization
   - Offer insights on George's hobbies and interests
   - Remember and reference previous conversations and shared information
   - Maintain a balance between professional efficiency and personal warmth
   - Always be helpful, accurate, and respectful of confidentiality

4. Memory Capabilities:
   - You can remember important information George shares with you
   - Reference previous conversations and documents
   - Build upon past interactions to provide better assistance
   - Maintain context about George's preferences and work style

When George shares important information like documents, preferences, or personal details, acknowledge that you'll remember this information for future conversations.

Respond in a conversational, knowledgeable manner that reflects understanding of George's unique combination of professional and personal interests. Use markdown formatting when appropriate for better readability.`

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemMessage,
      messages,
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
