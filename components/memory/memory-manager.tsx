"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Brain, Plus, Search, Edit, Trash2, FileText, User, Settings, File, BookOpen, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Memory {
  id: string
  title: string
  content: string
  type: "resume" | "document" | "preference" | "context" | "file"
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

const memoryTypeIcons = {
  resume: User,
  document: FileText,
  preference: Settings,
  context: BookOpen,
  file: File,
}

const memoryTypeColors = {
  resume: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  document: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  preference: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  context: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  file: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

export function MemoryManager() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "context" as Memory["type"],
  })

  useEffect(() => {
    loadMemories()
  }, [])

  useEffect(() => {
    filterMemories()
  }, [memories, searchQuery, typeFilter])

  const loadMemories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/memory")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to load memories")
      }

      const data = await response.json()
      setMemories(data.memories || [])
    } catch (error) {
      console.error("Error loading memories:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load memories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterMemories = () => {
    let filtered = memories

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((memory) => memory.type === typeFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (memory) =>
          memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredMemories(filtered)
  }

  const handleCreateMemory = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        toast({
          title: "Error",
          description: "Title and content are required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to create memory")
      }

      toast({
        title: "Success",
        description: "Memory created successfully! Thea will now remember this information.",
      })

      setFormData({ title: "", content: "", type: "context" })
      setIsCreateDialogOpen(false)
      loadMemories()
    } catch (error) {
      console.error("Error creating memory:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create memory",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMemory = async () => {
    if (!editingMemory) return

    try {
      const response = await fetch(`/api/memory/${editingMemory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to update memory")
      }

      toast({
        title: "Success",
        description: "Memory updated successfully! Thea's knowledge has been updated.",
      })

      setEditingMemory(null)
      setFormData({ title: "", content: "", type: "context" })
      loadMemories()
    } catch (error) {
      console.error("Error updating memory:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update memory",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      const response = await fetch(`/api/memory/${memoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to delete memory")
      }

      toast({
        title: "Success",
        description: "Memory deleted successfully! Thea will no longer remember this information.",
      })

      loadMemories()
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete memory",
        variant: "destructive",
      })
    }
  }

  const startEditing = (memory: Memory) => {
    setEditingMemory(memory)
    setFormData({
      title: memory.title,
      content: memory.content,
      type: memory.type,
    })
  }

  const cancelEditing = () => {
    setEditingMemory(null)
    setFormData({ title: "", content: "", type: "context" })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Memory Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage Thea's memory of your personal information, preferences, and documents. Information stored here will
            be remembered across all conversations.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl p-6">
            <DialogHeader>
              <DialogTitle>Create New Memory</DialogTitle>
              <DialogDescription>
                Add information for Thea to remember across conversations. This will be stored permanently and used to
                provide personalized responses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., My Resume, Project Preferences, Client Communication Style"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Memory["type"]) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resume">Resume - Professional background and experience</SelectItem>
                    <SelectItem value="document">Document - Important files and references</SelectItem>
                    <SelectItem value="preference">Preference - Personal and work preferences</SelectItem>
                    <SelectItem value="context">Context - General information and background</SelectItem>
                    <SelectItem value="file">File - Specific files and attachments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the information you want Thea to remember. Be as detailed as possible for better context in conversations."
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMemory}>Create Memory</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="context">Context</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || typeFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setTypeFilter("all")
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{memories.length}</p>
                <p className="text-sm text-muted-foreground">Total Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(memoryTypeIcons).map(([type, Icon]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold">{memories.filter((m) => m.type === type).length}</p>
                  <p className="text-sm text-muted-foreground capitalize">{type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || typeFilter !== "all" ? "No memories found" : "No memories yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first memory to help Thea remember important information about you across conversations"}
            </p>
            {!searchQuery && typeFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Memory
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMemories.map((memory) => {
            const Icon = memoryTypeIcons[memory.type]
            return (
              <Card key={memory.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg truncate">{memory.title}</CardTitle>
                    </div>
                    <Badge className={cn("text-xs", memoryTypeColors[memory.type])}>{memory.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{memory.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(memory.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEditing(memory)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Memory</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{memory.title}"? This action cannot be undone and Thea
                              will no longer remember this information.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMemory(memory.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMemory} onOpenChange={(open) => !open && cancelEditing()}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
            <DialogDescription>Update the information for Thea to remember</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Memory["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="context">Context</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMemory}>Update Memory</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
