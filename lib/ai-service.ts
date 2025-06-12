import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateSuggestions(context: {
  tasks: string[]
  events: { title: string; date: Date }[]
  preferences: Record<string, any>
}) {
  const prompt = `
    Based on the following user context, generate 3 helpful suggestions:
    
    Tasks: ${context.tasks.join(", ")}
    
    Upcoming Events: ${context.events.map((e) => `${e.title} on ${e.date.toLocaleDateString()}`).join(", ")}
    
    User Preferences: ${JSON.stringify(context.preferences)}
    
    Generate 3 concise, helpful suggestions that would assist the user with their tasks, 
    prepare for upcoming events, or improve their productivity.
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse the suggestions from the response
    const suggestions = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 3)

    return suggestions
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return [
      "Prepare for your upcoming meeting",
      "Consider taking a break between your back-to-back meetings",
      "Remember to submit your report by the deadline",
    ]
  }
}
