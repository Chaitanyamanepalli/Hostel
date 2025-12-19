import { Router } from "express"
import bcrypt from "bcryptjs"
import { query } from "../db"

const router = Router()

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const rows = await query<{ id: string; email: string; password_hash: string; role: string; name: string }>(
      "SELECT id, email, password_hash, role, name FROM users WHERE email = $1",
      [email],
    )

    const user = rows[0]
    if (!user) return res.status(401).json({ error: "Invalid email or password" })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: "Invalid email or password" })

    return res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } })
  } catch (err) {
    console.error("/auth/login error", err)
    return res.status(500).json({ error: "login failed", detail: err instanceof Error ? err.message : String(err) })
  }
})

router.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

export default router
