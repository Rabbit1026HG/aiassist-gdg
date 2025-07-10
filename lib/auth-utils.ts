import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  name: string
}

// Simple Base64 encoding/decoding for tokens
function encodeToken(user: User): string {
  const payload = {
    user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString())
    if (payload.exp < Date.now()) {
      return null // Token expired
    }
    return payload.user
  } catch {
    return null
  }
}

export function setAuthCookie(user: User) {
  const token = encodeToken(user)

  return {
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  }
}

export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  return decodeToken(token)
}

export function clearAuthCookie() {
  return {
    name: "auth-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  }
}

export function getRequestUser(request: NextRequest): User | null {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  return decodeToken(token)
}
