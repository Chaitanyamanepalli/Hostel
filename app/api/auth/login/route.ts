import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { fallbackLoginUser } from "@/lib/fallbacks"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as any

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostel_id: user.hostel_id,
        room_number: user.room_number,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({ fallback: true, ...fallbackLoginUser(), error: `login-failed: ${message}`, stack }, { status: 200 })
  }
}
