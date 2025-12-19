"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { FadeIn } from "@/components/ui/fade-in"
import Link from "next/link"
import {
  Building2,
  Users,
  FileWarning,
  Vote,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface User {
  id: number
  role: string
}

interface Issue {
  id: number
  status: string
  priority: string
  hostel_id: number
}

interface Hostel {
  id: number
  name: string
  capacity: number
  warden_name?: string
}

interface Poll {
  id: number
  ends_at: string
  options: Array<{ votes: number }>
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, issuesRes, hostelsRes, pollsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/issues"),
          fetch("/api/hostels"),
          fetch("/api/polls"),
        ])

        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users || [])
        }

        if (issuesRes.ok) {
          const data = await issuesRes.json()
          setIssues(data.issues || [])
        }

        if (hostelsRes.ok) {
          const data = await hostelsRes.json()
          setHostels(data.hostels || [])
        }

        if (pollsRes.ok) {
          const data = await pollsRes.json()
          setPolls(data.polls || [])
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalStudents = users.filter((u) => u.role === "student").length
  const totalWardens = users.filter((u) => u.role === "warden").length
  const totalIssues = issues.length
  const resolvedIssues = issues.filter((i) => i.status === "resolved" || i.status === "closed").length
  const openIssues = issues.filter((i) => i.status === "open").length
  const activePolls = polls.filter((p) => new Date(p.ends_at) > new Date()).length
  const totalVotes = polls.reduce((sum, p) => sum + (p.options?.reduce((s, o) => s + o.votes, 0) || 0), 0)

  // Issue trend by status
  const statusData = [
    { name: "Open", count: issues.filter((i) => i.status === "open").length, color: "var(--chart-3)" },
    {
      name: "In Progress",
      count: issues.filter((i) => i.status === "in-progress").length,
      color: "var(--chart-1)",
    },
    { name: "Resolved", count: resolvedIssues, color: "var(--chart-2)" },
  ]

  const overallResolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0
  const highPriorityCount = issues.filter((i) => i.priority === "urgent" || i.priority === "high").length

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
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/reports">View Reports</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users">Manage Users</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0.1}>
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Building2 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={hostels.length} />
                    </p>
                    <p className="text-sm text-muted-foreground">Total Hostels</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Users className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={totalStudents + totalWardens} />
                    </p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{totalStudents} students</span>
                  <span>•</span>
                  <span>{totalWardens} wardens</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FileWarning className="h-6 w-6 text-warning" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={totalIssues} />
                    </p>
                    <p className="text-sm text-muted-foreground">Total Issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">{overallResolutionRate}% resolved</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Vote className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={activePolls} />
                    </p>
                    <p className="text-sm text-muted-foreground">Active Polls</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  {totalVotes} total votes
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Issue Status Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">System-wide Issue Status</CardTitle>
            <CardDescription>Distribution across all hostels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
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

        {/* Quick Stats */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Quick Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Resolution Rate</span>
                <span className="font-medium">{overallResolutionRate}%</span>
              </div>
              <Progress value={overallResolutionRate} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm">Open Issues</span>
                </div>
                <Badge variant="secondary">{openIssues}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">High Priority</span>
                </div>
                <Badge variant="secondary">{highPriorityCount}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Total Resolved</span>
                </div>
                <Badge variant="secondary">{resolvedIssues}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hostel Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Hostel Performance</CardTitle>
            <CardDescription>Overview of all hostels</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/hostels">
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hostels.map((hostel) => {
              const hostelIssues = issues.filter((i) => i.hostel_id === hostel.id)
              const resolved = hostelIssues.filter((i) => i.status === "resolved" || i.status === "closed").length
              const resolutionRate = hostelIssues.length > 0 ? Math.round((resolved / hostelIssues.length) * 100) : 100

              return (
                <div key={hostel.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{hostel.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {hostel.capacity} • {hostelIssues.length} issues
                          {hostel.warden_name && ` • Warden: ${hostel.warden_name}`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Issue Resolution</p>
                      <div className="flex items-center gap-2">
                        <Progress value={resolutionRate} className="h-2 w-20" />
                        <span className="text-sm font-medium">{resolutionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
