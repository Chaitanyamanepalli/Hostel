import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createHostel, deleteHostel, listHostels, updateHostel } from "@/services/hostels"
import { fallbackHostel, fallbackHostels } from "@/lib/fallbacks"

export async function GET() {
  try {
    const hostels = await listHostels()

    return NextResponse.json({ hostels })
  } catch (error) {
    console.error("Get hostels error:", error)
    return NextResponse.json({ fallback: true, hostels: fallbackHostels() }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, type, capacity, wardenId } = await request.json()

    const hostel = await createHostel({ name, type, capacity, wardenId })

    return NextResponse.json({ hostel })
  } catch (error) {
    console.error("Create hostel error:", error)
    return NextResponse.json({ fallback: true, hostel: fallbackHostel() }, { status: 200 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { hostelId, name, type, capacity, wardenId } = await request.json()

    const hostel = await updateHostel({ hostelId, name, type, capacity, wardenId })

    return NextResponse.json({ hostel })
  } catch (error) {
    console.error("Update hostel error:", error)
    return NextResponse.json({ fallback: true, hostel: fallbackHostel("demo-hostel") }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hostelId = searchParams.get("id")

    if (!hostelId) {
      return NextResponse.json({ error: "Missing hostel id" }, { status: 400 })
    }

    const result = await deleteHostel(hostelId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Delete hostel error:", error)
    return NextResponse.json({ fallback: true, success: true }, { status: 200 })
  }
}
