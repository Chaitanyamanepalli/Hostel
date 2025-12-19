// SQLite database connection
export { db, sql } from "./db-sqlite"

// User types
export interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string
  role: "student" | "warden" | "admin"
  hostel_id: string | null
  room_number: string | null
  phone: string | null
  avatar_url: string | null
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface DbHostel {
  id: string
  name: string
  type: "boys" | "girls" | "co-ed"
  capacity: number
  occupied: number
  warden_id: string | null
  created_at: string
  updated_at: string
}

export interface DbIssue {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  hostel_id: string
  student_id: string
  assigned_to: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface DbPoll {
  id: string
  question: string
  description: string | null
  hostel_id: string
  created_by: string
  status: "active" | "closed"
  ends_at: string
  created_at: string
}

export interface DbPollOption {
  id: string
  poll_id: string
  option_text: string
  votes: number
}

export interface DbNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: "issue" | "poll" | "system" | "account"
  read: boolean
  link: string | null
  created_at: string
}

export interface DbEmailQueue {
  id: string
  to_email: string
  to_name: string | null
  subject: string
  body: string
  status: "pending" | "sent" | "failed"
  attempts: number
  error: string | null
  created_at: string
  sent_at: string | null
}
