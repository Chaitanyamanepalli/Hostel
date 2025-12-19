import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { fallbackIssue } from "@/lib/fallbacks"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = db.prepare(`
      SELECT i.*, u.name as student_name, h.name as hostel_name
      FROM issues i
      LEFT JOIN users u ON i.student_id = u.id
      LEFT JOIN hostels h ON i.hostel_id = h.id
      WHERE i.id = ?
    `).get(id)

    if (!result) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get issue error:", error)
    const { id } = await params
    return NextResponse.json({ fallback: true, issue: fallbackIssue(id) }, { status: 200 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== "warden" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, assigned_to } = await request.json()

    db.prepare(`
      UPDATE issues 
      SET 
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status, assigned_to, id)

    const result = db.prepare(`SELECT * FROM issues WHERE id = ?`).get(id)

    if (!result) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Update issue error:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    db.prepare(`DELETE FROM issues WHERE id = ?`).run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete issue error:", error)
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 })
  }
}
