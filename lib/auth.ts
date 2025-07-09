// Static user data - no database needed
export interface User {
  id: string
  email: string
  name: string
  password: string
}

export const STATIC_USERS: User[] = [
  {
    id: "1",
    email: "rabbit1026hg@gmail.com",
    name: "Development User",
    password: "test!@#123",
  },
  {
    id: "2",
    email: "George@GDGreenberglaw.com",
    name: "George Greenberg",
    password: "test!@#123",
  },
]

// Simple token utilities without JWT dependencies
export function createToken(user: User): string {
  const payload = {
    userId: user.id,
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
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      password: "", // Don't include password in verified token
    }
  } catch {
    return null
  }
}

export function authenticateUser(email: string, password: string): User | null {
  const user = STATIC_USERS.find((u) => u.email === email && u.password === password)
  return user || null
}

export function findUserByEmail(email: string): User | null {
  return STATIC_USERS.find((u) => u.email === email) || null
}
