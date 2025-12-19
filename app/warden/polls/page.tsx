"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Clock, Vote, Calendar, Plus, Users, Eye, Trash2, Loader2 } from "lucide-react"

interface PollOption {
  id: string
  option_text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  description: string | null
  hostel_id: string
  ends_at: string
  created_at: string
  status: string
  options: PollOption[]
  total_votes: number
}

interface Hostel {
  id: string
  warden_id: string
}

export default function WardenPollsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [pollToDelete, setPollToDelete] = useState<Poll | null>(null)

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await fetch("/api/polls")
        if (res.ok) {
          const data = await res.json()
          // Filter by warden's hostel
          const hostelRes = await fetch("/api/hostels")
          if (hostelRes.ok) {
            const hostels = await hostelRes.json()
            const wardenHostel = hostels.find((h: Hostel) => h.warden_id === user?.id)
            if (wardenHostel) {
              setPolls(data.filter((p: Poll) => p.hostel_id === wardenHostel.id))
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch polls:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPolls()
  }, [user?.id])

  const activePolls = polls.filter((poll) => poll.status === "active")
  const closedPolls = polls.filter((poll) => poll.status === "closed")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleViewPoll = (poll: Poll) => {
    setSelectedPoll(poll)
    setIsDetailOpen(true)
  }

  const handleDeletePoll = async () => {
    if (!pollToDelete) return
    try {
      const res = await fetch(`/api/polls/${pollToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setPolls(polls.filter((p) => p.id !== pollToDelete.id))
        toast({
          title: "Poll Deleted",
          description: "The poll has been removed successfully.",
        })
      }
      setPollToDelete(null)
    } catch (error) {
      console.error("Failed to delete poll:", error)
    }
  }

  const handleClosePollEarly = async () => {
    if (!selectedPoll) return
    try {
      const res = await fetch(`/api/polls/${selectedPoll.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      })
      if (res.ok) {
        setPolls(polls.map((p) => (p.id === selectedPoll.id ? { ...p, status: "closed" } : p)))
        toast({
          title: "Poll Closed",
          description: "The poll has been closed early.",
        })
        setIsDetailOpen(false)
        setSelectedPoll(null)
      }
    } catch (error) {
      console.error("Failed to close poll:", error)
    }
  }

  const renderPollCard = (poll: Poll) => {
    const leadingOption = poll.options.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
    const totalVotes = poll.total_votes || poll.options.reduce((sum, opt) => sum + opt.votes, 0)
    const leadingPercentage = totalVotes > 0 ? Math.round((leadingOption.votes / totalVotes) * 100) : 0

    return (
      <Card key={poll.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{poll.question}</CardTitle>
              {poll.description && <CardDescription className="mt-1">{poll.description}</CardDescription>}
            </div>
            <Badge variant={poll.status === "active" ? "default" : "secondary"}>
              {poll.status === "active" ? (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Closed
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {totalVotes} votes
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Ends {new Date(poll.ends_at).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Leading: {leadingOption.option_text}</span>
              <span className="font-medium">{leadingPercentage}%</span>
            </div>
            <Progress value={leadingPercentage} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => handleViewPoll(poll)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
            {poll.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  setPollToDelete(poll)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Poll Management</h1>
          <p className="text-muted-foreground">Create and manage hostel polls</p>
        </div>
        <Button asChild>
          <Link href="/warden/polls/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Poll
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Clock className="h-4 w-4" />
            Active ({activePolls.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Closed ({closedPolls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activePolls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Vote className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-1">No active polls</p>
                <p className="text-sm text-muted-foreground mb-4">Create a poll to gather student feedback</p>
                <Button asChild>
                  <Link href="/warden/polls/new">Create Your First Poll</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{activePolls.map((poll) => renderPollCard(poll))}</div>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {closedPolls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-1">No closed polls yet</p>
                <p className="text-sm text-muted-foreground">Completed polls will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{closedPolls.map((poll) => renderPollCard(poll))}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Poll Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedPoll && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPoll.question}</DialogTitle>
                {selectedPoll.description && <DialogDescription>{selectedPoll.description}</DialogDescription>}
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant={selectedPoll.status === "active" ? "default" : "secondary"}>
                    {selectedPoll.status}
                  </Badge>
                  <span className="text-muted-foreground">{selectedPoll.total_votes} total votes</span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Results</p>
                  {selectedPoll.options.map((option) => {
                    const totalVotes = selectedPoll.total_votes || selectedPoll.options.reduce((sum, opt) => sum + opt.votes, 0)
                    const percentage =
                      totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{option.option_text}</span>
                          <span className="font-medium">
                            {percentage}% ({option.votes})
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Created</p>
                    <p>{new Date(selectedPoll.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Ends</p>
                    <p>{new Date(selectedPoll.ends_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedPoll.status === "active" && (
                  <Button variant="destructive" onClick={handleClosePollEarly}>
                    Close Poll Early
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pollToDelete} onOpenChange={() => setPollToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pollToDelete?.question}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePoll} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
