import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    const conversations = (data || []).map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      messageCount: conv.message_count,
      lastMessage: conv.last_message,
    }))

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, firstMessage } = await request.json()

    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        title: title || "New Conversation",
        message_count: 0,
        last_message: firstMessage || null,
      })
      .select()
      .single()

    if (error || !newConversation) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
    }

    const conversation = {
      id: newConversation.id,
      title: newConversation.title,
      createdAt: newConversation.created_at,
      updatedAt: newConversation.updated_at,
      messageCount: newConversation.message_count,
      lastMessage: newConversation.last_message,
    }

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
