// API helper functions for data fetching

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || ""
    const res = await fetch(`${base}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      return { data: null, error: data.error || "Request failed" }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error("API Error:", error)
    return { data: null, error: "Network error" }
  }
}

// Issues API
export const issuesApi = {
  getAll: () => fetchApi<{ issues: Issue[] }>("/api/issues"),
  create: (data: CreateIssueData) =>
    fetchApi<{ issue: Issue }>("/api/issues", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (issueId: string, data: UpdateIssueData) =>
    fetchApi<{ issue: Issue }>("/api/issues", {
      method: "PATCH",
      body: JSON.stringify({ issueId, ...data }),
    }),
}

// Polls API
export const pollsApi = {
  getAll: () => fetchApi<{ polls: Poll[] }>("/api/polls"),
  create: (data: CreatePollData) =>
    fetchApi<{ poll: Poll }>("/api/polls", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  vote: (pollId: string, optionId: string) =>
    fetchApi<{ success: boolean }>("/api/polls", {
      method: "PATCH",
      body: JSON.stringify({ pollId, optionId, action: "vote" }),
    }),
  close: (pollId: string) =>
    fetchApi<{ success: boolean }>("/api/polls", {
      method: "PATCH",
      body: JSON.stringify({ pollId, action: "close" }),
    }),
  delete: (pollId: string) =>
    fetchApi<{ success: boolean }>(`/api/polls?id=${pollId}`, {
      method: "DELETE",
    }),
}

// Users API
export const usersApi = {
  getAll: () => fetchApi<{ users: User[] }>("/api/users"),
  create: (data: CreateUserData) =>
    fetchApi<{ user: User }>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (userId: string, data: UpdateUserData) =>
    fetchApi<{ user: User }>("/api/users", {
      method: "PATCH",
      body: JSON.stringify({ userId, ...data }),
    }),
  delete: (userId: string) =>
    fetchApi<{ success: boolean }>(`/api/users?id=${userId}`, {
      method: "DELETE",
    }),
}

// Hostels API
export const hostelsApi = {
  getAll: () => fetchApi<{ hostels: Hostel[] }>("/api/hostels"),
  create: (data: CreateHostelData) =>
    fetchApi<{ hostel: Hostel }>("/api/hostels", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (hostelId: string, data: UpdateHostelData) =>
    fetchApi<{ hostel: Hostel }>("/api/hostels", {
      method: "PATCH",
      body: JSON.stringify({ hostelId, ...data }),
    }),
  delete: (hostelId: string) =>
    fetchApi<{ success: boolean }>(`/api/hostels?id=${hostelId}`, {
      method: "DELETE",
    }),
}

// Profile API
export const profileApi = {
  update: (data: UpdateProfileData) =>
    fetchApi<{ user: User }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
}

// Types
export interface Issue {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  hostel_id: string
  student_id: string
  student_name?: string
  hostel_name?: string
  assigned_to?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface Poll {
  id: string
  question: string
  description?: string
  hostel_id: string
  hostel_name?: string
  created_by: string
  status: "active" | "closed"
  ends_at: string
  created_at: string
  options: PollOption[]
  user_vote?: string
}

export interface PollOption {
  id: string
  option_text: string
  votes: number
}

export interface User {
  id: string
  email: string
  name: string
  role: "student" | "warden" | "admin"
  hostel_id?: string
  hostel_name?: string
  room_number?: string
  phone?: string
  created_at: string
}

export interface Hostel {
  id: string
  name: string
  type: "boys" | "girls" | "co-ed"
  capacity: number
  occupied: number
  warden_id?: string
  warden_name?: string
}

export interface CreateIssueData {
  title: string
  description: string
  category: string
  priority: string
}

export interface UpdateIssueData {
  status?: string
  assignedTo?: string
  resolutionNotes?: string
}

export interface CreatePollData {
  question: string
  description?: string
  options: string[]
  endsAt: string
  hostelId?: string
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  role: string
  hostelId?: string
  roomNumber?: string
  phone?: string
}

export interface UpdateUserData {
  name?: string
  role?: string
  hostelId?: string
  roomNumber?: string
  phone?: string
}

export interface CreateHostelData {
  name: string
  type: string
  capacity: number
  wardenId?: string
}

export interface UpdateHostelData {
  name?: string
  type?: string
  capacity?: number
  wardenId?: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  emailNotifications?: boolean
  currentPassword?: string
  newPassword?: string
}
