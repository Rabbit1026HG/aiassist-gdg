import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          title: string
          created_at: string
          updated_at: string
          message_count: number
          last_message: string | null
        }
        Insert: {
          id?: string
          title: string
          created_at?: string
          updated_at?: string
          message_count?: number
          last_message?: string | null
        }
        Update: {
          id?: string
          title?: string
          created_at?: string
          updated_at?: string
          message_count?: number
          last_message?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: "user" | "assistant"
          content?: string
          created_at?: string
        }
      }
    }
  }
}
