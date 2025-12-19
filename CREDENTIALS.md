# HostelFlow - Login Credentials

## Database
- **Type**: SQLite
- **Location**: `hostelflow.db` (local file in project root)

## Default Users

### Admin Account
- **Email**: `admin@hostel.com`
- **Password**: `password123`
- **Role**: Administrator
- **Access**: Full system access including user management, hostel management, reports, and settings

### Warden Account
- **Email**: `warden@hostel.com`
- **Password**: `password123`
- **Role**: Warden
- **Hostel**: North Wing Hostel
- **Access**: Issue management, poll creation, analytics for assigned hostel

### Student Account
- **Email**: `student@hostel.com`
- **Password**: `password123`
- **Role**: Student
- **Hostel**: North Wing Hostel
- **Room**: 101
- **Phone**: 9876543210
- **Access**: Issue reporting, poll voting, profile management

## Resetting the Database

To reset the database to default state:

```bash
# Delete the existing database
Remove-Item hostelflow.db

# Re-run the seed script
npx tsx scripts/seed-sqlite.ts
```

## Creating New Users

New users can be created through:
1. **Signup page** (`/signup`) - Creates student accounts
2. **Admin panel** (`/admin/users`) - Admin can create any role

All passwords are hashed using bcrypt with 10 salt rounds.
