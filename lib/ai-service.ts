"use server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function generateSuggestions(context: {
  tasks: string[]
  events: { title: string; date: Date }[]
  preferences: Record<string, any>
}) {
  const prompt = `You are George's personal AI assistant. Generate 3 helpful and actionable productivity suggestions based on his profile and current context:

GEORGE'S PROFILE:
- Solo legal practitioner (Wills & Trusts specialist)
- Theatre/Acting teacher and practitioner  
- Martial Arts: Serrada Escrima Cabales Style
- Jazz Piano player
- Researcher: Legal matters, Quantum Mechanics, Las Vegas housing market
- Schedule: Sleep 9 PM, Wake 5 AM, Morning client signings
- Works mostly from home

CURRENT CONTEXT:
Current Tasks: ${context.tasks.length > 0 ? context.tasks.join(", ") : "No current tasks"}

Upcoming Events: ${
    context.events.length
      ? context.events
          .map((e) => {
            const d = e.date instanceof Date ? e.date : new Date(e.date as unknown as string)
            return `${e.title} on ${d.toLocaleDateString()}`
          })
          .join(", ")
      : "No upcoming events"
  }

User Preferences: ${
    Object.keys(context.preferences).length > 0 ? JSON.stringify(context.preferences) : "Standard preferences"
  }

Generate 3 specific suggestions that:
- Respect his 9 PM bedtime and 5 AM wake schedule
- Optimize his morning energy for legal work/client signings
- Balance his multiple disciplines (law, theatre, martial arts, music, research)
- Support his solo practice efficiency
- Consider his home-based work environment

Each suggestion should be specific, actionable, and tailored to George's unique lifestyle and professional needs.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8,
      maxTokens: 300,
    })

    // Parse the suggestions from the response
    const suggestions = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim()) // Remove numbering
      .filter((line) => line.length > 10) // Filter out very short lines
      .slice(0, 3) // Take only first 3

    // Fallback suggestions if parsing fails or API is unavailable
    if (suggestions.length === 0) {
      return [
        "Review your upcoming calendar events and prepare necessary materials in advance",
        "Consider blocking focused work time between meetings to maintain productivity",
        "Set up automated reminders for important deadlines and recurring tasks",
      ]
    }

    return suggestions
  } catch (error) {
    console.error("Error generating AI suggestions:", error)

    // Provide contextual fallback suggestions based on available data
    const fallbackSuggestions = []

    if (context.events.length > 0) {
      fallbackSuggestions.push("Prepare materials and agenda items for your upcoming meetings")
    }

    if (context.tasks.length > 0) {
      fallbackSuggestions.push("Prioritize your current tasks by deadline and importance")
    }

    fallbackSuggestions.push("Schedule regular breaks to maintain focus and productivity throughout the day")

    // Ensure we always return 3 suggestions
    while (fallbackSuggestions.length < 3) {
      const additionalSuggestions = [
        "Review and organize your workspace for optimal productivity",
        "Set up time blocks for deep work without interruptions",
        "Plan tomorrow's priorities before ending your workday",
      ]
      fallbackSuggestions.push(additionalSuggestions[fallbackSuggestions.length - 1] || additionalSuggestions[0])
    }

    return fallbackSuggestions.slice(0, 3)
  }
}

export async function generateTaskSuggestions(currentTasks: string[], upcomingEvents: string[]) {
  const prompt = `Based on these current tasks and upcoming events, suggest 2-3 additional tasks that would be helpful:

Current Tasks:
${currentTasks.map((task, i) => `${i + 1}. ${task}`).join("\n")}

Upcoming Events:
${upcomingEvents.map((event, i) => `${i + 1}. ${event}`).join("\n")}

Suggest 2-3 specific, actionable tasks that would help prepare for these events or complement the existing tasks. Focus on practical preparation and productivity improvements.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    })

    const suggestions = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 5)
      .slice(0, 3)

    return suggestions.length > 0
      ? suggestions
      : [
          "Review meeting agendas and prepare talking points",
          "Organize relevant documents and materials",
          "Schedule follow-up time after important meetings",
        ]
  } catch (error) {
    console.error("Error generating task suggestions:", error)
    return [
      "Review meeting agendas and prepare talking points",
      "Organize relevant documents and materials",
      "Schedule follow-up time after important meetings",
    ]
  }
}

export async function generateMeetingPrep(meetingTitle: string, meetingTime: string) {
  const prompt = `Generate a brief meeting preparation checklist for: "${meetingTitle}" scheduled for ${meetingTime}.

Provide 3-4 specific preparation items that would be helpful for this meeting. Focus on practical, actionable items.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.6,
      maxTokens: 150,
    })

    const items = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) =>
        line
          .replace(/^[-•]\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .trim(),
      )
      .filter((line) => line.length > 5)
      .slice(0, 4)

    return items.length > 0
      ? items
      : [
          "Review agenda and prepare talking points",
          "Gather relevant documents and data",
          "Prepare questions and discussion topics",
          "Test technology and meeting links",
        ]
  } catch (error) {
    console.error("Error generating meeting prep:", error)
    return [
      "Review agenda and prepare talking points",
      "Gather relevant documents and data",
      "Prepare questions and discussion topics",
      "Test technology and meeting links",
    ]
  }
}
