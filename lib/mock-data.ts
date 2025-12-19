import type { User, Issue, Poll, Hostel, Notification } from "./types"

// Mock Users
export const mockUsers: User[] = [
  {
    id: "student-1",
    email: "rahul.sharma@university.edu",
    name: "Rahul Sharma",
    role: "student",
    hostel_id: "hostel-1",
    room_number: "A-204",
    phone: "+91 98765 43210",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "student-2",
    email: "priya.patel@university.edu",
    name: "Priya Patel",
    role: "student",
    hostel_id: "hostel-1",
    room_number: "A-112",
    phone: "+91 98765 43211",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "warden-1",
    email: "warden@university.edu",
    name: "Dr. Amit Kumar",
    role: "warden",
    hostel_id: "hostel-1",
    phone: "+91 98765 43212",
    createdAt: new Date("2023-06-01"),
  },
  {
    id: "admin-1",
    email: "admin@university.edu",
    name: "System Admin",
    role: "admin",
    phone: "+91 98765 43213",
    createdAt: new Date("2023-01-01"),
  },
]

// Mock Hostels
export const mockHostels: Hostel[] = [
  {
    id: "hostel-1",
    name: "Tagore Hostel",
    warden_id: "warden-1",
    total_rooms: 150,
    occupied_rooms: 142,
  },
  {
    id: "hostel-2",
    name: "Gandhi Hostel",
    warden_id: "warden-2",
    total_rooms: 200,
    occupied_rooms: 185,
  },
]

// Mock Issues
export const mockIssues: Issue[] = [
  {
    id: "issue-1",
    title: "Broken ceiling fan",
    description: "The ceiling fan in my room has stopped working completely. It makes a grinding noise when turned on.",
    category: "electrical",
    status: "open",
    priority: "high",
    student_id: "student-1",
    student_name: "Rahul Sharma",
    hostel_id: "hostel-1",
    room_number: "A-204",
    created_at: new Date("2024-12-15"),
    updated_at: new Date("2024-12-15"),
  },
  {
    id: "issue-2",
    title: "Water leakage in bathroom",
    description: "There is continuous water leakage from the bathroom tap. Water is being wasted.",
    category: "plumbing",
    status: "in-progress",
    priority: "medium",
    student_id: "student-2",
    student_name: "Priya Patel",
    hostel_id: "hostel-1",
    room_number: "A-112",
    created_at: new Date("2024-12-14"),
    updated_at: new Date("2024-12-16"),
    assigned_to: "Maintenance Team A",
  },
  {
    id: "issue-3",
    title: "Broken study table",
    description: "The study table drawer is broken and cannot be used properly.",
    category: "furniture",
    status: "resolved",
    priority: "low",
    student_id: "student-1",
    student_name: "Rahul Sharma",
    hostel_id: "hostel-1",
    room_number: "A-204",
    created_at: new Date("2024-12-10"),
    updated_at: new Date("2024-12-12"),
    resolved_at: new Date("2024-12-12"),
  },
  {
    id: "issue-4",
    title: "Common room AC not working",
    description: "The air conditioner in the common room on the 2nd floor is not cooling properly.",
    category: "electrical",
    status: "open",
    priority: "urgent",
    student_id: "student-2",
    student_name: "Priya Patel",
    hostel_id: "hostel-1",
    room_number: "A-112",
    created_at: new Date("2024-12-18"),
    updated_at: new Date("2024-12-18"),
  },
]

// Mock Polls
export const mockPolls: Poll[] = [
  {
    id: "poll-1",
    title: "Preferred Dinner Menu for Next Week",
    description: "Vote for your preferred main course option for dinner next week.",
    options: [
      { id: "opt-1", text: "Paneer Butter Masala with Naan", votes: 45 },
      { id: "opt-2", text: "Chicken Biryani", votes: 62 },
      { id: "opt-3", text: "Dal Makhani with Rice", votes: 28 },
      { id: "opt-4", text: "Mixed Veg Curry with Roti", votes: 15 },
    ],
    status: "active",
    created_by: "warden-1",
    hostel_id: "hostel-1",
    start_date: new Date("2024-12-16"),
    end_date: new Date("2024-12-20"),
    total_votes: 150,
  },
  {
    id: "poll-2",
    title: "Weekend Activity Preference",
    description: "What activity would you prefer for this weekend?",
    options: [
      { id: "opt-5", text: "Movie Night", votes: 38 },
      { id: "opt-6", text: "Sports Tournament", votes: 52 },
      { id: "opt-7", text: "Cultural Event", votes: 25 },
    ],
    status: "active",
    created_by: "warden-1",
    hostel_id: "hostel-1",
    start_date: new Date("2024-12-17"),
    end_date: new Date("2024-12-19"),
    total_votes: 115,
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    user_id: "student-1",
    title: "Issue Update",
    message: "Your issue 'Broken study table' has been resolved.",
    read: false,
    created_at: new Date("2024-12-12"),
  },
  {
    id: "notif-2",
    user_id: "student-1",
    title: "New Poll",
    message: "A new poll 'Preferred Dinner Menu' is now active. Cast your vote!",
    read: true,
    created_at: new Date("2024-12-16"),
  },
]
