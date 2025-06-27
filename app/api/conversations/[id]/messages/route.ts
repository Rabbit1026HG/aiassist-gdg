import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory store
const conversations = new Map()
const messages = new Map()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role, content } = await request.json()

    const conversation = conversations.get(params.id)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conversationMessages = messages.get(params.id) || []

    const message = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      conversationId: params.id,
      role,
      content,
      createdAt: new Date().toISOString(),
    }

    conversationMessages.push(message)
    messages.set(params.id, conversationMessages)

    // Update conversation metadata
    const updatedConversation = {
      ...conversation,
      messageCount: conversationMessages.length,
      lastMessage: content.slice(0, 100),
      updatedAt: new Date().toISOString(),
    }
    conversations.set(params.id, updatedConversation)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
  }
}
