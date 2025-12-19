import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const dbPath = path.join(process.cwd(), "hostelflow.db")
const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

// Initialize database schema
function initDatabase() {
  const schemaSQL = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'warden', 'admin')) NOT NULL,
      hostel_id TEXT,
      room_number TEXT,
      phone TEXT,
      avatar_url TEXT,
      email_notifications INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL
    );

    -- Hostels table
    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      warden_id TEXT,
      capacity INTEGER NOT NULL,
      occupied INTEGER DEFAULT 0,
      facilities TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (warden_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Issues table
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'in-progress', 'resolved', 'closed')) DEFAULT 'pending',
      student_id TEXT NOT NULL,
      hostel_id TEXT NOT NULL,
      assigned_to TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Polls table
    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      options TEXT NOT NULL,
      votes TEXT NOT NULL,
      created_by TEXT NOT NULL,
      hostel_id TEXT,
      status TEXT CHECK(status IN ('active', 'closed')) DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      ends_at TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    );

    -- Poll votes table
    CREATE TABLE IF NOT EXISTS poll_votes (
      id TEXT PRIMARY KEY,
      poll_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(poll_id, user_id)
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_hostel ON users(hostel_id);
    CREATE INDEX IF NOT EXISTS idx_issues_student ON issues(student_id);
    CREATE INDEX IF NOT EXISTS idx_issues_hostel ON issues(hostel_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_polls_hostel ON polls(hostel_id);
    CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `

  db.exec(schemaSQL)
}

// Initialize on first import
initDatabase()

export { db }

// Helper function to run tagged-template-like SQL queries
export function sql(query: TemplateStringsArray, ...values: any[]) {
  const queryStr = query.join("?")
  const stmt = db.prepare(queryStr)
  
  // Handle different query types
  if (queryStr.trim().toUpperCase().startsWith("SELECT")) {
    return stmt.all(...values)
  } else if (queryStr.trim().toUpperCase().startsWith("INSERT")) {
    const result = stmt.run(...values)
    return [{ id: result.lastInsertRowid }]
  } else {
    const result = stmt.run(...values)
    return [{ changes: result.changes }]
  }
}

// Export types
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
  email_notifications: number
  created_at: string
  updated_at: string
}

export interface DbHostel {
  id: string
  name: string
  warden_id: string | null
  capacity: number
  occupied: number
  facilities: string | null
  created_at: string
  updated_at: string
}

export interface DbIssue {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "resolved" | "closed"
  student_id: string
  hostel_id: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface DbPoll {
  id: string
  title: string
  description: string | null
  options: string
  votes: string
  created_by: string
  hostel_id: string | null
  status: "active" | "closed"
  created_at: string
  ends_at: string | null
}

export interface DbNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: number
  created_at: string
}
