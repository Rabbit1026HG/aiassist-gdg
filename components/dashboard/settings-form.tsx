"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { User, Shield, Database, Trash2, Download, Save, Calendar } from "lucide-react"
import { chatStorage } from "@/lib/chat-storage"

interface UserSettings {
  notifications: boolean
  dataCollection: boolean
  conversationHistory: boolean
}

export function SettingsForm() {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    dataCollection: true,
    conversationHistory: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [calendarStatus, setCalendarStatus] = useState<{ isAuthenticated: boolean; email?: string }>({
    isAuthenticated: false,
  })
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
    checkCalendarStatus()
  }, [])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("user-settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem("user-settings", JSON.stringify(settings))
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkCalendarStatus = async () => {
    try {
      const response = await fetch("/api/calendar/auth/status")
      const data = await response.json()
      setCalendarStatus(data)
    } catch (error) {
      console.error("Error checking calendar status:", error)
    }
  }

  const handleCalendarConnect = async () => {
    try {
      window.location.href = "/api/calendar/auth"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to calendar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCalendarDisconnect = async () => {
    try {
      await fetch("/api/calendar/auth/logout", { method: "POST" })
      setCalendarStatus({ isAuthenticated: false })
      toast({
        title: "Calendar disconnected",
        description: "Your Google Calendar has been disconnected.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect calendar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportData = async () => {
    setIsLoading(true)
    try {
      const conversations = await chatStorage.getConversations()
      const allData = []

      for (const conversation of conversations) {
        const messages = await chatStorage.getMessages(conversation.id)
        allData.push({
          conversation,
          messages,
        })
      }

      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `thea-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAllData = async () => {
    if (!confirm("Are you sure you want to delete all your conversation data? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const conversations = await chatStorage.getConversations()
      for (const conversation of conversations) {
        await chatStorage.deleteConversation(conversation.id)
      }

      toast({
        title: "Data deleted",
        description: "All your conversation data has been deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 -m-8 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border-0 p-1 rounded-2xl">
            <TabsTrigger
              value="general"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Account Information
                </CardTitle>
                <CardDescription>Your personal account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || "User"}</h3>
                      <p className="text-slate-600 dark:text-slate-300">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <div>
                      <Label className="text-base font-medium">Theme</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Choose your preferred theme</p>
                    </div>
                    <ModeToggle />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <div>
                      <Label className="text-base font-medium">Browser Notifications</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Receive notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={saveSettings}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Google Calendar
                </CardTitle>
                <CardDescription>Connect your Google Calendar to manage events with AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {calendarStatus.isAuthenticated ? "Connected" : "Not Connected"}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {calendarStatus.isAuthenticated
                            ? `Connected as ${calendarStatus.email || "Google Account"}`
                            : "Connect to manage calendar events with AI"}
                        </p>
                      </div>
                    </div>
                    {calendarStatus.isAuthenticated ? (
                      <Button
                        onClick={handleCalendarDisconnect}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCalendarConnect}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control how your data is used and stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <div>
                      <Label className="text-base font-medium">Usage Analytics</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Help improve the service by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={settings.dataCollection}
                      onCheckedChange={(checked) => setSettings({ ...settings, dataCollection: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <div>
                      <Label className="text-base font-medium">Conversation History</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Store conversation history for better AI assistance
                      </p>
                    </div>
                    <Switch
                      checked={settings.conversationHistory}
                      onCheckedChange={(checked) => setSettings({ ...settings, conversationHistory: checked })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={saveSettings}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  Data Management
                </CardTitle>
                <CardDescription>Export or delete your personal data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-amber-800 dark:text-amber-200">Export Data</Label>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Download all your conversations and data
                      </p>
                    </div>
                    <Button
                      onClick={exportData}
                      disabled={isLoading}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 bg-transparent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-red-800 dark:text-red-200">Delete All Data</Label>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Permanently delete all your conversations and data
                      </p>
                    </div>
                    <Button
                      onClick={deleteAllData}
                      disabled={isLoading}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
