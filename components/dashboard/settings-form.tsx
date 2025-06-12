"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"

export function SettingsForm() {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [proactiveReminders, setProactiveReminders] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [calendarIntegration, setCalendarIntegration] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks and feels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred theme.</p>
                </div>
                <ModeToggle />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred language.</p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interaction Preferences</CardTitle>
              <CardDescription>Customize how you interact with the AI assistant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice">Voice Input</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable voice input functionality.</p>
                </div>
                <Switch id="voice" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reminders">Proactive Reminders</Label>
                  <p className="text-sm text-muted-foreground">Allow the assistant to send proactive reminders.</p>
                </div>
                <Switch id="reminders" checked={proactiveReminders} onCheckedChange={setProactiveReminders} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tone">Assistant Tone</Label>
                  <p className="text-sm text-muted-foreground">Choose the tone of the AI assistant.</p>
                </div>
                <Select defaultValue="formal">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>Manage your connected services and integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Google Calendar</Label>
                  <p className="text-sm text-muted-foreground">Connect to manage your calendar events.</p>
                </div>
                <Switch checked={calendarIntegration} onCheckedChange={setCalendarIntegration} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">Connect to send and receive emails.</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Cloud Storage</Label>
                  <p className="text-sm text-muted-foreground">Connect to access your files.</p>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notification Frequency</Label>
                  <p className="text-sm text-muted-foreground">How often you want to receive notifications.</p>
                </div>
                <Select defaultValue="immediate">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy and data settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow collection of usage data to improve the service.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Conversation History</Label>
                  <p className="text-sm text-muted-foreground">Store conversation history for better assistance.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Third-Party Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share data with third-party services.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your personal data stored in the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground mb-2">Download all your data in a portable format.</p>
                <Button variant="outline">Export All Data</Button>
              </div>
              <div>
                <Label>Delete Data</Label>
                <p className="text-sm text-muted-foreground mb-2">Permanently delete all your data from our servers.</p>
                <Button variant="destructive">Delete All Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
