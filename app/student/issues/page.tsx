"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import type { Issue } from "@/hooks/use-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  Zap,
  Droplets,
  Sofa,
  Sparkles,
  ShieldAlert,
  MoreHorizontal,
  Calendar,
} from "lucide-react"

type IssueCategory = "electrical" | "plumbing" | "furniture" | "cleaning" | "security" | "other"
type IssueStatus = "open" | "in-progress" | "resolved" | "closed"

const categoryIcons: Record<string, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  furniture: <Sofa className="h-4 w-4" />,
  cleaning: <Sparkles className="h-4 w-4" />,
  security: <ShieldAlert className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
  internet: <MoreHorizontal className="h-4 w-4" />,
}

export default function StudentIssuesPage() {
  const { user } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await fetch("/api/issues")
        if (res.ok) {
          const data = await res.json()
          setIssues(data.issues || [])
        }
      } catch (error) {
        console.error("Failed to fetch issues:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [])

  // Filter issues for current user
  const userIssues = issues.filter((issue) => issue.student_id === user?.id)

  // Apply filters
  const filteredIssues = userIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      case "in-progress":
        return "bg-primary/10 text-primary border-primary/20"
      case "resolved":
        return "bg-success/10 text-success-foreground border-success/20"
      case "closed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "high":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      case "medium":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Issues</h1>
          <p className="text-muted-foreground">Track and manage your reported issues</p>
        </div>
        <Button asChild>
          <Link href="/student/issues/new">
            <Plus className="mr-2 h-4 w-4" />
            Report Issue
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-1">No issues found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {userIssues.length === 0 ? "You haven't reported any issues yet" : "Try adjusting your filters"}
              </p>
              {userIssues.length === 0 && (
                <Button asChild>
                  <Link href="/student/issues/new">Report Your First Issue</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {/* Category Icon */}
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {categoryIcons[issue.category]}
                  </div>

                  {/* Issue Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{issue.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {issue.status.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Reported {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                      <span className="capitalize">Category: {issue.category}</span>
                      <span>Room: {issue.room_number}</span>
                      {issue.assigned_to && <span>Assigned to: {issue.assigned_to}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
