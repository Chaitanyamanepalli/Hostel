"use client"

import { useState, useEffect, useCallback } from "react"

interface UseFetchOptions {
  enabled?: boolean
}

export function useFetch<T>(
  fetcher: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[] = [],
  options: UseFetchOptions = {}
) {
  const { enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    const result = await fetcher()
    setData(result.data)
    setError(result.error)
    setLoading(false)
  }, [fetcher, enabled])

  useEffect(() => {
    if (enabled) {
      refetch()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  return { data, error, loading, refetch }
}

// Issues hook
export function useIssues() {
  const fetchIssues = useCallback(async () => {
    try {
      const res = await fetch("/api/issues")
      const data = await res.json()
      if (!res.ok) return { data: null, error: data.error }
      return { data: data.issues || [], error: null }
    } catch {
      return { data: null, error: "Failed to fetch issues" }
    }
  }, [])

  return useFetch<Issue[]>(fetchIssues)
}

// Polls hook
export function usePolls() {
  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch("/api/polls")
      const data = await res.json()
      if (!res.ok) return { data: null, error: data.error }
      return { data: data.polls || [], error: null }
    } catch {
      return { data: null, error: "Failed to fetch polls" }
    }
  }, [])

  return useFetch<Poll[]>(fetchPolls)
}

// Users hook (admin only)
export function useUsers() {
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (!res.ok) return { data: null, error: data.error }
      return { data: data.users || [], error: null }
    } catch {
      return { data: null, error: "Failed to fetch users" }
    }
  }, [])

  return useFetch<User[]>(fetchUsers)
}

// Hostels hook
export function useHostels() {
  const fetchHostels = useCallback(async () => {
    try {
      const res = await fetch("/api/hostels")
      const data = await res.json()
      if (!res.ok) return { data: null, error: data.error }
      return { data: data.hostels || [], error: null }
    } catch {
      return { data: null, error: "Failed to fetch hostels" }
    }
  }, [])

  return useFetch<Hostel[]>(fetchHostels)
}

// Types matching API responses
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
  room_number?: string
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
