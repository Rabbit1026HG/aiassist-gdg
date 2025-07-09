import type { User } from "./auth"

export function isAuthorizedEmail(email: string): boolean {
  const authorizedEmails = ["rabbit1026hg@gmail.com", "George@GDGreenberglaw.com"]

  return authorizedEmails.some((authorizedEmail) => authorizedEmail.toLowerCase() === email.toLowerCase())
}

export function createGoogleUser(email: string, name: string): User {
  return {
    id: email === "rabbit1026hg@gmail.com" ? "1" : "2",
    email,
    name,
    provider: "google",
  }
}
