"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"

interface Hostel {
  id: number
  name: string
}

interface Issue {
  id: number
  title: string
  status: string
  priority: string
  category: string
  created_at: string
  resolved_at?: string
}

interface Poll {
  id: number
  question: string
  status: string
  ends_at: string
  options: Array<{ id: number; option_text: string; votes: number }>
}

export default function WardenAnalyticsPage() {
  const { user } = useAuth()
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [hostelRes, issuesRes, pollsRes] = await Promise.all([
          fetch("/api/hostels"),
          fetch("/api/issues"),
          fetch("/api/polls"),
        ])

        if (hostelRes.ok) {
          const data = await hostelRes.json()
          setHostel(data.hostels?.[0] || null)
        }

        if (issuesRes.ok) {
          const data = await issuesRes.json()
          setIssues(data.issues || [])
        }

        if (pollsRes.ok) {
          const data = await pollsRes.json()
          setPolls(data.polls || [])
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats
  const openIssues = issues.filter((i) => i.status === "open").length
  const inProgressIssues = issues.filter((i) => i.status === "in-progress").length
  const resolvedIssues = issues.filter((i) => i.status === "resolved" || i.status === "closed").length
  
  // Calculate average resolution time from resolved issues
  const resolvedWithTimes = issues.filter(i => i.resolved_at && i.created_at)
  const avgResolutionTime = resolvedWithTimes.length > 0 
    ? resolvedWithTimes.reduce((sum, i) => {
        const created = new Date(i.created_at).getTime()
        const resolved = new Date(i.resolved_at!).getTime()
        return sum + (resolved - created) / (1000 * 60 * 60 * 24)
      }, 0) / resolvedWithTimes.length
    : 0

  // Category data for pie chart
  const categoryData = [
    { name: "Electrical", value: issues.filter((i) => i.category === "electrical").length, color: "#f59e0b" },
    { name: "Plumbing", value: issues.filter((i) => i.category === "plumbing").length, color: "#0d9488" },
    { name: "Furniture", value: issues.filter((i) => i.category === "furniture").length, color: "#22c55e" },
    { name: "Cleaning", value: issues.filter((i) => i.category === "cleaning").length, color: "#8b5cf6" },
    { name: "Security", value: issues.filter((i) => i.category === "security").length, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Status data for bar chart
  const statusData = [
    { name: "Open", count: openIssues, color: "var(--chart-3)" },
    { name: "In Progress", count: inProgressIssues, color: "var(--chart-1)" },
    { name: "Resolved", count: resolvedIssues, color: "var(--chart-2)" },
  ]

  // Calculate weekly trend data from actual issues
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const now = new Date()
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  const weeklyIssues = issues.filter(i => new Date(i.created_at) >= fourWeeksAgo)
  
  const trendData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const weekIssues = weeklyIssues.filter(issue => {
      const created = new Date(issue.created_at)
      return created >= weekStart && created < weekEnd
    })
    
    const weekResolved = weekIssues.filter(issue => 
      issue.resolved_at && new Date(issue.resolved_at) >= weekStart && new Date(issue.resolved_at) < weekEnd
    )
    
    return {
      week: `Week ${i + 1}`,
      issues: weekIssues.length,
      resolved: weekResolved.length
    }
  })

  // Priority breakdown
  const priorityData = [
    { priority: "Urgent", count: issues.filter((i) => i.priority === "urgent").length },
    { priority: "High", count: issues.filter((i) => i.priority === "high").length },
    { priority: "Medium", count: issues.filter((i) => i.priority === "medium").length },
    { priority: "Low", count: issues.filter((i) => i.priority === "low").length },
  ]

  const resolutionRate = issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100) : 0
  const activePolls = polls.filter(p => new Date(p.ends_at) > new Date()).length
  const totalVotes = polls.reduce((sum, p) => sum + (p.options?.reduce((s, o) => s + o.votes, 0) || 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights and performance metrics for {hostel?.name}</p>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-semibold">{issues.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-semibold">{resolutionRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                <p className="text-2xl font-semibold">{avgResolutionTime.toFixed(1)} days</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">0.5 days faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Polls</p>
                <p className="text-2xl font-semibold">{activePolls}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              {totalVotes} total votes
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Trends</CardTitle>
            <CardDescription>Weekly issues reported vs resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="issues"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))" }}
                    name="Reported"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issues by Category</CardTitle>
            <CardDescription>Distribution of issue types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
            <CardDescription>Issues by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {priorityData.map((item) => {
                  const percentage = issues.length > 0 ? Math.round((item.count / issues.length) * 100) : 0
              return (
                <div key={item.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          item.priority === "Urgent"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : item.priority === "High"
                              ? "bg-warning/10 text-warning-foreground border-warning/20"
                              : item.priority === "Medium"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted text-muted-foreground"
                        }
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
