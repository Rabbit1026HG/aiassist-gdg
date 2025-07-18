import { supabase } from "./supabase"
import type { Conversation, ChatMessage, CreateConversationData } from "./types/chat"


class ChatStorageService {
  // Conversation management
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false })

      if (error) {
        console.error("Error loading conversations:", error)
        return []
      }

      return (data || []).map((conv) => ({
        id: conv.id,
        title: conv.title,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        messageCount: conv.message_count,
        lastMessage: conv.last_message || undefined,
      }))
    } catch (error) {
      console.error("Error loading conversations:", error)
      return []
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      // If it's a temporary ID, return null
      if (id.startsWith("temp-")) {
        return null
      }

      const { data, error } = await supabase.from("conversations").select("*").eq("id", id).single()

      if (error || !data) {
        console.error("Error loading conversation:", error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        messageCount: data.message_count,
        lastMessage: data.last_message || undefined,
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
      return null
    }
  }

  async createConversation(data: CreateConversationData = {}): Promise<Conversation> {
    try {
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert({
          title: data.title || "New Conversation",
          message_count: 0,
          last_message: data.firstMessage || null,
        })
        .select()
        .single()

      if (error || !newConversation) {
        throw new Error(error?.message || "Failed to create conversation")
      }

      return {
        id: newConversation.id,
        title: newConversation.title,
        createdAt: new Date(newConversation.created_at),
        updatedAt: new Date(newConversation.updated_at),
        messageCount: newConversation.message_count,
        lastMessage: newConversation.last_message || undefined,
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
      throw error
    }
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    try {
      // Skip update for temporary conversations
      if (id.startsWith("temp-")) {
        return
      }

      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.messageCount !== undefined) updateData.message_count = updates.messageCount
      if (updates.lastMessage !== undefined) updateData.last_message = updates.lastMessage

      // Always update the updated_at timestamp
      updateData.updated_at = new Date().toISOString()

      const { error } = await supabase.from("conversations").update(updateData).eq("id", id)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Error updating conversation:", error)
      throw error
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      // Skip delete for temporary conversations
      if (id.startsWith("temp-")) {
        return
      }

      // Delete conversation (messages will be deleted automatically due to CASCADE)
      const { error } = await supabase.from("conversations").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      throw error
    }
  }

  // Message management
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      // Return empty array for temporary conversations
      if (conversationId.startsWith("temp-")) {
        return []
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading messages:", error)
        return []
      }

      return (data || []).map((msg) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.created_at),
      }))
    } catch (error) {
      console.error("Error loading messages:", error)
      return []
    }
  }

  async addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<ChatMessage> {
    try {
      // Skip adding message for temporary conversations
      if (conversationId.startsWith("temp-")) {
        // Return a mock message for temporary conversations
        return {
          id: `temp-msg-${Date.now()}`,
          conversationId,
          role,
          content,
          createdAt: new Date(),
        }
      }

      const { data: newMessage, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role,
          content,
        })
        .select()
        .single()

      if (error || !newMessage) {
        throw new Error(error?.message || "Failed to add message")
      }

      // Update conversation metadata
      const { data: messages } = await supabase.from("messages").select("id").eq("conversation_id", conversationId)

      const messageCount = messages?.length || 0

      await supabase
        .from("conversations")
        .update({
          message_count: messageCount,
          last_message: content.slice(0, 100),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)

      return {
        id: newMessage.id,
        conversationId: newMessage.conversation_id,
        role: newMessage.role,
        content: newMessage.content,
        createdAt: new Date(newMessage.created_at),
      }
    } catch (error) {
      console.error("Error adding message:", error)
      throw error
    }
  }

  async deleteConversationMessages(conversationId: string): Promise<void> {
    try {
      // Skip delete for temporary conversations
      if (conversationId.startsWith("temp-")) {
        return
      }

      const { error } = await supabase.from("messages").delete().eq("conversation_id", conversationId)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Error deleting messages:", error)
      throw error
    }
  }

  async generateConversationTitle(firstMessage: string): Promise<string> {
    // Simple title generation - could be enhanced with AI
    const words = firstMessage.split(" ").slice(0, 6).join(" ")
    return words.length > 50 ? words.slice(0, 47) + "..." : words || "New Conversation"
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      // Delete all conversations (messages will be deleted automatically due to CASCADE)
      const { error } = await supabase.from("conversations").delete().neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Error clearing all data:", error)
      throw error
    }
  }

  async exportConversation(id: string): Promise<string> {
    try {
      const conversation = await this.getConversation(id)
      const messages = await this.getMessages(id)

      return JSON.stringify(
        {
          conversation,
          messages,
        },
        null,
        2,
      )
    } catch (error) {
      console.error("Error exporting conversation:", error)
      throw error
    }
  }
}

export const chatStorage = new ChatStorageService()
