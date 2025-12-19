"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Issue, Poll, Hostel } from "./types"
import { mockUsers, mockIssues, mockPolls, mockHostels } from "./mock-data"

interface DataContextType {
  // Users
  users: User[]
  addUser: (user: Omit<User, "id" | "createdAt">) => User
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => boolean
  getUserById: (id: string) => User | undefined

  // Issues
  issues: Issue[]
  addIssue: (issue: Omit<Issue, "id" | "createdAt" | "updatedAt">) => Issue
  updateIssue: (id: string, data: Partial<Issue>) => void
  deleteIssue: (id: string) => void
  getIssuesByStudentId: (studentId: string) => Issue[]
  getIssuesByHostelId: (hostelId: string) => Issue[]

  // Polls
  polls: Poll[]
  addPoll: (poll: Omit<Poll, "id" | "totalVotes">) => Poll
  updatePoll: (id: string, data: Partial<Poll>) => void
  deletePoll: (id: string) => void
  votePoll: (pollId: string, optionId: string) => void
  getPollsByHostelId: (hostelId: string) => Poll[]

  // Hostels
  hostels: Hostel[]
  addHostel: (hostel: Omit<Hostel, "id">) => Hostel
  updateHostel: (id: string, data: Partial<Hostel>) => void
  deleteHostel: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_KEY = "hostelpulse_data"

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setUsers(data.users?.map((u: User) => ({ ...u, createdAt: u.createdAt ? new Date(u.createdAt) : undefined })) || mockUsers)
        setIssues(
          data.issues?.map((i: Issue) => ({
            ...i,
            created_at: new Date(i.created_at),
            updated_at: new Date(i.updated_at),
            resolved_at: i.resolved_at ? new Date(i.resolved_at) : undefined,
          })) || mockIssues,
        )
        setPolls(
          data.polls?.map((p: Poll) => ({
            ...p,
            start_date: new Date(p.start_date),
            end_date: new Date(p.end_date),
          })) || mockPolls,
        )
        setHostels(data.hostels || mockHostels)
      } catch {
        // If parsing fails, use mock data
        setUsers(mockUsers)
        setIssues(mockIssues)
        setPolls(mockPolls)
        setHostels(mockHostels)
      }
    } else {
      setUsers(mockUsers)
      setIssues(mockIssues)
      setPolls(mockPolls)
      setHostels(mockHostels)
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, issues, polls, hostels }))
    }
  }, [users, issues, polls, hostels, isInitialized])

  // User operations
  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date(),
    }
    setUsers((prev) => [...prev, newUser])
    return newUser
  }

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
  }

  const deleteUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (!user) return false
    // Prevent deleting the last admin
    if (user.role === "admin" && users.filter((u) => u.role === "admin").length <= 1) {
      return false
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    return true
  }

  const getUserById = (id: string) => users.find((u) => u.id === id)

  // Issue operations
  const addIssue = (issueData: Omit<Issue, "id" | "created_at" | "updated_at">) => {
    const newIssue: Issue = {
      ...issueData,
      id: `issue-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    }
    setIssues((prev) => [...prev, newIssue])
    return newIssue
  }

  const updateIssue = (id: string, data: Partial<Issue>) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              ...data,
              updated_at: new Date(),
              resolved_at: data.status === "resolved" ? new Date() : i.resolved_at,
            }
          : i,
      ),
    )
  }

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id))
  }

  const getIssuesByStudentId = (studentId: string) => issues.filter((i) => i.student_id === studentId)

  const getIssuesByHostelId = (hostelId: string) => issues.filter((i) => i.hostel_id === hostelId)

  // Poll operations
  const addPoll = (pollData: Omit<Poll, "id" | "total_votes">) => {
    const newPoll: Poll = {
      ...pollData,
      id: `poll-${Date.now()}`,
      total_votes: 0,
      options: pollData.options.map((opt) => ({ ...opt, votes: 0 })),
    }
    setPolls((prev) => [...prev, newPoll])
    return newPoll
  }

  const updatePoll = (id: string, data: Partial<Poll>) => {
    setPolls((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const deletePoll = (id: string) => {
    setPolls((prev) => prev.filter((p) => p.id !== id))
  }

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            total_votes: p.total_votes + 1,
            options: p.options.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt)),
          }
        }
        return p
      }),
    )
  }

  const getPollsByHostelId = (hostelId: string) => polls.filter((p) => p.hostel_id === hostelId)

  // Hostel operations
  const addHostel = (hostelData: Omit<Hostel, "id">) => {
    const newHostel: Hostel = {
      ...hostelData,
      id: `hostel-${Date.now()}`,
    }
    setHostels((prev) => [...prev, newHostel])
    return newHostel
  }

  const updateHostel = (id: string, data: Partial<Hostel>) => {
    setHostels((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
  }

  const deleteHostel = (id: string) => {
    setHostels((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <DataContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        issues,
        addIssue,
        updateIssue,
        deleteIssue,
        getIssuesByStudentId,
        getIssuesByHostelId,
        polls,
        addPoll,
        updatePoll,
        deletePoll,
        votePoll,
        getPollsByHostelId,
        hostels,
        addHostel,
        updateHostel,
        deleteHostel,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
