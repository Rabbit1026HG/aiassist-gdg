// Pantry API service for persistent user storage
interface PantryUser {
  id: string
  email: string
  name: string
  password: string
  createdAt: string
  updatedAt: string
}

interface PantryResponse {
  users: PantryUser[]
}

class PantryService {
  private readonly pantryId = "f6ec16e4-a28f-4233-b7a5-abcdb9bcc574" // Replace with your Pantry ID
  private readonly basketName = "ai_assistant_users"
  private readonly baseUrl = `https://getpantry.cloud/apiv1/pantry/${this.pantryId}/basket/${this.basketName}`

  async getUsers(): Promise<PantryUser[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 400) {
          // Basket doesn't exist, return default users
          return this.getDefaultUsers()
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: PantryResponse = await response.json()
      return data.users || this.getDefaultUsers()
    } catch (error) {
      console.error("Error fetching users from Pantry:", error)
      // Return default users if Pantry is unavailable
      return this.getDefaultUsers()
    }
  }

  async saveUsers(users: PantryUser[]): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error("Error saving users to Pantry:", error)
      return false
    }
  }

  async findUserByEmail(email: string): Promise<PantryUser | null> {
    const users = await this.getUsers()
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
  }

  async findUserById(id: string): Promise<PantryUser | null> {
    const users = await this.getUsers()
    return users.find((user) => user.id === id) || null
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const users = await this.getUsers()
      const userIndex = users.findIndex((user) => user.id === userId)

      if (userIndex === -1) {
        return false
      }

      users[userIndex] = {
        ...users[userIndex],
        password: newPassword,
        updatedAt: new Date().toISOString(),
      }

      return await this.saveUsers(users)
    } catch (error) {
      console.error("Error updating user password:", error)
      return false
    }
  }

  async validateCredentials(email: string, password: string): Promise<PantryUser | null> {
    const user = await this.findUserByEmail(email)
    if (!user || user.password !== password) {
      return null
    }
    return user
  }

  private getDefaultUsers(): PantryUser[] {
    const now = new Date().toISOString()
    return [
      {
        id: "1",
        email: "rabbit1026hg@gmail.com",
        name: "Rabbit User",
        password: "test!@#123",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "2",
        email: "George@GDGreenberglaw.com",
        name: "George Greenberg",
        password: "test!@#123",
        createdAt: now,
        updatedAt: now,
      },
    ]
  }

  // Initialize Pantry with default users if it's empty
  async initializePantry(): Promise<void> {
    try {
      const users = await this.getUsers()
      if (users.length === 0) {
        await this.saveUsers(this.getDefaultUsers())
        console.log("Initialized Pantry with default users")
      }
    } catch (error) {
      console.error("Error initializing Pantry:", error)
    }
  }
}

export const pantryService = new PantryService()
