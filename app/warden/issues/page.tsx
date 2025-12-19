"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import type { IssueStatus, IssueCategory } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Filter,
  Zap,
  Droplets,
  Sofa,
  Sparkles,
  ShieldAlert,
  MoreHorizontal,
  Calendar,
  User,
  DoorOpen,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const categoryIcons: Record<IssueCategory, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplets className="h-4 w-4" />,
  furniture: <Sofa className="h-4 w-4" />,
  cleaning: <Sparkles className="h-4 w-4" />,
  security: <ShieldAlert className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
}

interface Issue {
  id: string
  title: string
  description: string
  student_id: string
  student_name?: string
  hostel_id: string
  room_number: string
  category: IssueCategory
  priority: string
  status: IssueStatus
  assigned_to: string | null
  notes: string | null
  created_at: string
}

interface Hostel {
  id: string
  warden_id: string
}

export default function WardenIssuesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editStatus, setEditStatus] = useState<IssueStatus>("open")
  const [editNotes, setEditNotes] = useState("")
  const [editAssignedTo, setEditAssignedTo] = useState("")

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
            // Fetch issues
            const issuesRes = await fetch("/api/issues")
            if (issuesRes.ok) {
              const allIssues = await issuesRes.json()
              setIssues(allIssues.filter((i: Issue) => i.hostel_id === wardenHostel.id))
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  // Apply filters
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.room_number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const getStatusColor = (status: IssueStatus) => {
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

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue)
    setEditStatus(issue.status)
    setEditAssignedTo(issue.assigned_to || "")
    setEditNotes(issue.notes || "")
    setIsDialogOpen(true)
  }

  const handleSaveChanges = async () => {
    if (!selectedIssue) return

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/issues/${selectedIssue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          assigned_to: editAssignedTo || null,
          notes: editNotes || null,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
        
        toast({
          title: "Issue Updated",
          description: `Issue status changed to ${editStatus.replace("-", " ")}`,
        })
        
        setIsDialogOpen(false)
        setSelectedIssue(null)
      } else {
        toast({
          title: "Error",
          description: "Failed to update issue",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update issue:", error)
      toast({
        title: "Error",
        description: "Failed to update issue",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const statusCounts = {
    all: issues.length,
    open: issues.filter((i) => i.status === "open").length,
    "in-progress": issues.filter((i) => i.status === "in-progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Issue Management</h1>
        <p className="text-muted-foreground">Review and manage all hostel issues</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "in-progress", "resolved"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status === "all" ? "All" : status.replace("-", " ")}
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
              {statusCounts[status]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, student, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
              <CheckCircle2 className="h-12 w-12 text-success/50 mb-4" />
              <p className="text-lg font-medium mb-1">No issues found</p>
              <p className="text-sm text-muted-foreground">
                {issues.length === 0 ? "No issues have been reported yet" : "Try adjusting your filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card
              key={issue.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewIssue(issue)}
            >
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
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{issue.description}</p>
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
                        <User className="h-3 w-3" />
                        {issue.student_name || 'Student'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DoorOpen className="h-3 w-3" />
                        Room {issue.room_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                      {issue.assigned_to && <span>Assigned: {issue.assigned_to}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Issue Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedIssue && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {categoryIcons[selectedIssue.category]}
                  </div>
                  <div>
                    <DialogTitle>{selectedIssue.title}</DialogTitle>
                    <DialogDescription className="capitalize">{selectedIssue.category} Issue</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status.replace("-", " ")}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Description</Label>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Reported By</Label>
                    <p>{selectedIssue.student_name || 'Student'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Room</Label>
                    <p>{selectedIssue.room_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Reported On</Label>
                    <p>{new Date(selectedIssue.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Last Updated</Label>
                    <p>{new Date(selectedIssue.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={editStatus} onValueChange={(v: IssueStatus) => setEditStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Input
                    id="assignedTo"
                    placeholder="e.g., Maintenance Team A"
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Add Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add internal notes or update details..."
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
