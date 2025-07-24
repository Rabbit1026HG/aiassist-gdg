import { supabase } from "./supabase"

export interface Memory {
  id: string
  user_id: string
  title: string
  content: string
  type: "resume" | "document" | "preference" | "context" | "file"
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateMemoryInput {
  title: string
  content: string
  type: Memory["type"]
  metadata?: Record<string, any>
}

export interface SearchResult extends Memory {
  similarity: number
}

class MemoryService {
  private async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OpenAI API key not found, skipping embedding generation")
        return null
      }

      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error("Error generating embedding:", error)
      return null
    }
  }

  async createMemory(userId: string, input: CreateMemoryInput): Promise<Memory> {
    try {
      // Generate embedding for the content
      const embedding = await this.generateEmbedding(`${input.title} ${input.content}`)

      const insertData: any = {
        user_id: userId,
        title: input.title,
        content: input.content,
        type: input.type,
        metadata: input.metadata || {},
      }

      // Only add embedding if we successfully generated one
      if (embedding) {
        insertData.embedding = embedding
      }

      const { data, error } = await supabase.from("user_memories").insert(insertData).select().single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      return data
    } catch (error) {
      console.error("Error creating memory:", error)
      throw error
    }
  }

  async getMemories(userId: string, type?: Memory["type"]): Promise<Memory[]> {
    try {
      let query = supabase
        .from("user_memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (type) {
        query = query.eq("type", type)
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error("Error fetching memories:", error)
      throw error
    }
  }

  async getMemory(userId: string, memoryId: string): Promise<Memory | null> {
    try {
      const { data, error } = await supabase
        .from("user_memories")
        .select("*")
        .eq("user_id", userId)
        .eq("id", memoryId)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        console.error("Supabase error:", error)
        throw error
      }
      return data
    } catch (error) {
      console.error("Error fetching memory:", error)
      throw error
    }
  }

  async updateMemory(userId: string, memoryId: string, updates: Partial<CreateMemoryInput>): Promise<Memory> {
    try {
      const updateData: any = { ...updates }

      // If content or title changed, regenerate embedding
      if (updates.title || updates.content) {
        const currentMemory = await this.getMemory(userId, memoryId)
        if (!currentMemory) throw new Error("Memory not found")

        const newTitle = updates.title || currentMemory.title
        const newContent = updates.content || currentMemory.content
        const embedding = await this.generateEmbedding(`${newTitle} ${newContent}`)

        if (embedding) {
          updateData.embedding = embedding
        }
      }

      const { data, error } = await supabase
        .from("user_memories")
        .update(updateData)
        .eq("user_id", userId)
        .eq("id", memoryId)
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      return data
    } catch (error) {
      console.error("Error updating memory:", error)
      throw error
    }
  }

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    try {
      const { error } = await supabase.from("user_memories").delete().eq("user_id", userId).eq("id", memoryId)

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting memory:", error)
      throw error
    }
  }

  async searchMemories(
    userId: string,
    query: string,
    options: {
      threshold?: number
      limit?: number
      type?: Memory["type"]
    } = {},
  ): Promise<SearchResult[]> {
    try {
      const { threshold = 0.7, limit = 10, type } = options

      // Try vector search first
      const queryEmbedding = await this.generateEmbedding(query)
      console.log("------------------------")
      console.log(userId, query, options,queryEmbedding);
      console.log("------------------------")

      if (queryEmbedding) {
        try {
          const { data, error } = await supabase.rpc("search_memories", {
            query_embedding: queryEmbedding,
            match_threshold: threshold,
            match_count: limit,
            filter_user_id: userId,
          })
console.log(data,error)
          if (!error && data) {
            let results = data || []

            // Filter by type if specified
            if (type) {
              results = results.filter((memory: SearchResult) => memory.type === type)
            }

            return results
          }
        } catch (vectorError) {
          console.warn("Vector search failed, falling back to text search:", vectorError)
        }
      }

      // Fallback to text search
      return this.fallbackTextSearch(userId, query, options)
    } catch (error) {
      console.error("Error searching memories:", error)
      // Final fallback to text search
      return this.fallbackTextSearch(userId, query, options)
    }
  }

  private async fallbackTextSearch(
    userId: string,
    query: string,
    options: { type?: Memory["type"]; limit?: number } = {},
  ): Promise<SearchResult[]> {
    try {
      const { type, limit = 10 } = options

      let supabaseQuery = supabase
        .from("user_memories")
        .select("*")
        .eq("user_id", userId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (type) {
        supabaseQuery = supabaseQuery.eq("type", type)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Add similarity score (simplified for text search)
      return (data || []).map((memory) => ({
        ...memory,
        similarity: 0.5, // Default similarity for text search
      }))
    } catch (error) {
      console.error("Error in fallback text search:", error)
      return []
    }
  }

  async getRelevantContext(userId: string, query: string, limit = 5): Promise<string> {
    try {
      const memories = await this.searchMemories(userId, query, {
        threshold: 0.6,
        limit,
      })

      if (memories.length === 0) return ""

      const context = memories
        .map((memory) => `[${memory.type.toUpperCase()}] ${memory.title}: ${memory.content}`)
        .join("\n\n")

      return `Here's some relevant information I remember about you:\n\n${context}`
    } catch (error) {
      console.error("Error getting relevant context:", error)
      return ""
    }
  }
}

export const memoryService = new MemoryService()
