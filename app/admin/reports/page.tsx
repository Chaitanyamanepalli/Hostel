"use client"

import { useState } from "react"
import { mockIssues, mockHostels, mockUsers } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Building2, TrendingUp, TrendingDown, Users, FileWarning, CheckCircle2, Clock } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  const [selectedHostel, setSelectedHostel] = useState("all")

  // Calculate metrics
  const totalIssues = mockIssues.length
  const resolvedIssues = mockIssues.filter((i) => i.status === "resolved" || i.status === "closed").length
  const resolutionRate = Math.round((resolvedIssues / totalIssues) * 100)
  const avgResolutionTime = 2.3 // days - mock

  // Hostel comparison data
  const hostelComparisonData = mockHostels.map((hostel) => {
    const issues = mockIssues.filter((i) => i.hostel_id === hostel.id)
    const resolved = issues.filter((i) => i.status === "resolved" || i.status === "closed").length
    return {
      name: hostel.name.split(" ")[0],
      total: issues.length,
      resolved,
      rate: issues.length > 0 ? Math.round((resolved / issues.length) * 100) : 100,
    }
  })

  // Issue trend data
  const trendData = [
    { month: "Sep", issues: 45, resolved: 38 },
    { month: "Oct", issues: 52, resolved: 48 },
    { month: "Nov", issues: 38, resolved: 35 },
    { month: "Dec", issues: 61, resolved: 45 },
  ]

  // Category breakdown
  const categoryData = [
    { name: "Electrical", value: mockIssues.filter((i) => i.category === "electrical").length, color: "#f59e0b" },
    { name: "Plumbing", value: mockIssues.filter((i) => i.category === "plumbing").length, color: "#0d9488" },
    { name: "Furniture", value: mockIssues.filter((i) => i.category === "furniture").length, color: "#22c55e" },
    { name: "Cleaning", value: mockIssues.filter((i) => i.category === "cleaning").length, color: "#8b5cf6" },
    { name: "Security", value: mockIssues.filter((i) => i.category === "security").length, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Priority data
  const priorityData = [
    { name: "Urgent", count: mockIssues.filter((i) => i.priority === "urgent").length },
    { name: "High", count: mockIssues.filter((i) => i.priority === "high").length },
    { name: "Medium", count: mockIssues.filter((i) => i.priority === "medium").length },
    { name: "Low", count: mockIssues.filter((i) => i.priority === "low").length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">System-wide performance insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-semibold">{totalIssues}</p>
              </div>
              <FileWarning className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+12% from last period</span>
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
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-success">+5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
                <p className="text-2xl font-semibold">{avgResolutionTime} days</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="text-success">-0.5 days faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-semibold">{mockUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              {mockUsers.filter((u) => u.role === "student").length} students,{" "}
              {mockUsers.filter((u) => u.role === "warden").length} wardens
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hostels">By Hostel</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Issue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Trends</CardTitle>
                <CardDescription>Monthly issues reported vs resolved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} />
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
                        name="Reported"
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        name="Resolved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Distribution</CardTitle>
                <CardDescription>Issues by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12 }} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hostels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hostel Comparison</CardTitle>
              <CardDescription>Issue resolution performance by hostel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hostelComparisonData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-3))" name="Total Issues" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="hsl(var(--chart-2))" name="Resolved" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {mockHostels.map((hostel) => {
              const issues = mockIssues.filter((i) => i.hostel_id === hostel.id)
              const resolved = issues.filter((i) => i.status === "resolved" || i.status === "closed").length
              const rate = issues.length > 0 ? Math.round((resolved / issues.length) * 100) : 100

              return (
                <Card key={hostel.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{hostel.name}</h3>
                        <p className="text-sm text-muted-foreground">{issues.length} total issues</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Resolution Rate</span>
                        <span className="font-medium">{rate}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="font-medium">{issues.filter((i) => i.status === "open").length}</p>
                          <p className="text-muted-foreground">Open</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="font-medium">{issues.filter((i) => i.status === "in-progress").length}</p>
                          <p className="text-muted-foreground">In Progress</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="font-medium">{resolved}</p>
                          <p className="text-muted-foreground">Resolved</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <CardDescription>Issues by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
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
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-muted-foreground">
                        {cat.name} ({cat.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Details</CardTitle>
                <CardDescription>Breakdown by issue category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryData.map((cat) => {
                  const percentage = Math.round((cat.value / totalIssues) * 100)
                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {cat.value} issues ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
