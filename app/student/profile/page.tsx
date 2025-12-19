"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Building2, DoorOpen, Calendar, Edit2, Save, X, CheckCircle2, Loader2 } from "lucide-react"

interface Hostel {
  id: string
  name: string
}

interface ProfileStats {
  totalIssues: number
  pollsVoted: number
  resolved: number
}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ totalIssues: 0, pollsVoted: 0, resolved: 0 })
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  })

  useEffect(() => {
    // Fetch hostel info
    const fetchHostel = async () => {
      if (!user?.hostel_id) return
      try {
        const res = await fetch(`/api/hostels/${user.hostel_id}`)
        if (res.ok) {
          const data = await res.json()
          setHostel(data)
        }
      } catch (error) {
        console.error("Failed to fetch hostel:", error)
      }
    }

    // Fetch user stats
    const fetchStats = async () => {
      if (!user?.id) return
      try {
        const issuesRes = await fetch("/api/issues")
        if (issuesRes.ok) {
          const data = await issuesRes.json()
          // API returns { issues } or bare array when in fallback; normalize to array
          const issues = Array.isArray(data) ? data : Array.isArray(data?.issues) ? data.issues : []
          const userIssues = issues.filter((i: { student_id: string }) => i.student_id === user.id)
          setStats({
            totalIssues: userIssues.length,
            resolved: userIssues.filter((i: { status: string }) => i.status === "resolved").length,
            pollsVoted: 0, // Would need votes API to track this
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }

    fetchHostel()
    fetchStats()
  }, [user?.hostel_id, user?.id])

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        setIsEditing(false)
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user?.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {user?.role}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSaved && (
            <div className="flex items-center gap-2 text-sm text-success p-3 rounded-lg bg-success/10">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </div>
          )}

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-sm py-2">{user?.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <p className="text-sm py-2 text-muted-foreground">{user?.email}</p>
                {isEditing && <p className="text-xs text-muted-foreground">Email cannot be changed</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-sm py-2">{user?.phone || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Hostel Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Hostel Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Hostel Name
                </Label>
                <p className="text-sm py-2">{hostel?.name || "Not assigned"}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  Room Number
                </Label>
                <p className="text-sm py-2">{user?.room_number || "Not assigned"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-semibold">{stats.totalIssues}</p>
              <p className="text-sm text-muted-foreground">Total Issues</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-semibold">{stats.pollsVoted}</p>
              <p className="text-sm text-muted-foreground">Polls Voted</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-semibold">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
