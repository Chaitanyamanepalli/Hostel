import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { fallbackAuthUser } from "@/lib/fallbacks"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Get hostel info if user has one
    let hostel = null
    if (user.hostel_id) {
      hostel = db.prepare(`SELECT * FROM hostels WHERE id = ?`).get(user.hostel_id) || null
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostel_id: user.hostel_id,
        room_number: user.room_number,
        phone: user.phone,
        email_notifications: user.email_notifications,
        hostel,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ fallback: true, ...fallbackAuthUser() })
  }
}
