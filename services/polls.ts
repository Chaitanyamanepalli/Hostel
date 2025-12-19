import { db, type DbUser } from "@/lib/db"
import { notifyHostelUsers } from "@/lib/notifications"

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

export async function listPollsForUser(user: DbUser) {
  if (user.role === "student") {
    const rows = db.prepare(`
      SELECT p.*, h.name as hostel_name
      FROM polls p
      LEFT JOIN hostels h ON p.hostel_id = h.id
      WHERE p.hostel_id = ?
      ORDER BY p.created_at DESC
    `).all(user.hostel_id)
    return rows.map(mapPoll)
  }

  if (user.role === "warden") {
    const rows = db.prepare(`
      SELECT p.*, h.name as hostel_name
      FROM polls p
      LEFT JOIN hostels h ON p.hostel_id = h.id
      WHERE p.hostel_id = ?
      ORDER BY p.created_at DESC
    `).all(user.hostel_id)
    return rows.map(mapPoll)
  }

  const rows = db.prepare(`
    SELECT p.*, h.name as hostel_name
    FROM polls p
    LEFT JOIN hostels h ON p.hostel_id = h.id
    ORDER BY p.created_at DESC
  `).all()
  return rows.map(mapPoll)
}

export async function createPoll(user: DbUser, data: { question: string; description?: string | null; options: string[]; endsAt: string; hostelId?: string | null }) {
  if (user.role !== "warden" && user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const targetHostelId = data.hostelId || user.hostel_id
  if (!targetHostelId) {
    throw new Error("Hostel ID is required to create a poll")
  }

  const { randomUUID } = await import("crypto")
  const pollId = randomUUID()
  const options = JSON.stringify(data.options)
  const votes = JSON.stringify(data.options.map(() => 0))

  db.prepare(`
    INSERT INTO polls (id, title, description, options, votes, hostel_id, created_by, ends_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(pollId, data.question, data.description || null, options, votes, targetHostelId, user.id, data.endsAt)

  const poll = db.prepare(`SELECT * FROM polls WHERE id = ?`).get(pollId) as any

  await notifyHostelUsers(targetHostelId, "New Poll Created", `New poll: ${data.question}`, "poll", "/student/polls", user.id)

  return mapPoll(poll)
}

export async function votePoll(user: DbUser, data: { pollId: string; optionId: string }) {
  if (user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const existingVote = db.prepare(`
    SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?
  `).all(data.pollId, user.id)

  if (existingVote.length > 0) {
    throw new Error("Already voted")
  }

  const optionIndex = Number(data.optionId)
  if (Number.isNaN(optionIndex)) {
    throw new Error("Invalid option index")
  }

  // Increment votes array on the poll record
  const pollRow = db.prepare(`SELECT votes FROM polls WHERE id = ?`).get(data.pollId) as any
  const votesArr = safeJsonArray(pollRow?.votes)
  if (optionIndex < 0 || optionIndex >= votesArr.length) {
    throw new Error("Invalid option index")
  }
  votesArr[optionIndex] = Number(votesArr[optionIndex] ?? 0) + 1

  const { randomUUID } = await import("crypto")
  const voteId = randomUUID()
  
  db.prepare(`
    INSERT INTO poll_votes (id, poll_id, user_id, option_index)
    VALUES (?, ?, ?, ?)
  `).run(voteId, data.pollId, user.id, optionIndex)

  db.prepare(`UPDATE polls SET votes = ? WHERE id = ?`).run(JSON.stringify(votesArr), data.pollId)

  return { success: true }
}

export async function closePoll(user: DbUser, pollId: string) {
  if (user.role !== "warden" && user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  db.prepare(`UPDATE polls SET status = 'closed' WHERE id = ?`).run(pollId)
  return { success: true }
}

export async function deletePoll(user: DbUser, pollId: string) {
  if (user.role !== "warden" && user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  db.prepare(`DELETE FROM polls WHERE id = ?`).run(pollId)
  return { success: true }
}
