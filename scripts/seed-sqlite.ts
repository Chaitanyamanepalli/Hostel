import { db } from "../lib/db-sqlite"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

async function seed() {
  console.log("Seeding SQLite database...")

  // Create hostels
  const hostelIds = {
    northWing: randomUUID(),
    southWing: randomUUID(),
    eastBlock: randomUUID(),
  }

  db.prepare(`INSERT INTO hostels (id, name, capacity, occupied, facilities) VALUES (?, ?, ?, ?, ?)`).run(
    hostelIds.northWing,
    "North Wing Hostel",
    200,
    150,
    JSON.stringify(["WiFi", "Gym", "Mess", "Library", "Common Room"])
  )

  db.prepare(`INSERT INTO hostels (id, name, capacity, occupied, facilities) VALUES (?, ?, ?, ?, ?)`).run(
    hostelIds.southWing,
    "South Wing Hostel",
    180,
    120,
    JSON.stringify(["WiFi", "Mess", "Sports Room", "Library"])
  )

  db.prepare(`INSERT INTO hostels (id, name, capacity, occupied, facilities) VALUES (?, ?, ?, ?, ?)`).run(
    hostelIds.eastBlock,
    "East Block Hostel",
    150,
    100,
    JSON.stringify(["WiFi", "Mess", "Study Hall"])
  )

  console.log("✓ Hostels created")

  // Create users
  const password = await bcrypt.hash("password123", 10)

  const adminId = randomUUID()
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`).run(
    adminId,
    "admin@hostel.com",
    password,
    "Admin User",
    "admin"
  )

  const wardenId = randomUUID()
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role, hostel_id) VALUES (?, ?, ?, ?, ?, ?)`).run(
    wardenId,
    "warden@hostel.com",
    password,
    "John Warden",
    "warden",
    hostelIds.northWing
  )

  const wardenSouthId = randomUUID()
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role, hostel_id) VALUES (?, ?, ?, ?, ?, ?)`).run(
    wardenSouthId,
    "warden.south@hostel.com",
    password,
    "Sarah Warden",
    "warden",
    hostelIds.southWing
  )

  const studentId = randomUUID()
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role, hostel_id, room_number, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    studentId,
    "student@hostel.com",
    password,
    "Alice Student",
    "student",
    hostelIds.northWing,
    "101",
    "9876543210"
  )

  const student2Id = randomUUID()
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role, hostel_id, room_number, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    student2Id,
    "student2@hostel.com",
    password,
    "Brian Student",
    "student",
    hostelIds.southWing,
    "204",
    "9876500001"
  )

  const student3Id = randomUUID()
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role, hostel_id, room_number, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    student3Id,
    "student3@hostel.com",
    password,
    "Chitra Student",
    "student",
    hostelIds.eastBlock,
    "305",
    "9876500002"
  )

  console.log("✓ Users created (admin, 2 wardens, 3 students)")
  console.log("  Admin: admin@hostel.com")
  console.log("  Wardens: warden@hostel.com, warden.south@hostel.com")
  console.log("  Students: student@hostel.com, student2@hostel.com, student3@hostel.com")
  console.log("  Password for all: password123")

  // Update warden for hostels
  db.prepare(`UPDATE hostels SET warden_id = ? WHERE id = ?`).run(wardenId, hostelIds.northWing)
  db.prepare(`UPDATE hostels SET warden_id = ? WHERE id = ?`).run(wardenSouthId, hostelIds.southWing)

  // Create sample issues
  const issueId1 = randomUUID()
  db.prepare(`INSERT INTO issues (id, title, description, category, priority, status, student_id, hostel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    issueId1,
    "Broken Window in Room 101",
    "The window in my room is broken and needs repair",
    "Maintenance",
    "high",
    "pending",
    studentId,
    hostelIds.northWing
  )

  const issueId2 = randomUUID()
  db.prepare(`INSERT INTO issues (id, title, description, category, priority, status, student_id, hostel_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    issueId2,
    "WiFi Not Working",
    "WiFi connection is very slow in the common area",
    "Connectivity",
    "medium",
    "in-progress",
    studentId,
    hostelIds.northWing,
    wardenId
  )

  const issueId3 = randomUUID()
  db.prepare(`INSERT INTO issues (id, title, description, category, priority, status, student_id, hostel_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    issueId3,
    "Hot Water Not Available",
    "No hot water in bathrooms during morning hours",
    "Utilities",
    "medium",
    "pending",
    student2Id,
    hostelIds.southWing,
    wardenSouthId
  )

  const issueId4 = randomUUID()
  db.prepare(`INSERT INTO issues (id, title, description, category, priority, status, student_id, hostel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    issueId4,
    "Mess Food Quality",
    "Food quality has dropped this week. Please check vendors.",
    "Mess",
    "low",
    "pending",
    student3Id,
    hostelIds.eastBlock
  )

  console.log("✓ Sample issues created")

  // Create sample poll
  const pollId = randomUUID()
  const options = JSON.stringify(["Extend mess hours", "Add new gym equipment", "Improve WiFi"])
  const votes = JSON.stringify([12, 8, 15])

  db.prepare(`INSERT INTO polls (id, title, description, options, votes, created_by, hostel_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    pollId,
    "Hostel Improvement Poll",
    "Vote for the most important improvement needed",
    options,
    votes,
    wardenId,
    hostelIds.northWing,
    "active"
  )

  const poll2Id = randomUUID()
  const options2 = JSON.stringify(["New water coolers", "Additional washers", "Extend quiet hours"])
  const votes2 = JSON.stringify([5, 7, 3])

  db.prepare(`INSERT INTO polls (id, title, description, options, votes, created_by, hostel_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    poll2Id,
    "South Wing Priorities",
    "Pick the most urgent improvement for South Wing",
    options2,
    votes2,
    wardenSouthId,
    hostelIds.southWing,
    "active"
  )

  console.log("✓ Sample polls created")

  // Create notifications
  db.prepare(`INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)`).run(
    randomUUID(),
    studentId,
    "Welcome to HostelFlow",
    "Your account has been created successfully",
    "info"
  )

  db.prepare(`INSERT INTO notifications (id, user_id, title, message, type, read) VALUES (?, ?, ?, ?, ?, ?)`).run(
    randomUUID(),
    studentId,
    "Issue Update",
    "Your issue 'WiFi Not Working' is now in progress",
    "issue",
    1
  )

  db.prepare(`INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)`).run(
    randomUUID(),
    student2Id,
    "Maintenance Scheduled",
    "Hot water fix is scheduled tomorrow at 7 AM",
    "issue"
  )

  db.prepare(`INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)`).run(
    randomUUID(),
    student3Id,
    "Survey",
    "Please vote on the new South Wing priorities poll",
    "poll"
  )

  console.log("✓ Sample notifications created")
  console.log("\n✅ Database seeded successfully!")
}

seed().catch(console.error)
