"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Mic, Send, StopCircle, Copy, Check, Bot, User, Sparkles, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { chatStorage } from "@/lib/chat-storage"
import { useToast } from "@/hooks/use-toast"
import type { Conversation } from "@/lib/types/chat"

export function ChatInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hasUserMessages, setHasUserMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [],
    onFinish: async (message) => {
      if (currentConversation && hasUserMessages) {
        await chatStorage.addMessage(currentConversation.id, "assistant", message.content)
        // Refresh conversations list to show updated message count
        loadConversations()
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize with existing conversations or create temporary state
  useEffect(() => {
    initializeChat()
  }, [])

  // Check if there are user messages (excluding welcome message)
  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.role === "user")
    setHasUserMessages(userMessages.length > 0)
  }, [messages])

  const initializeChat = async () => {
    try {
      // Try to load existing conversations first
      const conversations = await chatStorage.getConversations()

      if (conversations.length > 0) {
        // Load the most recent conversation
        const latestConversation = conversations[0]
        await handleConversationSelect(latestConversation.id)
      } else {
        // Start with a temporary conversation (not saved until user sends a message)
        startTemporaryConversation()
      }
    } catch (error) {
      console.error("Error initializing chat:", error)
      startTemporaryConversation()
    }
  }

  const startTemporaryConversation = () => {
    // Create a temporary conversation state without saving to storage
    setCurrentConversation({
      id: "temp-" + Date.now(),
      title: "New Conversation",
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    })

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi, George! I'm your personal AI assistant, familiar with your daily schedule, your solo legal work in Wills & Trusts, and your interests in theatre, martial arts, jazz piano, and research. How can I help you manage your day and tasks?",
      },
    ])
  }

  const loadConversations = async () => {
    // This will trigger a re-render of the sidebar with updated conversations
    // The sidebar component handles its own loading
  }

  const handleNewConversation = async () => {
    // Start with a temporary conversation
    startTemporaryConversation()
    setHasUserMessages(false)
  }

  const handleConversationSelect = async (conversationId: string) => {
    try {
      const conversation = await chatStorage.getConversation(conversationId)
      const conversationMessages = await chatStorage.getMessages(conversationId)

      if (conversation) {
        setCurrentConversation(conversation)

        // Convert stored messages to the format expected by useChat
        const formattedMessages = conversationMessages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        }))

        // Add welcome message if no messages exist
        if (formattedMessages.length === 0) {
          formattedMessages.unshift({
            id: "welcome",
            role: "assistant",
            content:
              "Hi, George! I'm your personal AI assistant, familiar with your daily schedule, your solo legal work in Wills & Trusts, and your interests in theatre, martial arts, jazz piano, and research. How can I help you manage your day and tasks?",
            createdAt: new Date(),
          })
        }

        setMessages(formattedMessages)

        // Check if this conversation has user messages
        const userMessages = formattedMessages.filter((msg) => msg.role === "user")
        setHasUserMessages(userMessages.length > 0)
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive",
      })
    }
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        // This would be replaced with actual speech-to-text functionality
        const voiceInput = "Schedule a meeting with the design team tomorrow at 10 AM"
        handleInputChange({ target: { value: voiceInput } } as React.ChangeEvent<HTMLTextAreaElement>)
        setIsRecording(false)
      }, 2000)
    } else {
      // Stop recording
      setIsRecording(false)
    }
  }

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      })
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      })
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // If this is a temporary conversation, save it now
    if (currentConversation && currentConversation.id.startsWith("temp-")) {
      try {
        const newConversation = await chatStorage.createConversation({
          title: "New Conversation",
          firstMessage: input.trim(),
        })
        setCurrentConversation(newConversation)
        setHasUserMessages(true)

        // Store the user message
        await chatStorage.addMessage(newConversation.id, "user", input.trim())
      } catch (error) {
        console.error("Error creating conversation:", error)
        toast({
          title: "Error",
          description: "Failed to create conversation.",
          variant: "destructive",
        })
        return
      }
    } else if (currentConversation && hasUserMessages) {
      // Store user message for existing conversation
      await chatStorage.addMessage(currentConversation.id, "user", input.trim())
    }

    // Update conversation title if it's the first user message
    if (currentConversation && !hasUserMessages) {
      const title = await chatStorage.generateConversationTitle(input.trim())
      await chatStorage.updateConversation(currentConversation.id, { title })
      setCurrentConversation((prev) => (prev ? { ...prev, title } : null))
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = "2.5rem"
    }

    handleSubmit(e)
  }

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"
    const scrollHeight = textarea.scrollHeight
    const maxHeight = isMobile ? 120 : 128
    textarea.style.height = Math.min(scrollHeight, maxHeight) + "px"

    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.overflowY = "hidden"
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] w-full">
      {/* Sidebar */}
      <ConversationSidebar
        currentConversationId={currentConversation?.id}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className={cn("transition-all duration-300 ease-in-out", !isMobile && (sidebarOpen ? "w-72 lg:w-80" : "w-0"))}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              {sidebarOpen && isMobile ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent truncate">
                {currentConversation?.title || "AI Assistant"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                Your intelligent productivity companion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">{error ? "Error" : "Online"}</span>
              <span className="sm:hidden">●</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 sm:gap-3 lg:gap-4 group animate-fade-in",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    message.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  ) : (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "flex-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[75%]",
                    message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start",
                  )}
                >
                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "relative rounded-2xl px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 shadow-sm",
                      message.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100",
                    )}
                  >
                    {/* AI Thinking Indicator */}
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                        <Sparkles className="h-3 w-3" />
                        AI Assistant
                      </div>
                    )}

                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Copy Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className={cn(
                        "absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 touch-manipulation",
                        message.role === "user"
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300",
                      )}
                    >
                      {copiedMessageId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={cn(
                      "text-xs text-slate-500 dark:text-slate-400 mt-1 px-1",
                      message.role === "user" ? "text-right" : "text-left",
                    )}
                  >
                    {formatTime(new Date(message.createdAt || Date.now()))}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 lg:gap-4 animate-fade-in">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      AI Assistant is thinking...
                    </div>
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 sm:gap-3 lg:gap-4 animate-fade-in">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4 shadow-sm">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Sorry, I encountered an error. Please try again or check your connection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
            <form onSubmit={onSubmit}>
              {/* Input Field with embedded icons */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit(e as any)
                    }
                  }}
                  placeholder={isRecording ? "" : "Type your message..."}
                  className="w-full min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] max-h-[7.5rem] sm:max-h-[8rem] rounded-xl border-2 border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm pl-3 sm:pl-4 lg:pl-5 pr-16 sm:pr-20 lg:pr-24 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base focus:border-violet-500/70 dark:focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-400/20 focus:outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none overflow-y-hidden touch-manipulation"
                  disabled={isRecording || isLoading}
                  rows={1}
                  style={{
                    height: "auto",
                    minHeight: isMobile ? "2.5rem" : "3rem",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
                />

                {/* Voice Recording Indicator */}
                {isRecording && (
                  <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex space-x-1">
                    <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-red-500 rounded-full animate-pulse" />
                    <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-red-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                )}

                {/* Right side icons container */}
                <div className="absolute right-2 sm:right-3 top-[45%] -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                  {/* Voice Input Button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleVoiceInput}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg transition-all duration-200 hover:scale-105 touch-manipulation",
                      isRecording
                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400",
                    )}
                  >
                    {isRecording ? (
                      <StopCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 animate-pulse" />
                    ) : (
                      <Mic className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                    )}
                  </Button>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 touch-manipulation"
                  >
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
