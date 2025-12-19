"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  hostel_id?: string | null
  room_number?: string | null
  phone?: string | null
  createdAt?: Date
  hostel_name?: string
}
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Filter, Edit2, Trash2, Mail, Phone } from "lucide-react"

interface Hostel {
  id: string
  name: string
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student" as UserRole,
    hostelId: "",
    roomNumber: "",
  })

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student" as UserRole,
    hostelId: "",
    roomNumber: "",
  })

  // Load users and hostels from API
  useEffect(() => {
    async function load() {
      try {
        const [usersRes, hostelsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/hostels"),
        ])

        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users || [])
        }

        if (hostelsRes.ok) {
          const data = await hostelsRes.json()
          setHostels(data.hostels || [])
        }
      } catch (error) {
        console.error("Failed to load admin data:", error)
        toast({ title: "Error", description: "Failed to load users", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [toast])

  const refreshUsers = async () => {
    const res = await fetch("/api/users")
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default"
      case "warden":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      hostelId: user.hostel_id || "",
      roomNumber: user.room_number || "",
    })
    setIsEditOpen(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: editForm.name,
          role: editForm.role,
          hostelId: editForm.hostelId || null,
          roomNumber: editForm.roomNumber || null,
          phone: editForm.phone || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update user")
      }

      await refreshUsers()
      toast({ title: "User Updated", description: `${editForm.name}'s profile has been updated.` })
      setIsEditOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    if (userToDelete.id === currentUser?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive",
      })
      setUserToDelete(null)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users?id=${userToDelete.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete user")
      }
      await refreshUsers()
      toast({ title: "User Deleted", description: `${userToDelete.name}'s account has been removed.` })
    } catch (error) {
      console.error(error)
      toast({
        title: "Cannot Delete",
        description: "Deletion failed (maybe last admin?)",
        variant: "destructive",
      })
    } finally {
      setUserToDelete(null)
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.role) return
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addForm.email,
          password: "Temp@123", // default temp password
          name: addForm.name,
          role: addForm.role,
          hostelId: addForm.hostelId || null,
          roomNumber: addForm.roomNumber || null,
          phone: addForm.phone || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add user")
      }

      await refreshUsers()
      toast({
        title: "User Added",
        description: `${addForm.name} has been added as a ${addForm.role}.`,
      })

      setAddForm({ name: "", email: "", phone: "", role: "student", hostelId: "", roomNumber: "" })
      setIsAddOpen(false)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to add user", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage students, wardens, and administrators</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="warden">Wardens</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Hostel</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const hostel = hostels.find((h) => h.id === user.hostel_id)
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {hostel?.name || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} disabled={loading}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setUserToDelete(user)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedUser && (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="capitalize mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={editForm.role} onValueChange={(v: UserRole) => setEditForm({ ...editForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="warden">Warden</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editForm.role === "student" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hostel">Hostel</Label>
                  <Select value={editForm.hostelId} onValueChange={(v) => setEditForm({ ...editForm, hostelId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room Number</Label>
                  <Input
                    id="room"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                  />
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedUser.email}
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedUser.phone}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-name">Full Name</Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="user@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">Role</Label>
                <Select value={addForm.role} onValueChange={(v: UserRole) => setAddForm({ ...addForm, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="warden">Warden</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {addForm.role === "student" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="add-hostel">Hostel</Label>
                  <Select value={addForm.hostelId} onValueChange={(v) => setAddForm({ ...addForm, hostelId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-room">Room Number</Label>
                  <Input
                    id="add-room"
                    value={addForm.roomNumber}
                    onChange={(e) => setAddForm({ ...addForm, roomNumber: e.target.value })}
                    placeholder="e.g., A-101"
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">Default password will be: demo123</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={!addForm.name || !addForm.email}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}&apos;s account? This action cannot be undone.
              {userToDelete?.role === "warden" && (
                <span className="block mt-2 text-warning-foreground font-medium">
                  Warning: This is a warden account. Deleting it may affect hostel management.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
