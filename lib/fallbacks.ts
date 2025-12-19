const now = () => new Date().toISOString()

export function fallbackUser(role: string = "student") {
  return {
    id: `${role}-demo-user`,
    email: `${role}@demo.test`,
    name: `${role.charAt(0).toUpperCase()}${role.slice(1)} Demo`,
    role,
    hostel_id: "demo-hostel",
    room_number: role === "student" ? "101" : null,
    phone: "+1-555-0000",
    email_notifications: true,
  }
}

export function fallbackUsers() {
  return [fallbackUser("student"), fallbackUser("warden"), fallbackUser("admin")]
}

export function fallbackHostel(id: string = "demo-hostel") {
  return {
    id,
    name: "Demo Hostel",
    address: "123 Demo Street",
    total_rooms: 100,
    warden_id: "warden-demo-user",
    warden_name: "Warden Demo",
    type: "boys",
    capacity: 400,
    created_at: now(),
    updated_at: now(),
  }
}

export function fallbackHostels() {
  return [fallbackHostel("demo-hostel"), fallbackHostel("demo-hostel-2")]
}

export function fallbackIssue(id: string = "demo-issue") {
  return {
    id,
    title: "Sample maintenance request",
    description: "This is fallback data because the database is currently unavailable.",
    status: "open",
    priority: "medium",
    category: "maintenance",
    student_id: "demo-student",
    hostel_id: "demo-hostel",
    student_name: "Demo Student",
    hostel_name: "Demo Hostel",
    assigned_to: "warden-demo",
    notes: "",
    created_at: now(),
    updated_at: now(),
  }
}

export function fallbackIssues() {
  return [fallbackIssue("demo-issue-1"), fallbackIssue("demo-issue-2")]
}

export function fallbackNotification(id: string = "demo-notification") {
  return {
    id,
    title: "System update",
    body: "This is fallback notification data while the server is unavailable.",
    type: "info",
    link: "/",
    read: false,
    created_at: now(),
  }
}

export function fallbackNotifications() {
  return {
    notifications: [fallbackNotification("demo-notification-1"), fallbackNotification("demo-notification-2")],
    unreadCount: 2,
  }
}

export function fallbackPoll(id: string = "demo-poll") {
  return {
    id,
    question: "Which upgrade should we do next?",
    description: "Fallback poll data while the database is unavailable.",
    status: "active",
    ends_at: now(),
    hostel_id: "demo-hostel",
    options: [
      { id: "opt-1", option_text: "Wi-Fi upgrade", votes: 12 },
      { id: "opt-2", option_text: "New furniture", votes: 8 },
      { id: "opt-3", option_text: "Better laundry", votes: 5 },
    ],
    totalVotes: 25,
    created_at: now(),
    updated_at: now(),
  }
}

export function fallbackPolls() {
  return [fallbackPoll("demo-poll-1"), fallbackPoll("demo-poll-2")]
}

export function fallbackAuthUser() {
  return {
    user: {
      id: "demo-user",
      email: "demo@example.com",
      name: "Demo User",
      role: "student",
      hostel_id: "demo-hostel",
      room_number: "101",
      phone: "+1-555-0000",
      email_notifications: true,
      hostel: fallbackHostel(),
    },
  }
}

export function fallbackProfile() {
  return {
    user: {
      ...fallbackUser(),
      hostel: fallbackHostel(),
    },
  }
}

export function fallbackPollVoteResult() {
  return { success: true, message: "Vote recorded (fallback)", fallback: true }
}

export function fallbackSignupUser() {
  return {
    user: {
      id: "demo-student",
      email: "student@demo.test",
      name: "Student Demo",
      role: "student",
      hostel_id: "demo-hostel",
      room_number: "101",
    },
  }
}

export function fallbackLoginUser() {
  return {
    user: {
      id: "demo-login",
      email: "demo@example.com",
      name: "Demo User",
      role: "student",
      hostel_id: "demo-hostel",
      room_number: "101",
    },
  }
}

export function fallbackHostelUpdate(id: string) {
  return { ...fallbackHostel(id) }
}

export function fallbackPollUpdate(id: string) {
  return { ...fallbackPoll(id) }
}

export function fallbackIssueUpdate(id: string) {
  return { issue: { ...fallbackIssue(id) } }
}
