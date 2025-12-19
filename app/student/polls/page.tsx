"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Clock, Vote, Calendar, Loader2, Users } from "lucide-react"

interface PollVoter {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  hostel_id?: string | null
}

interface PollOption {
  id: string
  option_text: string
  votes: number
  voters?: PollVoter[]
}

interface Poll {
  id: string
  question: string
  description: string | null
  hostel_id: string
  created_by: string
  ends_at: string
  status: string
  created_at: string
  options: PollOption[]
  total_votes: number
}

export default function StudentPollsPage() {
  const { user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  const [votingPollId, setVotingPollId] = useState<string | null>(null)
  const [voterDialog, setVoterDialog] = useState<{
    pollId: string
    optionId: string
    optionText: string
    voters: PollVoter[]
  } | null>(null)

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await fetch("/api/polls")
        if (res.ok) {
          const payload = await res.json()
          const incoming: Poll[] = payload.polls ?? payload
          // Filter by user's hostel
          const hostelPolls = user?.hostel_id
            ? incoming.filter((p: Poll) => p.hostel_id === user.hostel_id)
            : incoming
          setPolls(hostelPolls)
        }
      } catch (error) {
        console.error("Failed to fetch polls:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPolls()
  }, [user?.hostel_id])

  const activePolls = polls.filter((poll) => poll.status === "active")
  const closedPolls = polls.filter((poll) => poll.status === "closed")

  const handleVote = async (pollId: string) => {
    const optionId = selectedOptions[pollId]
    if (!optionId) return

    setVotingPollId(pollId)
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      })

      if (res.ok) {
        setVotedPolls((prev) => new Set([...prev, pollId]))
        // Refresh poll data
        const pollRes = await fetch("/api/polls")
        if (pollRes.ok) {
          const payload = await pollRes.json()
          const incoming: Poll[] = payload.polls ?? payload
          const hostelPolls = user?.hostel_id
            ? incoming.filter((p: Poll) => p.hostel_id === user.hostel_id)
            : incoming
          setPolls(hostelPolls)
        }
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setVotingPollId(null)
    }
  }

  const getWinningOption = (poll: Poll): PollOption | null => {
    if (!poll.options.length) return null
    return poll.options.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const renderPollCard = (poll: Poll, showResults: boolean) => {
    const hasVoted = votedPolls.has(poll.id)
    const displayResults = showResults || hasVoted
    const totalVotes = poll.total_votes || poll.options.reduce((sum, opt) => sum + opt.votes, 0)

    return (
      <Card key={poll.id}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{poll.question}</CardTitle>
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Vote className="h-4 w-4" />
              {totalVotes} votes
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Ends {new Date(poll.ends_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {displayResults ? (
            <div className="space-y-4">
              {poll.options.map((option) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                const winningOption = getWinningOption(poll)
                const isWinning = winningOption && option.votes === winningOption.votes && totalVotes > 0
                const isSelected = selectedOptions[poll.id] === option.id

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`flex items-center gap-2 ${isWinning ? "font-medium" : ""}`}>
                        {option.option_text}
                        {isSelected && hasVoted && (
                          <Badge variant="outline" className="text-xs">
                            Your vote
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-3 ${isWinning ? "[&>div]:bg-primary" : "[&>div]:bg-muted-foreground/30"}`}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{option.votes} votes</span>
                      {!!option.voters?.length && (
                        <button
                          className="flex items-center gap-1 underline-offset-2 hover:underline"
                          onClick={() =>
                            setVoterDialog({
                              pollId: poll.id,
                              optionId: option.id,
                              optionText: option.option_text,
                              voters: option.voters ?? [],
                            })
                          }
                        >
                          <Users className="h-3 w-3" />
                          View voters
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {hasVoted && (
                <div className="flex items-center gap-2 text-sm text-success pt-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Thank you for voting!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup
                value={selectedOptions[poll.id] || ""}
                onValueChange={(value) => setSelectedOptions((prev) => ({ ...prev, [poll.id]: value }))}
              >
                {poll.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                onClick={() => handleVote(poll.id)} 
                disabled={!selectedOptions[poll.id] || votingPollId === poll.id} 
                className="w-full"
              >
                {votingPollId === poll.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Vote className="mr-2 h-4 w-4" />
                )}
                Submit Vote
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Polls</h1>
        <p className="text-muted-foreground">Vote on hostel matters and help shape your living experience</p>
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

        <TabsContent value="active" className="space-y-4">
          {activePolls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Vote className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-1">No active polls</p>
                <p className="text-sm text-muted-foreground">Check back later for new polls</p>
              </CardContent>
            </Card>
          ) : (
            activePolls.map((poll) => renderPollCard(poll, false))
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedPolls.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium mb-1">No closed polls yet</p>
                <p className="text-sm text-muted-foreground">Completed polls will appear here</p>
              </CardContent>
            </Card>
          ) : (
            closedPolls.map((poll) => renderPollCard(poll, true))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!voterDialog} onOpenChange={(open) => !open && setVoterDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voters</DialogTitle>
            {voterDialog?.optionText && (
              <DialogDescription>
                Option: <span className="font-medium text-foreground">{voterDialog.optionText}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {voterDialog?.voters?.length ? (
              voterDialog.voters.map((voter) => (
                <div key={voter.id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{voter.name || "Unnamed"}</span>
                    <span className="text-xs text-muted-foreground">{voter.hostel_id || ""}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{voter.role}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No voters yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
