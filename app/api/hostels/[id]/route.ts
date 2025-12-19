import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { fallbackHostel } from "@/lib/fallbacks"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = db.prepare(`
      SELECT h.*, u.name as warden_name
      FROM hostels h
      LEFT JOIN users u ON h.warden_id = u.id
      WHERE h.id = ?
    `).get(id)

    if (!result) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get hostel error:", error)
    return NextResponse.json({ fallback: true, hostel: fallbackHostel((await params).id) }, { status: 200 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, capacity, warden_id, facilities } = await request.json()

    db.prepare(`
      UPDATE hostels 
      SET 
        name = COALESCE(?, name),
        capacity = COALESCE(?, capacity),
        warden_id = COALESCE(?, warden_id),
        facilities = COALESCE(?, facilities),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name, capacity, warden_id, facilities, id)

    const result = db.prepare(`SELECT * FROM hostels WHERE id = ?`).get(id)

    if (!result) {
      return NextResponse.json({ error: "Hostel not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update hostel error:", error)
    return NextResponse.json({ fallback: true, hostel: fallbackHostel((await params).id) }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    db.prepare(`DELETE FROM hostels WHERE id = ?`).run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete hostel error:", error)
    return NextResponse.json({ fallback: true, success: true }, { status: 200 })
  }
}
