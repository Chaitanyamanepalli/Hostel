"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: "student" | "warden" | "admin"
  hostel_id: string | null
  room_number: string | null
  phone: string | null
  email_notifications: boolean
  hostel?: {
    id: string
    name: string
    type: string
  } | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: {
    email: string
    password: string
    name: string
    hostelId: string
    roomNumber: string
    phone?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      setUser(data.user || null)
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    name: string
    hostelId: string
    roomNumber: string
    phone?: string
  }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Signup failed" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: "Signup failed. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    }
    setUser(null)
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
