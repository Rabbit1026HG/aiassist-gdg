"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle2, Clock, Mic, Plus, Send, Sparkles, TrendingUp, Zap } from "lucide-react"
import { useState } from "react"

export function DashboardOverview() {
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setInputValue("Schedule a meeting with the design team tomorrow at 10 AM")
        setIsRecording(false)
      }, 2000)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Welcome back! Here's your productivity overview.</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="modern-card hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Tasks Today</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">5</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />2 completed, 3 remaining
            </p>
          </CardContent>
        </Card>

        <Card className="modern-card hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Upcoming Meetings</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Next: Design Team at 10:00 AM</p>
          </CardContent>
        </Card>

        <Card className="modern-card hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">Reminders</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">2</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit report by 5:00 PM</p>
          </CardContent>
        </Card>

        <Card className="modern-card hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">AI Suggestions</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">4</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on your schedule</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger
            value="tasks"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
          >
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    id: "task1",
                    text: "Prepare presentation for client meeting",
                    time: "Today, 2:00 PM",
                    completed: false,
                  },
                  { id: "task2", text: "Review quarterly report draft", time: "Today, 4:00 PM", completed: false },
                  { id: "task3", text: "Submit expense reports", time: "Today, 5:00 PM", completed: false },
                  { id: "task4", text: "Schedule team meeting", time: "Completed", completed: true },
                  { id: "task5", text: "Send project update email", time: "Completed", completed: true },
                ].map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={task.id}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      checked={task.completed}
                      readOnly
                    />
                    <label htmlFor={task.id} className={cn("flex-1", task.completed && "line-through text-slate-500")}>
                      {task.text}
                    </label>
                    <span className={cn("text-sm", task.completed ? "text-emerald-600" : "text-slate-500")}>
                      {task.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    date: "12",
                    month: "JUN",
                    title: "Design Team Meeting",
                    time: "10:00 AM - 11:00 AM",
                    color: "violet",
                  },
                  {
                    date: "12",
                    month: "JUN",
                    title: "Client Presentation",
                    time: "2:00 PM - 3:30 PM",
                    color: "emerald",
                  },
                  { date: "13", month: "JUN", title: "Weekly Team Sync", time: "9:00 AM - 10:00 AM", color: "amber" },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-14 w-14 flex-col items-center justify-center rounded-xl text-white font-bold",
                        event.color === "violet" && "bg-gradient-to-r from-violet-500 to-purple-500",
                        event.color === "emerald" && "bg-gradient-to-r from-emerald-500 to-teal-500",
                        event.color === "amber" && "bg-gradient-to-r from-amber-500 to-orange-500",
                      )}
                    >
                      <span className="text-xs">{event.month}</span>
                      <span className="text-lg">{event.date}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    title: "Prepare for Design Meeting",
                    description:
                      "You have a design team meeting tomorrow. Would you like me to gather the latest design files and prepare an agenda?",
                    color: "violet",
                  },
                  {
                    title: "Schedule Break Time",
                    description:
                      "You have back-to-back meetings today. Would you like me to schedule a 15-minute break between them?",
                    color: "emerald",
                  },
                  {
                    title: "Quarterly Report Reminder",
                    description:
                      "The quarterly report is due in 2 days. Would you like me to send a reminder to the team?",
                    color: "amber",
                  },
                ].map((suggestion, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 p-4 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                          suggestion.color === "violet" && "bg-gradient-to-r from-violet-500 to-purple-500",
                          suggestion.color === "emerald" && "bg-gradient-to-r from-emerald-500 to-teal-500",
                          suggestion.color === "amber" && "bg-gradient-to-r from-amber-500 to-orange-500",
                        )}
                      >
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{suggestion.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{suggestion.description}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white"
                          >
                            Yes, please
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600">
                            No, thanks
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-violet-50 to-emerald-50 dark:from-violet-900/20 dark:to-emerald-900/20 p-4 border border-violet-200 dark:border-violet-700">
              <p className="text-slate-700 dark:text-slate-300">
                Good morning! I see you have a design team meeting scheduled for tomorrow at 10:00 AM. Would you like me
                to prepare an agenda or gather any materials for this meeting?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 pr-12 text-sm focus:border-violet-500 dark:focus:border-violet-400 focus:outline-none transition-colors"
                  placeholder="Type a message or use voice input..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 hover:bg-violet-100 dark:hover:bg-violet-900/20"
                  onClick={handleVoiceInput}
                >
                  <Mic className={cn("h-4 w-4", isRecording && "text-red-500 animate-pulse")} />
                </Button>
              </div>
              <Button className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 px-6">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
