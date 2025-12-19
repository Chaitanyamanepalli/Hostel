import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createIssue, listIssuesForUser, updateIssue } from "@/services/issues"
import { fallbackIssue, fallbackIssueUpdate, fallbackIssues } from "@/lib/fallbacks"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const issues = await listIssuesForUser(user)

    return NextResponse.json({ issues })
  } catch (error) {
    console.error("Get issues error:", error)
    return NextResponse.json({ fallback: true, issues: fallbackIssues() }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category, priority } = await request.json()

    const issue = await createIssue(user, { title, description, category, priority })

    return NextResponse.json(issue)
  } catch (error) {
    console.error("Create issue error:", error)
    return NextResponse.json({ fallback: true, issue: fallbackIssue() }, { status: 200 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "warden" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { issueId, status, assignedTo, resolutionNotes } = await request.json()

    const issue = await updateIssue(user, { issueId, status, assignedTo, resolutionNotes })

    return NextResponse.json({ issue })
  } catch (error) {
    console.error("Update issue error:", error)
    return NextResponse.json({ fallback: true, ...fallbackIssueUpdate("demo-issue") }, { status: 200 })
  }
}
