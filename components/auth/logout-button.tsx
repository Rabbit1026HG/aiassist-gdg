"use client"

import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { Button } from "@/components/ui/button"
import { authUserAtom } from "@/lib/auth-atoms"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function LogoutButton({ size = "default", variant = "ghost" }: LogoutButtonProps) {
  const [, setUser] = useAtom(authUserAtom)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
