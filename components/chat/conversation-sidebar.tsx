"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Search, MoreHorizontal, Edit2, Trash2, Download, X, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/types/chat"
import { chatStorage } from "@/lib/chat-storage"

interface ConversationSidebarProps {
  currentConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  className?: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  className,
  isMobile = false,
  isOpen = true,
  onClose,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const convs = await chatStorage.getConversations()
      setConversations(convs)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConversationSelect = (conversationId: string) => {
    onConversationSelect(conversationId)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleNewConversation = () => {
    onNewConversation()
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleRename = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return

    try {
      await chatStorage.updateConversation(id, { title: newTitle.trim() })
      setConversations((prev) => prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle.trim() } : conv)))
      setEditingId(null)
    } catch (error) {
      console.error("Error renaming conversation:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return

    try {
      await chatStorage.deleteConversation(id)
      setConversations((prev) => prev.filter((conv) => conv.id !== id))

      // If we're deleting the current conversation, create a new one
      if (currentConversationId === id) {
        handleNewConversation()
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const handleExport = async (id: string) => {
    try {
      const data = await chatStorage.exportConversation(id)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `conversation-${id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting conversation:", error)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-2 sm:p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            Conversations
          </h2>
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
        <Button
          onClick={handleNewConversation}
          className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
        >
          <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">New Chat</span>
          <span className="xs:hidden">New</span>
        </Button>
      </div>

      {/* Search */}
      <div className="p-2 sm:p-3 lg:p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className={cn("relative", !isMobile && !isOpen && "hidden")}>
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-7 sm:h-8 lg:h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-1 sm:p-2">
          {isLoading ? (
            <div className="space-y-1 sm:space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 sm:h-14 lg:h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-slate-500 dark:text-slate-400 text-xs sm:text-sm px-2">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            <div className="space-y-0.5 sm:space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative rounded-lg p-1.5 sm:p-2 lg:p-3 cursor-pointer transition-all duration-200 hover:bg-white dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700",
                    currentConversationId === conversation.id &&
                      "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700",
                  )}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-r from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingId === conversation.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleRename(conversation.id, editingTitle)
                              } else if (e.key === "Escape") {
                                setEditingId(null)
                              }
                            }}
                            className="h-5 sm:h-6 lg:h-7 text-xs sm:text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRename(conversation.id, editingTitle)
                            }}
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                          >
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingId(null)
                            }}
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                          >
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium text-xs sm:text-sm lg:text-base text-slate-900 dark:text-slate-100 truncate leading-tight">
                            {conversation.title}
                          </h3>
                          {conversation.lastMessage && (
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 sm:mt-1 leading-tight max-w-48">
                              {conversation.lastMessage}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1 sm:mt-1.5 lg:mt-2">
                            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                              {formatDate(conversation.updatedAt)}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-1">
                              {conversation.messageCount}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {editingId !== conversation.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-50 group-hover:opacity-100 transition-opacity h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 p-0 touch-manipulation flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 sm:w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingId(conversation.id)
                              setEditingTitle(conversation.title)
                            }}
                            className="text-xs sm:text-sm"
                          >
                            <Edit2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExport(conversation.id)
                            }}
                            className="text-xs sm:text-sm"
                          >
                            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(conversation.id)
                            }}
                            className="text-red-600 dark:text-red-400 text-xs sm:text-sm"
                          >
                            <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] h-full">{sidebarContent}</div>
          </div>
        )}
      </>
    )
  }

  return <div className={cn("h-full", className)}>{sidebarContent}</div>
}
