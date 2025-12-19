import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { fallbackPoll, fallbackPollUpdate } from "@/lib/fallbacks"

function mapPoll(row: any) {
  const optionsArr = safeJsonArray(row?.options)
  const votesArr = safeJsonArray(row?.votes)

  const mergedOptions = optionsArr.map((opt, idx) => ({
    id: String(idx),
    option_text: opt,
    votes: Number(votesArr[idx] ?? 0),
  }))

  return { ...row, options: mergedOptions }
}

function safeJsonArray(value: unknown): any[] {
  if (!value || typeof value !== "string") return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = db.prepare(`SELECT * FROM polls WHERE id = ?`).get(id)

    if (!result) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json(mapPoll(result))
  } catch (error) {
    console.error("Get poll error:", error)
    return NextResponse.json({ fallback: true, poll: fallbackPoll((await params).id) }, { status: 200 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== "warden" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, ends_at } = await request.json()

    db.prepare(`
      UPDATE polls 
      SET 
        status = COALESCE(?, status),
        ends_at = COALESCE(?, ends_at)
      WHERE id = ?
    `).run(status, ends_at, id)

    const result = db.prepare(`SELECT * FROM polls WHERE id = ?`).get(id)

    if (!result) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json(mapPoll(result))
  } catch (error) {
    console.error("Update poll error:", error)
    return NextResponse.json({ fallback: true, poll: fallbackPollUpdate((await params).id) }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || (user.role !== "warden" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete poll votes first (if any) - CASCADE will handle this with foreign keys
    db.prepare(`DELETE FROM poll_votes WHERE poll_id = ?`).run(id)
    
    // Delete poll
    db.prepare(`DELETE FROM polls WHERE id = ?`).run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete poll error:", error)
    return NextResponse.json({ fallback: true, success: true }, { status: 200 })
  }
}
