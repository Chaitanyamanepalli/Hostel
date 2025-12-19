import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { closePoll, createPoll, deletePoll, listPollsForUser, votePoll } from "@/services/polls"
import { fallbackPoll, fallbackPolls } from "@/lib/fallbacks"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const polls = await listPollsForUser(user)

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Get polls error:", error)
    return NextResponse.json(fallbackPolls(), { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "warden" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const question = payload.question
    const description = payload.description
    const options = payload.options
    const endsAt = payload.endsAt ?? payload.ends_at
    const hostelId = payload.hostelId ?? payload.hostel_id

    const poll = await createPoll(user, { question, description, options, endsAt, hostelId })

    return NextResponse.json({ poll })
  } catch (error) {
    console.error("Create poll error:", error)
    return NextResponse.json({ fallback: true, poll: fallbackPoll() }, { status: 200 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pollId, optionId, action } = await request.json()

    if (action === "vote") {
      try {
        const result = await votePoll(user, { pollId, optionId })
        return NextResponse.json(result)
      } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 })
      }
    }

    if (action === "close") {
      try {
        const result = await closePoll(user, pollId)
        return NextResponse.json(result)
      } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Update poll error:", error)
    return NextResponse.json({ fallback: true, poll: fallbackPoll() }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "warden" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get("id")

    if (!pollId) {
      return NextResponse.json({ error: "Missing poll id" }, { status: 400 })
    }

    const result = await deletePoll(user, pollId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Delete poll error:", error)
    return NextResponse.json({ fallback: true, success: true }, { status: 200 })
  }
}
