// User roles
export type UserRole = "student" | "warden" | "admin"

// User type
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  hostel_id?: string | null
  room_number?: string | null
  phone?: string | null
  avatar?: string
  createdAt?: Date
  email_notifications?: boolean
}

// Issue types
export type IssueCategory = "electrical" | "plumbing" | "furniture" | "cleaning" | "security" | "other"
export type IssueStatus = "open" | "in-progress" | "resolved" | "closed"
export type IssuePriority = "low" | "medium" | "high" | "urgent"

export interface Issue {
  id: string
  title: string
  description: string
  category: IssueCategory
  status: IssueStatus
  priority: IssuePriority
  student_id: string
  student_name: string
  hostel_id: string
  room_number: string
  created_at: Date
  updated_at: Date
  assigned_to?: string
  resolved_at?: Date
  images?: string[]
}

// Poll types
export type PollStatus = "active" | "closed"

export interface PollOption {
  id: string
  text: string
  votes: number
  voters?: PollVoter[]
}

export interface Poll {
  id: string
  title: string
  description: string
  options: PollOption[]
  status: PollStatus
  created_by: string
  hostel_id: string
  start_date: Date
  end_date: Date
  total_votes: number
}

export interface PollVoter {
  id: string
  name: string
  role: UserRole
  avatar_url?: string | null
  hostel_id?: string | null
}

// Hostel type
export interface Hostel {
  id: string
  name: string
  warden_id: string
  total_rooms: number
  occupied_rooms: number
}

// Notification type
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  created_at: Date
}
