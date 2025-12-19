import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { notifyUser } from "@/lib/notifications"

export async function listUsers() {
  return db.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.hostel_id, u.room_number, u.phone, u.created_at,
           h.name as hostel_name
    FROM users u
    LEFT JOIN hostels h ON u.hostel_id = h.id
    ORDER BY u.created_at DESC
  `).all()
}

export async function createUser(data: {
  email: string
  password: string
  name: string
  role: string
  hostelId?: string | null
  roomNumber?: string | null
  phone?: string | null
}) {
  const { email, password, name, role, hostelId, roomNumber, phone } = data
  const { randomUUID } = await import("crypto")

  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).all(email)
  if (existing.length > 0) {
    throw new Error("Email already registered")
  }

  const passwordHash = await hashPassword(password)
  const userId = randomUUID()

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, hostel_id, room_number, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, email, passwordHash, name, role, hostelId || null, roomNumber || null, phone || null)

  const result = db.prepare(`SELECT id, email, name, role, hostel_id, room_number, phone, created_at FROM users WHERE id = ?`).get(userId)
  return result
}

export async function updateUser(data: {
  userId: string
  name?: string
  role?: string
  hostelId?: string | null
  roomNumber?: string | null
  phone?: string | null
}) {
  const { userId, name, role, hostelId, roomNumber, phone } = data

  const current = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) as any
  if (!current) throw new Error("User not found")

  db.prepare(`
    UPDATE users 
    SET 
      name = COALESCE(?, name),
      role = COALESCE(?, role),
      hostel_id = ?,
      room_number = ?,
      phone = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, role, hostelId, roomNumber, phone, userId)

  if (role) {
    await notifyUser(userId, "Account Updated", `Your account role has been updated to ${role}`, "account")
  }

  const result = db.prepare(`SELECT id, email, name, role, hostel_id, room_number, phone FROM users WHERE id = ?`).get(userId)
  return result
}

export async function deleteUser(requesterId: string, targetUserId: string) {
  if (requesterId === targetUserId) {
    throw new Error("Cannot delete your own account")
  }

  const admins = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).all()
  const targetUser = db.prepare(`SELECT role FROM users WHERE id = ?`).get(targetUserId) as any

  if (targetUser?.role === "admin" && admins.length <= 1) {
    throw new Error("Cannot delete the last admin")
  }

  db.prepare(`DELETE FROM users WHERE id = ?`).run(targetUserId)
  return { success: true }
}
