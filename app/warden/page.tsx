"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  FileWarning,
  Vote,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  Droplets,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface Issue {
  id: string
  title: string
  hostel_id: string
  room_number: string
  student_name?: string
  status: string
  priority: string
  category: string
}

interface Poll {
  id: string
  title: string
  hostel_id: string
  status: string
  total_votes: number
  end_date: Date | string
  options: Array<{ id: string; text: string; votes: number }>
}

interface Hostel {
  id: string
  name: string
  warden_id: string
  total_rooms?: number
  occupied_rooms?: number
}

export default function WardenDashboard() {
  const { user } = useAuth()
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [hostelIssues, setHostelIssues] = useState<Issue[]>([])
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch warden's hostel
        const hostelsRes = await fetch("/api/hostels")
        if (hostelsRes.ok) {
          const hostels = await hostelsRes.json()
          const wardenHostel = hostels.find((h: Hostel) => h.warden_id === user?.id)
          setHostel(wardenHostel)

          if (wardenHostel) {
            // Fetch issues for hostel
            const issuesRes = await fetch("/api/issues")
            if (issuesRes.ok) {
              const issues = await issuesRes.json()
              setHostelIssues(issues.filter((i: Issue) => i.hostel_id === wardenHostel.id))
            }

            // Fetch active polls
            const pollsRes = await fetch("/api/polls")
            if (pollsRes.ok) {
              const polls = await pollsRes.json()
              setActivePolls(polls.filter((p: Poll) => p.hostel_id === wardenHostel.id && p.status === "active"))
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  const openIssues = hostelIssues.filter((i) => i.status === "open")
  const inProgressIssues = hostelIssues.filter((i) => i.status === "in-progress")
  const resolvedIssues = hostelIssues.filter((i) => i.status === "resolved" || i.status === "closed")
  const urgentIssues = hostelIssues.filter((i) => i.priority === "urgent" || i.priority === "high")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Category distribution data
  const categoryData = [
    {
      name: "Electrical",
      count: hostelIssues.filter((i) => i.category === "electrical").length,
      color: "var(--chart-3)",
    },
    {
      name: "Plumbing",
      count: hostelIssues.filter((i) => i.category === "plumbing").length,
      color: "var(--chart-1)",
    },
    {
      name: "Furniture",
      count: hostelIssues.filter((i) => i.category === "furniture").length,
      color: "var(--chart-2)",
    },
    {
      name: "Cleaning",
      count: hostelIssues.filter((i) => i.category === "cleaning").length,
      color: "var(--chart-5)",
    },
    {
      name: "Security",
      count: hostelIssues.filter((i) => i.category === "security").length,
      color: "var(--chart-4)",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      case "in-progress":
        return "bg-primary/10 text-primary border-primary/20"
      case "resolved":
        return "bg-success/10 text-success-foreground border-success/20"
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
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Warden Dashboard</h1>
          <p className="text-muted-foreground">{hostel?.name || "Hostel"} • Overview of hostel operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/warden/polls/new">Create Poll</Link>
          </Button>
          <Button asChild>
            <Link href="/warden/issues">Manage Issues</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{openIssues.length}</p>
                <p className="text-sm text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{inProgressIssues.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{urgentIssues.length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{resolvedIssues.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Issues by Category Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Issues by Category</CardTitle>
            <CardDescription>Distribution of reported issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hostel Stats */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Hostel Overview</CardTitle>
            <CardDescription>{hostel?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Room Occupancy</span>
                <span className="font-medium">
                  {hostel?.occupied_rooms}/{hostel?.total_rooms}
                </span>
              </div>
              <Progress value={((hostel?.occupied_rooms || 0) / (hostel?.total_rooms || 1)) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(((hostel?.occupied_rooms || 0) / (hostel?.total_rooms || 1)) * 100)}% occupied
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Students</span>
                </div>
                <span className="font-medium">{hostel?.occupied_rooms}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Vote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Polls</span>
                </div>
                <span className="font-medium">{activePolls.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileWarning className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Issues</span>
                </div>
                <span className="font-medium">{hostelIssues.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent High Priority Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">High Priority Issues</CardTitle>
              <CardDescription>Issues requiring immediate attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/warden/issues">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {urgentIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-success/50 mb-3" />
                <p className="text-sm text-muted-foreground">No high priority issues</p>
              </div>
            ) : (
              <div className="space-y-3">
                {urgentIssues.slice(0, 4).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {issue.category === "electrical" ? (
                        <Zap className="h-4 w-4" />
                      ) : issue.category === "plumbing" ? (
                        <Droplets className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{issue.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {issue.status.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Room {issue.room_number} • {issue.student_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Polls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Active Polls</CardTitle>
              <CardDescription>Current hostel polls</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/warden/polls">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activePolls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Vote className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No active polls</p>
                <Button variant="link" size="sm" asChild>
                  <Link href="/warden/polls/new">Create a poll</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activePolls.map((poll) => {
                  const leadingOption = poll.options.reduce((prev, current) =>
                    prev.votes > current.votes ? prev : current,
                  )
                  const leadingPercentage = Math.round((leadingOption.votes / poll.total_votes) * 100)

                  return (
                    <div key={poll.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-medium text-sm">{poll.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {poll.total_votes} votes • Ends {new Date(poll.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Leading: {leadingOption.text}</span>
                          <span className="font-medium">{leadingPercentage}%</span>
                        </div>
                        <Progress value={leadingPercentage} className="h-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
