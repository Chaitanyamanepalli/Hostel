"use client"

import type React from "react"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardShell } from "@/components/dashboard-shell"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  )
}
