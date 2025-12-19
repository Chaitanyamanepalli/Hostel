import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { db, type DbUser } from "./db"

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set("session", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("session")?.value || null
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function getCurrentUser(): Promise<DbUser | null> {
  const userId = await getSession()
  if (!userId) return null

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId)
  return (user as DbUser) || null
}
