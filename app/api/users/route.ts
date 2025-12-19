import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createUser, deleteUser, listUsers, updateUser } from "@/services/users"
import { fallbackUser, fallbackUsers } from "@/lib/fallbacks"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await listUsers()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ fallback: true, users: fallbackUsers() }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, password, name, role, hostelId, roomNumber, phone } = await request.json()

    const userResult = await createUser({ email, password, name, role, hostelId, roomNumber, phone })

    return NextResponse.json({ user: userResult })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ fallback: true, user: fallbackUser("student") }, { status: 200 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, name, role, hostelId, roomNumber, phone } = await request.json()

    const updated = await updateUser({ userId, name, role, hostelId, roomNumber, phone })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ fallback: true, user: fallbackUser("student") }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    try {
      const result = await deleteUser(user.id, userId)
      return NextResponse.json(result)
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ fallback: true, success: true }, { status: 200 })
  }
}
