"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Send, StopCircle, Copy, Check, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi, George! I'm your personal AI assistant, familiar with your daily schedule, your solo legal work in Wills & Trusts, and your interests in theatre, martial arts, jazz piano, and research. How can I help you manage your day and tasks?",
      },
    ],
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // Reset textarea height
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = "2.5rem"
    }

    handleSubmit(e)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Your intelligent productivity companion</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            {error ? "Error" : "Online"}
          </div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col modern-card">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 md:gap-4 group animate-fade-in",
                message.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  message.role === "user"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500",
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                ) : (
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "flex-1 max-w-[85%] md:max-w-[75%]",
                  message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start",
                )}
              >
                {/* Message Bubble */}
                <div
                  className={cn(
                    "relative rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-sm",
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

                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>

                  {/* Copy Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200",
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
            <div className="flex gap-3 md:gap-4 animate-fade-in">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="flex-1 max-w-[75%]">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 shadow-sm">
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
            <div className="flex gap-3 md:gap-4 animate-fade-in">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div className="flex-1 max-w-[75%]">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4 shadow-sm">
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
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/50">
          <form onSubmit={onSubmit}>
            {/* Input Field with embedded icons */}
            <div className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    onSubmit(e as any)
                  }
                }}
                placeholder={isRecording ? "" : "Type your message..."}
                className="w-full min-h-[3rem] md:min-h-[3.5rem] max-h-[6rem] md:max-h-[8rem] rounded-xl border-2 border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm pl-4 md:pl-5 pr-20 md:pr-24 py-2.5 md:py-3 text-sm md:text-base focus:border-violet-500/70 dark:focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-400/20 focus:outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none overflow-y-hidden"
                disabled={isRecording || isLoading}
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "3rem",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  const scrollHeight = target.scrollHeight
                  const maxHeight = window.innerWidth < 768 ? 96 : 128 // 6rem mobile, 8rem desktop
                  target.style.height = Math.min(scrollHeight, maxHeight) + "px"

                  // Show scrollbar only when content exceeds max height
                  if (scrollHeight > maxHeight) {
                    target.style.overflowY = "auto"
                  } else {
                    target.style.overflowY = "hidden"
                  }
                }}
              />

              {/* Voice Recording Indicator */}
              {isRecording && (
                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex space-x-1">
                  <div className="w-1 h-3 md:w-1.5 md:h-4 bg-red-500 rounded-full animate-pulse" />
                  <div className="w-1 h-3 md:w-1.5 md:h-4 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                  <div className="w-1 h-3 md:w-1.5 md:h-4 bg-red-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
              )}

              {/* Right side icons container */}
              <div className="absolute right-2 md:right-3 top-[45%] -translate-y-1/2 flex items-center gap-1 md:gap-2">
                {/* Voice Input Button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleVoiceInput}
                  className={cn(
                    "w-8 h-8 md:w-9 md:h-9 rounded-lg transition-all duration-200 hover:scale-105",
                    isRecording
                      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400",
                  )}
                >
                  {isRecording ? (
                    <StopCircle className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>

                {/* Send Button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
