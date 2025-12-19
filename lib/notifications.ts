import { db } from "./db"
import { randomUUID } from "crypto"

// Create an in-app notification
async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "issue" | "poll" | "system" | "account",
  link?: string,
) {
  try {
    const id = randomUUID()
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, title, message, type)

    // Check if user has email notifications enabled
    const user = db.prepare(`SELECT email, name, email_notifications FROM users WHERE id = ?`).get(userId) as any

    if (user && user.email_notifications) {
      await queueEmail(user.email, user.name, title, message)
    }
  } catch (error) {
    console.error("Failed to create notification:", error)
  }
}

// Queue an email for sending (simplified - just log for now)
async function queueEmail(toEmail: string, toName: string | null, subject: string, body: string) {
  try {
    console.log(`📧 Email queued: ${toEmail} - ${subject}`)
  } catch (error) {
    console.error("Failed to queue email:", error)
  }
}

// Notify a specific user
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: "issue" | "poll" | "system" | "account",
  link?: string,
) {
  await createNotification(userId, title, message, type, link)
}

// Notify the warden of a specific hostel
export async function notifyWarden(
  hostelId: string,
  title: string,
  message: string,
  type: "issue" | "poll" | "system" | "account",
  link?: string,
) {
  try {
    const wardens = db.prepare(`
      SELECT u.id FROM users u
      JOIN hostels h ON u.id = h.warden_id
      WHERE h.id = ?
    `).all(hostelId) as any[]

    for (const warden of wardens) {
      await createNotification(warden.id, title, message, type, link)
    }
  } catch (error) {
    console.error("Failed to notify warden:", error)
  }
}

// Notify all admins
export async function notifyAllAdmins(
  title: string,
  message: string,
  type: "issue" | "poll" | "system" | "account",
  link?: string,
) {
  try {
    const admins = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).all() as any[]

    for (const admin of admins) {
      await createNotification(admin.id, title, message, type, link)
    }
  } catch (error) {
    console.error("Failed to notify admins:", error)
  }
}

// Notify all users in a hostel (except the creator)
export async function notifyHostelUsers(
  hostelId: string,
  title: string,
  message: string,
  type: "issue" | "poll" | "system" | "account",
  link?: string,
  excludeUserId?: string,
) {
  try {
    let users: any[]
    if (excludeUserId) {
      users = db.prepare(`
        SELECT id FROM users 
        WHERE hostel_id = ? 
        AND role = 'student'
        AND id != ?
      `).all(hostelId, excludeUserId) as any[]
    } else {
      users = db.prepare(`
        SELECT id FROM users 
        WHERE hostel_id = ? 
        AND role = 'student'
      `).all(hostelId) as any[]
    }

    for (const user of users) {
      await createNotification(user.id, title, message, type, link)
    }
  } catch (error) {
    console.error("Failed to notify hostel users:", error)
  }
}
