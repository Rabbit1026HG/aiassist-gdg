import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  name: string
  provider: "email" | "google"
}

// Static user data
const STATIC_USERS: User[] = [
  {
    id: "1",
    email: "rabbit1026hg@gmail.com",
    name: "Development User",
    provider: "email",
  },
  {
    id: "2",
    email: "George@GDGreenberglaw.com",
    name: "George Greenberg",
    provider: "email",
  },
]

export function findUserByEmail(email: string): User | null {
  return STATIC_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

export function validatePassword(email: string, password: string): boolean {
  const user = findUserByEmail(email)
  if (!user) return false

  // Simple password validation for development
  return password === "test!@#123"
}

export function createToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    provider: user.provider,
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
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      provider: payload.provider,
    }
  } catch {
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
