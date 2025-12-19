import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { listNotifications, markNotifications } from "@/services/notifications"
import { fallbackNotifications } from "@/lib/fallbacks"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notifications, unreadCount } = await listNotifications(user.id)

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ fallback: true, ...fallbackNotifications() }, { status: 200 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, markAllRead } = await request.json()

    const result = await markNotifications(user.id, notificationId, markAllRead)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update notification error:", error)
    return NextResponse.json({ fallback: true, ...fallbackNotifications() }, { status: 200 })
  }
}
