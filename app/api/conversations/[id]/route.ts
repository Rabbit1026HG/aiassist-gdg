import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory store (same as above)
const conversations = new Map()
const messages = new Map()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversation = conversations.get(params.id)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conversationMessages = messages.get(params.id) || []

    return NextResponse.json({
      conversation,
      messages: conversationMessages,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const conversation = conversations.get(params.id)

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    conversations.set(params.id, updatedConversation)

    return NextResponse.json({ conversation: updatedConversation })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = conversations.delete(params.id)
    messages.delete(params.id)

    if (!deleted) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
