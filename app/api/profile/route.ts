import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth"
import { db } from "@/lib/db"
import { fallbackProfile } from "@/lib/fallbacks"

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, phone, emailNotifications, currentPassword, newPassword } = await request.json()

    // If changing password, verify current password
    if (newPassword) {
      const valid = await verifyPassword(currentPassword, user.password_hash)
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      const newHash = await hashPassword(newPassword)
      db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, user.id)
    }

    db.prepare(`
      UPDATE users 
      SET 
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email_notifications = COALESCE(?, email_notifications),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name, phone, emailNotifications, user.id)

    const result = db.prepare(`SELECT id, email, name, role, hostel_id, room_number, phone, email_notifications FROM users WHERE id = ?`).get(user.id)

    return NextResponse.json({ user: result })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ fallback: true, ...fallbackProfile() }, { status: 200 })
  }
}
