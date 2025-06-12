"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Loader2 } from "lucide-react"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    // Simulate token verification
    if (token) {
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } else {
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-emerald-50 dark:from-violet-950 dark:via-slate-900 dark:to-emerald-950">
      <Card className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/5">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Brain className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-violet-600 to-emerald-600 bg-clip-text text-transparent">
            {token ? "Signing you in..." : "Invalid link"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {token ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                Please wait while we verify your magic link and sign you in.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
              This magic link is invalid or has expired. You'll be redirected to the login page.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
