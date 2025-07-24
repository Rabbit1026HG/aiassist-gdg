import { type NextRequest, NextResponse } from "next/server"
import { memoryService } from "@/lib/memory-service"

// Using a fixed user ID for development
const FIXED_USER_ID = "00000000-0000-0000-0000-000000001026"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as any
    const search = searchParams.get("search")

    let memories
    if (search) {
      memories = await memoryService.searchMemories(FIXED_USER_ID, search, { type })
    } else {
      memories = await memoryService.getMemories(FIXED_USER_ID, type)
    }

    return NextResponse.json({ memories })
  } catch (error) {
    console.error("Error fetching memories:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch memories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, type, metadata } = body

    if (!title || !content || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const memory = await memoryService.createMemory(FIXED_USER_ID, {
      title,
      content,
      type,
      metadata,
    })

    return NextResponse.json({ memory }, { status: 201 })
  } catch (error) {
    console.error("Error creating memory:", error)
    return NextResponse.json(
      {
        error: "Failed to create memory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
