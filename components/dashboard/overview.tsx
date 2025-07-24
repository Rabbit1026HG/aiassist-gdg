"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Brain, TrendingUp, Settings, ChevronRight, Activity, Zap } from "lucide-react"
import Link from "next/link"
import { Progress } from "../ui/progress"

interface DashboardStats {
  totalConversations: number
  totalMessages: number
  totalMemories: number
  upcomingEvents: number
  activeProjects: number
  recentActivity: Array<{
    id: string
    type: "conversation" | "memory" | "calendar" | "setting"
    title: string
    timestamp: string
    description?: string
  }>
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    totalMessages: 0,
    totalMemories: 0,
    upcomingEvents: 0,
    activeProjects: 3,
    recentActivity: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load conversations
      const conversationsResponse = await fetch("/api/conversations")
      const conversationsData = await conversationsResponse.json()
      const conversations = conversationsData.conversations || []

      // Load memories
      const memoriesResponse = await fetch("/api/memory")
      const memoriesData = await memoriesResponse.json()
      const memories = memoriesData.memories || []

      // Load calendar events
      const eventsResponse = await fetch("/api/calendar/events")
      const eventsData = await eventsResponse.json()
      const events = eventsData.events || []

      // Calculate total messages
      let totalMessages = 0
      for (const conversation of conversations) {
        try {
          const messagesResponse = await fetch(`/api/conversations/${conversation.id}/messages`)
          const messagesData = await messagesResponse.json()
          totalMessages += messagesData.messages?.length || 0
        } catch (error) {
          console.error("Error loading messages for conversation:", conversation.id, error)
        }
      }

      // Generate recent activity
      const recentActivity = [
        ...conversations.slice(0, 3).map((conv: any) => ({
          id: conv.id,
          type: "conversation" as const,
          title: conv.title || "New Conversation",
          timestamp: conv.updated_at || conv.created_at,
          description: "Chat conversation",
        })),
        ...memories.slice(0, 2).map((memory: any) => ({
          id: memory.id,
          type: "memory" as const,
          title: memory.title,
          timestamp: memory.updated_at || memory.created_at,
          description: `${memory.type} memory`,
        })),
        ...events.slice(0, 2).map((event: any) => ({
          id: event.id,
          type: "calendar" as const,
          title: event.title || event.summary,
          timestamp: event.start?.dateTime || event.start?.date,
          description: "Calendar event",
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)

      setStats({
        totalConversations: conversations.length,
        totalMessages,
        totalMemories: memories.length,
        upcomingEvents: events.filter((event: any) => new Date(event.start?.dateTime || event.start?.date) > new Date())
          .length,
        activeProjects: 3, // Static for now
        recentActivity,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="h-4 w-4" />
      case "memory":
        return <Brain className="h-4 w-4" />
      case "calendar":
        return <Calendar className="h-4 w-4" />
      case "setting":
        return <Settings className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, George!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your AI assistant today. Thea has been learning and remembering your preferences
          to provide better assistance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">{stats.totalMessages} total messages exchanged</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stored Memories</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemories}</div>
            <p className="text-xs text-muted-foreground">Information Thea remembers about you</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Events in your calendar</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Legal cases and projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest interactions with Thea and the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity. Start a conversation with Thea or add some memories!
                </p>
              ) : (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/chat">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start New Chat
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/dashboard/memory">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Brain className="h-4 w-4 mr-2" />
                Manage Memories
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Settings
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current status of Thea's capabilities and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory System</span>
                <Badge variant="default">Active</Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">{stats.totalMemories} memories stored and accessible</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chat Interface</span>
                <Badge variant="default">Online</Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">Ready for conversations with contextual memory</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calendar Integration</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">Google Calendar integration ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
