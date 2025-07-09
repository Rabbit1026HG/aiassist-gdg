"use client"

import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { Button } from "@/components/ui/button"
import { authUserAtom } from "@/lib/auth-atoms"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  size?: "sm" | "default" | "lg"
}

export function LogoutButton({ size = "default" }: LogoutButtonProps) {
  const [, setUser] = useAtom(authUserAtom)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Button variant="ghost" size={size === "sm" ? "sm" : "icon"} onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      {size === "sm" && <span className="ml-2">Logout</span>}
    </Button>
  )
}
