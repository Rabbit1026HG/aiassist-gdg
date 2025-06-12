"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Mail, CheckCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function MagicLinkForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sending magic link email
    setTimeout(() => {
      setIsLoading(false)
      setEmailSent(true)

      // For demo purposes, automatically "login" after 3 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    }, 1500)
  }

  const handleDirectLogin = () => {
    // For demo purposes, allow direct login
    router.push("/dashboard")
  }

  if (emailSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-violet-950 dark:via-slate-900 dark:to-emerald-950">
        <Card className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
              Check your email
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              We've sent a magic link to <strong className="text-violet-600 dark:text-violet-400">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-100 to-emerald-100 dark:from-violet-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <Mail className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Click the link in your email to sign in
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The link will expire in 15 minutes for security
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                className="w-full border-2 border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                onClick={() => setEmailSent(false)}
              >
                Use different email
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDirectLogin}
                className="w-full text-sm text-slate-500 hover:text-violet-600"
              >
                Demo: Skip and login directly
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-violet-950 dark:via-slate-900 dark:to-emerald-950">
      <Card className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/5">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Enter your email address and we'll send you a secure magic link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending magic link...
                </div>
              ) : (
                "Send magic link"
              )}
            </Button>
            <div className="text-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDirectLogin}
                className="text-sm text-slate-500 hover:text-violet-600"
              >
                Demo: Skip and login directly
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
