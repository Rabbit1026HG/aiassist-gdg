import { type NextRequest, NextResponse } from "next/server"

// This is a simple in-memory store for demo purposes
// In production, you'd use a real database
const conversations = new Map()
const messages = new Map()

export async function GET() {
  try {
    const conversationList = Array.from(conversations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )

    return NextResponse.json({ conversations: conversationList })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, firstMessage } = await request.json()

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    const now = new Date().toISOString()

    const conversation = {
      id,
      title: title || "New Conversation",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      lastMessage: firstMessage || null,
    }

    conversations.set(id, conversation)
    messages.set(id, [])

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
