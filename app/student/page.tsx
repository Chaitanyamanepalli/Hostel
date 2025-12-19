"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { FadeIn } from "@/components/ui/fade-in"
import Link from "next/link"
import { FileWarning, Vote, Clock, CheckCircle2, AlertCircle, ArrowRight, Plus, TrendingUp } from "lucide-react"
import type { Issue, Poll } from "@/hooks/use-data"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [issuesRes, pollsRes] = await Promise.all([
          fetch("/api/issues"),
          fetch("/api/polls"),
        ])
        if (issuesRes.ok) {
          const data = await issuesRes.json()
          setIssues(data.issues || data || [])
        }
        if (pollsRes.ok) {
          const data = await pollsRes.json()
          setPolls(data.polls || data || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter issues for current user
  const userIssues = issues.filter((issue) => issue.student_id === user?.id)
  const openIssues = userIssues.filter((issue) => issue.status === "open" || issue.status === "in-progress")
  const resolvedIssues = userIssues.filter((issue) => issue.status === "resolved" || issue.status === "closed")

  // Active polls
  const activePolls = polls.filter((poll) => poll.status === "active")

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
      case "medium":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Room {user?.room_number} • Here&apos;s your hostel overview</p>
        </div>
        <Button asChild>
          <Link href="/student/issues/new">
            <Plus className="mr-2 h-4 w-4" />
            Report Issue
          </Link>
        </Button>
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
                    <FileWarning className="h-6 w-6 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={userIssues.length} />
                    </p>
                    <p className="text-sm text-muted-foreground">Total Issues</p>
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
                    className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Clock className="h-6 w-6 text-warning" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={openIssues.length} />
                    </p>
                    <p className="text-sm text-muted-foreground">Open Issues</p>
                  </div>
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
                    className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-semibold">
                      <AnimatedCounter value={resolvedIssues.length} />
                    </p>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
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
                      <AnimatedCounter value={activePolls.length} />
                    </p>
                    <p className="text-sm text-muted-foreground">Active Polls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Issues</CardTitle>
              <CardDescription>Your latest reported issues</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/issues">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {userIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No issues reported yet</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href="/student/issues/new">Report your first issue</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userIssues.slice(0, 3).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
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
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
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
              <CardDescription>Cast your vote on hostel matters</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/student/polls">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activePolls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Vote className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No active polls at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePolls.slice(0, 2).map((poll) => {
                  const totalVotes = poll.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0
                  const leadingOption = poll.options?.length > 0 
                    ? poll.options.reduce((prev, current) => prev.votes > current.votes ? prev : current)
                    : null
                  const leadingPercentage = totalVotes > 0 && leadingOption 
                    ? Math.round((leadingOption.votes / totalVotes) * 100) 
                    : 0

                  return (
                    <div key={poll.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-medium text-sm">{poll.question}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {totalVotes} votes • Ends {new Date(poll.ends_at).toLocaleDateString()}
                          </p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Leading: {leadingOption?.option_text || "N/A"}</span>
                          <span className="font-medium">{leadingPercentage}%</span>
                        </div>
                        <Progress value={leadingPercentage} className="h-2" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent" asChild>
                        <Link href="/student/polls">Vote Now</Link>
                      </Button>
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
