"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, Mic, MicOff, StopCircle, Sparkles, Calendar, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AudioRecorder } from "@/lib/audio-recorder"
import { SpeechService } from "@/lib/speech-service"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface CalendarAIAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onEventAction: () => void
}

export function CalendarAIAgentModal({ isOpen, onClose, onEventAction }: CalendarAIAgentModalProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        'Hi! I\'m your Calendar AI assistant. I can help you create, update, delete, or list your calendar events. Just tell me what you\'d like to do!\n\nFor example:\n• "Create a meeting tomorrow at 2pm"\n• "What meetings do I have today?"\n• "Delete my 3pm appointment"',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const speechServiceRef = useRef<SpeechService | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio services
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder()
    speechServiceRef.current = SpeechService.getInstance()
    checkMicrophonePermission()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      if (audioRecorderRef.current) {
        const hasPermission = await audioRecorderRef.current.checkMicrophonePermission()
        setMicrophonePermission(hasPermission)
      }
    } catch (error) {
      console.error("Error checking microphone permission:", error)
      setMicrophonePermission(false)
    }
  }

  const handleVoiceInput = async () => {
    if (!audioRecorderRef.current || !speechServiceRef.current) {
      toast({
        title: "Error",
        description: "Voice recording not available.",
        variant: "destructive",
      })
      return
    }

    if (isRecording) {
      // Stop recording
      try {
        setIsTranscribing(true)
        const audioBlob = await audioRecorderRef.current.stopRecording()

        // Clear the recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }
        setRecordingDuration(0)

        // Transcribe the audio
        const transcription = await speechServiceRef.current.transcribeAudio(audioBlob)

        if (transcription.trim()) {
          setInput(transcription.trim())
          // Auto-submit the transcribed text
          await handleSubmit(transcription.trim())
        } else {
          toast({
            title: "No Speech Detected",
            description: "Please try speaking more clearly or check your microphone.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Voice input error:", error)
        toast({
          title: "Voice Input Failed",
          description: error instanceof Error ? error.message : "Failed to process voice input.",
          variant: "destructive",
        })
      } finally {
        setIsRecording(false)
        setIsTranscribing(false)
      }
    } else {
      // Start recording
      try {
        await audioRecorderRef.current.startRecording()
        setIsRecording(true)
        setRecordingDuration(0)

        // Start the recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1)
        }, 1000)

        toast({
          title: "Recording Started",
          description: "Speak now. Tap the microphone again to stop.",
        })
      } catch (error) {
        console.error("Failed to start recording:", error)
        toast({
          title: "Recording Failed",
          description: error instanceof Error ? error.message : "Failed to start voice recording.",
          variant: "destructive",
        })
        checkMicrophonePermission()
      }
    }
  }

  const handleSubmit = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/calendar/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If an event action was performed, refresh the calendar
      if (data.action && data.action !== "none" && data.success) {
        onEventAction()
      }

      // Show success toast for successful actions
      if (data.success && data.action && data.action !== "none" && data.action !== "list") {
        toast({
          title: "Calendar Updated",
          description: "Your calendar has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Calendar AI error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatRecordingDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getMicrophoneIcon = () => {
    if (isTranscribing) {
      return <Sparkles className="h-4 w-4 animate-spin" />
    }
    if (isRecording) {
      return <StopCircle className="h-4 w-4 animate-pulse" />
    }
    if (microphonePermission === false) {
      return <MicOff className="h-4 w-4" />
    }
    return <Mic className="h-4 w-4" />
  }

  const getMicrophoneButtonClass = () => {
    if (isTranscribing) {
      return "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
    }
    if (isRecording) {
      return "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
    }
    if (microphonePermission === false) {
      return "text-gray-400 cursor-not-allowed"
    }
    return "text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] h-[80vh] max-h-[600px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
                Calendar AI Assistant
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                Manage your calendar with natural language commands
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Online
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3 animate-fade-in", message.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                    message.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "flex-1 max-w-[80%]",
                    message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start",
                  )}
                >
                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 shadow-sm",
                      message.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100",
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                        <Sparkles className="h-3 w-3" />
                        Calendar AI
                      </div>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>

                  {/* Timestamp */}
                  <div
                    className={cn(
                      "text-xs text-slate-500 dark:text-slate-400 mt-1 px-1",
                      message.role === "user" ? "text-right" : "text-left",
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 dark:text-slate-400">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      Calendar AI is thinking...
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">Processing your request...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
          {/* Recording Status */}
          {(isRecording || isTranscribing) && (
            <div className="mb-3 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                {isTranscribing ? (
                  <>
                    <Sparkles className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">Transcribing...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Recording {formatRecordingDuration(recordingDuration)}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isRecording ? "Recording..." : isTranscribing ? "Transcribing..." : "Ask me about your calendar..."
                }
                disabled={isRecording || isLoading || isTranscribing}
                className="pr-20 h-12 border-2 border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm focus:border-violet-500/70 dark:focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-400/20 rounded-xl"
              />

              {/* Right side icons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* Voice Input Button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleVoiceInput}
                  disabled={microphonePermission === false || isLoading}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200 hover:scale-105",
                    getMicrophoneButtonClass(),
                  )}
                  title={
                    microphonePermission === false
                      ? "Microphone permission required"
                      : isTranscribing
                        ? "Transcribing audio..."
                        : isRecording
                          ? "Stop recording"
                          : "Start voice input"
                  }
                >
                  {getMicrophoneIcon()}
                </Button>

                {/* Send Button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading || isRecording || isTranscribing}
                  className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          {/* Microphone Permission Warning */}
          {microphonePermission === false && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              <span>Microphone access required for voice input</span>
            </div>
          )}

          {/* Quick Examples */}
          <div className="mt-3 flex flex-wrap gap-2">
            {["What meetings do I have today?", "Create a meeting tomorrow at 2pm", "Delete my 3pm appointment"].map(
              (example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(example)}
                  disabled={isLoading || isRecording || isTranscribing}
                  className="text-xs h-7 px-2 bg-white/50 dark:bg-slate-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 border-slate-200 dark:border-slate-700"
                >
                  {example}
                </Button>
              ),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
