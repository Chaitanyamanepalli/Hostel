"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Plus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function NewPollPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [hostelId, setHostelId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    ends_at: "",
  })

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await fetch("/api/hostels")
        if (res.ok) {
          const hostels = await res.json()
          const wardenHostel = hostels.find((h: { warden_id: string }) => h.warden_id === user?.id)
          if (wardenHostel) {
            setHostelId(wardenHostel.id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch hostel:", error)
      }
    }
    if (user?.id) fetchHostel()
  }, [user?.id])

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ""] })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !hostelId) return

    setIsSubmitting(true)
    setError("")

    try {
      const validOptions = formData.options.filter((o) => o.trim())
      
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          description: formData.description || null,
          hostelId,
          endsAt: new Date(formData.ends_at).toISOString(),
          options: validOptions,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create poll")
      }

      setIsSubmitted(true)
      setTimeout(() => {
        router.push("/warden/polls")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid =
    formData.question.trim() &&
    formData.options.filter((o) => o.trim()).length >= 2 &&
    formData.ends_at &&
    new Date(formData.ends_at) > new Date()

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Poll Created Successfully!</h2>
            <p className="text-muted-foreground text-center mb-4">
              Your poll is now active and students can start voting.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to polls...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/warden/polls">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Poll</h1>
          <p className="text-muted-foreground">Gather feedback from students</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Poll Details</CardTitle>
            <CardDescription>Set up your poll question and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="question">Poll Question</Label>
              <Input
                id="question"
                placeholder="e.g., What should be the dinner menu for next week?"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional context for the poll"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Poll Options</Label>
                <span className="text-xs text-muted-foreground">{formData.options.length}/6 options</span>
              </div>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                  />
                  {formData.options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {formData.options.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="ends_at">Poll End Date & Time</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <p className="text-xs text-muted-foreground">The poll will automatically close on this date</p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/warden/polls">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={!isValid || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Poll"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
