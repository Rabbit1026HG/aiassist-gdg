"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ModeToggle } from "@/components/mode-toggle"
import {
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Calendar,
  Brain,
  Settings,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface SettingsData {
  profile: {
    name: string
    email: string
    bio: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    weeklyDigest: boolean
  }
  privacy: {
    dataCollection: boolean
    analytics: boolean
    shareUsage: boolean
  }
  integrations: {
    googleCalendar: boolean
    googleCalendarStatus: "connected" | "disconnected" | "error"
  }
  memory: {
    totalMemories: number
    autoSave: boolean
    contextWindow: number
  }
}

export function SettingsForm() {
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      name: "George",
      email: "george@example.com",
      bio: "Solo attorney specializing in Wills & Trusts. Passionate about theatre, martial arts, and jazz piano.",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
    },
    privacy: {
      dataCollection: true,
      analytics: false,
      shareUsage: false,
    },
    integrations: {
      googleCalendar: false,
      googleCalendarStatus: "disconnected",
    },
    memory: {
      totalMemories: 0,
      autoSave: true,
      contextWindow: 5,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)

      // Load memory count
      const memoryResponse = await fetch("/api/memory")
      const memoryData = await memoryResponse.json()
      const memoryCount = memoryData.memories?.length || 0

      // Load calendar status
      const calendarResponse = await fetch("/api/calendar/auth/status")
      const calendarData = await calendarResponse.json()

      setSettings((prev) => ({
        ...prev,
        memory: {
          ...prev.memory,
          totalMemories: memoryCount,
        },
        integrations: {
          ...prev.integrations,
          googleCalendar: calendarData.connected || false,
          googleCalendarStatus: calendarData.connected ? "connected" : "disconnected",
        },
      }))
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      // Simulate saving settings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch("/api/calendar/auth")
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error("Error connecting calendar:", error)
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnectCalendar = async () => {
    try {
      await fetch("/api/calendar/auth/logout", { method: "POST" })

      setSettings((prev) => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          googleCalendar: false,
          googleCalendarStatus: "disconnected",
        },
      }))

      toast({
        title: "Calendar disconnected",
        description: "Google Calendar has been disconnected successfully.",
      })
    } catch (error) {
      console.error("Error disconnecting calendar:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = async () => {
    try {
      // Load all data for export
      const [conversationsRes, memoriesRes, eventsRes] = await Promise.all([
        fetch("/api/conversations"),
        fetch("/api/memory"),
        fetch("/api/calendar/events"),
      ])

      const [conversations, memories, events] = await Promise.all([
        conversationsRes.json(),
        memoriesRes.json(),
        eventsRes.json(),
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        conversations: conversations.conversations || [],
        memories: memories.memories || [],
        events: events.events || [],
        settings,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `thea-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllData = async () => {
    if (!confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      return
    }

    try {
      // Delete all memories
      const memoriesResponse = await fetch("/api/memory")
      const memoriesData = await memoriesResponse.json()
      const memories = memoriesData.memories || []

      for (const memory of memories) {
        await fetch(`/api/memory/${memory.id}`, { method: "DELETE" })
      }

      // Delete all conversations
      const conversationsResponse = await fetch("/api/conversations")
      const conversationsData = await conversationsResponse.json()
      const conversations = conversationsData.conversations || []

      for (const conversation of conversations) {
        await fetch(`/api/conversations/${conversation.id}`, { method: "DELETE" })
      }

      toast({
        title: "All data deleted",
        description: "Your data has been permanently deleted.",
      })

      // Reload settings to reflect changes
      loadSettings()
    } catch (error) {
      console.error("Error deleting data:", error)
      toast({
        title: "Error",
        description: "Failed to delete all data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, email: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, bio: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <ModeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushNotifications: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, weeklyDigest: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your privacy and data usage preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow collection of usage data to improve the service</p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataCollection: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Enable analytics to help us understand usage patterns</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Usage Data</Label>
                  <p className="text-sm text-muted-foreground">Share anonymized usage data with third parties</p>
                </div>
                <Switch
                  checked={settings.privacy.shareUsage}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, shareUsage: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>Connect external services to enhance your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">Sync your calendar events with Thea</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={settings.integrations.googleCalendarStatus === "connected" ? "default" : "secondary"}>
                    {settings.integrations.googleCalendarStatus === "connected" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      "Disconnected"
                    )}
                  </Badge>
                  {settings.integrations.googleCalendar ? (
                    <Button variant="outline" size="sm" onClick={handleDisconnectCalendar}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleConnectCalendar}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Memory System</h3>
                    <p className="text-sm text-muted-foreground">{settings.memory.totalMemories} memories stored</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/dashboard/memory">Manage</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export or delete your data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all your conversations, memories, and settings
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
                  <div>
                    <h3 className="font-medium text-destructive">Delete All Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all your conversations, memories, and settings
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAllData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Data Usage Information</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your data is stored securely and used only to provide personalized assistance. We do not share
                      your personal information with third parties without your consent.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
