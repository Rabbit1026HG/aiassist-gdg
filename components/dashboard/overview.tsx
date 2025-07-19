"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Zap,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"
import { chatStorage } from "@/lib/chat-storage"
import { useAuth } from "@/components/auth/auth-provider"
import type { Conversation } from "@/lib/types/chat"
import Link from "next/link"

interface DashboardStats {
  totalConversations: number
  totalMessages: number
  todayMessages: number
  weekMessages: number
  recentConversations: Conversation[]
  systemStatus: {
    database: boolean
    ai: boolean
    calendar: boolean
  }
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    totalMessages: 0,
    todayMessages: 0,
    weekMessages: 0,
    recentConversations: [],
    systemStatus: {
      database: true,
      ai: true,
      calendar: true,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { user } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load real chat data
      const conversations = await chatStorage.getConversations()

      // Calculate statistics
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      let totalMessages = 0
      let todayMessages = 0
      let weekMessages = 0

      // Get message counts for each conversation
      for (const conversation of conversations) {
        const messages = await chatStorage.getMessages(conversation.id)
        totalMessages += messages.length

        // Count messages from today
        const todayMsgs = messages.filter((msg) => new Date(msg.createdAt) >= today).length
        todayMessages += todayMsgs

        // Count messages from this week
        const weekMsgs = messages.filter((msg) => new Date(msg.createdAt) >= weekAgo).length
        weekMessages += weekMsgs
      }

      // Check system status
      const systemStatus = await checkSystemStatus()

      setStats({
        totalConversations: conversations.length,
        totalMessages,
        todayMessages,
        weekMessages,
        recentConversations: conversations.slice(0, 5), // Get 5 most recent
        systemStatus,
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      // Set error state but don't crash
      setStats((prev) => ({
        ...prev,
        systemStatus: {
          database: false,
          ai: true,
          calendar: true,
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const checkSystemStatus = async () => {
    const status = {
      database: true,
      ai: true,
      calendar: true,
    }

    try {
      // Test database connection
      await chatStorage.getConversations()
      status.database = true
    } catch {
      status.database = false
    }

    try {
      // Test AI service
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "test" }] }),
      })
      status.ai = response.ok
    } catch {
      status.ai = false
    }

    try {
      // Test calendar auth status
      const response = await fetch("/api/calendar/auth/status")
      const data = await response.json()
      status.calendar = data.isAuthenticated || false
    } catch {
      status.calendar = false
    }

    return status
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good morning"
    if (hour >= 12 && hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityLevel = () => {
    if (stats.todayMessages >= 10)
      return {
        level: "High",
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
      }
    if (stats.todayMessages >= 5)
      return {
        level: "Medium",
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800",
      }
    return {
      level: "Low",
      color: "text-slate-600",
      bg: "bg-slate-50 dark:bg-slate-800/50",
      border: "border-slate-200 dark:border-slate-700",
    }
  }

  const activity = getActivityLevel()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 -m-8 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "George"}!
                </h1>
                <p className="text-white/90 text-lg">{formatDate(new Date())} • Your personal AI assistant dashboard</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalMessages}</div>
                  <div className="text-white/80 text-sm">Total Messages</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.totalConversations}</div>
                  <div className="text-white/80 text-sm">Conversations</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? "..." : stats.totalConversations}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Conversations</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stats.totalMessages} total messages
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? "..." : stats.todayMessages}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Today</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                  activity.bg,
                  activity.color,
                  activity.border,
                )}
              >
                {activity.level} Activity
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? "..." : stats.weekMessages}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">This Week</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-slate-600 dark:text-slate-400">Weekly activity</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        stats.systemStatus.database && stats.systemStatus.ai ? "bg-emerald-500" : "bg-red-500",
                      )}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {stats.systemStatus.database && stats.systemStatus.ai ? "Online" : "Issues"}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-slate-600 dark:text-slate-400">Last checked: {formatTime(lastUpdated)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Conversations */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Recent Conversations
                  </CardTitle>
                  <Button
                    onClick={loadDashboardData}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : stats.recentConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No conversations yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Start your first conversation with Thea</p>
                    <Link href="/dashboard/chat">
                      <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Chatting
                      </Button>
                    </Link>
                  </div>
                ) : (
                  stats.recentConversations.map((conversation) => (
                    <Link key={conversation.id} href="/dashboard/chat">
                      <div className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer border border-transparent hover:border-violet-200 dark:hover:border-violet-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                              {conversation.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {conversation.messageCount} messages •{" "}
                              {new Date(conversation.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 group-hover:text-violet-500 transition-colors">
                            <span className="text-xs">{formatTime(new Date(conversation.updatedAt))}</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/chat">
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">New Chat</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Start conversation</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/calendar">
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Calendar</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Manage events</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/settings">
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Settings</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Account preferences</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        stats.systemStatus.database ? "bg-emerald-500" : "bg-red-500",
                      )}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Database</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      stats.systemStatus.database
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                    )}
                  >
                    {stats.systemStatus.database ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn("w-2 h-2 rounded-full", stats.systemStatus.ai ? "bg-emerald-500" : "bg-red-500")}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">AI Service</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      stats.systemStatus.ai
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                    )}
                  >
                    {stats.systemStatus.ai ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        stats.systemStatus.calendar ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Calendar</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      stats.systemStatus.calendar
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                    )}
                  >
                    {stats.systemStatus.calendar ? "Connected" : "Not Connected"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
