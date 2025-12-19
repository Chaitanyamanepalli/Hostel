import dotenv from "dotenv"
import path from "path"
import pkg from "pg"

// Load env from server/.env by default; allow override via DOTENV_PATH.
dotenv.config({ path: process.env.DOTENV_PATH || path.resolve(process.cwd(), ".env") })

const { Pool } = pkg

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required")
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params)
  return res.rows as T[]
}
