import { db } from "@/lib/db"

export async function listNotifications(userId: string) {
  const notifications = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(userId)

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM notifications 
    WHERE user_id = ? AND read = 0
  `).get(userId) as any

  return { notifications, unreadCount: Number.parseInt(unreadCount?.count?.toString() || "0") }
}

export async function markNotifications(userId: string, notificationId?: string, markAllRead?: boolean) {
  if (markAllRead) {
    db.prepare(`UPDATE notifications SET read = 1 WHERE user_id = ?`).run(userId)
  } else if (notificationId) {
    db.prepare(`UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`).run(notificationId, userId)
  }
  return { success: true }
}
