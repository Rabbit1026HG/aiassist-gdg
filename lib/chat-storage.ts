import type { Conversation, ChatMessage, CreateConversationData } from "./types/chat"

class ChatStorageService {
  private readonly CONVERSATIONS_KEY = "ai_assistant_conversations"
  private readonly MESSAGES_KEY = "ai_assistant_messages"

  // Conversation management
  async getConversations(): Promise<Conversation[]> {
    try {
      const stored = localStorage.getItem(this.CONVERSATIONS_KEY)
      if (!stored) return []

      const conversations = JSON.parse(stored) as Conversation[]
      return conversations
        .map((conv) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        }))
        .sort((a, b) => b.updatedAt.getTime() - a.createdAt.getTime())
    } catch (error) {
      console.error("Error loading conversations:", error)
      return []
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversations = await this.getConversations()
    return conversations.find((conv) => conv.id === id) || null
  }

  async createConversation(data: CreateConversationData = {}): Promise<Conversation> {
    const id = this.generateId()
    const now = new Date()

    const conversation: Conversation = {
      id,
      title: data.title || "New Conversation",
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      lastMessage: data.firstMessage,
    }

    const conversations = await this.getConversations()
    conversations.unshift(conversation)

    localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations))
    return conversation
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const conversations = await this.getConversations()
    const index = conversations.findIndex((conv) => conv.id === id)

    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        ...updates,
        updatedAt: new Date(),
      }
      localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations))
    }
  }

  async deleteConversation(id: string): Promise<void> {
    const conversations = await this.getConversations()
    const filtered = conversations.filter((conv) => conv.id !== id)
    localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(filtered))

    // Also delete all messages for this conversation
    await this.deleteConversationMessages(id)
  }

  // Message management
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const stored = localStorage.getItem(`${this.MESSAGES_KEY}_${conversationId}`)
      if (!stored) return []

      const messages = JSON.parse(stored) as ChatMessage[]
      return messages.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }))
    } catch (error) {
      console.error("Error loading messages:", error)
      return []
    }
  }

  async addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.generateId(),
      conversationId,
      role,
      content,
      createdAt: new Date(),
    }

    const messages = await this.getMessages(conversationId)
    messages.push(message)

    localStorage.setItem(`${this.MESSAGES_KEY}_${conversationId}`, JSON.stringify(messages))

    // Update conversation metadata
    await this.updateConversation(conversationId, {
      messageCount: messages.length,
      lastMessage: content.slice(0, 100),
      updatedAt: new Date(),
    })

    return message
  }

  async deleteConversationMessages(conversationId: string): Promise<void> {
    localStorage.removeItem(`${this.MESSAGES_KEY}_${conversationId}`)
  }

  async generateConversationTitle(firstMessage: string): Promise<string> {
    // Simple title generation - could be enhanced with AI
    const words = firstMessage.split(" ").slice(0, 6).join(" ")
    return words.length > 50 ? words.slice(0, 47) + "..." : words || "New Conversation"
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const conversations = await this.getConversations()
    conversations.forEach((conv) => {
      localStorage.removeItem(`${this.MESSAGES_KEY}_${conv.id}`)
    })
    localStorage.removeItem(this.CONVERSATIONS_KEY)
  }

  async exportConversation(id: string): Promise<string> {
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
  }
}

export const chatStorage = new ChatStorageService()
