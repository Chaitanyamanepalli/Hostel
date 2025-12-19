import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const optionIndex = body.optionIndex ?? body.optionId

    if (optionIndex === undefined) {
      return NextResponse.json({ error: "Option index is required" }, { status: 400 })
    }

    // Check if poll exists and is active
    const pollCheck = db.prepare(`SELECT status FROM polls WHERE id = ?`).get(id) as { status: string } | undefined

    if (!pollCheck) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (pollCheck.status !== "active") {
      return NextResponse.json({ error: "Poll is not active" }, { status: 400 })
    }

    // Check if user already voted
    const existingVote = db.prepare(`SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?`).get(id, user.id)

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted on this poll" }, { status: 400 })
    }

    // Record the vote
    const voteId = randomUUID()
    db.prepare(`
      INSERT INTO poll_votes (id, poll_id, option_index, user_id)
      VALUES (?, ?, ?, ?)
    `).run(voteId, id, optionIndex, user.id)

    return NextResponse.json({ success: true, message: "Vote recorded successfully" })
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
  }
}
