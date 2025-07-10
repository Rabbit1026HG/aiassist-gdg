"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle, X } from "lucide-react"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PasswordRequirement {
  id: string
  text: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    text: "More than 6 characters",
    test: (password: string) => password.length > 6,
  },
  {
    id: "lowercase",
    text: "At least one lowercase letter (a-z)",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    text: "At least one uppercase letter (A-Z)",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    text: "At least one number (0-9)",
    test: (password: string) => /[0-9]/.test(password),
  },
]

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = (password: string) => {
    return passwordRequirements.every((req) => req.test(password))
  }

  const getPasswordStrength = (password: string) => {
    const passedRequirements = passwordRequirements.filter((req) => req.test(password)).length
    const percentage = (passedRequirements / passwordRequirements.length) * 100

    if (percentage === 0) return { strength: 0, text: "Very Weak", color: "bg-red-500" }
    if (percentage <= 25) return { strength: 1, text: "Weak", color: "bg-red-400" }
    if (percentage <= 50) return { strength: 2, text: "Fair", color: "bg-orange-500" }
    if (percentage <= 75) return { strength: 3, text: "Good", color: "bg-yellow-500" }
    return { strength: 4, text: "Strong", color: "bg-green-500" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Client-side validation
    if (!validatePassword(newPassword)) {
      setError("New password does not meet all requirements")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password")
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting password change request...")

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      console.log("Password change response:", { status: response.status, data })

      if (response.ok) {
        console.log("Password changed successfully")
        setSuccess(true)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")

        // Auto-close after 2 seconds
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
        }, 2000)
      } else {
        console.error("Password change failed:", data)
        setError(data.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Password change network error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return // Prevent closing during loading

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    onOpenChange(false)
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const isPasswordValid = validatePassword(newPassword)
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] px-6 py-8 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isLoading}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength <= 1
                          ? "text-red-600"
                          : passwordStrength.strength <= 2
                            ? "text-orange-600"
                            : passwordStrength.strength <= 3
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {doPasswordsMatch ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-muted-foreground space-y-2 bg-muted p-4 rounded-md">
              <p className="font-medium text-sm">Password Requirements:</p>
              <div className="grid gap-2">
                {passwordRequirements.map((requirement) => {
                  const isPassed = newPassword ? requirement.test(newPassword) : false
                  return (
                    <div key={requirement.id} className="flex items-center gap-2">
                      {isPassed ? (
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-gray-300 flex-shrink-0" />
                      )}
                      <span className={isPassed ? "text-green-600" : "text-gray-600"}>{requirement.text}</span>
                    </div>
                  )
                })}
                <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200">
                  {doPasswordsMatch ? (
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-gray-300 flex-shrink-0" />
                  )}
                  <span className={doPasswordsMatch ? "text-green-600" : "text-gray-600"}>Passwords must match</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentPassword !== newPassword || !newPassword ? (
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                  )}
                  <span className={currentPassword !== newPassword || !newPassword ? "text-green-600" : "text-red-600"}>
                    Must be different from current password
                  </span>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Password changed successfully! Your new password has been saved to cloud storage. Closing dialog...
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                !isPasswordValid ||
                !doPasswordsMatch ||
                currentPassword === newPassword
              }
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
