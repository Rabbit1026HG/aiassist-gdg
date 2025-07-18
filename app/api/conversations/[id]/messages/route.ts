import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role, content } = await request.json()

    // Verify conversation exists
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", params.id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Add message
    const { data: newMessage, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: params.id,
        role,
        content,
      })
      .select()
      .single()

    if (msgError || !newMessage) {
      console.error("Database error:", msgError)
      return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
    }

    const message = {
      id: newMessage.id,
      conversationId: newMessage.conversation_id,
      role: newMessage.role,
      content: newMessage.content,
      createdAt: newMessage.created_at,
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
  }
}
