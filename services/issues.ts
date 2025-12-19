import { db, type DbUser } from "@/lib/db"
import { notifyWarden, notifyUser } from "@/lib/notifications"

export async function listIssuesForUser(user: DbUser) {
  if (user.role === "student") {
    return db.prepare(`
      SELECT i.*, u.name as student_name, h.name as hostel_name
      FROM issues i
      LEFT JOIN users u ON i.student_id = u.id
      LEFT JOIN hostels h ON i.hostel_id = h.id
      WHERE i.student_id = ?
      ORDER BY i.created_at DESC
    `).all(user.id)
  }

  if (user.role === "warden") {
    return db.prepare(`
      SELECT i.*, u.name as student_name, h.name as hostel_name
      FROM issues i
      LEFT JOIN users u ON i.student_id = u.id
      LEFT JOIN hostels h ON i.hostel_id = h.id
      WHERE i.hostel_id = ?
      ORDER BY i.created_at DESC
    `).all(user.hostel_id)
  }

  return db.prepare(`
    SELECT i.*, u.name as student_name, h.name as hostel_name
    FROM issues i
    LEFT JOIN users u ON i.student_id = u.id
    LEFT JOIN hostels h ON i.hostel_id = h.id
    ORDER BY i.created_at DESC
  `).all()
}

export async function createIssue(user: DbUser, data: { title: string; description: string; category: string; priority: string }) {
  if (user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const { randomUUID } = await import("crypto")
  const issueId = randomUUID()
  
  db.prepare(`
    INSERT INTO issues (id, title, description, category, priority, hostel_id, student_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(issueId, data.title, data.description, data.category, data.priority, user.hostel_id, user.id)

  const issue = db.prepare(`SELECT * FROM issues WHERE id = ?`).get(issueId)

  if (user.hostel_id) {
    await notifyWarden(user.hostel_id, "New Issue Reported", `${user.name} reported: ${data.title}`, "issue", "/warden/issues")
  }

  return issue
}

export async function updateIssue(user: DbUser, data: { issueId: string; status?: string; assignedTo?: string | null; resolutionNotes?: string | null }) {
  if (user.role !== "warden" && user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const { issueId, status, assignedTo, resolutionNotes } = data

  db.prepare(`
    UPDATE issues 
    SET 
      status = COALESCE(?, status),
      assigned_to = COALESCE(?, assigned_to),
      updated_at = datetime('now'),
      resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN datetime('now') ELSE resolved_at END
    WHERE id = ?
  `).run(status, assignedTo, status, issueId)

  const issue = db.prepare(`SELECT * FROM issues WHERE id = ?`).get(issueId) as any

  if (issue && (issue as any).student_id && status) {
    await notifyUser(
      (issue as any).student_id,
      "Issue Status Updated",
      `Your issue "${(issue as any).title}" is now ${status}`,
      "issue",
      "/student/issues",
    )
  }

  return issue
}
