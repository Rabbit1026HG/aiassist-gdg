"use client"

import type React from "react"

import { useEffect } from "react"
import { useAtom } from "jotai"
import { authUserAtom, authLoadingAtom } from "@/lib/auth-atoms"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setUser] = useAtom(authUserAtom)
  const [, setLoading] = useAtom(authLoadingAtom)

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const { user } = await response.json()
          setUser(user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [setUser, setLoading])

  return <>{children}</>
}
