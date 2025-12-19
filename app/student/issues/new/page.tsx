"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { IssueCategory, IssuePriority } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Zap,
  Droplets,
  Sofa,
  Sparkles,
  ShieldAlert,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"

const categories: { value: IssueCategory; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "electrical",
    label: "Electrical",
    icon: <Zap className="h-5 w-5" />,
    description: "Lights, fans, sockets, switches",
  },
  {
    value: "plumbing",
    label: "Plumbing",
    icon: <Droplets className="h-5 w-5" />,
    description: "Taps, pipes, drainage, water",
  },
  {
    value: "furniture",
    label: "Furniture",
    icon: <Sofa className="h-5 w-5" />,
    description: "Beds, tables, chairs, cupboards",
  },
  {
    value: "cleaning",
    label: "Cleaning",
    icon: <Sparkles className="h-5 w-5" />,
    description: "Room, bathroom, common areas",
  },
  {
    value: "security",
    label: "Security",
    icon: <ShieldAlert className="h-5 w-5" />,
    description: "Locks, safety, access issues",
  },
  { value: "other", label: "Other", icon: <MoreHorizontal className="h-5 w-5" />, description: "Any other issues" },
]

export default function NewIssuePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as IssueCategory | "",
    priority: "medium" as IssuePriority,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.category) return

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create issue")
      }

      setIsSubmitted(true)
      setTimeout(() => {
        router.push("/student/issues")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Issue Reported Successfully!</h2>
            <p className="text-muted-foreground text-center mb-4">
              Your issue has been submitted and the hostel staff will look into it shortly.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to issues list...</p>
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
          <Link href="/student/issues">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Report an Issue</h1>
          <p className="text-muted-foreground">Room {user?.room_number} - Describe your issue in detail</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>Provide as much detail as possible to help us resolve your issue quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label>Category</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      formData.category === cat.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        formData.category === cat.value
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="text-xs text-muted-foreground text-center line-clamp-1">{cat.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. Include location, when it started, and any other relevant information."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: IssuePriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait a few days</SelectItem>
                  <SelectItem value="medium">Medium - Should be fixed soon</SelectItem>
                  <SelectItem value="high">High - Needs attention today</SelectItem>
                  <SelectItem value="urgent">Urgent - Immediate attention required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertDescription>
                Your issue will be reported for Room {user?.room_number}. The hostel staff will be notified immediately.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/student/issues">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={!formData.category || !formData.title || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Issue"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
