# HostelFlow

Full-stack Next.js 16 app for hostel management with role-specific dashboards (admin, warden, student). The project now runs locally on SQLite for easier setup, with built-in fallback data if the database is unavailable.

## Quick Start (SQLite)
1) Prereqs: Node 20+
2) Install deps: `npm install`
3) Seed local SQLite DB: `npx tsx scripts/seed-sqlite.ts`
   - Creates `hostelflow.db` in the project root
   - Seeds hostels, wardens, students, issues, polls, and notifications
4) Dev server: `npm run dev` (Next.js app + API routes) at http://localhost:3000

Command cheat sheet:
```sh
npm install
npx tsx scripts/seed-sqlite.ts
npm run dev
npm run lint
npx tsc --noEmit
```

Environment:
- `.env` already points to SQLite: `DATABASE_URL="sqlite://file:hostelflow.db"`
- Backend Express (optional) uses `server/.env` -> `DATABASE_URL="sqlite://file:../hostelflow.db"`, `PORT=4000`

## Default Logins (all passwords: `password123`)
- Admin: `admin@hostel.com`
- Wardens: `warden@hostel.com`, `warden.south@hostel.com`
- Students: `student@hostel.com`, `student2@hostel.com`, `student3@hostel.com`

## Sample Data (from seed)
- Hostels: North Wing, South Wing, East Block (with facilities and warden assignment)
- Issues: Broken window, WiFi slow, Hot water outage, Mess food quality
- Polls: "Hostel Improvement Poll" (North), "South Wing Priorities" (South)
- Notifications: welcome + issue/poll updates per student

## Fallback Behavior
All API routes return structured fallback data (with `fallback: true`) if the database is unavailable, so the UI stays functional.

## Runbook
- Dev: `npm run dev`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Re-seed DB: delete `hostelflow.db` then `npx tsx scripts/seed-sqlite.ts`

## API Reference (cookie session auth)
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/signup`
- Users (admin): `GET/POST/PATCH/DELETE /api/users`
- Hostels (admin): `GET/POST/PATCH/DELETE /api/hostels`
- Issues: role-scoped `GET /api/issues`; students `POST /api/issues`; warden/admin `PATCH /api/issues`
- Polls: `GET /api/polls`; warden/admin `POST` create, `PATCH` close; students `PATCH` vote; warden/admin `DELETE`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications`
- Profile: `PATCH /api/profile`

## Notes
- UI uses Radix primitives with accessibility fixes (dialogs/sheets now include hidden titles).
- Poll options are normalized (option_text + votes) across API responses and fallbacks.
- Express backend in `server/` is optional; the Next.js API routes cover all functionality for local use.
