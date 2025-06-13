"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Brain, Calendar, MessageSquare, Clock, Shield, Sparkles, Zap, Globe } from "lucide-react"
import Image from "next/image"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      <header className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Thea Logo" width={90}  height={0}  />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-16 md:py-24 lg:py-32">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                AI-Powered Productivity
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Your{" "}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Intelligent
                </span>{" "}
                Assistant
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Transform your daily workflow with AI-powered task management, smart scheduling, and proactive
                reminders. Experience the future of personal productivity.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg"
                  >
                    Get Started
                  </Button>
                </Link>
                
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-emerald-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative modern-card rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI Assistant</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active now</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-violet-50 to-emerald-50 dark:from-violet-900/20 dark:to-emerald-900/20 rounded-2xl p-4">
                    <p className="text-slate-700 dark:text-slate-300">Good morning! Here's your optimized schedule:</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                      <Calendar className="h-5 w-5 text-violet-500" />
                      <span className="text-slate-700 dark:text-slate-300">Design Team Meeting at 10:00 AM</span>
                    </li>
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                      <Clock className="h-5 w-5 text-emerald-500" />
                      <span className="text-slate-700 dark:text-slate-300">Quarterly report due by 5:00 PM</span>
                    </li>
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                      <Zap className="h-5 w-5 text-amber-500" />
                      <span className="text-slate-700 dark:text-slate-300">3 priority emails to review</span>
                    </li>
                  </ul>
                  <div className="bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-emerald-900/20 dark:to-violet-900/20 rounded-2xl p-4">
                    <p className="text-slate-700 dark:text-slate-300">Shall I prepare your meeting materials?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-r from-violet-50 via-white to-emerald-50 dark:from-violet-950/50 dark:via-slate-900 dark:to-emerald-950/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Powerful Features for{" "}
                <span className="bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
                  Modern Productivity
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Experience next-generation AI assistance with cutting-edge features designed for the modern
                professional.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="group modern-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Voice & Text Input</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Seamlessly interact using natural voice commands or text input with advanced speech recognition
                  technology.
                </p>
              </div>

              <div className="group modern-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Smart Calendar</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Intelligent calendar integration with Google Calendar, automatic scheduling, and conflict resolution.
                </p>
              </div>

              <div className="group modern-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Privacy First</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enterprise-grade security with end-to-end encryption and complete control over your personal data.
                </p>
              </div>

              <div className="group modern-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Proactive AI</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Intelligent suggestions and proactive reminders that learn from your patterns and preferences.
                </p>
              </div>

              <div className="group modern-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Lightning Fast</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Optimized performance with instant responses and real-time synchronization across all your devices.
                </p>
              </div>

              <div className="group modern-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Universal Access</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Access your AI assistant anywhere with responsive design and cross-platform compatibility.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Thea Logo" width={65}  height={0} />
          </div>
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              Empowering productivity through intelligent automation
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}