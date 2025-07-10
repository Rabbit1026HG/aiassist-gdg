import { pantryService } from "@/lib/pantry-service";
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await pantryService.initializePantry()
    const users = await pantryService.getUsers()

    return NextResponse.json({
      success: true,
      message: "Pantry initialized successfully",
      userCount: users.length,
      users: users.map((u) => ({ id: u.id, email: u.email, name: u.name })), // Don't return passwords
    })
  } catch (error) {
    console.error("Pantry initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize Pantry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const users = await pantryService.getUsers()

    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })), // Don't return passwords
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
