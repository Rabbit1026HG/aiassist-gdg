import { cookies } from "next/headers"
import { pantryService } from "./pantry-service"

export interface User {
  id: string
  email: string
  name: string
}

export function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export function verifyToken(token: string): User | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())

    if (payload.exp < Date.now()) {
      return null // Token expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    }
  } catch {
    return null
  }
}

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  try {
    const pantryUser = await pantryService.validateCredentials(email, password)
    if (!pantryUser) return null

    return {
      id: pantryUser.id,
      email: pantryUser.email,
      name: pantryUser.name,
    }
  } catch (error) {
    console.error("Error validating credentials:", error)
    return null
  }
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  try {
    // First verify the current password
    const user = await pantryService.findUserById(userId)
    if (!user) {
      console.error("User not found:", userId)
      return false
    }

    if (user.password !== currentPassword) {
      console.error("Current password is incorrect")
      return false
    }

    // Update password in Pantry
    const success = await pantryService.updateUserPassword(userId, newPassword)
    if (success) {
      console.log("Password updated successfully for user:", userId)
    } else {
      console.error("Failed to update password in Pantry")
    }

    return success
  } catch (error) {
    console.error("Error changing password:", error)
    return false
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const pantryUser = await pantryService.findUserByEmail(email)
    if (!pantryUser) return null

    return {
      id: pantryUser.id,
      email: pantryUser.email,
      name: pantryUser.name,
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const pantryUser = await pantryService.findUserById(id)
    if (!pantryUser) return null

    return {
      id: pantryUser.id,
      email: pantryUser.email,
      name: pantryUser.name,
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return verifyToken(token)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

// Initialize Pantry on server startup
export async function initializeAuth() {
  try {
    await pantryService.initializePantry()
  } catch (error) {
    console.error("Failed to initialize auth:", error)
  }
}
