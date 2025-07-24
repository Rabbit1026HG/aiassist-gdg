import { type NextRequest, NextResponse } from "next/server"
import { memoryService } from "@/lib/memory-service"

const FIXED_USER_ID = "00000000-0000-0000-0000-000000001026"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const memory = await memoryService.getMemory(FIXED_USER_ID, params.id)

    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    return NextResponse.json({ memory })
  } catch (error) {
    console.error("Error fetching memory:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch memory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, content, type, metadata } = body

    const memory = await memoryService.updateMemory(FIXED_USER_ID, params.id, {
      title,
      content,
      type,
      metadata,
    })

    return NextResponse.json({ memory })
  } catch (error) {
    console.error("Error updating memory:", error)
    return NextResponse.json(
      {
        error: "Failed to update memory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await memoryService.deleteMemory(FIXED_USER_ID, params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting memory:", error)
    return NextResponse.json(
      {
        error: "Failed to delete memory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
