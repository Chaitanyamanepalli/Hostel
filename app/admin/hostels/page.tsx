"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Building2, Search, Plus, Users, FileWarning, User, Edit2, Trash2 } from "lucide-react"

interface Hostel {
  id: number
  name: string
  capacity: number
  type: string
  warden_id: number | null
  warden_name?: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface Issue {
  id: number
  hostel_id: number
  status: string
}

export default function AdminHostelsPage() {
  const { toast } = useToast()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [hostelToDelete, setHostelToDelete] = useState<Hostel | null>(null)

  const [editForm, setEditForm] = useState({
    name: "",
    capacity: 0,
    type: "boys",
    wardenId: "",
  })

  const [addForm, setAddForm] = useState({
    name: "",
    capacity: 100,
    type: "boys",
    wardenId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [hostelsRes, usersRes, issuesRes] = await Promise.all([
        fetch("/api/hostels"),
        fetch("/api/users"),
        fetch("/api/issues"),
      ])

      if (hostelsRes.ok) {
        const data = await hostelsRes.json()
        setHostels(data.hostels || [])
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
      }

      if (issuesRes.ok) {
        const data = await issuesRes.json()
        setIssues(data.issues || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredHostels = hostels.filter((hostel) => hostel.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const wardens = users.filter((u) => u.role === "warden")

  const handleViewHostel = (hostel: Hostel) => {
    setSelectedHostel(hostel)
    setEditForm({
      name: hostel.name,
      capacity: hostel.capacity,
      type: hostel.type,
      wardenId: hostel.warden_id?.toString() || "",
    })
    setIsDetailOpen(true)
  }

  const handleSaveHostel = async () => {
    if (!selectedHostel) return

    try {
      const response = await fetch("/api/hostels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostelId: selectedHostel.id,
          name: editForm.name,
          capacity: editForm.capacity,
          type: editForm.type,
          wardenId: editForm.wardenId ? parseInt(editForm.wardenId) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update hostel")

      toast({
        title: "Hostel Updated",
        description: `${editForm.name} has been updated.`,
      })

      setIsDetailOpen(false)
      setSelectedHostel(null)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hostel",
        variant: "destructive",
      })
    }
  }

  const handleAddHostel = async () => {
    if (!addForm.name) return

    try {
      const response = await fetch("/api/hostels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          capacity: addForm.capacity,
          type: addForm.type,
          wardenId: addForm.wardenId ? parseInt(addForm.wardenId) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to create hostel")

      toast({
        title: "Hostel Added",
        description: `${addForm.name} has been created.`,
      })

      setAddForm({ name: "", capacity: 100, type: "boys", wardenId: "" })
      setIsAddOpen(false)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create hostel",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHostel = async () => {
    if (!hostelToDelete) return

    try {
      const response = await fetch(`/api/hostels?id=${hostelToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete hostel")

      toast({
        title: "Hostel Deleted",
        description: `${hostelToDelete.name} has been removed.`,
      })

      setHostelToDelete(null)
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete hostel",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hostel Management</h1>
          <p className="text-muted-foreground">Manage all hostels in the system</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hostel
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hostels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hostels Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredHostels.map((hostel) => {
          const hostelIssues = issues.filter((i) => i.hostel_id === hostel.id)
          const openIssues = hostelIssues.filter((i) => i.status === "open" || i.status === "in-progress").length

          return (
            <Card key={hostel.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{hostel.name}</CardTitle>
                      <CardDescription>
                        Capacity: {hostel.capacity} • {hostel.type === "boys" ? "Boys" : "Girls"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewHostel(hostel)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setHostelToDelete(hostel)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Warden */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Warden:</span>
                  <span className="font-medium">{hostel.warden_name || "Not assigned"}</span>
                </div>

                {/* Stats */}
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {hostel.capacity} capacity
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileWarning className="h-3 w-3" />
                    {openIssues} open issues
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Hostel Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Hostel</DialogTitle>
            <DialogDescription>Update hostel details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hostel Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hostel Type</Label>
              <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys</SelectItem>
                  <SelectItem value="girls">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned Warden</Label>
              <Select value={editForm.wardenId} onValueChange={(v) => setEditForm({ ...editForm, wardenId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warden" />
                </SelectTrigger>
                <SelectContent>
                  {wardens.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveHostel}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Hostel Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Hostel</DialogTitle>
            <DialogDescription>Create a new hostel in the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Hostel Name</Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g., Nehru Hostel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-capacity">Capacity</Label>
                <Input
                  id="add-capacity"
                  type="number"
                  value={addForm.capacity}
                  onChange={(e) => setAddForm({ ...addForm, capacity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hostel Type</Label>
              <Select value={addForm.type} onValueChange={(v) => setAddForm({ ...addForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys</SelectItem>
                  <SelectItem value="girls">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign Warden</Label>
              <Select value={addForm.wardenId} onValueChange={(v) => setAddForm({ ...addForm, wardenId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warden" />
                </SelectTrigger>
                <SelectContent>
                  {wardens.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHostel} disabled={!addForm.name}>
              Add Hostel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!hostelToDelete} onOpenChange={() => setHostelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hostel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {hostelToDelete?.name}? This action cannot be undone and will affect all
              associated students and issues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHostel} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
