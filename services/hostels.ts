import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function listHostels() {
  return db.prepare(`
    SELECT h.*, u.name as warden_name
    FROM hostels h
    LEFT JOIN users u ON h.warden_id = u.id
    ORDER BY h.name
  `).all()
}

export async function createHostel(data: { name: string; type: string; capacity: number; wardenId?: string | null }) {
  const id = randomUUID()
  db.prepare(`
    INSERT INTO hostels (id, name, capacity, warden_id)
    VALUES (?, ?, ?, ?)
  `).run(id, data.name, data.capacity, data.wardenId || null)
  
  return db.prepare(`SELECT * FROM hostels WHERE id = ?`).get(id)
}

export async function updateHostel(data: {
  hostelId: string
  name?: string
  type?: string
  capacity?: number
  wardenId?: string | null
}) {
  const current = db.prepare(`SELECT * FROM hostels WHERE id = ?`).get(data.hostelId) as any
  if (!current) throw new Error("Hostel not found")
  
  db.prepare(`
    UPDATE hostels 
    SET 
      name = COALESCE(?, name),
      capacity = COALESCE(?, capacity),
      warden_id = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(data.name, data.capacity, data.wardenId, data.hostelId)
  
  return db.prepare(`SELECT * FROM hostels WHERE id = ?`).get(data.hostelId)
}

export async function deleteHostel(hostelId: string) {
  db.prepare(`DELETE FROM hostels WHERE id = ?`).run(hostelId)
  return { success: true }
}
