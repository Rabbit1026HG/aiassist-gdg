import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", params.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", params.id)
      .order("created_at", { ascending: true })

    if (msgError) {
      console.error("Error fetching messages:", msgError)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    const formattedConversation = {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      messageCount: conversation.message_count,
      lastMessage: conversation.last_message,
    }

    const formattedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at,
    }))

    return NextResponse.json({
      conversation: formattedConversation,
      messages: formattedMessages,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.messageCount !== undefined) updateData.message_count = updates.messageCount
    if (updates.lastMessage !== undefined) updateData.last_message = updates.lastMessage

    const { data: updatedConversation, error } = await supabase
      .from("conversations")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error || !updatedConversation) {
      if (error?.code === "PGRST116") {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
    }

    const conversation = {
      id: updatedConversation.id,
      title: updatedConversation.title,
      createdAt: updatedConversation.created_at,
      updatedAt: updatedConversation.updated_at,
      messageCount: updatedConversation.message_count,
      lastMessage: updatedConversation.last_message,
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("conversations").delete().eq("id", params.id)

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
