import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"
import { notifyAllAdmins, notifyWarden } from "@/lib/notifications"
import { fallbackSignupUser } from "@/lib/fallbacks"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, hostelId, roomNumber, phone } = await request.json()

    // Check if email exists
    const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).all(email)
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const userId = randomUUID()

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, hostel_id, room_number, phone)
      VALUES (?, ?, ?, ?, 'student', ?, ?, ?)
    `).run(userId, email, passwordHash, name, hostelId, roomNumber, phone || null)

    const user = db.prepare(`SELECT id, email, name, role, hostel_id, room_number FROM users WHERE id = ?`).get(userId) as any
    await createSession(user.id)

    // Notify warden and admins about new registration
    if (hostelId) {
      await notifyWarden(
        hostelId,
        "New Student Registration",
        `${name} has registered for room ${roomNumber}`,
        "account",
        "/warden",
      )
    }

    await notifyAllAdmins(
      "New User Registration",
      `New student ${name} (${email}) has registered`,
      "account",
      "/admin/users",
    )

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ fallback: true, ...fallbackSignupUser() }, { status: 200 })
  }
}
