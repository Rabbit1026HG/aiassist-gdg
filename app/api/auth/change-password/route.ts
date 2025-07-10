import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser, changeUserPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error: "Current password and new password are required",
        },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "New password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error: "New password must be different from current password",
        },
        { status: 400 },
      )
    }

    console.log("Attempting to change password for user:", user.id)

    const success = await changeUserPassword(user.id, currentPassword, newPassword)

    if (!success) {
      console.log("Password change failed for user:", user.id)
      return NextResponse.json(
        {
          error: "Current password is incorrect or update failed",
        },
        { status: 400 },
      )
    }

    console.log("Password changed successfully for user:", user.id)

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
